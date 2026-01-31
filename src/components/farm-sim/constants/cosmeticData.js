/**
 * Cosmetic Data - Items for the rotating cosmetic shop
 */

export const COSMETIC_RARITY = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
};

export const COSMETIC_TYPE = {
    FENCE: 'fence',
    PATH: 'path',
    DECORATION: 'decoration',
    PLOT_SKIN: 'plot_skin',
    BORDER: 'border',
};

export const COSMETIC_ITEMS = [
    // ===== FENCES =====
    {
        id: 'fence_wooden',
        name: 'Wooden Fence',
        type: COSMETIC_TYPE.FENCE,
        emoji: '🪵',
        price: 50,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Classic wooden fence border',
    },
    {
        id: 'fence_stone',
        name: 'Stone Wall',
        type: COSMETIC_TYPE.FENCE,
        emoji: '🪨',
        price: 100,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Sturdy stone wall border',
    },
    {
        id: 'fence_golden',
        name: 'Golden Fence',
        type: COSMETIC_TYPE.FENCE,
        emoji: '✨',
        price: 500,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Luxurious golden fence',
    },

    // ===== PATHS =====
    {
        id: 'path_dirt',
        name: 'Dirt Path',
        type: COSMETIC_TYPE.PATH,
        emoji: '🟫',
        price: 30,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Simple dirt walkway',
    },
    {
        id: 'path_cobblestone',
        name: 'Cobblestone Path',
        type: COSMETIC_TYPE.PATH,
        emoji: '🪨',
        price: 80,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Classic cobblestone path',
    },
    {
        id: 'path_marble',
        name: 'Marble Path',
        type: COSMETIC_TYPE.PATH,
        emoji: '⬜',
        price: 300,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Elegant marble walkway',
    },

    // ===== DECORATIONS =====
    {
        id: 'deco_flower_red',
        name: 'Red Flowers',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🌹',
        price: 40,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Beautiful red flower arrangement',
    },
    {
        id: 'deco_flower_yellow',
        name: 'Yellow Flowers',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🌻',
        price: 40,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Cheerful sunflower patch',
    },
    {
        id: 'deco_mushroom',
        name: 'Mushroom Circle',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🍄',
        price: 60,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Fairy ring of mushrooms',
    },
    {
        id: 'deco_gnome',
        name: 'Garden Gnome',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🧙',
        price: 120,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Friendly garden guardian',
    },
    {
        id: 'deco_fountain',
        name: 'Stone Fountain',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '⛲',
        price: 250,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Elegant water feature',
    },
    {
        id: 'deco_statue',
        name: 'Farmer Statue',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🗿',
        price: 400,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Commemorative farmer statue',
    },

    // ===== PLOT SKINS =====
    {
        id: 'plot_rich_soil',
        name: 'Rich Soil',
        type: COSMETIC_TYPE.PLOT_SKIN,
        emoji: '🟤',
        price: 75,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Dark fertile-looking soil',
    },
    {
        id: 'plot_garden_bed',
        name: 'Raised Garden Bed',
        type: COSMETIC_TYPE.PLOT_SKIN,
        emoji: '🌿',
        price: 150,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Fancy raised planting bed',
    },
    {
        id: 'plot_greenhouse',
        name: 'Mini Greenhouse',
        type: COSMETIC_TYPE.PLOT_SKIN,
        emoji: '🏠',
        price: 350,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Cozy glass greenhouse look',
    },

    // ===== BORDERS =====
    {
        id: 'border_vines',
        name: 'Vine Border',
        type: COSMETIC_TYPE.BORDER,
        emoji: '🌿',
        price: 60,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Natural vine frame',
    },
    {
        id: 'border_flowers',
        name: 'Flower Border',
        type: COSMETIC_TYPE.BORDER,
        emoji: '🌸',
        price: 100,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Colorful flower frame',
    },
    {
        id: 'border_rainbow',
        name: 'Rainbow Border',
        type: COSMETIC_TYPE.BORDER,
        emoji: '🌈',
        price: 450,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Magical rainbow frame',
    },

    // Additional common items
    {
        id: 'deco_scarecrow',
        name: 'Scarecrow',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🎃',
        price: 45,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Friendly farm scarecrow',
    },
    {
        id: 'deco_birdhouse',
        name: 'Birdhouse',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🏠',
        price: 55,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Cozy bird home',
    },
    {
        id: 'path_grass',
        name: 'Grass Path',
        type: COSMETIC_TYPE.PATH,
        emoji: '🌱',
        price: 25,
        rarity: COSMETIC_RARITY.COMMON,
        description: 'Soft grass stepping stones',
    },

    // Additional uncommon items
    {
        id: 'deco_beehive',
        name: 'Beehive',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🐝',
        price: 140,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Busy bee home',
    },
    {
        id: 'deco_windmill',
        name: 'Mini Windmill',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🎡',
        price: 180,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Decorative spinning windmill',
    },
    {
        id: 'fence_picket',
        name: 'White Picket Fence',
        type: COSMETIC_TYPE.FENCE,
        emoji: '🏠',
        price: 90,
        rarity: COSMETIC_RARITY.UNCOMMON,
        description: 'Classic white fence',
    },

    // Additional rare items
    {
        id: 'deco_wishing_well',
        name: 'Wishing Well',
        type: COSMETIC_TYPE.DECORATION,
        emoji: '🪙',
        price: 380,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Magical wishing well',
    },
    {
        id: 'border_crystal',
        name: 'Crystal Border',
        type: COSMETIC_TYPE.BORDER,
        emoji: '💎',
        price: 520,
        rarity: COSMETIC_RARITY.RARE,
        description: 'Sparkling crystal frame',
    },
];

/**
 * Get items by rarity
 * @param {string} rarity - COSMETIC_RARITY value
 * @returns {Array} Filtered items
 */
export function getItemsByRarity(rarity) {
    return COSMETIC_ITEMS.filter(item => item.rarity === rarity);
}

/**
 * Get item by ID
 * @param {string} id - Item ID
 * @returns {Object|undefined} Item or undefined
 */
export function getItemById(id) {
    return COSMETIC_ITEMS.find(item => item.id === id);
}

export default {
    COSMETIC_ITEMS,
    COSMETIC_RARITY,
    COSMETIC_TYPE,
    getItemsByRarity,
    getItemById,
};
