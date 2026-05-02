import AppIntents

enum IntentFarmTab: String, AppEnum {
    case farm
    case inventory
    case market
    case almanac
    case settings

    static var typeDisplayRepresentation: TypeDisplayRepresentation =
        "Farm Tab"

    static var caseDisplayRepresentations: [IntentFarmTab: DisplayRepresentation] = [
        .farm: DisplayRepresentation(
            title: "Farm",
            subtitle: "Main farm view and field status"
        ),
        .inventory: DisplayRepresentation(
            title: "Inventory",
            subtitle: "Barn and stock"
        ),
        .market: DisplayRepresentation(
            title: "Market",
            subtitle: "Market, upgrades, and forecasts"
        ),
        .almanac: DisplayRepresentation(
            title: "Almanac",
            subtitle: "Journals, memory, and milestones"
        ),
        .settings: DisplayRepresentation(
            title: "Settings",
            subtitle: "Game options and profile"
        )
    ]

    var title: String {
        rawValue.capitalized
    }

    var gameTab: GameTab {
        switch self {
        case .farm:
            .farm
        case .inventory:
            .inventory
        case .market:
            .market
        case .almanac:
            .almanac
        case .settings:
            .settings
        }
    }
}

struct OpenFarmTabIntent: AppIntent {
    static var title: LocalizedStringResource = "Open FarmSim tab"
    static var description = IntentDescription(
        "Open FarmSim directly to a specific tab.",
        categoryName: "FarmSim"
    )
    static var openAppWhenRun: Bool = true

    @Parameter(title: "Tab")
    var tab: IntentFarmTab

    init() {
        self.tab = .farm
    }

    init(tab: IntentFarmTab) {
        self.tab = tab
    }

    @MainActor
    func perform() async throws -> some IntentResult {
        FarmIntentRouter.setPendingTab(tab.rawValue)
        return .result(dialog: "Opening FarmSim \(tab.title)")
    }
}

struct OpenFarmAndWeatherIntent: AppIntent {
    static var title: LocalizedStringResource = "Open FarmSim Market Forecast"
    static var description = IntentDescription(
        "Open FarmSim and jump straight to the market forecast surface.",
        categoryName: "FarmSim"
    )
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        FarmIntentRouter.setPendingTab(IntentFarmTab.market.rawValue)
        return .result(dialog: "Opening FarmSim market forecast.")
    }
}

struct StartFarmSimIntent: AppIntent {
    static var title: LocalizedStringResource = "Start FarmSim"
    static var description = IntentDescription(
        "Launch FarmSim and return to the farm game.",
        categoryName: "FarmSim"
    )
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        FarmIntentRouter.setPendingTab(IntentFarmTab.farm.rawValue)
        return .result(dialog: "FarmSim started.")
    }
}

struct FarmSimShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenFarmTabIntent(),
            phrases: [
                "Open ${applicationName} farm",
                "Open ${applicationName} farm tab"
            ],
            shortTitle: "Open Farm",
            systemImageName: "leaf.fill"
        )
        AppShortcut(
            intent: OpenFarmTabIntent(tab: .market),
            phrases: [
                "Open ${applicationName} market",
                "Open ${applicationName} market tab"
            ],
            shortTitle: "Open Market",
            systemImageName: "storefront.fill"
        )
        AppShortcut(
            intent: OpenFarmAndWeatherIntent(),
            phrases: [
                "Open ${applicationName} forecast",
                "Open ${applicationName} weather"
            ],
            shortTitle: "Open Forecast",
            systemImageName: "cloud.sun.fill"
        )
        AppShortcut(
            intent: StartFarmSimIntent(),
            phrases: [
                "Launch ${applicationName}"
            ],
            shortTitle: "Launch FarmSim",
            systemImageName: "play.circle.fill"
        )
    }
}
