import SwiftUI
import UIKit
import OSLog

/// Pixel bounds use the source image's top-left origin, independent of renderer.
struct GameArtworkRegion: Decodable, Equatable {
    let atlas: String
    let sourceSize: [Int]
    let bounds: [Int]

    private enum CodingKeys: String, CodingKey { case atlas, sourceSize, bounds }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        atlas = try container.decode(String.self, forKey: .atlas)
        sourceSize = try container.decode([Int].self, forKey: .sourceSize)
        bounds = try container.decode([Int].self, forKey: .bounds)
        guard !atlas.isEmpty, sourceSize.count == 2, bounds.count == 4,
              sourceSize.allSatisfy({ $0 > 0 }), bounds[0] >= 0, bounds[1] >= 0,
              bounds[2] > 0, bounds[3] > 0,
              bounds[0] <= sourceSize[0], bounds[1] <= sourceSize[1],
              bounds[2] <= sourceSize[0] - bounds[0],
              bounds[3] <= sourceSize[1] - bounds[1] else {
            throw DecodingError.dataCorrupted(.init(codingPath: decoder.codingPath,
                debugDescription: "Artwork region lies outside its source image."))
        }
    }

    var pixelRect: CGRect {
        CGRect(x: bounds[0], y: bounds[1], width: bounds[2], height: bounds[3])
    }

    var spriteKitRect: CGRect {
        CGRect(x: Double(bounds[0]) / Double(sourceSize[0]),
               y: 1 - Double(bounds[1] + bounds[3]) / Double(sourceSize[1]),
               width: Double(bounds[2]) / Double(sourceSize[0]),
               height: Double(bounds[3]) / Double(sourceSize[1]))
    }
}

enum GameArtworkCatalog {
    private struct Catalog: Decodable {
        let version: Int
        let regions: [String: GameArtworkRegion]
    }

    static let regions: [String: GameArtworkRegion] = {
        do {
            guard let url = Bundle.main.url(forResource: "GameArtwork", withExtension: "json") else {
                throw CocoaError(.fileNoSuchFile)
            }
            let catalog = try JSONDecoder().decode(Catalog.self, from: Data(contentsOf: url))
            guard catalog.version == 4 else { throw CocoaError(.coderReadCorrupt) }
            return catalog.regions
        } catch {
            Logger(subsystem: "com.austinbeatty.farmsim", category: "Artwork")
                .error("Unable to load artwork catalog: \(error.localizedDescription, privacy: .public)")
            return [:]
        }
    }()

    static func cropKey(_ id: String, stage: Int = 3) -> String {
        "crop:\(id):\(min(3, max(0, stage)))"
    }

    static func iconKey(_ id: String) -> String? {
        [cropKey(id), "object:\(id)", "fish:\(id)"].first { regions[$0] != nil }
    }

    static func growthStage(progress: Double, ready: Bool) -> Int {
        if ready { return 3 }
        guard progress.isFinite, progress > 0 else { return 0 }
        return progress <= 0.5 ? 1 : 2
    }
}

/// Atlas images load on demand; thumbnails own small buffers rather than retaining entire sheets.
@MainActor
final class GameArtworkLibrary {
    static let shared = GameArtworkLibrary()
    private let atlases = NSCache<NSString, UIImage>()
    private let thumbnails = NSCache<NSString, UIImage>()

    private init() {
        atlases.totalCostLimit = 24 * 1_024 * 1_024
        atlases.countLimit = 4
        thumbnails.totalCostLimit = 16 * 1_024 * 1_024
    }

    func image(for key: String) -> UIImage? {
        if let image = thumbnails.object(forKey: key as NSString) { return image }
        guard let region = GameArtworkCatalog.regions[key] else { return nil }
        let atlas: UIImage
        if let cached = atlases.object(forKey: region.atlas as NSString) {
            atlas = cached
        } else {
            guard let loaded = UIImage(named: region.atlas), let cgImage = loaded.cgImage else { return nil }
            atlas = loaded
            atlases.setObject(loaded, forKey: region.atlas as NSString,
                             cost: cgImage.bytesPerRow * cgImage.height)
        }
        guard let source = atlas.cgImage,
              source.width == region.sourceSize[0], source.height == region.sourceSize[1],
              let cropped = source.cropping(to: region.pixelRect) else { return nil }
        let scale = min(1, 192 / max(region.pixelRect.width, region.pixelRect.height))
        // UIKit rounds fractional canvas dimensions up; use whole pixels to keep the budget exact.
        let size = CGSize(width: max(1, (region.pixelRect.width * scale).rounded(.down)),
                          height: max(1, (region.pixelRect.height * scale).rounded(.down)))
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = key.hasPrefix("terrain:")
        let image = UIGraphicsImageRenderer(size: size, format: format).image { _ in
            UIImage(cgImage: cropped).draw(in: CGRect(origin: .zero, size: size))
        }
        thumbnails.setObject(image, forKey: key as NSString,
                             cost: Int(size.width * size.height) * 4)
        return image
    }
}

struct GameAssetIcon: View {
    let id: String
    let fallback: String
    var size: CGFloat = 36

    var body: some View {
        Group {
            if let key = GameArtworkCatalog.iconKey(id),
               let image = GameArtworkLibrary.shared.image(for: key) {
                Image(uiImage: image).resizable().interpolation(.high).scaledToFit()
            } else {
                Text(fallback).font(.system(size: size * 0.8))
            }
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}

struct GameMaterialSurface: View {
    let material: String

    var body: some View {
        Group {
            if let image = GameArtworkLibrary.shared.image(for: "terrain:\(material)") {
                Image(uiImage: image).resizable(resizingMode: .tile)
            } else {
                Color.clear
            }
        }
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}
