import SwiftUI
import GameCore

struct AlmanacView: View {
    @Bindable var store: GameStore
    @State private var query = ""
    @State private var selectedFestival: FestivalDef?

    var body: some View {
        NavigationStack {
            List {
                Section("Crops") {
                    ForEach(filteredCrops.sorted(by: { lhs, rhs in
                        profitPerDay(for: lhs) > profitPerDay(for: rhs)
                    }), id: \.id) { crop in
                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            HStack {
                                Text(store.emoji(for: crop.id))
                                    .font(.title3)
                                Text(crop.name)
                                    .font(.headline)
                                Spacer()
                                Text(String(format: "%.1f/day", profitPerDay(for: crop)))
                                    .font(.subheadline.monospacedDigit())
                                    .foregroundStyle(DS.Color.money)
                            }

                            HStack {
                                Label("\(crop.daysToGrow) days", systemImage: "clock")
                                Spacer()
                                Label("Sell \(crop.sellPrice)", systemImage: "dollarsign.circle")
                                Spacer()
                                Label("Seed \(crop.seedCost)", systemImage: "leaf")
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)

                            Label("Seeds: Town Market • Buy", systemImage: "storefront.fill")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, DS.Space.xxs)
                    }
                }

                Section("Festivals") {
                    if filteredFestivals.isEmpty {
                        Text("No festival content loaded.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(filteredFestivals, id: \.id) { festival in
                            Button {
                                selectedFestival = festival
                            } label: {
                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    HStack {
                                        Text(festival.icon)
                                        Text(festival.name)
                                            .font(.headline)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.caption2.weight(.semibold))
                                            .foregroundStyle(.secondary)
                                    }
                                    Text("\(festival.season.capitalized) • \(festival.cadence.capitalized)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    if !festival.details.isEmpty {
                                        Text(festival.details)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                            .lineLimit(2)
                                    }
                                }
                            }
                            .buttonStyle(.plain)
                            .padding(.vertical, DS.Space.xxs)
                        }
                    }
                }

                Section("Decor") {
                    if filteredDecor.isEmpty {
                        Text("No decor content loaded.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(filteredDecor.prefix(8), id: \.id) { decor in
                            HStack(alignment: .top, spacing: DS.Space.sm) {
                                Text(decor.icon)
                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    Text(decor.name)
                                        .font(.subheadline.weight(.semibold))
                                    Text("\(decor.category.capitalized) • \(decor.cost) coins")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    if !decor.details.isEmpty {
                                        Text(decor.details)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                            .lineLimit(2)
                                    }
                                }
                            }
                        }
                    }
                }

                Section("Mini-Games") {
                    if filteredMinigames.isEmpty {
                        Text("No mini-game content loaded.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(filteredMinigames, id: \.id) { minigame in
                            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                HStack {
                                    Text(minigame.icon)
                                    Text(minigame.title)
                                        .font(.subheadline.weight(.semibold))
                                    Spacer()
                                    Text("\(minigame.rounds) rounds")
                                        .font(.caption.monospacedDigit())
                                        .foregroundStyle(.secondary)
                                }
                                if !minigame.instructions.isEmpty {
                                    Text(minigame.instructions)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(.vertical, DS.Space.xxs)
                        }
                    }
                }

                Section("Tips") {
                    if store.almanacEntries.isEmpty {
                        Text("Almanac entries unlock as you progress.")
                    } else {
                        ForEach(store.almanacEntries.prefix(6), id: \.id) { entry in
                            HStack(alignment: .top, spacing: DS.Space.sm) {
                                Text(entry.icon)
                                VStack(alignment: .leading, spacing: DS.Space.xxs) {
                                    Text(entry.title)
                                        .font(.subheadline.weight(.semibold))
                                    Text(entry.hint)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
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
