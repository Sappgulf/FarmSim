import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
  const reelHoldTimerRef = useRef(null);
  const handleReelRef = useRef(() => {});

  // Get systems from context
  const fishingSystem = systems?.fishingSystem;
  const soundSystem = systems?.soundSystem;

  const fishing = {
    pond: {
      level: (state.fishing?.pond?.level) || 1,
      population: (state.fishing?.pond?.population) || 100,
      maxPopulation: (state.fishing?.pond?.maxPopulation) || 100
    },
    stats: {
      totalCaught: (state.fishing?.stats?.totalCaught) || 0,
      totalValue: (state.fishing?.stats?.totalValue) || 0,
      largestFish: (state.fishing?.stats?.largestFish) || 0,
      byType: (state.fishing?.stats?.byType) || {}
    }
  };

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
  const pondLevel = fishing.pond.level || 1;
  const currentUpgrade = POND_UPGRADES[Object.keys(POND_UPGRADES)[pondLevel - 1]];
  const nextUpgrade = POND_UPGRADES[Object.keys(POND_UPGRADES)[pondLevel]];

  const stopReelHold = useCallback(() => {
    if (reelHoldTimerRef.current) {
      clearInterval(reelHoldTimerRef.current);
      reelHoldTimerRef.current = null;
    }
  }, []);

  const resolveMiniGameResult = useCallback((result) => {
    stopReelHold();
    setIsPlaying(false);
    setGameState(null);

    if (!result) return;

    if (result.caught) {
      soundSystem?.playHarvestSound();
      if (typeof window.triggerParticleEffect === 'function') {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        window.triggerParticleEffect(centerX, centerY, 'harvest', {
          text: `🎣 ${result.quality || 'Catch'}! +$${result.value}`,
          value: result.value
        });
      }
    } else if (result.escaped) {
      soundSystem?.playFishEscapeSound();
    }
  }, [soundSystem, stopReelHold]);

  // Mini-game loop
  useEffect(() => {
    if (!isPlaying || !fishingSystem) return;

    const intervalId = setInterval(() => {
      try {
        const stepResult = fishingSystem.stepMiniGame?.();
        if (stepResult?.caught || stepResult?.escaped) {
          resolveMiniGameResult(stepResult);
          return;
        }

        const activeCatch = fishingSystem.getActiveCatch();
        if (activeCatch) {
          setGameState(activeCatch);
          setReelPosition(activeCatch.playerPosition);
        } else {
          resolveMiniGameResult(null);
        }
      } catch (error) {
        console.error('[farm]', 'Fishing: Error in mini-game loop', error);
        resolveMiniGameResult(null);
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
      stopReelHold();
    };
  }, [fishingSystem, isPlaying, resolveMiniGameResult, stopReelHold]);

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
        setReelPosition(result.catch.playerPosition);
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
    if (result?.state) {
      setReelPosition(result.state.playerPosition);
      setGameState(result.state);
    }
  };

  handleReelRef.current = handleReel;

  const startReelHold = useCallback((direction) => {
    if (!isPlaying) return;
    handleReelRef.current(direction);
    stopReelHold();
    reelHoldTimerRef.current = setInterval(() => {
      handleReelRef.current(direction);
    }, 85);
  }, [isPlaying, stopReelHold]);

  const handleUpgradePond = () => {
    if (!fishingSystem) return;

    const result = fishingSystem.upgradePond();
    if (result.success) {
      soundSystem?.playBuildSound();
    } else {
      soundSystem?.playErrorSound();
    }
  };

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

  useEffect(() => () => stopReelHold(), [stopReelHold]);

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

  const safeZoneWidth = Math.max(10, ((gameState?.zoneHalfWidth || 0.1) * 200));
  const tensionPercent = Math.floor((gameState?.lineTension || 0) * 100);

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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
            <div className="text-2xl font-bold text-amber-600">{stats.streak || 0}</div>
            <div className="text-xs text-gray-600">Catch Streak</div>
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
        <Card className="p-8 bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 shadow-lg hover:shadow-xl transition-all">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-bounce-slow">🎣</div>
            <h3 className="text-2xl font-bold mb-2 text-blue-900">Ready to Fish?</h3>
            <p className="text-sm text-gray-700 mb-6">
              Cast your line and catch rare species! Use A/D keys or hold controls to reel with precision.
            </p>
            <Button
              onClick={handleCastLine}
              variant="primary"
              size="lg"
              disabled={fishing.pond.population < 10}
              className="hover:scale-110 transition-transform text-lg px-8 py-6"
            >
              🎣 Cast Line
            </Button>
            {fishing.pond.population < 10 && (
              <p className="text-xs text-red-600 mt-3 font-semibold">
                ⚠️ Not enough fish in pond. Wait for population to recover ({Math.floor(fishing.pond.population)}/10).
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300 relative overflow-hidden">
          {/* Mini-game UI */}
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{gameState?.fish.emoji}</div>
              <div className="font-bold text-xl text-gray-800">
                {gameState?.fish.name} Hooked!
              </div>
              <div className="text-sm text-gray-700">
                Size: {gameState?.size}cm • Base Value: ${gameState?.fish.baseValue}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-center text-sm font-bold mb-2">
                  Catch Progress: {Math.floor((gameState?.progress || 0) * 100)}%
                </div>
                <Progress
                  value={(gameState?.progress || 0) * 100}
                  className="h-5"
                  variant="growth"
                />
              </div>
              <div>
                <div className="text-center text-sm font-bold mb-2">
                  Line Tension: {tensionPercent}%
                </div>
                <Progress
                  value={tensionPercent}
                  className="h-5"
                  variant={tensionPercent >= 75 ? 'health' : tensionPercent >= 50 ? 'energy' : 'growth'}
                />
              </div>
            </div>

            {/* Fishing Bar */}
            <div className="relative h-28 sm:h-32 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 rounded-lg overflow-hidden mb-4 border-4 border-blue-600 shadow-2xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse"></div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-800/50 to-transparent"></div>
              </div>

              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-green-400/80 via-green-300/70 to-green-400/80 border-x-2 border-green-200 shadow-lg transition-all duration-100"
                style={{
                  left: `${((gameState?.fishPosition || 0.5) * 100) - (safeZoneWidth / 2)}%`,
                  width: `${safeZoneWidth}%`
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-300 font-bold text-xs">
                  SAFE ZONE
                </div>
              </div>

              <div
                className="absolute top-2 text-2xl transition-all duration-100"
                style={{
                  left: `${(gameState?.fishPosition || 0.5) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {gameState?.fish.emoji}
              </div>

              <div
                className="absolute bottom-2 w-9 h-16 sm:w-10 sm:h-20 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-lg border-4 border-yellow-600 transition-all duration-75 shadow-xl"
                style={{
                  left: `${reelPosition * 100}%`,
                  transform: `translateX(-50%) ${gameState?.inZone ? 'rotate(0deg)' : 'rotate(-4deg)'}`
                }}
              >
                <div className="text-center text-2xl sm:text-3xl leading-none mt-1 sm:mt-2">🎣</div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-300 opacity-80"></div>
              </div>

              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white font-bold bg-black/50 px-2 py-1 rounded">
                {gameState?.inZone ? '✅ CONTROLLED' : '⚠️ OUT OF ZONE'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleReel('left')}
                  onMouseDown={() => startReelHold('left')}
                  onMouseUp={stopReelHold}
                  onMouseLeave={stopReelHold}
                  onTouchStart={(event) => {
                    event.preventDefault();
                    startReelHold('left');
                  }}
                  onTouchEnd={stopReelHold}
                  onTouchCancel={stopReelHold}
                  variant="default"
                  size="lg"
                  className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 sm:px-6 transition-all duration-150 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation"
                  disabled={!isPlaying}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⬅️</span>
                    <span>LEFT</span>
                  </div>
                  <div className="text-xs opacity-75">(Hold / A)</div>
                </Button>
                <Button
                  onClick={() => handleReel('right')}
                  onMouseDown={() => startReelHold('right')}
                  onMouseUp={stopReelHold}
                  onMouseLeave={stopReelHold}
                  onTouchStart={(event) => {
                    event.preventDefault();
                    startReelHold('right');
                  }}
                  onTouchEnd={stopReelHold}
                  onTouchCancel={stopReelHold}
                  variant="default"
                  size="lg"
                  className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 sm:px-6 transition-all duration-150 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation"
                  disabled={!isPlaying}
                >
                  <div className="flex items-center gap-2">
                    <span>RIGHT</span>
                    <span className="text-xl">➡️</span>
                  </div>
                  <div className="text-xs opacity-75">(Hold / D)</div>
                </Button>
              </div>

              <div className="flex justify-between items-center text-sm bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-white font-semibold">
                  Quality Window: <span className="text-emerald-300">{Math.floor(((gameState?.qualityWindowMs || 0) / Math.max(1, gameState?.elapsedMs || 1)) * 100)}%</span>
                </div>
                <div className="text-white font-semibold">
                  Time: <span className="text-red-300">{Math.max(0, Math.ceil(((gameState?.timeLimit || 0) - (gameState?.elapsedMs || 0)) / 1000))}s</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-blue-200 font-semibold">
                  🎯 Track the fish and stay inside the safe zone.
                </p>
                <p className="text-xs text-blue-300">
                  Hold buttons for smooth mobile control. High tension can snap the line.
                </p>
              </div>
            </div>
          </div>

          {/* Water Effect Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-400/20 to-transparent animate-pulse" />
          </div>
        </Card>
      )}

      {/* Fish Collection */}
      <Card className="p-4 shadow-md">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
          🐟 Fish Encyclopedia
          <span className="text-xs text-gray-500 font-normal ml-2">
            Caught: {Object.keys(stats.byType).length}/{Object.keys(FISH_TYPES).length} species
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(FISH_TYPES).map(fish => {
            const caughtCount = stats.byType[fish.id] || 0;
            const isCaught = caughtCount > 0;

            return (
              <Card
                key={fish.id}
                className={`p-3 transition-all duration-200 ${isCaught
                    ? 'bg-white hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-blue-200'
                    : 'bg-gray-100 opacity-50'
                  }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {isCaught ? fish.emoji : '❓'}
                  </div>
                  <div className={`font-bold ${getRarityColor(fish.rarity)}`}>
                    {isCaught ? fish.name : '???'}
                  </div>

                  {isCaught && (
                    <>
                      <div className="text-xs text-gray-600 mb-2">
                        {fish.description}
                      </div>

                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getRarityBadge(fish.rarity)}
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Value:</span>
                          <span className="font-bold text-green-600">
                            ${fish.baseValue}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Size:</span>
                          <span>{fish.size.min}-{fish.size.max}cm</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Caught:</span>
                          <span className="font-bold">{caughtCount}x</span>
                        </div>
                      </div>
                    </>
                  )}

                  {!isCaught && (
                    <div className="text-xs text-gray-500">
                      Not yet discovered
                    </div>
                  )}
                </div>
              </Card>
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
          <li>• Keep your 🎣 rod near the fish to build catch progress and quality</li>
          <li>• Keep line tension low or the line can snap</li>
          <li>• Pond population regenerates over time</li>
          <li>• Keep streaks alive for better coin payouts per catch</li>
          <li>• Upgrade your pond for wider safe zones and better rare fish odds</li>
          <li>• Hold controls on mobile for smooth tracking</li>
        </ul>
      </Card>
    </div>
  );
});

FishingTab.displayName = 'FishingTab';

export default FishingTab;
