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
                Section("Your Farm") {
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
                }

                Section("Sounds & Vibes") {
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
                }

                Section("Comfort & Ease") {
                    Toggle("Reduce Motion", isOn: Binding(
                        get: { store.settings.reducedMotion },
                        set: { store.setReducedMotion($0) }
                    ))

                    Toggle("VoiceOver Hints", isOn: Binding(
                        get: { store.settings.voiceOverHints },
                        set: { store.setVoiceOverHints($0) }
                    ))
                }

                Section("Under the Hood") {
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
                }

                Section("Start Over") {
                    Button(role: .destructive) {
                        confirmReset = true
                    } label: {
                        Text("Reset Save")
                    }
                }

                Section("About Your Farm") {
                    LabeledContent("Save Version", value: "\(store.save.version)")
                    LabeledContent("Farm Size", value: "\(store.save.world.gridWidth)x\(store.save.world.gridHeight)")
                    LabeledContent("Farm Clock", value: store.hudTimeText)
                    LabeledContent("Status", value: store.statusText)
                }

                #if DEBUG
                Section("Debug Time") {
                    Button("Fast-forward 1 Day") {
                        store.advanceDays(1)
                    }
                }
                #endif

                Section {
                    Button("Back to Main Menu") {
                        appState.openMainMenu()
                    }
                } footer: {
                    Text("Happy farming! May your fields be ever green.")
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
