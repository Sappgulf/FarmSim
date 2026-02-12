import { getCropsByLevel } from '../components/farm-sim/constants/cropData';

export const getPlotCounts = (plots = []) => {
  const counts = { active: 0, ready: 0, empty: 0 };
  plots.forEach((plot) => {
    if (!plot) return;
    if (plot.state === 'ready') counts.ready += 1;
    if (plot.state === 'empty') counts.empty += 1;
    if (plot.state !== 'empty') counts.active += 1;
  });
  return counts;
};

export const getMinSeedCost = (level = 1) => {
  const crops = getCropsByLevel(level) || [];
  const costs = crops.map((crop) => Number(crop.cost) || 0).filter((cost) => cost > 0);
  if (!costs.length) return 10;
  return Math.max(1, Math.min(...costs));
};

const hasBuiltStructures = ({ hasBuiltStructure, builtBuildings, buildings }) => {
  if (typeof hasBuiltStructure === 'boolean') return hasBuiltStructure;
  if (Number.isFinite(Number(builtBuildings))) return Number(builtBuildings) > 0;
  return Object.values(buildings || {}).some((building) => building?.built);
};

export const getNextGoalFromCounts = ({
  ready = 0,
  empty = 0,
  active = 0,
  coins = 0,
  level = 1,
  buildings = {},
  builtBuildings,
  hasBuiltStructure,
} = {}) => {
  const minSeedCost = getMinSeedCost(level);
  const hasBuiltAnyStructure = hasBuiltStructures({ hasBuiltStructure, builtBuildings, buildings });

  if (ready > 0) {
    return { id: 'harvest', text: `Harvest ${ready} crop${ready > 1 ? 's' : ''}`, emoji: '🌾' };
  }
  if (empty > 0 && coins >= minSeedCost) {
    return { id: 'plant', text: `Plant ${Math.min(empty, 3)} seed${empty > 1 ? 's' : ''}`, emoji: '🌱' };
  }
  if (active > 0) {
    return { id: 'wait', text: 'Let crops grow a little longer', emoji: '⏳' };
  }
  if (level >= 2 && !hasBuiltAnyStructure) {
    return { id: 'build', text: 'Build your first structure', emoji: '🏠' };
  }
  if (coins < minSeedCost) {
    return { id: 'earn', text: `Earn ${minSeedCost - (coins || 0)}🪙 for seeds`, emoji: '💰' };
  }
  return { id: 'explore', text: 'Explore your farm', emoji: '🚜' };
};

export const getNextGoal = (state) => {
  const plots = Array.isArray(state?.plots) ? state.plots : [];
  const { active, ready, empty } = getPlotCounts(plots);
  return getNextGoalFromCounts({
    ready,
    empty,
    active,
    coins: state?.coins || 0,
    level: state?.level || 1,
    buildings: state?.buildings || {},
  });
};

export const getPlanSuggestions = (state, maxSuggestions = 2) => {
  const plots = Array.isArray(state?.plots) ? state.plots : [];
  const { ready, empty } = getPlotCounts(plots);
  const minSeedCost = getMinSeedCost(state?.level || 1);
  const primary = getNextGoal(state);
  const suggestions = [primary];

  if (suggestions.length >= maxSuggestions) return suggestions;

  if (primary.id !== 'harvest' && ready > 0) {
    suggestions.push({ id: 'harvest', text: `Harvest ${ready} crop${ready > 1 ? 's' : ''}`, emoji: '🌾' });
    return suggestions.slice(0, maxSuggestions);
  }

  if (primary.id !== 'plant' && empty > 0 && state?.coins >= minSeedCost) {
    suggestions.push({ id: 'plant', text: `Plant ${Math.min(empty, 2)} seed${empty > 1 ? 's' : ''}`, emoji: '🌱' });
    return suggestions.slice(0, maxSuggestions);
  }

  if (state?.coins >= 5) {
    suggestions.push({ id: 'shop', text: 'Peek at the Shop for quick boosts', emoji: '🛒' });
  } else {
    suggestions.push({ id: 'board', text: 'Check the Town Board for today’s insight', emoji: '📌' });
  }

  return suggestions.slice(0, maxSuggestions);
};

export default getNextGoal;
