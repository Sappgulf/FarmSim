import React, { memo, useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useTick } from '../context/TickContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Coins, Star, Trophy, Settings, Save, Play, Pause, ChevronDown, TrendingUp, Calendar } from 'lucide-react';
import { getNextGoal } from '../../../utils/goalHints';

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

// Game Header Component - Memoized for performance
const GameHeader = memo(() => {
  const { state, actions } = useGame();
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);
  const prevLevelRef = useRef(state.level);

  // Use ref for actions to avoid dependency issues
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Detect level up and trigger celebration
  useEffect(() => {
    if (state.level > prevLevelRef.current) {
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
          message: `🎉 Level Up! You're now Level ${state.level}!`,
          type: 'success'
        });
      }

      prevLevelRef.current = state.level;
    }
    // Removed actions from dependencies - using ref instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.level]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate XP progress to next level (60 XP per level)
  const xpForCurrentLevel = (state.level - 1) * 60;
  // REBALANCED: Progressive XP formula - matches GameContext calculation
  // Formula: XP needed = (level^2) * 50
  const xpForNextLevel = (state.level * state.level) * 50;
  const currentLevelXp = state.xp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = (currentLevelXp / xpNeededForNext) * 100;

  const nextGoal = getNextGoal(state);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-3 relative sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Game title and basic stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl sm:text-3xl animate-bounce-slow filter drop-shadow-sm">🚜</div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent hidden sm:block">FarmLife</h1>
          </div>

          {/* Core stats with animations */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 group cursor-pointer bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 px-2 sm:px-3 py-1.5 rounded-xl transition-all shadow-sm border border-amber-200/50">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 group-hover:animate-spin filter drop-shadow-sm" />
              <span className="font-bold text-amber-700 text-sm sm:text-base coin-display">
                <AnimatedNumber value={state.coins} />
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900 text-sm">
                  <AnimatedNumber value={state.xp} /> XP
                </span>
              </div>
              {/* XP Progress bar to next level */}
              <div className="w-32">
                <Progress value={xpProgress} className="h-2 bg-blue-100" />
                <div className="text-[10px] text-gray-600 font-medium text-center mt-0.5">
                  {Math.floor(currentLevelXp)}/{xpNeededForNext} to Lv{state.level + 1}
                </div>
              </div>
            </div>

            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 font-bold">
              Level {state.level}
            </Badge>

            {/* Next Goal Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <span className="text-base">{nextGoal.emoji}</span>
              <span className="text-xs font-medium text-amber-800">{nextGoal.text}</span>
            </div>
          </div>
        </div>

        {/* Right side - Controls and weather */}
        <div className="flex items-center gap-3">
          {/* Stats Dropdown Button */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatsDropdown(!showStatsDropdown)}
              className="flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Stats</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showStatsDropdown ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown panel */}
            {showStatsDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-fade-in">
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">📊 Farm Statistics</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Coins:</span>
                      <span className="font-semibold">{formatNumber(state.coins)}🪙</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-semibold">{formatNumber(state.xp)} XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Plots:</span>
                      <span className="font-semibold">{state.plots?.filter(p => p.state !== 'empty').length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Achievements:</span>
                      <span className="font-semibold">{state.achievements?.filter(a => a.unlocked).length || 0}/{state.achievements?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buildings:</span>
                      <span className="font-semibold">{Object.keys(state.buildings || {}).filter(k => state.buildings[k]?.built).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Season display with animation */}
          {state.season?.config && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all cursor-pointer group relative shadow-md hover:shadow-lg" style={{
              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            }}>
              <span className="text-lg animate-season drop-shadow-sm">
                {state.season.config.emoji}
              </span>
              <span className="text-sm font-medium text-purple-700 capitalize">
                {state.season.config.name}
              </span>
              {/* Season time remaining tooltip */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 backdrop-blur-lg bg-opacity-95" style={{
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(168, 85, 247, 0.2)'
              }}>
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  {state.season.config.name} {state.season.config.icon}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {state.season.config.description}
                </div>
                <div className="text-xs text-gray-500">
                  Next season in: {Math.floor((120000 - (Date.now() - state.season.lastChangeTime)) / 60000)}:{((120000 - (Date.now() - state.season.lastChangeTime)) % 60000 / 1000).toFixed(0).padStart(2, '0')}
                </div>
              </div>
            </div>
          )}

          {/* Weather display with animation */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
            <span className="text-lg animate-weather">
              {state.weather === 'sunny' ? '☀️' :
                state.weather === 'rainy' ? '🌧️' :
                  state.weather === 'stormy' ? '⛈️' :
                    state.weather === 'snowy' ? '❄️' : '☀️'}
            </span>
            <span className="text-sm font-medium text-blue-700 capitalize">
              {state.weather || 'sunny'}
            </span>
          </div>

          {/* Game controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={state.gameLoop?.paused ? actions.resumeGame : actions.pauseGame}
              className="px-2 hover:scale-110 transition-transform"
              title={state.gameLoop?.paused ? "Resume Game" : "Pause Game"}
            >
              {state.gameLoop?.paused ? <Play className="w-3 h-3 text-green-600" /> : <Pause className="w-3 h-3 text-orange-600" />}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                try {
                  localStorage.setItem('farm_sim_enhanced_v2', JSON.stringify(state));
                  actions.updateGameLoop({ lastSaveTime: Date.now() });
                  actions.addNotification({
                    message: '💾 Game saved successfully!',
                    type: 'success'
                  });
                } catch (error) {
                  actions.addNotification({
                    message: '❌ Failed to save game',
                    type: 'error'
                  });
                }
              }}
              className="px-2 hover:scale-110 transition-transform group relative"
              title="Save Game"
            >
              <Save className="w-3 h-3 text-blue-600 group-hover:text-green-600" />
              {state.settings?.autoSave && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  title="Auto-save enabled"></span>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Switch to settings tab
                if (typeof window.switchToTab === 'function') {
                  window.switchToTab('settings');
                }
              }}
              className="px-2 hover:scale-110 transition-transform hover:rotate-90"
              title="Settings"
            >
              <Settings className="w-3 h-3 text-gray-600" />
            </Button>
          </div>

          {/* Achievement indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition cursor-pointer">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">
              {state.achievements?.filter(a => a.unlocked).length || 0}/{state.achievements?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {state.settings?.autoSave && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <LastSaveTime lastSavedAt={state.gameLoop?.lastSaveTime} autoSave={state.settings?.autoSave} />
          </div>
        </div>
      )}

    </header>
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader;
