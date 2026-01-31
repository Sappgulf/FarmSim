/**
 * Rotation Engine - Deterministic rotation for cosmetic shop items
 * Uses seeded random to ensure same items appear for same day/week
 */

import { COSMETIC_ITEMS, COSMETIC_RARITY, getItemsByRarity } from '../constants/cosmeticData';

/**
 * Seeded random number generator
 * @param {number} seed - Seed value
 * @returns {function} Random function that returns 0-1
 */
function seededRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

/**
 * Seeded shuffle using Fisher-Yates
 * @param {Array} array - Array to shuffle
 * @param {function} random - Seeded random function
 * @returns {Array} Shuffled copy of array
 */
function seededShuffle(array, random) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get daily items for the cosmetic shop
 * @param {number} dayNumber - Current day number
 * @param {Array} ownedCosmetics - Array of owned cosmetic IDs
 * @returns {Array} Array of 4 daily items
 */
export function getDailyItems(dayNumber, ownedCosmetics = []) {
    const ownedIds = new Set(ownedCosmetics);
    const random = seededRandom(dayNumber * 12345);

    // Get available items by rarity, excluding owned
    const common = getItemsByRarity(COSMETIC_RARITY.COMMON).filter(item => !ownedIds.has(item.id));
    const uncommon = getItemsByRarity(COSMETIC_RARITY.UNCOMMON).filter(item => !ownedIds.has(item.id));

    const selected = [];

    // Helper to pick from array
    const pickFrom = (arr) => {
        if (arr.length === 0) return null;
        const shuffled = seededShuffle(arr, random);
        const item = shuffled[0];
        // Remove from source to avoid duplicates
        const idx = arr.findIndex(i => i.id === item.id);
        if (idx > -1) arr.splice(idx, 1);
        return item;
    };

    // Pick 2 common
    for (let i = 0; i < 2; i++) {
        const item = pickFrom(common);
        if (item) selected.push(item);
    }

    // Pick 1 uncommon
    const uncommonItem = pickFrom(uncommon);
    if (uncommonItem) selected.push(uncommonItem);

    // Pick 1 random from remaining
    const remaining = [...common, ...uncommon];
    const randomItem = pickFrom(remaining);
    if (randomItem) selected.push(randomItem);

    return selected;
}

/**
 * Get weekly special item
 * @param {number} weekNumber - Current week number
 * @param {Array} ownedCosmetics - Array of owned cosmetic IDs
 * @returns {Object|null} Weekly special item or null
 */
export function getWeeklySpecial(weekNumber, ownedCosmetics = []) {
    const ownedIds = new Set(ownedCosmetics);
    const random = seededRandom(weekNumber * 7919);

    // Get available rare items
    const rareItems = getItemsByRarity(COSMETIC_RARITY.RARE).filter(item => !ownedIds.has(item.id));

    if (rareItems.length === 0) {
        // Fall back to uncommon if no rare available
        const uncommon = getItemsByRarity(COSMETIC_RARITY.UNCOMMON).filter(item => !ownedIds.has(item.id));
        if (uncommon.length === 0) return null;
        return seededShuffle(uncommon, random)[0];
    }

    return seededShuffle(rareItems, random)[0];
}

/**
 * Get full shop rotation
 * @param {number} dayNumber - Current day number
 * @param {number} weekNumber - Current week number
 * @param {Array} ownedCosmetics - Array of owned cosmetic IDs
 * @returns {Object} { dailyItems, weeklySpecial }
 */
export function getShopRotation(dayNumber, weekNumber, ownedCosmetics = []) {
    return {
        dailyItems: getDailyItems(dayNumber, ownedCosmetics),
        weeklySpecial: getWeeklySpecial(weekNumber, ownedCosmetics),
    };
}

export default {
    getDailyItems,
    getWeeklySpecial,
    getShopRotation,
};
