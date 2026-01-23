import React, { memo, useCallback, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CROP_DATA, calculateHarvestValue } from '../constants/cropData';

// Enhanced plot component with tooltips and animations
const FarmPlot = memo(({ plot, index, onPlotClick, onPlant, onHarvest, isSelected, onToggleSelect, selectedCrop, seasonBonus = 1.0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // PERF: Use centralized tick instead of per-plot setInterval
  // This reduces N intervals to 1 for the entire grid
  const tick = useTick();

  const getPlotDisplay = () => {
    if (!plot || plot.state === 'empty') {
      return {
        emoji: '🌱',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        text: 'Empty',
        hoverEffect: 'hover:bg-amber-100 hover:border-amber-400 hover:scale-105'
      };
    }

    if (plot.state === 'planted' || plot.state === 'growing') {
      const progress = plot.progress || 0;
      const growthStage = plot.growthStage || 1;

      // Calculate time remaining based on progress and growth time
      // Match FarmingSystem calculation exactly
      const baseGrowthTime = plot.crop?.growthTime || 15; // Use seconds directly
      const weatherModifier = plot.weatherModifier || 1.0;
      const effectiveGrowthTime = baseGrowthTime / (weatherModifier * seasonBonus);
      const timeElapsed = progress * effectiveGrowthTime;
      const timeRemaining = Math.max(0, effectiveGrowthTime - timeElapsed);
      const secondsLeft = Math.ceil(timeRemaining);

      return {
        emoji: plot.crop.emoji || '🌱',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-400',
        text: `Stage ${growthStage}/${plot.crop.stages || 3}`,
        subText: secondsLeft > 0 ? `${secondsLeft}s left` : 'Almost ready...',
        progress: Math.round(progress * 100),
        hoverEffect: 'hover:bg-green-100 hover:scale-105'
      };
    }

    if (plot.state === 'ready') {
      // Calculate harvest window countdown (45 seconds)
      const HARVEST_WINDOW = 45000;
      const timeSinceReady = Date.now() - (plot.readyAt || Date.now());
      const timeRemaining = Math.max(0, HARVEST_WINDOW - timeSinceReady);
      const minutesLeft = Math.floor(timeRemaining / 60000);
      const secondsLeft = Math.floor((timeRemaining % 60000) / 1000);
      const isNearExpiry = timeRemaining < 10000; // Warning if < 10 seconds

      return {
        emoji: plot.crop.emoji || '🌾',
        bgColor: isNearExpiry ? 'bg-orange-100' : 'bg-yellow-100',
        borderColor: isNearExpiry ? 'border-orange-500' : 'border-yellow-400',
        text: timeRemaining > 0 ? `Ready! 🎉` : '⚠️ Overripe!',
        subText: timeRemaining > 0 ? `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}` : 'Harvest now!',
        animation: 'animate-pulse',
        hoverEffect: 'hover:bg-yellow-200 hover:shadow-xl hover:scale-110'
      };
    }

    if (plot.state === 'withered') {
      const reason = plot.witherReason === 'no_water' ? 'No Water' :
        plot.witherReason === 'overripe' ? 'Overripe' :
          'Withered';
      return {
        emoji: '🥀',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        text: 'Withered',
        subText: 'Click to clear',
        hoverEffect: 'hover:bg-red-200 hover:scale-105 cursor-pointer'
      };
    }

    return {
      emoji: '❓',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      text: 'Unknown',
      hoverEffect: ''
    };
  };

  const display = getPlotDisplay();

  // Get soil fertility color gradient
  const getSoilGradient = () => {
    const fertility = plot?.soilFertility || 1.0;
    if (fertility > 0.8) return 'from-green-900/5 to-transparent';
    if (fertility > 0.6) return 'from-yellow-900/5 to-transparent';
    return 'from-red-900/10 to-transparent';
  };

  const handleClick = useCallback((e) => {
    if (e.shiftKey) {
      onToggleSelect(index);
    } else if (plot?.state === 'ready') {
      onHarvest(index);
    } else if (plot?.state === 'withered') {
      // Clear withered crop
      if (typeof onPlotClick === 'function') {
        onPlotClick(index, 'clear');
      }
    } else if (plot?.state === 'empty') {
      onPlant(index);
    } else {
      onPlotClick(index);
    }
  }, [plot, index, onPlotClick, onPlant, onHarvest, onToggleSelect]);

  return (
    <div className="relative" data-plot-index={index}>
      <Card
        className={`
          w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 cursor-pointer relative overflow-hidden
          transition-all-fast hover-lift
          ${display.bgColor} ${display.borderColor} border-2
          ${display.hoverEffect} active:scale-95
          ${display.animation || ''}
          ${plot?.disease ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
          ${plot?.fertilizer > 0 ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
          ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-70 scale-105' : ''}
          ${showPreview && plot?.state === 'empty' ? 'ring-4 ring-emerald-400 ring-opacity-70' : ''}
          touch-manipulation select-none
        `}
        onClick={handleClick}
        onMouseEnter={() => {
          setShowTooltip(true);
          if (plot?.state === 'empty' && selectedCrop) {
            setShowPreview(true);
          }
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setShowPreview(false);
        }}
        onTouchStart={() => {
          setShowTooltip(true);
          if (plot?.state === 'empty' && selectedCrop) {
            setShowPreview(true);
          }
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            setShowTooltip(false);
            setShowPreview(false);
          }, 2000);
        }}
      >
        {/* Soil fertility gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${getSoilGradient()} pointer-events-none`} />

        <div className="flex flex-col items-center justify-center h-full p-0.5 sm:p-1 relative z-10">
          {/* Crop emoji with growth animation - Responsive sizes */}
          <div
            className={`text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1 transition-transform-medium ${plot?.state === 'growing' ? 'animate-grow' : ''
              } ${plot?.state === 'ready' ? 'animate-ready-pop' : ''
              } ${showPreview ? 'opacity-50' : ''
              }`}
            style={{
              transform: plot?.state === 'growing'
                ? `scale(${0.6 + (plot.progress || 0) * 0.6})`  // Grows from 60% to 120% size
                : plot?.state === 'ready'
                  ? 'scale(1.2)'
                  : 'scale(1)'
            }}
          >
            {display.emoji}
          </div>

          {/* Planting preview */}
          {showPreview && plot?.state === 'empty' && selectedCrop && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse z-20">
              <div className="text-3xl sm:text-4xl opacity-70">
                {selectedCrop.emoji}
              </div>
              <div className="absolute bottom-1 left-0 right-0 text-center text-[8px] sm:text-[10px] font-bold text-emerald-700">
                Click to plant
              </div>
            </div>
          )}
          <div className="text-[10px] sm:text-xs text-center font-medium text-gray-700 leading-tight">
            {display.text}
          </div>
          {display.subText && (
            <div className="text-[9px] text-center font-semibold text-gray-600 mt-0.5">
              {display.subText}
            </div>
          )}

          {/* Enhanced progress bar with percentage */}
          {display.progress !== undefined && (
            <div className="absolute bottom-1 left-1 right-1 h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-500 animate-shimmer"
                style={{ width: `${display.progress}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-gray-700">
                {display.progress}%
              </span>
            </div>
          )}

          {/* Enhanced indicators */}
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            {/* Weather damage indicator */}
            {plot?.weatherDamage && (
              <div className="text-xs animate-pulse" title="Storm Damaged!">⚡</div>
            )}
            {plot?.droughtDamage && (
              <div className="text-xs animate-pulse" title="Drought Damage!">☀️</div>
            )}
            {plot?.disease && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" title="Diseased!" />
            )}
            {plot?.fertilizer > 0 && (
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" title="Fertilized" />
            )}
          </div>

          {/* Weather icon on plot */}
          {plot?.currentWeather && plot?.state !== 'empty' && (
            <div className="absolute top-1 left-1 text-xs opacity-60">
              {plot.currentWeather === 'sunny' && '☀️'}
              {plot.currentWeather === 'rainy' && '🌧️'}
              {plot.currentWeather === 'cloudy' && '☁️'}
              {plot.currentWeather === 'stormy' && '⛈️'}
            </div>
          )}

          {/* Water level indicator */}
          {plot?.waterLevel !== undefined && plot?.state !== 'empty' && (
            <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
              <div className={`w-2 h-2 rounded-full ${plot.waterLevel > 70 ? 'bg-blue-500' :
                plot.waterLevel > 40 ? 'bg-yellow-500' :
                  'bg-red-500 animate-pulse'
                }`} />
            </div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl">
            ✓
          </div>
        )}
      </Card>

      {/* Enhanced Tooltip */}
      {showTooltip && plot && (
        <div className="absolute z-50 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-2 w-40 animate-fade-in">
            <div className="font-semibold mb-1">Plot #{index + 1}</div>
            {plot.state !== 'empty' && plot.crop && (
              <>
                <div className="text-yellow-300">{plot.crop.emoji} {plot.crop.name}</div>
                <div className="mt-1 space-y-0.5 text-gray-300">
                  <div>💧 Water: {Math.round(plot.waterLevel || 0)}%</div>
                  <div>🌱 Fertility: {Math.round((plot.soilFertility || 1.0) * 100)}%</div>
                  {plot.fertilizer > 0 && <div>✨ Fertilizer: +{plot.fertilizer * 10}%</div>}
                  {plot.disease && <div className="text-red-400">🐛 Diseased!</div>}
                  {plot.progress !== undefined && <div>📈 Growth: {Math.round(plot.progress * 100)}%</div>}
                  {plot.weatherModifier && plot.weatherModifier !== 1.0 && (
                    <div className={plot.weatherModifier > 1.0 ? 'text-green-400' : 'text-orange-400'}>
                      🌤️ Weather: {plot.weatherModifier > 1.0 ? '+' : ''}{Math.round((plot.weatherModifier - 1.0) * 100)}%
                    </div>
                  )}
                  {plot.weatherDamage && <div className="text-red-400">⚡ Storm Damage</div>}
                  {plot.droughtDamage && <div className="text-orange-400">☀️ Drought Damage</div>}
                </div>
              </>
            )}
            {plot.state === 'empty' && (
              <div className="text-gray-400">
                <div>🌱 Fertility: {Math.round((plot.soilFertility || 1.0) * 100)}%</div>
                <div className="mt-1 text-xs">Click to plant!</div>
              </div>
            )}
            {plot.state === 'withered' && (
              <div className="text-red-400">
                <div className="font-semibold">Dead Crop 💀</div>
                <div className="mt-1 text-xs">Reason: {plot.witherReason === 'no_water' ? 'No Water' : plot.witherReason === 'overripe' ? 'Left Too Long' : 'Unknown'}</div>
                <div className="mt-1 text-xs font-bold text-yellow-300">👆 Click to clear!</div>
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
});

FarmPlot.displayName = 'FarmPlot';

// Main Farm Grid Component with multi-select
const FarmGrid = memo(() => {
  const { state, actions } = useGame();
  const seasonBonus = state.season?.config?.bonuses?.growthSpeed || 1.0;
  const [selectedPlots, setSelectedPlots] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const handlePlotClick = useCallback((index, action) => {
    // Handle clearing withered crops
    if (action === 'clear') {
      const plotsArray = Array.isArray(state.plots) ? state.plots : [];
      const plot = plotsArray[index];
      if (plot?.state === 'withered') {
        // Clear the withered crop
        const updatedPlots = [...plotsArray];
        updatedPlots[index] = {
          ...updatedPlots[index],
          state: 'empty',
          crop: null,
          plantedAt: null,
          growthStage: 0,
          waterLevel: 100,
          fertilizer: 0,
          disease: null,
          soilFertility: (plot?.soilFertility || 1.0) * 0.95, // Slight fertility loss
          progress: 0,
          witherReason: null,
          witheredAt: null
        };
        actions.updatePlots(updatedPlots);
        actions.addNotification({
          message: `🗑️ Cleared withered crop from plot ${index + 1}`,
          type: 'info'
        });
      }
      return;
    }

    // Handle plot interaction
    actions.addNotification({
      message: `Plot ${index + 1} info displayed`,
      type: 'info'
    });
  }, [actions, Array.isArray(state.plots) ? state.plots : []]);

  const handleToggleSelect = useCallback((index) => {
    setSelectedPlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handlePlant = useCallback((index) => {
    // Use consolidated crop data
    const selectedCrop = CROP_DATA[state.selectedCrop] || CROP_DATA.carrot;

    // Check if player has enough coins
    if (state.coins >= selectedCrop.cost) {
      actions.setCoins(state.coins - selectedCrop.cost);
      actions.plantCrop(index, selectedCrop.id, selectedCrop);

      // Play plant sound
      if (typeof window.soundSystem !== 'undefined') {
        window.soundSystem.playPlantSound();
      }

      actions.addNotification({
        message: `Planted ${selectedCrop.emoji} ${selectedCrop.name} on plot ${index + 1}`,
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: `Not enough coins! Need ${selectedCrop.cost}🪙`,
        type: 'error'
      });
    }
  }, [actions, state.coins, state.selectedCrop]);

  const handleHarvest = useCallback((index) => {
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];
    const plot = plotsArray[index];
    if (!plot || plot.state !== 'ready') return;

    const crop = plot.crop;
    const seasonConfig = state.season?.config;
    const earnings = calculateHarvestValue(plot, seasonConfig);

    // Trigger particle effect with earnings text
    if (typeof window.triggerParticleEffect === 'function') {
      // Get plot position
      const plotElement = document.querySelector(`.farm-grid > div:nth-child(${index + 1})`);
      if (plotElement) {
        const rect = plotElement.getBoundingClientRect();
        window.triggerParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'harvest', {
          text: `+${earnings}🪙`,
          value: earnings
        });
      }
    }

    // Play harvest sound
    if (typeof window.soundSystem !== 'undefined') {
      window.soundSystem.playHarvestSound();
    }

    // Play money sound for coin reward
    setTimeout(() => {
      if (typeof window.soundSystem !== 'undefined') {
        window.soundSystem.playMoneySound();
      }
    }, 300);

    // Update coins and inventory
    actions.setCoins(state.coins + earnings);
    // REBALANCED: Consistent 15% XP rate across all harvest methods
    actions.setXp(state.xp + Math.floor(earnings * 0.15));

    // Update inventory
    const updatedInventory = {
      ...state.inventory,
      [crop.id]: (state.inventory[crop.id] || 0) + 1
    };
    actions.updateInventory(updatedInventory);

    // Reset plot
    actions.harvestCrop(index, earnings);

    actions.addNotification({
      message: `Harvested ${crop.emoji} ${crop.name}! +${earnings}🪙`,
      type: 'success'
    });
  }, [actions, Array.isArray(state.plots) ? state.plots : [], state.coins, state.xp, state.inventory]);

  // Bulk actions
  const handleBulkHarvest = useCallback(() => {
    let totalEarnings = 0;
    let harvestedCount = 0;
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];

    selectedPlots.forEach(index => {
      const plot = plotsArray[index];
      if (plot?.state === 'ready') {
        const earnings = calculateHarvestValue(plot, state.season?.config);
        totalEarnings += earnings;
        harvestedCount++;
        handleHarvest(index);
      }
    });

    if (harvestedCount > 0) {
      actions.addNotification({
        message: `Bulk harvested ${harvestedCount} crops! +${totalEarnings}🪙`,
        type: 'success'
      });
    }

    setSelectedPlots(new Set());
  }, [selectedPlots, Array.isArray(state.plots) ? state.plots : [], handleHarvest, actions]);

  const handleSelectAll = useCallback(() => {
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];
    setSelectedPlots(new Set(plotsArray.map((_, index) => index)));
  }, [state.plots]);

  const handleClearSelection = useCallback(() => {
    setSelectedPlots(new Set());
  }, []);

  // Generate grid based on current grid size
  const gridSize = state.gridSize || 3;
  // FIXED: Ensure plots is always an array
  const plots = Array.isArray(state.plots) ? state.plots : [];

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
      <div className="mb-4 text-center relative z-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          🌾 Your Farm
          {selectedPlots.size > 0 && (
            <Badge className="bg-blue-600 animate-pulse">
              {selectedPlots.size} selected
            </Badge>
          )}
        </h2>
        <p className="text-gray-600">
          {gridSize}×{gridSize} grid • {plots.filter(p => p.state !== 'empty').length} plots in use
        </p>
      </div>

      {/* Bulk Action Controls - Mobile optimized */}
      {selectedPlots.size > 0 && (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg animate-fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-sm sm:text-base px-3 py-1">
                {selectedPlots.size} plots selected
              </Badge>
              <span className="hidden sm:inline text-sm text-gray-600">Shift+Click to multi-select</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleBulkHarvest}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none min-h-[44px] touch-manipulation"
              >
                🌾 Harvest Selected
              </Button>
              <Button
                size="sm"
                onClick={handleSelectAll}
                variant="outline"
                className="flex-1 sm:flex-none min-h-[44px] touch-manipulation"
              >
                Select All
              </Button>
              <Button
                size="sm"
                onClick={handleClearSelection}
                variant="outline"
                className="flex-1 sm:flex-none min-h-[44px] touch-manipulation"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Farm Grid - Responsive with larger touch targets on mobile */}
      <div
        className="grid gap-2 sm:gap-3 md:gap-4 mx-auto justify-center farm-grid relative"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: `min(100%, ${gridSize * 120}px)` // Larger for better touch targets
        }}
      >
        {plots.map((plot, index) => (
          <FarmPlot
            key={index}
            plot={plot}
            index={index}
            onPlotClick={handlePlotClick}
            onPlant={handlePlant}
            onHarvest={handleHarvest}
            isSelected={selectedPlots.has(index)}
            onToggleSelect={handleToggleSelect}
            selectedCrop={CROP_DATA[state.selectedCrop]}
            seasonBonus={seasonBonus}
          />
        ))}
      </div>

      {/* Grid expansion hint */}
      {gridSize < 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            💡 Expand your farm to unlock more plots! Visit the Expand tab.
          </p>
        </div>
      )}

      {/* Keyboard shortcuts hint - Mobile optimized */}
      <div className="mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="text-xs sm:text-sm text-amber-800">
          <span className="font-semibold">💡 Quick Tips:</span>
          <ul className="mt-1 sm:mt-2 space-y-1 ml-4 list-disc">
            <li className="hidden sm:list-item"><kbd className="px-1 py-0.5 bg-white rounded">Shift</kbd> + Click for multi-select</li>
            <li className="sm:hidden">Long press plots for details</li>
            <li>Hover/Tap empty plots to see planting preview</li>
            <li>Click empty plots to plant selected crop</li>
            <li>Click ready crops to harvest instantly</li>
          </ul>
        </div>
      </div>

    </Card>
  );
});

FarmGrid.displayName = 'FarmGrid';

export default FarmGrid;
