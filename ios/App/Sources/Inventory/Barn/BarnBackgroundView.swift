import SwiftUI

struct BarnBackgroundView: View {
    var body: some View {
        GeometryReader { geo in
            ZStack {
                LinearGradient(
                    colors: [DS.Color.barnWallTop, DS.Color.barnWallBottom],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Barn wooden planks.
                HStack(spacing: 0) {
                    ForEach(0..<10, id: \.self) { index in
                        Rectangle()
                            .fill(index.isMultiple(of: 2) ? DS.Color.barnPlankA : DS.Color.barnPlankB)
                            .overlay(
                                Rectangle()
                                    .stroke(Color.black.opacity(0.06), lineWidth: 0.25)
                            )
                    }
                }
                .opacity(0.45)

                VStack {
                    HStack(spacing: 0) {
                        ForEach(0..<5, id: \.self) { _ in
                            Rectangle()
                                .fill(DS.Color.barnBeam)
                                .frame(height: 12)
                            Spacer(minLength: 0)
                        }
                    }
                    Spacer()
                }
                .padding(.top, 24)
                .padding(.horizontal, 18)

                // Warm loft glow.
                RadialGradient(
                    colors: [DS.Color.barnGlow, .clear],
                    center: .top,
                    startRadius: 28,
                    endRadius: max(140, geo.size.width * 0.6)
                )
                .blendMode(.plusLighter)

                // Subtle vignette for readability.
                LinearGradient(
                    colors: [
                        .black.opacity(0.15),
                        .clear,
                        .black.opacity(0.22),
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .allowsHitTesting(false)
            }
            .ignoresSafeArea()
        }
    }
}
