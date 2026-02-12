import Foundation
import SpriteKit

final class FarmScene: SKScene {
    var onTileTapped: ((Int) -> Void)?

    private var currentSnapshot: FarmRenderSnapshot?
    private var tileVisuals: [Int: TileVisual] = [:]
    private var cropEmojiByID: [String: String] = [:]

    private let boardNode = SKNode()
    private let backgroundNode = SKNode()
    private let worldCamera = SKCameraNode()
    private weak var attachedView: SKView?

    private var boardFrame: CGRect = .zero
    private var currentZoom: CGFloat = 1.0
    private var currentPan: CGSize = .zero
    private var reduceMotion = false
    private var particleEffectsEnabled = true
    private var showTileIndices = false
    private var preferredFPS = 60

    override init(size: CGSize) {
        super.init(size: size)
        scaleMode = .resizeFill
        backgroundColor = .clear
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    override func didMove(to view: SKView) {
        attachedView = view
        if backgroundNode.parent == nil {
            addChild(backgroundNode)
        }
        if boardNode.parent == nil {
            addChild(boardNode)
        }
        if camera == nil {
            camera = worldCamera
            addChild(worldCamera)
        }

        view.allowsTransparency = true
        view.ignoresSiblingOrder = true
        view.shouldCullNonVisibleNodes = true
        view.isAsynchronous = true
        applyRendererPreferences()

        shouldEnableEffects = false
        drawBackground()
        if let snapshot = currentSnapshot {
            rebuildGrid(for: snapshot)
            refreshAllTiles(snapshot: snapshot)
        }
        applyViewport()
    }

    override func didChangeSize(_ oldSize: CGSize) {
        drawBackground()
        if let snapshot = currentSnapshot {
            rebuildGrid(for: snapshot)
            refreshAllTiles(snapshot: snapshot)
        }
        applyViewport()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: boardNode)

        for node in boardNode.nodes(at: location) {
            if let index = tileIndex(from: node) {
                animateTap(on: index)
                onTileTapped?(index)
                return
            }
        }
    }

    func apply(snapshot: FarmRenderSnapshot, cropDisplay: [String: CropDisplayInfo]) {
        cropEmojiByID = cropDisplay.reduce(into: [String: String]()) { partial, entry in
            partial[entry.key] = entry.value.emoji
        }

        let needsGridRebuild = currentSnapshot?.gridWidth != snapshot.gridWidth
            || currentSnapshot?.gridHeight != snapshot.gridHeight
            || tileVisuals.isEmpty

        if needsGridRebuild {
            rebuildGrid(for: snapshot)
            refreshAllTiles(snapshot: snapshot)
            currentSnapshot = snapshot
            return
        }

        if currentSnapshot?.day != snapshot.day {
            refreshAllTiles(snapshot: snapshot)
            currentSnapshot = snapshot
            return
        }

        if let prior = currentSnapshot {
            let oldTiles = prior.tiles
            for tile in snapshot.tiles where oldTiles.indices.contains(tile.index) {
                let oldTile = oldTiles[tile.index]
                if oldTile != tile {
                    updateTile(from: oldTile, to: tile)
                }
            }
        } else {
            refreshAllTiles(snapshot: snapshot)
        }

        currentSnapshot = snapshot
    }

    func setViewport(zoom: CGFloat, pan: CGSize) {
        currentZoom = max(0.8, min(2.2, zoom))
        currentPan = pan
        applyViewport()
    }

    func setReducedMotion(_ enabled: Bool) {
        reduceMotion = enabled
    }

    func setParticleEffectsEnabled(_ enabled: Bool) {
        particleEffectsEnabled = enabled
    }

    func setShowTileIndices(_ enabled: Bool) {
        showTileIndices = enabled
        for visual in tileVisuals.values {
            visual.indexLabel.isHidden = !enabled
        }
    }

    func setPreferredFPS(_ fps: Int) {
        preferredFPS = max(30, min(120, fps))
        applyRendererPreferences()
    }

    private func drawBackground() {
        backgroundNode.removeAllChildren()

        let sky = SKSpriteNode(
            color: SKColor(red: 0.53, green: 0.77, blue: 0.93, alpha: 1),
            size: size
        )
        sky.position = CGPoint(x: size.width / 2, y: size.height / 2)
        sky.zPosition = -100
        backgroundNode.addChild(sky)

        let ground = SKShapeNode(rect: CGRect(x: 0, y: 0, width: size.width, height: size.height * 0.26))
        ground.fillColor = SKColor(red: 0.31, green: 0.60, blue: 0.33, alpha: 1)
        ground.strokeColor = .clear
        ground.zPosition = -90
        backgroundNode.addChild(ground)
    }

    private func rebuildGrid(for snapshot: FarmRenderSnapshot) {
        boardNode.removeAllChildren()
        tileVisuals.removeAll()

        let columns = max(1, snapshot.gridWidth)
        let rows = max(1, snapshot.gridHeight)

        let padding: CGFloat = max(22, min(44, size.width * 0.06))
        let usableWidth = max(100, size.width - (padding * 2))
        let usableHeight = max(120, size.height - (padding * 2))

        let tileSize = min(usableWidth / CGFloat(columns), usableHeight / CGFloat(rows))
        let gap = max(4, min(8, tileSize * 0.06))
        let side = tileSize - gap

        let boardWidth = CGFloat(columns) * tileSize
        let boardHeight = CGFloat(rows) * tileSize
        let originX = (size.width - boardWidth) / 2
        let originY = (size.height - boardHeight) / 2

        boardFrame = CGRect(x: originX - 12, y: originY - 12, width: boardWidth + 24, height: boardHeight + 24)

        let boardShadow = SKShapeNode(rect: boardFrame.offsetBy(dx: 0, dy: -4), cornerRadius: 18)
        boardShadow.fillColor = SKColor.black.withAlphaComponent(0.18)
        boardShadow.strokeColor = .clear
        boardShadow.zPosition = 0
        boardNode.addChild(boardShadow)

        let boardBase = SKShapeNode(rect: boardFrame, cornerRadius: 18)
        boardBase.fillColor = SKColor(red: 0.24, green: 0.18, blue: 0.10, alpha: 0.92)
        boardBase.strokeColor = SKColor(red: 0.52, green: 0.37, blue: 0.22, alpha: 0.9)
        boardBase.lineWidth = 1.2
        boardBase.zPosition = 1
        boardNode.addChild(boardBase)

        for row in 0..<rows {
            for col in 0..<columns {
                let index = row * columns + col
                let x = originX + CGFloat(col) * tileSize + gap / 2
                let y = originY + CGFloat(rows - row - 1) * tileSize + gap / 2
                let rect = CGRect(x: x, y: y, width: side, height: side)
                tileVisuals[index] = makeTile(index: index, rect: rect)
            }
        }

        applyViewport()
    }

    private func makeTile(index: Int, rect: CGRect) -> TileVisual {
        let corner = max(8, rect.width * 0.12)

        let tile = SKShapeNode(rect: rect, cornerRadius: corner)
        tile.name = "tile_\(index)"
        tile.fillColor = SKColor(red: 0.52, green: 0.35, blue: 0.21, alpha: 1)
        tile.strokeColor = SKColor.black.withAlphaComponent(0.2)
        tile.lineWidth = 1
        tile.zPosition = 5

        let emoji = SKLabelNode(text: "")
        emoji.name = "tile_\(index)"
        emoji.position = CGPoint(x: rect.midX, y: rect.midY + 5)
        emoji.verticalAlignmentMode = .center
        emoji.horizontalAlignmentMode = .center
        emoji.fontSize = max(16, rect.width * 0.38)
        emoji.zPosition = 8

        let plus = SKLabelNode(text: "+")
        plus.name = "tile_\(index)"
        plus.position = CGPoint(x: rect.midX, y: rect.midY - 2)
        plus.verticalAlignmentMode = .center
        plus.horizontalAlignmentMode = .center
        plus.fontName = "AvenirNext-Bold"
        plus.fontSize = max(14, rect.width * 0.22)
        plus.fontColor = SKColor.white.withAlphaComponent(0.26)
        plus.zPosition = 7

        let indexLabel = SKLabelNode(text: "\(index + 1)")
        indexLabel.name = "tile_\(index)"
        indexLabel.position = CGPoint(x: rect.maxX - 8, y: rect.maxY - 16)
        indexLabel.verticalAlignmentMode = .center
        indexLabel.horizontalAlignmentMode = .right
        indexLabel.fontName = "AvenirNext-DemiBold"
        indexLabel.fontSize = max(9, rect.width * 0.14)
        indexLabel.fontColor = SKColor.white.withAlphaComponent(0.46)
        indexLabel.zPosition = 8
        indexLabel.isHidden = !showTileIndices

        let barWidth = rect.width - 12
        let barRect = CGRect(x: rect.minX + 6, y: rect.minY + 6, width: barWidth, height: 4)

        let track = SKShapeNode(rect: barRect, cornerRadius: 2)
        track.fillColor = SKColor.black.withAlphaComponent(0.25)
        track.strokeColor = .clear
        track.zPosition = 6

        let fill = SKShapeNode(rect: CGRect(x: barRect.minX, y: barRect.minY, width: 0, height: barRect.height), cornerRadius: 2)
        fill.fillColor = SKColor(red: 0.98, green: 0.82, blue: 0.30, alpha: 1)
        fill.strokeColor = .clear
        fill.zPosition = 7

        let water = SKShapeNode(circleOfRadius: max(3, rect.width * 0.06))
        water.position = CGPoint(x: rect.minX + 10, y: rect.maxY - 10)
        water.fillColor = SKColor(red: 0.31, green: 0.65, blue: 0.95, alpha: 0.9)
        water.strokeColor = .clear
        water.zPosition = 8
        water.isHidden = true

        tile.addChild(track)
        tile.addChild(fill)
        tile.addChild(plus)
        tile.addChild(emoji)
        tile.addChild(indexLabel)
        tile.addChild(water)
        boardNode.addChild(tile)

        return TileVisual(
            tile: tile,
            emoji: emoji,
            plus: plus,
            indexLabel: indexLabel,
            progressTrack: track,
            progressFill: fill,
            waterBadge: water,
            progressRect: barRect
        )
    }

    private func refreshAllTiles(snapshot: FarmRenderSnapshot) {
        for tile in snapshot.tiles {
            updateTile(from: nil, to: tile)
        }
    }

    private func updateTile(from oldTile: FarmRenderTile?, to newTile: FarmRenderTile) {
        guard let visual = tileVisuals[newTile.index] else { return }

        if let cropID = newTile.cropID {
            visual.plus.isHidden = true
            visual.emoji.isHidden = false
            visual.emoji.text = cropEmojiByID[cropID] ?? "🌱"
            visual.progressTrack.isHidden = false
            visual.progressFill.isHidden = false

            let fillWidth = max(0, visual.progressRect.width * CGFloat(newTile.progress))
            visual.progressFill.path = CGPath(
                roundedRect: CGRect(
                    x: visual.progressRect.minX,
                    y: visual.progressRect.minY,
                    width: fillWidth,
                    height: visual.progressRect.height
                ),
                cornerWidth: 2,
                cornerHeight: 2,
                transform: nil
            )
            visual.progressFill.fillColor = newTile.isReady
                ? SKColor(red: 0.35, green: 0.85, blue: 0.40, alpha: 1)
                : SKColor(red: 0.98, green: 0.82, blue: 0.30, alpha: 1)

            visual.tile.fillColor = newTile.isReady
                ? SKColor(red: 0.23, green: 0.62, blue: 0.30, alpha: 1)
                : SKColor(red: 0.69, green: 0.52, blue: 0.25, alpha: 1)
        } else {
            visual.plus.isHidden = false
            visual.emoji.isHidden = true
            visual.progressTrack.isHidden = true
            visual.progressFill.isHidden = true
            visual.tile.fillColor = SKColor(red: 0.52, green: 0.35, blue: 0.21, alpha: 1)
        }

        visual.waterBadge.isHidden = !newTile.watered

        if oldTile?.cropID == nil, newTile.cropID != nil {
            guard !reduceMotion else { return }
            visual.tile.run(.sequence([
                .scale(to: 0.95, duration: 0.05),
                .scale(to: 1.0, duration: 0.14),
            ]))
        }

        if oldTile?.isReady == false, newTile.isReady {
            guard !reduceMotion else { return }
            visual.tile.run(.sequence([
                .colorize(with: SKColor(red: 0.98, green: 0.90, blue: 0.42, alpha: 1), colorBlendFactor: 0.18, duration: 0.12),
                .colorize(withColorBlendFactor: 0.0, duration: 0.20),
            ]))
        }

        if oldTile?.cropID != nil, newTile.cropID == nil {
            guard !reduceMotion else { return }
            spawnSparkle(at: visual.tile.frame.center)
        }
    }

    private func spawnSparkle(at position: CGPoint) {
        guard particleEffectsEnabled else { return }
        let sparkle = SKLabelNode(text: "✦")
        sparkle.fontColor = SKColor(red: 1.0, green: 0.95, blue: 0.55, alpha: 1)
        sparkle.fontSize = 16
        sparkle.position = position
        sparkle.zPosition = 10
        boardNode.addChild(sparkle)

        sparkle.run(.sequence([
            .group([
                .moveBy(x: 0, y: 16, duration: 0.25),
                .fadeOut(withDuration: 0.25),
                .scale(to: 1.4, duration: 0.25),
            ]),
            .removeFromParent(),
        ]))
    }

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

    private func animateTap(on tileIndex: Int) {
        guard let tile = tileVisuals[tileIndex]?.tile else { return }
        guard !reduceMotion else { return }
        tile.run(.sequence([
            .group([.scale(to: 0.94, duration: 0.05), .fadeAlpha(to: 0.85, duration: 0.05)]),
            .group([.scale(to: 1.0, duration: 0.10), .fadeAlpha(to: 1.0, duration: 0.10)]),
        ]))
    }

    private func applyViewport() {
        guard let camera else { return }

        let zoom = max(0.8, min(2.2, currentZoom))
        camera.setScale(1.0 / zoom)

        let center = CGPoint(x: boardFrame.midX, y: boardFrame.midY)
        let maxOffsetX = max(0, (boardFrame.width - boardFrame.width / zoom) / 2 + 40)
        let maxOffsetY = max(0, (boardFrame.height - boardFrame.height / zoom) / 2 + 40)

        let targetX = center.x - (currentPan.width / zoom)
        let targetY = center.y + (currentPan.height / zoom)

        camera.position = CGPoint(
            x: min(max(targetX, center.x - maxOffsetX), center.x + maxOffsetX),
            y: min(max(targetY, center.y - maxOffsetY), center.y + maxOffsetY)
        )
    }

    private func applyRendererPreferences() {
        attachedView?.preferredFramesPerSecond = preferredFPS
    }
}

private struct TileVisual {
    let tile: SKShapeNode
    let emoji: SKLabelNode
    let plus: SKLabelNode
    let indexLabel: SKLabelNode
    let progressTrack: SKShapeNode
    let progressFill: SKShapeNode
    let waterBadge: SKShapeNode
    let progressRect: CGRect
}

private extension CGRect {
    var center: CGPoint {
        CGPoint(x: midX, y: midY)
    }
}
