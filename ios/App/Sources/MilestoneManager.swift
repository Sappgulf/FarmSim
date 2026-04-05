import Foundation
import GameCore
import SwiftUI

// MARK: - Milestone Celebration Event

@MainActor
public struct MilestoneEvent: Sendable, Identifiable {
    public let id = UUID()
    public let type: MilestoneEventType
    public let title: String
    public let message: String
    public let icon: String
    public let coins: Int
    public let xp: Int

    public init(type: MilestoneEventType, title: String, message: String, icon: String, coins: Int, xp: Int) {
        self.type = type
        self.title = title
        self.message = message
        self.icon = icon
        self.coins = max(0, coins)
        self.xp = max(0, xp)
    }
}

public enum MilestoneEventType: Sendable {
    case milestone(MilestoneType)
    case levelUp(Int)
    case dailyStreak(Int)
    case welcomeBack(WelcomeBackInfo)
    case seasonStart(String)
}

// MARK: - Milestone Manager

@MainActor
public final class MilestoneManager: ObservableObject {
    @Published public private(set) var milestoneState: MilestoneState
    @Published public private(set) var dailyLogin: DailyLoginState
    @Published public private(set) var pendingCelebrations: [MilestoneEvent] = []

    private var claimedLevelMilestones: Set<Int>

    public init(
        milestoneState: MilestoneState = MilestoneState(),
        dailyLogin: DailyLoginState = DailyLoginState()
    ) {
        self.milestoneState = milestoneState
        self.dailyLogin = dailyLogin
        self.claimedLevelMilestones = []
    }

    // MARK: - Daily Login

    public func processDailyLogin(now: TimeInterval = Date().timeIntervalSince1970) -> (streakIncreased: Bool, streakBroken: Bool, streak: Int) {
        let calendar = Calendar.current
        let lastLogin = Date(timeIntervalSince1970: dailyLogin.lastLoginDate)
        let currentDate = Date(timeIntervalSince1970: now)

        let lastLoginDay = calendar.startOfDay(for: lastLogin)
        let currentDay = calendar.startOfDay(for: currentDate)

        guard lastLoginDay != currentDay else {
            return (streakIncreased: false, streakBroken: false, streak: dailyLogin.streak)
        }

        let components = calendar.dateComponents([.day], from: lastLoginDay, to: currentDay)
        let daysDifference = components.day ?? 0

        var streakIncreased = false
        var streakBroken = false

        if daysDifference == 1 {
            dailyLogin.streak += 1
            streakIncreased = true
        } else if daysDifference > 1 {
            dailyLogin.streak = 1
            streakBroken = true
        } else {
            dailyLogin.streak = 1
            streakIncreased = true
        }

        dailyLogin.longestStreak = max(dailyLogin.longestStreak, dailyLogin.streak)
        dailyLogin.totalLogins += 1
        dailyLogin.lastLoginDate = now

        return (streakIncreased: streakIncreased, streakBroken: streakBroken, streak: dailyLogin.streak)
    }

    public func streakMilestone(fromStreak streak: Int) -> MilestoneType? {
        switch streak {
        case 30: return .dailyStreak30
        case 14: return .dailyStreak14
        case 7: return .dailyStreak7
        case 3: return .dailyStreak3
        default: return nil
        }
    }

    // MARK: - Milestone Tracking

    public func checkMilestone(_ type: MilestoneType) -> Bool {
        !milestoneState.completedMilestones.contains(type.rawValue)
    }

    @discardableResult
    public func completeMilestone(_ type: MilestoneType, at timestamp: TimeInterval = Date().timeIntervalSince1970) -> MilestoneEvent? {
        guard checkMilestone(type) else { return nil }
        milestoneState.completedMilestones.insert(type.rawValue)
        milestoneState.completionDates[type.rawValue] = timestamp

        let event = MilestoneEvent(
            type: .milestone(type),
            title: "Achievement Unlocked!",
            message: "\(type.displayName): \(type.description)",
            icon: type.icon,
            coins: type.rewardCoins,
            xp: type.rewardXP
        )
        pendingCelebrations.append(event)
        return event
    }

    public func recordHarvest(count: Int) {
        milestoneState.totalHarvested += max(0, count)
    }

    public func recordSale(count: Int, value: Int) {
        milestoneState.totalSold += max(0, count)
        milestoneState.totalCoinsEarned += max(0, value)
    }

    // MARK: - Progressive Milestone Checks

    public func checkProgressiveMilestones(harvested: Int? = nil, sold: Int? = nil, coinsEarned: Int? = nil) -> [MilestoneEvent] {
        var newlyCompleted: [MilestoneEvent] = []

        if let harvested = harvested ?? (harvested == nil ? milestoneState.totalHarvested : nil) {
            if harvested >= 1000 && checkMilestone(.harvest1000) {
                if let event = completeMilestone(.harvest1000) { newlyCompleted.append(event) }
            } else if harvested >= 500 && checkMilestone(.harvest500) {
                if let event = completeMilestone(.harvest500) { newlyCompleted.append(event) }
            } else if harvested >= 100 && checkMilestone(.harvest100) {
                if let event = completeMilestone(.harvest100) { newlyCompleted.append(event) }
            }
        }

        if let sold = sold ?? (sold == nil ? milestoneState.totalSold : nil) {
            if sold >= 500 && checkMilestone(.sell500) {
                if let event = completeMilestone(.sell500) { newlyCompleted.append(event) }
            } else if sold >= 100 && checkMilestone(.sell100) {
                if let event = completeMilestone(.sell100) { newlyCompleted.append(event) }
            }
        }

        if let coinsEarned = coinsEarned ?? (coinsEarned == nil ? milestoneState.totalCoinsEarned : nil) {
            if coinsEarned >= 10000 && checkMilestone(.coins10000) {
                if let event = completeMilestone(.coins10000) { newlyCompleted.append(event) }
            } else if coinsEarned >= 5000 && checkMilestone(.coins5000) {
                if let event = completeMilestone(.coins5000) { newlyCompleted.append(event) }
            } else if coinsEarned >= 1000 && checkMilestone(.coins1000) {
                if let event = completeMilestone(.coins1000) { newlyCompleted.append(event) }
            }
        }

        return newlyCompleted
    }

    public func checkLevelMilestones(level: Int) -> [MilestoneEvent] {
        var newlyCompleted: [MilestoneEvent] = []

        let levelMilestones: [(Int, MilestoneType)] = [
            (50, .level50),
            (25, .level25),
            (20, .level20),
            (15, .level15),
            (10, .level10),
            (5, .level5)
        ]

        for (targetLevel, milestoneType) in levelMilestones {
            if level >= targetLevel && checkMilestone(milestoneType) {
                if let event = completeMilestone(milestoneType) {
                    newlyCompleted.append(event)
                }
            }
        }

        return newlyCompleted
    }

    public func unclaimedLevelMilestones(currentLevel: Int) -> [LevelMilestone] {
        ProgressionSystem.levelMilestones.filter { milestone in
            milestone.level <= currentLevel && !claimedLevelMilestones.contains(milestone.level)
        }
    }

    @discardableResult
    public func claimLevelMilestone(_ milestone: LevelMilestone) -> Bool {
        guard milestone.level > 0 else { return false }
        claimedLevelMilestones.insert(milestone.level)
        return true
    }

    // MARK: - Level Up Celebration

    public func createLevelUpEvent(level: Int) -> MilestoneEvent {
        let event = MilestoneEvent(
            type: .levelUp(level),
            title: "Level Up!",
            message: "You reached level \(level)",
            icon: "⭐",
            coins: 0,
            xp: 0
        )
        pendingCelebrations.append(event)
        return event
    }

    // MARK: - Welcome Back Celebration

    public func createWelcomeBackEvent(info: WelcomeBackInfo) -> MilestoneEvent? {
        guard info.daysAway > 0 || info.hoursAway > 0 else { return nil }

        var messageParts: [String] = []
        if info.daysAway > 0 {
            messageParts.append("Welcome back after \(info.daysAway) day\(info.daysAway == 1 ? "" : "s")!")
        } else {
            messageParts.append("Welcome back after \(info.hoursAway) hour\(info.hoursAway == 1 ? "" : "s")!")
        }

        if info.cropsReady > 0 {
            messageParts.append("\(info.cropsReady) crop\(info.cropsReady == 1 ? " is" : "s are") ready to harvest.")
        }

        if info.coinsEarned > 0 {
            messageParts.append("Auto-sold crops earned \(info.coinsEarned) coins.")
        }

        if info.streakMaintained {
            messageParts.append("Daily streak maintained: \(info.streakBonus) day\(info.streakBonus == 1 ? "" : "s")!")
        } else if info.streakBonus > 0 {
            messageParts.append("Streak bonus: \(info.streakBonus) coins!")
        }

        let event = MilestoneEvent(
            type: .welcomeBack(info),
            title: "Welcome Back!",
            message: messageParts.joined(separator: " "),
            icon: "👋",
            coins: info.coinsEarned + info.streakBonus,
            xp: info.xpEarned
        )
        pendingCelebrations.append(event)
        return event
    }

    // MARK: - Daily Streak Celebration

    public func createDailyStreakEvent(streak: Int) -> MilestoneEvent? {
        guard streak > 1 else { return nil }

        let bonusCoins = min(100, streak * 10)
        let event = MilestoneEvent(
            type: .dailyStreak(streak),
            title: "\(streak)-Day Streak!",
            message: "Keep it up! Daily login bonus: \(bonusCoins) coins",
            icon: "🔥",
            coins: bonusCoins,
            xp: min(50, streak * 5)
        )
        pendingCelebrations.append(event)
        return event
    }

    // MARK: - Season Start Celebration

    @discardableResult
    public func createSeasonStartEvent(season: String, icon: String) -> MilestoneEvent {
        let messages: [String: String] = [
            "Spring": "Flowers bloom and the soil warms. Time to plant new crops!",
            "Summer": "The sun blazes! Perfect weather for fast-growing crops.",
            "Autumn": "Leaves turn golden — harvest what you can before frost.",
            "Winter": "The fields rest under frost. Cold-hardy crops thrive now."
        ]
        let event = MilestoneEvent(
            type: .seasonStart(season),
            title: "\(season) Has Arrived!",
            message: messages[season] ?? "A new season begins on the farm.",
            icon: icon,
            coins: 0,
            xp: 0
        )
        pendingCelebrations.append(event)
        return event
    }

    // MARK: - Celebration Queue Management

    public func dismissNextCelebration() {
        guard !pendingCelebrations.isEmpty else { return }
        pendingCelebrations.removeFirst()
    }

    public func dismissCelebration(id: UUID) {
        pendingCelebrations.removeAll { $0.id == id }
    }

    public func clearAllCelebrations() {
        pendingCelebrations.removeAll()
    }

    // MARK: - Serialization

    public var encodedState: Data? {
        try? JSONEncoder().encode(milestoneState)
    }

    public var encodedDailyLogin: Data? {
        try? JSONEncoder().encode(dailyLogin)
    }

    public var encodedClaimedLevels: Data? {
        try? JSONEncoder().encode(Array(claimedLevelMilestones))
    }

    public func loadMilestoneState(from data: Data?) {
        guard let data = data,
              let decoded = try? JSONDecoder().decode(MilestoneState.self, from: data) else { return }
        self.milestoneState = decoded
    }

    public func loadDailyLogin(from data: Data?) {
        guard let data = data,
              let decoded = try? JSONDecoder().decode(DailyLoginState.self, from: data) else { return }
        self.dailyLogin = decoded
    }

    public func loadClaimedLevels(from data: Data?) {
        guard let data = data,
              let decoded = try? JSONDecoder().decode([Int].self, from: data) else { return }
        self.claimedLevelMilestones = Set(decoded)
    }
}
