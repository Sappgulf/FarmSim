import SwiftUI
import GameCore

struct AlmanacView: View {
    @Bindable var store: GameStore
    @State private var query = ""
    @State private var selectedFestival: FestivalDef?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Space.lg) {
                    // Crops Section
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        SectionHeader("Crops", subtitle: "Profitability analysis based on market data")
                        
                        LazyVStack(spacing: DS.Space.sm) {
                            ForEach(filteredCrops.sorted(by: { lhs, rhs in
                                profitPerDay(for: lhs) > profitPerDay(for: rhs)
                            }), id: \.id) { crop in
                                CardContainer {
                                    VStack(alignment: .leading, spacing: DS.Space.xs) {
                                        HStack {
                                            Text(store.emoji(for: crop.id))
                                                .font(.title3)
                                            Text(crop.name)
                                                .font(.headline)
                                            Spacer()
                                            VStack(alignment: .trailing, spacing: 0) {
                                                Text(String(format: "%.1f", profitPerDay(for: crop)))
                                                    .font(.title3.monospacedDigit().weight(.bold))
                                                    .foregroundStyle(DS.Color.money)
                                                Text("coins/day")
                                                    .font(.caption2)
                                                    .foregroundStyle(.secondary)
                                            }
                                        }
                                        
                                        Divider().opacity(0.5)

                                        HStack {
                                            Label("\(crop.daysToGrow) days", systemImage: "clock")
                                            Spacer()
                                            Label("Sell \(crop.sellPrice)", systemImage: "dollarsign.circle")
                                            Spacer()
                                            Label("Seed \(crop.seedCost)", systemImage: "leaf")
                                        }
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }

                    // Festivals Section
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        SectionHeader("Festivals", subtitle: "Seasonal events and celebrations")
                        
                        if filteredFestivals.isEmpty {
                            Text("No festival content loaded.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, DS.Space.sm)
                        } else {
                            ForEach(filteredFestivals, id: \.id) { festival in
                                Button {
                                    selectedFestival = festival
                                } label: {
                                    CardContainer {
                                        HStack {
                                            Text(festival.icon)
                                                .font(.largeTitle)
                                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                                Text(festival.name)
                                                    .font(.headline)
                                                    .foregroundStyle(.primary)
                                                Text("\(festival.season.capitalized) • \(festival.cadence.capitalized)")
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                            Image(systemName: "chevron.right")
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(.secondary)
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    // Decor Section
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        SectionHeader("Decor", subtitle: "Beautify your farm")
                        
                        if filteredDecor.isEmpty {
                            Text("No decor content loaded.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, DS.Space.sm)
                        } else {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: DS.Space.sm)], spacing: DS.Space.sm) {
                                ForEach(filteredDecor.prefix(8), id: \.id) { decor in
                                    CardContainer {
                                        VStack(alignment: .center, spacing: DS.Space.xs) {
                                            Text(decor.icon)
                                                .font(.largeTitle)
                                            Text(decor.name)
                                                .font(.subheadline.weight(.semibold))
                                                .multilineTextAlignment(.center)
                                            Text("\(decor.cost) coins")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        .frame(maxWidth: .infinity)
                                    }
                                }
                            }
                        }
                    }

                    // Mini-Games Section
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        SectionHeader("Mini-Games")
                        
                        if filteredMinigames.isEmpty {
                            Text("No mini-game content loaded.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, DS.Space.sm)
                        } else {
                            ForEach(filteredMinigames, id: \.id) { minigame in
                                CardContainer {
                                    VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                        HStack {
                                            Text(minigame.icon)
                                                .font(.title3)
                                            Text(minigame.title)
                                                .font(.headline)
                                            Spacer()
                                            Text("\(minigame.rounds) rounds")
                                                .font(.caption.monospacedDigit())
                                                .foregroundStyle(.secondary)
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 4)
                                                .background(.ultraThinMaterial, in: Capsule())
                                        }
                                        if !minigame.instructions.isEmpty {
                                            Text(minigame.instructions)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Tips Section
                    VStack(alignment: .leading, spacing: DS.Space.sm) {
                        SectionHeader("Tips")
                        
                        if store.almanacEntries.isEmpty {
                            Text("Almanac entries unlock as you progress.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, DS.Space.sm)
                        } else {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: DS.Space.sm)], spacing: DS.Space.sm) {
                                ForEach(store.almanacEntries.prefix(6), id: \.id) { entry in
                                    CardContainer {
                                        HStack(alignment: .top, spacing: DS.Space.sm) {
                                            Text(entry.icon)
                                                .font(.title2)
                                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                                Text(entry.title)
                                                    .font(.subheadline.weight(.semibold))
                                                Text(entry.hint)
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(DS.Space.md)
                .padding(.bottom, DS.Space.lg)
            }
            .navigationTitle("Almanac")
            .searchable(text: $query, prompt: "Search crops, festivals, decor")
            .scrollContentBackground(.hidden)
            .farmBackground(palette: store.settings.palette)
            .sheet(item: $selectedFestival) { festival in
                festivalDetailSheet(festival)
                    .presentationDetents([.medium, .large])
            }
        }
    }

    private var normalizedQuery: String {
        query.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var filteredCrops: [CropDef] {
        guard !normalizedQuery.isEmpty else { return store.cropDefs }
        return store.cropDefs.filter {
            $0.name.localizedCaseInsensitiveContains(normalizedQuery)
                || $0.id.localizedCaseInsensitiveContains(normalizedQuery)
        }
    }

    private var filteredFestivals: [FestivalDef] {
        guard !normalizedQuery.isEmpty else { return store.festivalDefs }
        return store.festivalDefs.filter {
            $0.name.localizedCaseInsensitiveContains(normalizedQuery)
                || $0.season.localizedCaseInsensitiveContains(normalizedQuery)
        }
    }

    private var filteredDecor: [DecorDef] {
        guard !normalizedQuery.isEmpty else { return store.decorDefs }
        return store.decorDefs.filter {
            $0.name.localizedCaseInsensitiveContains(normalizedQuery)
                || $0.category.localizedCaseInsensitiveContains(normalizedQuery)
        }
    }

    private var filteredMinigames: [MinigameDef] {
        guard !normalizedQuery.isEmpty else { return store.minigameDefs }
        return store.minigameDefs.filter { $0.title.localizedCaseInsensitiveContains(normalizedQuery) }
    }

    private func profitPerDay(for crop: CropDef) -> Double {
        let profit = max(0, crop.sellPrice - crop.seedCost)
        return Double(profit) / Double(max(1, crop.daysToGrow))
    }

    private func festivalDetailSheet(_ festival: FestivalDef) -> some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.md) {
                    HStack {
                        Text(festival.icon)
                            .font(.system(size: 42))
                        VStack(alignment: .leading, spacing: DS.Space.xxs) {
                            Text(festival.name)
                                .font(.title3.weight(.bold))
                            Text("\(festival.season.capitalized) • \(festival.cadence.capitalized)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            Label("Duration: \(festival.durationSeconds) seconds", systemImage: "timer")
                                .font(.subheadline.weight(.semibold))
                            Label("Seasonal board available in Town", systemImage: "calendar")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }

                    if !festival.details.isEmpty {
                        Text(festival.details)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(DS.Space.md)
            }
            .navigationTitle("Festival")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

extension FestivalDef: Identifiable {}
