import SwiftUI

struct BarnInventoryView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    @State private var query = ""
    @State private var selectedCategory: BarnShelfCategory = .all
    @State private var selectedItem: BarnInventoryItemModel?
    @State private var selectedSort: BarnItemSort = .name
    @State private var showingShopCounter = false

    var body: some View {
        NavigationStack {
            ZStack {
                BarnBackgroundView()

                ScrollView {
                    VStack(alignment: .leading, spacing: DS.Space.md) {
                        BarnHeaderHUD(
                            coins: store.save.player.coins,
                            stockCount: totalStockCount,
                            maxCapacity: store.maxInventoryCapacity,
                            onVisitShop: { showingShopCounter = true },
                            onOpenMarketTab: { appState.selectedTab = .market }
                        )

                        categoryChips

                        if visibleShelves.isEmpty {
                            emptyBarnState
                        } else {
                            ForEach(visibleShelves) { shelf in
                                ShelfSectionView(
                                    shelf: shelf,
                                    favorites: store.favoriteItemIDs,
                                    onSelect: { selectedItem = $0 }
                                )
                            }
                        }
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xl)
                }
            }
            .navigationTitle("Barn")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, prompt: "Search stockroom")
            .toolbarBackground(Color(red: 0.38, green: 0.21, blue: 0.10), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .sheet(item: $selectedItem) { item in
            BarnItemDetailSheet(
                item: item,
                isFavorite: store.isFavorite(itemID: item.itemID),
                onToggleFavorite: { toggleFavorite(item.itemID) },
                onSellOne: { sell(item: item, quantity: 1) },
                onSellAll: { sell(item: item, quantity: item.count) },
                onUse: { use(item: item) }
            )
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showingShopCounter) {
            NavigationStack {
                ShopView(store: store)
                    .navigationTitle("Shop Counter")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Done") {
                                showingShopCounter = false
                            }
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Town Market", systemImage: "storefront.fill") {
                                showingShopCounter = false
                                appState.selectedTab = .market
                            }
                        }
                    }
            }
        }
    }

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.xs) {
                ForEach(BarnShelfCategory.allCases) { category in
                    let selected = selectedCategory == category
                    Button {
                        selectedCategory = category
                    } label: {
                        Label(category.title, systemImage: category.symbol)
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, DS.Space.sm)
                            .padding(.vertical, DS.Space.xs)
                            .background(
                                Capsule(style: .continuous)
                                    .fill(selected ? DS.Color.chipActive : DS.Color.chipInactive)
                            )
                            .foregroundStyle(selected ? DS.Color.textPrimary : DS.Color.textSecondary)
                    }
                    .buttonStyle(.plain)
                }

                Menu {
                    Picker("Sort", selection: $selectedSort) {
                        ForEach(BarnItemSort.allCases) { option in
                            Text(option.title).tag(option)
                        }
                    }
                } label: {
                    Label(selectedSort.title, systemImage: "arrow.up.arrow.down.circle.fill")
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, DS.Space.sm)
                        .padding(.vertical, DS.Space.xs)
                        .background(
                            Capsule(style: .continuous)
                                .fill(DS.Color.chipInactive)
                        )
                        .foregroundStyle(DS.Color.textSecondary)
                }
            }
            .padding(.horizontal, 1)
        }
    }

    private var emptyBarnState: some View {
        EmptyStateView(
            icon: "shippingbox",
            title: "Your shelves are quiet right now.",
            subtitle: "Try harvesting crops or visit the shop counter for supplies."
        )
    }

    private var visibleShelves: [BarnShelfModel] {
        let text = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return barnShelves.compactMap { shelf in
            if selectedCategory != .all && shelf.category != selectedCategory {
                return nil
            }
            let filtered: [BarnInventoryItemModel]
            if text.isEmpty {
                filtered = shelf.items
            } else {
                filtered = shelf.items.filter { $0.searchableText.contains(text) }
            }
            guard !filtered.isEmpty else { return nil }
            let sorted = sortItems(filtered)
            return BarnShelfModel(
                category: shelf.category,
                title: shelf.title,
                subtitle: shelf.subtitle,
                symbol: shelf.symbol,
                items: sorted
            )
        }
    }

    private var barnShelves: [BarnShelfModel] {
        [
            BarnShelfModel(
                category: .seeds,
                title: "Seed Crates",
                subtitle: "Ready for planting back in the fields",
                symbol: "leaf.fill",
                items: seedItems
            ),
            BarnShelfModel(
                category: .harvest,
                title: "Harvest Bins",
                subtitle: "Fresh produce waiting for market",
                symbol: "shippingbox.fill",
                items: harvestItems
            ),
            BarnShelfModel(
                category: .tools,
                title: "Tool Bench",
                subtitle: "Built upgrades and active farm systems",
                symbol: "hammer.fill",
                items: toolItems
            ),
            BarnShelfModel(
                category: .decor,
                title: "Decor Loft",
                subtitle: "Catalog from shared decor content",
                symbol: "paintpalette.fill",
                items: decorItems
            ),
            BarnShelfModel(
                category: .specials,
                title: "Special Crates",
                subtitle: "Hybrid discoveries and challenge progress",
                symbol: "star.fill",
                items: specialItems
            ),
        ]
        .filter { !$0.items.isEmpty }
    }

    private var seedItems: [BarnInventoryItemModel] {
        store.cropDefs.compactMap { def in
            let count = store.seedCount(for: def.id)
            guard count > 0 else { return nil }
            let display = store.cropDisplay[def.id]
            let season = (display?.season ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            return BarnInventoryItemModel(
                id: "seed:\(def.id)",
                itemID: def.id,
                shelf: .seeds,
                title: def.name,
                subtitle: season.isEmpty ? "Seed stock" : "\(season.capitalized) seed",
                detail: display?.description ?? "Seed ready for planting.",
                symbol: "leaf.fill",
                emoji: display?.emoji ?? store.emoji(for: def.id),
                count: count,
                unitSellPrice: nil,
                canSell: false,
                canUse: true
            )
        }
    }

    private var harvestItems: [BarnInventoryItemModel] {
        store.cropDefs.compactMap { def in
            let count = store.cropCount(for: def.id)
            guard count > 0 else { return nil }
            let display = store.cropDisplay[def.id]
            let category = (display?.category ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            return BarnInventoryItemModel(
                id: "crop:\(def.id)",
                itemID: def.id,
                shelf: .harvest,
                title: def.name,
                subtitle: category.isEmpty ? "Harvest" : category.capitalized,
                detail: display?.description ?? "Ready for shipping.",
                symbol: "shippingbox.fill",
                emoji: display?.emoji ?? store.emoji(for: def.id),
                count: count,
                unitSellPrice: store.sellUnitPrice(for: def.id),
                canSell: true,
                canUse: false
            )
        }
    }

    private var toolItems: [BarnInventoryItemModel] {
        let buildingEntries = store.buildingPlans.compactMap { plan -> BarnInventoryItemModel? in
            let level = store.buildingLevel(for: plan.id)
            guard level > 0 else { return nil }
            return BarnInventoryItemModel(
                id: "tool:building:\(plan.id)",
                itemID: plan.id,
                shelf: .tools,
                title: plan.name,
                subtitle: "Building Lv \(level)",
                detail: plan.bonusForLevel(level),
                symbol: "hammer.fill",
                emoji: plan.icon,
                count: level,
                unitSellPrice: nil,
                canSell: false,
                canUse: false
            )
        }

        let researchEntries = store.researchPlans.compactMap { plan -> BarnInventoryItemModel? in
            guard store.isResearchCompleted(plan.id) else { return nil }
            return BarnInventoryItemModel(
                id: "tool:research:\(plan.id)",
                itemID: plan.id,
                shelf: .tools,
                title: plan.name,
                subtitle: "Research complete",
                detail: plan.description,
                symbol: "wrench.and.screwdriver.fill",
                emoji: plan.icon,
                count: 1,
                unitSellPrice: nil,
                canSell: false,
                canUse: false
            )
        }

        return buildingEntries + researchEntries
    }

    private var decorItems: [BarnInventoryItemModel] {
        store.decorDefs.prefix(18).map { decor in
            BarnInventoryItemModel(
                id: "decor:\(decor.id)",
                itemID: decor.id,
                shelf: .decor,
                title: decor.name,
                subtitle: "\(decor.category.capitalized) decor",
                detail: decor.details.isEmpty ? "Available in the shop for \(decor.cost) coins." : decor.details,
                symbol: "paintpalette.fill",
                emoji: decor.icon,
                count: 0,
                unitSellPrice: nil,
                canSell: false,
                canUse: false
            )
        }
    }

    private var specialItems: [BarnInventoryItemModel] {
        var items: [BarnInventoryItemModel] = []

        if store.challengeStreak > 0 {
            items.append(
                BarnInventoryItemModel(
                    id: "special:challenge_streak",
                    itemID: "challenge_streak",
                    shelf: .specials,
                    title: "Challenge Streak",
                    subtitle: "\(store.challengeStreak) day streak",
                    detail: "Keep claiming challenge rewards to extend your streak.",
                    symbol: "flame.fill",
                    emoji: "🔥",
                    count: store.challengeStreak,
                    unitSellPrice: nil,
                    canSell: false,
                    canUse: false
                )
            )
        }

        for recipe in store.geneticsRecipes where store.isHybridDiscovered(recipe.id) {
            let outputName = store.cropName(for: recipe.outputCropID)
            let outputCount = store.seedCount(for: recipe.outputCropID)
            items.append(
                BarnInventoryItemModel(
                    id: "special:hybrid:\(recipe.id)",
                    itemID: recipe.outputCropID,
                    shelf: .specials,
                    title: recipe.name,
                    subtitle: "Hybrid: \(outputName)",
                    detail: recipe.notes,
                    symbol: "sparkles",
                    emoji: recipe.icon,
                    count: outputCount,
                    unitSellPrice: nil,
                    canSell: false,
                    canUse: outputCount > 0
                )
            )
        }

        return items
    }

    private var totalStockCount: Int {
        store.totalInventoryCount
    }

    private func toggleFavorite(_ itemID: String) {
        store.setFavorite(itemID: itemID, isFavorite: !store.isFavorite(itemID: itemID))
    }

    private func sell(item: BarnInventoryItemModel, quantity: Int) {
        guard item.canSell, quantity > 0 else { return }
        _ = store.sellCrop(cropID: item.itemID, quantity: quantity)
        selectedItem = nil
    }

    private func use(item: BarnInventoryItemModel) {
        guard item.canUse else { return }
        if item.shelf == .seeds || item.shelf == .specials {
            store.selectSeed(id: item.itemID)
            appState.selectedTab = .farm
        }
        selectedItem = nil
    }

    private func sortItems(_ items: [BarnInventoryItemModel]) -> [BarnInventoryItemModel] {
        switch selectedSort {
        case .name:
            return items.sorted { lhs, rhs in lhs.title.localizedCaseInsensitiveCompare(rhs.title) == .orderedAscending }
        case .quantity:
            return items.sorted { lhs, rhs in
                if lhs.count == rhs.count {
                    return lhs.title.localizedCaseInsensitiveCompare(rhs.title) == .orderedAscending
                }
                return lhs.count > rhs.count
            }
        case .value:
            return items.sorted { lhs, rhs in
                let lhsValue = (lhs.unitSellPrice ?? 0) * lhs.count
                let rhsValue = (rhs.unitSellPrice ?? 0) * rhs.count
                if lhsValue == rhsValue {
                    return lhs.title.localizedCaseInsensitiveCompare(rhs.title) == .orderedAscending
                }
                return lhsValue > rhsValue
            }
        }
    }
}

private enum BarnItemSort: String, CaseIterable, Identifiable {
    case name
    case quantity
    case value

    var id: String { rawValue }

    var title: String {
        switch self {
        case .name: return "Name"
        case .quantity: return "Qty"
        case .value: return "Value"
        }
    }
}

private struct BarnItemDetailSheet: View {
    let item: BarnInventoryItemModel
    let isFavorite: Bool
    let onToggleFavorite: () -> Void
    let onSellOne: () -> Void
    let onSellAll: () -> Void
    let onUse: () -> Void

    @State private var appeared = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.lg) {
                    // Hero header
                    HStack(alignment: .center, spacing: DS.Space.md) {
                        Text(item.emoji)
                            .font(.system(size: 52))
                            .accessibilityHidden(true)
                            .scaleEffect(appeared ? 1.0 : 0.7)
                            .animation(DS.Animation.springBounce.delay(0.06), value: appeared)

                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                            Text(item.title)
                                .font(Typography.title)
                            Text(item.subtitle)
                                .font(Typography.label)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 12)
                    .animation(DS.Animation.springBounce, value: appeared)

                    // Description
                    Text(item.detail)
                        .font(Typography.body)
                        .foregroundStyle(.secondary)
                        .opacity(appeared ? 1 : 0)
                        .animation(DS.Animation.standard.delay(0.10), value: appeared)

                    // Stats card
                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            Label("Owned: \(item.count)", systemImage: "shippingbox.fill")
                                .font(Typography.bodyStrong)
                            if let unitSellPrice = item.unitSellPrice {
                                Label("\(unitSellPrice) coins each", systemImage: "dollarsign.circle.fill")
                                    .font(Typography.bodyStrong)
                                    .foregroundStyle(DS.Color.money)
                            }
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(DS.Animation.standard.delay(0.15), value: appeared)

                    // Action buttons
                    VStack(spacing: DS.Space.sm) {
                        if item.canSell {
                            HStack(spacing: DS.Space.sm) {
                                Button("Sell 1") {
                                    SoundManager.shared.play(.sell, haptic: .medium)
                                    onSellOne()
                                }
                                .buttonStyle(GlassButtonStyle(tint: DS.Color.accent))
                                .disabled(item.count <= 0)

                                Button("Sell All (\(item.count))") {
                                    SoundManager.shared.play(.sell, haptic: .heavy)
                                    onSellAll()
                                }
                                .buttonStyle(GlassButtonStyle(tint: DS.Color.accent, isDestructive: false))
                                .disabled(item.count <= 0)
                            }
                        }

                        if item.canUse {
                            Button {
                                SoundManager.shared.play(.plant, haptic: .medium)
                                onUse()
                            } label: {
                                Label("Use / Plant on Farm", systemImage: "leaf.fill")
                            }
                            .buttonStyle(PrimaryButtonStyle(tint: DS.Color.accent))
                        }

                        Button {
                            SoundManager.shared.play(.click, haptic: .light)
                            onToggleFavorite()
                        } label: {
                            Label(
                                isFavorite ? "Remove Favourite" : "Add to Favourites",
                                systemImage: isFavorite ? "heart.slash.fill" : "heart.fill"
                            )
                        }
                        .buttonStyle(GlassButtonStyle(
                            tint: isFavorite ? .pink : DS.Color.xp,
                            isDestructive: false
                        ))
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(DS.Animation.standard.delay(0.20), value: appeared)
                }
                .padding(DS.Space.md)
            }
            .navigationTitle("Item Details")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            appeared = true
        }
    }
}
