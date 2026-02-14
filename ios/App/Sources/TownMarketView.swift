import SwiftUI
import GameCore

// MARK: - MarketSection

private enum MarketSection: String, CaseIterable, Identifiable {
    case buy, sell, upgrades, challenges
    var id: String { rawValue }

    var title: String {
        switch self {
        case .buy:        return "Buy"
        case .sell:       return "Sell"
        case .upgrades:   return "Upgrades"
        case .challenges: return "Work Orders"
        }
    }

    var symbol: String {
        switch self {
        case .buy:        return "cart.fill"
        case .sell:       return "dollarsign.circle.fill"
        case .upgrades:   return "hammer.fill"
        case .challenges: return "checklist"
        }
    }
}

// MARK: - TownMarketView

struct TownMarketView: View {
    let store: GameStore
    @State private var section: MarketSection = .buy
    @State private var buyQuantities: [String: Int] = [:]
    @State private var sellQuantities: [String: Int] = [:]
    @State private var pendingSellAllCropID: String?

    var body: some View {
        NavigationStack {
            ZStack {
                // Consistent warm background
                LinearGradient(
                    colors: [
                        Color(red: 0.97, green: 0.92, blue: 0.82),
                        Color(red: 0.88, green: 0.78, blue: 0.62)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: DS.Space.lg) {
                        SectionHeader(
                            "Town Market",
                            subtitle: "Trade harvests, buy supplies, and expand your legacy"
                        )

                        // Section Picker
                        WoodenPanel {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: DS.Space.xs) {
                                    ForEach(MarketSection.allCases) { option in
                                        marketChip(option)
                                    }
                                }
                            }
                        }

                        // Section content with transition
                        Group {
                            switch section {
                            case .buy:        buySection
                            case .sell:       sellSection
                            case .upgrades:   upgradesSection
                            case .challenges: challengesSection
                            }
                        }
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                        .animation(DS.Animation.standard, value: section)
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
            }
            .navigationTitle("Market")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    coinsBadge
                }
            }
        }
    }

    // MARK: - Section Chip

    private func marketChip(_ option: MarketSection) -> some View {
        let isSelected = section == option
        return Button {
            SoundManager.shared.play(.click, haptic: .light)
            withAnimation(DS.Animation.standard) { section = option }
        } label: {
            Label(option.title, systemImage: option.symbol)
                .font(Typography.caption.weight(.semibold))
                .padding(.horizontal, DS.Space.sm)
                .padding(.vertical, DS.Space.xs)
                .background(
                    Capsule(style: .continuous)
                        .fill(isSelected ? DS.Color.chipActive : DS.Color.chipInactive)
                )
                .foregroundStyle(isSelected ? DS.Color.textPrimary : DS.Color.textSecondary)
        }
        .buttonStyle(.plain)
        .animation(DS.Animation.spring, value: isSelected)
    }

    // MARK: - Coins Toolbar Badge

    private var coinsBadge: some View {
        HStack(spacing: DS.Space.xxs) {
            Image(systemName: "circle.fill")
                .font(.caption2)
                .foregroundStyle(DS.Color.money)
            Text("\(store.save.player.coins)")
                .font(Typography.metric)
                .foregroundStyle(Color(red: 0.30, green: 0.18, blue: 0.04))
        }
        .padding(.horizontal, DS.Space.sm)
        .padding(.vertical, 5)
        .background(
            DS.Color.money.opacity(0.20),
            in: Capsule(style: .continuous)
        )
        .overlay(
            Capsule(style: .continuous)
                .strokeBorder(DS.Color.money.opacity(0.35), lineWidth: 1)
        )
    }

    // MARK: - Buy Section

    private var buySection: some View {
        VStack(spacing: DS.Space.md) {
            WoodenPanel {
                VStack(alignment: .leading, spacing: DS.Space.xs) {
                    Text("MARKET INFO")
                        .font(Typography.small.weight(.bold))
                        .foregroundStyle(.white.opacity(0.55))
                    Text("New supplies arrive every morning. Prices fluctuate based on seasonal demand.")
                        .font(Typography.caption)
                        .foregroundStyle(.white)
                }
            }

            WoodenPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    SectionHeader("Seed Shop")

                    ForEach(store.cropDefs, id: \.id) { crop in
                        let cost = store.seedPrice(for: crop.id) ?? crop.seedCost
                        let discounted = cost < crop.seedCost
                        let quantity = max(1, buyQuantities[crop.id] ?? 1)
                        let totalCost = cost * quantity
                        let isAffordable = store.save.player.coins >= totalCost
                        let isUnlocked = store.isUnlocked(cropID: crop.id)

                        HStack(alignment: .top) {
                            Text(store.emoji(for: crop.id))
                                .font(.title)
                                .opacity(isUnlocked ? 1 : 0.45)

                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                HStack(spacing: DS.Space.xs) {
                                    Text(crop.name)
                                        .font(Typography.bodyStrong)
                                        .foregroundStyle(.white)

                                    if store.isDailySpecialSeed(crop.id) {
                                        DealBadge()
                                    }
                                }

                                Text(discounted
                                     ? "\(cost) coins  (was \(crop.seedCost))"
                                     : "\(cost) coins")
                                    .font(Typography.caption)
                                    .foregroundStyle(.white.opacity(0.65))

                                Stepper("Qty \(quantity)", value: Binding(
                                    get: { max(1, buyQuantities[crop.id] ?? 1) },
                                    set: { buyQuantities[crop.id] = min(20, max(1, $0)) }
                                ), in: 1...20)
                                .font(Typography.caption.weight(.bold))
                                .foregroundStyle(.white)
                            }

                            Spacer()

                            Button {
                                SoundManager.shared.play(.purchase, haptic: .medium)
                                _ = store.buySeed(cropID: crop.id, quantity: quantity)
                            } label: {
                                VStack(spacing: 2) {
                                    Text("Buy")
                                        .font(Typography.caption.weight(.bold))
                                    Text("\(totalCost) 🪙")
                                        .font(Typography.small.weight(.bold))
                                }
                            }
                            .buttonStyle(WoodActionStyle(tint: isAffordable ? DS.Color.money : .gray))
                            .frame(width: 84)
                            .disabled(!isAffordable || !isUnlocked)
                        }

                        if crop.id != store.cropDefs.last?.id {
                            Divider().background(.white.opacity(0.10))
                        }
                    }
                }
            }
        }
    }

    // MARK: - Sell Section

    private var sellSection: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                SectionHeader("Sell Harvest")

                let sellable = store.cropDefs.filter { store.cropCount(for: $0.id) > 0 }

                if sellable.isEmpty {
                    EmptyStateView(
                        icon: "basket",
                        title: "Nothing to sell yet.",
                        subtitle: "Harvest your first crop and come back."
                    )
                    .padding(.vertical, DS.Space.sm)
                } else {
                    ForEach(sellable, id: \.id) { crop in
                        let available = store.cropCount(for: crop.id)
                        let unitPrice = store.sellUnitPrice(for: crop.id) ?? crop.sellPrice
                        let quantity  = min(available, max(1, sellQuantities[crop.id] ?? 1))
                        let totalValue = unitPrice * quantity

                        HStack(alignment: .top) {
                            Text(store.emoji(for: crop.id))
                                .font(.title)

                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                Text(crop.name)
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(.white)

                                Text("\(unitPrice) coins each · \(available) available")
                                    .font(Typography.caption)
                                    .foregroundStyle(.white.opacity(0.65))

                                Stepper("Qty \(quantity)", value: Binding(
                                    get: { min(available, max(1, sellQuantities[crop.id] ?? 1)) },
                                    set: { sellQuantities[crop.id] = min(available, max(1, $0)) }
                                ), in: 1...max(1, available))
                                .font(Typography.caption.weight(.bold))
                                .foregroundStyle(.white)
                            }

                            Spacer()

                            VStack(spacing: DS.Space.xs) {
                                Button {
                                    SoundManager.shared.play(.sell, haptic: .medium)
                                    _ = store.sellCrop(cropID: crop.id, quantity: quantity)
                                } label: {
                                    VStack(spacing: 2) {
                                        Text("Sell")
                                            .font(Typography.caption.weight(.bold))
                                        Text("\(totalValue) 🪙")
                                            .font(Typography.small.weight(.bold))
                                    }
                                }
                                .buttonStyle(WoodActionStyle(tint: DS.Color.accent))

                                Button {
                                    pendingSellAllCropID = crop.id
                                } label: {
                                    Text("Sell All (\(available))")
                                        .font(Typography.small.weight(.bold))
                                        .underline()
                                        .foregroundStyle(.white.opacity(0.75))
                                }
                            }
                            .frame(width: 100)
                        }

                        if crop.id != sellable.last?.id {
                            Divider().background(.white.opacity(0.10))
                        }
                    }
                }
            }
        }
        .confirmationDialog(
            "Sell All?",
            isPresented: Binding(
                get: { pendingSellAllCropID != nil },
                set: { if !$0 { pendingSellAllCropID = nil } }
            ),
            presenting: pendingSellAllCropID
        ) { cropID in
            Button("Sell All \(store.cropCount(for: cropID))", role: .destructive) {
                SoundManager.shared.play(.sell, haptic: .heavy)
                _ = store.sellCrop(cropID: cropID, quantity: store.cropCount(for: cropID))
            }
        } message: { cropID in
            Text("Sell all your \(cropID) harvest?")
        }
    }

    // MARK: - Upgrades Section

    private var upgradesSection: some View {
        VStack(spacing: DS.Space.md) {
            WoodenPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    SectionHeader("Infrastructure")

                    ForEach(store.buildingPlans) { plan in
                        let level    = store.buildingLevel(for: plan.id)
                        let nextCost = plan.costForNextLevel(currentLevel: level)
                        let isMax    = level >= plan.maxLevel
                        let isLocked = store.playerLevel < plan.requiredLevel
                        let bonus    = plan.bonusForLevel(level)

                        HStack(alignment: .top, spacing: DS.Space.sm) {
                            ZStack {
                                Circle()
                                    .fill(.white.opacity(0.10))
                                    .frame(width: 44, height: 44)
                                Text(plan.icon).font(.title3)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(plan.name)
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(.white)

                                if isLocked {
                                    Label("Unlocks at Level \(plan.requiredLevel)", systemImage: "lock.fill")
                                        .font(Typography.small)
                                        .foregroundStyle(DS.Color.accent.opacity(0.85))
                                } else {
                                    Text("Level \(level) / \(plan.maxLevel)")
                                        .font(Typography.small)
                                        .foregroundStyle(.white.opacity(0.60))
                                    if level > 0 {
                                        Text(bonus)
                                            .font(Typography.small)
                                            .foregroundStyle(DS.Color.accent.opacity(0.85))
                                    }
                                }
                            }

                            Spacer()

                            if isMax {
                                Text("MAX")
                                    .font(Typography.caption.weight(.bold))
                                    .foregroundStyle(DS.Color.accent)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(.white.opacity(0.12), in: Capsule())
                            } else if let cost = nextCost {
                                Button {
                                    SoundManager.shared.play(.purchase, haptic: .medium)
                                    _ = store.upgradeBuilding(plan.id)
                                } label: {
                                    VStack(spacing: 1) {
                                        Text("Upgrade")
                                            .font(Typography.caption.weight(.bold))
                                        Text("\(cost) 🪙")
                                            .font(Typography.small.weight(.bold))
                                    }
                                }
                                .buttonStyle(WoodActionStyle(tint: isLocked ? .gray : DS.Color.xp))
                                .frame(width: 90)
                                .disabled(store.save.player.coins < cost || isLocked)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }

            WoodenPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    SectionHeader("Land Expansion")

                    if let cost = store.nextExpansionCost {
                        HStack {
                            VStack(alignment: .leading) {
                                Text("Expand Fields")
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(.white)
                                Text("Current: \(store.save.world.gridWidth)×\(store.save.world.gridWidth) tiles")
                                    .font(Typography.caption)
                                    .foregroundStyle(.white.opacity(0.65))
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
                            .buttonStyle(WoodActionStyle(tint: DS.Color.money))
                            .frame(width: 100)
                            .disabled(store.save.player.coins < cost)
                        }
                    } else {
                        Text("Maximum farm size reached.")
                            .font(Typography.caption)
                            .foregroundStyle(.white.opacity(0.65))
                    }
                }
            }
        }
    }

    // MARK: - Challenges Section

    private var challengesSection: some View {
        VStack(spacing: DS.Space.md) {
            WoodenPanel {
                VStack(spacing: DS.Space.xs) {
                    Image(systemName: "list.clipboard.fill")
                        .font(.title3)
                        .foregroundStyle(DS.Color.money)
                    Text("Village Bulletin Board")
                        .font(Typography.section)
                        .foregroundStyle(.white)
                    Text("Complete daily work orders for coins and XP.")
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.72))
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
            }

            ForEach(store.challengePlans, id: \.id) { challenge in
                let progress = store.challengeProgress(for: challenge)
                let isClaimed = store.isChallengeClaimedToday(challenge.id)
                let isReady   = store.canClaimChallenge(challenge)
                let pct       = min(1.0, Double(progress) / Double(max(1, challenge.target)))

                WoodenPanel {
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        HStack {
                            Text(challenge.icon).font(.title2)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(challenge.name)
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(isClaimed ? .white.opacity(0.45) : .white)
                                Text(challenge.description)
                                    .font(Typography.caption)
                                    .foregroundStyle(.white.opacity(0.75))
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
                                        .foregroundStyle(DS.Color.money)
                                    Label("\(challenge.rewardXP) XP", systemImage: "sparkles")
                                        .font(Typography.small.weight(.bold))
                                        .foregroundStyle(DS.Color.xp)
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
                                .foregroundStyle(.white.opacity(0.55))

                                GeometryReader { g in
                                    ZStack(alignment: .leading) {
                                        Capsule().fill(.white.opacity(0.10))
                                        Capsule()
                                            .fill(
                                                LinearGradient(
                                                    colors: [DS.Color.accent, DS.Color.accent.opacity(0.7)],
                                                    startPoint: .leading,
                                                    endPoint: .trailing
                                                )
                                            )
                                            .frame(width: g.size.width * pct)
                                            .animation(DS.Animation.standard, value: pct)
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
                            .buttonStyle(WoodActionStyle(tint: isReady ? DS.Color.xp : .gray))
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
    @State private var pulse = false

    var body: some View {
        Text("Deal")
            .font(Typography.small.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(DS.Color.money, in: Capsule())
            .scaleEffect(pulse ? 1.06 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true)) {
                    pulse = true
                }
            }
    }
}
