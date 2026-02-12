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
        XCTAssertTrue(engine.harvest(tileIndex: 0))

        XCTAssertEqual(engine.save.player.coins, 24)
        XCTAssertEqual(engine.save.player.inventory.crops["carrot"], 1)
    }

    func testSaveCodecRoundTrip() throws {
        let save = SaveGame(
            version: SaveCodec.currentVersion,
            player: PlayerState(coins: 10, xp: 2, inventory: Inventory(seeds: ["lettuce": 1], crops: [:])),
            world: WorldState.makeEmpty(day: 3, gridWidth: 2, gridHeight: 2)
        )

        let data = try SaveCodec.encode(save)
        let decoded = try SaveCodec.decode(data)

        XCTAssertEqual(decoded, save)
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

    private func sharedVectorsURL() throws -> URL {
        let fileURL = URL(fileURLWithPath: #filePath)
        let root = fileURL
            .deletingLastPathComponent() // GameCoreTests
            .deletingLastPathComponent() // Tests
            .deletingLastPathComponent() // GameCore
            .deletingLastPathComponent() // ios
            .deletingLastPathComponent() // repo root
        return root.appendingPathComponent("shared/tests-vectors/sim_vectors.json")
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
