import SwiftUI
import GameCore

// MARK: - FishingSection

/// Polished fishing section: pond status, interactive mini-game, stats, pond upgrade.
struct FishingSection: View {
    @Bindable var store: GameStore

    // MARK: Mini-game State
    private enum FishPhase: Equatable {
        case idle
        case casting
        case minigame
        case result(Bool, String) // caught, message
    }

    @State private var phase: FishPhase = .idle
    @State private var fishPos: Double = 0.5
    @State private var fishVel: Double = 0.15
    @State private var playerPos: Double = 0.5
    @State private var progress: Double = 0
    @State private var tension: Double = 0
    @State private var elapsed: Double = 0
    @State private var fishPhaseAngle: Double = 0
    @State private var currentFish: FishTypePlan? = nil
    @State private var tickTask: Task<Void, Never>? = nil
    @State private var castTask: Task<Void, Never>? = nil
    @State private var resultTask: Task<Void, Never>? = nil

    private let timeLimit: Double = 14.0
    private var pond: PondUpgradePlan { store.currentPondUpgrade }
    private var zoneWidth: Double { max(0.10, 0.19 - Double(currentFish?.difficulty ?? 1) * 0.016) }

    var body: some View {
        VStack(spacing: DS.Space.md) {
            pondHeaderCard
            switch phase {
            case .idle:
                castCard
            case .casting:
                castingAnimationCard
            case .minigame:
                if let fish = currentFish {
                    minigameCard(fish: fish)
                }
            case .result(let caught, let msg):
                resultCard(caught: caught, message: msg)
            }
            statsCard
            if store.nextPondUpgrade != nil {
                upgradeCard
            }
        }
    }

    // MARK: - Pond Header

    private var pondHeaderCard: some View {
        WoodenPanel {
            HStack(spacing: DS.Space.sm) {
                // Pond icon with animated ripple
                ZStack {
                    Circle()
                        .fill(Color(red: 0.22, green: 0.55, blue: 0.78).opacity(0.18))
                        .frame(width: 52, height: 52)
                    Text("🎣")
                        .font(.system(size: 28))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(pond.name)
                        .font(Typography.label)
                        .foregroundStyle(.primary)
                    Text("Rarity Bonus ×\(String(format: "%.1f", pond.rarityBonus))")
                        .font(Typography.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(store.totalFishCaught)")
                        .font(Typography.title)
                        .foregroundStyle(DS.Color.accent)
                    Text("total caught")
                        .font(Typography.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    // MARK: - Cast Card (idle)

    private var castCard: some View {
        WoodenPanel {
            VStack(spacing: DS.Space.md) {
                PondWaterBackground()
                    .frame(height: 120)
                    .clipShape(RoundedRectangle(cornerRadius: DS.Radius.md))

                Button {
                    startCast()
                } label: {
                    HStack(spacing: DS.Space.xs) {
                        Text("🎣")
                        Text("Cast Line")
                            .font(Typography.label)
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .accessibilityLabel("Cast line")
                .accessibilityHint("Start a fishing attempt")
            }
        }
    }

    // MARK: - Casting Animation (brief pause)

    private var castingAnimationCard: some View {
        WoodenPanel {
            VStack(spacing: DS.Space.sm) {
                PondWaterBackground()
                    .frame(height: 100)
                    .clipShape(RoundedRectangle(cornerRadius: DS.Radius.md))
                    .overlay(
                        Text("🎣")
                            .font(.system(size: 32))
                            .shadow(color: .white.opacity(0.6), radius: 4)
                            .transition(.scale)
                    )
                Text("Casting…")
                    .font(Typography.label)
                    .foregroundStyle(.secondary)
                ProgressView()
                    .tint(DS.Color.accent)
            }
        }
    }

    // MARK: - Mini-Game Card

    @ViewBuilder
    private func minigameCard(fish: FishTypePlan) -> some View {
        WoodenPanel {
            VStack(spacing: DS.Space.sm) {
                // Title row
                HStack {
                    Text("\(fish.icon) \(fish.name) on the line!")
                        .font(Typography.label)
                    Spacer()
                    Text(timeText)
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(elapsed > timeLimit * 0.75 ? .red : .secondary)
                }

                // Tension bar
                VStack(alignment: .leading, spacing: 2) {
                    Text("Line Tension")
                        .font(Typography.caption)
                        .foregroundStyle(.secondary)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color(red: 0.2, green: 0.1, blue: 0.05).opacity(0.12))
                            RoundedRectangle(cornerRadius: 4)
                                .fill(tensionColor)
                                .frame(width: geo.size.width * tension)
                                .animation(.linear(duration: 0.1), value: tension)
                        }
                    }
                    .frame(height: 8)
                }

                // Pond track
                pondTrack(fish: fish)
                    .frame(height: 72)

                // Progress bar
                VStack(alignment: .leading, spacing: 2) {
                    Text("Reel Progress")
                        .font(Typography.caption)
                        .foregroundStyle(.secondary)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color(red: 0.2, green: 0.1, blue: 0.05).opacity(0.12))
                            RoundedRectangle(cornerRadius: 4)
                                .fill(DS.Color.accent)
                                .frame(width: geo.size.width * progress)
                                .animation(.linear(duration: 0.05), value: progress)
                        }
                    }
                    .frame(height: 8)
                }

                // Controls
                HStack(spacing: DS.Space.md) {
                    Button { movePlayer(-0.08) } label: {
                        Image(systemName: "arrow.left.circle.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(DS.Color.accent)
                    }
                    .buttonRepeatBehavior(.enabled)
                    .accessibilityLabel("Move hook left")
                    .accessibilityHint("Slide the hook toward the left side of the pond")

                    VStack(spacing: 2) {
                        Text("DRAG TRACK")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(.secondary)
                        Text("or use arrows")
                            .font(.system(size: 9))
                            .foregroundStyle(.tertiary)
                    }
                    .frame(maxWidth: .infinity)

                    Button { movePlayer(0.08) } label: {
                        Image(systemName: "arrow.right.circle.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(DS.Color.accent)
                    }
                    .buttonRepeatBehavior(.enabled)
                    .accessibilityLabel("Move hook right")
                    .accessibilityHint("Slide the hook toward the right side of the pond")
                }
            }
        }
    }

    @ViewBuilder
    private func pondTrack(fish: FishTypePlan) -> some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let fishX = fishPos * w
            let playerX = playerPos * w
            let zonePixels = zoneWidth * w

            ZStack {
                // Water background
                RoundedRectangle(cornerRadius: DS.Radius.sm)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.18, green: 0.46, blue: 0.72),
                                Color(red: 0.12, green: 0.32, blue: 0.58)
                            ],
                            startPoint: .top, endPoint: .bottom
                        )
                    )

                // Catch zone highlight (around fish)
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.white.opacity(0.15))
                    .frame(width: zonePixels * 2, height: h * 0.6)
                    .position(x: fishX, y: h * 0.5)
                    .animation(.linear(duration: 0.05), value: fishPos)

                // Fish emoji
                Text(fish.icon)
                    .font(.system(size: 24))
                    .shadow(color: .black.opacity(0.3), radius: 2)
                    .position(x: fishX, y: h * 0.42)
                    .animation(.linear(duration: 0.05), value: fishPos)

                // Player hook
                Text("🪝")
                    .font(.system(size: 20))
                    .position(x: playerX, y: h * 0.65)
                    .animation(.linear(duration: 0.08), value: playerPos)
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { val in
                        let clamped = max(0, min(1, val.location.x / w))
                        playerPos = clamped
                    }
            )
            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.sm))
        }
    }

    // MARK: - Result Card

    @ViewBuilder
    private func resultCard(caught: Bool, message: String) -> some View {
        WoodenPanel {
            VStack(spacing: DS.Space.sm) {
                Text(caught ? "🎉" : "😔")
                    .font(.system(size: 48))
                Text(message)
                    .font(Typography.label)
                    .multilineTextAlignment(.center)
                Button("Cast Again 🎣") {
                    withAnimation(DS.Animation.standard) { phase = .idle }
                }
                .buttonStyle(PrimaryButtonStyle())
                .accessibilityHint("Return to the pond and try again")
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Stats Card

    private var statsCard: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                Text("Catch Log")
                    .font(Typography.label)

                let caughtFishList = store.fishPlans.filter { store.fishCaughtCount(for: $0.id) > 0 }

                if caughtFishList.isEmpty {
                    HStack {
                        Text("☞")
                            .font(.system(size: 18))
                            .foregroundStyle(.secondary)
                        Text("No fish caught yet. Cast your line!")
                            .font(Typography.caption)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    LazyVGrid(
                        columns: [GridItem(.flexible()), GridItem(.flexible())],
                        spacing: DS.Space.xs
                    ) {
                        ForEach(store.fishPlans) { fish in
                            let count = store.fishCaughtCount(for: fish.id)
                            if count > 0 {
                                HStack(spacing: DS.Space.xs) {
                                    Text(fish.icon)
                                    VStack(alignment: .leading, spacing: 0) {
                                        Text(fish.name)
                                            .font(Typography.caption)
                                        Text("×\(count)")
                                            .font(.system(size: 11))
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                }
                                .padding(.horizontal, DS.Space.xs)
                                .padding(.vertical, 4)
                                .background(
                                    RoundedRectangle(cornerRadius: DS.Radius.sm)
                                        .fill(Color(red: 0.97, green: 0.93, blue: 0.84).opacity(0.6))
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Upgrade Card

    private var upgradeCard: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                if let next = store.nextPondUpgrade {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Upgrade Pond")
                                .font(Typography.label)
                            Text(next.name)
                                .font(Typography.caption)
                                .foregroundStyle(.secondary)
                            Text("Capacity \(next.capacity) · Rarity ×\(String(format: "%.1f", next.rarityBonus))")
                                .font(.system(size: 11))
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button {
                            store.upgradePond()
                            SoundManager.shared.play(.levelUp, haptic: .medium)
                        } label: {
                            Text("\(next.cost) 🪙")
                                .font(Typography.label)
                        }
                        .buttonStyle(PrimaryButtonStyle())
                        .disabled(store.save.player.coins < next.cost)
                        .opacity(store.save.player.coins < next.cost ? 0.5 : 1)
                        .accessibilityLabel("Upgrade pond")
                        .accessibilityHint("Spend coins to increase fishing capacity")
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private var timeText: String {
        let remaining = max(0, timeLimit - elapsed)
        return String(format: "%.1fs", remaining)
    }

    private var tensionColor: Color {
        if tension < 0.4 { return Color(red: 0.27, green: 0.56, blue: 0.24) }
        if tension < 0.7 { return Color(red: 0.95, green: 0.72, blue: 0.22) }
        return Color(red: 0.85, green: 0.22, blue: 0.18)
    }

    private func movePlayer(_ delta: Double) {
        playerPos = max(0, min(1, playerPos + delta))
    }

    // MARK: - Game Logic

    private func startCast() {
        SoundManager.shared.play(.plant, haptic: .light)
        withAnimation(DS.Animation.standard) { phase = .casting }
        castTask = Task {
            try? await Task.sleep(for: .seconds(1.2))
            guard !Task.isCancelled else { return }
            await MainActor.run { beginMinigame() }
        }
    }

    private func beginMinigame() {
        // Pick a random fish from catalog using weighted rarity
        let rarityBonus = max(1.0, pond.rarityBonus)
        var totalWeight = 0.0
        for fish in store.fishPlans {
            let adjusted = fish.rarity <= 0.1 ? fish.rarity * rarityBonus : fish.rarity
            totalWeight += max(0.0001, adjusted)
        }

        var cursor = Double.random(in: 0...1) * totalWeight
        var chosen = store.fishPlans[0]
        for fish in store.fishPlans {
            let adjusted = fish.rarity <= 0.1 ? fish.rarity * rarityBonus : fish.rarity
            cursor -= max(0.0001, adjusted)
            if cursor <= 0 { chosen = fish; break }
        }

        currentFish = chosen
        fishPos = Double.random(in: 0.2...0.8)
        fishVel = Double.random(in: -0.2...0.2)
        playerPos = 0.5
        progress = 0
        tension = 0
        elapsed = 0
        fishPhaseAngle = 0

        withAnimation(DS.Animation.standard) { phase = .minigame }
        SoundManager.shared.play(.water, haptic: .light)

        tickTask?.cancel()
        tickTask = Task {
            let ns = UInt64(1_000_000_000 / 30) // 30 fps
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: ns)
                await MainActor.run { tickMinigame() }
            }
        }
    }

    private func tickMinigame() {
        guard case .minigame = phase else { tickTask?.cancel(); return }
        let dt = 1.0 / 30.0
        elapsed += dt
        fishPhaseAngle += dt

        // Fish movement
        let drift = sin(fishPhaseAngle * 1.4 + Double(currentFish?.difficulty ?? 1)) * 0.22
        fishVel += drift * dt
        if Double.random(in: 0...1) < 0.038 {
            fishVel += Double.random(in: -1...1) * (0.28 + Double(currentFish?.difficulty ?? 1) * 0.06)
        }
        let maxSpeed = 0.42 + Double(currentFish?.difficulty ?? 1) * 0.10
        fishVel = max(-maxSpeed, min(maxSpeed, fishVel))
        fishPos += fishVel * dt
        if fishPos < 0 { fishPos = 0; fishVel = abs(fishVel) * 0.7 }
        if fishPos > 1 { fishPos = 1; fishVel = -abs(fishVel) * 0.7 }

        // Zone check
        let dist = abs(playerPos - fishPos)
        let inZone = dist < zoneWidth
        let diff = Double(currentFish?.difficulty ?? 1)

        if inZone {
            progress = min(1, progress + dt * (0.16 + diff * 0.03) * (1.5 - dist / zoneWidth))
            tension = max(0, tension - dt * 0.22)
        } else {
            let pressure = min(2.5, dist / max(0.001, zoneWidth))
            progress = max(0, progress - dt * (0.10 + diff * 0.025) * pressure)
            tension = min(1, tension + dt * (0.12 + diff * 0.08) * pressure)
        }

        // Terminal conditions
        if tension >= 1 {
            endMinigame(caught: false, reason: "line_snap")
        } else if elapsed >= timeLimit {
            endMinigame(caught: false, reason: "timeout")
        } else if progress >= 1 {
            endMinigame(caught: true, reason: "")
        }
    }

    private func endMinigame(caught: Bool, reason: String) {
        tickTask?.cancel()
        tickTask = nil

        let message: String
        if caught, currentFish != nil {
            store.castFishingLine()  // GameStore handles reward + XP + fish count
            let lastStatus = store.statusText
            SoundManager.shared.play(.harvest, haptic: .medium)
            message = lastStatus
        } else {
            let reasonLabel: String
            switch reason {
            case "line_snap": reasonLabel = "The line snapped!"
            case "timeout":   reasonLabel = "The fish tired you out!"
            default:          reasonLabel = "The fish got away!"
            }
            SoundManager.shared.play(.error, haptic: .light)
            message = "\(currentFish?.icon ?? "🐟") \(reasonLabel)"
        }

        withAnimation(DS.Animation.standard) {
            phase = .result(caught, message)
        }

        // Auto-return to idle after 4 seconds
        resultTask = Task {
            try? await Task.sleep(for: .seconds(4))
            await MainActor.run {
                withAnimation(DS.Animation.standard) { phase = .idle }
            }
        }
    }
}

// MARK: - PondWaterBackground

private struct PondWaterBackground: View {
    @State private var animate = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.24, green: 0.58, blue: 0.80),
                    Color(red: 0.14, green: 0.36, blue: 0.62),
                ],
                startPoint: .top, endPoint: .bottom
            )

            // Lily pads and ripples via Canvas
            Canvas { ctx, size in
                let pads: [(x: Double, y: Double, r: Double)] = [
                    (0.12, 0.55, 14), (0.48, 0.70, 10), (0.78, 0.45, 12),
                    (0.32, 0.35, 8),  (0.88, 0.68, 11), (0.62, 0.25, 9)
                ]
                for pad in pads {
                    let cx = pad.x * size.width
                    let cy = pad.y * size.height
                    let r = pad.r

                    // Lily pad circle
                    let padPath = Path(ellipseIn: CGRect(x: cx - r, y: cy - r, width: r * 2, height: r * 2))
                    ctx.fill(padPath, with: .color(Color(red: 0.22, green: 0.52, blue: 0.22).opacity(0.75)))
                    ctx.stroke(padPath, with: .color(Color(red: 0.18, green: 0.44, blue: 0.18).opacity(0.5)), lineWidth: 0.8)

                    // Ripple ring
                    let ripplePath = Path(ellipseIn: CGRect(x: cx - r * 1.8, y: cy - r * 0.7, width: r * 3.6, height: r * 1.4))
                    ctx.stroke(ripplePath, with: .color(Color.white.opacity(0.18)), lineWidth: 1)
                }

                // Sparkle dots
                let sparkles: [(x: Double, y: Double)] = [
                    (0.22, 0.20), (0.55, 0.15), (0.70, 0.55), (0.38, 0.60), (0.90, 0.30)
                ]
                for s in sparkles {
                    let sx = s.x * size.width
                    let sy = s.y * size.height
                    let sr: Double = 2
                    let sp = Path(ellipseIn: CGRect(x: sx - sr, y: sy - sr, width: sr * 2, height: sr * 2))
                    ctx.fill(sp, with: .color(Color.white.opacity(0.55)))
                }
            }
            .drawingGroup()

            // Floating emojis
            VStack {
                HStack {
                    Text("🐸").font(.system(size: 14)).padding(8)
                    Spacer()
                    Text("🌿").font(.system(size: 12)).padding(8)
                }
                Spacer()
                HStack {
                    Spacer()
                    Text("🪷").font(.system(size: 16)).padding(8)
                }
            }
        }
    }
}
