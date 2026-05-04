import SwiftUI
import GameCore

struct MoreView: View {
    @Bindable var store: GameStore
    @Bindable var appState: AppState

    var body: some View {
        NavigationStack {
            ZStack {
                FarmPanelBackground()

                ScrollView {
                    LazyVStack(spacing: DS.Space.md) {
                        FarmPanelHeader(
                            title: "More",
                            subtitle: "Records, town, settings",
                            icon: "square.grid.2x2.fill",
                            trailing: {
                                FarmResourceBadge(icon: "star.fill", value: "Lv \(store.playerLevel)", tint: DS.Color.money)
                            }
                        )

                        FarmGlassPanel {
                            VStack(spacing: DS.Space.sm) {
                                HStack(spacing: DS.Space.md) {
                                    Text("👩‍🌾")
                                        .font(.system(size: 46))
                                        .frame(width: 60, height: 60)
                                        .background(.black.opacity(0.22), in: Circle())

                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        Text(store.farmName)
                                            .font(Typography.title)
                                            .foregroundStyle(.white)
                                        Text("Day \(store.save.world.day) · \(store.hudSeasonText) · \(store.hudTimeText)")
                                            .font(Typography.caption)
                                            .foregroundStyle(.white.opacity(0.72))
                                    }
                                    Spacer()
                                }

                                ProgressView(
                                    value: Double(store.save.player.xp % ProgressionSystem.xpPerLevel),
                                    total: Double(ProgressionSystem.xpPerLevel)
                                )
                                .tint(DS.Color.xp)
                            }
                        }

                        VStack(spacing: DS.Space.sm) {
                            NavigationLink {
                                TownMarketView(store: store)
                            } label: {
                                MoreRouteRow(icon: "storefront.fill", title: "Town Market", subtitle: "Buy seeds, sell harvests, and review forecasts")
                            }

                            NavigationLink {
                                AlmanacView(store: store)
                            } label: {
                                MoreRouteRow(icon: "book.closed.fill", title: "Almanac", subtitle: "Crops, seasons, festivals, and field records")
                            }

                            NavigationLink {
                                SettingsView(store: store, appState: appState)
                            } label: {
                                MoreRouteRow(icon: "gearshape.fill", title: "Settings", subtitle: "Sound, haptics, performance, and profile")
                            }
                        }
                    }
                    .padding(DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("More")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.black.opacity(0.85), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}

private struct MoreRouteRow: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        FarmGlassPanel {
            HStack(spacing: DS.Space.md) {
                Image(systemName: icon)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(DS.Color.money)
                    .frame(width: 44, height: 44)
                    .background(.black.opacity(0.24), in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(Typography.bodyStrong)
                        .foregroundStyle(.white)
                    Text(subtitle)
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.72))
                        .lineLimit(2)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white.opacity(0.45))
            }
        }
    }
}
