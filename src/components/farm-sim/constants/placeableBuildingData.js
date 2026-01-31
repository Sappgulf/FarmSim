const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const PLACEABLE_BUILDINGS = [
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    emoji: '🏠',
    description: 'Covers nearby plots to soften season penalties and boost growth.',
    coverage: { type: 'radius', radius: 1 },
    effects: {
      growthBonus: 1.1,
      seasonFloor: 1.0,
    },
  },
  {
    id: 'well',
    name: 'Water Well',
    emoji: '💧',
    description: 'Auto-waters nearby plots each morning.',
    coverage: { type: 'radius', radius: 1 },
    effects: {
      waterAmount: 35,
      maxPlots: 3,
    },
  },
  {
    id: 'barn',
    name: 'Barn',
    emoji: '🏚️',
    description: 'Reduces soil fatigue on nearby harvests.',
    coverage: { type: 'radius', radius: 1 },
    effects: {
      fertilityLossMultiplier: 0.6,
    },
  },
];

export const PLACEABLE_BUILDING_LOOKUP = PLACEABLE_BUILDINGS.reduce((acc, building) => {
  acc[building.id] = building;
  return acc;
}, {});

export const getPlaceableBuilding = (buildingId) => PLACEABLE_BUILDING_LOOKUP[buildingId] || null;

export const getCoverageIndices = ({ x, y }, gridSize, coverage) => {
  if (!coverage || !Number.isInteger(gridSize) || gridSize <= 0) return [];
  const indices = [];
  const radius = coverage.type === 'radius' ? clamp(coverage.radius || 0, 0, gridSize) : 0;
  const startX = clamp(x - radius, 0, gridSize - 1);
  const endX = clamp(x + radius, 0, gridSize - 1);
  const startY = clamp(y - radius, 0, gridSize - 1);
  const endY = clamp(y + radius, 0, gridSize - 1);

  for (let row = startY; row <= endY; row += 1) {
    for (let col = startX; col <= endX; col += 1) {
      indices.push(row * gridSize + col);
    }
  }

  return indices;
};

export const buildBuildingCoverageMap = (placements, gridSize) => {
  const coverageByBuilding = {};
  PLACEABLE_BUILDINGS.forEach((building) => {
    coverageByBuilding[building.id] = new Set();
  });

  if (!Array.isArray(placements)) return coverageByBuilding;

  placements.forEach((placement) => {
    if (!placement || !Number.isInteger(placement.x) || !Number.isInteger(placement.y)) return;
    const building = PLACEABLE_BUILDING_LOOKUP[placement.id];
    if (!building) return;
    const indices = getCoverageIndices(placement, gridSize, building.coverage);
    indices.forEach((index) => coverageByBuilding[building.id].add(index));
  });

  return coverageByBuilding;
};

export const getPlacementKey = (x, y) => `${x}-${y}`;
