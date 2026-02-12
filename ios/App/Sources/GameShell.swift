import SwiftUI

enum GameTab: String, CaseIterable {
    case farm, shop, inventory

    var label: String {
        switch self {
        case .farm: "Farm"
        case .shop: "Shop"
        case .inventory: "Items"
        }
    }

    var icon: String {
        switch self {
        case .farm: "leaf.fill"
        case .shop: "bag.fill"
        case .inventory: "archivebox.fill"
        }
    }
}

struct GameShell: View {
    var store: GameStore
    @State private var selectedTab: GameTab = .farm
    @State private var tabTrigger = 0

    var body: some View {
        ZStack(alignment: .bottom) {
            // Content area
            Group {
                switch selectedTab {
                case .farm:
                    FarmView(store: store, onOpenShop: { selectedTab = .shop })
                case .shop:
                    ShopView(store: store)
                case .inventory:
                    InventoryView(store: store)
                }
            }
            .animation(.easeInOut(duration: 0.18), value: selectedTab)

            // Custom tab bar
            tabBar
                .padding(.horizontal, 24)
                .padding(.bottom, 2)
        }
        .ignoresSafeArea(.keyboard)
        .sensoryFeedback(.selection, trigger: tabTrigger)
    }

    private var tabBar: some View {
        HStack(spacing: 0) {
            ForEach(GameTab.allCases, id: \.self) { tab in
                Button {
                    guard selectedTab != tab else { return }
                    selectedTab = tab
                    tabTrigger += 1
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 18, weight: selectedTab == tab ? .bold : .medium))
                            .symbolEffect(.bounce, value: selectedTab == tab)
                        Text(tab.label)
                            .font(.system(size: 10, weight: .bold, design: .rounded))
                    }
                    .foregroundStyle(selectedTab == tab ? .white : .white.opacity(0.45))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        selectedTab == tab
                            ? Color.white.opacity(0.15)
                            : Color.clear,
                        in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(6)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().strokeBorder(Theme.cardStroke, lineWidth: 0.5))
        .shadow(color: .black.opacity(0.25), radius: 16, y: 6)
    }
}
