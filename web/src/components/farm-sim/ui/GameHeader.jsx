import React, { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Coins, Star, Trophy, ChevronDown, TrendingUp, Calendar } from 'lucide-react';
import { getNextGoalFromCounts } from '../../../utils/goalHints';
import { getXpProgress } from '../systems/progression';
import { getWeatherMeta } from '../constants/weatherData';
import { getFarmTheme } from '../../../data/farmThemes';

// Animated number counter component
const AnimatedNumber = memo(({ value, duration = 500 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      const startValue = prevValueRef.current;
      const endValue = value;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const currentValue = Math.floor(startValue + (endValue - startValue) * progress);

        setDisplayValue(currentValue);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevValueRef.current = value;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={`transition-all ${isAnimating ? 'text-green-600 scale-110' : ''}`}>
      {displayValue}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';

const LastSaveTime = memo(({ lastSavedAt, autoSave, reducedMotion }) => {
  useTick();
  const currentTime = Date.now();
  const [justSaved, setJustSaved] = useState(false);
  const prevSavedRef = useRef(lastSavedAt);

  useEffect(() => {
    if (lastSavedAt && prevSavedRef.current !== lastSavedAt) {
      prevSavedRef.current = lastSavedAt;
      if (!reducedMotion) {
        setJustSaved(true);
        const t = setTimeout(() => setJustSaved(false), 900);
        return () => clearTimeout(t);
      }
    }
    prevSavedRef.current = lastSavedAt;
  }, [lastSavedAt, reducedMotion]);

  const getTimeSinceLastSave = () => {
    if (!lastSavedAt) {
      return autoSave ? 'waiting for first save…' : 'not saved yet';
    }
    const seconds = Math.max(0, Math.floor((currentTime - lastSavedAt) / 1000));
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <span className={`transition-colors duration-300 ${justSaved ? 'font-semibold text-emerald-600' : ''}`}>
      Saved {getTimeSinceLastSave()}
    </span>
  );
});

LastSaveTime.displayName = 'LastSaveTime';

const formatCountdown = (remainingMs) => {
  const safeRemaining = Math.max(0, Number(remainingMs) || 0);
  const minutes = Math.floor(safeRemaining / 60000);
  const seconds = Math.floor((safeRemaining % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const SeasonCountdown = memo(({ lastChangeTime, durationMs = 120000 }) => {
  useTick();
  if (!lastChangeTime) return <span>Next season in: --:--</span>;

  const elapsed = Math.max(0, Date.now() - lastChangeTime);
  const remaining = Math.max(0, durationMs - elapsed);
  return <span>Next season in: {formatCountdown(remaining)}</span>;
});

SeasonCountdown.displayName = 'SeasonCountdown';

// Game Header Component - Memoized for performance
const GameHeader = memo(() => {
  const actions = useGameActions();
  const coins = useGameSelector((state) => state.coins || 0);
  const xp = useGameSelector((state) => state.xp || 0);
  const level = useGameSelector((state) => state.level || 1);
  const cosmeticTokens = useGameSelector((state) => state.cosmeticTokens || 0);
  const recentXpEvents = useGameSelector((state) => state.recentXpEvents || []);
  const achievementSummaryKey = useGameSelector((state) => {
    const achievements = Array.isArray(state.achievements) ? state.achievements : [];
    let unlocked = 0;
    for (let i = 0; i < achievements.length; i++) {
      if (achievements[i]?.unlocked) unlocked += 1;
    }
    return `${unlocked}|${achievements.length}`;
  });
  const builtBuildings = useGameSelector((state) => {
    const buildings = state.buildings || {};
    let total = 0;
    for (const key of Object.keys(buildings)) {
      if (buildings[key]?.built) total += 1;
    }
    return total;
  });
  const weather = useGameSelector((state) => state.weather || 'sunny');
  const season = useGameSelector((state) => state.season || null);
  const farmTheme = useGameSelector((state) => state.farmTheme || null);
  const farmNameRaw = useGameSelector((state) => state.farmName || '');
  const weatherForecast = useGameSelector((state) => Array.isArray(state.weatherForecast) ? state.weatherForecast : []);
  const autoSaveEnabled = useGameSelector((state) => Boolean(state.settings?.autoSave));
  const reducedMotion = useGameSelector((state) => state.settings?.reducedMotion === true);
  const lastSavedAt = useGameSelector((state) => state.gameLoop?.lastSaveTime || null);
  const plots = useGameSelector((state) => (Array.isArray(state.plots) ? state.plots : []));

  const [showStatsDropdown, setShowStatsDropdown] = useState(false);
  const statsDropdownRef = useRef(null);
  const prevLevelRef = useRef(level);

  // Use ref for actions to avoid dependency issues
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Detect level up and trigger celebration
  useEffect(() => {
    if (level > prevLevelRef.current) {
      // LEVEL UP FANFARE!
      const headerElement = document.querySelector('header');
      if (headerElement) {
        const rect = headerElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Trigger level-up particle effect (confetti - gentle shake)
        if (typeof window.triggerParticleEffect === 'function') {
          window.triggerParticleEffect(centerX, centerY, 'levelup', { shake: true });
        }

        // Play level-up sound
        if (typeof window.soundSystem !== 'undefined') {
          window.soundSystem.playLevelUpSound();
        }

        // Show notification - use ref to avoid dependency
        actionsRef.current.addNotification({
          message: `🎉 Level Up! You're now Level ${level}!`,
          type: 'success'
        });
      }

      prevLevelRef.current = level;
    }
    // Removed actions from dependencies - using ref instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const xpProgressData = getXpProgress(xp, level);
  const currentLevelXp = xpProgressData.inLevel;
  const xpNeededForNext = xpProgressData.needed;
  const xpProgress = xpProgressData.progress;

  const [activePlotCount, readyPlotCount, emptyPlotCount] = useMemo(() => {
    let active = 0;
    let ready = 0;
    let empty = 0;
    for (let i = 0; i < plots.length; i++) {
      const plot = plots[i];
      if (!plot) continue;
      if (plot.state === 'ready') ready += 1;
      if (plot.state === 'empty') empty += 1;
      if (plot.state !== 'empty') active += 1;
    }
    return [active, ready, empty];
  }, [plots]);
  const [unlockedAchievements, totalAchievements] = useMemo(() => {
    const parts = String(achievementSummaryKey || '0|0').split('|');
    return [Number(parts[0]) || 0, Number(parts[1]) || 0];
  }, [achievementSummaryKey]);
  const weatherForecastStrip = useMemo(() => {
    const forecastItems = weatherForecast.slice(0, 3).map((forecastItem, index) => {
      const meta = getWeatherMeta(forecastItem?.type || 'sunny');
      return {
        dayLabel: index === 0 ? 'Tomorrow' : `+${index + 1}d`,
        weatherLabel: meta.label,
        emoji: meta.emoji,
        className: meta.headerClassName || 'text-slate-700',
      };
    });

    if (weatherForecast.length >= 2) {
      forecastItems[1].dayLabel = '+2d';
    }
    if (weatherForecast.length >= 3) {
      forecastItems[2].dayLabel = '+3d';
    }

    return forecastItems;
  }, [weatherForecast]);

  const nextGoal = useMemo(() => (
    getNextGoalFromCounts({
      active: activePlotCount,
      ready: readyPlotCount,
      empty: emptyPlotCount,
      coins,
      level,
      builtBuildings,
    })
  ), [activePlotCount, readyPlotCount, emptyPlotCount, builtBuildings, coins, level]);

  const weatherMeta = getWeatherMeta(weather);
  const activeTheme = getFarmTheme(farmTheme);
  const farmName = (farmNameRaw || 'Willowbrook Farm').trim() || 'Willowbrook Farm';
  const openRelatedTab = useCallback((tabId) => {
    if (typeof window.switchToTab === 'function') {
      window.switchToTab(tabId);
    }
    setShowStatsDropdown(false);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target)) {
        setShowStatsDropdown(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowStatsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 px-2.5 sm:px-4 py-2 sm:py-3 relative sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side - Game title and basic stats */}
        <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-4 lg:gap-6 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => openRelatedTab('farming')}
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2"
            title="Go to Farm"
            aria-label="Go to Farm"
          >
            <img
              src="/icons/cozy-farms-logo.svg"
              alt="Cozy Farms"
              className="h-10 w-auto sm:h-12 md:h-14 object-contain drop-shadow-sm"
              loading="eager"
            />
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="max-w-[180px] truncate text-sm font-semibold text-gray-900 md:text-base">
                {farmName}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: activeTheme.palette.accent }}
              >
                {activeTheme.name}
              </span>
            </div>
          </button>

          {/* Core stats with animations */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap justify-end lg:justify-start">
            <button
              type="button"
              onClick={() => openRelatedTab('shop')}
              className="flex items-center gap-1.5 group bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 px-2 sm:px-3 py-1.5 rounded-xl transition-all shadow-sm border border-amber-200/50"
              title="Open Shop"
            >
	              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 group-hover:animate-spin filter drop-shadow-sm" />
	              <span className="font-bold text-amber-700 text-sm sm:text-base coin-display">
	                <AnimatedNumber value={coins} />
	              </span>
	            </button>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => openRelatedTab('analytics')}
                className="flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition"
                title="Open Analytics"
              >
                <Star className="w-4 h-4 text-blue-600" />
	                <span className="font-semibold text-gray-900 text-sm">
	                  <AnimatedNumber value={xp} /> XP
	                </span>
	              </button>
              {/* XP Progress bar to next level */}
              <div className="w-28 sm:w-32 hidden sm:block">
                <Progress value={xpProgress} className="h-2 bg-blue-100" />
	                <div className="text-[10px] text-gray-600 font-medium text-center mt-0.5">
	                  {Math.floor(currentLevelXp)}/{xpNeededForNext} to Lv{level + 1}
	                </div>
	                <div className="text-[10px] text-gray-500 text-center">Leveling slows as your farm matures.</div>
	              </div>
	            </div>

            <button type="button" onClick={() => openRelatedTab('achievements')} title="Open Achievements">
	              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 font-bold hover:bg-emerald-100/80 transition-colors cursor-pointer">
	                Level {level}
	              </Badge>
	            </button>

            {/* Next Goal Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <span className="text-base">{nextGoal.emoji}</span>
              <span className="text-xs font-medium text-amber-800">{nextGoal.text}</span>
            </div>
          </div>
        </div>

        {/* Right side - Controls and weather */}
        <div className="w-full lg:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* Stats Dropdown Button */}
          <div className="relative" ref={statsDropdownRef}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatsDropdown(!showStatsDropdown)}
              className="flex items-center gap-1 min-h-[40px]"
              aria-expanded={showStatsDropdown}
              aria-controls="farm-stats-dropdown"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs hidden sm:inline">Stats</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showStatsDropdown ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown panel */}
            {showStatsDropdown && (
              <div id="farm-stats-dropdown" className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-overlay-card" role="dialog" aria-label="Farm stats">
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">📊 Farm Statistics</h3>
                  <div className="space-y-2 text-xs">
	                  <div className="flex justify-between">
	                      <span className="text-gray-600">Total Coins:</span>
	                      <span className="font-semibold">{formatNumber(coins)}🪙</span>
	                    </div>
	                    <div className="flex justify-between">
	                      <span className="text-gray-600">Experience:</span>
	                      <span className="font-semibold">{formatNumber(xp)} XP</span>
	                    </div>
	                    <div className="flex justify-between">
	                      <span className="text-gray-600">Cosmetic Tokens:</span>
	                      <span className="font-semibold">{formatNumber(cosmeticTokens || 0)}</span>
	                    </div>
	                    {(recentXpEvents || []).length > 0 && (
	                      <div className="pt-1 border-t border-gray-100">
	                        <div className="text-[11px] font-semibold text-gray-600 mb-1">Recent XP</div>
	                        <div className="space-y-0.5">
	                          {(recentXpEvents || []).slice().reverse().map((event) => (
	                            <div key={event.id} className="text-[11px] text-gray-600 flex justify-between">
	                              <span className="truncate pr-2">{event.source}</span><span>+{event.amount}</span>
	                            </div>
	                          ))}
	                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Plots:</span>
                      <span className="font-semibold">{activePlotCount}</span>
                    </div>
		                    <div className="flex justify-between">
		                      <span className="text-gray-600">Achievements:</span>
		                      <span className="font-semibold">{unlockedAchievements}/{totalAchievements}</span>
		                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buildings:</span>
                      <span className="font-semibold">{builtBuildings}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Season display with animation */}
	          {season?.config && (
	            <button
              type="button"
              onClick={() => openRelatedTab('events')}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all group relative shadow-md hover:shadow-lg"
              title="Open Events"
              style={{
              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
	              <span className="text-lg animate-season drop-shadow-sm">
	                {season.config.emoji}
	              </span>
	              <span className="text-sm font-medium text-purple-700 capitalize">
	                {season.config.name}
	              </span>
              {/* Season time remaining tooltip */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 backdrop-blur-lg bg-opacity-95" style={{
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(168, 85, 247, 0.2)'
              }}>
	                <div className="text-xs font-semibold text-gray-700 mb-1">
	                  {season.config.name} {season.config.icon}
	                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {season.config.description}
                </div>
                <div className="text-xs text-gray-500">
                  <SeasonCountdown lastChangeTime={season?.lastChangeTime} />
                </div>
              </div>
            </button>
          )}

          {/* Weather display with animation */}
          <button
            type="button"
            onClick={() => openRelatedTab('weather')}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${weatherMeta.headerClassName}`}
            title="Open Weather"
            aria-label="Open Weather"
          >
            <span className="text-lg animate-weather">
              {weatherMeta.emoji}
            </span>
            <span className="text-xs sm:text-sm font-medium">
              {weatherMeta.label}
            </span>
          </button>

          {weatherForecastStrip.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/80 backdrop-blur-sm px-2 py-1 border border-gray-200/70">
              <span className="text-[10px] font-semibold text-gray-500">Forecast</span>
              {weatherForecastStrip.map((item) => (
                <button
                  key={item.dayLabel}
                  type="button"
                  onClick={() => openRelatedTab('weather')}
                  className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-[10px] transition-colors hover:bg-gray-100"
                  aria-label={`Open weather forecast ${item.dayLabel}`}
                  title={`Open Weather tab for ${item.dayLabel} (${item.weatherLabel})`}
                >
                  <span className="font-semibold text-gray-500">{item.dayLabel}</span>
                  <span className="text-sm leading-none" aria-hidden="true">{item.emoji}</span>
                  <span className={`font-semibold ${item.className}`}>{item.weatherLabel}</span>
                </button>
              ))}
            </div>
          )}

          {/* Achievement indicator */}
          <button
            type="button"
            onClick={() => openRelatedTab('achievements')}
            className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition min-h-[40px]"
            title="Open Achievements"
          >
            <Trophy className="w-4 h-4 text-yellow-600" />
		            <span className="text-sm font-medium text-gray-700">
		              {unlockedAchievements}/{totalAchievements}
		            </span>
	          </button>
	        </div>
	      </div>

      {/* Auto-save indicator */}
	      {autoSaveEnabled && (
	        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
	          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
	            <Calendar className="w-3 h-3" />
	            <LastSaveTime lastSavedAt={lastSavedAt} autoSave={autoSaveEnabled} reducedMotion={reducedMotion} />
	          </div>
	        </div>
	      )}

    </header>
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader;
