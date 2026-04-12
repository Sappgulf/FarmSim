import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
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
import { getNextGoalFromCounts } from '../../../utils/goalHints';
import { getDistrictForPlot } from '../../../utils/farmDistricts';
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
  onMoveFocus,
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
  const sharedTick = useTick();
  const district = getDistrictForPlot(gridSize, index);

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
      const now = Number.isFinite(sharedTick) ? Date.now() : Date.now();
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
      const estimatedValue = Math.max(
        1,
        Math.floor((plot.crop?.baseValue || 10) * (plot.soilFertility || 1.0) * harvestMultiplier)
      );
      return {
        emoji: plot.crop.emoji || '🌾',
        bgColor: 'bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-100',
        borderColor: 'border-amber-300',
        text: 'Harvest',
        subText: `+${estimatedValue}🪙`,
        textClassName: 'text-amber-900',
        subTextClassName: 'text-amber-700',
        animation: 'animate-pulse',
        hoverEffect: 'hover:bg-yellow-200 hover:shadow-xl hover:scale-110',
        emphasisClassName: 'ready-plot-shell shadow-[0_16px_40px_-20px_rgba(245,158,11,0.9)]'
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
  const isReadyPlot = plot?.state === 'ready';

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

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick({ shiftKey: e.shiftKey });
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onMoveFocus(index, 'right');
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onMoveFocus(index, 'left');
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onMoveFocus(index, 'up');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onMoveFocus(index, 'down');
    }
  }, [handleClick, index, onMoveFocus]);

  const ariaLabel = useMemo(() => {
    const stateLabel = plot?.state || 'empty';
    const cropLabel = plot?.crop?.name ? ` ${plot.crop.name}` : '';
    return `Plot ${index + 1}: ${stateLabel}${cropLabel}`;
  }, [index, plot?.crop?.name, plot?.state]);

  return (
    <div className="relative" ref={plotRef}>
      <Card
        className={`
          w-full aspect-square min-h-[52px] sm:min-h-[72px] md:min-h-[88px] cursor-pointer relative overflow-hidden
          transition-all-fast hover-lift
          ${display.bgColor} ${display.borderColor} border-2
          ${display.hoverEffect} active:scale-95
          ${display.animation || ''}
          ${display.emphasisClassName || ''}
          ${plot?.disease ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
          ${plot?.fertilizer > 0 ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
          ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-70 scale-105' : ''}
          ${showPreview && plot?.state === 'empty' ? 'ring-4 ring-emerald-400 ring-opacity-70' : ''}
          ${plot?.state === 'decor' ? 'shadow-inner' : ''}
          ${district?.surfaceClassName || ''}
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
        onKeyDown={handleKeyDown}
        data-plot-button="true"
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
      >
        {/* Soil fertility gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${getSoilGradient()} pointer-events-none`} />
        <div className="absolute bottom-1 right-1 rounded-full bg-white/78 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
          {district.shortLabel}
        </div>
        {isReadyPlot && <div className="harvest-ready-sheen" aria-hidden="true" />}
        {isReadyPlot && (
          <div className="absolute inset-x-2 top-2 z-20 flex items-center justify-between">
            <span className="harvest-ready-ribbon">
              Ready
            </span>
            <span className="rounded-full bg-white/88 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-700 shadow-sm">
              Tap
            </span>
          </div>
        )}

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
          <div className={`text-[10px] sm:text-xs text-center font-medium leading-tight ${display.textClassName || 'text-gray-700'}`}>
            {display.text}
          </div>
          {plot?.state === 'ready' ? (
            <ReadyCountdown readyAt={plot.readyAt} />
          ) : (
            display.subText && (
              <div className={`text-[9px] text-center font-semibold mt-0.5 ${display.subTextClassName || 'text-gray-600'}`}>
                {display.subText}
              </div>
            )
          )}
          {isReadyPlot && (
            <div className="mt-1 rounded-full bg-amber-950/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-800">
              Best next move
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
                <div>📍 District: {district.name}</div>
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
              <div className="mt-1 text-xs">📍 {district.name}</div>
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
  const actions = useGameActions();
  const seasonBonus = useGameSelector((state) => state.season?.config?.bonuses?.growthSpeed || 1.0);
  const seasonCurrent = useGameSelector((state) => state.season?.current || null);
  const weather = useGameSelector((state) => state.weather || 'sunny');
  const level = useGameSelector((state) => state.level || 1);
  const inventory = useGameSelector((state) => state.inventory || {});
  const coins = useGameSelector((state) => state.coins || 0);
  const gridSize = useGameSelector((state) => state.gridSize || 3);
  const animationsEnabled = useGameSelector((state) => state.settings?.animationsEnabled !== false);
  const showTooltips = useGameSelector((state) => state.settings?.showTooltips !== false);
  const decorMode = useGameSelector((state) => Boolean(state.decorateMode));
  const selectedDecorationId = useGameSelector((state) => state.selectedDecoration || null);
  const selectedCropId = useGameSelector((state) => state.selectedCrop || null);
  const dismissedDecorHint = useGameSelector((state) => Boolean(state.cozyExpansion?.contextHints?.dismissed?.decor_mode_intro));
  const dismissedHarvestHint = useGameSelector((state) => Boolean(state.cozyExpansion?.contextHints?.dismissed?.harvest_ready));
  const ghostActive = useGameSelector((state) => Boolean(state.ghostVisit?.active));
  const ghostSnapshotPlots = useGameSelector((state) => state.ghostVisit?.snapshot?.plots);
  const farmPlots = useGameSelector((state) => (Array.isArray(state.plots) ? state.plots : []));

  const growthDifficulty = getDifficultyModifier(level).growthTime || 1.0;
  const greenhouseGrowthBonus = getMiniGreenhouseGrowthBonus(inventory);
  const hydroponicsGrowthBonus = getHydroponicsGrowthBonus(inventory);
  const hasSoilAnalyzer = getSoilAnalyzerEnabled(inventory);
  const harvestMultiplier = getHarvestMultiplier(inventory);
  const [selectedPlots, setSelectedPlots] = useState(new Set());
  const [decorUndoCount, setDecorUndoCount] = useState(0);
  const [repeatDecorPlacement, setRepeatDecorPlacement] = useState(true);
  const [harvestBloomTick, setHarvestBloomTick] = useState(0);
  const harvestBloomTimerRef = useRef(null);
  const plotRefs = useRef([]);
  const decorUndoStack = useRef([]);
  const selectedDecoration = selectedDecorationId ? DECORATION_DATA[selectedDecorationId] : null;
  const plots = ghostActive
    ? (Array.isArray(ghostSnapshotPlots) ? ghostSnapshotPlots : [])
    : farmPlots;
  const selectedCrop = useMemo(
    () => CROP_DATA[selectedCropId] || CROP_LIST[0],
    [selectedCropId]
  );

  const getPlotCenter = useCallback((index) => {
    const plotNode = plotRefs.current[index];
    if (!plotNode) return null;
    const rect = plotNode.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);
  const plotRefCallbacks = useMemo(() => {
    // Stable per-index ref callbacks so FarmPlot memo isn't defeated by a new function every render.
    return Array.from({ length: plots.length }, (_, index) => (el) => {
      plotRefs.current[index] = el;
    });
  }, [plots.length]);
  const plotsInUseCount = useMemo(
    () => plots.reduce((count, plot) => (plot?.state !== 'empty' ? count + 1 : count), 0),
    [plots]
  );
  const emptyPlotCount = Math.max(0, plots.length - plotsInUseCount);
  const readyPlotIndexes = useMemo(() => {
    const indexes = [];
    plots.forEach((plot, index) => {
      if (plot?.state === 'ready' && plot.crop) indexes.push(index);
    });
    return indexes;
  }, [plots]);
  const hasReadyPlots = readyPlotIndexes.length > 0;
  const nextGoal = useMemo(() => (
    getNextGoalFromCounts({
      active: plotsInUseCount,
      ready: readyPlotIndexes.length,
      empty: emptyPlotCount,
      coins,
      level,
    })
  ), [coins, emptyPlotCount, level, plotsInUseCount, readyPlotIndexes.length]);
  const farmAtmosphere = useMemo(() => {
    const seasonKey = String(seasonCurrent || 'spring').toLowerCase();
    const weatherKey = String(weather || 'sunny').toLowerCase();
    const seasonThemes = {
      spring: {
        emoji: '🌸',
        label: 'Spring Pulse',
        className: 'from-rose-50 via-pink-50 to-emerald-50',
        shellClassName: 'farm-field-shell--spring',
        gridClassName: 'farm-grid-surface--spring',
        hint: 'Fast sprouting and fresh growth.',
      },
      summer: {
        emoji: '☀️',
        label: 'Summer Heat',
        className: 'from-amber-50 via-yellow-50 to-orange-50',
        shellClassName: 'farm-field-shell--summer',
        gridClassName: 'farm-grid-surface--summer',
        hint: 'High yield potential with steady water.',
      },
      autumn: {
        emoji: '🍂',
        label: 'Autumn Harvest',
        className: 'from-orange-50 via-amber-50 to-red-50',
        shellClassName: 'farm-field-shell--autumn',
        gridClassName: 'farm-grid-surface--autumn',
        hint: 'Prime season for dependable harvest cycles.',
      },
      winter: {
        emoji: '❄️',
        label: 'Winter Watch',
        className: 'from-sky-50 via-cyan-50 to-indigo-50',
        shellClassName: 'farm-field-shell--winter',
        gridClassName: 'farm-grid-surface--winter',
        hint: 'Growth slows; protect crop health.',
      },
    };
    const weatherMood = {
      sunny: { emoji: '☀️', note: 'Sunlight boost active' },
      rainy: { emoji: '🌧️', note: 'Rain support active' },
      cloudy: { emoji: '☁️', note: 'Balanced field conditions' },
      stormy: { emoji: '⛈️', note: 'Risky weather, keep crops stable' },
      windy: { emoji: '💨', note: 'Wind stress on tender crops' },
      drought: { emoji: '🏜️', note: 'Hydration pressure increased' },
      snow: { emoji: '❄️', note: 'Cold weather growth penalty' },
      foggy: { emoji: '🌫️', note: 'Mild growth, high humidity' },
    };
    const seasonTheme = seasonThemes[seasonKey] || seasonThemes.spring;
    const weatherTheme = weatherMood[weatherKey] || weatherMood.sunny;
    const growthStateLabel = seasonBonus >= 1.15 ? 'Growth pace: Accelerated' : seasonBonus >= 1 ? 'Growth pace: Stable' : 'Growth pace: Reduced';

    return {
      seasonEmoji: seasonTheme.emoji,
      seasonLabel: seasonTheme.label,
      weatherEmoji: weatherTheme.emoji,
      weatherLabel: weatherTheme.note,
      growthStateLabel,
      className: seasonTheme.className,
      shellClassName: seasonTheme.shellClassName,
      gridClassName: seasonTheme.gridClassName,
      hint: seasonTheme.hint,
    };
  }, [seasonBonus, seasonCurrent, weather]);

  useEffect(() => () => {
    if (harvestBloomTimerRef.current) {
      clearTimeout(harvestBloomTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!showTooltips || !decorMode || dismissedDecorHint || ghostActive) return;
    actions.addNotification({
      message: '💡 Decor mode tip: Place trinkets and decor on empty plots. Tap a decor plot to pick it back up.',
      type: 'info'
    });
    actions.recordCozyExpansionEvent('context_hint_seen', { id: 'decor_mode_intro' });
  }, [actions, decorMode, dismissedDecorHint, ghostActive, showTooltips]);

  useEffect(() => {
    if (!showTooltips || !hasReadyPlots || dismissedHarvestHint || ghostActive) return;
    actions.addNotification({
      message: '💡 Harvest tip: Use “Select Ready” to gather mature crops faster.',
      type: 'info'
    });
    actions.recordCozyExpansionEvent('context_hint_seen', { id: 'harvest_ready' });
  }, [actions, dismissedHarvestHint, ghostActive, hasReadyPlots, showTooltips]);

  useEffect(() => {
    if (!harvestBloomTick) return;
    if (harvestBloomTimerRef.current) clearTimeout(harvestBloomTimerRef.current);
    harvestBloomTimerRef.current = setTimeout(() => setHarvestBloomTick(0), 550);
  }, [harvestBloomTick]);

  const pushDecorUndo = useCallback((entry) => {
    decorUndoStack.current = [entry, ...decorUndoStack.current].slice(0, 5);
    setDecorUndoCount(decorUndoStack.current.length);
  }, []);

  const handleMoveFocus = useCallback((index, direction) => {
    const columns = gridSize;
    const row = Math.floor(index / columns);
    const col = index % columns;
    let nextIndex = index;

    if (direction === 'left') {
      if (col === 0) return;
      nextIndex = index - 1;
    }
    if (direction === 'right') {
      if (col === columns - 1) return;
      nextIndex = index + 1;
    }
    if (direction === 'up') {
      if (row === 0) return;
      nextIndex = index - columns;
    }
    if (direction === 'down') {
      const maxRow = Math.floor((plots.length - 1) / columns);
      if (row >= maxRow) return;
      nextIndex = index + columns;
    }

    if (nextIndex < 0 || nextIndex >= plots.length) return;
    const nextNode = plotRefs.current[nextIndex];
    if (!nextNode) return;

    const focusTarget = nextNode.querySelector('[data-plot-button="true"]');
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus();
    }
  }, [gridSize, plots.length]);

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
      const plotsArray = farmPlots;
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
  }, [actions, farmPlots]);

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
    if (coins >= selectedCrop.cost) {
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
  }, [actions, animationsEnabled, coins, getPlotCenter, ghostActive, plots, selectedCrop]);

  const handleDecorate = useCallback((index) => {
    if (ghostActive) return;
    const plotsArray = farmPlots;
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
  }, [actions, animationsEnabled, farmPlots, getPlotCenter, ghostActive, pushDecorUndo, repeatDecorPlacement, selectedDecoration]);

  const handleHarvest = useCallback((index) => {
    if (ghostActive) {
      actions.addNotification({ message: 'Ghost Visit is read-only.', type: 'info' });
      return;
    }
    const plotsArray = farmPlots;
    const plot = plotsArray[index];
    if (!plot || plot.state !== 'ready') return;

    const crop = plot.crop;
    const baseValue = crop?.baseValue || 10;
    const earnings = calculateHarvestValue(baseValue, plot.soilFertility || 1.0, inventory);

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
      season: seasonCurrent,
      weather,
    });
    actions.recordCozyGoalEvent('crop_harvested', {
      cropId: crop.id,
      season: seasonCurrent,
    });
    actions.recordOnboardingEvent('harvest');

    actions.addNotification({
      message: `Harvested ${crop.emoji} ${crop.name}! +${earnings}🪙`,
      type: 'success'
    });
  }, [actions, animationsEnabled, farmPlots, getPlotCenter, ghostActive, inventory, seasonCurrent, weather]);

  // Bulk actions
  const handleBulkHarvest = useCallback(() => {
    let totalEarnings = 0;
    let totalXp = 0;
    let harvestedCount = 0;
    const inventoryUpdates = {};
    const plotsArray = farmPlots;

    const updatedPlots = plotsArray.map((plot, index) => {
      if (!selectedPlots.has(index) || plot?.state !== 'ready' || !plot.crop) {
        return plot;
      }

      const earnings = calculateHarvestValue(plot.crop?.baseValue || 10, plot.soilFertility || 1.0, inventory);
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
          season: seasonCurrent,
          weather,
        });
        actions.recordCozyGoalEvent('crop_harvested', {
          cropId,
          season: seasonCurrent,
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
  }, [actions, animationsEnabled, farmPlots, inventory, seasonCurrent, selectedPlots, weather]);

  const handleSelectAll = useCallback(() => {
    setSelectedPlots(new Set(farmPlots.map((_, index) => index)));
  }, [farmPlots]);

  const handleSelectReady = useCallback(() => {
    setSelectedPlots(new Set(readyPlotIndexes));
  }, [readyPlotIndexes]);

  const handleClearSelection = useCallback(() => {
    setSelectedPlots(new Set());
  }, []);

  return (
    <Card
      data-onboard="farm-grid"
      className={`p-4 sm:p-6 relative overflow-hidden rounded-2xl shadow-lg border border-green-100/50 backdrop-blur-sm farm-field-shell ${farmAtmosphere.shellClassName}`}
    >
      <div className="mb-4 text-center relative z-20">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl filter drop-shadow-sm">🌾</span>
            Your Farm
          </h2>
          {selectedPlots.size > 0 && (
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white animate-pulse shadow-lg">
              {selectedPlots.size} selected
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/80 text-emerald-700 border-emerald-200">
            {gridSize}×{gridSize} · {plotsInUseCount} active
          </Badge>
        </div>
        <div className={`mt-3 rounded-xl border border-white/70 bg-gradient-to-r ${farmAtmosphere.className} px-3 py-2 shadow-sm`}>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              {farmAtmosphere.seasonEmoji} {farmAtmosphere.seasonLabel}
            </span>
            <span className="text-gray-600 flex items-center gap-1">
              {farmAtmosphere.weatherEmoji} {farmAtmosphere.weatherLabel}
            </span>
            <span className="text-emerald-700 font-medium">{farmAtmosphere.growthStateLabel}</span>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-100 bg-white/78 px-3 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            <Badge className="bg-emerald-600 text-white shadow-sm">{nextGoal.emoji} {nextGoal.text}</Badge>
            {selectedCrop && !decorMode && (
              <span className="font-medium text-gray-700">
                Seed: <span className="text-emerald-700">{selectedCrop.emoji} {selectedCrop.name}</span>
              </span>
            )}
            <span className="text-gray-500">{farmAtmosphere.hint}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant={decorMode ? 'default' : 'outline'}
            onClick={() => actions.setDecorationMode(!decorMode)}
            className="min-h-[44px]"
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
                className="min-h-[44px]"
              >
                ↩️ Undo {decorUndoCount > 0 ? `(${decorUndoCount})` : ''}
              </Button>
              <Button
                size="sm"
                variant={repeatDecorPlacement ? 'default' : 'outline'}
                onClick={() => setRepeatDecorPlacement((prev) => !prev)}
                className="min-h-[44px]"
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
              : 'Pick decor from Inventory to place.'}
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
        className={`grid gap-1.5 sm:gap-2.5 md:gap-4 mx-auto justify-center farm-grid relative w-full rounded-[1.5rem] p-2.5 sm:p-4 border border-white/70 shadow-inner ${farmAtmosphere.gridClassName}`}
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
            onMoveFocus={handleMoveFocus}
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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-gray-600">
        {gridSize < 5 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
            Expand for more plots
          </span>
        )}
        <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5">
          {readyPlotIndexes.length} ready now
        </span>
        <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 hidden sm:inline-flex">
          Shift + Click selects
        </span>
        <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 sm:hidden">
          Hold for details
        </span>
        <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5">
          Tap empty soil to plant
        </span>
      </div>

    </Card>
  );
});

FarmGrid.displayName = 'FarmGrid';
export default FarmGrid;
