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

    if (import.meta.env.MODE === 'development') {
      console.debug('[farm]', `Updating ${growingCount} growing crops`);
    }

    let hasChanges = false;
    const now = Date.now();
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

    const updatedPlots = this.gameState.plots.map(plot => {
      // Safety check for invalid plot
      if (!plot) {
        return plot;
      }

      // Skip if not planted or growing
      if (plot.state !== 'planted' && plot.state !== 'growing') {
        return plot;
      }

      // Skip if no crop data
      if (!plot.crop || !plot.plantedAt) {
        return plot;
      }

      // Calculate progress from timestamp (NO deltaTime issues!)
      const timeSincePlanted = (now - plot.plantedAt) / 1000; // seconds
      const baseGrowthTime = plot.crop.growthTime || 10;
      const effectiveGrowthTime = baseGrowthTime / (weatherModifier * seasonBonus);
      const progress = Math.min(1.0, timeSincePlanted / effectiveGrowthTime);


      // Calculate growth stage
      const totalStages = plot.crop.stages || 3;
      const currentStage = Math.min(totalStages, Math.floor(progress * totalStages) + 1);

      // Check if ready to harvest - use a more lenient threshold
      if (progress >= 0.90) {
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm]', `🌾 ${plot.crop.name} ready`, { progress, timeSince: timeSincePlanted.toFixed(1), effective: effectiveGrowthTime.toFixed(1) });
        }
        hasChanges = true;
        return {
          ...plot,
          state: 'ready',
          growthStage: totalStages,
          progress: 1.0,
          readyAt: now
        };
      }

      const prevProgress = plot.progress || 0;
      const prevStage = plot.growthStage || 1;
      const stageChanged = currentStage !== prevStage;
      const progressDelta = Math.abs(progress - prevProgress);
      const shouldUpdate = stageChanged || progressDelta >= 0.01 || plot.state !== 'growing';

      // Still growing - update progress only when something meaningful changed
      if (shouldUpdate) {
        if (Math.random() < 0.01) { // Log 1% of the time
          if (import.meta.env.MODE === 'development') {
            console.debug('[farm]', `🌱 ${plot.crop.name} growing: ${(progress * 100).toFixed(1)}%, stage ${currentStage}/${totalStages}, water=${plot.waterLevel}`);
          }
        }
        hasChanges = true;
        return {
          ...plot,
          state: 'growing',
          growthStage: currentStage,
          progress: progress
        };
      }

      return plot;
    });

    // Update if any crops are growing
    // React 18+ automatically batches state updates, so no manual batching needed
    if (hasChanges) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  checkWitheredCrops() {
    // Safety check
    if (!this.gameState || !this.gameState.plots || !Array.isArray(this.gameState.plots)) {
      return;
    }

    const now = Date.now();
    const HARVEST_WINDOW = 45000; // 45 seconds to harvest after ready

    const updatedPlots = this.gameState.plots.map(plot => {
      if (plot.state === 'empty' || plot.state === 'withered' || plot.state === 'decor') return plot;

      // Check water level - growing crops wither if no water
      if ((plot.waterLevel || 0) <= 0 && (plot.state === 'growing' || plot.state === 'planted')) {
        return {
          ...plot,
          state: 'withered',
          witheredAt: now,
          witherReason: 'no_water'
        };
      }

      // Check if ready crops are overripe (harvest window expired)
      if (plot.state === 'ready' && plot.readyAt) {
        const timeSinceReady = now - plot.readyAt;
        if (timeSinceReady > HARVEST_WINDOW) {
          return {
            ...plot,
            state: 'withered',
            witheredAt: now,
            witherReason: 'overripe'
          };
        }
      }

      return plot;
    });

    // Only update if something changed
    if (updatedPlots.some((plot, index) => plot.state !== this.gameState.plots[index].state)) {
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

    const regenAmount = 0.0005 * (elapsedMs / 100);

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

    const cost = cropData.cost || 0;
    if (this.gameState.coins < cost) {
      return false; // Can't afford
    }

    // Deduct cost
    this.actions.setCoins(this.gameState.coins - cost);

    // Plant crop
    const plantedAt = Date.now();
    const updatedPlots = [...this.gameState.plots];
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
    };

    if (import.meta.env.MODE === 'development') {
      console.debug('[farm]', `Planted ${cropData.name}`, { plotIndex, growthTime: cropData.growthTime });
    }

    this.actions.updatePlots(updatedPlots);
    this.actions.setXp(this.gameState.xp + 1); // Small XP for planting

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
    const harvestValue = Math.floor(baseValue * soilMultiplier);

    // Update coins and XP
    // Add coins and XP for harvest
    this.actions.setCoins(this.gameState.coins + harvestValue);
    // REBALANCED: Consistent 15% XP rate across all harvest methods
    this.actions.setXp(this.gameState.xp + Math.floor(harvestValue * 0.15));

    // Update inventory
    const updatedInventory = {
      ...this.gameState.inventory,
      [crop.id]: (this.gameState.inventory[crop.id] || 0) + 1
    };
    this.actions.updateInventory(updatedInventory);

    // Clear plot and reduce fertility
    const updatedPlots = [...this.gameState.plots];
    updatedPlots[plotIndex] = {
      ...plot,
      crop: null,
      state: 'empty',
      plantedAt: null,
      harvestedAt: Date.now(),
      readyAt: null,
      growthStage: 0,
      progress: 0,
      soilFertility: Math.max(0.5, (plot.soilFertility || 1.0) - 0.1),
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
      waterLevel: Math.min(100, (updatedPlots[plotIndex].waterLevel || 0) + 25)
    };

    this.actions.updatePlots(updatedPlots);
  }

  // Water all plots
  waterAll() {
    // Safety checks
    if (!this.gameState || !this.gameState.plots) {
      return;
    }

    const updatedPlots = this.gameState.plots.map(plot => ({
      ...plot,
      waterLevel: Math.min(100, (plot.waterLevel || 0) + 25)
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

    this.actions.setCoins(this.gameState.coins - cost);

    const updatedPlots = [...this.gameState.plots];
    updatedPlots[plotIndex] = {
      ...updatedPlots[plotIndex],
      soilFertility: Math.min(1.5, (updatedPlots[plotIndex].soilFertility || 1.0) + 0.3),
      waterLevel: Math.min(100, (updatedPlots[plotIndex].waterLevel || 0) + 10), // Fertilizer helps water retention
      fertilizer: (updatedPlots[plotIndex].fertilizer || 0) + 1
    };

    this.actions.updatePlots(updatedPlots);
  }
}
