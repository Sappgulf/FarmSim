import React, { memo, useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { FISH_TYPES, POND_UPGRADES } from '../../systems/FishingSystem';

const FishingTab = memo(() => {
  const { state, actions, systems } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [reelPosition, setReelPosition] = useState(0.5);

  // Get systems from context
  const fishingSystem = systems?.fishingSystem;
  const soundSystem = systems?.soundSystem;

  // Check if system becomes available
  React.useEffect(() => {
    if (fishingSystem) {
      // System is now available
    }
  }, [fishingSystem]);


  const fishing = useMemo(() => ({
    pond: {
      level: (state.fishing?.pond?.level) || 1,
      population: (state.fishing?.pond?.population) || 100,
      maxPopulation: (state.fishing?.pond?.maxPopulation) || 100
    },
    stats: {
      totalCaught: (state.fishing?.stats?.totalCaught) || 0,
      totalValue: (state.fishing?.stats?.totalValue) || 0,
      largestFish: (state.fishing?.stats?.largestFish) || 0,
      byType: (state.fishing?.stats?.byType) || {},
      streak: (state.fishing?.stats?.streak) || 0,
      bestStreak: (state.fishing?.stats?.bestStreak) || 0
    }
  }), [state.fishing]);

  // Safety check for imports
  if (!FISH_TYPES || !POND_UPGRADES || typeof FISH_TYPES !== 'object' || typeof POND_UPGRADES !== 'object') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <div className="text-lg font-semibold text-red-700">Error Loading Fishing Data</div>
          <div className="text-sm text-red-500 mt-2">FISH_TYPES or POND_UPGRADES failed to import</div>
        </div>
      </div>
    );
  }

  // If system isn't available yet, show loading
  if (!fishingSystem) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-3">🎣</div>
          <div className="text-lg font-semibold text-gray-700">Loading Fishing System...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait a moment</div>
        </div>
      </div>
    );
  }

  const stats = fishingSystem.getStats() || fishing.stats;
  const streakBonusPercent = Math.min(20, (stats.streak || 0) * 2);
  const pondLevel = fishing.pond.level || 1;
  const currentUpgrade = POND_UPGRADES[Object.keys(POND_UPGRADES)[pondLevel - 1]];
  const nextUpgrade = POND_UPGRADES[Object.keys(POND_UPGRADES)[pondLevel]];

  // Mini-game loop
  useEffect(() => {
    if (!isPlaying || !fishingSystem) return;

    const intervalId = setInterval(() => {
      try {
        const activeCatch = fishingSystem.getActiveCatch();
        if (activeCatch) {
          setGameState(activeCatch);
          setReelPosition(activeCatch.playerPosition);
        } else {
          setIsPlaying(false);
          setGameState(null);
        }
      } catch (error) {
        console.error('[farm]', 'Fishing: Error in mini-game loop', error);
        setIsPlaying(false);
        setGameState(null);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [isPlaying, fishingSystem]);

  const handleCastLine = () => {
    if (!fishingSystem) {
      console.error('[farm]', 'FishingTab: fishingSystem not available');
      actions.addNotification({
        message: 'Fishing system not ready yet',
        type: 'error'
      });
      return;
    }

    try {
      const result = fishingSystem.castLine();
      if (result.success) {
        setIsPlaying(true);
        setGameState(result.catch);
        soundSystem?.playWaterSound(); // Cast sound

        // Add excitement notification
        actions.addNotification({
          message: `🎣 Hooked a ${result.catch.fish.name}! Keep it in the safe zone!`,
          type: 'info'
        });
      } else {
        soundSystem?.playErrorSound();
        actions.addNotification({
          message: result.message,
          type: 'warning'
        });
        console.warn('[farm]', 'FishingTab: Failed to cast line', result.message);
      }
    } catch (error) {
      console.error('[farm]', 'FishingTab: Error casting line', error);
      soundSystem?.playErrorSound();
      actions.addNotification({
        message: 'Error casting line',
        type: 'error'
      });
    }
  };

  const handleReel = (direction) => {
    if (!fishingSystem || !isPlaying) return;

    // Play reel sound
    soundSystem?.playReelSound();

    const result = fishingSystem.updateReelPosition(direction);

    if (result.caught) {
      setIsPlaying(false);
      setGameState(null);
      soundSystem?.playHarvestSound();

      // Trigger particle effect for success
      if (typeof window.triggerParticleEffect === 'function') {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        window.triggerParticleEffect(centerX, centerY, 'harvest', {
          text: `🎣 Caught ${result.fish.name}! +$${result.value}`,
          value: result.value
        });
      }

      // Success notification
      actions.addNotification({
        message: `🎉 Caught ${result.fish.name} (${result.size}cm) for $${result.value}!`,
        type: 'success'
      });
    } else if (result.escaped) {
      setIsPlaying(false);
      setGameState(null);
      soundSystem?.playFishEscapeSound();

      // Failure notification
      actions.addNotification({
        message: `💨 The ${result.fish.name} got away! Try again.`,
        type: 'warning'
      });
    }
  };

  const handleUpgradePond = () => {
    if (!fishingSystem) return;

    const result = fishingSystem.upgradePond();
    if (result.success) {
      soundSystem?.playBuildSound();
    } else {
      soundSystem?.playErrorSound();
    }
  };

  // Keyboard controls
  // Use ref to avoid stale closure issues without requiring handleReel in deps
  const handleReelRef = React.useRef(handleReel);
  React.useEffect(() => {
    handleReelRef.current = handleReel;
  });

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleReelRef.current('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleReelRef.current('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const getRarityColor = (rarity) => {
    if (rarity <= 0.01) return 'text-purple-600 font-bold'; // Legendary
    if (rarity <= 0.04) return 'text-orange-600 font-bold'; // Epic
    if (rarity <= 0.1) return 'text-blue-600'; // Rare
    if (rarity <= 0.25) return 'text-green-600'; // Uncommon
    return 'text-gray-600'; // Common
  };

  const getRarityBadge = (rarity) => {
    if (rarity <= 0.01) return <Badge className="bg-purple-500">Legendary</Badge>;
    if (rarity <= 0.04) return <Badge className="bg-orange-500">Epic</Badge>;
    if (rarity <= 0.1) return <Badge className="bg-blue-500">Rare</Badge>;
    if (rarity <= 0.25) return <Badge className="bg-green-500">Uncommon</Badge>;
    return <Badge className="bg-gray-500">Common</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 shadow-md hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
          🎣 Fishing Pond
          <Badge variant="outline" className="ml-auto text-xs">
            Level {pondLevel}
          </Badge>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.totalCaught}</div>
            <div className="text-xs text-gray-600">Fish Caught</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalValue}</div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.largestFish}cm</div>
            <div className="text-xs text-gray-600">Biggest Fish</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">{Math.floor(fishing.pond.population)}</div>
            <div className="text-xs text-gray-600">Population</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">x{stats.streak || 0}</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">x{stats.bestStreak || 0}</div>
            <div className="text-xs text-gray-600">Best Streak</div>
          </div>
        </div>
      </Card>

      {/* Pond Upgrade */}
      <Card className="p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-4xl">🏞️</div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{currentUpgrade.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={(fishing.pond.population / fishing.pond.maxPopulation) * 100}
                  className="h-2 flex-1 max-w-xs"
                  variant="growth"
                />
                <span className="text-sm text-gray-600">
                  {Math.floor(fishing.pond.population)}/{fishing.pond.maxPopulation}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Regen Rate: {currentUpgrade.regenRate}x • Better fish quality
              </p>
            </div>
          </div>
          {nextUpgrade && (
            <Button
              onClick={handleUpgradePond}
              variant="primary"
              size="sm"
              disabled={state.coins < nextUpgrade.cost}
              className="hover:scale-105 transition-transform ml-3"
            >
              <div className="text-center">
                <div className="font-bold">Upgrade Pond</div>
                <div className="text-xs">{nextUpgrade.name} • ${nextUpgrade.cost}</div>
              </div>
            </Button>
          )}
        </div>
      </Card>

      {/* Mini-Game */}
      {!isPlaying ? (
        <Card className="p-8 bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 shadow-xl border-4 border-blue-200 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/water-drizzle.png')] opacity-10"></div>

          <div className="text-center relative z-10 p-4">
            <div className="text-[5rem] mb-4 drop-shadow-lg group-hover:scale-110 transition-transform duration-500 cursor-default">🎣</div>
            <h3 className="text-3xl font-extrabold mb-2 text-blue-900 tracking-tight">Gone Fishing</h3>
            <p className="text-sm text-blue-800/80 mb-8 max-w-sm mx-auto font-medium">
              Cast your line into the deep blue. Keep the tension centered to reel in rare catches!
            </p>

            <Button
              onClick={handleCastLine}
              variant="default"
              size="lg"
              disabled={fishing.pond.population < 10}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform active:scale-95 transition-all text-xl px-12 py-8 rounded-2xl h-auto"
            >
              <span className="flex flex-col items-center">
                <span>🌊 CAST LINE</span>
                <span className="text-xs font-normal opacity-80 mt-1">Cost: 0 Energy</span>
              </span>
            </Button>

            {fishing.pond.population < 10 && (
              <div className="mt-4 inline-block bg-red-100/80 text-red-700 px-4 py-2 rounded-lg text-xs font-bold border border-red-200">
                ⚠️ Pond Depleted! Recovering... ({Math.floor(fishing.pond.population)}/10)
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gray-900 relative overflow-hidden ring-4 ring-blue-400">
          {/* Minigame UI */}
          <div className="relative z-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 text-white">
              <div className="flex items-center gap-3">
                <span className="text-4xl animate-bounce">{gameState?.fish.emoji}</span>
                <div>
                  <div className="font-bold text-lg text-blue-200 tracking-wider">HOOKED!</div>
                  <div className="text-2xl font-black uppercase">{gameState?.fish.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-300 uppercase font-bold">Target Value</div>
                <div className="text-xl font-mono text-green-400">${gameState?.fish.baseValue}</div>
                {stats.streak > 0 && (
                  <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                    Streak Bonus +{streakBonusPercent}%
                  </div>
                )}
              </div>
            </div>

            {/* Game Bar Container */}
            <div className="relative h-20 bg-gray-800 rounded-full border-4 border-gray-700 mb-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Safe Zone */}
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-green-500/80 via-green-400 to-green-500/80 shadow-[0_0_15px_rgba(74,222,128,0.5)] border-x-2 border-white/50 transition-all duration-100 ease-linear"
                style={{
                  left: `${(gameState?.targetZone || 0.5) * 100 - 15}%`,
                  width: '30%'
                }}
              >
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                </div>
              </div>

              {/* Reel Marker (Player) */}
              <div
                className={`
                        absolute top-1 bottom-1 w-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-75 z-10
                        ${reelPosition < (gameState?.targetZone || 0.5) - 0.15 || reelPosition > (gameState?.targetZone || 0.5) + 0.15
                    ? 'bg-red-500 shadow-red-500/50'
                    : 'bg-white shadow-white/50 scale-y-110'}
                    `}
                style={{ left: `${reelPosition * 100}%` }}
              >
                <div className="absolute -top-1 -bottom-1 w-0.5 bg-white/50 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-400 mb-1">
                <span>Escape Risk</span>
                <span>Catch Progress</span>
              </div>
              <Progress
                value={(gameState?.progress || 0) * 100}
                className="h-4 bg-gray-700"
                indicatorClassName={`transition-all duration-500 ${(gameState?.progress || 0) > 0.8 ? 'bg-green-500' : 'bg-blue-500'}`}
              />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onMouseDown={() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); }} // Hint at interaction
                onTouchStart={() => handleReel('left')}
                onClick={() => handleReel('left')}
                className="h-16 bg-gray-800 hover:bg-gray-700 border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all"
              >
                <span className="text-2xl mr-2">⬅️</span>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-white">REEL LEFT</span>
                  <span className="text-[10px] text-gray-400">Hold 'A' / Left Arrow</span>
                </div>
              </Button>

              <Button
                onMouseDown={() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' })); }}
                onTouchStart={() => handleReel('right')}
                onClick={() => handleReel('right')}
                className="h-16 bg-gray-800 hover:bg-gray-700 border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all"
              >
                <div className="flex flex-col items-end text-right">
                  <span className="font-bold text-white">REEL RIGHT</span>
                  <span className="text-[10px] text-gray-400">Hold 'D' / Right Arrow</span>
                </div>
                <span className="text-2xl ml-2">➡️</span>
              </Button>
            </div>
          </div>

          {/* Particles/Background */}
          <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-gray-900 to-black"></div>
        </Card>
      )}

      {/* Fish Collection */}
      <Card className="p-4 shadow-sm border-2 border-stone-200 bg-[#fdfbf7]">
        <h4 className="font-bold mb-4 flex items-center justify-between text-stone-800 font-serif border-b border-stone-200 pb-2">
          <span>📖 Angler's Journal</span>
          <span className="text-xs font-normal font-sans bg-stone-200 text-stone-600 px-2 py-1 rounded">
            {Object.keys(stats.byType).length} / {Object.keys(FISH_TYPES).length} Discovered
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {Object.values(FISH_TYPES).map(fish => {
            const caughtCount = stats.byType[fish.id] || 0;
            const isCaught = caughtCount > 0;

            return (
              <div
                key={fish.id}
                className={`
                    relative p-3 rounded border transition-all duration-200
                    ${isCaught
                    ? 'bg-white border-stone-300 shadow-sm hover:shadow-md'
                    : 'bg-stone-100 border-stone-200 opacity-60'
                  }
                `}
              >
                {/* Stamp Effect for Caught Items */}
                {isCaught && (
                  <div className="absolute top-2 right-2 opacity-10 text-4xl rotate-12 pointer-events-none select-none">✅</div>
                )}

                <div className="flex gap-3">
                  <div className={`
                    w-12 h-12 flex items-center justify-center rounded-lg text-2xl border
                    ${isCaught ? 'bg-blue-50 border-blue-100' : 'bg-stone-200 border-stone-300 grayscale'}
                  `}>
                    {isCaught ? fish.emoji : '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${isCaught ? 'text-gray-900' : 'text-gray-400'}`}>
                      {isCaught ? fish.name : 'Unknown Species'}
                    </div>

                    {isCaught ? (
                      <div className="text-xs space-y-0.5 mt-1">
                        <div className="flex justify-between text-stone-500">
                          <span>Value:</span> <span className="font-mono text-stone-800">${fish.baseValue}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Rarity:</span> <span className={`${getRarityColor(fish.rarity)} font-bold`}>{getRarityBadge(fish.rarity)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-stone-500 italic mt-2">
                        Catch to reveal details...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          💡 Fishing Tips
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Keep your 🎣 reel in the green zone to catch fish</li>
          <li>• Rarer fish are harder to catch but worth more</li>
          <li>• Pond population regenerates over time</li>
          <li>• Build a streak for up to +20% catch value</li>
          <li>• Upgrade your pond for better fish and faster regeneration</li>
          <li>• Use keyboard (A/D or Arrow Keys) for faster control</li>
        </ul>
      </Card>
    </div>
  );
});

FishingTab.displayName = 'FishingTab';

export default FishingTab;
