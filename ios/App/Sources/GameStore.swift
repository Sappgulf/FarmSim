import Foundation
import Observation
import GameCore

@Observable
@MainActor
final class GameStore {
    private(set) var save: SaveGame
    private(set) var renderSnapshot: FarmRenderSnapshot

    private(set) var cropDefs: [CropDef]
    private(set) var cropDisplay: [String: CropDisplayInfo]
    private(set) var decorDefs: [DecorDef]
    private(set) var festivalDefs: [FestivalDef]
    private(set) var minigameDefs: [MinigameDef]
    private(set) var almanacEntries: [AlmanacEntry]
    private(set) var strings: [String: String]

    var selectedSeedID: String
    private(set) var statusText: String
    private(set) var contentErrorMessage: String?

    var settings: GameUserSettings
    private(set) var onboardingRequired: Bool

    private(set) var hapticToken: Int = 0
    private(set) var harvestToken: Int = 0

    @ObservationIgnored private var engine: GameCoreEngine
    @ObservationIgnored private let saveStore: SaveFileStore
    @ObservationIgnored private let userDefaults: UserDefaults

    private static let settingsKey = "com.farmsim.settings.v1"
    private static let onboardingKey = "com.farmsim.onboarding.seen"

    var playerLevel: Int {
        ProgressionSystem.level(forXP: save.player.xp)
    }

    var yieldMultiplier: Double {
        ProgressionSystem.yieldMultiplier(forLevel: playerLevel)
    }

    var nextGridUnlock: Int {
        ProgressionSystem.unlockedGrid(forLevel: playerLevel)
    }

    var farmName: String {
        settings.farmName
    }

    var readyTileCount: Int {
        save.world.tiles.indices.reduce(0) { $0 + (engine.isTileReady($1) ? 1 : 0) }
    }

    var plantedTileCount: Int {
        save.world.tiles.reduce(0) { $0 + ($1.planted != nil ? 1 : 0) }
    }

    var totalTileCount: Int {
        save.world.tiles.count
    }

    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        self.settings = Self.loadSettings(defaults: userDefaults)
        self.onboardingRequired = userDefaults.bool(forKey: Self.onboardingKey) == false

        let loadedContent = Self.loadContent()
        let sortedDefs = loadedContent.cropDefs.sorted { $0.id < $1.id }
        let firstSeed = sortedDefs.first?.id ?? ""

        let saveStore = SaveFileStore(fileURL: SavePaths.defaultSaveURL(appName: "FarmSim"))
        let starterSeeds = Dictionary(uniqueKeysWithValues: sortedDefs.prefix(4).map { ($0.id, 4) })
        let fallbackSave = GameCoreEngine.defaultSave(
            gridWidth: 4,
            gridHeight: 4,
            starterSeeds: starterSeeds,
            daySeed: 20260212
        )

        let initialSave: SaveGame
        var loadError: String?
        do {
            initialSave = try saveStore.load() ?? fallbackSave
        } catch {
            initialSave = fallbackSave
            loadError = "Save load failed: \(error.localizedDescription)"
        }

        let engine = GameCoreEngine(save: initialSave, cropDefs: sortedDefs, seed: initialSave.daySeed)

        self.saveStore = saveStore
        self.engine = engine
        self.save = engine.save
        self.renderSnapshot = Self.makeSnapshot(save: engine.save, cropDefsByID: engine.cropDefsByID)

        self.cropDefs = sortedDefs
        self.cropDisplay = loadedContent.cropDisplay
        self.decorDefs = loadedContent.decorDefs
        self.festivalDefs = loadedContent.festivalDefs
        self.minigameDefs = loadedContent.minigameDefs
        self.almanacEntries = loadedContent.almanacEntries
        self.strings = loadedContent.strings

        self.selectedSeedID = firstSeed
        self.statusText = loadError ?? "Tap a tile to manage crops."
        self.contentErrorMessage = loadedContent.contentErrorMessage

        if let error = loadError {
            self.statusText = error
        }

        _ = applyProgressionUnlocksIfNeeded()
        syncState(statusOverride: nil, emitHaptic: false, emitHarvest: false)
    }

    func tileSheetState(for index: Int) -> TileSheetState? {
        guard save.world.tiles.indices.contains(index) else { return nil }
        let tile = save.world.tiles[index]
        let cropID = tile.planted?.cropID
        let cropName = cropID.flatMap { engine.cropDefsByID[$0]?.name } ?? "Empty"
        return TileSheetState(
            index: index,
            cropID: cropID,
            cropName: cropName,
            isReady: engine.isTileReady(index),
            progress: growthProgress(tileIndex: index),
            watered: tile.state.watered
        )
    }

    func selectSeed(id: String) {
        guard cropDefs.contains(where: { $0.id == id }) else { return }
        selectedSeedID = id
        let cropName = engine.cropDefsByID[id]?.name ?? id
        statusText = "Selected \(cropName)."
    }

    func advanceDay() {
        advanceDays(1)
    }

    func advanceDays(_ count: Int) {
        let safeCount = max(1, min(14, count))
        for _ in 0..<safeCount {
            engine.advanceDay()
        }
        let status = safeCount == 1
            ? "Day \(engine.save.world.day)"
            : "Advanced \(safeCount) days to Day \(engine.save.world.day)."
        syncState(statusOverride: status, emitHaptic: safeCount > 1, emitHarvest: false)
    }

    func plantSelectedSeed(on tileIndex: Int) {
        let planted = engine.plant(tileIndex: tileIndex, cropID: selectedSeedID)
        let cropName = engine.cropDefsByID[selectedSeedID]?.name ?? selectedSeedID
        let status = planted ? "Planted \(cropName)." : "Cannot plant here."
        syncState(statusOverride: status, emitHaptic: planted, emitHarvest: false)
    }

    func waterTile(index: Int) {
        let watered = engine.water(tileIndex: index)
        let status = watered ? "Tile watered." : "Nothing to water."
        syncState(statusOverride: status, emitHaptic: watered, emitHarvest: false)
    }

    func clearTile(index: Int) {
        let cleared = engine.clearTile(tileIndex: index)
        let status = cleared ? "Crop removed." : "Tile already empty."
        syncState(statusOverride: status, emitHaptic: cleared, emitHarvest: false)
    }

    func harvestTile(index: Int) {
        let harvested = engine.harvestYield(tileIndex: index, yieldMultiplier: yieldMultiplier)
        let status = harvested > 0 ? "Harvested x\(harvested)." : "Not ready yet."
        syncState(statusOverride: status, emitHaptic: harvested > 0, emitHarvest: harvested > 0)
    }

    func harvestAll() {
        let count = engine.harvestAll(yieldMultiplier: yieldMultiplier)
        let status = count > 0 ? "Harvested \(count) tile\(count == 1 ? "" : "s")." : "No ready crops."
        syncState(statusOverride: status, emitHaptic: count > 0, emitHarvest: count > 0)
    }

    func buySeed(cropID: String) -> Bool {
        let bought = engine.buySeed(cropID: cropID)
        let status = bought ? "Seed purchased." : "Not enough coins."
        syncState(statusOverride: status, emitHaptic: bought, emitHarvest: false)
        return bought
    }

    func sellCrop(cropID: String, quantity: Int = 1) -> Bool {
        let sold = engine.sellCrop(cropID: cropID, quantity: quantity)
        let cropName = engine.cropDefsByID[cropID]?.name ?? cropID
        let status = sold ? "Sold \(cropName)." : "No crops to sell."
        syncState(statusOverride: status, emitHaptic: sold, emitHarvest: false)
        return sold
    }

    func applyPendingGridUpgrade() {
        let upgraded = applyProgressionUnlocksIfNeeded()
        let status = upgraded ?? "No upgrade available at current level."
        syncState(statusOverride: status, emitHaptic: upgraded != nil, emitHarvest: false)
    }

    func canAfford(cropID: String) -> Bool {
        guard let def = engine.cropDefsByID[cropID] else { return false }
        return save.player.coins >= def.seedCost
    }

    func isUnlocked(cropID: String) -> Bool {
        let requiredLevel = cropDisplay[cropID]?.level ?? 1
        return playerLevel >= requiredLevel
    }

    func seedCount(for cropID: String) -> Int {
        save.player.inventory.seeds[cropID] ?? 0
    }

    func cropCount(for cropID: String) -> Int {
        save.player.inventory.crops[cropID] ?? 0
    }

    func emoji(for cropID: String) -> String {
        cropDisplay[cropID]?.emoji ?? "🌱"
    }

    func growthProgress(tileIndex: Int) -> Double {
        guard save.world.tiles.indices.contains(tileIndex),
              let planted = save.world.tiles[tileIndex].planted,
              let def = engine.cropDefsByID[planted.cropID] else { return 0 }
        let grown = max(0, save.world.day - planted.plantedDay)
        return min(1.0, Double(grown) / Double(max(1, def.daysToGrow)))
    }

    func persistNow() {
        do {
            try saveStore.save(engine.save)
        } catch {
            statusText = "Save failed: \(error.localizedDescription)"
        }
    }

    func completeOnboarding() {
        onboardingRequired = false
        userDefaults.set(true, forKey: Self.onboardingKey)
    }

    func resetSave() {
        let starterSeeds = Dictionary(uniqueKeysWithValues: cropDefs.prefix(4).map { ($0.id, 4) })
        let fresh = GameCoreEngine.defaultSave(
            gridWidth: 4,
            gridHeight: 4,
            starterSeeds: starterSeeds,
            daySeed: 20260212
        )
        engine = GameCoreEngine(save: fresh, cropDefs: cropDefs, seed: fresh.daySeed)
        syncState(statusOverride: "Save reset.", emitHaptic: false, emitHarvest: false)
    }

    func setHapticsEnabled(_ enabled: Bool) {
        settings.hapticsEnabled = enabled
        persistSettings()
    }

    func setSoundEnabled(_ enabled: Bool) {
        settings.soundEnabled = enabled
        persistSettings()
    }

    func setReducedMotion(_ enabled: Bool) {
        settings.reducedMotion = enabled
        persistSettings()
    }

    func setVoiceOverHints(_ enabled: Bool) {
        settings.voiceOverHints = enabled
        persistSettings()
    }

    func setFarmName(_ value: String) {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        settings.farmName = trimmed.isEmpty ? "Willowbrook Farm" : String(trimmed.prefix(32))
        persistSettings()
    }

    func setPalette(_ palette: FarmPalette) {
        settings.palette = palette
        persistSettings()
    }

    func setShowTileCoordinates(_ enabled: Bool) {
        settings.showTileCoordinates = enabled
        persistSettings()
    }

    func setParticleEffects(_ enabled: Bool) {
        settings.particleEffects = enabled
        persistSettings()
    }

    func setTargetFPS(_ fps: Int) {
        settings.targetFPS = GameUserSettings.clampFPS(fps)
        persistSettings()
    }

    private func syncState(statusOverride: String?, emitHaptic: Bool, emitHarvest: Bool) {
        let upgradeMessage = applyProgressionUnlocksIfNeeded()

        save = engine.save
        renderSnapshot = Self.makeSnapshot(save: engine.save, cropDefsByID: engine.cropDefsByID)

        if let statusOverride {
            if let upgradeMessage {
                statusText = "\(statusOverride) \(upgradeMessage)"
            } else {
                statusText = statusOverride
            }
        } else if let upgradeMessage {
            statusText = upgradeMessage
        }

        persistNow()

        if settings.hapticsEnabled, emitHaptic {
            hapticToken += 1
        }
        if settings.hapticsEnabled, emitHarvest {
            harvestToken += 1
        }
    }

    @discardableResult
    private func applyProgressionUnlocksIfNeeded() -> String? {
        let unlockedGrid = ProgressionSystem.unlockedGrid(forLevel: playerLevel)
        if unlockedGrid > engine.save.world.gridWidth {
            engine.resizeGrid(width: unlockedGrid, height: unlockedGrid)
            return "Grid expanded to \(unlockedGrid)x\(unlockedGrid)."
        }
        return nil
    }

    private func persistSettings() {
        if let encoded = try? JSONEncoder().encode(settings) {
            userDefaults.set(encoded, forKey: Self.settingsKey)
        }
    }

    private static func loadSettings(defaults: UserDefaults) -> GameUserSettings {
        guard let data = defaults.data(forKey: Self.settingsKey),
              let decoded = try? JSONDecoder().decode(GameUserSettings.self, from: data) else {
            return GameUserSettings()
        }
        return decoded
    }

    private static func loadContent() -> (
        cropDefs: [CropDef],
        cropDisplay: [String: CropDisplayInfo],
        decorDefs: [DecorDef],
        festivalDefs: [FestivalDef],
        minigameDefs: [MinigameDef],
        almanacEntries: [AlmanacEntry],
        strings: [String: String],
        contentErrorMessage: String?
    ) {
        do {
            let content = try ContentRepository.loadFromBundle()
            return (
                cropDefs: content.cropDefs,
                cropDisplay: content.cropDisplay,
                decorDefs: content.decorDefs,
                festivalDefs: content.festivalDefs,
                minigameDefs: content.minigameDefs,
                almanacEntries: content.almanacEntries,
                strings: content.strings,
                contentErrorMessage: nil
            )
        } catch {
            let message = "Content load failed: \(error.localizedDescription)"
            if _isDebugAssertConfiguration() {
                assertionFailure(message)
            }

            let fallback = CropDef(id: "carrot", name: "Carrot", daysToGrow: 1, seedCost: 12, sellPrice: 24)
            return (
                cropDefs: [fallback],
                cropDisplay: [
                    fallback.id: CropDisplayInfo(
                        emoji: "🥕",
                        description: "Fallback content",
                        category: "vegetable",
                        season: "spring",
                        level: 1
                    )
                ],
                decorDefs: [],
                festivalDefs: [],
                minigameDefs: [],
                almanacEntries: [],
                strings: [:],
                contentErrorMessage: message
            )
        }
    }

    private static func makeSnapshot(save: SaveGame, cropDefsByID: [String: CropDef]) -> FarmRenderSnapshot {
        let tiles = save.world.tiles.map { tile -> FarmRenderTile in
            let progress: Double
            let isReady: Bool

            if let planted = tile.planted,
               let def = cropDefsByID[planted.cropID] {
                let grown = max(0, save.world.day - planted.plantedDay)
                progress = min(1.0, Double(grown) / Double(max(1, def.daysToGrow)))
                isReady = grown >= def.daysToGrow
            } else {
                progress = 0
                isReady = false
            }

            return FarmRenderTile(
                index: tile.index,
                cropID: tile.planted?.cropID,
                plantedDay: tile.planted?.plantedDay,
                isReady: isReady,
                progress: progress,
                watered: tile.state.watered
            )
        }

        return FarmRenderSnapshot(
            day: save.world.day,
            gridWidth: save.world.gridWidth,
            gridHeight: save.world.gridHeight,
            tiles: tiles
        )
    }
}
