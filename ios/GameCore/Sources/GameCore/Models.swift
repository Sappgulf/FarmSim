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

public struct PlantedCrop: Codable, Hashable, Sendable {
    public let cropID: String
    public let plantedDay: Int

    public init(cropID: String, plantedDay: Int) {
        self.cropID = cropID
        self.plantedDay = max(0, plantedDay)
    }
}

public struct Tile: Codable, Hashable, Sendable {
    public let index: Int
    public var planted: PlantedCrop?

    public init(index: Int, planted: PlantedCrop? = nil) {
        self.index = index
        self.planted = planted
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
    public var player: PlayerState
    public var world: WorldState

    public init(version: Int, player: PlayerState, world: WorldState) {
        self.version = version
        self.player = player
        self.world = world
    }
}
