import SwiftUI

enum Typography {
    static let title = Font.system(.title2, design: .rounded).weight(.bold)
    static let section = Font.system(.headline, design: .rounded).weight(.semibold)
    static let body = Font.system(.body, design: .default)
    static let bodyStrong = Font.system(.body, design: .default).weight(.semibold)
    static let caption = Font.system(.caption, design: .default)
    static let metric = Font.system(.subheadline, design: .monospaced).weight(.semibold)
}
