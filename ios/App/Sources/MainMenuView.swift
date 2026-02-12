import SwiftUI
import GameCore

struct MainMenuView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    @State private var confirmNewFarm = false

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning, farmer!"
        case 12..<17: return "Good afternoon, farmer!"
        case 17..<21: return "Good evening, farmer!"
        default: return "Burning the midnight oil?"
        }
    }

    private var seasonName: String {
        let seasons = ["Spring", "Summer", "Autumn", "Winter"]
        return seasons[store.save.world.day % seasons.count]
    }

    private var weatherFlavor: String {
        let flavors: [String: [String]] = [
            "Spring": [
                "The fields are waking up!",
                "Perfect planting weather today.",
                "Morning dew sparkles on the grass.",
            ],
            "Summer": [
                "The sun is shining bright!",
                "Crops are soaking up the warmth.",
                "A beautiful day on the farm.",
            ],
            "Autumn": [
                "The leaves are turning golden.",
                "Harvest season is in full swing!",
                "There's a cozy chill in the air.",
            ],
            "Winter": [
                "A peaceful blanket of frost today.",
                "The farm rests under quiet skies.",
                "Hot cocoa weather for sure.",
            ],
        ]
        let options = flavors[seasonName] ?? ["A lovely day on the farm."]
        return options[store.save.world.day % options.count]
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.lg) {
                    header
                    farmSummary
                    featuredPanel
                    actionGrid
                }
                .padding(DS.Space.md)
                .padding(.bottom, DS.Space.xl)
            }
            .navigationBarHidden(true)
            .safeAreaInset(edge: .bottom) {
                VStack(spacing: DS.Space.sm) {
                    Button {
                        appState.startGame(tab: .farm)
                    } label: {
                        Label("Let's Go!", systemImage: "leaf.fill")
                    }
                    .buttonStyle(PrimaryButtonStyle())

                    if store.onboardingRequired {
                        Button {
                            appState.startGame(tab: .farm)
                            appState.showingOnboarding = true
                        } label: {
                            Label("Show Me Around", systemImage: "sparkles")
                        }
                        .buttonStyle(PrimaryButtonStyle(tint: DS.Color.xp))
                    }
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.bottom, DS.Space.sm)
            }
            .alert("Start a New Farm?", isPresented: $confirmNewFarm) {
                Button("Start Fresh", role: .destructive) {
                    store.resetSave()
                    appState.startGame(tab: .farm)
                    appState.showingOnboarding = true
                }
                Button("Keep My Farm", role: .cancel) { }
            } message: {
                Text("Everything on your current farm will be cleared. This can't be undone.")
            }
            .sheet(isPresented: Binding(get: {
                appState.showingMenuSettings
            }, set: { appState.showingMenuSettings = $0 })) {
                SettingsView(store: store, appState: appState, showClose: true)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
        }
        .farmBackground(palette: store.settings.palette)
    }

    // MARK: - Header

    private var header: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text(greeting)
                .font(.title.weight(.bold))
            Text(store.farmName)
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white.opacity(0.85))
            Text(weatherFlavor)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.65))
                .italic()
        }
        .padding(.top, DS.Space.xs)
    }

    // MARK: - Farm Summary

    private var farmSummary: some View {
        CardContainer {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(spacing: DS.Space.xxs) {
                    Text("Your Farm")
                        .font(.headline)
                    Text("Day \(store.save.world.day)")
                        .font(.caption.weight(.medium))
                        .padding(.horizontal, DS.Space.xs)
                        .padding(.vertical, DS.Space.xxs)
                        .background(.white.opacity(0.15), in: Capsule())
                    Spacer()
                    Text("\(seasonName)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(seasonColor)
                }

                HStack {
                    farmStat(icon: "dollarsign.circle.fill", label: "Coins", value: "\(store.save.player.coins)", color: DS.Color.money)
                    Spacer()
                    farmStat(icon: "leaf.fill", label: "Planted", value: "\(store.plantedTileCount)/\(store.totalTileCount)", color: DS.Color.accent)
                    Spacer()
                    farmStat(icon: "star.fill", label: "Level", value: "\(store.playerLevel)", color: DS.Color.xp)
                }
            }
        }
    }

    private func farmStat(icon: String, label: String, value: String, color: Color) -> some View {
        VStack(spacing: DS.Space.xxs) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.subheadline.monospacedDigit().weight(.bold))
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }

    private var seasonColor: Color {
        switch seasonName {
        case "Spring": return Color(red: 0.55, green: 0.82, blue: 0.45)
        case "Summer": return DS.Color.money
        case "Autumn": return Color(red: 0.90, green: 0.58, blue: 0.30)
        case "Winter": return DS.Color.xp
        default: return .secondary
        }
    }

    // MARK: - Featured Panel

    private var featuredPanel: some View {
        CardContainer {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                SectionHeader("What's Growing")

                if let crop = featuredCrop {
                    HStack(spacing: DS.Space.sm) {
                        Text(store.emoji(for: crop.id))
                            .font(.largeTitle)
                            .frame(width: 48, height: 48)
                            .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous))
                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                            Text("Star Crop: \(crop.name)")
                                .font(.headline)
                            Text("\(String(format: "%.0f", profitPerDay(crop))) coins/day profit")
                                .font(.caption)
                                .foregroundStyle(DS.Color.money)
                        }
                        Spacer()
                    }
                }

                if let festival = featuredFestival {
                    Divider().opacity(0.3)
                    HStack(spacing: DS.Space.sm) {
                        Text(festival.icon)
                            .font(.title2)
                            .frame(width: 48, height: 48)
                            .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous))
                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                            Text(festival.name)
                                .font(.subheadline.weight(.semibold))
                            Text("\(festival.season.capitalized) festival")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Action Grid

    private var actionGrid: some View {
        VStack(spacing: DS.Space.sm) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: DS.Space.sm) {
                Button { appState.startGame(tab: .farm) } label: {
                    menuTile("My Farm", icon: "leaf.fill", tint: DS.Color.accent)
                }
                .buttonStyle(.plain)

                Button { appState.startGame(tab: .market) } label: {
                    menuTile("Town", icon: "storefront.fill", tint: Color(red: 0.75, green: 0.52, blue: 0.35))
                }
                .buttonStyle(.plain)

                Button { appState.startGame(tab: .inventory) } label: {
                    menuTile("Barn", icon: "shippingbox.fill", tint: Color(red: 0.62, green: 0.55, blue: 0.75))
                }
                .buttonStyle(.plain)

                Button { appState.showingMenuSettings = true } label: {
                    menuTile("Settings", icon: "gearshape.fill", tint: .secondary)
                }
                .buttonStyle(.plain)
            }

            Button(role: .destructive) {
                confirmNewFarm = true
            } label: {
                Label("Start Over", systemImage: "arrow.counterclockwise")
                    .font(.footnote.weight(.medium))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(.white.opacity(0.5))
        }
    }

    private func menuTile(_ title: String, icon: String, tint: Color) -> some View {
        VStack(spacing: DS.Space.xs) {
            Image(systemName: icon)
                .font(.title2.weight(.semibold))
                .foregroundStyle(tint)
            Text(title)
                .font(.subheadline.weight(.semibold))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, minHeight: 80)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                .stroke(tint.opacity(0.25), lineWidth: 0.5)
        )
    }

    // MARK: - Data

    private var featuredCrop: CropDef? {
        store.cropDefs.max { lhs, rhs in
            profitPerDay(lhs) < profitPerDay(rhs)
        }
    }

    private var featuredFestival: FestivalDef? {
        let seasons = ["spring", "summer", "autumn", "winter"]
        let season = seasons[store.save.world.day % seasons.count]
        return store.festivalDefs.first { $0.season == season || $0.season == "all" }
    }

    private func profitPerDay(_ crop: CropDef) -> Double {
        let profit = max(0, crop.sellPrice - crop.seedCost)
        return Double(profit) / Double(max(1, crop.daysToGrow))
    }
}
