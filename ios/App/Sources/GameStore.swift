import Foundation
import Observation
import GameCore

struct CropDisplayInfo: Sendable {
    let emoji: String
    let description: String
    let category: String
    let season: String
    let level: Int
}

@Observable
@MainActor
final class GameStore {
    // MARK: - Observable state

    private(set) var save: SaveGame
    private(set) var cropDefs: [CropDef]
    private(set) var cropDisplay: [String: CropDisplayInfo]
    var selectedSeedID: String
    private(set) var statusText: String
    var lastErrorMessage: String?
    private(set) var lastHarvestCount: Int = 0

    // MARK: - Internal

    @ObservationIgnored private var engine: GameCoreEngine
    @ObservationIgnored private let saveStore: SaveFileStore

    // MARK: - Computed

    var playerLevel: Int { (save.player.xp / 100) + 1 }

    var readyTileCount: Int {
        save.world.tiles.indices.reduce(0) { $0 + (engine.isTileReady($1) ? 1 : 0) }
    }

    var plantedTileCount: Int {
        save.world.tiles.reduce(0) { $0 + ($1.planted != nil ? 1 : 0) }
    }

    var emptyTileCount: Int {
        save.world.tiles.count - plantedTileCount
    }

    var totalTileCount: Int { save.world.tiles.count }

    // MARK: - Init

    init() {
        let (loadedDefs, displayMap, loadError) = Self.loadAllContent()
        let sortedDefs = loadedDefs.sorted { $0.id < $1.id }
        let firstSeed = sortedDefs.first?.id ?? ""
        let saveStore = SaveFileStore(fileURL: SavePaths.defaultSaveURL(appName: "FarmSim"))

        let starterSeeds = Dictionary(uniqueKeysWithValues: sortedDefs.prefix(3).map { ($0.id, 5) })
        let fallbackSave = GameCoreEngine.defaultSave(gridWidth: 4, gridHeight: 4, starterSeeds: starterSeeds)

        var loadErrorMessage = loadError
        let initialSave: SaveGame
        do {
            initialSave = try saveStore.load() ?? fallbackSave
        } catch {
            initialSave = fallbackSave
            loadErrorMessage = "Load failed: \(error.localizedDescription)"
        }

        let engine = GameCoreEngine(save: initialSave, cropDefs: sortedDefs, seed: 20260212)

        self.cropDefs = sortedDefs
        self.cropDisplay = displayMap
        self.selectedSeedID = firstSeed
        self.saveStore = saveStore
        self.engine = engine
        self.save = engine.save
        self.statusText = "Tap a plot to plant."
        self.lastErrorMessage = loadErrorMessage
    }

    // MARK: - Actions

    func selectSeed(id: String) {
        guard cropDefs.contains(where: { $0.id == id }) else { return }
        selectedSeedID = id
        let name = cropDefs.first(where: { $0.id == id })?.name ?? id
        statusText = "Selected \(name)."
    }

    func advanceDay() {
        engine.advanceDay()
        statusText = "Day \(engine.save.world.day)"
        syncAndAutosave()
    }

    func handleTileTap(index: Int) {
        guard engine.save.world.tiles.indices.contains(index) else { return }

        if let planted = engine.save.world.tiles[index].planted {
            if engine.isTileReady(index) {
                let harvested = engine.harvest(tileIndex: index)
                let name = cropDefs.first(where: { $0.id == planted.cropID })?.name ?? planted.cropID
                statusText = harvested ? "Harvested \(name)!" : "Harvest failed."
                syncAndAutosave()
                return
            }
            let def = cropDefs.first(where: { $0.id == planted.cropID })
            let remaining = max(0, (def?.daysToGrow ?? 1) - (save.world.day - planted.plantedDay))
            statusText = "\(def?.name ?? planted.cropID) — \(remaining)d left"
            return
        }

        let planted = engine.plant(tileIndex: index, cropID: selectedSeedID)
        let name = cropDefs.first(where: { $0.id == selectedSeedID })?.name ?? selectedSeedID
        statusText = planted ? "Planted \(name)." : "No seeds left."
        if planted { syncAndAutosave() }
    }

    func harvestAll() -> Int {
        let count = engine.harvestAll()
        lastHarvestCount = count
        statusText = count > 0 ? "Harvested \(count) crop\(count == 1 ? "" : "s")!" : "Nothing ready."
        if count > 0 { syncAndAutosave() }
        return count
    }

    func buySeed(cropID: String) -> Bool {
        let bought = engine.buySeed(cropID: cropID)
        if bought {
            let name = cropDefs.first(where: { $0.id == cropID })?.name ?? cropID
            statusText = "Bought \(name) seed."
            syncAndAutosave()
        }
        return bought
    }

    func persistNow() {
        do {
            try saveStore.save(engine.save)
        } catch {
            lastErrorMessage = "Save failed: \(error.localizedDescription)"
        }
    }

    // MARK: - Helpers

    func emoji(for cropID: String) -> String {
        cropDisplay[cropID]?.emoji ?? "🌱"
    }

    func seedCount(for cropID: String) -> Int {
        save.player.inventory.seeds[cropID] ?? 0
    }

    func cropCount(for cropID: String) -> Int {
        save.player.inventory.crops[cropID] ?? 0
    }

    func growthProgress(tileIndex: Int) -> Double {
        guard save.world.tiles.indices.contains(tileIndex),
              let planted = save.world.tiles[tileIndex].planted,
              let def = engine.cropDefsByID[planted.cropID] else { return 0 }
        let grown = max(0, save.world.day - planted.plantedDay)
        return min(1, Double(grown) / Double(max(1, def.daysToGrow)))
    }

    func canAfford(cropID: String) -> Bool {
        guard let def = engine.cropDefsByID[cropID] else { return false }
        return save.player.coins >= def.seedCost
    }

    func isUnlocked(cropID: String) -> Bool {
        guard let display = cropDisplay[cropID] else { return true }
        return playerLevel >= display.level
    }

    // MARK: - Private

    private func syncAndAutosave() {
        save = engine.save
        persistNow()
    }

    private static func loadAllContent() -> ([CropDef], [String: CropDisplayInfo], String?) {
        guard let url = bundledCropsURL() else {
            return (Self.fallbackCropDefs, [:], "Missing crops.json")
        }
        do {
            let data = try Data(contentsOf: url)
            let defs = try ContentLoader.loadCropDefs(from: data)
            let display = Self.parseCropDisplay(from: data)
            return (defs, display, nil)
        } catch {
            return (Self.fallbackCropDefs, [:], error.localizedDescription)
        }
    }

    private static func parseCropDisplay(from data: Data) -> [String: CropDisplayInfo] {
        struct RawFile: Decodable { let items: [RawItem] }
        struct RawItem: Decodable {
            let id: String
            let emoji: String?
            let description: String?
            let category: String?
            let season: String?
            let level: Int?
        }
        guard let file = try? JSONDecoder().decode(RawFile.self, from: data) else { return [:] }
        var map: [String: CropDisplayInfo] = [:]
        for item in file.items {
            map[item.id] = CropDisplayInfo(
                emoji: item.emoji ?? "🌱",
                description: item.description ?? "",
                category: item.category ?? "",
                season: item.season ?? "",
                level: item.level ?? 1
            )
        }
        return map
    }

    private static func bundledCropsURL() -> URL? {
        let bundle = Bundle.main
        return bundle.url(forResource: "crops", withExtension: "json", subdirectory: "content")
            ?? bundle.url(forResource: "crops", withExtension: "json")
    }

    private static let fallbackCropDefs: [CropDef] = [
        CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 12, sellPrice: 24),
        CropDef(id: "lettuce", name: "Lettuce", daysToGrow: 1, seedCost: 10, sellPrice: 19),
    ]
}
