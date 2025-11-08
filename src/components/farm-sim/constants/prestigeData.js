/**
 * Prestige/Rebirth System Data - Endless progression
 */

export const PRESTIGE_TIERS = [
  { tier: 1, required: 10, name: 'Farmhand', emoji: '🌱', bonus: 0.05 },
  { tier: 2, required: 25, name: 'Farmer', emoji: '👨‍🌾', bonus: 0.10 },
  { tier: 3, required: 50, name: 'Master Farmer', emoji: '🏅', bonus: 0.15 },
  { tier: 4, required: 100, name: 'Farm Baron', emoji: '👑', bonus: 0.25 },
  { tier: 5, required: 200, name: 'Agricultural Legend', emoji: '🌟', bonus: 0.40 },
];

export const LEGACY_BONUSES = {
  coin_boost: {
    id: 'coin_boost',
    name: 'Coin Multiplier',
    description: 'Increase all coin earnings',
    emoji: '💰',
    cost: 10,
    maxLevel: 10,
    bonusPerLevel: 0.05, // +5% per level
  },
  xp_boost: {
    id: 'xp_boost',
    name: 'XP Multiplier',
    description: 'Gain XP faster',
    emoji: '⭐',
    cost: 10,
    maxLevel: 10,
    bonusPerLevel: 0.05,
  },
  growth_speed: {
    id: 'growth_speed',
    name: 'Growth Speed',
    description: 'Crops grow faster',
    emoji: '🌾',
    cost: 15,
    maxLevel: 8,
    bonusPerLevel: 0.1, // +10% per level
  },
  starting_coins: {
    id: 'starting_coins',
    name: 'Starting Capital',
    description: 'Start with more coins',
    emoji: '🪙',
    cost: 20,
    maxLevel: 5,
    bonusPerLevel: 100, // +100 coins per level
  },
  disease_resist: {
    id: 'disease_resist',
    name: 'Disease Resistance',
    description: 'Reduce disease occurrence',
    emoji: '🛡️',
    cost: 25,
    maxLevel: 5,
    bonusPerLevel: 0.15, // -15% disease chance per level
  },
  weather_protection: {
    id: 'weather_protection',
    name: 'Weather Protection',
    description: 'Reduce weather damage',
    emoji: '☔',
    cost: 25,
    maxLevel: 5,
    bonusPerLevel: 0.1, // -10% weather damage per level
  },
  auto_water: {
    id: 'auto_water',
    name: 'Auto-Watering',
    description: 'Plots slowly auto-water',
    emoji: '💧',
    cost: 50,
    maxLevel: 1,
    bonusPerLevel: 1, // Unlocks feature
  },
  bigger_start: {
    id: 'bigger_start',
    name: 'Bigger Farm',
    description: 'Start with larger grid',
    emoji: '🗺️',
    cost: 40,
    maxLevel: 3,
    bonusPerLevel: 1, // +1 grid size per level
  },
  rare_seed_chance: {
    id: 'rare_seed_chance',
    name: 'Lucky Farmer',
    description: 'Higher rare seed drops',
    emoji: '🍀',
    cost: 30,
    maxLevel: 5,
    bonusPerLevel: 0.1, // +10% rare chance per level
  },
  instant_harvest: {
    id: 'instant_harvest',
    name: 'Swift Harvester',
    description: 'Chance for instant harvest',
    emoji: '⚡',
    cost: 60,
    maxLevel: 5,
    bonusPerLevel: 0.02, // +2% chance per level
  },
};

export const HEIRLOOM_SEEDS = {
  golden_wheat: {
    id: 'golden_wheat',
    name: 'Golden Wheat',
    emoji: '✨🌾',
    description: 'Legendary wheat that never withers',
    cost: 100, // Legacy points
    cropData: {
      cost: 0, // Free to plant!
      baseValue: 100,
      growthTime: 10,
      stages: 4,
      immuneToWeather: true,
      immuneToDisease: true,
    },
  },
  rainbow_berry: {
    id: 'rainbow_berry',
    name: 'Rainbow Berry',
    emoji: '🌈🍓',
    description: 'Magical berry worth 5x normal value',
    cost: 150,
    cropData: {
      cost: 10,
      baseValue: 250,
      growthTime: 15,
      stages: 4,
    },
  },
  phoenix_flower: {
    id: 'phoenix_flower',
    name: 'Phoenix Flower',
    emoji: '🔥🌺',
    description: 'Revives itself after harvest',
    cost: 200,
    cropData: {
      cost: 20,
      baseValue: 150,
      growthTime: 20,
      stages: 5,
      autoReplants: true, // Special ability
    },
  },
};

/**
 * Calculate prestige requirements
 * @param {number} currentLevel - Current player level
 * @returns {Object} - Prestige info
 */
export function getPrestigeInfo(currentLevel) {
  const minLevel = 10; // Minimum level to prestige
  const canPrestige = currentLevel >= minLevel;
  
  // Calculate legacy points earned
  const basePoints = Math.floor(currentLevel / 2); // 1 point per 2 levels
  const bonusPoints = Math.max(0, currentLevel - 20) * 2; // Bonus after level 20
  const totalPoints = basePoints + bonusPoints;
  
  return {
    canPrestige,
    minLevel,
    currentLevel,
    legacyPoints: totalPoints,
    nextTier: PRESTIGE_TIERS.find(t => t.required > currentLevel) || PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1],
  };
}

/**
 * Apply legacy bonuses to game values
 * @param {Object} legacyBonuses - Purchased legacy bonuses { bonusId: level }
 * @param {string} bonusType - Type of bonus to calculate
 * @param {number} baseValue - Base value to modify
 * @returns {number} - Modified value
 */
export function applyLegacyBonus(legacyBonuses, bonusType, baseValue) {
  if (!legacyBonuses || !legacyBonuses[bonusType]) {
    return baseValue;
  }
  
  const bonus = LEGACY_BONUSES[bonusType];
  if (!bonus) return baseValue;
  
  const level = legacyBonuses[bonusType];
  const totalBonus = bonus.bonusPerLevel * level;
  
  // Different bonus types apply differently
  if (bonusType === 'starting_coins') {
    return baseValue + totalBonus; // Additive
  } else if (bonusType === 'bigger_start') {
    return baseValue + totalBonus; // Additive
  } else {
    return baseValue * (1 + totalBonus); // Multiplicative
  }
}

/**
 * Get total prestige multiplier from tier
 * @param {number} prestigeTier - Current prestige tier
 * @returns {number} - Total multiplier
 */
export function getPrestigeMultiplier(prestigeTier) {
  const tier = PRESTIGE_TIERS.find(t => t.tier === prestigeTier);
  if (!tier) return 1.0;
  return 1.0 + tier.bonus;
}

export default {
  PRESTIGE_TIERS,
  LEGACY_BONUSES,
  HEIRLOOM_SEEDS,
  getPrestigeInfo,
  applyLegacyBonus,
  getPrestigeMultiplier,
};

