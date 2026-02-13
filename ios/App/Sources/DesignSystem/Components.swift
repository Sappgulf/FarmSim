import SwiftUI

struct PrimaryButton: View {
    let title: String
    let icon: String?
    var tint: Color = DS.Color.accent
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            if let icon {
                Label(title, systemImage: icon)
            } else {
                Text(title)
            }
        }
        .buttonStyle(PrimaryButtonStyle(tint: tint))
    }
}

struct SecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            if let icon {
                Label(title, systemImage: icon)
            } else {
                Text(title)
            }
        }
        .buttonStyle(.bordered)
    }
}

struct AppBadge: View {
    let text: String
    var tint: Color = DS.Color.accent

    var body: some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(tint, in: Capsule())
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(DS.Color.textSecondary)
            Text(title)
                .font(Typography.section)
                .foregroundStyle(DS.Color.textPrimary)
            Text(subtitle)
                .font(Typography.caption)
                .foregroundStyle(DS.Color.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(DS.Space.lg)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .fill(DS.Color.surfaceElevated)
        )
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .stroke(DS.Color.cardStroke, lineWidth: 0.6)
        )
    }
}

struct IconLabel: View {
    let title: String
    let symbol: String
    var tint: Color = DS.Color.textPrimary

    var body: some View {
        Label(title, systemImage: symbol)
            .font(Typography.bodyStrong)
            .foregroundStyle(tint)
    }
}
