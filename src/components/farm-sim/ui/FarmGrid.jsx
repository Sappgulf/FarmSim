import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CROP_DATA, calculateHarvestValue, HARVEST_WINDOW_MS } from '../constants/cropData';
import { getCollectionBonusMultiplier } from '../constants/collectionData';
import { getMarketBonusMultiplier } from '../constants/marketData';
import { getTownRepBonus } from '../constants/townData';
import { getDiseaseById } from '../constants/diseaseData';
import { DECORATION_LOOKUP } from '../constants/decorationData';
import { traceAction } from '../services/DebugTraceService';

const FARM_ANCHORS = [
  {
    id: 'farmhouse',
    label: 'Farmhouse',
    emoji: '🏡',
    tab: 'settings',
    gridX: 0,
    gridY: 0,
    offset: { x: -0.55, y: -0.9 },
  },
  {
    id: 'shipping',
    label: 'Shipping Crate',
    emoji: '📦',
    tab: 'shop',
    gridX: -1,
    gridY: 0,
    offset: { x: 0.55, y: -0.9 },
  },
];

const createDecorationId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Enhanced plot component with tooltips and animations
const FarmPlot = memo(({ plot, index, onPlotClick, onPlant, onHarvest, isSelected, onToggleSelect, selectedCrop, seasonBonus = 1.0, tick, plotRef, decorateMode }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hideTooltipTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hideTooltipTimeoutRef.current) {
        clearTimeout(hideTooltipTimeoutRef.current);
        hideTooltipTimeoutRef.current = null;
      }
    };
  }, []);

  const now = useMemo(() => Date.now(), [tick]);

  const display = useMemo(() => {
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
      // Calculate harvest window countdown
      const timeSinceReady = now - (plot.readyAt || now);
      const timeRemaining = Math.max(0, HARVEST_WINDOW_MS - timeSinceReady);
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
        text: reason,
        subText: 'Tap to clear',
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
  }, [plot, seasonBonus, now]);
  const { diseasePenalty } = useMemo(() => {
    const info = plot?.disease ? getDiseaseById(plot.disease) : null;
    return {
      diseasePenalty: typeof info?.yieldPenalty === 'number'
        ? Math.round(info.yieldPenalty * 100)
        : null
    };
  }, [plot?.disease]);

  // Get soil fertility color gradient
  const soilGradient = useMemo(() => {
    const fertility = plot?.soilFertility || 1.0;
    if (fertility > 0.8) return 'from-green-900/5 to-transparent';
    if (fertility > 0.6) return 'from-yellow-900/5 to-transparent';
    return 'from-red-900/10 to-transparent';
  }, [plot?.soilFertility]);

  const handleClick = useCallback((e) => {
    if (decorateMode) {
      onPlotClick(index, 'decorate');
      return;
    }
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
  }, [decorateMode, plot, index, onPlotClick, onPlant, onHarvest, onToggleSelect]);

  return (
    <div ref={plotRef} className="relative" data-plot-index={index}>
      <Card
        className={`
          w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 cursor-pointer relative overflow-hidden
          transition-all-fast hover-lift farm-plot shadow-sm hover:shadow-md rounded-2xl
          ${display.bgColor} ${display.borderColor} border-2
          ${display.hoverEffect} active:scale-95
          ${display.animation || ''}
          ${plot?.disease ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
          ${plot?.fertilizer > 0 ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
          ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-70 scale-105' : ''}
          ${showPreview && plot?.state === 'empty' ? 'ring-4 ring-emerald-400 ring-opacity-70' : ''}
          touch-manipulation select-none
        `}
        data-state={plot?.state || 'empty'}
        data-growth={plot?.growthStage || 0}
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
          if (hideTooltipTimeoutRef.current) {
            clearTimeout(hideTooltipTimeoutRef.current);
            hideTooltipTimeoutRef.current = null;
          }
          setShowTooltip(true);
          if (plot?.state === 'empty' && selectedCrop) {
            setShowPreview(true);
          }
        }}
        onTouchEnd={() => {
          if (hideTooltipTimeoutRef.current) {
            clearTimeout(hideTooltipTimeoutRef.current);
          }
          hideTooltipTimeoutRef.current = setTimeout(() => {
            setShowTooltip(false);
            setShowPreview(false);
          }, 2000);
        }}
      >
        <div className={`absolute inset-0 pointer-events-none ${plot?.state === 'empty' ? 'plot-soil-tilled' : 'plot-soil-planted'}`} />
        <div
          className={`absolute inset-0 pointer-events-none ${plot?.state === 'empty'
            ? 'plot-moisture-tilled'
            : plot?.waterLevel > 70
              ? 'plot-moisture-wet'
              : plot?.waterLevel > 40
                ? 'plot-moisture-damp'
                : 'plot-moisture-dry'
            }`}
        />
        {/* Soil fertility gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${soilGradient} pointer-events-none`} />

        <div className="flex flex-col items-center justify-center h-full p-0.5 sm:p-1 relative z-10">
          {/* Crop emoji with growth animation - Responsive sizes */}
          <div
            className={`text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1 transition-all duration-300 ${plot?.state === 'growing' ? 'animate-grow' : ''
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
                  {plot.disease && (
                    <div className="text-red-400">
                      🐛 Diseased{diseasePenalty !== null ? ` • Yield -${diseasePenalty}%` : '!'}
                    </div>
                  )}
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
  const tick = useTick();
  const seasonBonus = state.season?.config?.bonuses?.growthSpeed || 1.0;
  const [selectedPlots, setSelectedPlots] = useState(new Set());
  const [recentDecorationId, setRecentDecorationId] = useState(null);

  const stateRef = useRef(state);
  const actionsRef = useRef(actions);
  const plotRefs = useRef([]);
  const gridRef = useRef(null);
  const [gridMetrics, setGridMetrics] = useState({ cellSize: 0, gap: 0 });

  const gridSize = state.gridSize || 3;

  stateRef.current = state;
  actionsRef.current = actions;

  const decorateMode = state.decorateMode;
  const decorateTool = state.decorateTool;
  const selectedDecoration = state.selectedDecoration;
  const movingDecorationId = state.movingDecorationId;

  const decorations = useMemo(
    () => (Array.isArray(state.decorations) ? state.decorations : []),
    [state.decorations]
  );
  const decorationMap = useMemo(() => {
    const map = new Map();
    decorations.forEach((decor) => {
      if (!decor || typeof decor.x !== 'number' || typeof decor.y !== 'number') return;
      map.set(`${decor.x}-${decor.y}`, decor);
    });
    return map;
  }, [decorations]);

  useEffect(() => {
    if (!recentDecorationId) return undefined;
    const timeout = setTimeout(() => {
      setRecentDecorationId(null);
    }, 500);
    return () => clearTimeout(timeout);
  }, [recentDecorationId]);

  useEffect(() => {
    if (decorateMode) {
      setSelectedPlots(new Set());
    }
  }, [decorateMode]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !gridRef.current) return;
    const gridElement = gridRef.current;
    let rafId = null;

    const updateMetrics = () => {
      if (!gridElement) return;
      const style = window.getComputedStyle(gridElement);
      const gapValue = parseFloat(style.gap || style.columnGap || '0') || 0;
      const width = gridElement.clientWidth;
      const cellSize = gridSize > 0
        ? (width - gapValue * (gridSize - 1)) / gridSize
        : 0;
      setGridMetrics({ cellSize, gap: gapValue });
    };

    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateMetrics);
    };

    updateMetrics();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleResize)
      : null;
    if (observer) {
      observer.observe(gridElement);
    }
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [gridSize]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__getPlotElement = (index) => plotRefs.current[index] || null;
    window.__getPlotCenter = (index) => {
      const element = plotRefs.current[index];
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    return () => {
      delete window.__getPlotElement;
      delete window.__getPlotCenter;
    };
  }, []);

  const getCellFromIndex = useCallback((index) => ({
    x: index % gridSize,
    y: Math.floor(index / gridSize),
  }), [gridSize]);

  const handleDecorateCell = useCallback((index) => {
    const currentState = stateRef.current;
    const currentActions = actionsRef.current;
    const { x, y } = getCellFromIndex(index);
    const plot = Array.isArray(currentState.plots) ? currentState.plots[index] : null;

    if (plot && plot.state !== 'empty' && currentState.decorateTool !== 'remove') {
      currentActions.addNotification({
        message: 'Decorations can only be placed on empty plots.',
        type: 'info',
      });
      return;
    }

    const currentDecorations = Array.isArray(currentState.decorations) ? currentState.decorations : [];
    const existingDecoration = currentDecorations.find((decor) => decor.x === x && decor.y === y);
    const tool = currentState.decorateTool || 'place';
    const selectedType = currentState.selectedDecoration;

    if (tool === 'remove') {
      if (!existingDecoration) {
        currentActions.addNotification({
          message: 'No decoration to remove here.',
          type: 'info',
        });
        return;
      }
      currentActions.updateDecorations(currentDecorations.filter((decor) => decor.id !== existingDecoration.id));
      if (currentState.movingDecorationId === existingDecoration.id) {
        currentActions.setMovingDecorationId(null);
      }
      currentActions.addNotification({
        message: '🧹 Decoration removed.',
        type: 'success',
      });
      return;
    }

    if (tool === 'move') {
      if (currentState.movingDecorationId) {
        if (existingDecoration) {
          currentActions.addNotification({
            message: 'That spot is already decorated.',
            type: 'info',
          });
          return;
        }
        const movingDecoration = currentDecorations.find((decor) => decor.id === currentState.movingDecorationId);
        if (!movingDecoration) {
          currentActions.setMovingDecorationId(null);
          return;
        }
        const nextDecorations = currentDecorations.map((decor) => (
          decor.id === movingDecoration.id
            ? { ...decor, x, y }
            : decor
        ));
        currentActions.updateDecorations(nextDecorations);
        currentActions.setMovingDecorationId(null);
        setRecentDecorationId(movingDecoration.id);
        currentActions.addNotification({
          message: '📦 Decoration moved.',
          type: 'success',
        });
        return;
      }

      if (existingDecoration) {
        currentActions.setMovingDecorationId(existingDecoration.id);
        currentActions.setSelectedDecoration(existingDecoration.type);
        currentActions.addNotification({
          message: 'Pick a new spot for this decoration.',
          type: 'info',
        });
        return;
      }

      currentActions.addNotification({
        message: 'Tap a decoration to move it.',
        type: 'info',
      });
      return;
    }

    if (!DECORATION_LOOKUP[selectedType]) {
      currentActions.addNotification({
        message: 'Select a decoration before placing.',
        type: 'info',
      });
      return;
    }

    const nextDecorations = existingDecoration
      ? currentDecorations.map((decor) => (
        decor.id === existingDecoration.id
          ? { ...decor, type: selectedType }
          : decor
      ))
      : [
        ...currentDecorations,
        {
          id: createDecorationId(),
          type: selectedType,
          x,
          y,
          rotation: 0,
        }
      ];

    const placedDecorationId = existingDecoration?.id || nextDecorations[nextDecorations.length - 1]?.id;
    currentActions.updateDecorations(nextDecorations);
    if (placedDecorationId) {
      setRecentDecorationId(placedDecorationId);
    }
    currentActions.addNotification({
      message: existingDecoration ? '✨ Decoration updated.' : '✨ Decoration placed.',
      type: 'success',
    });
  }, [getCellFromIndex]);

  const handlePlotClick = useCallback((index, action) => {
    const currentState = stateRef.current;
    const currentActions = actionsRef.current;

    traceAction('plot_click', { index, action }, currentState);

    if (currentState.decorateMode) {
      handleDecorateCell(index);
      return;
    }

    // Handle clearing withered crops
    if (action === 'clear') {
      const plotsArray = Array.isArray(currentState.plots) ? currentState.plots : [];
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
        currentActions.updatePlots(updatedPlots);
        currentActions.addNotification({
          message: `🗑️ Cleared withered crop from plot ${index + 1}`,
          type: 'info'
        });
      }
      return;
    }

    // Handle plot interaction
    currentActions.addNotification({
      message: `Plot ${index + 1} info displayed`,
      type: 'info'
    });
  }, []);

  const handleToggleSelect = useCallback((index) => {
    if (stateRef.current.decorateMode) return;
    setSelectedPlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      traceAction('plot_toggle_select', { index, selected: newSet.has(index) }, stateRef.current);
      return newSet;
    });
  }, []);

  const handlePlant = useCallback((index) => {
    const currentState = stateRef.current;
    const currentActions = actionsRef.current;

    // Use consolidated crop data
    const selectedCrop = CROP_DATA[currentState.selectedCrop] || CROP_DATA.carrot;

    // Check if player has enough coins
    if (currentState.coins >= selectedCrop.cost) {
      currentActions.setCoins(currentState.coins - selectedCrop.cost);
      currentActions.plantCrop(index, selectedCrop.id, selectedCrop);

      // Play plant sound
      if (typeof window.soundSystem !== 'undefined') {
        window.soundSystem.playPlantSound();
      }

      currentActions.addNotification({
        message: `Planted ${selectedCrop.emoji} ${selectedCrop.name} on plot ${index + 1}`,
        type: 'success'
      });
    } else {
      currentActions.addNotification({
        message: `Not enough coins! Need ${selectedCrop.cost}🪙`,
        type: 'error'
      });
    }
  }, []);

  const handleHarvest = useCallback((index) => {
    const currentState = stateRef.current;
    const currentActions = actionsRef.current;
    const plotsArray = Array.isArray(currentState.plots) ? currentState.plots : [];
    const plot = plotsArray[index];
    if (!plot || plot.state !== 'ready') return;

    const crop = plot.crop;
    const seasonConfig = currentState.season?.config;
    const townBonus = getTownRepBonus(stateRef.current?.social?.reputation);
    const collectionBonus = getCollectionBonusMultiplier(currentState.collections, crop.id);
    const marketBonus = getMarketBonusMultiplier(currentState.market, crop.id);
    const earnings = calculateHarvestValue(
      plot,
      seasonConfig,
      townBonus * collectionBonus * marketBonus
    );

    // Trigger particle effect with earnings text
    if (typeof window.triggerParticleEffect === 'function') {
      // Get plot position
      const plotElement = plotRefs.current[index];
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
    currentActions.setCoins(currentState.coins + earnings);
    // REBALANCED: Reduced XP to 20% of earnings (was 50%) for slower, more meaningful progression
    currentActions.grantXP(Math.floor(earnings * 0.2), 'harvest_ui', { cropId: crop.id, value: earnings });
    // Update inventory
    const updatedInventory = {
      ...currentState.inventory,
      [crop.id]: (currentState.inventory[crop.id] || 0) + 1
    };
    currentActions.updateInventory(updatedInventory);

    // Reset plot
    currentActions.harvestCrop(index, earnings);

    currentActions.addNotification({
      message: `Harvested ${crop.emoji} ${crop.name}! +${earnings}🪙`,
      type: 'success'
    });
  }, []);

  // Bulk actions
  const handleBulkHarvest = useCallback(() => {
    let totalEarnings = 0;
    let harvestedCount = 0;
    const plotsArray = Array.isArray(stateRef.current.plots) ? stateRef.current.plots : [];

    selectedPlots.forEach(index => {
      const plot = plotsArray[index];
      if (plot?.state === 'ready') {
        const townBonus = getTownRepBonus(stateRef.current?.social?.reputation);
        const collectionBonus = getCollectionBonusMultiplier(stateRef.current.collections, plot.crop.id);
        const marketBonus = getMarketBonusMultiplier(stateRef.current.market, plot.crop.id);
        const earnings = calculateHarvestValue(
          plot,
          stateRef.current.season?.config,
          townBonus * collectionBonus * marketBonus
        );
        totalEarnings += earnings;
        harvestedCount++;
        handleHarvest(index);
      }
    });

    if (harvestedCount > 0) {
      actionsRef.current.addNotification({
        message: `Bulk harvested ${harvestedCount} crops! +${totalEarnings}🪙`,
        type: 'success'
      });
    }

    setSelectedPlots(new Set());
  }, [selectedPlots, handleHarvest]);

  const handleSelectAll = useCallback(() => {
    const plotsArray = Array.isArray(stateRef.current.plots) ? stateRef.current.plots : [];
    setSelectedPlots(new Set(plotsArray.map((_, index) => index)));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPlots(new Set());
  }, []);

  // Generate grid based on current grid size
  // FIXED: Ensure plots is always an array
  const plots = useMemo(() => (Array.isArray(state.plots) ? state.plots : []), [state.plots]);
  const selectedCropData = useMemo(() => CROP_DATA[state.selectedCrop] || CROP_DATA.carrot, [state.selectedCrop]);
  const plotsInUse = useMemo(() => plots.reduce((count, plot) => count + (plot?.state !== 'empty' ? 1 : 0), 0), [plots]);
  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
    maxWidth: `min(100%, ${gridSize * 120}px)` // Larger for better touch targets
  }), [gridSize]);

  return (
    <Card className="p-6 farm-scene-card relative overflow-hidden">
      <div className="farm-scene-backdrop" aria-hidden="true"></div>
      <div className="farm-scene-fence" aria-hidden="true"></div>
      <div className="mb-4 text-center relative z-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          🌾 Your Farm
          {selectedPlots.size > 0 && (
            <Badge className="bg-blue-600 animate-pulse">
              {selectedPlots.size} selected
            </Badge>
          )}
          {decorateMode && (
            <Badge className="bg-emerald-600">
              🎨 Decorate Mode
            </Badge>
          )}
        </h2>
        <p className="text-gray-600">
          {gridSize}×{gridSize} grid • {plotsInUse} plots in use
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
        ref={gridRef}
        className="grid gap-2 sm:gap-3 md:gap-4 mx-auto justify-center farm-grid relative z-10"
        style={gridStyle}
      >
        <div className="absolute inset-0 pointer-events-none z-10">
          {decorations.map((decor) => {
            const meta = DECORATION_LOOKUP[decor.type];
            if (!meta || !gridMetrics.cellSize) return null;
            const left = decor.x * (gridMetrics.cellSize + gridMetrics.gap);
            const top = decor.y * (gridMetrics.cellSize + gridMetrics.gap);
            const isMoving = movingDecorationId === decor.id;
            return (
              <button
                key={decor.id}
                type="button"
                className={`farm-decoration ${recentDecorationId === decor.id ? 'farm-decoration-pop' : ''} ${isMoving ? 'farm-decoration-moving' : ''}`}
                style={{
                  width: gridMetrics.cellSize,
                  height: gridMetrics.cellSize,
                  transform: `translate(${left}px, ${top}px) rotate(${decor.rotation || 0}deg)`,
                  pointerEvents: decorateMode ? 'auto' : 'none',
                }}
                onClick={() => decorateMode && handleDecorateCell(decor.y * gridSize + decor.x)}
              >
                <span className="farm-decoration-emoji" aria-hidden="true">{meta.emoji}</span>
                <span className="sr-only">{meta.label}</span>
              </button>
            );
          })}
        </div>
        <div className="absolute inset-0 pointer-events-none z-20">
          {gridMetrics.cellSize > 0 && FARM_ANCHORS.map((anchor) => {
            const x = anchor.gridX === -1 ? gridSize - 1 : anchor.gridX;
            const y = anchor.gridY;
            const left = x * (gridMetrics.cellSize + gridMetrics.gap);
            const top = y * (gridMetrics.cellSize + gridMetrics.gap);
            return (
              <button
                key={anchor.id}
                type="button"
                className="farm-anchor"
                style={{
                  width: gridMetrics.cellSize,
                  height: gridMetrics.cellSize,
                  transform: `translate(${left}px, ${top}px) translate(${anchor.offset.x * 100}%, ${anchor.offset.y * 100}%)`,
                  pointerEvents: 'auto',
                }}
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof window.switchToTab === 'function') {
                    window.switchToTab(anchor.tab);
                  }
                }}
              >
                <span className="farm-anchor-emoji" aria-hidden="true">{anchor.emoji}</span>
                <span className="farm-anchor-label">{anchor.label}</span>
              </button>
            );
          })}
        </div>
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
            selectedCrop={selectedCropData}
            seasonBonus={seasonBonus}
            tick={plot?.state === 'planted' || plot?.state === 'growing' || plot?.state === 'ready' ? tick : undefined}
            decorateMode={decorateMode}
            plotRef={(element) => {
              plotRefs.current[index] = element;
            }}
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
