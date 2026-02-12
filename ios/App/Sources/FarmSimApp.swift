import SwiftUI

@main
struct FarmSimApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var appState = AppState()
    @State private var store = GameStore()

    var body: some Scene {
        WindowGroup {
            Group {
                if appState.rootScreen == .menu {
                    MainMenuView(store: store, appState: appState)
                } else {
                    GameShell(store: store, appState: appState)
                }
            }
                .dynamicTypeSize(.xSmall ... .accessibility3)
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background || phase == .inactive {
                store.persistNow()
            }
        }
    }
}
