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
        let wateredIncrement = 1.5 * safeGrowthMultiplier
        let dryIncrement = 0.5 * safeGrowthMultiplier

        for index in world.tiles.indices {
            var tile = world.tiles[index]
            if var planted = tile.planted {
                let isWatered = tile.state.watered
                planted.growthProgress += isWatered ? wateredIncrement : dryIncrement
                tile.planted = planted
            }
            
            // Tiles dry out every day
            tile.state.watered = false
            world.tiles[index] = tile
        }

        return Int.random(in: 0..<10_000, using: &rng)
    }
}
