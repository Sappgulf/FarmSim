/**
 * Mystery Seed System
 * Rarity-based seed gambling mechanic
 */

export const SEED_RARITIES = {
  COMMON: {
    id: 'common',
    name: 'Common',
    color: '#9ca3af',
    dropRate: 0.60, // 60%
    emoji: '⚪',
  },
  UNCOMMON: {
    id: 'uncommon',
    name: 'Uncommon',
    color: '#10b981',
    dropRate: 0.25, // 25%
    emoji: '🟢',
  },
  RARE: {
    id: 'rare',
    name: 'Rare',
    color: '#3b82f6',
    dropRate: 0.10, // 10%
    emoji: '🔵',
  },
  EPIC: {
    id: 'epic',
    name: 'Epic',
    color: '#a855f7',
    dropRate: 0.04, // 4%
    emoji: '🟣',
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    color: '#eab308',
    dropRate: 0.01, // 1%
    emoji: '🟡',
  },
};

// Map crops to rarities
export const CROP_RARITY_MAP = {
  // Common (60%) - Level 1 crops
  lettuce: 'common',
  carrot: 'common',
  potato: 'common',
  parsnip: 'common',
  wheat: 'common',
  
  // Uncommon (25%) - Level 2 crops
  cabbage: 'uncommon',
  corn: 'uncommon',
  okra: 'uncommon',
  sunflower: 'uncommon',
  herb: 'uncommon',
  tomato: 'uncommon',
  
  // Rare (10%) - Level 3 crops
  eggplant: 'rare',
  rice: 'rare',
  strawberry: 'rare',
  tulip: 'rare',
  chili: 'rare',
  cranberry: 'rare',
  pumpkin: 'rare',
  
  // Epic (4%) - Level 4 crops
  grapes: 'epic',
  watermelon: 'epic',
  
  // Legendary (1%) - Level 5 crops
  rose: 'legendary',
};

/**
 * Roll for a random seed based on rarity drop rates
 * @returns {Object} - { cropId, rarity, cost }
 */
export function rollMysterySeed() {
  const roll = Math.random();
  let cumulativeProbability = 0;
  let selectedRarity = 'common';
  
  // Determine rarity based on drop rates
  for (const [rarityId, rarity] of Object.entries(SEED_RARITIES)) {
    cumulativeProbability += rarity.dropRate;
    if (roll <= cumulativeProbability) {
      selectedRarity = rarityId;
      break;
    }
  }
  
  // Get all crops of this rarity
  const cropsOfRarity = Object.entries(CROP_RARITY_MAP)
    .filter(([_, rarity]) => rarity === selectedRarity)
    .map(([cropId]) => cropId);
  
  // Randomly select one crop from this rarity tier
  const cropId = cropsOfRarity[Math.floor(Math.random() * cropsOfRarity.length)];
  
  return {
    cropId,
    rarity: selectedRarity,
    rarityData: SEED_RARITIES[selectedRarity],
  };
}

/**
 * Get mystery seed pack offerings
 */
export const MYSTERY_SEED_PACKS = {
  basic: {
    id: 'basic',
    name: 'Mystery Seed',
    cost: 20,
    emoji: '📦',
    description: 'Could be anything! Common to Legendary',
    guaranteedRarity: null,
  },
  premium: {
    id: 'premium',
    name: 'Premium Mystery Pack',
    cost: 50,
    emoji: '🎁',
    description: 'Guaranteed Uncommon or better!',
    guaranteedRarity: 'uncommon', // Minimum uncommon
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Mystery Pack',
    cost: 150,
    emoji: '💎',
    description: 'Guaranteed Rare or better!',
    guaranteedRarity: 'rare',
  },
  jackpot: {
    id: 'jackpot',
    name: 'Jackpot Pack',
    cost: 500,
    emoji: '🎰',
    description: 'Guaranteed Epic or Legendary!',
    guaranteedRarity: 'epic',
  },
};

/**
 * Roll with guaranteed minimum rarity
 * @param {string} minimumRarity - Guaranteed minimum rarity
 * @returns {Object}
 */
export function rollMysterySeedWithGuarantee(minimumRarity) {
  const result = rollMysterySeed();
  
  // Check if result meets minimum rarity
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const resultRarityIndex = rarityOrder.indexOf(result.rarity);
  const minRarityIndex = rarityOrder.indexOf(minimumRarity);
  
  // If result is better than or equal to minimum, return it
  if (resultRarityIndex >= minRarityIndex) {
    return result;
  }
  
  // Otherwise, reroll until we get the minimum or better
  let attempts = 0;
  while (attempts < 100) { // Safety limit
    const reroll = rollMysterySeed();
    const rerollRarityIndex = rarityOrder.indexOf(reroll.rarity);
    if (rerollRarityIndex >= minRarityIndex) {
      return reroll;
    }
    attempts++;
  }
  
  // Fallback: return a crop of exact minimum rarity
  const fallbackCrops = Object.entries(CROP_RARITY_MAP)
    .filter(([_, rarity]) => rarity === minimumRarity)
    .map(([cropId]) => cropId);
  
  const cropId = fallbackCrops[Math.floor(Math.random() * fallbackCrops.length)];
  
  return {
    cropId,
    rarity: minimumRarity,
    rarityData: SEED_RARITIES[minimumRarity],
  };
}

/**
 * Get rarity display name with emoji
 */
export function getRarityDisplay(rarity) {
  const rarityData = SEED_RARITIES[rarity];
  return `${rarityData.emoji} ${rarityData.name}`;
}

/**
 * Get rarity color for styling
 */
export function getRarityColor(rarity) {
  return SEED_RARITIES[rarity]?.color || '#9ca3af';
}

export default {
  SEED_RARITIES,
  CROP_RARITY_MAP,
  MYSTERY_SEED_PACKS,
  rollMysterySeed,
  rollMysterySeedWithGuarantee,
  getRarityDisplay,
  getRarityColor,
};
