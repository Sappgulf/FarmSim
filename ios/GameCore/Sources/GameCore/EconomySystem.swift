import Foundation

public enum EconomySystem {
    public static func applyHarvestSale(player: inout PlayerState, crop: CropDef) {
        player.coins += max(0, crop.sellPrice)
    }
}
