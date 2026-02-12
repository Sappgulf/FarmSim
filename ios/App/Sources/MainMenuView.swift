import SwiftUI
import GameCore

struct MainMenuView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    @State private var confirmNewFarm = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.lg) {
                    header
                    quickStats
                    featuredPanel
                    actionGrid
                }
                .padding(DS.Space.md)
                .padding(.bottom, DS.Space.xl)
            }
            .navigationBarHidden(true)
            .safeAreaInset(edge: .bottom) {
                VStack(spacing: DS.Space.sm) {
                    Button("Continue Farm") {
                        appState.startGame(tab: .farm)
                    }
                    .buttonStyle(PrimaryButtonStyle())

                    if store.onboardingRequired {
                        Button("Start Tutorial") {
                            appState.startGame(tab: .farm)
                            appState.showingOnboarding = true
                        }
                        .buttonStyle(PrimaryButtonStyle(tint: DS.Color.xp))
                    }
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.bottom, DS.Space.sm)
            }
            .alert("Start a New Farm?", isPresented: $confirmNewFarm) {
                Button("Start New", role: .destructive) {
                    store.resetSave()
                    appState.startGame(tab: .farm)
                    appState.showingOnboarding = true
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Your current save will be replaced.")
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

    private var header: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text("FarmSim")
                .font(.largeTitle.weight(.heavy))
            Text(store.farmName)
                .font(.title3.weight(.semibold))
                .foregroundStyle(.secondary)
            Text("Day \(store.save.world.day) • \(store.save.world.gridWidth)x\(store.save.world.gridHeight) Farm")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var quickStats: some View {
        CardContainer {
            HStack {
                StatPill(icon: "dollarsign.circle.fill", value: "\(store.save.player.coins)")
                Spacer()
                StatPill(icon: "leaf.fill", value: "\(store.plantedTileCount)/\(store.totalTileCount)")
                Spacer()
                StatPill(icon: "star.fill", value: "Lv \(store.playerLevel)")
            }
        }
    }

    private var featuredPanel: some View {
        CardContainer {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                SectionHeader("Daily Spotlight")

                if let crop = featuredCrop {
                    HStack {
                        Text(store.emoji(for: crop.id))
                            .font(.title2)
                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                            Text(crop.name)
                                .font(.headline)
                            Text("Profit/day \(String(format: "%.1f", profitPerDay(crop)))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                }

                if let festival = featuredFestival {
                    HStack {
                        Text(festival.icon)
                            .font(.title3)
                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                            Text(festival.name)
                                .font(.subheadline.weight(.semibold))
                            Text("\(festival.season.capitalized) • \(festival.cadence.capitalized)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    private var actionGrid: some View {
        CardContainer {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                SectionHeader("Quick Actions")
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: DS.Space.sm) {
                    Button {
                        appState.startGame(tab: .farm)
                    } label: {
                        menuTile("Farm", icon: "leaf.fill")
                    }
                    .buttonStyle(.plain)

                    Button {
                        appState.startGame(tab: .market)
                    } label: {
                        menuTile("Town", icon: "storefront.fill")
                    }
                    .buttonStyle(.plain)

                    Button {
                        appState.startGame(tab: .inventory)
                    } label: {
                        menuTile("Inventory", icon: "shippingbox.fill")
                    }
                    .buttonStyle(.plain)

                    Button {
                        appState.showingMenuSettings = true
                    } label: {
                        menuTile("Settings", icon: "gearshape.fill")
                    }
                    .buttonStyle(.plain)
                }

                Button(role: .destructive) {
                    confirmNewFarm = true
                } label: {
                    Label("New Farm", systemImage: "arrow.counterclockwise")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
        }
    }

    private func menuTile(_ title: String, icon: String) -> some View {
        VStack(spacing: DS.Space.xs) {
            Image(systemName: icon)
                .font(.title3.weight(.semibold))
            Text(title)
                .font(.subheadline.weight(.semibold))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, minHeight: 80)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))
    }

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
