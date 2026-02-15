import UIKit
import CoreHaptics

// MARK: - Enhanced Haptic Patterns

@MainActor
final class HapticPatterns {
    static let shared = HapticPatterns()
    
    private var engine: CHHapticEngine?
    private var impactGenerators: [UIImpactFeedbackGenerator.FeedbackStyle: UIImpactFeedbackGenerator] = [:]
    private var notificationGenerator: UINotificationFeedbackGenerator?
    
    private init() {
        setupHapticEngine()
        setupBasicGenerators()
    }
    
    private func setupBasicGenerators() {
        // Cache impact generators for common styles
        let styles: [UIImpactFeedbackGenerator.FeedbackStyle] = [.light, .medium, .heavy, .soft, .rigid]
        for style in styles {
            impactGenerators[style] = UIImpactFeedbackGenerator(style: style)
        }
        notificationGenerator = UINotificationFeedbackGenerator()
    }
    
    private func setupHapticEngine() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        
        do {
            engine = try CHHapticEngine()
            try engine?.start()
        } catch {
            print("Failed to start haptic engine: \(error)")
        }
    }
    
    // MARK: - Basic Haptics
    
    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        impactGenerators[style]?.impactOccurred()
    }
    
    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle, intensity: CGFloat) {
        impactGenerators[style]?.impactOccurred(intensity: intensity)
    }
    
    func notify(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        notificationGenerator?.notificationOccurred(type)
    }
    
    // MARK: - Pattern Haptics
    
    /// Success pattern: Light → Medium → Success notification
    func success() {
        let pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.light, 0.0),
            (.medium, 0.08),
        ]
        
        executePattern(pattern)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            self?.notify(.success)
        }
    }
    
    /// Error pattern: Heavy rigid → Error notification
    func error() {
        impact(.rigid, intensity: 1.0)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.notify(.error)
        }
    }
    
    /// Warning pattern: Medium → Warning notification
    func warning() {
        impact(.medium)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.notify(.warning)
        }
    }
    
    /// Harvest pattern: Rapid taps matching harvest rhythm
    func harvest(count: Int = 1) {
        let basePattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.light, 0.0),
            (.soft, 0.05),
            (.light, 0.10),
        ]
        
        // Repeat pattern based on harvest count
        let repeats = min(count, 3)
        for i in 0..<repeats {
            let offset = Double(i) * 0.15
            for (style, time) in basePattern {
                DispatchQueue.main.asyncAfter(deadline: .now() + time + offset) { [weak self] in
                    self?.impact(style)
                }
            }
        }
    }
    
    /// Plant pattern: Soft press into ground
    func plant() {
        let pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.soft, 0.0),
            (.rigid, 0.08),
        ]
        executePattern(pattern)
    }
    
    /// Water pattern: Flowing liquid sensation
    func water() {
        let pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.light, 0.0),
            (.soft, 0.03),
            (.soft, 0.06),
            (.light, 0.09),
            (.soft, 0.12),
        ]
        executePattern(pattern)
    }
    
    /// Level up pattern: Celebration ramp-up
    func levelUp() {
        let intensities: [CGFloat] = [0.3, 0.5, 0.7, 0.9, 1.0]
        let delays: [TimeInterval] = [0.0, 0.06, 0.12, 0.18, 0.24]
        
        for (index, intensity) in intensities.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + delays[index]) { [weak self] in
                self?.impact(.medium, intensity: intensity)
            }
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
            self?.notify(.success)
        }
    }
    
    /// Coin pickup pattern: Light metallic taps
    func coin() {
        let pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.rigid, 0.0),
            (.light, 0.04),
        ]
        executePattern(pattern)
    }
    
    /// Big transaction pattern: Heavy satisfaction
    func bigTransaction() {
        let pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.light, 0.0),
            (.medium, 0.05),
            (.heavy, 0.12),
        ]
        executePattern(pattern)
    }
    
    /// Selection pattern: Crisp confirmation
    func select() {
        impact(.rigid, intensity: 0.6)
    }
    
    /// Scroll tick pattern: Light feedback during scrolling
    func scrollTick() {
        impact(.soft, intensity: 0.3)
    }
    
    /// Delete pattern: Warning then confirmation
    func delete() {
        impact(.medium)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) { [weak self] in
            self?.impact(.rigid, intensity: 0.8)
        }
    }
    
    /// Heartbeat pattern: For important alerts
    func heartbeat() {
        let pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)] = [
            (.light, 0.0),
            (.light, 0.15),
            (.light, 0.30),
        ]
        executePattern(pattern)
    }
    
    // MARK: - Custom Pattern Execution
    
    private func executePattern(_ pattern: [(UIImpactFeedbackGenerator.FeedbackStyle, TimeInterval)]) {
        for (style, delay) in pattern {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.impact(style)
            }
        }
    }
    
    // MARK: - Advanced Haptic Patterns (iOS 13+)
    
    func customPattern(events: [CHHapticEvent]) {
        guard let engine = engine else { return }
        
        do {
            let pattern = try CHHapticPattern(events: events, parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            print("Failed to play custom haptic pattern: \(error)")
        }
    }
    
    /// Complex texture pattern using Core Haptics
    func texture(_ type: HapticTexture) {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
            // Fallback to basic haptics
            fallbackTexture(type)
            return
        }
        
        switch type {
        case .rough:
            playRoughTexture()
        case .smooth:
            playSmoothTexture()
        case .bumpy:
            playBumpyTexture()
        }
    }
    
    private func fallbackTexture(_ type: HapticTexture) {
        switch type {
        case .rough:
            impact(.rigid)
        case .smooth:
            impact(.soft)
        case .bumpy:
            impact(.light)
        }
    }
    
    private func playRoughTexture() {
        var events: [CHHapticEvent] = []
        
        // Create rough, gritty texture
        for i in 0..<8 {
            let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: Float.random(in: 0.5...1.0))
            let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: Float.random(in: 0.7...1.0))
            let event = CHHapticEvent(
                eventType: .hapticTransient,
                parameters: [intensity, sharpness],
                relativeTime: Double(i) * 0.03
            )
            events.append(event)
        }
        
        customPattern(events: events)
    }
    
    private func playSmoothTexture() {
        var events: [CHHapticEvent] = []
        
        // Create smooth, flowing texture
        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.2)
        let event = CHHapticEvent(
            eventType: .hapticContinuous,
            parameters: [intensity, sharpness],
            relativeTime: 0,
            duration: 0.3
        )
        events.append(event)
        
        customPattern(events: events)
    }
    
    private func playBumpyTexture() {
        var events: [CHHapticEvent] = []
        
        // Create bumpy texture
        for i in 0..<5 {
            let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.7)
            let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
            let event = CHHapticEvent(
                eventType: .hapticTransient,
                parameters: [intensity, sharpness],
                relativeTime: Double(i) * 0.08
            )
            events.append(event)
        }
        
        customPattern(events: events)
    }
}

// MARK: - Haptic Texture Types

enum HapticTexture {
    case rough    // For terrain, digging
    case smooth   // For water, sliding
    case bumpy    // For movement, walking
}

// MARK: - View Extension

extension View {
    func hapticFeedback(_ type: HapticType) -> some View {
        self.onAppear {
            switch type {
            case .success:
                HapticPatterns.shared.success()
            case .error:
                HapticPatterns.shared.error()
            case .warning:
                HapticPatterns.shared.warning()
            case .light:
                HapticPatterns.shared.impact(.light)
            case .medium:
                HapticPatterns.shared.impact(.medium)
            case .heavy:
                HapticPatterns.shared.impact(.heavy)
            case .select:
                HapticPatterns.shared.select()
            }
        }
    }
}

enum HapticType {
    case success, error, warning
    case light, medium, heavy
    case select
}
