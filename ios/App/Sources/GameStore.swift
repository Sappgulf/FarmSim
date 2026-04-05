import Foundation
import Observation
import GameCore

@Observable
@MainActor
final class GameStore {
    private static let defaultBuildingCatalog: [BuildingPlan] = [
        BuildingPlan(
            id: "barn",
            name: "Barn",
            icon: "🏚️",
            description: "Increases harvest value and stabilizes output.",
            category: "Production",
            requiredLevel: 8,
            maxLevel: 5,
            costs: [200, 400, 800, 1600, 3200],
            bonuses: [
                "+20% harvest value",
                "+35% harvest value",
                "+55% harvest value",
                "+80% harvest value",
                "+120% harvest value",
            ]
        ),
        BuildingPlan(
            id: "greenhouse",
            name: "Greenhouse",
            icon: "🏠",
            description: "Supports faster growth and weather resilience.",
            category: "Production",
            requiredLevel: 13,
            maxLevel: 5,
            costs: [350, 700, 1400, 2800, 5600],
            bonuses: [
                "+30% growth support",
                "+50% growth support",
                "+75% growth support",
                "+110% growth support",
                "+150% growth support",
            ]
        ),
        BuildingPlan(
            id: "silo",
            name: "Silo",
            icon: "🗼",
            description: "Increases storage and improves sell operations.",
            category: "Storage",
            requiredLevel: 3,
            maxLevel: 4,
            costs: [150, 300, 600, 1200],
            bonuses: [
                "Storage +50",
                "Storage +100 + auto sell",
                "Storage +200 + 10% sell bonus",
                "Storage +400 + 25% sell bonus",
            ]
        ),
        BuildingPlan(
            id: "workshop",
            name: "Workshop",
            icon: "🔧",
            description: "Unlocks better farm tooling efficiency.",
            category: "Utility",
            requiredLevel: 5,
            maxLevel: 3,
            costs: [250, 500, 1000],
            bonuses: [
                "Basic tools",
                "Advanced tools + 10% efficiency",
                "Master tools + 25% efficiency",
            ]
        ),
        BuildingPlan(
            id: "well",
            name: "Water Well",
            icon: "💧",
            description: "Reduces water effort and boosts late-game growth.",
            category: "Utility",
            requiredLevel: 10,
            maxLevel: 4,
            costs: [180, 360, 720, 1440],
            bonuses: [
                "-25% water needs",
                "-50% water needs",
                "-75% water needs + auto-water",
                "No water needed + growth bonus",
            ]
        ),
        BuildingPlan(
            id: "windmill",
            name: "Windmill",
            icon: "🏭",
            description: "Processes crops into higher-value outputs.",
            category: "Processing",
            requiredLevel: 16,
            maxLevel: 5,
            costs: [400, 800, 1600, 3200, 6400],
            bonuses: [
                "Process crops +100% value",
                "Process crops +150% value",
                "Process crops +200% value",
                "Process crops +300% value",
                "Process crops +500% value",
            ]
        ),
    ]

    private static let defaultBuildingSynergyCatalog: [BuildingSynergy] = [
        BuildingSynergy(id: "hydro_garden", name: "Hydro Garden", icon: "💦", bonus: "+15% growth speed", buildingIDs: ["well", "greenhouse"]),
        BuildingSynergy(id: "supply_chain", name: "Supply Chain", icon: "📦", bonus: "+10% sell value", buildingIDs: ["barn", "silo"]),
        BuildingSynergy(id: "industrial_hub", name: "Industrial Hub", icon: "⚙️", bonus: "-15% processing time", buildingIDs: ["workshop", "windmill"]),
        BuildingSynergy(id: "full_farm", name: "Full Farm", icon: "🌾", bonus: "+20% all yields", buildingIDs: ["well", "barn", "greenhouse"]),
    ]

    private static let defaultResearchCatalog: [ResearchPlan] = [
        ResearchPlan(id: "hybrid_crops", name: "Hybrid Crops", icon: "🧬", category: "genetics", cost: 100, durationSeconds: 300, description: "Develop superior crop varieties.", unlocks: ["premium_seeds"], prerequisites: []),
        ResearchPlan(id: "irrigation_system", name: "Advanced Irrigation", icon: "💧", category: "technology", cost: 150, durationSeconds: 480, description: "Automated watering systems.", unlocks: ["auto_irrigation"], prerequisites: ["hybrid_crops"]),
        ResearchPlan(id: "pest_genetics", name: "Pest Genetics", icon: "🧪", category: "genetics", cost: 200, durationSeconds: 600, description: "Genetic pest resistance.", unlocks: ["resistant_crops"], prerequisites: ["hybrid_crops"]),
        ResearchPlan(id: "market_analytics", name: "Market Analytics", icon: "📊", category: "economics", cost: 250, durationSeconds: 720, description: "Advanced market prediction models.", unlocks: ["price_alerts", "trend_analysis"], prerequisites: []),
        ResearchPlan(id: "climate_control", name: "Climate Control", icon: "🌡️", category: "technology", cost: 400, durationSeconds: 900, description: "Weather-independent farming strategies.", unlocks: ["weather_immunity"], prerequisites: ["irrigation_system", "pest_genetics"]),
        ResearchPlan(id: "soil_enhancement", name: "Soil Enhancement", icon: "🌱", category: "agriculture", cost: 180, durationSeconds: 540, description: "Advanced soil fertility techniques.", unlocks: ["fertility_boost"], prerequisites: []),
        ResearchPlan(id: "automation_core", name: "Automation Core", icon: "🤖", category: "technology", cost: 300, durationSeconds: 800, description: "Foundation for automated farming.", unlocks: ["basic_automation"], prerequisites: ["irrigation_system"]),
    ]

    private static let defaultGeneticsCatalog: [GeneticsRecipe] = [
        GeneticsRecipe(id: "super_carrot", name: "Super Carrot", icon: "🥕✨", parentA: "carrot", parentB: "carrot", outputCropID: "super_carrot", levelRequirement: 12, notes: "Enhanced carrot line with strong value."),
        GeneticsRecipe(id: "rainbow_corn", name: "Rainbow Corn", icon: "🌽🌈", parentA: "corn", parentB: "wheat", outputCropID: "rainbow_corn", levelRequirement: 7, notes: "Premium hybrid with resilient traits."),
        GeneticsRecipe(id: "golden_tomato", name: "Golden Tomato", icon: "🍅✨", parentA: "tomato", parentB: "strawberry", outputCropID: "golden_tomato", levelRequirement: 9, notes: "Luxurious tomato cultivar for premium buyers."),
        GeneticsRecipe(id: "frost_potato", name: "Frost Potato", icon: "🥔❄️", parentA: "potato", parentB: "lettuce", outputCropID: "frost_potato", levelRequirement: 4, notes: "Cold-resistant hybrid for tough seasons."),
        GeneticsRecipe(id: "dragon_pepper", name: "Dragon Pepper", icon: "🌶️🔥", parentA: "chili", parentB: "super_carrot", outputCropID: "dragon_pepper", levelRequirement: 16, notes: "Legendary spicy crop with exceptional value."),
    ]

    private static let defaultLivestockCatalog: [LivestockTypePlan] = [
        LivestockTypePlan(id: "chicken", name: "Chicken", icon: "🐔", description: "Produces eggs daily. Easy to care for.", cost: 100, requiredLevel: 1, spaceRequired: 1, maintenanceCost: 5, productionTimeSeconds: 30, productID: "egg", productAmount: 1, productValue: 15),
        LivestockTypePlan(id: "pig", name: "Pig", icon: "🐷", description: "Grows quickly and finds truffles.", cost: 300, requiredLevel: 2, spaceRequired: 1, maintenanceCost: 10, productionTimeSeconds: 45, productID: "truffle", productAmount: 1, productValue: 30),
        LivestockTypePlan(id: "cow", name: "Cow", icon: "🐄", description: "Produces milk but needs more space.", cost: 500, requiredLevel: 3, spaceRequired: 2, maintenanceCost: 15, productionTimeSeconds: 60, productID: "milk", productAmount: 1, productValue: 40),
        LivestockTypePlan(id: "goat", name: "Goat", icon: "🐐", description: "Hardy animal that produces cheese.", cost: 350, requiredLevel: 3, spaceRequired: 1, maintenanceCost: 8, productionTimeSeconds: 50, productID: "cheese", productAmount: 1, productValue: 35),
        LivestockTypePlan(id: "sheep", name: "Sheep", icon: "🐑", description: "Produces wool periodically.", cost: 400, requiredLevel: 4, spaceRequired: 2, maintenanceCost: 12, productionTimeSeconds: 90, productID: "wool", productAmount: 1, productValue: 50),
    ]

    private static let defaultPetCatalog: [PetTypePlan] = [
        PetTypePlan(id: "dog", name: "Farm Dog", icon: "🐕", description: "Improves farm security and morale.", cost: 200, maxLevel: 5, requiredLevel: 3, bonusLabel: "Yield support", bonusPerLevel: 0.03),
        PetTypePlan(id: "cat", name: "Farm Cat", icon: "🐱", description: "Improves crop quality and pest control.", cost: 150, maxLevel: 5, requiredLevel: 2, bonusLabel: "Sell quality", bonusPerLevel: 0.025),
        PetTypePlan(id: "chicken_pet", name: "Companion Chicken", icon: "🐔", description: "Adds daily bonus resources.", cost: 100, maxLevel: 3, requiredLevel: 1, bonusLabel: "Daily resources", bonusPerLevel: 0.02),
    ]

    private static let defaultFishCatalog: [FishTypePlan] = [
        FishTypePlan(id: "common", name: "Common Fish", icon: "🐟", rarity: 0.6, baseValue: 20, difficulty: 1, minSize: 5, maxSize: 15, description: "A typical pond fish."),
        FishTypePlan(id: "uncommon", name: "Bass", icon: "🐠", rarity: 0.25, baseValue: 40, difficulty: 2, minSize: 10, maxSize: 25, description: "A feisty bass."),
        FishTypePlan(id: "rare", name: "Trout", icon: "🎣", rarity: 0.1, baseValue: 80, difficulty: 3, minSize: 20, maxSize: 40, description: "A beautiful trout."),
        FishTypePlan(id: "koi", name: "Koi Carp", icon: "🪷", rarity: 0.07, baseValue: 110, difficulty: 3, minSize: 22, maxSize: 45, description: "A graceful koi with shimmering scales."),
        FishTypePlan(id: "epic", name: "Salmon", icon: "🐡", rarity: 0.04, baseValue: 150, difficulty: 4, minSize: 30, maxSize: 60, description: "A prized salmon."),
        FishTypePlan(id: "legendary", name: "Golden Koi", icon: "🐲", rarity: 0.01, baseValue: 500, difficulty: 5, minSize: 40, maxSize: 100, description: "A legendary golden koi."),
        FishTypePlan(id: "mythic", name: "Moon Eel", icon: "🌙", rarity: 0.004, baseValue: 900, difficulty: 5, minSize: 55, maxSize: 120, description: "A mythic eel seen only under calm moonlight."),
    ]

    private static let defaultPondUpgrades: [PondUpgradePlan] = [
        PondUpgradePlan(id: "basic", level: 1, name: "Basic Pond", capacity: 3, regenRate: 1, cost: 0, rarityBonus: 1),
        PondUpgradePlan(id: "improved", level: 2, name: "Improved Pond", capacity: 5, regenRate: 1.5, cost: 500, rarityBonus: 1.1),
        PondUpgradePlan(id: "advanced", level: 3, name: "Advanced Pond", capacity: 8, regenRate: 2, cost: 1500, rarityBonus: 1.25),
        PondUpgradePlan(id: "master", level: 4, name: "Master Pond", capacity: 12, regenRate: 3, cost: 5000, rarityBonus: 1.5),
    ]

    private static let defaultChallengeCatalog: [ChallengePlan] = [
        ChallengePlan(id: "crop_stockpile", name: "Crop Stockpile", icon: "🌾", description: "Store crops in inventory.", difficulty: "easy", metric: "total_crops_inventory", target: 20, rewardCoins: 80, rewardXP: 35),
        ChallengePlan(id: "active_plots", name: "Field Coverage", icon: "🧑‍🌾", description: "Keep plots actively growing.", difficulty: "easy", metric: "active_plots", target: 8, rewardCoins: 70, rewardXP: 30),
        ChallengePlan(id: "builder_count", name: "Town Builder", icon: "🏗️", description: "Own built structures.", difficulty: "medium", metric: "built_structures", target: 3, rewardCoins: 120, rewardXP: 50),
        ChallengePlan(id: "animal_caretaker", name: "Animal Caretaker", icon: "🐾", description: "Maintain livestock animals.", difficulty: "medium", metric: "livestock_count", target: 4, rewardCoins: 130, rewardXP: 55),
        ChallengePlan(id: "coin_reserve", name: "Rainy Day Fund", icon: "💰", description: "Build a reserve of coins.", difficulty: "hard", metric: "coin_balance", target: 600, rewardCoins: 180, rewardXP: 70),
    ]

    private static let defaultExpansionConfig = ExpansionPlan(
        maxGrid: 12,
        costsByGridSize: [
            3: 150,
            4: 450,
            5: 1200,
            6: 3000,
            7: 7500,
            8: 15000,
            9: 30000,
            10: 60000,
            11: 120000
        ]
    )

    private(set) var save: SaveGame
    /// Render snapshot for the farm view. Updated when game state changes (actions, time ticks, etc).
    /// Views should be lightweight since this updates during gameplay.
    private(set) var renderSnapshot: FarmRenderSnapshot

    private(set) var cropDefs: [CropDef]
    private(set) var cropDisplay: [String: CropDisplayInfo]
    private(set) var decorDefs: [DecorDef]
    private(set) var festivalDefs: [FestivalDef]
    private(set) var minigameDefs: [MinigameDef]
    private(set) var almanacEntries: [AlmanacEntry]
    private(set) var strings: [String: String]
    private(set) var buildingCatalog: [BuildingPlan]
    private(set) var buildingSynergies: [BuildingSynergy]
    private(set) var researchCatalog: [ResearchPlan]
    private(set) var geneticsCatalog: [GeneticsRecipe]
    private(set) var livestockCatalog: [LivestockTypePlan]
    private(set) var petCatalog: [PetTypePlan]
    private(set) var fishCatalog: [FishTypePlan]
    private(set) var pondUpgradeCatalog: [PondUpgradePlan]
    private(set) var challengeCatalog: [ChallengePlan]
    private(set) var expansionConfig: ExpansionPlan

    var selectedSeedID: String
    private(set) var statusText: String
    private(set) var contentErrorMessage: String?

    var settings: GameUserSettings
    private(set) var onboardingRequired: Bool

    private(set) var hapticToken: Int = 0
    private(set) var harvestToken: Int = 0
    private(set) var lastTickDurationMs: Double = 0
    private(set) var lastSaveDurationMs: Double = 0
    private(set) var lastSaveLoadDurationMs: Double = 0
    private(set) var lastContentLoadDurationMs: Double = 0
    private(set) var hudTimeText: String = "6:00 AM"
    private(set) var hudClockSymbol: String = "sun.max.fill"
    private(set) var hudSeasonText: String = "Spring"
    private(set) var hudTimeProgress: Double = 0
    private(set) var dayRolloverToken: Int = 0
    private(set) var dayRolloverMessage: String = "A new day begins."
    private(set) var dayRolloverCoinsEarned: Int = 0
    private(set) var dayRolloverXPEarned: Int = 0

    var tomorrowWeatherIcon: String {
        let tomorrow = FarmWeatherModel.resolve(
            day: save.world.day + 1,
            timeProgress: 0.35,
            season: hudSeasonText
        )
        return tomorrow.weather.icon
    }

    var tomorrowWeatherLabel: String {
        let tomorrow = FarmWeatherModel.resolve(
            day: save.world.day + 1,
            timeProgress: 0.35,
            season: hudSeasonText
        )
        return tomorrow.weather.rawValue
    }

    @ObservationIgnored private var engine: GameCoreEngine
    @ObservationIgnored private var timeEngine = TimeEngine(
        config: TimeEngineConfig(secondsPerDay: 1_440, ticksPerSecond: 12, pauseInMenus: false, offlineCatchup: true)
    )
    @ObservationIgnored private let saveStore: SaveFileStore
    @ObservationIgnored private let userDefaults: UserDefaults
    @ObservationIgnored private var pendingSaveTask: Task<Void, Never>?
    @ObservationIgnored private var appIsActive: Bool = true
    @ObservationIgnored private var menuPresented: Bool = false
    @ObservationIgnored private var lastHUDPublishTimestamp: TimeInterval = 0
    @ObservationIgnored private var buildingPlansByID: [String: BuildingPlan] = [:]
    @ObservationIgnored private var researchPlansByID: [String: ResearchPlan] = [:]
    @ObservationIgnored private var geneticsRecipesByID: [String: GeneticsRecipe] = [:]
    @ObservationIgnored private var livestockPlansByID: [String: LivestockTypePlan] = [:]
    @ObservationIgnored private var petPlansByID: [String: PetTypePlan] = [:]
    @ObservationIgnored private var challengePlansByID: [String: ChallengePlan] = [:]
    @ObservationIgnored private var pondUpgradesByLevel: [Int: PondUpgradePlan] = [:]
    @ObservationIgnored private var cachedReadyTileCount: Int = 0
    @ObservationIgnored private var cachedPlantedTileCount: Int = 0
    @ObservationIgnored private var cachedSeedInventoryCount: Int = 0
    @ObservationIgnored private var cachedCropInventoryCount: Int = 0
    @ObservationIgnored private var cachedBuiltStructureCount: Int = 0
    @ObservationIgnored private var cachedLivestockCount: Int = 0
    @ObservationIgnored private var cachedUsedLivestockCapacity: Int = 0
    @ObservationIgnored private var cachedTotalFishCaught: Int = 0
    @ObservationIgnored private var cachedDailySpecials: Set<String> = []
    @ObservationIgnored private var cachedDailySpecialDay: Int = -1
    @ObservationIgnored private var cachedDailySpecialSeed: UInt64 = 0
    @ObservationIgnored private var cachedDailySpecialSummary: String = "No deals today."

    private static let settingsKey = "com.farmsim.settings.v1"
    private static let onboardingKey = "com.farmsim.onboarding.seen"
    private static let milestoneStateKey = "com.farmsim.milestones.v1"
    private static let dailyLoginKey = "com.farmsim.dailylogin.v1"
    private static let claimedLevelsKey = "com.farmsim.claimedlevels.v1"
    private static let saveDebounceNanoseconds: UInt64 = 350_000_000
    private static let hudPublishIntervalSeconds: TimeInterval = 0.25
    private static let defaultTimeConfig = TimeEngineConfig(
        // Matches prior web-style accelerated day cycle: 24 minutes per in-game day.
        secondsPerDay: 1_440,
        ticksPerSecond: 12,
        pauseInMenus: false,
        offlineCatchup: true
    )

    let milestoneManager: MilestoneManager
    private(set) var lastPlayerLevel: Int = 1

    var playerLevel: Int {
        ProgressionSystem.level(forXP: save.player.xp)
    }

    var targetSimTicksPerSecond: Double {
        Self.defaultTimeConfig.ticksPerSecond
    }

    var yieldMultiplier: Double {
        let base = ProgressionSystem.yieldMultiplier(forLevel: playerLevel)
        return base * buildingYieldMultiplier * researchYieldMultiplier * petYieldMultiplier
    }

    var nextGridUnlock: Int {
        ProgressionSystem.unlockedGrid(forLevel: playerLevel)
    }

    var farmName: String {
        settings.farmName
    }

    var widgetSnapshot: WidgetFarmSnapshot {
        WidgetFarmSnapshot(
            farmName: farmName,
            day: save.world.day,
            coins: save.player.coins,
            level: playerLevel,
            readyCrops: readyTileCount,
            season: hudSeasonText,
            timeText: hudTimeText
        )
    }

    var readyTileCount: Int {
        cachedReadyTileCount
    }

    var plantedTileCount: Int {
        cachedPlantedTileCount
    }

    var totalInventoryCount: Int {
        cachedSeedInventoryCount + cachedCropInventoryCount
    }

    var totalTileCount: Int {
        save.world.tiles.count
    }

    var buildingPlans: [BuildingPlan] {
        buildingCatalog
    }

    var buildingSynergyPlans: [BuildingSynergy] {
        buildingSynergies
    }

    var activeBuildingSynergies: [BuildingSynergy] {
        buildingSynergies.filter { synergy in
            synergy.buildingIDs.allSatisfy { buildingLevel(for: $0) > 0 }
        }
    }

    var researchPlans: [ResearchPlan] {
        researchCatalog
    }

    var geneticsRecipes: [GeneticsRecipe] {
        geneticsCatalog
    }

    var livestockPlans: [LivestockTypePlan] {
        livestockCatalog
    }

    var petPlans: [PetTypePlan] {
        petCatalog
    }

    var fishPlans: [FishTypePlan] {
        fishCatalog
    }

    var pondUpgrades: [PondUpgradePlan] {
        pondUpgradeCatalog
    }

    var challengePlans: [ChallengePlan] {
        challengeCatalog
    }

    var challengeStreak: Int {
        max(0, save.meta.challengeStreak)
    }

    var dailyLoginStreak: Int {
        milestoneManager.dailyLogin.streak
    }

    var longestDailyStreak: Int {
        milestoneManager.dailyLogin.longestStreak
    }

    var completedMilestones: [MilestoneType] {
        MilestoneType.allCases.filter { milestoneManager.milestoneState.completedMilestones.contains($0.rawValue) }
    }

    var pendingCelebrations: [MilestoneEvent] {
        milestoneManager.pendingCelebrations
    }

    var expansionPlan: ExpansionPlan {
        expansionConfig
    }

    var sellBonusMultiplier: Double {
        buildingSellMultiplier * researchSellMultiplier * petSellMultiplier
    }

    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        self.settings = Self.loadSettings(defaults: userDefaults)
        self.onboardingRequired = userDefaults.bool(forKey: Self.onboardingKey) == false

        let contentLoadInterval = PerfTelemetry.begin("content_load")
        let contentLoadStart = ContinuousClock.now
        let loadedContent = Self.loadContent()
        let contentLoadDurationMs = PerfTelemetry.elapsedMs(since: contentLoadStart)
        PerfTelemetry.end("content_load", contentLoadInterval)
        let sortedDefs = loadedContent.cropDefs.sorted { $0.id < $1.id }
        let firstSeed = sortedDefs.first?.id ?? ""

        let saveStore = SaveFileStore(fileURL: SavePaths.defaultSaveURL(appName: "FarmSim"))
        let starterSeeds = Dictionary(uniqueKeysWithValues: sortedDefs.prefix(4).map { ($0.id, 4) })
        let fallbackSave = GameCoreEngine.defaultSave(
            gridWidth: 4,
            gridHeight: 4,
            starterSeeds: starterSeeds,
            daySeed: 20260212
        )

        let initialSave: SaveGame
        var loadError: String?
        let saveLoadInterval = PerfTelemetry.begin("save_load")
        let saveLoadStart = ContinuousClock.now
        do {
            initialSave = try saveStore.load() ?? fallbackSave
        } catch {
            initialSave = fallbackSave
            loadError = "Save load failed: \(error.localizedDescription)"
        }
        let saveLoadDurationMs = PerfTelemetry.elapsedMs(since: saveLoadStart)
        PerfTelemetry.end("save_load", saveLoadInterval)

        var engine = GameCoreEngine(save: initialSave, cropDefs: sortedDefs, seed: initialSave.daySeed)
        var initialTimeState = initialSave.meta.time
        initialTimeState.dayIndex = max(initialSave.world.day, initialTimeState.dayIndex)
        var timeEngine = TimeEngine(config: Self.defaultTimeConfig, state: initialTimeState)
        let nowTimestamp = Date().timeIntervalSince1970
        let offlineCatchup = timeEngine.applyOfflineCatchup(now: nowTimestamp, maxCatchupDays: 14)
        
        timeEngine.setLastRealWorldTimestamp(nowTimestamp)
        engine.setTimeState(timeEngine.state)

        self.saveStore = saveStore
        self.timeEngine = timeEngine
        self.engine = engine
        self.save = engine.save
        self.renderSnapshot = Self.makeSnapshot(save: engine.save, cropDefsByID: engine.cropDefsByID)

        let resolvedBuildingCatalog = loadedContent.buildingPlans.isEmpty ? Self.defaultBuildingCatalog : loadedContent.buildingPlans
        let resolvedBuildingSynergies = loadedContent.buildingSynergies.isEmpty ? Self.defaultBuildingSynergyCatalog : loadedContent.buildingSynergies
        let resolvedResearchCatalog = loadedContent.researchPlans.isEmpty ? Self.defaultResearchCatalog : loadedContent.researchPlans
        let resolvedGeneticsCatalog = loadedContent.geneticsRecipes.isEmpty ? Self.defaultGeneticsCatalog : loadedContent.geneticsRecipes
        let resolvedLivestockCatalog = loadedContent.livestockPlans.isEmpty ? Self.defaultLivestockCatalog : loadedContent.livestockPlans
        let resolvedPetCatalog = loadedContent.petPlans.isEmpty ? Self.defaultPetCatalog : loadedContent.petPlans
        let resolvedFishCatalog = loadedContent.fishPlans.isEmpty ? Self.defaultFishCatalog : loadedContent.fishPlans
        let resolvedPondUpgradeCatalog = loadedContent.pondUpgrades.isEmpty ? Self.defaultPondUpgrades : loadedContent.pondUpgrades.sorted { $0.level < $1.level }
        let resolvedChallengeCatalog = loadedContent.challengePlans.isEmpty ? Self.defaultChallengeCatalog : loadedContent.challengePlans

        self.cropDefs = sortedDefs
        self.cropDisplay = loadedContent.cropDisplay
        self.decorDefs = loadedContent.decorDefs
        self.festivalDefs = loadedContent.festivalDefs
        self.minigameDefs = loadedContent.minigameDefs
        self.almanacEntries = loadedContent.almanacEntries
        self.strings = loadedContent.strings
        self.buildingCatalog = resolvedBuildingCatalog
        self.buildingSynergies = resolvedBuildingSynergies
        self.researchCatalog = resolvedResearchCatalog
        self.geneticsCatalog = resolvedGeneticsCatalog
        self.livestockCatalog = resolvedLivestockCatalog
        self.petCatalog = resolvedPetCatalog
        self.fishCatalog = resolvedFishCatalog
        self.pondUpgradeCatalog = resolvedPondUpgradeCatalog
        self.challengeCatalog = resolvedChallengeCatalog
        self.expansionConfig = Self.defaultExpansionConfig
        self.buildingPlansByID = Dictionary(uniqueKeysWithValues: resolvedBuildingCatalog.map { ($0.id, $0) })
        self.researchPlansByID = Dictionary(uniqueKeysWithValues: resolvedResearchCatalog.map { ($0.id, $0) })
        self.geneticsRecipesByID = Dictionary(uniqueKeysWithValues: resolvedGeneticsCatalog.map { ($0.id, $0) })
        self.livestockPlansByID = Dictionary(uniqueKeysWithValues: resolvedLivestockCatalog.map { ($0.id, $0) })
        self.petPlansByID = Dictionary(uniqueKeysWithValues: resolvedPetCatalog.map { ($0.id, $0) })
        self.challengePlansByID = Dictionary(uniqueKeysWithValues: resolvedChallengeCatalog.map { ($0.id, $0) })
        self.pondUpgradesByLevel = Dictionary(uniqueKeysWithValues: resolvedPondUpgradeCatalog.map { ($0.level, $0) })

        self.selectedSeedID = firstSeed
        self.statusText = ""
        self.contentErrorMessage = loadedContent.contentErrorMessage
        self.lastContentLoadDurationMs = contentLoadDurationMs
        self.lastSaveLoadDurationMs = saveLoadDurationMs

        // Initialize milestone manager with saved state
        let milestoneManager = MilestoneManager()
        milestoneManager.loadMilestoneState(from: userDefaults.data(forKey: Self.milestoneStateKey))
        milestoneManager.loadDailyLogin(from: userDefaults.data(forKey: Self.dailyLoginKey))
        milestoneManager.loadClaimedLevels(from: userDefaults.data(forKey: Self.claimedLevelsKey))
        self.milestoneManager = milestoneManager
        self.lastPlayerLevel = ProgressionSystem.level(forXP: initialSave.player.xp)

        // Process daily login
        let loginResult = milestoneManager.processDailyLogin(now: nowTimestamp)

        if offlineCatchup.dayDelta > 0 {
            for _ in 0..<offlineCatchup.dayDelta {
                self.engine.advanceDay(growthMultiplier: self.growthMultiplier)
            }
            self.save = self.engine.save
            self.renderSnapshot = Self.makeSnapshot(save: self.save, cropDefsByID: self.engine.cropDefsByID)
            autoSellCrops()
        }

        // Build startup status with welcome back info
        var startupStatus: String?
        if let loadError {
            startupStatus = loadError
        } else if offlineCatchup.dayDelta > 0 {
            let hoursAway = Int((nowTimestamp - initialTimeState.lastRealWorldTimestamp) / 3600)
            let welcomeInfo = WelcomeBackInfo(
                daysAway: offlineCatchup.dayDelta,
                hoursAway: hoursAway,
                coinsEarned: 0,
                xpEarned: offlineCatchup.dayDelta * 5,
                cropsGrown: 0,
                cropsReady: readyTileCount,
                streakMaintained: !loginResult.streakBroken,
                streakBonus: loginResult.streakIncreased ? min(100, loginResult.streak * 10) : 0
            )
            _ = milestoneManager.createWelcomeBackEvent(info: welcomeInfo)

            if loginResult.streakIncreased, loginResult.streak > 1 {
                _ = milestoneManager.createDailyStreakEvent(streak: loginResult.streak)
            }

            startupStatus = "Welcome back! \(offlineCatchup.dayDelta) day\(offlineCatchup.dayDelta == 1 ? "" : "s") passed."
        } else if loginResult.streakIncreased, loginResult.streak > 1 {
            _ = milestoneManager.createDailyStreakEvent(streak: loginResult.streak)
            startupStatus = "\(loginResult.streak)-day streak! Keep it up!"
        }

        self.statusText = startupStatus ?? "Tap a tile to manage crops."

        _ = applyProgressionUnlocksIfNeeded()
        syncState(statusOverride: startupStatus, emitHaptic: false, emitHarvest: false)
        refreshHUDTime(force: true, now: nowTimestamp)
    }

    deinit {
        pendingSaveTask?.cancel()
    }

    func tileSheetState(for index: Int) -> TileSheetState? {
        guard save.world.tiles.indices.contains(index) else { return nil }
        let tile = save.world.tiles[index]
        let cropID = tile.planted?.cropID
        let cropName = cropID.flatMap { engine.cropDefsByID[$0]?.name } ?? "Empty"
        return TileSheetState(
            index: index,
            cropID: cropID,
            cropName: cropName,
            isReady: engine.isTileReady(index),
            progress: growthProgress(tileIndex: index),
            watered: tile.state.watered
        )
    }

    func selectSeed(id: String) {
        guard cropDefs.contains(where: { $0.id == id }) else { return }
        selectedSeedID = id
        let cropName = engine.cropDefsByID[id]?.name ?? id
        statusText = "Selected \(cropName)."
    }

    func stepAutoTime(now: TimeInterval = Date().timeIntervalSince1970) {
        let tickInterval = PerfTelemetry.begin("sim_tick")
        let tickStart = ContinuousClock.now
        let pauseForMenu = timeEngine.config.pauseInMenus && menuPresented
        let result = timeEngine.tick(now: now, isPaused: !appIsActive || pauseForMenu)
        lastTickDurationMs = PerfTelemetry.elapsedMs(since: tickStart)
        PerfTelemetry.end("sim_tick", tickInterval)

        if result.dayDelta > 0 {
            advanceSimulationDays(
                result.dayDelta,
                status: result.dayDelta == 1 ? "A new day begins." : "\(result.dayDelta) new days begin.",
                emitHaptic: true,
                triggerDayRollover: true
            )
        } else {
            refreshHUDTime(force: false, now: now)
        }
    }

    func setAppActive(_ active: Bool, now: TimeInterval = Date().timeIntervalSince1970) {
        appIsActive = active
        if active {
            FarmNotifications.clearCropsReadyReminder()
            let catchup = timeEngine.applyOfflineCatchup(now: now, maxCatchupDays: 14)
            if catchup.dayDelta > 0 {
                advanceSimulationDays(
                    catchup.dayDelta,
                    status: "Welcome back. \(catchup.dayDelta) day\(catchup.dayDelta == 1 ? "" : "s") passed on the farm.",
                    emitHaptic: false,
                    triggerDayRollover: false
                )
            } else {
                refreshHUDTime(force: true, now: now)
            }
        } else {
            timeEngine.setLastRealWorldTimestamp(now)
            engine.setTimeState(timeEngine.state)
            if settings.cropsReadyNotifications {
                FarmNotifications.scheduleCropsReadyReminder(
                    day: engine.save.world.day,
                    readyCrops: readyTileCount,
                    plantedCrops: plantedTileCount,
                    farmName: farmName,
                    secondsUntilReady: secondsUntilNextCropReady
                )
            }
        }
    }

    func setMenuPresented(_ presented: Bool) {
        menuPresented = presented
    }

    // Legacy API kept for debug controls and compatibility with existing call sites.
    func advanceDay() {
        advanceDays(1)
    }

    // Legacy API kept for debug controls and compatibility with existing call sites.
    func advanceDays(_ count: Int) {
        let safeCount = max(1, min(14, count))
        let _ = timeEngine.fastForward(days: safeCount)
        advanceSimulationDays(
            safeCount,
            status: safeCount == 1 ? "Fast-forwarded 1 day." : "Fast-forwarded \(safeCount) days.",
            emitHaptic: safeCount > 1,
            triggerDayRollover: true
        )
    }

    func advanceSimulationDays(_ count: Int, status: String, emitHaptic: Bool, triggerDayRollover: Bool) {
        let safeCount = max(0, count)
        guard safeCount > 0 else { return }

        let preCoins = engine.save.player.coins
        let preXP = engine.save.player.xp
        let oldSeasonIndex = (max(0, engine.save.world.day) / 7) % 4

        for _ in 0..<safeCount {
            engine.advanceDay(growthMultiplier: growthMultiplier)
        }
        autoSellCrops()
        engine.setTimeState(timeEngine.state)

        let earnedCoins = max(0, engine.save.player.coins - preCoins)
        let earnedXP = max(0, engine.save.player.xp - preXP)
        let newSeasonIndex = (max(0, engine.save.world.day) / 7) % 4

        // Build enriched rollover message with earnings
        var rolloverMsg = status
        if triggerDayRollover && (earnedCoins > 0 || earnedXP > 0) {
            var parts = [status]
            if earnedCoins > 0 { parts.append("+\(earnedCoins) \u{1FA99}") }
            if earnedXP > 0 { parts.append("+\(earnedXP) XP") }
            rolloverMsg = parts.joined(separator: "  ")
        }

        if triggerDayRollover {
            dayRolloverMessage = rolloverMsg
            dayRolloverCoinsEarned = earnedCoins
            dayRolloverXPEarned = earnedXP
            dayRolloverToken += 1
            SoundManager.shared.play(.success)
        }

        // Season change — queue a festival toast
        if oldSeasonIndex != newSeasonIndex {
            let seasons = ["Spring", "Summer", "Autumn", "Winter"]
            let seasonIcons = ["\u{1F338}", "\u{2600}\u{FE0F}", "\u{1F342}", "\u{2744}\u{FE0F}"]
            let newSeason = seasons[newSeasonIndex % seasons.count]
            let icon = seasonIcons[newSeasonIndex % seasonIcons.count]
            _ = milestoneManager.createSeasonStartEvent(season: newSeason, icon: icon)
        }

        syncState(statusOverride: rolloverMsg, emitHaptic: emitHaptic, emitHarvest: false)
        refreshHUDTime(force: true, now: Date().timeIntervalSince1970)
    }



    func plantSelectedSeed(on tileIndex: Int) {
        let planted = engine.plant(tileIndex: tileIndex, cropID: selectedSeedID)
        let cropName = engine.cropDefsByID[selectedSeedID]?.name ?? selectedSeedID
        let status = planted ? "Planted \(cropName)." : "Cannot plant here."
        if planted { SoundManager.shared.play(.plant) }
        syncState(statusOverride: status, emitHaptic: planted, emitHarvest: false)
    }

    func waterTile(index: Int) {
        let watered = engine.water(tileIndex: index)
        let status = watered ? "Tile watered." : "Nothing to water."
        if watered { SoundManager.shared.play(.water, haptic: .soft) }
        syncState(statusOverride: status, emitHaptic: watered, emitHarvest: false)
    }

    func clearTile(index: Int) {
        let cleared = engine.clearTile(tileIndex: index)
        let status = cleared ? "Crop removed." : "Tile already empty."
        if cleared { SoundManager.shared.play(.click, haptic: .light) }
        syncState(statusOverride: status, emitHaptic: cleared, emitHarvest: false)
    }

    func harvestTile(index: Int) {
        let harvested = engine.harvest(tileIndex: index, yieldMultiplier: yieldMultiplier, maxCapacity: maxInventoryCapacity)
        let status: String
        if harvested > 0 {
            status = "Harvested \(harvested) crops."
            SoundManager.shared.play(.harvest)

            // Track first harvest milestone
            if milestoneManager.checkMilestone(.firstHarvest) {
                _ = milestoneManager.completeMilestone(.firstHarvest)
            }

            // Record harvest count
            milestoneManager.recordHarvest(count: harvested)
            let _ = milestoneManager.checkProgressiveMilestones(harvested: milestoneManager.milestoneState.totalHarvested)
        } else {
            status = isInventoryFull ? "Silo is full! Upgrade or sell crops." : "Nothing to harvest."
        }
        syncState(statusOverride: status, emitHaptic: harvested > 0, emitHarvest: harvested > 0)
    }

    func harvestAll() {
        let count = engine.harvestAll(yieldMultiplier: yieldMultiplier, maxCapacity: maxInventoryCapacity)
        let status: String
        if count > 0 {
            status = "Harvested \(count) crops total."
            SoundManager.shared.play(.harvest)

            // Track first harvest milestone
            if milestoneManager.checkMilestone(.firstHarvest) {
                _ = milestoneManager.completeMilestone(.firstHarvest)
            }

            // Record harvest count
            milestoneManager.recordHarvest(count: count)
            let _ = milestoneManager.checkProgressiveMilestones(harvested: milestoneManager.milestoneState.totalHarvested)
        } else {
            status = isInventoryFull ? "Silo is full! Cannot harvest more." : "No crops ready."
        }
        syncState(statusOverride: status, emitHaptic: count > 0, emitHarvest: count > 0)
    }

    func buySeed(cropID: String, quantity: Int = 1) -> Bool {
        guard let def = engine.cropDefsByID[cropID] else { return false }
        let safeQuantity = max(1, quantity)
        let discountedCost = discountedSeedCost(for: def.seedCost, cropID: cropID)
        let result = engine.buy(
            itemID: cropID,
            quantity: safeQuantity,
            pricing: MarketPricing(seedUnitCosts: [cropID: discountedCost])
        )
        let bought = result.success
        let status = bought
            ? "Purchased \(safeQuantity)x \(def.name) seed for \(result.totalPrice) coins."
            : "Not enough coins."
        SoundManager.shared.play(bought ? .purchase : .error)
        syncState(statusOverride: status, emitHaptic: bought, emitHarvest: false)
        return bought
    }

    func sellCrop(cropID: String, quantity: Int = 1) -> Bool {
        guard let def = engine.cropDefsByID[cropID] else { return false }
        let daily = dailySellMultiplier(for: cropID)
        let adjustedUnitPrice = max(1, Int((Double(def.sellPrice) * sellBonusMultiplier * daily).rounded(.down)))
        let result = engine.sell(
            itemID: cropID,
            quantity: quantity,
            pricing: MarketPricing(cropUnitPrices: [cropID: adjustedUnitPrice])
        )
        if result.success { SoundManager.shared.play(.sell) }
        let sold = result.success
        let cropName = engine.cropDefsByID[cropID]?.name ?? cropID
        let status = sold ? "Sold \(result.quantity)x \(cropName) for \(result.totalPrice) coins." : "No crops to sell."

        if sold {
            // Track first sale milestone
            if milestoneManager.checkMilestone(.firstSale) {
                _ = milestoneManager.completeMilestone(.firstSale)
            }

            // Record sale count and value
            milestoneManager.recordSale(count: result.quantity, value: result.totalPrice)
            let _ = milestoneManager.checkProgressiveMilestones(
                sold: milestoneManager.milestoneState.totalSold,
                coinsEarned: milestoneManager.milestoneState.totalCoinsEarned
            )
        }

        syncState(statusOverride: status, emitHaptic: sold, emitHarvest: false)
        return sold
    }

    func applyPendingGridUpgrade() {
        let upgraded = applyProgressionUnlocksIfNeeded()
        let status = upgraded ?? "No upgrade available at current level."
        syncState(statusOverride: status, emitHaptic: upgraded != nil, emitHarvest: false)
    }

    func canAfford(cropID: String) -> Bool {
        guard let def = engine.cropDefsByID[cropID] else { return false }
        return save.player.coins >= discountedSeedCost(for: def.seedCost, cropID: cropID)
    }

    func seedPrice(for cropID: String) -> Int? {
        guard let def = engine.cropDefsByID[cropID] else { return nil }
        return discountedSeedCost(for: def.seedCost, cropID: cropID)
    }

    func sellUnitPrice(for cropID: String) -> Int? {
        guard let def = engine.cropDefsByID[cropID] else { return nil }
        let base = Double(def.sellPrice) * sellBonusMultiplier
        let daily = dailySellMultiplier(for: cropID)
        return max(1, Int((base * daily).rounded(.down)))
    }

    func isUnlocked(cropID: String) -> Bool {
        let requiredLevel = cropDisplay[cropID]?.level ?? 1
        return playerLevel >= requiredLevel
    }

    func buildingLevel(for buildingID: String) -> Int {
        max(0, save.meta.buildingLevels[buildingID] ?? 0)
    }

    func nextBuildingCost(for buildingID: String) -> Int? {
        guard let plan = buildingPlansByID[buildingID] else { return nil }
        return plan.costForNextLevel(currentLevel: buildingLevel(for: buildingID))
    }

    @discardableResult
    func upgradeBuilding(_ buildingID: String) -> Bool {
        guard let plan = buildingPlansByID[buildingID] else { return false }
        guard playerLevel >= plan.requiredLevel else {
            syncState(statusOverride: "Reach level \(plan.requiredLevel) to unlock \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        let level = buildingLevel(for: buildingID)
        guard level < plan.maxLevel else {
            syncState(statusOverride: "\(plan.name) is already max level.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard let cost = plan.costForNextLevel(currentLevel: level), engine.spendCoins(cost) else {
            syncState(statusOverride: "Not enough coins for \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }

        engine.setBuildingLevel(level + 1, for: buildingID)
        let bonus = plan.bonusForLevel(level + 1)

        // Track first building milestone
        if milestoneManager.checkMilestone(.firstBuilding) {
            _ = milestoneManager.completeMilestone(.firstBuilding)
        }

        SoundManager.shared.play(.levelUp)
        syncState(statusOverride: "\(plan.name) upgraded to Lv \(level + 1). \(bonus)", emitHaptic: true, emitHarvest: false)
        return true
    }

    func isResearchCompleted(_ researchID: String) -> Bool {
        save.meta.completedResearch[researchID] ?? false
    }

    func canCompleteResearch(_ plan: ResearchPlan) -> Bool {
        guard !isResearchCompleted(plan.id) else { return false }
        guard save.player.coins >= plan.cost else { return false }
        return plan.prerequisites.allSatisfy { isResearchCompleted($0) }
    }

    @discardableResult
    func completeResearch(_ researchID: String) -> Bool {
        guard let plan = researchPlansByID[researchID] else { return false }
        guard canCompleteResearch(plan) else {
            syncState(statusOverride: "Research requirements not met for \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard engine.spendCoins(plan.cost) else { return false }
        engine.markResearchCompleted(plan.id)
        engine.addXP(max(10, plan.cost / 2))

        // Track first research milestone
        if milestoneManager.checkMilestone(.firstResearch) {
            _ = milestoneManager.completeMilestone(.firstResearch)
        }

        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "Research complete: \(plan.name).", emitHaptic: true, emitHarvest: false)
        return true
    }

    func canBreed(_ recipe: GeneticsRecipe) -> Bool {
        guard isResearchCompleted("hybrid_crops") else { return false }
        guard playerLevel >= recipe.levelRequirement else { return false }
        return recipe.requiredParents().allSatisfy { pair in
            seedCount(for: pair.key) >= pair.value
        }
    }

    @discardableResult
    func discoverHybrid(_ recipeID: String) -> Bool {
        guard let recipe = geneticsRecipesByID[recipeID] else { return false }
        guard isResearchCompleted("hybrid_crops") else {
            syncState(statusOverride: "Complete Hybrid Crops research first.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard playerLevel >= recipe.levelRequirement else {
            syncState(statusOverride: "Reach level \(recipe.levelRequirement) to unlock \(recipe.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        for (cropID, qty) in recipe.requiredParents() {
            guard engine.consumeSeeds(cropID: cropID, quantity: qty) else {
                syncState(statusOverride: "Not enough parent seeds for \(recipe.name).", emitHaptic: false, emitHarvest: false)
                return false
            }
        }
        engine.grantSeeds(cropID: recipe.outputCropID, quantity: 1)
        engine.markHybridDiscovered(recipe.id)
        engine.addXP(25)

        // Track first hybrid milestone
        if milestoneManager.checkMilestone(.firstHybrid) {
            _ = milestoneManager.completeMilestone(.firstHybrid)
        }

        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "Discovered \(recipe.name). +1 \(cropName(for: recipe.outputCropID)) seed.", emitHaptic: true, emitHarvest: false)
        return true
    }

    func livestockCount(for livestockID: String) -> Int {
        max(0, save.meta.livestockCounts[livestockID] ?? 0)
    }

    var livestockCapacity: Int {
        10 + max(0, buildingLevel(for: "barn")) * 2
    }

    var usedLivestockCapacity: Int {
        cachedUsedLivestockCapacity
    }

    func canBuyLivestock(_ livestockID: String) -> Bool {
        guard let plan = livestockPlansByID[livestockID] else { return false }
        guard playerLevel >= plan.requiredLevel else { return false }
        guard save.player.coins >= plan.cost else { return false }
        return (usedLivestockCapacity + plan.spaceRequired) <= livestockCapacity
    }

    @discardableResult
    func buyLivestock(_ livestockID: String) -> Bool {
        guard let plan = livestockPlansByID[livestockID] else { return false }
        guard playerLevel >= plan.requiredLevel else {
            syncState(statusOverride: "Reach level \(plan.requiredLevel) to unlock \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard (usedLivestockCapacity + plan.spaceRequired) <= livestockCapacity else {
            syncState(statusOverride: "Not enough barn space for \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard engine.spendCoins(plan.cost) else {
            syncState(statusOverride: "Not enough coins for \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        engine.setLivestockCount(livestockCount(for: livestockID) + 1, for: livestockID)
        engine.addXP(20)

        // Track first livestock milestone
        if milestoneManager.checkMilestone(.firstLivestock) {
            _ = milestoneManager.completeMilestone(.firstLivestock)
        }

        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "Added \(plan.name) to your farm.", emitHaptic: true, emitHarvest: false)
        return true
    }

    @discardableResult
    func collectLivestockProducts() -> Int {
        var totalCoins = 0
        for plan in livestockPlans {
            let count = livestockCount(for: plan.id)
            guard count > 0 else { continue }
            let gross = count * max(1, plan.productAmount) * max(0, plan.productValue)
            let maintenance = count * max(0, plan.maintenanceCost)
            totalCoins += max(0, gross - maintenance)
        }
        guard totalCoins > 0 else {
            syncState(statusOverride: "No livestock products ready.", emitHaptic: false, emitHarvest: false)
            return 0
        }
        engine.addCoins(totalCoins)
        engine.addXP(max(5, totalCoins / 10))
        SoundManager.shared.play(.sell, haptic: .medium)
        syncState(statusOverride: "Collected livestock goods for \(totalCoins) coins.", emitHaptic: true, emitHarvest: true)
        return totalCoins
    }

    func petLevel(for petID: String) -> Int {
        max(0, save.meta.petLevels[petID] ?? 0)
    }

    func canAdoptPet(_ petID: String) -> Bool {
        guard let plan = petPlansByID[petID] else { return false }
        guard petLevel(for: petID) == 0 else { return false }
        guard playerLevel >= plan.requiredLevel else { return false }
        return save.player.coins >= plan.cost
    }

    @discardableResult
    func adoptPet(_ petID: String) -> Bool {
        guard let plan = petPlansByID[petID] else { return false }
        guard petLevel(for: petID) == 0 else {
            syncState(statusOverride: "\(plan.name) already adopted.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard playerLevel >= plan.requiredLevel else {
            syncState(statusOverride: "Reach level \(plan.requiredLevel) to adopt \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard engine.spendCoins(plan.cost) else {
            syncState(statusOverride: "Not enough coins for \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        engine.setPetLevel(1, for: petID)
        engine.addXP(20)

        // Track first pet milestone
        if milestoneManager.checkMilestone(.firstPet) {
            _ = milestoneManager.completeMilestone(.firstPet)
        }

        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "Adopted \(plan.name).", emitHaptic: true, emitHarvest: false)
        return true
    }

    @discardableResult
    func trainPet(_ petID: String) -> Bool {
        guard let plan = petPlansByID[petID] else { return false }
        let current = petLevel(for: petID)
        guard current > 0 else {
            syncState(statusOverride: "Adopt \(plan.name) first.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard current < plan.maxLevel else {
            syncState(statusOverride: "\(plan.name) is already max level.", emitHaptic: false, emitHarvest: false)
            return false
        }
        let cost = max(25, plan.cost / 2) * current
        guard engine.spendCoins(cost) else {
            syncState(statusOverride: "Not enough coins to train \(plan.name).", emitHaptic: false, emitHarvest: false)
            return false
        }
        engine.setPetLevel(current + 1, for: petID)
        engine.addXP(10 + current * 5)
        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "\(plan.name) advanced to Lv \(current + 1).", emitHaptic: true, emitHarvest: false)
        return true
    }

    var fishingPondLevel: Int {
        max(1, save.meta.fishingPondLevel)
    }

    var currentPondUpgrade: PondUpgradePlan {
        let level = fishingPondLevel
        if let direct = pondUpgradesByLevel[level] {
            return direct
        }
        for fallbackLevel in stride(from: level - 1, through: 1, by: -1) {
            if let plan = pondUpgradesByLevel[fallbackLevel] {
                return plan
            }
        }
        return PondUpgradePlan(id: "basic", level: 1, name: "Basic Pond", capacity: 3, regenRate: 1, cost: 0, rarityBonus: 1)
    }

    var nextPondUpgrade: PondUpgradePlan? {
        pondUpgradesByLevel[fishingPondLevel + 1]
    }

    @discardableResult
    func upgradePond() -> Bool {
        guard let next = nextPondUpgrade else {
            syncState(statusOverride: "Pond is already max level.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard engine.spendCoins(next.cost) else {
            syncState(statusOverride: "Not enough coins to upgrade pond.", emitHaptic: false, emitHarvest: false)
            return false
        }
        engine.setFishingPondLevel(next.level)
        SoundManager.shared.play(.purchase, haptic: .medium)
        syncState(statusOverride: "Pond upgraded to \(next.name).", emitHaptic: true, emitHarvest: false)
        return true
    }

    func fishCaughtCount(for fishID: String) -> Int {
        max(0, save.meta.fishCaughtCounts[fishID] ?? 0)
    }

    var totalFishCaught: Int {
        cachedTotalFishCaught
    }

    @discardableResult
    func castFishingLine() -> Bool {
        guard !fishPlans.isEmpty else {
            syncState(statusOverride: "No fish data loaded.", emitHaptic: false, emitHarvest: false)
            return false
        }

        let rarityBonus = max(1.0, currentPondUpgrade.rarityBonus)
        var totalWeight = 0.0
        for fish in fishPlans {
            let adjusted = fish.rarity <= 0.1 ? fish.rarity * rarityBonus : fish.rarity
            totalWeight += max(0.0001, adjusted)
        }

        var cursor = Double.random(in: 0...1) * totalWeight
        var chosen = fishPlans[0]
        for fish in fishPlans {
            let adjusted = fish.rarity <= 0.1 ? fish.rarity * rarityBonus : fish.rarity
            cursor -= max(0.0001, adjusted)
            if cursor <= 0 {
                chosen = fish
                break
            }
        }

        let value = max(1, Int((Double(chosen.baseValue) * sellBonusMultiplier).rounded(.down)))
        engine.addCoins(value)
        engine.addXP(max(4, chosen.difficulty * 4))
        engine.addFishCaught(for: chosen.id, quantity: 1)

        // Track first fish milestone
        if milestoneManager.checkMilestone(.firstFish) {
            _ = milestoneManager.completeMilestone(.firstFish)
        }

        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "Caught \(chosen.name) for \(value) coins.", emitHaptic: true, emitHarvest: true)
        return true
    }

    func challengeProgress(for challenge: ChallengePlan) -> Int {
        switch challenge.metric {
        case "total_crops_inventory":
            return cachedCropInventoryCount
        case "active_plots":
            return plantedTileCount
        case "built_structures":
            return cachedBuiltStructureCount
        case "livestock_count":
            return cachedLivestockCount
        case "coin_balance":
            return save.player.coins
        case "total_fish_caught":
            return totalFishCaught
        case "seed_inventory":
            return cachedSeedInventoryCount
        case "player_level":
            return playerLevel
        case "pet_count":
            return save.meta.petLevels.values.filter { $0 > 0 }.count
        case "challenge_streak":
            return challengeStreak
        case "research_completed":
            return save.meta.completedResearch.values.filter { $0 }.count
        default:
            return 0
        }
    }

    func isChallengeClaimedToday(_ challengeID: String) -> Bool {
        (save.meta.challengeClaims[challengeID] ?? -1) == save.world.day
    }

    func canClaimChallenge(_ challenge: ChallengePlan) -> Bool {
        guard !isChallengeClaimedToday(challenge.id) else { return false }
        return challengeProgress(for: challenge) >= challenge.target
    }

    @discardableResult
    func claimChallenge(_ challengeID: String) -> Bool {
        guard let challenge = challengePlansByID[challengeID] else { return false }
        guard canClaimChallenge(challenge) else {
            syncState(statusOverride: "Challenge requirements not met.", emitHaptic: false, emitHarvest: false)
            return false
        }

        let currentDay = save.world.day
        let allClaimedBefore = challengePlans.allSatisfy { (save.meta.challengeClaims[$0.id] ?? -1) == currentDay }
        engine.setChallengeClaimDay(currentDay, for: challenge.id)
        engine.addCoins(challenge.rewardCoins)
        engine.addXP(challenge.rewardXP)
        let allClaimedAfter = challengePlans.allSatisfy { (engine.save.meta.challengeClaims[$0.id] ?? -1) == currentDay }
        if !allClaimedBefore && allClaimedAfter {
            engine.setChallengeStreak(engine.challengeStreak + 1)
        }

        syncState(statusOverride: "Challenge complete: \(challenge.name).", emitHaptic: true, emitHarvest: false)
        SoundManager.shared.play(.success)
        return true
    }

    var dailyTasks: [DailyTaskModel] {
        guard !cropDefs.isEmpty else { return [] }
        let day = save.world.day
        let chosenCrop = cropDefs[dailyTaskCropIndex(for: day)]
        let coinTarget = 120 + ((day % 5) * 20)
        let readyTarget = 2 + (day % 3)
        let cropTarget = 3 + (day % 4)

        return [
            DailyTaskModel(
                id: "coins_\(day)",
                title: "Cash Flow",
                detail: "Reach \(coinTarget) coins in your wallet.",
                metric: .coins,
                target: coinTarget,
                cropID: nil,
                rewardCoins: 20 + (day % 4) * 6,
                rewardXP: 12 + (day % 3) * 4
            ),
            DailyTaskModel(
                id: "ready_tiles_\(day)",
                title: "Morning Harvest",
                detail: "Have \(readyTarget) crops ready at once.",
                metric: .readyTiles,
                target: readyTarget,
                cropID: nil,
                rewardCoins: 24 + (day % 3) * 7,
                rewardXP: 14 + (day % 2) * 5
            ),
            DailyTaskModel(
                id: "crop_stock_\(chosenCrop.id)_\(day)",
                title: "Stock \(chosenCrop.name)",
                detail: "Store \(cropTarget)x \(chosenCrop.name) in inventory.",
                metric: .cropInventory,
                target: cropTarget,
                cropID: chosenCrop.id,
                rewardCoins: 26 + (day % 4) * 8,
                rewardXP: 16 + (day % 3) * 5
            ),
        ]
    }

    func dailyTaskProgress(_ task: DailyTaskModel) -> Int {
        switch task.metric {
        case .coins:
            return save.player.coins
        case .cropInventory:
            return cropCount(for: task.cropID ?? "")
        case .readyTiles:
            return readyTileCount
        case .plantedTiles:
            return plantedTileCount
        }
    }

    func isDailyTaskClaimedToday(_ task: DailyTaskModel) -> Bool {
        let key = "daily_task:\(task.id)"
        return (save.meta.challengeClaims[key] ?? -1) == save.world.day
    }

    func canClaimDailyTask(_ task: DailyTaskModel) -> Bool {
        guard !isDailyTaskClaimedToday(task) else { return false }
        return dailyTaskProgress(task) >= task.target
    }

    @discardableResult
    func claimDailyTask(_ task: DailyTaskModel) -> Bool {
        guard canClaimDailyTask(task) else {
            syncState(statusOverride: "Task requirements not met yet.", emitHaptic: false, emitHarvest: false)
            return false
        }
        let key = "daily_task:\(task.id)"
        engine.setChallengeClaimDay(save.world.day, for: key)
        engine.addCoins(task.rewardCoins)
        engine.addXP(task.rewardXP)
        SoundManager.shared.play(.success, haptic: .medium)
        syncState(statusOverride: "Task complete: \(task.title).", emitHaptic: true, emitHarvest: false)
        return true
    }

    var dailySpecialSeedIDs: Set<String> {
        let day = save.world.day
        let daySeed = save.daySeed
        if cachedDailySpecialDay == day && cachedDailySpecialSeed == daySeed {
            return cachedDailySpecials
        }
        let ranked = cropDefs.map { crop in
            (
                crop.id,
                stableHash("\(crop.id)#\(day)#\(daySeed)")
            )
        }
        .sorted { lhs, rhs in
            if lhs.1 == rhs.1 { return lhs.0 < rhs.0 }
            return lhs.1 < rhs.1
        }
        let count = min(2, ranked.count)
        let featuredIDs = ranked.prefix(count).map(\.0)
        let specials = Set(featuredIDs)
        let featuredNames = featuredIDs.compactMap { engine.cropDefsByID[$0]?.name }
        cachedDailySpecialDay = day
        cachedDailySpecialSeed = daySeed
        cachedDailySpecials = specials
        cachedDailySpecialSummary = featuredNames.isEmpty ? "No deals today." : featuredNames.joined(separator: ", ")
        return specials
    }

    func isDailySpecialSeed(_ cropID: String) -> Bool {
        dailySpecialSeedIDs.contains(cropID)
    }

    var dailySpecialSummary: String {
        _ = dailySpecialSeedIDs
        return cachedDailySpecialSummary
    }

    var canPurchaseExpansion: Bool {
        guard save.world.gridWidth < expansionPlan.maxGrid else { return false }
        guard let cost = expansionPlan.costsByGridSize[save.world.gridWidth] else { return false }
        return save.player.coins >= cost
    }

    var nextExpansionCost: Int? {
        expansionPlan.costsByGridSize[save.world.gridWidth]
    }

    @discardableResult
    func purchaseExpansion() -> Bool {
        let current = save.world.gridWidth
        guard current < expansionPlan.maxGrid else {
            syncState(statusOverride: "Farm is already at max size.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard let cost = nextExpansionCost else {
            syncState(statusOverride: "No expansion upgrade available right now.", emitHaptic: false, emitHarvest: false)
            return false
        }
        guard engine.spendCoins(cost) else {
            syncState(statusOverride: "Not enough coins to expand farm.", emitHaptic: false, emitHarvest: false)
            return false
        }

        let next = min(expansionPlan.maxGrid, current + 1)
        engine.resizeGrid(width: next, height: next)
        engine.incrementExpansionPurchases()

        // Track first expansion milestone
        if milestoneManager.checkMilestone(.firstExpansion) {
            _ = milestoneManager.completeMilestone(.firstExpansion)
        }

        SoundManager.shared.play(.levelUp, haptic: .heavy)
        syncState(statusOverride: "Farm expanded to \(next)x\(next).", emitHaptic: true, emitHarvest: false)
        return true
    }

    func seedCount(for cropID: String) -> Int {
        save.player.inventory.seeds[cropID] ?? 0
    }

    func isHybridDiscovered(_ recipeID: String) -> Bool {
        save.meta.discoveredHybrids[recipeID] ?? false
    }

    func cropCount(for cropID: String) -> Int {
        save.player.inventory.crops[cropID] ?? 0
    }

    var favoriteItemIDs: Set<String> {
        Set(save.meta.favoriteItems.compactMap { $0.value ? $0.key : nil })
    }

    func isFavorite(itemID: String) -> Bool {
        save.meta.favoriteItems[itemID] ?? false
    }

    func setFavorite(itemID: String, isFavorite: Bool) {
        engine.setFavoriteItem(isFavorite, for: itemID)
        save = engine.save
        schedulePersist()
    }

    func cropName(for cropID: String) -> String {
        if let name = engine.cropDefsByID[cropID]?.name {
            return name
        }
        return Self.displayName(forIdentifier: cropID)
    }

    func emoji(for cropID: String) -> String {
        cropDisplay[cropID]?.emoji ?? "🌱"
    }

    var estimatedLivestockIncome: Int {
        livestockPlans.reduce(0) { total, plan in
            let count = livestockCount(for: plan.id)
            guard count > 0 else { return total }
            let gross = count * max(1, plan.productAmount) * max(0, plan.productValue)
            let maintenance = count * max(0, plan.maintenanceCost)
            return total + max(0, gross - maintenance)
        }
    }

    var secondsUntilNextCropReady: TimeInterval? {
        let secondsPerDay = Double(timeEngine.config.secondsPerDay)
        var minSeconds: TimeInterval = .infinity
        for (i, tile) in save.world.tiles.enumerated() {
            guard let planted = tile.planted,
                  let def = engine.cropDefsByID[planted.cropID] else { continue }
            if i < renderSnapshot.tiles.count && renderSnapshot.tiles[i].isReady {
                return 0
            }
            let remaining = Double(max(1, def.daysToGrow)) - planted.growthProgress
            guard remaining > 0 else { return 0 }
            let adjustedDays = remaining / max(0.01, growthMultiplier)
            minSeconds = min(minSeconds, adjustedDays * secondsPerDay)
        }
        return minSeconds.isFinite ? minSeconds : nil
    }

    func dailySellMultiplier(for cropID: String) -> Double {
        dailySellMultiplierForDay(cropID: cropID, day: save.world.day)
    }

    func sellPriceTrend(for cropID: String) -> Double {
        let today = dailySellMultiplierForDay(cropID: cropID, day: save.world.day)
        let yesterday = dailySellMultiplierForDay(cropID: cropID, day: max(0, save.world.day - 1))
        return today / max(0.001, yesterday)
    }

    /// Last 7 days of sell prices (oldest → newest) for sparkline display.
    func sellPriceHistory(for cropID: String) -> [Int] {
        guard let def = engine.cropDefsByID[cropID] else { return [] }
        let currentDay = save.world.day
        return (0..<7).map { offset in
            let day = max(0, currentDay - (6 - offset))
            let multiplier = dailySellMultiplierForDay(cropID: cropID, day: day)
            return max(1, Int((Double(def.sellPrice) * sellBonusMultiplier * multiplier).rounded(.down)))
        }
    }

    func growthProgress(tileIndex: Int) -> Double {
        guard save.world.tiles.indices.contains(tileIndex),
              let planted = save.world.tiles[tileIndex].planted,
              let def = engine.cropDefsByID[planted.cropID] else { return 0 }
        return min(1.0, planted.growthProgress / Double(max(1, def.daysToGrow)))
    }

    // MARK: - Celebration Management

    func dismissNextCelebration() {
        milestoneManager.dismissNextCelebration()
    }

    func dismissCelebration(id: UUID) {
        milestoneManager.dismissCelebration(id: id)
    }

    func dismissAllCelebrations() {
        milestoneManager.clearAllCelebrations()
    }

    func hasMilestone(_ type: MilestoneType) -> Bool {
        milestoneManager.milestoneState.completedMilestones.contains(type.rawValue)
    }

    // MARK: - Progress Info

    func xpProgressToNextLevel() -> Double {
        ProgressionSystem.progressToNextLevel(currentXP: save.player.xp)
    }

    func xpNeededForNextLevel() -> Int {
        ProgressionSystem.xpToNextLevel(currentXP: save.player.xp)
    }

    func persistNow() {
        pendingSaveTask?.cancel()
        pendingSaveTask = nil

        engine.setTimeState(timeEngine.state)
        save.meta.time = timeEngine.state

        let saveInterval = PerfTelemetry.begin("save_write")
        let saveStart = ContinuousClock.now
        do {
            try saveStore.save(engine.save)
            lastSaveDurationMs = PerfTelemetry.elapsedMs(since: saveStart)
        } catch {
            lastSaveDurationMs = PerfTelemetry.elapsedMs(since: saveStart)
            statusText = "Save failed: \(error.localizedDescription)"
        }
        PerfTelemetry.end("save_write", saveInterval)

        // Save milestone data to UserDefaults
        if let milestoneData = milestoneManager.encodedState {
            userDefaults.set(milestoneData, forKey: Self.milestoneStateKey)
        }
        if let dailyLoginData = milestoneManager.encodedDailyLogin {
            userDefaults.set(dailyLoginData, forKey: Self.dailyLoginKey)
        }
        if let claimedLevelsData = milestoneManager.encodedClaimedLevels {
            userDefaults.set(claimedLevelsData, forKey: Self.claimedLevelsKey)
        }
    }

    private func schedulePersist() {
        pendingSaveTask?.cancel()
        pendingSaveTask = Task { @MainActor [weak self] in
            guard let self else { return }
            try? await Task.sleep(nanoseconds: Self.saveDebounceNanoseconds)
            if Task.isCancelled { return }
            self.persistNow()
        }
    }

    func completeOnboarding() {
        onboardingRequired = false
        userDefaults.set(true, forKey: Self.onboardingKey)
    }

    func resetSave() {
        pendingSaveTask?.cancel()
        pendingSaveTask = nil

        let starterSeeds = Dictionary(uniqueKeysWithValues: cropDefs.prefix(4).map { ($0.id, 4) })
        let fresh = GameCoreEngine.defaultSave(
            gridWidth: 4,
            gridHeight: 4,
            starterSeeds: starterSeeds,
            daySeed: 20260212
        )

        resetPersistentProgress()

        var resetTimeState = fresh.meta.time
        resetTimeState.dayIndex = fresh.world.day
        resetTimeState.lastRealWorldTimestamp = Date().timeIntervalSince1970
        timeEngine = TimeEngine(config: Self.defaultTimeConfig, state: resetTimeState)
        engine = GameCoreEngine(save: fresh, cropDefs: cropDefs, seed: fresh.daySeed)
        engine.setTimeState(timeEngine.state)
        save = engine.save
        renderSnapshot = Self.makeSnapshot(save: engine.save, cropDefsByID: engine.cropDefsByID)
        selectedSeedID = cropDefs.first?.id ?? selectedSeedID
        lastPlayerLevel = ProgressionSystem.level(forXP: fresh.player.xp)
        syncState(statusOverride: "Save reset.", emitHaptic: false, emitHarvest: false)
        refreshHUDTime(force: true, now: Date().timeIntervalSince1970)
    }

    func setHapticsEnabled(_ enabled: Bool) {
        settings.hapticsEnabled = enabled
        SoundManager.shared.updateSettings(sound: settings.soundEnabled, haptics: enabled)
        persistSettings()
    }

    func setSoundEnabled(_ enabled: Bool) {
        settings.soundEnabled = enabled
        SoundManager.shared.updateSettings(sound: enabled, haptics: settings.hapticsEnabled)
        persistSettings()
    }

    func setReducedMotion(_ enabled: Bool) {
        settings.reducedMotion = enabled
        persistSettings()
    }

    func setVoiceOverHints(_ enabled: Bool) {
        settings.voiceOverHints = enabled
        persistSettings()
    }

    func setCropsReadyNotifications(_ enabled: Bool) {
        settings.cropsReadyNotifications = enabled
        persistSettings()
    }

    func setFarmName(_ value: String) {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        settings.farmName = trimmed.isEmpty ? "Willowbrook Farm" : String(trimmed.prefix(32))
        persistSettings()
    }

    func setPalette(_ palette: FarmPalette) {
        settings.palette = palette
        persistSettings()
    }

    func setShowTileCoordinates(_ enabled: Bool) {
        settings.showTileCoordinates = enabled
        persistSettings()
    }

    func setParticleEffects(_ enabled: Bool) {
        settings.particleEffects = enabled
        persistSettings()
    }

    func setTargetFPS(_ fps: Int) {
        settings.targetFPS = GameUserSettings.clampFPS(fps)
        persistSettings()
    }

    private var buildingYieldMultiplier: Double {
        let barn = levelMultiplier(level: buildingLevel(for: "barn"), values: [1.2, 1.35, 1.55, 1.8, 2.2])
        let well = levelMultiplier(level: buildingLevel(for: "well"), values: [1.0, 1.0, 1.05, 1.1])
        let workshop = levelMultiplier(level: buildingLevel(for: "workshop"), values: [1.0, 1.1, 1.25])
        var multiplier = barn * well * workshop

        let hasFullFarm = buildingLevel(for: "well") > 0 && buildingLevel(for: "greenhouse") > 0 && buildingLevel(for: "barn") > 0
        if hasFullFarm {
            multiplier *= 1.2
        }

        return min(8.0, max(1.0, multiplier))
    }

    private var buildingGrowthMultiplier: Double {
        let greenhouse = levelMultiplier(level: buildingLevel(for: "greenhouse"), values: [1.3, 1.5, 1.75, 2.1, 2.5])
        var multiplier = greenhouse
        
        let hasHydroGarden = buildingLevel(for: "well") > 0 && buildingLevel(for: "greenhouse") > 0
        if hasHydroGarden {
            multiplier *= 1.15
        }
        
        return min(5.0, max(1.0, multiplier))
    }

    var growthMultiplier: Double {
        buildingGrowthMultiplier * researchGrowthMultiplier
    }

    private var researchGrowthMultiplier: Double {
        var multiplier = 1.0
        if isResearchCompleted("climate_control") {
            multiplier *= 1.15
        }
        return multiplier
    }

    private var researchYieldMultiplier: Double {
        var multiplier = 1.0
        if isResearchCompleted("hybrid_crops") {
            multiplier *= 1.05
        }
        if isResearchCompleted("soil_enhancement") {
            multiplier *= 1.15
        }
        if isResearchCompleted("pest_genetics") {
            multiplier *= 1.1
        }
        if isResearchCompleted("automation_core") {
            multiplier *= 1.1
        }
        if isResearchCompleted("climate_control") {
            multiplier *= 1.1
        }
        return min(4.0, max(1.0, multiplier))
    }

    var maxInventoryCapacity: Int {
        let base = 50
        let silo = buildingLevel(for: "silo")
        let bonuses = [0, 50, 150, 400, 1000]
        let index = max(0, min(bonuses.count - 1, silo))
        return base + bonuses[index]
    }

    var isInventoryFull: Bool {
        cachedCropInventoryCount >= maxInventoryCapacity
    }

    private func autoSellCrops() {
        guard buildingLevel(for: "silo") >= 2 else { return }
        var soldAnything = false
        let currentSellMultiplier = sellBonusMultiplier
        let cropDefsByID = engine.cropDefsByID
        // Auto-sell 10% of stock every day without emitting per-item sync/haptics.
        for (cropID, count) in engine.save.player.inventory.crops {
            guard count > 0 else { continue }
            let toSell = max(1, Int(Double(count) * 0.1))
            guard let def = cropDefsByID[cropID] else { continue }
            let unitPrice = max(1, Int((Double(def.sellPrice) * currentSellMultiplier).rounded(.down)))
            let result = engine.sell(
                itemID: cropID,
                quantity: min(count, toSell),
                pricing: MarketPricing(cropUnitPrices: [cropID: unitPrice])
            )
            soldAnything = soldAnything || result.success
        }
        if soldAnything {
            save = engine.save
        }
    }

    private var buildingSellMultiplier: Double {
        let siloLevel = buildingLevel(for: "silo")
        let siloMultiplier: Double
        switch siloLevel {
        case 4...:
            siloMultiplier = 1.25
        case 3:
            siloMultiplier = 1.1
        default:
            siloMultiplier = 1.0
        }

        let windmill = levelMultiplier(level: buildingLevel(for: "windmill"), values: [2.0, 2.5, 3.0, 4.0, 6.0])
        var multiplier = siloMultiplier * windmill

        let hasSupplyChain = buildingLevel(for: "barn") > 0 && siloLevel > 0
        if hasSupplyChain {
            multiplier *= 1.1
        }

        return min(12.0, max(1.0, multiplier))
    }

    private var researchSellMultiplier: Double {
        var multiplier = 1.0
        if isResearchCompleted("market_analytics") {
            multiplier *= 1.2
        }
        return multiplier
    }

    private var petYieldMultiplier: Double {
        let total = petPlans.reduce(1.0) { partial, pet in
            let level = max(0, petLevel(for: pet.id))
            guard level > 0 else { return partial }
            return partial * (1.0 + (pet.bonusPerLevel * Double(level)))
        }
        return min(2.0, max(1.0, total))
    }

    private var petSellMultiplier: Double {
        let catLevel = max(0, petLevel(for: "cat"))
        guard catLevel > 0 else { return 1.0 }
        return min(1.4, 1.0 + (0.02 * Double(catLevel)))
    }

    private func discountedSeedCost(for baseCost: Int, cropID: String? = nil) -> Int {
        var discount = 1.0
        switch buildingLevel(for: "workshop") {
        case 3...:
            discount *= 0.75
        case 2:
            discount *= 0.9
        default:
            break
        }

        if isResearchCompleted("irrigation_system") {
            discount *= 0.95
        }
        if isResearchCompleted("automation_core") {
            discount *= 0.9
        }
        if isResearchCompleted("climate_control") {
            discount *= 0.95
        }

        if let cropID, dailySpecialSeedIDs.contains(cropID) {
            discount *= 0.8
        }

        return max(1, Int((Double(baseCost) * discount).rounded(.down)))
    }

    private func dailySellMultiplierForDay(cropID: String, day: Int) -> Double {
        let seed = save.daySeed
        let hash = stableHash("\(cropID)#sell#\(day)#\(seed)")
        let normalized = Double(hash % 1000) / 1000.0
        return 0.80 + normalized * 0.40 // 0.80x … 1.20x
    }

    private func stableHash(_ input: String) -> UInt64 {
        var hash: UInt64 = 1469598103934665603
        for byte in input.utf8 {
            hash ^= UInt64(byte)
            hash = hash &* 1099511628211
        }
        return hash
    }

    private func dailyTaskCropIndex(for day: Int) -> Int {
        guard !cropDefs.isEmpty else { return 0 }
        let value = stableHash("daily-task-crop-\(day)-\(save.daySeed)")
        return Int(value % UInt64(cropDefs.count))
    }

    private func levelMultiplier(level: Int, values: [Double]) -> Double {
        guard level > 0 else { return 1.0 }
        let index = min(level - 1, values.count - 1)
        guard values.indices.contains(index) else { return 1.0 }
        return max(1.0, values[index])
    }

    private static func displayName(forIdentifier identifier: String) -> String {
        guard !identifier.isEmpty else { return "Unknown" }
        var output: [Character] = []
        for char in identifier {
            if char == "_" || char == "-" {
                output.append(" ")
                continue
            }
            if char.isUppercase, let previous = output.last, previous != " " {
                output.append(" ")
            }
            output.append(char)
        }
        return String(output)
            .split(separator: " ")
            .map { $0.capitalized }
            .joined(separator: " ")
    }



    private func refreshHUDTime(force: Bool, now: TimeInterval) {
        if !force && (now - lastHUDPublishTimestamp) < Self.hudPublishIntervalSeconds {
            return
        }
        lastHUDPublishTimestamp = now

        let secondsPerDay = max(60, timeEngine.config.secondsPerDay)
        let clampedSeconds = max(0, min(secondsPerDay, timeEngine.secondsIntoDay))
        let hourFraction = clampedSeconds / secondsPerDay * 24
        let hour24 = Int(hourFraction) % 24
        let minute = Int((hourFraction - floor(hourFraction)) * 60)

        let hour12Raw = hour24 % 12
        let hour12 = hour12Raw == 0 ? 12 : hour12Raw
        let suffix = hour24 < 12 ? "AM" : "PM"

        hudTimeText = "\(hour12):\(String(format: "%02d", minute)) \(suffix)"
        hudTimeProgress = max(0, min(1, timeEngine.dayProgress))
        hudClockSymbol = Self.clockSymbol(forHour24: hour24)
        hudSeasonText = Self.seasonName(forDay: engine.save.world.day)
    }

    private static func seasonName(forDay day: Int) -> String {
        let seasons = ["Spring", "Summer", "Autumn", "Winter"]
        let index = ((max(0, day) / 7) % seasons.count)
        return seasons[index]
    }

    private static func clockSymbol(forHour24 hour: Int) -> String {
        switch hour {
        case 5..<8:
            return "sunrise.fill"
        case 8..<18:
            return "sun.max.fill"
        case 18..<21:
            return "sunset.fill"
        default:
            return "moon.stars.fill"
        }
    }

    private func syncState(statusOverride: String?, emitHaptic: Bool, emitHarvest: Bool) {
        let upgradeMessage = applyProgressionUnlocksIfNeeded()

        engine.setTimeState(timeEngine.state)
        save = engine.save
        recomputeDerivedStateCaches()
        renderSnapshot = Self.makeSnapshot(save: engine.save, cropDefsByID: engine.cropDefsByID)

        // Check for level up
        let currentLevel = playerLevel
        if currentLevel > lastPlayerLevel {
            _ = milestoneManager.createLevelUpEvent(level: currentLevel)

            // Check level milestones
            let _ = milestoneManager.checkLevelMilestones(level: currentLevel)

            // Check for unclaimed level milestone rewards
            let unclaimed = milestoneManager.unclaimedLevelMilestones(currentLevel: currentLevel)
            for milestone in unclaimed {
                engine.addCoins(milestone.rewardCoins)
                engine.addXP(milestone.rewardXP)
                for (cropID, count) in milestone.rewardSeeds {
                    engine.grantSeeds(cropID: cropID, quantity: count)
                }
                _ = milestoneManager.claimLevelMilestone(milestone)
            }

            lastPlayerLevel = currentLevel
            SoundManager.shared.play(.levelUp, haptic: .heavy)
        }

        if let statusOverride {
            if let upgradeMessage {
                statusText = "\(statusOverride) \(upgradeMessage)"
            } else {
                statusText = statusOverride
            }
        } else if let upgradeMessage {
            statusText = upgradeMessage
        }

        schedulePersist()

        if settings.hapticsEnabled, emitHaptic {
            hapticToken += 1
        }
        if settings.hapticsEnabled, emitHarvest {
            harvestToken += 1
        }
    }

    private func recomputeDerivedStateCaches() {
        var planted = 0
        var ready = 0
        let defsByID = engine.cropDefsByID

        for tile in save.world.tiles {
            guard let plantedCrop = tile.planted else { continue }
            planted += 1
            if let def = defsByID[plantedCrop.cropID],
               plantedCrop.growthProgress >= Double(def.daysToGrow) {
                ready += 1
            }
        }

        cachedPlantedTileCount = planted
        cachedReadyTileCount = ready
        cachedSeedInventoryCount = save.player.inventory.seeds.values.reduce(0, +)
        cachedCropInventoryCount = save.player.inventory.crops.values.reduce(0, +)
        cachedBuiltStructureCount = buildingCatalog.reduce(0) { partial, plan in
            partial + ((save.meta.buildingLevels[plan.id] ?? 0) > 0 ? 1 : 0)
        }
        cachedLivestockCount = livestockCatalog.reduce(0) { partial, plan in
            partial + max(0, save.meta.livestockCounts[plan.id] ?? 0)
        }
        cachedUsedLivestockCapacity = livestockCatalog.reduce(0) { partial, plan in
            partial + (max(0, save.meta.livestockCounts[plan.id] ?? 0) * max(1, plan.spaceRequired))
        }
        cachedTotalFishCaught = save.meta.fishCaughtCounts.values.reduce(0, +)
    }

    @discardableResult
    private func applyProgressionUnlocksIfNeeded() -> String? {
        let unlockedGrid = ProgressionSystem.unlockedGrid(forLevel: playerLevel)
        if unlockedGrid > engine.save.world.gridWidth {
            engine.resizeGrid(width: unlockedGrid, height: unlockedGrid)
            return "Grid expanded to \(unlockedGrid)x\(unlockedGrid)."
        }
        return nil
    }

    private func persistSettings() {
        if let encoded = try? JSONEncoder().encode(settings) {
            userDefaults.set(encoded, forKey: Self.settingsKey)
        }
    }

    private func resetPersistentProgress() {
        let encoder = JSONEncoder()
        milestoneManager.clearAllCelebrations()
        milestoneManager.loadMilestoneState(from: try? encoder.encode(MilestoneState()))
        milestoneManager.loadDailyLogin(from: try? encoder.encode(DailyLoginState()))
        milestoneManager.loadClaimedLevels(from: try? encoder.encode([Int]()))

        userDefaults.removeObject(forKey: Self.milestoneStateKey)
        userDefaults.removeObject(forKey: Self.dailyLoginKey)
        userDefaults.removeObject(forKey: Self.claimedLevelsKey)
        userDefaults.removeObject(forKey: Self.onboardingKey)
        onboardingRequired = true
    }

    private static func loadSettings(defaults: UserDefaults) -> GameUserSettings {
        guard let data = defaults.data(forKey: Self.settingsKey),
              let decoded = try? JSONDecoder().decode(GameUserSettings.self, from: data) else {
            return GameUserSettings()
        }
        return decoded
    }

    private static func loadContent() -> (
        cropDefs: [CropDef],
        cropDisplay: [String: CropDisplayInfo],
        decorDefs: [DecorDef],
        festivalDefs: [FestivalDef],
        minigameDefs: [MinigameDef],
        almanacEntries: [AlmanacEntry],
        strings: [String: String],
        buildingPlans: [BuildingPlan],
        buildingSynergies: [BuildingSynergy],
        researchPlans: [ResearchPlan],
        geneticsRecipes: [GeneticsRecipe],
        livestockPlans: [LivestockTypePlan],
        petPlans: [PetTypePlan],
        fishPlans: [FishTypePlan],
        pondUpgrades: [PondUpgradePlan],
        challengePlans: [ChallengePlan],
        contentErrorMessage: String?
    ) {
        do {
            let content = try ContentRepository.loadFromBundle()
            return (
                cropDefs: content.cropDefs,
                cropDisplay: content.cropDisplay,
                decorDefs: content.decorDefs,
                festivalDefs: content.festivalDefs,
                minigameDefs: content.minigameDefs,
                almanacEntries: content.almanacEntries,
                strings: content.strings,
                buildingPlans: content.buildingPlans,
                buildingSynergies: content.buildingSynergies,
                researchPlans: content.researchPlans,
                geneticsRecipes: content.geneticsRecipes,
                livestockPlans: content.livestockPlans,
                petPlans: content.petPlans,
                fishPlans: content.fishPlans,
                pondUpgrades: content.pondUpgrades,
                challengePlans: content.challengePlans,
                contentErrorMessage: nil
            )
        } catch {
            let message = "Content load failed: \(error.localizedDescription)"
            if _isDebugAssertConfiguration() {
                assertionFailure(message)
            }

            let fallback = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 12, sellPrice: 24)
            return (
                cropDefs: [fallback],
                cropDisplay: [
                    fallback.id: CropDisplayInfo(
                        emoji: "🥕",
                        description: "Fallback content",
                        category: "vegetable",
                        season: "spring",
                        level: 1
                    )
                ],
                decorDefs: [],
                festivalDefs: [],
                minigameDefs: [],
                almanacEntries: [],
                strings: [:],
                buildingPlans: [],
                buildingSynergies: [],
                researchPlans: [],
                geneticsRecipes: [],
                livestockPlans: [],
                petPlans: [],
                fishPlans: [],
                pondUpgrades: [],
                challengePlans: [],
                contentErrorMessage: message
            )
        }
    }

    private static func makeSnapshot(save: SaveGame, cropDefsByID: [String: CropDef]) -> FarmRenderSnapshot {
        let tiles = save.world.tiles.map { tile -> FarmRenderTile in
            let progress: Double
            let isReady: Bool

            if let planted = tile.planted,
               let def = cropDefsByID[planted.cropID] {
                let growth = max(0, planted.growthProgress)
                let needed = Double(max(1, def.daysToGrow))
                progress = min(1.0, growth / needed)
                isReady = growth >= needed
            } else {
                progress = 0
                isReady = false
            }

            return FarmRenderTile(
                index: tile.index,
                cropID: tile.planted?.cropID,
                plantedDay: tile.planted?.plantedDay,
                isReady: isReady,
                progress: progress,
                watered: tile.state.watered
            )
        }

        return FarmRenderSnapshot(
            day: save.world.day,
            gridWidth: save.world.gridWidth,
            gridHeight: save.world.gridHeight,
            tiles: tiles
        )
    }
}
