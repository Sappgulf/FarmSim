import SwiftUI

enum Theme {
    // Background gradient
    static let skyTop = Color(red: 0.55, green: 0.80, blue: 0.95)
    static let skyBottom = Color(red: 0.34, green: 0.62, blue: 0.40)

    // Accent
    static let coinGold = Color(red: 0.95, green: 0.78, blue: 0.22)
    static let xpBlue = Color(red: 0.40, green: 0.68, blue: 0.95)

    // Semantic
    static let ready = Color(red: 0.30, green: 0.80, blue: 0.38)
    static let locked = Color(red: 0.55, green: 0.55, blue: 0.58)

    // Card
    static let cardStroke = Color.white.opacity(0.18)

    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [skyTop, skyBottom],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}
