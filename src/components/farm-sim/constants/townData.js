/**
 * Town Reputation Data - Cozy, lightweight reputation tiers and bonuses.
 */

export const TOWN_REP_TIERS = [
  {
    id: 'neighbor',
    name: 'Garden Neighbor',
    minRep: 0,
    sellBonus: 1.0,
    perks: ['Lavender seed license ready to claim.'],
    reward: {
      type: 'seed',
      cropId: 'lavender',
      label: 'Lavender Seeds',
      description: 'Unlock the Lavender seed line.',
    },
  },
  {
    id: 'caretaker',
    name: 'Cozy Caretaker',
    minRep: 40,
    sellBonus: 1.02,
    perks: ['+2% crop sale bonus at the market.', 'Town Banner decor unlocked.'],
    reward: {
      type: 'cosmetic',
      id: 'town_banner',
      label: 'Town Banner Decor',
      description: 'Hang a cozy banner near your farm.',
    },
  },
  {
    id: 'partner',
    name: 'Market Partner',
    minRep: 120,
    sellBonus: 1.04,
    perks: ['+4% crop sale bonus at the market.', 'Vendor discount unlocked.'],
    reward: {
      type: 'vendor',
      discount: 0.03,
      label: 'Vendor Discount',
      description: 'Enjoy 3% off shop purchases.',
    },
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

export const getTownTierById = (tierId) => TOWN_REP_TIERS.find((tier) => tier.id === tierId);

export const getTownRepBonus = (reputation = 0) => {
  const tier = getTownTierByRep(reputation);
  return tier?.sellBonus || 1.0;
};

export const getHarvestReputationGain = (harvestValue = 0) => {
  if (!Number.isFinite(harvestValue) || harvestValue <= 0) return 0;
  // Slightly faster rep gain for better progression feel (was /50, now /40)
  return Math.max(1, Math.floor(harvestValue / 40));
};
