import Foundation

private struct CropContentFile: Decodable {
    let schemaVersion: Int?
    let items: [CropContentItem]
}

private struct CropContentItem: Decodable {
    let id: String
    let name: String
    let cost: Int
    let baseValue: Int
    let growthTime: Int
}

private struct DecorContentFile: Decodable {
    let schemaVersion: Int?
    let items: [DecorContentItem]
}

private struct DecorContentItem: Decodable {
    let id: String
    let name: String
    let cost: Int
    let category: String?
    let seasonTags: [String]?
    let icon: String?
    let emoji: String?
    let description: String?
}

private struct FestivalContentFile: Decodable {
    let schemaVersion: Int?
    let items: [FestivalContentItem]
}

private struct FestivalContentItem: Decodable {
    let id: String
    let name: String
    let season: String?
    let cadence: String?
    let durationSeconds: Int?
    let duration: Int?
    let icon: String?
    let description: String?
}

private struct MinigameContentFile: Decodable {
    let schemaVersion: Int?
    let items: [MinigameContentItem]
}

private struct MinigameContentItem: Decodable {
    let id: String
    let title: String
    let rounds: Int?
    let instructions: String?
    let theme: MinigameTheme?
}

private struct MinigameTheme: Decodable {
    let icon: String?
}

public enum ContentLoaderError: Error, LocalizedError {
    case missingFile(String)
    case decodeFailure(String)
    case invalidContent(String)

    public var errorDescription: String? {
        switch self {
        case .missingFile(let message):
            return message
        case .decodeFailure(let message):
            return message
        case .invalidContent(let message):
            return message
        }
    }
}

public enum ContentLoader {
    public static func loadCropDefs(from url: URL) throws -> [CropDef] {
        let data: Data
        do {
            data = try Data(contentsOf: url)
        } catch {
            throw ContentLoaderError.missingFile("Unable to load crops content from \(url.path)")
        }
        return try loadCropDefs(from: data)
    }

    public static func loadCropDefs(from data: Data) throws -> [CropDef] {
        let decoded: CropContentFile
        do {
            decoded = try JSONDecoder().decode(CropContentFile.self, from: data)
        } catch {
            throw ContentLoaderError.decodeFailure("Failed to decode crops.json: \(error.localizedDescription)")
        }

        guard !decoded.items.isEmpty else {
            throw ContentLoaderError.invalidContent("crops.json contains no crop entries")
        }

        return decoded.items.map { item in
            let daysToGrow = max(1, Int(ceil(Double(max(item.growthTime, 1)) / 60.0)))
            return CropDef(
                id: item.id,
                name: item.name,
                daysToGrow: daysToGrow,
                seedCost: max(0, item.cost),
                sellPrice: max(0, item.baseValue)
            )
        }
    }

    public static func loadDecorDefs(from data: Data) throws -> [DecorDef] {
        let decoded: DecorContentFile
        do {
            decoded = try JSONDecoder().decode(DecorContentFile.self, from: data)
        } catch {
            throw ContentLoaderError.decodeFailure("Failed to decode decor.json: \(error.localizedDescription)")
        }

        return decoded.items.map { item in
            DecorDef(
                id: item.id,
                name: item.name,
                cost: item.cost,
                category: item.category ?? "misc",
                seasonTags: item.seasonTags ?? [],
                icon: item.emoji ?? item.icon ?? "🧺",
                details: item.description ?? ""
            )
        }
    }

    public static func loadFestivalDefs(from data: Data) throws -> [FestivalDef] {
        let decoded: FestivalContentFile
        do {
            decoded = try JSONDecoder().decode(FestivalContentFile.self, from: data)
        } catch {
            throw ContentLoaderError.decodeFailure("Failed to decode festivals.json: \(error.localizedDescription)")
        }

        return decoded.items.map { item in
            FestivalDef(
                id: item.id,
                name: item.name,
                season: item.season ?? "all",
                cadence: item.cadence ?? "weekly",
                durationSeconds: item.durationSeconds ?? item.duration ?? 0,
                icon: item.icon ?? "🎉",
                details: item.description ?? ""
            )
        }
    }

    public static func loadMinigameDefs(from data: Data) throws -> [MinigameDef] {
        let decoded: MinigameContentFile
        do {
            decoded = try JSONDecoder().decode(MinigameContentFile.self, from: data)
        } catch {
            throw ContentLoaderError.decodeFailure("Failed to decode minigames.json: \(error.localizedDescription)")
        }

        return decoded.items.map { item in
            MinigameDef(
                id: item.id,
                title: item.title,
                rounds: item.rounds ?? 1,
                icon: item.theme?.icon ?? "🎯",
                instructions: item.instructions ?? ""
            )
        }
    }
}
