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
}
