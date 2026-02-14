import SwiftUI
import UIKit

// MARK: - GameTab

enum GameTab: String, CaseIterable, Hashable {
    case farm
    case inventory
    case market
    case almanac
    case settings

    var title: String {
        switch self {
        case .farm:      return "My Farm"
        case .inventory: return "Barn"
        case .market:    return "Town"
        case .almanac:   return "Almanac"
        case .settings:  return "Settings"
        }
    }

    var icon: String {
        switch self {
        case .farm:      return "leaf.fill"
        case .inventory: return "shippingbox.fill"
        case .market:    return "storefront.fill"
        case .almanac:   return "book.closed.fill"
        case .settings:  return "gearshape.fill"
        }
    }

    var tapSound: SoundManager.SoundEffect {
        switch self {
        case .farm:      return .click
        case .inventory: return .click
        case .market:    return .click
        case .almanac:   return .pageTurn
        case .settings:  return .click
        }
    }
}

// MARK: - GameShell

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
            configureTabBarAppearance()
            if store.onboardingRequired {
                appState.showingOnboarding = true
            }
        }
        .sheet(isPresented: Binding(
            get: { appState.showingOnboarding },
            set: { appState.showingOnboarding = $0 }
        )) {
            OnboardingView {
                store.completeOnboarding()
                appState.showingOnboarding = false
            }
        }
        .onChange(of: appState.showingOnboarding) { _, showing in
            store.setMenuPresented(showing)
        }
    }

    private var tabShell: some View {
        TabView(selection: Binding(
            get: { appState.selectedTab },
            set: { newTab in
                if newTab != appState.selectedTab {
                    SoundManager.shared.play(newTab.tapSound, haptic: .light)
                }
                appState.selectedTab = newTab
            }
        )) {
            FarmView(store: store, appState: appState)
                .tabItem { Label(GameTab.farm.title,      systemImage: GameTab.farm.icon) }
                .tag(GameTab.farm)

            InventoryView(store: store, appState: appState)
                .tabItem { Label(GameTab.inventory.title, systemImage: GameTab.inventory.icon) }
                .tag(GameTab.inventory)

            TownMarketView(store: store)
                .tabItem { Label(GameTab.market.title,    systemImage: GameTab.market.icon) }
                .tag(GameTab.market)

            AlmanacView(store: store)
                .tabItem { Label(GameTab.almanac.title,   systemImage: GameTab.almanac.icon) }
                .tag(GameTab.almanac)

            SettingsView(store: store, appState: appState)
                .tabItem { Label(GameTab.settings.title,  systemImage: GameTab.settings.icon) }
                .tag(GameTab.settings)
        }
        .tint(DS.Color.accent)
    }

    // MARK: - Tab Bar Appearance

    private func configureTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()

        // Warm parchment background
        appearance.backgroundColor = UIColor(
            red: 0.97, green: 0.93, blue: 0.84, alpha: 0.96
        )

        // Active item: farm green
        let activeColor = UIColor(red: 0.27, green: 0.56, blue: 0.24, alpha: 1)
        let inactiveColor = UIColor(red: 0.55, green: 0.45, blue: 0.32, alpha: 0.6)

        let activeAttrs: [NSAttributedString.Key: Any] = [
            .foregroundColor: activeColor,
            .font: UIFont.systemFont(ofSize: 10, weight: .semibold)
        ]
        let inactiveAttrs: [NSAttributedString.Key: Any] = [
            .foregroundColor: inactiveColor,
            .font: UIFont.systemFont(ofSize: 10, weight: .regular)
        ]

        appearance.stackedLayoutAppearance.selected.iconColor      = activeColor
        appearance.stackedLayoutAppearance.selected.titleTextAttributes   = activeAttrs
        appearance.stackedLayoutAppearance.normal.iconColor        = inactiveColor
        appearance.stackedLayoutAppearance.normal.titleTextAttributes     = inactiveAttrs

        // Subtle top separator
        appearance.shadowColor = UIColor(red: 0.7, green: 0.58, blue: 0.40, alpha: 0.3)

        UITabBar.appearance().standardAppearance  = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}

// MARK: - OnboardingView

struct OnboardingView: View {
    let onDone: () -> Void
    @State private var page = 0

    private let pages: [(title: String, body: String, symbol: String, tint: Color)] = [
        ("Plant",           "Tap a tile, pick a seed, and watch your first crop take root.",
         "leaf.circle.fill",    DS.Color.accent),
        ("Let the Sun Work", "Time flows automatically. Keep planting while the day moves on.",
         "sun.max.fill",        Color(red: 0.95, green: 0.72, blue: 0.22)),
        ("Harvest",         "Gather ripe crops and sell them in Town for coins.",
         "basket.fill",         Color(red: 0.75, green: 0.42, blue: 0.18)),
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: DS.Space.lg) {
                TabView(selection: $page) {
                    ForEach(pages.indices, id: \.self) { i in
                        onboardingCard(pages[i]).tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))
                .animation(DS.Animation.standard, value: page)

                Button(page == pages.count - 1 ? "Start Farming" : "Next") {
                    if page < pages.count - 1 {
                        SoundManager.shared.play(.click, haptic: .light)
                        withAnimation(DS.Animation.standard) { page += 1 }
                    } else {
                        SoundManager.shared.play(.success, haptic: .medium)
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

    private func onboardingCard(_ item: (title: String, body: String, symbol: String, tint: Color)) -> some View {
        CardContainer {
            VStack(spacing: DS.Space.md) {
                Image(systemName: item.symbol)
                    .font(.system(size: 48, weight: .semibold))
                    .foregroundStyle(item.tint)
                    .shadow(color: item.tint.opacity(0.30), radius: 8, x: 0, y: 4)

                Text(item.title)
                    .font(Typography.title)

                Text(item.body)
                    .font(Typography.body)
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

// MARK: - ContentMissingView

struct ContentMissingView: View {
    let message: String
    let palette: FarmPalette

    var body: some View {
        VStack(spacing: DS.Space.md) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 44, weight: .semibold))
                .foregroundStyle(.yellow)
                .shadow(color: .yellow.opacity(0.3), radius: 6, x: 0, y: 3)

            Text("Something's Missing")
                .font(Typography.title)

            Text(message)
                .font(Typography.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, DS.Space.lg)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .farmBackground(palette: palette)
    }
}
