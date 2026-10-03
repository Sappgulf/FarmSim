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

    private(set) var soundEnabled: Bool = true
    private(set) var hapticsEnabled: Bool = true
    private(set) var lastAudioError: String?
    private let playback: any SoundPlayback
    private var generation: UInt = 0
    private var pending: [UUID: Task<Void, Never>] = [:]
    private var hapticGenerators: [UIImpactFeedbackGenerator.FeedbackStyle: UIImpactFeedbackGenerator] = [:]

    enum SoundEffect: CaseIterable, Sendable {
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

    init(playback: any SoundPlayback = SynthesizedSoundPlayback()) { self.playback = playback }

    deinit { for task in pending.values { task.cancel() } }

    // MARK: - Public API

    @discardableResult
    func play(_ effect: SoundEffect, haptic: UIImpactFeedbackGenerator.FeedbackStyle? = nil) -> Task<Void, Never>? {
        if let haptic, hapticsEnabled {
            let gen = impactGenerator(for: haptic)
            gen.prepare()
            gen.impactOccurred()
        }
        return enqueue(effect)
    }

    @discardableResult
    private func enqueue(_ effect: SoundEffect?) -> Task<Void, Never>? {
        guard soundEnabled else { return nil }
        let id = UUID()
        let requestedGeneration = generation
        pending[id] = Task { [weak self, playback] in
            defer { self?.pending[id] = nil }
            // Reading UI-owned settings before suspension keeps this entry on MainActor.
            guard !Task.isCancelled, self?.soundEnabled == true else { return }
            let failure = await playback.prepare()
            guard !Task.isCancelled, let self, self.soundEnabled,
                  self.generation == requestedGeneration else { return }
            self.lastAudioError = failure
            guard failure == nil else { return }
            if let effect { await playback.play(effect) }
        }
        return pending[id]
    }

    func updateSettings(sound: Bool, haptics: Bool) {
        if soundEnabled != sound {
            generation &+= 1
            if !sound {
                for task in pending.values { task.cancel() }
                pending.removeAll()
                Task { [playback] in await playback.stop() }
            }
        }
        soundEnabled = sound
        hapticsEnabled = haptics
        if sound { enqueue(nil) }
    }

    private func impactGenerator(for style: UIImpactFeedbackGenerator.FeedbackStyle) -> UIImpactFeedbackGenerator {
        if let gen = hapticGenerators[style] { return gen }
        let gen = UIImpactFeedbackGenerator(style: style)
        hapticGenerators[style] = gen
        return gen
    }
}

protocol SoundPlayback: Sendable {
    func prepare() async -> String?
    func play(_ effect: SoundManager.SoundEffect) async
    func stop() async
}

/// AVFoundation objects stay on this actor; only effect IDs and error text cross to UI.
actor SynthesizedSoundPlayback: SoundPlayback {
    private(set) var preparationWasOnMainThread: Bool?
    private var engine: AVAudioEngine?
    private var mixerNode: AVAudioMixerNode?
    private var buffers: [SoundManager.SoundEffect: AVAudioPCMBuffer] = [:]
    private let sampleRate: Double = 44100
    private var availableNodes: [AVAudioPlayerNode] = []
    private var activeNodes: [UUID: AVAudioPlayerNode] = [:]
    private let maxPooledNodes = 5

    // MARK: - Engine Setup

    func prepare() -> String? {
        if engine?.isRunning == true { return nil }
        preparationWasOnMainThread = Thread.isMainThread
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try session.setActive(true)
            if engine == nil {
                let newEngine = AVAudioEngine()
                let mixer = AVAudioMixerNode()
                newEngine.attach(mixer)
                newEngine.connect(mixer, to: newEngine.mainMixerNode, format: nil)
                mixer.outputVolume = 0.70
                engine = newEngine
                mixerNode = mixer
                prerenderBuffers()
            }
            try engine?.start()
            return nil
        } catch {
            return "Audio unavailable: \(error.localizedDescription)"
        }
    }

    func play(_ effect: SoundManager.SoundEffect) {
        guard let buffer = buffers[effect], engine?.isRunning == true else { return }
        scheduleBuffer(buffer)
    }

    func stop() {
        guard let engine else { return }
        for node in activeNodes.values { node.stop(); engine.detach(node) }
        activeNodes.removeAll()
        engine.stop()
        do { try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation) }
        catch { print("Audio deactivation failed: \(error.localizedDescription)") }
    }

    private func scheduleBuffer(_ buffer: AVAudioPCMBuffer) {
        guard let engine, let mixerNode else { return }
        // Use node pooling to reduce allocation overhead
        let playerNode: AVAudioPlayerNode
        if let pooled = availableNodes.popLast() {
            playerNode = pooled
        } else {
            playerNode = AVAudioPlayerNode()
            engine.attach(playerNode)
            engine.connect(playerNode, to: mixerNode, format: buffer.format)
        }
        
        let id = UUID()
        activeNodes[id] = playerNode
        playerNode.scheduleBuffer(buffer, at: nil, options: .interrupts,
                                  completionCallbackType: .dataPlayedBack) { [weak self] _ in
            Task { await self?.recycle(id) }
        }
        playerNode.play()
    }

    private func recycle(_ id: UUID) {
        guard let node = activeNodes.removeValue(forKey: id) else { return }
        node.stop()
        if availableNodes.count < maxPooledNodes { availableNodes.append(node) }
        else { engine?.detach(node) }
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

}
