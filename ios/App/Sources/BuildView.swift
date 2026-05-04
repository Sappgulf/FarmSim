import SwiftUI

struct BuildView: View {
    @Bindable var store: GameStore

    private let columns = [
        GridItem(.adaptive(minimum: 150), spacing: DS.Space.sm)
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                FarmPanelBackground()

                ScrollView {
                    LazyVStack(alignment: .leading, spacing: DS.Space.md) {
                        FarmPanelHeader(
                            title: "Build",
                            subtitle: "\(store.marketAnalyticsSnapshot().builtStructures) structures built",
                            icon: "hammer.fill",
                            trailing: {
                                FarmResourceBadge(icon: "circle.fill", value: "\(store.save.player.coins)", tint: DS.Color.money)
                            }
                        )

                        FarmSegmentBar(items: ["Buildings", "Production", "Utility", "Storage"], selectedIndex: 0)

                        LazyVGrid(columns: columns, spacing: DS.Space.sm) {
                            ForEach(store.buildingPlans) { plan in
                                BuildingCard(store: store, plan: plan)
                            }
                        }

                        if !store.activeBuildingSynergies.isEmpty {
                            FarmGlassPanel {
                                VStack(alignment: .leading, spacing: DS.Space.sm) {
                                    SectionHeader("Active Synergies")
                                    ForEach(store.activeBuildingSynergies) { synergy in
                                        HStack(spacing: DS.Space.sm) {
                                            Text(synergy.icon)
                                                .font(.title3)
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(synergy.name)
                                                    .font(Typography.bodyStrong)
                                                Text(synergy.bonus)
                                                    .font(Typography.caption)
                                                    .foregroundStyle(.white.opacity(0.72))
                                            }
                                            Spacer()
                                        }
                                        .foregroundStyle(.white)
                                    }
                                }
                            }
                        }
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("Build")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.black.opacity(0.85), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}

private struct BuildingCard: View {
    @Bindable var store: GameStore
    let plan: BuildingPlan

    private var level: Int { store.buildingLevel(for: plan.id) }
    private var nextCost: Int? { store.nextBuildingCost(for: plan.id) }
    private var unlocked: Bool { store.playerLevel >= plan.requiredLevel }
    private var canUpgrade: Bool {
        guard let cost = nextCost else { return false }
        return unlocked && store.save.player.coins >= cost
    }

    var body: some View {
        FarmGlassPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top) {
                    Text(plan.icon)
                        .font(.system(size: 38))
                        .frame(width: 52, height: 52)
                        .background(
                            RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                                .fill(Color(red: 0.98, green: 0.86, blue: 0.62))
                        )
                        .opacity(unlocked ? 1 : 0.45)

                    Spacer()

                    Text(level == 0 ? "New" : "Lv \(level)")
                        .font(Typography.caption.weight(.bold))
                        .foregroundStyle(level == 0 ? .white.opacity(0.72) : DS.Color.money)
                        .padding(.horizontal, DS.Space.xs)
                        .padding(.vertical, 5)
                        .background(.black.opacity(0.22), in: Capsule())
                }

                Text(plan.name)
                    .font(Typography.bodyStrong)
                    .foregroundStyle(.white)

                Text(plan.description)
                    .font(Typography.caption)
                    .foregroundStyle(.white.opacity(0.72))
                    .lineLimit(2)
                    .frame(minHeight: 34, alignment: .topLeading)

                ProgressView(value: Double(level), total: Double(max(1, plan.maxLevel)))
                    .tint(DS.Color.accent)

                Text(nextBonusText)
                    .font(Typography.caption)
                    .foregroundStyle(.white.opacity(0.72))
                    .lineLimit(2)
                    .frame(minHeight: 30, alignment: .topLeading)

                Button(buttonTitle) {
                    _ = store.upgradeBuilding(plan.id)
                }
                .buttonStyle(FarmCapsuleButtonStyle(tint: canUpgrade ? DS.Color.accent : .gray))
                .disabled(!canUpgrade)
                .accessibilityHint(accessibilityHint)
            }
        }
    }

    private var buttonTitle: String {
        if !unlocked { return "Lv \(plan.requiredLevel)" }
        guard let cost = nextCost else { return "Max" }
        return level == 0 ? "Build \(cost)" : "Upgrade \(cost)"
    }

    private var nextBonusText: String {
        guard level < plan.maxLevel else { return "Fully upgraded." }
        return plan.bonusForLevel(level + 1)
    }

    private var accessibilityHint: String {
        if !unlocked { return "Reach level \(plan.requiredLevel) to unlock \(plan.name)." }
        if nextCost == nil { return "\(plan.name) is fully upgraded." }
        return "Spend coins to improve \(plan.name)."
    }
}

