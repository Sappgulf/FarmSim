import React, { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Component imports
import { GameHeader } from './game/GameHeader';
import { FarmGrid } from './farm/FarmGrid';
import { Shop } from './game/Shop';
import { WeatherDisplay } from './game/WeatherDisplay';
import { AchievementsPanel } from './game/AchievementsPanel';
import { Notifications } from './ui/Notifications';

// Hook imports
import { useGameState } from '../hooks/useGameState';
import { useWeather } from '../hooks/useWeather';
import { useCrops } from '../hooks/useCrops';
import { useAchievements } from '../hooks/useAchievements';
import { useMarket } from '../hooks/useMarket';

// Utility imports
import { 
  LEVELS, 
  SEED_TYPES, 
  BUILDING_TYPES, 
  EQUIPMENT_TYPES, 
  INSURANCE_TYPES,
  WEATHER_TYPES 
} from '../utils/gameConstants';

/**
 * Main Farm Simulation Component (Refactored)
 * 
 * This is a cleaner, more maintainable version of the original FarmSimCanvas
 * that uses smaller, focused components and custom hooks.
 */
export default function FarmSimCanvas() {
  // Use the centralized game state hook
  const gameState = useGameState();
  
  // Use specialized game logic hooks
  const weather = useWeather(gameState.currentTime, gameState.addNotification);
  const crops = useCrops(gameState);
  const achievements = useAchievements(gameState);
  const market = useMarket();
  
  // Destructure commonly used state
  const {
    coins, addCoins, spendCoins,
    plots, setPlots,
    selectedSeed, setSelectedSeed,
    levelId, levelEndsAt, levelStatus,
    currentTime, setCurrentTime,
    notifications, addNotification,
    shopTab, setShopTab,
    buildings, setBuildings,
    equipment, setEquipment,
    inventory, setInventory,
    prestigeLevel,
    paused, setPaused,
    nowSec
  } = gameState;

  // Memoized computations
  const level = useMemo(() => 
    LEVELS.find(l => l.id === levelId), 
    [levelId]
  );

  // GAME LOGIC FUNCTIONS
  
  const plantSeed = (plotIndex) => {
    const plot = plots[plotIndex];
    const seed = SEED_TYPES[selectedSeed];
    
    if (!seed || plot.state !== "empty") return;
    
    if (!spendCoins(seed.price)) {
      addNotification(`Not enough coins for ${seed.name}!`, "error");
      return;
    }
    
    // Check inventory
    if ((inventory[selectedSeed] || 0) < 1) {
      addNotification(`No ${seed.name} seeds in inventory!`, "error");
      addCoins(seed.price); // Refund
      return;
    }
    
    // Plant the seed
    setPlots(prev => prev.map((p, i) => 
      i === plotIndex ? {
        ...p,
        state: "planted",
        seed: seed,
        progress: 0,
        plantedAt: nowSec()
      } : p
    ));
    
    // Remove seed from inventory
    setInventory(prev => ({
      ...prev,
      [selectedSeed]: (prev[selectedSeed] || 0) - 1
    }));
    
    addNotification(`Planted ${seed.name}! 🌱`, "success");
  };

  const harvestCrop = (plotIndex) => {
    const plot = plots[plotIndex];
    
    if (plot.state !== "ready") return;
    
    const earnings = plot.seed.baseValue;
    addCoins(earnings);
    
    setPlots(prev => prev.map((p, i) => 
      i === plotIndex ? {
        ...p,
        state: "empty",
        seed: null,
        progress: 0,
        plantedAt: 0
      } : p
    ));
    
    addNotification(`Harvested ${plot.seed.name} for ${earnings} coins! 🌾`, "success");
  };

  const handlePlotClick = (plotIndex) => {
    const plot = plots[plotIndex];
    
    if (plot.state === "empty") {
      plantSeed(plotIndex);
    } else if (plot.state === "ready") {
      harvestCrop(plotIndex);
    }
  };

  const handlePlotRightClick = (plotIndex) => {
    const plot = plots[plotIndex];
    
    if (plot.state === "planted" || plot.state === "growing") {
      // Apply fertilizer if available
      if (inventory.fertilizer > 0) {
        setInventory(prev => ({
          ...prev,
          fertilizer: prev.fertilizer - 1
        }));
        
        setPlots(prev => prev.map((p, i) => 
          i === plotIndex ? {
            ...p,
            fertilizedAt: nowSec(),
            progress: Math.min(100, p.progress + 25)
          } : p
        ));
        
        addNotification("Applied fertilizer! 🌱", "success");
      } else {
        addNotification("No fertilizer available!", "error");
      }
    }
  };

  const handlePurchase = (type, itemId) => {
    switch (type) {
      case 'seed':
        const seed = SEED_TYPES[itemId];
        if (spendCoins(seed.price)) {
          setInventory(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
          }));
          addNotification(`Bought ${seed.name} seed!`, "success");
        }
        break;
        
      case 'building':
        const building = BUILDING_TYPES[itemId];
        if (spendCoins(building.price)) {
          setBuildings(prev => ({
            ...prev,
            [itemId]: true
          }));
          addNotification(`Built ${building.name}!`, "success");
        }
        break;
        
      case 'equipment':
        const equip = EQUIPMENT_TYPES[itemId];
        if (spendCoins(equip.price) && !equipment.includes(itemId)) {
          setEquipment(prev => [...prev, itemId]);
          addNotification(`Bought ${equip.name}!`, "success");
        }
        break;
        
      default:
        addNotification("Invalid purchase type!", "error");
    }
  };

  // GAME LOOP - Simplified growth system
  useEffect(() => {
    if (paused) return;
    
    const interval = setInterval(() => {
      const now = nowSec();
      setCurrentTime(now);
      
      // Process crop growth
      setPlots(prev => prev.map(plot => {
        if (plot.state === "planted" || plot.state === "growing") {
          const timePlanted = now - plot.plantedAt;
          const growthTime = plot.seed.growthTime;
          let progress = (timePlanted / growthTime) * 100;
          
          // Apply building bonuses
          if (buildings.greenhouse) {
            progress *= 1.5;
          }
          
          // Apply fertilizer bonus
          if (plot.fertilizedAt > 0) {
            progress *= 1.25;
          }
          
          if (progress >= 100) {
            return { ...plot, state: "ready", progress: 100 };
          } else {
            return { ...plot, state: "growing", progress };
          }
        }
        return plot;
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [paused, buildings, nowSec, setCurrentTime, setPlots]);

  // UI EVENT HANDLERS
  const handlePauseToggle = () => {
    setPaused(prev => !prev);
    addNotification(paused ? "Game resumed" : "Game paused", "info");
  };

  const handleSettingsClick = () => {
    addNotification("Settings menu coming soon!", "info");
  };

  const handleNotificationDismiss = (id) => {
    // Already handled by the useGameState hook
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Game Header */}
        <GameHeader
          coins={coins}
          score={gameState.score}
          name={gameState.name}
          levelId={levelId}
          level={level}
          levelEndsAt={levelEndsAt}
          levelStatus={levelStatus}
          currentTime={currentTime}
          prestigeLevel={prestigeLevel}
          paused={paused}
          onPauseToggle={handlePauseToggle}
          onSettingsClick={handleSettingsClick}
        />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Farm Grid - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <FarmGrid
              plots={plots}
              gridSize={gameState.gridSize}
              selectedSeed={selectedSeed}
              onPlotClick={handlePlotClick}
              onPlotRightClick={handlePlotRightClick}
              animationsEnabled={gameState.animationsEnabled}
            />
          </div>
          
          {/* Side Panel with Tabs */}
          <div className="space-y-4">
            <Tabs value={shopTab} onValueChange={setShopTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="shop">🛒 Shop</TabsTrigger>
                <TabsTrigger value="weather">🌤️ Weather</TabsTrigger>
                <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
                <TabsTrigger value="stats">📊 Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shop">
                <Shop
                  gameState={gameState}
                  marketPrices={market.prices}
                  economicEvent={market.currentEvent}
                  onBuySeeds={(type, quantity) => {
                    // Handle seed purchase through market hook
                    const seed = market.buySeed(type, quantity);
                    if (seed && gameState.spendCoins(seed.cost)) {
                      gameState.setInventory(prev => ({
                        ...prev,
                        [type]: (prev[type] || 0) + quantity
                      }));
                      gameState.addNotification(`Bought ${quantity}x ${seed.name}`, "success");
                    }
                  }}
                  onBuyBuilding={(type) => {
                    // Handle building purchase
                    const building = BUILDING_TYPES[type];
                    const owned = gameState.buildings[type] || 0;
                    const cost = building.cost * Math.pow(1.5, owned);
                    
                    if (gameState.spendCoins(cost)) {
                      gameState.setBuildings(prev => ({
                        ...prev,
                        [type]: owned + 1
                      }));
                      gameState.addNotification(`Built ${building.name}!`, "success");
                    }
                  }}
                  onSellCrops={(type, quantity) => {
                    // Handle crop selling through market hook
                    const earnings = market.sellCrop(type, quantity);
                    if (earnings && gameState.inventory[type] >= quantity) {
                      gameState.addCoins(earnings);
                      gameState.setInventory(prev => ({
                        ...prev,
                        [type]: (prev[type] || 0) - quantity
                      }));
                      gameState.addNotification(`Sold ${quantity}x for $${earnings.toFixed(2)}`, "success");
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="weather">
                <WeatherDisplay
                  weather={weather.current}
                  weatherForecast={weather.forecast}
                  weatherEvents={weather.events}
                  currentTime={gameState.currentTime}
                  onForceWeatherChange={weather.forceChange}
                />
              </TabsContent>
              
              <TabsContent value="achievements">
                <AchievementsPanel
                  unlockedAchievements={achievements.unlocked}
                  achievementProgress={achievements.progress}
                  onClaimReward={(achievementId) => {
                    const reward = achievements.claimReward(achievementId);
                    if (reward) {
                      gameState.addCoins(reward.coins);
                      gameState.addNotification(`Achievement reward claimed: $${reward.coins}!`, "success");
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold mb-4">📊 Farm Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div>Total Earned: {gameState.totalEarned} coins</div>
                    <div>Current Score: {gameState.score}</div>
                    <div>Achievements: {achievements.unlocked.length}/{Object.keys(achievements.progress).length}</div>
                    <div>Buildings: {Object.values(buildings).reduce((a, b) => a + b, 0)}</div>
                    <div>Equipment: {equipment.length}</div>
                    <div>Current Weather: {weather.current.type}</div>
                    <div>Market Trends: {Object.keys(market.prices).length} tracked</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Notifications */}
        <Notifications 
          notifications={notifications} 
          onDismiss={handleNotificationDismiss}
        />
      </div>
    </div>
  );
}
