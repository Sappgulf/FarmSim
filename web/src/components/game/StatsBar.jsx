/**
 * StatsBar Component
 * Top header showing coins, level, weather, season
 */
import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import { Target, Zap, Crown, HelpCircle, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { formatTimeRemaining } from '../../utils/time.mjs';
import { nowSec } from '../../utils/time.mjs';

// Animated number counter component
function AnimatedCounter({ value, duration = 300 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const diff = value - prevValueRef.current;

      setIsAnimating(true);

      // Animate the number change
      const startValue = prevValueRef.current;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + diff * easeProgress);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          setTimeout(() => setIsAnimating(false), 100);
        }
      };

      requestAnimationFrame(animate);
      prevValueRef.current = value;
    }
  }, [value, duration]);

  const animationClass = isAnimating ? (value > prevValueRef.current ? 'counter-bump' : 'shake') : '';

  return (
    <span className={`inline-block ${animationClass}`}>
      {displayValue.toLocaleString()}
    </span>
  );
}

// Coin icon with spin animation
function AnimatedCoinIcon({ spinning }) {
  return (
    <span className={`inline-flex ${spinning ? 'coin-icon-spin' : ''}`}>
      🪙
    </span>
  );
}

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
  timeDisplay,
  currentPeriod,
  moodTier,
  activeBlessing,
  onShowHelp,
}) {
  const now = nowSec();
  const timeRemaining = levelEndsAt > 0 ? formatTimeRemaining(levelEndsAt, now) : null;
  const progress = level ? Math.min((coins / level.targetCoins) * 100, 100) : 0;

  const isLowTime = levelEndsAt > 0 && (levelEndsAt - now) < 60;
  const isVeryLowTime = levelEndsAt > 0 && (levelEndsAt - now) < 30;

  // Track coin changes for animation
  const [coinSpinning, setCoinSpinning] = useState(false);
  const prevCoinsRef = useRef(coins);

  useEffect(() => {
    if (coins > prevCoinsRef.current) {
      setCoinSpinning(true);
      setTimeout(() => setCoinSpinning(false), 400);
    }
    prevCoinsRef.current = coins;
  }, [coins]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 p-3 sm:p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl px-4 py-2 border border-amber-200/80 shadow-sm shadow-amber-100">
            <AnimatedCoinIcon spinning={coinSpinning} />
            <span className="font-bold text-amber-700 tabular-nums text-lg">
              <AnimatedCounter value={coins} />
            </span>
            {comboCount > 1 && (
              <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full font-bold shadow-sm combo-badge flex items-center gap-1">
                <Zap size={10} className="fill-current" />
                {comboMultiplier.toFixed(1)}x
              </span>
            )}
          </div>

          {levelId !== 'endless' && level && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Target size={14} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{level.label}</div>
                  <div className="text-xs text-gray-500">
                    <AnimatedCounter value={coins} /> / {level.targetCoins}
                  </div>
                </div>
                {timeRemaining && (
                  <span className={`
                    ml-2 font-mono text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-300
                    ${isVeryLowTime ? 'bg-red-100 text-red-700 animate-pulse' : isLowTime ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-600'}
                  `}>
                    {timeRemaining}
                  </span>
                )}
              </div>
            </div>
          )}

          {levelId === 'endless' && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-100 shadow-sm">
              <span className="text-2xl rainbow-shimmer">♾️</span>
              <div>
                <div className="text-sm font-semibold text-purple-700">Endless Mode</div>
                <div className="text-xs text-purple-600 font-medium">
                  Total: <AnimatedCounter value={coins} />🪙
                </div>
              </div>
            </div>
          )}
        </div>

        {onShowHelp && (
          <button
            onClick={onShowHelp}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
            title="Help (press ?)"
          >
            <HelpCircle size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${seasonData?.bgColor || 'bg-gray-50'} border ${seasonData?.borderColor || 'border-gray-200'} shadow-sm`}>
          <span className="text-xl drop-shadow-sm">{seasonData?.emoji}</span>
          <span className={`text-sm font-semibold ${seasonData?.color || 'text-gray-600'}`}>
            {seasonData?.name}
          </span>
        </div>

        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${weatherData?.bgColor || 'bg-gray-50'} shadow-sm border border-gray-100`}>
          <span className="text-xl drop-shadow-sm animate-pulse-slow">{weatherData?.emoji}</span>
          <span className="text-sm font-medium text-gray-700">{weatherData?.name || currentWeather}</span>
        </div>

        {timeDisplay && currentPeriod && (
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm border
            ${currentPeriod.id === 'night'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
            }
          `}>
            {currentPeriod.id === 'dawn' && <Sunrise size={14} />}
            {currentPeriod.id === 'morning' && <Sun size={14} />}
            {currentPeriod.id === 'afternoon' && <Sun size={14} />}
            {currentPeriod.id === 'evening' && <Sunset size={14} />}
            {currentPeriod.id === 'night' && <Moon size={14} />}
            <span className="text-xs font-mono font-medium">{timeDisplay}</span>
          </div>
        )}

        {prestige > 0 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl px-3 py-1.5 border border-purple-200/80 shadow-sm">
            <Crown size={14} className="text-purple-500" />
            <span className="text-lg drop-shadow-sm">{prestigeData?.emoji}</span>
            <span className="text-sm font-bold text-purple-700">{prestigeData?.multiplier}x</span>
          </div>
        )}

        {moodTier && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm border bg-white/80"
            style={{ borderColor: 'var(--mood-accent)' }}
          >
            <span className="text-base">{moodTier.emoji}</span>
            <span className="text-xs font-semibold mood-accent-text">{moodTier.name}</span>
          </div>
        )}

        {activeBlessing && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm border bg-sky-50 border-sky-200 text-sky-700">
            <span className="text-base">{activeBlessing.emoji}</span>
            <span className="text-xs font-semibold">{activeBlessing.name}</span>
          </div>
        )}
      </div>

      {levelId !== 'endless' && level && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-green-500 transition-all duration-500 relative rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 progress-shimmer rounded-full" />
              {progress > 5 && (
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 rounded-full blur-sm" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level complete/lost indicators - Enhanced */}
      {levelStatus === 'won' && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl px-4 py-3 text-center font-bold shadow-sm border border-green-200 level-up-burst">
          <span className="text-xl mr-2">🎉</span>
          Level Complete!
          <span className="text-xl ml-2">🎉</span>
        </div>
      )}
      {levelStatus === 'lost' && (
        <div className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-xl px-4 py-3 text-center font-bold shadow-sm border border-red-200 shake">
          <span className="text-xl mr-2">⏰</span>
          Time's Up!
        </div>
      )}
    </div>
  );
}

export const StatsBar = memo(StatsBarComponent);
