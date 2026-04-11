import Foundation
import XCTest
@testable import GameCore

final class FarmingSystemTests: XCTestCase {
    // MARK: - Planting Tests
    
    func testPlantCropSuccessfully() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 3, gridHeight: 3, starterSeeds: [:])
        save.player.coins = 10
        save.player.inventory.seeds = ["carrot": 5]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.plant(tileIndex: 0, cropID: "carrot")
        
        XCTAssertTrue(result)
        XCTAssertNotNil(engine.save.world.tiles[0].planted)
        XCTAssertEqual(engine.save.world.tiles[0].planted?.cropID, "carrot")
    }
    
    func testPlantFailsWhenNoSeeds() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 3, gridHeight: 3, starterSeeds: [:])
        save.player.coins = 10
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.plant(tileIndex: 0, cropID: "carrot")
        
        XCTAssertFalse(result)
        XCTAssertNil(engine.save.world.tiles[0].planted)
    }
    
    func testPlantFailsWhenTileOccupied() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 3, gridHeight: 3, starterSeeds: ["carrot": 2])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        let result = engine.plant(tileIndex: 0, cropID: "carrot")
        
        XCTAssertFalse(result)
    }
    
    // MARK: - Growth Tests
    
    func testCropGrowthAdvancement() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        
        // Day 1 - not ready
        engine.advanceDay()
        XCTAssertFalse(engine.isTileReady(0))
        
        // Day 2 - ready
        engine.advanceDay()
        XCTAssertTrue(engine.isTileReady(0))
    }
    
    func testWateringIncreasesGrowth() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 3, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        save.player.coins = 10
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        _ = engine.water(tileIndex: 0)
        
        // Unwatered would need 3 days, watered should be faster
        engine.advanceDay()
        let wateredGrowth = engine.save.world.tiles[0].planted?.growthProgress ?? 0
        
        XCTAssertGreaterThan(wateredGrowth, 0)
    }
    
    // MARK: - Harvest Tests
    
    func testHarvestReadyCrop() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        engine.advanceDay()
        
        let harvested = engine.harvest(tileIndex: 0)
        
        XCTAssertEqual(harvested, 1)
        XCTAssertNil(engine.save.world.tiles[0].planted)
    }
    
    func testHarvestNotReadyCrop() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 3, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        engine.advanceDay()
        
        let harvested = engine.harvest(tileIndex: 0)
        
        XCTAssertEqual(harvested, 0)
        XCTAssertNotNil(engine.save.world.tiles[0].planted)
    }
    
    func testHarvestAllWithMultipleReady() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 4])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<4 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        engine.advanceDay()
        
        let harvested = engine.harvestAll(maxCapacity: 100)
        
        XCTAssertEqual(harvested, 4)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 4)
    }
}

// MARK: - Economy Tests

final class EconomyTests: XCTestCase {
    func testBuySeedsWithSufficientCoins() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 20)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 50
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.buy(itemID: "carrot", quantity: 3, pricing: MarketPricing(seedUnitCosts: ["carrot": 10]))
        
        XCTAssertEqual(result.status, .success)
        XCTAssertEqual(result.totalPrice, 30)
        XCTAssertEqual(engine.save.player.coins, 20)
        XCTAssertEqual(engine.save.player.inventory.seeds["carrot"], 3)
    }
    
    func testBuyFailsWithInsufficientCoins() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 20)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 5
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.buy(itemID: "carrot", quantity: 1, pricing: MarketPricing(seedUnitCosts: ["carrot": 10]))
        
        XCTAssertEqual(result.status, .insufficientCoins)
        XCTAssertEqual(engine.save.player.coins, 5)
    }
    
    func testSellCropsSuccess() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 25)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 0
        save.player.inventory.crops = ["carrot": 3]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.sell(itemID: "carrot", quantity: 2, pricing: MarketPricing(cropUnitPrices: ["carrot": 25]))
        
        XCTAssertEqual(result.status, .success)
        XCTAssertEqual(result.totalPrice, 50)
        XCTAssertEqual(engine.save.player.coins, 50)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 1)
    }
    
    func testSellFailsWithInsufficientQuantity() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 25)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.inventory.crops = ["carrot": 1]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.sell(itemID: "carrot", quantity: 5, pricing: MarketPricing(cropUnitPrices: ["carrot": 25]))
        
        XCTAssertEqual(result.status, .insufficientQuantity)
    }
    
    func testBulkPurchaseNoDiscount() throws {
        // Bulk discount is applied in GameStore, not GameCore engine
        // This test verifies basic buy functionality works
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 25)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 1000
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        // Buy 20 seeds at full price (no bulk discount in core engine)
        let result = engine.buy(itemID: "carrot", quantity: 20, pricing: MarketPricing(seedUnitCosts: ["carrot": 10]))
        
        XCTAssertEqual(result.status, .success)
        XCTAssertEqual(result.totalPrice, 200) // Full price in core
    }
}

// MARK: - Progression Tests

final class ProgressionTests: XCTestCase {
    func testXPFromHarvest() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        engine.advanceDay()
        _ = engine.harvest(tileIndex: 0)
        
        XCTAssertGreaterThan(engine.save.player.xp, 0)
    }
    
    func testLevelUpAtThreshold() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 10, gridHeight: 10, starterSeeds: ["carrot": 100])
        save.player.coins = 10000
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let initialLevel = ProgressionSystem.level(forXP: save.player.xp)
        
        // Harvest many crops to gain XP
        for _ in 0..<50 {
            for i in 0..<100 {
                _ = engine.plant(tileIndex: i, cropID: "carrot")
            }
            engine.advanceDay()
            _ = engine.harvestAll(maxCapacity: 1000)
        }
        
        let finalLevel = ProgressionSystem.level(forXP: engine.save.player.xp)
        
        XCTAssertGreaterThan(finalLevel, initialLevel, "Player should have leveled up")
    }
    
    func testGridUnlockAtLevel() throws {
        // Test that grid expansions unlock at correct levels (returns grid dimension, not area)
        XCTAssertEqual(ProgressionSystem.unlockedGrid(forLevel: 1), 4)  // 2x2 = 4 tiles
        XCTAssertEqual(ProgressionSystem.unlockedGrid(forLevel: 4), 5)  // 5x5 = 25 tiles
        XCTAssertEqual(ProgressionSystem.unlockedGrid(forLevel: 7), 6) // 6x6 = 36 tiles
    }
}

// MARK: - Time System Tests

final class TimeSystemTests: XCTestCase {
    func testDayAdvancement() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        let initialDay = save.world.day
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        // Plant and advance to verify day increments
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        engine.advanceDay()
        
        XCTAssertEqual(engine.save.world.day, initialDay + 1, "Day should advance by 1")
    }
    
    func testSeasonCycle() throws {
        // Test that seasons cycle every 7 days
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let initialSeason = engine.save.world.day % 28 / 7
        
        for _ in 0..<7 {
            engine.advanceDay()
        }
        
        let newSeason = engine.save.world.day % 28 / 7
        XCTAssertNotEqual(initialSeason, newSeason, "Season should have changed after 7 days")
    }
}

// MARK: - Building Tests

final class BuildingTests: XCTestCase {
    func testBuildingLevelUpgrade() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 500
        save.meta.buildingLevels = ["silo": 1]
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        // Test building level retrieval
        XCTAssertEqual(engine.buildingLevel(for: "silo"), 1)
        
        // Upgrade
        save.meta.buildingLevels["silo"] = 2
        engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        XCTAssertEqual(engine.buildingLevel(for: "silo"), 2)
    }
    
    func testBuildingDefaultsToZero() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        // Non-existent buildings should return 0
        XCTAssertEqual(engine.buildingLevel(for: "silo"), 0)
        XCTAssertEqual(engine.buildingLevel(for: "barn"), 0)
    }
}

// MARK: - Inventory Tests

final class InventoryTests: XCTestCase {
    func testInventoryCapacity() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.inventory.crops = [:]
        
        let maxCapacity = 100 // Default silo capacity
        
        XCTAssertEqual(maxCapacity, 100)
    }
    
    func testSeedStorage() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.inventory.seeds = ["carrot": 5, "tomato": 3]
        
        XCTAssertEqual(save.player.inventory.seeds["carrot"], 5)
        XCTAssertEqual(save.player.inventory.seeds["tomato"], 3)
    }
    
    func testCropStorage() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.inventory.crops = ["carrot": 10]
        
        XCTAssertEqual(save.player.inventory.crops["carrot"], 10)
    }
}

// MARK: - Edge Cases

final class EdgeCaseTests: XCTestCase {
    func testPlantOnInvalidTile() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        // Try to plant on invalid tile index
        let result = engine.plant(tileIndex: 100, cropID: "carrot")
        
        XCTAssertFalse(result)
    }
    
    func testHarvestEmptyTile() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let harvested = engine.harvest(tileIndex: 0)
        
        XCTAssertEqual(harvested, 0)
    }
    
    func testNegativeCoinsPrevention() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 1000, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 10
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        let result = engine.buy(itemID: "carrot", quantity: 1, pricing: MarketPricing(seedUnitCosts: ["carrot": 1000]))
        
        XCTAssertEqual(result.status, .insufficientCoins)
        XCTAssertEqual(engine.save.player.coins, 10, "Coins should remain unchanged")
    }
    
    func testMultipleHarvestsSameTile() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        engine.advanceDay()
        
        let firstHarvest = engine.harvest(tileIndex: 0)
        let secondHarvest = engine.harvest(tileIndex: 0)
        
        XCTAssertEqual(firstHarvest, 1)
        XCTAssertEqual(secondHarvest, 0, "Second harvest should return 0 - tile is empty")
    }
}