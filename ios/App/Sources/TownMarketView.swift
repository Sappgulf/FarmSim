import SwiftUI
import GameCore

private enum MarketSection: String, CaseIterable, Identifiable {
    case buy
    case sell
    case upgrades

    var id: String { rawValue }

    var title: String {
        switch self {
        case .buy: return "Buy"
        case .sell: return "Sell"
        case .upgrades: return "Upgrades"
        }
    }
}

struct TownMarketView: View {
    @Bindable var store: GameStore
    @State private var section: MarketSection = .buy
    @State private var buyQuantities: [String: Int] = [:]
    @State private var sellQuantities: [String: Int] = [:]
    @State private var pendingSellAllCropID: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.md) {
                    SectionHeader("Town Market", subtitle: "Buy seeds, sell harvests, and apply upgrades")

                    CardContainer {
                        HStack {
                            Image(systemName: "dollarsign.circle.fill")
                                .font(.title2)
                                .foregroundStyle(DS.Color.money)
                            Text("Coins")
                                .font(.headline)
                            Spacer()
                            Text("\(store.save.player.coins)")
                                .font(.title3.monospacedDigit().weight(.bold))
                                .foregroundStyle(DS.Color.money)
                        }
                    }

                    Picker("Market Section", selection: $section) {
                        ForEach(MarketSection.allCases) { option in
                            Label(option.title, systemImage: marketSectionSymbol(option))
                                .tag(option)
                        }
                    }
                    .pickerStyle(.segmented)

                    if section == .buy {
                        CardContainer {
                            VStack(alignment: .leading, spacing: DS.Space.xs) {
                                SectionHeader("Today's Deals", subtitle: "Daily specials rotate with the farm calendar")
                                Text(store.dailySpecialSummary)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(DS.Color.money)
                                Text("Special seeds get an extra 20% discount today.")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        CardContainer {
                            VStack(alignment: .leading, spacing: DS.Space.sm) {
                                SectionHeader("Seed Shop")

                                ForEach(store.cropDefs, id: \.id) { crop in
                                    let cost = store.seedPrice(for: crop.id) ?? crop.seedCost
                                    let discounted = cost < crop.seedCost
                                    let quantity = max(1, buyQuantities[crop.id] ?? 1)
                                    let totalCost = cost * quantity
                                    HStack(alignment: .top) {
                                        Text(store.emoji(for: crop.id))
                                            .font(.title3)
                                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                            HStack(spacing: DS.Space.xs) {
                                                Text(crop.name)
                                                    .font(.body.weight(.semibold))
                                                if store.isDailySpecialSeed(crop.id) {
                                                    Text("Deal")
                                                        .font(.caption2.weight(.semibold))
                                                        .foregroundStyle(.white)
                                                        .padding(.horizontal, 6)
                                                        .padding(.vertical, 2)
                                                        .background(DS.Color.money, in: Capsule())
                                                }
                                            }
                                            Text(discounted ? "\(cost) coins (base \(crop.seedCost))" : "\(cost) coins")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                            Stepper("Qty \(quantity)", value: Binding(
                                                get: { max(1, buyQuantities[crop.id] ?? 1) },
                                                set: { buyQuantities[crop.id] = min(20, max(1, $0)) }
                                            ), in: 1...20)
                                            .font(.caption)
                                        }
                                        Spacer()
                                        Button("Buy \(totalCost)") {
                                            _ = store.buySeed(cropID: crop.id, quantity: quantity)
                                        }
                                        .buttonStyle(.borderedProminent)
                                        .disabled(store.save.player.coins < totalCost || !store.isUnlocked(cropID: crop.id))
                                        .accessibilityLabel("Buy \(quantity) \(crop.name) seeds")
                                    }
                                }
                            }
                        }
                    }

                    if section == .sell {
                        CardContainer {
                            VStack(alignment: .leading, spacing: DS.Space.sm) {
                                SectionHeader("Sell Harvest")

                                let sellable = store.cropDefs.filter { store.cropCount(for: $0.id) > 0 }

                                if sellable.isEmpty {
                                    Text("No harvest to sell yet.")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                } else {
                                    ForEach(sellable, id: \.id) { crop in
                                        let available = store.cropCount(for: crop.id)
                                        let unitPrice = store.sellUnitPrice(for: crop.id) ?? crop.sellPrice
                                        let quantity = min(available, max(1, sellQuantities[crop.id] ?? 1))
                                        HStack(alignment: .top) {
                                            Text(store.emoji(for: crop.id))
                                                .font(.title3)
                                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                                Text(crop.name)
                                                    .font(.body.weight(.semibold))
                                                Text("x\(available) • \(unitPrice) coins each")
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                                Stepper("Qty \(quantity)", value: Binding(
                                                    get: { min(available, max(1, sellQuantities[crop.id] ?? 1)) },
                                                    set: { sellQuantities[crop.id] = min(available, max(1, $0)) }
                                                ), in: 1...max(1, available))
                                                .font(.caption)
                                            }
                                            Spacer()
                                            VStack(spacing: DS.Space.xs) {
                                                Button("Sell \(quantity)") {
                                                    _ = store.sellCrop(cropID: crop.id, quantity: quantity)
                                                }
                                                .buttonStyle(.bordered)
                                                .disabled(available == 0)

                                                Button("Sell All") {
                                                    pendingSellAllCropID = crop.id
                                                }
                                                .buttonStyle(.borderedProminent)
                                                .disabled(available == 0)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        CardContainer {
                            VStack(alignment: .leading, spacing: DS.Space.sm) {
                                SectionHeader("Daily Task Board", subtitle: "Complete requests for bonus rewards")
                                ForEach(store.dailyTasks, id: \.id) { task in
                                    let progress = store.dailyTaskProgress(task)
                                    let claimed = store.isDailyTaskClaimedToday(task)
                                    let ready = store.canClaimDailyTask(task)
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        HStack {
                                            Text(task.title)
                                                .font(.subheadline.weight(.semibold))
                                            Spacer()
                                            Text("+\(task.rewardCoins) / +\(task.rewardXP) XP")
                                                .font(.caption.monospacedDigit())
                                                .foregroundStyle(DS.Color.money)
                                        }
                                        Text(task.detail)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        HStack {
                                            Text("Progress \(progress)/\(task.target)")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                            Spacer()
                                            if claimed {
                                                Text("Claimed")
                                                    .font(.caption.weight(.semibold))
                                                    .foregroundStyle(.green)
                                            } else {
                                                Button("Claim") {
                                                    _ = store.claimDailyTask(task)
                                                }
                                                .buttonStyle(.borderedProminent)
                                                .disabled(!ready)
                                            }
                                        }
                                    }
                                    .padding(.vertical, DS.Space.xxs)
                                }
                            }
                        }
                    }

                    if section == .upgrades {
                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Upgrades")

                            Text("Level \(store.playerLevel)")
                                .font(.headline)

                            Text("Yield multiplier: x\(String(format: "%.2f", store.yieldMultiplier))")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            Text("Grid: \(store.save.world.gridWidth)x\(store.save.world.gridHeight)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            Text("Next grid unlock target: \(store.nextGridUnlock)x\(store.nextGridUnlock)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            Button("Apply Milestone Upgrade") {
                                store.applyPendingGridUpgrade()
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Buildings")

                            ForEach(store.buildingPlans, id: \.id) { plan in
                                let level = store.buildingLevel(for: plan.id)
                                let nextCost = store.nextBuildingCost(for: plan.id)
                                let locked = store.playerLevel < plan.requiredLevel
                                let canAfford = nextCost.map { store.save.player.coins >= $0 } ?? false

                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    HStack {
                                        Text(plan.icon)
                                            .font(.title3)
                                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                            Text(plan.name)
                                                .font(.body.weight(.semibold))
                                            Text("\(plan.category) • \(plan.description)")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Text("Lv \(level)/\(plan.maxLevel)")
                                            .font(.caption.monospacedDigit())
                                            .foregroundStyle(level > 0 ? .secondary : .primary)
                                    }

                                    if level > 0 {
                                        ProgressView(value: Double(level), total: Double(plan.maxLevel))
                                            .tint(DS.Color.accent)
                                    }

                                    if locked {
                                        Text("Unlocks at level \(plan.requiredLevel)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    } else if let nextCost {
                                        HStack {
                                            Text("Next: \(plan.bonusForLevel(level + 1))")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                            Spacer()
                                            Button(level == 0 ? "Build \(nextCost)" : "Upgrade \(nextCost)") {
                                                _ = store.upgradeBuilding(plan.id)
                                            }
                                            .buttonStyle(.borderedProminent)
                                            .disabled(!canAfford)
                                        }
                                    } else {
                                        Text("Max level reached.")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding(.vertical, DS.Space.xxs)
                            }

                            if !store.activeBuildingSynergies.isEmpty {
                                Text("Active Synergies")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                ForEach(store.activeBuildingSynergies, id: \.id) { synergy in
                                    HStack {
                                        Text(synergy.icon)
                                        Text(synergy.name)
                                            .font(.caption.weight(.semibold))
                                        Spacer()
                                        Text(synergy.bonus)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Farm Expansion")

                            let size = store.save.world.gridWidth
                            Text("Current size: \(size)x\(size)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            if let cost = store.nextExpansionCost {
                                Text("Next expansion cost: \(cost) coins")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                Button("Expand to \(min(store.expansionPlan.maxGrid, size + 1))x\(min(store.expansionPlan.maxGrid, size + 1))") {
                                    _ = store.purchaseExpansion()
                                }
                                .buttonStyle(PrimaryButtonStyle())
                                .disabled(!store.canPurchaseExpansion)
                            } else {
                                Text("Farm is at max size.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Research")

                            ForEach(store.researchPlans, id: \.id) { plan in
                                let completed = store.isResearchCompleted(plan.id)
                                let canComplete = store.canCompleteResearch(plan)
                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    HStack {
                                        Text(plan.icon)
                                            .font(.title3)
                                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                            Text(plan.name)
                                                .font(.body.weight(.semibold))
                                            Text("\(plan.category.capitalized) • \(plan.cost) coins • \(plan.durationSeconds / 60)m")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        if completed {
                                            Text("Complete")
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(.green)
                                        } else {
                                            Button("Research") {
                                                _ = store.completeResearch(plan.id)
                                            }
                                            .buttonStyle(.borderedProminent)
                                            .disabled(!canComplete)
                                        }
                                    }
                                    if !plan.prerequisites.isEmpty {
                                        Text("Requires: \(plan.prerequisites.map { researchName($0) }.joined(separator: ", "))")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    if !plan.unlocks.isEmpty {
                                        Text("Unlocks: \(plan.unlocks.map { displayLabel($0) }.joined(separator: ", "))")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding(.vertical, DS.Space.xxs)
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Genetics")

                            if !store.isResearchCompleted("hybrid_crops") {
                                Text("Complete Hybrid Crops research to start breeding.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }

                            ForEach(store.geneticsRecipes, id: \.id) { recipe in
                                let discovered = store.isHybridDiscovered(recipe.id)
                                let outputName = store.cropName(for: recipe.outputCropID)
                                let requirements = recipe.requiredParents()
                                    .sorted(by: { $0.key < $1.key })
                                    .map { "\($0.value)x \(store.cropName(for: $0.key))" }
                                    .joined(separator: " + ")

                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    HStack {
                                        Text(recipe.icon)
                                            .font(.title3)
                                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                            Text(recipe.name)
                                                .font(.body.weight(.semibold))
                                            Text("Output: \(outputName) • Lv \(recipe.levelRequirement)+")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        if discovered {
                                            Text("Discovered")
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(.green)
                                        }
                                    }
                                    Text("Parents: \(requirements)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(recipe.notes)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    HStack {
                                        Text("Owned: \(store.seedCount(for: recipe.outputCropID))")
                                            .font(.caption.monospacedDigit())
                                            .foregroundStyle(.secondary)
                                        Spacer()
                                        Button("Breed") {
                                            _ = store.discoverHybrid(recipe.id)
                                        }
                                        .buttonStyle(.borderedProminent)
                                        .disabled(!store.canBreed(recipe))
                                    }
                                }
                                .padding(.vertical, DS.Space.xxs)
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Livestock")

                            HStack {
                                Text("Capacity: \(store.usedLivestockCapacity)/\(store.livestockCapacity)")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Button("Collect Products") {
                                    _ = store.collectLivestockProducts()
                                }
                                .buttonStyle(.borderedProminent)
                            }

                            ForEach(store.livestockPlans, id: \.id) { plan in
                                let count = store.livestockCount(for: plan.id)
                                let canBuy = store.canBuyLivestock(plan.id)
                                HStack {
                                    Text(plan.icon)
                                        .font(.title3)
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        Text(plan.name)
                                            .font(.body.weight(.semibold))
                                        Text("Owned: \(count) • Cost: \(plan.cost) • Lv \(plan.requiredLevel)+")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Button("Buy") {
                                        _ = store.buyLivestock(plan.id)
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .disabled(!canBuy)
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Pets")

                            ForEach(store.petPlans, id: \.id) { plan in
                                let level = store.petLevel(for: plan.id)
                                HStack {
                                    Text(plan.icon)
                                        .font(.title3)
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        Text(plan.name)
                                            .font(.body.weight(.semibold))
                                        Text("Lv \(level)/\(plan.maxLevel) • \(plan.bonusLabel)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    if level == 0 {
                                        Button("Adopt \(plan.cost)") {
                                            _ = store.adoptPet(plan.id)
                                        }
                                        .buttonStyle(.borderedProminent)
                                        .disabled(!store.canAdoptPet(plan.id))
                                    } else {
                                        Button("Train") {
                                            _ = store.trainPet(plan.id)
                                        }
                                        .buttonStyle(.bordered)
                                        .disabled(level >= plan.maxLevel)
                                    }
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Fishing")

                            HStack {
                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    Text("\(store.currentPondUpgrade.name)")
                                        .font(.body.weight(.semibold))
                                    Text("Pond Lv \(store.fishingPondLevel) • Total caught: \(store.totalFishCaught)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Button("Cast Line") {
                                    _ = store.castFishingLine()
                                }
                                .buttonStyle(.borderedProminent)
                            }

                            if let next = store.nextPondUpgrade {
                                HStack {
                                    Text("Next pond upgrade: \(next.name) (\(next.cost) coins)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Spacer()
                                    Button("Upgrade") {
                                        _ = store.upgradePond()
                                    }
                                    .buttonStyle(.bordered)
                                    .disabled(store.save.player.coins < next.cost)
                                }
                            }

                            ForEach(store.fishPlans.prefix(5), id: \.id) { fish in
                                HStack {
                                    Text(fish.icon)
                                    Text(fish.name)
                                        .font(.subheadline.weight(.semibold))
                                    Spacer()
                                    Text("x\(store.fishCaughtCount(for: fish.id))")
                                        .font(.caption.monospacedDigit())
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Challenges")

                            Text("Streak: \(store.challengeStreak)")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.secondary)

                            ForEach(store.challengePlans, id: \.id) { challenge in
                                let progress = store.challengeProgress(for: challenge)
                                let ready = store.canClaimChallenge(challenge)
                                let claimedToday = store.isChallengeClaimedToday(challenge.id)

                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    HStack {
                                        Text(challenge.icon)
                                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                            Text(challenge.name)
                                                .font(.body.weight(.semibold))
                                            Text(challenge.description)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Text(challenge.difficulty.capitalized)
                                            .font(.caption.weight(.semibold))
                                            .foregroundStyle(.secondary)
                                    }
                                    HStack {
                                        ProgressView(value: Double(progress), total: Double(challenge.target))
                                            .tint(ready ? Theme.success : DS.Color.xp)
                                        Spacer()
                                        if claimedToday {
                                            Text("Claimed")
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(.green)
                                        } else {
                                            Button("Claim") {
                                                _ = store.claimChallenge(challenge.id)
                                            }
                                            .buttonStyle(.borderedProminent)
                                            .disabled(!ready)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Season Board", subtitle: "Live from shared content")

                            Text(currentSeason.capitalized)
                                .font(.headline)

                            if seasonalFestivals.isEmpty {
                                Text("No festivals for this season.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                ForEach(seasonalFestivals, id: \.id) { festival in
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        HStack {
                                            Text(festival.icon)
                                            Text(festival.name)
                                                .font(.subheadline.weight(.semibold))
                                        }
                                        Text("\(festival.cadence.capitalized) • \(festival.durationSeconds)s")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        if !festival.details.isEmpty {
                                            Text(festival.details)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                                .lineLimit(2)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Featured Mini-Games")

                            if store.minigameDefs.isEmpty {
                                Text("No mini-game content loaded.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                ForEach(store.minigameDefs.prefix(3), id: \.id) { minigame in
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        HStack {
                                            Text(minigame.icon)
                                            Text(minigame.title)
                                                .font(.subheadline.weight(.semibold))
                                            Spacer()
                                            Text("\(minigame.rounds) rounds")
                                                .font(.caption.monospacedDigit())
                                                .foregroundStyle(.secondary)
                                        }
                                        if !minigame.instructions.isEmpty {
                                            Text(minigame.instructions)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                                .lineLimit(2)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    }
                }
                .padding(DS.Space.md)
                .padding(.bottom, DS.Space.lg)
            }
            .navigationTitle("Town")
            .farmBackground(palette: store.settings.palette)
            .confirmationDialog("Sell all produce?", isPresented: Binding(
                get: { pendingSellAllCropID != nil },
                set: { isPresented in if !isPresented { pendingSellAllCropID = nil } }
            )) {
                if let cropID = pendingSellAllCropID {
                    Button("Sell All \(store.cropName(for: cropID))", role: .destructive) {
                        let quantity = store.cropCount(for: cropID)
                        if quantity > 0 {
                            _ = store.sellCrop(cropID: cropID, quantity: quantity)
                        }
                        pendingSellAllCropID = nil
                    }
                }
                Button("Cancel", role: .cancel) {
                    pendingSellAllCropID = nil
                }
            }
        }
    }

    private var currentSeason: String {
        let seasons = ["spring", "summer", "autumn", "winter"]
        return seasons[store.save.world.day % seasons.count]
    }

    private var seasonalFestivals: [FestivalDef] {
        store.festivalDefs
            .filter { $0.season == "all" || $0.season == currentSeason }
            .prefix(3)
            .map { $0 }
    }

    private func researchName(_ researchID: String) -> String {
        store.researchPlans.first(where: { $0.id == researchID })?.name ?? displayLabel(researchID)
    }

    private func displayLabel(_ value: String) -> String {
        value
            .replacingOccurrences(of: "_", with: " ")
            .split(separator: " ")
            .map { $0.capitalized }
            .joined(separator: " ")
    }

    private func marketSectionSymbol(_ section: MarketSection) -> String {
        switch section {
        case .buy:
            return "cart.fill"
        case .sell:
            return "dollarsign.circle.fill"
        case .upgrades:
            return "wrench.and.screwdriver.fill"
        }
    }
}
