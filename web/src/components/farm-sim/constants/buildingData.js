/**
 * Building Data - Legacy helpers backed by canonical shared content.
 */
import { getContentManager } from '../../../content/ContentManager';

const toLegacyBuilding = (entry) => {
  const costs = Array.isArray(entry.costs) ? entry.costs : [];
  const bonuses = Array.isArray(entry.bonuses) ? entry.bonuses : [];
  const levels = costs.map((cost, index) => ({
    level: index + 1,
    cost,
    benefit: bonuses[index] || '',
    effect: {},
  }));

  return {
    id: entry.id,
    name: entry.name,
    emoji: entry.emoji || entry.icon || '🏗️',
    description: entry.description || '',
    category: entry.category || 'Utility',
    maxLevel: Number(entry.maxLevel || levels.length || 1),
    levels,
  };
};

const loadBuildings = () => {
  const content = getContentManager();
  const items = Array.isArray(content.buildings) ? content.buildings : [];
  return Object.fromEntries(items.map((entry) => [entry.id, toLegacyBuilding(entry)]));
};

export const BUILDINGS = loadBuildings();

export const getBuilding = (buildingId) => {
  return BUILDINGS[buildingId];
};

export const getAllBuildings = () => {
  return Object.values(BUILDINGS);
};

export const getBuildingsByCategory = (category) => {
  return Object.values(BUILDINGS).filter((building) => building.category === category);
};

export const getUpgradeCost = (buildingId, currentLevel) => {
  const building = BUILDINGS[buildingId];
  if (!building) return null;

  const nextLevel = currentLevel + 1;
  if (nextLevel > building.maxLevel) return null;

  return building.levels[nextLevel - 1] || null;
};

export const calculateBuildingValue = (buildings) => {
  return Object.entries(buildings).reduce((total, [buildingId, data]) => {
    const building = BUILDINGS[buildingId];
    if (!building || !data.built) return total;

    const level = data.level || 1;
    let cost = 0;
    for (let i = 0; i < level; i += 1) {
      cost += building.levels[i]?.cost || 0;
    }

    return total + cost;
  }, 0);
};

export const getActiveEffects = (buildings) => {
  const effects = {
    harvest_bonus: 1.0,
    growth_speed: 1.0,
    storage: 0,
    processing_bonus: 1.0,
    water_reduction: 0,
    efficiency: 1.0,
  };

  Object.entries(buildings).forEach(([buildingId, data]) => {
    const building = BUILDINGS[buildingId];
    if (!building || !data.built) return;

    const level = Math.max(1, data.level || 1);
    const levelData = building.levels[level - 1];
    if (!levelData || !levelData.effect) return;

    Object.entries(levelData.effect).forEach(([key, value]) => {
      if (typeof value !== 'number') return;
      if (key.includes('bonus') || key.includes('speed') || key.includes('efficiency')) {
        effects[key] = Math.max(effects[key] || 1, value);
      } else if (key.includes('reduction')) {
        effects[key] = Math.max(effects[key] || 0, value);
      } else {
        effects[key] = (effects[key] || 0) + value;
      }
    });
  });

  return effects;
};

export default BUILDINGS;
