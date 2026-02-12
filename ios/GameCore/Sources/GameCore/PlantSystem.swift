import Foundation

public enum PlantSystem {
    public static func plant(
        world: inout WorldState,
        inventory: inout Inventory,
        tileIndex: Int,
        crop: CropDef,
        currentDay: Int
    ) -> Bool {
        guard world.tiles.indices.contains(tileIndex) else { return false }
        guard world.tiles[tileIndex].planted == nil else { return false }

        let availableSeeds = inventory.seeds[crop.id] ?? 0
        guard availableSeeds > 0 else { return false }

        inventory.seeds[crop.id] = availableSeeds - 1
        world.tiles[tileIndex].planted = PlantedCrop(cropID: crop.id, plantedDay: currentDay)
        return true
    }
}
