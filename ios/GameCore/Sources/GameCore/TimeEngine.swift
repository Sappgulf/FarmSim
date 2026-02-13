import Foundation

public enum TimeEngineMode: String, Codable, Hashable, Sendable {
    case realTime
    case manualDebug
}

public struct TimeEngineConfig: Codable, Hashable, Sendable {
    public var secondsPerDay: Double
    public var ticksPerSecond: Double
    public var pauseInMenus: Bool
    public var offlineCatchup: Bool

    public init(
        secondsPerDay: Double = 1_440,
        ticksPerSecond: Double = 12,
        pauseInMenus: Bool = false,
        offlineCatchup: Bool = true
    ) {
        self.secondsPerDay = max(60, secondsPerDay)
        self.ticksPerSecond = max(1, ticksPerSecond)
        self.pauseInMenus = pauseInMenus
        self.offlineCatchup = offlineCatchup
    }
}

public protocol TimeEngineClock: Sendable {
    func nowTimestamp() -> TimeInterval
}

public struct SystemTimeEngineClock: TimeEngineClock {
    public init() { }

    public func nowTimestamp() -> TimeInterval {
        Date().timeIntervalSince1970
    }
}

public struct TimeAdvanceResult: Equatable, Sendable {
    public let elapsedSeconds: Double
    public let dayDelta: Int

    public init(elapsedSeconds: Double = 0, dayDelta: Int = 0) {
        self.elapsedSeconds = max(0, elapsedSeconds)
        self.dayDelta = max(0, dayDelta)
    }
}

public struct TimeEngine: Sendable {
    public var mode: TimeEngineMode
    public var config: TimeEngineConfig
    public private(set) var state: TimeMetaState

    public init(
        mode: TimeEngineMode = .realTime,
        config: TimeEngineConfig = TimeEngineConfig(),
        state: TimeMetaState = TimeMetaState()
    ) {
        self.mode = mode
        self.config = config
        self.state = state
    }

    @discardableResult
    public mutating func tick(now: TimeInterval, isPaused: Bool = false) -> TimeAdvanceResult {
        let safeNow = max(0, now)
        if state.lastRealWorldTimestamp <= 0 {
            state.lastRealWorldTimestamp = safeNow
            return TimeAdvanceResult()
        }

        let elapsed = max(0, safeNow - state.lastRealWorldTimestamp)
        state.lastRealWorldTimestamp = safeNow

        guard elapsed > 0 else { return TimeAdvanceResult() }
        guard !isPaused else { return TimeAdvanceResult() }
        guard mode == .realTime else { return TimeAdvanceResult() }

        return advanceByElapsed(elapsed)
    }

    @discardableResult
    public mutating func applyOfflineCatchup(now: TimeInterval, maxCatchupDays: Int = 14) -> TimeAdvanceResult {
        let safeNow = max(0, now)
        guard state.lastRealWorldTimestamp > 0 else {
            state.lastRealWorldTimestamp = safeNow
            return TimeAdvanceResult()
        }

        let elapsed = max(0, safeNow - state.lastRealWorldTimestamp)
        state.lastRealWorldTimestamp = safeNow

        guard elapsed > 0 else { return TimeAdvanceResult() }
        guard config.offlineCatchup else { return TimeAdvanceResult() }

        let maxDays = max(0, maxCatchupDays)
        let cap = Double(maxDays) * config.secondsPerDay
        let bounded = maxDays > 0 ? min(elapsed, cap) : 0
        return advanceByElapsed(bounded)
    }

    @discardableResult
    public mutating func fastForward(days: Int) -> TimeAdvanceResult {
        let safeDays = max(0, days)
        guard safeDays > 0 else { return TimeAdvanceResult() }
        return advanceByElapsed(Double(safeDays) * config.secondsPerDay)
    }

    public mutating func setLastRealWorldTimestamp(_ value: TimeInterval) {
        state.lastRealWorldTimestamp = max(0, value)
    }

    public var secondsIntoDay: Double {
        let dayLength = max(60, config.secondsPerDay)
        return state.currentTimeSeconds.truncatingRemainder(dividingBy: dayLength)
    }

    public var dayProgress: Double {
        let dayLength = max(60, config.secondsPerDay)
        return max(0, min(1, secondsIntoDay / dayLength))
    }

    private mutating func advanceByElapsed(_ elapsed: Double) -> TimeAdvanceResult {
        let dayLength = max(60, config.secondsPerDay)
        guard elapsed > 0 else { return TimeAdvanceResult() }

        var accumulated = max(0, state.currentTimeSeconds) + elapsed
        let dayDelta = Int(accumulated / dayLength)
        if dayDelta > 0 {
            state.dayIndex += dayDelta
            accumulated.formTruncatingRemainder(dividingBy: dayLength)
        }

        state.currentTimeSeconds = max(0, accumulated)
        return TimeAdvanceResult(elapsedSeconds: elapsed, dayDelta: dayDelta)
    }
}
