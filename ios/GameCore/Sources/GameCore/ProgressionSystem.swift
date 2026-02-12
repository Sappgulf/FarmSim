import Foundation

public enum ProgressionSystem {
    public static let xpPerLevel = 100

    public static func level(forXP xp: Int) -> Int {
        max(1, (max(0, xp) / xpPerLevel) + 1)
    }

    public static func yieldMultiplier(forLevel level: Int) -> Double {
        switch level {
        case 8...:
            return 1.5
        case 5...:
            return 1.25
        default:
            return 1.0
        }
    }

    public static func unlockedGrid(forLevel level: Int) -> Int {
        switch level {
        case 7...:
            return 6
        case 4...:
            return 5
        default:
            return 4
        }
    }
}
