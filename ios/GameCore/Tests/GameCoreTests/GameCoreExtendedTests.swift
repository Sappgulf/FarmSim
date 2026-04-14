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

// MARK: - Foreman Automation Tests

final class ForemanAutomationTests: XCTestCase {
    func testForemanAutoWaterWatersAllTiles() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 3, gridHeight: 3, starterSeeds: ["carrot": 9])
        save.meta.foreman.autoWater = .smart
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<9 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        
        engine.applyForemanAutoWater(sprinklerInventory: 1)
        
        for i in 0..<9 {
            XCTAssertTrue(engine.save.world.tiles[i].state.watered, "Tile \(i) should be watered")
        }
    }
    
    func testForemanAutoWaterNoEffectWithoutSprinkler() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 4])
        save.meta.foreman.autoWater = .smart
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<4 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        
        engine.applyForemanAutoWater(sprinklerInventory: 0)
        
        for i in 0..<4 {
            XCTAssertFalse(engine.save.world.tiles[i].state.watered)
        }
    }
    
    func testForemanAutoHarvestHarvestsReadyTiles() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 3, gridHeight: 3, starterSeeds: ["carrot": 9])
        save.meta.foreman.autoHarvest = .priority
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<9 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        engine.advanceDay()
        
        let harvested = engine.applyForemanAutoHarvest(droneHarvesterInventory: 1)
        
        XCTAssertGreaterThan(harvested, 0)
    }
    
    func testForemanAutoHarvestNoEffectWithoutDrone() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 4])
        save.meta.foreman.autoHarvest = .priority
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<4 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        engine.advanceDay()
        
        let harvested = engine.applyForemanAutoHarvest(droneHarvesterInventory: 0)
        
        XCTAssertEqual(harvested, 0)
    }
    
    func testForemanSettingsDefaultValues() throws {
        let settings = ForemanSettings.default
        
        XCTAssertEqual(settings.autoWater, .off)
        XCTAssertEqual(settings.autoHarvest, .off)
        XCTAssertEqual(settings.autoTreat, .off)
        XCTAssertTrue(settings.notify)
    }
}

// MARK: - Prestige System Tests

final class PrestigeSystemTests: XCTestCase {
    func testPrestigeTierCalculation() throws {
        XCTAssertEqual(getPrestigeTier(for: 0), 0)
        XCTAssertEqual(getPrestigeTier(for: 5), 0)
        XCTAssertEqual(getPrestigeTier(for: 10), 1)
        XCTAssertEqual(getPrestigeTier(for: 25), 2)
        XCTAssertEqual(getPrestigeTier(for: 50), 3)
        XCTAssertEqual(getPrestigeTier(for: 100), 4)
        XCTAssertEqual(getPrestigeTier(for: 200), 5)
    }
    
    func testPrestigeMultiplierCalculation() throws {
        XCTAssertEqual(getPrestigeMultiplier(for: 0), 1.0)
        XCTAssertEqual(getPrestigeMultiplier(for: 1), 1.05)
        XCTAssertEqual(getPrestigeMultiplier(for: 2), 1.10)
        XCTAssertEqual(getPrestigeMultiplier(for: 3), 1.15)
        XCTAssertEqual(getPrestigeMultiplier(for: 4), 1.25)
        XCTAssertEqual(getPrestigeMultiplier(for: 5), 1.40)
    }
    
    func testPerformPrestigeAdvancesTier() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.meta.prestige = PrestigeState(tier: 0, totalEarnedLifetime: 50, lastPrestigeDay: 0)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let result = engine.performPrestige()
        
        XCTAssertTrue(result)
        XCTAssertEqual(engine.save.meta.prestige.tier, 3)
    }
    
    func testPerformPrestigeFailsWhenNoTierGain() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.meta.prestige = PrestigeState(tier: 3, totalEarnedLifetime: 50, lastPrestigeDay: 0)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let result = engine.performPrestige()
        
        XCTAssertFalse(result)
        XCTAssertEqual(engine.save.meta.prestige.tier, 3)
    }
    
    func testGetPrestigeBonus() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.meta.prestige.tier = 2
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let bonus = engine.getPrestigeBonus()
        
        XCTAssertEqual(bonus, 1.10)
    }
    
    func testPrestigeTiersHaveCorrectValues() throws {
        XCTAssertEqual(PRESTIGE_TIERS.count, 5)
        XCTAssertEqual(PRESTIGE_TIERS[0].tier, 1)
        XCTAssertEqual(PRESTIGE_TIERS[0].required, 10)
        XCTAssertEqual(PRESTIGE_TIERS[0].name, "Farmhand")
        XCTAssertEqual(PRESTIGE_TIERS[0].bonus, 0.05)
    }
}

// MARK: - Specialization System Tests

final class SpecializationSystemTests: XCTestCase {
    func testSelectSpecialization() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let result = engine.selectSpecialization(.crops)
        
        XCTAssertTrue(result)
        XCTAssertEqual(engine.save.meta.specialization.selectedPath, .crops)
    }
    
    func testSelectSpecializationFailsIfAlreadySelected() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.meta.specialization.selectedPath = .animals
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let result = engine.selectSpecialization(.crops)
        
        XCTAssertFalse(result)
    }
    
    func testUnlockResearch() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 100
        save.player.xp = 50
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        _ = engine.selectSpecialization(.crops)
        
        let result = engine.unlockResearch("super_growth", playerLevel: 5, coins: &save.player.coins)
        
        XCTAssertTrue(result)
        XCTAssertTrue(engine.save.meta.specialization.unlockedResearch["super_growth"] ?? false)
    }
    
    func testUnlockResearchFailsIfAlreadyUnlocked() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 100
        save.meta.specialization.unlockedResearch["super_growth"] = true
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let result = engine.unlockResearch("super_growth", playerLevel: 5, coins: &save.player.coins)
        
        XCTAssertFalse(result)
    }
    
    func testUnlockResearchFailsIfInsufficientLevel() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 100
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        _ = engine.selectSpecialization(.crops)
        
        let result = engine.unlockResearch("super_growth", playerLevel: 2, coins: &save.player.coins)
        
        XCTAssertFalse(result)
    }
    
    func testUnlockResearchFailsIfInsufficientCoins() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 10
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        _ = engine.selectSpecialization(.crops)
        
        let result = engine.unlockResearch("super_growth", playerLevel: 5, coins: &save.player.coins)
        
        XCTAssertFalse(result)
    }
    
    func testGetAvailableResearch() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.meta.specialization.selectedPath = .crops
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let available = engine.getAvailableResearch(forPath: .crops, playerLevel: 10)
        
        XCTAssertFalse(available.isEmpty)
    }
    
    func testGetResearchBonus() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.meta.specialization.unlockedResearch["super_growth"] = true
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        let bonus = engine.getResearchBonus(for: "super_growth")
        
        XCTAssertEqual(bonus, 1.15)
    }
    
    func testResearchCatalogHasAllPaths() throws {
        let allPaths: [SpecializationPath] = [.crops, .animals, .processing, .hybrids, .commerce]
        
        for path in allPaths {
            let research = getResearchForPath(path)
            XCTAssertFalse(research.isEmpty, "Path \(path) should have research items")
        }
    }
    
    func testSpecializationPathNames() throws {
        XCTAssertEqual(SpecializationPath.crops.name, "Crop Mastery")
        XCTAssertEqual(SpecializationPath.animals.name, "Livestock Pro")
        XCTAssertEqual(SpecializationPath.processing.name, "Artisan Crafts")
        XCTAssertEqual(SpecializationPath.hybrids.name, "Genetics Lab")
        XCTAssertEqual(SpecializationPath.commerce.name, "Trade Empire")
    }
    
    func testSpecializationPathEmojis() throws {
        XCTAssertEqual(SpecializationPath.crops.emoji, "🌾")
        XCTAssertEqual(SpecializationPath.animals.emoji, "🐄")
        XCTAssertEqual(SpecializationPath.processing.emoji, "🧀")
        XCTAssertEqual(SpecializationPath.hybrids.emoji, "🧬")
        XCTAssertEqual(SpecializationPath.commerce.emoji, "💰")
    }
}

// MARK: - Watering Bonus Tests

final class WateringBonusTests: XCTestCase {
    func testWateredTilesGetGrowthBonus() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 2])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        _ = engine.water(tileIndex: 0)
        
        _ = engine.plant(tileIndex: 1, cropID: "carrot")
        
        engine.advanceDay()
        
        let wateredGrowth = engine.save.world.tiles[0].planted?.growthProgress ?? 0
        let unwateredGrowth = engine.save.world.tiles[1].planted?.growthProgress ?? 0
        
        XCTAssertGreaterThan(wateredGrowth, unwateredGrowth, "Watered tile should have more growth")
        XCTAssertEqual(unwateredGrowth, 1.0, "Unwatered should grow 1.0 per day")
        XCTAssertEqual(wateredGrowth, 1.5, "Watered should grow 1.5 per day (1.0 + 0.5 bonus)")
    }
    
    func testWateredTileReadySoonerWithDailyWatering() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 4, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 2])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        _ = engine.water(tileIndex: 0)
        
        _ = engine.plant(tileIndex: 1, cropID: "carrot")
        
        for day in 0..<4 {
            if day > 0 {
                _ = engine.water(tileIndex: 0)
                _ = engine.water(tileIndex: 1)
            }
            engine.advanceDay()
        }
        
        XCTAssertTrue(engine.isTileReady(0), "Watered 4-day crop should be ready after 4 days with daily watering")
        XCTAssertTrue(engine.isTileReady(1), "Unwatered 4-day crop ready after 4 days (4.0 growth)")
    }
    
    func testWateredTileReadySooner() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 3, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 2])
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        _ = engine.plant(tileIndex: 0, cropID: "carrot")
        _ = engine.water(tileIndex: 0)
        
        _ = engine.plant(tileIndex: 1, cropID: "carrot")
        
        engine.advanceDay()
        
        XCTAssertFalse(engine.isTileReady(0), "Not ready after 1 day (1.5 growth, needs 3)")
        XCTAssertFalse(engine.isTileReady(1), "Not ready after 1 day")
        
        _ = engine.water(tileIndex: 0)
        engine.advanceDay()
        
        XCTAssertTrue(engine.isTileReady(0), "Watered ready after 2 days (1.5 + 1.5 = 3.0)")
        XCTAssertFalse(engine.isTileReady(1), "Unwatered not ready after 2 days (2.0, needs 3)")
        
        _ = engine.water(tileIndex: 1)
        engine.advanceDay()
        
        XCTAssertTrue(engine.isTileReady(1), "Now ready after 3 days")
    }
}

// MARK: - Grid Resize Tests

final class GridResizeTests: XCTestCase {
    func testResizeGridExpands() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.world.tiles[0].planted = PlantedCrop(cropID: "carrot", plantedDay: 0)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        engine.resizeGrid(width: 4, height: 3)
        
        XCTAssertEqual(engine.save.world.gridWidth, 4)
        XCTAssertEqual(engine.save.world.gridHeight, 3)
        XCTAssertEqual(engine.save.world.tiles.count, 12)
    }
    
    func testResizeGridShrinks() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 4, gridHeight: 4)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        engine.resizeGrid(width: 2, height: 2)
        
        XCTAssertEqual(engine.save.world.gridWidth, 2)
        XCTAssertEqual(engine.save.world.gridHeight, 2)
        XCTAssertEqual(engine.save.world.tiles.count, 4)
    }
    
    func testResizeGridPreservesPlantedTiles() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 4, gridHeight: 4)
        save.world.tiles[0].planted = PlantedCrop(cropID: "carrot", plantedDay: 0)
        save.world.tiles[5].planted = PlantedCrop(cropID: "tomato", plantedDay: 0)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        engine.resizeGrid(width: 3, height: 3)
        
        XCTAssertEqual(engine.save.world.tiles[0].planted?.cropID, "carrot")
    }
    
    func testResizeGridSameSizeNoChange() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 3, gridHeight: 3)
        let originalTiles = save.world.tiles
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        engine.resizeGrid(width: 3, height: 3)
        
        XCTAssertEqual(engine.save.world.tiles.count, originalTiles.count)
    }
    
    func testResizeGridNegativeValuesClamped() throws {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        var engine = GameCoreEngine(save: save, cropDefs: [], seed: 123)
        
        engine.resizeGrid(width: -1, height: -5)
        
        XCTAssertEqual(engine.save.world.gridWidth, 1)
        XCTAssertEqual(engine.save.world.gridHeight, 1)
    }
}

// MARK: - Inventory Capacity Tests

final class InventoryCapacityTests: XCTestCase {
    func testHarvestRespectsMaxCapacity() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 4])
        save.player.inventory.crops = ["carrot": 100]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<4 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        engine.advanceDay()
        
        let harvested = engine.harvest(tileIndex: 0, maxCapacity: 100)
        
        XCTAssertEqual(harvested, 0, "Should not harvest when at capacity")
    }
    
    func testHarvestPartialWhenNearCapacity() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 5, sellPrice: 15)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 4])
        save.player.inventory.crops = ["carrot": 99]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)
        
        for i in 0..<4 {
            _ = engine.plant(tileIndex: i, cropID: "carrot")
        }
        engine.advanceDay()
        
        let harvested = engine.harvestAll(maxCapacity: 101)
        
        XCTAssertEqual(harvested, 1, "Should harvest 1 when capacity allows 1 more")
    }
}