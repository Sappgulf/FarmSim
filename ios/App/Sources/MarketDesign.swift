import SwiftUI

enum MarketPalette {
    static let ink = Color(red: 0.25, green: 0.17, blue: 0.10)
    static let muted = Color(red: 0.46, green: 0.36, blue: 0.25)
    static let paper = Color(red: 0.99, green: 0.96, blue: 0.88)
    static let canvas = Color(red: 0.95, green: 0.90, blue: 0.78)
    static let leaf = Color(red: 0.23, green: 0.40, blue: 0.20)
    static let honey = Color(red: 0.91, green: 0.69, blue: 0.27)
    static let border = Color(red: 0.63, green: 0.46, blue: 0.28)
    static let warning = Color(red: 0.52, green: 0.29, blue: 0.09)
    static let danger = Color(red: 0.64, green: 0.20, blue: 0.17)
    static let info = Color(red: 0.24, green: 0.37, blue: 0.54)
}

struct MarketPanel<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .environment(\.colorScheme, .light)
            .foregroundStyle(MarketPalette.ink)
            .padding(DS.Space.md)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(MarketPalette.paper)
                    .overlay {
                        GameMaterialSurface(material: "wood")
                            .opacity(0.045)
                            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .strokeBorder(MarketPalette.border.opacity(0.32), lineWidth: 1)
                    }
            }
            .shadow(color: MarketPalette.ink.opacity(0.08), radius: 8, y: 3)
    }
}

struct MarketSectionHeading: View {
    let title: String
    init(_ title: String) { self.title = title }

    var body: some View {
        Text(title)
            .font(.system(.headline, design: .serif).weight(.bold))
            .foregroundStyle(MarketPalette.ink)
            .accessibilityAddTraits(.isHeader)
    }
}

struct MarketActionStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var honey = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.bold))
            .foregroundStyle(isEnabled ? (honey ? MarketPalette.ink : .white) : MarketPalette.muted)
            .frame(maxWidth: .infinity, minHeight: 44)
            .padding(.horizontal, DS.Space.sm)
            .background {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(isEnabled ? (honey ? MarketPalette.honey : MarketPalette.leaf) : MarketPalette.canvas)
                    .opacity(configuration.isPressed ? 0.85 : 1)
                    .overlay {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .strokeBorder(MarketPalette.border.opacity(isEnabled ? 0.1 : 0.4), lineWidth: 1)
                    }
            }
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.98 : 1)
            .animation(reduceMotion ? nil : .easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct MarketCoinValue: View {
    let amount: Int
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "circle.fill")
                .font(.caption2)
                .foregroundStyle(MarketPalette.honey)
                .accessibilityHidden(true)
            Text(amount.formatted())
                .monospacedDigit()
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(amount) coins")
    }
}

struct MarketEmptyState: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: DS.Space.sm) {
            Image(systemName: icon)
                .font(.largeTitle)
                .foregroundStyle(MarketPalette.leaf)
                .accessibilityHidden(true)
            Text(title).font(.headline).foregroundStyle(MarketPalette.ink)
            Text(subtitle).font(.subheadline).foregroundStyle(MarketPalette.muted)
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
        .padding(.vertical, DS.Space.lg)
    }
}
