import Foundation

public struct CropDef: Codable, Hashable, Sendable, Identifiable {
    public let id: String
    public let name: String
    public let daysToGrow: Int
    public let seedCost: Int
    public let sellPrice: Int

    public init(id: String, name: String, daysToGrow: Int, seedCost: Int, sellPrice: Int) {
        self.id = id
        self.name = name
        self.daysToGrow = max(1, daysToGrow)
        self.seedCost = max(0, seedCost)
        self.sellPrice = max(0, sellPrice)
    }
}

public struct DecorDef: Codable, Hashable, Sendable, Identifiable {
    public let id: String
    public let name: String
    public let cost: Int
    public let category: String
    public let seasonTags: [String]
    public let icon: String
    public let details: String

    public init(
        id: String,
        name: String,
        cost: Int,
        category: String,
        seasonTags: [String],
        icon: String = "🧺",
        details: String = ""
    ) {
        self.id = id
        self.name = name
        self.cost = max(0, cost)
        self.category = category
        self.seasonTags = seasonTags
        self.icon = icon
        self.details = details
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case name
        case cost
        case category
        case seasonTags
        case icon
        case details
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        cost = max(0, try container.decode(Int.self, forKey: .cost))
        category = try container.decodeIfPresent(String.self, forKey: .category) ?? "misc"
        seasonTags = try container.decodeIfPresent([String].self, forKey: .seasonTags) ?? []
        icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? "🧺"
        details = try container.decodeIfPresent(String.self, forKey: .details) ?? ""
    }
}

public struct FestivalDef: Codable, Hashable, Sendable, Identifiable {
    public let id: String
    public let name: String
    public let season: String
    public let cadence: String
    public let durationSeconds: Int
    public let icon: String
    public let details: String

    public init(
        id: String,
        name: String,
        season: String,
        cadence: String,
        durationSeconds: Int,
        icon: String = "🎉",
        details: String = ""
    ) {
        self.id = id
        self.name = name
        self.season = season
        self.cadence = cadence
        self.durationSeconds = max(0, durationSeconds)
        self.icon = icon
        self.details = details
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case name
        case season
        case cadence
        case durationSeconds
        case icon
        case details
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        season = try container.decodeIfPresent(String.self, forKey: .season) ?? "all"
        cadence = try container.decodeIfPresent(String.self, forKey: .cadence) ?? "weekly"
        durationSeconds = max(0, try container.decodeIfPresent(Int.self, forKey: .durationSeconds) ?? 0)
        icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? "🎉"
        details = try container.decodeIfPresent(String.self, forKey: .details) ?? ""
    }
}

public struct MinigameDef: Codable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public let rounds: Int
    public let icon: String
    public let instructions: String

    public init(
        id: String,
        title: String,
        rounds: Int,
        icon: String = "🎯",
        instructions: String = ""
    ) {
        self.id = id
        self.title = title
        self.rounds = max(1, rounds)
        self.icon = icon
        self.instructions = instructions
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case title
        case rounds
        case icon
        case instructions
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        rounds = max(1, try container.decodeIfPresent(Int.self, forKey: .rounds) ?? 1)
        icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? "🎯"
        instructions = try container.decodeIfPresent(String.self, forKey: .instructions) ?? ""
    }
}

public struct PlantedCrop: Codable, Hashable, Sendable {
    public let cropID: String
    public let plantedDay: Int
    public var growthProgress: Double

    public init(cropID: String, plantedDay: Int, growthProgress: Double = 0.0) {
        self.cropID = cropID
        self.plantedDay = max(0, plantedDay)
        self.growthProgress = max(0, growthProgress)
    }

    private enum CodingKeys: String, CodingKey {
        case cropID, plantedDay, growthProgress
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        cropID = try container.decode(String.self, forKey: .cropID)
        plantedDay = try container.decode(Int.self, forKey: .plantedDay)
        growthProgress = try container.decodeIfPresent(Double.self, forKey: .growthProgress) ?? 0.0
    }
}

public struct TileState: Codable, Hashable, Sendable {
    public var tilled: Bool
    public var watered: Bool
    public var waterLevel: Int
    public var disease: Bool
    public var isReady: Bool
    
    public init(tilled: Bool = true, watered: Bool = false, waterLevel: Int = 0, disease: Bool = false, isReady: Bool = false) {
        self.tilled = tilled
        self.watered = watered
        self.waterLevel = max(0, min(100, waterLevel))
        self.disease = disease
        self.isReady = isReady
    }

    private enum CodingKeys: String, CodingKey {
        case tilled
        case watered
        case waterLevel
        case disease
        case isReady
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        tilled = try container.decodeIfPresent(Bool.self, forKey: .tilled) ?? true
        watered = try container.decodeIfPresent(Bool.self, forKey: .watered) ?? false
        waterLevel = max(0, min(100, try container.decodeIfPresent(Int.self, forKey: .waterLevel) ?? 0))
        disease = try container.decodeIfPresent(Bool.self, forKey: .disease) ?? false
        isReady = try container.decodeIfPresent(Bool.self, forKey: .isReady) ?? false
    }
}

public struct Tile: Codable, Hashable, Sendable {
    public let index: Int
    public var state: TileState
    public var planted: PlantedCrop?

    public init(index: Int, state: TileState = TileState(), planted: PlantedCrop? = nil) {
        self.index = index
        self.state = state
        self.planted = planted
    }

    private enum CodingKeys: String, CodingKey {
        case index
        case state
        case planted
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        index = try container.decode(Int.self, forKey: .index)
        state = try container.decodeIfPresent(TileState.self, forKey: .state) ?? TileState()
        planted = try container.decodeIfPresent(PlantedCrop.self, forKey: .planted)
    }
}

public struct Inventory: Codable, Hashable, Sendable {
    public var seeds: [String: Int]
    public var crops: [String: Int]

    public init(seeds: [String: Int] = [:], crops: [String: Int] = [:]) {
        self.seeds = seeds
        self.crops = crops
    }
}

public struct PlayerState: Codable, Hashable, Sendable {
    public var coins: Int
    public var xp: Int
    public var inventory: Inventory

    public init(coins: Int = 0, xp: Int = 0, inventory: Inventory = Inventory()) {
        self.coins = max(0, coins)
        self.xp = max(0, xp)
        self.inventory = inventory
    }
}

public struct WorldState: Codable, Hashable, Sendable {
    public var day: Int
    public var gridWidth: Int
    public var gridHeight: Int
    public var tiles: [Tile]

    public init(day: Int = 0, gridWidth: Int, gridHeight: Int, tiles: [Tile]) {
        self.day = max(0, day)
        self.gridWidth = max(1, gridWidth)
        self.gridHeight = max(1, gridHeight)
        self.tiles = tiles
    }

    public static func makeEmpty(day: Int = 0, gridWidth: Int, gridHeight: Int) -> WorldState {
        let total = max(1, gridWidth) * max(1, gridHeight)
        let tiles = (0..<total).map { Tile(index: $0) }
        return WorldState(day: day, gridWidth: gridWidth, gridHeight: gridHeight, tiles: tiles)
    }
}

public struct SaveGame: Codable, Hashable, Sendable {
    public var version: Int
    public var daySeed: UInt64
    public var player: PlayerState
    public var world: WorldState
    public var meta: MetaState

    public init(version: Int, daySeed: UInt64 = 1, player: PlayerState, world: WorldState, meta: MetaState = MetaState()) {
        self.version = version
        self.daySeed = daySeed
        self.player = player
        self.world = world
        self.meta = meta
    }

    private enum CodingKeys: String, CodingKey {
        case version
        case daySeed
        case player
        case world
        case meta
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        version = try container.decode(Int.self, forKey: .version)
        daySeed = try container.decodeIfPresent(UInt64.self, forKey: .daySeed) ?? 1
        player = try container.decode(PlayerState.self, forKey: .player)
        world = try container.decode(WorldState.self, forKey: .world)
        meta = try container.decodeIfPresent(MetaState.self, forKey: .meta) ?? MetaState()
    }
}

public typealias GameState = SaveGame

public struct TimeMetaState: Codable, Hashable, Sendable {
    public var currentTimeSeconds: Double
    public var dayIndex: Int
    public var lastRealWorldTimestamp: TimeInterval

    public init(
        currentTimeSeconds: Double = 0,
        dayIndex: Int = 0,
        lastRealWorldTimestamp: TimeInterval = 0
    ) {
        self.currentTimeSeconds = max(0, currentTimeSeconds)
        self.dayIndex = max(0, dayIndex)
        self.lastRealWorldTimestamp = max(0, lastRealWorldTimestamp)
    }

    private enum CodingKeys: String, CodingKey {
        case currentTimeSeconds
        case dayIndex
        case lastRealWorldTimestamp
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        currentTimeSeconds = max(0, try container.decodeIfPresent(Double.self, forKey: .currentTimeSeconds) ?? 0)
        dayIndex = max(0, try container.decodeIfPresent(Int.self, forKey: .dayIndex) ?? 0)
        lastRealWorldTimestamp = max(0, try container.decodeIfPresent(TimeInterval.self, forKey: .lastRealWorldTimestamp) ?? 0)
    }
}

public struct MetaState: Codable, Hashable, Sendable {
    public var buildingLevels: [String: Int]
    public var completedResearch: [String: Bool]
    public var discoveredHybrids: [String: Bool]
    public var expansionPurchases: Int
    public var livestockCounts: [String: Int]
    public var petLevels: [String: Int]
    public var fishCaughtCounts: [String: Int]
    public var fishingPondLevel: Int
    public var challengeClaims: [String: Int]
    public var challengeStreak: Int
    public var favoriteItems: [String: Bool]
    public var time: TimeMetaState
    public var foreman: ForemanSettings
    public var prestige: PrestigeState
    public var specialization: SpecializationState

    public init(
        buildingLevels: [String: Int] = [:],
        completedResearch: [String: Bool] = [:],
        discoveredHybrids: [String: Bool] = [:],
        expansionPurchases: Int = 0,
        livestockCounts: [String: Int] = [:],
        petLevels: [String: Int] = [:],
        fishCaughtCounts: [String: Int] = [:],
        fishingPondLevel: Int = 1,
        challengeClaims: [String: Int] = [:],
        challengeStreak: Int = 0,
        favoriteItems: [String: Bool] = [:],
        time: TimeMetaState = TimeMetaState(),
        foreman: ForemanSettings = ForemanSettings(),
        prestige: PrestigeState = PrestigeState(),
        specialization: SpecializationState = SpecializationState()
    ) {
        self.buildingLevels = buildingLevels
        self.completedResearch = completedResearch
        self.discoveredHybrids = discoveredHybrids
        self.expansionPurchases = max(0, expansionPurchases)
        self.livestockCounts = livestockCounts
        self.petLevels = petLevels
        self.fishCaughtCounts = fishCaughtCounts
        self.fishingPondLevel = max(1, fishingPondLevel)
        self.challengeClaims = challengeClaims
        self.challengeStreak = max(0, challengeStreak)
        self.favoriteItems = favoriteItems
        self.time = time
        self.foreman = foreman
        self.prestige = prestige
        self.specialization = specialization
    }

    private enum CodingKeys: String, CodingKey {
        case buildingLevels
        case completedResearch
        case discoveredHybrids
        case expansionPurchases
        case livestockCounts
        case petLevels
        case fishCaughtCounts
        case fishingPondLevel
        case challengeClaims
        case challengeStreak
        case favoriteItems
        case time
        case foreman
        case prestige
        case specialization
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        buildingLevels = try container.decodeIfPresent([String: Int].self, forKey: .buildingLevels) ?? [:]
        completedResearch = try container.decodeIfPresent([String: Bool].self, forKey: .completedResearch) ?? [:]
        discoveredHybrids = try container.decodeIfPresent([String: Bool].self, forKey: .discoveredHybrids) ?? [:]
        expansionPurchases = max(0, try container.decodeIfPresent(Int.self, forKey: .expansionPurchases) ?? 0)
        livestockCounts = try container.decodeIfPresent([String: Int].self, forKey: .livestockCounts) ?? [:]
        petLevels = try container.decodeIfPresent([String: Int].self, forKey: .petLevels) ?? [:]
        fishCaughtCounts = try container.decodeIfPresent([String: Int].self, forKey: .fishCaughtCounts) ?? [:]
        fishingPondLevel = max(1, try container.decodeIfPresent(Int.self, forKey: .fishingPondLevel) ?? 1)
        challengeClaims = try container.decodeIfPresent([String: Int].self, forKey: .challengeClaims) ?? [:]
        challengeStreak = max(0, try container.decodeIfPresent(Int.self, forKey: .challengeStreak) ?? 0)
        favoriteItems = try container.decodeIfPresent([String: Bool].self, forKey: .favoriteItems) ?? [:]
        time = try container.decodeIfPresent(TimeMetaState.self, forKey: .time) ?? TimeMetaState()
        foreman = try container.decodeIfPresent(ForemanSettings.self, forKey: .foreman) ?? ForemanSettings()
        prestige = try container.decodeIfPresent(PrestigeState.self, forKey: .prestige) ?? PrestigeState()
        specialization = try container.decodeIfPresent(SpecializationState.self, forKey: .specialization) ?? SpecializationState()
    }
}

// MARK: - Foreman Automation Settings
public enum ForemanAutoWaterMode: String, Codable, Sendable, CaseIterable {
    case off
    case smart
    case full
}

public enum ForemanAutoHarvestMode: String, Codable, Sendable, CaseIterable {
    case off
    case priority
    case batch
}

public enum ForemanAutoTreatMode: String, Codable, Sendable, CaseIterable {
    case off
    case critical
    case always
}

public struct ForemanSettings: Codable, Hashable, Sendable {
    public var autoWater: ForemanAutoWaterMode
    public var autoHarvest: ForemanAutoHarvestMode
    public var autoTreat: ForemanAutoTreatMode
    public var notify: Bool
    
    public init(
        autoWater: ForemanAutoWaterMode = .off,
        autoHarvest: ForemanAutoHarvestMode = .off,
        autoTreat: ForemanAutoTreatMode = .off,
        notify: Bool = true
    ) {
        self.autoWater = autoWater
        self.autoHarvest = autoHarvest
        self.autoTreat = autoTreat
        self.notify = notify
    }
    
    public static let `default` = ForemanSettings()
}

// MARK: - Prestige System
public struct PrestigeState: Codable, Hashable, Sendable {
    public var tier: Int
    public var totalEarnedLifetime: Int
    public var lastPrestigeDay: Int
    
    public init(tier: Int = 0, totalEarnedLifetime: Int = 0, lastPrestigeDay: Int = 0) {
        self.tier = max(0, tier)
        self.totalEarnedLifetime = max(0, totalEarnedLifetime)
        self.lastPrestigeDay = max(0, lastPrestigeDay)
    }
}

public struct PrestigeTier: Sendable {
    public let tier: Int
    public let required: Int
    public let name: String
    public let emoji: String
    public let bonus: Double
    
    public init(tier: Int, required: Int, name: String, emoji: String, bonus: Double) {
        self.tier = tier
        self.required = required
        self.name = name
        self.emoji = emoji
        self.bonus = bonus
    }
}

public let PRESTIGE_TIERS: [PrestigeTier] = [
    PrestigeTier(tier: 1, required: 10, name: "Farmhand", emoji: "🌱", bonus: 0.05),
    PrestigeTier(tier: 2, required: 25, name: "Farmer", emoji: "👨‍🌾", bonus: 0.10),
    PrestigeTier(tier: 3, required: 50, name: "Master Farmer", emoji: "🏅", bonus: 0.15),
    PrestigeTier(tier: 4, required: 100, name: "Farm Baron", emoji: "👑", bonus: 0.25),
    PrestigeTier(tier: 5, required: 200, name: "Agricultural Legend", emoji: "🌟", bonus: 0.40),
]

public func getPrestigeTier(for lifetimeEarnings: Int) -> Int {
    var tier = 0
    for (index, prestigeTier) in PRESTIGE_TIERS.enumerated() {
        if lifetimeEarnings >= prestigeTier.required {
            tier = index + 1
        }
    }
    return tier
}

public func getPrestigeMultiplier(for tier: Int) -> Double {
    guard tier > 0, tier <= PRESTIGE_TIERS.count else { return 1.0 }
    return 1.0 + PRESTIGE_TIERS[tier - 1].bonus
}

// MARK: - Specialization/Research System
public enum SpecializationPath: String, Codable, Sendable, CaseIterable, Identifiable {
    case crops
    case animals
    case processing
    case hybrids
    case commerce
    
    public var id: String { rawValue }
    
    public var name: String {
        switch self {
        case .crops: return "Crop Mastery"
        case .animals: return "Livestock Pro"
        case .processing: return "Artisan Crafts"
        case .hybrids: return "Genetics Lab"
        case .commerce: return "Trade Empire"
        }
    }
    
    public var emoji: String {
        switch self {
        case .crops: return "🌾"
        case .animals: return "🐄"
        case .processing: return "🧀"
        case .hybrids: return "🧬"
        case .commerce: return "💰"
        }
    }
}

public struct SpecializationState: Codable, Hashable, Sendable {
    public var selectedPath: SpecializationPath?
    public var unlockedResearch: [String: Bool]
    public var skillPoints: Int
    
    public init(selectedPath: SpecializationPath? = nil, unlockedResearch: [String: Bool] = [:], skillPoints: Int = 0) {
        self.selectedPath = selectedPath
        self.unlockedResearch = unlockedResearch
        self.skillPoints = max(0, skillPoints)
    }
}

public struct ResearchItem: Sendable, Identifiable {
    public let id: String
    public let name: String
    public let description: String
    public let cost: Int
    public let path: SpecializationPath
    public let requirement: Int
    
    public init(id: String, name: String, description: String, cost: Int, path: SpecializationPath, requirement: Int) {
        self.id = id
        self.name = name
        self.description = description
        self.cost = max(0, cost)
        self.path = path
        self.requirement = max(1, requirement)
    }
}

public let RESEARCH_CATALOG: [ResearchItem] = [
    ResearchItem(id: "super_growth", name: "Super Growth", description: "+15% crop growth speed", cost: 50, path: .crops, requirement: 5),
    ResearchItem(id: "drought_resist", name: "Drought Resistance", description: "-20% water drain rate", cost: 75, path: .crops, requirement: 8),
    ResearchItem(id: "quality_boost", name: "Quality Boost", description: "+25% harvest quality chance", cost: 100, path: .crops, requirement: 12),
    ResearchItem(id: "disease_shield", name: "Disease Shield", description: "-30% disease risk", cost: 125, path: .crops, requirement: 15),
    ResearchItem(id: "animal_love", name: "Animal Love", description: "+20% animal product yield", cost: 50, path: .animals, requirement: 5),
    ResearchItem(id: "faster_breeding", name: "Faster Breeding", description: "-25% breeding time", cost: 75, path: .animals, requirement: 8),
    ResearchItem(id: "nutritionist", name: "Nutritionist", description: "+15% animal happiness", cost: 100, path: .animals, requirement: 12),
    ResearchItem(id: "efficient_kitchen", name: "Efficient Kitchen", description: "-15% processing time", cost: 50, path: .processing, requirement: 6),
    ResearchItem(id: "quality_preservation", name: "Quality Preservation", description: "+20% processed item value", cost: 80, path: .processing, requirement: 10),
    ResearchItem(id: "recipe_master", name: "Recipe Master", description: "Unlock 3 advanced recipes", cost: 150, path: .processing, requirement: 15),
    ResearchItem(id: "hybrid_theory", name: "Hybrid Theory", description: "Unlock hybrid experiments", cost: 60, path: .hybrids, requirement: 7),
    ResearchItem(id: "gene_splicer", name: "Gene Splicer", description: "+30% hybrid success rate", cost: 100, path: .hybrids, requirement: 12),
    ResearchItem(id: "market_trends", name: "Market Trends", description: "+10% sell prices", cost: 40, path: .commerce, requirement: 4),
    ResearchItem(id: "barter_bonus", name: "Barter Bonus", description: "+15% trade value", cost: 70, path: .commerce, requirement: 9),
    ResearchItem(id: "export_route", name: "Export Route", description: "+25% coin earnings", cost: 120, path: .commerce, requirement: 14),
]

public func getResearchForPath(_ path: SpecializationPath) -> [ResearchItem] {
    RESEARCH_CATALOG.filter { $0.path == path }
}
