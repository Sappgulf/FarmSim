/**
 * SeedTray Component
 * Horizontal scrollable seed selector for quick planting
 */
import React, { memo, useMemo, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { CROPS } from '../../data/crops';

function SeedTrayComponent({ inventory, selectedSeed, onSelectSeed, onOpenShop }) {
  const [pressedSeed, setPressedSeed] = useState(null);

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

  const handleSelectSeed = (seedId) => {
    setPressedSeed(seedId);
    setTimeout(() => setPressedSeed(null), 150);
    onSelectSeed(seedId);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 p-3 shadow-lg shadow-gray-200/50">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <span className="text-sm font-bold text-gray-700">Plant Seed</span>
        </div>
        {hasSeeds && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            {availableSeeds.length} types
          </span>
        )}
      </div>

      {/* Seed list or empty state */}
      {hasSeeds ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-smart scrollbar-gutter-stable -mx-1 px-1">
          {availableSeeds.map((seed) => {
            const isSelected = selectedSeed === seed.id;
            const isPressed = pressedSeed === seed.id;
            const isLowStock = seed.count <= 3;
            return (
              <button
                key={seed.id}
                onClick={() => handleSelectSeed(seed.id)}
                className={`
                  relative flex-shrink-0 flex flex-col items-center justify-center
                  w-18 h-18 rounded-xl border-2 transition-all duration-200
                  touch-manipulation transform-gpu
                  ${isPressed ? 'scale-90' : 'active:scale-95'}
                  ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400 shadow-lg shadow-emerald-200/50 scale-105'
                      : 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 hover:border-emerald-300 hover:shadow-md hover:scale-102'
                  }
                `}
                style={{ width: '72px', height: '72px' }}
                aria-label={`Select ${seed.id} seed`}
                aria-pressed={isSelected}
              >
                {/* Glow effect for selected */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl bg-emerald-400/10 animate-pulse" />
                )}

                <span
                  className={`text-3xl drop-shadow-sm transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}
                >
                  {seed.emoji}
                </span>

                {/* Stock badge */}
                <span
                  className={`
                  absolute -bottom-1 left-1/2 -translate-x-1/2
                  text-[11px] font-bold px-2 py-0.5 rounded-full
                  ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isLowStock
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-gray-200 text-gray-600'
                  }
                `}
                >
                  {seed.count}
                </span>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md bounce-in">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <button
          onClick={onOpenShop}
          className="
            w-full flex items-center justify-center gap-3
            py-4 px-4 rounded-xl
            bg-gradient-to-r from-amber-50 to-yellow-50
            border-2 border-amber-200
            text-amber-700 font-semibold
            hover:from-amber-100 hover:to-yellow-100
            transition-all duration-200
            touch-manipulation active:scale-[0.98]
            shadow-sm hover:shadow-md
            btn-juicy
          "
        >
          <span className="text-lg">🛒</span>
          <span>No seeds! Visit Shop</span>
          <ChevronRight size={18} className="text-amber-500" />
        </button>
      )}

      {/* Selected seed info - Enhanced */}
      {hasSeeds && selectedSeed && CROPS[selectedSeed] && (
        <div className="mt-3 pt-3 border-t-2 border-gray-100 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <span className="text-2xl">{CROPS[selectedSeed].emoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 capitalize">{selectedSeed}</span>
                {CROPS[selectedSeed].rarity === 'rare' && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                    <Sparkles size={8} />
                    Rare
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                ⏱️ {CROPS[selectedSeed].secondsPerStage * CROPS[selectedSeed].stages}s to grow
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              +{CROPS[selectedSeed].baseValue}
              <span className="text-base">🪙</span>
            </span>
            <span className="text-[10px] text-gray-400 block">base value</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const SeedTray = memo(SeedTrayComponent);
