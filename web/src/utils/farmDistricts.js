export const FARM_DISTRICTS = {
  homestead: {
    id: 'homestead',
    name: 'Homestead',
    emoji: '🏡',
    shortLabel: 'Homestead',
    description: 'The original farm core.',
    surfaceClassName: 'farm-district--homestead',
    bonuses: {},
  },
  orchard: {
    id: 'orchard',
    name: 'Orchard Rise',
    emoji: '🍎',
    shortLabel: 'Orchard',
    description: 'Fast-growing rows with lighter air and stronger sun.',
    surfaceClassName: 'farm-district--orchard',
    bonuses: {
      growthMultiplier: 1.12,
    },
  },
  waterline: {
    id: 'waterline',
    name: 'Canal Walk',
    emoji: '💧',
    shortLabel: 'Canal',
    description: 'Cool irrigation lanes that lose water more slowly.',
    surfaceClassName: 'farm-district--waterline',
    bonuses: {
      waterDrainMultiplier: 0.65,
    },
  },
  hearth: {
    id: 'hearth',
    name: 'Hearth Garden',
    emoji: '🌿',
    shortLabel: 'Hearth',
    description: 'Protected beds with better soil recovery and calmer crop health.',
    surfaceClassName: 'farm-district--hearth',
    bonuses: {
      fertilityRegenMultiplier: 1.45,
      diseaseRiskMultiplier: 0.82,
    },
  },
  market: {
    id: 'market',
    name: 'Market Row',
    emoji: '🧺',
    shortLabel: 'Market',
    description: 'Showcase plots positioned for stronger selling value.',
    surfaceClassName: 'farm-district--market',
    bonuses: {
      harvestMultiplier: 1.1,
    },
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop Yard',
    emoji: '🛠️',
    shortLabel: 'Workshop',
    description: 'A disciplined utility strip that keeps crops stable under pressure.',
    surfaceClassName: 'farm-district--workshop',
    bonuses: {
      growthMultiplier: 1.05,
      waterDrainMultiplier: 0.82,
      diseaseRiskMultiplier: 0.88,
    },
  },
};

export const getDistrictBonuses = (districtId) => (
  FARM_DISTRICTS[districtId]?.bonuses || {}
);

export const getPlotCoordinate = (index, gridSize = 3) => ({
  row: Math.floor(index / gridSize),
  col: index % gridSize,
});

export const getDistrictIdForPlot = (gridSize = 3, index = 0) => {
  if (gridSize <= 3) return 'homestead';

  const { row, col } = getPlotCoordinate(index, gridSize);

  if (gridSize >= 5 && (row === 2 || col === 2)) {
    return 'workshop';
  }

  const split = gridSize === 4 ? 2 : 2;
  const topHalf = row < split;
  const leftHalf = col < split;

  if (topHalf && leftHalf) return 'orchard';
  if (topHalf && !leftHalf) return 'waterline';
  if (!topHalf && leftHalf) return 'hearth';
  return 'market';
};

export const getDistrictForPlot = (gridSize = 3, index = 0) => {
  const districtId = getDistrictIdForPlot(gridSize, index);
  return FARM_DISTRICTS[districtId] || FARM_DISTRICTS.homestead;
};

export const getUnlockedDistricts = (gridSize = 3) => {
  if (gridSize <= 3) return [FARM_DISTRICTS.homestead];
  const districtIds = ['orchard', 'waterline', 'hearth', 'market'];
  if (gridSize >= 5) {
    districtIds.push('workshop');
  }
  return districtIds.map((id) => FARM_DISTRICTS[id]);
};

export const applyDistrictHarvestBonus = (value = 0, districtId) => {
  const multiplier = getDistrictBonuses(districtId).harvestMultiplier || 1;
  return Math.max(0, Math.floor((Number(value) || 0) * multiplier));
};
