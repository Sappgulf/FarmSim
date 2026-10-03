import Foundation

/// Permanent effects of the native research catalog. Existing completion flags remain valid.
public struct ResearchBenefits: Sendable {
    public private(set) var seedCostMultiplier = 1.0
    public private(set) var growthMultiplier = 1.0
    public private(set) var yieldMultiplier = 1.0
    public private(set) var saleMultiplier = 1.0
    public private(set) var fishValueMultiplier = 1.0
    public private(set) var honeyCoinsPerDay = 0
    public private(set) var automaticWatering = false
    public private(set) var hybridBreeding = false

    private init(seed: Double = 1, growth: Double = 1, yield: Double = 1, sale: Double = 1,
                 fish: Double = 1, honey: Int = 0, water: Bool = false, hybrids: Bool = false) {
        seedCostMultiplier = seed
        growthMultiplier = growth
        yieldMultiplier = yield
        saleMultiplier = sale
        fishValueMultiplier = fish
        honeyCoinsPerDay = honey
        automaticWatering = water
        hybridBreeding = hybrids
    }

    private static let definitions: [String: ResearchBenefits] = [
        "hybrid_crops": .init(yield: 1.05, hybrids: true),
        "irrigation_system": .init(seed: 0.95, water: true),
        "pest_genetics": .init(yield: 1.1),
        "market_analytics": .init(sale: 1.2),
        "climate_control": .init(seed: 0.95, growth: 1.15, yield: 1.1),
        "soil_enhancement": .init(yield: 1.15),
        "automation_core": .init(seed: 0.9, yield: 1.1),
        "composting": .init(seed: 0.9),
        "beekeeping": .init(yield: 1.1, honey: 5),
        "aquaponics": .init(growth: 1.1, fish: 1.1),
    ]

    public static func supports(_ id: String) -> Bool { definitions[id] != nil }

    public init(completed: [String: Bool]) {
        self.init()
        // Stable order keeps stacked floating-point effects reproducible after save/reload.
        for id in completed.keys.sorted() where completed[id] == true {
            guard let effect = Self.definitions[id] else { continue }
            seedCostMultiplier *= effect.seedCostMultiplier
            growthMultiplier *= effect.growthMultiplier
            yieldMultiplier *= effect.yieldMultiplier
            saleMultiplier *= effect.saleMultiplier
            fishValueMultiplier *= effect.fishValueMultiplier
            honeyCoinsPerDay += effect.honeyCoinsPerDay
            automaticWatering = automaticWatering || effect.automaticWatering
            hybridBreeding = hybridBreeding || effect.hybridBreeding
        }
    }

    public func seedCost(for baseCost: Int, otherMultiplier: Double = 1) -> Int {
        if baseCost == 0 { return 0 }
        let cost = Double(max(0, baseCost)) * seedCostMultiplier * otherMultiplier
        guard cost.isFinite, cost >= 0, cost < Double(Int.max) else { return max(1, baseCost) }
        return max(1, Int(cost.rounded(.down)))
    }

    public static func summary(for id: String) -> String? {
        guard let effect = definitions[id] else { return nil }
        func percent(_ multiplier: Double) -> Int { Int(((multiplier - 1) * 100).rounded()) }
        var parts: [String] = []
        if effect.hybridBreeding { parts.append("Unlocks hybrid breeding") }
        if effect.automaticWatering { parts.append("Waters planted crops automatically each day") }
        if effect.honeyCoinsPerDay > 0 { parts.append("Earns \(effect.honeyCoinsPerDay) honey coins per farm day") }
        if effect.seedCostMultiplier < 1 { parts.append("\(-percent(effect.seedCostMultiplier))% lower seed prices") }
        if effect.growthMultiplier > 1 { parts.append("+\(percent(effect.growthMultiplier))% crop growth") }
        if effect.yieldMultiplier > 1 { parts.append("+\(percent(effect.yieldMultiplier))% harvest yield on average") }
        if effect.saleMultiplier > 1 { parts.append("+\(percent(effect.saleMultiplier))% crop sale and fish value") }
        if effect.fishValueMultiplier > 1 { parts.append("+\(percent(effect.fishValueMultiplier))% fish value") }
        return parts.joined(separator: "; ") + "."
    }
}
