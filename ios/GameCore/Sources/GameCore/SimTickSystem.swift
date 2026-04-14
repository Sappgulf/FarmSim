import Foundation

public enum SimTickSystem {
    public static let wateredGrowthBonus: Double = 0.5

    @discardableResult
    public static func advanceDay(
        world: inout WorldState,
        rng: inout SeededRandomNumberGenerator,
        growthMultiplier: Double = 1.0
    ) -> Int {
        world.day += 1
        let safeGrowthMultiplier = max(0.1, growthMultiplier)
        let baseGrowth = 1.0 * safeGrowthMultiplier

        for index in world.tiles.indices {
            var tile = world.tiles[index]
            if var planted = tile.planted {
                var totalGrowth = baseGrowth
                if tile.state.watered {
                    totalGrowth += wateredGrowthBonus * safeGrowthMultiplier
                }
                planted.growthProgress += totalGrowth
                tile.planted = planted
            }
            
            tile.state.watered = false
            world.tiles[index] = tile
        }

        return Int.random(in: 0..<10_000, using: &rng)
    }
}
