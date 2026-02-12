import SwiftUI

private enum InventoryCategory: String, CaseIterable, Identifiable {
    case all = "All"
    case seeds = "Seeds"
    case harvest = "Harvest"

    var id: String { rawValue }
}

struct InventoryView: View {
    @Bindable var store: GameStore

    @State private var query = ""
    @State private var category: InventoryCategory = .all

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.md) {
                    SectionHeader("Your Barn", subtitle: "Everything you've gathered and saved")

                    Picker("Category", selection: $category) {
                        ForEach(InventoryCategory.allCases) { value in
                            Text(value.rawValue).tag(value)
                        }
                    }
                    .pickerStyle(.segmented)

                    CardContainer {
                        VStack(spacing: DS.Space.sm) {
                            if filteredSeeds.isEmpty {
                                emptyState("No seeds here yet")
                            } else {
                                ForEach(filteredSeeds, id: \.id) { item in
                                    row(emoji: item.emoji, name: item.name, count: item.count, label: "Seeds")
                                }
                            }
                        }
                    }
                    .opacity(category == .harvest ? 0.45 : 1.0)

                    CardContainer {
                        VStack(spacing: DS.Space.sm) {
                            if filteredHarvest.isEmpty {
                                emptyState("Nothing harvested yet")
                            } else {
                                ForEach(filteredHarvest, id: \.id) { item in
                                    row(emoji: item.emoji, name: item.name, count: item.count, label: "Harvest")
                                }
                            }
                        }
                    }
                    .opacity(category == .seeds ? 0.45 : 1.0)
                }
                .padding(DS.Space.md)
                .padding(.bottom, DS.Space.lg)
            }
            .navigationTitle("Barn")
            .searchable(text: $query, prompt: "Find something in the barn")
            .farmBackground(palette: store.settings.palette)
        }
    }

    private var filteredSeeds: [InventoryItem] {
        guard category != .harvest else { return [] }
        return store.cropDefs.compactMap { crop in
            let count = store.seedCount(for: crop.id)
            guard count > 0 else { return nil }
            return InventoryItem(id: crop.id, name: crop.name, emoji: store.emoji(for: crop.id), count: count)
        }
        .filter { query.isEmpty || $0.name.localizedCaseInsensitiveContains(query) }
    }

    private var filteredHarvest: [InventoryItem] {
        guard category != .seeds else { return [] }
        return store.cropDefs.compactMap { crop in
            let count = store.cropCount(for: crop.id)
            guard count > 0 else { return nil }
            return InventoryItem(id: crop.id, name: crop.name, emoji: store.emoji(for: crop.id), count: count)
        }
        .filter { query.isEmpty || $0.name.localizedCaseInsensitiveContains(query) }
    }

    private func row(emoji: String, name: String, count: Int, label: String) -> some View {
        HStack(spacing: DS.Space.sm) {
            Text(emoji)
                .font(.title3)

            VStack(alignment: .leading, spacing: DS.Space.xxs) {
                Text(name)
                    .font(.body.weight(.semibold))
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text("\(count)")
                .font(.headline.monospacedDigit())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func emptyState(_ message: String) -> some View {
        Text(message)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct InventoryItem {
    let id: String
    let name: String
    let emoji: String
    let count: Int
}
