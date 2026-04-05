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
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text("RESEARCH LAB")
                    .font(Typography.small.weight(.bold))
                    .foregroundStyle(.white.opacity(0.55))

                let completedCount = store.researchPlans.filter {
                    store.isResearchCompleted($0.id)
                }.count
                let total = store.researchPlans.count

                HStack {
                    Text("Research unlocks permanent farming improvements.")
                        .font(Typography.caption)
                        .foregroundStyle(.white)
                    Spacer()
                    Text("\(completedCount)/\(total)")
                        .font(Typography.caption.weight(.bold))
                        .foregroundStyle(DS.Color.xp)
                }
            }
        }
    }

    // MARK: - Research Card

    private func researchCard(_ plan: ResearchPlan) -> some View {
        let isDone = store.isResearchCompleted(plan.id)
        let prereqsMet = plan.prerequisites.allSatisfy { store.isResearchCompleted($0) }
        let canAfford = store.save.player.coins >= plan.cost
        let canDo = !isDone && prereqsMet && canAfford

        return WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top, spacing: DS.Space.sm) {
                    // Icon with state indicator
                    ZStack {
                        Circle()
                            .fill(isDone ? DS.Color.accent.opacity(0.25) : .white.opacity(0.10))
                            .frame(width: 44, height: 44)

                        if isDone {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.title3)
                                .foregroundStyle(DS.Color.accent)
                        } else if !prereqsMet {
                            Image(systemName: "lock.fill")
                                .font(.title3)
                                .foregroundStyle(.white.opacity(0.40))
                        } else {
                            Text(plan.icon).font(.title3)
                        }
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(plan.name)
                            .font(Typography.bodyStrong)
                            .foregroundStyle(isDone ? .white.opacity(0.50) : .white)

                        Text(plan.description)
                            .font(Typography.caption)
                            .foregroundStyle(.white.opacity(0.72))

                        if !isDone {
                            // Cost + duration row
                            HStack(spacing: DS.Space.sm) {
                                Label("\(plan.cost)", systemImage: "circle.fill")
                                    .font(Typography.small.weight(.bold))
                                    .foregroundStyle(canAfford ? DS.Color.money : .red.opacity(0.80))

                                let mins = plan.durationSeconds / 60
                                if mins > 0 {
                                    Label("\(mins) min", systemImage: "clock")
                                        .font(Typography.small)
                                        .foregroundStyle(.white.opacity(0.55))
                                }

                                // Category badge
                                Text(plan.category.capitalized)
                                    .font(Typography.small.weight(.semibold))
                                    .foregroundStyle(DS.Color.xp.opacity(0.85))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(DS.Color.xp.opacity(0.15), in: Capsule())
                            }
                        }
                    }

                    Spacer()

                    // Action / status indicator
                    if isDone {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(DS.Color.accent)
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
                        .buttonStyle(WoodActionStyle(tint: canDo ? DS.Color.xp : .gray))
                        .frame(width: 90)
                        .disabled(!canDo)
                    }
                }

                // Prerequisites notice
                if !isDone && !plan.prerequisites.isEmpty && !prereqsMet {
                    let prereqNames = plan.prerequisites.compactMap { id in
                        store.researchPlans.first(where: { $0.id == id })?.name
                    }
                    Label("Requires: " + prereqNames.joined(separator: ", "), systemImage: "arrow.up.right.circle.fill")
                        .font(Typography.small)
                        .foregroundStyle(.orange.opacity(0.85))
                        .padding(.leading, 52)
                }

                // Unlocks list
                if !isDone && !plan.unlocks.isEmpty {
                    let unlockLabels = plan.unlocks.map {
                        $0.replacingOccurrences(of: "_", with: " ").capitalized
                    }
                    HStack(spacing: DS.Space.xs) {
                        Image(systemName: "sparkles")
                            .font(.caption)
                            .foregroundStyle(DS.Color.xp.opacity(0.75))
                        Text("Unlocks: " + unlockLabels.joined(separator: ", "))
                            .font(Typography.small)
                            .foregroundStyle(DS.Color.xp.opacity(0.85))
                    }
                    .padding(.leading, 52)
                }
            }
        }
        .opacity(isDone ? 0.70 : 1.0)
    }
}
