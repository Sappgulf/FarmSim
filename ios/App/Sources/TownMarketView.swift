import SwiftUI
import GameCore

// MARK: - MarketSection

private enum MarketSection: String, CaseIterable, Identifiable {
    case buy, sell, upgrades, challenges, fishing, pets
    var id: String { rawValue }

    var title: String {
        switch self {
        case .buy:        return "Buy"
        case .sell:       return "Sell"
        case .upgrades:   return "Upgrades"
        case .challenges: return "Work Orders"
        case .fishing:    return "Fishing"
        case .pets:       return "Pets"
        }
    }

    var symbol: String {
        switch self {
        case .buy:        return "cart.fill"
        case .sell:       return "dollarsign.circle.fill"
        case .upgrades:   return "hammer.fill"
        case .challenges: return "checklist"
        case .fishing:    return "fish.fill"
        case .pets:       return "pawprint.fill"
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

    private var reducedMotion: Bool {
        accessibilityReduceMotion || store.settings.reducedMotion
    }

    var body: some View {
        NavigationStack {
            ZStack {
                // Cobblestone street base
                TownStreetBackground()
                    .ignoresSafeArea()

                ScrollView {
                    LazyVStack(alignment: .leading, spacing: DS.Space.lg, pinnedViews: []) {
                        // Market stall awning header
                        TownMarketHeader(reducedMotion: reducedMotion)
                            .id("header")

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
                        .id("picker")

                        // Section content with transition
                        Group {
                            switch section {
                            case .buy:        buySection
                            case .sell:       sellSection
                            case .upgrades:   upgradesSection
                            case .challenges: challengesSection
                            case .fishing:    FishingSection(store: store)
                            case .pets:       PetsSection(store: store)
                            }
                        }
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                        .animation(reducedMotion ? nil : DS.Animation.standard, value: section)
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
            }
            .navigationTitle("Market")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color(red: 0.38, green: 0.26, blue: 0.14), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
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
            if reducedMotion {
                section = option
            } else {
                withAnimation(DS.Animation.standard) { section = option }
            }
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
        .animation(reducedMotion ? nil : DS.Animation.spring, value: isSelected)
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
                                        DealBadge(reducedMotion: reducedMotion)
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
    let reducedMotion: Bool
    @State private var pulse = false

    var body: some View {
        Text("Deal")
            .font(Typography.small.weight(.bold))
            .foregroundStyle(.white)
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
        GeometryReader { geo in
            ZStack {
                // Late-afternoon warm sky
                LinearGradient(
                    colors: [
                        Color(red: 0.97, green: 0.88, blue: 0.68),
                        Color(red: 0.92, green: 0.76, blue: 0.52),
                        Color(red: 0.80, green: 0.62, blue: 0.42)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Building facades + cobblestone street (drawingGroup caches the composite)
                Canvas { ctx, size in
                    // ── Left storefront ──────────────────────────────
                    var leftWall = Path()
                    leftWall.addRect(CGRect(
                        x: 0, y: size.height * 0.18,
                        width: size.width * 0.21, height: size.height))
                    ctx.fill(leftWall, with: .color(Color(red: 0.54, green: 0.40, blue: 0.26).opacity(0.90)))

                    // Left: wooden trim at top of facade
                    var leftTrim = Path()
                    leftTrim.addRect(CGRect(
                        x: 0, y: size.height * 0.18,
                        width: size.width * 0.21, height: 10))
                    ctx.fill(leftTrim, with: .color(Color(red: 0.34, green: 0.22, blue: 0.10)))

                    // Left windows (2×2 grid)
                    for row in 0..<2 {
                        for col in 0..<2 {
                            var win = Path()
                            let wx = 10.0 + Double(col) * 42
                            let wy = size.height * 0.26 + Double(row) * 52
                            win.addRoundedRect(
                                in: CGRect(x: wx, y: wy, width: 26, height: 32),
                                cornerSize: CGSize(width: 3, height: 3))
                            ctx.fill(win, with: .color(Color(red: 1.0, green: 0.87, blue: 0.58).opacity(0.80)))
                            // Window frame
                            ctx.stroke(win, with: .color(Color(red: 0.30, green: 0.18, blue: 0.06)), lineWidth: 1.5)
                        }
                    }

                    // ── Right storefront ──────────────────────────────
                    var rightWall = Path()
                    rightWall.addRect(CGRect(
                        x: size.width * 0.79, y: size.height * 0.14,
                        width: size.width * 0.21, height: size.height))
                    ctx.fill(rightWall, with: .color(Color(red: 0.50, green: 0.36, blue: 0.22).opacity(0.90)))

                    var rightTrim = Path()
                    rightTrim.addRect(CGRect(
                        x: size.width * 0.79, y: size.height * 0.14,
                        width: size.width * 0.21, height: 10))
                    ctx.fill(rightTrim, with: .color(Color(red: 0.30, green: 0.20, blue: 0.08)))

                    for row in 0..<2 {
                        for col in 0..<2 {
                            var win = Path()
                            let wx = size.width * 0.81 + Double(col) * 42
                            let wy = size.height * 0.22 + Double(row) * 52
                            win.addRoundedRect(
                                in: CGRect(x: wx, y: wy, width: 26, height: 32),
                                cornerSize: CGSize(width: 3, height: 3))
                            ctx.fill(win, with: .color(Color(red: 1.0, green: 0.87, blue: 0.58).opacity(0.80)))
                            ctx.stroke(win, with: .color(Color(red: 0.30, green: 0.18, blue: 0.06)), lineWidth: 1.5)
                        }
                    }

                    // ── Cobblestone street (bottom 35%) ──────────────
                    let streetY = size.height * 0.65
                    var street = Path()
                    street.addRect(CGRect(x: 0, y: streetY, width: size.width, height: size.height - streetY))
                    ctx.fill(street, with: .color(Color(red: 0.56, green: 0.48, blue: 0.38)))

                    let stoneW: CGFloat = 30
                    let stoneH: CGFloat = 18
                    let cols = Int(size.width / stoneW) + 2
                    let rows = Int((size.height - streetY) / stoneH) + 2
                    for row in 0..<rows {
                        let offset: CGFloat = row.isMultiple(of: 2) ? 0 : stoneW * 0.5
                        for col in 0..<cols {
                            var stone = Path()
                            let sx = offset + CGFloat(col) * stoneW
                            let sy = streetY + CGFloat(row) * stoneH
                            stone.addRoundedRect(
                                in: CGRect(x: sx + 1.5, y: sy + 1.5, width: stoneW - 3, height: stoneH - 3),
                                cornerSize: CGSize(width: 4, height: 4))
                            let lightness = row.isMultiple(of: 2) ? 0.06 : -0.02
                            ctx.fill(stone, with: .color(
                                Color(red: 0.60 + lightness, green: 0.52 + lightness, blue: 0.41 + lightness)
                            ))
                            ctx.stroke(stone, with: .color(Color(red: 0.40, green: 0.34, blue: 0.26).opacity(0.40)), lineWidth: 0.5)
                        }
                    }
                }

                // Warm lantern bloom (top-center)
                RadialGradient(
                    colors: [
                        Color(red: 1.0, green: 0.85, blue: 0.52).opacity(0.30),
                        Color(red: 1.0, green: 0.72, blue: 0.36).opacity(0.10),
                        .clear
                    ],
                    center: .init(x: 0.5, y: 0.05),
                    startRadius: 8,
                    endRadius: geo.size.width * 0.70
                )
                .blendMode(.multiply)

                // Street-level warm fill (dust & golden light)
                LinearGradient(
                    colors: [.clear, Color(red: 0.90, green: 0.74, blue: 0.50).opacity(0.18)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .allowsHitTesting(false)

                // Vignette
                LinearGradient(
                    colors: [.black.opacity(0.10), .clear, .black.opacity(0.24)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .allowsHitTesting(false)
            }
            .drawingGroup()
            .ignoresSafeArea()
        }
    }
}

// MARK: - TownMarketHeader

private struct TownMarketHeader: View {
    let reducedMotion: Bool
    @State private var sway = false

    var body: some View {
        VStack(spacing: 0) {
            // Hanging rope lines
            Canvas { ctx, size in
                for xFrac in [0.32, 0.68] as [Double] {
                    var rope = Path()
                    rope.move(to: CGPoint(x: size.width * xFrac, y: 0))
                    rope.addLine(to: CGPoint(x: size.width * xFrac, y: size.height))
                    ctx.stroke(
                        rope,
                        with: .color(Color(red: 0.34, green: 0.22, blue: 0.08)),
                        style: StrokeStyle(lineWidth: 2.5, lineCap: .round)
                    )
                }
            }
            .frame(height: 24)

            // Wooden sign board
            ZStack {
                // Base wood
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .fill(LinearGradient(
                        colors: [
                            Color(red: 0.54, green: 0.36, blue: 0.16),
                            Color(red: 0.40, green: 0.26, blue: 0.10)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    ))

                // Outer border
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .strokeBorder(Color(red: 0.65, green: 0.46, blue: 0.22).opacity(0.65), lineWidth: 1.5)

                // Inner carved inset
                RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                    .strokeBorder(Color(red: 0.24, green: 0.14, blue: 0.04).opacity(0.55), lineWidth: 1)
                    .padding(7)

                // Plank texture (Canvas — one draw call)
                Canvas { ctx, size in
                    let w = size.width / 5
                    for i in stride(from: 1, through: 4, by: 2) {
                        var plank = Path()
                        plank.addRect(CGRect(x: CGFloat(i) * w, y: 0, width: w, height: size.height))
                        ctx.fill(plank, with: .color(Color.white.opacity(0.04)))
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))

                VStack(spacing: 4) {
                    HStack(spacing: 8) {
                        Text("🏪").font(.system(size: 20))
                        Text("TOWN MARKET")
                            .font(.system(.title3, design: .serif).weight(.bold))
                            .foregroundStyle(Color(red: 1.0, green: 0.90, blue: 0.68))
                            .tracking(1.5)
                        Text("🏪").font(.system(size: 20))
                    }

                    // Decorative serif rule
                    HStack(spacing: 6) {
                        Rectangle()
                            .fill(Color(red: 1.0, green: 0.82, blue: 0.52).opacity(0.50))
                            .frame(height: 0.5)
                        Text("✦")
                            .font(.system(size: 8))
                            .foregroundStyle(Color(red: 1.0, green: 0.82, blue: 0.52).opacity(0.70))
                        Rectangle()
                            .fill(Color(red: 1.0, green: 0.82, blue: 0.52).opacity(0.50))
                            .frame(height: 0.5)
                    }
                    .padding(.horizontal, 20)

                    Text("Est. Year One  ·  Open Daily")
                        .font(.system(.caption2, design: .serif).italic())
                        .foregroundStyle(Color(red: 1.0, green: 0.84, blue: 0.62).opacity(0.78))
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.vertical, DS.Space.sm)
            }
            .frame(maxWidth: 300)
            .shadow(color: .black.opacity(0.28), radius: 6, y: 3)
            .rotationEffect(.degrees(reducedMotion ? 0 : (sway ? 1.4 : -1.4)))
            .onAppear {
                guard !reducedMotion else { return }
                withAnimation(.easeInOut(duration: 3.8).repeatForever(autoreverses: true)) {
                    sway = true
                }
            }

            // Awning stripes (Canvas — single draw call instead of 14 Rectangle views)
            Canvas { ctx, size in
                let stripeW = size.width / 14
                for i in 0..<14 {
                    var stripe = Path()
                    stripe.addRect(CGRect(x: CGFloat(i) * stripeW, y: 0, width: stripeW, height: size.height))
                    let color: Color = i.isMultiple(of: 2)
                        ? Color(red: 0.72, green: 0.16, blue: 0.10)
                        : Color(red: 0.95, green: 0.93, blue: 0.88)
                    ctx.fill(stripe, with: .color(color))
                }
            }
            .frame(height: 16)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
            .shadow(color: .black.opacity(0.22), radius: 4, y: 3)
            .padding(.top, 8)
            .padding(.horizontal, -DS.Space.md)
        }
        .frame(maxWidth: .infinity)
    }
}
