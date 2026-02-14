import SwiftUI

struct ShelfSectionView: View {
    let shelf: BarnShelfModel
    let favorites: Set<String>
    let onSelect: (BarnInventoryItemModel) -> Void

    var body: some View {
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(spacing: DS.Space.xs) {
                    Image(systemName: shelf.symbol)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(DS.Color.accent)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(shelf.title)
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(.white)
                        Text(shelf.subtitle)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.8))
                    }
                    Spacer()
                    Text("\(shelf.items.count)")
                        .font(.caption.monospacedDigit().weight(.semibold))
                        .foregroundStyle(.white.opacity(0.9))
                        .padding(.horizontal, DS.Space.xs)
                        .padding(.vertical, 3)
                        .background(Color.black.opacity(0.3), in: Capsule())
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
        }
    }
}
