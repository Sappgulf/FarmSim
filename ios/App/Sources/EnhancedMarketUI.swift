import SwiftUI

// MARK: - Price Sparkline

/// A simple polyline chart showing price history. Takes `data: [Int]` oldest→newest.
struct PriceSparkline: View {
    let data: [Int]
    let color: Color

    var body: some View {
        GeometryReader { geometry in
            Path { path in
                guard data.count > 1,
                      let minValue = data.min(),
                      let maxValue = data.max(),
                      maxValue > minValue else { return }

                let width = geometry.size.width
                let height = geometry.size.height
                let stepX = width / CGFloat(data.count - 1)
                let range = CGFloat(maxValue - minValue)

                for (index, value) in data.enumerated() {
                    let x = CGFloat(index) * stepX
                    let y = height - ((CGFloat(value - minValue) / range) * height)

                    if index == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            .stroke(color, style: StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round))
        }
    }
}
