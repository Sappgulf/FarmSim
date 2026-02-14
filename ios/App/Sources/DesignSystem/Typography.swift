import SwiftUI

/// Unified typography scale — all entries use `.rounded` for a cohesive cozy feel.
enum Typography {
    /// Hero display text — main menu title, splash screens.
    static let display = Font.system(.largeTitle, design: .rounded).weight(.black)

    /// Primary screen titles.
    static let title = Font.system(.title2, design: .rounded).weight(.bold)

    /// Secondary titles / card headers.
    static let title3 = Font.system(.title3, design: .rounded).weight(.semibold)

    /// Section headers, grouped list labels.
    static let section = Font.system(.headline, design: .rounded).weight(.semibold)

    /// Standard body copy.
    static let body = Font.system(.body, design: .rounded)

    /// Emphasized body — values, key info.
    static let bodyStrong = Font.system(.body, design: .rounded).weight(.semibold)

    /// UI labels — chip text, pill badges, row subtitles.
    static let label = Font.system(.subheadline, design: .rounded).weight(.medium)

    /// Captions, secondary metadata.
    static let caption = Font.system(.caption, design: .rounded)

    /// Small captions, fine print.
    static let small = Font.system(.caption2, design: .rounded)

    /// Monospaced metric values — coins, XP, countdowns.
    static let metric = Font.system(.subheadline, design: .monospaced).weight(.semibold)

    /// Monospaced small metric — compact stat displays.
    static let metricSmall = Font.system(.caption, design: .monospaced).weight(.semibold)
}
