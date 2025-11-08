/**
 * Building Data - Complete building system with upgrades
 */

export const BUILDINGS = {
  barn: {
    id: 'barn',
    name: 'Barn',
    emoji: '🏚️',
    description: 'Increases harvest value',
    category: 'Production',
    maxLevel: 5,
    levels: [
      { level: 1, cost: 200, benefit: '+20% harvest value', effect: { harvest_bonus: 1.2 } },
      { level: 2, cost: 400, benefit: '+35% harvest value', effect: { harvest_bonus: 1.35 } },
      { level: 3, cost: 800, benefit: '+55% harvest value', effect: { harvest_bonus: 1.55 } },
      { level: 4, cost: 1600, benefit: '+80% harvest value', effect: { harvest_bonus: 1.8 } },
      { level: 5, cost: 3200, benefit: '+120% harvest value', effect: { harvest_bonus: 2.2 } },
    ],
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    emoji: '🏠',
    description: 'Faster crop growth and weather protection',
    category: 'Production',
    maxLevel: 5,
    levels: [
      { level: 1, cost: 350, benefit: '+30% growth speed', effect: { growth_speed: 1.3, weather_protection: 0.5 } },
      { level: 2, cost: 700, benefit: '+50% growth speed', effect: { growth_speed: 1.5, weather_protection: 0.7 } },
      { level: 3, cost: 1400, benefit: '+75% growth speed', effect: { growth_speed: 1.75, weather_protection: 0.9 } },
      { level: 4, cost: 2800, benefit: '+110% growth speed', effect: { growth_speed: 2.1, weather_protection: 1.0 } },
      { level: 5, cost: 5600, benefit: '+150% growth speed, full protection', effect: { growth_speed: 2.5, weather_protection: 1.0 } },
    ],
  },
  silo: {
    id: 'silo',
    name: 'Silo',
    emoji: '🗼',
    description: 'Storage and auto-sell capabilities',
    category: 'Storage',
    maxLevel: 4,
    levels: [
      { level: 1, cost: 150, benefit: 'Store 50 items', effect: { storage: 50, auto_sell: false } },
      { level: 2, cost: 300, benefit: 'Store 100 items + auto-sell', effect: { storage: 100, auto_sell: true } },
      { level: 3, cost: 600, benefit: 'Store 200 items + 10% bonus', effect: { storage: 200, auto_sell: true, sell_bonus: 1.1 } },
      { level: 4, cost: 1200, benefit: 'Store 400 items + 25% bonus', effect: { storage: 400, auto_sell: true, sell_bonus: 1.25 } },
    ],
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    emoji: '🔧',
    description: 'Tool crafting and efficiency',
    category: 'Utility',
    maxLevel: 3,
    levels: [
      { level: 1, cost: 250, benefit: 'Basic tools', effect: { tools: ['basic'] } },
      { level: 2, cost: 500, benefit: 'Advanced tools + 10% efficiency', effect: { tools: ['basic', 'advanced'], efficiency: 1.1 } },
      { level: 3, cost: 1000, benefit: 'Master tools + 25% efficiency', effect: { tools: ['basic', 'advanced', 'master'], efficiency: 1.25 } },
    ],
  },
  windmill: {
    id: 'windmill',
    name: 'Windmill',
    emoji: '🏭',
    description: 'Crop processing and value multiplication',
    category: 'Processing',
    maxLevel: 5,
    levels: [
      { level: 1, cost: 400, benefit: 'Process crops +100% value', effect: { processing_bonus: 2.0, capacity: 5 } },
      { level: 2, cost: 800, benefit: 'Process crops +150% value', effect: { processing_bonus: 2.5, capacity: 10 } },
      { level: 3, cost: 1600, benefit: 'Process crops +200% value', effect: { processing_bonus: 3.0, capacity: 20 } },
      { level: 4, cost: 3200, benefit: 'Process crops +300% value', effect: { processing_bonus: 4.0, capacity: 40 } },
      { level: 5, cost: 6400, benefit: 'Process crops +500% value', effect: { processing_bonus: 6.0, capacity: 100 } },
    ],
  },
  well: {
    id: 'well',
    name: 'Water Well',
    emoji: '💧',
    description: 'Reduces water needs and costs',
    category: 'Utility',
    maxLevel: 4,
    levels: [
      { level: 1, cost: 180, benefit: '-25% water needs', effect: { water_reduction: 0.25 } },
      { level: 2, cost: 360, benefit: '-50% water needs', effect: { water_reduction: 0.5 } },
      { level: 3, cost: 720, benefit: '-75% water needs + auto-water', effect: { water_reduction: 0.75, auto_water: true } },
      { level: 4, cost: 1440, benefit: 'No water needed + growth boost', effect: { water_reduction: 1.0, auto_water: true, growth_bonus: 1.1 } },
    ],
  },
};

/**
 * Get building data by ID
 */
export const getBuilding = (buildingId) => {
  return BUILDINGS[buildingId];
};

/**
 * Get all buildings as an array
 */
export const getAllBuildings = () => {
  return Object.values(BUILDINGS);
};

/**
 * Get buildings by category
 */
export const getBuildingsByCategory = (category) => {
  return Object.values(BUILDINGS).filter(b => b.category === category);
};

/**
 * Get upgrade cost for a building at a specific level
 */
export const getUpgradeCost = (buildingId, currentLevel) => {
  const building = BUILDINGS[buildingId];
  if (!building) return null;
  
  const nextLevel = currentLevel + 1;
  if (nextLevel > building.maxLevel) return null;
  
  return building.levels[nextLevel - 1];
};

/**
 * Calculate total building value
 */
export const calculateBuildingValue = (buildings) => {
  return Object.entries(buildings).reduce((total, [buildingId, data]) => {
    const building = BUILDINGS[buildingId];
    if (!building || !data.built) return total;
    
    const level = data.level || 1;
    let cost = 0;
    for (let i = 0; i < level; i++) {
      cost += building.levels[i].cost;
    }
    
    return total + cost;
  }, 0);
};

/**
 * Get active building effects
 */
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
    
    const level = data.level || 1;
    const levelData = building.levels[level - 1];
    
    if (levelData.effect) {
      Object.entries(levelData.effect).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (key.includes('bonus') || key.includes('speed') || key.includes('efficiency')) {
            effects[key] = Math.max(effects[key], value);
          } else if (key.includes('reduction')) {
            effects[key] = Math.max(effects[key], value);
          } else {
            effects[key] += value;
          }
        }
      });
    }
  });
  
  return effects;
};

export default BUILDINGS;

