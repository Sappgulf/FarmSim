/**
 * TimeDisplay Component
 * Shows current game time with day/night indicator
 */
import React, { memo } from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

function TimeDisplayComponent({ timeDisplay, currentPeriod, compact = false }) {
  const getPeriodIcon = () => {
    switch (currentPeriod?.id) {
      case 'dawn':
        return <Sunrise className="text-orange-400" size={compact ? 14 : 16} />;
      case 'morning':
        return <Sun className="text-yellow-500" size={compact ? 14 : 16} />;
      case 'afternoon':
        return <Sun className="text-amber-500" size={compact ? 14 : 16} />;
      case 'evening':
        return <Sunset className="text-orange-500" size={compact ? 14 : 16} />;
      case 'night':
        return <Moon className="text-indigo-400" size={compact ? 14 : 16} />;
      default:
        return <Clock className="text-gray-500" size={compact ? 14 : 16} />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {getPeriodIcon()}
        <span className="font-mono">{timeDisplay}</span>
      </div>
    );
  }

  return (
    <div
      className={`
      flex items-center gap-2 px-3 py-1.5 rounded-lg
      ${
        currentPeriod?.id === 'night'
          ? 'bg-indigo-100 text-indigo-700'
          : 'bg-amber-50 text-amber-700'
      }
    `}
    >
      {getPeriodIcon()}
      <div className="flex flex-col">
        <span className="font-mono text-sm font-medium">{timeDisplay}</span>
        <span className="text-xs opacity-75">{currentPeriod?.name}</span>
      </div>
      {currentPeriod?.effects && (
        <div className="ml-2 pl-2 border-l border-current/20 text-xs opacity-75">
          {currentPeriod.effects.growthBonus && currentPeriod.effects.growthBonus !== 1 && (
            <div>
              {currentPeriod.effects.growthBonus > 1 ? '+' : ''}
              {Math.round((currentPeriod.effects.growthBonus - 1) * 100)}% growth
            </div>
          )}
          {currentPeriod.effects.harvestBonus && currentPeriod.effects.harvestBonus !== 1 && (
            <div>+{Math.round((currentPeriod.effects.harvestBonus - 1) * 100)}% harvest</div>
          )}
        </div>
      )}
    </div>
  );
}

export const TimeDisplay = memo(TimeDisplayComponent);
