import Foundation
import GameCore

struct CropDisplayInfo: Sendable, Equatable {
    let emoji: String
    let description: String
    let category: String
    let season: String
    let level: Int
}

struct AlmanacEntry: Identifiable, Sendable, Equatable {
    let id: String
    let section: String
    let title: String
    let icon: String
    let hint: String
}

enum FarmPalette: String, Codable, CaseIterable, Sendable, Identifiable {
    case meadow
    case sunrise
    case twilight

    var id: String { rawValue }

    var title: String {
        switch self {
        case .meadow: return "Meadow"
        case .sunrise: return "Sunrise"
        case .twilight: return "Twilight"
        }
    }
}

struct GameUserSettings: Codable, Sendable, Equatable {
    var hapticsEnabled: Bool = true
    var soundEnabled: Bool = true
    var reducedMotion: Bool = false
    var voiceOverHints: Bool = true
    var cropsReadyNotifications: Bool = false
    var farmName: String = "Willowbrook Farm"
    var palette: FarmPalette = .meadow
    var showTileCoordinates: Bool = false
    var particleEffects: Bool = true
    var targetFPS: Int = 60

    private enum CodingKeys: String, CodingKey {
        case hapticsEnabled
        case soundEnabled
        case reducedMotion
        case voiceOverHints
        case cropsReadyNotifications
        case farmName
        case palette
        case showTileCoordinates
        case particleEffects
        case targetFPS
    }

    init() { }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        hapticsEnabled = try container.decodeIfPresent(Bool.self, forKey: .hapticsEnabled) ?? true
        soundEnabled = try container.decodeIfPresent(Bool.self, forKey: .soundEnabled) ?? true
        reducedMotion = try container.decodeIfPresent(Bool.self, forKey: .reducedMotion) ?? false
        voiceOverHints = try container.decodeIfPresent(Bool.self, forKey: .voiceOverHints) ?? true
        cropsReadyNotifications = try container.decodeIfPresent(Bool.self, forKey: .cropsReadyNotifications) ?? false
        farmName = (try container.decodeIfPresent(String.self, forKey: .farmName)?.trimmingCharacters(in: .whitespacesAndNewlines))
            .flatMap { $0.isEmpty ? nil : $0 } ?? "Willowbrook Farm"
        palette = try container.decodeIfPresent(FarmPalette.self, forKey: .palette) ?? .meadow
        showTileCoordinates = try container.decodeIfPresent(Bool.self, forKey: .showTileCoordinates) ?? false
        particleEffects = try container.decodeIfPresent(Bool.self, forKey: .particleEffects) ?? true
        targetFPS = Self.clampFPS(try container.decodeIfPresent(Int.self, forKey: .targetFPS) ?? 60)
    }

    static func clampFPS(_ value: Int) -> Int {
        switch value {
        case ...30: return 30
        case 31...60: return 60
        default: return 120
        }
    }
}

struct FarmRenderTile: Equatable, Sendable {
    let index: Int
    let cropID: String?
    let plantedDay: Int?
    let isReady: Bool
    let progress: Double
    let watered: Bool
}

struct FarmRenderSnapshot: Equatable, Sendable {
    let day: Int
    let gridWidth: Int
    let gridHeight: Int
    let tiles: [FarmRenderTile]
}

struct TileSheetState: Sendable {
    let index: Int
    let cropID: String?
    let cropName: String
    let isReady: Bool
    let progress: Double
    let watered: Bool
}

struct WidgetFarmSnapshot: Sendable, Equatable {
    let farmName: String
    let day: Int
    let coins: Int
    let level: Int
    let readyCrops: Int
    let season: String
    let timeText: String
}

struct DailyTaskModel: Identifiable, Sendable, Equatable {
    enum Metric: String, Sendable {
        case coins
        case cropInventory
        case readyTiles
        case plantedTiles
    }

    let id: String
    let title: String
    let detail: String
    let metric: Metric
    let target: Int
    let cropID: String?
    let rewardCoins: Int
    let rewardXP: Int
}

struct BuildingPlan: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let category: String
    let requiredLevel: Int
    let maxLevel: Int
    let costs: [Int]
    let bonuses: [String]

    func costForNextLevel(currentLevel: Int) -> Int? {
        let index = max(0, currentLevel)
        guard index < costs.count else { return nil }
        return costs[index]
    }

    func bonusForLevel(_ level: Int) -> String {
        let index = max(0, min(maxLevel - 1, level - 1))
        guard bonuses.indices.contains(index) else { return "No bonus" }
        return bonuses[index]
    }
}

struct ResearchPlan: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let category: String
    let cost: Int
    let durationSeconds: Int
    let description: String
    let unlocks: [String]
    let prerequisites: [String]
}

struct GeneticsRecipe: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let parentA: String
    let parentB: String
    let outputCropID: String
    let levelRequirement: Int
    let notes: String

    func requiredParents() -> [String: Int] {
        if parentA == parentB {
            return [parentA: 2]
        }
        return [parentA: 1, parentB: 1]
    }
}

struct ExpansionPlan: Sendable, Equatable {
    let maxGrid: Int
    let costsByGridSize: [Int: Int]
}

struct BuildingSynergy: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let bonus: String
    let buildingIDs: [String]
}

struct LivestockTypePlan: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let cost: Int
    let requiredLevel: Int
    let spaceRequired: Int
    let maintenanceCost: Int
    let productionTimeSeconds: Int
    let productID: String
    let productAmount: Int
    let productValue: Int
}

struct PetTypePlan: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let cost: Int
    let maxLevel: Int
    let requiredLevel: Int
    let bonusLabel: String
    let bonusPerLevel: Double
}

struct FishTypePlan: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let rarity: Double
    let baseValue: Int
    let difficulty: Int
    let minSize: Int
    let maxSize: Int
    let description: String
}

struct PondUpgradePlan: Identifiable, Sendable, Equatable {
    let id: String
    let level: Int
    let name: String
    let capacity: Int
    let regenRate: Double
    let cost: Int
    let rarityBonus: Double
}

struct ChallengePlan: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let difficulty: String
    let metric: String
    let target: Int
    let rewardCoins: Int
    let rewardXP: Int
}
