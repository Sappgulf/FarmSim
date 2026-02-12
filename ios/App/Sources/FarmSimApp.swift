import SwiftUI

@main
struct FarmSimApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var store = GameStore()

    var body: some Scene {
        WindowGroup {
            GameShell(store: store)
                .preferredColorScheme(.dark)
                .statusBarHidden()
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background || phase == .inactive {
                store.persistNow()
            }
        }
    }
}
