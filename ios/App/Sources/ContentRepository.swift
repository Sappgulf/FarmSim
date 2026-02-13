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
    let buildingPlans: [BuildingPlan]
    let buildingSynergies: [BuildingSynergy]
    let researchPlans: [ResearchPlan]
    let geneticsRecipes: [GeneticsRecipe]
    let livestockPlans: [LivestockTypePlan]
    let petPlans: [PetTypePlan]
    let fishPlans: [FishTypePlan]
    let pondUpgrades: [PondUpgradePlan]
    let challengePlans: [ChallengePlan]
}

enum ContentRepository {
    static func loadFromBundle() throws -> GameContent {
        let cropsData = try fileData(named: "crops")
        let decorData = try fileData(named: "decor")
        let festivalsData = try fileData(named: "festivals")
        let minigamesData = try fileData(named: "minigames")
        let almanacData = try fileData(named: "almanac")
        let stringsData = try fileData(named: "strings")
        let buildingsData = try fileData(named: "buildings")
        let researchData = try fileData(named: "research")
        let geneticsData = try fileData(named: "genetics")
        let livestockData = try fileData(named: "livestock")
        let petsData = try fileData(named: "pets")
        let fishingData = try fileData(named: "fishing")
        let challengesData = try fileData(named: "challenges")

        let cropDefs = try ContentLoader.loadCropDefs(from: cropsData)
        guard !cropDefs.isEmpty else {
            throw ContentRepositoryError.invalid("crops.json has no entries")
        }

        var mergedCropDefs = cropDefs
        var mergedCropDisplay = parseCropDisplay(from: cropsData)
        var mergedDecorDefs = try ContentLoader.loadDecorDefs(from: decorData)
        var mergedFestivalDefs = try ContentLoader.loadFestivalDefs(from: festivalsData)
        var mergedMinigameDefs = try ContentLoader.loadMinigameDefs(from: minigamesData)
        var mergedAlmanac = try parseAlmanac(from: almanacData)
        var mergedStrings = try parseStrings(from: stringsData)
        let baseBuildings = try parseBuildings(from: buildingsData)
        var mergedBuildingPlans = baseBuildings.items
        var mergedBuildingSynergies = baseBuildings.synergies
        var mergedResearchPlans = try parseResearch(from: researchData)
        var mergedGeneticsRecipes = try parseGenetics(from: geneticsData)
        var mergedLivestockPlans = try parseLivestock(from: livestockData)
        var mergedPetPlans = try parsePets(from: petsData)
        let fishingPayload = try parseFishing(from: fishingData)
        var mergedFishPlans = fishingPayload.fish
        var mergedPondUpgrades = fishingPayload.pondUpgrades
        var mergedChallengePlans = try parseChallenges(from: challengesData)

        for packURL in packResourceDirectories() {
            if let packCrops = dataIfExists(at: packURL.appendingPathComponent("crops.json")) {
                let defs = try ContentLoader.loadCropDefs(from: packCrops)
                mergedCropDefs = mergeUnique(mergedCropDefs, defs, by: \.id)
                mergedCropDisplay.merge(parseCropDisplay(from: packCrops)) { current, _ in current }
            }
            if let packDecor = dataIfExists(at: packURL.appendingPathComponent("decor.json")) {
                let defs = try ContentLoader.loadDecorDefs(from: packDecor)
                mergedDecorDefs = mergeUnique(mergedDecorDefs, defs, by: \.id)
            }
            if let packFestivals = dataIfExists(at: packURL.appendingPathComponent("festivals.json")) {
                let defs = try ContentLoader.loadFestivalDefs(from: packFestivals)
                mergedFestivalDefs = mergeUnique(mergedFestivalDefs, defs, by: \.id)
            }
            if let packMinigames = dataIfExists(at: packURL.appendingPathComponent("minigames.json")) {
                let defs = try ContentLoader.loadMinigameDefs(from: packMinigames)
                mergedMinigameDefs = mergeUnique(mergedMinigameDefs, defs, by: \.id)
            }
            if let packAlmanac = dataIfExists(at: packURL.appendingPathComponent("almanac.json")) {
                let entries = try parseAlmanac(from: packAlmanac)
                mergedAlmanac = mergeUnique(mergedAlmanac, entries, by: \.id)
            }
            if let packStrings = dataIfExists(at: packURL.appendingPathComponent("strings.json")) {
                let strings = try parseStrings(from: packStrings)
                mergedStrings.merge(strings) { current, _ in current }
            }
            if let packBuildings = dataIfExists(at: packURL.appendingPathComponent("buildings.json")) {
                let payload = try parseBuildings(from: packBuildings)
                mergedBuildingPlans = mergeUnique(mergedBuildingPlans, payload.items, by: \.id)
                mergedBuildingSynergies = mergeUnique(mergedBuildingSynergies, payload.synergies, by: \.id)
            }
            if let packResearch = dataIfExists(at: packURL.appendingPathComponent("research.json")) {
                let plans = try parseResearch(from: packResearch)
                mergedResearchPlans = mergeUnique(mergedResearchPlans, plans, by: \.id)
            }
            if let packGenetics = dataIfExists(at: packURL.appendingPathComponent("genetics.json")) {
                let recipes = try parseGenetics(from: packGenetics)
                mergedGeneticsRecipes = mergeUnique(mergedGeneticsRecipes, recipes, by: \.id)
            }
            if let packLivestock = dataIfExists(at: packURL.appendingPathComponent("livestock.json")) {
                let plans = try parseLivestock(from: packLivestock)
                mergedLivestockPlans = mergeUnique(mergedLivestockPlans, plans, by: \.id)
            }
            if let packPets = dataIfExists(at: packURL.appendingPathComponent("pets.json")) {
                let plans = try parsePets(from: packPets)
                mergedPetPlans = mergeUnique(mergedPetPlans, plans, by: \.id)
            }
            if let packFishing = dataIfExists(at: packURL.appendingPathComponent("fishing.json")) {
                let payload = try parseFishing(from: packFishing)
                mergedFishPlans = mergeUnique(mergedFishPlans, payload.fish, by: \.id)
                mergedPondUpgrades = mergeUnique(mergedPondUpgrades, payload.pondUpgrades, by: \.id)
            }
            if let packChallenges = dataIfExists(at: packURL.appendingPathComponent("challenges.json")) {
                let plans = try parseChallenges(from: packChallenges)
                mergedChallengePlans = mergeUnique(mergedChallengePlans, plans, by: \.id)
            }
        }

        let content = GameContent(
            cropDefs: mergedCropDefs,
            cropDisplay: mergedCropDisplay,
            decorDefs: mergedDecorDefs,
            festivalDefs: mergedFestivalDefs,
            minigameDefs: mergedMinigameDefs,
            almanacEntries: mergedAlmanac,
            strings: mergedStrings,
            buildingPlans: mergedBuildingPlans,
            buildingSynergies: mergedBuildingSynergies,
            researchPlans: mergedResearchPlans,
            geneticsRecipes: mergedGeneticsRecipes,
            livestockPlans: mergedLivestockPlans,
            petPlans: mergedPetPlans,
            fishPlans: mergedFishPlans,
            pondUpgrades: mergedPondUpgrades,
            challengePlans: mergedChallengePlans
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

    private static func dataIfExists(at url: URL) -> Data? {
        guard FileManager.default.fileExists(atPath: url.path) else { return nil }
        return try? Data(contentsOf: url)
    }

    private static func packResourceDirectories() -> [URL] {
        guard let contentRoot = Bundle.main.url(forResource: "content", withExtension: nil) else {
            return []
        }
        let packsRoot = contentRoot.appendingPathComponent("packs", isDirectory: true)
        guard let enumerator = FileManager.default.enumerator(
            at: packsRoot,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        ) else {
            return []
        }

        var directories = Set<URL>()
        for case let url as URL in enumerator {
            guard url.lastPathComponent == "pack.json" else { continue }
            directories.insert(url.deletingLastPathComponent())
        }
        return directories.sorted { $0.path < $1.path }
    }

    private static func mergeUnique<T>(_ base: [T], _ incoming: [T], by keyPath: KeyPath<T, String>) -> [T] {
        var seen = Set(base.map { $0[keyPath: keyPath] })
        var merged = base
        for item in incoming {
            let key = item[keyPath: keyPath]
            if seen.contains(key) { continue }
            seen.insert(key)
            merged.append(item)
        }
        return merged
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

    private static func parseBuildings(from data: Data) throws -> (items: [BuildingPlan], synergies: [BuildingSynergy]) {
        struct BuildingFile: Decodable {
            let items: [Item]
            let synergies: [Synergy]?
        }
        struct Item: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let description: String?
            let category: String?
            let requiredLevel: Int?
            let maxLevel: Int?
            let costs: [Int]?
            let bonuses: [String]?
        }
        struct Synergy: Decodable {
            let id: String
            let name: String
            let icon: String?
            let bonus: String?
            let buildingIds: [String]?
        }

        do {
            let decoded = try JSONDecoder().decode(BuildingFile.self, from: data)
            let plans = decoded.items.map { item in
                let costs = (item.costs ?? []).map { max(0, $0) }
                let safeCosts = costs.isEmpty ? [100] : costs
                let safeBonuses = item.bonuses ?? []
                return BuildingPlan(
                    id: item.id,
                    name: item.name,
                    icon: item.emoji ?? item.icon ?? "🏗️",
                    description: item.description ?? "",
                    category: item.category ?? "Utility",
                    requiredLevel: max(1, item.requiredLevel ?? 1),
                    maxLevel: max(1, item.maxLevel ?? safeCosts.count),
                    costs: safeCosts,
                    bonuses: safeBonuses
                )
            }
            let synergies = (decoded.synergies ?? []).map {
                BuildingSynergy(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.icon ?? "✨",
                    bonus: $0.bonus ?? "",
                    buildingIDs: $0.buildingIds ?? []
                )
            }
            return (plans, synergies)
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode buildings.json: \(error.localizedDescription)")
        }
    }

    private static func parseResearch(from data: Data) throws -> [ResearchPlan] {
        struct ResearchFile: Decodable { let items: [Item] }
        struct Item: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let category: String?
            let cost: Int?
            let durationSeconds: Int?
            let description: String?
            let unlocks: [String]?
            let prerequisites: [String]?
        }

        do {
            let decoded = try JSONDecoder().decode(ResearchFile.self, from: data)
            return decoded.items.map {
                ResearchPlan(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.emoji ?? $0.icon ?? "🔬",
                    category: $0.category ?? "general",
                    cost: max(0, $0.cost ?? 0),
                    durationSeconds: max(0, $0.durationSeconds ?? 0),
                    description: $0.description ?? "",
                    unlocks: $0.unlocks ?? [],
                    prerequisites: $0.prerequisites ?? []
                )
            }
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode research.json: \(error.localizedDescription)")
        }
    }

    private static func parseGenetics(from data: Data) throws -> [GeneticsRecipe] {
        struct GeneticsFile: Decodable { let items: [Item] }
        struct Item: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let parentA: String
            let parentB: String
            let outputCropID: String
            let levelRequirement: Int?
            let notes: String?
        }

        do {
            let decoded = try JSONDecoder().decode(GeneticsFile.self, from: data)
            return decoded.items.map {
                GeneticsRecipe(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.emoji ?? $0.icon ?? "🧬",
                    parentA: $0.parentA,
                    parentB: $0.parentB,
                    outputCropID: $0.outputCropID,
                    levelRequirement: max(1, $0.levelRequirement ?? 1),
                    notes: $0.notes ?? ""
                )
            }
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode genetics.json: \(error.localizedDescription)")
        }
    }

    private static func parseLivestock(from data: Data) throws -> [LivestockTypePlan] {
        struct LivestockFile: Decodable { let items: [Item] }
        struct Item: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let description: String?
            let cost: Int?
            let requiredLevel: Int?
            let spaceRequired: Int?
            let maintenanceCost: Int?
            let productionTimeSeconds: Int?
            let productID: String?
            let productAmount: Int?
            let productValue: Int?
        }

        do {
            let decoded = try JSONDecoder().decode(LivestockFile.self, from: data)
            return decoded.items.map {
                LivestockTypePlan(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.emoji ?? $0.icon ?? "🐄",
                    description: $0.description ?? "",
                    cost: max(0, $0.cost ?? 0),
                    requiredLevel: max(1, $0.requiredLevel ?? 1),
                    spaceRequired: max(1, $0.spaceRequired ?? 1),
                    maintenanceCost: max(0, $0.maintenanceCost ?? 0),
                    productionTimeSeconds: max(1, $0.productionTimeSeconds ?? 1),
                    productID: $0.productID ?? "produce",
                    productAmount: max(1, $0.productAmount ?? 1),
                    productValue: max(0, $0.productValue ?? 0)
                )
            }
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode livestock.json: \(error.localizedDescription)")
        }
    }

    private static func parsePets(from data: Data) throws -> [PetTypePlan] {
        struct PetsFile: Decodable { let items: [Item] }
        struct Item: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let description: String?
            let cost: Int?
            let maxLevel: Int?
            let requiredLevel: Int?
            let bonusLabel: String?
            let bonusPerLevel: Double?
        }

        do {
            let decoded = try JSONDecoder().decode(PetsFile.self, from: data)
            return decoded.items.map {
                PetTypePlan(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.emoji ?? $0.icon ?? "🐾",
                    description: $0.description ?? "",
                    cost: max(0, $0.cost ?? 0),
                    maxLevel: max(1, $0.maxLevel ?? 1),
                    requiredLevel: max(1, $0.requiredLevel ?? 1),
                    bonusLabel: $0.bonusLabel ?? "Farm support",
                    bonusPerLevel: max(0, $0.bonusPerLevel ?? 0)
                )
            }
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode pets.json: \(error.localizedDescription)")
        }
    }

    private static func parseFishing(from data: Data) throws -> (fish: [FishTypePlan], pondUpgrades: [PondUpgradePlan]) {
        struct FishingFile: Decodable {
            let fish: [Fish]
            let pondUpgrades: [PondUpgrade]
        }
        struct Fish: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let rarity: Double?
            let baseValue: Int?
            let difficulty: Int?
            let minSize: Int?
            let maxSize: Int?
            let description: String?
        }
        struct PondUpgrade: Decodable {
            let id: String
            let level: Int?
            let name: String
            let capacity: Int?
            let regenRate: Double?
            let cost: Int?
            let rarityBonus: Double?
        }

        do {
            let decoded = try JSONDecoder().decode(FishingFile.self, from: data)
            let fish = decoded.fish.map {
                FishTypePlan(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.emoji ?? $0.icon ?? "🐟",
                    rarity: max(0.0001, $0.rarity ?? 0.1),
                    baseValue: max(0, $0.baseValue ?? 0),
                    difficulty: max(1, $0.difficulty ?? 1),
                    minSize: max(1, $0.minSize ?? 1),
                    maxSize: max(1, $0.maxSize ?? 1),
                    description: $0.description ?? ""
                )
            }
            let upgrades = decoded.pondUpgrades.map {
                PondUpgradePlan(
                    id: $0.id,
                    level: max(1, $0.level ?? 1),
                    name: $0.name,
                    capacity: max(1, $0.capacity ?? 1),
                    regenRate: max(0.1, $0.regenRate ?? 1.0),
                    cost: max(0, $0.cost ?? 0),
                    rarityBonus: max(1.0, $0.rarityBonus ?? 1.0)
                )
            }
            return (fish, upgrades)
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode fishing.json: \(error.localizedDescription)")
        }
    }

    private static func parseChallenges(from data: Data) throws -> [ChallengePlan] {
        struct ChallengesFile: Decodable { let items: [Item] }
        struct Item: Decodable {
            let id: String
            let name: String
            let emoji: String?
            let icon: String?
            let description: String?
            let difficulty: String?
            let metric: String?
            let target: Int?
            let rewardCoins: Int?
            let rewardXP: Int?
        }

        do {
            let decoded = try JSONDecoder().decode(ChallengesFile.self, from: data)
            return decoded.items.map {
                ChallengePlan(
                    id: $0.id,
                    name: $0.name,
                    icon: $0.emoji ?? $0.icon ?? "🎯",
                    description: $0.description ?? "",
                    difficulty: $0.difficulty ?? "easy",
                    metric: $0.metric ?? "coin_balance",
                    target: max(1, $0.target ?? 1),
                    rewardCoins: max(0, $0.rewardCoins ?? 0),
                    rewardXP: max(0, $0.rewardXP ?? 0)
                )
            }
        } catch {
            throw ContentRepositoryError.invalid("Failed to decode challenges.json: \(error.localizedDescription)")
        }
    }
}
