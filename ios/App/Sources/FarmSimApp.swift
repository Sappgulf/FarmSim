import SwiftUI

@main
struct FarmSimApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var appState = AppState()
    @State private var store: GameStore?
    @State private var loopDriver: GameLoopDriver?

    var body: some Scene {
        WindowGroup {
            BootView(
                appState: appState,
                store: $store,
                onStoreReady: { loadedStore in
                    if loopDriver == nil {
                        loopDriver = GameLoopDriver(store: loadedStore, ticksPerSecond: loadedStore.targetSimTicksPerSecond)
                    }
                    loadedStore.setAppActive(scenePhase == .active)
                    loadedStore.setMenuPresented(appState.rootScreen == .menu)
                    if appState.rootScreen == .game && scenePhase == .active {
                        loopDriver?.start()
                    } else {
                        loopDriver?.stop()
                    }
                }
            )
            .dynamicTypeSize(.xSmall ... .accessibility3)
            .onAppear {
                if appState.rootScreen == .game && scenePhase == .active {
                    loopDriver?.start()
                }
                store?.setAppActive(scenePhase == .active)
                store?.setMenuPresented(appState.rootScreen == .menu)
            }
            .onChange(of: appState.rootScreen) { _, screen in
                let showingMenu = screen == .menu
                store?.setMenuPresented(showingMenu)
                if showingMenu {
                    loopDriver?.stop()
                } else if scenePhase == .active {
                    loopDriver?.start()
                }
            }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                store?.setAppActive(true)
                if appState.rootScreen == .game {
                    loopDriver?.start()
                }
            } else if phase == .background || phase == .inactive {
                store?.setAppActive(false)
                loopDriver?.stop()
                store?.persistNow()
            }
        }
    }
}
