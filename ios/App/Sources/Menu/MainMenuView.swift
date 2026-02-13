import SwiftUI
import SpriteKit

struct MainMenuView: View {
    let title: String
    let tagline: String?
    let hasSave: Bool
    let isBusy: Bool
    let onPrimaryAction: () -> Void
    let onNewGameAction: () -> Void
    let onSettingsAction: () -> Void
    let onCreditsAction: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.colorSchemeContrast) private var colorSchemeContrast

    @StateObject private var sceneHolder = HomesteadMenuSceneHolder()
    @State private var confirmNewGame = false

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                // 1. Background Scene
                SpriteView(
                    scene: sceneHolder.scene,
                    options: [.ignoresSiblingOrder]
                )
                .ignoresSafeArea()

                // 2. Subtle Gradient for Text Readability (Top only)
                VStack {
                    LinearGradient(
                        colors: [.black.opacity(0.35), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 140)
                    .ignoresSafeArea()
                    
                    Spacer()
                }
                .allowsHitTesting(false)

                // 3. UI Layer (Minimal)
                VStack {
                    // Top Bar: Title & Settings
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(title)
                                .font(.system(size: 42, weight: .black, design: .rounded))
                                .foregroundStyle(.white)
                                .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 2)
                                .accessibilityLabel("Game title \(title)")

                            if let tagline, !tagline.isEmpty {
                                Text(tagline)
                                    .font(.system(size: 16, weight: .medium, design: .rounded))
                                    .foregroundStyle(.white.opacity(0.9))
                                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                                    .accessibilityLabel(tagline)
                            }
                        }
                        
                        Spacer()
                        
                        // Settings (Top Right)
                        Button(action: onSettingsAction) {
                            Image(systemName: "gearshape.fill")
                                .font(.title3)
                                .foregroundStyle(.white)
                                .padding(12)
                                .background(.ultraThinMaterial, in: Circle())
                                .shadow(radius: 4)
                        }
                        .accessibilityLabel("Settings")
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, max(proxy.safeAreaInsets.top, 20))

                    Spacer()

                    // Bottom: Play Button & Secondary Actions
                    HStack(alignment: .bottom) {
                        // Credits (Bottom Left)
                        Button(action: onCreditsAction) {
                            Image(systemName: "person.3.fill")
                                .font(.headline)
                                .foregroundStyle(.white.opacity(0.9))
                                .frame(width: 44, height: 44) // Target size
                                .background(.black.opacity(0.3), in: Circle())
                        }
                        .accessibilityLabel("Credits")
                        
                        Spacer()
                        
                        // Primary Play Button (Center)
                        Button(action: onPrimaryAction) {
                            HStack(spacing: 8) {
                                Image(systemName: hasSave ? "play.fill" : "sprout.fill")
                                Text(hasSave ? "Continue Farm" : "New Farm")
                                    .fontWeight(.bold)
                            }
                            .font(.title3)
                            .foregroundStyle(DS.Color.accent)
                            .padding(.vertical, 18) // Slightly taller
                            .padding(.horizontal, 36) // Slightly wider
                            .background(
                                Capsule()
                                    .fill(.white)
                                    .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 6) // Enhanced shadow
                            )
                        }
                        .accessibilityLabel(hasSave ? "Continue your farm" : "Start a new farm")
                        .disabled(isBusy)

                        Spacer()
                        
                        // New Game (Bottom Right)
                        if hasSave {
                            Button(action: { confirmNewGame = true }) {
                                Image(systemName: "arrow.counterclockwise")
                                    .font(.headline)
                                    .foregroundStyle(.white.opacity(0.9))
                                    .frame(width: 44, height: 44)
                                    .background(.black.opacity(0.3), in: Circle())
                            }
                            .accessibilityLabel("Start over")
                        } else {
                            // Balance layout
                            Color.clear.frame(width: 44, height: 44)
                        }
                    }
                    .padding(.horizontal, 32)
                    .padding(.bottom, max(proxy.safeAreaInsets.bottom, 24)) // Tighter to bottom
                }
                
                #if DEBUG
                VStack {
                    HStack {
                        Spacer()
                        Text("Nodes: \(sceneHolder.scene.debugNodeCount)")
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(.white.opacity(0.8))
                            .padding(6)
                            .background(.black.opacity(0.4), in: RoundedRectangle(cornerRadius: 4))
                    }
                    Spacer()
                }
                .padding(.top, proxy.safeAreaInsets.top + 60) // Below header
                .padding(.trailing, 20)
                .accessibilityHidden(true)
                #endif
            }
            .onAppear {
                sceneHolder.scene.setReducedMotion(reduceMotion)
            }
            .onChange(of: reduceMotion) { _, value in
                sceneHolder.scene.setReducedMotion(value)
            }
            .alert("Start a New Farm?", isPresented: $confirmNewGame) {
                Button("Start Fresh", role: .destructive) {
                    onNewGameAction()
                }
                Button("Keep Current Farm", role: .cancel) { }
            } message: {
                Text("Your existing progress will be replaced.")
            }
        }
    }
}

private final class HomesteadMenuSceneHolder: ObservableObject {
    let scene: HomesteadMenuScene

    init() {
        let scene = HomesteadMenuScene(size: CGSize(width: 1080, height: 1920))
        scene.scaleMode = .aspectFill
        self.scene = scene
    }
}

struct CreditsView: View {
    let appTitle: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Space.lg) {
                     // Logo / Title
                    VStack(spacing: DS.Space.xs) {
                        Image(systemName: "leaf.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(DS.Color.accent)
                            .padding(.bottom, DS.Space.xs)
                        
                        Text(appTitle)
                            .font(.system(.title, design: .rounded).weight(.bold))
                            .foregroundStyle(DS.Color.textPrimary)
                    }
                    .padding(.top, DS.Space.xl)

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.md) {
                            Text("Crafted with SwiftUI, SpriteKit, and GameCore.")
                                .font(Typography.body)
                                .foregroundStyle(DS.Color.textSecondary)

                            Divider().opacity(0.3)

                            Text("Thanks for playing and helping shape the farm.")
                                .font(Typography.body)
                                .foregroundStyle(DS.Color.textSecondary)

                            VStack(alignment: .leading, spacing: DS.Space.md) {
                                Label("Design & Product", systemImage: "paintpalette.fill")
                                Label("Game Systems", systemImage: "leaf.fill")
                                Label("Engineering", systemImage: "hammer.fill")
                            }
                            .font(Typography.bodyStrong)
                            .foregroundStyle(DS.Color.textPrimary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.horizontal, DS.Space.lg)
                }
            }
            .navigationTitle("Credits")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .farmBackground()
        }
    }
}
