import SwiftUI
import GameCore

// MARK: - MarketTasksSection

struct MarketTasksSection: View {
    let store: GameStore

    var body: some View {
        VStack(spacing: DS.Space.md) {
            WoodenPanel {
                VStack(spacing: DS.Space.xs) {
                    Image(systemName: "checklist.checked")
                        .font(.title3)
                        .foregroundStyle(DS.Color.xp)
                    Text("Daily Tasks")
                        .font(Typography.section)
                        .foregroundStyle(.white)
                    Text("Three new tasks each morning. Complete them for bonus coins and XP.")
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.72))
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
            }

            ForEach(store.dailyTasks) { task in
                taskCard(task)
            }
        }
    }

    // MARK: - Task Card

    private func taskCard(_ task: DailyTaskModel) -> some View {
        let progress = store.dailyTaskProgress(task)
        let isClaimed = store.isDailyTaskClaimedToday(task)
        let isReady = store.canClaimDailyTask(task)
        let pct = min(1.0, Double(progress) / Double(max(1, task.target)))

        return WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(isClaimed ? DS.Color.accent.opacity(0.25) : .white.opacity(0.10))
                            .frame(width: 42, height: 42)
                        if isClaimed {
                            Image(systemName: "checkmark")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(DS.Color.accent)
                        } else {
                            taskIcon(for: task.metric)
                                .font(.system(size: 18))
                                .foregroundStyle(isReady ? DS.Color.xp : .white.opacity(0.70))
                        }
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(task.title)
                            .font(Typography.bodyStrong)
                            .foregroundStyle(isClaimed ? .white.opacity(0.45) : .white)
                        Text(task.detail)
                            .font(Typography.caption)
                            .foregroundStyle(.white.opacity(0.65))
                            .lineLimit(2)
                    }

                    Spacer()

                    if isClaimed {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(Theme.success)
                    } else {
                        VStack(alignment: .trailing, spacing: 2) {
                            Label("\(task.rewardCoins)", systemImage: "circle.fill")
                                .font(Typography.caption.weight(.bold))
                                .foregroundStyle(DS.Color.money)
                            Label("\(task.rewardXP) XP", systemImage: "sparkles")
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
                            Text("\(progress) / \(task.target)")
                                .font(Typography.small.weight(.bold))
                        }
                        .foregroundStyle(.white.opacity(0.55))

                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                Capsule().fill(.white.opacity(0.10))
                                Capsule()
                                    .fill(
                                        LinearGradient(
                                            colors: isReady
                                                ? [DS.Color.xp, DS.Color.xp.opacity(0.7)]
                                                : [DS.Color.accent, DS.Color.accent.opacity(0.7)],
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
                        _ = store.claimDailyTask(task)
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

    // MARK: - Metric Icon

    private func taskIcon(for metric: DailyTaskModel.Metric) -> Image {
        switch metric {
        case .coins:         return Image(systemName: "dollarsign.circle.fill")
        case .cropInventory: return Image(systemName: "basket.fill")
        case .readyTiles:    return Image(systemName: "scissors")
        case .plantedTiles:  return Image(systemName: "leaf.fill")
        }
    }
}
