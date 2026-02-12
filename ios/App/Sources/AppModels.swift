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
