import XCTest
@testable import FarmSim

private actor HeldSoundPlayback: SoundPlayback {
    private var gate: CheckedContinuation<Void, Never>?
    private var startWaiters: [CheckedContinuation<Void, Never>] = []
    private(set) var preparations = 0
    private(set) var played: [SoundManager.SoundEffect] = []
    let failure: String?

    init(failure: String? = nil) { self.failure = failure }

    func prepare() async -> String? {
        preparations += 1
        for waiter in startWaiters { waiter.resume() }
        startWaiters.removeAll()
        await withCheckedContinuation { gate = $0 }
        return failure
    }

    func waitForPreparation() async {
        if preparations > 0 { return }
        await withCheckedContinuation { startWaiters.append($0) }
    }

    func release() { gate?.resume(); gate = nil }
    func play(_ effect: SoundManager.SoundEffect) { played.append(effect) }
    func stop() { }
}

final class SoundManagerTests: XCTestCase {
    @MainActor
    func testMutedSoundNeverPreparesTheAudioEngine() async {
        let playback = HeldSoundPlayback()
        let manager = SoundManager(playback: playback)
        manager.updateSettings(sound: false, haptics: false)
        XCTAssertNil(manager.play(.purchase))
        let preparations = await playback.preparations
        XCTAssertEqual(preparations, 0)
    }

    @MainActor
    func testMuteDuringPreparationCancelsQueuedSoundWithoutBlockingUI() async throws {
        let playback = HeldSoundPlayback()
        let manager = SoundManager(playback: playback)
        let task = try XCTUnwrap(manager.play(.harvest))
        await playback.waitForPreparation()
        // MainActor can change settings while audio preparation is deliberately suspended.
        manager.updateSettings(sound: false, haptics: false)
        await playback.release()
        await task.value
        let played = await playback.played
        XCTAssertTrue(played.isEmpty)
    }

    @MainActor
    func testPreparedSoundPlaysAndFailureRemainsDiagnosable() async throws {
        for failure in [nil, "Audio route unavailable"] as [String?] {
            let playback = HeldSoundPlayback(failure: failure)
            let manager = SoundManager(playback: playback)
            let task = try XCTUnwrap(manager.play(.success))
            await playback.waitForPreparation()
            await playback.release()
            await task.value
            XCTAssertEqual(manager.lastAudioError, failure)
            let played = await playback.played
            XCTAssertEqual(played, failure == nil ? [.success] : [])
        }
    }

    func testRealSynthesizedAudioPreparesOffTheMainThread() async {
        let playback = SynthesizedSoundPlayback()
        let failure = await playback.prepare()
        XCTAssertNil(failure)
        let preparedOnMain = await playback.preparationWasOnMainThread
        XCTAssertEqual(preparedOnMain, false)
        await playback.play(.click)
        await playback.stop()
    }
}
