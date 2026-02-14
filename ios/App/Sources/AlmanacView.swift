import SwiftUI
import GameCore

struct AlmanacView: View {
    @Bindable var store: GameStore
    @State private var query = ""
    @State private var selectedFestival: FestivalDef?
    @State private var cropsAppeared = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Consistent warm parchment gradient — matches rest of game palette
                LinearGradient(
                    colors: [
                        Color(red: 0.96, green: 0.91, blue: 0.80),
                        Color(red: 0.86, green: 0.76, blue: 0.60)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: DS.Space.lg) {
                        // Header
                        SectionHeader(
                            "Village Almanac",
                            subtitle: "Historical records, seasonal patterns, and farmer knowledge"
                        )
                        .padding(.horizontal, DS.Space.md)

                        // Crops Section
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            almanacSectionLabel("Crops", symbol: "leaf.fill", tint: DS.Color.accent)

                            LazyVStack(spacing: DS.Space.sm) {
                                let crops = sortedCrops
                                ForEach(Array(crops.enumerated()), id: \.element.id) { index, crop in
                                    cropRow(crop)
                                        .opacity(cropsAppeared ? 1 : 0)
                                        .offset(y: cropsAppeared ? 0 : 16)
                                        .animation(
                                            DS.Animation.springBounce.delay(Double(index) * 0.055),
                                            value: cropsAppeared
                                        )
                                }
                            }
                        }
                        .padding(.horizontal, DS.Space.md)

                        // Festivals Section
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            almanacSectionLabel("Lore & Festivals", symbol: "sparkles",
                                                tint: Color(red: 0.72, green: 0.42, blue: 0.18))

                            if filteredFestivals.isEmpty {
                                emptySearch
                            } else {
                                let festivals = filteredFestivals
                                ForEach(festivals) { festival in
                                    festivalRow(festival)
                                }
                            }
                        }
                        .padding(.horizontal, DS.Space.md)
                    }
                    .padding(.vertical, DS.Space.md)
                    .padding(.bottom, DS.Space.xxl)
                }
            }
            .navigationTitle("Almanac")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, prompt: "Search records…")
            .onAppear {
                withAnimation(DS.Animation.springBounce.delay(0.12)) {
                    cropsAppeared = true
                }
            }
            .onChange(of: query) { _, _ in
                // Re-trigger stagger when search changes
                cropsAppeared = false
                withAnimation(DS.Animation.springBounce.delay(0.05)) {
                    cropsAppeared = true
                }
            }
        }
    }

    // MARK: - Section Label

    private func almanacSectionLabel(_ title: String, symbol: String, tint: Color) -> some View {
        HStack(spacing: DS.Space.xs) {
            Image(systemName: symbol)
                .font(.caption.weight(.semibold))
                .foregroundStyle(tint)
            Text(title.uppercased())
                .font(Typography.small.weight(.bold))
                .foregroundStyle(Color(red: 0.40, green: 0.28, blue: 0.14))
            Spacer()
        }
    }

    // MARK: - Crop Row

    @ViewBuilder
    private func cropRow(_ crop: CropDef) -> some View {
        let display = store.cropDisplay[crop.id]
        let isUnlocked = store.playerLevel >= (display?.level ?? 0)
        let effectiveDays = Double(crop.daysToGrow) / store.growthMultiplier

        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top) {
                    Text(display?.emoji ?? store.emoji(for: crop.id))
                        .font(.title)
                        .grayscale(isUnlocked ? 0 : 1)
                        .opacity(isUnlocked ? 1 : 0.45)

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: DS.Space.xs) {
                            Text(crop.name)
                                .font(Typography.bodyStrong)
                                .foregroundStyle(.white)

                            if !isUnlocked {
                                Image(systemName: "lock.fill")
                                    .font(.caption2)
                                    .foregroundStyle(DS.Color.accent.opacity(0.8))
                            }
                        }

                        Text(display?.description ?? "A hearty crop for your farm.")
                            .font(Typography.caption)
                            .foregroundStyle(.white.opacity(0.78))
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer()

                    // Profit pill
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Profit/Day")
                            .font(Typography.small.weight(.bold))
                            .foregroundStyle(DS.Color.money.opacity(0.85))
                        Text("+\(Int(profitPerDay(for: crop)))")
                            .font(Typography.metric)
                            .foregroundStyle(DS.Color.money)
                    }
                }

                // Stats row
                HStack(spacing: DS.Space.md) {
                    if let season = display?.season, !season.isEmpty {
                        almanacBadge(season.capitalized, symbol: "cloud.sun.fill")
                    }

                    let daysStr = String(format: "%.1fd", effectiveDays)
                    almanacBadge(daysStr, symbol: "timer",
                                 tint: effectiveDays < Double(crop.daysToGrow) ? DS.Color.accent : nil)

                    Spacer()

                    HStack(spacing: DS.Space.sm) {
                        Label("\(crop.seedCost)", systemImage: "cart")
                            .font(Typography.small.weight(.bold))
                        Label("\(crop.sellPrice)", systemImage: "dollarsign.circle")
                            .font(Typography.small.weight(.bold))
                    }
                    .foregroundStyle(.white.opacity(0.88))
                }
                .padding(.top, 2)

                if !isUnlocked {
                    Text("Unlocks at Level \(display?.level ?? 1)")
                        .font(Typography.small.weight(.bold))
                        .foregroundStyle(DS.Color.accent.opacity(0.8))
                }
            }
        }
    }

    private func almanacBadge(_ label: String, symbol: String, tint: Color? = nil) -> some View {
        HStack(spacing: 4) {
            Image(systemName: symbol)
            Text(label)
        }
        .font(Typography.small.weight(.bold))
        .foregroundStyle((tint ?? .white).opacity(0.88))
    }

    // MARK: - Festival Row

    @ViewBuilder
    private func festivalRow(_ festival: FestivalDef) -> some View {
        WoodenPanel {
            HStack(spacing: DS.Space.md) {
                Text(festival.icon)
                    .font(.largeTitle)

                VStack(alignment: .leading, spacing: 2) {
                    Text(festival.name)
                        .font(Typography.bodyStrong)
                        .foregroundStyle(.white)
                    Text(festival.details)
                        .font(Typography.caption)
                        .foregroundStyle(.white.opacity(0.78))
                        .lineLimit(2)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(festival.season.capitalized)
                        .font(Typography.caption.weight(.bold))
                        .foregroundStyle(DS.Color.accent)
                    Text(festival.cadence)
                        .font(Typography.small)
                        .foregroundStyle(.white.opacity(0.65))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background(.white.opacity(0.10), in: RoundedRectangle(cornerRadius: DS.Radius.sm))
            }
        }
    }

    // MARK: - Empty Search

    private var emptySearch: some View {
        WoodenPanel {
            VStack(spacing: DS.Space.sm) {
                Image(systemName: "magnifyingglass")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.50))
                Text("No records found for \"\(query)\"")
                    .font(Typography.caption)
                    .foregroundStyle(.white.opacity(0.65))
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, DS.Space.sm)
        }
    }

    // MARK: - Data Helpers

    private var filteredCrops: [CropDef] {
        query.isEmpty ? store.cropDefs
            : store.cropDefs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    private var sortedCrops: [CropDef] {
        filteredCrops.sorted { profitPerDay(for: $0) > profitPerDay(for: $1) }
    }

    private var filteredFestivals: [FestivalDef] {
        query.isEmpty ? store.festivalDefs
            : store.festivalDefs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    private func profitPerDay(for crop: CropDef) -> Double {
        (Double(crop.sellPrice) - Double(crop.seedCost)) / Double(max(1, crop.daysToGrow))
    }
}
