import SwiftUI
import WebKit
import HealthKit

@main
struct FightEyeHealthApp: App {
    var body: some Scene {
        WindowGroup { FightEyeWebView().ignoresSafeArea() }
    }
}

struct FightEyeWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(context.coordinator, name: "fighteyeHealth")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        context.coordinator.webView = view
        guard let folder = Bundle.main.url(forResource: "WebApp", withExtension: nil),
              let index = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "WebApp") else {
            assertionFailure("Run the Copy FightEye WebApp build phase")
            return view
        }
        view.loadFileURL(index, allowingReadAccessTo: folder)
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        weak var webView: WKWebView?
        private let healthStore = HKHealthStore()
        private let athleteKey = "fighteye.health.athleteId"
        private var linkedAthlete: String? { UserDefaults.standard.string(forKey: athleteKey) }
        private var observer: HKObserverQuery?

        override init() {
            super.init()
            NotificationCenter.default.addObserver(self, selector: #selector(refreshOnForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
        }

        deinit {
            if let observer { healthStore.stop(observer) }
            NotificationCenter.default.removeObserver(self)
        }

        @objc private func refreshOnForeground() { refresh() }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            send(["athleteId": linkedAthlete ?? ""])
            if linkedAthlete != nil { startObserving(); refresh() }
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
                  webView?.url?.isFileURL == true,
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
                if let observer { healthStore.stop(observer); self.observer = nil }
                send(["athleteId": ""])
            default: break
            }
        }

        private func requestAccess(for id: String) {
            guard HKHealthStore.isHealthDataAvailable(), let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else {
                send(["error": "Apple Health is unavailable on this device."]); return
            }
            healthStore.requestAuthorization(toShare: [], read: [type]) { [weak self] _, error in
                DispatchQueue.main.async {
                    guard let self else { return }
                    if let error { self.send(["error": error.localizedDescription]); return }
                    // HealthKit intentionally does not disclose whether read permission was denied.
                    UserDefaults.standard.set(id, forKey: self.athleteKey)
                    self.startObserving()
                    self.refresh()
                }
            }
        }

        private func startObserving() {
            guard observer == nil, let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else { return }
            let query = HKObserverQuery(sampleType: type, predicate: nil) { [weak self] _, completion, _ in
                DispatchQueue.main.async { self?.refresh() }
                completion()
            }
            observer = query
            healthStore.execute(query)
        }

        private func refresh() {
            guard let id = linkedAthlete, let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else { return }
            let start = Calendar.current.date(byAdding: .year, value: -3, to: Date())
            let predicate = HKQuery.predicateForSamples(withStart: start, end: Date(), options: [])
            let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: 1000,
                                      sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]) { [weak self] _, samples, error in
                guard let self else { return }
                if let error { self.send(["error": error.localizedDescription]); return }
                let formatter = DateFormatter()
                formatter.calendar = Calendar(identifier: .gregorian)
                formatter.timeZone = TimeZone(identifier: "Europe/London")
                formatter.dateFormat = "yyyy-MM-dd"
                let rows: [[String: Any]] = (samples as? [HKQuantitySample] ?? []).map {
                    ["date": formatter.string(from: $0.endDate), "kg": $0.quantity.doubleValue(for: .gramUnit(with: .kilo))]
                }
                self.send(["athleteId": id, "samples": rows])
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
