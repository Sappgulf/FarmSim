import Foundation
import GameCore
import XCTest
@testable import FarmSim

final class ResearchStoreTests: XCTestCase {
    @MainActor
    private struct Fixture {
        let store: GameStore
        let defaults: UserDefaults
        let suite: String
        let directory: URL
        let file: URL
        let now: TimeInterval

        func finish() {
            store.persistNow()
            defaults.removePersistentDomain(forName: suite)
            try? FileManager.default.removeItem(at: directory)
        }
    }

    @MainActor
    private func fixture(research: [String: Bool] = [:], daysAway: Int = 0, planted: Bool = false,
                         xp: Int = 0, crops: [String: Int] = [:], buildings: [String: Int] = [:]) throws -> Fixture {
        let now: TimeInterval = 100_000
        let suite = "FarmSim.ResearchTests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        var settings = GameUserSettings()
        settings.soundEnabled = false
        settings.hapticsEnabled = false
        defaults.set(try JSONEncoder().encode(settings), forKey: "com.farmsim.settings.v1")
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(suite)
        let file = directory.appendingPathComponent("farm.json")
        var save = GameCoreEngine.defaultSave(gridWidth: 2, gridHeight: 2, starterSeeds: ["wheat": 4], daySeed: 42)
        save.player.coins = 1_000
        save.player.xp = xp
        save.player.inventory.crops = crops
        save.meta.buildingLevels = buildings
        save.world.day = 10
        save.meta.time = TimeMetaState(currentTimeSeconds: 0, dayIndex: 10, lastRealWorldTimestamp: now - Double(daysAway) * 1_440)
        save.meta.completedResearch = research
        if planted { save.world.tiles[0].planted = PlantedCrop(cropID: "wheat", plantedDay: 10) }
        try SaveFileStore(fileURL: file).save(save)
        let store = GameStore(userDefaults: defaults, saveFileURL: file, nowTimestamp: now)
        XCTAssertFalse(SoundManager.shared.soundEnabled)
        XCTAssertFalse(SoundManager.shared.hapticsEnabled)
        return Fixture(store: store, defaults: defaults, suite: suite, directory: directory, file: file, now: now)
    }

    @MainActor
    func testResearchPurchaseAndRepeatedPurchaseAcrossReload() async throws {
        let f = try fixture()
        defer { f.finish() }
        let store = f.store
        XCTAssertFalse(store.completeResearch("composting"))
        XCTAssertEqual(store.save.player.coins, 1_000)
        XCTAssertTrue(store.completeResearch("beekeeping"))
        XCTAssertEqual(store.save.player.coins, 800)
        store.persistNow()
        let reloaded = GameStore(userDefaults: f.defaults, saveFileURL: f.file, nowTimestamp: f.now)
        XCTAssertTrue(reloaded.isResearchCompleted("beekeeping"))
        let original = reloaded.save
        XCTAssertFalse(reloaded.completeResearch("beekeeping"))
        XCTAssertEqual(reloaded.save, original)
        reloaded.persistNow()
    }

    @MainActor
    func testSeedShopOrdersUsableChoicesFirstAtDifferentProgressionLevels() async throws {
        for xp in [0, 1_000, 5_000] {
            let f = try fixture(xp: xp)
            defer { f.finish() }
            let choices = f.store.orderedSeedChoices
            XCTAssertEqual(choices.first?.id, "wheat")
            XCTAssertEqual(Set(choices.map(\.id)), Set(f.store.cropDefs.map(\.id)))
            var reachedLockedChoice = false
            for crop in choices {
                if f.store.isUnlocked(cropID: crop.id) {
                    XCTAssertFalse(reachedLockedChoice, "Usable seed buried below locked seeds: \(crop.id)")
                } else {
                    reachedLockedChoice = true
                }
            }
        }
    }

    @MainActor
    func testCompostingQuoteMatchesPurchaseWithoutDoubleDiscount() async throws {
        let f = try fixture(research: ["composting": true, "soil_enhancement": true])
        defer { f.finish() }
        let store = f.store
        let wheat = try XCTUnwrap(store.cropDefs.first { $0.id == "wheat" })
        let quote = try XCTUnwrap(store.seedPrice(for: wheat.id))
        let promotion = store.dailySpecialSeedIDs.contains(wheat.id) ? 0.8 : 1.0
        XCTAssertEqual(quote, max(1, Int((Double(wheat.seedCost) * 0.9 * promotion).rounded(.down))))
        let before = store.save.player.coins
        let seeds = store.seedCount(for: wheat.id)
        XCTAssertTrue(store.buySeed(cropID: wheat.id))
        XCTAssertEqual(store.save.player.coins, before - quote)
        XCTAssertEqual(store.seedCount(for: wheat.id), seeds + 1)
    }

    @MainActor
    func testColdCatchupAdvancesOnceAndReportsActualHoneyIncome() async throws {
        let f = try fixture(research: ["beekeeping": true, "irrigation_system": true], daysAway: 2, planted: true)
        defer { f.finish() }
        XCTAssertEqual(f.store.save.world.day, 12)
        XCTAssertEqual(f.store.save.meta.time.dayIndex, 12)
        XCTAssertEqual(f.store.save.player.coins, 1_010)
        XCTAssertEqual(try XCTUnwrap(f.store.save.world.tiles[0].planted).growthProgress, 3)
        let welcome = try XCTUnwrap(f.store.milestoneManager.pendingCelebrations.first { $0.title == "Welcome Back!" })
        XCTAssertEqual(welcome.coins, 10)
        XCTAssertEqual(welcome.xp, 0)
        f.store.persistNow()
        let resumed = GameStore(userDefaults: f.defaults, saveFileURL: f.file, nowTimestamp: f.now)
        XCTAssertEqual(resumed.save.world.day, 12)
        XCTAssertEqual(resumed.save.player.coins, 1_010)
        resumed.persistNow()
    }

    @MainActor
    func testOfflineCatchupCapDoesNotDoubleDaysOrIncome() async throws {
        let f = try fixture(research: ["beekeeping": true], daysAway: 30)
        defer { f.finish() }
        XCTAssertEqual(f.store.save.world.day, 24)
        XCTAssertEqual(f.store.save.meta.time.dayIndex, 24)
        XCTAssertEqual(f.store.save.player.coins, 1_070)
    }

    @MainActor
    func testActiveAndFastForwardDaysApplyResearchExactlyOnce() async throws {
        let f = try fixture(research: ["beekeeping": true, "irrigation_system": true, "aquaponics": true], planted: true)
        defer { f.finish() }
        f.store.setAppActive(true, now: f.now)
        f.store.stepAutoTime(now: f.now + 1_440)
        XCTAssertEqual(f.store.save.world.day, 11)
        XCTAssertEqual(f.store.save.player.coins, 1_005)
        XCTAssertEqual(try XCTUnwrap(f.store.save.world.tiles[0].planted).growthProgress, 1.65, accuracy: 0.000001)
        f.store.advanceDays(2)
        XCTAssertEqual(f.store.save.world.day, 13)
        XCTAssertEqual(f.store.save.meta.time.dayIndex, 13)
        XCTAssertEqual(f.store.save.player.coins, 1_015)
        XCTAssertEqual(try XCTUnwrap(f.store.save.world.tiles[0].planted).growthProgress, 4.95, accuracy: 0.000001)
    }

    @MainActor
    func testFishingPaysMatchingEncounterOnceAndCancellationPaysNothing() async throws {
        let f = try fixture(research: ["aquaponics": true, "market_analytics": true])
        defer { f.finish() }
        let encounter = try XCTUnwrap(f.store.beginFishingEncounter())
        let payout = max(1, Int((Double(encounter.fish.baseValue) * 1.2 * 1.1).rounded(.down)))
        let before = f.store.save.player.coins
        XCTAssertTrue(f.store.completeFishingEncounter(encounter.id, caught: true))
        XCTAssertEqual(f.store.save.player.coins, before + payout)
        XCTAssertEqual(f.store.save.meta.fishCaughtCounts[encounter.fish.id], 1)
        let caught = f.store.save
        XCTAssertFalse(f.store.completeFishingEncounter(encounter.id, caught: true))
        XCTAssertEqual(f.store.save, caught)
        let cancelled = try XCTUnwrap(f.store.beginFishingEncounter())
        f.store.cancelFishingEncounter(cancelled.id)
        XCTAssertFalse(f.store.completeFishingEncounter(cancelled.id, caught: true))
        XCTAssertEqual(f.store.save, caught)
    }

    @MainActor
    func testDailyAutoSalesMatchIndividualDaysDuringFastForwardAndColdCatchup() async throws {
        let daily = try fixture(crops: ["wheat": 100], buildings: ["silo": 2])
        let batch = try fixture(crops: ["wheat": 100], buildings: ["silo": 2])
        let cold = try fixture(daysAway: 3, crops: ["wheat": 100], buildings: ["silo": 2])
        defer { daily.finish(); batch.finish(); cold.finish() }
        for _ in 0..<3 { daily.store.advanceDay() }
        batch.store.advanceDays(3)
        XCTAssertEqual(daily.store.cropCount(for: "wheat"), 73)
        XCTAssertEqual(batch.store.cropCount(for: "wheat"), 73)
        XCTAssertEqual(cold.store.cropCount(for: "wheat"), 73)
        XCTAssertEqual(batch.store.save.player.coins, daily.store.save.player.coins)
        XCTAssertEqual(cold.store.save.player.coins, daily.store.save.player.coins)
    }

    @MainActor
    func testLevelRewardIsVisibleImmediatelyAndPersistsWithoutRepeat() async throws {
        let f = try fixture(xp: 390)
        defer { f.finish() }
        XCTAssertTrue(f.store.completeResearch("beekeeping"))
        XCTAssertEqual(f.store.save.player.coins, 1_000)
        XCTAssertEqual(f.store.save.player.xp, 590)
        XCTAssertEqual(f.store.playerLevel, 6)
        XCTAssertEqual(f.store.lastPlayerLevel, 6)
        XCTAssertEqual(f.store.seedCount(for: "wheat"), 9)
        XCTAssertEqual(f.store.seedCount(for: "carrot"), 5)
        let levelUp = try XCTUnwrap(f.store.milestoneManager.pendingCelebrations.first { $0.title == "Level Up!" })
        XCTAssertEqual(levelUp.message, "You reached level 6")
        let visible = f.store.save
        f.store.persistNow()
        XCTAssertEqual(try SaveFileStore(fileURL: f.file).load(), visible)
        let reloaded = GameStore(userDefaults: f.defaults, saveFileURL: f.file, nowTimestamp: f.now)
        XCTAssertEqual(reloaded.save.player, visible.player)
        XCTAssertTrue(reloaded.milestoneManager.unclaimedLevelMilestones(currentLevel: 6).isEmpty)
        reloaded.persistNow()
    }

    @MainActor
    func testLevelRewardXPSettlesNewlyReachedMilestonesInOneTransaction() async throws {
        let f = try fixture(xp: 790)
        defer { f.finish() }
        XCTAssertTrue(f.store.completeResearch("beekeeping"))
        XCTAssertEqual(f.store.save.player.xp, 1_190)
        XCTAssertEqual(f.store.save.player.coins, 1_400)
        XCTAssertEqual(f.store.playerLevel, 12)
        XCTAssertEqual(f.store.lastPlayerLevel, 12)
        XCTAssertEqual(f.store.seedCount(for: "corn"), 5)
        XCTAssertTrue(f.store.milestoneManager.unclaimedLevelMilestones(currentLevel: 12).isEmpty)
    }
}
