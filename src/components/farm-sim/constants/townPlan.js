import { CROP_DATA } from './cropData';
import { getMarketBonusMultiplier } from './marketData';
import { getNextTownTier } from './townData';
import { getCozyWeatherType } from './cozyWeather';

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

export const buildDailyPlan = (state) => {
  const cozyWeather = getCozyWeatherType(state?.weather);
  const suggestions = [];
  const marketTip = buildMarketTip(state?.market);
  const repTip = buildRepTip(state?.social);

  if (marketTip) suggestions.push(marketTip);
  suggestions.push(buildWeatherTip(cozyWeather));
  if (repTip) suggestions.push(repTip);
  if (suggestions.length < 3) {
    suggestions.push(buildSeasonTip(state?.season?.config));
  }

  return {
    dayCount: state?.season?.dayCount || 1,
    items: suggestions.slice(0, 3),
  };
};

export default buildDailyPlan;
