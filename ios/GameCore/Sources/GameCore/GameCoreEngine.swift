import Foundation

public struct GameCoreEngine: Sendable {
    public private(set) var save: SaveGame
    public let cropDefsByID: [String: CropDef]
    public private(set) var rng: SeededRandomNumberGenerator

    public init(save: SaveGame, cropDefs: [CropDef], seed: UInt64 = 1) {
        self.save = save
        self.cropDefsByID = Dictionary(uniqueKeysWithValues: cropDefs.map { ($0.id, $0) })
        self.rng = SeededRandomNumberGenerator(seed: seed)
    }

    public static func defaultSave(gridWidth: Int = 4, gridHeight: Int = 4, starterSeeds: [String: Int] = [:]) -> SaveGame {
        SaveGame(
            version: SaveCodec.currentVersion,
            player: PlayerState(
                coins: 0,
                xp: 0,
                inventory: Inventory(seeds: starterSeeds, crops: [:])
            ),
            world: WorldState.makeEmpty(day: 0, gridWidth: gridWidth, gridHeight: gridHeight)
        )
    }

    @discardableResult
    public mutating func plant(tileIndex: Int, cropID: String) -> Bool {
        guard let crop = cropDefsByID[cropID] else { return false }
        return PlantSystem.plant(
            world: &save.world,
            inventory: &save.player.inventory,
            tileIndex: tileIndex,
            crop: crop,
            currentDay: save.world.day
        )
    }

    public mutating func advanceDay() {
        TimeSystem.advanceDay(world: &save.world)
    }

    @discardableResult
    public mutating func harvest(tileIndex: Int) -> Bool {
        guard save.world.tiles.indices.contains(tileIndex) else { return false }
        guard let planted = save.world.tiles[tileIndex].planted else { return false }
        guard let cropDef = cropDefsByID[planted.cropID] else { return false }

        let harvested = HarvestSystem.harvest(
            world: &save.world,
            inventory: &save.player.inventory,
            tileIndex: tileIndex,
            cropDef: cropDef,
            currentDay: save.world.day
        )

        guard harvested else { return false }
        EconomySystem.applyHarvestSale(player: &save.player, crop: cropDef)
        XPSystem.applyHarvestXP(player: &save.player, crop: cropDef)
        return true
    }

    public func isTileReady(_ tileIndex: Int) -> Bool {
        guard save.world.tiles.indices.contains(tileIndex) else { return false }
        guard let planted = save.world.tiles[tileIndex].planted else { return false }
        guard let cropDef = cropDefsByID[planted.cropID] else { return false }
        return HarvestSystem.canHarvest(tile: save.world.tiles[tileIndex], cropDef: cropDef, currentDay: save.world.day)
    }

    @discardableResult
    public mutating func buySeed(cropID: String) -> Bool {
        guard let crop = cropDefsByID[cropID] else { return false }
        guard save.player.coins >= crop.seedCost else { return false }
        save.player.coins -= crop.seedCost
        save.player.inventory.seeds[cropID, default: 0] += 1
        return true
    }

    public mutating func harvestAll() -> Int {
        var count = 0
        for i in save.world.tiles.indices {
            if harvest(tileIndex: i) { count += 1 }
        }
        return count
    }
}
