import Foundation

// MARK: - Progression System

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

    // MARK: - XP Progression

    public static func xpToNextLevel(currentXP: Int) -> Int {
        let currentLevel = level(forXP: currentXP)
        let xpForCurrentLevel = (currentLevel - 1) * xpPerLevel
        let xpForNextLevel = currentLevel * xpPerLevel
        return xpForNextLevel - currentXP
    }

    public static func progressToNextLevel(currentXP: Int) -> Double {
        let currentLevel = level(forXP: currentXP)
        let xpForCurrentLevel = (currentLevel - 1) * xpPerLevel
        let xpForNextLevel = currentLevel * xpPerLevel
        let levelProgress = currentXP - xpForCurrentLevel
        let levelTotal = xpForNextLevel - xpForCurrentLevel
        return min(1.0, max(0.0, Double(levelProgress) / Double(levelTotal)))
    }

    // MARK: - Level Milestones

    public static let levelMilestones: [LevelMilestone] = [
        LevelMilestone(level: 5, rewardCoins: 200, rewardXP: 100, rewardSeeds: [("carrot", 5), ("wheat", 5)], unlocks: ["workshop"]),
        LevelMilestone(level: 10, rewardCoins: 400, rewardXP: 200, rewardSeeds: [("corn", 5), ("tomato", 3)], unlocks: ["well"]),
        LevelMilestone(level: 15, rewardCoins: 600, rewardXP: 300, rewardSeeds: [("strawberry", 5), ("potato", 5), ("chili", 3)], unlocks: ["windmill_preview"]),
        LevelMilestone(level: 20, rewardCoins: 1000, rewardXP: 500, rewardSeeds: [("super_carrot", 3), ("golden_tomato", 2), ("dragon_pepper", 1)], unlocks: ["windmill", "master_crops"]),
        LevelMilestone(level: 25, rewardCoins: 1500, rewardXP: 750, rewardSeeds: [("rainbow_corn", 3), ("frost_potato", 5)], unlocks: ["advanced_genetics"]),
        LevelMilestone(level: 50, rewardCoins: 5000, rewardXP: 2000, rewardSeeds: [("dragon_pepper", 10)], unlocks: ["legendary_farmer"]),
    ]

    public static func milestone(forLevel level: Int) -> LevelMilestone? {
        levelMilestones.first { $0.level == level }
    }
}

// MARK: - Level Milestone

public struct LevelMilestone: Sendable {
    public let level: Int
    public let rewardCoins: Int
    public let rewardXP: Int
    public let rewardSeeds: [(cropID: String, count: Int)]
    public let unlocks: [String]

    public init(
        level: Int,
        rewardCoins: Int = 0,
        rewardXP: Int = 0,
        rewardSeeds: [(String, Int)] = [],
        unlocks: [String] = []
    ) {
        self.level = level
        self.rewardCoins = max(0, rewardCoins)
        self.rewardXP = max(0, rewardXP)
        self.rewardSeeds = rewardSeeds
        self.unlocks = unlocks
    }
}

// MARK: - Milestone Types

public enum MilestoneType: String, CaseIterable, Sendable, Codable {
    case firstHarvest = "first_harvest"
    case firstSale = "first_sale"
    case firstExpansion = "first_expansion"
    case firstBuilding = "first_building"
    case firstLivestock = "first_livestock"
    case firstPet = "first_pet"
    case firstFish = "first_fish"
    case firstHybrid = "first_hybrid"
    case firstResearch = "first_research"
    case harvest100 = "harvest_100"
    case harvest500 = "harvest_500"
    case harvest1000 = "harvest_1000"
    case sell100 = "sell_100"
    case sell500 = "sell_500"
    case coins1000 = "coins_1000"
    case coins5000 = "coins_5000"
    case coins10000 = "coins_10000"
    case level5 = "level_5"
    case level10 = "level_10"
    case level15 = "level_15"
    case level20 = "level_20"
    case level25 = "level_25"
    case level50 = "level_50"
    case dailyStreak3 = "streak_3"
    case dailyStreak7 = "streak_7"
    case dailyStreak14 = "streak_14"
    case dailyStreak30 = "streak_30"

    public var displayName: String {
        switch self {
        case .firstHarvest: return "Green Thumb"
        case .firstSale: return "Market Debut"
        case .firstExpansion: return "Growing Pains"
        case .firstBuilding: return "Builder"
        case .firstLivestock: return "Animal Friend"
        case .firstPet: return "Best Friend"
        case .firstFish: return "Angler"
        case .firstHybrid: return "Gene Splicer"
        case .firstResearch: return "Scientist"
        case .harvest100: return "Harvest Season"
        case .harvest500: return "Bumper Crop"
        case .harvest1000: return "Master Farmer"
        case .sell100: return "Merchant"
        case .sell500: return "Tycoon"
        case .coins1000: return "Thousandaire"
        case .coins5000: return "Five Grand"
        case .coins10000: return "Ten Thousand Club"
        case .level5: return "Rising Star"
        case .level10: return "Established"
        case .level15: return "Veteran"
        case .level20: return "Master"
        case .level25: return "Legend"
        case .level50: return "Immortal"
        case .dailyStreak3: return "Committed"
        case .dailyStreak7: return "Weekly Warrior"
        case .dailyStreak14: return "Fortnight Farmer"
        case .dailyStreak30: return "Monthly Master"
        }
    }

    public var description: String {
        switch self {
        case .firstHarvest: return "Harvest your first crop"
        case .firstSale: return "Sell your first crop"
        case .firstExpansion: return "Expand your farm for the first time"
        case .firstBuilding: return "Construct your first building"
        case .firstLivestock: return "Purchase your first animal"
        case .firstPet: return "Adopt your first pet"
        case .firstFish: return "Catch your first fish"
        case .firstHybrid: return "Discover your first hybrid crop"
        case .firstResearch: return "Complete your first research project"
        case .harvest100: return "Harvest 100 crops total"
        case .harvest500: return "Harvest 500 crops total"
        case .harvest1000: return "Harvest 1,000 crops total"
        case .sell100: return "Sell 100 crops total"
        case .sell500: return "Sell 500 crops total"
        case .coins1000: return "Earn 1,000 coins total"
        case .coins5000: return "Earn 5,000 coins total"
        case .coins10000: return "Earn 10,000 coins total"
        case .level5: return "Reach level 5"
        case .level10: return "Reach level 10"
        case .level15: return "Reach level 15"
        case .level20: return "Reach level 20"
        case .level25: return "Reach level 25"
        case .level50: return "Reach level 50"
        case .dailyStreak3: return "3-day login streak"
        case .dailyStreak7: return "7-day login streak"
        case .dailyStreak14: return "14-day login streak"
        case .dailyStreak30: return "30-day login streak"
        }
    }

    public var icon: String {
        switch self {
        case .firstHarvest: return "🌱"
        case .firstSale: return "💰"
        case .firstExpansion: return "📐"
        case .firstBuilding: return "🏗️"
        case .firstLivestock: return "🐄"
        case .firstPet: return "🐕"
        case .firstFish: return "🎣"
        case .firstHybrid: return "🧬"
        case .firstResearch: return "🔬"
        case .harvest100, .harvest500, .harvest1000: return "🌾"
        case .sell100, .sell500: return "💵"
        case .coins1000, .coins5000, .coins10000: return "🏆"
        case .level5, .level10, .level15, .level20, .level25, .level50: return "⭐"
        case .dailyStreak3, .dailyStreak7, .dailyStreak14, .dailyStreak30: return "🔥"
        }
    }

    public var rewardCoins: Int {
        switch self {
        case .firstHarvest: return 50
        case .firstSale: return 50
        case .firstExpansion: return 100
        case .firstBuilding: return 75
        case .firstLivestock: return 100
        case .firstPet: return 75
        case .firstFish: return 50
        case .firstHybrid: return 150
        case .firstResearch: return 100
        case .harvest100: return 100
        case .harvest500: return 300
        case .harvest1000: return 500
        case .sell100: return 100
        case .sell500: return 400
        case .coins1000: return 100
        case .coins5000: return 300
        case .coins10000: return 500
        case .level5: return 200
        case .level10: return 400
        case .level15: return 600
        case .level20: return 800
        case .level25: return 1000
        case .level50: return 2500
        case .dailyStreak3: return 100
        case .dailyStreak7: return 250
        case .dailyStreak14: return 500
        case .dailyStreak30: return 1000
        }
    }

    public var rewardXP: Int {
        switch self {
        case .firstHarvest: return 25
        case .firstSale: return 25
        case .firstExpansion: return 50
        case .firstBuilding: return 40
        case .firstLivestock: return 50
        case .firstPet: return 40
        case .firstFish: return 25
        case .firstHybrid: return 75
        case .firstResearch: return 50
        case .harvest100: return 50
        case .harvest500: return 150
        case .harvest1000: return 300
        case .sell100: return 50
        case .sell500: return 200
        case .coins1000: return 50
        case .coins5000: return 150
        case .coins10000: return 300
        case .level5: return 0
        case .level10: return 0
        case .level15: return 0
        case .level20: return 0
        case .level25: return 0
        case .level50: return 0
        case .dailyStreak3: return 50
        case .dailyStreak7: return 100
        case .dailyStreak14: return 200
        case .dailyStreak30: return 400
        }
    }
}

// MARK: - Milestone State

public struct MilestoneState: Codable, Hashable, Sendable {
    public var completedMilestones: Set<String>
    public var completionDates: [String: TimeInterval]
    public var totalHarvested: Int
    public var totalSold: Int
    public var totalCoinsEarned: Int

    public init(
        completedMilestones: Set<String> = [],
        completionDates: [String: TimeInterval] = [:],
        totalHarvested: Int = 0,
        totalSold: Int = 0,
        totalCoinsEarned: Int = 0
    ) {
        self.completedMilestones = completedMilestones
        self.completionDates = completionDates
        self.totalHarvested = max(0, totalHarvested)
        self.totalSold = max(0, totalSold)
        self.totalCoinsEarned = max(0, totalCoinsEarned)
    }

    private enum CodingKeys: String, CodingKey {
        case completedMilestones
        case completionDates
        case totalHarvested
        case totalSold
        case totalCoinsEarned
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.completedMilestones = try container.decodeIfPresent(Set<String>.self, forKey: .completedMilestones) ?? []
        self.completionDates = try container.decodeIfPresent([String: TimeInterval].self, forKey: .completionDates) ?? [:]
        self.totalHarvested = max(0, try container.decodeIfPresent(Int.self, forKey: .totalHarvested) ?? 0)
        self.totalSold = max(0, try container.decodeIfPresent(Int.self, forKey: .totalSold) ?? 0)
        self.totalCoinsEarned = max(0, try container.decodeIfPresent(Int.self, forKey: .totalCoinsEarned) ?? 0)
    }
}

// MARK: - Daily Login State

public struct DailyLoginState: Codable, Hashable, Sendable {
    public var lastLoginDate: TimeInterval
    public var streak: Int
    public var longestStreak: Int
    public var totalLogins: Int

    public init(
        lastLoginDate: TimeInterval = 0,
        streak: Int = 0,
        longestStreak: Int = 0,
        totalLogins: Int = 0
    ) {
        self.lastLoginDate = max(0, lastLoginDate)
        self.streak = max(0, streak)
        self.longestStreak = max(0, longestStreak)
        self.totalLogins = max(0, totalLogins)
    }

    private enum CodingKeys: String, CodingKey {
        case lastLoginDate
        case streak
        case longestStreak
        case totalLogins
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.lastLoginDate = max(0, try container.decodeIfPresent(TimeInterval.self, forKey: .lastLoginDate) ?? 0)
        self.streak = max(0, try container.decodeIfPresent(Int.self, forKey: .streak) ?? 0)
        self.longestStreak = max(0, try container.decodeIfPresent(Int.self, forKey: .longestStreak) ?? 0)
        self.totalLogins = max(0, try container.decodeIfPresent(Int.self, forKey: .totalLogins) ?? 0)
    }
}

// MARK: - Welcome Back Calculation

public struct WelcomeBackInfo: Sendable {
    public let daysAway: Int
    public let hoursAway: Int
    public let coinsEarned: Int
    public let xpEarned: Int
    public let cropsGrown: Int
    public let cropsReady: Int
    public let streakMaintained: Bool
    public let streakBonus: Int

    public init(
        daysAway: Int = 0,
        hoursAway: Int = 0,
        coinsEarned: Int = 0,
        xpEarned: Int = 0,
        cropsGrown: Int = 0,
        cropsReady: Int = 0,
        streakMaintained: Bool = false,
        streakBonus: Int = 0
    ) {
        self.daysAway = max(0, daysAway)
        self.hoursAway = max(0, hoursAway)
        self.coinsEarned = max(0, coinsEarned)
        self.xpEarned = max(0, xpEarned)
        self.cropsGrown = max(0, cropsGrown)
        self.cropsReady = max(0, cropsReady)
        self.streakMaintained = streakMaintained
        self.streakBonus = max(0, streakBonus)
    }
}

// MARK: - Codable Conformance for Set<String>

extension Set: Codable where Element == String {
    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let array = try container.decode([String].self)
        self.init(array)
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(Array(self))
    }
}
