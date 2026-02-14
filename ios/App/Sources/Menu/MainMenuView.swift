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

                // Cinematic Gradient Overlay
                LinearGradient(
                    colors: [
                        .black.opacity(0.1),
                        .black.opacity(0.3),
                        .black.opacity(0.7)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                HStack {
                    // Left Side: Title and Branding
                    VStack(alignment: .leading, spacing: DS.Space.md) {
                        Spacer()
                        
                        VStack(alignment: .leading, spacing: -8) {
                            Text("FARM")
                                .font(.system(size: 82, weight: .heavy, design: .rounded))
                                .foregroundStyle(.white)
                                .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 5)
                            
                            Text("SIM")
                                .font(.system(size: 82, weight: .black, design: .rounded))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [DS.Color.money, DS.Color.xp],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .shadow(color: DS.Color.money.opacity(0.5), radius: 20, x: 0, y: 10)
                        }
                        .scaleEffect(titleAppeared ? 1.0 : 0.9)
                        .opacity(titleAppeared ? 1.0 : 0)
                        
                        Text("Build your legacy.")
                            .font(Typography.section)
                            .foregroundStyle(.white.opacity(0.9))
                            .padding(.leading, 6)
                            .opacity(titleAppeared ? 1.0 : 0)
                        
                        Spacer()
                        Spacer()
                        
                        // Version / Copyright
                        Text("v1.0.0 · Swift 5.10 · GameCore")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.white.opacity(0.4))
                    }
                    .padding(.leading, DS.Space.xl * 1.5)
                    
                    Spacer()
                    
                    // Right Side: Menu Card
                    VStack {
                        Spacer()
                        
                        VStack(spacing: DS.Space.md) {
                            MenuButtonsView(
                                hasSave: hasSave,
                                isBusy: false,
                                onPrimaryAction: onContinue,
                                onNewGameAction: { confirmNewGame = true },
                                onSettingsAction: { appState.showingMenuSettings = true },
                                onCreditsAction: { showCredits = true }
                            )
                        }
                        .padding(DS.Space.xl)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .stroke(.white.opacity(0.15), lineWidth: 1)
                        )
                        .shadow(color: .black.opacity(0.25), radius: 30, x: 0, y: 15)
                        .frame(width: 360)
                        .offset(x: buttonsAppeared ? 0 : 50)
                        .opacity(buttonsAppeared ? 1.0 : 0)
                        
                        Spacer()
                    }
                    .padding(.trailing, DS.Space.xl * 1.5)
                }
            }
            .onAppear {
                sceneHolder.resize(proxy.size)
                withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                    titleAppeared = true
                }
                withAnimation(.spring(response: 0.8, dampingFraction: 0.75).delay(0.4)) {
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
