export const SPECIALIZATION_ORDER = [
  'crops',
  'livestock',
  'processing',
  'hybrid',
  'cozy',
];

export const SPECIALIZATION_PATHS = Object.freeze({
  crops: {
    id: 'crops',
    icon: '🌾',
    name: 'Field Botanist',
    tagline: 'Faster fields and stronger harvest payoffs.',
    description: 'Lean into crop tempo, soil timing, and the cleanest harvest loop on the farm.',
    unlock: { level: 4, completedResearch: 2 },
    highlights: [
      '+18% crop growth speed',
      '+14% harvest value',
      '+12% harvest XP',
    ],
    effects: {
      cropGrowthMultiplier: 1.18,
      cropHarvestMultiplier: 1.14,
      harvestXpMultiplier: 1.12,
    },
  },
  livestock: {
    id: 'livestock',
    icon: '🐄',
    name: 'Pasture Steward',
    tagline: 'Calmer animals and richer barn output.',
    description: 'Stabilize herd care, keep animals content longer, and turn the barn into a reliable earner.',
    unlock: { level: 5, completedResearch: 3 },
    highlights: [
      '-28% happiness decay',
      '-15% hunger pressure',
      '+16% product value',
    ],
    effects: {
      livestockHappinessDecayMultiplier: 0.72,
      livestockHungerRateMultiplier: 0.85,
      livestockProductMultiplier: 1.16,
    },
  },
  processing: {
    id: 'processing',
    icon: '🏭',
    name: 'Workshop Artisan',
    tagline: 'Cheaper facilities, quicker batches, better finished goods.',
    description: 'Push the farm into higher-value goods and make every processor feel worth the footprint.',
    unlock: { level: 6, completedResearch: 4 },
    highlights: [
      '-12% facility costs',
      '-24% processing time',
      '+18% processed sale value',
    ],
    effects: {
      processingCostMultiplier: 0.88,
      processingTimeMultiplier: 0.76,
      processingValueMultiplier: 1.18,
    },
  },
  hybrid: {
    id: 'hybrid',
    icon: '🧪',
    name: 'Crossfield Guild',
    tagline: 'Mixed-discipline momentum across the wider farm.',
    description: 'Blend research, fishing, and cross-system loops into a more experimental operation.',
    unlock: { level: 7, completedResearch: 5 },
    highlights: [
      '+20% research speed',
      '+22% rare catch weighting',
      '+12% fish value',
    ],
    effects: {
      researchSpeedMultiplier: 1.2,
      fishRareWeightMultiplier: 1.22,
      fishValueMultiplier: 1.12,
    },
  },
  cozy: {
    id: 'cozy',
    icon: '📖',
    name: 'Hearth Story',
    tagline: 'More soft goals, gentler progression, and richer lab rewards.',
    description: 'Bias the farm toward scrapbook moments, town-board comfort, and a steadier reflective pace.',
    unlock: { level: 4, completedResearch: 2 },
    highlights: [
      '+1 daily cozy goal',
      '+50% cozy reward strength',
      '+18% research completion XP',
    ],
    effects: {
      cozyGoalSlots: 4,
      cozyRewardMultiplier: 1.5,
      researchXpMultiplier: 1.18,
      cozyGoalXpBonus: 12,
    },
  },
});

export const DEFAULT_SPECIALIZATION_EFFECTS = Object.freeze({
  cropGrowthMultiplier: 1,
  cropHarvestMultiplier: 1,
  harvestXpMultiplier: 1,
  livestockHappinessDecayMultiplier: 1,
  livestockHungerRateMultiplier: 1,
  livestockProductMultiplier: 1,
  processingCostMultiplier: 1,
  processingTimeMultiplier: 1,
  processingValueMultiplier: 1,
  researchSpeedMultiplier: 1,
  researchXpMultiplier: 1,
  fishRareWeightMultiplier: 1,
  fishValueMultiplier: 1,
  cozyGoalSlots: 3,
  cozyRewardMultiplier: 1,
  cozyGoalXpBonus: 0,
});

export const getCompletedResearchCount = (state) => (
  Array.isArray(state?.research?.completed) ? state.research.completed.length : 0
);

export const getUnlockedSpecializationIds = (state) => {
  const completedResearch = getCompletedResearchCount(state);
  const level = Number(state?.level || 1);

  return SPECIALIZATION_ORDER.filter((id) => {
    const unlock = SPECIALIZATION_PATHS[id]?.unlock || {};
    return level >= Number(unlock.level || 1)
      && completedResearch >= Number(unlock.completedResearch || 0);
  });
};

export const canSelectSpecialization = (state, specializationId) => (
  getUnlockedSpecializationIds(state).includes(specializationId)
);

export const getChosenSpecializationId = (state) => (
  typeof state?.research?.specialization?.chosenId === 'string'
    ? state.research.specialization.chosenId
    : null
);

export const getFarmSpecialization = (state) => {
  const chosenId = getChosenSpecializationId(state);
  if (!chosenId || !canSelectSpecialization(state, chosenId)) return null;
  return SPECIALIZATION_PATHS[chosenId] || null;
};

export const getSpecializationModifiers = (state) => {
  const specialization = getFarmSpecialization(state);
  return {
    ...DEFAULT_SPECIALIZATION_EFFECTS,
    ...(specialization?.effects || {}),
  };
};

export const getSpecializationSwitchCost = (state) => {
  const chosenId = getChosenSpecializationId(state);
  if (!chosenId) return 0;
  return 120 + (getCompletedResearchCount(state) * 35);
};
