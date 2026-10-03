import XCTest
import SwiftUI
import UIKit
@testable import FarmSim

final class MarketPresentationTests: XCTestCase {
    @MainActor
    func testEveryDepartmentHasAnAvailableSystemSymbol() {
        for department in MarketSection.allCases {
            XCTAssertNotNil(UIImage(systemName: department.symbol), department.title)
        }
    }

    @MainActor
    func testMarketTextAndPrimaryActionsHaveReadableTokenContrast() async {
        func luminance(_ color: Color) -> Double {
            var red: CGFloat = 0
            var green: CGFloat = 0
            var blue: CGFloat = 0
            var alpha: CGFloat = 0
            XCTAssertTrue(UIColor(color).getRed(&red, green: &green, blue: &blue, alpha: &alpha))
            func linear(_ value: CGFloat) -> Double {
                let value = Double(value)
                return value <= 0.04045 ? value / 12.92 : pow((value + 0.055) / 1.055, 2.4)
            }
            return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
        }
        func contrast(_ first: Color, _ second: Color) -> Double {
            let a = luminance(first)
            let b = luminance(second)
            return (max(a, b) + 0.05) / (min(a, b) + 0.05)
        }
        XCTAssertGreaterThanOrEqual(contrast(MarketPalette.ink, MarketPalette.paper), 4.5)
        XCTAssertGreaterThanOrEqual(contrast(MarketPalette.muted, MarketPalette.paper), 4.5)
        XCTAssertGreaterThanOrEqual(contrast(.white, MarketPalette.leaf), 4.5)
        XCTAssertGreaterThanOrEqual(contrast(MarketPalette.ink, MarketPalette.honey), 4.5)
        XCTAssertGreaterThanOrEqual(contrast(MarketPalette.muted, MarketPalette.canvas), 4.5)
        for color in [MarketPalette.leaf, MarketPalette.warning, MarketPalette.danger, MarketPalette.info] {
            XCTAssertGreaterThanOrEqual(contrast(color, MarketPalette.paper), 4.5)
        }
    }
}
