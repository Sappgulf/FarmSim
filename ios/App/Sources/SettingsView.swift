import SwiftUI

struct SettingsView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState
    var showClose: Bool = false

    @State private var confirmReset = false
    @State private var farmNameInput = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Space.lg) {
                    // Header Card
                    headerCard

                    // Your Farm Section
                    SettingsSection(
                        title: "Your Farm",
                        icon: "leaf.fill",
                        iconColor: Theme.seasonSpring
                    ) {
                        VStack(spacing: 0) {
                            SettingRow(
                                icon: "textformat.abc",
                                title: "Farm Name",
                                subtitle: farmNameInput.count > 24
                                    ? "\(farmNameInput.count)/32 characters"
                                    : "What should we call your homestead?",
                                iconBackground: Theme.leafGreen
                            ) {
                                TextField("Name", text: $farmNameInput)
                                    .textInputAutocapitalization(.words)
                                    .autocorrectionDisabled()
                                    .submitLabel(.done)
                                    .multilineTextAlignment(.trailing)
                                    .font(.system(.body, design: .rounded))
                                    .foregroundStyle(farmNameInput.count > 28 ? DS.Color.money : DS.Color.textPrimary)
                                    .frame(width: 130)
                                    .accessibilityLabel("Farm name")
                                    .accessibilityHint("Rename your homestead")
                                    .onSubmit {
                                        let trimmed = farmNameInput.trimmingCharacters(in: .whitespacesAndNewlines)
                                        if !trimmed.isEmpty {
                                            store.setFarmName(trimmed)
                                            farmNameInput = trimmed
                                        } else {
                                            farmNameInput = store.farmName
                                        }
                                    }
                                    .onChange(of: farmNameInput) { _, value in
                                        if value.count > 32 {
                                            farmNameInput = String(value.prefix(32))
                                        }
                                    }
                            }
                        }
                    }

                    // Farm Colors Section
                    SettingsSection(
                        title: "Appearance",
                        icon: "paintpalette.fill",
                        iconColor: Theme.seasonSummer
                    ) {
                        VStack(spacing: 0) {
                            SettingRow(
                                icon: "paintpalette.fill",
                                title: "Farm Colors",
                                subtitle: "Choose your farm's color theme",
                                iconBackground: Theme.wheatGold
                            ) {
                                Picker("", selection: Binding(
                                    get: { store.settings.palette },
                                    set: { store.setPalette($0) }
                                )) {
                                    ForEach(FarmPalette.allCases) { palette in
                                        HStack(spacing: DS.Space.xs) {
                                            Circle()
                                                .fill(paletteColor(palette))
                                                .frame(width: 12, height: 12)
                                            Text(palette.title)
                                        }
                                        .tag(palette)
                                    }
                                }
                                .pickerStyle(.menu)
                                .tint(DS.Color.textPrimary)
                                .accessibilityLabel("Farm colors")
                                .accessibilityValue(store.settings.palette.title)
                            }
                            .padding(.vertical, DS.Space.xs)

                            // Live palette preview strip
                            PalettePreviewStrip(palette: store.settings.palette)
                                .padding(.horizontal, DS.Space.md)
                                .padding(.bottom, DS.Space.sm)
                        }
                    }

                    // Sounds & Vibes Section
                    SettingsSection(
                        title: "Sounds & Vibes",
                        icon: "speaker.wave.2.fill",
                        iconColor: Theme.infoAdaptive
                    ) {
                        VStack(spacing: 0) {
                            ToggleRow(
                                icon: "speaker.wave.2.fill",
                                title: "Farm Sounds",
                                subtitle: "Animal noises and ambient nature",
                                iconBackground: Theme.infoAdaptive,
                                isOn: Binding(
                                    get: { store.settings.soundEnabled },
                                    set: { store.setSoundEnabled($0) }
                                )
                            )

                            Divider()
                                .background(SwiftUI.Color.white.opacity(0.1))
                                .padding(.horizontal, DS.Space.md)

                            ToggleRow(
                                icon: "iphone.radiowaves.left.and.right",
                                title: "Haptic Feedback",
                                subtitle: "Gentle vibrations when you interact",
                                iconBackground: Theme.successAdaptive,
                                isOn: Binding(
                                    get: { store.settings.hapticsEnabled },
                                    set: { store.setHapticsEnabled($0) }
                                )
                            )

                            Divider()
                                .background(SwiftUI.Color.white.opacity(0.1))
                                .padding(.horizontal, DS.Space.md)

                            ToggleRow(
                                icon: "bell.fill",
                                title: "Crops Ready Alerts",
                                subtitle: "Get notified when harvest is ready",
                                iconBackground: Theme.warningAdaptive,
                                isOn: Binding(
                                    get: { store.settings.cropsReadyNotifications },
                                    set: { store.setCropsReadyNotifications($0) }
                                )
                            )
                        }
                    }

                    // Prestige Section
                    if store.prestigeTier > 0 {
                        SettingsSection(
                            title: "Prestige",
                            icon: "star.fill",
                            iconColor: Theme.wheatGold
                        ) {
                            VStack(spacing: 0) {
                                if let info = store.prestigeInfo {
                                    InfoRow(icon: "crown.fill", title: "Tier", value: "\(info.emoji) \(info.name)")
                                    InfoRow(icon: "percent", title: "Bonus", value: "+\(Int(info.bonus * 100))%")
                                }
                                InfoRow(icon: "banknote.fill", title: "Lifetime", value: "\(store.lifetimeEarnings) coins")
                                if let nextReq = store.nextPrestigeRequirement {
                                    InfoRow(icon: "arrow.up.circle", title: "Next Tier", value: "\(nextReq) coins")
                                }
                            }
                            .padding(.vertical, DS.Space.xs)
                        }
                    }

                    // Specialization Section
                    if let specialization = store.selectedSpecialization {
                        SettingsSection(
                            title: "Specialization",
                            icon: specialization.emoji,
                            iconColor: Theme.seasonSummer
                        ) {
                            VStack(spacing: 0) {
                                InfoRow(icon: "checkmark.seal.fill", title: "Path", value: specialization.name)
                                let availableCount = store.availableResearch(for: specialization).count
                                InfoRow(icon: "book.fill", title: "Available", value: "\(availableCount) research")
                            }
                            .padding(.vertical, DS.Space.xs)
                        }
                    }

                    // Start Over Section
                    SettingsSection(
                        title: "Start Over",
                        icon: "arrow.counterclockwise",
                        iconColor: Theme.errorAdaptive
                    ) {
                        Button(action: { confirmReset = true }) {
                            SettingRow(
                                icon: "trash.fill",
                                title: "Reset Save",
                                subtitle: "Clear all progress and start fresh",
                                iconBackground: Theme.errorAdaptive
                            ) {
                                Image(systemName: "chevron.right")
                                    .font(.system(.caption, weight: .semibold))
                                    .foregroundStyle(DS.Color.textSecondary)
                            }
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Reset save")
                        .accessibilityHint("Clear all progress and start fresh")
                        .padding(.vertical, DS.Space.xs)
                    }

                    // About Your Farm Section
                    SettingsSection(
                        title: "About Your Farm",
                        icon: "info.circle.fill",
                        iconColor: DS.Color.xp
                    ) {
                        VStack(spacing: 0) {
                            InfoRow(icon: "number", title: "Save Version", value: "\(store.save.version)")
                            InfoRow(icon: "square.grid.2x2", title: "Farm Size", value: "\(store.save.world.gridWidth)×\(store.save.world.gridHeight)")
                            InfoRow(icon: "clock", title: "Farm Clock", value: store.hudTimeText)
                            InfoRow(icon: "checkmark.circle", title: "Status", value: store.statusText)
                        }
                        .padding(.vertical, DS.Space.xs)
                    }

                    #if DEBUG
                    // Debug Section
                    SettingsSection(
                        title: "Debug Tools",
                        icon: "ladybug.fill",
                        iconColor: Theme.warningAdaptive
                    ) {
                        Button(action: { store.advanceDays(1) }) {
                            SettingRow(
                                icon: "forward.fill",
                                title: "Fast-forward 1 Day",
                                subtitle: "Skip ahead 24 hours instantly",
                                iconBackground: Theme.warningAdaptive
                            ) {
                                Image(systemName: "bolt.fill")
                                    .font(.system(.caption, weight: .semibold))
                                    .foregroundStyle(Theme.warningAdaptive)
                            }
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Fast-forward one day")
                        .accessibilityHint("Debug tool for skipping ahead 24 hours")
                        .padding(.vertical, DS.Space.xs)
                    }
                    #endif

                    // Footer
                    VStack(spacing: DS.Space.md) {
                        Button(action: { appState.openMainMenu() }) {
                            HStack(spacing: DS.Space.sm) {
                                Image(systemName: "house.fill")
                                Text("Back to Main Menu")
                            }
                            .font(.system(.headline, design: .rounded, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, DS.Space.md)
                            .background(
                                RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                                    .fill(
                                        LinearGradient(
                                            colors: [DS.Color.accent, DS.Color.accent.opacity(0.8)],
                                            startPoint: .top,
                                            endPoint: .bottom
                                        )
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                                            .strokeBorder(SwiftUI.Color.white.opacity(0.20), lineWidth: 1)
                                    )
                            )
                            .shadow(color: DS.Color.accent.opacity(0.4), radius: 8, x: 0, y: 4)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Back to main menu")
                        .accessibilityHint("Leave settings and return to the main menu")

                        VStack(spacing: DS.Space.xs) {
                            Text("Happy farming! May your fields be ever green.")
                                .font(.system(.footnote, design: .rounded))
                                .foregroundStyle(DS.Color.textSecondary)

                            Text("FarmSim v1.0 · Swift 5.10 · iOS 17+")
                                .font(.caption2)
                                .foregroundStyle(DS.Color.textSecondary.opacity(0.7))
                        }
                        .multilineTextAlignment(.center)
                    }
                    .padding(.top, DS.Space.sm)
                }
                .padding(.horizontal, DS.Space.md)
                .padding(.vertical, DS.Space.sm)
            }
            .scrollIndicators(.hidden)
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                if showClose {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") {
                            appState.showingMenuSettings = false
                        }
                        .font(.system(.body, design: .rounded, weight: .semibold))
                    }
                }
            }
            .alert("Start a Fresh Farm?", isPresented: $confirmReset) {
                Button("Start Fresh", role: .destructive) {
                    store.resetSave()
                    store.persistNow()
                    appState.showingOnboarding = true
                }
                Button("Keep My Farm", role: .cancel) { }
            } message: {
                Text("Everything on your current farm will be cleared. This can't be undone.")
            }
            .onAppear {
                farmNameInput = store.farmName
            }
            .onDisappear {
                let trimmed = farmNameInput.trimmingCharacters(in: .whitespacesAndNewlines)
                if !trimmed.isEmpty {
                    store.setFarmName(trimmed)
                }
            }
            .scrollContentBackground(.hidden)
            .farmBackground(palette: store.settings.palette)
        }
    }

    // MARK: - Header Card

    private var headerCard: some View {
        VStack(spacing: DS.Space.md) {
            HStack(spacing: DS.Space.lg) {
                // Farm Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Theme.wheatGold, Theme.seasonSummer],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 70, height: 70)
                        .shadow(color: Theme.wheatGold.opacity(0.4), radius: 10, x: 0, y: 5)

                    Text("🚜")
                        .font(.system(size: 36))
                }

                VStack(alignment: .leading, spacing: DS.Space.xs) {
                    Text(store.farmName.isEmpty ? "Your Farm" : store.farmName)
                        .font(.system(.title2, design: .rounded, weight: .bold))
                        .foregroundStyle(.white)

                        HStack(spacing: DS.Space.md) {
                        HStack(spacing: DS.Space.xs) {
                            Image(systemName: "dollarsign.circle.fill")
                                .foregroundStyle(DS.Color.money)
                            AnimatedNumber(
                                value: store.save.player.coins,
                                font: .system(.subheadline, design: .rounded, weight: .semibold),
                                color: DS.Color.money
                            )
                        }

                        HStack(spacing: DS.Space.xs) {
                            Image(systemName: "star.circle.fill")
                                .foregroundStyle(DS.Color.xp)
                            AnimatedNumber(
                                value: store.save.player.xp,
                                font: .system(.subheadline, design: .rounded, weight: .semibold),
                                color: DS.Color.xp
                            )
                        }
                    }
                }

                Spacer()
            }
        }
        .padding(DS.Space.lg)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            SwiftUI.Color.white.opacity(0.15),
                            SwiftUI.Color.white.opacity(0.05)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                        .strokeBorder(
                            LinearGradient(
                                colors: [SwiftUI.Color.white.opacity(0.20), SwiftUI.Color.white.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                )
        )
        .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)
    }

    // MARK: - Palette Preview Strip

    private func paletteGradient(_ palette: FarmPalette) -> LinearGradient {
        switch palette {
        case .meadow:
            return LinearGradient(
                colors: [Color(red: 0.44, green: 0.76, blue: 0.40), Color(red: 0.62, green: 0.87, blue: 0.55), Color(red: 0.38, green: 0.62, blue: 0.32)],
                startPoint: .leading, endPoint: .trailing
            )
        case .sunrise:
            return LinearGradient(
                colors: [Color(red: 0.98, green: 0.72, blue: 0.28), Color(red: 0.96, green: 0.50, blue: 0.22), Color(red: 0.88, green: 0.32, blue: 0.18)],
                startPoint: .leading, endPoint: .trailing
            )
        case .twilight:
            return LinearGradient(
                colors: [Color(red: 0.28, green: 0.32, blue: 0.72), Color(red: 0.50, green: 0.30, blue: 0.80), Color(red: 0.18, green: 0.20, blue: 0.55)],
                startPoint: .leading, endPoint: .trailing
            )
        }
    }

    // MARK: - Helper Methods

    private func paletteColor(_ palette: FarmPalette) -> SwiftUI.Color {
        switch palette {
        case .meadow:
            return Theme.seasonSpring
        case .sunrise:
            return Theme.seasonSummer
        case .twilight:
            return Theme.seasonWinter
        }
    }
}

// MARK: - PalettePreviewStrip

private struct PalettePreviewStrip: View {
    let palette: FarmPalette

    var body: some View {
        HStack(spacing: 0) {
            ForEach(FarmPalette.allCases) { p in
                ZStack {
                    gradient(p)
                    if p == palette {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.4), radius: 2, x: 0, y: 1)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 32)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                .strokeBorder(SwiftUI.Color.white.opacity(0.15), lineWidth: 1)
        )
        .animation(DS.Animation.standard, value: palette)
    }

    private func gradient(_ p: FarmPalette) -> LinearGradient {
        switch p {
        case .meadow:
            return LinearGradient(
                colors: [Color(red: 0.44, green: 0.76, blue: 0.40), Color(red: 0.38, green: 0.62, blue: 0.32)],
                startPoint: .leading, endPoint: .trailing
            )
        case .sunrise:
            return LinearGradient(
                colors: [Color(red: 0.98, green: 0.72, blue: 0.28), Color(red: 0.88, green: 0.32, blue: 0.18)],
                startPoint: .leading, endPoint: .trailing
            )
        case .twilight:
            return LinearGradient(
                colors: [Color(red: 0.28, green: 0.32, blue: 0.72), Color(red: 0.18, green: 0.20, blue: 0.55)],
                startPoint: .leading, endPoint: .trailing
            )
        }
    }
}

// MARK: - ToggleRow

private struct ToggleRow: View {
    let icon: String
    let title: String
    let subtitle: String?
    let iconBackground: SwiftUI.Color
    @Binding var isOn: Bool

    var body: some View {
        SettingRow(
            icon: icon,
            title: title,
            subtitle: subtitle,
            iconBackground: iconBackground
        ) {
            Toggle(title, isOn: $isOn)
                .toggleStyle(FarmToggleStyle())
                .labelsHidden()
        }
        .padding(.vertical, DS.Space.xs)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(title)
        .accessibilityValue(isOn ? "On" : "Off")
        .accessibilityHint(subtitle ?? "Double tap to toggle")
    }
}

// MARK: - InfoRow

private struct InfoRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack {
            HStack(spacing: DS.Space.sm) {
                Image(systemName: icon)
                    .font(.system(.caption, weight: .medium))
                    .foregroundStyle(DS.Color.textSecondary)
                    .frame(width: 20)

                Text(title)
                    .font(.system(.body, design: .rounded))
                    .foregroundStyle(DS.Color.textSecondary)
            }

            Spacer()

            Text(value)
                .font(.system(.body, design: .rounded, weight: .medium))
                .foregroundStyle(DS.Color.textPrimary)
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, DS.Space.xs)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(title)
        .accessibilityValue(value)
    }
}
