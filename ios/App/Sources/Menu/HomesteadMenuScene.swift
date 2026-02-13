import SpriteKit
import UIKit

final class HomesteadMenuScene: SKScene {
    private enum Z: CGFloat {
        case sky = 0
        case hills = 10
        case homestead = 20
        case fence = 30
        case grass = 40
        case ambient = 50
    }

    private static var gradientCache: [String: SKTexture] = [:]

    private let root = SKNode()
    private let skyNode = SKSpriteNode()
    private let nearHillNode = SKShapeNode()
    private let farHillNode = SKShapeNode()

    private let barnNode = SKNode()
    private let barnBaseNode = SKSpriteNode(color: UIColor(white: 0.17, alpha: 1), size: .zero)
    private let barnRoofNode = SKShapeNode()
    private let windowGlowNode = SKSpriteNode(color: UIColor(red: 1, green: 0.8, blue: 0.45, alpha: 1), size: .zero)
    private let windowFrameNode = SKShapeNode()

    private let fenceNode = SKNode()
    private var fenceRails: [SKSpriteNode] = []
    private var fencePosts: [SKSpriteNode] = []

    private let grassLayer = SKNode()
    private let grassBaseNode = SKSpriteNode(color: UIColor(red: 0.19, green: 0.37, blue: 0.2, alpha: 1), size: .zero)
    private var grassBlades: [SKSpriteNode] = []

    private var cloudNodes: [SKNode] = []
    private var ambientNodes: [SKShapeNode] = []
    private var reducedMotion = UIAccessibility.isReduceMotionEnabled
    private var didBuildScene = false

    private(set) var debugNodeCount: Int = 0

    override init(size: CGSize) {
        super.init(size: size)
        scaleMode = .aspectFill
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        backgroundColor = .black
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    override func didMove(to view: SKView) {
        guard !didBuildScene else {
            layoutScene()
            applyMotionConfiguration()
            return
        }

        didBuildScene = true
        addChild(root)
        buildScene()
        layoutScene()
        applyMotionConfiguration()
    }

    override func didChangeSize(_ oldSize: CGSize) {
        super.didChangeSize(oldSize)
        guard didBuildScene else { return }
        layoutScene()
        applyMotionConfiguration()
    }

    func setReducedMotion(_ value: Bool) {
        guard reducedMotion != value else { return }
        reducedMotion = value
        applyMotionConfiguration()
    }

    private func buildScene() {
        skyNode.zPosition = Z.sky.rawValue
        root.addChild(skyNode)

        farHillNode.zPosition = Z.hills.rawValue
        farHillNode.strokeColor = .clear
        root.addChild(farHillNode)

        nearHillNode.zPosition = Z.hills.rawValue + 1
        nearHillNode.strokeColor = .clear
        root.addChild(nearHillNode)

        barnNode.zPosition = Z.homestead.rawValue
        root.addChild(barnNode)

        barnBaseNode.anchorPoint = CGPoint(x: 0.5, y: 0)
        barnNode.addChild(barnBaseNode)

        barnRoofNode.strokeColor = .clear
        barnNode.addChild(barnRoofNode)

        windowGlowNode.alpha = 0.7
        barnNode.addChild(windowGlowNode)

        windowFrameNode.strokeColor = UIColor(white: 0.1, alpha: 0.9)
        windowFrameNode.lineWidth = 2
        windowFrameNode.fillColor = .clear
        barnNode.addChild(windowFrameNode)

        fenceNode.zPosition = Z.fence.rawValue
        root.addChild(fenceNode)

        for _ in 0..<2 {
            let rail = SKSpriteNode(color: UIColor(white: 0.24, alpha: 0.95), size: .zero)
            rail.anchorPoint = CGPoint(x: 0.5, y: 0.5)
            fenceRails.append(rail)
            fenceNode.addChild(rail)
        }

        for _ in 0..<26 {
            let post = SKSpriteNode(color: UIColor(white: 0.2, alpha: 1), size: .zero)
            post.anchorPoint = CGPoint(x: 0.5, y: 0)
            fencePosts.append(post)
            fenceNode.addChild(post)
        }

        grassLayer.zPosition = Z.grass.rawValue
        root.addChild(grassLayer)

        grassBaseNode.anchorPoint = CGPoint(x: 0.5, y: 0)
        grassLayer.addChild(grassBaseNode)

        for _ in 0..<32 {
            let blade = SKSpriteNode(color: UIColor(red: 0.26, green: 0.52, blue: 0.25, alpha: 1), size: .zero)
            blade.anchorPoint = CGPoint(x: 0.5, y: 0)
            grassBlades.append(blade)
            grassLayer.addChild(blade)
        }

        for index in 0..<3 {
            let cloud = makeCloudNode(scale: 0.9 - CGFloat(index) * 0.12)
            cloud.zPosition = Z.hills.rawValue + 2
            cloudNodes.append(cloud)
            root.addChild(cloud)
        }

        for _ in 0..<10 {
            let mote = SKShapeNode(circleOfRadius: 2)
            mote.strokeColor = .clear
            ambientNodes.append(mote)
            root.addChild(mote)
        }
    }

    private func layoutScene() {
        let width = max(size.width, 320)
        let height = max(size.height, 568)
        let skySize = CGSize(width: width * 1.35, height: height * 1.35)

        let night = isNightTime
        skyNode.texture = gradientTexture(
            size: skySize,
            top: night ? UIColor(red: 0.08, green: 0.11, blue: 0.2, alpha: 1) : UIColor(red: 0.92, green: 0.76, blue: 0.53, alpha: 1),
            bottom: night ? UIColor(red: 0.15, green: 0.2, blue: 0.3, alpha: 1) : UIColor(red: 0.54, green: 0.73, blue: 0.5, alpha: 1)
        )
        skyNode.size = skySize
        skyNode.colorBlendFactor = 1

        farHillNode.path = hillPath(baseY: -height * 0.03, amplitude: height * 0.07, width: width * 1.5)
        farHillNode.fillColor = night
            ? UIColor(red: 0.12, green: 0.17, blue: 0.2, alpha: 1)
            : UIColor(red: 0.39, green: 0.52, blue: 0.37, alpha: 1)

        nearHillNode.path = hillPath(baseY: -height * 0.12, amplitude: height * 0.08, width: width * 1.6)
        nearHillNode.fillColor = night
            ? UIColor(red: 0.1, green: 0.14, blue: 0.16, alpha: 1)
            : UIColor(red: 0.31, green: 0.44, blue: 0.28, alpha: 1)

        barnNode.position = CGPoint(x: width * 0.18, y: -height * 0.16)
        barnBaseNode.size = CGSize(width: width * 0.26, height: height * 0.19)
        barnBaseNode.color = night
            ? UIColor(red: 0.12, green: 0.1, blue: 0.11, alpha: 1)
            : UIColor(red: 0.26, green: 0.2, blue: 0.18, alpha: 1)

        let roofWidth = barnBaseNode.size.width * 1.15
        let roofHeight = barnBaseNode.size.height * 0.55
        let roofPath = CGMutablePath()
        roofPath.move(to: CGPoint(x: -roofWidth / 2, y: barnBaseNode.size.height))
        roofPath.addLine(to: CGPoint(x: 0, y: barnBaseNode.size.height + roofHeight))
        roofPath.addLine(to: CGPoint(x: roofWidth / 2, y: barnBaseNode.size.height))
        roofPath.closeSubpath()
        barnRoofNode.path = roofPath
        barnRoofNode.fillColor = night
            ? UIColor(red: 0.08, green: 0.08, blue: 0.09, alpha: 1)
            : UIColor(red: 0.22, green: 0.16, blue: 0.15, alpha: 1)

        windowGlowNode.size = CGSize(width: barnBaseNode.size.width * 0.2, height: barnBaseNode.size.height * 0.18)
        windowGlowNode.position = CGPoint(x: 0, y: barnBaseNode.size.height * 0.58)
        windowGlowNode.color = night
            ? UIColor(red: 1, green: 0.84, blue: 0.45, alpha: 1)
            : UIColor(red: 1, green: 0.94, blue: 0.72, alpha: 1)

        let windowRect = CGRect(
            x: -windowGlowNode.size.width / 2,
            y: windowGlowNode.position.y - windowGlowNode.size.height / 2,
            width: windowGlowNode.size.width,
            height: windowGlowNode.size.height
        )
        windowFrameNode.path = CGPath(rect: windowRect, transform: nil)

        let fenceY = -height * 0.24
        let fenceWidth = width * 1.25
        fenceRails[0].size = CGSize(width: fenceWidth, height: 5)
        fenceRails[1].size = CGSize(width: fenceWidth, height: 5)
        fenceRails[0].position = CGPoint(x: 0, y: fenceY + 28)
        fenceRails[1].position = CGPoint(x: 0, y: fenceY + 42)
        for (index, post) in fencePosts.enumerated() {
            let fraction = CGFloat(index) / CGFloat(max(1, fencePosts.count - 1))
            post.position = CGPoint(x: -fenceWidth / 2 + fraction * fenceWidth, y: fenceY)
            post.size = CGSize(width: 6, height: 52)
        }

        let grassBaseY = -height * 0.33
        grassBaseNode.size = CGSize(width: width * 1.4, height: height * 0.25)
        grassBaseNode.position = CGPoint(x: 0, y: grassBaseY)
        for (index, blade) in grassBlades.enumerated() {
            let fraction = CGFloat(index) / CGFloat(max(1, grassBlades.count - 1))
            let bladeHeight = 12 + CGFloat((index * 17) % 16)
            blade.position = CGPoint(
                x: -width * 0.67 + fraction * width * 1.34,
                y: grassBaseY + grassBaseNode.size.height * 0.7
            )
            blade.size = CGSize(width: 3, height: bladeHeight)
            blade.alpha = 0.85
        }

        for (index, cloud) in cloudNodes.enumerated() {
            cloud.alpha = night ? 0.5 : 0.78
            cloud.position = CGPoint(
                x: -width * 0.68 + CGFloat(index) * width * 0.62,
                y: height * (0.17 + CGFloat(index % 2) * 0.04)
            )
        }

        for (index, mote) in ambientNodes.enumerated() {
            let xFraction = CGFloat((index * 37) % 100) / 100
            let yFraction = CGFloat((index * 53) % 100) / 100
            mote.position = CGPoint(
                x: -width * 0.45 + xFraction * width * 0.9,
                y: -height * 0.12 + yFraction * height * 0.36
            )
            mote.fillColor = night
                ? UIColor(red: 1, green: 0.92, blue: 0.62, alpha: 1)
                : UIColor(white: 1, alpha: 1)
            mote.alpha = night ? 0.55 : 0.24
        }

        debugNodeCount = recursiveNodeCount(from: root)
    }

    private func applyMotionConfiguration() {
        for node in cloudNodes {
            node.removeAllActions()
        }
        for blade in grassBlades {
            blade.removeAllActions()
        }
        windowGlowNode.removeAllActions()
        for node in ambientNodes {
            node.removeAllActions()
        }

        guard !reducedMotion else {
            windowGlowNode.alpha = isNightTime ? 0.85 : 0.45
            return
        }

        for (index, cloud) in cloudNodes.enumerated() {
            let distance = size.width * 1.8
            let duration = 42.0 + Double(index) * 8.0
            let drift = SKAction.moveBy(x: distance, y: 0, duration: duration)
            let reset = SKAction.moveBy(x: -distance, y: 0, duration: 0)
            cloud.run(.repeatForever(.sequence([drift, reset])))
        }

        for (index, blade) in grassBlades.enumerated() {
            let amount = CGFloat(0.05 + Double((index % 3)) * 0.015)
            let swayOut = SKAction.rotate(toAngle: amount, duration: 1.6 + Double(index % 5) * 0.1)
            let swayBack = SKAction.rotate(toAngle: -amount, duration: 1.7 + Double(index % 5) * 0.1)
            blade.run(.repeatForever(.sequence([swayOut, swayBack])))
        }

        if isNightTime {
            let glowIn = SKAction.fadeAlpha(to: 0.95, duration: 1.7)
            let glowOut = SKAction.fadeAlpha(to: 0.55, duration: 1.5)
            windowGlowNode.run(.repeatForever(.sequence([glowIn, glowOut])))

            for (index, mote) in ambientNodes.enumerated() {
                let floatUp = SKAction.moveBy(x: 6, y: 10, duration: 2.0 + Double(index % 3) * 0.3)
                let floatDown = SKAction.moveBy(x: -6, y: -10, duration: 2.0 + Double(index % 3) * 0.3)
                let fadeIn = SKAction.fadeAlpha(to: 0.8, duration: 1.1)
                let fadeOut = SKAction.fadeAlpha(to: 0.2, duration: 1.4)
                let move = SKAction.sequence([floatUp, floatDown])
                let fade = SKAction.sequence([fadeIn, fadeOut])
                mote.run(.repeatForever(.group([move, fade])))
            }
        } else {
            let pulseIn = SKAction.fadeAlpha(to: 0.5, duration: 2.2)
            let pulseOut = SKAction.fadeAlpha(to: 0.2, duration: 2.6)
            windowGlowNode.run(.repeatForever(.sequence([pulseIn, pulseOut])))

            for (index, mote) in ambientNodes.enumerated() {
                let drift = SKAction.moveBy(x: 2, y: 7, duration: 2.4 + Double(index % 4) * 0.35)
                let settle = SKAction.moveBy(x: -2, y: -7, duration: 2.5 + Double(index % 4) * 0.35)
                let fade = SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.35, duration: 1.2),
                    SKAction.fadeAlpha(to: 0.14, duration: 1.5),
                ])
                mote.run(.repeatForever(.group([SKAction.sequence([drift, settle]), fade])))
            }
        }
    }

    private var isNightTime: Bool {
        let hour = Calendar.current.component(.hour, from: Date())
        return hour < 6 || hour >= 19
    }

    private func makeCloudNode(scale: CGFloat) -> SKNode {
        let node = SKNode()
        let specs: [(CGFloat, CGFloat, CGFloat)] = [
            (0, 0, 46),
            (24, 4, 34),
            (-22, 2, 30),
        ]
        for spec in specs {
            let puff = SKShapeNode(circleOfRadius: spec.2 * 0.5 * scale)
            puff.position = CGPoint(x: spec.0 * scale, y: spec.1 * scale)
            puff.fillColor = UIColor(white: 1, alpha: 0.9)
            puff.strokeColor = .clear
            node.addChild(puff)
        }
        return node
    }

    private func hillPath(baseY: CGFloat, amplitude: CGFloat, width: CGFloat) -> CGPath {
        let startX = -width / 2
        let endX = width / 2
        let path = CGMutablePath()
        path.move(to: CGPoint(x: startX, y: -size.height * 0.45))
        path.addLine(to: CGPoint(x: startX, y: baseY))
        path.addCurve(
            to: CGPoint(x: endX, y: baseY - amplitude * 0.15),
            control1: CGPoint(x: startX + width * 0.28, y: baseY + amplitude),
            control2: CGPoint(x: startX + width * 0.68, y: baseY + amplitude * 0.25)
        )
        path.addLine(to: CGPoint(x: endX, y: -size.height * 0.45))
        path.closeSubpath()
        return path
    }

    private func gradientTexture(size: CGSize, top: UIColor, bottom: UIColor) -> SKTexture {
        let roundedWidth = max(1, Int(size.width.rounded()))
        let roundedHeight = max(1, Int(size.height.rounded()))
        let key = "\(roundedWidth)x\(roundedHeight)-\(top.hexRGBA)-\(bottom.hexRGBA)"
        if let cached = Self.gradientCache[key] {
            return cached
        }

        let renderer = UIGraphicsImageRenderer(size: CGSize(width: roundedWidth, height: roundedHeight))
        let image = renderer.image { context in
            let cgContext = context.cgContext
            let colors = [top.cgColor, bottom.cgColor] as CFArray
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            guard let gradient = CGGradient(colorsSpace: colorSpace, colors: colors, locations: [0.0, 1.0]) else {
                return
            }
            cgContext.drawLinearGradient(
                gradient,
                start: CGPoint(x: 0, y: 0),
                end: CGPoint(x: 0, y: CGFloat(roundedHeight)),
                options: []
            )
        }
        let texture = SKTexture(image: image)
        texture.filteringMode = .linear
        Self.gradientCache[key] = texture
        return texture
    }

    private func recursiveNodeCount(from node: SKNode) -> Int {
        var total = 1
        for child in node.children {
            total += recursiveNodeCount(from: child)
        }
        return total
    }
}

private extension UIColor {
    var hexRGBA: String {
        var red: CGFloat = 0
        var green: CGFloat = 0
        var blue: CGFloat = 0
        var alpha: CGFloat = 0
        getRed(&red, green: &green, blue: &blue, alpha: &alpha)
        return String(
            format: "%02X%02X%02X%02X",
            Int(red * 255),
            Int(green * 255),
            Int(blue * 255),
            Int(alpha * 255)
        )
    }
}
