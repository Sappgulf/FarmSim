import SwiftUI
import UIKit
import GameCore

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
    @State private var showingCelebration = false
    @State private var currentCelebration: MilestoneEvent?
    @State private var showingDayRollover = false
    @State private var dayRolloverScale = 0.8
    @State private var dayRolloverOpacity = 0.0
    @State private var toastManager = ToastManager()
    @State private var loadingManager = LoadingStateManager()

    /// Tab bar appearance is global UIKit state — configure exactly once per process lifetime.
    private static var tabBarConfigured = false

    var body: some View {
        ZStack {
            Group {
                if let message = store.contentErrorMessage {
                    ContentMissingView(message: message, palette: store.settings.palette)
                } else {
                    tabShell
                }
            }

            // Day rollover overlay
            if showingDayRollover {
                DayRolloverOverlay(
                    message: store.dayRolloverMessage,
                    day: store.save.world.day,
                    season: store.hudSeasonText,
                    earnedCoins: store.dayRolloverCoinsEarned,
                    earnedXP: store.dayRolloverXPEarned,
                    forecastIcon: store.tomorrowWeatherIcon,
                    forecastLabel: store.tomorrowWeatherLabel
                )
                .scaleEffect(dayRolloverScale)
                .opacity(dayRolloverOpacity)
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.8).combined(with: .opacity),
                    removal: .opacity
                ))
            }

            // Celebration overlays
            if showingCelebration, let celebration = currentCelebration {
                CelebrationOverlay(
                    celebration: celebration,
                    reducedMotion: store.settings.reducedMotion,
                    onDismiss: {
                        withAnimation(.easeOut(duration: 0.3)) {
                            showingCelebration = false
                        }
                        Task { @MainActor in
                            try? await Task.sleep(for: .seconds(0.3))
                            store.dismissCelebration(id: celebration.id)
                            showNextCelebration()
                        }
                    }
                )
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.5).combined(with: .opacity),
                    removal: .scale(scale: 0.8).combined(with: .opacity)
                ))
            }

            // Toast notifications for milestones (if not showing full celebration)
            if !showingCelebration && !store.pendingCelebrations.isEmpty {
                ToastNotificationStack(
                    celebrations: Array(store.pendingCelebrations.prefix(3)),
                    onDismiss: { id in
                        store.dismissCelebration(id: id)
                    }
                )
                .padding(.top, 60)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }

            // Loading overlay
            if loadingManager.isLoading {
                LoadingOverlay(
                    message: loadingManager.loadingMessage,
                    progress: loadingManager.progress
                )
                .transition(.opacity)
            }
        }
        .onAppear {
            if !Self.tabBarConfigured {
                configureTabBarAppearance()
                Self.tabBarConfigured = true
            }
            if store.onboardingRequired {
                appState.showingOnboarding = true
            }
            // Show any pending celebrations
            showNextCelebration()
        }
        .onChange(of: appState.showingOnboarding) { _, showing in
            store.setMenuPresented(showing)
        }
        .onChange(of: store.dayRolloverToken) { _, _ in
            triggerDayRolloverAnimation()
        }
        .onChange(of: store.pendingCelebrations.count) { oldCount, newCount in
            if oldCount == 0 && newCount > 0 && !showingCelebration {
                showNextCelebration()
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
    }

    private func showNextCelebration() {
        guard let next = store.pendingCelebrations.first else {
            showingCelebration = false
            currentCelebration = nil
            return
        }

        // Only show full celebration for level ups and welcome back
        // Other milestones show as toasts
        switch next.type {
        case .levelUp, .welcomeBack:
            currentCelebration = next
            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                showingCelebration = true
            }
            SoundManager.shared.play(.levelUp, haptic: .heavy)
        case .dailyStreak where next.message.contains("7") || next.message.contains("14") || next.message.contains("30"):
            currentCelebration = next
            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                showingCelebration = true
            }
            SoundManager.shared.play(.success, haptic: .medium)
        default:
            // Let toasts handle it
            showingCelebration = false
            currentCelebration = nil
        }
    }

    private func triggerDayRolloverAnimation() {
        withAnimation(.easeOut(duration: 0.4)) {
            showingDayRollover = true
            dayRolloverScale = 1.0
            dayRolloverOpacity = 1.0
        }

        // Auto-dismiss after delay
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(2.5))
            withAnimation(.easeIn(duration: 0.3)) {
                dayRolloverScale = 1.1
                dayRolloverOpacity = 0.0
            }
            try? await Task.sleep(for: .seconds(0.3))
            showingDayRollover = false
        }
    }

    private var tabShell: some View {
        TabView(selection: $appState.selectedTab) {
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
        .onChange(of: appState.selectedTab) { old, new in
            if old != new {
                SoundManager.shared.play(new.tapSound, haptic: .light)
            }
        }
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

// MARK: - Celebration Overlay

struct CelebrationOverlay: View {
    let celebration: MilestoneEvent
    let reducedMotion: Bool
    let onDismiss: () -> Void

    @State private var scale = 0.5
    @State private var opacity = 0.0
    @State private var iconScale = 0.0
    @State private var iconRotation = 0.0

    var body: some View {
        ZStack {
            // Backdrop
            Color.black.opacity(0.6)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            // Celebration card
            VStack(spacing: DS.Space.lg) {
                // Icon with animation
                Text(celebration.icon)
                    .font(.system(size: 72))
                    .scaleEffect(iconScale)
                    .rotationEffect(.degrees(iconRotation))

                // Title
                Text(celebration.title)
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                // Message
                Text(celebration.message)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, DS.Space.lg)

                // Rewards
                if celebration.coins > 0 || celebration.xp > 0 {
                    HStack(spacing: DS.Space.lg) {
                        if celebration.coins > 0 {
                            RewardBadge(
                                icon: "🪙",
                                value: "+\(celebration.coins)",
                                color: DS.Color.money
                            )
                        }
                        if celebration.xp > 0 {
                            RewardBadge(
                                icon: "✨",
                                value: "+\(celebration.xp) XP",
                                color: DS.Color.xp
                            )
                        }
                    }
                }

                // Dismiss button
                Button("Awesome!") {
                    onDismiss()
                }
                .buttonStyle(CelebrationButtonStyle())
                .padding(.top, DS.Space.md)
            }
            .padding(DS.Space.xl)
            .background {
                RoundedRectangle(cornerRadius: DS.Radius.xl)
                    .fill(Theme.warmSunsetGradient)
                    .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
            }
            .padding(.horizontal, DS.Space.lg)
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            if reducedMotion {
                scale = 1.0
                opacity = 1.0
                iconScale = 1.0
            } else {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    scale = 1.0
                    opacity = 1.0
                }
                withAnimation(.spring(response: 0.8, dampingFraction: 0.5).delay(0.1)) {
                    iconScale = 1.0
                    iconRotation = 360
                }
            }
        }
    }
}

// MARK: - Day Rollover Overlay

struct DayRolloverOverlay: View {
    let message: String
    let day: Int
    let season: String
    var earnedCoins: Int = 0
    var earnedXP: Int = 0
    var forecastIcon: String = "sun.max.fill"
    var forecastLabel: String = ""

    var body: some View {
        VStack(spacing: DS.Space.md) {
            HStack(spacing: DS.Space.sm) {
                Image(systemName: "sunrise.fill")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(.yellow)

                Text("Day \(day)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }

            Text(season)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(.white.opacity(0.8))
                .textCase(.uppercase)
                .tracking(2)

            Text(message)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
                .padding(.horizontal, DS.Space.lg)

            // Earned rewards row
            if earnedCoins > 0 || earnedXP > 0 {
                HStack(spacing: DS.Space.lg) {
                    if earnedCoins > 0 {
                        RewardBadge(icon: "\u{1FA99}", value: "+\(earnedCoins)", color: DS.Color.money)
                    }
                    if earnedXP > 0 {
                        RewardBadge(icon: "\u{2728}", value: "+\(earnedXP) XP", color: DS.Color.xp)
                    }
                }
            }

            // Tomorrow's forecast
            if !forecastLabel.isEmpty {
                HStack(spacing: DS.Space.xs) {
                    Image(systemName: forecastIcon)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.80))
                    Text("Tomorrow: \(forecastLabel)")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(.white.opacity(0.75))
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.vertical, DS.Space.xs)
                .background(.white.opacity(0.12), in: Capsule())
            }
        }
        .padding(.vertical, DS.Space.xl)
        .padding(.horizontal, DS.Space.xxl)
        .background {
            RoundedRectangle(cornerRadius: DS.Radius.xxl)
                .fill(LinearGradient(
                    colors: [
                        Color(red: 0.3, green: 0.6, blue: 0.9),
                        Color(red: 0.2, green: 0.4, blue: 0.7)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .shadow(color: .black.opacity(0.25), radius: 16, x: 0, y: 8)
        }
    }
}

// MARK: - Toast Notification Stack

struct ToastNotificationStack: View {
    let celebrations: [MilestoneEvent]
    let onDismiss: (UUID) -> Void

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            ForEach(celebrations) { celebration in
                ToastNotification(
                    celebration: celebration,
                    onDismiss: { onDismiss(celebration.id) }
                )
                .transition(.asymmetric(
                    insertion: .move(edge: .top).combined(with: .opacity),
                    removal: .move(edge: .trailing).combined(with: .opacity)
                ))
            }
        }
        .padding(.horizontal, DS.Space.md)
    }
}

// MARK: - Toast Notification

struct ToastNotification: View {
    let celebration: MilestoneEvent
    let onDismiss: () -> Void
    @State private var isVisible = false

    var body: some View {
        HStack(spacing: DS.Space.md) {
            Text(celebration.icon)
                .font(.system(size: 28))

            VStack(alignment: .leading, spacing: 2) {
                Text(celebration.title)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(.white)

                Text(celebration.message)
                    .font(.system(size: 13))
                    .foregroundStyle(.white.opacity(0.9))
                    .lineLimit(2)
            }

            Spacer()

            if celebration.coins > 0 {
                Text("+\(celebration.coins)🪙")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(DS.Color.money)
            }
        }
        .padding(DS.Space.md)
        .background {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .fill(Color(red: 0.2, green: 0.25, blue: 0.35))
                .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : -20)
        .onAppear {
            withAnimation(.easeOut(duration: 0.3)) {
                isVisible = true
            }

            // Auto-dismiss after delay
            Task { @MainActor in
                try? await Task.sleep(for: .seconds(4.0))
                withAnimation(.easeIn(duration: 0.2)) {
                    isVisible = false
                }
                try? await Task.sleep(for: .seconds(0.2))
                onDismiss()
            }
        }
    }
}

// MARK: - Supporting Views

struct RewardBadge: View {
    let icon: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: DS.Space.xs) {
            Text(icon)
                .font(.system(size: 16))
            Text(value)
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(.white)
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, DS.Space.sm)
        .background {
            Capsule()
                .fill(color.opacity(0.3))
                .overlay(
                    Capsule()
                        .stroke(color.opacity(0.5), lineWidth: 1)
                )
        }
    }
}

struct CelebrationButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 18, weight: .bold))
            .foregroundStyle(.white)
            .padding(.horizontal, DS.Space.xl)
            .padding(.vertical, DS.Space.md)
            .background {
                RoundedRectangle(cornerRadius: DS.Radius.lg)
                    .fill(.white.opacity(0.2))
                    .overlay(
                        RoundedRectangle(cornerRadius: DS.Radius.lg)
                            .stroke(.white.opacity(0.4), lineWidth: 1)
                    )
            }
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
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
        ("Visit Town",      "Head to the Market to buy seeds, sell your harvest, and upgrade your farm.",
         "storefront.fill",     Color(red: 0.35, green: 0.55, blue: 0.90)),
        ("Stock the Barn",  "Your barn tracks every crop and animal product. Filter and inspect at a glance.",
         "shippingbox.fill",    Color(red: 0.60, green: 0.38, blue: 0.18)),
        ("Go Fishing",      "Cast a line at the dock. Rare fish fetch premium prices at market.",
         "fish.fill",           Color(red: 0.22, green: 0.60, blue: 0.78)),
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
