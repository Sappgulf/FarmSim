import Foundation

public enum SimTickSystem {
    @discardableResult
    public static func advanceDay(
        world: inout WorldState,
        rng: inout SeededRandomNumberGenerator,
        growthMultiplier: Double = 1.0
    ) -> Int {
        world.day += 1

        for index in world.tiles.indices {
            let isWatered = world.tiles[index].state.watered
            
            if var planted = world.tiles[index].planted {
                // Base growth is 1 day. 
                // We add a bonus for water, and multiply by global growth multipliers (buildings/research).
                let waterBonus = isWatered ? 0.5 : 0.0 // Water gives 50% extra growth
                let baseInc = isWatered ? 1.0 : 0.5   // Dry soil grows at 50% speed
                
                let increment = (baseInc + waterBonus) * max(0.1, growthMultiplier)
                planted.growthProgress += increment
                world.tiles[index].planted = planted
            }
            
            // Tiles dry out every day
            world.tiles[index].state.watered = false
        }

        return Int.random(in: 0..<10_000, using: &rng)
    }
}
