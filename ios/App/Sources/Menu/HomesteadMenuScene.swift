import SpriteKit
import UIKit

final class HomesteadMenuScene: SKScene {
    private enum Z: CGFloat {
        case sky = 0
        case sun = 5
        case mountains = 10
        case farHills = 15
        case closeHills = 20
        case ground = 25
        case fence = 28 // New
        case structures = 30 // Barn, Silo
        case animals = 35
        case vegetation = 38 // New (Corn/Wheat)
        case foreground = 40 // Grass, props
        case ambient = 50
    }

    private let root = SKNode()
    
    // Vector Layers
    private let skyNode = SKShapeNode()
    private let sunNode = SKShapeNode(circleOfRadius: 60)
    private let mountainNode = SKShapeNode()
    private let farHillNode = SKShapeNode()
    private let closeHillNode = SKShapeNode()
    private let groundNode = SKShapeNode()
    
    // Entities
    private let barnNode = SKNode()
    private let fenceNode = SKNode() // New
    private let vegetationNode = SKNode() // New
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
        backgroundColor = UIColor(red: 0.4, green: 0.8, blue: 0.9, alpha: 1)
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
    
    // MARK: - Scene Building
    
    private func buildVectorScene() {
        guard let view = view else { return }

        // 1. Sky
        skyNode.zPosition = Z.sky.rawValue
        root.addChild(skyNode)
        
        // 2. Sun
        sunNode.zPosition = Z.sun.rawValue
        sunNode.fillColor = UIColor(red: 1.0, green: 0.95, blue: 0.7, alpha: 1) // Warmer yellow
        sunNode.strokeColor = .clear
        root.addChild(sunNode)
        
        // 3. Mountains (Rasterized)
        mountainNode.zPosition = Z.mountains.rawValue
        mountainNode.fillColor = UIColor(red: 0.35, green: 0.55, blue: 0.65, alpha: 1)
        mountainNode.strokeColor = .clear
        // Add to temp node for rasterization, not root yet
        
        // 4. Far Hills (Rasterized)
        farHillNode.zPosition = Z.farHills.rawValue
        farHillNode.fillColor = UIColor(red: 0.6, green: 0.8, blue: 0.5, alpha: 1)
        farHillNode.strokeColor = .clear
        
        // 5. Close Hills (Rasterized)
        closeHillNode.zPosition = Z.closeHills.rawValue
        closeHillNode.fillColor = UIColor(red: 0.5, green: 0.75, blue: 0.4, alpha: 1)
        closeHillNode.strokeColor = .clear
        
        // 6. Ground (Rasterized)
        groundNode.zPosition = Z.ground.rawValue
        groundNode.fillColor = UIColor(red: 0.45, green: 0.7, blue: 0.35, alpha: 1)
        groundNode.strokeColor = .clear
        
        // Ground Patches
        for _ in 0..<5 {
            let patch = SKShapeNode(ellipseOf: CGSize(width: CGFloat.random(in: 100...300), height: CGFloat.random(in: 40...80)))
            patch.fillColor = UIColor(red: 0.42, green: 0.68, blue: 0.32, alpha: 1)
            patch.strokeColor = .clear
            patch.position = CGPoint(x: CGFloat.random(in: -400...400), y: CGFloat.random(in: -150...(-50)))
            groundNode.addChild(patch)
        }
        
        // 7. Fence (Rasterized)
        buildFence()
        
        // 8. Structures (Barn - Rasterized)
        buildBarn()
        
        // 9. Animals (Dynamic)
        animalLayer.zPosition = Z.animals.rawValue
        root.addChild(animalLayer)
        
        // 10. Vegetation (Rasterized)
        buildVegetation()
        
        // 11. Foreground Grass items (Dynamic)
        for _ in 0..<25 {
            let blade = SKShapeNode(rectOf: CGSize(width: 3, height: CGFloat.random(in: 8...16)), cornerRadius: 1.5)
            blade.fillColor = UIColor(red: 0.3, green: 0.5, blue: 0.2, alpha: 1)
            blade.strokeColor = .clear
            blade.zPosition = Z.foreground.rawValue
            blade.name = "grass"
            root.addChild(blade)
        }
    }
    

    
    private func buildFence() {
        fenceNode.zPosition = Z.fence.rawValue
        root.addChild(fenceNode)
        
        // Simple post and rail fence
        let postSize = CGSize(width: 8, height: 40)
        let railSize = CGSize(width: 80, height: 6)
        
        // Left side
        for i in 0..<4 {
            let x = -300 + CGFloat(i) * 80
            let post = SKShapeNode(rectOf: postSize, cornerRadius: 2)
            post.fillColor = UIColor(red: 0.6, green: 0.4, blue: 0.2, alpha: 1) // Wood
            post.strokeColor = .clear
            post.position = CGPoint(x: x, y: -20)
            fenceNode.addChild(post)
            
            if i < 3 {
                let rail = SKShapeNode(rectOf: railSize, cornerRadius: 2)
                rail.fillColor = UIColor(red: 0.55, green: 0.35, blue: 0.18, alpha: 1)
                rail.strokeColor = .clear
                rail.position = CGPoint(x: x + 40, y: -10)
                fenceNode.addChild(rail)
                
                let rail2 = SKShapeNode(rectOf: railSize, cornerRadius: 2)
                rail2.fillColor = UIColor(red: 0.55, green: 0.35, blue: 0.18, alpha: 1)
                rail2.strokeColor = .clear
                rail2.position = CGPoint(x: x + 40, y: -25)
                fenceNode.addChild(rail2)
            }
        }
    }
    
    private func buildBarn() {
        barnNode.zPosition = Z.structures.rawValue
        root.addChild(barnNode)
        
        // Barn Base
        let base = SKShapeNode(rectOf: CGSize(width: 140, height: 100), cornerRadius: 4)
        base.fillColor = UIColor(red: 0.8, green: 0.25, blue: 0.2, alpha: 1) // Barn Red
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
        
        // Roof
        let roofPath = CGMutablePath()
        roofPath.move(to: CGPoint(x: -80, y: 100))
        roofPath.addLine(to: CGPoint(x: 0, y: 155)) // Taller roof
        roofPath.addLine(to: CGPoint(x: 80, y: 100))
        roofPath.closeSubpath()
        let roof = SKShapeNode(path: roofPath)
        roof.fillColor = UIColor(red: 0.3, green: 0.2, blue: 0.15, alpha: 1) // Dark Brown
        roof.strokeColor = .clear
        barnNode.addChild(roof)
        
        // Door
        let door = SKShapeNode(rectOf: CGSize(width: 50, height: 75), cornerRadius: 2)
        door.fillColor = UIColor(red: 0.2, green: 0.1, blue: 0.1, alpha: 1)
        door.strokeColor = UIColor.white.withAlphaComponent(0.8)
        door.lineWidth = 4
        door.position = CGPoint(x: 0, y: 37)
        barnNode.addChild(door)
        
        // Cross brace on door
        let brace = SKShapeNode(rectOf: CGSize(width: 60, height: 4))
        brace.fillColor = UIColor.white.withAlphaComponent(0.5)
        brace.strokeColor = .clear
        brace.zRotation = .pi / 4
        door.addChild(brace)
        
        let brace2 = SKShapeNode(rectOf: CGSize(width: 60, height: 4))
        brace2.fillColor = UIColor.white.withAlphaComponent(0.5)
        brace2.strokeColor = .clear
        brace2.zRotation = -.pi / 4
        door.addChild(brace2)
        
        // Window
        let win = SKShapeNode(circleOfRadius: 14)
        win.fillColor = UIColor(red: 1.0, green: 0.95, blue: 0.6, alpha: 1) // Warm light
        win.strokeColor = .white
        win.lineWidth = 3
        win.position = CGPoint(x: 0, y: 125)
        barnNode.addChild(win)
        
        // Silo
        let silo = SKShapeNode(rectOf: CGSize(width: 40, height: 90), cornerRadius: 2)
        silo.fillColor = UIColor(red: 0.7, green: 0.7, blue: 0.75, alpha: 1) // Metal
        silo.strokeColor = .clear
        silo.position = CGPoint(x: 85, y: 45)
        barnNode.addChild(silo)
        
        let siloRoof = SKShapeNode(path: {
            let p = CGMutablePath()
            p.move(to: CGPoint(x: -20, y: 45))
            p.addArc(center: CGPoint(x: 0, y: 45), radius: 20, startAngle: .pi, endAngle: 0, clockwise: false)
            return p
        }())
        siloRoof.fillColor = UIColor(red: 0.6, green: 0.6, blue: 0.65, alpha: 1)
        siloRoof.strokeColor = .clear
        silo.addChild(siloRoof)
    }
    
    private func buildVegetation() {
        vegetationNode.zPosition = Z.vegetation.rawValue
        root.addChild(vegetationNode)
        
        // Corn Stalks (Right Side)
        for i in 0..<12 {
            let x = 200 + CGFloat(i) * 25 + CGFloat.random(in: -10...10)
            let y = -140 + CGFloat.random(in: -20...20)
            
            let stalk = SKNode()
            stalk.position = CGPoint(x: x, y: y)
            
            // Stem
            let stem = SKShapeNode(rectOf: CGSize(width: 4, height: 60), cornerRadius: 2)
            stem.fillColor = UIColor(red: 0.4, green: 0.7, blue: 0.2, alpha: 1)
            stem.strokeColor = .clear
            stem.position = CGPoint(x: 0, y: 30)
            stalk.addChild(stem)
            
            // Leaves
            let leaf1 = SKShapeNode(ellipseOf: CGSize(width: 20, height: 6))
            leaf1.fillColor = UIColor(red: 0.35, green: 0.65, blue: 0.15, alpha: 1)
            leaf1.strokeColor = .clear
            leaf1.zRotation = .pi / 4
            leaf1.position = CGPoint(x: 8, y: 20)
            stalk.addChild(leaf1)
            
            let leaf2 = SKShapeNode(ellipseOf: CGSize(width: 20, height: 6))
            leaf2.fillColor = UIColor(red: 0.35, green: 0.65, blue: 0.15, alpha: 1)
            leaf2.strokeColor = .clear
            leaf2.zRotation = -.pi / 4
            leaf2.position = CGPoint(x: -8, y: 40)
            stalk.addChild(leaf2)
            
            // Corn cob (yellow dot)
            if i % 2 == 0 {
                let cob = SKShapeNode(ellipseOf: CGSize(width: 6, height: 12))
                cob.fillColor = UIColor(red: 0.9, green: 0.8, blue: 0.2, alpha: 1)
                cob.strokeColor = .clear
                cob.position = CGPoint(x: 4, y: 35)
                cob.zRotation = .pi / 6
                stalk.addChild(cob)
            }
            
            vegetationNode.addChild(stalk)
        }
    }
    
    // MARK: - Layout & Animation
    
    private func spawnVectorAnimals() {
        // Clear old
        animalLayer.removeAllChildren()
        animals.removeAll()
        
        // Create 2 Cows, 2 Sheep, 1 Pig, 2 Chickens
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
        
        let pig = factory.createPig()
        animalLayer.addChild(pig)
        animals.append(pig)
        
        let chicken = factory.createChicken()
        animalLayer.addChild(chicken)
        animals.append(chicken)
    }

    private func layoutScene() {
        let w = size.width
        let h = size.height
        
        // 1. Sky
        let skyRect = CGRect(x: -w, y: -h, width: w*2, height: h*2)
        skyNode.path = CGPath(rect: skyRect, transform: nil)
        skyNode.fillColor = UIColor(red: 0.5, green: 0.8, blue: 0.95, alpha: 1)
        
        // 2. Sun
        sunNode.position = CGPoint(x: w * 0.3, y: h * 0.35)
        
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
        
        // 9. Initial Animal Placement
        for (i, anim) in animals.enumerated() {
            let xPos = CGFloat.random(in: -w*0.4...w*0.4)
            let yPos = -h * 0.3 + CGFloat.random(in: -20...20)
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
        
        // Trigger Rasterization
        if let view = view {
            rasterizeStaticNodes(in: view)
        }
    }
    
    // Performance: Rasterize complex vector nodes into sprites
    private func rasterizeStaticNodes(in view: SKView) {
        // Helper
        func cache(_ node: SKNode, z: CGFloat, name: String) {
            // Only rasterize if not already done (check for sprite child)
            if node.parent == nil { return } // Already removed/rasterized
            if node.children.first(where: { $0 is SKSpriteNode }) != nil { return }
            
            // 1. Snapshot
            guard let texture = view.texture(from: node) else { return }
            
            // 2. Create Sprite
            let sprite = SKSpriteNode(texture: texture)
            sprite.position = node.position
            sprite.zPosition = z
            sprite.name = name + "_cached"
            
            // Add sprite to root
            root.addChild(sprite)
            
            // Remove original vector node from root
            node.removeFromParent()
        }
        
        // Order matters for Z
        cache(mountainNode, z: Z.mountains.rawValue, name: "mountains")
        cache(farHillNode, z: Z.farHills.rawValue, name: "farHills")
        cache(closeHillNode, z: Z.closeHills.rawValue, name: "closeHills")
        cache(groundNode, z: Z.ground.rawValue, name: "ground")
        cache(fenceNode, z: Z.fence.rawValue, name: "fence")
        cache(barnNode, z: Z.structures.rawValue, name: "barn")
        cache(vegetationNode, z: Z.vegetation.rawValue, name: "vegetation")
        
        // Update debug count
        debugNodeCount = recursiveNodeCount(from: root)
        
        // Ambient Particles
        if ambientNodes.isEmpty {
            buildAmbientParticles()
        }
    }
    
    private func buildAmbientParticles() {
        for _ in 0..<25 {
            let p = SKShapeNode(circleOfRadius: CGFloat.random(in: 1...3))
            p.fillColor = UIColor.white.withAlphaComponent(0.4)
            p.strokeColor = .clear
            p.blendMode = .add
            p.zPosition = Z.ambient.rawValue
            p.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height/2...size.height/2)
            )
            
            // Subtle motion
            let move = SKAction.moveBy(
                x: CGFloat.random(in: -30...30),
                y: CGFloat.random(in: -20...20),
                duration: Double.random(in: 3...7)
            )
            let seq = SKAction.sequence([move, move.reversed()])
            p.run(.repeatForever(seq))
            
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
        for anim in animals { anim.removeAllActions() }
        
        if !reducedMotion {
            // Sun Glow
            let scaleUp = SKAction.scale(to: 1.1, duration: 3.0)
            let scaleDown = SKAction.scale(to: 1.0, duration: 3.0)
            sunNode.run(.repeatForever(.sequence([scaleUp, scaleDown])))
            
            // Animals Wander
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
            
            // Face direction
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
                // Keep in bounds
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
        let body = SKShapeNode(rectOf: CGSize(width: 40, height: 26), cornerRadius: 8)
        body.fillColor = .white
        body.strokeColor = .clear
        node.addChild(body)
        
        // Spots
        let spot = SKShapeNode(circleOfRadius: 6)
        spot.fillColor = .black
        spot.strokeColor = .clear
        spot.position = CGPoint(x: -10, y: 2)
        node.addChild(spot)
        
        // Head
        let head = SKShapeNode(rectOf: CGSize(width: 22, height: 22), cornerRadius: 6)
        head.fillColor = .white
        head.strokeColor = .clear
        head.position = CGPoint(x: -22, y: 12)
        node.addChild(head)
        
        // Legs
        let legSize = CGSize(width: 6, height: 12)
        for x in [-12, 12] {
            let leg = SKShapeNode(rectOf: legSize, cornerRadius: 2)
            leg.fillColor = .white
            leg.position = CGPoint(x: CGFloat(x), y: -16)
            node.addChild(leg)
        }
        
        return node
    }
    
    func createSheep() -> SKNode {
        let node = SKNode()
        let body = SKShapeNode(circleOfRadius: 16)
        body.fillColor = .white
        body.strokeColor = .clear
        node.addChild(body)
        
        let head = SKShapeNode(circleOfRadius: 10)
        head.fillColor = .black
        head.position = CGPoint(x: -14, y: 6)
        node.addChild(head)
        
        // Legs
        for x in [-8, 8] {
            let leg = SKShapeNode(rectOf: CGSize(width: 4, height: 10))
            leg.fillColor = .black
            leg.strokeColor = .clear
            leg.position = CGPoint(x: x, y: -16)
            node.addChild(leg)
        }
        return node
    }
    
    func createPig() -> SKNode {
        let node = SKNode()
        let body = SKShapeNode(rectOf: CGSize(width: 30, height: 20), cornerRadius: 10)
        body.fillColor = UIColor(red: 1.0, green: 0.7, blue: 0.8, alpha: 1) // Pink
        body.strokeColor = .clear
        node.addChild(body)
        
        let snout = SKShapeNode(rectOf: CGSize(width: 8, height: 6), cornerRadius: 2)
        snout.fillColor = UIColor(red: 1.0, green: 0.5, blue: 0.6, alpha: 1)
        snout.position = CGPoint(x: -16, y: 2)
        node.addChild(snout)
        
        return node
    }
    
    func createChicken() -> SKNode {
        let node = SKNode()
        let body = SKShapeNode(circleOfRadius: 8)
        body.fillColor = .white
        body.strokeColor = .clear
        node.addChild(body)
        
        let comb = SKShapeNode(circleOfRadius: 3)
        comb.fillColor = .red
        comb.strokeColor = .clear
        comb.position = CGPoint(x: 0, y: 8)
        node.addChild(comb)
        
        let beak = SKShapeNode(rectOf: CGSize(width: 4, height: 4))
        beak.fillColor = .orange
        beak.strokeColor = .clear
        beak.zRotation = .pi / 4
        beak.position = CGPoint(x: -8, y: 2)
        node.addChild(beak)
        
        return node
    }
}
