/**
 * Farm Hook
 * Manages farm grid, plots, planting, and harvesting
 */
import { useState, useCallback, useMemo } from 'react';
import { ALL_CROPS, CROP_MUTATIONS, QUALITY_TIERS, CROP_ROTATION } from '../data/crops';
import { GRID_CONFIG } from '../data/constants';
import { nowSec } from '../utils/time.mjs';
import { getGrowthStage } from '../systems/growth.mjs';

const createEmptyPlot = () => ({
  crop: null,
  plantedAt: null,
  wateredAt: null,
  fertilizedAt: null,
  fertilizedCount: 0,
  quality: null,
  hasPest: false,
  hasDisease: false,
  lastCropFamily: null,
  pollinated: false,
});

const createEmptyGrid = (size) => {
  return Array(size * size)
    .fill(null)
    .map(() => createEmptyPlot());
};

export function useFarm(
  addNotification,
  addCoins,
  updateStats,
  prestigeData,
  buildingBonuses = {},
  growthMultiplier = 1
) {
  const [gridSize, setGridSize] = useState(3);
  const [plots, setPlots] = useState(() => createEmptyGrid(3));
  const [selectedSeed, setSelectedSeed] = useState('carrot');
  const [inventory, setInventory] = useState({
    carrot: 5,
    fertilizer: 2,
    pesticide: 1,
  });
  const [lastHarvestTime, setLastHarvestTime] = useState(0);
  const [comboCount, setComboCount] = useState(0);

  // Calculate combo multiplier
  const comboMultiplier = useMemo(() => {
    if (comboCount < 2) return 1;
    return Math.min(1 + (comboCount - 1) * 0.1, 2.0); // Max 2x at 11 combo
  }, [comboCount]);

  // Get crop data
  const getCropData = useCallback((cropType) => {
    return ALL_CROPS[cropType] || null;
  }, []);

  // Determine quality at harvest
  const determineQuality = useCallback(
    (plot) => {
      let qualityChance = Math.random();

      // Bonuses
      if (plot.fertilizedCount > 0) qualityChance += 0.1 * plot.fertilizedCount;
      if (plot.pollinated) qualityChance += 0.15;
      if (prestigeData) qualityChance += prestigeData.level * 0.03;

      // Rotation bonus
      const cropData = getCropData(plot.crop);
      if (plot.lastCropFamily && cropData) {
        const rotation = CROP_ROTATION[plot.lastCropFamily];
        if (rotation?.next.includes(cropData.family)) {
          qualityChance += rotation.bonus;
        }
      }

      if (qualityChance > 0.95) return QUALITY_TIERS.PERFECT;
      if (qualityChance > 0.75) return QUALITY_TIERS.EXCELLENT;
      if (qualityChance > 0.5) return QUALITY_TIERS.GOOD;
      return QUALITY_TIERS.NORMAL;
    },
    [getCropData, prestigeData]
  );

  // Check for mutations
  const checkForMutation = useCallback((cropType) => {
    const mutations = CROP_MUTATIONS[cropType];
    if (!mutations) return null;

    for (const mutation of mutations) {
      if (Math.random() < mutation.chance) {
        return mutation;
      }
    }
    return null;
  }, []);

  // Plant a crop
  const plant = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot || plot.crop) {
        addNotification?.('Plot is not empty!', 'error');
        return false;
      }

      if (!inventory[selectedSeed] || inventory[selectedSeed] < 1) {
        addNotification?.(`No ${selectedSeed} seeds!`, 'error');
        return false;
      }

      const now = nowSec();
      const lastFamily = plot.lastCropFamily;
      const cropData = getCropData(selectedSeed);

      setPlots((prev) => {
        const newPlots = [...prev];
        newPlots[plotIndex] = {
          ...createEmptyPlot(),
          crop: selectedSeed,
          plantedAt: now,
          lastCropFamily: lastFamily,
        };
        return newPlots;
      });

      setInventory((prev) => ({
        ...prev,
        [selectedSeed]: prev[selectedSeed] - 1,
      }));

      // Check rotation bonus
      if (lastFamily && cropData) {
        const rotation = CROP_ROTATION[lastFamily];
        if (rotation?.next.includes(cropData.family)) {
          addNotification?.(`🔄 Rotation bonus! +${Math.round(rotation.bonus * 100)}%`, 'success');
        }
      }

      updateStats?.('cropsPlanted');
      return true;
    },
    [plots, inventory, selectedSeed, addNotification, getCropData, updateStats]
  );

  // Water a plot
  const water = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot?.crop) return false;

      const now = nowSec();

      setPlots((prev) => {
        const newPlots = [...prev];
        newPlots[plotIndex] = {
          ...newPlots[plotIndex],
          wateredAt: now,
        };
        return newPlots;
      });

      return true;
    },
    [plots]
  );

  // Fertilize a plot
  const fertilize = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot?.crop) return false;
      if (plot.fertilizedCount >= 3) {
        addNotification?.('Max fertilizer applied!', 'error');
        return false;
      }
      if (!inventory.fertilizer || inventory.fertilizer < 1) {
        addNotification?.('No fertilizer!', 'error');
        return false;
      }

      setPlots((prev) => {
        const newPlots = [...prev];
        newPlots[plotIndex] = {
          ...newPlots[plotIndex],
          fertilizedAt: nowSec(),
          fertilizedCount: (newPlots[plotIndex].fertilizedCount || 0) + 1,
        };
        return newPlots;
      });

      setInventory((prev) => ({
        ...prev,
        fertilizer: prev.fertilizer - 1,
      }));

      addNotification?.('🧪 Fertilizer applied!', 'success');
      return true;
    },
    [plots, inventory, addNotification]
  );

  // Treat pests
  const treatPest = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot?.hasPest) return false;
      if (!inventory.pesticide || inventory.pesticide < 1) {
        addNotification?.('No pesticide!', 'error');
        return false;
      }

      setPlots((prev) => {
        const newPlots = [...prev];
        newPlots[plotIndex] = {
          ...newPlots[plotIndex],
          hasPest: false,
        };
        return newPlots;
      });

      setInventory((prev) => ({
        ...prev,
        pesticide: prev.pesticide - 1,
      }));

      updateStats?.('pestsEliminated');
      addNotification?.('🐛 Pest eliminated!', 'success');
      return true;
    },
    [plots, inventory, addNotification, updateStats]
  );

  // Treat disease
  const treatDisease = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot?.hasDisease) return false;
      if (!inventory.fungicide || inventory.fungicide < 1) {
        addNotification?.('No fungicide!', 'error');
        return false;
      }

      setPlots((prev) => {
        const newPlots = [...prev];
        newPlots[plotIndex] = {
          ...newPlots[plotIndex],
          hasDisease: false,
        };
        return newPlots;
      });

      setInventory((prev) => ({
        ...prev,
        fungicide: prev.fungicide - 1,
      }));

      updateStats?.('diseasesCured');
      addNotification?.('💊 Disease cured!', 'success');
      return true;
    },
    [plots, inventory, addNotification, updateStats]
  );

  // Harvest a crop
  const harvest = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot?.crop) return null;

      const cropData = getCropData(plot.crop);
      if (!cropData) return null;

      const now = nowSec();
      const elapsed = now - plot.plantedAt;
      const totalGrowthTime =
        (cropData.stages * cropData.secondsPerStage) / Math.max(0.1, growthMultiplier);

      // Check if fully grown
      const growthPercent = elapsed / totalGrowthTime;
      if (growthPercent < 1) {
        addNotification?.('Crop not ready yet!', 'error');
        return null;
      }

      // Calculate quality
      const quality = determineQuality(plot);

      // Check for mutation
      const mutation = checkForMutation(plot.crop);

      // Calculate value
      let value = cropData.baseValue * quality.multiplier;

      // Apply barn bonus (+20% harvest value)
      if (buildingBonuses.barnBonus) {
        value *= 1 + buildingBonuses.barnBonus;
      }

      // Combo bonus
      const timeSinceLastHarvest = now - lastHarvestTime;
      if (timeSinceLastHarvest < 3) {
        setComboCount((prev) => prev + 1);
        value *= comboMultiplier;
      } else {
        setComboCount(1);
      }
      setLastHarvestTime(now);

      // Apply prestige bonus
      if (prestigeData) {
        value *= prestigeData.multiplier;
      }

      const finalValue = Math.round(value);
      const earnedCoins = addCoins?.(finalValue, 'harvest') || finalValue;

      // Clear the plot, preserve rotation data
      setPlots((prev) => {
        const newPlots = [...prev];
        newPlots[plotIndex] = {
          ...createEmptyPlot(),
          lastCropFamily: cropData.family,
        };
        return newPlots;
      });

      // Add harvested crop to inventory
      setInventory((prev) => ({
        ...prev,
        [plot.crop]: (prev[plot.crop] || 0) + 1,
      }));

      // Stats
      updateStats?.('totalHarvests');
      if (quality.id >= QUALITY_TIERS.EXCELLENT.id) {
        updateStats?.('qualityHarvests');
      }

      // Notifications
      const qualityText = quality.name !== 'Normal' ? ` (${quality.emoji} ${quality.name})` : '';
      addNotification?.(`${cropData.emoji} +${earnedCoins}🪙${qualityText}`, 'success');

      if (mutation) {
        addNotification?.(`✨ Mutation discovered: ${mutation.name}!`, 'success');
        setInventory((prev) => ({
          ...prev,
          [mutation.mutation]: (prev[mutation.mutation] || 0) + 1,
        }));
      }

      return {
        crop: plot.crop,
        value: earnedCoins,
        quality,
        mutation,
        comboCount,
      };
    },
    [
      plots,
      getCropData,
      determineQuality,
      checkForMutation,
      lastHarvestTime,
      comboMultiplier,
      prestigeData,
      addCoins,
      addNotification,
      updateStats,
      comboCount,
      buildingBonuses,
      growthMultiplier,
    ]
  );

  // Expand farm
  const expandFarm = useCallback(
    (_cost) => {
      if (gridSize >= GRID_CONFIG.MAX_SIZE) {
        addNotification?.('Farm is at maximum size!', 'error');
        return false;
      }

      const newSize = gridSize + 1;
      const newPlotCount = newSize * newSize;

      setGridSize(newSize);
      setPlots((prev) => {
        const newPlots = [...prev];
        while (newPlots.length < newPlotCount) {
          newPlots.push(createEmptyPlot());
        }
        return newPlots;
      });

      addNotification?.(`🎉 Farm expanded to ${newSize}x${newSize}!`, 'success');
      return true;
    },
    [gridSize, addNotification]
  );

  // Add items to inventory
  const addToInventory = useCallback((items) => {
    setInventory((prev) => {
      const newInv = { ...prev };
      for (const [item, qty] of Object.entries(items)) {
        newInv[item] = (newInv[item] || 0) + qty;
      }
      return newInv;
    });
  }, []);

  // Get plot growth status
  const getPlotStatus = useCallback(
    (plotIndex) => {
      const plot = plots[plotIndex];
      if (!plot?.crop) return { status: 'empty', progress: 0 };

      const cropData = getCropData(plot.crop);
      if (!cropData) return { status: 'empty', progress: 0 };

      const now = nowSec();
      const elapsed = now - plot.plantedAt;
      const effectiveSecondsPerStage = cropData.secondsPerStage / Math.max(0.1, growthMultiplier);
      const totalGrowthTime = cropData.stages * effectiveSecondsPerStage;
      const progress = Math.min(elapsed / totalGrowthTime, 1);
      const stage = getGrowthStage(elapsed, cropData.stages, effectiveSecondsPerStage);

      let status = 'growing';
      if (progress >= 1) status = 'ready';
      if (plot.hasPest) status = 'pest';
      if (plot.hasDisease) status = 'disease';

      return {
        status,
        progress,
        stage,
        cropData,
        plot,
      };
    },
    [plots, getCropData, growthMultiplier]
  );

  // Save data
  const getSaveData = useCallback(
    () => ({
      gridSize,
      plots,
      selectedSeed,
      inventory,
    }),
    [gridSize, plots, selectedSeed, inventory]
  );

  // Load save data
  const loadSaveData = useCallback((data) => {
    if (!data) return;
    if (data.gridSize !== undefined) setGridSize(data.gridSize);
    if (data.plots !== undefined) setPlots(data.plots);
    if (data.selectedSeed !== undefined) setSelectedSeed(data.selectedSeed);
    if (data.inventory !== undefined) setInventory(data.inventory);
  }, []);

  return {
    // State
    gridSize,
    plots,
    selectedSeed,
    inventory,
    comboCount,
    comboMultiplier,

    // Setters
    setSelectedSeed,
    setInventory,

    // Actions
    plant,
    water,
    fertilize,
    harvest,
    treatPest,
    treatDisease,
    expandFarm,
    addToInventory,

    // Helpers
    getCropData,
    getPlotStatus,

    // Save/Load
    getSaveData,
    loadSaveData,
  };
}
