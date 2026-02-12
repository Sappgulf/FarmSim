import SwiftUI
import SpriteKit

struct FarmView: View {
    var store: GameStore
    var onOpenShop: () -> Void = {}

    @State private var scene = FarmScene(size: CGSize(width: 1200, height: 1200))
    @State private var showDayBanner = false
    @State private var previousDay = 0
    @State private var hapticTrigger = 0
    @State private var harvestTrigger = 0
    @State private var showSettings = false
    @State private var toastMessage: String?
    @State private var coinDelta: Int = 0
    @State private var previousCoins = 0

    var body: some View {
        ZStack {
            // SpriteKit farm grid — full bleed
            SpriteView(scene: scene, options: [.ignoresSiblingOrder, .allowsTransparency])
                .ignoresSafeArea()

            // Bottom vignette
            VStack {
                Spacer()
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [.clear, Color.black.opacity(0.32)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(height: 280)
                    .allowsHitTesting(false)
            }
            .ignoresSafeArea()

            // HUD
            VStack(spacing: 0) {
                topBar
                    .padding(.horizontal, 14)
                    .padding(.top, 6)

                xpBar
                    .padding(.horizontal, 20)
                    .padding(.top, 6)

                Spacer()

                // Floating toast
                if let msg = toastMessage {
                    toastView(msg)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .padding(.bottom, 4)
                }

                seedTray
                    .padding(.horizontal, 10)

                actionBar
                    .padding(.horizontal, 14)
                    .padding(.top, 6)
                    .padding(.bottom, 6)
            }

            // Coin delta popup
            if coinDelta != 0 {
                coinDeltaView
                    .transition(.move(edge: .bottom).combined(with: .opacity).combined(with: .scale))
                    .allowsHitTesting(false)
            }

            // Day banner
            if showDayBanner {
                dayBanner
                    .transition(.scale(scale: 0.65).combined(with: .opacity))
            }
        }
        .onAppear {
            previousDay = store.save.world.day
            previousCoins = store.save.player.coins
            scene.onTileTapped = { index in
                store.handleTileTap(index: index)
                hapticTrigger += 1
            }
            scene.render(world: store.save.world, cropDefs: store.cropDefs, displayMap: store.cropDisplay)
        }
        .onChange(of: store.save) { _, newValue in
            scene.render(world: newValue.world, cropDefs: store.cropDefs, displayMap: store.cropDisplay)

            // Coin delta animation
            let delta = newValue.player.coins - previousCoins
            if delta != 0 {
                previousCoins = newValue.player.coins
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    coinDelta = delta
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    withAnimation(.easeOut(duration: 0.25)) { coinDelta = 0 }
                }
            }

            // Day banner
            if newValue.world.day != previousDay {
                previousDay = newValue.world.day
                withAnimation(.spring(response: 0.3, dampingFraction: 0.72)) {
                    showDayBanner = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.1) {
                    withAnimation(.easeOut(duration: 0.3)) { showDayBanner = false }
                }
            }
        }
        .onChange(of: store.statusText) { _, newText in
            showToast(newText)
        }
        .sheet(isPresented: $showSettings) {
            SettingsSheet(store: store)
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .sensoryFeedback(.impact(weight: .light), trigger: hapticTrigger)
        .sensoryFeedback(.success, trigger: harvestTrigger)
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack(spacing: 6) {
            // Day
            HStack(spacing: 4) {
                Image(systemName: "sun.max.fill")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.orange)
                Text("Day \(store.save.world.day)")
                    .font(.system(size: 14, weight: .heavy, design: .rounded))
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(Color.black.opacity(0.3), in: Capsule())

            Spacer()

            // Coins
            HStack(spacing: 4) {
                Image(systemName: "dollarsign.circle.fill")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(Theme.coinGold)
                Text("\(store.save.player.coins)")
                    .font(.system(size: 14, weight: .heavy, design: .rounded))
                    .foregroundStyle(.white)
                    .contentTransition(.numericText())
                    .animation(.snappy, value: store.save.player.coins)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(Color.black.opacity(0.3), in: Capsule())

            // Level
            HStack(spacing: 4) {
                Image(systemName: "star.fill")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(Theme.xpBlue)
                Text("Lv\(store.playerLevel)")
                    .font(.system(size: 13, weight: .heavy, design: .rounded))
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 9)
            .padding(.vertical, 7)
            .background(Color.black.opacity(0.3), in: Capsule())

            // Settings gear
            Button { showSettings = true } label: {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.white.opacity(0.7))
                    .padding(8)
                    .background(Color.black.opacity(0.3), in: Circle())
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 6)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .strokeBorder(Theme.cardStroke, lineWidth: 0.5)
        )
    }

    // MARK: - XP Bar

    private var xpBar: some View {
        let xp = store.save.player.xp
        let currentLevelXP = (store.playerLevel - 1) * 100
        let progress = Double(xp - currentLevelXP) / 100.0

        return HStack(spacing: 6) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.12))
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [Theme.xpBlue, Theme.xpBlue.opacity(0.7)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: max(0, geo.size.width * progress))
                        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: xp)
                }
            }
            .frame(height: 5)

            Text("\(xp % 100)/100")
                .font(.system(size: 9, weight: .bold, design: .monospaced))
                .foregroundStyle(.white.opacity(0.45))
        }
    }

    // MARK: - Toast

    private func toastView(_ message: String) -> some View {
        Text(message)
            .font(.system(size: 13, weight: .semibold, design: .rounded))
            .foregroundStyle(.white.opacity(0.95))
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().strokeBorder(Theme.cardStroke, lineWidth: 0.5))
    }

    private func showToast(_ message: String) {
        withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
            toastMessage = message
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation(.easeOut(duration: 0.2)) { toastMessage = nil }
        }
    }

    // MARK: - Coin Delta

    private var coinDeltaView: some View {
        Text(coinDelta > 0 ? "+\(coinDelta)" : "\(coinDelta)")
            .font(.system(size: 22, weight: .heavy, design: .rounded))
            .foregroundStyle(coinDelta > 0 ? Theme.coinGold : .red)
            .shadow(color: .black.opacity(0.4), radius: 4, y: 2)
            .offset(y: -120)
    }

    // MARK: - Seed Tray

    private var seedTray: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(store.cropDefs, id: \.id) { crop in
                    let selected = store.selectedSeedID == crop.id
                    let count = store.seedCount(for: crop.id)
                    let empty = count == 0

                    Button {
                        store.selectSeed(id: crop.id)
                    } label: {
                        VStack(spacing: 2) {
                            Text(store.emoji(for: crop.id))
                                .font(.system(size: 22))
                            Text("\(count)")
                                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                .foregroundStyle(
                                    empty ? .red.opacity(0.8) :
                                    selected ? .black.opacity(0.7) : .white.opacity(0.65)
                                )
                        }
                        .frame(width: 48, height: 48)
                        .background(
                            selected ? Color.white.opacity(0.90) : Color.white.opacity(0.12),
                            in: RoundedRectangle(cornerRadius: 13, style: .continuous)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 13, style: .continuous)
                                .strokeBorder(
                                    selected ? Theme.coinGold : Color.white.opacity(0.08),
                                    lineWidth: selected ? 2 : 0.5
                                )
                        )
                        .opacity(empty && !selected ? 0.5 : 1)
                        .scaleEffect(selected ? 1.08 : 1.0)
                        .animation(.spring(response: 0.22, dampingFraction: 0.7), value: selected)
                    }
                    .buttonStyle(.plain)
                }

                // Buy more button
                Button { onOpenShop() } label: {
                    VStack(spacing: 2) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundStyle(Theme.coinGold)
                        Text("Buy")
                            .font(.system(size: 9, weight: .bold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.6))
                    }
                    .frame(width: 48, height: 48)
                    .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 13, style: .continuous)
                            .strokeBorder(Theme.coinGold.opacity(0.3), lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 6)
        }
        .padding(.vertical, 6)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(Theme.cardStroke, lineWidth: 0.5)
        )
    }

    // MARK: - Action Bar

    private var actionBar: some View {
        HStack(spacing: 8) {
            Button {
                store.advanceDay()
            } label: {
                Label("Next Day", systemImage: "sunrise.fill")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 11)
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.22, green: 0.55, blue: 0.30))

            if store.readyTileCount > 0 {
                Button {
                    let count = store.harvestAll()
                    if count > 0 { harvestTrigger += 1 }
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: "basket.fill")
                            .font(.system(size: 13, weight: .bold))
                        Text("Harvest \(store.readyTileCount)")
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                    }
                    .padding(.vertical, 11)
                    .padding(.horizontal, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.coinGold)
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.8).combined(with: .opacity),
                    removal: .scale(scale: 0.9).combined(with: .opacity)
                ))
            }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.75), value: store.readyTileCount > 0)
    }

    // MARK: - Day Banner

    private var dayBanner: some View {
        VStack(spacing: 6) {
            Text("Day \(store.save.world.day)")
                .font(.system(size: 44, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)

            HStack(spacing: 16) {
                if store.readyTileCount > 0 {
                    Label("\(store.readyTileCount) ready", systemImage: "checkmark.circle.fill")
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .foregroundStyle(Theme.ready)
                }
                if store.plantedTileCount > 0 {
                    Label("\(store.plantedTileCount) growing", systemImage: "leaf.fill")
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
        }
        .padding(.horizontal, 36)
        .padding(.vertical, 20)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: .black.opacity(0.35), radius: 24, y: 10)
    }
}

// MARK: - Settings Sheet

struct SettingsSheet: View {
    var store: GameStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Farm Stats") {
                    statRow(label: "Day", value: "\(store.save.world.day)")
                    statRow(label: "Coins", value: "\(store.save.player.coins)")
                    statRow(label: "XP", value: "\(store.save.player.xp)")
                    statRow(label: "Level", value: "\(store.playerLevel)")
                    statRow(label: "Grid", value: "\(store.save.world.gridWidth)x\(store.save.world.gridHeight)")
                    statRow(label: "Planted", value: "\(store.plantedTileCount) / \(store.totalTileCount)")
                }

                Section("Crops Harvested") {
                    let harvested = store.cropDefs.filter { store.cropCount(for: $0.id) > 0 }
                    if harvested.isEmpty {
                        Text("No crops harvested yet")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(harvested, id: \.id) { crop in
                            HStack {
                                Text(store.emoji(for: crop.id))
                                Text(crop.name)
                                Spacer()
                                Text("\(store.cropCount(for: crop.id))")
                                    .font(.system(.body, design: .monospaced))
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }

                Section {
                    Button("Save Game") {
                        store.persistNow()
                        dismiss()
                    }
                }

                Section {
                    HStack {
                        Spacer()
                        Text("FarmSim v1.0")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Spacer()
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                }
            }
        }
    }

    private func statRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
    }
}
