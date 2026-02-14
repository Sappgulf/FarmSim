import SwiftUI
import GameCore

struct AlmanacView: View {
    @Bindable var store: GameStore
    @State private var query = ""
    @State private var selectedFestival: FestivalDef?

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.94, green: 0.91, blue: 0.82).ignoresSafeArea() // Aged paper background
                
                ScrollView {
                    VStack(spacing: DS.Space.lg) {
                        // Header
                        SectionHeader("Village Almanac", subtitle: "Historical records, seasonal patterns, and farmer knowledge")
                            .padding(.horizontal, DS.Space.md)

                        // Crops Section
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeaderLabel("Crops", symbol: "leaf.fill")
                            
                            LazyVStack(spacing: DS.Space.md) {
                                let crops = sortedCrops
                                ForEach(crops) { crop in
                                    cropRow(crop)
                                }
                            }
                        }
                        .padding(.horizontal, DS.Space.md)

                        // Festivals Section
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            SectionHeaderLabel("Lore & Festivals", symbol: "sparkles")
                            
                            if filteredFestivals.isEmpty {
                                Text("No festival records found.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .padding()
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
            .searchable(text: $query, prompt: "Search records...")
        }
    }

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
                        .opacity(isUnlocked ? 1 : 0.5)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: DS.Space.xs) {
                            Text(crop.name)
                                .font(.headline.bold())
                                .foregroundStyle(.white)
                            
                            if !isUnlocked {
                                Image(systemName: "lock.fill")
                                    .font(.caption2)
                                    .foregroundStyle(DS.Color.accent)
                            }
                        }
                        
                        Text(display?.description ?? "A hearty crop for your farm.")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.8))
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Profit/Day")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(DS.Color.money)
                        Text("+\(Int(profitPerDay(for: crop)))")
                            .font(.subheadline.bold())
                            .foregroundStyle(DS.Color.money)
                    }
                }
                
                HStack(spacing: DS.Space.md) {
                    if let season = display?.season, !season.isEmpty {
                        StatBadge(label: season.capitalized, symbol: "cloud.sun.fill")
                    }
                    
                    let daysStr = String(format: "%.1fd", effectiveDays)
                    StatBadge(label: daysStr, symbol: "timer")
                        .foregroundStyle(effectiveDays < Double(crop.daysToGrow) ? DS.Color.accent : .white)
                    
                    Spacer()
                    
                    HStack(spacing: DS.Space.sm) {
                        Label("\(crop.seedCost)", systemImage: "cart")
                            .font(.caption2.bold())
                        Label("\(crop.sellPrice)", systemImage: "dollarsign.circle")
                            .font(.caption2.bold())
                    }
                    .foregroundStyle(.white.opacity(0.9))
                }
                .padding(.top, 4)
                
                if !isUnlocked {
                    Text("Unlocks at Level \(display?.level ?? 1)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(DS.Color.accent.opacity(0.8))
                        .padding(.top, 2)
                }
            }
        }
    }

    @ViewBuilder
    private func festivalRow(_ festival: FestivalDef) -> some View {
        WoodenPanel {
            HStack(spacing: DS.Space.md) {
                Text(festival.icon)
                    .font(.largeTitle)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(festival.name)
                        .font(.headline.bold())
                        .foregroundStyle(.white)
                    Text(festival.details)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.8))
                        .lineLimit(2)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text(festival.season.capitalized)
                        .font(.caption.bold())
                        .foregroundStyle(DS.Color.accent)
                    Text(festival.cadence)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.7))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private var filteredCrops: [CropDef] {
        if query.isEmpty { return store.cropDefs }
        return store.cropDefs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    private var sortedCrops: [CropDef] {
        filteredCrops.sorted(by: { profitPerDay(for: $0) > profitPerDay(for: $1) })
    }

    private var filteredFestivals: [FestivalDef] {
        if query.isEmpty { return store.festivalDefs }
        return store.festivalDefs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    private func profitPerDay(for crop: CropDef) -> Double {
        let revenue = Double(crop.sellPrice)
        let cost = Double(crop.seedCost)
        let days = Double(max(1, crop.daysToGrow))
        return (revenue - cost) / days
    }
}

private struct SectionHeaderLabel: View {
    let title: String
    let symbol: String
    
    init(_ title: String, symbol: String) {
        self.title = title
        self.symbol = symbol
    }
    
    var body: some View {
        HStack(spacing: DS.Space.xs) {
            Image(systemName: symbol)
                .foregroundStyle(DS.Color.accent)
            Text(title.uppercased())
                .font(.caption.bold())
                .foregroundStyle(.secondary)
            Spacer()
        }
    }
}

private struct StatBadge: View {
    let label: String
    let symbol: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: symbol)
            Text(label)
        }
        .font(.caption2.bold())
        .foregroundStyle(.white.opacity(0.9))
    }
}
