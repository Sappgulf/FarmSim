import SwiftUI
import UIKit

// MARK: - AnimationNamespace for Matched Geometry Effect

enum AnimationNamespace {
    static let settings = "settings"
    static let inventory = "inventory"
    static let market = "market"
    static let almanac = "almanac"
}

// MARK: - Design System

enum DS {
    enum Space {
        static let xxs: CGFloat = 4
        static let xs:  CGFloat = 8
        static let sm:  CGFloat = 12
        static let md:  CGFloat = 16
        static let lg:  CGFloat = 20
        static let xl:  CGFloat = 24
        static let xxl: CGFloat = 32
        static let xxxl: CGFloat = 48
    }

    enum Radius {
        static let sm:  CGFloat = 10
        static let md:  CGFloat = 14
        static let lg:  CGFloat = 18
        static let xl:  CGFloat = 24
        static let xxl: CGFloat = 28
        static let xxxl: CGFloat = 36
    }

    // MARK: - Animation Timing
    enum Animation {
        /// Standard spring for UI interactions — buttons, cards.
        static let spring = SwiftUI.Animation.spring(response: 0.32, dampingFraction: 0.72)
        /// Slightly bouncier spring for appearance transitions.
        static let springBounce = SwiftUI.Animation.spring(response: 0.45, dampingFraction: 0.65)
        /// Fast easeOut for micro-interactions (< 200ms).
        static let micro = SwiftUI.Animation.easeOut(duration: 0.14)
        /// Standard ease for fades and opacity shifts.
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.22)
        /// Slow ambient motion (background floats, pulses).
        static let ambient = SwiftUI.Animation.easeInOut(duration: 3.2)
        /// Celebration animations
        static let celebration = SwiftUI.Animation.spring(response: 0.55, dampingFraction: 0.55)
        /// Number counting animation
        static let count = SwiftUI.Animation.easeOut(duration: 0.4)
    }

    // MARK: - Shadow Presets
    enum Shadow {
        struct Config {
            let color: SwiftUI.Color
            let radius: CGFloat
            let x: CGFloat
            let y: CGFloat
        }
        static let card   = Config(color: .black.opacity(0.22), radius: 8,  x: 0, y: 4)
        static let button = Config(color: .black.opacity(0.18), radius: 4,  x: 0, y: 2)
        static let float  = Config(color: .black.opacity(0.28), radius: 14, x: 0, y: 6)
        static let soft   = Config(color: .black.opacity(0.12), radius: 6,  x: 0, y: 2)
        static let inner  = Config(color: .black.opacity(0.08), radius: 4,  x: 0, y: 2)
    }

    enum Color {
        static let bgTop    = SwiftUI.Color(red: 0.97, green: 0.83, blue: 0.61)
        static let bgBottom = SwiftUI.Color(red: 0.42, green: 0.64, blue: 0.36)
        static let surface      = SwiftUI.Color.white.opacity(0.18)
        static let cardStroke   = SwiftUI.Color.white.opacity(0.24)
        static let accent       = SwiftUI.Color(red: 0.27, green: 0.56, blue: 0.24)
        static let money        = SwiftUI.Color(red: 0.94, green: 0.74, blue: 0.20)
        static let xp           = SwiftUI.Color(red: 0.35, green: 0.55, blue: 0.86)
        static let textPrimary  = SwiftUI.Color.white
        static let textSecondary = SwiftUI.Color.white.opacity(0.82)

        static let barnWallTop    = adaptive(light: UIColor(red: 0.77, green: 0.55, blue: 0.35, alpha: 1),
                                             dark:  UIColor(red: 0.30, green: 0.22, blue: 0.14, alpha: 1))
        static let barnWallBottom = adaptive(light: UIColor(red: 0.48, green: 0.32, blue: 0.20, alpha: 1),
                                             dark:  UIColor(red: 0.18, green: 0.13, blue: 0.10, alpha: 1))
        static let barnPlankA     = adaptive(light: UIColor(red: 0.62, green: 0.43, blue: 0.28, alpha: 1),
                                             dark:  UIColor(red: 0.23, green: 0.17, blue: 0.12, alpha: 1))
        static let barnPlankB     = adaptive(light: UIColor(red: 0.57, green: 0.39, blue: 0.25, alpha: 1),
                                             dark:  UIColor(red: 0.20, green: 0.14, blue: 0.10, alpha: 1))
        static let barnBeam       = adaptive(light: UIColor(red: 0.42, green: 0.28, blue: 0.17, alpha: 1),
                                             dark:  UIColor(red: 0.12, green: 0.08, blue: 0.06, alpha: 1))
        static let barnGlow       = adaptive(light: UIColor(red: 1.0,  green: 0.88, blue: 0.67, alpha: 0.35),
                                             dark:  UIColor(red: 0.85, green: 0.66, blue: 0.35, alpha: 0.18))
        static let surfaceElevated = adaptive(light: UIColor.white.withAlphaComponent(0.42),
                                              dark:  UIColor.black.withAlphaComponent(0.28))
        static let shelfSurface    = adaptive(light: UIColor.white.withAlphaComponent(0.26),
                                              dark:  UIColor.black.withAlphaComponent(0.30))
        static let chipActive   = adaptive(light: UIColor(red: 0.25, green: 0.46, blue: 0.22, alpha: 0.95),
                                           dark:  UIColor(red: 0.32, green: 0.58, blue: 0.28, alpha: 0.95))
        static let chipInactive = adaptive(light: UIColor.white.withAlphaComponent(0.26),
                                           dark:  UIColor.black.withAlphaComponent(0.34))

        // Semantic colors
        static let success = SwiftUI.Color(red: 0.26, green: 0.72, blue: 0.38)
        static let warning = SwiftUI.Color(red: 0.92, green: 0.68, blue: 0.18)
        static let error   = SwiftUI.Color(red: 0.85, green: 0.25, blue: 0.25)
        static let info    = SwiftUI.Color(red: 0.40, green: 0.62, blue: 0.92)

        private static func adaptive(light: UIColor, dark: UIColor) -> SwiftUI.Color {
            SwiftUI.Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? dark : light })
        }
    }

    static let shadow = SwiftUI.Color.black.opacity(0.2)
}

// MARK: - CardContainer

struct CardContainer<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .environment(\.colorScheme, .dark)
            .padding(DS.Space.md)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    SwiftUI.Color(red: 0.55, green: 0.35, blue: 0.15),
                                    SwiftUI.Color(red: 0.40, green: 0.20, blue: 0.05)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    // Outer stroke
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .strokeBorder(SwiftUI.Color(red: 0.30, green: 0.15, blue: 0.05).opacity(0.8), lineWidth: 2)
                    // Inner highlight
                    RoundedRectangle(cornerRadius: DS.Radius.lg - 2, style: .continuous)
                        .strokeBorder(SwiftUI.Color.white.opacity(0.10), lineWidth: 1)
                        .padding(2)
                }
            }
            .shadow(
                color: DS.Shadow.card.color,
                radius: DS.Shadow.card.radius,
                x: DS.Shadow.card.x,
                y: DS.Shadow.card.y
            )
    }
}

// MARK: - WoodenPanel

struct WoodenPanel<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .environment(\.colorScheme, .dark)
            .padding(DS.Space.md)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    SwiftUI.Color(red: 0.60, green: 0.40, blue: 0.20),
                                    SwiftUI.Color(red: 0.45, green: 0.25, blue: 0.10)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .strokeBorder(SwiftUI.Color(red: 0.35, green: 0.20, blue: 0.05), lineWidth: 3)
                    // Inner shine
                    RoundedRectangle(cornerRadius: DS.Radius.lg - 3, style: .continuous)
                        .strokeBorder(SwiftUI.Color.white.opacity(0.08), lineWidth: 1)
                        .padding(3)
                }
            }
            .shadow(
                color: DS.Shadow.card.color,
                radius: DS.Shadow.card.radius,
                x: DS.Shadow.card.x,
                y: DS.Shadow.card.y
            )
    }
}

// MARK: - SettingsSection

struct SettingsSection<Content: View>: View {
    let title: String
    let icon: String
    let iconColor: SwiftUI.Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            // Section Header
            HStack(spacing: DS.Space.xs) {
                Image(systemName: icon)
                    .font(.system(.subheadline, weight: .semibold))
                    .foregroundStyle(iconColor)
                    .frame(width: 24, height: 24)
                    .background(
                        Circle()
                            .fill(iconColor.opacity(0.15))
                    )

                Text(title)
                    .font(.system(.subheadline, design: .rounded, weight: .semibold))
                    .foregroundStyle(DS.Color.textPrimary)
            }
            .padding(.horizontal, DS.Space.sm)

            // Content Card
            VStack(spacing: 0) {
                content
            }
            .background(
                RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                SwiftUI.Color.white.opacity(0.12),
                                SwiftUI.Color.white.opacity(0.04)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                            .strokeBorder(SwiftUI.Color.white.opacity(0.10), lineWidth: 1)
                    )
            )
            .shadow(
                color: DS.Shadow.soft.color,
                radius: DS.Shadow.soft.radius,
                x: DS.Shadow.soft.x,
                y: DS.Shadow.soft.y
            )
        }
    }
}

// MARK: - SettingRow

struct SettingRow<Control: View>: View {
    let icon: String
    let title: String
    let subtitle: String?
    let iconBackground: SwiftUI.Color
    @ViewBuilder let control: Control

    var body: some View {
        HStack(spacing: DS.Space.md) {
            // Icon
            Image(systemName: icon)
                .font(.system(.body, weight: .medium))
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .background(
                    RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                        .fill(iconBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                                .strokeBorder(SwiftUI.Color.white.opacity(0.20), lineWidth: 1)
                        )
                )
                .shadow(color: iconBackground.opacity(0.4), radius: 4, x: 0, y: 2)

            // Text
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(.body, design: .rounded, weight: .medium))
                    .foregroundStyle(DS.Color.textPrimary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(DS.Color.textSecondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Control
            control
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, DS.Space.sm)
    }
}

// MARK: - CustomToggleStyle

struct FarmToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack {
            configuration.label
            Spacer()
            Button(action: { configuration.isOn.toggle() }) {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(configuration.isOn ? DS.Color.accent : SwiftUI.Color.white.opacity(0.15))
                    .frame(width: 52, height: 32)
                    .overlay(
                        Circle()
                            .fill(.white)
                            .frame(width: 28, height: 28)
                            .shadow(color: .black.opacity(0.15), radius: 2, x: 0, y: 1)
                            .offset(x: configuration.isOn ? 9 : -9)
                            .animation(DS.Animation.spring, value: configuration.isOn)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .strokeBorder(SwiftUI.Color.white.opacity(0.20), lineWidth: 1)
                    )
            }
            .buttonStyle(.plain)
        }
    }
}

// MARK: - AnimatedNumber

struct AnimatedNumber: View {
    let value: Int
    let formatter: NumberFormatter?
    let font: Font
    let color: SwiftUI.Color

    @State private var displayValue: Int = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    init(
        value: Int,
        formatter: NumberFormatter? = nil,
        font: Font = .system(.title2, design: .rounded, weight: .bold),
        color: SwiftUI.Color = DS.Color.money
    ) {
        self.value = value
        self.formatter = formatter
        self.font = font
        self.color = color
    }

    var body: some View {
        Text(formattedValue)
            .font(font)
            .foregroundStyle(color)
            .onAppear {
                displayValue = value
            }
            .onChange(of: value) { oldValue, newValue in
                if reduceMotion {
                    displayValue = newValue
                } else {
                    withAnimation(DS.Animation.count) {
                        displayValue = newValue
                    }
                }
            }
    }

    private var formattedValue: String {
        if let formatter = formatter {
            return formatter.string(from: NSNumber(value: displayValue)) ?? "\(displayValue)"
        }
        return "\(displayValue)"
    }
}

// MARK: - WoodActionStyle

struct WoodActionStyle: ButtonStyle {
    var tint: SwiftUI.Color = DS.Color.money

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, design: .rounded, weight: .bold))
            .foregroundStyle(SwiftUI.Color(red: 0.22, green: 0.12, blue: 0.04))
            .frame(maxWidth: .infinity)
            .padding(.vertical, DS.Space.sm)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [tint.opacity(0.95), tint.opacity(0.78)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                        .strokeBorder(SwiftUI.Color.black.opacity(0.18), lineWidth: 1)
                    RoundedRectangle(cornerRadius: DS.Radius.md - 1, style: .continuous)
                        .strokeBorder(SwiftUI.Color.white.opacity(0.28), lineWidth: 1.5)
                        .padding(1.5)
                }
            }
            .shadow(color: tint.opacity(configuration.isPressed ? 0.15 : 0.32),
                    radius: configuration.isPressed ? 2 : 6,
                    x: 0,
                    y: configuration.isPressed ? 1 : 3)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(DS.Animation.spring, value: configuration.isPressed)
    }
}

// MARK: - PrimaryButtonStyle

struct PrimaryButtonStyle: ButtonStyle {
    var tint: SwiftUI.Color = DS.Color.accent

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, design: .rounded, weight: .semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, DS.Space.sm)
            .background(
                tint.opacity(configuration.isPressed ? 0.75 : 1.0),
                in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
            )
            .foregroundStyle(.white)
            .shadow(color: tint.opacity(0.35),
                    radius: configuration.isPressed ? 2 : 8,
                    x: 0,
                    y: configuration.isPressed ? 1 : 4)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(DS.Animation.spring, value: configuration.isPressed)
    }
}

// MARK: - GlassButtonStyle (for sheets/detail views on light bg)

struct GlassButtonStyle: ButtonStyle {
    var tint: SwiftUI.Color = DS.Color.accent
    var isDestructive: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.subheadline, design: .rounded, weight: .semibold))
            .foregroundStyle(isDestructive ? .red : tint)
            .frame(maxWidth: .infinity)
            .padding(.vertical, DS.Space.sm)
            .background(
                (isDestructive ? SwiftUI.Color.red : tint).opacity(configuration.isPressed ? 0.14 : 0.10),
                in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .strokeBorder((isDestructive ? SwiftUI.Color.red : tint).opacity(0.28), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(DS.Animation.micro, value: configuration.isPressed)
    }
}

// MARK: - SecondaryButtonStyle

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, design: .rounded, weight: .semibold))
            .foregroundStyle(DS.Color.textPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, DS.Space.sm)
            .background(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .fill(SwiftUI.Color.white.opacity(configuration.isPressed ? 0.10 : 0.15))
            )
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .strokeBorder(SwiftUI.Color.white.opacity(0.20), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(DS.Animation.micro, value: configuration.isPressed)
    }
}

// MARK: - Background

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
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
        )
    }
}
