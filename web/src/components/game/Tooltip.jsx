/**
 * Tooltip Component
 * Rich information tooltips for crops, buildings, items
 */
import React, { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Coins, Star, Leaf, Droplet, Zap, TrendingUp, Info } from 'lucide-react';
import { CROPS, QUALITY_TIERS, RARITY_COLORS, CROP_FAMILIES, ALL_CROPS } from '../../data/crops';
import { BUILDINGS } from '../../data/buildings';
import { formatDisplayLabel } from '../../utils/textFormat';

// Flavor text for crops
const CROP_DESCRIPTIONS = {
  carrot: 'A crunchy orange root vegetable. Quick to grow and always in demand at the market.',
  potato: 'The humble potato - versatile and filling. Grows well in cooler weather.',
  corn: 'Tall golden stalks perfect for summer fields. Valuable and satisfying to harvest.',
  tomato: 'Juicy red tomatoes bursting with flavor. A summer garden staple.',
  strawberry: 'Sweet ruby-red berries that fetch premium prices. Worth the wait!',
  pumpkin: 'The king of the fall harvest. Takes time but the payout is legendary.',
  sunflower: 'Bright and cheerful flowers that follow the sun. Bees love them!',
  lettuce: 'Crisp leafy greens that grow lightning fast. Perfect for quick profits.',
  bellPepper: 'Colorful peppers that add crunch to any dish. Summer favorite.',
  garlic: "Pungent bulbs with natural pest-repelling properties. Fall's hidden gem.",
  // Mutations
  golden_carrot: 'A rare golden variety with enhanced nutritional value!',
  super_carrot: 'Genetically superior carrot that grows incredibly fast.',
  frost_potato: 'Hardy potato that thrives even in freezing conditions.',
  rainbow_corn: 'Spectacular multicolored kernels that dazzle and delight.',
  giant_corn: 'Massive ears of corn that tower above the rest!',
  golden_tomato: 'Luxurious golden tomatoes sought by gourmet chefs.',
  golden_strawberry: 'Exquisite golden berries - the crown jewel of any farm.',
  giant_pumpkin: 'A legendary pumpkin of enormous proportions!',
  golden_sunflower: 'Radiant golden petals that shimmer in the light.',
  dragon_pepper: 'Fiery legendary pepper with an otherworldly kick!',
};

// Building tips
const BUILDING_TIPS = {
  barn: 'Tip: Store your most valuable crops here for bonus value.',
  greenhouse: 'Tip: Perfect for growing winter crops year-round.',
  silo: "Tip: Works best when you're actively harvesting.",
  workshop: 'Tip: Process crops into goods for 2-4x the base value!',
  windmill: 'Tip: Passive income adds up - check back often!',
  beehive: 'Tip: Place near flowers for maximum pollination.',
  well: 'Tip: Saves time on watering during dry spells.',
  compost: 'Tip: Converts harvested waste into free fertilizer.',
};

function TooltipContent({ type, data, children }) {
  if (type === 'crop') {
    const crop = ALL_CROPS[data.id] || data;
    const description = CROP_DESCRIPTIONS[data.id] || 'A valuable crop.';
    const family = CROP_FAMILIES[crop.family];
    const growTime = crop.stages * crop.secondsPerStage;

    return (
      <div className="min-w-[240px] max-w-[280px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
          <span className="text-3xl">{crop.emoji}</span>
          <div>
            <h4 className="font-bold text-gray-900">{formatDisplayLabel(data.id)}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${RARITY_COLORS[crop.rarity]}`}>
              {crop.rarity}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
            <Clock size={14} className="text-blue-500" />
            <span className="text-gray-700">{growTime}s grow</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-gray-700">{crop.baseValue} coins</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
            <Leaf size={14} className="text-green-500" />
            <span className="text-gray-700">{crop.stages} stages</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
            <Star size={14} className="text-purple-500" />
            <span className="text-gray-700">{crop.season}</span>
          </div>
        </div>

        {/* Family info */}
        {family && (
          <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-2">
            <div className="flex items-center gap-1 font-medium text-emerald-700 mb-1">
              {family.emoji} {crop.family.charAt(0).toUpperCase() + crop.family.slice(1)} Family
            </div>
            <div className="text-emerald-600">Benefit: {formatDisplayLabel(family.benefit)}</div>
          </div>
        )}

        {/* Quality tiers */}
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1 font-medium">
            <TrendingUp size={12} /> Possible Qualities:
          </div>
          <div className="flex gap-1">
            {Object.values(QUALITY_TIERS).map((tier) => (
              <span key={tier.id} className={`${tier.color} px-1.5 py-0.5 bg-gray-100 rounded`}>
                {tier.name} ({tier.multiplier}x)
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'building') {
    const building = BUILDINGS[data.id] || data;
    const tip = BUILDING_TIPS[data.id];

    return (
      <div className="min-w-[220px] max-w-[260px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
          <span className="text-3xl">{building.emoji}</span>
          <div>
            <h4 className="font-bold text-gray-900">{building.name}</h4>
            <span className="text-xs text-gray-500">{building.category}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{building.description}</p>

        {/* Stats */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm bg-amber-50 rounded-lg p-2">
            <span className="text-amber-700 flex items-center gap-1">
              <Coins size={14} /> Cost
            </span>
            <span className="font-bold text-amber-800">{building.price} coins</span>
          </div>
          <div className="flex items-center justify-between text-sm bg-green-50 rounded-lg p-2">
            <span className="text-green-700 flex items-center gap-1">
              <Zap size={14} /> Effect
            </span>
            <span className="font-bold text-green-800">{building.shortEffect}</span>
          </div>
        </div>

        {/* Tip */}
        {tip && (
          <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-2 flex gap-2">
            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-blue-700">{tip}</span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'quality') {
    const tier = data;
    return (
      <div className="min-w-[180px]">
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-bold ${tier.color}`}>
            {tier.emoji || '○'} {tier.name}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{tier.multiplier}x coin multiplier on harvest</p>
        <div className="text-xs text-gray-500">Better quality = more coins!</div>
      </div>
    );
  }

  // Generic tooltip
  return children;
}

function TooltipComponent({
  children,
  type,
  data,
  content,
  position = 'top',
  delay = 200,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top, left;

        switch (position) {
          case 'bottom':
            top = rect.bottom + scrollY + 8;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.left + scrollX - 8;
            break;
          case 'right':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.right + scrollX + 8;
            break;
          default: // top
            top = rect.top + scrollY - 8;
            left = rect.left + scrollX + rect.width / 2;
        }

        setTooltipPosition({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return '-translate-x-1/2 mt-0';
      case 'left':
        return '-translate-y-1/2 -translate-x-full';
      case 'right':
        return '-translate-y-1/2';
      default: // top
        return '-translate-x-1/2 -translate-y-full';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className={`
            fixed z-[200] pointer-events-none
            bg-white rounded-xl shadow-2xl border border-gray-200 p-4
            animate-tooltip-in
            ${getPositionClasses()}
          `}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {content || <TooltipContent type={type} data={data} />}

            {/* Arrow */}
            <div
              className={`
              absolute w-3 h-3 bg-white border-gray-200 rotate-45
              ${position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-r border-b' : ''}
              ${position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-l border-t' : ''}
              ${position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-r border-t' : ''}
              ${position === 'right' ? 'left-[-6px] top-1/2 -translate-y-1/2 border-l border-b' : ''}
            `}
            />
          </div>,
          document.body
        )}

      <style>{`
        @keyframes tooltip-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) scale(1);
          }
        }
        .animate-tooltip-in {
          animation: tooltip-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
}

export const Tooltip = memo(TooltipComponent);
