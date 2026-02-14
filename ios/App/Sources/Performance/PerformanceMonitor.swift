import Foundation
import SwiftUI

// MARK: - Performance Monitor

/// Lightweight performance monitoring for FarmSim
/// Use this to track frame rates, memory, and render performance in DEBUG builds
@MainActor
final class PerformanceMonitor {
    static let shared = PerformanceMonitor()
    
    private var displayLink: CADisplayLink?
    private var frameCount: Int = 0
    private var lastFPSUpdate: TimeInterval = 0
    private var frameTimestamps: [TimeInterval] = []
    private let maxFrameHistory = 60
    
    @Published private(set) var currentFPS: Double = 60.0
    @Published private(set) var averageFPS: Double = 60.0
    @Published private(set) var frameTimeMs: Double = 16.67
    @Published private(set) var isRunning: Bool = false
    
    private init() {}
    
    func start() {
        guard displayLink == nil else { return }
        isRunning = true
        
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkFired))
        displayLink?.add(to: .main, forMode: .common)
    }
    
    func stop() {
        displayLink?.invalidate()
        displayLink = nil
        isRunning = false
        frameTimestamps.removeAll()
    }
    
    @objc private func displayLinkFired(_ displayLink: CADisplayLink) {
        let now = CACurrentMediaTime()
        frameTimestamps.append(now)
        
        // Keep only recent frames
        if frameTimestamps.count > maxFrameHistory {
            frameTimestamps.removeFirst(frameTimestamps.count - maxFrameHistory)
        }
        
        // Update FPS every 0.5 seconds
        if now - lastFPSUpdate >= 0.5 {
            updateFPS(now: now)
            lastFPSUpdate = now
        }
    }
    
    private func updateFPS(now: TimeInterval) {
        guard frameTimestamps.count >= 2 else { return }
        
        let timeSpan = frameTimestamps.last! - frameTimestamps.first!
        let frames = Double(frameTimestamps.count - 1)
        
        if timeSpan > 0 {
            currentFPS = frames / timeSpan
            averageFPS = (averageFPS * 0.8) + (currentFPS * 0.2) // Smooth average
            frameTimeMs = (timeSpan / frames) * 1000
        }
    }
}

// MARK: - View Performance Modifier

extension View {
    /// Wraps the view body in performance measurement
    /// Use only in DEBUG builds
    func measureRenderTime(name: String) -> some View {
        #if DEBUG
        modifier(RenderTimeModifier(name: name))
        #else
        self
        #endif
    }
}

#if DEBUG
private struct RenderTimeModifier: ViewModifier {
    let name: String
    @State private var lastRender: Date?
    
    func body(content: Content) -> some View {
        let start = Date()
        return content
            .onAppear {
                let elapsed = Date().timeIntervalSince(start) * 1000
                if elapsed > 8 {
                    print("⚠️ Slow render for \(name): \(String(format: "%.2f", elapsed))ms")
                }
            }
    }
}
#endif

// MARK: - Memory Monitor

@MainActor
final class MemoryMonitor {
    static let shared = MemoryMonitor()
    
    private var timer: Timer?
    
    @Published private(set) var usedMB: Double = 0
    @Published private(set) var totalMB: Double = 0
    
    private init() {}
    
    func startMonitoring(interval: TimeInterval = 5.0) {
        timer?.invalidate()
        updateMemoryUsage()
        
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            Task { @MainActor in
                self.updateMemoryUsage()
            }
        }
    }
    
    func stopMonitoring() {
        timer?.invalidate()
        timer = nil
    }
    
    private func updateMemoryUsage() {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        guard kerr == KERN_SUCCESS else { return }
        
        usedMB = Double(info.resident_size) / 1024 / 1024
        totalMB = Double(info.virtual_size) / 1024 / 1024
    }
}

// MARK: - Performance Tips

/*
 Performance Optimization Guidelines:
 
 1. VIEW BODY OPTIMIZATION:
    - Keep view bodies small and fast
    - Use @ViewBuilder for complex conditional UI
    - Avoid complex computations in body properties
    - Use .drawingGroup() for complex static content
 
 2. OBSERVATION:
    - Use @ObservationIgnored for cached/computed values that don't need UI updates
    - Consolidate multiple @Observable properties that update together
    - Throttle frequently updating values (e.g., game loop state)
 
 3. LIST PERFORMANCE:
    - Use LazyVStack/LazyHStack for long lists
    - Add .id() to ForEach with stable identifiers
    - Avoid heavy computations inside ForEach closures
 
 4. ANIMATION:
    - Use .animation(value:) instead of .animation() for explicit animations
    - Respect accessibilityReduceMotion
    - Avoid animating expensive properties
 
 5. MEMORY:
    - Pool reusable objects (e.g., AVAudioPlayerNode)
    - Clear caches when receiving memory warnings
    - Use weak references for delegates and callbacks
 
 6. GAME LOOP:
    - Keep tick duration under 8ms for 60fps
    - Separate visual updates from simulation updates
    - Use CADisplayLink for frame-synchronized updates
 
 7. PROFILING:
    - Use Instruments: Time Profiler for CPU
    - Use Instruments: Core Animation for frame drops
    - Use Instruments: Allocations for memory leaks
    - Check for retain cycles with Memory Graph Debugger
 */
