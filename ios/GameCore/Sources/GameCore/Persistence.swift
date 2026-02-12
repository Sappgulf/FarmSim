import Foundation

public enum SaveMigrationError: Error, LocalizedError {
    case unsupportedVersion(Int)

    public var errorDescription: String? {
        switch self {
        case .unsupportedVersion(let version):
            return "Unsupported save version: \(version). Add migration before loading."
        }
    }
}

public enum SaveCodec {
    public static let currentVersion = 1

    public static func encode(_ save: SaveGame) throws -> Data {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try encoder.encode(save)
    }

    public static func decode(_ data: Data) throws -> SaveGame {
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(SaveGame.self, from: data)
        return try migrate(decoded)
    }

    public static func migrate(_ save: SaveGame) throws -> SaveGame {
        if save.version == currentVersion {
            return save
        }
        throw SaveMigrationError.unsupportedVersion(save.version)
    }
}

public struct SaveFileStore: Sendable {
    public let fileURL: URL

    public init(fileURL: URL) {
        self.fileURL = fileURL
    }

    public func load() throws -> SaveGame? {
        let manager = FileManager.default
        guard manager.fileExists(atPath: fileURL.path) else { return nil }
        let data = try Data(contentsOf: fileURL)
        return try SaveCodec.decode(data)
    }

    public func save(_ save: SaveGame) throws {
        let manager = FileManager.default
        let parent = fileURL.deletingLastPathComponent()
        try manager.createDirectory(at: parent, withIntermediateDirectories: true)
        let data = try SaveCodec.encode(save)
        try data.write(to: fileURL, options: [.atomic])
    }
}

public enum SavePaths {
    public static func defaultSaveURL(appName: String = "FarmSim") -> URL {
        let manager = FileManager.default
        let base = manager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? manager.temporaryDirectory
        return base
            .appendingPathComponent(appName, isDirectory: true)
            .appendingPathComponent("save_v1.json", isDirectory: false)
    }
}
