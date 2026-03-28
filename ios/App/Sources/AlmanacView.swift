import SwiftUI
import GameCore

struct AlmanacView: View {
    @Bindable var store: GameStore
    @State private var query = ""
    @State private var selectedFestival: FestivalDef?
    @State private var cropsAppeared = false

    // Parchment ink palette
    private let inkPrimary   = Color(red: 0.14, green: 0.10, blue: 0.04)
    private let inkSecondary = Color(red: 0.40, green: 0.28, blue: 0.13)
    private let inkRed       = Color(red: 0.60, green: 0.12, blue: 0.08)
    private let parchment    = Color(red: 0.96, green: 0.91, blue: 0.82)
    private let ruleGold     = Color(red: 0.60, green: 0.45, blue: 0.18)

    var body: some View {
        NavigationStack {
            ZStack {
                BookPageBackground()
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 0) {
                        // Masthead
                        AlmanacMasthead(seasonText: store.hudSeasonText)
                            .padding(.horizontal, DS.Space.md)
                            .padding(.top, DS.Space.sm)

                        // Crops column
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            columnHeader("CROPS & SEEDS", ornament: "🌾")

                            let crops = sortedCrops
                            if crops.isEmpty {
                                emptySearch
                            } else {
                                LazyVStack(spacing: DS.Space.sm) {
                                    ForEach(Array(crops.enumerated()), id: \.element.id) { index, crop in
                                        cropRow(crop)
                                            .opacity(cropsAppeared ? 1 : 0)
                                            .offset(y: cropsAppeared ? 0 : 14)
                                            .animation(
                                                DS.Animation.springBounce.delay(Double(index) * 0.055),
                                                value: cropsAppeared
                                            )
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, DS.Space.md)
                        .padding(.top, DS.Space.lg)

                        // Ornamental column break
                        ornamentalRule
                            .padding(.horizontal, DS.Space.md)
                            .padding(.vertical, DS.Space.lg)

                        // Festivals column
                        VStack(alignment: .leading, spacing: DS.Space.sm) {
                            columnHeader("LORE & FESTIVALS", ornament: "✦")

                            if filteredFestivals.isEmpty {
                                emptySearch
                            } else {
                                ForEach(filteredFestivals) { festival in
                                    festivalRow(festival)
                                }
                            }
                        }
                        .padding(.horizontal, DS.Space.md)
                        .padding(.bottom, DS.Space.xxl)
                    }
                }
            }
            .scrollIndicators(.hidden)
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("Almanac")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color(red: 0.88, green: 0.80, blue: 0.66), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .searchable(text: $query, prompt: "Search records…")
            .onAppear {
                withAnimation(DS.Animation.springBounce.delay(0.12)) {
                    cropsAppeared = true
                }
            }
            .onChange(of: query) { _, _ in
                cropsAppeared = false
                withAnimation(DS.Animation.springBounce.delay(0.05)) {
                    cropsAppeared = true
                }
            }
        }
    }

    // MARK: - Column Header

    private func columnHeader(_ title: String, ornament: String) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 8) {
                Text(ornament).font(.caption)
                Text(title)
                    .font(.system(.subheadline, design: .serif).weight(.bold))
                    .tracking(1.8)
                    .foregroundStyle(inkRed)
                Text(ornament).font(.caption)
                Spacer()
            }
            Rectangle()
                .fill(inkPrimary.opacity(0.25))
                .frame(height: 1)
            Rectangle()
                .fill(ruleGold.opacity(0.30))
                .frame(height: 0.5)
                .padding(.top, 2)
        }
    }

    // MARK: - Ornamental Rule

    private var ornamentalRule: some View {
        HStack(spacing: 8) {
            Rectangle().fill(inkPrimary.opacity(0.20)).frame(height: 0.5)
            Text("❧  ✦  ❧")
                .font(.system(size: 11, design: .serif))
                .foregroundStyle(inkSecondary.opacity(0.65))
            Rectangle().fill(inkPrimary.opacity(0.20)).frame(height: 0.5)
        }
    }

    // MARK: - Crop Row

    @ViewBuilder
    private func cropRow(_ crop: CropDef) -> some View {
        let display = store.cropDisplay[crop.id]
        let isUnlocked = store.playerLevel >= (display?.level ?? 0)
        let effectiveDays = Double(crop.daysToGrow) / store.growthMultiplier

        ParchmentCard {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top, spacing: DS.Space.sm) {
                    Text(display?.emoji ?? store.emoji(for: crop.id))
                        .font(.title2)
                        .grayscale(isUnlocked ? 0 : 1)
                        .opacity(isUnlocked ? 1 : 0.35)

                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: DS.Space.xs) {
                            Text(crop.name)
                                .font(.system(.body, design: .serif).weight(.bold))
                                .foregroundStyle(inkPrimary)

                            if !isUnlocked {
                                Image(systemName: "lock.fill")
                                    .font(.caption2)
                                    .foregroundStyle(inkRed.opacity(0.75))
                            }
                        }

                        Text(display?.description ?? "A hearty crop grown in the valley fields.")
                            .font(.system(.caption, design: .serif))
                            .foregroundStyle(inkSecondary)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer(minLength: 0)

                    // Profit column — newspaper right-justified figure
                    VStack(alignment: .trailing, spacing: 1) {
                        Text("PROFIT/DAY")
                            .font(.system(size: 7, design: .serif).weight(.bold))
                            .tracking(1.0)
                            .foregroundStyle(inkSecondary.opacity(0.75))
                        Text("+\(Int(profitPerDay(for: crop)))")
                            .font(.system(.headline, design: .serif).weight(.bold))
                            .foregroundStyle(Color(red: 0.14, green: 0.38, blue: 0.14))
                    }
                }

                // Stats row — typeset like newspaper data table
                HStack(spacing: 0) {
                    if let season = display?.season, !season.isEmpty {
                        inlineStatCell(season.capitalized, label: "SEASON")
                        Divider().frame(height: 24).padding(.horizontal, 6)
                    }

                    let daysStr = String(format: "%.1f", effectiveDays)
                    inlineStatCell(daysStr + "d", label: "GROW")
                    Divider().frame(height: 24).padding(.horizontal, 6)
                    inlineStatCell("\(crop.seedCost)¢", label: "SEED")
                    Divider().frame(height: 24).padding(.horizontal, 6)
                    inlineStatCell("\(crop.sellPrice)¢", label: "SELL")

                    Spacer()
                }
                .padding(.top, 2)

                if !isUnlocked {
                    HStack(spacing: 4) {
                        Image(systemName: "lock.fill").font(.caption2)
                        Text("Unlocks at Level \(display?.level ?? 1)")
                            .font(.system(.caption2, design: .serif).italic())
                    }
                    .foregroundStyle(inkRed.opacity(0.75))
                }
            }
        }
    }

    private func inlineStatCell(_ value: String, label: String) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label)
                .font(.system(size: 7, design: .serif).weight(.bold))
                .tracking(0.8)
                .foregroundStyle(inkSecondary.opacity(0.65))
            Text(value)
                .font(.system(.footnote, design: .serif).weight(.semibold))
                .foregroundStyle(inkPrimary)
        }
    }

    // MARK: - Festival Row

    @ViewBuilder
    private func festivalRow(_ festival: FestivalDef) -> some View {
        ParchmentCard {
            HStack(spacing: DS.Space.md) {
                Text(festival.icon).font(.largeTitle)

                VStack(alignment: .leading, spacing: 3) {
                    Text(festival.name)
                        .font(.system(.body, design: .serif).weight(.bold))
                        .foregroundStyle(inkPrimary)
                    Text(festival.details)
                        .font(.system(.caption, design: .serif))
                        .foregroundStyle(inkSecondary)
                        .lineLimit(2)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(festival.season.capitalized)
                        .font(.system(.caption, design: .serif).weight(.bold))
                        .foregroundStyle(inkRed)
                    Text(festival.cadence)
                        .font(.system(.caption2, design: .serif).italic())
                        .foregroundStyle(inkSecondary.opacity(0.80))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background(
                    RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                        .fill(Color(red: 0.90, green: 0.84, blue: 0.72))
                        .overlay(
                            RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                                .strokeBorder(inkSecondary.opacity(0.22), lineWidth: 0.5)
                        )
                )
            }
        }
    }

    // MARK: - Empty Search

    private var emptySearch: some View {
        ParchmentCard {
            VStack(spacing: DS.Space.sm) {
                Text("☞")
                    .font(.system(size: 28, design: .serif))
                    .foregroundStyle(inkSecondary.opacity(0.50))
                Text("No records found for \"\(query)\"")
                    .font(.system(.caption, design: .serif).italic())
                    .foregroundStyle(inkSecondary)
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

// MARK: - ParchmentCard

private struct ParchmentCard<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        content
            .padding(DS.Space.md)
            .background(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .fill(Color(red: 0.97, green: 0.93, blue: 0.86))
                    .shadow(color: Color(red: 0.40, green: 0.28, blue: 0.10).opacity(0.14), radius: 4, x: 0, y: 2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
                    .strokeBorder(Color(red: 0.68, green: 0.52, blue: 0.28).opacity(0.28), lineWidth: 0.5)
            )
    }
}

// MARK: - BookPageBackground

private struct BookPageBackground: View {
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Aged parchment base
                LinearGradient(
                    colors: [
                        Color(red: 0.95, green: 0.90, blue: 0.80),
                        Color(red: 0.90, green: 0.83, blue: 0.70),
                        Color(red: 0.86, green: 0.78, blue: 0.64)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                // Paper grain texture (fine noise dots)
                Canvas { ctx, size in
                    // Subtle aged paper grain
                    var grainPath = Path()
                    let stride: CGFloat = 6
                    var x: CGFloat = 0
                    while x < size.width {
                        var y: CGFloat = 0
                        while y < size.height {
                            let jx = x + CGFloat(Int(x * 7 + y * 3) % 5) - 2
                            let jy = y + CGFloat(Int(x * 3 + y * 11) % 5) - 2
                            grainPath.addEllipse(in: CGRect(x: jx, y: jy, width: 1, height: 1))
                            y += stride
                        }
                        x += stride
                    }
                    ctx.fill(grainPath, with: .color(Color(red: 0.55, green: 0.42, blue: 0.22).opacity(0.07)))

                    // Left binding edge — thin dark rule
                    var binding = Path()
                    binding.addRect(CGRect(x: 0, y: 0, width: 3, height: size.height))
                    ctx.fill(binding, with: .color(Color(red: 0.40, green: 0.28, blue: 0.14).opacity(0.22)))

                    // Faint coffee ring — aged authenticity
                    var ring = Path()
                    ring.addEllipse(in: CGRect(x: size.width * 0.60, y: size.height * 0.35, width: 90, height: 88))
                    ctx.stroke(ring, with: .color(Color(red: 0.60, green: 0.44, blue: 0.22).opacity(0.06)), lineWidth: 5)

                    // Second faint ring
                    var ring2 = Path()
                    ring2.addEllipse(in: CGRect(x: size.width * 0.08, y: size.height * 0.62, width: 60, height: 58))
                    ctx.stroke(ring2, with: .color(Color(red: 0.55, green: 0.40, blue: 0.18).opacity(0.05)), lineWidth: 4)
                }

                // Bottom page fade (like flipping through pages)
                LinearGradient(
                    colors: [.clear, Color(red: 0.80, green: 0.70, blue: 0.56).opacity(0.24)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .allowsHitTesting(false)
            }
            .drawingGroup()
        }
    }
}

// MARK: - AlmanacMasthead

private struct AlmanacMasthead: View {
    let seasonText: String

    var body: some View {
        VStack(spacing: 0) {
            // Top hairline rule
            Rectangle()
                .fill(Color(red: 0.20, green: 0.14, blue: 0.05).opacity(0.55))
                .frame(height: 1.5)

            Rectangle()
                .fill(Color(red: 0.60, green: 0.45, blue: 0.18).opacity(0.35))
                .frame(height: 0.5)
                .padding(.top, 2)

            // Volume / date line
            HStack {
                Text("Vol. I  —  \(seasonText) Edition")
                    .font(.system(size: 9, design: .serif).italic())
                    .foregroundStyle(Color(red: 0.38, green: 0.26, blue: 0.10).opacity(0.75))
                Spacer()
                Text("Farmer's Reference")
                    .font(.system(size: 9, design: .serif).italic())
                    .foregroundStyle(Color(red: 0.38, green: 0.26, blue: 0.10).opacity(0.75))
            }
            .padding(.horizontal, 2)
            .padding(.vertical, 4)

            // Heavy top rule
            Rectangle()
                .fill(Color(red: 0.16, green: 0.10, blue: 0.03).opacity(0.70))
                .frame(height: 3)

            Rectangle()
                .fill(Color(red: 0.16, green: 0.10, blue: 0.03).opacity(0.35))
                .frame(height: 1)
                .padding(.top, 3)

            // Main title
            Text("THE VILLAGE ALMANAC")
                .font(.system(size: 28, design: .serif).weight(.black))
                .tracking(2.5)
                .foregroundStyle(Color(red: 0.14, green: 0.10, blue: 0.04))
                .padding(.vertical, 8)

            Rectangle()
                .fill(Color(red: 0.16, green: 0.10, blue: 0.03).opacity(0.35))
                .frame(height: 1)

            Rectangle()
                .fill(Color(red: 0.16, green: 0.10, blue: 0.03).opacity(0.70))
                .frame(height: 3)
                .padding(.top, 3)

            // Tagline
            Text("Historical Records · Seasonal Patterns · Farmer Knowledge")
                .font(.system(size: 10, design: .serif).italic())
                .foregroundStyle(Color(red: 0.38, green: 0.26, blue: 0.10).opacity(0.80))
                .padding(.top, 5)
                .padding(.bottom, 3)

            // Bottom hairline
            Rectangle()
                .fill(Color(red: 0.60, green: 0.45, blue: 0.18).opacity(0.30))
                .frame(height: 0.5)
        }
    }
}
