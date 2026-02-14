import SwiftUI

struct BarnHeaderHUD: View {
    let coins: Int
    let stockCount: Int
    let onVisitShop: () -> Void
    let onOpenMarketTab: () -> Void

    var body: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Your Barn")
                            .font(.title2.bold()) // Replaced Typography.title 
                            .foregroundStyle(.white)
                        Text("Stockroom shelves and cozy counter")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.8))
                    }
                    Spacer()
                    HStack(spacing: DS.Space.xs) {
                        Image(systemName: "dollarsign.circle.fill")
                            .foregroundStyle(DS.Color.money)
                        Text("\(coins)")
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(.white)
                    }
                    .padding(.horizontal, DS.Space.sm)
                    .padding(.vertical, DS.Space.xs)
                    .background(Color.black.opacity(0.3), in: Capsule())
                }

                HStack(spacing: DS.Space.sm) {
                    Label("\(stockCount) crates", systemImage: "shippingbox.fill")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.8))

                    Spacer()

                    Button {
                        onOpenMarketTab()
                    } label: {
                        Label("Town Market", systemImage: "storefront.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.brown)

                    Button {
                        onVisitShop()
                    } label: {
                        Label("Visit Shop", systemImage: "cart.fill")
                    }
                    .buttonStyle(WoodActionStyle(tint: DS.Color.accent))
                }
            }
        }
    }
}
