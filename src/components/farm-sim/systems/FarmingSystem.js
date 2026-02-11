import {
  getAutoHarvestConfig,
  calculateHarvestValue,
  getCompostRegenMultiplier,
  getHydroponicsGrowthBonus,
  getMiniGreenhouseGrowthBonus,
  getPostHarvestFertilityFloor,
  getSeedCostMultiplier,
  getSprinklerConfig,
  getWateringBonus,
} from '../../../utils/farmUpgrades';
import { isDevelopmentMode } from '../../../config/release';
import { getDifficultyModifier } from './progression';

/**
 * Farming System - Handles crop growth, planting, harvesting
 * SIMPLIFIED AND FIXED - Growth calculated from timestamp, no complex timing
 * 
 * @class FarmingSystem
 */
export class FarmingSystem {
  /**
   * Creates a new FarmingSystem instance
   * @param {Object|null} gameState - Current game state (can be null initially)
   * @param {Object} gameActions - Game action dispatchers
   */
  constructor(gameState, gameActions) {
    this.gameState = gameState; // Can be null initially
    this.actions = gameActions;
    this.lastFertilityUpdate = 0;
    this.lastSprinklerWater = 0;
    this.lastAutoHarvestTick = 0;
    // PERF: timestamp-based growth doesn't require high-frequency React state writes.
    // Throttle expensive full-plot scans to reduce CPU and GC pressure.
    this.lastGrowthUpdate = 0;
    this.lastWitherCheck = 0;
  }

  /**
   * Updates farming system state (called by game loop)
   * @param {Object} currentState - Current game state
   */
  update(currentState) {
    // Update our reference to current state
    if (!currentState) {
      console.error('[farm] FarmingSystem: update() called with null/undefined state');
      return;
    }

    this.gameState = currentState;

    // Safety check - don't update if no state or no plots
    if (!this.gameState.plots || !Array.isArray(this.gameState.plots)) {
      console.error('[farm] FarmingSystem: No plots array in gameState');
      return;
    }

    // Update crop growth - NO THROTTLING, just calculate from timestamp
    this.updateCropGrowth();

    // Check for withered crops
    this.checkWitheredCrops();

    // Update soil fertility slowly
    this.updateSoilFertility();

    // Apply sprinkler automation (if owned)
    this.applySprinklerAutoWater();

    // Apply optional auto-harvest automation (if owned)
    this.applyAutoHarvest();
  }

  /**
   * Updates crop growth progress based on timestamps
   * @private
   */
  updateCropGrowth() {
    // Safety check
    if (!this.gameState || !this.gameState.plots || !Array.isArray(this.gameState.plots)) {
      console.error('[farm] FarmingSystem: updateCropGrowth - Invalid gameState');
      return;
    }

    const now = Date.now();

    // PERF: Throttle growth scans (UI doesn't benefit from 10Hz state churn).
    // Keep this low enough for short crops, but high enough to reduce work.
    if (this.lastGrowthUpdate && (now - this.lastGrowthUpdate < 250)) {
      return;
    }
    this.lastGrowthUpdate = now;

    // PERF: Early exit if no crops are growing (big win for idle farms)
    let growingCount = 0;
    for (let i = 0; i < this.gameState.plots.length; i++) {
      const state = this.gameState.plots[i]?.state;
      if (state === 'planted' || state === 'growing') {
        growingCount += 1;
      }
    }
    if (growingCount === 0) {
      return; // Nothing to update - skip expensive iteration
    }

    if (isDevelopmentMode()) {
      console.debug('[farm]', `Updating ${growingCount} growing crops`);
    }

    let hasChanges = false;
    const weather = this.gameState.weather || 'sunny';
    const weatherEffects = {
      sunny: { growthModifier: 1.2 },
      rainy: { growthModifier: 1.1 },
      cloudy: { growthModifier: 1.0 },
      stormy: { growthModifier: 0.8 },
      drought: { growthModifier: 0.6 },
      snow: { growthModifier: 0.3 },
      windy: { growthModifier: 0.9 }
    };
    const currentWeatherEffects = weatherEffects[weather] || weatherEffects.sunny;
    const weatherModifier = currentWeatherEffects.growthModifier;
    const seasonBonus = this.gameState.season?.config?.bonuses?.growthSpeed || 1.0;
    const inventory = this.gameState.inventory || {};
    const greenhouseGrowthBonus = getMiniGreenhouseGrowthBonus(inventory);
    const hydroponicsGrowthBonus = getHydroponicsGrowthBonus(inventory);

    // PERF: copy-on-write; avoid allocating a full array unless something changes.
    let updatedPlots = null;
    const plots = this.gameState.plots;
    for (let i = 0; i < plots.length; i++) {
      const plot = plots[i];
      if (!plot) continue;
      if (plot.state !== 'planted' && plot.state !== 'growing') continue;
      if (!plot.crop || !plot.plantedAt) continue;

      // Calculate progress from timestamp (NO deltaTime issues!)
      const timeSincePlanted = (now - plot.plantedAt) / 1000; // seconds
      const baseGrowthTime = plot.crop.growthTime || 10;
      const plotWeatherModifier = plot.weatherModifier || weatherModifier;
      const growthBoost = plot.growthBoost || 1;
      const level = this.gameState.level || 1;
      const difficulty = getDifficultyModifier(level);
      const effectiveGrowthTime =
        (baseGrowthTime * difficulty.growthTime) /
        (plotWeatherModifier * seasonBonus * greenhouseGrowthBonus * hydroponicsGrowthBonus * growthBoost);

      // Crop rotation bonus: +5% growth speed per unique predecessor in last 3 crops
      const rotationHistory = Array.isArray(plot.rotationHistory) ? plot.rotationHistory : [];
      const predecessors = rotationHistory.slice(0, -1); // exclude current crop (last entry)
      const uniquePredecessors = new Set(predecessors.filter((id) => id !== (plot.crop.id || ''))).size;
      const rotationBonus = 1 + (uniquePredecessors * 0.05); // +5% per unique, max +15%
      const rotatedGrowthTime = effectiveGrowthTime / rotationBonus;

      const progress = Math.min(1.0, timeSincePlanted / rotatedGrowthTime);

      // Calculate growth stage
      const totalStages = plot.crop.stages || 3;
      const currentStage = Math.min(totalStages, Math.floor(progress * totalStages) + 1);

      let nextPlot = null;

      // Check if ready to harvest - use a more lenient threshold
      if (progress >= 0.90) {
        if (isDevelopmentMode()) {
          console.debug('[farm]', `🌾 ${plot.crop.name} ready`, {
            progress,
            timeSince: timeSincePlanted.toFixed(1),
            effective: effectiveGrowthTime.toFixed(1),
          });
        }
        nextPlot = {
          ...plot,
          state: 'ready',
          growthStage: totalStages,
          progress: 1.0,
          readyAt: now,
        };
      } else {
        const prevStage = plot.growthStage || 1;
        const stageChanged = currentStage !== prevStage;
        // PERF: avoid per-tick progress writes; only update on stage boundaries
        // (or initial transition from planted -> growing).
        const shouldUpdate = stageChanged || plot.state !== 'growing';

        if (shouldUpdate) {
          if (Math.random() < 0.01) { // Log 1% of the time
            if (isDevelopmentMode()) {
              console.debug(
                '[farm]',
                `🌱 ${plot.crop.name} growing: ${(progress * 100).toFixed(1)}%, stage ${currentStage}/${totalStages}, water=${plot.waterLevel}`
              );
            }
          }
          nextPlot = {
            ...plot,
            state: 'growing',
            growthStage: currentStage,
            progress,
          };
        }
      }

      if (nextPlot) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlots[i] = nextPlot;
        hasChanges = true;
      }
    }

    // Update if any crops are growing
    // React 18+ automatically batches state updates, so no manual batching needed
    if (hasChanges) {
      this.actions.updatePlots(updatedPlots || plots);
    }
  }

  checkWitheredCrops() {
    // Safety check
    if (!this.gameState || !this.gameState.plots || !Array.isArray(this.gameState.plots)) {
      return;
    }

    const now = Date.now();
    // PERF: wither/overripe checks don't need to run at high frequency.
    if (this.lastWitherCheck && (now - this.lastWitherCheck < 1000)) {
      return;
    }
    this.lastWitherCheck = now;
    const HARVEST_WINDOW = 45000; // 45 seconds to harvest after ready

    const plots = this.gameState.plots;
    let updatedPlots = null;
    for (let i = 0; i < plots.length; i++) {
      const plot = plots[i];
      if (!plot) continue;
      if (plot.state === 'empty' || plot.state === 'withered' || plot.state === 'decor') continue;

      let nextPlot = null;

      // Check water level - growing crops wither if no water
      if ((plot.waterLevel || 0) <= 0 && (plot.state === 'growing' || plot.state === 'planted')) {
        nextPlot = {
          ...plot,
          state: 'withered',
          witheredAt: now,
          witherReason: 'no_water',
        };
      }

      // Check if ready crops are overripe (harvest window expired)
      if (!nextPlot && plot.state === 'ready' && plot.readyAt) {
        const timeSinceReady = now - plot.readyAt;
        if (timeSinceReady > HARVEST_WINDOW) {
          nextPlot = {
            ...plot,
            state: 'withered',
            witheredAt: now,
            witherReason: 'overripe',
          };
        }
      }

      if (nextPlot) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlots[i] = nextPlot;
      }
    }

    if (updatedPlots) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  updateSoilFertility() {
    // Safety check
    if (!this.gameState || !this.gameState.plots || !Array.isArray(this.gameState.plots)) {
      return;
    }

    const now = Date.now();
    const FERTILITY_UPDATE_INTERVAL_MS = 5000;
    if (!this.lastFertilityUpdate) {
      this.lastFertilityUpdate = now;
      return;
    }
    const elapsedMs = now - this.lastFertilityUpdate;
    if (elapsedMs < FERTILITY_UPDATE_INTERVAL_MS) {
      return;
    }
    this.lastFertilityUpdate = now;

    const inventory = this.gameState.inventory || {};
    const regenMultiplier = getCompostRegenMultiplier(inventory);
    const regenAmount = 0.0005 * (elapsedMs / 100) * regenMultiplier;

    // Slowly regenerate soil fertility
    const updatedPlots = this.gameState.plots.map(plot => {
      if (plot.soilFertility < 1.0) {
        return {
          ...plot,
          soilFertility: Math.min(1.0, (plot.soilFertility || 1.0) + regenAmount)
        };
      }
      return plot;
    });

    // Only update if something changed
    if (updatedPlots.some((plot, index) =>
      plot.soilFertility !== this.gameState.plots[index].soilFertility
    )) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  /**
   * Plants a crop in the specified plot
   * @param {number} plotIndex - Index of the plot to plant in
   * @param {Object} cropData - Crop data object with id, name, growthTime, etc.
   * @returns {boolean} True if planting succeeded
   */
  plantCrop(plotIndex, cropData) {
    // Safety checks
    if (!cropData || !this.gameState || !this.gameState.plots || plotIndex < 0 || plotIndex >= this.gameState.plots.length) {
      return false;
    }

    const plot = this.gameState.plots[plotIndex];
    if (plot.state !== 'empty') {
      return false; // Can't plant in non-empty plot
    }

    const seedMultiplier = getSeedCostMultiplier(this.gameState.inventory);
    const cost = Math.max(1, Math.floor((cropData.cost || 0) * seedMultiplier));
    if (this.gameState.coins < cost) {
      return false; // Can't afford
    }

    // Deduct cost
    this.actions.spendMoney(cost);

    // Plant crop — record rotation history for diversity bonus
    const plantedAt = Date.now();
    const shouldBoostFirstCrop = !this.gameState.memoryFlags?.first_seed && !this.gameState.onboardingSkipped;
    const updatedPlots = [...this.gameState.plots];
    const fertilityFloor = getPostHarvestFertilityFloor(this.gameState.inventory);

    // Build rotation history: keep last 3 crops planted on this plot
    const prevHistory = Array.isArray(plot.rotationHistory) ? plot.rotationHistory : [];
    const newRotationHistory = [...prevHistory, cropData.id].slice(-3);

    updatedPlots[plotIndex] = {
      ...plot,
      crop: cropData,
      state: 'planted',
      plantedAt: plantedAt,
      growthStage: 1,
      progress: 0,
      waterLevel: 85, // Start with ample water for growth
      soilFertility: plot.soilFertility || 1.0,
      weatherModifier: 1.0,
      rotationHistory: newRotationHistory,
      ...(shouldBoostFirstCrop ? { growthBoost: 1.5 } : {}),
    };

    if (isDevelopmentMode()) {
      const uniquePast = new Set(prevHistory.filter(id => id !== cropData.id)).size;
      console.debug('[farm]', `Planted ${cropData.name}`, { plotIndex, growthTime: cropData.growthTime, rotationUnique: uniquePast });
    }

    this.actions.updatePlots(updatedPlots);
    this.actions.addXP(1, { source: 'planting', label: 'Plant Crop' });

    return true;
  }

  /**
   * Harvests a crop from the specified plot
   * @param {number} plotIndex - Index of the plot to harvest
   * @returns {boolean} True if harvest succeeded
   */
  harvestCrop(plotIndex) {
    // Safety checks
    if (!this.gameState || !this.gameState.plots || plotIndex < 0 || plotIndex >= this.gameState.plots.length) {
      return false;
    }

    const plot = this.gameState.plots[plotIndex];
    if (plot.state !== 'ready') {
      return false; // Can only harvest ready crops
    }

    const crop = plot.crop;
    if (!crop) {
      return false;
    }

    // Calculate harvest value with soil fertility bonus
    const baseValue = crop.baseValue || 10;
    const soilMultiplier = plot.soilFertility || 1.0;
    const harvestValue = calculateHarvestValue(baseValue, soilMultiplier, this.gameState.inventory);

    // Update coins and XP
    // Add coins and XP for harvest
    this.actions.earnMoney(harvestValue, 'harvest');
    // REBALANCED: Consistent 15% XP rate across all harvest methods
    this.actions.addXP(Math.floor(harvestValue * 0.15), { source: 'harvest', cropId: crop.id, label: `Harvest ${crop.name}` });

    // Update inventory
    const updatedInventory = {
      ...this.gameState.inventory,
      [crop.id]: (this.gameState.inventory[crop.id] || 0) + 1
    };
    this.actions.updateInventory(updatedInventory);

    // Clear plot and reduce fertility
    const updatedPlots = [...this.gameState.plots];
    const fertilityFloor = getPostHarvestFertilityFloor(this.gameState.inventory);
    updatedPlots[plotIndex] = {
      ...plot,
      crop: null,
      state: 'empty',
      plantedAt: null,
      harvestedAt: Date.now(),
      readyAt: null,
      growthStage: 0,
      progress: 0,
      soilFertility: Math.max(fertilityFloor, (plot.soilFertility || 1.0) - 0.1),
      waterLevel: 50,
    };

    this.actions.updatePlots(updatedPlots);

    return true;
  }

  // Water a plot
  waterPlot(plotIndex) {
    // Safety checks
    if (!this.gameState || !this.gameState.plots || plotIndex < 0 || plotIndex >= this.gameState.plots.length) {
      return;
    }

    const updatedPlots = [...this.gameState.plots];
    updatedPlots[plotIndex] = {
      ...updatedPlots[plotIndex],
      waterLevel: Math.min(100, (updatedPlots[plotIndex].waterLevel || 0) + 25 + getWateringBonus(this.gameState.inventory))
    };

    this.actions.updatePlots(updatedPlots);
  }

  // Water all plots
  waterAll() {
    // Safety checks
    if (!this.gameState || !this.gameState.plots) {
      return;
    }

    const waterBonus = getWateringBonus(this.gameState.inventory);
    const updatedPlots = this.gameState.plots.map(plot => ({
      ...plot,
      waterLevel: Math.min(100, (plot.waterLevel || 0) + 25 + waterBonus)
    }));

    this.actions.updatePlots(updatedPlots);
  }

  // Fertilize a plot
  fertilizePlot(plotIndex) {
    // Safety checks
    if (!this.gameState || !this.gameState.plots || plotIndex < 0 || plotIndex >= this.gameState.plots.length) {
      return;
    }

    const cost = 15; // Slightly more expensive
    if (this.gameState.coins < cost) {
      return;
    }

    this.actions.spendMoney(cost);

    const updatedPlots = [...this.gameState.plots];
    updatedPlots[plotIndex] = {
      ...updatedPlots[plotIndex],
      soilFertility: Math.min(1.5, (updatedPlots[plotIndex].soilFertility || 1.0) + 0.3),
      waterLevel: Math.min(100, (updatedPlots[plotIndex].waterLevel || 0) + 10), // Fertilizer helps water retention
      fertilizer: (updatedPlots[plotIndex].fertilizer || 0) + 1
    };

    this.actions.updatePlots(updatedPlots);
  }

  applySprinklerAutoWater() {
    if (!this.gameState || !Array.isArray(this.gameState.plots)) {
      return;
    }
    const config = getSprinklerConfig(this.gameState.inventory);
    if (!config) {
      return;
    }
    const now = Date.now();
    if (!this.lastSprinklerWater) {
      this.lastSprinklerWater = now;
      return;
    }
    if (now - this.lastSprinklerWater < config.intervalMs) {
      return;
    }
    this.lastSprinklerWater = now;

    let hasChanges = false;
    const updatedPlots = this.gameState.plots.map((plot) => {
      if (!plot || (plot.state !== 'planted' && plot.state !== 'growing')) {
        return plot;
      }
      const nextWater = Math.min(100, (plot.waterLevel || 0) + config.waterAmount);
      if (nextWater === plot.waterLevel) {
        return plot;
      }
      hasChanges = true;
      return {
        ...plot,
        waterLevel: nextWater,
      };
    });

    if (hasChanges) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  applyAutoHarvest() {
    if (!this.gameState || !Array.isArray(this.gameState.plots)) {
      return;
    }

    const config = getAutoHarvestConfig(this.gameState.inventory);
    if (!config) {
      return;
    }

    const now = Date.now();
    if (!this.lastAutoHarvestTick) {
      this.lastAutoHarvestTick = now;
      return;
    }

    if (now - this.lastAutoHarvestTick < config.intervalMs) {
      return;
    }
    this.lastAutoHarvestTick = now;

    let harvestedCount = 0;
    for (let index = 0; index < this.gameState.plots.length; index += 1) {
      if (harvestedCount >= config.maxPlotsPerTick) {
        break;
      }
      if (this.gameState.plots[index]?.state === 'ready') {
        const harvested = this.harvestCrop(index);
        if (harvested) {
          harvestedCount += 1;
        }
      }
    }

    if (harvestedCount > 0) {
      this.actions.addNotification?.({
        message: `🤖 Drone Harvester collected ${harvestedCount} crop${harvestedCount > 1 ? 's' : ''}.`,
        type: 'success',
      });
    }
  }
}
