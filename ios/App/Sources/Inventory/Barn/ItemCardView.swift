import SwiftUI

struct ItemCardView: View {
    let item: BarnInventoryItemModel
    let isFavorite: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            HStack(alignment: .top) {
                Label {
                    Text(item.title)
                        .font(.subheadline.weight(.bold))
                        .lineLimit(1)
                } icon: {
                    Text(item.emoji)
                        .font(.title3)
                        .accessibilityHidden(true)
                }
                .labelStyle(.titleAndIcon)
                .foregroundStyle(Color(red: 0.25, green: 0.15, blue: 0.05)) // Dark brown text on paper

                Spacer(minLength: DS.Space.xs)

                if isFavorite {
                    Image(systemName: "heart.fill")
                        .font(.caption)
                        .foregroundStyle(DS.Color.accent)
                        .accessibilityLabel("Favorite")
                }
            }

            Text(item.subtitle)
                .font(.caption)
                .foregroundStyle(Color(red: 0.35, green: 0.25, blue: 0.15))
                .lineLimit(1)

            Spacer(minLength: 0)

            HStack(spacing: DS.Space.xs) {
                Label("\(item.count)", systemImage: "shippingbox.fill")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Color(red: 0.25, green: 0.15, blue: 0.05).opacity(0.7))

                Spacer(minLength: 0)

                if let unitSellPrice = item.unitSellPrice, item.canSell {
                    HStack(spacing: 2) {
                        Image(systemName: "dollarsign.circle.fill")
                        Text("\(unitSellPrice)")
                    }
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(DS.Color.money)
                }
            }
        }
        .padding(DS.Space.sm)
        .frame(width: 170, height: 110, alignment: .topLeading)
        .background(
            ZStack {
                // Paper label background
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.98, green: 0.96, blue: 0.90),
                                Color(red: 0.94, green: 0.91, blue: 0.82)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                
                // Subtle paper texture/edge
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .stroke(Color(red: 0.85, green: 0.80, blue: 0.70), lineWidth: 1)
            }
        )
        .rotationEffect(.degrees(item.itemID.hashValue % 2 == 0 ? 0.5 : -0.5)) // Tiny organic rotation
        .shadow(color: .black.opacity(0.12), radius: 4, x: 0, y: 2)
    }
}
