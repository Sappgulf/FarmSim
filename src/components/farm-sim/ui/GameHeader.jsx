import React, { memo, useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { getXpForLevel } from '../constants/progression';
import { Coins, Star, Settings, Save, Play, Pause, TrendingUp } from 'lucide-react';
import { addTrackedEventListener } from '../services/EventListenerService';
import CozyStatusBar from './CozyStatusBar';

// Animated number counter component
const AnimatedNumber = memo(({ value, duration = 500 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

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
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevValueRef.current = value;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  return (
    <span className={`transition-all ${isAnimating ? 'text-green-600 scale-110' : ''}`}>
      {displayValue}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';

// Game Header Component - Memoized for performance
const GameHeader = memo(() => {
  const { state, actions } = useGame();
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);
  const prevLevelRef = useRef(state.level);
  const statsDropdownRef = useRef(null);
  const headerRef = useRef(null);

  // Use ref for actions to avoid dependency issues
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    if (!showStatsDropdown) return;

    const handlePointerDown = (event) => {
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target)) {
        setShowStatsDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowStatsDropdown(false);
      }
    };

    const cleanups = [
      addTrackedEventListener(document, 'mousedown', handlePointerDown),
      addTrackedEventListener(document, 'touchstart', handlePointerDown),
      addTrackedEventListener(document, 'keydown', handleKeyDown),
    ];

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [showStatsDropdown]);

  // Detect level up and trigger celebration
  useEffect(() => {
    if (state.level > prevLevelRef.current) {
      // LEVEL UP FANFARE!
      const headerElement = headerRef.current;
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
          message: `🎉 Level Up! You're now Level ${state.level}!`,
          type: 'success'
        });
      }

      prevLevelRef.current = state.level;
    }
    // Removed actions from dependencies - using ref instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.level]);

  // PERF: Use centralized tick instead of setInterval
  const tick = useTick();
  // Recompute currentTime on each tick for save time display
  const currentTime = Date.now();

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeSinceLastSave = () => {
    const lastSavedAt = state.gameLoop?.lastSaveTime;
    if (!lastSavedAt) {
      return state.settings.autoSave ? 'Waiting...' : 'Not saved yet';
    }
    const seconds = Math.max(0, Math.floor((currentTime - lastSavedAt) / 1000));
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  // Calculate XP progress to next level (matches progression constants)
  const xpForCurrentLevel = getXpForLevel(state.level);
  const xpForNextLevel = getXpForLevel(state.level + 1);
  const currentLevelXp = Math.max(0, state.xp - xpForCurrentLevel);
  const xpNeededForNext = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const xpProgress = Math.min(100, (currentLevelXp / xpNeededForNext) * 100);

  // Dynamic goal hint based on game state
  const getNextGoal = () => {
    const activePlots = state.plots?.filter(p => p.state !== 'empty').length || 0;
    const readyPlots = state.plots?.filter(p => p.state === 'ready').length || 0;
    const emptyPlots = (state.plots?.length || 0) - activePlots;

    if (readyPlots > 0) return { text: `Harvest ${readyPlots} crop${readyPlots > 1 ? 's' : ''}`, emoji: '🌾', priority: 1 };
    if (emptyPlots > 0 && state.coins >= 10) return { text: `Plant ${Math.min(emptyPlots, 3)} seeds`, emoji: '🌱', priority: 2 };
    if (activePlots > 0) return { text: 'Wait for crops to grow', emoji: '⏳', priority: 3 };
    if (state.level >= 2 && !Object.values(state.buildings || {}).some(b => b?.built)) {
      return { text: 'Build your first structure', emoji: '🏠', priority: 2 };
    }
    if (state.coins < 10) return { text: 'Earn coins to buy seeds', emoji: '💰', priority: 2 };
    return { text: 'Explore your farm!', emoji: '🚜', priority: 3 };
  };

  const nextGoal = getNextGoal();

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-4 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Game title and basic stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="text-2xl animate-bounce-slow filter drop-shadow-sm group-hover:scale-110 transition-transform">🚜</div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-800 tracking-tight">FarmSim</h1>
          </div>

          {/* Core stats with animations */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50/80 border border-yellow-100 rounded-full hover:bg-yellow-100 transition shadow-sm cursor-help" title="Current Balance">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="font-bold text-yellow-900 font-mono">
                <AnimatedNumber value={state.coins} />
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5">
                <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
                <span className="font-bold text-gray-700 text-xs">
                  <AnimatedNumber value={state.xp} /> XP
                </span>
              </div>
              {/* XP Progress bar to next level */}
              <div className="w-28 relative group cursor-help">
                <Progress value={xpProgress} className="h-1.5 bg-gray-100" />
                <div className="absolute top-full left-0 w-full text-[9px] text-gray-500 font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity bg-white border px-1 rounded shadow-sm z-50">
                  {Math.floor(currentLevelXp)}/{xpNeededForNext} to Lv{state.level + 1}
                </div>
              </div>
            </div>

            <Badge variant="outline" className="ml-2 bg-gradient-to-r from-green-50 to-emerald-100 text-emerald-800 border-emerald-200 font-bold shadow-sm">
              Level {state.level}
            </Badge>

            {/* Next Goal Indicator */}
            <div className={`
                hidden md:flex items-center gap-2 px-3 py-1 ml-4 rounded-full border transition-all duration-500 cursor-help
                ${nextGoal.priority === 1
                ? 'bg-amber-50 border-amber-200 text-amber-900 animate-pulse-soft shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}
            `} title="Current Objective">
              <span className="text-base filter drop-shadow-sm">{nextGoal.emoji}</span>
              <span className="text-xs font-bold uppercase tracking-wide">{nextGoal.text}</span>
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-3">
          {/* Stats Toggle */}
          <div className="relative" ref={statsDropdownRef}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatsDropdown(!showStatsDropdown)}
              className={`h-8 w-8 p-0 rounded-full border-gray-200 transition-colors ${showStatsDropdown ? 'bg-gray-100' : 'bg-white'}`}
            >
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </Button>

            {showStatsDropdown && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4">
                  <h3 className="flex items-center gap-2 font-bold text-sm mb-3 text-gray-800">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Farm Analytics
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-2 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-gray-500">Net Worth</span>
                      <span className="font-bold text-sm text-gray-900">{formatNumber(state.coins)}🪙</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Plots</div>
                        <div className="font-bold text-gray-900">{state.plots?.filter(p => p.state !== 'empty').length || 0}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Bldgs</div>
                        <div className="font-bold text-gray-900">{Object.keys(state.buildings || {}).filter(k => state.buildings[k]?.built).length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {/* Game controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={state.gameLoop?.paused ? actions.resumeGame : actions.pauseGame}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              {state.gameLoop?.paused ? <Play className="w-4 h-4 text-green-600 fill-green-600" /> : <Pause className="w-4 h-4 text-gray-500 fill-gray-500" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const success = actions.saveGame();
                actions.addNotification({
                  message: success ? '💾 Game saved!' : '❌ Save failed',
                  type: success ? 'success' : 'error',
                });
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full group relative"
            >
              <Save className="w-4 h-4 text-blue-500" />
              {state.settings?.autoSave && (
                <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.switchToTab && window.switchToTab('settings')}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <CozyStatusBar />
      </div>
    </header>
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader;
