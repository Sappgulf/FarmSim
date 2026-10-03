import SwiftUI
import GameCore

// MARK: - PetsSection

/// Polished pets section: adopt farm companions, level them up, see active bonuses.
struct PetsSection: View {
    @Bindable var store: GameStore

    var body: some View {
        VStack(spacing: DS.Space.md) {
            petsHeaderCard
            activeBonusesCard
            petRosterCards
        }
    }

    // MARK: - Header

    private var petsHeaderCard: some View {
        MarketPanel {
            HStack(spacing: DS.Space.sm) {
                ZStack {
                    Circle()
                        .fill(Color(red: 0.95, green: 0.72, blue: 0.22).opacity(0.2))
                        .frame(width: 52, height: 52)
                    Text("🐾")
                        .font(.system(size: 28))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Farm Companions")
                        .font(Typography.label)
                    Text("Adopt pets for passive farm bonuses.")
                        .font(Typography.caption)
                        .foregroundStyle(MarketPalette.muted)
                }
                Spacer()
                let adoptedCount = store.petPlans.filter { store.petLevel(for: $0.id) > 0 }.count
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(adoptedCount)")
                        .font(Typography.title)
                        .foregroundStyle(MarketPalette.leaf)
                    Text("adopted")
                        .font(Typography.caption)
                        .foregroundStyle(MarketPalette.muted)
                }
            }
        }
    }

    // MARK: - Active Bonuses

    @ViewBuilder
    private var activeBonusesCard: some View {
        let activePets = store.petPlans.filter { store.petLevel(for: $0.id) > 0 }
        if !activePets.isEmpty {
            MarketPanel {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    Text("Active Bonuses")
                        .font(Typography.label)

                    LazyVGrid(
                        columns: [GridItem(.flexible()), GridItem(.flexible())],
                        spacing: DS.Space.xs
                    ) {
                        ForEach(activePets) { pet in
                            let level = store.petLevel(for: pet.id)
                            let bonus = pet.bonusPerLevel * Double(level)
                            bonusChip(
                                id: pet.id,
                                icon: pet.icon,
                                label: pet.bonusLabel,
                                value: "+\(Int(bonus * 100))%"
                            )
                        }
                    }
                    Text("Bonuses grow with each training level.")
                        .font(.system(size: 10))
                        .foregroundStyle(MarketPalette.muted)
                }
            }
        }
    }

    @ViewBuilder
    private func bonusChip(id: String, icon: String, label: String, value: String) -> some View {
        HStack(spacing: DS.Space.xs) {
            GameAssetIcon(id: id, fallback: icon, size: 20)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(MarketPalette.muted)
                .lineLimit(1)
            Spacer(minLength: 0)
            Text(value)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(MarketPalette.leaf)
        }
        .padding(.horizontal, DS.Space.xs)
        .padding(.vertical, 5)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.sm)
                .fill(Color(red: 0.97, green: 0.93, blue: 0.84).opacity(0.8))
        )
    }

    // MARK: - Pet Roster

    private var petRosterCards: some View {
        ForEach(store.petPlans) { pet in
            petCard(pet: pet)
        }
    }

    @ViewBuilder
    private func petCard(pet: PetTypePlan) -> some View {
        let level = store.petLevel(for: pet.id)
        let adopted = level > 0
        let maxLevel = pet.maxLevel
        let isMaxLevel = level >= maxLevel
        let trainCost = max(25, pet.cost / 2) * level

        MarketPanel {
            VStack(spacing: DS.Space.sm) {
                // Top row: icon + info + badge
                HStack(alignment: .top, spacing: DS.Space.sm) {
                    // Pet avatar
                    ZStack {
                        RoundedRectangle(cornerRadius: DS.Radius.sm)
                            .fill(adopted
                                ? DS.Color.accent.opacity(0.15)
                                : Color(red: 0.2, green: 0.1, blue: 0.05).opacity(0.06)
                            )
                            .frame(width: 56, height: 56)
                        GameAssetIcon(id: pet.id, fallback: pet.icon, size: 48)
                    }

                    VStack(alignment: .leading, spacing: 3) {
                        Text(pet.name)
                            .font(Typography.label)
                        Text(pet.description)
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.muted)
                            .lineLimit(2)
                        if adopted {
                            Text("Lv \(level) / \(maxLevel) · \(pet.bonusLabel)")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(MarketPalette.leaf)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    if adopted {
                        levelBadge(level: level, max: maxLevel)
                    }
                }

                // Level progress dots (only if adopted)
                if adopted {
                    HStack(spacing: 6) {
                        ForEach(1...maxLevel, id: \.self) { lvl in
                            Circle()
                                .fill(lvl <= level ? DS.Color.accent : Color(red: 0.2, green: 0.1, blue: 0.05).opacity(0.15))
                                .frame(width: 8, height: 8)
                        }
                        Spacer()
                        Text(isMaxLevel ? "MAX" : "Next: \(trainCost)🪙")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(isMaxLevel ? MarketPalette.leaf : MarketPalette.muted)
                    }
                }

                Divider().opacity(0.4)

                // Action button
                if !adopted {
                    let canAfford = store.save.player.coins >= pet.cost
                    let levelOK = store.playerLevel >= pet.requiredLevel

                    Button {
                        store.adoptPet(pet.id)
                        SoundManager.shared.play(.success, haptic: .medium)
                    } label: {
                        HStack(spacing: DS.Space.xs) {
                            Text("Adopt \(pet.icon)")
                            Text("·")
                            Text("\(pet.cost) 🪙")
                        }
                        .font(Typography.label)
                    }
                    .buttonStyle(MarketActionStyle())
                    .disabled(!canAfford || !levelOK)
                    .accessibilityLabel("Adopt \(pet.name)")
                    .accessibilityHint(levelOK ? "Spend coins to adopt this companion" : "Reach the required level first")

                    if !levelOK {
                        Text("Requires level \(pet.requiredLevel)")
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.muted)
                            .frame(maxWidth: .infinity, alignment: .center)
                    } else if !canAfford {
                        Text("Not enough coins")
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.warning)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                } else if isMaxLevel {
                    HStack {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                        Text("Companion fully trained!")
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.leaf)
                    }
                    .frame(maxWidth: .infinity, alignment: .center)
                } else {
                    let canAfford = store.save.player.coins >= trainCost

                    Button {
                        store.trainPet(pet.id)
                        SoundManager.shared.play(.levelUp, haptic: .medium)
                    } label: {
                        HStack(spacing: DS.Space.xs) {
                            Text("Train \(pet.icon)")
                            Text("→ Lv \(level + 1)")
                            Text("·")
                            Text("\(trainCost) 🪙")
                        }
                        .font(Typography.label)
                    }
                    .buttonStyle(MarketActionStyle())
                    .disabled(!canAfford)
                    .accessibilityLabel("Train \(pet.name)")
                    .accessibilityHint(isMaxLevel ? "This companion is already fully trained" : "Spend coins to increase this pet's bonus")

                    if !canAfford {
                        Text("Need \(trainCost - store.save.player.coins) more coins")
                            .font(Typography.caption)
                            .foregroundStyle(MarketPalette.warning)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func levelBadge(level: Int, max: Int) -> some View {
        VStack(spacing: 1) {
            Text("LV")
                .font(.system(size: 8, weight: .bold))
                .foregroundStyle(level >= max ? MarketPalette.ink : .white)
            Text("\(level)")
                .font(.system(size: 16, weight: .black))
                .foregroundStyle(level >= max ? MarketPalette.ink : .white)
        }
        .frame(width: 36, height: 36)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.sm)
                .fill(level >= max
                    ? MarketPalette.honey : MarketPalette.leaf
                )
        )
    }
}
