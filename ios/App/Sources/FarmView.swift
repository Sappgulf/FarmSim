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


    var body: some View {
        ZStack {
            SpriteView(scene: scene, options: [.ignoresSiblingOrder, .allowsTransparency])
                .ignoresSafeArea()
                .simultaneousGesture(dragGesture)
                .simultaneousGesture(magnificationGesture)
                .overlay {
                    atmosphereOverlay
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
            }
            .safeAreaInset(edge: .top) {
                VStack(spacing: DS.Space.xs) {
                    topHUD
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.top, DS.Space.xs)
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
                // Use weak self pattern to prevent retention cycles
                Task { [weak store] in
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
        WoodenPanel {
            VStack(spacing: DS.Space.xs) {
                HStack {
                    Button {
                        appState.openMainMenu()
                    } label: {
                        Label("Menu", systemImage: "line.3.horizontal")
                            .labelStyle(.iconOnly)
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(width: 32, height: 32)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Open game menu")

                    Text(store.farmName)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.95))
                        .shadow(color: .black.opacity(0.3), radius: 1, x: 0, y: 1)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)

                    Spacer()
                }

                ViewThatFits {
                    HStack {
                        StatPill(icon: "calendar", value: "Day \(store.save.world.day)")
                        StatPill(icon: store.hudClockSymbol, value: store.hudTimeText)
                        StatPill(icon: "leaf.fill", value: store.hudSeasonText)
                        Spacer()
                        StatPill(icon: "dollarsign.circle.fill", value: "\(store.save.player.coins)")
                        StatPill(icon: "star.fill", value: "Lv \(store.playerLevel)")
                    }
                    VStack(alignment: .leading, spacing: DS.Space.xs) {
                        HStack {
                            StatPill(icon: "calendar", value: "Day \(store.save.world.day)")
                            StatPill(icon: store.hudClockSymbol, value: store.hudTimeText)
                        }
                        HStack {
                            StatPill(icon: "leaf.fill", value: store.hudSeasonText)
                            StatPill(icon: "dollarsign.circle.fill", value: "\(store.save.player.coins)")
                            StatPill(icon: "star.fill", value: "Lv \(store.playerLevel)")
                        }
                    }
                }

                ProgressView(value: Double(store.save.player.xp % ProgressionSystem.xpPerLevel), total: Double(ProgressionSystem.xpPerLevel))
                    .tint(DS.Color.xp)
                    .accessibilityLabel("Level progress")
                    .background(Color.black.opacity(0.3))
                    .clipShape(Capsule())

                ProgressView(value: store.hudTimeProgress, total: 1)
                    .tint(DS.Color.money)
                    .accessibilityLabel("Time of day")
                    .background(Color.black.opacity(0.3))
                    .clipShape(Capsule())
            }
        }
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
            Button("Gather Crops") {
                store.harvestAll()
            }
            .buttonStyle(WoodActionStyle(tint: DS.Color.money))
            .disabled(store.readyTileCount == 0)
            .accessibilityLabel("Gather all ready crops")
            .lineLimit(1)

            #if DEBUG
            Button("Fast-forward Day") {
                store.advanceDays(1)
            }
            .buttonStyle(WoodActionStyle(tint: DS.Color.xp))
            .lineLimit(1)
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
}

// MARK: - AtmosphereOverlayView

/// Separate view for atmosphere overlay to isolate re-renders
private struct AtmosphereOverlayView: View {
    let timeProgress: Double
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
        
        return LinearGradient(
            colors: [topColor, .clear, bottomColor],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
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

