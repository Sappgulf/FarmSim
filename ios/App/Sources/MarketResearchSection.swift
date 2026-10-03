import SwiftUI

// MARK: - MarketResearchSection

struct MarketResearchSection: View {
    let store: GameStore

    var body: some View {
        VStack(spacing: DS.Space.md) {
            headerPanel
            ForEach(store.researchPlans) { plan in
                researchCard(plan)
            }
        }
    }

    // MARK: - Header

    private var headerPanel: some View {
        MarketPanel {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text("RESEARCH LAB")
                    .font(Typography.small.weight(.bold))
                    .foregroundStyle(MarketPalette.muted)

                let completedCount = store.researchPlans.filter {
                    store.isResearchCompleted($0.id)
                }.count
                let total = store.researchPlans.count

                HStack {
                    Text("Research purchases unlock permanent improvements immediately.")
                        .font(Typography.caption)
                        .foregroundStyle(MarketPalette.ink)
                    Spacer()
                    Text("\(completedCount)/\(total)")
                        .font(Typography.caption.weight(.bold))
                        .foregroundStyle(MarketPalette.info)
                }
            }
        }
    }

    // MARK: - Research Card

    private func researchCard(_ plan: ResearchPlan) -> some View {
        let isDone = store.isResearchCompleted(plan.id)
        let prereqsMet = plan.prerequisites.allSatisfy { store.isResearchCompleted($0) }
        let canAfford = store.save.player.coins >= plan.cost
        let canDo = store.canCompleteResearch(plan)

        return MarketPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top, spacing: DS.Space.sm) {
                    // Icon with state indicator
                    ZStack {
                        Circle()
                            .fill(isDone ? DS.Color.accent.opacity(0.25) : MarketPalette.ink.opacity(0.10))
                            .frame(width: 44, height: 44)

                        if isDone {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.title3)
                                .foregroundStyle(MarketPalette.leaf)
                        } else if !prereqsMet {
                            Image(systemName: "lock.fill")
                                .font(.title3)
                                .foregroundStyle(MarketPalette.muted)
                        } else {
                            researchIcon(plan.id)
                        }
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(plan.name)
                            .font(Typography.bodyStrong)
                            .foregroundStyle(MarketPalette.ink)

                        Text(store.researchBenefitSummary(plan.id))
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.muted)

                    }

                    Spacer()

                    // Action / status indicator
                    if isDone {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(MarketPalette.leaf)
                    } else if prereqsMet {
                        Button {
                            SoundManager.shared.play(.purchase, haptic: .medium)
                            _ = store.completeResearch(plan.id)
                        } label: {
                            VStack(spacing: 1) {
                                Text("Research")
                                    .font(Typography.caption.weight(.bold))
                                Text("\(plan.cost) \u{1FA99}")
                                    .font(Typography.small.weight(.bold))
                            }
                        }
                        .buttonStyle(MarketActionStyle())
                        .frame(width: 90)
                        .disabled(!canDo)
                    }
                }

                if !isDone {
                    ViewThatFits(in: .horizontal) {
                        HStack(spacing: DS.Space.sm) {
                            priceAndTiming(plan, canAfford: canAfford)
                            categoryBadge(plan)
                        }
                        .fixedSize(horizontal: true, vertical: false)
                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            priceAndTiming(plan, canAfford: canAfford)
                            categoryBadge(plan)
                        }
                    }
                    .padding(.leading, 52)
                }

                // Prerequisites notice
                if !isDone && !plan.prerequisites.isEmpty && !prereqsMet {
                    let prereqNames = plan.prerequisites.compactMap { id in
                        store.researchPlans.first(where: { $0.id == id })?.name
                    }
                    Label("Requires: " + prereqNames.joined(separator: ", "), systemImage: "arrow.up.right.circle.fill")
                        .font(Typography.small)
                        .foregroundStyle(MarketPalette.warning)
                        .padding(.leading, 52)
                }

            }
        }
    }

    @ViewBuilder
    private func researchIcon(_ id: String) -> some View {
        if id == "beekeeping" {
            GameAssetIcon(id: "bee_hive", fallback: "🐝", size: 36)
        } else if id == "aquaponics" {
            GameAssetIcon(id: "pond", fallback: "🐟", size: 36)
        } else {
            let symbols = [
                "hybrid_crops": "leaf.fill", "irrigation_system": "drop.fill",
                "pest_genetics": "shield.fill", "market_analytics": "chart.line.uptrend.xyaxis",
                "climate_control": "sun.max.fill", "soil_enhancement": "leaf.circle.fill",
                "automation_core": "gearshape.2.fill", "composting": "arrow.triangle.2.circlepath"
            ]
            Image(systemName: symbols[id] ?? "flask.fill")
                .font(.title3)
                .foregroundStyle(MarketPalette.leaf)
                .accessibilityHidden(true)
        }
    }

    private func priceAndTiming(_ plan: ResearchPlan, canAfford: Bool) -> some View {
        HStack(spacing: DS.Space.sm) {
            Label("\(plan.cost)", systemImage: "circle.fill")
                .font(Typography.small.weight(.bold))
                .foregroundStyle(canAfford ? MarketPalette.leaf : MarketPalette.danger)
            Label("Instant", systemImage: "bolt.fill")
                .font(Typography.small)
                .foregroundStyle(MarketPalette.muted)
        }
        .fixedSize(horizontal: true, vertical: true)
    }

    private func categoryBadge(_ plan: ResearchPlan) -> some View {
        Text(plan.category.capitalized)
            .font(Typography.small.weight(.semibold))
            .foregroundStyle(MarketPalette.info)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(DS.Color.xp.opacity(0.15), in: Capsule())
    }
}
