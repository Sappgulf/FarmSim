import SwiftUI

enum DS {
    enum Space {
        static let xxs: CGFloat = 4
        static let xs: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 20
        static let xl: CGFloat = 24
    }

    enum Radius {
        static let sm: CGFloat = 10
        static let md: CGFloat = 14
        static let lg: CGFloat = 18
        static let xl: CGFloat = 24
    }

    enum Color {
        static let bgTop = SwiftUI.Color(red: 0.48, green: 0.72, blue: 0.90)
        static let bgBottom = SwiftUI.Color(red: 0.20, green: 0.52, blue: 0.34)
        static let cardStroke = SwiftUI.Color.white.opacity(0.22)
        static let accent = SwiftUI.Color(red: 0.18, green: 0.58, blue: 0.30)
        static let money = SwiftUI.Color(red: 0.96, green: 0.79, blue: 0.21)
        static let xp = SwiftUI.Color(red: 0.35, green: 0.66, blue: 0.95)
    }

    static let shadow = SwiftUI.Color.black.opacity(0.2)
}

struct CardContainer<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .padding(DS.Space.md)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                    .stroke(DS.Color.cardStroke, lineWidth: 0.5)
            )
    }
}

struct SectionHeader: View {
    let title: String
    let subtitle: String?

    init(_ title: String, subtitle: String? = nil) {
        self.title = title
        self.subtitle = subtitle
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text(title)
                .font(.title3.weight(.semibold))
            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct StatPill: View {
    let icon: String
    let value: String

    var body: some View {
        Label {
            Text(value)
                .font(.footnote.monospacedDigit().weight(.semibold))
        } icon: {
            Image(systemName: icon)
        }
        .padding(.horizontal, DS.Space.sm)
        .padding(.vertical, DS.Space.xs)
        .background(.ultraThinMaterial, in: Capsule())
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var tint: SwiftUI.Color = DS.Color.accent

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, DS.Space.sm)
            .background(
                tint.opacity(configuration.isPressed ? 0.75 : 1.0),
                in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
            )
            .foregroundStyle(.white)
            .scaleEffect(configuration.isPressed ? 0.99 : 1.0)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

extension View {
    func farmBackground(palette: FarmPalette = .meadow) -> some View {
        let colors: [SwiftUI.Color]
        switch palette {
        case .meadow:
            colors = [DS.Color.bgTop, DS.Color.bgBottom]
        case .sunrise:
            colors = [
                SwiftUI.Color(red: 0.98, green: 0.75, blue: 0.43),
                SwiftUI.Color(red: 0.86, green: 0.45, blue: 0.36),
            ]
        case .twilight:
            colors = [
                SwiftUI.Color(red: 0.26, green: 0.33, blue: 0.56),
                SwiftUI.Color(red: 0.15, green: 0.24, blue: 0.34),
            ]
        }

        return background(
            LinearGradient(
                colors: colors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
    }
}
