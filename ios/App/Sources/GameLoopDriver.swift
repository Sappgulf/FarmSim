import Foundation

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
        let timer = Timer(timeInterval: tickInterval, repeats: true) { [weak self] _ in
            self?.store?.stepAutoTime()
        }
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
}
