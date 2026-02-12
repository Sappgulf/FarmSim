import SwiftUI
import GameCore

struct TownMarketView: View {
    @Bindable var store: GameStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.md) {
                    SectionHeader("Town Market", subtitle: "Buy seeds, sell harvests, and apply upgrades")

                    CardContainer {
                        HStack {
                            Text("Coins")
                                .font(.headline)
                            Spacer()
                            Text("\(store.save.player.coins)")
                                .font(.title3.monospacedDigit().weight(.bold))
                                .foregroundStyle(DS.Color.money)
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Seed Shop")

                            ForEach(store.cropDefs, id: \.id) { crop in
                                HStack {
                                    Text(store.emoji(for: crop.id))
                                        .font(.title3)
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        Text(crop.name)
                                            .font(.body.weight(.semibold))
                                        Text("\(crop.seedCost) coins")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Button("Buy") {
                                        _ = store.buySeed(cropID: crop.id)
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .disabled(!store.canAfford(cropID: crop.id) || !store.isUnlocked(cropID: crop.id))
                                    .accessibilityLabel("Buy \(crop.name) seed")
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Sell Harvest")

                            let sellable = store.cropDefs.filter { store.cropCount(for: $0.id) > 0 }

                            if sellable.isEmpty {
                                Text("No harvest to sell yet.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                ForEach(sellable, id: \.id) { crop in
                                    HStack {
                                        Text(store.emoji(for: crop.id))
                                            .font(.title3)
                                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                            Text(crop.name)
                                                .font(.body.weight(.semibold))
                                            Text("x\(store.cropCount(for: crop.id))")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Button("Sell 1") {
                                            _ = store.sellCrop(cropID: crop.id)
                                        }
                                        .buttonStyle(.bordered)

                                        Button("Sell All") {
                                            let quantity = store.cropCount(for: crop.id)
                                            guard quantity > 0 else { return }
                                            _ = store.sellCrop(cropID: crop.id, quantity: quantity)
                                        }
                                        .buttonStyle(.borderedProminent)
                                    }
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Upgrades")

                            Text("Level \(store.playerLevel)")
                                .font(.headline)

                            Text("Yield multiplier: x\(String(format: "%.2f", store.yieldMultiplier))")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            Text("Grid: \(store.save.world.gridWidth)x\(store.save.world.gridHeight)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            Text("Next grid unlock target: \(store.nextGridUnlock)x\(store.nextGridUnlock)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            Button("Apply Milestone Upgrade") {
                                store.applyPendingGridUpgrade()
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Season Board", subtitle: "Live from shared content")

                            Text(currentSeason.capitalized)
                                .font(.headline)

                            if seasonalFestivals.isEmpty {
                                Text("No festivals for this season.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                ForEach(seasonalFestivals, id: \.id) { festival in
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        HStack {
                                            Text(festival.icon)
                                            Text(festival.name)
                                                .font(.subheadline.weight(.semibold))
                                        }
                                        Text("\(festival.cadence.capitalized) • \(festival.durationSeconds)s")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        if !festival.details.isEmpty {
                                            Text(festival.details)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                                .lineLimit(2)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeader("Featured Mini-Games")

                            if store.minigameDefs.isEmpty {
                                Text("No mini-game content loaded.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                ForEach(store.minigameDefs.prefix(3), id: \.id) { minigame in
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        HStack {
                                            Text(minigame.icon)
                                            Text(minigame.title)
                                                .font(.subheadline.weight(.semibold))
                                            Spacer()
                                            Text("\(minigame.rounds) rounds")
                                                .font(.caption.monospacedDigit())
                                                .foregroundStyle(.secondary)
                                        }
                                        if !minigame.instructions.isEmpty {
                                            Text(minigame.instructions)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                                .lineLimit(2)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(DS.Space.md)
                .padding(.bottom, DS.Space.lg)
            }
            .navigationTitle("Town")
            .farmBackground(palette: store.settings.palette)
        }
    }

    private var currentSeason: String {
        let seasons = ["spring", "summer", "autumn", "winter"]
        return seasons[store.save.world.day % seasons.count]
    }

    private var seasonalFestivals: [FestivalDef] {
        store.festivalDefs
            .filter { $0.season == "all" || $0.season == currentSeason }
            .prefix(3)
            .map { $0 }
    }
}
