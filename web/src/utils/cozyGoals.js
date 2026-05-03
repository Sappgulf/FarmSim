import { getDayKey } from '../systems/almanac';

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const stableShuffle = (items, seed) => {
  const seeded = [...items];
  seeded.sort((a, b) => {
    const aHash = hashString(`${seed}:${a.id}`);
    const bHash = hashString(`${seed}:${b.id}`);
    return aHash - bHash;
  });
  return seeded;
};

const getSeasonLabel = (season) => {
  if (!season) return 'seasonal';
  return season.charAt(0).toUpperCase() + season.slice(1);
};

const getSeasonalCropCosts = (content, season) => {
  const crops = (content?.crops || []).filter((crop) => crop.seasonTags?.includes(season));
  const costs = crops.map((crop) => Number(crop.cost) || 0).filter((cost) => cost > 0);
  return {
    crops,
    minCost: costs.length ? Math.min(...costs) : 0,
  };
};

const getSeasonalDecorOptions = (content, season) => {
  const decor = (content?.decor || []).filter((item) => item.seasonTags?.includes(season));
  const costs = decor.map((item) => Number(item.cost) || 0).filter((cost) => cost > 0);
  return {
    decor,
    minCost: costs.length ? Math.min(...costs) : 0,
  };
};

export const buildCozyGoals = (state, content, dayKey = getDayKey(), { maxGoals = 3 } = {}) => {
  const season = state?.season?.current || 'spring';
  const seasonLabel = getSeasonLabel(season);
  const { crops, minCost: minCropCost } = getSeasonalCropCosts(content, season);
  const { decor, minCost: minDecorCost } = getSeasonalDecorOptions(content, season);
  const plots = Array.isArray(state?.plots) ? state.plots : [];
  const hasSeasonalCropGrowing = plots.some((plot) => plot?.crop?.seasonTags?.includes(season));
  const canAffordSeasonalCrop = state?.coins >= minCropCost && crops.length > 0;
  const hasSeasonalDecorInInventory = decor.some((item) => (state?.inventory?.[item.id] || 0) > 0);
  const canAffordSeasonalDecor = state?.coins >= minDecorCost && decor.length > 0;
  const hasPets = Array.isArray(state?.pets) && state.pets.length > 0;
  const playedFestivalToday = state?.minigames?.festivalGame?.lastPlayedDayKey === dayKey;

  const candidates = [
    {
      id: 'cozy_harvest_seasonal',
      emoji: '🌾',
      text: `Harvest any ${seasonLabel} crop`,
      reward: { type: 'reputation', amount: 1 },
      available: hasSeasonalCropGrowing || canAffordSeasonalCrop,
    },
    {
      id: 'cozy_place_seasonal_decor',
      emoji: '🪴',
      text: `Place a ${seasonLabel} decoration`,
      reward: { type: 'almanac', id: 'cozy_goals' },
      available: hasSeasonalDecorInInventory || canAffordSeasonalDecor,
    },
    {
      id: 'cozy_play_festival_game',
      emoji: '🏮',
      text: 'Play the Town Board challenge once',
      reward: { type: 'decor', id: 'knitted_blanket' },
      available: !playedFestivalToday,
    },
    {
      id: 'cozy_pet_time',
      emoji: '🐾',
      text: 'Spend time with your pet',
      reward: { type: 'memory', id: 'cozy_goal_complete' },
      available: hasPets,
    },
    {
      id: 'cozy_shop_decor',
      emoji: '🧺',
      text: 'Bring home a decor item from the shop',
      reward: { type: 'reputation', amount: 1 },
      available: state?.coins >= minDecorCost && minDecorCost > 0,
    },
  ];

  const availableGoals = candidates.filter((goal) => goal.available);
  const shuffled = stableShuffle(availableGoals, dayKey);
  const desiredCount = Math.min(maxGoals, Math.max(2, shuffled.length));
  return shuffled.slice(0, desiredCount).map(({ available: _avail, ...goal }) => goal);
};

export const isCozyGoalSatisfied = (goal, eventType, eventData = {}, content, state) => {
  if (!goal) return false;
  const season = state?.season?.current || eventData.season;

  switch (goal.id) {
    case 'cozy_harvest_seasonal': {
      if (eventType !== 'crop_harvested') return false;
      if (eventData.season && eventData.season === season) return true;
      const crop = content?.cropsById?.[eventData.cropId];
      return crop?.seasonTags?.includes(season) || false;
    }
    case 'cozy_place_seasonal_decor': {
      if (eventType !== 'decoration_placed') return false;
      const decor = content?.decorById?.[eventData.decorationId];
      return decor?.seasonTags?.includes(season) || false;
    }
    case 'cozy_play_festival_game':
      return eventType === 'festival_game_played';
    case 'cozy_pet_time':
      return eventType === 'pet_cared';
    case 'cozy_shop_decor':
      return eventType === 'shop_decor_purchase';
    default:
      return false;
  }
};

export const getCozyGoalRewardLabel = (goal, content) => {
  const reward = goal?.reward;
  if (!reward) return 'Reward granted';
  if (reward.type === 'reputation') return `+${reward.amount || 0} rep`;
  if (reward.type === 'almanac') return 'New Almanac page';
  if (reward.type === 'memory') return 'New scrapbook memory';
  if (reward.type === 'decor') {
    const decorName = content?.decorById?.[reward.id]?.name || 'Decor token';
    return `+${decorName}`;
  }
  return 'Reward granted';
};

export default buildCozyGoals;
