/**
 * Farm Disasters Data - Random events that impact the farm
 */

export const DISASTER_TYPES = {
  TORNADO: {
    id: 'tornado',
    name: 'Tornado',
    emoji: '🌪️',
    description: 'A powerful tornado tears through your farm!',
    severity: 'extreme',
    damageChance: 0.7, // 70% chance to damage each plot
    effects: {
      cropDestruction: 0.8, // 80% of crops destroyed
      buildingDamage: 0.3, // 30% chance to damage buildings
      coinLoss: 0.2, // Lose 20% of coins
    },
    warningTime: 60000, // 1 minute warning
    duration: 15000, // 15 seconds
    occurrenceChance: 0.001, // 0.1% chance per check
    favorableWeather: ['stormy'],
    visualColor: '#4B0082',
  },
  FLOOD: {
    id: 'flood',
    name: 'Flash Flood',
    emoji: '🌊',
    description: 'Heavy rains cause devastating floods!',
    severity: 'high',
    damageChance: 0.5, // 50% chance to damage each plot
    effects: {
      cropDestruction: 0.5, // 50% of crops destroyed
      waterLevel: 100, // All plots max water (can cause root rot)
      soilFertility: -0.3, // Reduces fertility by 30%
    },
    warningTime: 120000, // 2 minutes warning
    duration: 30000, // 30 seconds
    occurrenceChance: 0.002, // 0.2% chance
    favorableWeather: ['rainy', 'stormy'],
    visualColor: '#1E90FF',
  },
  LOCUST_SWARM: {
    id: 'locust_swarm',
    name: 'Locust Plague',
    emoji: '🦗',
    description: 'A massive swarm of locusts descends on your farm!',
    severity: 'high',
    damageChance: 0.9, // 90% chance to damage each plot
    effects: {
      cropDestruction: 0.6, // 60% of crops destroyed
      inventoryLoss: 0.3, // Lose 30% of stored crops
      disease: 'locusts', // Can spread locust infestation
    },
    warningTime: 30000, // 30 seconds warning
    duration: 20000, // 20 seconds
    occurrenceChance: 0.0015, // 0.15% chance
    favorableWeather: ['sunny', 'cloudy'],
    visualColor: '#FFD700',
  },
  DROUGHT: {
    id: 'drought',
    name: 'Severe Drought',
    emoji: '☀️',
    description: 'Extreme heat and no rain cause a severe drought!',
    severity: 'medium',
    damageChance: 0.4, // 40% chance to damage each plot
    effects: {
      cropDestruction: 0.3, // 30% of crops wither
      waterDrain: 50, // Drains 50 water from all plots
      growthPenalty: 0.5, // 50% slower growth
    },
    warningTime: 180000, // 3 minutes warning
    duration: 60000, // 60 seconds
    occurrenceChance: 0.003, // 0.3% chance
    favorableWeather: ['sunny'],
    visualColor: '#FF8C00',
  },
};

export const DISASTER_PROTECTIONS = {
  insurance: {
    id: 'insurance',
    name: 'Farm Insurance',
    emoji: '🛡️',
    description: 'Covers 75% of disaster damage costs',
    cost: 200,
    coverage: 0.75,
    duration: 604800000, // 7 days in ms
  },
  storm_shelter: {
    id: 'storm_shelter',
    name: 'Storm Shelter',
    emoji: '🏠',
    description: 'Protects 50% of crops from tornado damage',
    cost: 500,
    protection: {
      tornado: 0.5,
    },
    permanent: true,
  },
  flood_barriers: {
    id: 'flood_barriers',
    name: 'Flood Barriers',
    emoji: '🚧',
    description: 'Reduces flood damage by 60%',
    cost: 400,
    protection: {
      flood: 0.6,
    },
    permanent: true,
  },
  pest_nets: {
    id: 'pest_nets',
    name: 'Pest Netting',
    emoji: '🕸️',
    description: 'Blocks 70% of locust swarm damage',
    cost: 300,
    protection: {
      locust_swarm: 0.7,
    },
    permanent: true,
  },
  irrigation_system: {
    id: 'irrigation_system',
    name: 'Irrigation System',
    emoji: '💧',
    description: 'Negates 80% of drought effects',
    cost: 450,
    protection: {
      drought: 0.8,
    },
    permanent: true,
  },
};

/**
 * Calculate disaster occurrence chance based on conditions
 * @param {string} weather - Current weather
 * @param {number} farmLevel - Farm level
 * @param {boolean} hasProtection - Whether farm has any protection
 * @returns {Object} - Disaster chances for each type
 */
export function calculateDisasterRisk(weather, farmLevel = 1, hasProtection = false) {
  const risks = {};

  Object.values(DISASTER_TYPES).forEach((disaster) => {
    let baseRisk = disaster.occurrenceChance;

    // Weather modifier
    if (disaster.favorableWeather.includes(weather)) {
      baseRisk *= 3.0; // Triple risk in favorable weather
    }

    // Farm level modifier (higher level = slightly more at risk)
    baseRisk *= 1 + farmLevel * 0.1;

    // Protection modifier
    if (hasProtection) {
      baseRisk *= 0.5; // Halve risk if any protection exists
    }

    risks[disaster.id] = baseRisk;
  });

  return risks;
}

/**
 * Calculate damage reduction from protections
 * @param {string} disasterId - Disaster type ID
 * @param {Object} protections - Active protection items
 * @returns {number} - Damage reduction (0.0 to 1.0)
 */
export function calculateProtection(disasterId, protections = {}) {
  let totalProtection = 0;

  Object.values(DISASTER_PROTECTIONS).forEach((protection) => {
    if (protections[protection.id]) {
      // Check if this protection works for this disaster
      if (protection.protection && protection.protection[disasterId]) {
        totalProtection += protection.protection[disasterId];
      }
    }
  });

  return Math.min(totalProtection, 0.95); // Cap at 95% protection
}

/**
 * Estimate disaster damage cost
 * @param {string} disasterId - Disaster type
 * @param {Object} farmState - Current farm state
 * @returns {number} - Estimated damage in coins
 */
export function estimateDisasterDamage(disasterId, farmState) {
  const disaster = DISASTER_TYPES[disasterId];
  if (!disaster) return 0;

  let estimatedDamage = 0;

  // Crop value loss
  const activePlots = farmState.plots.filter(
    (p) => p.state === 'growing' || p.state === 'planted' || p.state === 'ready'
  );
  const avgCropValue = 20; // Average crop value estimate
  estimatedDamage +=
    activePlots.length * avgCropValue * disaster.effects.cropDestruction * disaster.damageChance;

  // Direct coin loss
  if (disaster.effects.coinLoss) {
    estimatedDamage += farmState.coins * disaster.effects.coinLoss;
  }

  // Inventory loss
  if (disaster.effects.inventoryLoss) {
    const inventoryValue = Object.entries(farmState.inventory || {}).reduce((sum, [, amount]) => {
      return sum + amount * avgCropValue;
    }, 0);
    estimatedDamage += inventoryValue * disaster.effects.inventoryLoss;
  }

  return Math.floor(estimatedDamage);
}

export default {
  DISASTER_TYPES,
  DISASTER_PROTECTIONS,
  calculateDisasterRisk,
  calculateProtection,
  estimateDisasterDamage,
};
