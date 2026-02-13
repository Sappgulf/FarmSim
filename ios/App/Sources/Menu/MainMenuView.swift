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
                SpriteView(
                    scene: sceneHolder.scene,
                    options: [.ignoresSiblingOrder]
                )
                .ignoresSafeArea()

                LinearGradient(
                    colors: [
                        .black.opacity(0.12),
                        .black.opacity(0.32),
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: DS.Space.lg) {
                    Spacer(minLength: max(proxy.safeAreaInsets.top + DS.Space.lg, 52))

                    titlePanel
                        .padding(.horizontal, DS.Space.lg)

                    Spacer()

                    CardContainer {
                        MenuButtonsView(
                            hasSave: hasSave,
                            isBusy: isBusy,
                            onPrimaryAction: onPrimaryAction,
                            onNewGameAction: { confirmNewGame = true },
                            onSettingsAction: onSettingsAction,
                            onCreditsAction: onCreditsAction
                        )
                    }
                    .padding(.horizontal, DS.Space.lg)
                    .padding(.bottom, max(proxy.safeAreaInsets.bottom + DS.Space.sm, DS.Space.lg))
                }

                #if DEBUG
                VStack {
                    HStack {
                        Spacer()
                        Text("Nodes: \(sceneHolder.scene.debugNodeCount)")
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(.white.opacity(0.8))
                            .padding(.horizontal, DS.Space.sm)
                            .padding(.vertical, DS.Space.xs)
                            .background(.black.opacity(0.35), in: Capsule())
                            .padding(.top, proxy.safeAreaInsets.top + 8)
                            .padding(.trailing, DS.Space.md)
                    }
                    Spacer()
                }
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

    private var titlePanel: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text(title)
                .font(.system(.largeTitle, design: .rounded).weight(.bold))
                .foregroundStyle(DS.Color.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .accessibilityLabel("Game title \(title)")

            if let tagline, !tagline.isEmpty {
                Text(tagline)
                    .font(Typography.body)
                    .foregroundStyle(DS.Color.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityLabel(tagline)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(DS.Space.md)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .fill(.ultraThinMaterial.opacity(colorSchemeContrast == .increased ? 0.95 : 0.8))
        )
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .stroke(.white.opacity(0.22), lineWidth: 0.6)
        )
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
                CardContainer {
                    VStack(alignment: .leading, spacing: DS.Space.md) {
                        Text(appTitle)
                            .font(Typography.title)
                            .foregroundStyle(DS.Color.textPrimary)

                        Text("Crafted with SwiftUI, SpriteKit, and GameCore.")
                            .font(Typography.body)
                            .foregroundStyle(DS.Color.textSecondary)

                        Divider().opacity(0.3)

                        Text("Thanks for playing and helping shape the farm.")
                            .font(Typography.body)
                            .foregroundStyle(DS.Color.textSecondary)

                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            Label("Design & Product", systemImage: "paintpalette.fill")
                            Label("Game Systems", systemImage: "leaf.fill")
                            Label("Engineering", systemImage: "hammer.fill")
                        }
                        .font(Typography.bodyStrong)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(DS.Space.lg)
            }
            .navigationTitle("Credits")
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
