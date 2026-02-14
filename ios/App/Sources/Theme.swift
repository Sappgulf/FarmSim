import SwiftUI

// MARK: - Theme Enhancements

enum Theme {
    // Background gradient
    static let skyTop = Color(red: 0.98, green: 0.82, blue: 0.60)
    static let skyBottom = Color(red: 0.40, green: 0.62, blue: 0.35)

    // Accent
    static let coinGold = Color(red: 0.95, green: 0.74, blue: 0.18)
    static let xpBlue = Color(red: 0.37, green: 0.58, blue: 0.88)

    // Semantic colors - these adapt automatically via SwiftUI's dark mode
    static let ready = Color(red: 0.30, green: 0.74, blue: 0.36)
    static let locked = Color(red: 0.58, green: 0.52, blue: 0.44)
    static let warning = Color(red: 0.92, green: 0.68, blue: 0.18)
    static let success = Color(red: 0.26, green: 0.72, blue: 0.38)
    static let info = Color(red: 0.40, green: 0.62, blue: 0.92)
    static let error = Color(red: 0.85, green: 0.25, blue: 0.25)
    static let destructive = Color(red: 0.92, green: 0.28, blue: 0.28)

    // Dark mode enhanced variants (brighter for visibility in dark mode)
    static let readyDark = Color(red: 0.35, green: 0.82, blue: 0.42)
    static let warningDark = Color(red: 0.95, green: 0.72, blue: 0.25)
    static let successDark = Color(red: 0.32, green: 0.78, blue: 0.45)
    static let infoDark = Color(red: 0.45, green: 0.68, blue: 0.95)
    static let errorDark = Color(red: 0.95, green: 0.35, blue: 0.35)

    // Seasonal accent tints
    static let seasonSpring = Color(red: 0.42, green: 0.78, blue: 0.42)
    static let seasonSummer = Color(red: 0.95, green: 0.68, blue: 0.22)
    static let seasonFall = Color(red: 0.82, green: 0.52, blue: 0.22)
    static let seasonWinter = Color(red: 0.55, green: 0.72, blue: 0.88)

    // Card
    static let cardStroke = Color.white.opacity(0.18)
    static let cardGlow = Color.white.opacity(0.08)

    // Farm-themed backgrounds
    static let soilBrown = Color(red: 0.55, green: 0.38, blue: 0.24)
    static let soilBrownLight = Color(red: 0.68, green: 0.50, blue: 0.35)
    static let barnRed = Color(red: 0.72, green: 0.22, blue: 0.18)
    static let barnRedDark = Color(red: 0.55, green: 0.15, blue: 0.12)
    static let wheatGold = Color(red: 0.92, green: 0.78, blue: 0.42)
    static let leafGreen = Color(red: 0.35, green: 0.62, blue: 0.28)
    static let skyBlue = Color(red: 0.52, green: 0.78, blue: 0.92)

    // Gradients
    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [skyTop, skyBottom],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static var cardGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color.white.opacity(0.15),
                Color.white.opacity(0.05)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var cardGradientElevated: LinearGradient {
        LinearGradient(
            colors: [
                Color.white.opacity(0.22),
                Color.white.opacity(0.08)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var warmSunsetGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(red: 0.98, green: 0.72, blue: 0.42),
                Color(red: 0.92, green: 0.48, blue: 0.38)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var meadowGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(red: 0.42, green: 0.72, blue: 0.38),
                Color(red: 0.28, green: 0.55, blue: 0.32)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static var barnWoodGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(red: 0.62, green: 0.42, blue: 0.28),
                Color(red: 0.48, green: 0.32, blue: 0.20)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static var soilGradient: LinearGradient {
        LinearGradient(
            colors: [soilBrownLight, soilBrown],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static var skyGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(red: 0.58, green: 0.82, blue: 0.95),
                Color(red: 0.38, green: 0.68, blue: 0.88)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static var goldenHourGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(red: 0.98, green: 0.78, blue: 0.45),
                Color(red: 0.92, green: 0.55, blue: 0.38),
                Color(red: 0.75, green: 0.42, blue: 0.48)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Adaptive Semantic Colors

    static var infoAdaptive: Color {
        Color(red: 0.40, green: 0.62, blue: 0.92)
    }

    static var successAdaptive: Color {
        Color(red: 0.26, green: 0.72, blue: 0.38)
    }

    static var warningAdaptive: Color {
        Color(red: 0.92, green: 0.68, blue: 0.18)
    }

    static var errorAdaptive: Color {
        Color(red: 0.85, green: 0.25, blue: 0.25)
    }
}

// MARK: - Adaptive Color Helper View Modifier

struct AdaptiveColorModifier: ViewModifier {
    let light: Color
    let dark: Color
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content.foregroundStyle(colorScheme == .dark ? dark : light)
    }
}

extension View {
    func adaptiveForegroundColor(light: Color, dark: Color) -> some View {
        modifier(AdaptiveColorModifier(light: light, dark: dark))
    }
}
