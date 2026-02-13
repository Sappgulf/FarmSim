import Foundation

public enum EconomySystem {
    public static func applyHarvestSale(player: inout PlayerState, crop: CropDef, quantity: Int = 1) {
        player.coins += max(0, crop.sellPrice) * max(1, quantity)
    }

    @discardableResult
    public static func buySeed(player: inout PlayerState, cropID: String, unitCost: Int, quantity: Int) -> Bool {
        let qty = max(1, quantity)
        let safeCost = max(0, unitCost)
        let totalCost = safeCost * qty
        guard player.coins >= totalCost else { return false }
        player.coins -= totalCost
        player.inventory.seeds[cropID, default: 0] += qty
        return true
    }

    @discardableResult
    public static func sellCrop(player: inout PlayerState, cropID: String, unitPrice: Int, quantity: Int) -> Bool {
        let qty = max(1, quantity)
        let owned = player.inventory.crops[cropID] ?? 0
        guard owned >= qty else { return false }
        player.inventory.crops[cropID] = owned - qty
        player.coins += max(0, unitPrice) * qty
        return true
    }
}
