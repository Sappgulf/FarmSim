import Foundation

enum FarmIntentRouter {
    fileprivate static let pendingTabKey = "com.farmsim.intent.pendingTab"

    static func setPendingTab(_ tab: String) {
        UserDefaults.standard.set(tab, forKey: Self.pendingTabKey)
        UserDefaults.standard.synchronize()
    }

    static func consumePendingTab() -> String? {
        guard let stored = UserDefaults.standard.string(forKey: Self.pendingTabKey) else { return nil }
        clearPendingTab()
        return stored
    }

    static func clearPendingTab() {
        UserDefaults.standard.removeObject(forKey: Self.pendingTabKey)
    }
}
