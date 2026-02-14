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
    
    var body: some View {
        ZStack {
            // Dimmed background - distinct capture for dismiss
            Color.black.opacity(0.01) // Nearly invisible to catch taps
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation(.easeOut(duration: 0.15)) {
                        onDismiss()
                    }
                }
            
            // The Wheel
            ZStack {
                // Background Circle (Glassmorphism)
                Circle()
                    .fill(.regularMaterial)
                    .frame(width: radius * 3.2, height: radius * 3.2)
                    .overlay(
                        Circle().stroke(.white.opacity(0.2), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                
                // Segment Guides (Optional visual lines)
                ForEach(0..<items.count, id: \.self) { index in
                    Rectangle()
                        .fill(.white.opacity(0.1))
                        .frame(width: 1, height: radius * 1.5)
                        .offset(y: -radius * 0.75)
                        .rotationEffect(.radians(2 * .pi / Double(items.count) * Double(index) + .pi / Double(items.count)))
                }
                
                // Indicators
                ForEach(0..<items.count, id: \.self) { index in
                    let angle = 2 * .pi / Double(items.count) * Double(index) - .pi / 2
                    let isSelected = selectedIndex == index
                    
                    // Position relative to center of the wheel (0,0 is center of ZStack here)
                    let x = cos(angle) * (radius)
                    let y = sin(angle) * (radius)
                    
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
                    .position(x: radius * 1.6 + x, y: radius * 1.6 + y) // Offset explicitly to match frame size
                    .frame(width: radius * 3.2, height: radius * 3.2, alignment: .topLeading) // Wrapper to position content
                }
            }
            .frame(width: radius * 3.2, height: radius * 3.2)
            .position(center)
            .scaleEffect(appear ? 1.0 : 0.01)
            .opacity(appear ? 1.0 : 0)
            .animation(.spring(response: 0.35, dampingFraction: 0.7), value: appear)
            
            // Selection Highlight (Optional, active segment)
            if let index = selectedIndex {
                Circle()
                    .trim(from: 0, to: 1.0 / CGFloat(items.count))
                    .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.radians(2 * .pi / Double(items.count) * Double(index) - .pi / 2 - .pi / Double(items.count)))
                    .frame(width: radius * 3.0, height: radius * 3.0)
                    .position(center)
            }
        }
        .gesture(
            DragGesture(minimumDistance: 0, coordinateSpace: .global)
                .onChanged { value in
                    dragLocation = value.location
                    updateSelection(at: value.location)
                }
                .onEnded { value in
                    if let index = selectedIndex {
                        // Impact feedback
                        let generator = UIImpactFeedbackGenerator(style: .medium)
                        generator.impactOccurred()
                        
                        // Execute action
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
    
    private func updateSelection(at location: CGPoint) {
        let dx = location.x - center.x
        let dy = location.y - center.y
        let dist = sqrt(dx*dx + dy*dy)
        
        // Dead zone in center
        if dist < innerRadius {
            if selectedIndex != nil {
                selectedIndex = nil
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            }
            return
        }
        
        // Calculate angle. 
        // standard atan2 returns angle from x-axis. 
        // We want 0 at top (-pi/2 in standard).
        var angle = atan2(dy, dx)
        angle += .pi / 2 // Rotate so 0 is up
        if angle < 0 { angle += 2 * .pi }
        
        let segmentAngle = 2 * .pi / Double(items.count)
        
        // Shift angle by half segment so item is centered in segment
        let shiftedAngle = angle + segmentAngle / 2
        var index = Int(shiftedAngle / segmentAngle)
        
        // Wrap index
        index = index % items.count
        
        if selectedIndex != index {
            selectedIndex = index
            let generator = UISelectionFeedbackGenerator()
            generator.selectionChanged()
        }
    }
}
