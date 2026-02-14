import SwiftUI
import GameCore

struct MainMenuView: View {
    @Bindable var appState: AppState
    @Bindable var store: GameStore

    let onContinue: () -> Void
    let onNewGame: () -> Void

    @State private var showSettings = false
    @State private var showCredits = false
    @State private var confirmNewGame = false
    @State private var titleAppeared = false
    @State private var buttonsAppeared = false
    @State private var bgScale = 1.0

    private var hasSave: Bool {
        FileManager.default.fileExists(
            atPath: GameCore.SavePaths.defaultSaveURL(appName: "FarmSim").path
        )
    }

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                // Background Image
                Image("menu_bg")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: proxy.size.width, height: proxy.size.height)
                    .scaleEffect(bgScale)
                    .ignoresSafeArea()
                    .onAppear {
                        withAnimation(.easeInOut(duration: 20).repeatForever(autoreverses: true)) {
                            bgScale = 1.05
                        }
                    }

                // Gradient Overlay for readability
                LinearGradient(
                    colors: [
                        .black.opacity(0.1),
                        .clear,
                        .black.opacity(0.4)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack {
                    HStack {
                        Spacer()
                        Button {
                            appState.showingMenuSettings = true
                        } label: {
                            Image(systemName: "gearshape.fill")
                                .font(.title3)
                                .foregroundStyle(.white.opacity(0.8))
                                .padding(DS.Space.sm)
                                .background(.ultraThinMaterial, in: Circle())
                                .shadow(color: .black.opacity(0.2), radius: 4)
                        }
                        .padding(DS.Space.md)
                    }
                    
                    Spacer()
                    
                    // Title
                    VStack(spacing: -DS.Space.xs) {
                        ZStack {
                            // Bottom Shadow/Depth
                            Text("FARM SIM")
                                .font(.system(size: 82, weight: .black, design: .rounded))
                                .foregroundStyle(Color(red: 0.3, green: 0.15, blue: 0.05))
                                .offset(y: 6)
                            
                            // Middle Depth
                            Text("FARM SIM")
                                .font(.system(size: 82, weight: .black, design: .rounded))
                                .foregroundStyle(Color(red: 0.45, green: 0.25, blue: 0.1))
                                .offset(y: 3)

                            // Top Layer (Wood Gradient)
                            Text("FARM SIM")
                                .font(.system(size: 82, weight: .black, design: .rounded))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [
                                            Color(red: 0.95, green: 0.8, blue: 0.5),
                                            Color(red: 0.7, green: 0.45, blue: 0.2)
                                        ],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .shadow(color: Color(red: 0.25, green: 0.15, blue: 0.05).opacity(0.8), radius: 1, x: 0, y: 1)
                                .shadow(color: Color(red: 0.25, green: 0.15, blue: 0.05).opacity(0.8), radius: 1, x: 0, y: -1)
                                .shadow(color: Color(red: 0.25, green: 0.15, blue: 0.05).opacity(0.8), radius: 1, x: 1, y: 0)
                                .shadow(color: Color(red: 0.25, green: 0.15, blue: 0.05).opacity(0.8), radius: 1, x: -1, y: 0)
                        }
                        .scaleEffect(titleAppeared ? 1.0 : 0.8)
                        .opacity(titleAppeared ? 1.0 : 0)
                        
                        Text("Cozy Living")
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                            .padding(.top, DS.Space.sm)
                            .opacity(titleAppeared ? 1.0 : 0)
                    }
                    .padding(.top, 40)
                    
                    Spacer()

                    // Menu Buttons (No panel, just clean)
                    MenuButtonsView(
                        hasSave: hasSave,
                        isBusy: false,
                        onPrimaryAction: onContinue,
                        onNewGameAction: { confirmNewGame = true },
                        onSettingsAction: { appState.showingMenuSettings = true },
                        onCreditsAction: { showCredits = true }
                    )
                    .buttonStyle(WoodButtonStyle())
                    .frame(maxWidth: 300)
                    .padding(.bottom, 60)
                    .scaleEffect(buttonsAppeared ? 1.0 : 0.9)
                    .opacity(buttonsAppeared ? 1.0 : 0)
                    
                    Text("v1.0.0 · Swift 5.10")
                        .font(.caption.bold())
                        .foregroundStyle(.white.opacity(0.4))
                        .padding(.bottom, 12)
                }
            }
            .onAppear {
                withAnimation(.spring(response: 0.8, dampingFraction: 0.7)) {
                    titleAppeared = true
                }
                withAnimation(.spring(response: 0.8, dampingFraction: 0.75).delay(0.2)) {
                    buttonsAppeared = true
                }
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

// Custom Wood Button Style
struct WoodButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 20, weight: .bold, design: .rounded))
            .foregroundStyle(Color(red: 0.25, green: 0.15, blue: 0.05))
            .padding(.vertical, 14)
            .frame(maxWidth: .infinity)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.95, green: 0.85, blue: 0.65), // Light wood
                                    Color(red: 0.85, green: 0.70, blue: 0.50)  // Darker wood
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(red: 0.60, green: 0.45, blue: 0.25), lineWidth: 2)
                        .opacity(0.6)
                }
            )
            .shadow(color: .black.opacity(0.15), radius: 2, x: 0, y: 2)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
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
                            creditRow("Art Direction", value: "Cozy Farm Aesthetic")
                            creditRow("Game Engine", value: "GameCore · Swift 5.10")
                            creditRow("UI Framework", value: "SwiftUI · SpriteKit")
                            creditRow("Minimum OS", value: "iOS 17.0")
                        }
                    }
                }
                .padding(DS.Space.md)
            }
            .background(Color(red: 0.98, green: 0.96, blue: 0.92)) // Cream background
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

extension Shape {
    func strokeBorder(_ content: some ShapeStyle, uniqueWidth: CGFloat = 1) -> some View {
        self.stroke(content, lineWidth: uniqueWidth)
    }
}

