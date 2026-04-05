import SwiftUI

// MARK: - MarketLivestockSection

struct MarketLivestockSection: View {
    let store: GameStore

    var body: some View {
        VStack(spacing: DS.Space.md) {
            capacityPanel
            if store.usedLivestockCapacity > 0 {
                collectPanel
            }
            ForEach(store.livestockPlans) { plan in
                animalCard(plan)
            }
        }
    }

    // MARK: - Capacity Panel

    private var capacityPanel: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                SectionHeader("Barn Capacity")

                HStack {
                    Text("\(store.usedLivestockCapacity) / \(store.livestockCapacity) animals")
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.80))
                    Spacer()
                    if store.usedLivestockCapacity >= store.livestockCapacity {
                        Label("Full — upgrade Barn", systemImage: "exclamationmark.triangle.fill")
                            .font(Typography.small)
                            .foregroundStyle(.orange.opacity(0.90))
                    } else {
                        Text("\(store.livestockCapacity - store.usedLivestockCapacity) spaces free")
                            .font(Typography.small)
                            .foregroundStyle(DS.Color.accent.opacity(0.85))
                    }
                }

                GeometryReader { g in
                    let pct = store.livestockCapacity > 0
                        ? min(1.0, Double(store.usedLivestockCapacity) / Double(store.livestockCapacity))
                        : 0
                    ZStack(alignment: .leading) {
                        Capsule().fill(.white.opacity(0.10))
                        Capsule()
                            .fill(LinearGradient(
                                colors: [DS.Color.accent, DS.Color.money],
                                startPoint: .leading,
                                endPoint: .trailing
                            ))
                            .frame(width: g.size.width * pct)
                            .animation(DS.Animation.standard, value: pct)
                    }
                }
                .frame(height: 7)
            }
        }
    }

    // MARK: - Collect Panel

    private var collectPanel: some View {
        WoodenPanel {
            Button {
                SoundManager.shared.play(.sell, haptic: .heavy)
                _ = store.collectLivestockProducts()
            } label: {
                HStack {
                    Image(systemName: "basket.fill")
                        .font(.title3)
                        .foregroundStyle(DS.Color.money)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Collect All Products")
                            .font(Typography.bodyStrong)
                            .foregroundStyle(.white)
                        Text("Gathers goods from all animals")
                            .font(Typography.small)
                            .foregroundStyle(.white.opacity(0.60))
                    }

                    Spacer()

                    let estimated = store.estimatedLivestockIncome
                    VStack(alignment: .trailing, spacing: 1) {
                        Text("~\(estimated)")
                            .font(Typography.caption.weight(.bold))
                            .foregroundStyle(DS.Color.money)
                        Text("coins")
                            .font(Typography.small)
                            .foregroundStyle(.white.opacity(0.55))
                    }
                }
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Animal Card

    private func animalCard(_ plan: LivestockTypePlan) -> some View {
        let count = store.livestockCount(for: plan.id)
        let isLocked = store.playerLevel < plan.requiredLevel
        let isFull = store.usedLivestockCapacity + plan.spaceRequired > store.livestockCapacity
        let canAfford = store.save.player.coins >= plan.cost
        let canBuy = store.canBuyLivestock(plan.id)

        return WoodenPanel {
            HStack(alignment: .top, spacing: DS.Space.sm) {
                ZStack(alignment: .bottomTrailing) {
                    Text(plan.icon)
                        .font(.system(size: 42))
                        .opacity(isLocked ? 0.40 : 1.0)

                    if count > 0 {
                        Text("×\(count)")
                            .font(Typography.small.weight(.bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(DS.Color.accent, in: Capsule())
                    }
                }

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: DS.Space.xs) {
                        Text(plan.name)
                            .font(Typography.bodyStrong)
                            .foregroundStyle(.white)

                        if isLocked {
                            Label("Lv \(plan.requiredLevel)", systemImage: "lock.fill")
                                .font(Typography.small)
                                .foregroundStyle(DS.Color.accent.opacity(0.85))
                        }
                    }

                    Text(plan.description)
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.72))

                    HStack(spacing: DS.Space.sm) {
                        Label(plan.productID.capitalized, systemImage: "bag.fill")
                            .font(Typography.small)
                            .foregroundStyle(DS.Color.money.opacity(0.85))

                        Text("·")
                            .foregroundStyle(.white.opacity(0.35))

                        Text("\(plan.productValue) coins/head")
                            .font(Typography.small)
                            .foregroundStyle(.white.opacity(0.60))
                    }

                    HStack(spacing: DS.Space.xs) {
                        Image(systemName: "square.grid.2x2.fill")
                            .font(.caption2)
                        Text("\(plan.spaceRequired) space")
                    }
                    .font(Typography.small)
                    .foregroundStyle(.white.opacity(0.45))
                }

                Spacer()

                if !isLocked {
                    Button {
                        SoundManager.shared.play(.purchase, haptic: .medium)
                        _ = store.buyLivestock(plan.id)
                    } label: {
                        VStack(spacing: 2) {
                            Text("Buy")
                                .font(Typography.caption.weight(.bold))
                            Text("\(plan.cost) \u{1FA99}")
                                .font(Typography.small.weight(.bold))
                        }
                    }
                    .buttonStyle(WoodActionStyle(
                        tint: canBuy ? DS.Color.money : (isFull ? .orange : .gray)
                    ))
                    .frame(width: 84)
                    .disabled(!canBuy)
                    .accessibilityLabel("Buy \(plan.name) for \(plan.cost) coins")
                    .accessibilityHint(
                        isFull ? "Barn is full" :
                        !canAfford ? "Not enough coins" :
                        isLocked ? "Requires level \(plan.requiredLevel)" : ""
                    )
                }
            }
        }
    }
}
