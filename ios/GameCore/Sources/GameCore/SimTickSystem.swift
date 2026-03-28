import Foundation

public enum SimTickSystem {
    @discardableResult
    public static func advanceDay(
        world: inout WorldState,
        rng: inout SeededRandomNumberGenerator,
        growthMultiplier: Double = 1.0
    ) -> Int {
        world.day += 1
        let safeGrowthMultiplier = max(0.1, growthMultiplier)
        let dayGrowthIncrement = 1.0 * safeGrowthMultiplier

        for index in world.tiles.indices {
            var tile = world.tiles[index]
            if var planted = tile.planted {
                // Keep crop readiness aligned with the shared day-based vector contract.
                planted.growthProgress += dayGrowthIncrement
                tile.planted = planted
            }
            
            // Tiles dry out every day
            tile.state.watered = false
            world.tiles[index] = tile
        }

        return Int.random(in: 0..<10_000, using: &rng)
    }
}
