import SwiftUI
import SpriteKit
import UIKit

// MARK: - Weather Types

enum WeatherType: String, CaseIterable, Identifiable {
    case sunny = "Sunny"
    case cloudy = "Cloudy"
    case rainy = "Rainy"
    case snowy = "Snowy"
    case stormy = "Stormy"
    
    var id: String { rawValue }

    var key: String { rawValue.lowercased() }
    
    var icon: String {
        switch self {
        case .sunny: return "sun.max.fill"
        case .cloudy: return "cloud.fill"
        case .rainy: return "cloud.rain.fill"
        case .snowy: return "cloud.snow.fill"
        case .stormy: return "cloud.bolt.rain.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .sunny: return .yellow
        case .cloudy: return .gray
        case .rainy: return .blue
        case .snowy: return .cyan
        case .stormy: return .purple
        }
    }
    
    var overlayOpacity: Double {
        switch self {
        case .sunny: return 0.0
        case .cloudy: return 0.15
        case .rainy: return 0.25
        case .snowy: return 0.20
        case .stormy: return 0.40
        }
    }
    
    var cropGrowthModifier: Double {
        switch self {
        case .sunny: return 1.0
        case .cloudy: return 0.9
        case .rainy: return 1.1 // Rain helps growth
        case .snowy: return 0.5 // Winter slows growth
        case .stormy: return 0.7 // Storms stress crops
        }
    }

    var ambianceLabel: String {
        switch self {
        case .sunny: return "Bright skies"
        case .cloudy: return "Cool cover"
        case .rainy: return "Soft rain"
        case .snowy: return "Quiet frost"
        case .stormy: return "Wild front"
        }
    }

    var tintColor: Color {
        switch self {
        case .sunny: return Color(red: 1.00, green: 0.78, blue: 0.28)
        case .cloudy: return Color(red: 0.63, green: 0.68, blue: 0.75)
        case .rainy: return Color(red: 0.43, green: 0.66, blue: 0.92)
        case .snowy: return Color(red: 0.78, green: 0.90, blue: 1.00)
        case .stormy: return Color(red: 0.45, green: 0.46, blue: 0.76)
        }
    }

    var overlayBlend: Color {
        switch self {
        case .sunny: return Color(red: 1.00, green: 0.84, blue: 0.43)
        case .cloudy: return Color(red: 0.48, green: 0.54, blue: 0.64)
        case .rainy: return Color(red: 0.25, green: 0.42, blue: 0.62)
        case .snowy: return Color(red: 0.76, green: 0.87, blue: 0.97)
        case .stormy: return Color(red: 0.20, green: 0.24, blue: 0.34)
        }
    }
}

struct FarmWeatherSnapshot: Equatable, Sendable {
    let weather: WeatherType
    let intensity: Double
    let nextWeather: WeatherType
    let nextTransitionProgress: Double
    let windowTitle: String

    var intensityPercent: Int {
        Int((max(0.55, min(1.0, intensity)) * 100).rounded())
    }
}

enum FarmWeatherModel {
    private static let dayWindows: [(title: String, start: Double, end: Double)] = [
        ("Dawn", 0.00, 0.22),
        ("Late Morning", 0.22, 0.50),
        ("Afternoon", 0.50, 0.78),
        ("Nightfall", 0.78, 1.01),
    ]

    static func resolve(day: Int, timeProgress: Double, season: String) -> FarmWeatherSnapshot {
        let normalizedProgress = max(0, min(0.999, timeProgress))
        let seasonKey = normalizeSeason(season)
        let windowIndex = currentWindowIndex(for: normalizedProgress)
        let currentWindow = dayWindows[windowIndex]
        let nextWindowIndex = (windowIndex + 1) % dayWindows.count
        let nextWindow = dayWindows[nextWindowIndex]
        let effectiveDay = day + (nextWindowIndex == 0 ? 1 : 0)

        let weather = resolveWeather(day: day, windowIndex: windowIndex, seasonKey: seasonKey)
        let nextWeather = resolveWeather(day: effectiveDay, windowIndex: nextWindowIndex, seasonKey: seasonKey)
        let intensity = resolveIntensity(day: day, windowIndex: windowIndex, weather: weather, seasonKey: seasonKey)

        return FarmWeatherSnapshot(
            weather: weather,
            intensity: intensity,
            nextWeather: nextWeather,
            nextTransitionProgress: min(1.0, max(0.0, nextWindow.start)),
            windowTitle: currentWindow.title
        )
    }

    private static func currentWindowIndex(for progress: Double) -> Int {
        dayWindows.firstIndex { progress >= $0.start && progress < $0.end } ?? 0
    }

    private static func resolveWeather(day: Int, windowIndex: Int, seasonKey: String) -> WeatherType {
        let roll = stableHash(for: "weather|\(seasonKey)|\(day)|\(windowIndex)") % 100
        switch seasonKey {
        case "winter":
            switch roll {
            case 0..<35: return .snowy
            case 35..<65: return .cloudy
            case 65..<80: return .sunny
            case 80..<92: return .rainy
            default: return .stormy
            }
        case "autumn", "fall":
            switch roll {
            case 0..<28: return .cloudy
            case 28..<50: return .rainy
            case 50..<72: return .sunny
            case 72..<88: return .stormy
            default: return .snowy
            }
        case "summer":
            switch roll {
            case 0..<46: return .sunny
            case 46..<66: return .cloudy
            case 66..<82: return .rainy
            case 82..<94: return .stormy
            default: return .snowy
            }
        default:
            switch roll {
            case 0..<38: return .sunny
            case 38..<60: return .cloudy
            case 60..<80: return .rainy
            case 80..<90: return .stormy
            default: return .snowy
            }
        }
    }

    private static func resolveIntensity(day: Int, windowIndex: Int, weather: WeatherType, seasonKey: String) -> Double {
        let base = Double((stableHash(for: "intensity|\(seasonKey)|\(weather.key)|\(day)|\(windowIndex)") % 38) + 62) / 100.0
        switch weather {
        case .sunny:
            return min(0.95, max(0.62, base))
        case .cloudy:
            return min(0.9, max(0.58, base - 0.06))
        case .rainy:
            return min(1.0, max(0.68, base + 0.04))
        case .snowy:
            return min(0.96, max(0.66, base))
        case .stormy:
            return min(1.0, max(0.78, base + 0.08))
        }
    }

    private static func normalizeSeason(_ season: String) -> String {
        let lowered = season.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if lowered == "fall" { return "autumn" }
        return lowered.isEmpty ? "spring" : lowered
    }

    private static func stableHash(for string: String) -> UInt64 {
        var hash: UInt64 = 1_469_598_103_934_665_603
        for byte in string.utf8 {
            hash ^= UInt64(byte)
            hash &*= 1_099_511_628_211
        }
        return hash
    }
}

// MARK: - Weather Manager

@MainActor
class WeatherManager: ObservableObject {
    @Published var currentWeather: WeatherType = .sunny
    @Published var weatherIntensity: Double = 1.0
    @Published var nextWeatherChange: TimeInterval = 0
    
    private var timer: Timer?
    private let dayDuration: TimeInterval = 24 * 60 // 24 minutes = 1 game day
    
    func startWeatherCycle() {
        // Change weather every 5-8 minutes
        scheduleNextWeatherChange()
    }
    
    func stopWeatherCycle() {
        timer?.invalidate()
        timer = nil
    }
    
    private func scheduleNextWeatherChange() {
        let delay = Double.random(in: 300...480) // 5-8 minutes
        nextWeatherChange = Date().timeIntervalSince1970 + delay
        
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
            Task { @MainActor in
                self?.transitionToNextWeather()
            }
        }
    }
    
    private func transitionToNextWeather() {
        let availableWeathers = WeatherType.allCases
        let newWeather = availableWeathers.randomElement() ?? .sunny
        
        withAnimation(.easeInOut(duration: 3.0)) {
            currentWeather = newWeather
            weatherIntensity = Double.random(in: 0.7...1.0)
        }
        
        scheduleNextWeatherChange()
    }
    
    func setWeather(_ weather: WeatherType, intensity: Double = 1.0) {
        withAnimation(.easeInOut(duration: 2.0)) {
            currentWeather = weather
            weatherIntensity = intensity
        }
    }
}

// MARK: - Weather Scene for SpriteKit

class WeatherScene: SKScene {
    private var weatherEmitter: SKEmitterNode?
    private var cloudNodes: [SKSpriteNode] = []
    private var lightningNode: SKSpriteNode?
    private var currentWeather: WeatherType = .sunny
    
    override init(size: CGSize) {
        super.init(size: size)
        scaleMode = .resizeFill
        backgroundColor = .clear
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    func setWeather(_ weather: WeatherType, intensity: CGFloat = 1.0) {
        guard currentWeather != weather else { return }
        currentWeather = weather
        
        // Clear previous weather effects
        clearWeatherEffects()
        
        switch weather {
        case .rainy:
            setupRain(intensity: intensity)
        case .snowy:
            setupSnow(intensity: intensity)
        case .stormy:
            setupStorm(intensity: intensity)
        case .cloudy:
            setupClouds(intensity: intensity)
        case .sunny:
            setupSun()
        }
    }
    
    private func clearWeatherEffects() {
        weatherEmitter?.removeFromParent()
        weatherEmitter = nil
        
        cloudNodes.forEach { $0.removeFromParent() }
        cloudNodes.removeAll()
        
        lightningNode?.removeFromParent()
        lightningNode = nil
    }
    
    private func setupRain(intensity: CGFloat) {
        let emitter = SKEmitterNode()
        
        // Rain particle texture - create programmatically since we don't have image assets
        UIGraphicsBeginImageContext(CGSize(width: 4, height: 12))
        if let context = UIGraphicsGetCurrentContext() {
            context.setFillColor(UIColor(red: 0.7, green: 0.8, blue: 1.0, alpha: 0.8).cgColor)
            context.fill(CGRect(x: 0, y: 0, width: 4, height: 12))
        }
        let raindropImage = UIGraphicsGetImageFromCurrentImageContext() ?? UIImage()
        UIGraphicsEndImageContext()
        let raindrop = SKTexture(image: raindropImage)
        emitter.particleTexture = raindrop
        emitter.particleBirthRate = 200 * intensity
        emitter.particleLifetime = 2.0
        emitter.particlePositionRange = CGVector(dx: size.width, dy: 0)
        emitter.particlePosition = CGPoint(x: size.width / 2, y: size.height + 50)
        emitter.particleSpeed = 400
        emitter.particleSpeedRange = 100
        emitter.emissionAngle = -.pi / 2 + 0.1 // Slight angle for wind
        emitter.emissionAngleRange = 0.1
        emitter.particleScale = 0.3
        emitter.particleScaleRange = 0.1
        emitter.particleAlpha = 0.6
        emitter.particleColor = SKColor(red: 0.7, green: 0.8, blue: 1.0, alpha: 1.0)
        
        emitter.particleRotation = .pi / 2
        emitter.particleRotationSpeed = 0
        
        addChild(emitter)
        weatherEmitter = emitter
    }
    
    private func setupSnow(intensity: CGFloat) {
        let emitter = SKEmitterNode()
        
        // Create snowflake texture programmatically
        let size = CGSize(width: 8, height: 8)
        UIGraphicsBeginImageContext(size)
        if let context = UIGraphicsGetCurrentContext() {
            context.setFillColor(UIColor.white.cgColor)
            context.fillEllipse(in: CGRect(x: 0, y: 0, width: 8, height: 8))
        }
        let snowflakeImage = UIGraphicsGetImageFromCurrentImageContext() ?? UIImage()
        UIGraphicsEndImageContext()
        emitter.particleTexture = SKTexture(image: snowflakeImage)
        emitter.particleBirthRate = 100 * intensity
        emitter.particleLifetime = 8.0
        emitter.particlePositionRange = CGVector(dx: size.width, dy: 0)
        emitter.particlePosition = CGPoint(x: size.width / 2, y: size.height + 50)
        emitter.particleSpeed = 30
        emitter.particleSpeedRange = 20
        emitter.emissionAngle = -.pi / 2
        emitter.emissionAngleRange = 0.3
        emitter.particleScale = 0.4
        emitter.particleScaleRange = 0.2
        emitter.particleAlpha = 0.8
        emitter.particleColor = SKColor.white
        
        // Gentle swaying motion
        emitter.particleAction = SKAction.repeatForever(
            SKAction.sequence([
                SKAction.moveBy(x: 20, y: 0, duration: 2.0),
                SKAction.moveBy(x: -40, y: 0, duration: 4.0),
                SKAction.moveBy(x: 20, y: 0, duration: 2.0)
            ])
        )
        
        addChild(emitter)
        weatherEmitter = emitter
    }
    
    private func setupStorm(intensity: CGFloat) {
        // Heavy rain
        setupRain(intensity: intensity * 1.5)
        
        // Add dark clouds
        for index in 0..<3 {
            let cloud = SKSpriteNode(color: SKColor(red: 0.2, green: 0.2, blue: 0.25, alpha: 0.7), size: CGSize(width: 200, height: 100))
            cloud.position = CGPoint(x: CGFloat(index) * size.width / 2, y: size.height - 100)
            cloud.alpha = 0
            addChild(cloud)
            cloudNodes.append(cloud)
            
            cloud.run(SKAction.fadeIn(withDuration: 2.0))
        }
        
        // Lightning effect
        setupLightning()
    }
    
    private func setupLightning() {
        let lightning = SKSpriteNode(color: SKColor.white, size: size)
        lightning.position = CGPoint(x: size.width / 2, y: size.height / 2)
        lightning.alpha = 0
        lightning.zPosition = 100
        addChild(lightning)
        lightningNode = lightning
        
        // Random lightning flashes
        let flashAction = SKAction.sequence([
            SKAction.wait(forDuration: Double.random(in: 5...15)),
            SKAction.fadeAlpha(to: 0.8, duration: 0.05),
            SKAction.fadeOut(withDuration: 0.1),
            SKAction.wait(forDuration: 0.1),
            SKAction.fadeAlpha(to: 0.4, duration: 0.05),
            SKAction.fadeOut(withDuration: 0.2)
        ])
        
        lightning.run(SKAction.repeatForever(flashAction))
    }
    
    private func setupClouds(intensity: CGFloat) {
        let cloudColor = SKColor(red: 0.9, green: 0.9, blue: 0.95, alpha: 0.6)
        
        for _ in 0..<5 {
            let cloud = SKSpriteNode(color: cloudColor, size: CGSize(width: 150 + CGFloat.random(in: 0...100), height: 60 + CGFloat.random(in: 0...40)))
            cloud.position = CGPoint(
                x: CGFloat.random(in: 0...size.width),
                y: size.height - CGFloat.random(in: 50...200)
            )
            cloud.alpha = 0
            cloud.zPosition = 10
            addChild(cloud)
            cloudNodes.append(cloud)
            
            // Fade in
            cloud.run(SKAction.fadeAlpha(to: CGFloat.random(in: 0.4...0.7), duration: 3.0))
            
            // Slow drift
            let drift = SKAction.moveBy(x: 50, y: 0, duration: 30.0)
            let driftBack = SKAction.moveBy(x: -50, y: 0, duration: 30.0)
            cloud.run(SKAction.repeatForever(SKAction.sequence([drift, driftBack])))
        }
    }
    
    private func setupSun() {
        // Add sun rays or lens flare effect
        let sun = SKSpriteNode(color: SKColor.yellow, size: CGSize(width: 100, height: 100))
        sun.position = CGPoint(x: size.width - 80, y: size.height - 80)
        sun.alpha = 0.3
        sun.zPosition = 5
        addChild(sun)
        
        // Pulsing glow
        let pulse = SKAction.sequence([
            SKAction.fadeAlpha(to: 0.5, duration: 3.0),
            SKAction.fadeAlpha(to: 0.3, duration: 3.0)
        ])
        sun.run(SKAction.repeatForever(pulse))
        
        cloudNodes.append(sun)
    }
}

// MARK: - SwiftUI Weather View

struct WeatherOverlay: View {
    @StateObject private var weatherManager = WeatherManager()
    let scene: SKScene
    
    var body: some View {
        ZStack {
            // Weather color overlay
            Color.black
                .opacity(weatherManager.currentWeather.overlayOpacity)
                .ignoresSafeArea()
                .allowsHitTesting(false)
            
            // Weather info pill
            VStack {
                HStack {
                    WeatherPill(
                        weather: weatherManager.currentWeather,
                        intensity: weatherManager.weatherIntensity
                    )
                    Spacer()
                }
                .padding()
                
                Spacer()
            }
        }
        .onAppear {
            weatherManager.startWeatherCycle()
            if let weatherScene = scene as? WeatherScene {
                weatherScene.setWeather(weatherManager.currentWeather, intensity: CGFloat(weatherManager.weatherIntensity))
            }
        }
        .onDisappear {
            weatherManager.stopWeatherCycle()
        }
        .onChange(of: weatherManager.currentWeather) { _, newWeather in
            if let weatherScene = scene as? WeatherScene {
                weatherScene.setWeather(newWeather, intensity: CGFloat(weatherManager.weatherIntensity))
            }
        }
    }
}

struct WeatherPill: View {
    let weather: WeatherType
    let intensity: Double
    var subtitle: String? = nil
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    var body: some View {
        HStack(spacing: 8) {
            if reduceMotion {
                Image(systemName: weather.icon)
                    .font(.system(.title3, weight: .semibold))
                    .foregroundStyle(weather.color)
            } else {
                Image(systemName: weather.icon)
                    .font(.system(.title3, weight: .semibold))
                    .foregroundStyle(weather.color)
                    .symbolEffect(.pulse, options: .repeating, value: weather)
            }
            
            Text(weather.rawValue)
                .font(.system(.subheadline, weight: .medium))
                .foregroundStyle(.white)

            if let subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.system(.caption2, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.72))
            }
            
            if intensity < 1.0 {
                Text("\(Int(intensity * 100))%")
                    .font(.system(.caption, weight: .medium))
                    .foregroundStyle(.white.opacity(0.7))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(
                    Capsule()
                        .stroke(weather.tintColor.opacity(0.38), lineWidth: 1)
                )
        )
    }
}

// MARK: - Weather Effects Preview

#Preview {
    WeatherPill(weather: .rainy, intensity: 0.8)
        .padding()
        .background(Color.black)
}
