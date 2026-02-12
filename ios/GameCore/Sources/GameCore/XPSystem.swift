import Foundation

public enum XPSystem {
    public static func applyHarvestXP(player: inout PlayerState, crop: CropDef) {
        let gainedXP = max(1, crop.sellPrice / 5)
        player.xp += gainedXP
    }
}
