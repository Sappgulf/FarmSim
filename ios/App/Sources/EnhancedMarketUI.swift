import SwiftUI

// MARK: - Price Trend Model

struct PriceTrend: Identifiable {
    let id = UUID()
    let cropID: String
    let currentPrice: Int
    let previousPrice: Int
    let history: [Int] // Last 7 days
    
    var change: Int {
        currentPrice - previousPrice
    }
    
    var changePercentage: Double {
        guard previousPrice > 0 else { return 0 }
        return Double(change) / Double(previousPrice) * 100
    }
    
    var trend: TrendDirection {
        if changePercentage > 5 {
            return .rising
        } else if changePercentage < -5 {
            return .falling
        } else {
            return .stable
        }
    }
    
    enum TrendDirection {
        case rising, falling, stable
        
        var icon: String {
            switch self {
            case .rising: return "arrow.up.forward"
            case .falling: return "arrow.down.forward"
            case .stable: return "arrow.forward"
            }
        }
        
        var color: Color {
            switch self {
            case .rising: return .green
            case .falling: return .red
            case .stable: return .gray
            }
        }
    }
}

// MARK: - Market News

struct MarketNews: Identifiable {
    let id = UUID()
    let headline: String
    let affectedCrops: [String]
    let impact: Impact
    let timestamp: Date
    
    enum Impact {
        case positive, negative, neutral
        
        var color: Color {
            switch self {
            case .positive: return .green
            case .negative: return .red
            case .neutral: return .gray
            }
        }
        
        var icon: String {
            switch self {
            case .positive: return "arrow.up.circle.fill"
            case .negative: return "arrow.down.circle.fill"
            case .neutral: return "minus.circle.fill"
            }
        }
    }
}

// MARK: - Enhanced Market View Components

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
            .stroke(color, lineWidth: 2)
        }
    }
}

struct PriceTrendBadge: View {
    let trend: PriceTrend
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: trend.trend.icon)
                .font(.system(.caption, weight: .bold))
            
            Text("\(abs(Int(trend.changePercentage)))%")
                .font(.system(.caption, weight: .semibold))
        }
        .foregroundStyle(trend.trend.color)
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(
            Capsule()
                .fill(trend.trend.color.opacity(0.15))
        )
    }
}

struct MarketTickerView: View {
    let news: [MarketNews]
    @State private var currentIndex = 0
    @State private var timer: Timer?
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "newspaper.fill")
                .foregroundStyle(.yellow)
            
            if let current = news[safe: currentIndex] {
                HStack(spacing: 4) {
                    Image(systemName: current.impact.icon)
                        .foregroundStyle(current.impact.color)
                    
                    Text(current.headline)
                        .font(.system(.caption, weight: .medium))
                        .lineLimit(1)
                }
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .move(edge: .leading).combined(with: .opacity)
                ))
                .id(current.id)
            }
            
            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(.ultraThinMaterial)
        )
        .onAppear {
            startTicker()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private func startTicker() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                currentIndex = (currentIndex + 1) % max(news.count, 1)
            }
        }
    }
}

struct EnhancedCropCard: View {
    let cropName: String
    let emoji: String
    let price: Int
    let trend: PriceTrend?
    let quantity: Int
    let onSell: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(emoji)
                    .font(.system(size: 32))
                
                Spacer()
                
                if let trend = trend {
                    PriceTrendBadge(trend: trend)
                }
            }
            
            Text(cropName)
                .font(.system(.subheadline, weight: .semibold))
                .foregroundStyle(.primary)
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(price) coins")
                        .font(.system(.callout, weight: .bold))
                        .foregroundStyle(Theme.coinGold)
                    
                    if let trend = trend, trend.data.count > 1 {
                        PriceSparkline(data: trend.history, color: trend.trend.color)
                            .frame(height: 20)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("×\(quantity)")
                        .font(.system(.callout, weight: .medium))
                        .foregroundStyle(.secondary)
                    
                    Button(action: {
                        withAnimation(.spring(response: 0.3)) {
                            isPressed = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                            isPressed = false
                            onSell()
                        }
                    }) {
                        Image(systemName: "dollarsign.circle.fill")
                            .font(.system(.title2))
                            .foregroundStyle(Theme.coinGold)
                    }
                    .scaleEffect(isPressed ? 0.85 : 1.0)
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Theme.cardStroke, lineWidth: 1)
        )
    }
}

struct BulkSellOverlay: View {
    let cropName: String
    let quantity: Int
    let unitPrice: Int
    let onConfirm: (Int) -> Void
    let onCancel: () -> Void
    
    @State private var sellQuantity: Double = 1
    
    var totalValue: Int {
        Int(sellQuantity) * unitPrice
    }
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture { onCancel() }
            
            VStack(spacing: 16) {
                Text("Sell \(cropName)")
                    .font(.system(.title2, weight: .bold))
                
                VStack(spacing: 8) {
                    HStack {
                        Text("Quantity:")
                        Spacer()
                        Text("\(Int(sellQuantity))")
                            .font(.system(.title3, weight: .bold))
                    }
                    
                    Slider(value: $sellQuantity, in: 1...Double(quantity), step: 1)
                    
                    HStack {
                        Text("1")
                        Spacer()
                        Text("\(quantity)")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                
                Divider()
                
                HStack {
                    Text("Total:")
                    Spacer()
                    Text("\(totalValue) coins")
                        .font(.system(.title3, weight: .bold))
                        .foregroundStyle(Theme.coinGold)
                }
                
                HStack(spacing: 12) {
                    Button("Cancel") {
                        onCancel()
                    }
                    .buttonStyle(SecondaryButtonStyle())
                    
                    Button("Sell") {
                        onConfirm(Int(sellQuantity))
                    }
                    .buttonStyle(PrimaryButtonStyle())
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
            )
            .padding(40)
        }
    }
}

// MARK: - Button Styles

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Theme.coinGold)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, weight: .semibold))
            .foregroundStyle(.primary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(.gray.opacity(0.2))
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

// MARK: - Array Safety Extension

extension Array {
    subscript(safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 16) {
        let trend = PriceTrend(
            cropID: "wheat",
            currentPrice: 25,
            previousPrice: 20,
            history: [18, 19, 20, 22, 21, 23, 25]
        )
        
        PriceTrendBadge(trend: trend)
        
        PriceSparkline(data: trend.history, color: .green)
            .frame(height: 40)
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
        
        EnhancedCropCard(
            cropName: "Wheat",
            emoji: "🌾",
            price: 25,
            trend: trend,
            quantity: 42,
            onSell: {}
        )
        .padding(.horizontal)
    }
    .padding()
}
