import SwiftUI
import WebKit
import HealthKit

private extension Notification.Name {
    static let fightEyeHealthChanged = Notification.Name("FightEyeHealthChanged")
}

final class FightEyeAppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        HealthBackgroundObserver.shared.startIfLinked()
        return true
    }
}

final class HealthBackgroundObserver {
    static let shared = HealthBackgroundObserver()
    private let store = HKHealthStore()
    private var observer: HKObserverQuery?
    private let athleteKey = "fighteye.health.athleteId"
    private let enabledKey = "fighteye.health.backgroundEnabled"

    func startIfLinked() {
        guard observer == nil, UserDefaults.standard.string(forKey: athleteKey) != nil,
              HKHealthStore.isHealthDataAvailable(),
              let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else { return }
        let query = HKObserverQuery(sampleType: type, predicate: nil) { _, completion, _ in
            // No private Health samples are read or written while the phone is locked.
            UserDefaults.standard.set(true, forKey: "fighteye.health.pendingRefresh")
            DispatchQueue.main.async {
                if UIApplication.shared.applicationState == .active {
                    NotificationCenter.default.post(name: .fightEyeHealthChanged, object: nil)
                }
                completion()
            }
        }
        observer = query
        store.execute(query)
    }

    func enableDelivery(completion: @escaping (Bool) -> Void) {
        guard let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else { completion(false); return }
        startIfLinked()
        store.enableBackgroundDelivery(for: type, frequency: .immediate) { success, _ in
            UserDefaults.standard.set(success, forKey: self.enabledKey)
            DispatchQueue.main.async { completion(success) }
        }
    }

    func stop() {
        if let observer { store.stop(observer); self.observer = nil }
        UserDefaults.standard.set(false, forKey: enabledKey)
        UserDefaults.standard.removeObject(forKey: "fighteye.health.pendingRefresh")
        if let type = HKObjectType.quantityType(forIdentifier: .bodyMass) {
            store.disableBackgroundDelivery(for: type) { _, _ in }
        }
    }
}

@main
struct FightEyeHealthApp: App {
    @UIApplicationDelegateAdaptor(FightEyeAppDelegate.self) private var appDelegate
    var body: some Scene {
        WindowGroup { FightEyeWebView().ignoresSafeArea() }
    }
}

struct FightEyeWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    private func installedWebApp() throws -> URL {
        guard let bundled = Bundle.main.url(forResource: "WebApp", withExtension: nil) else {
            throw CocoaError(.fileNoSuchFile)
        }
        let files = FileManager.default
        let root = files.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("FightEyeWebApp", isDirectory: true)
        try files.createDirectory(at: root, withIntermediateDirectories: true)
        // A stable file URL keeps the web view's local storage attached to the
        // same origin after an iOS app update changes the bundle's location.
        for name in ["index.html", "app.js", "styles.css", "manifest.json", "assets", "data"] {
            let source = bundled.appendingPathComponent(name)
            let destination = root.appendingPathComponent(name)
            if files.fileExists(atPath: destination.path) { try files.removeItem(at: destination) }
            try files.copyItem(at: source, to: destination)
        }
        return root
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(context.coordinator, name: "fighteyeHealth")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        context.coordinator.webView = view
        guard let folder = try? installedWebApp() else {
            assertionFailure("Could not prepare the bundled FightEye web app")
            return view
        }
        context.coordinator.webRoot = folder
        let index = folder.appendingPathComponent("index.html")
        view.loadFileURL(index, allowingReadAccessTo: folder)
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        weak var webView: WKWebView?
        var webRoot: URL?
        private let healthStore = HKHealthStore()
        private let athleteKey = "fighteye.health.athleteId"
        private let syncKey = "fighteye.health.lastSync"
        private var linkedAthlete: String? { UserDefaults.standard.string(forKey: athleteKey) }
        private var isRefreshing = false
        private var refreshAgain = false

        override init() {
            super.init()
            NotificationCenter.default.addObserver(self, selector: #selector(refreshOnForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
            NotificationCenter.default.addObserver(self, selector: #selector(refreshOnForeground), name: .fightEyeHealthChanged, object: nil)
        }

        deinit {
            NotificationCenter.default.removeObserver(self)
        }

        @objc private func refreshOnForeground() { refresh() }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            send(["athleteId": linkedAthlete ?? "", "status": linkedAthlete == nil ? "disconnected" : "linked",
                  "lastSync": UserDefaults.standard.string(forKey: syncKey) ?? "",
                  "backgroundEnabled": UserDefaults.standard.bool(forKey: "fighteye.health.backgroundEnabled")])
            if linkedAthlete != nil { HealthBackgroundObserver.shared.startIfLinked(); refresh() }
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if navigationAction.request.url?.isFileURL == true { decisionHandler(.allow); return }
            if let url = navigationAction.request.url, let scheme = url.scheme,
               ["https", "webcal"].contains(scheme), navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
            }
            decisionHandler(.cancel)
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "fighteyeHealth", message.frameInfo.isMainFrame,
                  let webRoot, let page = webView?.url,
                  page.isFileURL, page.path.hasPrefix(webRoot.path + "/"),
                  let body = message.body as? [String: String], let action = body["action"] else { return }
            let id = body["athleteId"] ?? ""
            switch action {
            case "connect":
                guard !id.isEmpty, id.count < 120 else { return }
                requestAccess(for: id)
            case "refresh":
                guard id == linkedAthlete else { return }
                refresh()
            case "disconnect":
                guard id == linkedAthlete else { return }
                UserDefaults.standard.removeObject(forKey: athleteKey)
                UserDefaults.standard.removeObject(forKey: syncKey)
                HealthBackgroundObserver.shared.stop()
                send(["athleteId": "", "status": "disconnected", "backgroundEnabled": false])
            default: break
            }
        }

        private func requestAccess(for id: String) {
            guard HKHealthStore.isHealthDataAvailable(), let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else {
                send(["error": "Apple Health is unavailable on this device."]); return
            }
            healthStore.requestAuthorization(toShare: [], read: [type]) { [weak self] success, error in
                DispatchQueue.main.async {
                    guard let self else { return }
                    if let error { self.send(["error": error.localizedDescription]); return }
                    if !success { self.send(["error": "Apple Health authorisation was not completed."]); return }
                    // HealthKit intentionally does not disclose whether read permission was denied.
                    UserDefaults.standard.set(id, forKey: self.athleteKey)
                    HealthBackgroundObserver.shared.enableDelivery { [weak self] enabled in
                        self?.send(["athleteId": id, "status": "linked", "backgroundEnabled": enabled])
                    }
                    self.refresh()
                }
            }
        }

        private func refresh() {
            guard let id = linkedAthlete, let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else { return }
            if isRefreshing { refreshAgain = true; return }
            isRefreshing = true
            send(["athleteId": id, "status": "syncing"])
            let start = Calendar.current.date(byAdding: .year, value: -3, to: Date())
            let predicate = HKQuery.predicateForSamples(withStart: start, end: Date(), options: [])
            let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: 1000,
                                      sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]) { [weak self] _, samples, error in
                DispatchQueue.main.async {
                    guard let self else { return }
                    self.isRefreshing = false
                    guard id == self.linkedAthlete else {
                        if self.refreshAgain { self.refreshAgain = false; self.refresh() }
                        return
                    }
                    if let error { self.send(["athleteId": id, "status": "error", "error": error.localizedDescription]) }
                    else {
                        let formatter = DateFormatter()
                        formatter.calendar = Calendar(identifier: .gregorian)
                        formatter.timeZone = TimeZone(identifier: "Europe/London")
                        formatter.dateFormat = "yyyy-MM-dd"
                        let rows: [[String: Any]] = (samples as? [HKQuantitySample] ?? []).map {
                            ["date": formatter.string(from: $0.endDate), "kg": $0.quantity.doubleValue(for: .gramUnit(with: .kilo))]
                        }
                        let synced = ISO8601DateFormatter().string(from: Date())
                        UserDefaults.standard.set(synced, forKey: self.syncKey)
                        UserDefaults.standard.removeObject(forKey: "fighteye.health.pendingRefresh")
                        self.send(["athleteId": id, "status": "synced", "lastSync": synced, "samples": rows])
                    }
                    if self.refreshAgain { self.refreshAgain = false; self.refresh() }
                }
            }
            healthStore.execute(query)
        }

        private func send(_ payload: [String: Any]) {
            guard JSONSerialization.isValidJSONObject(payload),
                  let data = try? JSONSerialization.data(withJSONObject: payload),
                  let json = String(data: data, encoding: .utf8) else { return }
            DispatchQueue.main.async { [weak self] in
                self?.webView?.evaluateJavaScript("window.FightEyeHealth?.receive(\(json))", completionHandler: nil)
            }
        }
    }
}
