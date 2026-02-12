import Foundation

public enum SimTickSystem {
    @discardableResult
    public static func advanceDay(world: inout WorldState, rng: inout SeededRandomNumberGenerator) -> Int {
        world.day += 1

        for index in world.tiles.indices {
            world.tiles[index].state.watered = false
        }

        return Int.random(in: 0..<10_000, using: &rng)
    }
}
