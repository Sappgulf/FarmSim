import { CROP_DATA } from './cropData';
import { getMarketBonusMultiplier } from './marketData';
import { getNextTownTier } from './townData';
import { getCozyWeatherType } from './cozyWeather';
import { DEFAULT_PHILOSOPHY, getPhilosophyById } from './identityData';

const buildWeatherTip = (cozyWeather) => {
  switch (cozyWeather) {
    case 'rain':
      return 'Rain keeps plots watered — plant extra without extra watering.';
    case 'heatwave':
      return 'Heatwave boosts warmth — keep thirsty plots topped up.';
    case 'cloudy':
      return 'Cloudy skies are gentle — steady planting day.';
    case 'snow':
      return 'Snowy calm slows growth — focus on upkeep and planning.';
    default:
      return 'Clear skies keep growth steady and cozy.';
  }
};

const buildSeasonTip = (seasonConfig) => {
  if (!seasonConfig?.bonuses?.growthSpeed) return 'Season bonuses are calm and steady.';
  const percent = Math.round((seasonConfig.bonuses.growthSpeed - 1) * 100);
  if (percent > 0) return `${seasonConfig.name} boosts growth by +${percent}% today.`;
  if (percent < 0) return `${seasonConfig.name} slows growth by ${Math.abs(percent)}% — plan ahead.`;
  return `${seasonConfig.name} keeps growth balanced today.`;
};

const buildMarketTip = (marketState) => {
  const cropId = marketState?.dailyFeaturedCrop;
  if (!cropId) return null;
  const crop = CROP_DATA[cropId];
  const bonusMultiplier = getMarketBonusMultiplier(marketState, cropId);
  const percent = Math.round((bonusMultiplier - 1) * 100);
  if (!crop || percent <= 0) {
    return `${crop?.name || 'Featured crop'} is in the spotlight today.`;
  }
  return `${crop.emoji} ${crop.name} sells for +${percent}% today.`;
};

const buildRepTip = (social) => {
  const nextTier = getNextTownTier(social?.reputation || 0);
  if (!nextTier) return null;
  const remaining = Math.max(0, nextTier.minRep - (social?.reputation || 0));
  if (remaining === 0) return null;
  return `Earn ${remaining} rep to reach ${nextTier.name} — harvests and quests help.`;
};

const addPhilosophyTone = (tip, philosophy, type) => {
  if (!tip) return null;
  switch (philosophy.id) {
    case 'nature_first':
      if (type === 'weather') return `Nature’s whisper: ${tip}`;
      if (type === 'season') return `Seasonal rhythm: ${tip}`;
      return tip;
    case 'market_maven':
      if (type === 'market') return `Market watch: ${tip}`;
      if (type === 'rep') return `Town standing: ${tip}`;
      return tip;
    case 'slow_living':
      if (type === 'season') return `Slow living note: ${tip}`;
      return tip;
    default:
      return tip;
  }
};

const buildSlowLivingTip = () => 'Take a quiet moment to decorate or add a scrapbook memory.';

export const buildDailyPlan = (state) => {
  const cozyWeather = getCozyWeatherType(state?.weather);
  const suggestions = [];
  const philosophy = getPhilosophyById(state?.identity?.philosophy || state?.philosophy || DEFAULT_PHILOSOPHY);
  const marketTip = buildMarketTip(state?.market);
  const repTip = buildRepTip(state?.social);
  const weatherTip = buildWeatherTip(cozyWeather);
  const seasonTip = buildSeasonTip(state?.season?.config);

  const tipMap = {
    market: addPhilosophyTone(marketTip, philosophy, 'market'),
    weather: addPhilosophyTone(weatherTip, philosophy, 'weather'),
    rep: addPhilosophyTone(repTip, philosophy, 'rep'),
    season: addPhilosophyTone(seasonTip, philosophy, 'season'),
  };

  const orderByPhilosophy = {
    nature_first: ['weather', 'season', 'market', 'rep'],
    market_maven: ['market', 'rep', 'weather', 'season'],
    slow_living: ['weather', 'season', 'market', 'rep'],
  };

  const order = orderByPhilosophy[philosophy.id] || orderByPhilosophy.nature_first;
  order.forEach((key) => {
    const tip = tipMap[key];
    if (tip) suggestions.push(tip);
  });

  if (philosophy.id === 'slow_living') {
    suggestions.push(buildSlowLivingTip());
  }

  return {
    dayCount: state?.season?.dayCount || 1,
    items: suggestions.slice(0, 3),
  };
};

export default buildDailyPlan;
