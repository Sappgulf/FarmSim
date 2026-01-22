/**
 * SeedTray Component
 * Horizontal scrollable seed selector for quick planting
 */
import React, { memo, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { CROPS } from '../../data/crops';

function SeedTrayComponent({
  inventory,
  selectedSeed,
  onSelectSeed,
  onOpenShop,
}) {
  // Get seeds with stock
  const availableSeeds = useMemo(() => {
    return Object.entries(CROPS)
      .filter(([id]) => (inventory[id] || 0) > 0)
      .map(([id, crop]) => ({
        id,
        ...crop,
        count: inventory[id] || 0,
      }));
  }, [inventory]);

  const hasSeeds = availableSeeds.length > 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-2 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-medium text-gray-500">Plant Seed</span>
        {hasSeeds && (
          <span className="text-[10px] text-gray-400">
            {availableSeeds.length} types
          </span>
        )}
      </div>

      {/* Seed list or empty state */}
      {hasSeeds ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {availableSeeds.map((seed) => {
            const isSelected = selectedSeed === seed.id;
            return (
              <button
                key={seed.id}
                onClick={() => onSelectSeed(seed.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center
                  w-16 h-16 rounded-lg border-2 transition-all
                  touch-manipulation active:scale-95
                  ${isSelected
                    ? 'bg-emerald-50 border-emerald-400 shadow-md shadow-emerald-100'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }
                `}
                aria-label={`Select ${seed.id} seed`}
                aria-pressed={isSelected}
              >
                <span className="text-2xl">{seed.emoji}</span>
                <span className={`
                  text-[10px] font-medium mt-0.5
                  ${isSelected ? 'text-emerald-700' : 'text-gray-500'}
                `}>
                  {seed.count}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <button
          onClick={onOpenShop}
          className="
            w-full flex items-center justify-center gap-2
            py-3 px-4 rounded-lg
            bg-amber-50 border border-amber-200
            text-amber-700 text-sm font-medium
            hover:bg-amber-100 transition-colors
            touch-manipulation active:scale-[0.98]
          "
        >
          <span>No seeds! Visit Shop</span>
          <ChevronRight size={16} />
        </button>
      )}

      {/* Selected seed info */}
      {hasSeeds && selectedSeed && CROPS[selectedSeed] && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{CROPS[selectedSeed].emoji}</span>
            <div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {selectedSeed}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {CROPS[selectedSeed].secondsPerStage * CROPS[selectedSeed].stages}s grow
              </span>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-medium">
            +{CROPS[selectedSeed].baseValue}🪙
          </span>
        </div>
      )}
    </div>
  );
}

export const SeedTray = memo(SeedTrayComponent);
