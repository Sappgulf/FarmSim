/**
 * Town Reputation Data - Cozy, lightweight reputation tiers and bonuses.
 */

export const TOWN_REP_TIERS = [
  {
    id: 'newcomer',
    name: 'Newcomer',
    minRep: 0,
    sellBonus: 1.0,
    perks: ['Welcome basket from the town market.'],
  },
  {
    id: 'neighbor',
    name: 'Good Neighbor',
    minRep: 25,
    sellBonus: 1.02,
    perks: ['+2% crop sale bonus at the market.'],
  },
  {
    id: 'helper',
    name: 'Town Helper',
    minRep: 75,
    sellBonus: 1.04,
    perks: ['+4% crop sale bonus at the market.', 'Seasonal seed swap invites.'],
  },
  {
    id: 'partner',
    name: 'Local Partner',
    minRep: 150,
    sellBonus: 1.06,
    perks: ['+6% crop sale bonus at the market.', 'Friendly vendor discounts.'],
  },
  {
    id: 'favorite',
    name: 'Town Favorite',
    minRep: 300,
    sellBonus: 1.08,
    perks: ['+8% crop sale bonus at the market.', 'Festival spotlight perks.'],
  },
];

export const getTownTierIndex = (reputation = 0) => {
  let index = 0;
  for (let i = 0; i < TOWN_REP_TIERS.length; i += 1) {
    if (reputation >= TOWN_REP_TIERS[i].minRep) {
      index = i;
    } else {
      break;
    }
  }
  return index;
};

export const getTownTierByRep = (reputation = 0) => TOWN_REP_TIERS[getTownTierIndex(reputation)];

export const getNextTownTier = (reputation = 0) => {
  const currentIndex = getTownTierIndex(reputation);
  return TOWN_REP_TIERS[currentIndex + 1] || null;
};

export const getTownRepBonus = (reputation = 0) => {
  const tier = getTownTierByRep(reputation);
  return tier?.sellBonus || 1.0;
};

export const getHarvestReputationGain = (harvestValue = 0) => {
  if (!Number.isFinite(harvestValue) || harvestValue <= 0) return 0;
  return Math.max(1, Math.floor(harvestValue / 50));
};
