export const PET_TYPES = {
    dog: {
        name: "Farm Dog",
        emoji: "🐕",
        cost: 200,
        maxLevel: 5,
        traits: ["pest_detection", "security", "loyalty"],
        bonuses: {
            pest_prevention: 0.3,
            theft_protection: 0.5,
            happiness_boost: 0.1
        },
        needs: {
            food: { type: "pet_food", consumption: 1, interval: 3600 },
            play: { type: "attention", consumption: 1, interval: 7200 },
            health: { type: "vet_care", consumption: 1, interval: 86400 }
        },
        levelBonuses: {
            1: { pest_prevention: 0.1 },
            2: { pest_prevention: 0.15, security: 0.1 },
            3: { pest_prevention: 0.2, security: 0.15, loyalty: 0.1 },
            4: { pest_prevention: 0.25, security: 0.2, loyalty: 0.15 },
            5: { pest_prevention: 0.3, security: 0.25, loyalty: 0.2 }
        }
    },
    cat: {
        name: "Farm Cat",
        emoji: "🐱",
        cost: 150,
        maxLevel: 5,
        traits: ["pest_hunter", "independence", "curiosity"],
        bonuses: {
            pest_elimination: 0.4,
            crop_quality: 0.15,
            luck_boost: 0.05
        },
        needs: {
            food: { type: "pet_food", consumption: 1, interval: 4800 },
            play: { type: "attention", consumption: 1, interval: 10800 },
            health: { type: "vet_care", consumption: 1, interval: 86400 }
        },
        levelBonuses: {
            1: { pest_elimination: 0.2 },
            2: { pest_elimination: 0.25, crop_quality: 0.05 },
            3: { pest_elimination: 0.3, crop_quality: 0.1, luck_boost: 0.02 },
            4: { pest_elimination: 0.35, crop_quality: 0.12, luck_boost: 0.03 },
            5: { pest_elimination: 0.4, crop_quality: 0.15, luck_boost: 0.05 }
        }
    },
    chicken: {
        name: "Farm Chicken",
        emoji: "🐔",
        cost: 100,
        maxLevel: 3,
        traits: ["egg_production", "pest_control", "fertilizer_production"],
        bonuses: {
            daily_eggs: 2,
            pest_reduction: 0.2,
            fertilizer_production: 1
        },
        needs: {
            food: { type: "grain", consumption: 2, interval: 3600 },
            shelter: { type: "coop", consumption: 0, interval: 0 }
        },
        levelBonuses: {
            1: { daily_eggs: 1 },
            2: { daily_eggs: 2, fertilizer_production: 0.5 },
            3: { daily_eggs: 3, fertilizer_production: 1, pest_reduction: 0.2 }
        }
    }
};

export const SUPPLY_LABELS = {
    pet_food: { singular: 'pet food', plural: 'pet food' },
    attention: { singular: 'toy', plural: 'toys' },
    vet_care: { singular: 'vet care visit', plural: 'vet care visits' }
};
