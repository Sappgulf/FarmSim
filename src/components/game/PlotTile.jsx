/**
 * PlotTile Component
 * Individual farm plot with crop display and interactions
 */
import React, { useMemo, memo } from 'react';
import { Droplets, Bug, AlertTriangle } from 'lucide-react';

const GROWTH_EMOJIS = {
  0: '🌱',
  1: '🌿',
  2: '🪴',
  3: '🌾',
};

function PlotTileComponent({
  plot,
  index,
  cropData,
  status,
  progress,
  stage,
  onPlant,
  onHarvest,
  onWater,
  onTreatPest,
  onTreatDisease,
  onFertilize,
  disabled = false,
}) {
  // Determine visual state
  const visualState = useMemo(() => {
    if (!plot.crop) return 'empty';
    if (plot.hasPest) return 'pest';
    if (plot.hasDisease) return 'disease';
    if (status === 'ready') return 'ready';
    return 'growing';
  }, [plot.crop, plot.hasPest, plot.hasDisease, status]);

  // Get display emoji
  const displayEmoji = useMemo(() => {
    if (!plot.crop || !cropData) {
      return '🟫'; // Empty plot
    }

    if (status === 'ready') {
      return cropData.emoji;
    }

    // Growing stages
    return GROWTH_EMOJIS[Math.min(stage, 3)] || '🌱';
  }, [plot.crop, cropData, status, stage]);

  // Handle click
  const handleClick = () => {
    if (disabled) return;

    if (!plot.crop) {
      onPlant?.(index);
      return;
    }

    if (plot.hasPest) {
      onTreatPest?.(index);
      return;
    }

    if (plot.hasDisease) {
      onTreatDisease?.(index);
      return;
    }

    if (status === 'ready') {
      onHarvest?.(index);
      return;
    }

    // Growing - offer water
    onWater?.(index);
  };

  // Base classes
  const baseClasses = `
    relative w-full aspect-square rounded-lg border-2 cursor-pointer
    transition-all duration-200 ease-out
    flex flex-col items-center justify-center
    text-2xl sm:text-3xl
    select-none
    active:scale-95
    plot-enhanced
  `;

  // State-specific classes
  const stateClasses = {
    empty: 'bg-amber-100/80 border-amber-300 hover:bg-amber-200/80 hover:border-amber-400',
    growing: 'bg-green-100/80 border-green-300 hover:bg-green-200/80',
    ready: 'bg-emerald-100 border-emerald-400 shadow-lg shadow-emerald-200/50 ready',
    pest: 'bg-red-100/80 border-red-400 infested',
    disease: 'bg-purple-100/80 border-purple-400 diseased',
  };

  // Watered indicator
  const isWatered = plot.wateredAt && (Date.now() / 1000 - plot.wateredAt) < 30;

  // Fertilized indicator
  const isFertilized = plot.fertilizedCount > 0;

  // Pollinated indicator
  const isPollinated = plot.pollinated;

  return (
    <div
      className={`${baseClasses} ${stateClasses[visualState]}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={plot.crop ? `${plot.crop} - ${status}` : 'Empty plot'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Main emoji display */}
      <span className={`
        transition-transform duration-200
        ${status === 'ready' ? 'animate-pulse' : ''}
        ${visualState === 'growing' ? 'growing-breathe' : ''}
      `}>
        {displayEmoji}
      </span>

      {/* Progress bar for growing crops */}
      {plot.crop && status !== 'ready' && progress < 1 && (
        <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-gray-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute top-1 right-1 flex gap-0.5">
        {isWatered && (
          <span className="w-4 h-4 flex items-center justify-center bg-blue-100 rounded-full" title="Watered">
            <Droplets size={10} className="text-blue-500" />
          </span>
        )}
        {isFertilized && (
          <span className="w-4 h-4 flex items-center justify-center bg-yellow-100 rounded-full text-[8px]" title="Fertilized">
            ✨
          </span>
        )}
        {isPollinated && (
          <span className="w-4 h-4 flex items-center justify-center bg-amber-100 rounded-full text-[8px]" title="Pollinated">
            🐝
          </span>
        )}
      </div>

      {/* Pest/Disease overlay */}
      {plot.hasPest && (
        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
          <Bug size={24} className="text-red-600 animate-pulse" />
        </div>
      )}
      {plot.hasDisease && (
        <div className="absolute inset-0 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <AlertTriangle size={24} className="text-purple-600 animate-pulse" />
        </div>
      )}

      {/* Ready glow effect */}
      {status === 'ready' && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-400 ring-opacity-75 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

export const PlotTile = memo(PlotTileComponent);
