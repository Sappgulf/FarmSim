import Foundation
import XCTest
@testable import GameCore

final class LivestockClaimTests: XCTestCase {
    func testCollectionCannotPayTwiceIncludingAfterReload() throws {
        var engine = GameCoreEngine(save: GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: [:]), cropDefs: [], seed: 1)
        engine.setLivestockCount(1, for: "chicken")
        let before = engine.save.player.coins
        XCTAssertTrue(engine.collectLivestockIncome(20))
        XCTAssertEqual(engine.save.player.coins, before + 20)
        XCTAssertFalse(engine.collectLivestockIncome(20))
        let reloaded = try SaveCodec.decode(SaveCodec.encode(engine.save))
        var resumed = GameCoreEngine(save: reloaded, cropDefs: [], seed: 1)
        XCTAssertFalse(resumed.collectLivestockIncome(20))
        resumed.advanceDay()
        XCTAssertTrue(resumed.collectLivestockIncome(20))
        XCTAssertEqual(resumed.save.player.coins, before + 40)
    }

    func testMissingLegacyClaimDecodesAndPreservesLivestock() throws {
        var engine = GameCoreEngine(save: GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: [:]), cropDefs: [], seed: 1)
        engine.setLivestockCount(2, for: "cow")
        var payload = try XCTUnwrap(JSONSerialization.jsonObject(with: SaveCodec.encode(engine.save)) as? [String: Any])
        payload["version"] = 16
        var meta = try XCTUnwrap(payload["meta"] as? [String: Any])
        meta.removeValue(forKey: "lastLivestockCollectionDay")
        payload["meta"] = meta
        let save = try SaveCodec.decode(JSONSerialization.data(withJSONObject: payload))
        XCTAssertEqual(save.version, 17)
        XCTAssertEqual(save.meta.lastLivestockCollectionDay, -1)
        XCTAssertEqual(save.meta.livestockCounts["cow"], 2)
    }

    func testNoAnimalOrInvalidPayoutCannotConsumeDailyClaim() {
        var engine = GameCoreEngine(save: GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: [:]), cropDefs: [], seed: 1)
        XCTAssertFalse(engine.collectLivestockIncome(20))
        engine.setLivestockCount(1, for: "chicken")
        XCTAssertFalse(engine.collectLivestockIncome(0))
        XCTAssertFalse(engine.collectLivestockIncome(-20))
        XCTAssertEqual(engine.save.meta.lastLivestockCollectionDay, -1)
        XCTAssertTrue(engine.collectLivestockIncome(20))
    }
}
