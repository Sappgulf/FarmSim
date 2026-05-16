import CryptoKit
import Foundation
import XCTest
@testable import GameCore

final class GameCoreTests: XCTestCase {
    func testPlantAdvanceAndHarvestLoop() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 1, sellPrice: 24)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["carrot": 1])
        save.player.coins = 0

        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)

        XCTAssertTrue(engine.plant(tileIndex: 0, cropID: "carrot"))
        engine.advanceDay()
        XCTAssertFalse(engine.isTileReady(0))
        engine.advanceDay()
        XCTAssertTrue(engine.isTileReady(0))
        XCTAssertEqual(engine.harvest(tileIndex: 0), 1)

        XCTAssertEqual(engine.save.player.coins, 24)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 1)
    }

    func testAdvanceDayRespectsWeatherMultiplier() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 5, seedCost: 1, sellPrice: 24)

        var sunnySave = GameCoreEngine.defaultSave(gridWidth: 1, gridHeight: 1, starterSeeds: ["carrot": 1])
        sunnySave.player.coins = 0
        var sunnyEngine = GameCoreEngine(save: sunnySave, cropDefs: [carrot], seed: 42)
        XCTAssertTrue(sunnyEngine.plant(tileIndex: 0, cropID: "carrot"))
        sunnyEngine.advanceDay(growthMultiplier: 1.0, weatherMultiplier: 1.2)
        let sunnyProgress = sunnyEngine.save.world.tiles[0].planted?.growthProgress ?? 0

        var stormySave = GameCoreEngine.defaultSave(gridWidth: 1, gridHeight: 1, starterSeeds: ["carrot": 1])
        stormySave.player.coins = 0
        var stormyEngine = GameCoreEngine(save: stormySave, cropDefs: [carrot], seed: 42)
        XCTAssertTrue(stormyEngine.plant(tileIndex: 0, cropID: "carrot"))
        stormyEngine.advanceDay(growthMultiplier: 1.0, weatherMultiplier: 0.5)
        let stormyProgress = stormyEngine.save.world.tiles[0].planted?.growthProgress ?? 0

        XCTAssertGreaterThan(sunnyProgress, stormyProgress)
        XCTAssertEqual(sunnyProgress, 1.2, accuracy: 0.001)
        XCTAssertEqual(stormyProgress, 0.5, accuracy: 0.001)
    }

    func testHarvestAllRespectsMaxCapacity() throws {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 1, sellPrice: 24)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 1, starterSeeds: ["carrot": 2])
        save.player.coins = 0

        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 123)

        XCTAssertTrue(engine.plant(tileIndex: 0, cropID: "carrot"))
        XCTAssertTrue(engine.plant(tileIndex: 1, cropID: "carrot"))
        engine.advanceDay()
        engine.advanceDay()

        let harvested = engine.harvestAll(maxCapacity: 1)

        XCTAssertEqual(harvested, 1)
        XCTAssertEqual(engine.save.player.coins, 24)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 1)
        XCTAssertEqual(engine.save.world.tiles.filter { $0.planted != nil }.count, 1)
    }

    func testSaveCodecRoundTrip() throws {
        let save = SaveGame(
            version: SaveCodec.currentVersion,
            player: PlayerState(coins: 10, xp: 2, inventory: Inventory(seeds: ["lettuce": 1], crops: [:])),
            world: WorldState.makeEmpty(day: 3, gridWidth: 2, gridHeight: 2),
            meta: MetaState(
                buildingLevels: ["silo": 2],
                completedResearch: ["hybrid_crops": true],
                discoveredHybrids: ["super_carrot": true],
                expansionPurchases: 1
            )
        )

        let data = try SaveCodec.encode(save)
        let decoded = try SaveCodec.decode(data)

        XCTAssertEqual(decoded, save)
    }

    func testBuyFailsWhenCoinsInsufficient() {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 20, sellPrice: 24)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 10
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 1)

        let result = engine.buy(itemID: "carrot", quantity: 1)

        XCTAssertEqual(result.status, .insufficientCoins)
        XCTAssertEqual(engine.save.player.coins, 10)
        XCTAssertEqual(engine.save.player.inventory.seeds["carrot"], nil)
    }

    func testSellFailsWhenQuantityInsufficient() {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 24)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 0
        save.player.inventory.crops = ["carrot": 1]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 1)

        let result = engine.sell(itemID: "carrot", quantity: 2)

        XCTAssertEqual(result.status, .insufficientQuantity)
        XCTAssertEqual(engine.save.player.coins, 0)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 1)
    }

    func testBuyAndSellUpdateStateCorrectly() {
        let carrot = CropDef(id: "carrot", name: "Carrot", daysToGrow: 2, seedCost: 10, sellPrice: 30)
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2)
        save.player.coins = 100
        save.player.inventory.crops = ["carrot": 3]
        var engine = GameCoreEngine(save: save, cropDefs: [carrot], seed: 1)

        let buyResult = engine.buy(itemID: "carrot", quantity: 2, pricing: MarketPricing(seedUnitCosts: ["carrot": 8]))
        XCTAssertEqual(buyResult.status, .success)
        XCTAssertEqual(buyResult.totalPrice, 16)
        XCTAssertEqual(engine.save.player.coins, 84)
        XCTAssertEqual(engine.save.player.inventory.seeds["carrot"], 2)

        let sellResult = engine.sell(itemID: "carrot", quantity: 2, pricing: MarketPricing(cropUnitPrices: ["carrot": 25]))
        XCTAssertEqual(sellResult.status, .success)
        XCTAssertEqual(sellResult.totalPrice, 50)
        XCTAssertEqual(engine.save.player.coins, 134)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 1)
    }

    func testSaveCodecMigratesV1ToCurrentWithMetaDefaults() throws {
        let v1JSON = """
        {
          "version": 1,
          "daySeed": 99,
          "player": {
            "coins": 42,
            "xp": 7,
            "inventory": {
              "seeds": { "carrot": 2 },
              "crops": { "carrot": 1 }
            }
          },
          "world": {
            "day": 1,
            "gridWidth": 2,
            "gridHeight": 2,
            "tiles": [
              { "index": 0, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 1, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 2, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 3, "state": { "tilled": true, "watered": false }, "planted": null }
            ]
          }
        }
        """
        let data = Data(v1JSON.utf8)
        let migrated = try SaveCodec.decode(data)

        XCTAssertEqual(migrated.version, SaveCodec.currentVersion)
        XCTAssertEqual(migrated.meta.buildingLevels, [:])
        XCTAssertEqual(migrated.meta.completedResearch, [:])
        XCTAssertEqual(migrated.meta.discoveredHybrids, [:])
        XCTAssertEqual(migrated.meta.expansionPurchases, 0)
        XCTAssertEqual(migrated.meta.livestockCounts, [:])
        XCTAssertEqual(migrated.meta.petLevels, [:])
        XCTAssertEqual(migrated.meta.fishCaughtCounts, [:])
        XCTAssertEqual(migrated.meta.fishingPondLevel, 1)
        XCTAssertEqual(migrated.meta.challengeClaims, [:])
        XCTAssertEqual(migrated.meta.challengeStreak, 0)
        XCTAssertEqual(migrated.meta.favoriteItems, [:])
        XCTAssertEqual(migrated.meta.time.dayIndex, 1)
        XCTAssertEqual(migrated.meta.time.currentTimeSeconds, 0)
    }

    func testSaveCodecMigratesV2ToCurrent() throws {
        let v2JSON = """
        {
          "version": 2,
          "daySeed": 42,
          "player": {
            "coins": 12,
            "xp": 3,
            "inventory": {
              "seeds": { "carrot": 1 },
              "crops": {}
            }
          },
          "world": {
            "day": 2,
            "gridWidth": 2,
            "gridHeight": 2,
            "tiles": [
              { "index": 0, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 1, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 2, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 3, "state": { "tilled": true, "watered": false }, "planted": null }
            ]
          },
          "meta": {
            "buildingLevels": { "silo": 1 },
            "completedResearch": {},
            "discoveredHybrids": {},
            "expansionPurchases": 0
          }
        }
        """
        let data = Data(v2JSON.utf8)
        let migrated = try SaveCodec.decode(data)

        XCTAssertEqual(migrated.version, SaveCodec.currentVersion)
        XCTAssertEqual(migrated.meta.buildingLevels["silo"], 1)
        XCTAssertEqual(migrated.meta.favoriteItems, [:])
        XCTAssertEqual(migrated.meta.fishingPondLevel, 1)
        XCTAssertEqual(migrated.meta.time.dayIndex, 2)
    }

    func testSaveCodecMigratesV3ToCurrentAndKeepsTimeDefaults() throws {
        let v3JSON = """
        {
          "version": 3,
          "daySeed": 77,
          "player": {
            "coins": 18,
            "xp": 4,
            "inventory": {
              "seeds": { "carrot": 2 },
              "crops": {}
            }
          },
          "world": {
            "day": 5,
            "gridWidth": 2,
            "gridHeight": 2,
            "tiles": [
              { "index": 0, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 1, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 2, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 3, "state": { "tilled": true, "watered": false }, "planted": null }
            ]
          },
          "meta": {
            "buildingLevels": {},
            "completedResearch": {},
            "discoveredHybrids": {},
            "expansionPurchases": 0,
            "livestockCounts": {},
            "petLevels": {},
            "fishCaughtCounts": {},
            "fishingPondLevel": 1,
            "challengeClaims": {},
            "challengeStreak": 0
          }
        }
        """
        let data = Data(v3JSON.utf8)
        let migrated = try SaveCodec.decode(data)

        XCTAssertEqual(migrated.version, SaveCodec.currentVersion)
        XCTAssertEqual(migrated.meta.favoriteItems, [:])
        XCTAssertEqual(migrated.meta.time.dayIndex, 5)
        XCTAssertEqual(migrated.meta.time.currentTimeSeconds, 0)
        XCTAssertEqual(migrated.meta.time.lastRealWorldTimestamp, 0)
    }

    func testSaveCodecMigratesV4ToCurrentAndAddsFavoritesDefaults() throws {
        let v4JSON = """
        {
          "version": 4,
          "daySeed": 77,
          "player": {
            "coins": 18,
            "xp": 4,
            "inventory": {
              "seeds": { "carrot": 2 },
              "crops": {}
            }
          },
          "world": {
            "day": 5,
            "gridWidth": 2,
            "gridHeight": 2,
            "tiles": [
              { "index": 0, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 1, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 2, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 3, "state": { "tilled": true, "watered": false }, "planted": null }
            ]
          },
          "meta": {
            "buildingLevels": {},
            "completedResearch": {},
            "discoveredHybrids": {},
            "expansionPurchases": 0,
            "livestockCounts": {},
            "petLevels": {},
            "fishCaughtCounts": {},
            "fishingPondLevel": 1,
            "challengeClaims": {},
            "challengeStreak": 0,
            "time": {
              "currentTimeSeconds": 2,
              "dayIndex": 5,
              "lastRealWorldTimestamp": 123
            }
          }
        }
        """
        let data = Data(v4JSON.utf8)
        let migrated = try SaveCodec.decode(data)

        XCTAssertEqual(migrated.version, SaveCodec.currentVersion)
        XCTAssertEqual(migrated.meta.favoriteItems, [:])
        XCTAssertEqual(migrated.meta.time.dayIndex, 5)
    }

    func testSaveCodecCurrentVersionMatchesSharedSchemaBridge() {
        XCTAssertEqual(SaveCodec.currentVersion, 16)
    }

    func testCurrentSharedSaveExampleDecodes() throws {
        let exampleURL = try sharedSaveExampleURL()
        let data = try Data(contentsOf: exampleURL)
        let decoded = try SaveCodec.decode(data)

        XCTAssertEqual(decoded.version, SaveCodec.currentVersion)
        XCTAssertEqual(decoded.world.tiles.count, decoded.world.gridWidth * decoded.world.gridHeight)
        XCTAssertEqual(decoded.meta.favoriteItems.values.allSatisfy { $0 }, true)
    }

    func testContentLoaderAcceptsMatchingSchemaVersion() throws {
        let validJSON = """
        {
          "schemaVersion": 1,
          "items": [
            {
              "id": "radish",
              "name": "Radish",
              "cost": 7,
              "baseValue": 14,
              "growthTime": 60
            }
          ]
        }
        """

        let defs = try ContentLoader.loadCropDefs(from: Data(validJSON.utf8))

        XCTAssertEqual(defs.count, 1)
        XCTAssertEqual(defs.first?.id, "radish")
        XCTAssertEqual(defs.first?.daysToGrow, 1)
    }

    func testContentLoaderRejectsMismatchedSchemaVersion() {
        let invalidJSON = """
        {
          "schemaVersion": 2,
          "items": [
            {
              "id": "radish",
              "name": "Radish",
              "cost": 7,
              "baseValue": 14,
              "growthTime": 60
            }
          ]
        }
        """

        XCTAssertThrowsError(try ContentLoader.loadCropDefs(from: Data(invalidJSON.utf8))) { error in
            guard case ContentLoaderError.invalidContent(let message) = error else {
                return XCTFail("Expected invalidContent error, got \(error)")
            }
            XCTAssertTrue(message.contains("crops.json schemaVersion 2 is unsupported"))
            XCTAssertTrue(message.contains("expected 1"))
        }
    }

    func testSaveCodecMigratesV5ToCurrentAndPreservesKnownFields() throws {
        let v5JSON = """
        {
          "version": 5,
          "daySeed": 88,
          "player": {
            "coins": 64,
            "xp": 9,
            "inventory": {
              "seeds": { "carrot": 3 },
              "crops": { "carrot": 2 }
            }
          },
          "world": {
            "day": 7,
            "gridWidth": 2,
            "gridHeight": 2,
            "tiles": [
              { "index": 0, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 1, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 2, "state": { "tilled": true, "watered": false }, "planted": null },
              { "index": 3, "state": { "tilled": true, "watered": false }, "planted": null }
            ]
          },
          "meta": {
            "buildingLevels": { "silo": 2 },
            "completedResearch": { "hybrid_crops": true },
            "discoveredHybrids": { "super_carrot": true },
            "expansionPurchases": 1,
            "livestockCounts": { "chicken": 2 },
            "petLevels": { "dog": 1 },
            "fishCaughtCounts": { "common": 4 },
            "fishingPondLevel": 2,
            "challengeClaims": { "daily_task:test": 7 },
            "challengeStreak": 3,
            "favoriteItems": { "carrot": true, "junk": false },
            "time": {
              "currentTimeSeconds": 120,
              "dayIndex": 7,
              "lastRealWorldTimestamp": 5000
            }
          }
        }
        """
        let data = Data(v5JSON.utf8)
        let migrated = try SaveCodec.decode(data)

        XCTAssertEqual(migrated.version, SaveCodec.currentVersion)
        XCTAssertEqual(migrated.player.coins, 64)
        XCTAssertEqual(migrated.meta.buildingLevels["silo"], 2)
        XCTAssertEqual(migrated.meta.completedResearch["hybrid_crops"], true)
        XCTAssertEqual(migrated.meta.discoveredHybrids["super_carrot"], true)
        XCTAssertEqual(migrated.meta.favoriteItems, ["carrot": true])
        XCTAssertEqual(migrated.meta.time.currentTimeSeconds, 120)
        XCTAssertEqual(migrated.meta.time.dayIndex, 7)
        XCTAssertEqual(migrated.meta.time.lastRealWorldTimestamp, 5000)
    }

    func testTimeEngineTickAdvancesTimeAndRollsDay() {
        var engine = TimeEngine(
            config: TimeEngineConfig(secondsPerDay: 120, ticksPerSecond: 10, pauseInMenus: false, offlineCatchup: true),
            state: TimeMetaState(currentTimeSeconds: 0, dayIndex: 3, lastRealWorldTimestamp: 1_000)
        )

        let first = engine.tick(now: 1_030, isPaused: false)
        XCTAssertEqual(first.dayDelta, 0)
        XCTAssertEqual(first.elapsedSeconds, 30, accuracy: 0.0001)
        XCTAssertEqual(engine.state.dayIndex, 3)
        XCTAssertEqual(engine.state.currentTimeSeconds, 30, accuracy: 0.0001)

        let second = engine.tick(now: 1_120, isPaused: false)
        XCTAssertEqual(second.dayDelta, 1)
        XCTAssertEqual(second.elapsedSeconds, 90, accuracy: 0.0001)
        XCTAssertEqual(engine.state.dayIndex, 4)
        XCTAssertEqual(engine.state.currentTimeSeconds, 0, accuracy: 0.0001)
    }

    func testTimeEngineOfflineCatchupAdvancesExpectedDays() {
        var engine = TimeEngine(
            config: TimeEngineConfig(secondsPerDay: 60, ticksPerSecond: 10, pauseInMenus: false, offlineCatchup: true),
            state: TimeMetaState(currentTimeSeconds: 15, dayIndex: 2, lastRealWorldTimestamp: 1_000)
        )

        let result = engine.applyOfflineCatchup(now: 1_250, maxCatchupDays: 10)
        XCTAssertEqual(result.dayDelta, 4)
        XCTAssertEqual(engine.state.dayIndex, 6)
        XCTAssertEqual(engine.state.currentTimeSeconds, 25, accuracy: 0.0001)
    }

    func testTimeEnginePauseDoesNotAdvance() {
        var engine = TimeEngine(
            config: TimeEngineConfig(secondsPerDay: 300, ticksPerSecond: 10, pauseInMenus: true, offlineCatchup: true),
            state: TimeMetaState(currentTimeSeconds: 100, dayIndex: 1, lastRealWorldTimestamp: 1_000)
        )

        let paused = engine.tick(now: 1_100, isPaused: true)
        XCTAssertEqual(paused.dayDelta, 0)
        XCTAssertEqual(engine.state.dayIndex, 1)
        XCTAssertEqual(engine.state.currentTimeSeconds, 100, accuracy: 0.0001)
    }

    func testSharedVectorsMatchExpectedHashes() throws {
        let vectorsURL = try sharedVectorsURL()
        let data = try Data(contentsOf: vectorsURL)
        let doc = try JSONDecoder().decode(VectorDoc.self, from: data)

        XCTAssertEqual(doc.version, 1)

        for vector in doc.vectors {
            let gridWidth = Int(Double(vector.initialState.tiles.count).squareRoot())
            let tiles: [Tile] = vector.initialState.tiles.enumerated().map { index, tile in
                if let cropID = tile.cropId, let plantedDay = tile.plantedDay {
                    return Tile(index: index, planted: PlantedCrop(cropID: cropID, plantedDay: plantedDay))
                }
                return Tile(index: index)
            }

            let save = SaveGame(
                version: SaveCodec.currentVersion,
                player: PlayerState(
                    coins: vector.initialState.coins,
                    xp: 0,
                    inventory: Inventory(seeds: vector.initialState.seeds, crops: vector.initialState.crops)
                ),
                world: WorldState(
                    day: vector.initialState.day,
                    gridWidth: max(1, gridWidth),
                    gridHeight: max(1, gridWidth),
                    tiles: tiles
                )
            )

            let defs = vector.cropDefs.map { key, value in
                CropDef(id: key, name: key.capitalized, daysToGrow: value.daysToGrow, seedCost: 0, sellPrice: value.sellPrice)
            }

            var engine = GameCoreEngine(save: save, cropDefs: defs, seed: vector.seed)

            for action in vector.actions {
                switch action.type {
                case "advance_day":
                    engine.advanceDay()
                case "plant":
                    if let tile = action.tile, let cropID = action.cropId {
                        _ = engine.plant(tileIndex: tile, cropID: cropID)
                    }
                case "harvest":
                    if let tile = action.tile {
                        _ = engine.harvest(tileIndex: tile)
                    }
                default:
                    continue
                }
            }

            let canonical = VectorStateHasher.canonicalString(for: engine.save)
            let digest = SHA256.hash(data: Data(canonical.utf8))
            let hex = digest.map { String(format: "%02x", $0) }.joined()

            XCTAssertEqual(hex, vector.expectedEndStateHash, "Vector \(vector.id) hash mismatch")
        }
    }

    func testSimTickPerformance20x20() {
        let crop = CropDef(id: "carrot", name: "Carrot", daysToGrow: 3, seedCost: 1, sellPrice: 3)
        var save = GameCoreEngine.defaultSave(gridWidth: 20, gridHeight: 20, starterSeeds: ["carrot": 400])
        save.player.coins = 10_000
        var engine = GameCoreEngine(save: save, cropDefs: [crop], seed: 999)

        for tile in 0..<(20 * 20) {
            XCTAssertTrue(engine.plant(tileIndex: tile, cropID: "carrot"))
        }

        let tickCount = 120
        let start = ContinuousClock.now
        for _ in 0..<tickCount {
            engine.advanceDay()
        }
        let elapsed = start.duration(to: ContinuousClock.now)
        let totalMs = (Double(elapsed.components.seconds) * 1000) + (Double(elapsed.components.attoseconds) / 1_000_000_000_000_000)
        let avgTickMs = totalMs / Double(tickCount)
        print(String(format: "[perf] GameCore 20x20 avg sim tick: %.3fms", avgTickMs))

        XCTAssertLessThan(avgTickMs, 4.0, "Average sim tick exceeded budget: \(avgTickMs)ms")
    }

    private func sharedVectorsURL() throws -> URL {
        let fileURL = URL(fileURLWithPath: #filePath)
        let root = fileURL
            .deletingLastPathComponent() // GameCoreTests
            .deletingLastPathComponent() // Tests
            .deletingLastPathComponent() // GameCore
            .deletingLastPathComponent() // ios
            .deletingLastPathComponent() // repo root
        return root.appendingPathComponent("shared/vectors/sim_vectors.json")
    }

    private func sharedSaveExampleURL() throws -> URL {
        let fileURL = URL(fileURLWithPath: #filePath)
        let root = fileURL
            .deletingLastPathComponent() // GameCoreTests
            .deletingLastPathComponent() // Tests
            .deletingLastPathComponent() // GameCore
            .deletingLastPathComponent() // ios
            .deletingLastPathComponent() // repo root
        return root.appendingPathComponent("shared/schema/save-example.v16.json")
    }
}

private struct VectorDoc: Decodable {
    let version: Int
    let vectors: [VectorCase]
}

private struct VectorCase: Decodable {
    let id: String
    let seed: UInt64
    let cropDefs: [String: VectorCropDef]
    let initialState: VectorState
    let actions: [VectorAction]
    let expectedEndStateHash: String
}

private struct VectorCropDef: Decodable {
    let daysToGrow: Int
    let sellPrice: Int
}

private struct VectorState: Decodable {
    let day: Int
    let coins: Int
    let tiles: [VectorTile]
    let seeds: [String: Int]
    let crops: [String: Int]
}

private struct VectorTile: Decodable {
    let cropId: String?
    let plantedDay: Int?
}

private struct VectorAction: Decodable {
    let type: String
    let tile: Int?
    let cropId: String?
}
