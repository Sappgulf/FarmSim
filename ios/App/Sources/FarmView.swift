import SwiftUI
import SpriteKit
import GameCore

struct FarmView: View {
    @Environment(\.accessibilityReduceMotion) private var accessibilityReduceMotion

    @Bindable var store: GameStore
    @Bindable var appState: AppState

    @State private var scene = FarmScene(size: CGSize(width: 1200, height: 1200))
    @State private var zoom: CGFloat = 1.0
    @State private var pan: CGSize = .zero
    @State private var sceneDebugStats = FarmSceneDebugStats()
    @State private var showDayRolloverOverlay = false
    
    // Quick Wheel State
    @State private var showQuickWheel = false
    @State private var quickWheelItems: [QuickWheelItem] = []
    @State private var quickWheelLocation: CGPoint = .zero
    
    private var reducedMotion: Bool {
        store.settings.reducedMotion || accessibilityReduceMotion
    }

    private var weatherSnapshot: FarmWeatherSnapshot {
        FarmWeatherModel.resolve(
            day: store.save.world.day,
            timeProgress: store.hudTimeProgress,
            season: store.hudSeasonText
        )
    }


    var body: some View {
        ZStack {
            SpriteView(scene: scene, options: [.ignoresSiblingOrder, .allowsTransparency])
                .ignoresSafeArea()
                .simultaneousGesture(dragGesture)
                .simultaneousGesture(magnificationGesture)
                .overlay {
                    ZStack {
                        atmosphereOverlay
                        WeatherFieldOverlay(
                            snapshot: weatherSnapshot,
                            reducedMotion: reducedMotion
                        )
                    }
                    .allowsHitTesting(false)
                }

            VStack {
                    Spacer()
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.28)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 220)
                    .allowsHitTesting(false)
                }
                .ignoresSafeArea()

            HStack {
                FarmSideRail(
                    readyCount: store.readyTileCount,
                    inventoryCount: store.totalInventoryCount,
                    onInventory: { appState.selectedTab = .inventory },
                    onAnimals: { appState.selectedTab = .animals },
                    onBuild: { appState.selectedTab = .build },
                    onMore: { appState.selectedTab = .more }
                )
                .padding(.leading, DS.Space.sm)

                Spacer()

                FarmCameraRail(
                    onResetView: {
                        zoom = 1.0
                        pan = .zero
                        scene.setViewport(zoom: zoom, pan: pan)
                    }
                )
                .padding(.trailing, DS.Space.sm)
            }
            .padding(.top, 360)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }
            .safeAreaInset(edge: .top) {
                VStack(spacing: DS.Space.xs) {
                    topHUD
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.top, 58)
                .offset(y: 84)
            }
            .overlay {
                if showDayRolloverOverlay {
                    dayRolloverOverlay
                        .transition(.opacity)
                        .zIndex(5)
                }
                
                if showQuickWheel {
                    QuickWheelView(
                        items: quickWheelItems,
                        center: quickWheelLocation,
                        onDismiss: { showQuickWheel = false }
                    )
                    .zIndex(10)
                }
            }
            .safeAreaInset(edge: .bottom) {
                VStack(spacing: DS.Space.sm) {
                    statusBar
                    seedTray
                    actionBar
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.bottom, DS.Space.xs)
            }
            .onAppear {
                scene.onTileTapped = { index in
                    appState.openTileSheet(for: index)
                }
                scene.onDebugStats = { stats in
                    sceneDebugStats = stats
                }
                scene.setReducedMotion(store.settings.reducedMotion)
                scene.setParticleEffectsEnabled(store.settings.particleEffects)
                scene.setShowTileIndices(store.settings.showTileCoordinates)
                scene.setPreferredFPS(store.settings.targetFPS)
                scene.setTimeOfDayProgress(store.hudTimeProgress)
                scene.apply(snapshot: store.renderSnapshot, cropDisplay: store.cropDisplay)
                scene.setViewport(zoom: zoom, pan: pan)
                store.setMenuPresented(appState.showingTileSheet)
                
                scene.onTileLongPressed = { index, location in
                    let items = generateWheelItems(for: index)
                    if !items.isEmpty {
                        quickWheelItems = items
                        quickWheelLocation = location
                        showQuickWheel = true
                        SoundManager.shared.play(.click, haptic: .medium)
                    }
                }
            }
            .onDisappear {
                scene.onDebugStats = nil
                store.setMenuPresented(false)
            }
            // Consolidated settings observer to reduce observation overhead
            .onChange(of: store.settings.reducedMotion) { _, reduced in
                scene.setReducedMotion(reduced)
            }
            .onChange(of: store.settings.particleEffects) { _, enabled in
                scene.setParticleEffectsEnabled(enabled)
            }
            .onChange(of: store.settings.showTileCoordinates) { _, enabled in
                scene.setShowTileIndices(enabled)
            }
            .onChange(of: store.settings.targetFPS) { _, fps in
                scene.setPreferredFPS(fps)
            }
            // Game state changes - these fire frequently (12x/sec)
            .onChange(of: store.renderSnapshot) { _, snapshot in
                scene.apply(snapshot: snapshot, cropDisplay: store.cropDisplay)
                scene.setTimeOfDayProgress(store.hudTimeProgress)
            }
            .sheet(isPresented: Binding(get: {
                appState.showingTileSheet
            }, set: { appState.showingTileSheet = $0 })) {
                TileActionSheet(store: store, appState: appState)
                    .presentationDetents([.fraction(0.35), .medium])
                    .presentationDragIndicator(.visible)
            }
            .onChange(of: appState.showingTileSheet) { _, showing in
                store.setMenuPresented(showing)
            }
            .onChange(of: store.dayRolloverToken) { _, _ in
                // Avoid duplicate overlay if already showing
                guard !showDayRolloverOverlay else { return }
                showDayRolloverOverlay = true
                let delay = reducedMotion ? 0.35 : 1.2
                Task {
                    try? await Task.sleep(for: .seconds(delay))
                    // Check task cancellation before UI update
                    guard !Task.isCancelled else { return }
                    await MainActor.run {
                        withAnimation(.easeOut(duration: 0.2)) {
                            showDayRolloverOverlay = false
                        }
                    }
                }
            }
            .sensoryFeedback(.impact(weight: .light), trigger: store.hapticToken)
            .sensoryFeedback(.success, trigger: store.harvestToken)
            .sensoryFeedback(.impact(weight: .light), trigger: store.dayRolloverToken)
            .background {
                // Lightweight size observer — only this GeometryReader affects layout,
                // not the entire view body. Avoids the original full-body GeometryReader cost.
                GeometryReader { geo in
                    Color.clear
                        .onChange(of: geo.size) { _, _ in
                            scene.setViewport(zoom: zoom, pan: pan)
                        }
                }
            }
        .farmBackground(palette: store.settings.palette)
    }

    private var atmosphereOverlay: some View {
        AtmosphereOverlayView(
            timeProgress: store.hudTimeProgress,
            snapshot: weatherSnapshot,
            reducedMotion: reducedMotion
        )
    }

    private var dragGesture: some Gesture {
        DragGesture(minimumDistance: 2)
            .onChanged { value in
                let livePan = CGSize(
                    width: pan.width + value.translation.width,
                    height: pan.height + value.translation.height
                )
                scene.setViewport(zoom: zoom, pan: livePan)
            }
            .onEnded { value in
                pan = CGSize(
                    width: pan.width + value.translation.width,
                    height: pan.height + value.translation.height
                )
                scene.setViewport(zoom: zoom, pan: pan)
            }
    }

    private var magnificationGesture: some Gesture {
        MagnificationGesture()
            .onChanged { value in
                let liveZoom = max(0.8, min(2.2, zoom * value))
                scene.setViewport(zoom: liveZoom, pan: pan)
            }
            .onEnded { value in
                zoom = max(0.8, min(2.2, zoom * value))
                scene.setViewport(zoom: zoom, pan: pan)
            }
    }

    private var topHUD: some View {
        FarmHomeHUD(
            farmName: store.farmName,
            level: store.playerLevel,
            xp: store.save.player.xp,
            day: store.save.world.day,
            timeText: store.hudTimeText,
            timeIcon: store.hudClockSymbol,
            season: store.hudSeasonText,
            coins: store.save.player.coins,
            inventory: store.totalInventoryCount,
            weatherSnapshot: weatherSnapshot,
            forecast: Array(store.weatherForecast.prefix(3)),
            onMenu: { appState.openMainMenu() }
        )
    }

    private var statusBar: some View {
        WoodenPanel {
            Text(store.statusText)
                .font(.footnote)
                .foregroundStyle(.white.opacity(0.95))
                .shadow(color: .black.opacity(0.4), radius: 1)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityLabel("Status")
                .accessibilityValue(store.statusText)
        }
    }

    private var seedTray: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.xs) {
                ForEach(store.cropDefs, id: \.id) { crop in
                    let selected = store.selectedSeedID == crop.id
                    let count = store.seedCount(for: crop.id)
                    let unlocked = store.isUnlocked(cropID: crop.id)

                    Button {
                        store.selectSeed(id: crop.id)
                    } label: {
                        VStack(spacing: DS.Space.xxs) {
                            Text(store.emoji(for: crop.id))
                                .font(.title3)
                            Text("\(count)")
                                .font(.caption.monospacedDigit().weight(.semibold))
                        }
                        .foregroundStyle(selected ? Color(red: 0.3, green: 0.2, blue: 0.1) : .white)
                        .frame(width: 52, height: 56)
                        .background(
                            ZStack {
                                if selected {
                                    RoundedRectangle(cornerRadius: DS.Radius.md)
                                        .fill(Color(red: 0.95, green: 0.9, blue: 0.8))
                                } else {
                                    RoundedRectangle(cornerRadius: DS.Radius.md)
                                        .fill(Color.black.opacity(0.2))
                                }
                                
                                RoundedRectangle(cornerRadius: DS.Radius.md)
                                    .strokeBorder(selected ? DS.Color.money : .white.opacity(0.1), lineWidth: selected ? 2 : 1)
                            }
                        )
                        .shadow(color: selected ? DS.Color.money.opacity(0.4) : .clear, radius: 8, x: 0, y: 2)
                        .opacity(unlocked ? 1.0 : 0.45)
                        .scaleEffect(selected ? 1.08 : 1.0)
                        .animation(.spring(response: 0.3, dampingFraction: 0.65), value: selected)
                    }
                    .buttonStyle(.plain)
                    .disabled(!unlocked)
                    .accessibilityLabel("\(crop.name), \(count) seeds")
                    .accessibilityHint(unlocked ? "Pick this seed for planting" : "Keep growing to unlock this seed")
                }
            }
            .padding(.horizontal, DS.Space.md) // Increased padding
            .padding(.vertical, DS.Space.sm)
        }
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: DS.Radius.lg)
                    .fill(Color(red: 0.4, green: 0.25, blue: 0.15).opacity(0.95))
                
                RoundedRectangle(cornerRadius: DS.Radius.lg)
                    .strokeBorder(Color(red: 0.55, green: 0.4, blue: 0.3), lineWidth: 2)
            }
        )
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.lg))
        .shadow(color: .black.opacity(0.3), radius: 5, y: 2)
    }

    private var actionBar: some View {
        HStack(spacing: DS.Space.sm) {
            FarmRoundActionButton(
                title: "Harvest",
                icon: "scissors",
                tint: DS.Color.money,
                disabled: store.readyTileCount == 0
            ) {
                store.harvestAll()
            }

            FarmRoundActionButton(
                title: "Animals",
                icon: "pawprint.fill",
                tint: DS.Color.accent,
                disabled: false
            ) {
                appState.selectedTab = .animals
            }

            FarmRoundActionButton(
                title: "Collect",
                icon: "basket.fill",
                tint: DS.Color.xp,
                disabled: false
            ) {
                _ = store.collectLivestockProducts()
            }

            FarmRoundActionButton(
                title: "Build",
                icon: "hammer.fill",
                tint: DS.Color.money,
                disabled: false
            ) {
                appState.selectedTab = .build
            }

            #if DEBUG
            FarmRoundActionButton(
                title: "Next Day",
                icon: "sunrise.fill",
                tint: DS.Color.xp,
                disabled: false
            ) {
                store.advanceDays(1)
            }
            #endif
        }
    }

    private var dayRolloverOverlay: some View {
        Button {
            withAnimation(.easeOut(duration: 0.2)) {
                showDayRolloverOverlay = false
            }
        } label: {
            VStack(spacing: DS.Space.xs) {
                Image(systemName: "sunrise.fill")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundStyle(DS.Color.money)
                    .shadow(color: DS.Color.money.opacity(0.45), radius: 12, x: 0, y: 2)
                Text(store.dayRolloverMessage)
                    .font(.headline.weight(.semibold))
                    .multilineTextAlignment(.center)
                Text("Tap to dismiss")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(DS.Space.lg)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                    .stroke(DS.Color.cardStroke, lineWidth: 0.5)
            )
            .padding(.horizontal, DS.Space.lg)
            .shadow(color: DS.shadow, radius: 16, y: 8)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(store.dayRolloverMessage)
        .accessibilityHint("Tap to dismiss the day rollover message")
        .transition(.scale(scale: 0.92).combined(with: .opacity))
    }

    private func generateWheelItems(for index: Int) -> [QuickWheelItem] {
        var items = [QuickWheelItem]()
        guard let tile = store.tileSheetState(for: index) else { return [] }
        
        // 1. Water (Always available if not fully watered? Or just always action)
        items.append(QuickWheelItem(id: "water", icon: "drop.fill", label: "Water") {
            store.waterTile(index: index)
        })
        
        if tile.cropID == nil {
            // Empty Tile Options
            
            // Catalogue shortcut
            items.append(QuickWheelItem(id: "catalog", icon: "book.fill", label: "Catalog") {
                appState.openTileSheet(for: index)
            })
            
            // Quick Plant (Top 3 Unlocked)
            let quickSeeds = store.cropDefs
                .filter { store.isUnlocked(cropID: $0.id) }
                .sorted { $0.seedCost < $1.seedCost } // Sort by cheapness or level? Just cost for now
                .prefix(3)
            
            for seed in quickSeeds {
                items.append(QuickWheelItem(id: "seed_\(seed.id)", icon: "leaf.fill", label: seed.name) {
                    store.selectSeed(id: seed.id)
                    store.plantSelectedSeed(on: index)
                })
            }
            
        } else {
            // Crop Options
            if tile.isReady {
                items.append(QuickWheelItem(id: "harvest", icon: "arrow.up.circle.fill", label: "Harvest") {
                    store.harvestTile(index: index)
                })
            } else {
                items.append(QuickWheelItem(id: "info", icon: "info.circle", label: "Info") {
                    appState.openTileSheet(for: index)
                })
            }
            
            items.append(QuickWheelItem(id: "clear", icon: "trash.fill", label: "Clear") {
                store.clearTile(index: index)
            })
        }
        
        return items
    }

    fileprivate struct WeatherForecastStrip: View {
        let forecast: [MarketWeatherForecastDay]

        var body: some View {
            if forecast.isEmpty {
                EmptyView()
            } else {
                HStack(spacing: DS.Space.xs) {
                    ForEach(forecast) { entry in
                        VStack(spacing: 2) {
                            Text(forecastDayLabel(for: entry))
                                .font(Typography.caption)
                                .foregroundStyle(.white.opacity(0.76))
                                .lineLimit(1)

                            Image(systemName: entry.weather.icon)
                                .font(.title3.weight(.semibold))
                                .foregroundStyle(entry.weather.color)
                                .frame(height: 22)

                            Text(entry.weather.rawValue)
                                .font(Typography.caption)
                                .foregroundStyle(.white.opacity(0.72))
                                .lineLimit(1)
                                .minimumScaleFactor(0.75)

                            Text("\(entry.intensityPercent)%")
                                .font(Typography.caption)
                                .foregroundStyle(.white.opacity(0.64))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                        .padding(.horizontal, DS.Space.xs)
                        .background(
                            Capsule()
                                .fill(Color.white.opacity(0.12))
                        )
                        .overlay(
                            Capsule()
                                .stroke(entry.weather.tintColor.opacity(0.35), lineWidth: 0.8)
                        )
                        .accessibilityLabel("Forecast day \(forecastDayLabel(for: entry))")
                        .accessibilityValue("\(entry.weather.rawValue), \(entry.windowTitle), \(entry.intensityPercent)% intensity")
                    }
                }
                .padding(.horizontal, DS.Space.xs)
                .padding(.vertical, DS.Space.xs)
                .background(
                    RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                        .fill(Color.black.opacity(0.24))
                        .overlay(
                            RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                                .stroke(Color.white.opacity(0.16), lineWidth: 0.6)
                        )
                )
            }
        }

    private func forecastDayLabel(for entry: MarketWeatherForecastDay) -> String {
        entry.dayOffset == 1 ? "Tomorrow" : "+\(entry.dayOffset)d"
    }
    }
}

private struct FarmHomeHUD: View {
    let farmName: String
    let level: Int
    let xp: Int
    let day: Int
    let timeText: String
    let timeIcon: String
    let season: String
    let coins: Int
    let inventory: Int
    let weatherSnapshot: FarmWeatherSnapshot
    let forecast: [MarketWeatherForecastDay]
    let onMenu: () -> Void

    private var xpProgress: Double {
        Double(xp % ProgressionSystem.xpPerLevel) / Double(ProgressionSystem.xpPerLevel)
    }

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            Color.clear
                .frame(height: 74)

            HStack(spacing: DS.Space.sm) {
                Text("👩‍🌾")
                    .font(.system(size: 34))
                    .frame(width: 52, height: 52)
                    .background(
                        Circle()
                            .fill(Color(red: 0.95, green: 0.76, blue: 0.38))
                            .overlay(Circle().strokeBorder(.white.opacity(0.28), lineWidth: 2))
                    )

                VStack(alignment: .leading, spacing: 4) {
                    Text(farmName)
                        .font(Typography.bodyStrong)
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                        .accessibilityAddTraits(.isHeader)
                    Text("Level \(level)")
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.78))

                    ProgressView(value: xpProgress, total: 1)
                        .tint(DS.Color.xp)
                        .background(.black.opacity(0.25), in: Capsule())
                        .accessibilityLabel("Level progress")
                }

                Spacer(minLength: 0)

                ViewThatFits {
                    HStack(spacing: DS.Space.xs) {
                        FarmResourceBadge(icon: "circle.fill", value: "\(coins)", tint: DS.Color.money)
                        FarmResourceBadge(icon: "shippingbox.fill", value: "\(inventory)", tint: DS.Color.accent)
                        FarmResourceBadge(icon: "star.fill", value: "\(level)", tint: DS.Color.xp)
                    }
                    VStack(alignment: .trailing, spacing: DS.Space.xs) {
                        FarmResourceBadge(icon: "circle.fill", value: "\(coins)", tint: DS.Color.money)
                        FarmResourceBadge(icon: "star.fill", value: "\(level)", tint: DS.Color.xp)
                    }
                }

                Button(action: onMenu) {
                    Image(systemName: "line.3.horizontal")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                        .frame(width: 42, height: 42)
                        .background(.black.opacity(0.42), in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                                .strokeBorder(.white.opacity(0.16), lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Open game menu")
            }

            ViewThatFits {
                HStack(spacing: DS.Space.xs) {
                    FarmResourceBadge(icon: "calendar", value: "Day \(day)", tint: DS.Color.money)
                    FarmResourceBadge(icon: timeIcon, value: timeText, tint: DS.Color.xp)
                    FarmResourceBadge(icon: "leaf.fill", value: season, tint: DS.Color.accent)
                    WeatherPill(
                        weather: weatherSnapshot.weather,
                        intensity: weatherSnapshot.intensity,
                        subtitle: weatherSnapshot.windowTitle
                    )
                }
                VStack(alignment: .leading, spacing: DS.Space.xs) {
                    HStack(spacing: DS.Space.xs) {
                        FarmResourceBadge(icon: "calendar", value: "Day \(day)", tint: DS.Color.money)
                        FarmResourceBadge(icon: timeIcon, value: timeText, tint: DS.Color.xp)
                    }
                    HStack(spacing: DS.Space.xs) {
                        FarmResourceBadge(icon: "leaf.fill", value: season, tint: DS.Color.accent)
                        WeatherPill(
                            weather: weatherSnapshot.weather,
                            intensity: weatherSnapshot.intensity,
                            subtitle: weatherSnapshot.windowTitle
                        )
                    }
                }
            }

            FarmView.WeatherForecastStrip(forecast: forecast)
        }
        .padding(DS.Space.md)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                .fill(.black.opacity(0.52))
                .overlay(
                    RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                        .strokeBorder(.white.opacity(0.16), lineWidth: 1)
                )
        )
        .shadow(color: .black.opacity(0.28), radius: 16, y: 6)
    }
}

private struct FarmSideRail: View {
    let readyCount: Int
    let inventoryCount: Int
    let onInventory: () -> Void
    let onAnimals: () -> Void
    let onBuild: () -> Void
    let onMore: () -> Void

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            railButton(title: "Events", icon: "star.fill", badge: nil, action: onMore)
            railButton(title: "Quests", icon: "list.clipboard.fill", badge: readyCount > 0 ? "\(readyCount)" : nil, action: onBuild)
            railButton(title: "Barn", icon: "shippingbox.fill", badge: inventoryCount > 0 ? "\(inventoryCount)" : nil, action: onInventory)
            railButton(title: "Animals", icon: "pawprint.fill", badge: nil, action: onAnimals)
        }
    }

    private func railButton(title: String, icon: String, badge: String?, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: icon)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(DS.Color.money)
                        .frame(width: 48, height: 44)
                    if let badge {
                        Text(badge)
                            .font(.system(size: 10, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.red, in: Capsule())
                            .offset(x: 8, y: -5)
                    }
                }
                Text(title)
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(width: 64, height: 68)
            .background(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .fill(.black.opacity(0.56))
                    .overlay(
                        RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                            .strokeBorder(.white.opacity(0.16), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
    }
}

private struct FarmCameraRail: View {
    let onResetView: () -> Void

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            railButton(icon: "camera.fill", label: "Camera", action: {})
            railButton(icon: "arrow.up.left.and.arrow.down.right", label: "Reset view", action: onResetView)
        }
    }

    private func railButton(icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.title3.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 48, height: 48)
                .background(.black.opacity(0.56), in: Circle())
                .overlay(Circle().strokeBorder(.white.opacity(0.16), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }
}

private struct FarmRoundActionButton: View {
    let title: String
    let icon: String
    let tint: Color
    let disabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 54, height: 54)
                    .background(
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [tint.opacity(disabled ? 0.35 : 0.95), tint.opacity(disabled ? 0.22 : 0.58)],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                    )
                    .overlay(Circle().strokeBorder(.white.opacity(disabled ? 0.08 : 0.22), lineWidth: 1))
                    .shadow(color: disabled ? .clear : tint.opacity(0.35), radius: 8, y: 3)

                Text(title)
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
        .disabled(disabled)
        .opacity(disabled ? 0.52 : 1)
        .accessibilityLabel(title)
    }
}

// MARK: - AtmosphereOverlayView

/// Separate view for atmosphere overlay to isolate re-renders
private struct AtmosphereOverlayView: View {
    let timeProgress: Double
    let snapshot: FarmWeatherSnapshot
    let reducedMotion: Bool
    
    // Pre-computed color values to avoid creating Color instances repeatedly
    private static let dawn = Color(red: 1.0, green: 0.82, blue: 0.62)
    private static let day = Color(red: 0.88, green: 0.96, blue: 1.0)
    private static let dusk = Color(red: 0.94, green: 0.68, blue: 0.46)
    private static let night = Color(red: 0.18, green: 0.26, blue: 0.48)
    
    var body: some View {
        let t = timeProgress
        let topColor: Color
        let bottomColor: Color
        
        if t < 0.2 {
            topColor = Self.dawn.opacity(reducedMotion ? 0.08 : 0.14)
            bottomColor = Self.day.opacity(0.04)
        } else if t < 0.7 {
            topColor = Self.day.opacity(0.06)
            bottomColor = Self.day.opacity(0.02)
        } else if t < 0.88 {
            topColor = Self.dusk.opacity(reducedMotion ? 0.10 : 0.16)
            bottomColor = Self.night.opacity(0.08)
        } else {
            topColor = Self.night.opacity(0.18)
            bottomColor = Self.night.opacity(0.14)
        }

        let weatherOpacity = snapshot.weather.overlayOpacity * (reducedMotion ? 0.45 : 0.75) * snapshot.intensity

        return ZStack {
            LinearGradient(
                colors: [topColor, .clear, bottomColor],
                startPoint: .top,
                endPoint: .bottom
            )

            LinearGradient(
                colors: [
                    snapshot.weather.overlayBlend.opacity(weatherOpacity),
                    snapshot.weather.overlayBlend.opacity(weatherOpacity * 0.35),
                    .clear
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .blendMode(.plusLighter)

            if snapshot.weather == .stormy {
                RadialGradient(
                    colors: [
                        Color.white.opacity(reducedMotion ? 0.02 : 0.06),
                        .clear
                    ],
                    center: .topTrailing,
                    startRadius: 10,
                    endRadius: 260
                )
                .opacity(snapshot.intensity)
            }
        }
        .ignoresSafeArea()
    }
}

private struct WeatherFieldOverlay: View {
    let snapshot: FarmWeatherSnapshot
    let reducedMotion: Bool

    var body: some View {
        GeometryReader { geo in
            ZStack {
                cloudBands(in: geo.size)

                if snapshot.weather == .rainy || snapshot.weather == .stormy {
                    precipitationStreaks(in: geo.size, color: Color.white.opacity(snapshot.weather == .stormy ? 0.42 : 0.26))
                }

                if snapshot.weather == .snowy {
                    snowDots(in: geo.size)
                }
            }
            .ignoresSafeArea()
        }
    }

    @ViewBuilder
    private func cloudBands(in size: CGSize) -> some View {
        let opacity = max(0.06, snapshot.weather.overlayOpacity * 0.32 * snapshot.intensity)
        let tint = snapshot.weather == .sunny ? Color.white : snapshot.weather.tintColor

        if snapshot.weather != .sunny {
            VStack(spacing: reducedMotion ? 18 : 12) {
                ForEach(0..<3, id: \.self) { index in
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [
                                    tint.opacity(opacity * (index == 0 ? 1.0 : 0.72)),
                                    tint.opacity(opacity * 0.18)
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: size.width * (0.62 + (CGFloat(index) * 0.08)), height: 26 + CGFloat(index * 8))
                        .blur(radius: reducedMotion ? 12 : 18)
                        .offset(
                            x: CGFloat(index - 1) * size.width * 0.14,
                            y: -size.height * (0.28 - CGFloat(index) * 0.05)
                        )
                }
            }
        }
    }

    private func precipitationStreaks(in size: CGSize, color: Color) -> some View {
        let count = reducedMotion ? 18 : Int(28 * snapshot.intensity)
        return ZStack {
            ForEach(0..<count, id: \.self) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(color)
                    .frame(width: 2, height: 18 + CGFloat(index % 4) * 8)
                    .rotationEffect(.degrees(snapshot.weather == .stormy ? 18 : 12))
                    .blur(radius: 0.5)
                    .offset(
                        x: CGFloat((index * 37) % max(1, Int(size.width))) - (size.width / 2),
                        y: CGFloat((index * 83) % max(1, Int(size.height))) - (size.height / 2)
                    )
                    .opacity(index % 3 == 0 ? 0.55 : 0.32)
            }
        }
    }

    private func snowDots(in size: CGSize) -> some View {
        let count = reducedMotion ? 14 : Int(22 * snapshot.intensity)
        return ZStack {
            ForEach(0..<count, id: \.self) { index in
                Circle()
                    .fill(Color.white.opacity(index % 2 == 0 ? 0.34 : 0.22))
                    .frame(width: 4 + CGFloat(index % 3), height: 4 + CGFloat(index % 3))
                    .blur(radius: 0.5)
                    .offset(
                        x: CGFloat((index * 53) % max(1, Int(size.width))) - (size.width / 2),
                        y: CGFloat((index * 97) % max(1, Int(size.height))) - (size.height / 2)
                    )
            }
        }
    }
}


struct TileActionSheet: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    var body: some View {
        let tileIndex = appState.selectedTileIndex ?? 0

        NavigationStack {
            Group {
                if let tile = store.tileSheetState(for: tileIndex) {
                    content(for: tile)
                } else {
                    Text("This patch isn't ready yet.")
                        .foregroundStyle(.secondary)
                }
            }
            .padding(DS.Space.md)
            .navigationTitle("Plot \(tileIndex + 1)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        appState.closeTileSheet()
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func content(for tile: TileSheetState) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(tile.cropID == nil ? "Open Patch" : tile.cropName)

            if tile.cropID != nil {
                ProgressView(value: tile.progress)
                    .tint(tile.isReady ? DS.Color.money : DS.Color.xp)

                HStack(spacing: DS.Space.sm) {
                    Button(tile.isReady ? "Harvest" : "Still Growing") {
                        store.harvestTile(index: tile.index)
                        if tile.isReady { appState.closeTileSheet() }
                    }
                    .buttonStyle(PrimaryButtonStyle(tint: DS.Color.money))
                    .disabled(!tile.isReady)

                    Button("Water") {
                        store.waterTile(index: tile.index)
                    }
                    .buttonStyle(PrimaryButtonStyle(tint: DS.Color.xp))

                    Button("Remove") {
                        store.clearTile(index: tile.index)
                        appState.closeTileSheet()
                    }
                    .buttonStyle(PrimaryButtonStyle(tint: .red))
                }
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: DS.Space.xs) {
                        ForEach(store.cropDefs, id: \.id) { crop in
                            Button {
                                store.selectSeed(id: crop.id)
                            } label: {
                                VStack(spacing: DS.Space.xxs) {
                                    Text(store.emoji(for: crop.id))
                                        .font(.title3)
                                    Text(crop.name)
                                        .font(.caption2)
                                        .lineLimit(1)
                                }
                                .frame(width: 72, height: 64)
                                .background(
                                    store.selectedSeedID == crop.id ? .white : .white.opacity(0.15),
                                    in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                                )
                                .foregroundStyle(store.selectedSeedID == crop.id ? .black : .white)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                Button("Plant Here") {
                    store.plantSelectedSeed(on: tile.index)
                    appState.closeTileSheet()
                }
                .buttonStyle(PrimaryButtonStyle(tint: DS.Color.accent))
            }
        }
    }
}
