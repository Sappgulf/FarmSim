import SwiftUI

struct ItemCardView: View {
    let item: BarnInventoryItemModel
    let isFavorite: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            HStack(alignment: .top) {
                Label {
                    Text(item.title)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                } icon: {
                    Text(item.emoji)
                        .font(.title3)
                        .accessibilityHidden(true)
                }
                .labelStyle(.titleAndIcon)
                .foregroundStyle(DS.Color.textPrimary)

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
                .foregroundStyle(DS.Color.textSecondary)
                .lineLimit(1)

            Spacer(minLength: 0)

            HStack(spacing: DS.Space.xs) {
                Label("\(item.count)", systemImage: "shippingbox.fill")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(DS.Color.textSecondary)

                Spacer(minLength: 0)

                if let unitSellPrice = item.unitSellPrice, item.canSell {
                    Label("\(unitSellPrice)", systemImage: "dollarsign.circle.fill")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(DS.Color.money)
                }
            }
        }
        .padding(DS.Space.sm)
        .frame(width: 190, height: 118, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .fill(DS.Color.surfaceElevated)
        )
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .stroke(DS.Color.cardStroke, lineWidth: 0.6)
        )
        .shadow(color: DS.shadow.opacity(0.18), radius: 8, x: 0, y: 4)
    }
}
