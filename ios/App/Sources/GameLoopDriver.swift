import Foundation
import AVFoundation
import AudioToolbox
import UIKit

@MainActor
final class GameLoopDriver {
    private weak var store: GameStore?
    private var timer: Timer?
    private let tickInterval: TimeInterval

    init(store: GameStore, ticksPerSecond: Double = 12) {
        self.store = store
        self.tickInterval = 1.0 / max(1.0, ticksPerSecond)
    }

    func start() {
        guard timer == nil else { return }
        let timer = Timer(
            timeInterval: tickInterval,
            target: self,
            selector: #selector(handleTick(_:)),
            userInfo: nil,
            repeats: true
        )
        timer.tolerance = min(0.04, tickInterval * 0.25)
        self.timer = timer
        RunLoop.main.add(timer, forMode: .common)
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    deinit {
        timer?.invalidate()
    }

    @objc private func handleTick(_ timer: Timer) {
        store?.stepAutoTime()
    }
}

/// Manages audio playback and haptic feedback.
/// Currently uses system sounds and `UIImpactFeedbackGenerator` as a robust fallback
/// since no custom audio assets are available yet.
@MainActor
final class SoundManager {
    static let shared = SoundManager()

    var soundEnabled: Bool = true
    var hapticsEnabled: Bool = true

    private var audioPlayer: AVAudioPlayer?
    private var hapticGenerators: [UIImpactFeedbackGenerator.FeedbackStyle: UIImpactFeedbackGenerator] = [:]

    private init() {}

    enum SoundEffect {
        case click
        case success
        case error
        case plant
        case harvest
        case purchase
        case sell
        case levelUp
        case pageTurn
        case water
    }

    func play(_ effect: SoundEffect, haptic: UIImpactFeedbackGenerator.FeedbackStyle? = nil) {
        if let haptic, hapticsEnabled {
            let generator = impactGenerator(for: haptic)
            generator.prepare()
            generator.impactOccurred()
        }

        guard soundEnabled else { return }

        // System Sound ID mappings (approximate standard iOS sounds)
        // 1104: Tock
        // 1103: Tink
        // 1057: PIN entry
        // 1052: Shutter
        // 1001: Mail Sent
        // 1000: Mail Received
        // 1111: Menu
        // 1157: Beep
        
        let systemSoundID: SystemSoundID
        switch effect {
        case .click:
            systemSoundID = 1104 // Tock
        case .success, .purchase, .sell:
            systemSoundID = 1057 // PIN key (pleasant tick)
        case .error:
            systemSoundID = 1053 // System error
        case .plant:
            systemSoundID = 1103 // Tink
        case .harvest:
            systemSoundID = 1001 // Mail sent (whoosh/chime)
        case .levelUp:
            systemSoundID = 1000 // Mail received (chime)
        case .pageTurn:
            systemSoundID = 1105 // Tock
        case .water:
            systemSoundID = 1103 // Tink
        }

        AudioServicesPlaySystemSound(systemSoundID)
    }

    func playMusic(filename: String) {
        guard soundEnabled else { return }
        // Placeholder for future music implementation
        print("[Audio] Music playback requested for \(filename), but no assets are present.")
    }
    
    func stopMusic() {
        audioPlayer?.stop()
    }
    
    func updateSettings(sound: Bool, haptics: Bool) {
        self.soundEnabled = sound
        self.hapticsEnabled = haptics
        if !sound {
            stopMusic()
        }
    }

    private func impactGenerator(for style: UIImpactFeedbackGenerator.FeedbackStyle) -> UIImpactFeedbackGenerator {
        if let generator = hapticGenerators[style] {
            return generator
        }
        let generator = UIImpactFeedbackGenerator(style: style)
        hapticGenerators[style] = generator
        return generator
    }
}
