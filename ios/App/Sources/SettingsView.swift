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
                Section("Farm Customization") {
                    TextField("Farm name", text: $farmNameInput)
                        .textInputAutocapitalization(.words)
                        .onSubmit {
                            store.setFarmName(farmNameInput)
                        }
                        .onChange(of: farmNameInput) { _, value in
                            if value.count > 32 {
                                farmNameInput = String(value.prefix(32))
                            }
                        }

                    Picker("Palette", selection: Binding(
                        get: { store.settings.palette },
                        set: { store.setPalette($0) }
                    )) {
                        ForEach(FarmPalette.allCases) { palette in
                            Text(palette.title).tag(palette)
                        }
                    }
                }

                Section("Audio & Feedback") {
                    Toggle("Sound", isOn: Binding(
                        get: { store.settings.soundEnabled },
                        set: { store.setSoundEnabled($0) }
                    ))

                    Toggle("Haptics", isOn: Binding(
                        get: { store.settings.hapticsEnabled },
                        set: { store.setHapticsEnabled($0) }
                    ))
                }

                Section("Accessibility") {
                    Toggle("Reduce Motion", isOn: Binding(
                        get: { store.settings.reducedMotion },
                        set: { store.setReducedMotion($0) }
                    ))

                    Toggle("VoiceOver Hints", isOn: Binding(
                        get: { store.settings.voiceOverHints },
                        set: { store.setVoiceOverHints($0) }
                    ))
                }

                Section("Performance") {
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

                Section("Data") {
                    Button(role: .destructive) {
                        confirmReset = true
                    } label: {
                        Text("Reset Save")
                    }
                }

                Section("Debug") {
                    LabeledContent("Save Version", value: "\(store.save.version)")
                    LabeledContent("Grid", value: "\(store.save.world.gridWidth)x\(store.save.world.gridHeight)")
                    LabeledContent("Status", value: store.statusText)
                }

                Section("Navigation") {
                    Button("Return to Main Menu") {
                        appState.openMainMenu()
                    }
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
            .alert("Reset Save?", isPresented: $confirmReset) {
                Button("Reset", role: .destructive) {
                    store.resetSave()
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("This clears local iOS progress and starts a new farm.")
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
