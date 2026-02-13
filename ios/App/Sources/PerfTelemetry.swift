import Foundation
import OSLog

enum PerfTelemetry {
    private static let logger = Logger(subsystem: "com.austinbeatty.farmsim", category: "perf")
    private static let signposter = OSSignposter(logger: logger)

    static func begin(_ name: StaticString) -> OSSignpostIntervalState {
        signposter.beginInterval(name)
    }

    static func end(_ name: StaticString, _ state: OSSignpostIntervalState) {
        signposter.endInterval(name, state)
    }

    static func elapsedMs(since start: ContinuousClock.Instant) -> Double {
        let elapsed = start.duration(to: ContinuousClock.now)
        return Double(elapsed.components.seconds) * 1000 + Double(elapsed.components.attoseconds) / 1_000_000_000_000_000
    }

    static func event(_ message: String) {
        logger.debug("\(message, privacy: .public)")
    }
}
