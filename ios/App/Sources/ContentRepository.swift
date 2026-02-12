import Foundation
import GameCore

enum ContentRepositoryError: LocalizedError {
    case missing(String)
    case invalid(String)

    var errorDescription: String? {
        switch self {
        case .missing(let message):
            return message
        case .invalid(let message):
            return message
        }
    }
}

struct GameContent {
    let cropDefs: [CropDef]
    let cropDisplay: [String: CropDisplayInfo]
    let decorDefs: [DecorDef]
    let festivalDefs: [FestivalDef]
    let minigameDefs: [MinigameDef]
    let almanacEntries: [AlmanacEntry]
    let strings: [String: String]
}

enum ContentRepository {
    static func loadFromBundle() throws -> GameContent {
        let cropsData = try fileData(named: "crops")
        let decorData = try fileData(named: "decor")
        let festivalsData = try fileData(named: "festivals")
        let minigamesData = try fileData(named: "minigames")
        let almanacData = try fileData(named: "almanac")
        let stringsData = try fileData(named: "strings")

        let cropDefs = try ContentLoader.loadCropDefs(from: cropsData)
        guard !cropDefs.isEmpty else {
            throw ContentRepositoryError.invalid("crops.json has no entries")
        }

        let content = GameContent(
            cropDefs: cropDefs,
            cropDisplay: parseCropDisplay(from: cropsData),
            decorDefs: try ContentLoader.loadDecorDefs(from: decorData),
            festivalDefs: try ContentLoader.loadFestivalDefs(from: festivalsData),
            minigameDefs: try ContentLoader.loadMinigameDefs(from: minigamesData),
            almanacEntries: try parseAlmanac(from: almanacData),
            strings: try parseStrings(from: stringsData)
        )

        return content
    }

    private static func fileData(named name: String) throws -> Data {
        let bundle = Bundle.main
        guard let url = bundle.url(forResource: name, withExtension: "json", subdirectory: "content")
            ?? bundle.url(forResource: name, withExtension: "json") else {
            throw ContentRepositoryError.missing("Missing content/\(name).json in app bundle")
        }

        do {
            return try Data(contentsOf: url)
        } catch {
            throw ContentRepositoryError.invalid("Unable to read \(name).json: \(error.localizedDescription)")
        }
    }

    private static func parseCropDisplay(from data: Data) -> [String: CropDisplayInfo] {
        struct CropFile: Decodable { let items: [CropItem] }
        struct CropItem: Decodable {
            let id: String
            let emoji: String?
            let icon: String?
            let description: String?
            let category: String?
            let season: String?
            let level: Int?
        }

        guard let decoded = try? JSONDecoder().decode(CropFile.self, from: data) else {
            return [:]
        }

        return decoded.items.reduce(into: [String: CropDisplayInfo]()) { partial, item in
            partial[item.id] = CropDisplayInfo(
                emoji: item.emoji ?? item.icon ?? "🌱",
                description: item.description ?? "",
                category: item.category ?? "",
                season: item.season ?? "",
                level: item.level ?? 1
            )
        }
    }

    private static func parseAlmanac(from data: Data) throws -> [AlmanacEntry] {
        struct AlmanacFile: Decodable { let pages: [Page] }
        struct Page: Decodable {
            let id: String
            let section: String
            let title: String
            let icon: String?
            let hint: String?
        }

        do {
            let decoded = try JSONDecoder().decode(AlmanacFile.self, from: data)
            return decoded.pages.map {
                AlmanacEntry(
                    id: $0.id,
                    section: $0.section,
                    title: $0.title,
                    icon: $0.icon ?? "📖",
                    hint: $0.hint ?? ""
                )
            }
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode almanac.json: \(error.localizedDescription)")
        }
    }

    private static func parseStrings(from data: Data) throws -> [String: String] {
        struct StringsFile: Decodable {
            let ui: [String: String]?
        }

        do {
            let decoded = try JSONDecoder().decode(StringsFile.self, from: data)
            return decoded.ui ?? [:]
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode strings.json: \(error.localizedDescription)")
        }
    }
}
