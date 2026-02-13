import SwiftUI

struct MenuButtonsView: View {
    let hasSave: Bool
    let isBusy: Bool
    let onPrimaryAction: () -> Void
    let onNewGameAction: () -> Void
    let onSettingsAction: () -> Void
    let onCreditsAction: () -> Void

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            PrimaryButton(
                title: hasSave ? "Continue" : "Start Game",
                icon: hasSave ? "play.fill" : "sprout",
                tint: DS.Color.accent,
                action: onPrimaryAction
            )
            .accessibilityHint(hasSave ? "Resume your farm." : "Create and enter a new farm.")

            if hasSave {
                SecondaryButton(
                    title: "New Game",
                    icon: "arrow.counterclockwise.circle.fill",
                    action: onNewGameAction
                )
                .accessibilityHint("Start over with a fresh farm.")
            }

            SecondaryButton(
                title: "Settings",
                icon: "gearshape.fill",
                action: onSettingsAction
            )
            .accessibilityHint("Open gameplay and accessibility settings.")

            SecondaryButton(
                title: "Credits",
                icon: "person.3.fill",
                action: onCreditsAction
            )
            .accessibilityHint("View team and tech credits.")

            SecondaryButton(
                title: "Load Slot (Soon)",
                icon: "externaldrive.fill.badge.plus",
                action: { }
            )
            .disabled(true)
            .opacity(0.62)
            .accessibilityHint("Feature planned for a future update.")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .disabled(isBusy)
    }
}
