import { useState, useEffect, useCallback } from 'react';
import { SEED_TYPES } from '../utils/gameConstants';

/**
 * Crop Management Hook
 * Handles crop growth, diseases, rotation, and harvesting
 */
export function useCrops(gameState) {
  const { 
    plots, setPlots, 
    buildings, equipment, 
    addNotification, addLog, 
    addCoins, nowSec 
  } = gameState;

  const [cropRotation, setCropRotation] = useState({});
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState([]);
  const [totalHarvests, setTotalHarvests] = useState(0);
  const [qualityHarvests, setQualityHarvests] = useState(0);

  // Calculate growth bonuses from buildings and equipment
  const getGrowthMultiplier = useCallback(() => {
    let multiplier = 1.0;
    
    if (buildings.greenhouse) multiplier *= 1.5;
    if (buildings.sprinkler) multiplier *= 1.2;
    if (equipment.includes('tractor')) multiplier *= 1.3;
    if (equipment.includes('fertilizer_spreader')) multiplier *= 1.1;
    
    return multiplier;
  }, [buildings, equipment]);

  // Check crop quality based on care and conditions
  const calculateCropQuality = useCallback((plot) => {
    let quality = 0.5; // Base quality
    
    // Care bonuses
    if (plot.wateredAt > 0) quality += 0.1;
    if (plot.fertilizedAt > 0) quality += 0.2;
    if (plot.pesticideAt > 0) quality += 0.1;
    
    // Building bonuses
    if (buildings.greenhouse) quality += 0.1;
    if (buildings.beehive) quality += 0.1;
    
    // Disease penalty
    if (plot.disease) quality -= 0.3;
    
    // Random factor
    quality += (Math.random() - 0.5) * 0.2;
    
    return Math.max(0.1, Math.min(1.0, quality));
  }, [buildings]);

  // Plant a seed in a plot
  const plantSeed = useCallback((plotIndex, seedType) => {
    const seed = SEED_TYPES[seedType];
    if (!seed) return false;

    setPlots(prev => prev.map((plot, i) => 
      i === plotIndex ? {
        ...plot,
        state: "planted",
        seed: seed,
        progress: 0,
        plantedAt: nowSec(),
        wateredAt: 0,
        fertilizedAt: 0,
        pesticideAt: 0,
        disease: null
      } : plot
    ));

    // Track crop rotation
    setCropRotation(prev => ({
      ...prev,
      [plotIndex]: [...(prev[plotIndex] || []), seedType].slice(-3) // Keep last 3 crops
    }));

    addLog(`🌱 Planted ${seed.name} in plot ${plotIndex + 1}`);
    return true;
  }, [setPlots, addLog, nowSec]);

  // Harvest a ready crop
  const harvestCrop = useCallback((plotIndex) => {
    const plot = plots[plotIndex];
    if (!plot || plot.state !== "ready") return null;

    const quality = calculateCropQuality(plot);
    const baseValue = plot.seed.baseValue;
    const finalValue = Math.floor(baseValue * quality);
    
    // Quality bonus
    const isHighQuality = quality > 0.8;
    if (isHighQuality) {
      setQualityHarvests(prev => prev + 1);
      addNotification(`High quality ${plot.seed.name}! +${finalValue} coins ⭐`, "success");
    } else {
      addNotification(`Harvested ${plot.seed.name} for ${finalValue} coins`, "success");
    }

    addCoins(finalValue);
    setTotalHarvests(prev => prev + 1);

    // Clear the plot
    setPlots(prev => prev.map((p, i) => 
      i === plotIndex ? {
        ...p,
        state: "empty",
        seed: null,
        progress: 0,
        plantedAt: 0,
        disease: null
      } : p
    ));

    addLog(`🌾 Harvested ${plot.seed.name} (Quality: ${Math.floor(quality * 100)}%)`);
    
    return {
      seed: plot.seed,
      value: finalValue,
      quality: quality,
      isHighQuality: isHighQuality
    };
  }, [plots, calculateCropQuality, addCoins, addNotification, addLog, setPlots, setTotalHarvests, setQualityHarvests]);

  // Apply care to a plot (water, fertilizer, pesticide)
  const applyCare = useCallback((plotIndex, careType) => {
    const plot = plots[plotIndex];
    if (!plot || (plot.state !== "planted" && plot.state !== "growing")) {
      return false;
    }

    const careEffects = {
      water: { progress: 10, key: 'wateredAt', emoji: '💧' },
      fertilizer: { progress: 25, key: 'fertilizedAt', emoji: '🌱' },
      pesticide: { progress: 5, key: 'pesticideAt', emoji: '🧪', curesDisease: true }
    };

    const care = careEffects[careType];
    if (!care) return false;

    setPlots(prev => prev.map((p, i) => 
      i === plotIndex ? {
        ...p,
        [care.key]: nowSec(),
        progress: Math.min(100, p.progress + care.progress),
        disease: care.curesDisease ? null : p.disease
      } : p
    ));

    addNotification(`Applied ${careType} ${care.emoji}`, "success");
    
    if (care.curesDisease && plot.disease) {
      addNotification("Disease cured! 🏥", "success");
    }

    return true;
  }, [plots, setPlots, addNotification, nowSec]);

  // Process crop growth (called by game loop)
  const processCropGrowth = useCallback((weatherMultiplier = 1.0) => {
    const growthMultiplier = getGrowthMultiplier() * weatherMultiplier;
    
    setPlots(prev => prev.map(plot => {
      if (plot.state !== "planted" && plot.state !== "growing") {
        return plot;
      }

      const timePlanted = nowSec() - plot.plantedAt;
      const growthTime = plot.seed.growthTime;
      
      // Base progress calculation
      let progress = (timePlanted / growthTime) * 100;
      
      // Apply multipliers
      progress *= growthMultiplier;
      
      // Apply care bonuses
      if (plot.wateredAt > 0) progress *= 1.1;
      if (plot.fertilizedAt > 0) progress *= 1.25;
      
      // Disease penalty
      if (plot.disease) progress *= 0.5;
      
      // Determine new state
      if (progress >= 100) {
        return { ...plot, state: "ready", progress: 100 };
      } else if (progress >= 30) {
        return { ...plot, state: "growing", progress };
      } else {
        return { ...plot, state: "planted", progress };
      }
    }));
  }, [getGrowthMultiplier, setPlots, nowSec]);

  // Random disease system
  useEffect(() => {
    const diseaseCheck = setInterval(() => {
      // 1% chance per minute for disease outbreak
      if (Math.random() < 0.01) {
        const growingPlots = plots
          .map((plot, index) => ({ plot, index }))
          .filter(({ plot }) => plot.state === "growing" || plot.state === "planted");
        
        if (growingPlots.length > 0) {
          const randomPlot = growingPlots[Math.floor(Math.random() * growingPlots.length)];
          
          setPlots(prev => prev.map((p, i) => 
            i === randomPlot.index ? {
              ...p,
              disease: "blight"
            } : p
          ));
          
          addNotification(`Disease outbreak in plot ${randomPlot.index + 1}! 🦠`, "warning");
          setDiseaseOutbreaks(prev => [...prev, { 
            plotIndex: randomPlot.index, 
            timestamp: nowSec() 
          }]);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(diseaseCheck);
  }, [plots, setPlots, addNotification, nowSec]);

  return {
    // State
    cropRotation,
    diseaseOutbreaks,
    totalHarvests,
    qualityHarvests,
    
    // Actions
    plantSeed,
    harvestCrop,
    applyCare,
    processCropGrowth,
    
    // Utilities
    getGrowthMultiplier,
    calculateCropQuality,
    
    // Computed values
    healthyPlots: plots.filter(p => p.state !== "empty" && !p.disease).length,
    diseasedPlots: plots.filter(p => p.disease).length,
    readyPlots: plots.filter(p => p.state === "ready").length
  };
}
