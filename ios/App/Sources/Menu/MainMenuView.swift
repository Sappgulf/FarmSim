import SwiftUI
import SpriteKit
import GameCore

struct MainMenuView: View {
    @Bindable var appState: AppState
    @Bindable var store: GameStore

    let onContinue: () -> Void
    let onNewGame: () -> Void

    @StateObject private var sceneHolder = HomesteadMenuSceneHolder()
    @State private var showSettings = false
    @State private var showCredits = false
    @State private var confirmNewGame = false
    @State private var titleAppeared = false
    @State private var buttonsAppeared = false

    private var hasSave: Bool {
        FileManager.default.fileExists(
            atPath: GameCore.SavePaths.defaultSaveURL(appName: "FarmSim").path
        )
    }

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                SpriteView(
                    scene: sceneHolder.scene,
                    options: [.ignoresSiblingOrder]
                )
                .ignoresSafeArea()

                // Bottom gradient for contrast
                VStack {
                    Spacer()
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.45)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: proxy.size.height * 0.5)
                    .allowsHitTesting(false)
                }
                .ignoresSafeArea()

                VStack {
                    Spacer()

                    // Title
                    VStack(spacing: DS.Space.xs) {
                        Text("FarmSim")
                            .font(Typography.display)
                            .foregroundStyle(.white)
                            .shadow(color: DS.Color.money.opacity(0.55), radius: 18, x: 0, y: 4)
                            .shadow(color: .black.opacity(0.25), radius: 4, x: 0, y: 2)
                            .scaleEffect(titleAppeared ? 1.0 : 0.88)
                            .opacity(titleAppeared ? 1.0 : 0)

                        Text("Grow your homestead")
                            .font(Typography.section)
                            .foregroundStyle(.white.opacity(0.8))
                            .scaleEffect(titleAppeared ? 1.0 : 0.95)
                            .opacity(titleAppeared ? 1.0 : 0)
                    }
                    .padding(.bottom, DS.Space.lg)

                    // Buttons
                    VStack(spacing: DS.Space.sm) {
                        MenuButtonsView(
                            hasSave: hasSave,
                            isBusy: false,
                            onPrimaryAction: onContinue,
                            onNewGameAction: { confirmNewGame = true },
                            onSettingsAction: { appState.showingMenuSettings = true },
                            onCreditsAction: { showCredits = true }
                        )
                    }
                    .padding(.horizontal, DS.Space.xl)
                    .padding(.bottom, DS.Space.xl)
                    .offset(y: buttonsAppeared ? 0 : 30)
                    .opacity(buttonsAppeared ? 1.0 : 0)
                }
                .padding(.bottom, proxy.safeAreaInsets.bottom > 0 ? 0 : DS.Space.md)
            }
            .onAppear {
                sceneHolder.resize(proxy.size)
                withAnimation(.spring(response: 0.7, dampingFraction: 0.65).delay(0.15)) {
                    titleAppeared = true
                }
                withAnimation(.easeOut(duration: 0.5).delay(0.35)) {
                    buttonsAppeared = true
                }
            }
            .onChange(of: proxy.size) { _, newSize in
                sceneHolder.resize(newSize)
            }
        }
        .alert("Start a New Farm?", isPresented: $confirmNewGame) {
            Button("New Farm", role: .destructive) {
                onNewGame()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Your current progress will be erased.")
        }
        .sheet(isPresented: $showCredits) {
            CreditsView()
        }
    }
}

final class HomesteadMenuSceneHolder: ObservableObject {
    let scene: HomesteadMenuScene

    init() {
        let s = HomesteadMenuScene(size: CGSize(width: 1200, height: 800))
        s.scaleMode = .aspectFill
        scene = s
    }

    func resize(_ viewSize: CGSize) {
        let scale: CGFloat = 1.5
        scene.size = CGSize(width: viewSize.width * scale, height: viewSize.height * scale)
    }
}

struct CreditsView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.lg) {
                    SectionHeader("Credits")

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            creditRow("Design & Code", value: "Austin Beatty")
                            creditRow("Art Direction", value: "Vector-first, SpriteKit pipeline")
                            creditRow("Game Engine", value: "GameCore · Swift 5.10")
                            creditRow("UI Framework", value: "SwiftUI · SpriteKit")
                            creditRow("Minimum OS", value: "iOS 17.0")
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            Text("Technology")
                                .font(Typography.section)
                            Text("Built with Swift, SpriteKit for rendering, SwiftUI for interface, and custom GameCore for simulation. Vector-first art pipeline rasterized into sprites for maximum performance.")
                                .font(Typography.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(DS.Space.md)
            }
            .farmBackground(palette: .meadow)
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
            Text(label)
                .font(Typography.bodyStrong)
            Spacer()
            Text(value)
                .font(Typography.caption)
                .foregroundStyle(.secondary)
        }
    }
}
