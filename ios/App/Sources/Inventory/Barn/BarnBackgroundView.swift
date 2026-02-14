import SwiftUI

struct BarnBackgroundView: View {
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Base wall: warm deep barn red-brown
                LinearGradient(
                    colors: [
                        Color(red: 0.42, green: 0.24, blue: 0.12),
                        Color(red: 0.28, green: 0.15, blue: 0.07)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Vertical plank texture
                HStack(spacing: 0) {
                    ForEach(0..<12, id: \.self) { i in
                        Rectangle()
                            .fill(i.isMultiple(of: 2)
                                  ? Color(red: 0.52, green: 0.30, blue: 0.16)
                                  : Color(red: 0.46, green: 0.26, blue: 0.13))
                            .overlay(
                                Rectangle()
                                    .stroke(Color.black.opacity(0.12), lineWidth: 0.5)
                            )
                    }
                }
                .opacity(0.50)

                // === Roof truss — heavy beams forming an A-frame ===
                Canvas { ctx, size in
                    let w = size.width, h = size.height
                    // Horizontal ridge beam
                    var ridge = Path()
                    ridge.addRect(CGRect(x: 0, y: 0, width: w, height: 18))
                    ctx.fill(ridge, with: .color(Color(red: 0.22, green: 0.12, blue: 0.05)))
                    ctx.stroke(ridge, with: .color(Color(red: 0.15, green: 0.08, blue: 0.03)), lineWidth: 1)

                    // Left diagonal brace
                    var leftBrace = Path()
                    leftBrace.move(to: CGPoint(x: 0, y: 0))
                    leftBrace.addLine(to: CGPoint(x: w * 0.38, y: h * 0.22))
                    ctx.stroke(leftBrace, with: .color(Color(red: 0.20, green: 0.11, blue: 0.04)), style: StrokeStyle(lineWidth: 14, lineCap: .square))

                    // Right diagonal brace
                    var rightBrace = Path()
                    rightBrace.move(to: CGPoint(x: w, y: 0))
                    rightBrace.addLine(to: CGPoint(x: w * 0.62, y: h * 0.22))
                    ctx.stroke(rightBrace, with: .color(Color(red: 0.20, green: 0.11, blue: 0.04)), style: StrokeStyle(lineWidth: 14, lineCap: .square))

                    // Center king post
                    var king = Path()
                    king.move(to: CGPoint(x: w * 0.50, y: 0))
                    king.addLine(to: CGPoint(x: w * 0.50, y: h * 0.26))
                    ctx.stroke(king, with: .color(Color(red: 0.20, green: 0.11, blue: 0.04)), style: StrokeStyle(lineWidth: 12, lineCap: .square))

                    // Horizontal collar tie
                    var collar = Path()
                    collar.addRect(CGRect(x: w * 0.20, y: h * 0.15, width: w * 0.60, height: 10))
                    ctx.fill(collar, with: .color(Color(red: 0.22, green: 0.12, blue: 0.05)))

                    // Inner highlight on ridge
                    var highlight = Path()
                    highlight.addRect(CGRect(x: 0, y: 0, width: w, height: 2))
                    ctx.fill(highlight, with: .color(Color.white.opacity(0.12)))
                }
                .frame(height: geo.size.height * 0.32)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

                // === Loft level horizontal beam ===
                VStack {
                    Rectangle()
                        .fill(Color(red: 0.20, green: 0.11, blue: 0.04))
                        .frame(height: 14)
                        .overlay(
                            Rectangle()
                                .fill(Color.white.opacity(0.08))
                                .frame(height: 1.5),
                            alignment: .top
                        )
                        .padding(.top, geo.size.height * 0.28)
                    Spacer()
                }

                // === Stall dividers — vertical posts ===
                HStack {
                    ForEach([0.25, 0.50, 0.75], id: \.self) { frac in
                        Spacer()
                        Rectangle()
                            .fill(Color(red: 0.18, green: 0.10, blue: 0.04))
                            .frame(width: 10)
                            .padding(.top, geo.size.height * 0.28)
                    }
                    Spacer()
                }

                // === Left window: warm morning light shaft ===
                Canvas { ctx, size in
                    var shaft = Path()
                    shaft.move(to: CGPoint(x: size.width * 0.06, y: 0))
                    shaft.addLine(to: CGPoint(x: size.width * 0.22, y: 0))
                    shaft.addLine(to: CGPoint(x: size.width * 0.38, y: size.height))
                    shaft.addLine(to: CGPoint(x: size.width * 0.00, y: size.height))
                    ctx.fill(shaft, with: .linearGradient(
                        Gradient(colors: [Color(red: 1.0, green: 0.88, blue: 0.60).opacity(0.14), .clear]),
                        startPoint: CGPoint(x: 0, y: 0),
                        endPoint: CGPoint(x: 0, y: size.height)
                    ))
                }

                // === Hay pile silhouettes at bottom corners ===
                Canvas { ctx, size in
                    let hayColor = Color(red: 0.65, green: 0.48, blue: 0.22)
                    // Left pile
                    var leftHay = Path()
                    leftHay.addEllipse(in: CGRect(x: -20, y: size.height - 55, width: 130, height: 60))
                    ctx.fill(leftHay, with: .color(hayColor.opacity(0.40)))
                    var leftHay2 = Path()
                    leftHay2.addEllipse(in: CGRect(x: 10, y: size.height - 44, width: 90, height: 48))
                    ctx.fill(leftHay2, with: .color(hayColor.opacity(0.28)))

                    // Right pile
                    var rightHay = Path()
                    rightHay.addEllipse(in: CGRect(x: size.width - 110, y: size.height - 55, width: 130, height: 60))
                    ctx.fill(rightHay, with: .color(hayColor.opacity(0.40)))
                    var rightHay2 = Path()
                    rightHay2.addEllipse(in: CGRect(x: size.width - 95, y: size.height - 44, width: 90, height: 48))
                    ctx.fill(rightHay2, with: .color(hayColor.opacity(0.28)))
                }

                // === Warm lantern glow at center ===
                RadialGradient(
                    colors: [
                        Color(red: 1.0, green: 0.82, blue: 0.45).opacity(0.22),
                        Color(red: 1.0, green: 0.70, blue: 0.30).opacity(0.08),
                        .clear
                    ],
                    center: .init(x: 0.5, y: 0.28),
                    startRadius: 10,
                    endRadius: max(160, geo.size.width * 0.55)
                )
                .blendMode(.plusLighter)

                // === Readability vignette ===
                LinearGradient(
                    colors: [.black.opacity(0.06), .clear, .black.opacity(0.18)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .allowsHitTesting(false)
            }
            .ignoresSafeArea()
        }
    }
}
