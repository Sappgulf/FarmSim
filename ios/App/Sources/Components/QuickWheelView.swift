import SwiftUI

struct QuickWheelItem: Identifiable, Equatable {
    let id: String
    let icon: String // System image name
    let label: String
    let action: () -> Void
    
    static func == (lhs: QuickWheelItem, rhs: QuickWheelItem) -> Bool {
        lhs.id == rhs.id
    }
}

struct QuickWheelView: View {
    let items: [QuickWheelItem]
    let center: CGPoint
    let onDismiss: () -> Void
    
    @State private var dragLocation: CGPoint = .zero
    @State private var selectedIndex: Int? = nil
    @State private var appear = false
    
    private let radius: CGFloat = 80
    private let innerRadius: CGFloat = 30
    
    private var wheelSize: CGFloat { radius * 3.2 }
    
    var body: some View {
        ZStack {
            dimmedBackground
            
            wheelContent
                .scaleEffect(appear ? 1.0 : 0.01)
                .opacity(appear ? 1.0 : 0)
                .animation(.spring(response: 0.35, dampingFraction: 0.7), value: appear)
                .position(center)
        }
        .gesture(
            DragGesture(minimumDistance: 0, coordinateSpace: .global)
                .onChanged { value in
                    dragLocation = value.location
                    updateSelection(at: value.location)
                }
                .onEnded { value in
                    if let index = selectedIndex {
                        let generator = UIImpactFeedbackGenerator(style: .medium)
                        generator.impactOccurred()
                        items[index].action()
                    }
                    withAnimation(.easeOut(duration: 0.2)) {
                        onDismiss()
                    }
                }
        )
        .onAppear {
            appear = true
        }
    }
    
    private var dimmedBackground: some View {
        Color.black.opacity(0.01)
            .ignoresSafeArea()
            .onTapGesture {
                withAnimation(.easeOut(duration: 0.15)) {
                    onDismiss()
                }
            }
    }
    
    private var wheelContent: some View {
        ZStack {
            backgroundCircle
            segmentGuides
            indicators
            selectionHighlight
        }
        .frame(width: wheelSize, height: wheelSize)
    }
    
    private var backgroundCircle: some View {
        Circle()
            .fill(.regularMaterial)
            .overlay(
                Circle().stroke(.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
    }
    
    private var segmentGuides: some View {
        let count = items.count
        return ForEach(0..<count, id: \.self) { index in
            guideLine(at: index)
        }
    }
    
    private func guideLine(at index: Int) -> some View {
        let count = Double(items.count)
        let angle = 2 * .pi / count * Double(index) + .pi / count
        return Rectangle()
            .fill(.white.opacity(0.1))
            .frame(width: 1, height: radius * 1.5)
            .offset(y: -radius * 0.75)
            .rotationEffect(.radians(angle))
    }
    
    private var indicators: some View {
        let count = items.count
        return ForEach(0..<count, id: \.self) { index in
            indicatorRow(at: index)
        }
    }
    
    private func indicatorRow(at index: Int) -> some View {
        let count = Double(items.count)
        let angle = 2 * .pi / count * Double(index) - .pi / 2
        let x = cos(angle) * radius
        let y = sin(angle) * radius
        return indicatorItem(index: index, isSelected: selectedIndex == index)
            .position(x: wheelSize/2 + x, y: wheelSize/2 + y)
    }
    
    private func indicatorItem(index: Int, isSelected: Bool) -> some View {
        VStack(spacing: 4) {
            Image(systemName: items[index].icon)
                .font(.system(size: 24, weight: isSelected ? .bold : .regular))
                .foregroundStyle(isSelected ? .white : .primary)
                .shadow(color: isSelected ? .black.opacity(0.3) : .clear, radius: 2, x: 0, y: 1)
                .scaleEffect(isSelected ? 1.2 : 1.0)
            
            Text(items[index].label)
                .font(.caption2.weight(.medium))
                .foregroundStyle(isSelected ? .white : .secondary)
                .shadow(color: isSelected ? .black.opacity(0.3) : .clear, radius: 2, x: 0, y: 1)
        }
    }
    
    @ViewBuilder
    private var selectionHighlight: some View {
        if let index = selectedIndex {
            let count = Double(items.count)
            let angle = 2 * .pi / count * Double(index) - .pi / 2 - .pi / count
            Circle()
                .trim(from: 0, to: 1.0 / CGFloat(items.count))
                .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                .rotationEffect(.radians(angle))
                .frame(width: radius * 3.0, height: radius * 3.0)
        }
    }
    
    private func updateSelection(at location: CGPoint) {
        let dx = location.x - center.x
        let dy = location.y - center.y
        let dist = sqrt(dx*dx + dy*dy)
        
        if dist < innerRadius {
            if selectedIndex != nil {
                selectedIndex = nil
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            }
            return
        }
        
        var angle = atan2(dy, dx)
        angle += .pi / 2
        if angle < 0 { angle += 2 * .pi }
        
        let segmentAngle = 2 * .pi / Double(items.count)
        let shiftedAngle = angle + segmentAngle / 2
        var index = Int(shiftedAngle / segmentAngle)
        index = index % items.count
        
        if selectedIndex != index {
            selectedIndex = index
            let generator = UISelectionFeedbackGenerator()
            generator.selectionChanged()
        }
    }
}
