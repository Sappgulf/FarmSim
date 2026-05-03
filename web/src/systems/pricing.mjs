import { MARKET_TRENDS } from '../config/economy.mjs';

export function getMarketPrice({ rules, seedType, marketTrends, currentSeason, skills }) {
  const base = rules.seeds[seedType].baseValue;
  const trendKey = marketTrends[seedType] || 'normal';
  const trendMultiplier = MARKET_TRENDS[trendKey]?.multiplier ?? 1;
  const seasonBonus = rules.seeds[seedType].season === currentSeason ? 1.2 : 1.0;
  const skillBonus = 1 + (skills.valueBoost || 0);
  return Math.round(base * trendMultiplier * seasonBonus * skillBonus);
}
