import { CROP_DATA } from './cropData';

export const MARKET_MOODS = [
  {
    id: 'steady',
    label: 'Steady Market',
    emoji: '🧺',
    description: 'Neighbors are browsing with gentle demand.',
    bonusMultiplier: 1.01,
  },
  {
    id: 'festival',
    label: 'Town Festival',
    emoji: '🎈',
    description: 'A cozy celebration boosts the featured crop.',
    bonusMultiplier: 1.03,
  },
  {
    id: 'comfort',
    label: 'Comfort Orders',
    emoji: '☕',
    description: 'Warm orders favor today’s featured crop.',
    bonusMultiplier: 1.02,
  },
];

export const createDefaultMarketState = () => ({
  dailyFeaturedCrop: null,
  dailyMood: MARKET_MOODS[0],
  lastUpdatedDay: 1,
});

export const rollDailyMarket = ({ season } = {}) => {
  const crops = Object.values(CROP_DATA);
  const seasonal = season
    ? crops.filter((crop) => crop.season === season)
    : [];
  const pool = seasonal.length > 0 ? seasonal : crops;
  const featuredCrop = pool[Math.floor(Math.random() * pool.length)];
  const mood = MARKET_MOODS[Math.floor(Math.random() * MARKET_MOODS.length)];

  return {
    dailyFeaturedCrop: featuredCrop?.id || null,
    dailyMood: mood,
  };
};

export const getMarketBonusMultiplier = (marketState, cropId) => {
  if (!marketState || !cropId) return 1.0;
  if (marketState.dailyFeaturedCrop !== cropId) return 1.0;
  const bonus = marketState.dailyMood?.bonusMultiplier;
  return Number.isFinite(bonus) ? bonus : 1.0;
};

export const getMarketBonusLabel = (marketState) => {
  if (!marketState?.dailyMood?.bonusMultiplier) return 'No bonus';
  const percent = Math.round((marketState.dailyMood.bonusMultiplier - 1) * 100);
  return percent > 0 ? `+${percent}%` : 'No bonus';
};
