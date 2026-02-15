import Foundation
@preconcurrency import AVFoundation
import UIKit

// MARK: - GameLoopDriver

@MainActor
final class GameLoopDriver {
    private weak var store: GameStore?
    private var task: Task<Void, Never>?
    private let tickInterval: TimeInterval

    init(store: GameStore, ticksPerSecond: Double = 12) {
        self.store = store
        self.tickInterval = 1.0 / max(1.0, ticksPerSecond)
    }

    func start() {
        guard task == nil else { return }
        let interval = tickInterval
        task = Task { [weak self] in
            let nanoseconds = UInt64(interval * 1_000_000_000)
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: nanoseconds)
                guard let self = self, !Task.isCancelled else { break }
                // Direct call since we're already in the right context
                self.store?.stepAutoTime()
            }
        }
    }

    func stop() {
        task?.cancel()
        task = nil
    }
}

// MARK: - SoundManager

/// Synthesizes short musical tones via AVAudioEngine — no audio asset files required.
/// Each effect maps to a distinct musical phrase to give the game a unique, cozy audio identity.
@MainActor
final class SoundManager {
    static let shared = SoundManager()

    var soundEnabled: Bool = true
    var hapticsEnabled: Bool = true

    private let engine = AVAudioEngine()
    private let mixerNode = AVAudioMixerNode()
    private var hapticGenerators: [UIImpactFeedbackGenerator.FeedbackStyle: UIImpactFeedbackGenerator] = [:]
    private var buffers: [SoundEffect: AVAudioPCMBuffer] = [:]
    private let sampleRate: Double = 44100
    // Node pool to reduce allocation overhead
    private var availableNodes: [AVAudioPlayerNode] = []
    private let maxPooledNodes = 5

    enum SoundEffect: CaseIterable {
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
        case notification
        case streak
        case welcome
    }

    private init() {
        configureAudioSession()
        setupEngine()
        prerenderBuffers()
    }

    // MARK: - Public API

    func play(_ effect: SoundEffect, haptic: UIImpactFeedbackGenerator.FeedbackStyle? = nil) {
        if let haptic, hapticsEnabled {
            let gen = impactGenerator(for: haptic)
            gen.prepare()
            gen.impactOccurred()
        }
        guard soundEnabled, let buffer = buffers[effect] else { return }
        scheduleBuffer(buffer)
    }

    func updateSettings(sound: Bool, haptics: Bool) {
        soundEnabled = sound
        hapticsEnabled = haptics
    }

    // MARK: - Engine Setup

    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try session.setActive(true)
        } catch {
            // Silently continue — audio is non-critical
        }
    }

    private func setupEngine() {
        engine.attach(mixerNode)
        engine.connect(mixerNode, to: engine.mainMixerNode, format: nil)
        mixerNode.outputVolume = 0.70
        do {
            try engine.start()
        } catch {
            // Silently continue
        }
    }

    private func scheduleBuffer(_ buffer: AVAudioPCMBuffer) {
        // Use node pooling to reduce allocation overhead
        let playerNode: AVAudioPlayerNode
        if let pooled = availableNodes.popLast() {
            playerNode = pooled
        } else {
            playerNode = AVAudioPlayerNode()
            engine.attach(playerNode)
            engine.connect(playerNode, to: mixerNode, format: buffer.format)
        }
        
        playerNode.scheduleBuffer(buffer, at: nil, options: .interrupts) { [weak self] in
            Task { @MainActor [weak self] in
                guard let self = self else { return }
                playerNode.stop()
                // Return to pool if under limit, otherwise detach
                if self.availableNodes.count < self.maxPooledNodes {
                    self.availableNodes.append(playerNode)
                } else {
                    self.engine.detach(playerNode)
                }
            }
        }
        if !engine.isRunning { try? engine.start() }
        playerNode.play()
    }

    // MARK: - Buffer Pre-rendering

    private func prerenderBuffers() {
        let sr = sampleRate
        // Musical note frequencies (Hz)
        let C5:  Float = 523.25
        let E5:  Float = 659.25
        let G5:  Float = 783.99
        let A4:  Float = 440.00
        let A5:  Float = 880.00
        let B4:  Float = 493.88
        let G4:  Float = 392.00
        let C6:  Float = 1046.50
        let Eb5: Float = 622.25

        buffers[.click]    = tone(freq: A4, duration: 0.055, gain: 0.30, sr: sr)
        buffers[.pageTurn] = tone(freq: B4, duration: 0.075, gain: 0.28, sr: sr)
        buffers[.plant]    = tone(freq: C5, duration: 0.130, gain: 0.32, sr: sr)
        buffers[.water]    = chord(freqs: [C5, E5], duration: 0.200, gain: 0.26, sr: sr)
        buffers[.sell]     = arpeggio(
            notes: [(G4, 0.00, 0.12), (C5, 0.10, 0.14)],
            totalDuration: 0.26, gain: 0.32, sr: sr
        )
        buffers[.purchase] = arpeggio(
            notes: [(C5, 0.00, 0.12), (E5, 0.10, 0.14)],
            totalDuration: 0.26, gain: 0.32, sr: sr
        )
        buffers[.success]  = arpeggio(
            notes: [(E5, 0.00, 0.12), (G5, 0.10, 0.16)],
            totalDuration: 0.28, gain: 0.30, sr: sr
        )
        buffers[.harvest]  = arpeggio(
            notes: [(C5, 0.00, 0.12), (E5, 0.10, 0.12), (G5, 0.20, 0.18)],
            totalDuration: 0.42, gain: 0.32, sr: sr
        )
        buffers[.error]    = arpeggio(
            notes: [(Eb5, 0.00, 0.10), (C5, 0.09, 0.14)],
            totalDuration: 0.26, gain: 0.28, sr: sr, descending: true
        )
        buffers[.levelUp]  = arpeggio(
            notes: [(C5, 0.00, 0.12), (E5, 0.11, 0.12), (G5, 0.22, 0.12), (C6, 0.33, 0.28)],
            totalDuration: 0.70, gain: 0.34, sr: sr
        )
        buffers[.notification] = arpeggio(
            notes: [(E5, 0.00, 0.10), (A5, 0.08, 0.18)],
            totalDuration: 0.30, gain: 0.32, sr: sr
        )
        buffers[.streak] = arpeggio(
            notes: [(G4, 0.00, 0.10), (C5, 0.08, 0.10), (E5, 0.16, 0.14), (G5, 0.26, 0.20)],
            totalDuration: 0.52, gain: 0.34, sr: sr
        )
        buffers[.welcome] = arpeggio(
            notes: [(C5, 0.00, 0.14), (E5, 0.12, 0.14), (G5, 0.24, 0.18), (C6, 0.38, 0.32)],
            totalDuration: 0.78, gain: 0.32, sr: sr
        )
    }

    // MARK: - Synthesis Primitives

    /// Single sine tone with smooth ADSR envelope.
    private func tone(freq: Float, duration: Float, gain: Float, sr: Double) -> AVAudioPCMBuffer? {
        return chord(freqs: [freq], duration: duration, gain: gain, sr: sr)
    }

    /// Simultaneous chord (mix of sine tones).
    private func chord(freqs: [Float], duration: Float, gain: Float, sr: Double) -> AVAudioPCMBuffer? {
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sr, channels: 1) else { return nil }
        let frameCount = AVAudioFrameCount(sr * Double(duration))
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return nil }
        buffer.frameLength = frameCount
        guard let data = buffer.floatChannelData?[0] else { return nil }

        let attackFrames  = Int(sr * 0.012)
        let releaseFrames = Int(sr * 0.040)
        let total         = Int(frameCount)

        for i in 0..<total {
            let t = Float(i) / Float(sr)
            var sample: Float = 0
            for freq in freqs {
                sample += sinf(2.0 * .pi * freq * t)
            }
            sample /= Float(freqs.count)
            sample *= gain
            sample *= envelope(i: i, total: total, attack: attackFrames, release: releaseFrames)
            data[i] = sample
        }
        return buffer
    }

    /// Sequential arpeggio — notes are layered into a single buffer.
    private func arpeggio(
        notes: [(freq: Float, startFrac: Float, dur: Float)],
        totalDuration: Float,
        gain: Float,
        sr: Double,
        descending: Bool = false
    ) -> AVAudioPCMBuffer? {
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sr, channels: 1) else { return nil }
        let totalFrames = AVAudioFrameCount(sr * Double(totalDuration))
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: totalFrames) else { return nil }
        buffer.frameLength = totalFrames
        guard let data = buffer.floatChannelData?[0] else { return nil }

        for i in 0..<Int(totalFrames) { data[i] = 0 }

        let attackFrames  = Int(sr * 0.010)
        let releaseFrames = Int(sr * 0.030)

        for note in notes {
            let startFrame = Int(Float(totalFrames) * note.startFrac)
            let noteFrames = Int(sr * Double(note.dur))
            let endFrame   = min(startFrame + noteFrames, Int(totalFrames))

            for i in startFrame..<endFrame {
                let local = i - startFrame
                let t = Float(local) / Float(sr)
                var sample = sinf(2.0 * .pi * note.freq * t) * gain
                sample *= envelope(i: local, total: noteFrames, attack: attackFrames, release: releaseFrames)
                if descending { sample *= max(0, 1.0 - Float(local) / Float(noteFrames)) }
                data[i] += sample
            }
        }
        // Normalize to prevent clipping
        let peak = (0..<Int(totalFrames)).map { fabsf(data[$0]) }.max() ?? 1
        if peak > 0.9 {
            let scale = 0.9 / peak
            for i in 0..<Int(totalFrames) { data[i] *= scale }
        }
        return buffer
    }

    /// Smooth ADSR envelope value at frame index `i` within `total` frames.
    private func envelope(i: Int, total: Int, attack: Int, release: Int) -> Float {
        if i < attack {
            return Float(i) / Float(max(1, attack))
        } else if i > total - release {
            return Float(total - i) / Float(max(1, release))
        }
        return 1.0
    }

    // MARK: - Haptics

    private func impactGenerator(for style: UIImpactFeedbackGenerator.FeedbackStyle) -> UIImpactFeedbackGenerator {
        if let gen = hapticGenerators[style] { return gen }
        let gen = UIImpactFeedbackGenerator(style: style)
        hapticGenerators[style] = gen
        return gen
    }
}
