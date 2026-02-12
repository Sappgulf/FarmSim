export const BASE_HARVEST_MULTIPLIER = 1.2;

export const getUpgradeCount = (inventory, id) => Number(inventory?.[id] || 0);

export const hasUpgrade = (inventory, id) => getUpgradeCount(inventory, id) > 0;

export const getQualitySeedsMultiplier = (inventory) =>
  hasUpgrade(inventory, 'quality_seeds') ? 1.2 : 1.0;

export const getMarketTerminalMultiplier = (inventory) =>
  hasUpgrade(inventory, 'market_terminal') ? 1.1 : 1.0;

export const getHarvestMultiplier = (inventory) =>
  BASE_HARVEST_MULTIPLIER * getQualitySeedsMultiplier(inventory) * getMarketTerminalMultiplier(inventory);

export const calculateHarvestValue = (baseValue = 10, soilFertility = 1.0, inventory = {}) => {
  const fertility = Number.isFinite(soilFertility) ? soilFertility : 1.0;
  return Math.floor((baseValue || 10) * fertility * getHarvestMultiplier(inventory));
};

export const getWateringBonus = (inventory) =>
  hasUpgrade(inventory, 'watering_can') ? 10 : 0;

export const getCompostRegenMultiplier = (inventory) =>
  hasUpgrade(inventory, 'compost_bin') ? 1.5 : 1.0;

export const getHydroponicsGrowthBonus = (inventory) =>
  hasUpgrade(inventory, 'hydroponics_rack') ? 1.08 : 1.0;

export const getMiniGreenhouseProtection = (inventory) =>
  hasUpgrade(inventory, 'greenhouse') ? 0.25 : 0;

export const getMiniGreenhouseGrowthBonus = (inventory) =>
  hasUpgrade(inventory, 'greenhouse') ? 1.05 : 1.0;

export const getSprinklerConfig = (inventory) =>
  hasUpgrade(inventory, 'sprinkler')
    ? {
      intervalMs: hasUpgrade(inventory, 'rain_collector') ? 10000 : 12000,
      waterAmount: hasUpgrade(inventory, 'rain_collector') ? 10 : 6,
    }
    : null;

export const getSeedCostMultiplier = (inventory) =>
  hasUpgrade(inventory, 'precision_hoe') ? 0.9 : 1.0;

export const getAutoHarvestConfig = (inventory) =>
  hasUpgrade(inventory, 'drone_harvester')
    ? { intervalMs: 15000, maxPlotsPerTick: 2 }
    : null;

export const getPostHarvestFertilityFloor = (inventory) =>
  hasUpgrade(inventory, 'soil_nanites') ? 0.65 : 0.5;

export const getSoilAnalyzerEnabled = (inventory) =>
  hasUpgrade(inventory, 'soil_analyzer');
