import Foundation

public struct CropDef: Codable, Hashable, Sendable {
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

public struct DecorDef: Codable, Hashable, Sendable {
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

public struct FestivalDef: Codable, Hashable, Sendable {
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

public struct MinigameDef: Codable, Hashable, Sendable {
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

    public init(cropID: String, plantedDay: Int) {
        self.cropID = cropID
        self.plantedDay = max(0, plantedDay)
    }
}

public struct TileState: Codable, Hashable, Sendable {
    public var tilled: Bool
    public var watered: Bool

    public init(tilled: Bool = true, watered: Bool = false) {
        self.tilled = tilled
        self.watered = watered
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

    public init(version: Int, daySeed: UInt64 = 1, player: PlayerState, world: WorldState) {
        self.version = version
        self.daySeed = daySeed
        self.player = player
        self.world = world
    }

    private enum CodingKeys: String, CodingKey {
        case version
        case daySeed
        case player
        case world
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        version = try container.decode(Int.self, forKey: .version)
        daySeed = try container.decodeIfPresent(UInt64.self, forKey: .daySeed) ?? 1
        player = try container.decode(PlayerState.self, forKey: .player)
        world = try container.decode(WorldState.self, forKey: .world)
    }
}

public typealias GameState = SaveGame
