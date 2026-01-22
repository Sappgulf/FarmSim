/**
 * FarmGame - Main Game Component (Refactored)
 * A clean, modular implementation of the farm simulation game
 */
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Leaf, ShoppingCart, Trophy, Dna, Building2, Settings, CloudSun,
  Target, Package, RotateCcw, Volume2, VolumeX
} from 'lucide-react';

// Hooks
import { useGameState } from '../hooks/useGameState';
import { useFarm } from '../hooks/useFarm';
import { useWeather } from '../hooks/useWeather';
import { useTutorial } from '../hooks/useTutorial';

// Game Components
import { FarmGrid } from './game/FarmGrid';
import { StatsBar } from './game/StatsBar';
import { NotificationStack } from './game/NotificationStack';
import { WeatherDisplay } from './game/WeatherDisplay';
import { Tutorial } from './game/Tutorial';
import { BottomNav } from './game/BottomNav';
import { SeedTray } from './game/SeedTray';
import { BuildingIndicators } from './game/BuildingIndicators';
import { Confetti, useConfetti } from './game/Confetti';
import { DebugOverlay } from './DebugOverlay';
import { MenuDrawer } from './MenuDrawer';

// Panels
import { ShopPanel } from './panels/ShopPanel';
import { InventoryPanel } from './panels/InventoryPanel';
import { AchievementsPanel } from './panels/AchievementsPanel';
import { BreedingPanel } from './panels/BreedingPanel';

// Data
import { GRID_CONFIG, GAME_SETTINGS, LEVELS } from '../data/constants';
import { BUILDINGS } from '../data/buildings';
import { CROPS, QUALITY_TIERS } from '../data/crops';

// Utils
import { nowSec } from '../utils/time.mjs';
import { loadGameSave, saveGameState, saveGameStateImmediate } from '../utils/save.mjs';

export default function FarmGame() {
  // ============ STATE MANAGEMENT ============

  // Core game state
  const gameState = useGameState();
  const {
    coins, totalEarned, levelId, levelStatus, levelEndsAt, level, prestige, prestigeData,
    tutorialComplete, tutorialStep, notifications, stats,
    addCoins, spendCoins, addNotification, removeNotification, updateStats,
    checkLevelProgress, startLevel, advanceTutorial, completeTutorial,
    getSaveData: getGameSaveData, loadSaveData: loadGameSaveData,
  } = gameState;

  // Buildings state (before farm to provide bonuses)
  const [buildings, setBuildings] = useState([]);

  // Calculate building bonuses
  const buildingBonuses = useMemo(() => {
    const bonuses = {};
    // Barn: +20% harvest value
    if (buildings.includes('barn')) {
      bonuses.barnBonus = 0.2;
    }
    // Greenhouse: 50% faster growth (applied in FarmGrid)
    if (buildings.includes('greenhouse')) {
      bonuses.greenhouseBonus = 0.5;
    }
    // Beehive: +25% quality chance (applied in quality calc)
    if (buildings.includes('beehive')) {
      bonuses.beehiveBonus = 0.25;
    }
    // Windmill: +5 coins/min (handled in game loop)
    if (buildings.includes('windmill')) {
      bonuses.windmillIncome = 5;
    }
    return bonuses;
  }, [buildings]);

  // Farm state
  const farm = useFarm(addNotification, addCoins, updateStats, prestigeData, buildingBonuses);
  const {
    gridSize, plots, selectedSeed, inventory, comboCount, comboMultiplier,
    setSelectedSeed, setInventory,
    plant, water, fertilize, harvest, treatPest, treatDisease, expandFarm, addToInventory,
    getCropData, getPlotStatus,
    getSaveData: getFarmSaveData, loadSaveData: loadFarmSaveData,
  } = farm;

  // Weather state
  const weather = useWeather(addNotification);
  const {
    currentSeason, currentWeather, seasonData, weatherData, forecast,
    seasonEndsAt: weatherSeasonEndsAt, weatherChangesAt,
    changeWeather, changeSeason, generateForecast,
    getGrowthModifier, doesWeatherWater, getDamageRisk,
    getSaveData: getWeatherSaveData, loadSaveData: loadWeatherSaveData,
  } = weather;

  // Tutorial state
  const tutorial = useTutorial(tutorialComplete, tutorialStep, advanceTutorial, completeTutorial);
  const {
    showTutorial, currentStep, totalSteps, progress: tutorialProgress, highlightedElement, hints,
    nextStep: tutorialNextStep, skipTutorial, showHint,
  } = tutorial;

  // Celebrations
  const {
    trigger: confettiTrigger,
    intensity: confettiIntensity,
    fire: fireConfetti,
  } = useConfetti();

  // Local UI state
  const [activeTab, setActiveTab] = useState('farm');
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  );
  const [achievements, setAchievements] = useState([]);
  const [discoveredHybrids, setDiscoveredHybrids] = useState([]);
  const lastTickRef = useRef(nowSec());
  const lastWindmillPayoutRef = useRef(0);
  const prevLevelStatusRef = useRef(levelStatus);

  // ============ GAME LOOP ============

  useEffect(() => {
    const tickInterval = setInterval(() => {
      // Skip ticks when tab is hidden (saves CPU/battery)
      if (document.hidden) return;

      const now = nowSec();
      lastTickRef.current = now;

      // Check level progress
      checkLevelProgress();

      // Check season change
      if (weatherSeasonEndsAt > 0 && now >= weatherSeasonEndsAt) {
        changeSeason();
      }

      // Check weather change
      if (weatherChangesAt > 0 && now >= weatherChangesAt) {
        changeWeather();
      }

      // Apply weather effects to crops
      if (doesWeatherWater()) {
        // Auto-water all crops during rain
        plots.forEach((plot, index) => {
          if (plot.crop && !plot.wateredAt) {
            water(index);
          }
        });
      }

      // Windmill passive income (5 coins per minute)
      if (buildingBonuses.windmillIncome) {
        const timeSinceLastPayout = now - lastWindmillPayoutRef.current;
        if (timeSinceLastPayout >= 60) { // Every minute
          addCoins(buildingBonuses.windmillIncome, 'windmill');
          lastWindmillPayoutRef.current = now;
        }
      }

      // Random pest/disease chance (reduced)
      const damageRisk = getDamageRisk();
      if (damageRisk.risk > 0 && Math.random() < damageRisk.risk * 0.1) {
        // Apply damage to a random crop
        const cropsWithPlants = plots
          .map((p, i) => ({ plot: p, index: i }))
          .filter(({ plot }) => plot.crop && !plot.hasPest && !plot.hasDisease);

        if (cropsWithPlants.length > 0) {
          const target = cropsWithPlants[Math.floor(Math.random() * cropsWithPlants.length)];
          // Apply pest or disease based on weather
          if (Math.random() < 0.5) {
            // This would need to update plots state - handled separately
          }
        }
      }
    }, GAME_SETTINGS.TICK_INTERVAL);

    return () => clearInterval(tickInterval);
  }, [checkLevelProgress, weatherSeasonEndsAt, weatherChangesAt, changeSeason, changeWeather, doesWeatherWater, getDamageRisk, plots, water, buildingBonuses, addCoins]);

  // Celebrate major milestones
  useEffect(() => {
    const prevStatus = prevLevelStatusRef.current;
    if (!reducedMotion && levelStatus === 'won' && prevStatus !== 'won') {
      fireConfetti('high');
    }
    prevLevelStatusRef.current = levelStatus;
  }, [levelStatus, reducedMotion, fireConfetti]);

  // ============ SAVE/LOAD ============

  // Load save on mount
  useEffect(() => {
    const savedData = loadGameSave();
    if (savedData) {
      loadGameSaveData(savedData.gameState);
      loadFarmSaveData(savedData.farm);
      loadWeatherSaveData(savedData.weather);
      if (savedData.buildings) setBuildings(savedData.buildings);
      if (savedData.achievements) setAchievements(savedData.achievements);
      if (savedData.discoveredHybrids) setDiscoveredHybrids(savedData.discoveredHybrids);
    } else {
      // New game - initialize
      generateForecast();
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const createSaveData = () => ({
      gameState: getGameSaveData(),
      farm: getFarmSaveData(),
      weather: getWeatherSaveData(),
      buildings,
      achievements,
      discoveredHybrids,
      savedAt: nowSec(),
    });

    const saveInterval = setInterval(() => {
      saveGameState(createSaveData());
    }, GAME_SETTINGS.AUTO_SAVE_INTERVAL);

    // Save immediately before page unload
    const handleBeforeUnload = () => {
      saveGameStateImmediate(createSaveData());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getGameSaveData, getFarmSaveData, getWeatherSaveData, buildings, achievements, discoveredHybrids]);

  // ============ HANDLERS ============

  // Shop handlers
  const handleBuySeeds = useCallback((seedId, qty) => {
    const crop = CROPS[seedId];
    if (!crop) return;

    const totalCost = crop.shopPrice * qty;
    if (spendCoins(totalCost)) {
      addToInventory({ [seedId]: qty });
      addNotification(`Bought ${qty} ${crop.emoji} ${seedId} seeds!`, 'success');
    }
  }, [spendCoins, addToInventory, addNotification]);

  const handleBuyTool = useCallback((toolId) => {
    const tool = { fertilizer: 8, pesticide: 6, fungicide: 12 }[toolId];
    if (!tool) return;

    if (spendCoins(tool)) {
      addToInventory({ [toolId]: 1 });
      addNotification(`Bought ${toolId}!`, 'success');
    }
  }, [spendCoins, addToInventory, addNotification]);

  const handleExpandFarm = useCallback(() => {
    const cost = GRID_CONFIG.EXPANSION_COSTS[gridSize + 1];
    if (cost && spendCoins(cost)) {
      const expanded = expandFarm(cost);
      if (expanded && !reducedMotion) {
        fireConfetti('medium');
      }
    }
  }, [gridSize, spendCoins, expandFarm, reducedMotion, fireConfetti]);

  const handleBuyBuilding = useCallback((buildingId) => {
    const building = BUILDINGS[buildingId];
    if (!building || buildings.includes(buildingId)) return;

    if (spendCoins(building.price)) {
      setBuildings(prev => [...prev, buildingId]);
      addNotification(`Built ${building.emoji} ${building.name}!`, 'success');
      if (!reducedMotion) {
        fireConfetti('medium');
      }
    }
  }, [buildings, spendCoins, addNotification, reducedMotion, fireConfetti]);

  // Reset game
  const handleResetGame = useCallback(() => {
    if (confirm('Are you sure you want to reset your farm? All progress will be lost!')) {
      localStorage.removeItem('farmSim_save_v3');
      window.location.reload();
    }
  }, []);

  // Handle bottom nav tab change
  const handleTabChange = useCallback((tabId) => {
    if (tabId === 'menu') {
      setMenuOpen(true);
    } else {
      setActiveTab(tabId);
    }
  }, []);

  const handleHarvest = useCallback((plotIndex) => {
    const result = harvest(plotIndex);
    if (!result || reducedMotion) return result;

    const isGreatQuality = result.quality?.id >= QUALITY_TIERS.EXCELLENT.id;
    const isBigWin = result.value >= 120;

    if (result.mutation || isGreatQuality || isBigWin) {
      fireConfetti(isBigWin ? 'high' : 'medium');
    }

    return result;
  }, [harvest, reducedMotion, fireConfetti]);

  // Harvest all ready crops
  const handleHarvestAll = useCallback(() => {
    let harvestedCount = 0;
    let totalValue = 0;

    plots.forEach((_, index) => {
      const { status } = getPlotStatus(index);
      if (status === 'ready') {
        const result = harvest(index);
        if (result) {
          harvestedCount++;
          totalValue += result.value;
        }
      }
    });

    if (harvestedCount > 0) {
      addNotification(`🎉 Harvested ${harvestedCount} crops for ${totalValue}🪙!`, 'success');

      if (!reducedMotion && (harvestedCount >= 5 || totalValue >= 150)) {
        const bigWin = harvestedCount >= 10 || totalValue >= 250;
        fireConfetti(bigWin ? 'high' : 'medium');
      }
    }
  }, [plots, getPlotStatus, harvest, addNotification, reducedMotion, fireConfetti]);

  // ============ RENDER ============

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      {/* Notifications */}
      <NotificationStack
        notifications={notifications}
        onDismiss={removeNotification}
      />

      {/* Celebrations */}
      {!reducedMotion && (
        <Confetti trigger={confettiTrigger} intensity={confettiIntensity} />
      )}

      {/* Tutorial Overlay */}
      <Tutorial
        showTutorial={showTutorial}
        currentStep={currentStep}
        tutorialStep={tutorialStep}
        totalSteps={totalSteps}
        progress={tutorialProgress}
        highlightedElement={highlightedElement}
        onNext={tutorialNextStep}
        onSkip={skipTutorial}
      />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-4 pb-20 sm:pb-4">
        {/* Header Stats Bar */}
        <StatsBar
          coins={coins}
          level={level}
          levelId={levelId}
          levelStatus={levelStatus}
          levelEndsAt={levelEndsAt}
          currentSeason={currentSeason}
          seasonData={seasonData}
          currentWeather={currentWeather}
          weatherData={weatherData}
          comboCount={comboCount}
          comboMultiplier={comboMultiplier}
          prestige={prestige}
          prestigeData={prestigeData}
        />

        {/* Desktop Layout */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mt-4">
          {/* Left Column - Farm */}
          <div className="col-span-2 space-y-4">
            {/* Weather Display */}
            <WeatherDisplay
              currentWeather={currentWeather}
              weatherData={weatherData}
              currentSeason={currentSeason}
              seasonData={seasonData}
              forecast={forecast}
            />

            {/* Active Building Bonuses */}
            <BuildingIndicators buildings={buildings} />

            {/* Quick Seed Selector */}
            <SeedTray
              inventory={inventory}
              selectedSeed={selectedSeed}
              onSelectSeed={setSelectedSeed}
              onOpenShop={() => setActiveTab('shop')}
            />

            {/* Farm Grid */}
            <FarmGrid
              gridSize={gridSize}
              plots={plots}
              getPlotStatus={getPlotStatus}
              getCropData={getCropData}
              onPlant={plant}
              onHarvest={handleHarvest}
              onWater={water}
              onTreatPest={treatPest}
              onTreatDisease={treatDisease}
              onFertilize={fertilize}
              onHarvestAll={handleHarvestAll}
            />

            {/* Inventory Panel */}
            <InventoryPanel
              inventory={inventory}
              selectedSeed={selectedSeed}
              onSelectSeed={setSelectedSeed}
            />
          </div>

          {/* Right Column - Tabs */}
          <div className="space-y-4">
            <Tabs defaultValue="shop" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="shop">
                  <ShoppingCart size={16} />
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Trophy size={16} />
                </TabsTrigger>
                <TabsTrigger value="breeding">
                  <Dna size={16} />
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings size={16} />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shop" className="mt-4">
                <ShopPanel
                  coins={coins}
                  inventory={inventory}
                  gridSize={gridSize}
                  buildings={buildings}
                  onBuySeeds={handleBuySeeds}
                  onBuyTool={handleBuyTool}
                  onExpandFarm={handleExpandFarm}
                  onBuyBuilding={handleBuyBuilding}
                />
              </TabsContent>

              <TabsContent value="achievements" className="mt-4">
                <AchievementsPanel
                  unlockedAchievements={achievements}
                  stats={stats}
                />
              </TabsContent>

              <TabsContent value="breeding" className="mt-4">
                <BreedingPanel
                  inventory={inventory}
                  discoveredHybrids={discoveredHybrids}
                  prestige={prestige}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings size={20} />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sound Effects</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                      >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </Button>
                    </div>

                    {/* Level Selection */}
                    <div>
                      <span className="text-sm font-medium mb-2 block">Quick Start Level</span>
                      <div className="flex flex-wrap gap-2">
                        {LEVELS.map(L => (
                          <Button
                            key={L.id}
                            variant="outline"
                            size="sm"
                            onClick={() => startLevel(L.id)}
                            className="text-xs"
                          >
                            {L.id === 'endless' ? '♾️' : L.label.split(' ')[0]}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleResetGame}
                        className="w-full"
                      >
                        <RotateCcw size={14} className="mr-1" />
                        Reset Game
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden mt-4 space-y-4">
          {activeTab === 'farm' && (
            <>
              <WeatherDisplay
                currentWeather={currentWeather}
                weatherData={weatherData}
                currentSeason={currentSeason}
                seasonData={seasonData}
                forecast={forecast}
              />
              <BuildingIndicators buildings={buildings} />
              <SeedTray
                inventory={inventory}
                selectedSeed={selectedSeed}
                onSelectSeed={setSelectedSeed}
                onOpenShop={() => setActiveTab('shop')}
              />
              <FarmGrid
                gridSize={gridSize}
                plots={plots}
                getPlotStatus={getPlotStatus}
                getCropData={getCropData}
                onPlant={plant}
              onHarvest={handleHarvest}
                onWater={water}
                onTreatPest={treatPest}
                onTreatDisease={treatDisease}
                onFertilize={fertilize}
                onHarvestAll={handleHarvestAll}
              />
              <InventoryPanel
                inventory={inventory}
                selectedSeed={selectedSeed}
                onSelectSeed={setSelectedSeed}
              />
            </>
          )}

          {activeTab === 'shop' && (
            <ShopPanel
              coins={coins}
              inventory={inventory}
              gridSize={gridSize}
              buildings={buildings}
              onBuySeeds={handleBuySeeds}
              onBuyTool={handleBuyTool}
              onExpandFarm={handleExpandFarm}
              onBuyBuilding={handleBuyBuilding}
            />
          )}

          {activeTab === 'goals' && (
            <AchievementsPanel
              unlockedAchievements={achievements}
              stats={stats}
            />
          )}

          {activeTab === 'breeding' && (
            <BreedingPanel
              inventory={inventory}
              discoveredHybrids={discoveredHybrids}
              prestige={prestige}
            />
          )}

          {activeTab === 'buildings' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 size={20} className="text-orange-600" />
                  Buildings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(BUILDINGS).map(([id, building]) => {
                    const owned = buildings.includes(id);
                    return (
                      <div
                        key={id}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border
                          ${owned ? 'bg-green-50 border-green-200' : 'bg-gray-50'}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{building.emoji}</span>
                          <div>
                            <div className="font-medium text-sm">{building.name}</div>
                            <div className="text-xs text-gray-500">{building.description}</div>
                          </div>
                        </div>
                        {owned ? (
                          <span className="text-green-600 text-sm font-medium">✓ Owned</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleBuyBuilding(id)}
                            disabled={coins < building.price}
                          >
                            {building.price}🪙
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(v => !v)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(v => !v)}
        coins={coins}
        prestige={prestige}
        levelId={levelId}
        onStartLevel={startLevel}
        onResetGame={handleResetGame}
        onShowAchievements={() => { setActiveTab('achievements'); setMenuOpen(false); }}
        onShowBreeding={() => { setActiveTab('breeding'); setMenuOpen(false); }}
      />

      {/* Debug Overlay (toggle with ` key) */}
      {import.meta.env.DEV && (
        <DebugOverlay
          gameState={{ coins, levelId, levelStatus }}
          farmState={{ plots, gridSize }}
          weatherState={{ currentSeason, currentWeather }}
        />
      )}
    </div>
  );
}
