/**
 * StatsBar Component
 * Top header showing coins, level, weather, season
 */
import React, { memo, useMemo } from 'react';
import { Coins, Target, TrendingUp } from 'lucide-react';
import { formatTimeRemaining } from '../../utils/time.mjs';
import { nowSec } from '../../utils/time.mjs';

function StatsBarComponent({
  coins,
  level,
  levelId,
  levelStatus,
  levelEndsAt,
  currentSeason,
  seasonData,
  currentWeather,
  weatherData,
  comboCount,
  comboMultiplier,
  prestige,
  prestigeData,
}) {
  const now = nowSec();
  const timeRemaining = levelEndsAt > 0 ? formatTimeRemaining(levelEndsAt, now) : null;
  const progress = level ? Math.min((coins / level.targetCoins) * 100, 100) : 0;

  const isLowTime = levelEndsAt > 0 && (levelEndsAt - now) < 60;
  const isVeryLowTime = levelEndsAt > 0 && (levelEndsAt - now) < 30;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4">
      {/* Main stats row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Coins */}
        <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
          <Coins size={18} className="text-amber-500" />
          <span className="font-bold text-amber-700 tabular-nums">{coins}</span>
          {comboCount > 1 && (
            <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium combo-badge">
              {comboMultiplier.toFixed(1)}x
            </span>
          )}
        </div>

        {/* Weather & Season */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${seasonData?.bgColor || 'bg-gray-50'} border ${seasonData?.borderColor || 'border-gray-200'}`}>
            <span className="text-lg">{seasonData?.emoji}</span>
            <span className={`text-sm font-medium ${seasonData?.color || 'text-gray-600'}`}>
              {seasonData?.name}
            </span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${weatherData?.bgColor || 'bg-gray-50'}`}>
            <span className="text-lg">{weatherData?.emoji}</span>
          </div>
        </div>

        {/* Prestige */}
        {prestige > 0 && (
          <div className="flex items-center gap-1 bg-purple-50 rounded-lg px-2 py-1 border border-purple-200">
            <span>{prestigeData?.emoji}</span>
            <span className="text-xs font-medium text-purple-700">{prestigeData?.multiplier}x</span>
          </div>
        )}
      </div>

      {/* Level progress (if not endless) */}
      {levelId !== 'endless' && level && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-blue-500" />
              <span className="font-medium text-gray-700">{level.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 tabular-nums">{coins}/{level.targetCoins}</span>
              {timeRemaining && (
                <span className={`
                  font-mono text-sm px-2 py-0.5 rounded
                  ${isVeryLowTime ? 'bg-red-100 text-red-700' : isLowTime ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  {timeRemaining}
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Endless mode indicator */}
      {levelId === 'endless' && (
        <div className="mt-2 flex items-center gap-2 text-purple-600">
          <span className="text-lg">♾️</span>
          <span className="text-sm font-medium">Endless Mode</span>
          <span className="text-xs text-purple-500 ml-auto">Total: {coins}🪙</span>
        </div>
      )}

      {/* Level complete/lost indicators */}
      {levelStatus === 'won' && (
        <div className="mt-2 bg-green-100 text-green-700 rounded-lg px-3 py-2 text-center text-sm font-medium">
          🎉 Level Complete!
        </div>
      )}
      {levelStatus === 'lost' && (
        <div className="mt-2 bg-red-100 text-red-700 rounded-lg px-3 py-2 text-center text-sm font-medium">
          ⏰ Time's Up!
        </div>
      )}
    </div>
  );
}

export const StatsBar = memo(StatsBarComponent);
