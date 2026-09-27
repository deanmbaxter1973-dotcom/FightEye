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
        view.scrollView.bounces = false
        view.scrollView.alwaysBounceHorizontal = false
        view.scrollView.isDirectionalLockEnabled = true
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
            case "exportWeights":
                guard !id.isEmpty, id.count < 120, let content = body["content"], content.utf8.count < 2_000_000 else { return }
                shareWeightBackup(content, athleteId: id)
            case "exportProfiles":
                guard let content = body["content"], content.utf8.count < 9_000_000 else { return }
                shareProfileBackup(content)
            default: break
            }
        }

        private func shareWeightBackup(_ content: String, athleteId: String) {
            let cleanId = athleteId.replacingOccurrences(of: "[^A-Za-z0-9-]", with: "", options: .regularExpression)
            guard !cleanId.isEmpty, let data = content.data(using: .utf8),
                  let backup = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  backup["schema"] as? String == "fighteye-weight-v1",
                  let athlete = backup["athlete"] as? [String: String], athlete["id"] == athleteId else { return }
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("fighteye-weights-\(cleanId).json")
            do { try data.write(to: url, options: [.atomic, .completeFileProtection]) }
            catch { send(["error": "Could not prepare the weight backup for sharing."]); return }
            guard let view = webView, let presenter = view.window?.rootViewController else { return }
            let sheet = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = view
            sheet.completionWithItemsHandler = { _, _, _, _ in try? FileManager.default.removeItem(at: url) }
            (presenter.presentedViewController ?? presenter).present(sheet, animated: true)
        }

        private func shareProfileBackup(_ content: String) {
            guard let data = content.data(using: .utf8),
                  let backup = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  backup["schema"] as? String == "fighteye-profile-encrypted-v1" else { return }
            let stamp = ISO8601DateFormatter().string(from: Date()).prefix(10)
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("fighteye-profiles-\(stamp).json")
            do { try data.write(to: url, options: [.atomic, .completeFileProtection]) }
            catch { send(["error": "Could not prepare the profile backup for sharing."]); return }
            guard let view = webView, let presenter = view.window?.rootViewController else { return }
            let sheet = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = view
            sheet.completionWithItemsHandler = { _, _, _, _ in try? FileManager.default.removeItem(at: url) }
            (presenter.presentedViewController ?? presenter).present(sheet, animated: true)
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
                        var payload: [String: Any] = ["athleteId": id, "status": "synced", "lastSync": synced,
                                                       "samples": rows, "complete": rows.count < 1000]
                        if let start { payload["windowStart"] = formatter.string(from: start) }
                        self.send(payload)
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
