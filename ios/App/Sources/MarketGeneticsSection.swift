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
        WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text("GENETICS LAB")
                    .font(Typography.small.weight(.bold))
                    .foregroundStyle(.white.opacity(0.55))

                if researchDone {
                    let discovered = store.geneticsRecipes.filter {
                        store.isHybridDiscovered($0.id)
                    }.count
                    HStack {
                        Text("Combine parent seeds to breed hybrid varieties.")
                            .font(Typography.caption)
                            .foregroundStyle(.white)
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
                    .foregroundStyle(.orange)
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

        return WoodenPanel {
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack(alignment: .top, spacing: DS.Space.sm) {
                    Text(recipe.icon)
                        .font(.system(size: 38))
                        .opacity(isDiscovered ? 0.60 : (isLevelLocked || !researchDone) ? 0.35 : 1.0)

                    VStack(alignment: .leading, spacing: 4) {
                        // Name + locks
                        HStack(spacing: DS.Space.xs) {
                            Text(recipe.name)
                                .font(Typography.bodyStrong)
                                .foregroundStyle(isDiscovered ? .white.opacity(0.50) : .white)

                            if isDiscovered {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.caption)
                                    .foregroundStyle(DS.Color.accent)
                            }

                            if isLevelLocked {
                                Label("Lv \(recipe.levelRequirement)", systemImage: "lock.fill")
                                    .font(Typography.small)
                                    .foregroundStyle(DS.Color.accent.opacity(0.85))
                            }
                        }

                        Text(recipe.notes)
                            .font(Typography.caption)
                            .foregroundStyle(.white.opacity(0.72))

                        // Parent seeds needed
                        HStack(spacing: DS.Space.xs) {
                            ForEach(Array(parents.keys.sorted()), id: \.self) { cropID in
                                let needed = parents[cropID] ?? 1
                                let have = store.seedCount(for: cropID)
                                let hasEnough = have >= needed
                                let emoji = store.emoji(for: cropID)
                                let name = store.cropName(for: cropID)

                                HStack(spacing: 3) {
                                    Text(emoji).font(.caption)
                                    Text("\(name): \(have)/\(needed)")
                                        .font(Typography.small.weight(.semibold))
                                        .foregroundStyle(
                                            isDiscovered ? .white.opacity(0.40) :
                                            hasEnough ? DS.Color.accent : .red.opacity(0.85)
                                        )
                                }
                                .padding(.horizontal, 6)
                                .padding(.vertical, 3)
                                .background(
                                    Capsule()
                                        .fill(hasEnough && !isDiscovered
                                              ? DS.Color.accent.opacity(0.15)
                                              : .white.opacity(0.08))
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
                                .foregroundStyle(DS.Color.accent)
                            Text("Known")
                                .font(Typography.small.weight(.bold))
                                .foregroundStyle(DS.Color.accent.opacity(0.75))
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
                        .buttonStyle(WoodActionStyle(tint: canBreed ? Color.purple.opacity(0.85) : .gray))
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
