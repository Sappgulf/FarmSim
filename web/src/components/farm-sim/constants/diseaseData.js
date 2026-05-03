/**
 * Disease and Pest Data - Strategic crop management
 */

export const DISEASE_TYPES = {
  BLIGHT: {
    id: 'blight',
    name: 'Crop Blight',
    emoji: '🦠',
    description: 'Fungal disease that spreads quickly in humid conditions',
    spreadChance: 0.15, // 15% chance to spread per tick to adjacent plots
    yieldPenalty: 0.5, // Reduces harvest value by 50%
    visualColor: '#8B4513', // Brown
    favorableWeather: ['rainy', 'cloudy'],
    cureItem: 'fungicide',
    cureCost: 30,
  },
  APHIDS: {
    id: 'aphids',
    name: 'Aphid Infestation',
    emoji: '🐜',
    description: 'Tiny insects that drain nutrients from crops',
    spreadChance: 0.2, // 20% chance to spread
    yieldPenalty: 0.3, // Reduces harvest by 30%
    visualColor: '#228B22', // Forest green
    favorableWeather: ['sunny'],
    cureItem: 'pesticide',
    cureCost: 25,
  },
  ROOT_ROT: {
    id: 'root_rot',
    name: 'Root Rot',
    emoji: '🦴',
    description: 'Waterlogged soil causes roots to decay',
    spreadChance: 0.1, // 10% chance to spread
    yieldPenalty: 0.6, // Reduces harvest by 60%
    visualColor: '#4B0082', // Indigo
    favorableWeather: ['rainy', 'stormy'],
    cureItem: 'draining_agent',
    cureCost: 35,
  },
  LOCUSTS: {
    id: 'locusts',
    name: 'Locust Swarm',
    emoji: '🦗',
    description: 'Hungry locusts devour entire crops',
    spreadChance: 0.25, // 25% chance to spread (fast!)
    yieldPenalty: 0.8, // Reduces harvest by 80%!
    visualColor: '#FFD700', // Gold
    favorableWeather: ['sunny', 'cloudy'],
    cureItem: 'insect_repellent',
    cureCost: 50,
  },
  WILT: {
    id: 'wilt',
    name: 'Bacterial Wilt',
    emoji: '💀',
    description: 'Bacteria blocks water flow, causing crop to wilt',
    spreadChance: 0.12, // 12% chance to spread
    yieldPenalty: 0.4, // Reduces harvest by 40%
    visualColor: '#DC143C', // Crimson
    favorableWeather: ['sunny', 'stormy'],
    cureItem: 'antibiotic_spray',
    cureCost: 40,
  },
};

export const CURE_ITEMS = {
  fungicide: {
    id: 'fungicide',
    name: 'Fungicide',
    emoji: '🧪',
    description: 'Cures fungal diseases like blight',
    cost: 30,
    cures: ['blight'],
  },
  pesticide: {
    id: 'pesticide',
    name: 'Pesticide',
    emoji: '💊',
    description: 'Eliminates insect pests like aphids',
    cost: 25,
    cures: ['aphids'],
  },
  draining_agent: {
    id: 'draining_agent',
    name: 'Soil Drainer',
    emoji: '🌊',
    description: 'Improves drainage to prevent root rot',
    cost: 35,
    cures: ['root_rot'],
  },
  insect_repellent: {
    id: 'insect_repellent',
    name: 'Insect Repellent',
    emoji: '🛡️',
    description: 'Repels large insect swarms like locusts',
    cost: 50,
    cures: ['locusts'],
  },
  antibiotic_spray: {
    id: 'antibiotic_spray',
    name: 'Antibiotic Spray',
    emoji: '💉',
    description: 'Treats bacterial infections like wilt',
    cost: 40,
    cures: ['wilt'],
  },
  universal_cure: {
    id: 'universal_cure',
    name: 'Universal Cure',
    emoji: '✨',
    description: 'Cures ALL diseases and prevents spread for 1 day',
    cost: 100,
    cures: ['blight', 'aphids', 'root_rot', 'locusts', 'wilt'],
    preventionDuration: 86400000, // 24 hours in ms
  },
};

/**
 * Calculate disease occurrence chance based on conditions
 * @param {string} weather - Current weather
 * @param {number} plotHealth - Plot health (0-1)
 * @param {number} adjacentDiseased - Number of adjacent diseased plots
 * @returns {Object} - Disease chances for each type
 */
export function calculateDiseaseRisk(weather, plotHealth = 1.0, adjacentDiseased = 0) {
  const risks = {};

  Object.values(DISEASE_TYPES).forEach((disease) => {
    let baseRisk = 0.0075; // 0.75% base chance per disease-check tick

    // Weather modifier
    if (disease.favorableWeather.includes(weather)) {
      baseRisk *= 2.0; // Double risk in favorable weather
    }

    // Health modifier (low health = more vulnerable)
    baseRisk *= 2.0 - plotHealth; // 0.5 health = 3x risk

    // Adjacent disease pressure
    baseRisk += adjacentDiseased * 0.03; // +3% per adjacent diseased plot

    risks[disease.id] = Math.min(baseRisk, 0.5); // Cap at 50% max
  });

  return risks;
}

/**
 * Get adjacent plot indices for spread calculation
 * @param {number} plotIndex - Current plot index
 * @param {number} gridSize - Size of grid (e.g., 3 for 3x3)
 * @returns {Array<number>} - Array of adjacent plot indices
 */
export function getAdjacentPlots(plotIndex, gridSize) {
  const row = Math.floor(plotIndex / gridSize);
  const col = plotIndex % gridSize;
  const adjacent = [];

  // Up
  if (row > 0) adjacent.push((row - 1) * gridSize + col);
  // Down
  if (row < gridSize - 1) adjacent.push((row + 1) * gridSize + col);
  // Left
  if (col > 0) adjacent.push(row * gridSize + (col - 1));
  // Right
  if (col < gridSize - 1) adjacent.push(row * gridSize + (col + 1));

  return adjacent;
}

export default {
  DISEASE_TYPES,
  CURE_ITEMS,
  calculateDiseaseRisk,
  getAdjacentPlots,
};
