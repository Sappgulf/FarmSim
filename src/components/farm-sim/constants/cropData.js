import { getDiseaseById } from './diseaseData';

/**
 * Centralized Crop Data Constants
 * Single source of truth for all crop information across the game
 */

// Harvest window before crops overripe
export const HARVEST_WINDOW_MS = 90000;

// Crop categories for filtering
export const CROP_CATEGORIES = {
  VEGETABLE: 'vegetable',
  GRAIN: 'grain',
  FRUIT: 'fruit',
  SPECIALTY: 'specialty',
};

// Seasons
export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  FALL: 'fall',
  WINTER: 'winter',
};

export const CROP_DATA = {
  // Basic Vegetables - BALANCED GROWTH (15-30 seconds)
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    cost: 12,
    baseValue: 24,
    growthTime: 60, // Fast starter crop (was 15, 4x scaled)
    stages: 3,
    description: 'A crunchy orange vegetable',
    category: 'vegetable',
    season: 'spring',
    level: 1,
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    cost: 16,
    baseValue: 32,
    growthTime: 80, // Reliable mid-tier (was 20, 4x scaled)
    stages: 3,
    description: 'A versatile root vegetable',
    category: 'vegetable',
    season: 'fall',
    level: 1,
  },
  lettuce: {
    id: 'lettuce',
    name: 'Lettuce',
    emoji: '🥬',
    cost: 10,
    baseValue: 19,
    growthTime: 48, // Fastest crop (was 12, 4x scaled)
    stages: 3,
    description: 'Crispy green lettuce - fast growing!',
    category: 'vegetable',
    season: 'spring',
    level: 1,
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    emoji: '💜',
    cost: 18,
    baseValue: 38,
    growthTime: 72,
    stages: 3,
    description: 'Fragrant bundles loved by the town.',
    category: 'specialty',
    season: 'spring',
    level: 1,
    requiresTownUnlock: true,
  },
  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    emoji: '🥬',
    cost: 24,
    baseValue: 48,
    growthTime: 100, // Hearty cabbage (was 25, 4x scaled)
    stages: 3,
    description: 'Hearty green cabbage',
    category: 'vegetable',
    season: 'fall',
    level: 2,
  },
  eggplant: {
    id: 'eggplant',
    name: 'Eggplant',
    emoji: '🍆',
    cost: 32,
    baseValue: 70,
    growthTime: 120, // Premium crop (was 30, 4x scaled)
    stages: 4,
    description: 'Purple eggplant - premium value!',
    category: 'vegetable',
    season: 'summer',
    level: 3,
  },

  // Grains - BALANCED GROWTH (15-35 seconds)
  corn: {
    id: 'corn',
    name: 'Corn',
    emoji: '🌽',
    cost: 28,
    baseValue: 60,
    growthTime: 100, // Tall corn takes time (was 25, 4x scaled)
    stages: 4,
    description: 'Golden ears of sweet corn',
    category: 'grain',
    season: 'summer',
    level: 2,
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    emoji: '🌾',
    cost: 14,
    baseValue: 28,
    growthTime: 72, // Fast grain crop (was 18, 4x scaled)
    stages: 3,
    description: 'Golden wheat for bread',
    category: 'grain',
    season: 'summer',
    level: 1,
  },
  rice: {
    id: 'rice',
    name: 'Rice',
    emoji: '🍚',
    cost: 30,
    baseValue: 66,
    growthTime: 112, // Requires patience (was 28, 4x scaled)
    stages: 4,
    description: 'Staple grain crop - high value!',
    category: 'grain',
    season: 'summer',
    level: 3,
  },

  // Fruits - BALANCED GROWTH (20-45 seconds)
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    cost: 32,
    baseValue: 64,
    growthTime: 88, // Popular fruit (was 22, 4x scaled)
    stages: 4,
    description: 'Juicy red tomatoes',
    category: 'fruit',
    season: 'summer',
    level: 2,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    cost: 40,
    baseValue: 88,
    growthTime: 96, // Delicate berries (was 24, 4x scaled)
    stages: 4,
    description: 'Sweet red strawberries - premium!',
    category: 'fruit',
    season: 'spring',
    level: 3,
  },
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    emoji: '🍉',
    cost: 60,
    baseValue: 130,
    growthTime: 180, // Slow-growing giant (was 45, 4x scaled)
    stages: 5,
    description: 'Massive juicy watermelon - luxury crop!',
    category: 'fruit',
    season: 'summer',
    level: 4,
  },
  blueberry: {
    id: 'blueberry',
    name: 'Blueberry',
    emoji: '🫐',
    cost: 36,
    baseValue: 78,
    growthTime: 104, // Bush berries (was 26, 4x scaled)
    stages: 4,
    description: 'Antioxidant-rich blueberries',
    category: 'fruit',
    season: 'summer',
    level: 3,
  },

  // Specialty Crops - BALANCED GROWTH (15-35 seconds)
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    emoji: '🎃',
    cost: 48,
    baseValue: 110,
    growthTime: 140, // Large pumpkin takes time (was 35, 4x scaled)
    stages: 5,
    description: 'Large orange pumpkin - fall favorite!',
    category: 'specialty',
    season: 'fall',
    level: 4,
  },
  chili: {
    id: 'chili',
    name: 'Chili Pepper',
    emoji: '🌶️',
    cost: 20,
    baseValue: 42,
    growthTime: 64, // Spicy peppers (was 16, 4x scaled)
    stages: 3,
    description: 'Spicy red peppers',
    category: 'specialty',
    season: 'summer',
    level: 2,
  },
  garlic: {
    id: 'garlic',
    name: 'Garlic',
    emoji: '🧄',
    cost: 18,
    baseValue: 35,
    growthTime: 80, // Underground growth (was 20, 4x scaled)
    stages: 3,
    description: 'Pungent cooking essential',
    category: 'specialty',
    season: 'spring',
    level: 2,
  },
  onion: {
    id: 'onion',
    name: 'Onion',
    emoji: '🧅',
    cost: 14,
    baseValue: 28,
    growthTime: 72, // Layered growth (was 18, 4x scaled)
    stages: 3,
    description: 'Versatile cooking base',
    category: 'specialty',
    season: 'spring',
    level: 1,
  },
  broccoli: {
    id: 'broccoli',
    name: 'Broccoli',
    emoji: '🥦',
    cost: 26,
    baseValue: 55,
    growthTime: 88, // Nutrient-rich green (was 22, 4x scaled)
    stages: 4,
    description: 'Nutritious green vegetable',
    category: 'vegetable',
    season: 'spring',
    level: 2,
  },
};

// Helper function to get crop by ID
export function getCropById(id) {
  return CROP_DATA[id];
}

// Get all crops
export function getAllCrops() {
  return Object.values(CROP_DATA);
}

// Get crops by category
export function getCropsByCategory(category) {
  return Object.values(CROP_DATA).filter(crop => crop.category === category);
}

// Get crops by season
export function getCropsBySeason(season) {
  return Object.values(CROP_DATA).filter(crop => crop.season === season);
}

// Get crops available at player level
export function getAvailableCrops(playerLevel) {
  return Object.values(CROP_DATA).filter(crop => crop.level <= playerLevel);
}

// Alias for compatibility
export function getCropsByLevel(playerLevel) {
  return getAvailableCrops(playerLevel);
}

// Calculate ROI for a crop (return on investment)
export function calculateCropROI(crop) {
  if (!crop) return 0;
  const profit = crop.baseValue - crop.cost;
  const roi = (profit / crop.cost) * 100; // Percentage
  return Math.round(roi);
}

// Calculate profit per second
export function calculateProfitPerSecond(crop) {
  if (!crop) return 0;
  const profit = crop.baseValue - crop.cost;
  return profit / crop.growthTime;
}

/**
 * Calculate harvest value for a plot with modifiers applied.
 * @param {Object} plot - Plot data with crop and fertility
 * @param {Object} [seasonConfig] - Season config for market bonuses
 * @param {number} [bonusMultiplier=1] - Additional multiplier (town rep, events, etc.)
 * @returns {number}
 */
export function calculateHarvestValue(plot, seasonConfig, bonusMultiplier = 1) {
  if (!plot?.crop) return 0;
  const baseValue = plot.crop.baseValue || 10;
  const fertilityMultiplier = typeof plot.soilFertility === 'number' ? plot.soilFertility : 1.0;
  const marketMultiplier = seasonConfig?.bonuses?.marketPrices || 1.0;
  const totalMultiplier = Math.max(0, fertilityMultiplier)
    * Math.max(0, marketMultiplier)
    * Math.max(0, bonusMultiplier);
  const disease = plot.disease ? getDiseaseById(plot.disease) : null;
  const penaltyMultiplier = disease && typeof disease.yieldPenalty === 'number'
    ? Math.max(0, 1 - disease.yieldPenalty)
    : 1.0;
  return Math.max(1, Math.floor(baseValue * totalMultiplier * penaltyMultiplier));
}

export default CROP_DATA;
