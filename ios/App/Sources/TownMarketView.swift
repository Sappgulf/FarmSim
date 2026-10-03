import SwiftUI
import GameCore

// MARK: - MarketSection

enum MarketSection: String, CaseIterable, Identifiable {
    case buy, sell, upgrades, challenges, tasks, fishing, pets, livestock, research, genetics
    var id: String { rawValue }

    var title: String {
        switch self {
        case .buy:        return "Seed Shop"
        case .sell:       return "Sell Harvest"
        case .upgrades:   return "Upgrades"
        case .challenges: return "Work Orders"
        case .tasks:      return "Tasks"
        case .fishing:    return "Fishing"
        case .pets:       return "Pets"
        case .livestock:  return "Animals"
        case .research:   return "Research"
        case .genetics:   return "Genetics"
        }
    }

    var symbol: String {
        switch self {
        case .buy:        return "cart.fill"
        case .sell:       return "dollarsign.circle.fill"
        case .upgrades:   return "hammer.fill"
        case .challenges: return "checklist"
        case .tasks:      return "checklist.checked"
        case .fishing:    return "fish.fill"
        case .pets:       return "pawprint.fill"
        case .livestock:  return "hare.fill"
        case .research:   return "flask.fill"
        case .genetics:   return "leaf.circle.fill"
        }
    }
}

// MARK: - TownMarketView

struct TownMarketView: View {
    @Environment(\.accessibilityReduceMotion) private var accessibilityReduceMotion
    let store: GameStore
    @State private var section: MarketSection = .buy
    @State private var buyQuantities: [String: Int] = [:]
    @State private var sellQuantities: [String: Int] = [:]
    @State private var pendingSellAllCropID: String?

    private var reducedMotion: Bool { accessibilityReduceMotion || store.settings.reducedMotion }

    var body: some View {
        NavigationStack {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: DS.Space.md, pinnedViews: [.sectionHeaders]) {
                        TownMarketHeader()
                        Section {
                            MarketSectionContent(section: section, store: store,
                                buyQuantities: $buyQuantities, sellQuantities: $sellQuantities,
                                pendingSellAllCropID: $pendingSellAllCropID, reducedMotion: reducedMotion)
                        } header: {
                            MarketSectionPicker(section: $section, reducedMotion: reducedMotion)
                                .padding(.vertical, DS.Space.xs)
                                .background(MarketPalette.canvas)
                                .id("departments")
                        }
                    }
                    .padding(.horizontal, DS.Space.md)
                    .padding(.top, DS.Space.sm)
                    .padding(.bottom, DS.Space.xxl)
                    .frame(maxWidth: 760)
                    .frame(maxWidth: .infinity)
                }
                .onChange(of: section) { _, _ in
                    if reducedMotion {
                        proxy.scrollTo("departments", anchor: .top)
                    } else {
                        withAnimation(DS.Animation.standard) { proxy.scrollTo("departments", anchor: .top) }
                    }
                }
            }
            .background(TownStreetBackground().ignoresSafeArea())
            .environment(\.colorScheme, .light)
            .scrollIndicators(.hidden)
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("Town")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(MarketPalette.canvas, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.light, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { coinsBadge }
            }
        }
    }

    private var coinsBadge: some View {
        MarketCoinValue(amount: store.save.player.coins)
            .font(.subheadline.weight(.bold))
            .foregroundStyle(MarketPalette.ink)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(MarketPalette.paper, in: Capsule())
            .overlay(Capsule().strokeBorder(MarketPalette.border.opacity(0.3), lineWidth: 1))
    }
}

// MARK: - MarketSectionPicker

private struct MarketSectionPicker: View {
    @Binding var section: MarketSection
    let reducedMotion: Bool

    var body: some View {
        MarketPanel {
            VStack(spacing: DS.Space.sm) {
                HStack(spacing: DS.Space.sm) {
                    Image(systemName: section.symbol)
                        .font(.title3)
                        .foregroundStyle(MarketPalette.leaf)
                        .frame(width: 40, height: 40)
                        .background(MarketPalette.leaf.opacity(0.09), in: RoundedRectangle(cornerRadius: 10))
                        .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("DEPARTMENT").font(.caption2.weight(.bold)).tracking(1)
                            .foregroundStyle(MarketPalette.muted)
                        Text(section.title).font(.headline).foregroundStyle(MarketPalette.ink)
                            .accessibilityAddTraits(.isHeader)
                    }
                    Spacer(minLength: 4)
                    Menu {
                        ForEach(MarketSection.allCases) { option in
                            Button { select(option) } label: {
                                Label(option.title, systemImage: section == option ? "checkmark" : option.symbol)
                            }
                        }
                    } label: {
                        Image(systemName: "square.grid.2x2")
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(MarketPalette.leaf)
                            .frame(width: 44, height: 44)
                            .background(MarketPalette.leaf.opacity(0.09), in: RoundedRectangle(cornerRadius: 10))
                    }
                    .accessibilityLabel("Choose Town department")
                    .accessibilityHint("Browse all ten market departments")
                }
                HStack(spacing: 6) {
                    quickButton(.buy, title: "Seeds")
                    quickButton(.sell, title: "Sell")
                    quickButton(.upgrades, title: "Build")
                    quickButton(.fishing, title: "Fish")
                }
            }
        }
    }

    private func quickButton(_ option: MarketSection, title: String) -> some View {
        Button { select(option) } label: {
            Text(title)
                .font(.caption.weight(.bold))
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(section == option ? MarketPalette.leaf : MarketPalette.canvas,
                            in: RoundedRectangle(cornerRadius: 10))
                .foregroundStyle(section == option ? .white : MarketPalette.ink)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(option.title)
        .accessibilityAddTraits(section == option ? .isSelected : [])
    }

    private func select(_ option: MarketSection) {
        SoundManager.shared.play(.click, haptic: .light)
        if reducedMotion { section = option }
        else { withAnimation(DS.Animation.standard) { section = option } }
    }
}

// MARK: - MarketSectionContent

private struct MarketSectionContent: View {
    let section: MarketSection
    let store: GameStore
    @Binding var buyQuantities: [String: Int]
    @Binding var sellQuantities: [String: Int]
    @Binding var pendingSellAllCropID: String?
    let reducedMotion: Bool

    var body: some View {
        Group {
            switch section {
            case .buy:
                MarketBuySection(
                    store: store,
                    buyQuantities: $buyQuantities,
                    reducedMotion: reducedMotion
                )
            case .sell:
                MarketSellSection(
                    store: store,
                    sellQuantities: $sellQuantities,
                    pendingSellAllCropID: $pendingSellAllCropID
                )
            case .upgrades:
                MarketUpgradesSection(store: store)
            case .challenges:
                MarketChallengesSection(store: store, reducedMotion: reducedMotion)
            case .tasks:
                MarketTasksSection(store: store)
            case .fishing:
                FishingSection(store: store)
            case .pets:
                PetsSection(store: store)
            case .livestock:
                MarketLivestockSection(store: store)
            case .research:
                MarketResearchSection(store: store)
            case .genetics:
                MarketGeneticsSection(store: store)
            }
        }
    }
}

// MARK: - MarketBuySection

private struct MarketBuySection: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    let store: GameStore
    @Binding var buyQuantities: [String: Int]
    let reducedMotion: Bool
    @State private var showAllSeeds = false

    private var crops: [CropDef] {
        store.orderedSeedChoices.filter { showAllSeeds || store.isUnlocked(cropID: $0.id) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                Text("Start something good.")
                    .font(.system(.title3, design: .serif).weight(.bold))
                    .foregroundStyle(MarketPalette.ink)
                Text("Seed prices include today's deals and your farm bonuses.")
                    .font(.caption).foregroundStyle(MarketPalette.muted)
                Picker("Seed availability", selection: $showAllSeeds) {
                    Text("Your level").tag(false)
                    Text("All seeds").tag(true)
                }
                .pickerStyle(.segmented)
                .accessibilityLabel("Seed availability")
            }
            .padding(.horizontal, 4)

            ForEach(crops, id: \.id) { crop in
                seedCard(crop)
            }
        }
    }

    private func seedCard(_ crop: CropDef) -> some View {
        let unlocked = store.isUnlocked(cropID: crop.id)
        let cost = store.seedPrice(for: crop.id) ?? crop.seedCost
        let quantity = max(1, buyQuantities[crop.id] ?? 1)
        let total = cost * quantity
        let affordable = store.save.player.coins >= total
        return MarketPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(spacing: DS.Space.sm) {
                    GameAssetIcon(id: crop.id, fallback: store.emoji(for: crop.id), size: 60)
                        .grayscale(unlocked ? 0 : 0.7)
                        .frame(width: 72, height: 72)
                        .background(MarketPalette.canvas, in: RoundedRectangle(cornerRadius: 14))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(crop.name).font(.headline).foregroundStyle(MarketPalette.ink)
                        HStack(spacing: 4) {
                            MarketCoinValue(amount: cost)
                            Text("each").foregroundStyle(MarketPalette.muted)
                            if cost < crop.seedCost {
                                Text(crop.seedCost.formatted()).strikethrough()
                                    .foregroundStyle(MarketPalette.muted)
                            }
                        }
                        .font(.subheadline.weight(.semibold))
                        if store.isDailySpecialSeed(crop.id) {
                            Label("Today's deal", systemImage: "tag.fill")
                                .font(.caption.weight(.bold)).foregroundStyle(MarketPalette.leaf)
                        }
                        Text("\(store.seedCount(for: crop.id)) in your seed box")
                            .font(.caption).foregroundStyle(MarketPalette.muted)
                    }
                    Spacer(minLength: 0)
                }
                if unlocked {
                    if dynamicTypeSize.isAccessibilitySize {
                        VStack(spacing: DS.Space.sm) {
                            quantityControl(crop.id)
                            buyButton(crop.id, quantity: quantity, total: total, affordable: affordable)
                        }
                    } else {
                        HStack(spacing: DS.Space.sm) {
                            quantityControl(crop.id)
                            buyButton(crop.id, quantity: quantity, total: total, affordable: affordable)
                                .frame(width: 112)
                        }
                    }
                    if !affordable {
                        Text("Need \(total - store.save.player.coins) more coins")
                            .font(.caption).foregroundStyle(MarketPalette.muted)
                    }
                } else {
                    Label("Unlocks at level \(store.cropDisplay[crop.id]?.level ?? 1)", systemImage: "lock.fill")
                        .font(.caption.weight(.semibold)).foregroundStyle(MarketPalette.muted)
                }
            }
        }
    }

    private func quantityControl(_ cropID: String) -> some View {
        Stepper(value: Binding(
            get: { max(1, buyQuantities[cropID] ?? 1) },
            set: { buyQuantities[cropID] = min(20, max(1, $0)) }
        ), in: 1...20) {
            Text("Qty \(max(1, buyQuantities[cropID] ?? 1))")
                .font(.caption.weight(.semibold)).monospacedDigit()
        }
        .frame(minHeight: 44)
        .accessibilityLabel("\(store.cropName(for: cropID)) quantity")
    }

    private func buyButton(_ cropID: String, quantity: Int, total: Int, affordable: Bool) -> some View {
        Button {
            _ = store.buySeed(cropID: cropID, quantity: quantity)
        } label: {
            VStack(spacing: 1) {
                Text("Buy \(quantity)")
                Text("\(total) coins").font(.caption)
            }
        }
        .buttonStyle(MarketActionStyle())
        .disabled(!affordable)
        .accessibilityLabel("Buy \(quantity) \(store.cropName(for: cropID)) seeds for \(total) coins")
    }
}

// MARK: - MarketSellSection

private struct MarketSellSection: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    let store: GameStore
    @Binding var sellQuantities: [String: Int]
    @Binding var pendingSellAllCropID: String?

    private var sellable: [CropDef] {
        store.cropDefs.filter { store.cropCount(for: $0.id) > 0 }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            VStack(alignment: .leading, spacing: 4) {
                Text("From your fields to the market.")
                    .font(.system(.title3, design: .serif).weight(.bold))
                    .foregroundStyle(MarketPalette.ink)
                Text("Prices change daily. Choose how much to bring to the stall.")
                    .font(.caption).foregroundStyle(MarketPalette.muted)
            }
            .padding(.horizontal, 4)

            if sellable.isEmpty {
                MarketPanel {
                    MarketEmptyState(icon: "basket", title: "Your baskets are empty",
                                     subtitle: "Harvest a ripe crop on your farm, then bring it here to sell.")
                }
            } else {
                ForEach(sellable, id: \.id) { crop in sellCard(crop) }
            }
        }
        .confirmationDialog("Sell All?", isPresented: Binding(
            get: { pendingSellAllCropID != nil },
            set: { if !$0 { pendingSellAllCropID = nil } }
        ), presenting: pendingSellAllCropID) { cropID in
            Button("Sell All \(store.cropCount(for: cropID)) \(store.cropName(for: cropID))", role: .destructive) {
                _ = store.sellCrop(cropID: cropID, quantity: store.cropCount(for: cropID))
            }
        } message: { cropID in
            Text("Sell your entire \(store.cropName(for: cropID)) harvest?")
        }
    }

    private func sellCard(_ crop: CropDef) -> some View {
        let available = store.cropCount(for: crop.id)
        let unit = store.sellUnitPrice(for: crop.id) ?? crop.sellPrice
        let quantity = min(available, max(1, sellQuantities[crop.id] ?? 1))
        let total = unit * quantity
        let trend = store.sellPriceTrend(for: crop.id)
        let history = store.sellPriceHistory(for: crop.id)
        return MarketPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(spacing: DS.Space.sm) {
                    GameAssetIcon(id: crop.id, fallback: store.emoji(for: crop.id), size: 60)
                        .frame(width: 72, height: 72)
                        .background(MarketPalette.canvas, in: RoundedRectangle(cornerRadius: 14))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(crop.name).font(.headline).foregroundStyle(MarketPalette.ink)
                        Text("\(available) ready to sell").font(.caption).foregroundStyle(MarketPalette.muted)
                        HStack(spacing: 4) {
                            MarketCoinValue(amount: unit)
                            Text("each").foregroundStyle(MarketPalette.muted)
                            if trend >= 1.01 || trend <= 0.99 {
                                Image(systemName: trend >= 1.01 ? "arrow.up.right" : "arrow.down.right")
                                    .foregroundStyle(trend >= 1.01 ? MarketPalette.leaf : MarketPalette.danger)
                                    .accessibilityLabel(trend >= 1.01 ? "Price rising" : "Price falling")
                            }
                        }
                        .font(.subheadline.weight(.semibold))
                    }
                    Spacer(minLength: 0)
                    if history.count > 1 {
                        PriceSparkline(data: history, color: MarketPalette.leaf)
                            .frame(width: 46, height: 22)
                            .accessibilityHidden(true)
                    }
                }
                if dynamicTypeSize.isAccessibilitySize {
                    VStack(spacing: DS.Space.sm) {
                        quantityControl(crop.id, available: available)
                        sellButton(crop.id, quantity: quantity, total: total)
                    }
                } else {
                    HStack(spacing: DS.Space.sm) {
                        quantityControl(crop.id, available: available)
                        sellButton(crop.id, quantity: quantity, total: total).frame(width: 112)
                    }
                }
                Button { pendingSellAllCropID = crop.id } label: {
                    Text("Sell all \(available)")
                        .font(.caption.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 44)
                }
                .foregroundStyle(MarketPalette.leaf)
                .buttonStyle(.plain)
                .accessibilityLabel("Sell all \(available) \(crop.name)")
            }
        }
    }

    private func quantityControl(_ cropID: String, available: Int) -> some View {
        Stepper(value: Binding(
            get: { min(available, max(1, sellQuantities[cropID] ?? 1)) },
            set: { sellQuantities[cropID] = min(available, max(1, $0)) }
        ), in: 1...max(1, available)) {
            Text("Qty \(min(available, max(1, sellQuantities[cropID] ?? 1)))")
                .font(.caption.weight(.semibold)).monospacedDigit()
        }
        .frame(minHeight: 44)
        .accessibilityLabel("\(store.cropName(for: cropID)) sale quantity")
    }

    private func sellButton(_ cropID: String, quantity: Int, total: Int) -> some View {
        Button { _ = store.sellCrop(cropID: cropID, quantity: quantity) } label: {
            VStack(spacing: 1) {
                Text("Sell \(quantity)")
                Text("\(total) coins").font(.caption)
            }
        }
        .buttonStyle(MarketActionStyle(honey: true))
        .accessibilityLabel("Sell \(quantity) \(store.cropName(for: cropID)) for \(total) coins")
    }
}

// MARK: - MarketUpgradesSection

private struct MarketUpgradesSection: View {
    let store: GameStore

    var body: some View {
        VStack(spacing: DS.Space.md) {
            MarketPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    MarketSectionHeading("Infrastructure")

                    ForEach(store.buildingPlans) { plan in
                        let level = store.buildingLevel(for: plan.id)
                        let nextCost = plan.costForNextLevel(currentLevel: level)
                        let isMax = level >= plan.maxLevel
                        let isLocked = store.playerLevel < plan.requiredLevel
                        let bonus = plan.bonusForLevel(level)

                        HStack(alignment: .top, spacing: DS.Space.sm) {
                            ZStack {
                                Circle()
                                    .fill(MarketPalette.ink.opacity(0.10))
                                    .frame(width: 44, height: 44)
                                GameAssetIcon(id: plan.id, fallback: plan.icon, size: 38)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(plan.name)
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(MarketPalette.ink)

                                if isLocked {
                                    Label("Unlocks at Level \(plan.requiredLevel)", systemImage: "lock.fill")
                                        .font(Typography.small)
                                        .foregroundStyle(MarketPalette.leaf)
                                } else {
                                    Text("Level \(level) / \(plan.maxLevel)")
                                        .font(Typography.small)
                                        .foregroundStyle(MarketPalette.muted)
                                    if level > 0 {
                                        Text(bonus)
                                            .font(Typography.small)
                                            .foregroundStyle(MarketPalette.leaf)
                                    }
                                    if !isMax {
                                        let nextBonus = plan.bonusForLevel(level + 1)
                                        Label("Next: \(nextBonus)", systemImage: "arrow.up.circle.fill")
                                            .font(Typography.small)
                                            .foregroundStyle(MarketPalette.muted)
                                    }
                                }
                            }

                            Spacer()

                            if isMax {
                                Text("MAX")
                                    .font(Typography.caption.weight(.bold))
                                    .foregroundStyle(MarketPalette.leaf)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(MarketPalette.ink.opacity(0.12), in: Capsule())
                            } else if let cost = nextCost {
                                Button {
                                    SoundManager.shared.play(.purchase, haptic: .medium)
                                    _ = store.upgradeBuilding(plan.id)
                                } label: {
                                    VStack(spacing: 1) {
                                        Text("Upgrade")
                                            .font(Typography.caption.weight(.bold))
                                        Text("\(cost) \u{1FA99}")
                                            .font(Typography.small.weight(.bold))
                                    }
                                }
                                .buttonStyle(MarketActionStyle())
                                .frame(width: 90)
                                .disabled(store.save.player.coins < cost || isLocked)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }

            // Active synergies panel
            if !store.activeBuildingSynergies.isEmpty {
                MarketPanel {
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        MarketSectionHeading("Active Synergies")

                        ForEach(store.activeBuildingSynergies) { synergy in
                            HStack(spacing: DS.Space.sm) {
                                Text(synergy.icon).font(.title3)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(synergy.name)
                                        .font(Typography.bodyStrong)
                                        .foregroundStyle(MarketPalette.ink)
                                    Text(synergy.bonus)
                                        .font(Typography.small)
                                        .foregroundStyle(MarketPalette.leaf)
                                }
                                Spacer()
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(MarketPalette.leaf)
                            }
                        }
                    }
                }
            }

            MarketPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    MarketSectionHeading("Land Expansion")

                    if let cost = store.nextExpansionCost {
                        HStack {
                            VStack(alignment: .leading) {
                                Text("Expand Fields")
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(MarketPalette.ink)
                                Text("Current: \(store.save.world.gridWidth)×\(store.save.world.gridHeight) tiles")
                                    .font(Typography.caption)
                                    .foregroundStyle(MarketPalette.muted)
                            }
                            Spacer()
                            Button {
                                SoundManager.shared.play(.purchase, haptic: .heavy)
                                _ = store.purchaseExpansion()
                            } label: {
                                VStack(spacing: 1) {
                                    Text("Expand")
                                        .font(Typography.caption.weight(.bold))
                                    Text("\(cost) 🪙")
                                        .font(Typography.small.weight(.bold))
                                }
                            }
                            .buttonStyle(MarketActionStyle())
                            .frame(width: 100)
                            .disabled(store.save.player.coins < cost)
                        }
                    } else {
                        Text("Maximum farm size reached.")
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.muted)
                    }
                }
            }
        }
    }
}

// MARK: - MarketChallengesSection

private struct MarketChallengesSection: View {
    let store: GameStore
    let reducedMotion: Bool

    var body: some View {
        VStack(spacing: DS.Space.md) {
            MarketPanel {
                VStack(spacing: DS.Space.xs) {
                    Image(systemName: "list.clipboard.fill")
                        .font(.title3)
                        .foregroundStyle(MarketPalette.leaf)
                    Text("Village Bulletin Board")
                        .font(Typography.section)
                        .foregroundStyle(MarketPalette.ink)
                    Text("Complete daily work orders for coins and XP.")
                        .font(Typography.caption)
                        .foregroundStyle(MarketPalette.muted)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
            }

            ForEach(store.challengePlans, id: \.id) { challenge in
                let progress = store.challengeProgress(for: challenge)
                let isClaimed = store.isChallengeClaimedToday(challenge.id)
                let isReady = store.canClaimChallenge(challenge)
                let pct = min(1.0, Double(progress) / Double(max(1, challenge.target)))

                MarketPanel {
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        HStack {
                            Text(challenge.icon).font(.title2)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(challenge.name)
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(isClaimed ? MarketPalette.muted : MarketPalette.ink)
                                Text(challenge.description)
                                    .font(Typography.caption)
                                    .foregroundStyle(MarketPalette.muted)
                            }

                            Spacer()

                            if isClaimed {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title3)
                                    .foregroundStyle(Theme.success)
                            } else {
                                VStack(alignment: .trailing, spacing: 2) {
                                    Label("\(challenge.rewardCoins)", systemImage: "circle.fill")
                                        .font(Typography.caption.weight(.bold))
                                        .foregroundStyle(MarketPalette.leaf)
                                    Label("\(challenge.rewardXP) XP", systemImage: "sparkles")
                                        .font(Typography.small.weight(.bold))
                                        .foregroundStyle(MarketPalette.info)
                                }
                            }
                        }

                        if !isClaimed {
                            VStack(spacing: 5) {
                                HStack {
                                    Text("Progress")
                                        .font(Typography.small.weight(.bold))
                                    Spacer()
                                    Text("\(progress) / \(challenge.target)")
                                        .font(Typography.small.weight(.bold))
                                }
                                .foregroundStyle(MarketPalette.muted)

                                GeometryReader { g in
                                    ZStack(alignment: .leading) {
                                        Capsule().fill(MarketPalette.ink.opacity(0.10))
                                        Capsule()
                                            .fill(
                                                LinearGradient(
                                                    colors: [DS.Color.accent, DS.Color.accent.opacity(0.7)],
                                                    startPoint: .leading,
                                                    endPoint: .trailing
                                                )
                                            )
                                            .frame(width: g.size.width * pct)
                                            .animation(reducedMotion ? nil : DS.Animation.standard, value: pct)
                                    }
                                }
                                .frame(height: 7)
                            }
                            .padding(.vertical, 2)

                            Button {
                                SoundManager.shared.play(.success, haptic: .heavy)
                                _ = store.claimChallenge(challenge.id)
                            } label: {
                                Text(isReady ? "Claim Reward" : "In Progress")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(MarketActionStyle())
                            .disabled(!isReady)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - DealBadge

private struct DealBadge: View {
    let reducedMotion: Bool
    @State private var pulse = false

    var body: some View {
        Text("Deal")
            .font(Typography.small.weight(.bold))
            .foregroundStyle(MarketPalette.ink)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(DS.Color.money, in: Capsule())
            .scaleEffect(pulse ? 1.06 : 1.0)
            .animation(reducedMotion ? nil : .easeInOut(duration: 1.1).repeatForever(autoreverses: true), value: pulse)
            .onAppear {
                guard !reducedMotion else { return }
                pulse = true
            }
    }
}

// MARK: - TownStreetBackground

private struct TownStreetBackground: View {
    var body: some View {
        GeometryReader { proxy in
            ZStack {
                MarketPalette.canvas
                Image("menu_landscape_v4")
                    .resizable().scaledToFill()
                    .frame(width: proxy.size.width, height: proxy.size.height)
                    .clipped().opacity(0.075)
                    .accessibilityHidden(true)
                GameMaterialSurface(material: "stone").opacity(0.035)
            }
        }
        .allowsHitTesting(false)
    }
}

private struct TownMarketHeader: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    var body: some View {
        HStack(spacing: DS.Space.sm) {
            VStack(alignment: .leading, spacing: 6) {
                Text("TOWN MARKET")
                    .font(.caption2.weight(.bold)).tracking(1.5)
                    .foregroundStyle(MarketPalette.leaf)
                Text("Good things\ngrow here.")
                    .font(.system(.title2, design: .serif).weight(.bold))
                    .foregroundStyle(MarketPalette.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text("Seeds, harvests & homestead supplies.")
                    .font(.caption).foregroundStyle(MarketPalette.muted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if !dynamicTypeSize.isAccessibilitySize {
                Image("market_stall_v4").resizable().scaledToFit()
                    .frame(width: 126, height: 120)
                    .accessibilityHidden(true)
            }
        }
        .padding(.horizontal, 4)
        .padding(.vertical, DS.Space.sm)
    }
}
