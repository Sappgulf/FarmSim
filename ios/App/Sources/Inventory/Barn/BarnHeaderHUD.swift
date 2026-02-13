import SwiftUI

struct BarnHeaderHUD: View {
    let coins: Int
    let stockCount: Int
    let onVisitShop: () -> Void
    let onOpenMarketTab: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Your Barn")
                        .font(Typography.title)
                        .foregroundStyle(DS.Color.textPrimary)
                    Text("Stockroom shelves and cozy counter")
                        .font(Typography.caption)
                        .foregroundStyle(DS.Color.textSecondary)
                }
                Spacer()
                HStack(spacing: DS.Space.xs) {
                    Image(systemName: "dollarsign.circle.fill")
                        .foregroundStyle(DS.Color.money)
                    Text("\(coins)")
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(DS.Color.textPrimary)
                }
                .padding(.horizontal, DS.Space.sm)
                .padding(.vertical, DS.Space.xs)
                .background(DS.Color.surface.opacity(0.75), in: Capsule())
            }

            HStack(spacing: DS.Space.sm) {
                IconLabel(icon: "shippingbox.fill", text: "\(stockCount) crates", tint: DS.Color.textSecondary)
                    .font(Typography.caption)

                Spacer()

                SecondaryButton(title: "Town Market", icon: "storefront.fill") {
                    onOpenMarketTab()
                }

                PrimaryButton(title: "Visit Shop", icon: "cart.fill", tint: DS.Color.accent) {
                    onVisitShop()
                }
            }
        }
        .padding(DS.Space.md)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                .fill(DS.Color.surfaceElevated)
        )
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                .stroke(DS.Color.cardStroke, lineWidth: 0.6)
        )
    }
}
