import Foundation
import Observation

enum AppRootScreen: String, Sendable {
    case menu
    case game
}

@Observable
@MainActor
final class AppState {
    var rootScreen: AppRootScreen = .menu
    var selectedTab: GameTab = .farm
    var selectedTileIndex: Int?
    var showingTileSheet: Bool = false
    var showingOnboarding: Bool
    var showingMenuSettings: Bool = false

    init(showingOnboarding: Bool = false) {
        self.showingOnboarding = showingOnboarding
    }

    func openTileSheet(for index: Int) {
        selectedTileIndex = index
        showingTileSheet = true
    }

    func closeTileSheet() {
        showingTileSheet = false
        selectedTileIndex = nil
    }

    func openMainMenu() {
        showingTileSheet = false
        selectedTileIndex = nil
        rootScreen = .menu
    }

    func applyPendingShortcutRoute() {
        guard let tabRawValue = FarmIntentRouter.consumePendingTab() else { return }
        guard let tab = GameTab(rawValue: tabRawValue) else { return }
        switch tab {
        case .market:
            selectedTab = .build
        case .almanac, .settings:
            selectedTab = .more
        default:
            selectedTab = tab
        }
        rootScreen = .game
    }

    func startGame(tab: GameTab = .farm) {
        selectedTab = tab
        rootScreen = .game
    }
}
