export const PROCESSING_FACILITIES = {
    flour_mill: {
        id: 'flour_mill',
        name: "Flour Mill",
        emoji: "🏭",
        description: "Process wheat into flour",
        cost: 400,
        input: "wheat",
        output: "flour",
        ratio: 2, // 2 wheat = 1 flour
        value_multiplier: 2.8,
        time: 45
    },
    juice_press: {
        id: 'juice_press',
        name: "Juice Press",
        emoji: "🧃",
        description: "Process fruits into juice",
        cost: 300,
        input: "apple",
        output: "apple_juice",
        ratio: 3,
        value_multiplier: 2.5,
        time: 35
    },
    oil_press: {
        id: 'oil_press',
        name: "Oil Press",
        emoji: "🫒",
        description: "Extract oil from seeds",
        cost: 500,
        input: "sunflower",
        output: "sunflower_oil",
        ratio: 3,
        value_multiplier: 3.2,
        time: 75
    },
    preservation_facility: {
        id: 'preservation_facility',
        name: "Preservation Facility",
        emoji: "🥫",
        description: "Preserve crops for longer storage",
        cost: 600,
        input: "any", // accepts any crop
        output: "preserved",
        ratio: 1,
        value_multiplier: 2.0,
        time: 90,
        storage_bonus: 15
    }
};
