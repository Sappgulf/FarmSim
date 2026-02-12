import Foundation

public struct GameCoreEngine: Sendable {
    public private(set) var save: SaveGame
    public let cropDefsByID: [String: CropDef]
    public private(set) var rng: SeededRandomNumberGenerator
    public private(set) var lastDailyRoll: Int = 0

    public init(save: SaveGame, cropDefs: [CropDef], seed: UInt64 = 1) {
        self.save = save
        self.cropDefsByID = Dictionary(uniqueKeysWithValues: cropDefs.map { ($0.id, $0) })
        let rngSeed = save.daySeed == 0 ? seed : save.daySeed
        self.rng = SeededRandomNumberGenerator(seed: rngSeed)
    }

    public static func defaultSave(
        gridWidth: Int = 4,
        gridHeight: Int = 4,
        starterSeeds: [String: Int] = [:],
        daySeed: UInt64 = 1
    ) -> SaveGame {
        SaveGame(
            version: SaveCodec.currentVersion,
            daySeed: daySeed,
            player: PlayerState(
                coins: 0,
                xp: 0,
                inventory: Inventory(seeds: starterSeeds, crops: [:])
            ),
            world: WorldState.makeEmpty(day: 0, gridWidth: gridWidth, gridHeight: gridHeight)
        )
    }

    public var playerLevel: Int {
        ProgressionSystem.level(forXP: save.player.xp)
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

    @discardableResult
    public mutating func water(tileIndex: Int) -> Bool {
        guard save.world.tiles.indices.contains(tileIndex) else { return false }
        guard save.world.tiles[tileIndex].planted != nil else { return false }
        save.world.tiles[tileIndex].state.watered = true
        return true
    }

    @discardableResult
    public mutating func clearTile(tileIndex: Int) -> Bool {
        guard save.world.tiles.indices.contains(tileIndex) else { return false }
        guard save.world.tiles[tileIndex].planted != nil else { return false }
        save.world.tiles[tileIndex].planted = nil
        return true
    }

    public mutating func advanceDay() {
        lastDailyRoll = SimTickSystem.advanceDay(world: &save.world, rng: &rng)
        save.daySeed = rng.currentState
    }

    @discardableResult
    public mutating func harvest(tileIndex: Int) -> Bool {
        harvestYield(tileIndex: tileIndex, yieldMultiplier: 1.0) > 0
    }

    public mutating func harvestYield(tileIndex: Int, yieldMultiplier: Double) -> Int {
        guard save.world.tiles.indices.contains(tileIndex) else { return 0 }
        guard let planted = save.world.tiles[tileIndex].planted else { return 0 }
        guard let cropDef = cropDefsByID[planted.cropID] else { return 0 }

        let quantity = resolvedYieldQuantity(multiplier: yieldMultiplier)
        let harvested = HarvestSystem.harvest(
            world: &save.world,
            inventory: &save.player.inventory,
            tileIndex: tileIndex,
            cropDef: cropDef,
            currentDay: save.world.day,
            quantity: quantity
        )

        guard harvested else { return 0 }
        EconomySystem.applyHarvestSale(player: &save.player, crop: cropDef, quantity: quantity)
        XPSystem.applyHarvestXP(player: &save.player, crop: cropDef, quantity: quantity)
        return quantity
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

    @discardableResult
    public mutating func sellCrop(cropID: String, quantity: Int = 1) -> Bool {
        guard let crop = cropDefsByID[cropID] else { return false }
        return EconomySystem.sellCrop(player: &save.player, cropID: cropID, unitPrice: crop.sellPrice, quantity: quantity)
    }

    public mutating func harvestAll(yieldMultiplier: Double = 1.0) -> Int {
        var harvestedTiles = 0
        for i in save.world.tiles.indices {
            if harvestYield(tileIndex: i, yieldMultiplier: yieldMultiplier) > 0 {
                harvestedTiles += 1
            }
        }
        return harvestedTiles
    }

    public mutating func resizeGrid(width: Int, height: Int) {
        let newWidth = max(1, width)
        let newHeight = max(1, height)
        guard newWidth != save.world.gridWidth || newHeight != save.world.gridHeight else { return }

        let oldWidth = save.world.gridWidth
        let oldHeight = save.world.gridHeight
        let oldTiles = save.world.tiles

        var newTiles = (0..<(newWidth * newHeight)).map { Tile(index: $0) }

        let copyWidth = min(oldWidth, newWidth)
        let copyHeight = min(oldHeight, newHeight)

        for row in 0..<copyHeight {
            for col in 0..<copyWidth {
                let oldIndex = row * oldWidth + col
                let newIndex = row * newWidth + col
                guard oldTiles.indices.contains(oldIndex), newTiles.indices.contains(newIndex) else { continue }
                var copied = oldTiles[oldIndex]
                copied = Tile(index: newIndex, state: copied.state, planted: copied.planted)
                newTiles[newIndex] = copied
            }
        }

        save.world.gridWidth = newWidth
        save.world.gridHeight = newHeight
        save.world.tiles = newTiles
    }

    private mutating func resolvedYieldQuantity(multiplier: Double) -> Int {
        let safeMultiplier = max(1.0, multiplier)
        let baseQuantity = Int(floor(safeMultiplier))
        let fractional = safeMultiplier - Double(baseQuantity)

        guard fractional > 0 else { return max(1, baseQuantity) }

        let roll = Double.random(in: 0...1, using: &rng)
        return roll < fractional ? (baseQuantity + 1) : max(1, baseQuantity)
    }
}
