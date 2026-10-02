import Foundation
import XCTest
@testable import GameCore

final class BundledContentTests: XCTestCase {
    func testBaseAndPackCatalogsPassTheRuntimeLoader() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .appendingPathComponent("../../../../shared/content").standardizedFileURL
        let files = try XCTUnwrap(FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil))
        var checked = 0
        for case let url as URL in files {
            guard url.pathExtension == "json" else { continue }
            let data = try Data(contentsOf: url)
            switch url.lastPathComponent {
            case "crops.json":
                XCTAssertFalse(try ContentLoader.loadCropDefs(from: data).isEmpty, url.path)
            case "decor.json":
                XCTAssertFalse(try ContentLoader.loadDecorDefs(from: data).isEmpty, url.path)
            case "festivals.json":
                XCTAssertFalse(try ContentLoader.loadFestivalDefs(from: data).isEmpty, url.path)
            case "minigames.json":
                XCTAssertFalse(try ContentLoader.loadMinigameDefs(from: data).isEmpty, url.path)
            default: continue
            }
            checked += 1
        }
        XCTAssertGreaterThanOrEqual(checked, 8, "Base catalogs and all optional packs must be checked")
    }
}
