import SwiftUI

struct ShelfSectionView: View {
    let shelf: BarnShelfModel
    let favorites: Set<String>
    let onSelect: (BarnInventoryItemModel) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            HStack(spacing: DS.Space.xs) {
                Image(systemName: shelf.symbol)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(DS.Color.accent)
                VStack(alignment: .leading, spacing: 2) {
                    Text(shelf.title)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(DS.Color.textPrimary)
                    Text(shelf.subtitle)
                        .font(.caption)
                        .foregroundStyle(DS.Color.textSecondary)
                }
                Spacer()
                Text("\(shelf.items.count)")
                    .font(.caption.monospacedDigit().weight(.semibold))
                    .foregroundStyle(DS.Color.textSecondary)
                    .padding(.horizontal, DS.Space.xs)
                    .padding(.vertical, 3)
                    .background(DS.Color.surface.opacity(0.8), in: Capsule())
            }

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: DS.Space.sm) {
                    ForEach(shelf.items) { item in
                        Button {
                            onSelect(item)
                        } label: {
                            ItemCardView(item: item, isFavorite: favorites.contains(item.itemID))
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("\(item.title), quantity \(item.count)")
                    }
                }
                .padding(.horizontal, 1)
                .padding(.bottom, 2)
            }
        }
        .padding(DS.Space.md)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                .fill(DS.Color.shelfSurface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: DS.Radius.xl, style: .continuous)
                .stroke(DS.Color.cardStroke, lineWidth: 0.6)
        )
    }
}
