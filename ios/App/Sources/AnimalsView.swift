import SwiftUI

struct AnimalsView: View {
    @Bindable var store: GameStore

    private var capacityProgress: Double {
        guard store.livestockCapacity > 0 else { return 0 }
        return min(1, Double(store.usedLivestockCapacity) / Double(store.livestockCapacity))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                FarmPanelBackground()

                ScrollView {
                    LazyVStack(spacing: DS.Space.md) {
                        FarmPanelHeader(
                            title: "Animals",
                            subtitle: "\(store.usedLivestockCapacity) / \(store.livestockCapacity) barn space",
                            icon: "pawprint.fill",
                            trailing: {
                                Button {
                                    _ = store.collectLivestockProducts()
                                } label: {
                                    Label("Collect", systemImage: "basket.fill")
                                }
                                .buttonStyle(FarmCapsuleButtonStyle(tint: DS.Color.accent))
                            }
                        )

                        FarmGlassPanel {
                            VStack(alignment: .leading, spacing: DS.Space.sm) {
                                HStack {
                                    Text("Capacity")
                                        .font(Typography.caption.weight(.semibold))
                                    Spacer()
                                    Text("\(store.usedLivestockCapacity) / \(store.livestockCapacity)")
                                        .font(Typography.caption.monospacedDigit().weight(.bold))
                                }
                                .foregroundStyle(.white.opacity(0.9))

                                ProgressView(value: capacityProgress, total: 1)
                                    .tint(DS.Color.accent)
                            }
                        }

                        FarmSegmentBar(items: ["All", "Owned", "Ready", "Locked"], selectedIndex: 0)

                        ForEach(store.livestockPlans) { plan in
                            AnimalRow(store: store, plan: plan)
                        }
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("Animals")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.black.opacity(0.85), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}

private struct AnimalRow: View {
    @Bindable var store: GameStore
    let plan: LivestockTypePlan

    private var count: Int { store.livestockCount(for: plan.id) }
    private var unlocked: Bool { store.playerLevel >= plan.requiredLevel }
    private var affordable: Bool { store.save.player.coins >= plan.cost }
    private var hasSpace: Bool { store.usedLivestockCapacity + plan.spaceRequired <= store.livestockCapacity }
    private var canBuy: Bool { store.canBuyLivestock(plan.id) }

    var body: some View {
        FarmGlassPanel {
            HStack(spacing: DS.Space.md) {
                Text(plan.icon)
                    .font(.system(size: 38))
                    .frame(width: 54, height: 54)
                    .background(
                        RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                            .fill(Color(red: 0.98, green: 0.86, blue: 0.62))
                    )
                    .opacity(unlocked ? 1 : 0.45)

                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                    HStack {
                        Text(plan.name)
                            .font(Typography.bodyStrong)
                            .foregroundStyle(.white)
                        if count > 0 {
                            Text("x\(count)")
                                .font(Typography.caption.weight(.bold))
                                .foregroundStyle(DS.Color.money)
                        }
                    }

                    Text(plan.description)
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.72))
                        .lineLimit(2)

                    HStack(spacing: DS.Space.xs) {
                        MiniInfoPill(icon: "heart.fill", text: "Happy")
                        MiniInfoPill(icon: "shippingbox.fill", text: "\(plan.productAmount)x \(plan.productID)")
                        MiniInfoPill(icon: "circle.fill", text: "\(plan.productValue)")
                    }
                }

                Spacer(minLength: 0)

                VStack(alignment: .trailing, spacing: DS.Space.xs) {
                    Text("\(plan.cost)")
                        .font(Typography.metric)
                        .foregroundStyle(DS.Color.money)

                    Button(unlocked ? "Buy" : "Lv \(plan.requiredLevel)") {
                        _ = store.buyLivestock(plan.id)
                    }
                    .buttonStyle(FarmCapsuleButtonStyle(tint: canBuy ? DS.Color.accent : .gray))
                    .disabled(!canBuy)
                    .accessibilityHint(accessibilityHint)
                }
            }
        }
    }

    private var accessibilityHint: String {
        if !unlocked { return "Reach level \(plan.requiredLevel) to unlock \(plan.name)." }
        if !affordable { return "Earn more coins to buy \(plan.name)." }
        if !hasSpace { return "Upgrade the barn to make more animal space." }
        return "Adds one \(plan.name) to your farm."
    }
}

