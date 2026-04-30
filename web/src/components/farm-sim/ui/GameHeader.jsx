import React, { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Coins, Star, Trophy, ChevronDown, TrendingUp } from 'lucide-react';
import { getNextGoalFromCounts } from '../../../utils/goalHints';
import { getXpProgress } from '../systems/progression';
import { getWeatherMeta } from '../constants/weatherData';
import { getFarmTheme } from '../../../data/farmThemes';

/* ── AAA polish keyframes ── */
const aaaStyles = `
@keyframes coinShimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes xpGlow {
  0%, 100% { text-shadow: 0 0 4px rgba(59,130,246,0.35), 0 0 12px rgba(59,130,246,0.15); }
  50% { text-shadow: 0 0 8px rgba(59,130,246,0.55), 0 0 20px rgba(59,130,246,0.25); }
}
@keyframes sunRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes snowFall {
  0% { transform: translateY(-4px) translateX(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(10px) translateX(6px); opacity: 0; }
}
@keyframes rainDrop {
  0% { transform: translateY(-3px); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(8px); opacity: 0; }
}
@keyframes cloudFloat {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}
@keyframes savePulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.35); opacity: 1; }
}
@keyframes separatorShimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes trophyGold {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(234,179,8,0.4)); }
  50% { filter: drop-shadow(0 0 6px rgba(234,179,8,0.8)); }
}
.coin-shimmer {
  background: linear-gradient(90deg, #b45309 0%, #f59e0b 25%, #fcd34d 50%, #f59e0b 75%, #b45309 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: coinShimmer 3s linear infinite;
}
.dark .coin-shimmer {
  background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 25%, #fef3c7 50%, #fcd34d 75%, #f59e0b 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
}
.xp-glow {
  animation: xpGlow 2.5s ease-in-out infinite;
}
`;

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
    <span className={`transition-[transform,color] duration-200 ${isAnimating ? 'text-green-600 dark:text-green-400 scale-110' : ''}`}>
      {displayValue}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';

const LastSaveTime = memo(({ lastSavedAt, autoSave }) => {
  useTick();
  const currentTime = Date.now();

  const getTimeSinceLastSave = () => {
    if (!lastSavedAt) {
      return autoSave ? 'Waiting...' : 'Not saved yet';
    }
    const seconds = Math.max(0, Math.floor((currentTime - lastSavedAt) / 1000));
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return <span>Auto-saved {getTimeSinceLastSave()}</span>;
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
  const autoSaveEnabled = useGameSelector((state) => Boolean(state.settings?.autoSave));
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
    <>
      <style>{aaaStyles}</style>
      <header className="bg-gradient-to-b from-white via-slate-50/95 to-slate-100/90 backdrop-blur-xl shadow-lg border-b border-white/60 px-2.5 sm:px-4 pb-2 sm:pb-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:pt-[max(0.75rem,env(safe-area-inset-top,0px))] relative sticky top-0 z-50 overflow-hidden dark:from-slate-900/95 dark:via-slate-900/95 dark:to-slate-950/90 dark:border-slate-800">
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
              <span className="max-w-[180px] truncate text-sm font-semibold text-gray-900 md:text-base dark:text-slate-100">
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
              className="flex items-center gap-1.5 group bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 px-2 sm:px-3 py-1.5 min-h-[44px] rounded-xl transition-[transform,background-color,box-shadow,border-color] shadow-sm border border-amber-200/50 active:scale-95 dark:from-amber-950/40 dark:to-yellow-950/30 dark:hover:from-amber-900/50 dark:hover:to-yellow-900/40 dark:border-amber-800/40"
              title="Open Shop"
              aria-label="Open Shop"
            >
              <span className="relative flex items-center justify-center">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 group-hover:animate-spin filter drop-shadow-sm" />
                <span className="absolute inset-0 rounded-full bg-amber-400/0 group-hover:bg-amber-400/10 transition-colors" />
              </span>
              <span className="font-bold text-sm sm:text-base coin-display coin-shimmer">
                <AnimatedNumber value={coins} />
              </span>
            </button>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => openRelatedTab('analytics')}
                className="flex items-center gap-1.5 hover:bg-blue-50/80 px-2 py-1 min-h-[44px] rounded-xl transition active:scale-95 dark:hover:bg-blue-900/30"
                title="Open Analytics"
                aria-label="Open Analytics"
              >
                <span className="relative flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600 drop-shadow-sm dark:text-blue-400" />
                  <span className="absolute inset-0 rounded-full bg-blue-400/0 group-hover:bg-blue-400/10 transition-colors" />
                </span>
                <span className="font-bold text-gray-900 text-sm xp-glow dark:text-slate-100">
                  <AnimatedNumber value={xp} /> <span className="text-blue-600 dark:text-blue-400">XP</span>
                </span>
              </button>
              {/* XP Progress bar to next level */}
              <div className="w-28 sm:w-32 hidden sm:block px-1">
                <div className="relative">
                  <Progress value={xpProgress} className="h-2 bg-blue-100 dark:bg-blue-900/40" />
                  <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-sm pointer-events-none" />
                </div>
                <div className="text-[10px] text-blue-700/70 font-semibold text-center mt-1 tracking-wide dark:text-blue-300/70">
                  {Math.floor(currentLevelXp)} / {xpNeededForNext} to Lv{level + 1}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => openRelatedTab('achievements')} title="Open Achievements" aria-label="Open Achievements">
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 font-bold hover:bg-emerald-100/80 transition-colors cursor-pointer dark:from-green-950/60 dark:to-emerald-950/60 dark:text-green-300 dark:border-green-800/60">
                Level {level}
              </Badge>
            </button>

            {/* Next Goal Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 dark:from-amber-950/40 dark:to-orange-950/30 dark:border-amber-800/40">
              <span className="text-base">{nextGoal.emoji}</span>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">{nextGoal.text}</span>
            </div>
          </div>
        </div>

        {/* Animated vertical separator (desktop only) */}
        <div className="hidden lg:block w-px h-10 self-center rounded-full bg-gradient-to-b from-transparent via-slate-300/40 to-transparent dark:via-slate-600/40" />

        {/* Right side - Controls and weather */}
        <div className="w-full lg:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* Stats Dropdown Button */}
          <div className="relative" ref={statsDropdownRef}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatsDropdown(!showStatsDropdown)}
              className="flex items-center gap-1 min-h-[44px]"
              aria-expanded={showStatsDropdown}
              aria-controls="farm-stats-dropdown"
              aria-label="Toggle farm stats"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs hidden sm:inline">Stats</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showStatsDropdown ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown panel — glassmorphism */}
            {showStatsDropdown && (
              <div
                id="farm-stats-dropdown"
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl z-50 animate-fade-in overflow-hidden"
                role="dialog"
                aria-label="Farm stats"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  boxShadow: '0 24px 48px -12px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 0 0 1px rgba(226,232,240,0.4)',
                }}
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 tracking-tight">📊 Farm Statistics</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your farm at a glance</p>
                </div>

                {/* Section 1 — Currency */}
                <div className="px-4 py-3 space-y-2.5 bg-white/40 border-y border-slate-200/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Coins</span>
                    <span className="font-bold text-sm text-amber-700">{formatNumber(coins)} <span className="text-amber-500">🪙</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Experience</span>
                    <span className="font-bold text-sm text-blue-700">{formatNumber(xp)} <span className="text-blue-500">XP</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Cosmetic Tokens</span>
                    <span className="font-bold text-sm text-purple-700">{formatNumber(cosmeticTokens || 0)} <span className="text-purple-500">✨</span></span>
                  </div>
                </div>

                {/* Section 2 — Recent XP */}
                {(recentXpEvents || []).length > 0 && (
                  <div className="px-4 py-3 border-b border-slate-200/40">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Recent XP</div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                      {(recentXpEvents || []).slice().reverse().map((event) => (
                        <div key={event.id} className="flex items-center justify-between text-[11px]">
                          <span className="truncate pr-3 text-slate-600 max-w-[160px]">{event.source}</span>
                          <span className="font-bold text-blue-600 shrink-0">+{event.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3 — Farm stats */}
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Active Plots</span>
                    <span className="font-bold text-sm text-emerald-700">{activePlotCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Achievements</span>
                    <span className="font-bold text-sm text-yellow-700">{unlockedAchievements} <span className="text-slate-400">/</span> {totalAchievements}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Buildings</span>
                    <span className="font-bold text-sm text-slate-700">{builtBuildings}</span>
                  </div>
                </div>

                {/* Footer glow */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-blue-400 to-emerald-400 opacity-60" />
              </div>
            )}
          </div>
          {/* Season display with animation */}
          {season?.config && (
            <button
              type="button"
              onClick={() => openRelatedTab('events')}
              className="flex items-center gap-2 px-3 py-1.5 min-h-[44px] bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all active:scale-95 group relative shadow-sm hover:shadow-md dark:from-purple-950/40 dark:to-pink-950/30 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50"
              title="Open Events"
              aria-label="Open Events"
              style={{
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <span className="relative flex items-center justify-center w-6 h-6">
                <span className="text-lg drop-shadow-sm" style={{ animation: 'sunRotate 12s linear infinite' }}>
                  {season.config.emoji}
                </span>
              </span>
              <span className="text-sm font-semibold text-purple-700 capitalize tracking-tight dark:text-purple-300">
                {season.config.name}
              </span>
              {/* Season time remaining tooltip */}
              <div className="absolute top-full right-0 mt-2 w-52 rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,244,255,0.92) 100%)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset',
              }}>
                <div className="text-xs font-bold text-purple-800 mb-1 tracking-tight">
                  {season.config.name} {season.config.icon}
                </div>
                <div className="text-xs text-purple-700/70 mb-2 leading-relaxed">
                  {season.config.description}
                </div>
                <div className="text-[11px] font-medium text-purple-600/80 bg-purple-50 rounded-lg px-2 py-1.5 text-center">
                  <SeasonCountdown lastChangeTime={season?.lastChangeTime} />
                </div>
              </div>
            </button>
          )}

          {/* Weather display with animation */}
          <button
            type="button"
            onClick={() => openRelatedTab('weather')}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 min-h-[44px] rounded-xl transition-all active:scale-95 cursor-pointer ${weatherMeta.headerClassName || 'bg-slate-50 hover:bg-slate-100 border border-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700/50'}`}
            title="Open Weather"
            aria-label="Open Weather"
          >
            <span className="relative flex items-center justify-center w-6 h-6">
              {/* Animated weather effects */}
              {weather === 'sunny' && (
                <>
                  <span className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-pulse" />
                  <span className="text-lg" style={{ animation: 'sunRotate 8s linear infinite' }}>{weatherMeta.emoji}</span>
                </>
              )}
              {weather === 'snowy' && (
                <>
                  <span className="absolute text-[6px] left-0 top-0" style={{ animation: 'snowFall 1.2s linear infinite' }}>❄</span>
                  <span className="absolute text-[6px] right-0 top-1" style={{ animation: 'snowFall 1.5s linear infinite 0.3s' }}>❄</span>
                  <span className="absolute text-[6px] left-2 bottom-0" style={{ animation: 'snowFall 1s linear infinite 0.6s' }}>❄</span>
                  <span className="text-lg">{weatherMeta.emoji}</span>
                </>
              )}
              {weather === 'rainy' && (
                <>
                  <span className="absolute text-[6px] left-0 top-0" style={{ animation: 'rainDrop 0.7s linear infinite' }}>💧</span>
                  <span className="absolute text-[6px] right-0 top-1" style={{ animation: 'rainDrop 0.9s linear infinite 0.2s' }}>💧</span>
                  <span className="absolute text-[6px] left-2 bottom-0" style={{ animation: 'rainDrop 0.8s linear infinite 0.4s' }}>💧</span>
                  <span className="text-lg">{weatherMeta.emoji}</span>
                </>
              )}
              {weather === 'cloudy' && (
                <span className="text-lg" style={{ animation: 'cloudFloat 3s ease-in-out infinite' }}>{weatherMeta.emoji}</span>
              )}
              {weather !== 'sunny' && weather !== 'snowy' && weather !== 'rainy' && weather !== 'cloudy' && (
                <span className="text-lg">{weatherMeta.emoji}</span>
              )}
            </span>
            <span className="text-xs sm:text-sm font-semibold dark:text-slate-200">
              {weatherMeta.label}
            </span>
          </button>

          {/* Achievement indicator */}
          <button
            type="button"
            onClick={() => openRelatedTab('achievements')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200/40 transition-all active:scale-95 group dark:from-yellow-950/40 dark:to-amber-950/30 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 dark:border-yellow-800/40"
            title="Open Achievements"
            aria-label="Open Achievements"
          >
            <Trophy className="w-4 h-4 text-yellow-600 group-hover:text-yellow-500 transition-colors dark:text-yellow-400 dark:group-hover:text-yellow-300" style={{ animation: 'trophyGold 2.5s ease-in-out infinite' }} />
            <span className="text-sm font-bold text-yellow-800 group-hover:text-yellow-700 transition-colors dark:text-yellow-300 dark:group-hover:text-yellow-200">
              {unlockedAchievements}<span className="text-yellow-500/60 mx-0.5">/</span>{totalAchievements}
            </span>
          </button>
        </div>
      </div>

      {/* Auto-save indicator - elegant pulsing dot */}
      {autoSaveEnabled && (
        <div className="flex justify-center pt-1.5 pb-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/60 border border-slate-200/30 dark:bg-slate-800/60 dark:border-slate-700/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" style={{ animationDuration: '2s' }} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" style={{ animation: 'savePulse 2s ease-in-out infinite' }} />
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide dark:text-slate-500">
              <LastSaveTime lastSavedAt={lastSavedAt} autoSave={autoSaveEnabled} />
            </span>
          </div>
        </div>
      )}

      {/* Subtle animated separator line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.25), rgba(59,130,246,0.25), rgba(245,158,11,0.25), transparent)',
          backgroundSize: '200% auto',
          animation: 'separatorShimmer 4s linear infinite',
        }}
      />
    </header>
  </>
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader;
