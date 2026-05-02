import SwiftUI
import GameCore

struct BootView: View {
    @Bindable var appState: AppState
    @Binding var store: GameStore?
    let onStoreReady: (GameStore) -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var hasSave = false
    @State private var isBusy = false

    var body: some View {
        ZStack {
            if appState.rootScreen == .game, let store {
                GameShellView(store: store, appState: appState)
                    .transition(gameTransition)
            } else if let store {
                MainMenuView(
                    appState: appState,
                    store: store,
                    onContinue: handlePrimaryAction,
                    onNewGame: handleNewGame
                )
                .transition(menuTransition)
            } else {
                // Pre-store loading state
                Color.clear
                    .farmBackground(palette: .meadow)
                    .overlay {
                        VStack(spacing: DS.Space.md) {
                            ProgressView()
                                .progressViewStyle(.circular)
                                .scaleEffect(1.2)
                            Text("Loading…")
                                .font(Typography.bodyStrong)
                                .foregroundStyle(.white.opacity(0.8))
                        }
                    }
                    .ignoresSafeArea()
            }
        }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.32), value: appState.rootScreen)
        .onAppear {
            appState.applyPendingShortcutRoute()
            hasSave = Self.probeHasSave()
            // Eagerly load store for menu
            if store == nil {
                let loadedStore = GameStore()
                loadedStore.setMenuPresented(true)
                store = loadedStore
                onStoreReady(loadedStore)
            }
            store?.setMenuPresented(appState.rootScreen == .menu)
        }
        .onChange(of: appState.rootScreen) { _, screen in
            let inMenu = screen == .menu
            store?.setMenuPresented(inMenu)
            if inMenu {
                hasSave = Self.probeHasSave()
            }
        }
        .sheet(
            isPresented: Binding(
                get: { appState.showingMenuSettings },
                set: { appState.showingMenuSettings = $0 }
            )
        ) {
            if let store {
                SettingsView(store: store, appState: appState, showClose: true)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            } else {
                ProgressView("Loading settings...")
                    .padding(DS.Space.xl)
            }
        }
        .overlay {
            if isBusy {
                Color.black.opacity(0.24)
                    .ignoresSafeArea()
                    .overlay {
                        CardContainer {
                            HStack(spacing: DS.Space.sm) {
                                ProgressView()
                                    .progressViewStyle(.circular)
                                Text("Preparing your homestead…")
                                    .font(Typography.bodyStrong)
                            }
                        }
                        .padding(.horizontal, DS.Space.lg)
                        .shadow(color: .black.opacity(0.15), radius: 16, y: 8)
                    }
                    .transition(.opacity)
            }
        }
    }

    private var gameTransition: AnyTransition {
        if reduceMotion {
            return .opacity
        }
        return .opacity.combined(with: .scale(scale: 1.02))
    }

    private var menuTransition: AnyTransition {
        if reduceMotion {
            return .opacity
        }
        return .opacity.combined(with: .scale(scale: 0.985))
    }

    private func handlePrimaryAction() {
        runBusyAction {
            let loadedStore = ensureStoreLoaded()
            if hasSave {
                loadedStore.setMenuPresented(false)
                appState.startGame(tab: .farm)
                return
            }

            loadedStore.resetSave()
            loadedStore.persistNow()
            hasSave = true
            loadedStore.setMenuPresented(false)
            appState.startGame(tab: .farm)
            appState.showingOnboarding = true
        }
    }

    private func handleNewGame() {
        runBusyAction {
            let loadedStore = ensureStoreLoaded()
            loadedStore.resetSave()
            loadedStore.persistNow()
            hasSave = true
            loadedStore.setMenuPresented(false)
            appState.startGame(tab: .farm)
            appState.showingOnboarding = true
        }
    }

    private func runBusyAction(_ action: @escaping @MainActor () -> Void) {
        guard !isBusy else { return }
        Task { @MainActor in
            isBusy = true
            defer { isBusy = false }
            action()
        }
    }

    @MainActor
    private func ensureStoreLoaded() -> GameStore {
        if let store {
            return store
        }

        let loadedStore = GameStore()
        loadedStore.setMenuPresented(true)
        store = loadedStore
        onStoreReady(loadedStore)
        return loadedStore
    }

    private static func probeHasSave() -> Bool {
        FileManager.default.fileExists(atPath: SavePaths.defaultSaveURL(appName: "FarmSim").path)
    }
}
