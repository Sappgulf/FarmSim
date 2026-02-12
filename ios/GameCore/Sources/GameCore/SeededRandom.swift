import Foundation

public struct SeededRandomNumberGenerator: RandomNumberGenerator, Sendable {
    private var state: UInt64

    public init(seed: UInt64) {
        self.state = seed == 0 ? 0x9E3779B97F4A7C15 : seed
    }

    public var currentState: UInt64 {
        state
    }

    public mutating func next() -> UInt64 {
        state = 6364136223846793005 &* state &+ 1442695040888963407
        return state
    }
}
