import Foundation

public struct MarketPricing: Sendable, Hashable {
    public var seedUnitCosts: [String: Int]
    public var cropUnitPrices: [String: Int]

    public init(seedUnitCosts: [String: Int] = [:], cropUnitPrices: [String: Int] = [:]) {
        self.seedUnitCosts = seedUnitCosts
        self.cropUnitPrices = cropUnitPrices
    }

    public func unitCostForSeed(_ cropID: String, default defaultValue: Int) -> Int {
        max(0, seedUnitCosts[cropID] ?? defaultValue)
    }

    public func unitPriceForCrop(_ cropID: String, default defaultValue: Int) -> Int {
        max(0, cropUnitPrices[cropID] ?? defaultValue)
    }
}

public enum MarketTradeStatus: String, Sendable {
    case success
    case invalidQuantity
    case unknownItem
    case insufficientCoins
    case insufficientQuantity
}

public struct MarketTradeResult: Sendable, Hashable {
    public let status: MarketTradeStatus
    public let itemID: String
    public let quantity: Int
    public let unitPrice: Int
    public let totalPrice: Int
    public let remainingCoins: Int
    public let remainingItemCount: Int

    public var success: Bool {
        status == .success
    }

    public init(
        status: MarketTradeStatus,
        itemID: String,
        quantity: Int,
        unitPrice: Int,
        totalPrice: Int,
        remainingCoins: Int,
        remainingItemCount: Int
    ) {
        self.status = status
        self.itemID = itemID
        self.quantity = quantity
        self.unitPrice = unitPrice
        self.totalPrice = totalPrice
        self.remainingCoins = remainingCoins
        self.remainingItemCount = remainingItemCount
    }
}

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

    public mutating func advanceDay(growthMultiplier: Double = 1.0) {
        lastDailyRoll = SimTickSystem.advanceDay(world: &save.world, rng: &rng, growthMultiplier: growthMultiplier)
        save.daySeed = rng.currentState
        if save.meta.time.dayIndex < save.world.day {
            save.meta.time.dayIndex = save.world.day
        }
    }

    public mutating func harvest(tileIndex: Int, yieldMultiplier: Double = 1.0, maxCapacity: Int? = nil) -> Int {
        guard save.world.tiles.indices.contains(tileIndex) else { return 0 }
        guard let planted = save.world.tiles[tileIndex].planted,
              let cropDef = cropDefsByID[planted.cropID] else { return 0 }

        let quantity = resolvedYieldQuantity(multiplier: yieldMultiplier)
        let success = HarvestSystem.harvest(
            world: &save.world,
            inventory: &save.player.inventory,
            tileIndex: tileIndex,
            cropDef: cropDef,
            currentDay: save.world.day,
            quantity: quantity,
            maxCapacity: maxCapacity
        )
        
        guard success else { return 0 }

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
    public mutating func buySeed(cropID: String, unitCostOverride: Int? = nil) -> Bool {
        let pricing = unitCostOverride.map { MarketPricing(seedUnitCosts: [cropID: $0]) } ?? MarketPricing()
        return buy(itemID: cropID, quantity: 1, pricing: pricing).success
    }

    @discardableResult
    public mutating func sellCrop(cropID: String, quantity: Int = 1, unitPriceOverride: Int? = nil) -> Bool {
        let pricing = unitPriceOverride.map { MarketPricing(cropUnitPrices: [cropID: $0]) } ?? MarketPricing()
        return sell(itemID: cropID, quantity: quantity, pricing: pricing).success
    }

    @discardableResult
    public mutating func buy(itemID: String, quantity: Int = 1, pricing: MarketPricing = MarketPricing()) -> MarketTradeResult {
        let qty = max(0, quantity)
        guard qty > 0 else {
            return MarketTradeResult(
                status: .invalidQuantity,
                itemID: itemID,
                quantity: quantity,
                unitPrice: 0,
                totalPrice: 0,
                remainingCoins: save.player.coins,
                remainingItemCount: save.player.inventory.seeds[itemID] ?? 0
            )
        }
        guard let crop = cropDefsByID[itemID] else {
            return MarketTradeResult(
                status: .unknownItem,
                itemID: itemID,
                quantity: qty,
                unitPrice: 0,
                totalPrice: 0,
                remainingCoins: save.player.coins,
                remainingItemCount: 0
            )
        }

        let unitCost = pricing.unitCostForSeed(itemID, default: crop.seedCost)
        let totalCost = unitCost * qty
        guard EconomySystem.buySeed(player: &save.player, cropID: itemID, unitCost: unitCost, quantity: qty) else {
            return MarketTradeResult(
                status: .insufficientCoins,
                itemID: itemID,
                quantity: qty,
                unitPrice: unitCost,
                totalPrice: totalCost,
                remainingCoins: save.player.coins,
                remainingItemCount: save.player.inventory.seeds[itemID] ?? 0
            )
        }

        return MarketTradeResult(
            status: .success,
            itemID: itemID,
            quantity: qty,
            unitPrice: unitCost,
            totalPrice: totalCost,
            remainingCoins: save.player.coins,
            remainingItemCount: save.player.inventory.seeds[itemID] ?? 0
        )
    }

    @discardableResult
    public mutating func sell(itemID: String, quantity: Int = 1, pricing: MarketPricing = MarketPricing()) -> MarketTradeResult {
        let qty = max(0, quantity)
        guard qty > 0 else {
            return MarketTradeResult(
                status: .invalidQuantity,
                itemID: itemID,
                quantity: quantity,
                unitPrice: 0,
                totalPrice: 0,
                remainingCoins: save.player.coins,
                remainingItemCount: save.player.inventory.crops[itemID] ?? 0
            )
        }
        guard let crop = cropDefsByID[itemID] else {
            return MarketTradeResult(
                status: .unknownItem,
                itemID: itemID,
                quantity: qty,
                unitPrice: 0,
                totalPrice: 0,
                remainingCoins: save.player.coins,
                remainingItemCount: 0
            )
        }

        let unitPrice = pricing.unitPriceForCrop(itemID, default: crop.sellPrice)
        let totalPrice = unitPrice * qty
        guard EconomySystem.sellCrop(player: &save.player, cropID: itemID, unitPrice: unitPrice, quantity: qty) else {
            return MarketTradeResult(
                status: .insufficientQuantity,
                itemID: itemID,
                quantity: qty,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                remainingCoins: save.player.coins,
                remainingItemCount: save.player.inventory.crops[itemID] ?? 0
            )
        }

        return MarketTradeResult(
            status: .success,
            itemID: itemID,
            quantity: qty,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            remainingCoins: save.player.coins,
            remainingItemCount: save.player.inventory.crops[itemID] ?? 0
        )
    }

    @discardableResult
    public mutating func harvestAll(yieldMultiplier: Double = 1.0, maxCapacity: Int? = nil) -> Int {
        var totalHarvested = 0
        if let maxCapacity {
            for i in 0..<save.world.tiles.count {
                let remainingCapacity = maxCapacity - totalHarvested
                guard remainingCapacity > 0 else { break }
                guard isTileReady(i) else { continue }
                let harvested = harvest(tileIndex: i, yieldMultiplier: yieldMultiplier, maxCapacity: remainingCapacity)
                guard harvested > 0 else { break }
                totalHarvested += harvested
            }
            return totalHarvested
        }

        for i in 0..<save.world.tiles.count {
            let harvested = harvest(tileIndex: i, yieldMultiplier: yieldMultiplier, maxCapacity: nil)
            if harvested > 0 {
                totalHarvested += harvested
            }
        }
        return totalHarvested
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

    public mutating func addCoins(_ amount: Int) {
        guard amount > 0 else { return }
        save.player.coins += amount
    }

    public mutating func addXP(_ amount: Int) {
        guard amount > 0 else { return }
        save.player.xp += amount
    }

    @discardableResult
    public mutating func spendCoins(_ amount: Int) -> Bool {
        let safeAmount = max(0, amount)
        guard save.player.coins >= safeAmount else { return false }
        save.player.coins -= safeAmount
        return true
    }

    public func seedCount(for cropID: String) -> Int {
        save.player.inventory.seeds[cropID] ?? 0
    }

    @discardableResult
    public mutating func consumeSeeds(cropID: String, quantity: Int) -> Bool {
        let qty = max(1, quantity)
        let current = save.player.inventory.seeds[cropID] ?? 0
        guard current >= qty else { return false }
        save.player.inventory.seeds[cropID] = current - qty
        return true
    }

    public mutating func grantSeeds(cropID: String, quantity: Int) {
        guard quantity > 0 else { return }
        save.player.inventory.seeds[cropID, default: 0] += quantity
    }

    public func buildingLevel(for id: String) -> Int {
        max(0, save.meta.buildingLevels[id] ?? 0)
    }

    public mutating func setBuildingLevel(_ level: Int, for id: String) {
        save.meta.buildingLevels[id] = max(0, level)
    }

    public func isResearchCompleted(_ id: String) -> Bool {
        save.meta.completedResearch[id] ?? false
    }

    public mutating func markResearchCompleted(_ id: String) {
        save.meta.completedResearch[id] = true
    }

    public func isHybridDiscovered(_ id: String) -> Bool {
        save.meta.discoveredHybrids[id] ?? false
    }

    public mutating func markHybridDiscovered(_ id: String) {
        save.meta.discoveredHybrids[id] = true
    }

    public mutating func incrementExpansionPurchases() {
        save.meta.expansionPurchases += 1
    }

    public func livestockCount(for id: String) -> Int {
        max(0, save.meta.livestockCounts[id] ?? 0)
    }

    public mutating func setLivestockCount(_ count: Int, for id: String) {
        save.meta.livestockCounts[id] = max(0, count)
    }

    public func petLevel(for id: String) -> Int {
        max(0, save.meta.petLevels[id] ?? 0)
    }

    public mutating func setPetLevel(_ level: Int, for id: String) {
        save.meta.petLevels[id] = max(0, level)
    }

    public func fishCaughtCount(for id: String) -> Int {
        max(0, save.meta.fishCaughtCounts[id] ?? 0)
    }

    public mutating func addFishCaught(for id: String, quantity: Int = 1) {
        let qty = max(1, quantity)
        save.meta.fishCaughtCounts[id, default: 0] += qty
    }

    public var fishingPondLevel: Int {
        max(1, save.meta.fishingPondLevel)
    }

    public mutating func setFishingPondLevel(_ level: Int) {
        save.meta.fishingPondLevel = max(1, level)
    }

    public func challengeClaimDay(for id: String) -> Int? {
        save.meta.challengeClaims[id]
    }

    public mutating func setChallengeClaimDay(_ day: Int, for id: String) {
        save.meta.challengeClaims[id] = day
    }

    public var challengeStreak: Int {
        max(0, save.meta.challengeStreak)
    }

    public mutating func setChallengeStreak(_ value: Int) {
        save.meta.challengeStreak = max(0, value)
    }

    public func isFavoriteItem(_ itemID: String) -> Bool {
        save.meta.favoriteItems[itemID] ?? false
    }

    public mutating func setFavoriteItem(_ isFavorite: Bool, for itemID: String) {
        if isFavorite {
            save.meta.favoriteItems[itemID] = true
        } else {
            save.meta.favoriteItems[itemID] = nil
        }
    }

    public var timeState: TimeMetaState {
        save.meta.time
    }

    public mutating func setTimeState(_ value: TimeMetaState) {
        save.meta.time = value
        if save.world.day < value.dayIndex {
            save.world.day = value.dayIndex
        } else if save.world.day > value.dayIndex {
            save.meta.time.dayIndex = save.world.day
        }
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
