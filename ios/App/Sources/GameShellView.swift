import SwiftUI

struct GameShellView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    var body: some View {
        GameShell(store: store, appState: appState)
    }
}
