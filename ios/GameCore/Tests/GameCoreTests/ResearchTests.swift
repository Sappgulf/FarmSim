import Foundation
import XCTest
@testable import GameCore

final class ResearchTests: XCTestCase {
    private let crop = CropDef(id: "wheat", name: "Wheat", daysToGrow: 4, seedCost: 100, sellPrice: 20)

    private func farm() -> GameCoreEngine {
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["wheat": 4], daySeed: 42)
        save.player.coins = 1_000
        return GameCoreEngine(save: save, cropDefs: [crop], seed: 42)
    }

    func testIrrigationWatersEachGrowingDayWithoutStackingManualWater() throws {
        var engine = farm()
        engine.markResearchCompleted("irrigation_system")
        XCTAssertTrue(engine.plant(tileIndex: 0, cropID: "wheat"))
        XCTAssertTrue(engine.water(tileIndex: 0))
        engine.advanceDay()
        XCTAssertEqual(try XCTUnwrap(engine.save.world.tiles[0].planted).growthProgress, 1.5)
        engine.advanceDay()
        XCTAssertEqual(try XCTUnwrap(engine.save.world.tiles[0].planted).growthProgress, 3)
        XCTAssertFalse(engine.save.world.tiles[1].state.watered)
    }

    func testCompostingReducesActualSeedPurchaseCost() {
        var engine = farm()
        engine.markResearchCompleted("composting")
        let result = engine.buy(itemID: "wheat", quantity: 2)
        XCTAssertTrue(result.success)
        XCTAssertEqual(result.unitPrice, 90)
        XCTAssertEqual(engine.save.player.coins, 820)
        XCTAssertEqual(engine.seedCount(for: "wheat"), 6)
    }

    func testHoneyIncomeOnlyAccruesWhenDaysAdvanceIncludingAfterReload() throws {
        var engine = farm()
        engine.markResearchCompleted("beekeeping")
        XCTAssertEqual(engine.save.player.coins, 1_000)
        for _ in 0..<3 { engine.advanceDay() }
        XCTAssertEqual(engine.save.player.coins, 1_015)
        var resumed = GameCoreEngine(save: try SaveCodec.decode(SaveCodec.encode(engine.save)), cropDefs: [crop])
        XCTAssertEqual(resumed.save.player.coins, 1_015)
        resumed.advanceDay()
        XCTAssertEqual(resumed.save.player.coins, 1_020)
        XCTAssertEqual(resumed.save.world.day, 4)
    }

    func testAquaponicsAcceleratesActualCropGrowth() throws {
        var engine = farm()
        engine.markResearchCompleted("aquaponics")
        XCTAssertTrue(engine.plant(tileIndex: 0, cropID: "wheat"))
        engine.advanceDay()
        XCTAssertEqual(try XCTUnwrap(engine.save.world.tiles[0].planted).growthProgress, 1.1, accuracy: 0.000001)
    }

    func testPurchaseRequiresPrerequisitesAndPaysOnlyOnceAcrossReload() throws {
        var engine = farm()
        let original = engine.save
        XCTAssertFalse(engine.completeResearch("composting", cost: 120, prerequisites: ["soil_enhancement"]))
        XCTAssertEqual(engine.save, original)
        XCTAssertTrue(engine.completeResearch("soil_enhancement", cost: 180, prerequisites: []))
        XCTAssertTrue(engine.completeResearch("composting", cost: 120, prerequisites: ["soil_enhancement"]))
        XCTAssertEqual(engine.save.player.coins, 700)
        XCTAssertEqual(engine.save.player.xp, 150)
        var resumed = GameCoreEngine(save: try SaveCodec.decode(SaveCodec.encode(engine.save)), cropDefs: [crop])
        let purchased = resumed.save
        XCTAssertFalse(resumed.completeResearch("composting", cost: 120, prerequisites: ["soil_enhancement"]))
        XCTAssertEqual(resumed.save, purchased)
    }

    func testInvalidOrUnaffordableResearchDoesNotMutateSave() {
        var engine = farm()
        for (id, cost) in [("beekeeping", 1_001), ("beekeeping", -1), ("unknown", 100)] {
            let original = engine.save
            XCTAssertFalse(engine.completeResearch(id, cost: cost, prerequisites: []))
            XCTAssertEqual(engine.save, original)
        }
    }

    func testExistingAndNewSeedDiscountsStackWithoutDiscountingOverridesTwice() {
        var engine = farm()
        for id in ["irrigation_system", "automation_core", "climate_control", "composting"] {
            engine.markResearchCompleted(id)
        }
        XCTAssertEqual(engine.buy(itemID: "wheat").unitPrice, 73)
        let quote = engine.researchBenefits.seedCost(for: 100, otherMultiplier: 0.8)
        let sale = engine.buy(itemID: "wheat", pricing: MarketPricing(seedUnitCosts: ["wheat": quote]))
        XCTAssertEqual(quote, 58)
        XCTAssertEqual(sale.unitPrice, quote)
    }

    func testFalseOrUnknownCompletionFlagsHaveNoEffect() throws {
        var save = farm().save
        save.meta.completedResearch = ["beekeeping": false, "aquaponics": false, "irrigation_system": false, "unknown": true]
        var engine = GameCoreEngine(save: save, cropDefs: [crop])
        XCTAssertTrue(engine.plant(tileIndex: 0, cropID: "wheat"))
        engine.advanceDay()
        XCTAssertEqual(try XCTUnwrap(engine.save.world.tiles[0].planted).growthProgress, 1)
        XCTAssertEqual(engine.save.player.coins, 1_000)
        XCTAssertEqual(engine.buy(itemID: "wheat").unitPrice, 100)
    }

    func testBeekeepingImprovesSeededHarvestsAndPreservesCapacity() {
        var save = GameCoreEngine.defaultSave(gridWidth: 10, gridHeight: 10, starterSeeds: ["wheat": 100], daySeed: 42)
        save.meta.completedResearch["beekeeping"] = true
        var engine = GameCoreEngine(save: save, cropDefs: [crop])
        for index in 0..<100 { XCTAssertTrue(engine.plant(tileIndex: index, cropID: "wheat")) }
        for _ in 0..<4 { engine.advanceDay() }
        let harvested = engine.harvestAll(yieldMultiplier: 5, maxCapacity: 520)
        XCTAssertGreaterThan(harvested, 500)
        XCTAssertLessThanOrEqual(harvested, 520)
        XCTAssertEqual(engine.save.player.inventory.crops["wheat"], harvested)
        XCTAssertTrue(engine.save.world.tiles.contains { $0.planted != nil })
    }

    func testAquaponicsAndMarketBenefitsReachFishingLedger() {
        var engine = farm()
        engine.markResearchCompleted("aquaponics")
        engine.markResearchCompleted("market_analytics")
        XCTAssertEqual(engine.awardFishCatch(fishID: "carp", baseValue: 100, xp: 8), 132)
        XCTAssertEqual(engine.save.player.coins, 1_132)
        XCTAssertEqual(engine.save.player.xp, 8)
        XCTAssertEqual(engine.save.meta.fishCaughtCounts["carp"], 1)
        let before = engine.save
        XCTAssertEqual(engine.awardFishCatch(fishID: "carp", baseValue: 100, xp: 8, sellMultiplier: .nan), 0)
        XCTAssertEqual(engine.save, before)
    }

    func testBulkHarvestCanFillRemainingSpaceInAPartlyFullSilo() {
        var save = farm().save
        save.player.inventory.crops["wheat"] = 10
        var engine = GameCoreEngine(save: save, cropDefs: [crop])
        for index in 0..<2 { XCTAssertTrue(engine.plant(tileIndex: index, cropID: "wheat")) }
        for _ in 0..<4 { engine.advanceDay() }
        XCTAssertEqual(engine.harvestAll(maxCapacity: 12), 2)
        XCTAssertEqual(engine.save.player.inventory.crops["wheat"], 12)
    }

    func testEveryBundledResearchItemHasAnImplementedBenefitAndCanBePurchased() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .appendingPathComponent("../../../../shared/content").standardizedFileURL
        struct Catalog: Decodable {
            struct Item: Decodable { let id: String; let cost: Int; let prerequisites: [String] }
            let items: [Item]
        }
        let catalog = try JSONDecoder().decode(Catalog.self, from: Data(contentsOf: root.appendingPathComponent("research.json")))
        var engine = farm()
        engine.addCoins(10_000)
        for item in catalog.items {
            XCTAssertNotNil(ResearchBenefits.summary(for: item.id), item.id)
            XCTAssertTrue(engine.completeResearch(item.id, cost: item.cost, prerequisites: item.prerequisites), item.id)
        }
        XCTAssertEqual(engine.save.meta.completedResearch.values.filter { $0 }.count, catalog.items.count)
    }
}
