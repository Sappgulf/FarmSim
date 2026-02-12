import Foundation

public enum XPSystem {
    public static func applyHarvestXP(player: inout PlayerState, crop: CropDef, quantity: Int = 1) {
        let gainedXP = max(1, crop.sellPrice / 5)
        player.xp += gainedXP * max(1, quantity)
    }
}
