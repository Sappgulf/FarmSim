import XCTest
import UIKit
import SpriteKit
@testable import FarmSim

final class GameArtworkTests: XCTestCase {
    @MainActor
    func testEveryBundledCropHasFourDistinctLoadableStages() async throws {
        let content = try ContentRepository.loadFromBundle()
        XCTAssertEqual(content.cropDefs.count, 35)
        for crop in content.cropDefs {
            let keys = (0..<4).map { GameArtworkCatalog.cropKey(crop.id, stage: $0) }
            let regions = try keys.map { try XCTUnwrap(GameArtworkCatalog.regions[$0], $0) }
            XCTAssertEqual(Set(regions.map { $0.bounds }).count, 4, crop.id)
            for key in keys {
                XCTAssertNotNil(GameArtworkLibrary.shared.image(for: key), key)
            }
        }
    }

    @MainActor
    func testVisibleTownCatalogsHaveLoadableIllustrations() async throws {
        let content = try ContentRepository.loadFromBundle()
        let ids = content.buildingPlans.map(\.id) + content.livestockPlans.map(\.id)
            + content.petPlans.map(\.id) + content.fishPlans.map(\.id)
            + content.geneticsRecipes.map(\.outputCropID) + ["pond", "fishing_float"]
        for id in ids {
            let key = try XCTUnwrap(GameArtworkCatalog.iconKey(id), id)
            XCTAssertNotNil(GameArtworkLibrary.shared.image(for: key), id)
        }
        XCTAssertEqual(GameArtworkCatalog.regions["object:chicken"],
                       GameArtworkCatalog.regions["object:chicken_pet"])
        XCTAssertNil(GameArtworkCatalog.iconKey("future_unknown_item"))
        XCTAssertNil(GameArtworkLibrary.shared.image(for: "crop:unknown:3"))
    }

    @MainActor
    func testEveryRegionMatchesItsBundledImageAndThumbnailBudget() async throws {
        XCTAssertEqual(GameArtworkCatalog.regions.count, 173)
        for (key, region) in GameArtworkCatalog.regions {
            let source = try XCTUnwrap(UIImage(named: region.atlas)?.cgImage, key)
            XCTAssertEqual(source.width, region.sourceSize[0], key)
            XCTAssertEqual(source.height, region.sourceSize[1], key)
            let rect = region.spriteKitRect
            XCTAssertGreaterThanOrEqual(rect.minX, 0, key)
            XCTAssertGreaterThanOrEqual(rect.minY, -0.000001, key)
            XCTAssertLessThanOrEqual(rect.maxX, 1.000001, key)
            XCTAssertLessThanOrEqual(rect.maxY, 1.000001, key)
            XCTAssertEqual(rect.minY, 1 - region.pixelRect.maxY / CGFloat(source.height), accuracy: 0.000001)
            let image = try XCTUnwrap(GameArtworkLibrary.shared.image(for: key)?.cgImage, key)
            XCTAssertLessThanOrEqual(max(image.width, image.height), 192, key)
            if !key.hasPrefix("terrain:") {
                XCTAssertTrue([CGImageAlphaInfo.premultipliedFirst, .premultipliedLast, .first, .last]
                    .contains(source.alphaInfo), "Sprite atlas must retain alpha: \(key)")
            }
        }
    }

    func testCorruptBoundsAreRejectedWithoutOverflow() throws {
        for bounds in [[-1, 0, 5, 5], [0, 0, 0, 5], [0, 9, 5, 5], [10, 0, Int.max, 1], [0, 0]] {
            let data = try JSONSerialization.data(withJSONObject: [
                "atlas": "test", "sourceSize": [10, 10], "bounds": bounds
            ])
            XCTAssertThrowsError(try JSONDecoder().decode(GameArtworkRegion.self, from: data))
        }
    }

    @MainActor
    func testCropRegionsDoNotIncludeSeparatedFragmentsFromNeighboringRows() async throws {
        for (key, region) in GameArtworkCatalog.regions where key.hasPrefix("crop:") {
            let source = try XCTUnwrap(UIImage(named: region.atlas)?.cgImage?.cropping(to: region.pixelRect))
            let width = source.width
            let height = source.height
            var pixels = [UInt8](repeating: 0, count: width * height * 4)
            let longestGap = try pixels.withUnsafeMutableBytes { bytes -> Int in
                let context = try XCTUnwrap(CGContext(data: bytes.baseAddress, width: width, height: height,
                    bitsPerComponent: 8, bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue))
                context.draw(source, in: CGRect(x: 0, y: 0, width: width, height: height))
                let data = bytes.bindMemory(to: UInt8.self)
                var gap = 0
                var longest = 0
                for row in 0..<height {
                    let hasPlant = (0..<width).contains { data[(row * width + $0) * 4 + 3] > 128 }
                    gap = hasPlant ? 0 : gap + 1
                    longest = max(longest, gap)
                }
                return longest
            }
            // A detached neighbor appeared after a 12–26 pixel blank band in the old tomato cuts.
            XCTAssertLessThanOrEqual(longestGap, 2, "Separated sprite fragment in \(key)")
        }
    }

    func testGrowthStagesRespectReadinessAndInvalidProgress() {
        for (progress, expected) in [(0.0, 0), (0.01, 1), (0.5, 1), (0.51, 2), (1.0, 2), (-1.0, 0), (.nan, 0), (.infinity, 0)] {
            XCTAssertEqual(GameArtworkCatalog.growthStage(progress: progress, ready: false), expected)
            XCTAssertEqual(GameArtworkCatalog.growthStage(progress: progress, ready: true), 3)
        }
    }

    @MainActor
    func testMenuPortraitAndSelectedAppIcon() async throws {
        let background = try XCTUnwrap(UIImage(named: "menu_landscape_v4")?.cgImage)
        XCTAssertGreaterThan(background.height, background.width)
        XCTAssertGreaterThan(background.height, 1_500)
        XCTAssertTrue([CGImageAlphaInfo.none, .noneSkipFirst, .noneSkipLast].contains(background.alphaInfo))
        let icons = try XCTUnwrap(Bundle.main.object(forInfoDictionaryKey: "CFBundleIcons") as? [String: Any])
        let primary = try XCTUnwrap(icons["CFBundlePrimaryIcon"] as? [String: Any])
        XCTAssertEqual(primary["CFBundleIconName"] as? String, "AppIconV4")
    }

    @MainActor
    func testMarketStallIllustrationRetainsAlpha() async throws {
        let image = try XCTUnwrap(UIImage(named: "market_stall_v4")?.cgImage)
        XCTAssertGreaterThan(image.width, 1_000)
        XCTAssertGreaterThan(image.width, image.height)
        XCTAssertTrue([CGImageAlphaInfo.premultipliedFirst, .premultipliedLast, .first, .last].contains(image.alphaInfo))
    }

    @MainActor
    func testFarmRendersAll140StagesUprightWithAspectRatioPreserved() async throws {
        let content = try ContentRepository.loadFromBundle()
        let scene = FarmScene(size: CGSize(width: 1_120, height: 800))
        scene.setReducedMotion(true)
        scene.setParticleEffectsEnabled(false)
        let view = SKView(frame: CGRect(origin: .zero, size: scene.size))
        view.presentScene(scene)
        let tiles = content.cropDefs.enumerated().flatMap { index, crop in
            (0..<4).map { stage in
                FarmRenderTile(index: index * 4 + stage, cropID: crop.id, plantedDay: 1,
                               isReady: stage == 3, progress: [0.0, 0.25, 0.75, 1.0][stage], watered: false)
            }
        }
        scene.apply(snapshot: FarmRenderSnapshot(day: 1, gridWidth: 14, gridHeight: 10, tiles: tiles),
                    cropDisplay: content.cropDisplay)
        for tile in tiles {
            let sprite = try XCTUnwrap(scene.childNode(withName: "//crop_\(tile.index)") as? SKSpriteNode)
            let texture = try XCTUnwrap(sprite.texture)
            XCTAssertFalse(sprite.isHidden, tile.cropID ?? "")
            XCTAssertEqual(sprite.parent?.zRotation, 0)
            XCTAssertEqual(sprite.size.width / sprite.size.height,
                           texture.size().width / texture.size().height, accuracy: 0.00001)
            XCTAssertEqual(sprite.anchorPoint, CGPoint(x: 0.5, y: 0))
        }
        let texture = try XCTUnwrap(view.texture(from: scene))
        let image = UIImage(cgImage: texture.cgImage())
        let attachment = XCTAttachment(image: image)
        attachment.name = "All 35 crops — four native growth stages"
        attachment.lifetime = .keepAlways
        add(attachment)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("FarmSim-all-crop-stages.png")
        try XCTUnwrap(image.pngData()).write(to: url)
        print("Artwork render: \(url.path)")
        view.presentScene(nil)
    }
}
