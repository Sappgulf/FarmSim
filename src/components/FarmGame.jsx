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
  Target, Package, RotateCcw, Volume2, VolumeX, HelpCircle, Crown, Factory
} from 'lucide-react';

// Hooks
import { useGameState } from '../hooks/useGameState';
import { useFarm } from '../hooks/useFarm';
import { useWeather } from '../hooks/useWeather';
import { useTutorial } from '../hooks/useTutorial';
import { useSound } from '../hooks/useSound';
import { useAchievements } from '../hooks/useAchievements';
import { useDayNight } from '../hooks/useDayNight';

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
import { ScreenFlash, useScreenFlash } from './game/ScreenFlash';
import { DebugOverlay } from './DebugOverlay';
import { MenuDrawer } from './MenuDrawer';
import { WelcomeScreen } from './game/WelcomeScreen';
import { MilestonePopup, MILESTONES } from './game/MilestonePopup';
import { HelpGuide } from './game/HelpGuide';
import { TimeDisplay } from './game/TimeDisplay';
import { StoryDashboard } from './game/StoryDashboard';

// Panels
import { ShopPanel } from './panels/ShopPanel';
import { InventoryPanel } from './panels/InventoryPanel';
import { AchievementsPanel } from './panels/AchievementsPanel';
import { BreedingPanel } from './panels/BreedingPanel';
import { ProcessingPanel } from './panels/ProcessingPanel';
import { LivestockPanel } from './panels/LivestockPanel';
import { PrestigePanel } from './panels/PrestigePanel';
import { ScrapbookPanel } from './panels/ScrapbookPanel';

// Data
import { GRID_CONFIG, GAME_SETTINGS, LEVELS } from '../data/constants';
import { BUILDINGS, LIVESTOCK, PROCESSING_RECIPES } from '../data/buildings';
import { CROPS, QUALITY_TIERS } from '../data/crops';
import { BLESSINGS, MEMORIES, MEMORY_CHAPTERS, MOOD_TIERS, WISHING_WELL } from '../data/identity';

// Utils
import { nowSec } from '../utils/time.mjs';
import { loadGameSave, saveGameState, saveGameStateImmediate } from '../utils/save.mjs';

const getMoodTierForPoints = (points) => {
  let tier = MOOD_TIERS[0];
  for (const candidate of MOOD_TIERS) {
    if (points >= candidate.min) tier = candidate;
  }
  return tier;
};

const FEATURED_CROP_BY_SEASON = {
  spring: 'carrot',
  summer: 'corn',
  fall: 'pumpkin',
  winter: 'garlic',
};

const getFeaturedCropId = (season) => {
  return FEATURED_CROP_BY_SEASON[season] || 'carrot';
};

export default function FarmGame() {
  // ------------ STATE MANAGEMENT ------------

  // Core game state
  const gameState = useGameState();
  const {
    coins, totalEarned, levelId, levelStatus, levelEndsAt, level, prestige, prestigeData,
    tutorialComplete, tutorialStep, notifications, stats, levelStartedAt,
    addCoins, spendCoins, addNotification, removeNotification, updateStats,
    checkLevelProgress, startLevel, advanceTutorial, completeTutorial, doPrestige,
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

  // ============ IDENTITY SYSTEM (Mood / Memory / Philosophy) ============
  const [philosophy, setPhilosophy] = useState(null);
  const [moodPoints, setMoodPoints] = useState(0);
  const [memoryFlags, setMemoryFlags] = useState({});
  const memoryFlagsRef = useRef({});
  const [farmDay, setFarmDay] = useState(1);
  const [lastWishDay, setLastWishDay] = useState(null);
  const [activeBlessing, setActiveBlessing] = useState(null);
  const [storyPulse, setStoryPulse] = useState(false);

  const moodTier = useMemo(() => getMoodTierForPoints(moodPoints), [moodPoints]);

  const growthMultiplier = useMemo(() => {
    if (activeBlessing?.type === 'growth_bonus') {
      return Math.min(1 + activeBlessing.value, 1.2);
    }
    return 1;
  }, [activeBlessing]);

  // Farm state
  const farm = useFarm(addNotification, addCoins, updateStats, prestigeData, buildingBonuses, growthMultiplier);
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

  const featuredCropId = useMemo(() => getFeaturedCropId(currentSeason), [currentSeason]);
  const featuredCropData = CROPS[featuredCropId];

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

  // Screen flash effects
  const {
    trigger: flashTrigger,
    color: flashColor,
    flashGold,
    flashGreen,
    flashPurple,
  } = useScreenFlash();

  // Local UI state
  const [activeTab, setActiveTab] = useState('farm');
  const [rightTab, setRightTab] = useState('shop');
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound effects - linked to soundEnabled state
  const sound = useSound(soundEnabled);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  );
  const [discoveredHybrids, setDiscoveredHybrids] = useState([]);
  const lastTickRef = useRef(nowSec());
  const lastWindmillPayoutRef = useRef(0);
  const prevLevelStatusRef = useRef(levelStatus);

  // New systems
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('farmSim_welcomed'));
  const [showHelp, setShowHelp] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [claimedMilestones, setClaimedMilestones] = useState([]);

  // Livestock state
  const [ownedAnimals, setOwnedAnimals] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);

  // Processing state
  const [processingQueue, setProcessingQueue] = useState([]);
  const [completedProducts, setCompletedProducts] = useState([]);

  // Day/night cycle
  const dayNight = useDayNight(false);
  const { currentPeriod, timeDisplay, getEffects, getVisuals, gameHour } = dayNight;

  // Achievement tracking
  const achievementSystem = useAchievements(
    addNotification,
    () => sound.playLevelUp(),
    (intensity) => !reducedMotion && fireConfetti(intensity)
  );
  const { unlockedAchievements, checkAchievements } = achievementSystem;

  // Keep memory flags ref in sync for idempotent unlocks
  useEffect(() => {
    memoryFlagsRef.current = memoryFlags;
  }, [memoryFlags]);

  // Story pulse helper
  const storyPulseTimeoutRef = useRef(null);
  const triggerStoryPulse = useCallback(() => {
    setStoryPulse(true);
    if (storyPulseTimeoutRef.current) {
      clearTimeout(storyPulseTimeoutRef.current);
    }
    storyPulseTimeoutRef.current = setTimeout(() => {
      setStoryPulse(false);
    }, 2400);
  }, []);
  useEffect(() => () => {
    if (storyPulseTimeoutRef.current) {
      clearTimeout(storyPulseTimeoutRef.current);
    }
  }, []);

  // Mood helper (positive-only)
  const bumpMood = useCallback((amount = 1) => {
    if (amount <= 0) return;
    setMoodPoints(prev => Math.min(prev + amount, 100));
  }, []);

  // Memory unlock helper (idempotent)
  const unlockMemory = useCallback((memoryId) => {
    if (memoryFlagsRef.current[memoryId]) return false;
    const memory = MEMORIES.find(m => m.id === memoryId);
    setMemoryFlags(prev => ({ ...prev, [memoryId]: true }));
    if (memory) {
      addNotification(`📖 Memory saved: ${memory.title}`, 'info');
    }
    triggerStoryPulse();
    return true;
  }, [addNotification, triggerStoryPulse]);

  // React to mood tier changes
  const prevMoodTierRef = useRef(moodTier.id);
  useEffect(() => {
    if (prevMoodTierRef.current !== moodTier.id) {
      if (['cozy', 'blooming', 'radiant'].includes(moodTier.id)) {
        unlockMemory('first_cozy_mood');
      }
      triggerStoryPulse();
      prevMoodTierRef.current = moodTier.id;
    }
  }, [moodTier.id, unlockMemory, triggerStoryPulse]);

  const vibeLine = useMemo(() => {
    const vibes = moodTier?.vibes || [];
    if (vibes.length === 0) return '';
    const index = farmDay % vibes.length;
    return vibes[index];
  }, [moodTier, farmDay]);

  const cozySuggestion = useMemo(() => {
    if (!philosophy) return '';
    const cropLabel = featuredCropData ? `${featuredCropData.emoji} ${featuredCropId}` : 'a seasonal crop';
    if (philosophy === 'nature') {
      if (['rainy', 'stormy'].includes(currentWeather)) {
        return `Let the rain handle watering—plant ${cropLabel}.`;
      }
      return `Lean into ${seasonData?.name || currentSeason}: try ${cropLabel}.`;
    }
    if (philosophy === 'market') {
      return `Featured today: ${cropLabel}. Stock a few seeds or sell the next batch.`;
    }
    return 'Place a new building or open the scrapbook for a quiet moment.';
  }, [philosophy, currentWeather, currentSeason, featuredCropId, featuredCropData, seasonData]);

  const memoryTeaserData = useMemo(() => {
    const unlockedCount = MEMORIES.reduce((count, memory) => count + (memoryFlags[memory.id] ? 1 : 0), 0);
    const nextMemory = MEMORIES.find(memory => !memoryFlags[memory.id]);
    if (!nextMemory) {
      return {
        memoryTeaser: 'All pages are complete. Your story feels whole.',
        memoryProgress: `${unlockedCount}/${MEMORIES.length} complete`,
      };
    }

    const chapter = MEMORY_CHAPTERS.find(c => c.id === nextMemory.chapterId);
    const chapterMemories = MEMORIES.filter(m => m.chapterId === nextMemory.chapterId);
    const chapterUnlocked = chapterMemories.reduce((count, m) => count + (memoryFlags[m.id] ? 1 : 0), 0);
    const chapterLabel = chapter ? `${chapterUnlocked}/${chapterMemories.length} ${chapter.name}` : '';

    return {
      memoryTeaser: nextMemory.hint,
      memoryProgress: chapterLabel,
    };
  }, [memoryFlags]);

  const canWishToday = lastWishDay === null || farmDay !== lastWishDay;
  const canAffordWish = coins >= WISHING_WELL.cost;
  const canWish = canWishToday && canAffordWish;
  const wishDisabledReason = !canWishToday
    ? 'The well is resting until tomorrow.'
    : (!canAffordWish ? `Need ${WISHING_WELL.cost}🪙 to wish.` : '');

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
    if (levelStatus === 'won' && prevStatus !== 'won') {
      sound.playLevelUp();
      flashGreen();
      if (!reducedMotion) {
        fireConfetti('high');
      }
      // Show level complete milestone
      if (!claimedMilestones.includes('level_complete_' + levelId)) {
        setCurrentMilestone({ id: 'level_complete', reward: level?.reward || 0 });
      }
    }
    prevLevelStatusRef.current = levelStatus;
  }, [levelStatus, reducedMotion, fireConfetti, sound, flashGreen, level, levelId, claimedMilestones]);

  // Check achievements periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAchievements({
        stats,
        totalEarned,
        prestige,
        gridSize,
        buildings,
        discoveredHybrids,
        inventory,
        levelId,
        levelStatus,
        levelStartedAt: gameState.levelStartedAt,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [checkAchievements, stats, totalEarned, prestige, gridSize, buildings, discoveredHybrids, inventory, levelId, levelStatus]);

  // Track first plant milestone
  useEffect(() => {
    if (stats.cropsPlanted === 1 && !claimedMilestones.includes('first_plant')) {
      setCurrentMilestone({ id: 'first_plant' });
    }
  }, [stats.cropsPlanted, claimedMilestones]);

  // Track first harvest milestone
  useEffect(() => {
    if (stats.totalHarvests === 1 && !claimedMilestones.includes('first_harvest')) {
      setCurrentMilestone({ id: 'first_harvest' });
    }
  }, [stats.totalHarvests, claimedMilestones]);

  // Track first building milestone
  useEffect(() => {
    if (buildings.length === 1 && !claimedMilestones.includes('first_building')) {
      setCurrentMilestone({ id: 'first_building' });
    }
  }, [buildings.length, claimedMilestones]);

  // Livestock production tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000;

      ownedAnimals.forEach((animal, index) => {
        const livestock = LIVESTOCK[animal.type];
        if (!livestock) return;

        const timeSinceProduct = now - (animal.lastProductAt || now);
        if (timeSinceProduct >= livestock.interval) {
          // Animal produced something!
          setPendingProducts(prev => [...prev, {
            animalId: animal.id,
            type: livestock.product,
            name: livestock.product.charAt(0).toUpperCase() + livestock.product.slice(1),
            emoji: livestock.productEmoji,
            value: livestock.value,
          }]);

          // Update animal's last production time
          setOwnedAnimals(prev => prev.map((a, i) =>
            i === index ? { ...a, lastProductAt: now } : a
          ));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ownedAnimals]);

  // Processing tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setProcessingQueue(prev => {
        const stillProcessing = [];
        const completed = [];

        prev.forEach(item => {
          if (now >= item.startTime + item.duration * 1000) {
            completed.push(item);
          } else {
            stillProcessing.push(item);
          }
        });

        if (completed.length > 0) {
          setCompletedProducts(existing => [...existing, ...completed]);
          addNotification(`${completed.map(c => c.emoji).join('')} Processing complete!`, 'success');
          sound.playSuccess();
        }

        return stillProcessing;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [addNotification, sound]);

  // Help guide keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Day rollover handling (used for wishes + memories)
  const handleDayRollover = useCallback(() => {
    setFarmDay(prev => prev + 1);
    if (activeBlessing) {
      setActiveBlessing(null);
      addNotification('🌅 The blessing fades with the new day.', 'info');
    } else {
      addNotification('🌅 A new day begins on the farm.', 'info');
    }
    unlockMemory('first_day_complete');
  }, [activeBlessing, addNotification, unlockMemory]);

  const prevHourRef = useRef(null);
  useEffect(() => {
    if (gameHour === undefined || gameHour === null) return;
    const prevHour = prevHourRef.current;
    if (prevHour === null) {
      prevHourRef.current = gameHour;
      return;
    }
    if (gameHour < prevHour) {
      handleDayRollover();
    }
    prevHourRef.current = gameHour;
  }, [gameHour, handleDayRollover]);

  // ============ SAVE/LOAD ============

  // Load save on mount
  useEffect(() => {
    const savedData = loadGameSave();
    if (savedData) {
      loadGameSaveData(savedData.gameState);
      loadFarmSaveData(savedData.farm);
      loadWeatherSaveData(savedData.weather);
      if (savedData.buildings) setBuildings(savedData.buildings);
      if (savedData.achievements) achievementSystem.loadSaveData(savedData.achievements);
      if (savedData.discoveredHybrids) setDiscoveredHybrids(savedData.discoveredHybrids);
      if (savedData.dayNight) dayNight.loadSaveData(savedData.dayNight);
      if (savedData.ownedAnimals) setOwnedAnimals(savedData.ownedAnimals);
      if (savedData.claimedMilestones) setClaimedMilestones(savedData.claimedMilestones);
      if (savedData.identity) {
        const identity = savedData.identity;
        if (identity.philosophy) setPhilosophy(identity.philosophy);
        if (Number.isFinite(identity.moodPoints)) setMoodPoints(identity.moodPoints);
        if (identity.memoryFlags) setMemoryFlags(identity.memoryFlags);
        if (Number.isFinite(identity.farmDay)) setFarmDay(Math.max(1, identity.farmDay));
        if (Number.isFinite(identity.lastWishDay)) setLastWishDay(identity.lastWishDay);
        if (identity.activeBlessing) {
          const blessing = BLESSINGS.find(b => b.id === identity.activeBlessing.id);
          setActiveBlessing(blessing ? { ...blessing, ...identity.activeBlessing } : identity.activeBlessing);
        }
      }
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
      achievements: achievementSystem.getSaveData(),
      discoveredHybrids,
      dayNight: dayNight.getSaveData(),
      ownedAnimals,
      claimedMilestones,
      identity: {
        philosophy,
        moodPoints,
        memoryFlags,
        farmDay,
        lastWishDay,
        activeBlessing,
      },
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
  }, [
    getGameSaveData,
    getFarmSaveData,
    getWeatherSaveData,
    buildings,
    discoveredHybrids,
    ownedAnimals,
    claimedMilestones,
    achievementSystem,
    dayNight,
    philosophy,
    moodPoints,
    memoryFlags,
    farmDay,
    lastWishDay,
    activeBlessing,
  ]);

  // ------------ HANDLERS ------------

  const handleSelectPhilosophy = useCallback((philosophyId) => {
    if (philosophyId === philosophy) return;
    setPhilosophy(philosophyId);
    addNotification('📌 Philosophy selected. Your story has a new direction.', 'info');
    bumpMood(1);
    triggerStoryPulse();
  }, [addNotification, bumpMood, triggerStoryPulse, philosophy]);

  const handleScrapbookOpen = useCallback(() => {
    setStoryPulse(false);
  }, []);

  const harvestBonusAppliedRef = useRef(false);
  const blessingNoticeRef = useRef(false);
  useEffect(() => {
    harvestBonusAppliedRef.current = false;
    blessingNoticeRef.current = false;
  }, [activeBlessing?.id]);

  const applyHarvestIdentity = useCallback((result) => {
    if (!result) return;

    bumpMood(1);
    unlockMemory('first_harvest');

    if (currentWeather === 'rainy') {
      unlockMemory('first_rainy_harvest');
    }

    if (result.quality?.id >= QUALITY_TIERS.EXCELLENT.id) {
      bumpMood(1);
    }

    if (activeBlessing?.type === 'sell_bonus' && result.crop === featuredCropId) {
      const bonus = Math.max(1, Math.round(result.value * activeBlessing.value));
      addCoins(bonus, 'blessing');
      if (!blessingNoticeRef.current) {
        addNotification(`✨ Blessing bonus +${bonus}🪙`, 'success');
        blessingNoticeRef.current = true;
      }
    }

    if (activeBlessing?.type === 'next_harvest_bonus' && !harvestBonusAppliedRef.current) {
      const bonus = Math.max(1, Math.round(activeBlessing.value));
      addCoins(bonus, 'blessing');
      addNotification(`😊 Friendly faces tipped +${bonus}🪙`, 'success');
      harvestBonusAppliedRef.current = true;
      setActiveBlessing(null);
    }
  }, [activeBlessing, addCoins, addNotification, bumpMood, currentWeather, featuredCropId, unlockMemory]);

  // Shop handlers
  const handleBuySeeds = useCallback((seedId, qty) => {
    const crop = CROPS[seedId];
    if (!crop) return;

    const totalCost = crop.shopPrice * qty;
    if (spendCoins(totalCost)) {
      addToInventory({ [seedId]: qty });
      addNotification(`Bought ${qty} ${crop.emoji} ${seedId} seeds!`, 'success');
      sound.playSuccess();
      bumpMood(1);
      unlockMemory('first_shop_purchase');
    } else {
      sound.playError();
    }
  }, [spendCoins, addToInventory, addNotification, sound, bumpMood, unlockMemory]);

  const handleBuyTool = useCallback((toolId) => {
    const tool = { fertilizer: 8, pesticide: 6, fungicide: 12 }[toolId];
    if (!tool) return;

    if (spendCoins(tool)) {
      addToInventory({ [toolId]: 1 });
      addNotification(`Bought ${toolId}!`, 'success');
      sound.playSuccess();
      bumpMood(1);
      unlockMemory('first_shop_purchase');
    } else {
      sound.playError();
    }
  }, [spendCoins, addToInventory, addNotification, sound, bumpMood, unlockMemory]);

  const handleExpandFarm = useCallback(() => {
    const cost = GRID_CONFIG.EXPANSION_COSTS[gridSize + 1];
    if (cost && spendCoins(cost)) {
      const expanded = expandFarm(cost);
      if (expanded) {
        sound.playLevelUp();
        flashGreen();
        if (!reducedMotion) {
          fireConfetti('medium');
        }
      }
    } else {
      sound.playError();
    }
  }, [gridSize, spendCoins, expandFarm, reducedMotion, fireConfetti, sound, flashGreen]);

  const handleBuyBuilding = useCallback((buildingId) => {
    const building = BUILDINGS[buildingId];
    if (!building || buildings.includes(buildingId)) return;

    if (spendCoins(building.price)) {
      setBuildings(prev => [...prev, buildingId]);
      addNotification(`Built ${building.emoji} ${building.name}!`, 'success');
      sound.playLevelUp();
      flashPurple();
      if (!reducedMotion) {
        fireConfetti('medium');
      }
      bumpMood(2);
      unlockMemory('first_shop_purchase');
      unlockMemory('first_building');
    } else {
      sound.playError();
    }
  }, [buildings, spendCoins, addNotification, reducedMotion, fireConfetti, sound, flashPurple, bumpMood, unlockMemory]);

  // Reset game
  const handleResetGame = useCallback(() => {
    if (confirm('Are you sure you want to reset your farm? All progress will be lost!')) {
      localStorage.removeItem('farmSim_save_v3');
      localStorage.removeItem('farmSim_welcomed');
      window.location.reload();
    }
  }, []);

  // Welcome screen handlers
  const handleWelcomeStart = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('farmSim_welcomed', 'true');
  }, []);

  const handleWelcomeSkip = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('farmSim_welcomed', 'true');
    completeTutorial();
  }, [completeTutorial]);

  // Milestone handlers
  const handleMilestoneClaim = useCallback((reward) => {
    if (currentMilestone && reward > 0) {
      addCoins(reward, 'milestone');
    }
    if (currentMilestone) {
      setClaimedMilestones(prev => [...prev, currentMilestone.id]);
    }
    setCurrentMilestone(null);
  }, [currentMilestone, addCoins]);

  // Livestock handlers
  const handleBuyAnimal = useCallback((type) => {
    const livestock = LIVESTOCK[type];
    if (!livestock || coins < livestock.price) return;

    if (spendCoins(livestock.price)) {
      const newAnimal = {
        id: Date.now(),
        type,
        happiness: 100,
        fedAt: Date.now() / 1000,
        wateredAt: Date.now() / 1000,
        lastProductAt: Date.now() / 1000,
      };
      setOwnedAnimals(prev => [...prev, newAnimal]);
      addNotification(`Bought a ${livestock.emoji} ${livestock.name}!`, 'success');
      sound.playSuccess();

      // First animal milestone
      if (ownedAnimals.length === 0 && !claimedMilestones.includes('first_animal')) {
        setTimeout(() => setCurrentMilestone({ id: 'first_animal' }), 500);
      }
    }
  }, [coins, spendCoins, addNotification, sound, ownedAnimals.length, claimedMilestones]);

  const handleFeedAnimal = useCallback((animalId) => {
    if (spendCoins(5)) {
      setOwnedAnimals(prev => prev.map(a =>
        a.id === animalId ? { ...a, fedAt: Date.now() / 1000, happiness: Math.min(100, (a.happiness || 50) + 20) } : a
      ));
      sound.playSuccess();
    }
  }, [spendCoins, sound]);

  const handleWaterAnimal = useCallback((animalId) => {
    if (spendCoins(2)) {
      setOwnedAnimals(prev => prev.map(a =>
        a.id === animalId ? { ...a, wateredAt: Date.now() / 1000, happiness: Math.min(100, (a.happiness || 50) + 10) } : a
      ));
      sound.playWater();
    }
  }, [spendCoins, sound]);

  const handleCollectProduct = useCallback((index) => {
    const product = pendingProducts[index];
    if (!product) return;

    addCoins(product.value, 'livestock');
    setPendingProducts(prev => prev.filter((_, i) => i !== index));
    sound.playCoin();
    addNotification(`Collected ${product.emoji} for ${product.value} coins!`, 'success');
  }, [pendingProducts, addCoins, sound, addNotification]);

  // Processing handlers
  const handleStartProcessing = useCallback((inputId, quantity) => {
    const recipe = PROCESSING_RECIPES[inputId];
    const crop = CROPS[inputId];
    if (!recipe || !crop) return;

    // Remove items from inventory
    setInventory(prev => ({
      ...prev,
      [inputId]: Math.max(0, (prev[inputId] || 0) - quantity),
    }));

    // Add to processing queue
    const processItem = {
      inputId,
      outputId: recipe.output,
      name: recipe.name,
      emoji: recipe.emoji,
      quantity,
      value: Math.floor(crop.baseValue * recipe.multiplier * quantity),
      startTime: Date.now(),
      duration: recipe.time * quantity,
    };

    setProcessingQueue(prev => [...prev, processItem]);
    addNotification(`Started processing ${crop.emoji} → ${recipe.emoji}!`, 'info');
    sound.playClick();

    // First process milestone
    if (processingQueue.length === 0 && !claimedMilestones.includes('first_process')) {
      setTimeout(() => setCurrentMilestone({ id: 'first_process' }), 500);
    }
  }, [setInventory, addNotification, sound, processingQueue.length, claimedMilestones]);

  const handleCollectProcessed = useCallback((productId, index) => {
    const product = completedProducts[index];
    if (!product) return;

    addCoins(product.value, 'processing');
    setCompletedProducts(prev => prev.filter((_, i) => i !== index));
    sound.playCoin();
    flashGold();
    addNotification(`Collected ${product.emoji} for ${product.value} coins!`, 'success');
  }, [completedProducts, addCoins, sound, flashGold, addNotification]);

  // Prestige handler
  const handlePrestige = useCallback(() => {
    if (doPrestige()) {
      sound.playLevelUp();
      flashPurple();
      if (!reducedMotion) {
        fireConfetti('high');
      }
      if (!claimedMilestones.includes('first_prestige') && prestige === 0) {
        setTimeout(() => setCurrentMilestone({ id: 'first_prestige' }), 1000);
      }
    }
  }, [doPrestige, sound, flashPurple, reducedMotion, fireConfetti, claimedMilestones, prestige]);

  // Wishing Well
  const handleMakeWish = useCallback(() => {
    if (!canWishToday) {
      addNotification('The well is resting until tomorrow.', 'info');
      return;
    }
    if (!spendCoins(WISHING_WELL.cost)) return;

    const blessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    setActiveBlessing({ ...blessing, startedDay: farmDay });
    setLastWishDay(farmDay);
    addNotification(`💧 Wish granted: ${blessing.name}`, 'success');
    sound.playSuccess();

    bumpMood(2);
    if (blessing.type === 'mood_bonus') {
      bumpMood(blessing.value);
    }

    unlockMemory('first_wish');
    triggerStoryPulse();
  }, [canWishToday, spendCoins, farmDay, addNotification, sound, bumpMood, unlockMemory, triggerStoryPulse]);

  // Handle bottom nav tab change
  const handleTabChange = useCallback((tabId) => {
    if (tabId === 'menu') {
      setMenuOpen(true);
    } else {
      setActiveTab(tabId);
    }
    sound.playClick();
  }, [sound]);

  // Sound-enabled plant handler
  const handlePlant = useCallback((plotIndex) => {
    const result = plant(plotIndex);
    if (result) {
      sound.playPlant();
      bumpMood(1);
      unlockMemory('first_seed');
    }
    return result;
  }, [plant, sound, bumpMood, unlockMemory]);

  // Sound-enabled water handler
  const handleWater = useCallback((plotIndex) => {
    const result = water(plotIndex);
    if (result) {
      sound.playWater();
      bumpMood(1);
      unlockMemory('first_watering');
    }
    return result;
  }, [water, sound, bumpMood, unlockMemory]);

  // Sound-enabled fertilize handler
  const handleFertilize = useCallback((plotIndex) => {
    const result = fertilize(plotIndex);
    if (result) {
      sound.playSuccess();
    }
    return result;
  }, [fertilize, sound]);

  const handleHarvest = useCallback((plotIndex) => {
    const result = harvest(plotIndex);
    if (!result) return result;

    applyHarvestIdentity(result);

    // Play harvest sound
    sound.playHarvest();

    // Play coin sound with pitch based on value
    const pitch = Math.min(1 + (result.value / 100) * 0.5, 1.5);
    setTimeout(() => sound.playCoin(pitch), 100);

    const isGreatQuality = result.quality?.id >= QUALITY_TIERS.EXCELLENT.id;
    const isBigWin = result.value >= 120;

    if (result.mutation || isGreatQuality || isBigWin) {
      flashGold();
      if (!reducedMotion) {
        fireConfetti(isBigWin ? 'high' : 'medium');
      }
    }

    // Play combo sound if combo is building
    if (comboCount > 1) {
      setTimeout(() => sound.playCombo(Math.min(comboCount, 4)), 150);
    }

    return result;
  }, [harvest, applyHarvestIdentity, reducedMotion, fireConfetti, sound, flashGold, comboCount]);

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
          applyHarvestIdentity(result);
        }
      }
    });

    if (harvestedCount > 0) {
      addNotification(`🎉 Harvested ${harvestedCount} crops for ${totalValue}🪙!`, 'success');
      sound.playHarvest();

      if (harvestedCount >= Math.min(3, gridSize * gridSize)) {
        unlockMemory('first_harvest_all');
      }

      // Multiple coin sounds for big harvests
      for (let i = 0; i < Math.min(harvestedCount, 5); i++) {
        setTimeout(() => sound.playCoin(1 + i * 0.1), 100 + i * 80);
      }

      const bigWin = harvestedCount >= 5 || totalValue >= 150;
      if (bigWin) {
        flashGold();
        if (!reducedMotion) {
          fireConfetti(harvestedCount >= 10 || totalValue >= 250 ? 'high' : 'medium');
        }
      }
    }
  }, [plots, getPlotStatus, harvest, applyHarvestIdentity, addNotification, reducedMotion, fireConfetti, sound, flashGold, gridSize, unlockMemory]);

  // ------------ RENDER ------------

  // Get day/night visual adjustments
  const dayNightVisuals = getVisuals();

  // If showing welcome screen
  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={handleWelcomeStart}
        onSkip={handleWelcomeSkip}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${dayNightVisuals.bgGradient || 'from-green-50 via-emerald-50 to-teal-50'} transition-colors duration-1000`}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      data-mood-tier={moodTier?.id || 'calm'}
      style={{
        '--mood-accent': moodTier?.accent || '#16a34a',
        '--mood-accent-soft': moodTier?.accentSoft || 'rgba(22, 163, 74, 0.12)',
        '--mood-overlay': moodTier?.overlay || 'rgba(22, 163, 74, 0.06)',
      }}
    >
      {/* Day/night overlay */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 z-0"
        style={{ backgroundColor: dayNightVisuals.overlayColor }}
      />
      {/* Mood overlay */}
      <div className="fixed inset-0 pointer-events-none mood-overlay z-0" />

      {/* Notifications */}
      <NotificationStack
        notifications={notifications}
        onDismiss={removeNotification}
      />

      {/* Help Guide Modal */}
      <HelpGuide isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Milestone Popup */}
      <MilestonePopup
        milestone={currentMilestone}
        onClose={() => setCurrentMilestone(null)}
        onClaim={handleMilestoneClaim}
      />

      {/* Celebrations */}
      {!reducedMotion && (
        <Confetti trigger={confettiTrigger} intensity={confettiIntensity} />
      )}

      {/* Screen flash effects */}
      <ScreenFlash trigger={flashTrigger} color={flashColor} />

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
          timeDisplay={timeDisplay}
          currentPeriod={currentPeriod}
          moodTier={moodTier}
          activeBlessing={activeBlessing}
          onShowHelp={() => setShowHelp(true)}
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
              onPlant={handlePlant}
              onHarvest={handleHarvest}
              onWater={handleWater}
              onTreatPest={treatPest}
              onTreatDisease={treatDisease}
              onFertilize={handleFertilize}
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
            <StoryDashboard
              moodTier={moodTier}
              vibeLine={vibeLine}
              suggestion={cozySuggestion}
              memoryTeaser={memoryTeaserData.memoryTeaser}
              memoryProgress={memoryTeaserData.memoryProgress}
              philosophy={philosophy}
              onSelectPhilosophy={handleSelectPhilosophy}
              onOpenScrapbook={() => setRightTab('scrapbook')}
              storyPulse={storyPulse}
              activeBlessing={activeBlessing}
              canWish={canWish}
              wishCost={WISHING_WELL.cost}
              wishDisabledReason={wishDisabledReason}
              onWish={handleMakeWish}
            />

            <Tabs value={rightTab} onValueChange={setRightTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="shop" title="Shop">
                  <ShoppingCart size={16} />
                </TabsTrigger>
                <TabsTrigger value="process" title="Processing">
                  <Factory size={16} />
                </TabsTrigger>
                <TabsTrigger value="achievements" title="Achievements">
                  <Trophy size={16} />
                </TabsTrigger>
                <TabsTrigger value="prestige" title="Prestige">
                  <Crown size={16} />
                </TabsTrigger>
                <TabsTrigger value="scrapbook" title="Scrapbook">
                  📖
                </TabsTrigger>
                <TabsTrigger value="settings" title="Settings">
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

              <TabsContent value="process" className="mt-4">
                <ProcessingPanel
                  inventory={inventory}
                  coins={coins}
                  hasWorkshop={buildings.includes('workshop')}
                  onProcess={handleStartProcessing}
                  onCollect={handleCollectProcessed}
                  processingQueue={processingQueue}
                  completedProducts={completedProducts}
                  addNotification={addNotification}
                />
              </TabsContent>

              <TabsContent value="achievements" className="mt-4">
                <AchievementsPanel
                  unlockedAchievements={unlockedAchievements}
                  stats={stats}
                />
              </TabsContent>

              <TabsContent value="prestige" className="mt-4">
                <PrestigePanel
                  prestige={prestige}
                  totalEarned={totalEarned}
                  coins={coins}
                  onPrestige={handlePrestige}
                  stats={stats}
                />
              </TabsContent>

              <TabsContent value="scrapbook" className="mt-4">
                <ScrapbookPanel
                  chapters={MEMORY_CHAPTERS}
                  memories={MEMORIES}
                  memoryFlags={memoryFlags}
                  onOpen={handleScrapbookOpen}
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
              <StoryDashboard
                moodTier={moodTier}
                vibeLine={vibeLine}
                suggestion={cozySuggestion}
                memoryTeaser={memoryTeaserData.memoryTeaser}
                memoryProgress={memoryTeaserData.memoryProgress}
                philosophy={philosophy}
                onSelectPhilosophy={handleSelectPhilosophy}
                onOpenScrapbook={() => setActiveTab('scrapbook')}
                storyPulse={storyPulse}
                activeBlessing={activeBlessing}
                canWish={canWish}
                wishCost={WISHING_WELL.cost}
                wishDisabledReason={wishDisabledReason}
                onWish={handleMakeWish}
              />
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
                onPlant={handlePlant}
                onHarvest={handleHarvest}
                onWater={handleWater}
                onTreatPest={treatPest}
                onTreatDisease={treatDisease}
                onFertilize={handleFertilize}
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
              unlockedAchievements={unlockedAchievements}
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

          {activeTab === 'scrapbook' && (
            <ScrapbookPanel
              chapters={MEMORY_CHAPTERS}
              memories={MEMORIES}
              memoryFlags={memoryFlags}
              onOpen={handleScrapbookOpen}
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
        onShowScrapbook={() => { setActiveTab('scrapbook'); setMenuOpen(false); }}
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
