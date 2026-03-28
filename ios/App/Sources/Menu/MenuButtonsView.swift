import SwiftUI

struct MenuButtonsView: View {
    let hasSave: Bool
    let isBusy: Bool
    let onPrimaryAction: () -> Void
    let onNewGameAction: () -> Void
    let onSettingsAction: () -> Void
    let onCreditsAction: () -> Void

    var body: some View {
        VStack(spacing: DS.Space.md) {
            PrimaryButton(
                title: hasSave ? "Continue" : "Start Game",
                icon: hasSave ? "play.fill" : "sprout",
                tint: DS.Color.accent,
                action: onPrimaryAction
            )

            if hasSave {
                SecondaryButton(
                    title: "New Game",
                    icon: "arrow.counterclockwise.circle",
                    action: onNewGameAction
                )
            }

            SecondaryButton(
                title: "Settings",
                icon: "gearshape.fill",
                action: onSettingsAction
            )

            SecondaryButton(
                title: "Credits",
                icon: "sparkles",
                action: onCreditsAction
            )
        }
        .frame(maxWidth: .infinity)
        .disabled(isBusy)
    }
}
