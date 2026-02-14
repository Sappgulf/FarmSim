import SwiftUI
import GameCore

private enum MarketSection: String, CaseIterable, Identifiable {
    case buy
    case sell
    case upgrades
    case challenges

    var id: String { rawValue }

    var title: String {
        switch self {
        case .buy: return "Buy"
        case .sell: return "Sell"
        case .upgrades: return "Upgrades"
        case .challenges: return "Work Orders"
        }
    }
}

struct TownMarketView: View {
    let store: GameStore
    @State private var section: MarketSection = .buy
    @State private var buyQuantities: [String: Int] = [:]
    @State private var sellQuantities: [String: Int] = [:]
    @State private var pendingSellAllCropID: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.96, green: 0.92, blue: 0.85).ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: DS.Space.lg) {
                        SectionHeader("Town Market", subtitle: "Trade harvests, buy supplies, and expand your legacy")

                        WoodenPanel {
                            Picker("Market Mode", selection: $section) {
                                ForEach(MarketSection.allCases) { option in
                                    Label(option.title, systemImage: marketSectionSymbol(option))
                                        .tag(option)
                                }
                            }
                            .pickerStyle(.segmented)
                        }

                        if section == .buy {
                            buySection
                        } else if section == .sell {
                            sellSection
                        } else if section == .upgrades {
                            upgradesSection
                        } else {
                            challengesSection
                        }
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
            }
            .navigationTitle("Market")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var buySection: some View {
        VStack(spacing: DS.Space.md) {
            WoodenPanel {
                VStack(alignment: .leading, spacing: DS.Space.xs) {
                    Text("MARKET INFO")
                        .font(.caption2.bold())
                        .foregroundStyle(.white.opacity(0.6))
                    Text("New supplies arrive every morning. Prices fluctuate based on seasonal demand.")
                        .font(.caption)
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
                        
                        HStack(alignment: .top) {
                            Text(store.emoji(for: crop.id))
                                .font(.title)
                            
                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                HStack(spacing: DS.Space.xs) {
                                    Text(crop.name)
                                        .font(.body.weight(.bold))
                                        .foregroundStyle(.white)
                                    
                                    if store.isDailySpecialSeed(crop.id) {
                                        Text("Deal")
                                            .font(.caption2.bold())
                                            .foregroundStyle(.white)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(DS.Color.money, in: Capsule())
                                    }
                                }
                                
                                Text(discounted ? "\(cost) coins (base \(crop.seedCost))" : "\(cost) coins")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.7))
                                
                                Stepper("Qty \(quantity)", value: Binding(
                                    get: { max(1, buyQuantities[crop.id] ?? 1) },
                                    set: { buyQuantities[crop.id] = min(20, max(1, $0)) }
                                ), in: 1...20)
                                .font(.caption.bold())
                                .foregroundStyle(.white)
                            }
                            
                            Spacer()
                            
                            Button {
                                _ = store.buySeed(cropID: crop.id, quantity: quantity)
                            } label: {
                                Text("Buy \(totalCost)")
                                    .font(.caption.bold())
                            }
                            .buttonStyle(WoodActionStyle(tint: DS.Color.money))
                            .frame(width: 100)
                            .disabled(store.save.player.coins < totalCost || !store.isUnlocked(cropID: crop.id))
                        }
                        
                        if crop.id != store.cropDefs.last?.id {
                            Divider().background(.white.opacity(0.1))
                        }
                    }
                }
            }
        }
    }

    private var sellSection: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                SectionHeader("Sell Harvest")

                let sellable = store.cropDefs.filter { store.cropCount(for: $0.id) > 0 }

                if sellable.isEmpty {
                    Text("No harvest to sell yet.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.6))
                        .padding(.vertical, DS.Space.lg)
                        .frame(maxWidth: .infinity)
                } else {
                    ForEach(sellable, id: \.id) { crop in
                        let available = store.cropCount(for: crop.id)
                        let unitPrice = store.sellUnitPrice(for: crop.id) ?? crop.sellPrice
                        let quantity = min(available, max(1, sellQuantities[crop.id] ?? 1))
                        let totalValue = unitPrice * quantity

                        HStack(alignment: .top) {
                            Text(store.emoji(for: crop.id))
                                .font(.title)

                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                Text(crop.name)
                                    .font(.body.weight(.bold))
                                    .foregroundStyle(.white)
                                
                                Text("\(unitPrice) coins each")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.7))

                                Stepper("Qty \(quantity)", value: Binding(
                                    get: { min(available, max(1, sellQuantities[crop.id] ?? 1)) },
                                    set: { sellQuantities[crop.id] = min(available, max(1, $0)) }
                                ), in: 1...max(1, available))
                                .font(.caption.bold())
                                .foregroundStyle(.white)
                            }

                            Spacer()

                            VStack(spacing: DS.Space.xs) {
                                Button {
                                    _ = store.sellCrop(cropID: crop.id, quantity: quantity)
                                } label: {
                                    Text("Sell \(totalValue)")
                                }
                                .buttonStyle(WoodActionStyle(tint: DS.Color.accent))
                                
                                Button {
                                    pendingSellAllCropID = crop.id
                                } label: {
                                    Text("Sell All (\(available))")
                                        .font(.caption2.bold())
                                        .underline()
                                        .foregroundStyle(.white.opacity(0.8))
                                }
                            }
                            .frame(width: 110)
                        }

                        if crop.id != sellable.last?.id {
                            Divider().background(.white.opacity(0.1))
                        }
                    }
                }
            }
        }
        .confirmationDialog("Sell All?", isPresented: Binding(get: { pendingSellAllCropID != nil }, set: { if !$0 { pendingSellAllCropID = nil } }), presenting: pendingSellAllCropID) { cropID in
            Button("Sell All \(store.cropCount(for: cropID))", role: .destructive) {
                _ = store.sellCrop(cropID: cropID, quantity: store.cropCount(for: cropID))
            }
        } message: { cropID in
            Text("Are you sure you want to sell all your \(cropID) harvests?")
        }
    }

    private var challengesSection: some View {
        VStack(spacing: DS.Space.md) {
            Text("Village Bulletin Board")
                .font(.title3.bold())
                .foregroundStyle(.brown)
            
            Text("Complete these daily work orders to earn extra coins and experience.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            VStack(spacing: DS.Space.md) {
                SwiftUI.ForEach(store.challengePlans, id: \ChallengePlan.id) { (challenge: ChallengePlan) in
                    let progress = store.challengeProgress(for: challenge)
                    let isClaimed = store.isChallengeClaimedToday(challenge.id)
                    let isReady = store.canClaimChallenge(challenge)
                    let progressPercent = min(1.0, Double(progress) / Double(max(1, challenge.target)))
                    
                    WoodenPanel {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            HStack {
                                Text(challenge.icon)
                                    .font(.title2)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(challenge.name)
                                        .font(.headline.bold())
                                        .foregroundStyle(isClaimed ? .white.opacity(0.5) : .white)
                                    Text(challenge.description)
                                        .font(.caption)
                                        .foregroundStyle(.white.opacity(0.8))
                                }
                                
                                Spacer()
                                
                                if isClaimed {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(Theme.success)
                                } else {
                                    VStack(alignment: .trailing, spacing: 2) {
                                        Text("\(challenge.rewardCoins) coins")
                                            .font(.caption.bold())
                                            .foregroundStyle(DS.Color.money)
                                        Text("\(challenge.rewardXP) XP")
                                            .font(.caption2.bold())
                                            .foregroundStyle(DS.Color.xp)
                                    }
                                }
                            }
                            
                            if !isClaimed {
                                VStack(spacing: 4) {
                                    HStack {
                                        Text("Progress")
                                            .font(.system(size: 10, weight: .bold))
                                        Spacer()
                                        Text("\(progress) / \(challenge.target)")
                                            .font(.system(size: 10, weight: .bold))
                                    }
                                    .foregroundStyle(.white.opacity(0.6))
                                    
                                    GeometryReader { g in
                                        ZStack(alignment: .leading) {
                                            Capsule().fill(.white.opacity(0.1))
                                            Capsule().fill(DS.Color.accent)
                                                .frame(width: g.size.width * progressPercent)
                                        }
                                    }
                                    .frame(height: 6)
                                }
                                .padding(.vertical, 4)
                                
                                Button {
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
    private var upgradesSection: some View {
        VStack(spacing: DS.Space.md) {
            WoodenPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    SectionHeader("Infrastructure")
                    
                    let plans = store.buildingPlans
                    ForEach(plans) { plan in
                        let level = store.buildingLevel(for: plan.id)
                        let nextCost = plan.costForNextLevel(currentLevel: level)
                        let isMax = level >= plan.maxLevel
                        let isLocked = store.playerLevel < plan.requiredLevel
                        let currentBonus = plan.bonusForLevel(level)
                        
                        HStack(alignment: .top, spacing: DS.Space.sm) {
                            ZStack {
                                Circle()
                                    .fill(.white.opacity(0.1))
                                    .frame(width: 44, height: 44)
                                Text(plan.icon)
                                    .font(.title3)
                            }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text(plan.name)
                                    .font(.body.weight(.bold))
                                    .foregroundStyle(.white)
                                
                                if isLocked {
                                    Label("Unlocks at Level \(plan.requiredLevel)", systemImage: "lock.fill")
                                        .font(.caption2)
                                        .foregroundStyle(DS.Color.accent.opacity(0.9))
                                } else {
                                    Text("Level \(level) / \(plan.maxLevel)")
                                        .font(.caption2)
                                        .foregroundStyle(.white.opacity(0.6))
                                    
                                    if level > 0 {
                                        Text(currentBonus)
                                            .font(.system(size: 10, weight: .medium))
                                            .foregroundStyle(DS.Color.accent.opacity(0.8))
                                            .lineLimit(1)
                                    }
                                }
                            }
                            
                            Spacer()
                            
                            if isMax {
                                Text("MAX")
                                    .font(.caption.bold())
                                    .foregroundStyle(DS.Color.accent)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(.white.opacity(0.1), in: Capsule())
                            } else if let cost = nextCost {
                                Button {
                                    _ = store.upgradeBuilding(plan.id)
                                } label: {
                                    VStack(spacing: 0) {
                                        Text("Upgrade")
                                            .font(.caption.bold())
                                        Text("\(cost)")
                                            .font(.system(size: 10, weight: .bold))
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
                                    .font(.body.weight(.bold))
                                    .foregroundStyle(.white)
                                Text("Current size: \(store.save.world.gridWidth)x\(store.save.world.gridWidth)")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                            
                            Spacer()
                            
                            Button {
                                _ = store.purchaseExpansion()
                            } label: {
                                Text("Expand \(cost)")
                            }
                            .buttonStyle(WoodActionStyle(tint: DS.Color.money))
                            .frame(width: 120)
                            .disabled(store.save.player.coins < cost)
                        }
                    } else {
                        Text("Maximum farm size reached.")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }
            }
        }
    }

    private func marketSectionSymbol(_ section: MarketSection) -> String {
        switch section {
        case .buy: return "cart.fill"
        case .sell: return "dollarsign.circle.fill"
        case .upgrades: return "hammer.fill"
        case .challenges: return "checklist"
        }
    }
}
