import SpriteKit
import UIKit

final class HomesteadMenuScene: SKScene {
    private enum Z: CGFloat {
        case sky = 0
        case sun = 5
        case sunRays = 3
        case mountains = 10
        case farHills = 15
        case closeHills = 20
        case ground = 25
        case fence = 28
        case structures = 30
        case animals = 35
        case vegetation = 38
        case foreground = 40
        case ambient = 50
    }

    private let root = SKNode()
    
    // Vector Layers
    private let skyNode = SKShapeNode()
    private let sunNode = SKShapeNode(circleOfRadius: 60)
    private let sunRaysNode = SKNode()
    private let mountainNode = SKShapeNode()
    private let farHillNode = SKShapeNode()
    private let closeHillNode = SKShapeNode()
    private let groundNode = SKShapeNode()
    
    // Entities
    private let barnNode = SKNode()
    private let fenceNode = SKNode()
    private let vegetationNode = SKNode()
    private let animalLayer = SKNode()
    private var animals: [SKNode] = []
    
    private var ambientNodes: [SKShapeNode] = []
    private var reducedMotion = UIAccessibility.isReduceMotionEnabled
    private var didBuildScene = false
    private(set) var debugNodeCount: Int = 0

    override init(size: CGSize) {
        super.init(size: size)
        scaleMode = .aspectFill
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        backgroundColor = UIColor(red: 0.45, green: 0.78, blue: 0.92, alpha: 1)
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    override func didMove(to view: SKView) {
        if didBuildScene {
            layoutScene()
            return
        }
        didBuildScene = true
        addChild(root)
        buildVectorScene()
        spawnVectorAnimals()
        layoutScene()
        animateScene()
    }

    override func didChangeSize(_ oldSize: CGSize) {
        super.didChangeSize(oldSize)
        if didBuildScene { layoutScene() }
    }

    func setReducedMotion(_ value: Bool) {
        guard reducedMotion != value else { return }
        reducedMotion = value
        animateScene()
    }

    // MARK: - Scene Building
    
    private func buildVectorScene() {
        guard view != nil else { return }

        // 1. Sky — warm gradient via layered fills
        skyNode.zPosition = Z.sky.rawValue
        root.addChild(skyNode)
        
        // 2. Sun Rays (behind sun)
        sunRaysNode.zPosition = Z.sunRays.rawValue
        root.addChild(sunRaysNode)
        buildSunRays()
        
        // 3. Sun — warm golden glow
        sunNode.zPosition = Z.sun.rawValue
        sunNode.fillColor = UIColor(red: 1.0, green: 0.92, blue: 0.62, alpha: 1)
        sunNode.strokeColor = .clear
        sunNode.glowWidth = 12
        root.addChild(sunNode)
        
        // 4. Sun halo
        let halo = SKShapeNode(circleOfRadius: 90)
        halo.fillColor = UIColor(red: 1.0, green: 0.95, blue: 0.7, alpha: 0.15)
        halo.strokeColor = .clear
        halo.zPosition = Z.sun.rawValue - 0.5
        sunNode.addChild(halo)
        
        // 5. Mountains (Rasterized)
        mountainNode.zPosition = Z.mountains.rawValue
        mountainNode.fillColor = UIColor(red: 0.32, green: 0.52, blue: 0.62, alpha: 1)
        mountainNode.strokeColor = .clear
        
        // 6. Far Hills (Rasterized)
        farHillNode.zPosition = Z.farHills.rawValue
        farHillNode.fillColor = UIColor(red: 0.55, green: 0.78, blue: 0.45, alpha: 1)
        farHillNode.strokeColor = .clear
        
        // 7. Close Hills (Rasterized)
        closeHillNode.zPosition = Z.closeHills.rawValue
        closeHillNode.fillColor = UIColor(red: 0.48, green: 0.72, blue: 0.38, alpha: 1)
        closeHillNode.strokeColor = .clear
        
        // 8. Ground (Rasterized)
        groundNode.zPosition = Z.ground.rawValue
        groundNode.fillColor = UIColor(red: 0.42, green: 0.68, blue: 0.32, alpha: 1)
        groundNode.strokeColor = .clear
        
        // Ground Patches — darker soil patches
        for _ in 0..<6 {
            let patch = SKShapeNode(ellipseOf: CGSize(width: CGFloat.random(in: 80...260), height: CGFloat.random(in: 35...75)))
            patch.fillColor = UIColor(red: 0.38, green: 0.64, blue: 0.28, alpha: 1)
            patch.strokeColor = .clear
            patch.position = CGPoint(x: CGFloat.random(in: -400...400), y: CGFloat.random(in: -150...(-50)))
            groundNode.addChild(patch)
        }
        
        // Wildflowers scattered across ground
        buildWildflowers()
        
        // 9. Fence (Rasterized)
        buildFence()
        
        // 10. Structures (Barn - Rasterized)
        buildBarn()
        
        // 11. Animals (Dynamic)
        animalLayer.zPosition = Z.animals.rawValue
        root.addChild(animalLayer)
        
        // 12. Vegetation (Rasterized)
        buildVegetation()
        
        // 13. Foreground Grass items (Dynamic)
        for _ in 0..<20 {
            let blade = SKShapeNode(rectOf: CGSize(width: 3, height: CGFloat.random(in: 8...18)), cornerRadius: 1.5)
            blade.fillColor = UIColor(red: 0.28, green: 0.48, blue: 0.18, alpha: 1)
            blade.strokeColor = .clear
            blade.zPosition = Z.foreground.rawValue
            blade.name = "grass"
            root.addChild(blade)
        }
    }
    
    // MARK: - Sun Rays
    
    private func buildSunRays() {
        let rayCount = 6
        for i in 0..<rayCount {
            let angle = (CGFloat.pi * 2.0 / CGFloat(rayCount)) * CGFloat(i) + 0.3
            let rayLength: CGFloat = 240
            let rayWidth: CGFloat = 28
            
            let rayPath = CGMutablePath()
            rayPath.move(to: .zero)
            rayPath.addLine(to: CGPoint(x: -rayWidth * 0.5, y: rayLength))
            rayPath.addLine(to: CGPoint(x: rayWidth * 0.5, y: rayLength))
            rayPath.closeSubpath()
            
            let ray = SKShapeNode(path: rayPath)
            ray.fillColor = UIColor(red: 1.0, green: 0.95, blue: 0.7, alpha: 0.08)
            ray.strokeColor = .clear
            ray.zRotation = angle
            ray.name = "sunRay"
            sunRaysNode.addChild(ray)
        }
    }
    
    // MARK: - Wildflowers
    
    private func buildWildflowers() {
        let flowerColors: [UIColor] = [
            UIColor(red: 1.0, green: 0.92, blue: 0.30, alpha: 1),  // Yellow
            UIColor(red: 0.85, green: 0.45, blue: 0.65, alpha: 1), // Pink
            UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 0.85), // White
            UIColor(red: 0.65, green: 0.50, blue: 0.85, alpha: 1), // Purple
            UIColor(red: 0.95, green: 0.60, blue: 0.25, alpha: 1), // Orange
        ]
        
        for _ in 0..<18 {
            let flower = SKShapeNode(circleOfRadius: CGFloat.random(in: 2.5...5))
            flower.fillColor = flowerColors.randomElement() ?? .yellow
            flower.strokeColor = .clear
            flower.zPosition = Z.ground.rawValue + 0.5
            flower.position = CGPoint(
                x: CGFloat.random(in: -450...450),
                y: CGFloat.random(in: -180...(-60))
            )
            flower.name = "flower"
            groundNode.addChild(flower)
        }
    }
    
    // MARK: - Fence

    private func buildFence() {
        fenceNode.zPosition = Z.fence.rawValue
        root.addChild(fenceNode)
        
        let postSize = CGSize(width: 8, height: 42)
        let railSize = CGSize(width: 80, height: 6)
        
        for i in 0..<4 {
            let x = -300 + CGFloat(i) * 80
            let post = SKShapeNode(rectOf: postSize, cornerRadius: 2)
            post.fillColor = UIColor(red: 0.58, green: 0.38, blue: 0.18, alpha: 1)
            post.strokeColor = .clear
            post.position = CGPoint(x: x, y: -20)
            fenceNode.addChild(post)
            
            // Post cap
            let cap = SKShapeNode(rectOf: CGSize(width: 12, height: 4), cornerRadius: 2)
            cap.fillColor = UIColor(red: 0.52, green: 0.34, blue: 0.16, alpha: 1)
            cap.strokeColor = .clear
            cap.position = CGPoint(x: 0, y: 21)
            post.addChild(cap)
            
            if i < 3 {
                let rail = SKShapeNode(rectOf: railSize, cornerRadius: 2)
                rail.fillColor = UIColor(red: 0.52, green: 0.34, blue: 0.16, alpha: 1)
                rail.strokeColor = .clear
                rail.position = CGPoint(x: x + 40, y: -10)
                fenceNode.addChild(rail)
                
                let rail2 = SKShapeNode(rectOf: railSize, cornerRadius: 2)
                rail2.fillColor = UIColor(red: 0.52, green: 0.34, blue: 0.16, alpha: 1)
                rail2.strokeColor = .clear
                rail2.position = CGPoint(x: x + 40, y: -25)
                fenceNode.addChild(rail2)
            }
        }
    }
    
    // MARK: - Barn
    
    private func buildBarn() {
        barnNode.zPosition = Z.structures.rawValue
        root.addChild(barnNode)
        
        // Barn Base
        let base = SKShapeNode(rectOf: CGSize(width: 140, height: 100), cornerRadius: 4)
        base.fillColor = UIColor(red: 0.78, green: 0.22, blue: 0.18, alpha: 1)
        base.strokeColor = .clear
        base.position = CGPoint(x: 0, y: 50)
        barnNode.addChild(base)
        
        // Siding lines
        for i in 0..<5 {
            let line = SKShapeNode(rectOf: CGSize(width: 130, height: 2))
            line.fillColor = UIColor.black.withAlphaComponent(0.1)
            line.strokeColor = .clear
            line.position = CGPoint(x: 0, y: 20 + CGFloat(i) * 15)
            base.addChild(line)
        }
        
        // Trim strip at base
        let trim = SKShapeNode(rectOf: CGSize(width: 142, height: 6))
        trim.fillColor = UIColor(red: 0.9, green: 0.88, blue: 0.82, alpha: 1)
        trim.strokeColor = .clear
        trim.position = CGPoint(x: 0, y: 0)
        base.addChild(trim)
        
        // Roof
        let roofPath = CGMutablePath()
        roofPath.move(to: CGPoint(x: -82, y: 100))
        roofPath.addLine(to: CGPoint(x: 0, y: 158))
        roofPath.addLine(to: CGPoint(x: 82, y: 100))
        roofPath.closeSubpath()
        let roof = SKShapeNode(path: roofPath)
        roof.fillColor = UIColor(red: 0.28, green: 0.18, blue: 0.12, alpha: 1)
        roof.strokeColor = .clear
        barnNode.addChild(roof)
        
        // Door
        let door = SKShapeNode(rectOf: CGSize(width: 50, height: 75), cornerRadius: 2)
        door.fillColor = UIColor(red: 0.18, green: 0.08, blue: 0.08, alpha: 1)
        door.strokeColor = UIColor.white.withAlphaComponent(0.7)
        door.lineWidth = 3
        door.position = CGPoint(x: 0, y: 37)
        barnNode.addChild(door)
        
        // Cross brace on door
        let brace = SKShapeNode(rectOf: CGSize(width: 58, height: 3.5))
        brace.fillColor = UIColor.white.withAlphaComponent(0.45)
        brace.strokeColor = .clear
        brace.zRotation = .pi / 4
        door.addChild(brace)
        
        let brace2 = SKShapeNode(rectOf: CGSize(width: 58, height: 3.5))
        brace2.fillColor = UIColor.white.withAlphaComponent(0.45)
        brace2.strokeColor = .clear
        brace2.zRotation = -.pi / 4
        door.addChild(brace2)
        
        // Warm light glow from door
        let doorGlow = SKShapeNode(rectOf: CGSize(width: 46, height: 70), cornerRadius: 2)
        doorGlow.fillColor = UIColor(red: 1.0, green: 0.9, blue: 0.6, alpha: 0.12)
        doorGlow.strokeColor = .clear
        door.addChild(doorGlow)
        
        // Window — warm light
        let win = SKShapeNode(circleOfRadius: 14)
        win.fillColor = UIColor(red: 1.0, green: 0.92, blue: 0.55, alpha: 1)
        win.strokeColor = .white
        win.lineWidth = 3
        win.position = CGPoint(x: 0, y: 128)
        barnNode.addChild(win)
        
        // Window glow
        let winGlow = SKShapeNode(circleOfRadius: 22)
        winGlow.fillColor = UIColor(red: 1.0, green: 0.92, blue: 0.55, alpha: 0.10)
        winGlow.strokeColor = .clear
        win.addChild(winGlow)
        
        // Silo
        let silo = SKShapeNode(rectOf: CGSize(width: 40, height: 90), cornerRadius: 2)
        silo.fillColor = UIColor(red: 0.68, green: 0.68, blue: 0.72, alpha: 1)
        silo.strokeColor = .clear
        silo.position = CGPoint(x: 85, y: 45)
        barnNode.addChild(silo)
        
        // Silo bands
        for i in 0..<3 {
            let band = SKShapeNode(rectOf: CGSize(width: 42, height: 2))
            band.fillColor = UIColor(red: 0.58, green: 0.58, blue: 0.62, alpha: 1)
            band.strokeColor = .clear
            band.position = CGPoint(x: 0, y: -25 + CGFloat(i) * 25)
            silo.addChild(band)
        }
        
        let siloRoof = SKShapeNode(path: {
            let p = CGMutablePath()
            p.move(to: CGPoint(x: -20, y: 45))
            p.addArc(center: CGPoint(x: 0, y: 45), radius: 20, startAngle: .pi, endAngle: 0, clockwise: false)
            return p
        }())
        siloRoof.fillColor = UIColor(red: 0.58, green: 0.58, blue: 0.62, alpha: 1)
        siloRoof.strokeColor = .clear
        silo.addChild(siloRoof)
    }
    
    // MARK: - Vegetation
    
    private func buildVegetation() {
        vegetationNode.zPosition = Z.vegetation.rawValue
        root.addChild(vegetationNode)
        
        // Corn Stalks (Right Side)
        for i in 0..<12 {
            let x = 200 + CGFloat(i) * 25 + CGFloat.random(in: -10...10)
            let y = -140 + CGFloat.random(in: -20...20)
            
            let stalk = SKNode()
            stalk.position = CGPoint(x: x, y: y)
            
            // Stem — slightly thicker
            let stemHeight = CGFloat.random(in: 55...70)
            let stem = SKShapeNode(rectOf: CGSize(width: 4.5, height: stemHeight), cornerRadius: 2)
            stem.fillColor = UIColor(red: 0.38, green: 0.68, blue: 0.18, alpha: 1)
            stem.strokeColor = .clear
            stem.position = CGPoint(x: 0, y: stemHeight / 2)
            stalk.addChild(stem)
            
            // Leaves
            let leaf1 = SKShapeNode(ellipseOf: CGSize(width: 22, height: 6))
            leaf1.fillColor = UIColor(red: 0.32, green: 0.62, blue: 0.12, alpha: 1)
            leaf1.strokeColor = .clear
            leaf1.zRotation = .pi / 4
            leaf1.position = CGPoint(x: 9, y: 20)
            stalk.addChild(leaf1)
            
            let leaf2 = SKShapeNode(ellipseOf: CGSize(width: 22, height: 6))
            leaf2.fillColor = UIColor(red: 0.32, green: 0.62, blue: 0.12, alpha: 1)
            leaf2.strokeColor = .clear
            leaf2.zRotation = -.pi / 4
            leaf2.position = CGPoint(x: -9, y: 40)
            stalk.addChild(leaf2)
            
            // Corn cob
            if i % 2 == 0 {
                let cob = SKShapeNode(ellipseOf: CGSize(width: 7, height: 13))
                cob.fillColor = UIColor(red: 0.92, green: 0.82, blue: 0.22, alpha: 1)
                cob.strokeColor = .clear
                cob.position = CGPoint(x: 5, y: 35)
                cob.zRotation = .pi / 6
                stalk.addChild(cob)
            }
            
            vegetationNode.addChild(stalk)
        }
        
        // Wheat stalks (Left side) — NEW
        for i in 0..<8 {
            let x = -340 + CGFloat(i) * 22 + CGFloat.random(in: -8...8)
            let y = -150 + CGFloat.random(in: -15...15)
            
            let stalk = SKNode()
            stalk.position = CGPoint(x: x, y: y)
            
            let stemH = CGFloat.random(in: 40...55)
            let stem = SKShapeNode(rectOf: CGSize(width: 3, height: stemH), cornerRadius: 1.5)
            stem.fillColor = UIColor(red: 0.72, green: 0.62, blue: 0.28, alpha: 1)
            stem.strokeColor = .clear
            stem.position = CGPoint(x: 0, y: stemH / 2)
            stalk.addChild(stem)
            
            // Wheat head
            let head = SKShapeNode(ellipseOf: CGSize(width: 8, height: 14))
            head.fillColor = UIColor(red: 0.85, green: 0.72, blue: 0.32, alpha: 1)
            head.strokeColor = .clear
            head.position = CGPoint(x: 0, y: stemH + 4)
            stalk.addChild(head)
            
            vegetationNode.addChild(stalk)
        }
    }
    
    // MARK: - Layout & Animation
    
    private func spawnVectorAnimals() {
        animalLayer.removeAllChildren()
        animals.removeAll()
        
        let factory = AnimalFactory()
        
        let cow1 = factory.createCow()
        animalLayer.addChild(cow1)
        animals.append(cow1)
        
        let cow2 = factory.createCow()
        animalLayer.addChild(cow2)
        animals.append(cow2)
        
        let sheep1 = factory.createSheep()
        animalLayer.addChild(sheep1)
        animals.append(sheep1)
        
        let sheep2 = factory.createSheep()
        animalLayer.addChild(sheep2)
        animals.append(sheep2)
        
        let pig = factory.createPig()
        animalLayer.addChild(pig)
        animals.append(pig)
        
        let chicken1 = factory.createChicken()
        animalLayer.addChild(chicken1)
        animals.append(chicken1)
        
        let chicken2 = factory.createChicken()
        animalLayer.addChild(chicken2)
        animals.append(chicken2)
    }

    private func layoutScene() {
        let w = size.width
        let h = size.height
        
        // 1. Sky — warm multi-stop gradient via overlayed fills
        let skyRect = CGRect(x: -w, y: -h, width: w*2, height: h*2)
        skyNode.path = CGPath(rect: skyRect, transform: nil)
        skyNode.fillColor = UIColor(red: 0.48, green: 0.78, blue: 0.92, alpha: 1)
        
        // Warm horizon tint
        let horizonNode = skyNode.childNode(withName: "horizon") as? SKShapeNode ?? {
            let n = SKShapeNode()
            n.name = "horizon"
            n.strokeColor = .clear
            skyNode.addChild(n)
            return n
        }()
        let horizonRect = CGRect(x: -w, y: -h * 0.4, width: w * 2, height: h * 0.5)
        horizonNode.path = CGPath(rect: horizonRect, transform: nil)
        horizonNode.fillColor = UIColor(red: 0.98, green: 0.88, blue: 0.68, alpha: 0.35)
        
        // 2. Sun position
        sunNode.position = CGPoint(x: w * 0.3, y: h * 0.35)
        sunRaysNode.position = sunNode.position
        
        // 3. Mountains
        mountainNode.path = createHillPath(width: w, amplitude: 80, yOffset: 50)
        mountainNode.position = CGPoint(x: 0, y: -h * 0.05)
        
        // 4. Hills
        farHillNode.path = createHillPath(width: w, amplitude: 60, yOffset: 0)
        farHillNode.position = CGPoint(x: 0, y: -h * 0.15)
        
        closeHillNode.path = createHillPath(width: w * 1.2, amplitude: 50, yOffset: -50)
        closeHillNode.position = CGPoint(x: 0, y: -h * 0.25)
        
        // 5. Ground
        let groundPath = CGMutablePath()
        groundPath.move(to: CGPoint(x: -w, y: -h * 0.35))
        groundPath.addCurve(to: CGPoint(x: w, y: -h * 0.35), control1: CGPoint(x: -w*0.3, y: -h*0.25), control2: CGPoint(x: w*0.3, y: -h*0.4))
        groundPath.addLine(to: CGPoint(x: w, y: -h))
        groundPath.addLine(to: CGPoint(x: -w, y: -h))
        groundPath.closeSubpath()
        groundNode.path = groundPath
        
        // 6. Fence position
        fenceNode.position = CGPoint(x: -w * 0.1, y: -h * 0.22)
        
        // 7. Barn placement
        barnNode.position = CGPoint(x: w * 0.2, y: -h * 0.18)
        barnNode.setScale(0.8)
        
        // 8. Vegetation placement
        vegetationNode.position = CGPoint(x: 0, y: -h * 0.05)
        
        // 9. Animal Placement — spread across pasture
        let animalMinX = -w * 0.4
        let animalMaxX = w * 0.15  // Don't overlap barn too much
        for (i, anim) in animals.enumerated() {
            let xPos = animalMinX + (animalMaxX - animalMinX) * CGFloat(i) / max(1, CGFloat(animals.count - 1)) + CGFloat.random(in: -20...20)
            let yPos = -h * 0.3 + CGFloat.random(in: -25...25)
            anim.position = CGPoint(x: xPos, y: yPos)
            anim.zPosition = Z.animals.rawValue - yPos * 0.01
        }
        
        // 10. Grass
        root.enumerateChildNodes(withName: "grass") { node, _ in
            let x = CGFloat.random(in: -w*0.5...w*0.5)
            let y = -h * 0.4 + CGFloat.random(in: -40...60)
            node.position = CGPoint(x: x, y: y)
        }
        
        debugNodeCount = recursiveNodeCount(from: root)
        
        // Rasterize
        if let view = view {
            rasterizeStaticNodes(in: view)
        }
    }
    
    // Performance: Rasterize complex vector nodes into sprites
    private func rasterizeStaticNodes(in view: SKView) {
        func cache(_ node: SKNode, z: CGFloat, name: String) {
            if node.parent == nil { return }
            if node.children.first(where: { $0 is SKSpriteNode }) != nil { return }
            
            guard let texture = view.texture(from: node) else { return }
            
            let sprite = SKSpriteNode(texture: texture)
            sprite.position = node.position
            sprite.zPosition = z
            sprite.name = name + "_cached"
            
            root.addChild(sprite)
            node.removeFromParent()
        }
        
        cache(mountainNode, z: Z.mountains.rawValue, name: "mountains")
        cache(farHillNode, z: Z.farHills.rawValue, name: "farHills")
        cache(closeHillNode, z: Z.closeHills.rawValue, name: "closeHills")
        cache(groundNode, z: Z.ground.rawValue, name: "ground")
        cache(fenceNode, z: Z.fence.rawValue, name: "fence")
        cache(barnNode, z: Z.structures.rawValue, name: "barn")
        cache(vegetationNode, z: Z.vegetation.rawValue, name: "vegetation")
        
        debugNodeCount = recursiveNodeCount(from: root)
        
        if ambientNodes.isEmpty {
            buildAmbientParticles()
        }
    }
    
    private func buildAmbientParticles() {
        // Warm firefly-like golden motes
        for _ in 0..<20 {
            let p = SKShapeNode(circleOfRadius: CGFloat.random(in: 1.5...3.5))
            p.fillColor = UIColor(red: 1.0, green: 0.92, blue: 0.55, alpha: 0.3)
            p.strokeColor = .clear
            p.blendMode = .add
            p.zPosition = Z.ambient.rawValue
            p.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height * 0.3...size.height * 0.3)
            )
            
            let move = SKAction.moveBy(
                x: CGFloat.random(in: -25...25),
                y: CGFloat.random(in: -15...15),
                duration: Double.random(in: 3.5...7)
            )
            let fade = SKAction.sequence([
                SKAction.fadeAlpha(to: CGFloat.random(in: 0.12...0.35), duration: Double.random(in: 2...4)),
                SKAction.fadeAlpha(to: CGFloat.random(in: 0.25...0.45), duration: Double.random(in: 2...4))
            ])
            let seq = SKAction.sequence([move, move.reversed()])
            p.run(.repeatForever(.group([seq, fade])))
            
            root.addChild(p)
            ambientNodes.append(p)
        }
    }
    
    private func createHillPath(width: CGFloat, amplitude: CGFloat, yOffset: CGFloat) -> CGPath {
        let path = CGMutablePath()
        let startX = -width * 0.8
        let endX = width * 0.8
        path.move(to: CGPoint(x: startX, y: -size.height))
        path.addLine(to: CGPoint(x: startX, y: yOffset))
        path.addCurve(to: CGPoint(x: endX, y: yOffset),
                      control1: CGPoint(x: -width * 0.2, y: yOffset + amplitude),
                      control2: CGPoint(x: width * 0.2, y: yOffset - amplitude))
        path.addLine(to: CGPoint(x: endX, y: -size.height))
        path.closeSubpath()
        return path
    }
    
    private func animateScene() {
        sunNode.removeAllActions()
        sunRaysNode.removeAllActions()
        for anim in animals { anim.removeAllActions() }
        
        if !reducedMotion {
            // Sun pulse
            let scaleUp = SKAction.scale(to: 1.08, duration: 3.5)
            let scaleDown = SKAction.scale(to: 1.0, duration: 3.5)
            scaleUp.timingMode = .easeInEaseOut
            scaleDown.timingMode = .easeInEaseOut
            sunNode.run(.repeatForever(.sequence([scaleUp, scaleDown])))
            
            // Sun rays slow rotation
            sunRaysNode.run(.repeatForever(.rotate(byAngle: .pi * 2, duration: 90)))
            
            // Animals wander
            for anim in animals {
                wander(anim)
            }
        }
    }
    
    private func wander(_ node: SKNode) {
        let wait = SKAction.wait(forDuration: Double.random(in: 1...4))
        let move = SKAction.run { [weak self, weak node] in
            guard let self = self, let node = node else { return }
            let dist = CGFloat.random(in: 20...50)
            let left = Bool.random()
            
            node.xScale = left ? abs(node.xScale) : -abs(node.xScale)
            
            let moveAction = SKAction.moveBy(x: left ? -dist : dist, y: 0, duration: Double.random(in: 1.5...3.0))
            let bob = SKAction.sequence([
                SKAction.moveBy(x: 0, y: 2, duration: 0.15),
                SKAction.moveBy(x: 0, y: -2, duration: 0.15)
            ])
            let walk = SKAction.group([
                moveAction,
                SKAction.repeat(bob, count: Int(moveAction.duration / 0.3))
            ])
            
            node.run(walk) {
                if abs(node.position.x) > self.size.width * 0.45 {
                    node.position.x = node.position.x > 0 ? self.size.width * 0.4 : -self.size.width * 0.4
                }
                self.wander(node)
            }
        }
        node.run(.sequence([wait, move]))
    }
    
    // MARK: - Helpers
    private func recursiveNodeCount(from node: SKNode) -> Int {
        var total = 1
        for child in node.children { total += recursiveNodeCount(from: child) }
        return total
    }
}

// MARK: - Vector Animal Factory
private class AnimalFactory {
    func createCow() -> SKNode {
        let node = SKNode()
        
        // Body
        let body = SKShapeNode(rectOf: CGSize(width: 42, height: 28), cornerRadius: 10)
        body.fillColor = .white
        body.strokeColor = .clear
        node.addChild(body)
        
        // Spots
        let spot1 = SKShapeNode(circleOfRadius: 6)
        spot1.fillColor = UIColor(red: 0.2, green: 0.15, blue: 0.1, alpha: 1)
        spot1.strokeColor = .clear
        spot1.position = CGPoint(x: -10, y: 2)
        node.addChild(spot1)
        
        let spot2 = SKShapeNode(circleOfRadius: 4)
        spot2.fillColor = UIColor(red: 0.2, green: 0.15, blue: 0.1, alpha: 1)
        spot2.strokeColor = .clear
        spot2.position = CGPoint(x: 8, y: -3)
        node.addChild(spot2)
        
        // Head
        let head = SKShapeNode(rectOf: CGSize(width: 22, height: 22), cornerRadius: 6)
        head.fillColor = .white
        head.strokeColor = .clear
        head.position = CGPoint(x: -24, y: 12)
        node.addChild(head)
        
        // Eye
        let eye = SKShapeNode(circleOfRadius: 2)
        eye.fillColor = .black
        eye.strokeColor = .clear
        eye.position = CGPoint(x: -4, y: 3)
        head.addChild(eye)
        
        // Nose
        let nose = SKShapeNode(ellipseOf: CGSize(width: 8, height: 5))
        nose.fillColor = UIColor(red: 1.0, green: 0.78, blue: 0.72, alpha: 1)
        nose.strokeColor = .clear
        nose.position = CGPoint(x: -6, y: -3)
        head.addChild(nose)
        
        // Legs
        let legSize = CGSize(width: 6, height: 14)
        for x in [-14, 14] {
            let leg = SKShapeNode(rectOf: legSize, cornerRadius: 2)
            leg.fillColor = .white
            leg.strokeColor = .clear
            leg.position = CGPoint(x: CGFloat(x), y: -18)
            node.addChild(leg)
        }
        
        // Tail
        let tail = SKShapeNode(rectOf: CGSize(width: 2, height: 12), cornerRadius: 1)
        tail.fillColor = UIColor(red: 0.75, green: 0.65, blue: 0.55, alpha: 1)
        tail.strokeColor = .clear
        tail.position = CGPoint(x: 22, y: 8)
        tail.zRotation = -.pi / 6
        node.addChild(tail)
        
        return node
    }
    
    func createSheep() -> SKNode {
        let node = SKNode()
        
        // Fluffy body (multiple overlapping circles)
        let body = SKShapeNode(circleOfRadius: 16)
        body.fillColor = UIColor(red: 0.96, green: 0.95, blue: 0.92, alpha: 1)
        body.strokeColor = .clear
        node.addChild(body)
        
        let fluff1 = SKShapeNode(circleOfRadius: 10)
        fluff1.fillColor = UIColor(red: 0.98, green: 0.97, blue: 0.94, alpha: 1)
        fluff1.strokeColor = .clear
        fluff1.position = CGPoint(x: -6, y: 8)
        node.addChild(fluff1)
        
        let fluff2 = SKShapeNode(circleOfRadius: 10)
        fluff2.fillColor = UIColor(red: 0.94, green: 0.93, blue: 0.9, alpha: 1)
        fluff2.strokeColor = .clear
        fluff2.position = CGPoint(x: 6, y: 6)
        node.addChild(fluff2)
        
        // Head
        let head = SKShapeNode(circleOfRadius: 10)
        head.fillColor = UIColor(red: 0.15, green: 0.12, blue: 0.1, alpha: 1)
        head.strokeColor = .clear
        head.position = CGPoint(x: -14, y: 6)
        node.addChild(head)
        
        // Eye
        let eye = SKShapeNode(circleOfRadius: 1.5)
        eye.fillColor = .white
        eye.strokeColor = .clear
        eye.position = CGPoint(x: -3, y: 2)
        head.addChild(eye)
        
        // Legs
        for x in [-8, 8] {
            let leg = SKShapeNode(rectOf: CGSize(width: 4, height: 12))
            leg.fillColor = UIColor(red: 0.15, green: 0.12, blue: 0.1, alpha: 1)
            leg.strokeColor = .clear
            leg.position = CGPoint(x: x, y: -18)
            node.addChild(leg)
        }
        return node
    }
    
    func createPig() -> SKNode {
        let node = SKNode()
        
        // Body
        let body = SKShapeNode(rectOf: CGSize(width: 32, height: 22), cornerRadius: 11)
        body.fillColor = UIColor(red: 0.98, green: 0.72, blue: 0.78, alpha: 1)
        body.strokeColor = .clear
        node.addChild(body)
        
        // Snout
        let snout = SKShapeNode(rectOf: CGSize(width: 10, height: 8), cornerRadius: 3)
        snout.fillColor = UIColor(red: 0.98, green: 0.52, blue: 0.58, alpha: 1)
        snout.strokeColor = .clear
        snout.position = CGPoint(x: -18, y: 2)
        node.addChild(snout)
        
        // Nostrils
        let nostril1 = SKShapeNode(circleOfRadius: 1.5)
        nostril1.fillColor = UIColor(red: 0.85, green: 0.42, blue: 0.48, alpha: 1)
        nostril1.strokeColor = .clear
        nostril1.position = CGPoint(x: -2, y: 0)
        snout.addChild(nostril1)
        
        let nostril2 = SKShapeNode(circleOfRadius: 1.5)
        nostril2.fillColor = UIColor(red: 0.85, green: 0.42, blue: 0.48, alpha: 1)
        nostril2.strokeColor = .clear
        nostril2.position = CGPoint(x: 2, y: 0)
        snout.addChild(nostril2)
        
        // Eye
        let eye = SKShapeNode(circleOfRadius: 2)
        eye.fillColor = .black
        eye.strokeColor = .clear
        eye.position = CGPoint(x: -12, y: 6)
        node.addChild(eye)
        
        // Ears
        let ear = SKShapeNode(ellipseOf: CGSize(width: 8, height: 6))
        ear.fillColor = UIColor(red: 0.95, green: 0.62, blue: 0.68, alpha: 1)
        ear.strokeColor = .clear
        ear.position = CGPoint(x: -8, y: 12)
        ear.zRotation = .pi / 6
        node.addChild(ear)
        
        // Legs
        for x in [-10, 10] {
            let leg = SKShapeNode(rectOf: CGSize(width: 5, height: 10), cornerRadius: 2)
            leg.fillColor = UIColor(red: 0.95, green: 0.65, blue: 0.72, alpha: 1)
            leg.strokeColor = .clear
            leg.position = CGPoint(x: CGFloat(x), y: -14)
            node.addChild(leg)
        }
        
        // Curly tail
        let tail = SKShapeNode(circleOfRadius: 3)
        tail.fillColor = UIColor(red: 0.95, green: 0.65, blue: 0.72, alpha: 1)
        tail.strokeColor = .clear
        tail.position = CGPoint(x: 18, y: 5)
        node.addChild(tail)
        
        return node
    }
    
    func createChicken() -> SKNode {
        let node = SKNode()
        
        // Body
        let body = SKShapeNode(circleOfRadius: 9)
        body.fillColor = UIColor(red: 0.98, green: 0.96, blue: 0.90, alpha: 1)
        body.strokeColor = .clear
        node.addChild(body)
        
        // Wing
        let wing = SKShapeNode(ellipseOf: CGSize(width: 8, height: 6))
        wing.fillColor = UIColor(red: 0.92, green: 0.88, blue: 0.8, alpha: 1)
        wing.strokeColor = .clear
        wing.position = CGPoint(x: 4, y: 0)
        node.addChild(wing)
        
        // Comb
        let comb = SKShapeNode(circleOfRadius: 3.5)
        comb.fillColor = UIColor(red: 0.92, green: 0.22, blue: 0.18, alpha: 1)
        comb.strokeColor = .clear
        comb.position = CGPoint(x: -1, y: 10)
        node.addChild(comb)
        
        // Beak
        let beak = SKShapeNode(rectOf: CGSize(width: 5, height: 4))
        beak.fillColor = UIColor(red: 0.95, green: 0.72, blue: 0.18, alpha: 1)
        beak.strokeColor = .clear
        beak.zRotation = .pi / 4
        beak.position = CGPoint(x: -9, y: 2)
        node.addChild(beak)
        
        // Eye
        let eye = SKShapeNode(circleOfRadius: 1.5)
        eye.fillColor = .black
        eye.strokeColor = .clear
        eye.position = CGPoint(x: -5, y: 4)
        node.addChild(eye)
        
        // Legs
        for x in [-3, 3] {
            let leg = SKShapeNode(rectOf: CGSize(width: 2, height: 6))
            leg.fillColor = UIColor(red: 0.92, green: 0.72, blue: 0.18, alpha: 1)
            leg.strokeColor = .clear
            leg.position = CGPoint(x: CGFloat(x), y: -12)
            node.addChild(leg)
        }
        
        return node
    }
}
