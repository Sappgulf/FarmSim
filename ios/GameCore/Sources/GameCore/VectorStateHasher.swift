import Foundation

public enum VectorStateHasher {
    private static func canonicalMap(_ map: [String: Int]) -> String {
        let entries = map.sorted { lhs, rhs in lhs.key < rhs.key }
        if entries.isEmpty { return "-" }
        return entries.map { "\($0.key):\($0.value)" }.joined(separator: ",")
    }

    public static func canonicalString(day: Int, coins: Int, tiles: [Tile], seeds: [String: Int], crops: [String: Int]) -> String {
        let tileToken = tiles.map { tile -> String in
            guard let planted = tile.planted else { return "-" }
            return "\(planted.cropID)@\(planted.plantedDay)"
        }.joined(separator: "|")

        return [
            "day=\(day)",
            "coins=\(coins)",
            "tiles=\(tileToken)",
            "seeds=\(canonicalMap(seeds))",
            "crops=\(canonicalMap(crops))",
        ].joined(separator: ";")
    }

    public static func canonicalString(for save: SaveGame) -> String {
        canonicalString(
            day: save.world.day,
            coins: save.player.coins,
            tiles: save.world.tiles,
            seeds: save.player.inventory.seeds,
            crops: save.player.inventory.crops
        )
    }
}
