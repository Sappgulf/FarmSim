import Foundation

public enum HarvestSystem {
    public static func canHarvest(tile: Tile, cropDef: CropDef, currentDay: Int) -> Bool {
        guard let planted = tile.planted else { return false }
        let growthDays = currentDay - planted.plantedDay
        return growthDays >= cropDef.daysToGrow
    }

    @discardableResult
    public static func harvest(
        world: inout WorldState,
        inventory: inout Inventory,
        tileIndex: Int,
        cropDef: CropDef,
        currentDay: Int,
        quantity: Int = 1
    ) -> Bool {
        guard world.tiles.indices.contains(tileIndex) else { return false }
        let tile = world.tiles[tileIndex]
        guard canHarvest(tile: tile, cropDef: cropDef, currentDay: currentDay) else { return false }
        guard let planted = tile.planted else { return false }

        world.tiles[tileIndex].planted = nil
        inventory.crops[planted.cropID, default: 0] += max(1, quantity)
        return true
    }
}
