import SwiftUI
import GameCore

// MARK: - MainMenuView

struct MainMenuView: View {
    @Environment(\.accessibilityReduceMotion) private var accessibilityReduceMotion

    @Bindable var appState: AppState
    @Bindable var store: GameStore

    let onContinue: () -> Void
    let onNewGame: () -> Void

    @State private var showCredits = false
    @State private var confirmNewGame = false
    @State private var titleAppeared = false
    @State private var buttonsAppeared = false
    @State private var bgScale = 1.0
    @State private var glowPulse = false
    @State private var subtitleAppeared = false

    private var reducedMotion: Bool {
        accessibilityReduceMotion || store.settings.reducedMotion
    }

    private var hasSave: Bool {
        FileManager.default.fileExists(
            atPath: GameCore.SavePaths.defaultSaveURL(appName: "FarmSim").path
        )
    }

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                backgroundLayer(proxy: proxy)
                AmbientParticleLayer(size: proxy.size, reducedMotion: reducedMotion)
                    .allowsHitTesting(false)

                VStack(spacing: 0) {
                    settingsButton
                    Spacer()
                    titleBlock
                    Spacer()
                    menuButtons
                    versionLabel
                }
            }
        }
        .onAppear { runEntranceSequence() }
        .alert("Start a New Farm?", isPresented: $confirmNewGame) {
            Button("New Farm", role: .destructive) { onNewGame() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Your current progress will be erased.")
        }
        .sheet(isPresented: $showCredits) {
            CreditsView()
        }
    }

    // MARK: - Sub-views

    private func backgroundLayer(proxy: GeometryProxy) -> some View {
        ZStack {
            Image("menu_bg")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: proxy.size.width, height: proxy.size.height)
                .scaleEffect(bgScale)
                .ignoresSafeArea()
                .onAppear {
                    guard !reducedMotion else { return }
                    withAnimation(.easeInOut(duration: 22).repeatForever(autoreverses: true)) {
                        bgScale = 1.06
                    }
                }

            LinearGradient(
                stops: [
                    .init(color: .black.opacity(0.18), location: 0),
                    .init(color: .clear, location: 0.35),
                    .init(color: .clear, location: 0.55),
                    .init(color: .black.opacity(0.52), location: 1),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        }
    }

    private var settingsButton: some View {
        HStack {
            Spacer()
            Button {
                SoundManager.shared.play(.click, haptic: .light)
                appState.showingMenuSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.title3)
                    .foregroundStyle(.white.opacity(0.88))
                    .padding(DS.Space.sm)
                    .background(.ultraThinMaterial, in: Circle())
                    .shadow(color: .black.opacity(0.25), radius: 6, x: 0, y: 2)
            }
            .padding(DS.Space.md)
            .accessibilityLabel("Open settings")
            .accessibilityHint("Adjust game settings and accessibility options")
        }
    }

    private var titleBlock: some View {
        VStack(spacing: 6) {
            ZStack {
                // Soft glow bloom behind title
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color(red: 0.95, green: 0.80, blue: 0.45).opacity(glowPulse ? 0.30 : 0.10),
                                .clear
                            ],
                            center: .center,
                            startRadius: 0,
                            endRadius: 155
                        )
                    )
                    .frame(width: 310, height: 220)
                    .animation(
                        reducedMotion ? nil : .easeInOut(duration: 2.8).repeatForever(autoreverses: true),
                        value: glowPulse
                    )

                // Layered title letters (depth illusion)
                ZStack {
                    Text("FARM SIM")
                        .font(.system(size: 82, weight: .black, design: .rounded))
                        .foregroundStyle(Color(red: 0.28, green: 0.14, blue: 0.04))
                        .offset(y: 6)

                    Text("FARM SIM")
                        .font(.system(size: 82, weight: .black, design: .rounded))
                        .foregroundStyle(Color(red: 0.44, green: 0.24, blue: 0.09))
                        .offset(y: 3)

                    Text("FARM SIM")
                        .font(.system(size: 82, weight: .black, design: .rounded))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.97, green: 0.84, blue: 0.54),
                                    Color(red: 0.78, green: 0.52, blue: 0.24)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .shadow(color: Color(red: 0.25, green: 0.12, blue: 0.04).opacity(0.7),
                                radius: 1, x: 0, y: 1)
                }
            }
            .scaleEffect(titleAppeared ? 1.0 : 0.78)
            .opacity(titleAppeared ? 1.0 : 0)

            Text("Cozy Living")
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundStyle(.white)
                .shadow(color: .black.opacity(0.55), radius: 5, x: 0, y: 2)
                .opacity(subtitleAppeared ? 1.0 : 0)
                .offset(y: subtitleAppeared ? 0 : 8)
        }
        .padding(.top, 20)
    }

    private var menuButtons: some View {
        MenuButtonsView(
            hasSave: hasSave,
            isBusy: false,
            onPrimaryAction: {
                SoundManager.shared.play(.click, haptic: .medium)
                onContinue()
            },
            onNewGameAction: {
                SoundManager.shared.play(.click, haptic: .light)
                confirmNewGame = true
            },
            onSettingsAction: {
                SoundManager.shared.play(.click, haptic: .light)
                appState.showingMenuSettings = true
            },
            onCreditsAction: {
                SoundManager.shared.play(.pageTurn, haptic: .light)
                showCredits = true
            }
        )
        .buttonStyle(WoodButtonStyle())
        .frame(maxWidth: 300)
        .padding(.bottom, 52)
        .scaleEffect(buttonsAppeared ? 1.0 : 0.88)
        .opacity(buttonsAppeared ? 1.0 : 0)
    }

    private var versionLabel: some View {
        Text("v1.0.0 · Swift 5.10")
            .font(Typography.small)
            .foregroundStyle(.white.opacity(0.38))
            .padding(.bottom, 14)
            .opacity(buttonsAppeared ? 1.0 : 0)
    }

    // MARK: - Entrance Sequence

    private func runEntranceSequence() {
        withAnimation(reducedMotion ? .easeOut(duration: 0.15) : DS.Animation.springBounce) {
            titleAppeared = true
        }
        withAnimation((reducedMotion ? .easeOut(duration: 0.15) : DS.Animation.standard).delay(reducedMotion ? 0.05 : 0.20)) {
            subtitleAppeared = true
        }
        withAnimation((reducedMotion ? .easeOut(duration: 0.15) : DS.Animation.springBounce).delay(reducedMotion ? 0.08 : 0.28)) {
            buttonsAppeared = true
        }
        guard !reducedMotion else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.55) {
            glowPulse = true
        }
    }
}

// MARK: - AmbientParticleLayer

/// Floating leaf/speck layer rendered in Canvas for zero per-frame view overhead.
private struct AmbientParticleLayer: View {
    let size: CGSize
    let reducedMotion: Bool

    private struct Particle {
        let xFrac: Double
        let yStartFrac: Double
        let speed: Double
        let driftAmp: Double
        let driftFreq: Double
        let fontSize: Double
        let opacity: Double
        let symbol: String
    }

    private let particles: [Particle] = (0..<14).map { i in
        let d = Double(i)
        return Particle(
            xFrac:      fmod(d * 0.618, 1.0),
            yStartFrac: fmod(d * 0.071, 1.0),
            speed:      0.016 + fmod(d * 0.013, 0.020),
            driftAmp:   11 + fmod(d * 7.1, 20),
            driftFreq:  0.38 + fmod(d * 0.18, 0.55),
            fontSize:   5 + fmod(d * 1.8, 8),
            opacity:    0.16 + fmod(d * 0.035, 0.20),
            symbol:     ["🍃", "🌿", "✦", "🍂", "·"][i % 5]
        )
    }

    var body: some View {
        Group {
            if reducedMotion {
                Color.clear
            } else {
                TimelineView(.periodic(from: .now, by: 1.0 / 30.0)) { tl in
                    Canvas { ctx, canvasSize in
                        let t = tl.date.timeIntervalSinceReferenceDate
                        for p in particles {
                            let rawY = canvasSize.height * p.yStartFrac
                                - t * p.speed * canvasSize.height
                            let y = rawY.truncatingRemainder(dividingBy: canvasSize.height + 50)
                            let yFinal = y < -30 ? y + canvasSize.height + 50 : y
                            let x = canvasSize.width * p.xFrac
                                + sin(t * p.driftFreq + p.xFrac * .pi * 2) * p.driftAmp

                            var str = AttributedString(p.symbol)
                            str.font = .system(size: p.fontSize)
                            ctx.opacity = p.opacity
                            ctx.draw(Text(str), at: CGPoint(x: x, y: yFinal))
                        }
                    }
                }
            }
        }
        .ignoresSafeArea()
    }
}

// MARK: - WoodButtonStyle

struct WoodButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 20, weight: .bold, design: .rounded))
            .foregroundStyle(Color(red: 0.22, green: 0.12, blue: 0.04))
            .padding(.vertical, 14)
            .frame(maxWidth: .infinity)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.96, green: 0.86, blue: 0.66),
                                    Color(red: 0.84, green: 0.68, blue: 0.46)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .strokeBorder(Color(red: 0.58, green: 0.42, blue: 0.22), lineWidth: 2)
                    RoundedRectangle(cornerRadius: DS.Radius.lg - 2, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.25), lineWidth: 1)
                        .padding(2)
                }
            }
            .shadow(color: .black.opacity(configuration.isPressed ? 0.08 : 0.20),
                    radius: configuration.isPressed ? 1 : 5,
                    x: 0, y: configuration.isPressed ? 1 : 3)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(DS.Animation.spring, value: configuration.isPressed)
    }
}

// MARK: - CreditsView

struct CreditsView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.lg) {
                    SectionHeader("Credits")
                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            creditRow("Design & Code",  value: "Austin Beatty")
                            creditRow("Art Direction",  value: "Cozy Farm Aesthetic")
                            creditRow("Game Engine",    value: "GameCore · Swift 5.10")
                            creditRow("UI Framework",   value: "SwiftUI · SpriteKit")
                            creditRow("Minimum OS",     value: "iOS 17.0")
                        }
                    }
                }
                .padding(DS.Space.md)
            }
            .background(Color(red: 0.97, green: 0.94, blue: 0.90))
            .navigationTitle("Credits")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func creditRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label).font(Typography.bodyStrong)
            Spacer()
            Text(value).font(Typography.caption).foregroundStyle(.secondary)
        }
    }
}
