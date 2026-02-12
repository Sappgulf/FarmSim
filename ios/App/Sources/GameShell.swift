import SwiftUI

enum GameTab: String, CaseIterable, Hashable {
    case farm
    case inventory
    case market
    case almanac
    case settings

    var title: String {
        switch self {
        case .farm: return "My Farm"
        case .inventory: return "Barn"
        case .market: return "Town"
        case .almanac: return "Almanac"
        case .settings: return "Settings"
        }
    }

    var icon: String {
        switch self {
        case .farm: return "leaf.fill"
        case .inventory: return "shippingbox.fill"
        case .market: return "storefront.fill"
        case .almanac: return "book.closed.fill"
        case .settings: return "gearshape.fill"
        }
    }
}

struct GameShell: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    var body: some View {
        Group {
            if let message = store.contentErrorMessage {
                ContentMissingView(message: message, palette: store.settings.palette)
            } else {
                tabShell
            }
        }
        .onAppear {
            if store.onboardingRequired {
                appState.showingOnboarding = true
            }
        }
        .sheet(isPresented: Binding(get: {
            appState.showingOnboarding
        }, set: { appState.showingOnboarding = $0 })) {
            OnboardingView {
                store.completeOnboarding()
                appState.showingOnboarding = false
            }
        }
    }

    private var tabShell: some View {
        TabView(selection: Binding(get: {
            appState.selectedTab
        }, set: { appState.selectedTab = $0 })) {
            FarmView(store: store, appState: appState)
                .tabItem {
                    Label(GameTab.farm.title, systemImage: GameTab.farm.icon)
                }
                .tag(GameTab.farm)

            InventoryView(store: store)
                .tabItem {
                    Label(GameTab.inventory.title, systemImage: GameTab.inventory.icon)
                }
                .tag(GameTab.inventory)

            TownMarketView(store: store)
                .tabItem {
                    Label(GameTab.market.title, systemImage: GameTab.market.icon)
                }
                .tag(GameTab.market)

            AlmanacView(store: store)
                .tabItem {
                    Label(GameTab.almanac.title, systemImage: GameTab.almanac.icon)
                }
                .tag(GameTab.almanac)

            SettingsView(store: store, appState: appState)
                .tabItem {
                    Label(GameTab.settings.title, systemImage: GameTab.settings.icon)
                }
                .tag(GameTab.settings)
        }
    }
}

struct OnboardingView: View {
    let onDone: () -> Void
    @State private var page = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: DS.Space.lg) {
                TabView(selection: $page) {
                    onboardingCard(
                        title: "Plant",
                        body: "Tap a tile, pick a seed, and watch your first crop take root.",
                        symbol: "leaf.circle.fill"
                    )
                    .tag(0)

                    onboardingCard(
                        title: "Let the Sun Work",
                        body: "Advance the day and let your crops soak up the sunshine.",
                        symbol: "sun.max.fill"
                    )
                    .tag(1)

                    onboardingCard(
                        title: "Harvest",
                        body: "Gather your ripe crops and sell them in Town for coins.",
                        symbol: "basket.fill"
                    )
                    .tag(2)
                }
                .tabViewStyle(.page(indexDisplayMode: .always))

                Button(page == 2 ? "Start Farming" : "Next") {
                    if page < 2 {
                        page += 1
                    } else {
                        onDone()
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal, DS.Space.lg)
                .padding(.bottom, DS.Space.md)
            }
            .padding(.top, DS.Space.md)
            .navigationTitle("Welcome to the Farm")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }

    private func onboardingCard(title: String, body: String, symbol: String) -> some View {
        CardContainer {
            VStack(spacing: DS.Space.md) {
                Image(systemName: symbol)
                    .font(.system(size: 44, weight: .semibold))
                    .foregroundStyle(DS.Color.accent)
                Text(title)
                    .font(.title2.weight(.bold))
                Text(body)
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, DS.Space.sm)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .padding(.horizontal, DS.Space.lg)
        .padding(.vertical, DS.Space.md)
    }
}

struct ContentMissingView: View {
    let message: String
    let palette: FarmPalette

    var body: some View {
        VStack(spacing: DS.Space.md) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.largeTitle)
                .foregroundStyle(.yellow)

            Text("Something's Missing")
                .font(.title2.weight(.bold))

            Text(message)
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, DS.Space.lg)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .farmBackground(palette: palette)
    }
}
