import SwiftUI

// MARK: - Buttons

struct PrimaryButton: View {
    let title: String
    var icon: String? = nil
    var tint: Color = DS.Color.accent
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: DS.Space.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.body.weight(.semibold))
                }
                Text(title)
            }
        }
        .buttonStyle(PrimaryButtonStyle(tint: tint))
    }
}

struct SecondaryButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: DS.Space.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.body)
                }
                Text(title)
            }
            .font(.headline)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.vertical, DS.Space.sm)
            .padding(.horizontal, DS.Space.md)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .stroke(DS.Color.cardStroke, lineWidth: 0.5)
            )
            .foregroundStyle(.white)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Badges

struct AppBadge: View {
    let label: String
    var tint: Color = DS.Color.accent

    var body: some View {
        Text(label)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(tint, in: Capsule())
    }
}

struct SeasonBadge: View {
    let season: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: seasonIcon)
                .font(.caption2)
            Text(season.capitalized)
                .font(.caption2.weight(.semibold))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(seasonColor.opacity(0.85), in: Capsule())
    }
    
    private var seasonIcon: String {
        switch season.lowercased() {
        case "spring": return "leaf.fill"
        case "summer": return "sun.max.fill"
        case "autumn", "fall": return "wind"
        case "winter": return "snowflake"
        default: return "calendar"
        }
    }
    
    private var seasonColor: Color {
        switch season.lowercased() {
        case "spring": return Theme.seasonSpring
        case "summer": return Theme.seasonSummer
        case "autumn", "fall": return Theme.seasonFall
        case "winter": return Theme.seasonWinter
        default: return DS.Color.accent
        }
    }
}

// MARK: - Empty / Info States

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            Image(systemName: icon)
                .font(.system(size: 36, weight: .semibold))
                .foregroundStyle(.secondary)
            Text(title)
                .font(Typography.section)
            Text(subtitle)
                .font(Typography.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(DS.Space.lg)
    }
}

// MARK: - Icon Label

struct IconLabel: View {
    let icon: String
    let text: String
    var tint: Color = .white

    var body: some View {
        HStack(spacing: DS.Space.xxs) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(tint)
            Text(text)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    var subtitle: String? = nil

    init(_ title: String, subtitle: String? = nil) {
        self.title = title
        self.subtitle = subtitle
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xxs) {
            Text(title)
                .font(Typography.section)
            if let subtitle = subtitle {
                Text(subtitle)
                    .font(Typography.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// MARK: - Stat Pill

struct StatPill: View {
    let icon: String
    let value: String

    var body: some View {
        HStack(spacing: DS.Space.xxs) {
            Image(systemName: icon)
                .font(.caption2)
            Text(value)
                .font(.caption.monospacedDigit())
        }
        .foregroundStyle(.white.opacity(0.9))
    }
}
