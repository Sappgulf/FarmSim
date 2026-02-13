import SwiftUI

enum Theme {
    // Background gradient
    static let skyTop = Color(red: 0.98, green: 0.82, blue: 0.60)
    static let skyBottom = Color(red: 0.40, green: 0.62, blue: 0.35)

    // Accent
    static let coinGold = Color(red: 0.95, green: 0.74, blue: 0.18)
    static let xpBlue = Color(red: 0.37, green: 0.58, blue: 0.88)

    // Semantic
    static let ready = Color(red: 0.30, green: 0.74, blue: 0.36)
    static let locked = Color(red: 0.58, green: 0.52, blue: 0.44)
    static let warning = Color(red: 0.92, green: 0.68, blue: 0.18)
    static let success = Color(red: 0.26, green: 0.72, blue: 0.38)
    static let info = Color(red: 0.40, green: 0.62, blue: 0.92)

    // Seasonal accent tints
    static let seasonSpring = Color(red: 0.42, green: 0.78, blue: 0.42)
    static let seasonSummer = Color(red: 0.95, green: 0.68, blue: 0.22)
    static let seasonFall = Color(red: 0.82, green: 0.52, blue: 0.22)
    static let seasonWinter = Color(red: 0.55, green: 0.72, blue: 0.88)

    // Card
    static let cardStroke = Color.white.opacity(0.18)
    static let cardGlow = Color.white.opacity(0.08)

    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [skyTop, skyBottom],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}
