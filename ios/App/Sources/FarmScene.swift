import Foundation
import SpriteKit
import GameCore

final class FarmScene: SKScene {
    var onTileTapped: ((Int) -> Void)?

    private var world: WorldState?
    private var cropDefsByID: [String: CropDef] = [:]
    private var emojiByID: [String: String] = [:]

    override init(size: CGSize) {
        super.init(size: size)
        scaleMode = .resizeFill
        backgroundColor = .clear
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    func render(world: WorldState, cropDefs: [CropDef], displayMap: [String: CropDisplayInfo]) {
        self.world = world
        self.cropDefsByID = Dictionary(uniqueKeysWithValues: cropDefs.map { ($0.id, $0) })
        self.emojiByID = Dictionary(uniqueKeysWithValues: displayMap.map { ($0.key, $0.value.emoji) })
        redraw()
    }

    override func didMove(to view: SKView) {
        view.allowsTransparency = true
        redraw()
    }

    override func didChangeSize(_ oldSize: CGSize) {
        redraw()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        for node in nodes(at: location) {
            if let index = tileIndex(from: node) {
                animateTap(on: index)
                onTileTapped?(index)
                return
            }
        }
    }

    // MARK: - Tile index lookup

    private func tileIndex(from node: SKNode) -> Int? {
        var current: SKNode? = node
        while let candidate = current {
            if let name = candidate.name,
               name.hasPrefix("tile_"),
               let value = Int(name.replacingOccurrences(of: "tile_", with: "")) {
                return value
            }
            current = candidate.parent
        }
        return nil
    }

    // MARK: - Draw

    private func redraw() {
        removeAllChildren()
        guard let world else { return }

        drawSky(day: world.day)
        drawGround()
        drawBoard(world: world)
    }

    private func drawSky(day: Int) {
        let phase = CGFloat(day % 12) / 11.0

        let skyTop = SKColor(
            red: lerp(0.50, 0.65, phase),
            green: lerp(0.68, 0.86, phase),
            blue: lerp(0.90, 0.98, phase),
            alpha: 1
        )

        let sky = SKSpriteNode(color: skyTop, size: size)
        sky.position = CGPoint(x: size.width / 2, y: size.height / 2)
        sky.zPosition = 0
        addChild(sky)

        // Warm haze
        let haze = SKSpriteNode(
            color: SKColor(red: 1.0, green: 0.92, blue: 0.74, alpha: 0.12),
            size: CGSize(width: size.width, height: size.height * 0.5)
        )
        haze.position = CGPoint(x: size.width / 2, y: size.height * 0.75)
        haze.zPosition = 0.5
        addChild(haze)

        // Sun
        let sunRadius = min(size.width, size.height) * 0.08
        let sun = SKShapeNode(circleOfRadius: sunRadius)
        sun.fillColor = SKColor(red: 1, green: 0.95, blue: 0.68, alpha: 0.75)
        sun.strokeColor = SKColor(red: 1, green: 0.90, blue: 0.50, alpha: 0.85)
        sun.lineWidth = 2
        sun.glowWidth = 8
        sun.position = CGPoint(x: size.width * 0.8, y: size.height * 0.84)
        sun.zPosition = 1
        addChild(sun)
        sun.run(.repeatForever(.sequence([
            .moveBy(x: 0, y: 3, duration: 2.8),
            .moveBy(x: 0, y: -3, duration: 2.8),
        ])))

        // Clouds
        addCloud(at: CGPoint(x: size.width * 0.18, y: size.height * 0.82), width: size.width * 0.2, alpha: 0.22, drift: 24)
        addCloud(at: CGPoint(x: size.width * 0.68, y: size.height * 0.76), width: size.width * 0.15, alpha: 0.18, drift: 20)
    }

    private func drawGround() {
        let ground = SKShapeNode(rect: CGRect(x: 0, y: 0, width: size.width, height: size.height * 0.20))
        ground.fillColor = SKColor(red: 0.34, green: 0.60, blue: 0.32, alpha: 1.0)
        ground.strokeColor = .clear
        ground.zPosition = 2
        addChild(ground)

        // Subtle grass line
        let grassLine = SKShapeNode(rect: CGRect(x: 0, y: size.height * 0.195, width: size.width, height: 3))
        grassLine.fillColor = SKColor(red: 0.40, green: 0.68, blue: 0.36, alpha: 0.6)
        grassLine.strokeColor = .clear
        grassLine.zPosition = 2.5
        addChild(grassLine)
    }

    private func drawBoard(world: WorldState) {
        let columns = max(1, world.gridWidth)
        let rows = max(1, world.gridHeight)
        let padding: CGFloat = max(28, min(60, size.width * 0.07))
        let usableW = max(80, size.width - padding * 2)
        let usableH = max(80, size.height - padding * 2)
        let tileSize = min(usableW / CGFloat(columns), usableH / CGFloat(rows))
        let gap: CGFloat = max(4, min(8, tileSize * 0.06))
        let side = tileSize - gap

        let boardW = CGFloat(columns) * tileSize
        let boardH = CGFloat(rows) * tileSize
        let startX = (size.width - boardW) / 2
        let startY = (size.height - boardH) / 2

        // Board background
        let boardRect = CGRect(x: startX - 14, y: startY - 14, width: boardW + 28, height: boardH + 28)
        let boardShadow = SKShapeNode(rect: boardRect.offsetBy(dx: 0, dy: -5), cornerRadius: 18)
        boardShadow.fillColor = SKColor.black.withAlphaComponent(0.15)
        boardShadow.strokeColor = .clear
        boardShadow.zPosition = 4
        addChild(boardShadow)

        let board = SKShapeNode(rect: boardRect, cornerRadius: 18)
        board.fillColor = SKColor(red: 0.26, green: 0.18, blue: 0.10, alpha: 0.88)
        board.strokeColor = SKColor(red: 0.50, green: 0.36, blue: 0.22, alpha: 0.9)
        board.lineWidth = 1.5
        board.zPosition = 5
        addChild(board)

        // Tiles
        for row in 0..<rows {
            for col in 0..<columns {
                let index = row * columns + col
                guard world.tiles.indices.contains(index) else { continue }
                let tile = world.tiles[index]

                let x = startX + CGFloat(col) * tileSize
                let y = startY + CGFloat(rows - row - 1) * tileSize
                let rect = CGRect(x: x + gap / 2, y: y + gap / 2, width: side, height: side)

                drawTile(tile: tile, rect: rect, index: index, day: world.day, side: side)
            }
        }
    }

    private func drawTile(tile: Tile, rect: CGRect, index: Int, day: Int, side: CGFloat) {
        let cornerR = max(8, side * 0.10)

        // Shadow
        let shadow = SKShapeNode(rect: rect.offsetBy(dx: 0, dy: -2), cornerRadius: cornerR)
        shadow.fillColor = SKColor.black.withAlphaComponent(0.18)
        shadow.strokeColor = .clear
        shadow.zPosition = 9
        addChild(shadow)

        // Main tile
        let node = SKShapeNode(rect: rect, cornerRadius: cornerR)
        node.name = "tile_\(index)"
        node.fillColor = tileColor(for: tile, day: day)
        node.strokeColor = SKColor.black.withAlphaComponent(0.18)
        node.lineWidth = 1
        node.zPosition = 10
        addChild(node)

        // Inner highlight
        let inset = rect.insetBy(dx: rect.width * 0.06, dy: rect.height * 0.06)
        let inner = SKShapeNode(rect: inset, cornerRadius: max(4, side * 0.06))
        inner.fillColor = SKColor.white.withAlphaComponent(0.06)
        inner.strokeColor = .clear
        inner.zPosition = 11
        node.addChild(inner)

        if let planted = tile.planted {
            drawPlantedTile(node: node, rect: rect, planted: planted, day: day, side: side)
        } else {
            drawEmptyTile(node: node, rect: rect, side: side)
        }
    }

    private func drawPlantedTile(node: SKShapeNode, rect: CGRect, planted: PlantedCrop, day: Int, side: CGFloat) {
        let emoji = emojiByID[planted.cropID] ?? "🌱"
        let progress = growthProgress(for: planted, day: day)
        let isReady = progress >= 1.0

        // Crop emoji
        let label = SKLabelNode(text: emoji)
        label.fontSize = max(16, side * 0.36)
        label.verticalAlignmentMode = .center
        label.horizontalAlignmentMode = .center
        label.position = CGPoint(x: rect.midX, y: rect.midY + side * 0.06)
        label.name = node.name
        label.zPosition = 13
        node.addChild(label)

        // Gentle bob
        label.run(.repeatForever(.sequence([
            .moveBy(x: 0, y: 1.5, duration: 1.0),
            .moveBy(x: 0, y: -1.5, duration: 1.0),
        ])))

        // Progress bar
        let barW = side - 14
        let barH: CGFloat = 4
        let barX = rect.minX + 7
        let barY = rect.minY + 8

        let track = SKShapeNode(rect: CGRect(x: barX, y: barY, width: barW, height: barH), cornerRadius: 2)
        track.fillColor = SKColor.black.withAlphaComponent(0.2)
        track.strokeColor = .clear
        track.zPosition = 12
        node.addChild(track)

        let fillW = max(0, barW * CGFloat(progress))
        let fill = SKShapeNode(rect: CGRect(x: barX, y: barY, width: fillW, height: barH), cornerRadius: 2)
        fill.fillColor = isReady
            ? SKColor(red: 0.35, green: 0.85, blue: 0.40, alpha: 1)
            : SKColor(red: 0.98, green: 0.82, blue: 0.30, alpha: 1)
        fill.strokeColor = .clear
        fill.zPosition = 13
        node.addChild(fill)

        // Ready state
        if isReady {
            let star = SKLabelNode(text: "✦")
            star.fontSize = max(10, side * 0.14)
            star.fontColor = SKColor(red: 1, green: 0.96, blue: 0.52, alpha: 1)
            star.position = CGPoint(x: rect.maxX - 10, y: rect.maxY - 12)
            star.zPosition = 14
            node.addChild(star)
            star.run(.repeatForever(.sequence([
                .scale(to: 1.15, duration: 0.5),
                .scale(to: 0.95, duration: 0.5),
            ])))

            // Glow ring
            let ring = SKShapeNode(circleOfRadius: side * 0.42)
            ring.position = CGPoint(x: rect.midX, y: rect.midY)
            ring.fillColor = .clear
            ring.strokeColor = SKColor(red: 0.98, green: 0.88, blue: 0.38, alpha: 0.50)
            ring.lineWidth = 1.5
            ring.zPosition = 12
            node.addChild(ring)
            ring.run(.repeatForever(.sequence([
                .group([.fadeAlpha(to: 0.18, duration: 0.8), .scale(to: 1.06, duration: 0.8)]),
                .group([.fadeAlpha(to: 0.50, duration: 0.8), .scale(to: 1.0, duration: 0.8)]),
            ])))
        } else {
            // Percentage
            let pct = SKLabelNode(text: "\(Int(progress * 100))%")
            pct.fontSize = max(7, side * 0.08)
            pct.fontName = "AvenirNext-DemiBold"
            pct.fontColor = SKColor.white.withAlphaComponent(0.7)
            pct.horizontalAlignmentMode = .center
            pct.verticalAlignmentMode = .center
            pct.position = CGPoint(x: rect.midX, y: rect.minY + 17)
            pct.zPosition = 14
            node.addChild(pct)
        }
    }

    private func drawEmptyTile(node: SKShapeNode, rect: CGRect, side: CGFloat) {
        let plus = SKLabelNode(text: "+")
        plus.fontName = "AvenirNext-Bold"
        plus.fontSize = max(14, side * 0.20)
        plus.fontColor = SKColor.white.withAlphaComponent(0.22)
        plus.position = CGPoint(x: rect.midX, y: rect.midY - 2)
        plus.zPosition = 12
        node.addChild(plus)
    }

    // MARK: - Helpers

    private func tileColor(for tile: Tile, day: Int) -> SKColor {
        guard let planted = tile.planted else {
            return SKColor(red: 0.54, green: 0.36, blue: 0.20, alpha: 1.0)
        }
        guard let def = cropDefsByID[planted.cropID] else {
            return SKColor(red: 0.58, green: 0.52, blue: 0.44, alpha: 1.0)
        }
        let isReady = (day - planted.plantedDay) >= def.daysToGrow
        return isReady
            ? SKColor(red: 0.22, green: 0.62, blue: 0.30, alpha: 1.0)
            : SKColor(red: 0.72, green: 0.58, blue: 0.28, alpha: 1.0)
    }

    private func growthProgress(for planted: PlantedCrop, day: Int) -> Double {
        guard let def = cropDefsByID[planted.cropID] else { return 0 }
        let grown = max(0, day - planted.plantedDay)
        return min(1, Double(grown) / Double(max(1, def.daysToGrow)))
    }

    private func animateTap(on tileIndex: Int) {
        guard let node = childNode(withName: "tile_\(tileIndex)") else { return }
        node.run(.sequence([
            .group([.scale(to: 0.94, duration: 0.05), .fadeAlpha(to: 0.85, duration: 0.05)]),
            .group([.scale(to: 1.0, duration: 0.12), .fadeAlpha(to: 1.0, duration: 0.12)]),
        ]))
    }

    private func addCloud(at position: CGPoint, width: CGFloat, alpha: CGFloat, drift: TimeInterval) {
        let cloud = SKNode()
        cloud.position = position
        cloud.zPosition = 1.5
        let puffs: [(CGPoint, CGSize)] = [
            (CGPoint(x: -width * 0.25, y: 0), CGSize(width: width * 0.42, height: width * 0.22)),
            (CGPoint(x: 0, y: width * 0.06), CGSize(width: width * 0.54, height: width * 0.26)),
            (CGPoint(x: width * 0.25, y: 0), CGSize(width: width * 0.38, height: width * 0.20)),
        ]
        for puff in puffs {
            let node = SKShapeNode(ellipseOf: puff.1)
            node.position = puff.0
            node.fillColor = SKColor.white.withAlphaComponent(alpha)
            node.strokeColor = .clear
            cloud.addChild(node)
        }
        addChild(cloud)
        let total = size.width + width * 1.6
        cloud.run(.repeatForever(.sequence([
            .moveBy(x: total, y: 0, duration: drift),
            .moveBy(x: -total, y: 0, duration: 0),
        ])))
    }

    private func lerp(_ from: CGFloat, _ to: CGFloat, _ t: CGFloat) -> CGFloat {
        from + (to - from) * t
    }
}
