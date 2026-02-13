import SwiftUI

struct SettingsView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState
    var showClose: Bool = false

    @State private var confirmReset = false
    @State private var farmNameInput = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    TextField("Name your farm", text: $farmNameInput)
                        .textInputAutocapitalization(.words)
                        .onSubmit {
                            store.setFarmName(farmNameInput)
                        }
                        .onChange(of: farmNameInput) { _, value in
                            if value.count > 32 {
                                farmNameInput = String(value.prefix(32))
                            }
                        }

                    Picker("Farm Colors", selection: Binding(
                        get: { store.settings.palette },
                        set: { store.setPalette($0) }
                    )) {
                        ForEach(FarmPalette.allCases) { palette in
                            Text(palette.title).tag(palette)
                        }
                    }
                } header: {
                    Label("Your Farm", systemImage: "leaf.fill")
                        .foregroundStyle(DS.Color.accent)
                }

                Section {
                    Toggle("Farm Sounds", isOn: Binding(
                        get: { store.settings.soundEnabled },
                        set: { store.setSoundEnabled($0) }
                    ))

                    Toggle("Haptic Feedback", isOn: Binding(
                        get: { store.settings.hapticsEnabled },
                        set: { store.setHapticsEnabled($0) }
                    ))

                    Toggle("Crops Ready Alerts", isOn: Binding(
                        get: { store.settings.cropsReadyNotifications },
                        set: { store.setCropsReadyNotifications($0) }
                    ))
                } header: {
                    Label("Sounds & Vibes", systemImage: "speaker.wave.2.fill")
                        .foregroundStyle(DS.Color.accent)
                }

                Section {
                    Toggle("Reduce Motion", isOn: Binding(
                        get: { store.settings.reducedMotion },
                        set: { store.setReducedMotion($0) }
                    ))

                    Toggle("VoiceOver Hints", isOn: Binding(
                        get: { store.settings.voiceOverHints },
                        set: { store.setVoiceOverHints($0) }
                    ))
                } header: {
                    Label("Comfort & Ease", systemImage: "accessibility")
                        .foregroundStyle(DS.Color.accent)
                }

                Section {
                    Toggle("Show Tile Coordinates", isOn: Binding(
                        get: { store.settings.showTileCoordinates },
                        set: { store.setShowTileCoordinates($0) }
                    ))

                    Toggle("Particle Effects", isOn: Binding(
                        get: { store.settings.particleEffects },
                        set: { store.setParticleEffects($0) }
                    ))

                    Picker("Target FPS", selection: Binding(
                        get: { store.settings.targetFPS },
                        set: { store.setTargetFPS($0) }
                    )) {
                        Text("30 FPS").tag(30)
                        Text("60 FPS").tag(60)
                        Text("120 FPS").tag(120)
                    }
                } header: {
                    Label("Under the Hood", systemImage: "gearshape.2.fill")
                        .foregroundStyle(DS.Color.accent)
                }

                Section {
                    Button(role: .destructive) {
                        confirmReset = true
                    } label: {
                        Label("Reset Save", systemImage: "trash.fill")
                    }
                } header: {
                    Label("Start Over", systemImage: "arrow.counterclockwise")
                        .foregroundStyle(.red)
                }

                Section {
                    LabeledContent("Save Version", value: "\(store.save.version)")
                    LabeledContent("Farm Size", value: "\(store.save.world.gridWidth)x\(store.save.world.gridHeight)")
                    LabeledContent("Farm Clock", value: store.hudTimeText)
                    LabeledContent("Status", value: store.statusText)
                } header: {
                    Label("About Your Farm", systemImage: "info.circle.fill")
                        .foregroundStyle(DS.Color.accent)
                }

                #if DEBUG
                Section {
                    Button("Fast-forward 1 Day") {
                        store.advanceDays(1)
                    }
                } header: {
                    Label("Debug Time", systemImage: "timer")
                        .foregroundStyle(.orange)
                }
                #endif

                Section {
                    Button("Back to Main Menu") {
                        appState.openMainMenu()
                    }
                } footer: {
                    VStack(spacing: DS.Space.xs) {
                        Text("Happy farming! May your fields be ever green.")
                        Text("FarmSim v1.0 · Swift 5.10 · iOS 17+")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, DS.Space.sm)
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                if showClose {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") {
                            appState.showingMenuSettings = false
                        }
                    }
                }
            }
            .alert("Start a Fresh Farm?", isPresented: $confirmReset) {
                Button("Start Fresh", role: .destructive) {
                    store.resetSave()
                }
                Button("Keep My Farm", role: .cancel) { }
            } message: {
                Text("Everything on your current farm will be cleared. This can't be undone.")
            }
            .onAppear {
                farmNameInput = store.farmName
            }
            .onDisappear {
                store.setFarmName(farmNameInput)
            }
            .scrollContentBackground(.hidden)
            .farmBackground(palette: store.settings.palette)
        }
    }
}
