import SwiftUI

struct InventoryView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    var body: some View {
        BarnInventoryView(store: store, appState: appState)
    }
}
