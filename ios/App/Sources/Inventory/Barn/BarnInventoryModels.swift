import Foundation

enum BarnShelfCategory: String, CaseIterable, Identifiable {
    case all
    case seeds
    case harvest
    case tools
    case decor
    case specials

    var id: String { rawValue }

    var title: String {
        switch self {
        case .all: return "All"
        case .seeds: return "Seeds"
        case .harvest: return "Harvest"
        case .tools: return "Tools"
        case .decor: return "Decor"
        case .specials: return "Specials"
        }
    }

    var symbol: String {
        switch self {
        case .all: return "square.grid.2x2.fill"
        case .seeds: return "leaf.fill"
        case .harvest: return "shippingbox.fill"
        case .tools: return "hammer.fill"
        case .decor: return "paintpalette.fill"
        case .specials: return "star.fill"
        }
    }
}

struct BarnInventoryItemModel: Identifiable, Hashable {
    let id: String
    let itemID: String
    let shelf: BarnShelfCategory
    let title: String
    let subtitle: String
    let detail: String
    let symbol: String
    let emoji: String
    let count: Int
    let unitSellPrice: Int?
    let canSell: Bool
    let canUse: Bool

    var searchableText: String {
        [title, subtitle, detail, itemID].joined(separator: " ").lowercased()
    }
}

struct BarnShelfModel: Identifiable, Hashable {
    let category: BarnShelfCategory
    let title: String
    let subtitle: String
    let symbol: String
    let items: [BarnInventoryItemModel]

    var id: String { category.rawValue }
}
