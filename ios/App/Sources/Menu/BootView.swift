import SwiftUI
import GameCore

struct BootView: View {
    @Bindable var appState: AppState
    @Binding var store: GameStore?
    let onStoreReady: (GameStore) -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var hasSave = false
    @State private var menuDisplay = MenuDisplayContent.defaultValue
    @State private var isBusy = false
    @State private var showingCredits = false

    var body: some View {
        ZStack {
            if appState.rootScreen == .game, let store {
                GameShellView(store: store, appState: appState)
                    .transition(gameTransition)
            } else {
                MainMenuView(
                    title: menuDisplay.title,
                    tagline: menuDisplay.tagline,
                    hasSave: hasSave,
                    isBusy: isBusy,
                    onPrimaryAction: handlePrimaryAction,
                    onNewGameAction: handleNewGame,
                    onSettingsAction: openSettings,
                    onCreditsAction: { showingCredits = true }
                )
                .transition(menuTransition)
            }
        }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.32), value: appState.rootScreen)
        .onAppear {
            hasSave = Self.probeHasSave()
            menuDisplay = Self.loadMenuDisplay()
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
                    .padding(24)
            }
        }
        .sheet(isPresented: $showingCredits) {
            CreditsView(appTitle: menuDisplay.title)
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
                                Text("Preparing your homestead...")
                                    .font(Typography.bodyStrong)
                            }
                        }
                        .padding(.horizontal, DS.Space.lg)
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

    private func openSettings() {
        runBusyAction {
            _ = ensureStoreLoaded()
            appState.showingMenuSettings = true
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

    private static func loadMenuDisplay() -> MenuDisplayContent {
        let bundle = Bundle.main
        guard
            let url = bundle.url(forResource: "strings", withExtension: "json", subdirectory: "content")
                ?? bundle.url(forResource: "strings", withExtension: "json"),
            let data = try? Data(contentsOf: url),
            let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let ui = object["ui"] as? [String: Any]
        else {
            return .defaultValue
        }

        let title = (ui["appTitle"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
        let tagline = (ui["menuTagline"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
        let resolvedTitle = (title?.isEmpty == false ? title : nil) ?? MenuDisplayContent.defaultValue.title
        return MenuDisplayContent(
            title: resolvedTitle,
            tagline: tagline?.isEmpty == false ? tagline : MenuDisplayContent.defaultValue.tagline
        )
    }
}

private struct MenuDisplayContent: Sendable {
    let title: String
    let tagline: String?

    static let defaultValue = MenuDisplayContent(
        title: "FarmSim",
        tagline: "Grow your homestead one cozy day at a time."
    )
}
