import SwiftUI
import GameCore

struct ShopView: View {
    var store: GameStore
    @State private var buyTrigger = 0

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    private var sortedCrops: [SortedCrop] {
        store.cropDefs.compactMap { def in
            guard let display = store.cropDisplay[def.id] else { return nil }
            return SortedCrop(def: def, display: display)
        }
        .sorted { $0.display.level == $1.display.level ? $0.def.name < $1.def.name : $0.display.level < $1.display.level }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Wallet bar
                HStack {
                    Text("Seed Shop")
                        .font(.system(size: 24, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                    Spacer()
                    HStack(spacing: 5) {
                        Image(systemName: "dollarsign.circle.fill")
                            .foregroundStyle(Theme.coinGold)
                        Text("\(store.save.player.coins)")
                            .font(.system(size: 18, weight: .heavy, design: .rounded))
                            .foregroundStyle(.white)
                            .contentTransition(.numericText())
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Color.black.opacity(0.3), in: Capsule())
                }
                .padding(.horizontal, 4)

                // Crop grid
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(sortedCrops, id: \.def.id) { item in
                        shopCard(def: item.def, display: item.display)
                    }
                }
            }
            .padding(16)
            .padding(.bottom, 80)
        }
        .scrollIndicators(.hidden)
        .background(Theme.backgroundGradient.ignoresSafeArea())
        .sensoryFeedback(.impact(weight: .medium), trigger: buyTrigger)
    }

    private func shopCard(def: CropDef, display: CropDisplayInfo) -> some View {
        let unlocked = store.isUnlocked(cropID: def.id)
        let affordable = store.canAfford(cropID: def.id)
        let seeds = store.seedCount(for: def.id)

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(display.emoji)
                    .font(.system(size: 32))
                Spacer()
                if !unlocked {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(Theme.locked)
                } else {
                    Text("x\(seeds)")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .foregroundStyle(.white.opacity(0.6))
                }
            }

            Text(def.name)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            if !display.description.isEmpty {
                Text(display.description)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.white.opacity(0.6))
                    .lineLimit(2)
            }

            HStack(spacing: 4) {
                seasonBadge(display.season)
                Spacer()
                if unlocked {
                    HStack(spacing: 3) {
                        Image(systemName: "dollarsign.circle.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.coinGold)
                        Text("\(def.seedCost)")
                            .font(.system(size: 12, weight: .heavy, design: .rounded))
                            .foregroundStyle(.white)
                    }
                } else {
                    Text("Lv\(display.level)")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.locked)
                }
            }

            if unlocked {
                Button {
                    if store.buySeed(cropID: def.id) {
                        buyTrigger += 1
                    }
                } label: {
                    Text(affordable ? "Buy Seed" : "Can't afford")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                }
                .buttonStyle(.borderedProminent)
                .tint(affordable ? Color(red: 0.22, green: 0.58, blue: 0.32) : Color.gray)
                .disabled(!affordable)
                .accessibilityLabel("Buy \(def.name)")
                .accessibilityHint(affordable ? "Purchase one seed packet" : "You do not have enough coins")
            } else {
                Text("Reach Lv\(display.level) to unlock")
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundStyle(Theme.locked)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
            }
        }
        .padding(DS.Space.sm)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .strokeBorder(Theme.cardStroke, lineWidth: 0.5)
        )
        .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 3)
        .opacity(unlocked ? 1.0 : 0.55)
    }

    private func seasonBadge(_ season: String) -> some View {
        SeasonBadge(season: season)
    }
}

private struct SortedCrop {
    let def: CropDef
    let display: CropDisplayInfo
}
