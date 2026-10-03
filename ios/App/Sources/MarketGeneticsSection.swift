import SwiftUI

// MARK: - MarketGeneticsSection

struct MarketGeneticsSection: View {
    let store: GameStore

    private var researchDone: Bool {
        store.isResearchCompleted("hybrid_crops")
    }

    var body: some View {
        VStack(spacing: DS.Space.md) {
            headerPanel
            ForEach(store.geneticsRecipes) { recipe in
                recipeCard(recipe)
            }
        }
    }

    // MARK: - Header

    private var headerPanel: some View {
        MarketPanel {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text("GENETICS LAB")
                    .font(Typography.small.weight(.bold))
                    .foregroundStyle(MarketPalette.muted)

                if researchDone {
                    let discovered = store.geneticsRecipes.filter {
                        store.isHybridDiscovered($0.id)
                    }.count
                    HStack {
                        Text("Combine parent seeds to breed hybrid varieties.")
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.ink)
                        Spacer()
                        Text("\(discovered)/\(store.geneticsRecipes.count)")
                            .font(Typography.caption.weight(.bold))
                            .foregroundStyle(Color.purple.opacity(0.90))
                    }
                } else {
                    Label(
                        "Complete Hybrid Crops research to unlock breeding.",
                        systemImage: "lock.fill"
                    )
                    .font(Typography.caption)
                    .foregroundStyle(MarketPalette.warning)
                }
            }
        }
    }

    // MARK: - Recipe Card

    private func recipeCard(_ recipe: GeneticsRecipe) -> some View {
        let isDiscovered = store.isHybridDiscovered(recipe.id)
        let isLevelLocked = store.playerLevel < recipe.levelRequirement
        let canBreed = store.canBreed(recipe)
        let parents = recipe.requiredParents()

        return MarketPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top, spacing: DS.Space.sm) {
                    GameAssetIcon(id: recipe.outputCropID, fallback: recipe.icon, size: 44)
                        .opacity(isDiscovered ? 0.60 : (isLevelLocked || !researchDone) ? 0.35 : 1.0)

                    VStack(alignment: .leading, spacing: 4) {
                        // Name + locks
                        HStack(spacing: DS.Space.xs) {
                            Text(recipe.name)
                                .font(Typography.bodyStrong)
                                .foregroundStyle(MarketPalette.ink)

                            if isDiscovered {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.caption)
                                    .foregroundStyle(MarketPalette.leaf)
                            }

                            if isLevelLocked {
                                Label("Lv \(recipe.levelRequirement)", systemImage: "lock.fill")
                                    .font(Typography.small)
                                    .foregroundStyle(MarketPalette.leaf)
                            }
                        }

                        Text(recipe.notes)
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.muted)

                        // Parent seeds needed
                        HStack(spacing: DS.Space.xs) {
                            ForEach(Array(parents.keys.sorted()), id: \.self) { cropID in
                                let needed = parents[cropID] ?? 1
                                let have = store.seedCount(for: cropID)
                                let hasEnough = have >= needed
                                let emoji = store.emoji(for: cropID)
                                let name = store.cropName(for: cropID)

                                HStack(spacing: 3) {
                                    GameAssetIcon(id: cropID, fallback: emoji, size: 20)
                                    Text("\(name): \(have)/\(needed)")
                                        .font(Typography.small.weight(.semibold))
                                        .foregroundStyle(
                                            isDiscovered ? MarketPalette.muted :
                                            hasEnough ? MarketPalette.leaf : MarketPalette.danger
                                        )
                                }
                                .padding(.horizontal, 6)
                                .padding(.vertical, 3)
                                .background(
                                    Capsule()
                                        .fill(hasEnough && !isDiscovered
                                              ? DS.Color.accent.opacity(0.15)
                                              : MarketPalette.ink.opacity(0.08))
                                )
                            }
                        }
                    }

                    Spacer()

                    // Action
                    if isDiscovered {
                        VStack(spacing: 2) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.title3)
                                .foregroundStyle(MarketPalette.leaf)
                            Text("Known")
                                .font(Typography.small.weight(.bold))
                                .foregroundStyle(MarketPalette.leaf)
                        }
                    } else if researchDone && !isLevelLocked {
                        Button {
                            SoundManager.shared.play(.success, haptic: .heavy)
                            _ = store.discoverHybrid(recipe.id)
                        } label: {
                            VStack(spacing: 2) {
                                Image(systemName: "flask.fill")
                                    .font(.title3)
                                Text("Breed")
                                    .font(Typography.caption.weight(.bold))
                            }
                        }
                        .buttonStyle(MarketActionStyle())
                        .frame(width: 74)
                        .disabled(!canBreed)
                        .accessibilityLabel("Breed \(recipe.name)")
                        .accessibilityHint(canBreed ? "Tap to create hybrid seed" : "Missing parent seeds")
                    }
                }
            }
        }
    }
}
