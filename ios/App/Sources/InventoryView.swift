import SwiftUI

struct InventoryView: View {
    var store: GameStore

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
    ]

    private var ownedSeeds: [(id: String, count: Int, emoji: String, name: String)] {
        store.cropDefs.compactMap { def in
            let count = store.seedCount(for: def.id)
            guard count > 0 else { return nil }
            return (id: def.id, count: count, emoji: store.emoji(for: def.id), name: def.name)
        }
    }

    private var ownedCrops: [(id: String, count: Int, emoji: String, name: String)] {
        store.cropDefs.compactMap { def in
            let count = store.cropCount(for: def.id)
            guard count > 0 else { return nil }
            return (id: def.id, count: count, emoji: store.emoji(for: def.id), name: def.name)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                HStack {
                    Text("Inventory")
                        .font(.system(size: 24, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                    Spacer()
                    farmStatsBadge
                }
                .padding(.horizontal, 4)

                // Seeds section
                sectionHeader(title: "Seeds", icon: "leaf.circle.fill", count: ownedSeeds.reduce(0) { $0 + $1.count })

                if ownedSeeds.isEmpty {
                    emptyState("No seeds — visit the Shop!")
                } else {
                    LazyVGrid(columns: columns, spacing: 10) {
                        ForEach(ownedSeeds, id: \.id) { item in
                            inventoryTile(emoji: item.emoji, name: item.name, count: item.count, style: .seed)
                        }
                    }
                }

                // Harvested section
                sectionHeader(title: "Harvested", icon: "basket.fill", count: ownedCrops.reduce(0) { $0 + $1.count })

                if ownedCrops.isEmpty {
                    emptyState("Grow and harvest crops to collect them here.")
                } else {
                    LazyVGrid(columns: columns, spacing: 10) {
                        ForEach(ownedCrops, id: \.id) { item in
                            inventoryTile(emoji: item.emoji, name: item.name, count: item.count, style: .crop)
                        }
                    }
                }
            }
            .padding(16)
            .padding(.bottom, 80)
        }
        .scrollIndicators(.hidden)
        .background(Theme.backgroundGradient.ignoresSafeArea())
    }

    // MARK: - Components

    private func sectionHeader(title: String, icon: String, count: Int) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(.white.opacity(0.7))
            Text(title)
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(.white.opacity(0.85))
            Spacer()
            Text("\(count) total")
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.5))
        }
    }

    private enum TileStyle { case seed, crop }

    private func inventoryTile(emoji: String, name: String, count: Int, style: TileStyle) -> some View {
        VStack(spacing: 6) {
            Text(emoji)
                .font(.system(size: 28))

            Text(name)
                .font(.system(size: 11, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .lineLimit(1)

            Text("\(count)")
                .font(.system(size: 16, weight: .heavy, design: .monospaced))
                .foregroundStyle(style == .seed ? Theme.coinGold : Theme.ready)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Theme.cardStroke, lineWidth: 0.5)
        )
    }

    private func emptyState(_ message: String) -> some View {
        Text(message)
            .font(.system(size: 13, weight: .medium, design: .rounded))
            .foregroundStyle(.white.opacity(0.5))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 4)
    }

    private var farmStatsBadge: some View {
        HStack(spacing: 12) {
            miniStat(icon: "square.grid.2x2.fill", value: "\(store.plantedTileCount)/\(store.totalTileCount)")
            miniStat(icon: "star.fill", value: "Lv\(store.playerLevel)")
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(Color.black.opacity(0.25), in: Capsule())
    }

    private func miniStat(icon: String, value: String) -> some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(.white.opacity(0.6))
            Text(value)
                .font(.system(size: 12, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)
        }
    }
}
