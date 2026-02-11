import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CROP_DATA, CROP_LIST } from '../constants/cropData';
import { DECORATION_DATA } from '../constants/decorData';
import {
  calculateHarvestValue,
  getHarvestMultiplier,
  getHydroponicsGrowthBonus,
  getMiniGreenhouseGrowthBonus,
  getSoilAnalyzerEnabled,
} from '../../../utils/farmUpgrades';
import { getDifficultyModifier } from '../systems/progression';

const ReadyCountdown = memo(({ readyAt, harvestWindowMs = 45000 }) => {
  useTick();
  const now = Date.now();
  const timeRemaining = Math.max(0, harvestWindowMs - (now - (readyAt || now)));
  const minutesLeft = Math.floor(timeRemaining / 60000);
  const secondsLeft = Math.floor((timeRemaining % 60000) / 1000);
  const isNearExpiry = timeRemaining < 10000;

  return (
    <>
      <div className={`text-[9px] text-center font-semibold mt-0.5 ${isNearExpiry ? 'text-orange-600 animate-pulse' : 'text-gray-600'}`}>
        {timeRemaining > 0 ? `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}` : 'Harvest now!'}
      </div>
      {isNearExpiry && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-orange-400/80 animate-pulse pointer-events-none" />
      )}
    </>
  );
});

ReadyCountdown.displayName = 'ReadyCountdown';

// Enhanced plot component with tooltips and animations
const FarmPlot = memo(({
  plot,
  index,
  onPlotClick,
  onPlant,
  onHarvest,
  onDecorate,
  isSelected,
  onToggleSelect,
  selectedCrop,
  selectedDecoration,
  isDecorMode,
  seasonBonus = 1.0,
  growthDifficulty = 1.0,
  greenhouseGrowthBonus = 1.0,
  hydroponicsGrowthBonus = 1.0,
  hasSoilAnalyzer = false,
  harvestMultiplier = 1.0,
  gridSize = 3,
  plotRef = null,
  isTrinket = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

    if (plot.state === 'decor') {
      const decoration = DECORATION_DATA[plot.decorationId];
      return {
        emoji: decoration?.emoji || '🪴',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-300',
        text: decoration?.name || 'Decoration',
        subText: 'Click to remove',
        hoverEffect: 'hover:bg-rose-100 hover:scale-105'
      };
    }

    if (plot.state === 'planted' || plot.state === 'growing') {
      // Derive growth from timestamps so UI can stay smooth without frequent global state writes.
      const now = Date.now();
      const plantedAt = Number(plot.plantedAt) || now;
      const elapsedSeconds = Math.max(0, (now - plantedAt) / 1000);
      const baseGrowthTime = plot.crop?.growthTime || 15;
      const weatherModifier = plot.weatherModifier || 1.0;
      const growthBoost = plot.growthBoost || 1;
      const rotationHistory = Array.isArray(plot.rotationHistory) ? plot.rotationHistory : [];
      const predecessors = rotationHistory.slice(0, -1);
      const uniquePredecessors = new Set(predecessors.filter((id) => id !== (plot.crop?.id || ''))).size;
      const rotationBonus = 1 + (uniquePredecessors * 0.05);
      const effectiveGrowthTime = (
        (baseGrowthTime * growthDifficulty) /
        (weatherModifier * seasonBonus * greenhouseGrowthBonus * hydroponicsGrowthBonus * growthBoost)
      );
      const rotatedGrowthTime = Math.max(0.001, effectiveGrowthTime / rotationBonus);
      const liveProgress = Math.min(1.0, elapsedSeconds / rotatedGrowthTime);
      const totalStages = plot.crop?.stages || 3;
      const growthStage = Math.min(totalStages, Math.floor(liveProgress * totalStages) + 1);
      const timeRemaining = Math.max(0, rotatedGrowthTime - elapsedSeconds);
      const secondsLeft = Math.ceil(timeRemaining);

      return {
        emoji: plot.crop.emoji || '🌱',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-400',
        text: `Stage ${growthStage}/${totalStages}`,
        subText: secondsLeft > 0 ? `${secondsLeft}s left` : 'Almost ready...',
        progress: Math.round(liveProgress * 100),
        liveProgress,
        hoverEffect: 'hover:bg-green-100 hover:scale-105'
      };
    }

    if (plot.state === 'ready') {
      return {
        emoji: plot.crop.emoji || '🌾',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-400',
        text: 'Ready! 🎉',
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
  const growthScaleProgress = display.liveProgress != null ? display.liveProgress : (plot?.progress || 0);
  const isDenseGrid = gridSize >= 5;

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
      return;
    }

    if (isDecorMode && (plot?.state === 'empty' || plot?.state === 'decor')) {
      onDecorate(index);
      return;
    }

    if (plot?.state === 'ready') {
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
  }, [plot, index, onPlotClick, onPlant, onHarvest, onToggleSelect, onDecorate, isDecorMode]);

  return (
    <div className="relative" ref={plotRef}>
      <Card
        className={`
          w-full aspect-square min-h-[52px] sm:min-h-[72px] md:min-h-[88px] cursor-pointer relative overflow-hidden
          transition-all-fast hover-lift
          ${display.bgColor} ${display.borderColor} border-2
          ${display.hoverEffect} active:scale-95
          ${display.animation || ''}
          ${plot?.disease ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
          ${plot?.fertilizer > 0 ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
          ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-70 scale-105' : ''}
          ${showPreview && plot?.state === 'empty' ? 'ring-4 ring-emerald-400 ring-opacity-70' : ''}
          ${plot?.state === 'decor' ? 'shadow-inner' : ''}
          ${isTrinket ? 'trinket-idle' : ''}
          touch-manipulation select-none
        `}
        onClick={handleClick}
        onMouseEnter={() => {
          setShowTooltip(true);
          if (plot?.state === 'empty' && (selectedCrop || selectedDecoration)) {
            setShowPreview(true);
          }
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setShowPreview(false);
        }}
        onTouchStart={() => {
          setShowTooltip(true);
          if (plot?.state === 'empty' && (selectedCrop || selectedDecoration)) {
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
            className={`${isDenseGrid ? 'text-lg sm:text-2xl md:text-3xl' : 'text-xl sm:text-2xl md:text-3xl'} mb-0.5 sm:mb-1 transition-transform-medium ${plot?.state === 'growing' ? 'animate-grow' : ''
              } ${plot?.state === 'ready' ? 'animate-ready-pop' : ''
              } ${showPreview ? 'opacity-50' : ''
              }`}
            style={{
              transform: plot?.state === 'growing'
                ? `scale(${0.6 + (growthScaleProgress * 0.6)})`  // Grows from 60% to 120% size
                : plot?.state === 'ready'
                  ? 'scale(1.2)'
                  : 'scale(1)'
            }}
          >
            {display.emoji}
          </div>

          {/* Planting/Decor preview */}
          {showPreview && plot?.state === 'empty' && (selectedCrop || selectedDecoration) && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse z-20">
              <div className="text-3xl sm:text-4xl opacity-70">
                {selectedDecoration?.emoji || selectedCrop?.emoji}
              </div>
              <div className="absolute bottom-1 left-0 right-0 text-center text-[8px] sm:text-[10px] font-bold text-emerald-700">
                {isDecorMode ? 'Click to decorate' : 'Click to plant'}
              </div>
            </div>
          )}
          <div className="text-[10px] sm:text-xs text-center font-medium text-gray-700 leading-tight">
            {display.text}
          </div>
          {plot?.state === 'ready' ? (
            <ReadyCountdown readyAt={plot.readyAt} />
          ) : (
            display.subText && (
              <div className="text-[9px] text-center font-semibold text-gray-600 mt-0.5">
                {display.subText}
              </div>
            )
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
              {plot.currentWeather === 'snow' && '❄️'}
              {plot.currentWeather === 'windy' && '💨'}
              {plot.currentWeather === 'drought' && '🏜️'}
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
                  {(plot.state === 'growing' || plot.state === 'planted') && display.progress !== undefined && (
                    <div>📈 Growth: {display.progress}%</div>
                  )}
                  {plot.weatherModifier && plot.weatherModifier !== 1.0 && (
                    <div className={plot.weatherModifier > 1.0 ? 'text-green-400' : 'text-orange-400'}>
                      🌤️ Weather: {plot.weatherModifier > 1.0 ? '+' : ''}{Math.round((plot.weatherModifier - 1.0) * 100)}%
                    </div>
                  )}
                  {hasSoilAnalyzer && plot.crop && (
                    <div className="text-emerald-300">
                      🧪 Est. Value: {Math.floor((plot.crop.baseValue || 10) * (plot.soilFertility || 1.0) * harvestMultiplier)}🪙
                    </div>
                  )}
                  {plot.weatherDamage && <div className="text-red-400">⚡ Storm Damage</div>}
                  {plot.droughtDamage && <div className="text-orange-400">☀️ Drought Damage</div>}
                </div>
              </>
            )}
            {plot.state === 'decor' && plot.decorationId && (
              <div className="text-rose-200">
                <div className="font-semibold">Decor</div>
                <div className="mt-1 text-xs">Tap to remove or swap.</div>
              </div>
            )}
            {plot.state === 'empty' && (
              <div className="text-gray-400">
                <div>🌱 Fertility: {Math.round((plot.soilFertility || 1.0) * 100)}%</div>
                <div className="mt-1 text-xs">Click to plant or decorate.</div>
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
  useTick();
  const { state, actions } = useGame();
  const seasonBonus = state.season?.config?.bonuses?.growthSpeed || 1.0;
  const growthDifficulty = getDifficultyModifier(state.level || 1).growthTime || 1.0;
  const greenhouseGrowthBonus = getMiniGreenhouseGrowthBonus(state.inventory || {});
  const hydroponicsGrowthBonus = getHydroponicsGrowthBonus(state.inventory || {});
  const hasSoilAnalyzer = getSoilAnalyzerEnabled(state.inventory);
  const harvestMultiplier = getHarvestMultiplier(state.inventory);
  const [selectedPlots, setSelectedPlots] = useState(new Set());
  const [decorUndoCount, setDecorUndoCount] = useState(0);
  const [repeatDecorPlacement, setRepeatDecorPlacement] = useState(true);
  const [harvestBloomTick, setHarvestBloomTick] = useState(0);
  const harvestBloomTimerRef = useRef(null);
  const plotRefs = useRef([]);
  const decorUndoStack = useRef([]);
  const getPlotCenter = useCallback((index) => {
    const plotNode = plotRefs.current[index];
    if (!plotNode) return null;
    const rect = plotNode.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const animationsEnabled = state.settings?.animationsEnabled !== false;
  const decorMode = state.decorateMode;
  const selectedDecoration = state.selectedDecoration ? DECORATION_DATA[state.selectedDecoration] : null;
  const ghostActive = !!state.ghostVisit?.active;
  const plots = ghostActive
    ? (Array.isArray(state.ghostVisit?.snapshot?.plots) ? state.ghostVisit.snapshot.plots : [])
    : (Array.isArray(state.plots) ? state.plots : []);
  const plotRefCallbacks = useMemo(() => {
    // Stable per-index ref callbacks so FarmPlot memo isn't defeated by a new function every render.
    return Array.from({ length: plots.length }, (_, index) => (el) => {
      plotRefs.current[index] = el;
    });
  }, [plots.length]);
  const selectedCrop = useMemo(
    () => CROP_DATA[state.selectedCrop] || CROP_LIST[0],
    [state.selectedCrop]
  );
  const showTooltips = state.settings?.showTooltips !== false;
  const dismissedHints = state.cozyExpansion?.contextHints?.dismissed || {};
  const plotsInUseCount = useMemo(
    () => plots.reduce((count, plot) => (plot?.state !== 'empty' ? count + 1 : count), 0),
    [plots]
  );
  const readyPlotIndexes = useMemo(() => {
    const indexes = [];
    plots.forEach((plot, index) => {
      if (plot?.state === 'ready' && plot.crop) indexes.push(index);
    });
    return indexes;
  }, [plots]);
  const hasReadyPlots = readyPlotIndexes.length > 0;

  useEffect(() => () => {
    if (harvestBloomTimerRef.current) {
      clearTimeout(harvestBloomTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!showTooltips || !decorMode || dismissedHints.decor_mode_intro || ghostActive) return;
    actions.addNotification({
      message: '💡 Decor mode tip: Place trinkets and decor on empty plots. Tap a decor plot to pick it back up.',
      type: 'info'
    });
    actions.recordCozyExpansionEvent('context_hint_seen', { id: 'decor_mode_intro' });
  }, [actions, decorMode, dismissedHints.decor_mode_intro, ghostActive, showTooltips]);

  useEffect(() => {
    if (!showTooltips || !hasReadyPlots || dismissedHints.harvest_ready || ghostActive) return;
    actions.addNotification({
      message: '💡 Harvest tip: Use “Select Ready” to gather mature crops faster.',
      type: 'info'
    });
    actions.recordCozyExpansionEvent('context_hint_seen', { id: 'harvest_ready' });
  }, [actions, dismissedHints.harvest_ready, ghostActive, hasReadyPlots, showTooltips]);

  useEffect(() => {
    if (!harvestBloomTick) return;
    if (harvestBloomTimerRef.current) clearTimeout(harvestBloomTimerRef.current);
    harvestBloomTimerRef.current = setTimeout(() => setHarvestBloomTick(0), 550);
  }, [harvestBloomTick]);

  const pushDecorUndo = useCallback((entry) => {
    decorUndoStack.current = [entry, ...decorUndoStack.current].slice(0, 5);
    setDecorUndoCount(decorUndoStack.current.length);
  }, []);

  const handleDecorUndo = useCallback(() => {
    const [last, ...rest] = decorUndoStack.current;
    if (!last) return;
    decorUndoStack.current = rest;
    setDecorUndoCount(rest.length);

    actions.updatePlots((currentState) => {
      const plotsArray = Array.isArray(currentState.plots) ? currentState.plots : [];
      const updatedPlots = [...plotsArray];
      updatedPlots[last.index] = last.previousPlot;
      return updatedPlots;
    });

    actions.updateInventory((inventory) => {
      const nextInventory = { ...(inventory || {}) };
      if (last.type === 'place') {
        nextInventory[last.decorationId] = (nextInventory[last.decorationId] || 0) + 1;
      }
      if (last.type === 'remove') {
        nextInventory[last.decorationId] = Math.max(0, (nextInventory[last.decorationId] || 0) - 1);
      }
      return nextInventory;
    });

    actions.addNotification({
      message: '↩️ Undid last decoration change.',
      type: 'info'
    });
  }, [actions]);

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
      setHarvestBloomTick(Date.now());
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
  }, [actions, state.plots]);

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
    if (ghostActive) {
      actions.addNotification({ message: 'Ghost Visit is read-only.', type: 'info' });
      return;
    }
    // Use consolidated crop data
    if (!selectedCrop) return;

    // Check if player has enough coins
    if (state.coins >= selectedCrop.cost) {
      actions.spendMoney(selectedCrop.cost);
      const planted = actions.plantCrop(index, selectedCrop.id, selectedCrop);

      if (animationsEnabled && typeof window.triggerParticleEffect === 'function') {
        const center = getPlotCenter(index);
        if (center) {
          window.triggerParticleEffect(center.x, center.y, 'plant');
        }
      }

      // Play plant sound
      if (typeof window.soundSystem !== 'undefined') {
        window.soundSystem.playPlantSound();
      }

      actions.addNotification({
        message: `Planted ${selectedCrop.emoji} ${selectedCrop.name} on plot ${index + 1}`,
        type: 'success'
      });

      if (planted) {
        actions.recordOnboardingEvent('plant');
        const uniqueCrops = new Set(plots.filter((plot) => plot?.crop?.id).map((plot) => plot.crop.id));
        uniqueCrops.add(selectedCrop.id);
        actions.recordMilestoneEvent?.('unique_crop', { size: uniqueCrops.size });
      }
    } else {
      actions.addNotification({
        message: `Not enough coins! Need ${selectedCrop.cost}🪙`,
        type: 'error'
      });
    }
  }, [actions, animationsEnabled, getPlotCenter, ghostActive, plots, selectedCrop, state.coins]);

  const handleDecorate = useCallback((index) => {
    if (ghostActive) return;
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];
    const plot = plotsArray[index];
    if (!plot) return;

    if (plot.state === 'decor') {
      const decorationId = plot.decorationId;
      const removed = actions.removeDecoration(index);
      if (removed) {
        pushDecorUndo({
          type: 'remove',
          index,
          decorationId,
          previousPlot: plot,
        });

        actions.addNotification({
          message: '🧹 Decoration removed.',
          type: 'info'
        });
      }
      return;
    }

    if (!selectedDecoration) {
      actions.addNotification({
        message: 'Select a decoration from your inventory first.',
        type: 'warning'
      });
      return;
    }

    if (plot.state !== 'empty') {
      actions.addNotification({
        message: 'Only empty plots can be decorated.',
        type: 'warning'
      });
      return;
    }

    const placed = actions.placeDecoration(index, selectedDecoration.id);
    if (placed === 'locked') {
      return;
    }
    if (!placed) {
      actions.addNotification({
        message: 'Not enough decor items. Visit the shop to restock!',
        type: 'error'
      });
      return;
    }

    pushDecorUndo({
      type: 'place',
      index,
      decorationId: selectedDecoration.id,
      previousPlot: plot,
    });

    if (animationsEnabled && typeof window.triggerParticleEffect === 'function') {
      const center = getPlotCenter(index);
      if (center) {
        window.triggerParticleEffect(center.x, center.y, 'plant', {
          text: selectedDecoration.emoji,
          intensity: 0.75,
        });
      }
    }

    actions.addNotification({
      message: `Placed ${selectedDecoration.emoji} ${selectedDecoration.name}!`,
      type: 'success'
    });

    if (!repeatDecorPlacement) {
      actions.setSelectedDecoration(null);
    }
  }, [actions, animationsEnabled, getPlotCenter, ghostActive, pushDecorUndo, repeatDecorPlacement, selectedDecoration, state.plots]);

  const handleHarvest = useCallback((index) => {
    if (ghostActive) {
      actions.addNotification({ message: 'Ghost Visit is read-only.', type: 'info' });
      return;
    }
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];
    const plot = plotsArray[index];
    if (!plot || plot.state !== 'ready') return;

    const crop = plot.crop;
    const baseValue = crop?.baseValue || 10;
    const earnings = calculateHarvestValue(baseValue, plot.soilFertility || 1.0, state.inventory);

    // Trigger particle effect with earnings text
    if (animationsEnabled && typeof window.triggerParticleEffect === 'function') {
      // Get plot position
      const center = getPlotCenter(index);
      if (center) {
        window.triggerParticleEffect(center.x, center.y, 'harvest', {
          text: `+${earnings}🪙`,
          value: earnings,
          intensity: earnings >= 100 ? 1.2 : 1,
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
    actions.earnMoney(earnings);
    // REBALANCED: Consistent 15% XP rate across all harvest methods
    actions.addXP(Math.floor(earnings * 0.15), { source: 'harvest', cropId: crop.id, label: `Harvest ${crop.name}` });

    // Update inventory
    actions.updateInventory((inventory) => ({
      ...inventory,
      [crop.id]: (inventory?.[crop.id] || 0) + 1
    }));

    // Reset plot
    actions.harvestCrop(index, earnings);
    setHarvestBloomTick(Date.now());
    actions.recordMemoryEvent('crop_harvested', { cropId: crop.id });
    actions.recordCozyExpansionEvent('crop_harvested', { cropId: crop.id });
    actions.recordAlmanacEvent('crop_harvested', {
      cropId: crop.id,
      season: state.season?.current,
      weather: state.weather,
    });
    actions.recordCozyGoalEvent('crop_harvested', {
      cropId: crop.id,
      season: state.season?.current,
    });
    actions.recordOnboardingEvent('harvest');

    actions.addNotification({
      message: `Harvested ${crop.emoji} ${crop.name}! +${earnings}🪙`,
      type: 'success'
    });
  }, [actions, animationsEnabled, getPlotCenter, ghostActive, state.plots, state.season?.current, state.weather, state.inventory]);

  // Bulk actions
  const handleBulkHarvest = useCallback(() => {
    let totalEarnings = 0;
    let totalXp = 0;
    let harvestedCount = 0;
    const inventoryUpdates = {};
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];

    const updatedPlots = plotsArray.map((plot, index) => {
      if (!selectedPlots.has(index) || plot?.state !== 'ready' || !plot.crop) {
        return plot;
      }

      const earnings = calculateHarvestValue(plot.crop?.baseValue || 10, plot.soilFertility || 1.0, state.inventory);
      totalEarnings += earnings;
      totalXp += Math.floor(earnings * 0.15);
      harvestedCount++;
      inventoryUpdates[plot.crop.id] = (inventoryUpdates[plot.crop.id] || 0) + 1;

      return {
        ...plot,
        state: 'empty',
        crop: null,
        plantedAt: null,
        growthStage: 0,
        waterLevel: 50,
        progress: 0,
        soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - 0.1)
      };
    });

    if (harvestedCount > 0) {
      actions.updatePlots(updatedPlots);
      setHarvestBloomTick(Date.now());
      actions.earnMoney(totalEarnings);
      actions.addXP(totalXp, { source: 'harvest', label: 'Bulk Harvest' });
      actions.updateInventory((inventory) => {
        const nextInventory = { ...(inventory || {}) };
        Object.entries(inventoryUpdates).forEach(([id, amt]) => {
          nextInventory[id] = (nextInventory[id] || 0) + amt;
        });
        return nextInventory;
      });

      Object.keys(inventoryUpdates).forEach((cropId) => {
        actions.recordCozyExpansionEvent('crop_harvested', { cropId });
        actions.recordAlmanacEvent('crop_harvested', {
          cropId,
          season: state.season?.current,
          weather: state.weather,
        });
        actions.recordCozyGoalEvent('crop_harvested', {
          cropId,
          season: state.season?.current,
        });
      });

      if (inventoryUpdates.parsnip) {
        actions.recordMemoryEvent('crop_harvested', { cropId: 'parsnip' });
      }
      if (inventoryUpdates.cranberry) {
        actions.recordMemoryEvent('crop_harvested', { cropId: 'cranberry' });
      }
      if (inventoryUpdates.snowdrop) {
        actions.recordMemoryEvent('crop_harvested', { cropId: 'snowdrop' });
      }
      if (inventoryUpdates.turnip) {
        actions.recordMemoryEvent('crop_harvested', { cropId: 'turnip' });
      }
      if (inventoryUpdates.ginger_root) {
        actions.recordMemoryEvent('crop_harvested', { cropId: 'ginger_root' });
      }

      if (typeof window.soundSystem !== 'undefined') {
        window.soundSystem.playHarvestSound();
        setTimeout(() => {
          if (typeof window.soundSystem !== 'undefined') {
            window.soundSystem.playMoneySound();
          }
        }, 300);
      }

      actions.addNotification({
        message: `Bulk harvested ${harvestedCount} crops! +${totalEarnings}🪙`,
        type: 'success'
      });

      if (animationsEnabled && typeof window.triggerParticleEffect === 'function') {
        window.triggerParticleEffect(window.innerWidth / 2, window.innerHeight * 0.35, 'harvest', {
          text: `+${totalEarnings}🪙 • ${harvestedCount} crops`,
          value: totalEarnings,
          intensity: Math.min(1.6, 1 + harvestedCount * 0.08),
          shake: false,
        });
      }

      actions.recordOnboardingEvent('harvest');
    }

    setSelectedPlots(new Set());
  }, [actions, animationsEnabled, selectedPlots, state.inventory, state.plots, state.season?.current, state.weather]);

  const handleSelectAll = useCallback(() => {
    const plotsArray = Array.isArray(state.plots) ? state.plots : [];
    setSelectedPlots(new Set(plotsArray.map((_, index) => index)));
  }, [state.plots]);

  const handleSelectReady = useCallback(() => {
    setSelectedPlots(new Set(readyPlotIndexes));
  }, [readyPlotIndexes]);

  const handleClearSelection = useCallback(() => {
    setSelectedPlots(new Set());
  }, []);

  // Generate grid based on current grid size
  const gridSize = state.gridSize || 3;

  return (
    <Card
      data-onboard="farm-grid"
      className="p-4 sm:p-6 bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-lime-50/70 relative overflow-hidden rounded-2xl shadow-lg border border-green-100/50 backdrop-blur-sm"
    >
      <div className="mb-4 text-center relative z-20">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-1.5 flex items-center justify-center gap-2">
          <span className="text-2xl sm:text-3xl filter drop-shadow-sm">🌾</span>
          Your Farm
          {selectedPlots.size > 0 && (
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white animate-pulse shadow-lg">
              {selectedPlots.size} selected
            </Badge>
          )}
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          {gridSize}×{gridSize} grid • <span className="text-emerald-600">{plotsInUseCount}</span> plots in use
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant={decorMode ? 'default' : 'outline'}
            onClick={() => actions.setDecorationMode(!decorMode)}
            className="min-h-[40px]"
          >
            {decorMode ? '🪴 Decor Mode On' : '🪴 Decor Mode'}
          </Button>
          {decorMode && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecorUndo}
                disabled={decorUndoCount === 0}
                className="min-h-[40px]"
              >
                ↩️ Undo {decorUndoCount > 0 ? `(${decorUndoCount})` : ''}
              </Button>
              <Button
                size="sm"
                variant={repeatDecorPlacement ? 'default' : 'outline'}
                onClick={() => setRepeatDecorPlacement((prev) => !prev)}
                className="min-h-[40px]"
              >
                {repeatDecorPlacement ? '🔁 Repeat On' : '🔁 Repeat Off'}
              </Button>
            </>
          )}
        </div>
        {decorMode && (
          <p className="mt-2 text-xs text-rose-600 font-semibold">
            {selectedDecoration
              ? `Selected decoration: ${selectedDecoration.emoji} ${selectedDecoration.name}`
              : 'Select a decoration from Inventory to place.'}
          </p>
        )}
      </div>

        {ghostActive && (
          <p className="mt-2 text-xs font-semibold text-indigo-700">👻 Ghost Visit (Read Only)</p>
        )}
      {/* Bulk Action Controls - Mobile optimized */}
      {(selectedPlots.size > 0 || hasReadyPlots) && (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg animate-fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-sm sm:text-base px-3 py-1">
                {selectedPlots.size} plots selected
              </Badge>
              <span className="hidden sm:inline text-sm text-gray-600">Shift+Click to multi-select</span>
              <span className="text-xs text-emerald-700 font-semibold">{readyPlotIndexes.length} ready</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleBulkHarvest}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none min-h-[44px] touch-manipulation"
                disabled={selectedPlots.size === 0}
              >
                🌾 Harvest Selected
              </Button>
              <Button
                size="sm"
                onClick={handleSelectReady}
                variant="outline"
                className="flex-1 sm:flex-none min-h-[44px] touch-manipulation"
                disabled={!hasReadyPlots}
              >
                Select Ready Crops
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
                disabled={selectedPlots.size === 0}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Farm Grid - Responsive with larger touch targets on mobile */}
      <div
        className="grid gap-1.5 sm:gap-2.5 md:gap-4 mx-auto justify-center farm-grid relative w-full"
        data-harvest-bloom={harvestBloomTick > 0 ? 'on' : 'off'}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(${gridSize >= 5 ? 52 : 56}px, 1fr))`,
          maxWidth: `min(100%, ${gridSize * 104}px)`
        }}
      >
        {harvestBloomTick > 0 && (
          <div className="harvest-bloom-overlay" key={`bloom-${harvestBloomTick}`} />
        )}
        {plots.map((plot, index) => (
          <FarmPlot
            key={index}
            plotRef={plotRefCallbacks[index]}
            plot={plot}
            index={index}
            onPlotClick={handlePlotClick}
            onPlant={handlePlant}
            onHarvest={handleHarvest}
            onDecorate={handleDecorate}
            isSelected={selectedPlots.has(index)}
            onToggleSelect={handleToggleSelect}
            selectedCrop={selectedCrop}
            selectedDecoration={selectedDecoration}
            isDecorMode={decorMode}
            seasonBonus={seasonBonus}
            growthDifficulty={growthDifficulty}
            greenhouseGrowthBonus={greenhouseGrowthBonus}
            hydroponicsGrowthBonus={hydroponicsGrowthBonus}
            hasSoilAnalyzer={hasSoilAnalyzer}
            harvestMultiplier={harvestMultiplier}
            gridSize={gridSize}
            isTrinket={Boolean(DECORATION_DATA[plot?.decorationId]?.tags?.includes('trinket'))}
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
