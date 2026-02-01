import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { getSoundSystem } from '../systems/SoundSystem';
import { createXPGranter, recordLevelUp, recordPlayerInteraction } from '../services/XPService';
import { calculateHarvestValue } from '../constants/cropData';
import { createDefaultCropCollections, getCollectionBonusMultiplier, updateCropCollectionProgress } from '../constants/collectionData';
import { createDefaultMarketState, getMarketBonusMultiplier } from '../constants/marketData';
import { getHarvestReputationGain, getTownRepBonus, getTownTierById, getTownTierByRep, getTownTierIndex, TOWN_REP_TIERS } from '../constants/townData';
import { DEFAULT_DAY_LENGTH_MS, DEFAULT_DAYS_PER_SEASON } from '../systems/SeasonSystem';
import { updateQuestProgress } from '../systems/QuestSystem';
import { SAVE_VERSION, loadSavedState, persistSaveData } from './GamePersistence';
import { PLACEABLE_BUILDING_LOOKUP, buildBuildingCoverageMap } from '../constants/placeableBuildingData';
import { buildDailyPlan } from '../constants/townPlan';
import { addTrackedEventListener } from '../services/EventListenerService';
import { getPerfMetrics, isDebugEnabled, profileEnd, profileStart, recordFrameTime } from '../services/DebugService';
import { initializeDebugTracing, runDebugInvariants, traceAction } from '../services/DebugTraceService';

// Game Context for centralized state management
// Provide a default value to prevent "useGame must be used within a GameProvider" errors
// during lazy loading or StrictMode double renders
const GameContext = createContext(null);

// Initialize sound system
const soundSystem = getSoundSystem();

// Action types
const GAME_ACTIONS = {
  // Core game actions
  SET_COINS: 'SET_COINS',
  SET_XP: 'SET_XP',
  SET_LEVEL: 'SET_LEVEL',

  // Plot management
  UPDATE_PLOT: 'UPDATE_PLOT',
  UPDATE_PLOTS: 'UPDATE_PLOTS',
  SET_GRID_SIZE: 'SET_GRID_SIZE',

  // Inventory
  UPDATE_INVENTORY: 'UPDATE_INVENTORY',

  // Weather
  SET_WEATHER: 'SET_WEATHER',
  UPDATE_WEATHER_FORECAST: 'UPDATE_WEATHER_FORECAST',

  // Buildings
  UPDATE_BUILDINGS: 'UPDATE_BUILDINGS',
  UPDATE_BUILDING_PLACEMENTS: 'UPDATE_BUILDING_PLACEMENTS',

  // Livestock
  UPDATE_LIVESTOCK: 'UPDATE_LIVESTOCK',

  // Fishing
  UPDATE_FISHING: 'UPDATE_FISHING',

  // Achievements
  UPDATE_ACHIEVEMENTS: 'UPDATE_ACHIEVEMENTS',

  // Collections
  UPDATE_COLLECTIONS: 'UPDATE_COLLECTIONS',

  // Seasonal events
  SET_SEASONAL_EVENTS: 'SET_SEASONAL_EVENTS',
  UPDATE_ACTIVE_EVENTS: 'UPDATE_ACTIVE_EVENTS',

  // Daily challenges
  SET_DAILY_CHALLENGES: 'SET_DAILY_CHALLENGES',
  UPDATE_CHALLENGE_PROGRESS: 'UPDATE_CHALLENGE_PROGRESS',

  // Daily quests
  UPDATE_DAILY_QUESTS: 'UPDATE_DAILY_QUESTS',
  UPDATE_WEEKLY_CONTRACTS: 'UPDATE_WEEKLY_CONTRACTS',

  // Disaster protections
  UPDATE_DISASTER_PROTECTIONS: 'UPDATE_DISASTER_PROTECTIONS',

  // Prestige
  UPDATE_PRESTIGE: 'UPDATE_PRESTIGE',
  PRESTIGE_RESET: 'PRESTIGE_RESET',

  // Research
  UPDATE_RESEARCH: 'UPDATE_RESEARCH',

  // Genetics
  UPDATE_GENETICS: 'UPDATE_GENETICS',

  // Social
  UPDATE_SOCIAL: 'UPDATE_SOCIAL',

  // Notifications
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',

  // Season
  UPDATE_SEASON: 'UPDATE_SEASON',

  // UI state
  SET_SELECTED_CROP: 'SET_SELECTED_CROP',
  SET_DECORATE_MODE: 'SET_DECORATE_MODE',
  SET_DECORATE_TOOL: 'SET_DECORATE_TOOL',
  SET_SELECTED_DECORATION: 'SET_SELECTED_DECORATION',
  SET_MOVING_DECORATION: 'SET_MOVING_DECORATION',
  UPDATE_DECORATIONS: 'UPDATE_DECORATIONS',
  SET_PLACE_BUILDING_MODE: 'SET_PLACE_BUILDING_MODE',
  SET_SELECTED_BUILDING_PLACEMENT: 'SET_SELECTED_BUILDING_PLACEMENT',

  // Game settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_AUTOMATION: 'UPDATE_AUTOMATION',

  // Performance
  UPDATE_GAME_LOOP: 'UPDATE_GAME_LOOP',

  // Pets
  UPDATE_PETS: 'UPDATE_PETS',

  // Processing
  UPDATE_PROCESSING_FACILITIES: 'UPDATE_PROCESSING_FACILITIES',
  UPDATE_PROCESSING_QUEUE: 'UPDATE_PROCESSING_QUEUE',
  UPDATE_PROCESSED_INVENTORY: 'UPDATE_PROCESSED_INVENTORY',

  // Market
  UPDATE_MARKET: 'UPDATE_MARKET',
  UPDATE_DAILY_PLAN: 'UPDATE_DAILY_PLAN',

  // Save/Load
  LOAD_GAME: 'LOAD_GAME',

  // Cozy Identity v1
  SET_FARM_NAME: 'SET_FARM_NAME',
  SET_THEME: 'SET_THEME',
  SET_PHOTO_MODE: 'SET_PHOTO_MODE',
  PUSH_UNDO: 'PUSH_UNDO',
  POP_UNDO: 'POP_UNDO',
};

const MAX_NOTIFICATION_BACKLOG = 100;

// Helper function to initialize plots
const initializePlots = (gridSize) => {
  const totalPlots = gridSize * gridSize;
  return Array(totalPlots).fill(null).map((_, index) => ({
    id: index,
    state: 'empty',
    crop: null,
    growthStage: 0,
    plantedAt: null,
    waterLevel: 100,
    fertilizer: 0,
    disease: null,
    soilFertility: 1.0,
    progress: 0
  }));
};

// Initial game state
const initialState = {
  // Save metadata
  saveVersion: SAVE_VERSION,

  // Core game state
  coins: 100,
  xp: 0,
  level: 1,
  gridSize: 3,

  // Game objects
  plots: initializePlots(3),
  inventory: {},
  buildings: {},
  buildingPlacements: [],
  livestock: {
    animals: [],
    capacity: 10,
    totalProduced: 0
  },
  fishing: {
    pond: {
      level: 1,
      population: 100,
      maxPopulation: 100
    },
    stats: {
      totalCaught: 0,
      totalValue: 0,
      largestFish: 0,
      byType: {},
      streak: 0,
      bestStreak: 0
    }
  },

  // Weather system
  weather: 'sunny',
  weatherForecast: [],

  // Season system
  season: {
    current: 'spring',
    lastChangeTime: Date.now(),
    dayInSeason: 1,
    dayCount: 1,
    dayLengthMs: DEFAULT_DAY_LENGTH_MS,
    daysPerSeason: DEFAULT_DAYS_PER_SEASON,
    dayStartTime: Date.now(),
    config: null
  },

  // Progression systems
  achievements: [],
  seasonalEvents: [],
  activeSeasonalEvents: [],
  dailyChallenges: [],
  dailyChallengeProgress: {},
  lastChallengeReset: Date.now(),
  challengeStreak: 0,
  dailyQuests: null, // Will be initialized on first render
  weeklyContracts: null,
  disasterProtections: {}, // Disaster insurance and protections
  prestige: {
    tier: 0,
    totalRebirtths: 0,
    legacyPoints: 0,
    legacyBonuses: {},
    heirloomSeeds: [],
  },
  research: {},
  genetics: {},

  // Social features
  social: {
    friends: [],
    reputation: 0,
    marketListings: [],
    townTier: null,
    unlockedPerks: [],
    claimedRewards: [],
    unlockedSeeds: [],
    cosmetics: [],
    vendorDiscount: 0,
  },

  collections: createDefaultCropCollections(),

  market: createDefaultMarketState(),

  // Pets system
  pets: [],

  // Processing system
  processingFacilities: [],
  processingQueue: [],
  processedInventory: {},

  // UI state
  notifications: [],
  selectedCrop: 'carrot', // Currently selected crop for planting
  decorateMode: false,
  decorateTool: 'place',
  selectedDecoration: 'fence-post',
  movingDecorationId: null,
  decorations: [],
  placeBuildingMode: false,
  selectedBuildingPlacement: 'greenhouse',

  // Cozy Identity v1
  farmName: 'My Farm',
  theme: 'default',
  photoMode: false,
  undoStack: [],

  dailyPlan: buildDailyPlan({
    season: {
      current: 'spring',
      config: null,
      dayCount: 1,
    },
    weather: 'sunny',
    market: createDefaultMarketState(),
    social: { reputation: 0 },
  }),
  settings: {
    autoSave: true,
    soundEnabled: true,
    musicEnabled: true,
    animationsEnabled: true,
    reducedMotion: false,
  },
  automation: {
    lastAutoWaterAt: 0,
  },

  // Performance state
  gameLoop: {
    lastUpdate: Date.now(),
    fps: 60,
    paused: false,
    lastSaveTime: null,
  },
};

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.SET_COINS:
      const newCoins = typeof action.payload === 'function' ? action.payload(state.coins) : action.payload;
      return { ...state, coins: newCoins };

    case GAME_ACTIONS.SET_XP:
      const newXp = typeof action.payload === 'function' ? action.payload(state.xp) : action.payload;
      // REBALANCED: Progressive XP requirements - gets harder as you level up
      // Formula: Level = floor(sqrt(XP / 50))  + 1
      // Level 1: 0 XP, Level 2: 50 XP, Level 3: 200 XP, Level 4: 450 XP, Level 5: 800 XP, etc.
      let newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

      // Check if we leveled up and enforce level-up rate limit
      const levelDiff = newLevel - state.level;
      if (levelDiff > 0) {
        // Record level-ups and cap if rate limited
        let allowedLevelUps = 0;
        for (let i = 0; i < levelDiff; i++) {
          if (recordLevelUp()) {
            allowedLevelUps++;
          } else {
            break; // Rate limited
          }
        }
        if (allowedLevelUps < levelDiff) {
          // Cap to allowed level-ups
          newLevel = state.level + allowedLevelUps;
        }
      }

      // Check if we leveled up
      const didLevelUp = newLevel > state.level;

      // Trigger level up particles
      if (didLevelUp && typeof window !== 'undefined') {
        setTimeout(() => {
          if (typeof window.triggerParticleEffect === 'function') {
            // Center of screen
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 3;
            window.triggerParticleEffect(centerX, centerY, 'levelup', {
              text: `🎉 Level ${newLevel}!`,
              shake: true // Shake is now much gentler in ParticleEffect.jsx
            });
          }
        }, 100);
      }

      return {
        ...state,
        xp: newXp,
        level: newLevel,
        ...(didLevelUp && {
          // Trigger level up celebration
          notifications: [
            ...state.notifications,
            {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              message: `🎉 Level ${newLevel} Reached!`,
              type: 'success',
            }
          ]
        })
      };

    case GAME_ACTIONS.UPDATE_PLOT:
      return {
        ...state,
        plots: state.plots.map((plot, index) =>
          index === action.payload.index ? action.payload.plot : plot
        ),
      };

    case GAME_ACTIONS.UPDATE_PLOTS:
      return {
        ...state,
        plots: typeof action.payload === 'function' ? action.payload(state) : action.payload
      };

    case GAME_ACTIONS.SET_GRID_SIZE:
      const newGridSize = action.payload;
      const newTotalPlots = newGridSize * newGridSize;
      const existingPlots = state.plots;
      const nextDecorations = Array.isArray(state.decorations)
        ? state.decorations.filter((decor) => (
          Number.isInteger(decor?.x)
          && Number.isInteger(decor?.y)
          && decor.x >= 0
          && decor.y >= 0
          && decor.x < newGridSize
          && decor.y < newGridSize
        ))
        : [];
      const nextBuildingPlacements = Array.isArray(state.buildingPlacements)
        ? state.buildingPlacements.filter((placement) => (
          Number.isInteger(placement?.x)
          && Number.isInteger(placement?.y)
          && placement.x >= 0
          && placement.y >= 0
          && placement.x < newGridSize
          && placement.y < newGridSize
        ))
        : [];

      // Add new empty plots if expanding
      const updatedPlots = existingPlots.length < newTotalPlots
        ? [
          ...existingPlots,
          ...Array(newTotalPlots - existingPlots.length).fill(null).map((_, index) => ({
            id: existingPlots.length + index,
            state: 'empty',
            crop: null,
            growthStage: 0,
            plantedAt: null,
            waterLevel: 100,
            fertilizer: 0,
            disease: null,
            soilFertility: 1.0,
            progress: 0
          }))
        ]
        : existingPlots.slice(0, newTotalPlots);

      return {
        ...state,
        gridSize: newGridSize,
        plots: updatedPlots,
        decorations: nextDecorations,
        buildingPlacements: nextBuildingPlacements,
      };

    case GAME_ACTIONS.UPDATE_INVENTORY:
      const newInventory = typeof action.payload === 'function' ? action.payload(state) : action.payload;
      return { ...state, inventory: newInventory };

    case GAME_ACTIONS.SET_WEATHER:
      return { ...state, weather: action.payload };

    case GAME_ACTIONS.UPDATE_WEATHER_FORECAST:
      return { ...state, weatherForecast: action.payload };

    case GAME_ACTIONS.UPDATE_BUILDINGS:
      return { ...state, buildings: action.payload };

    case GAME_ACTIONS.UPDATE_BUILDING_PLACEMENTS:
      return { ...state, buildingPlacements: action.payload };

    case GAME_ACTIONS.UPDATE_LIVESTOCK:
      return { ...state, livestock: action.payload };

    case GAME_ACTIONS.UPDATE_FISHING:
      return { ...state, fishing: action.payload };

    case GAME_ACTIONS.UPDATE_ACHIEVEMENTS:
      return { ...state, achievements: action.payload };

    case GAME_ACTIONS.UPDATE_COLLECTIONS:
      return { ...state, collections: typeof action.payload === 'function' ? action.payload(state.collections) : action.payload };

    case GAME_ACTIONS.SET_SEASONAL_EVENTS:
      return { ...state, seasonalEvents: action.payload };

    case GAME_ACTIONS.UPDATE_ACTIVE_EVENTS:
      return { ...state, activeSeasonalEvents: action.payload };

    case GAME_ACTIONS.SET_DAILY_CHALLENGES:
      return { ...state, dailyChallenges: action.payload };

    case GAME_ACTIONS.UPDATE_CHALLENGE_PROGRESS:
      return { ...state, dailyChallengeProgress: action.payload };

    case GAME_ACTIONS.UPDATE_DAILY_QUESTS:
      return { ...state, dailyQuests: action.payload };

    case GAME_ACTIONS.UPDATE_WEEKLY_CONTRACTS:
      return { ...state, weeklyContracts: action.payload };

    case GAME_ACTIONS.UPDATE_DISASTER_PROTECTIONS:
      return { ...state, disasterProtections: action.payload };

    case GAME_ACTIONS.UPDATE_PRESTIGE:
      return { ...state, prestige: action.payload };

    case GAME_ACTIONS.PRESTIGE_RESET:
      // Reset game but keep prestige bonuses
      return {
        ...initialState,
        prestige: action.payload,
      };

    case GAME_ACTIONS.UPDATE_RESEARCH:
      return { ...state, research: action.payload };

    case GAME_ACTIONS.UPDATE_GENETICS:
      return { ...state, genetics: action.payload };

    case GAME_ACTIONS.UPDATE_SOCIAL:
      return { ...state, social: action.payload };

    case GAME_ACTIONS.ADD_NOTIFICATION:
      // FIXED: Generate truly unique ID using timestamp + random
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const existingNotifications = Array.isArray(state.notifications) ? state.notifications : [];
      const nextNotifications = [
        ...existingNotifications,
        {
          id: uniqueId,
          ...action.payload,
          timestamp: Date.now(),
        },
      ];
      return {
        ...state,
        notifications: nextNotifications.length > MAX_NOTIFICATION_BACKLOG
          ? nextNotifications.slice(-MAX_NOTIFICATION_BACKLOG)
          : nextNotifications,
      };

    case GAME_ACTIONS.CLEAR_NOTIFICATION:
      if (!Array.isArray(state.notifications)) {
        return { ...state, notifications: [] };
      }
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case GAME_ACTIONS.UPDATE_SEASON:
      return { ...state, season: action.payload };

    case GAME_ACTIONS.SET_SELECTED_CROP:
      return { ...state, selectedCrop: action.payload };

    case GAME_ACTIONS.SET_PLACE_BUILDING_MODE:
      return { ...state, placeBuildingMode: Boolean(action.payload) };

    case GAME_ACTIONS.SET_SELECTED_BUILDING_PLACEMENT:
      return { ...state, selectedBuildingPlacement: action.payload };

    case GAME_ACTIONS.SET_DECORATE_MODE:
      return { ...state, decorateMode: Boolean(action.payload) };

    case GAME_ACTIONS.SET_DECORATE_TOOL:
      return { ...state, decorateTool: action.payload };

    case GAME_ACTIONS.SET_SELECTED_DECORATION:
      return { ...state, selectedDecoration: action.payload };

    case GAME_ACTIONS.SET_MOVING_DECORATION:
      return { ...state, movingDecorationId: action.payload };

    case GAME_ACTIONS.UPDATE_DECORATIONS:
      return { ...state, decorations: action.payload };

    case GAME_ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case GAME_ACTIONS.UPDATE_AUTOMATION:
      return { ...state, automation: { ...state.automation, ...action.payload } };

    case GAME_ACTIONS.UPDATE_GAME_LOOP:
      return { ...state, gameLoop: { ...state.gameLoop, ...action.payload } };

    case GAME_ACTIONS.UPDATE_PETS:
      return { ...state, pets: action.payload };

    case GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES:
      return { ...state, processingFacilities: action.payload };

    case GAME_ACTIONS.UPDATE_PROCESSING_QUEUE:
      return { ...state, processingQueue: action.payload };

    case GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY:
      return { ...state, processedInventory: action.payload };

    case GAME_ACTIONS.UPDATE_MARKET:
      return { ...state, market: action.payload };

    case GAME_ACTIONS.UPDATE_DAILY_PLAN:
      return { ...state, dailyPlan: action.payload };

    case GAME_ACTIONS.LOAD_GAME:
      // Merge loaded state with current state, preserving game loop and clearing notifications
      return {
        ...action.payload,
        gameLoop: {
          ...state.gameLoop,
          ...action.payload.gameLoop,
          lastUpdate: Date.now(),
          lastSaveTime: action.payload.gameLoop?.lastSaveTime
            ?? state.gameLoop.lastSaveTime
            ?? Date.now(),
        },
        notifications: [], // Clear old notifications
      };

    // Cozy Identity v1 actions
    case GAME_ACTIONS.SET_FARM_NAME:
      const farmName = typeof action.payload === 'string' ? action.payload.slice(0, 30) : 'My Farm';
      return { ...state, farmName };

    case GAME_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload || 'default' };

    case GAME_ACTIONS.SET_PHOTO_MODE:
      return { ...state, photoMode: Boolean(action.payload) };

    case GAME_ACTIONS.PUSH_UNDO:
      // Keep undo stack limited to 10 items
      const newUndoStack = [...(state.undoStack || []), action.payload].slice(-10);
      return { ...state, undoStack: newUndoStack };

    case GAME_ACTIONS.POP_UNDO:
      if (!state.undoStack || state.undoStack.length === 0) return state;
      const lastUndo = state.undoStack[state.undoStack.length - 1];
      const remainingStack = state.undoStack.slice(0, -1);
      // Apply the undo based on type
      if (lastUndo?.type === 'decoration') {
        return {
          ...state,
          undoStack: remainingStack,
          decorations: lastUndo.previousDecorations || state.decorations,
        };
      } else if (lastUndo?.type === 'building') {
        return {
          ...state,
          undoStack: remainingStack,
          buildingPlacements: lastUndo.previousPlacements || state.buildingPlacements,
        };
      }
      return { ...state, undoStack: remainingStack };

    default:
      return state;
  }
}

// Game Context Provider

export function GameProvider({ children }) {
  // Initialize state with loaded save data if available
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState,
    (initial) => {
      const savedState = loadSavedState();
      if (savedState) {
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm]', 'Loaded saved game successfully');
        }
        return savedState;
      }
      return initial;
    }
  );

  useEffect(() => {
    initializeDebugTracing();
  }, []);

  // Use refs to access latest state without causing re-renders in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const buildingCoverageRef = useRef(buildBuildingCoverageMap(state.buildingPlacements, state.gridSize));
  useEffect(() => {
    buildingCoverageRef.current = buildBuildingCoverageMap(state.buildingPlacements, state.gridSize);
  }, [state.buildingPlacements, state.gridSize]);
  useEffect(() => {
    if (!state.season?.dayCount) return;
    if (state.dailyPlan?.dayCount === state.season.dayCount) return;
    dispatch({
      type: GAME_ACTIONS.UPDATE_DAILY_PLAN,
      payload: buildDailyPlan(state),
    });
  }, [state.season?.dayCount, state.dailyPlan?.dayCount, state.weather, state.market, state.social]);
  useEffect(() => {
    runDebugInvariants(state);
  }, [state]);
  const visibilityRef = useRef(typeof document === 'undefined' ? true : !document.hidden);

  const dispatchRef = useRef(dispatch);
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const updateContractProgress = useCallback((actionType, actionData = {}) => {
    const updateForCadence = (currentContracts, actionTypeOverride, updaterType) => {
      if (!currentContracts?.quests?.length) return;
      const updatedQuests = updateQuestProgress(
        currentContracts.quests,
        actionTypeOverride,
        actionData
      );

      const hasChanges = updatedQuests.some((quest, index) => {
        const previousQuest = currentContracts.quests[index];
        return (
          quest.progress !== previousQuest.progress
          || quest.completed !== previousQuest.completed
        );
      });

      if (!hasChanges) return;

      if (dispatchRef.current) {
        dispatchRef.current({
          type: updaterType,
          payload: { ...currentContracts, quests: updatedQuests },
        });
      }
    };

    updateForCadence(stateRef.current.dailyQuests, actionType, GAME_ACTIONS.UPDATE_DAILY_QUESTS);
    updateForCadence(stateRef.current.weeklyContracts, actionType, GAME_ACTIONS.UPDATE_WEEKLY_CONTRACTS);
  }, []);

  const previousLevelRef = useRef(state.level);
  useEffect(() => {
    if (state.level > previousLevelRef.current) {
      updateContractProgress('level_up', {
        level: state.level,
        levelDelta: state.level - previousLevelRef.current,
      });
    }
    previousLevelRef.current = state.level;
  }, [state.level, updateContractProgress]);

  // Debounced auto-save management
  const autoSaveTimeoutRef = useRef(null);
  const lastSaveStateRef = useRef('');

  const debouncedAutoSave = useCallback((stateToSave) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const stateString = JSON.stringify({
      coins: stateToSave.coins,
      xp: stateToSave.xp,
      level: stateToSave.level,
      plotsCount: stateToSave.plots?.length || 0,
      gridSize: stateToSave.gridSize
    });

    if (stateString === lastSaveStateRef.current) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const saveTimestamp = Date.now();
        const saveToStorage = () => {
          try {
            persistSaveData(stateToSave, { saveTimestamp });
            lastSaveStateRef.current = stateString;
            if (dispatchRef.current) {
              dispatchRef.current({
                type: GAME_ACTIONS.UPDATE_GAME_LOOP,
                payload: { lastSaveTime: saveTimestamp },
              });
            }
          } catch (error) {
            console.error('[farm] Auto-save failed:', error);
          }
        };

        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(saveToStorage, { timeout: 1000 });
        } else {
          setTimeout(saveToStorage, 0);
        }
      } catch (error) {
        console.error('[farm] Auto-save serialization failed:', error);
      }
    }, 2000);
  }, []);

  // System management (bridging React state with external game systems)
  const [systems, setSystemsState] = useState({});
  // CRITICAL: Use ref to access systems without triggering re-memoization
  const systemsRef = React.useRef(systems);
  React.useEffect(() => {
    systemsRef.current = systems;
  }, [systems]);

  // Master game loop: fixed timestep simulation, FPS monitoring, and auto-save
  useEffect(() => {
    if (state.gameLoop.paused) return;

    const debugEnabled = isDebugEnabled();
    const fixedStepMs = 100; // 10 FPS sim step to preserve existing pacing
    const maxStepsPerFrame = 5;
    let accumulator = 0;
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let lastFPSUpdate = lastFrameTime;
    let lastAutoSaveCheck = Date.now();
    let animationFrameId = null;

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      visibilityRef.current = !document.hidden;
      if (!visibilityRef.current) {
        lastFrameTime = performance.now();
        lastFPSUpdate = lastFrameTime;
      }
    };
    const cleanupVisibility = typeof document === 'undefined'
      ? () => { }
      : addTrackedEventListener(document, 'visibilitychange', handleVisibilityChange);

    const runSystems = (currentState) => {
      const currentSystems = systemsRef.current;
      if (!currentSystems) return;

      if (debugEnabled) profileStart('systems:update');

      const updateStart = performance.now();

      if (debugEnabled) profileStart('system:season');
      currentSystems.seasonSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:season');

      if (debugEnabled) profileStart('system:weather');
      currentSystems.weatherSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:weather');

      if (debugEnabled) profileStart('system:farming');
      currentSystems.farmingSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:farming');

      if (debugEnabled) profileStart('system:livestock');
      currentSystems.livestockSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:livestock');

      if (debugEnabled) profileStart('system:fishing');
      currentSystems.fishingSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:fishing');

      if (debugEnabled) profileStart('system:economic');
      currentSystems.economicSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:economic');

      if (debugEnabled) profileStart('system:achievement');
      currentSystems.achievementSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:achievement');

      if (debugEnabled) profileStart('system:disease');
      currentSystems.diseaseSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:disease');

      if (debugEnabled) profileStart('system:disaster');
      currentSystems.disasterSystem?.update?.(currentState);
      if (debugEnabled) profileEnd('system:disaster');

      const updateDuration = performance.now() - updateStart;
      if (debugEnabled) {
        const metrics = getPerfMetrics();
        if (metrics) {
          metrics.lastUpdateTime = updateDuration;
        } else {
          window.__lastUpdateTime = updateDuration;
        }
      }

      if (debugEnabled) profileEnd('systems:update');
    };

    const masterGameLoop = (currentTime) => {
      const currentState = stateRef.current;
      if (currentState.gameLoop.paused) return;

      const delta = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      if (!visibilityRef.current) {
        animationFrameId = requestAnimationFrame(masterGameLoop);
        return;
      }

      if (debugEnabled) {
        recordFrameTime(delta);
      }

      accumulator += delta;
      let steps = 0;

      while (accumulator >= fixedStepMs && steps < maxStepsPerFrame) {
        runSystems(currentState);
        accumulator -= fixedStepMs;
        steps += 1;
      }

      if (steps === maxStepsPerFrame) {
        accumulator = 0;
      }

      frameCount += 1;
      if (currentTime - lastFPSUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFPSUpdate));
        if (typeof window !== 'undefined') {
          window.__currentFPS = fps;
        }
        dispatch({
          type: GAME_ACTIONS.UPDATE_GAME_LOOP,
          payload: {
            fps,
            lastUpdate: Date.now()
          },
        });
        frameCount = 0;
        lastFPSUpdate = currentTime;
      }

      const now = Date.now();
      if (currentState.settings.autoSave && (now - lastAutoSaveCheck >= 30000)) {
        if (debugEnabled) profileStart('autosave:debounced');
        debouncedAutoSave(currentState);
        if (debugEnabled) profileEnd('autosave:debounced');
        lastAutoSaveCheck = now;
      }

      animationFrameId = requestAnimationFrame(masterGameLoop);
    };

    animationFrameId = requestAnimationFrame(masterGameLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      cleanupVisibility();
    };
  }, [state.gameLoop.paused, state.settings.autoSave, debouncedAutoSave]);

  useEffect(() => {
    if (!state.settings.autoSave) return;
    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.hidden) {
        debouncedAutoSave(stateRef.current);
      }
    };
    return typeof document === 'undefined'
      ? () => { }
      : addTrackedEventListener(document, 'visibilitychange', handleVisibilityChange);
  }, [debouncedAutoSave, state.settings.autoSave]);

  const buildXpMeta = useCallback((source) => {
    if (import.meta.env.MODE !== 'development') return undefined;
    if (typeof window === 'undefined' || !window.__farmDebug?.xp) return undefined;
    const stack = new Error().stack;
    const stackLines = stack ? stack.split('\n').map(line => line.trim()) : [];
    const inferredSource = source
      || stackLines.find(line => line.includes('/src/') && !line.includes('GameContext.jsx'))
      || 'unknown';
    return {
      source: inferredSource,
      stack,
      timestamp: Date.now(),
    };
  }, []);

  // Memoized action creators
  const actions = useMemo(() => {
    const grantXP = createXPGranter(dispatch, () => stateRef.current, GAME_ACTIONS.SET_XP);
    const trace = (type, details = {}) => traceAction(type, details, stateRef.current);
    const isValidPlotIndex = (plots, index) => (
      Number.isInteger(index) && index >= 0 && index < plots.length
    );
    const getSocialState = () => ({
      friends: [],
      reputation: 0,
      marketListings: [],
      townTier: null,
      unlockedPerks: [],
      claimedRewards: [],
      unlockedSeeds: [],
      cosmetics: [],
      vendorDiscount: 0,
      ...(stateRef.current?.social || {}),
    });
    const notifyTownTierUnlock = (tier) => {
      if (!tier) return;
      dispatch({
        type: GAME_ACTIONS.ADD_NOTIFICATION,
        payload: {
          message: `🌟 Town Rep Up! You are now a ${tier.name}.`,
          type: 'success',
        },
      });
    };
    const getBuildingPlacementAtIndex = (index) => {
      const gridSize = stateRef.current?.gridSize || 0;
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      const placements = Array.isArray(stateRef.current?.buildingPlacements)
        ? stateRef.current.buildingPlacements
        : [];
      return placements.find((placement) => placement.x === x && placement.y === y) || null;
    };
    const applyCollectionProgress = (currentCollections, cropId, cropLabel, amount) => {
      const wasDiscovered = Boolean(currentCollections?.crops?.[cropId]?.discovered);
      const { collections: nextCollections, newlyUnlocked } = updateCropCollectionProgress(
        currentCollections,
        cropId,
        amount
      );
      if (nextCollections !== currentCollections) {
        dispatch({ type: GAME_ACTIONS.UPDATE_COLLECTIONS, payload: nextCollections });
      }
      const isDiscovered = Boolean(nextCollections?.crops?.[cropId]?.discovered);
      if (!wasDiscovered && isDiscovered) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: {
            message: `📖 New crop discovered: ${cropLabel || cropId}!`,
            type: 'success',
          },
        });
      }
      newlyUnlocked.forEach((milestone) => {
        const rewardLabel = milestone.reward?.description ? ` ${milestone.reward.description}` : '';
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: {
            message: `📚 ${cropLabel || cropId} milestone reached (${milestone.target})!${rewardLabel}`,
            type: 'success',
          },
        });
      });
      return nextCollections;
    };
    const grantCompostFromHarvest = (amount = 1) => {
      const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
      if (safeAmount <= 0) return 0;
      const hasCompostBin = (stateRef.current?.inventory?.compost_bin || 0) > 0;
      const bonus = hasCompostBin ? Math.floor(safeAmount * 0.5) : 0;
      const total = safeAmount + bonus;
      if (total <= 0) return 0;
      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY,
        payload: (currentState) => ({
          ...currentState.inventory,
          compost: (currentState.inventory?.compost || 0) + total,
        }),
      });
      trace('compost_grant', { amount: total, hasCompostBin });
      return total;
    };
    const grantReputation = (amount = 0, source = 'general') => {
      const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
      if (safeAmount <= 0) return 0;
      const currentSocial = getSocialState();
      const nextReputation = currentSocial.reputation + safeAmount;
      const currentTierIndex = getTownTierIndex(currentSocial.reputation);
      const nextTierIndex = getTownTierIndex(nextReputation);
      const nextTier = getTownTierByRep(nextReputation);

      const unlockedPerks = [...currentSocial.unlockedPerks];
      if (nextTierIndex > currentTierIndex) {
        for (let i = currentTierIndex + 1; i <= nextTierIndex; i += 1) {
          const tier = TOWN_REP_TIERS[i];
          if (tier?.id && !unlockedPerks.includes(tier.id)) {
            unlockedPerks.push(tier.id);
            notifyTownTierUnlock(tier);
          }
        }
      }

      dispatch({
        type: GAME_ACTIONS.UPDATE_SOCIAL,
        payload: {
          ...currentSocial,
          reputation: nextReputation,
          townTier: nextTier?.id || currentSocial.townTier,
          unlockedPerks,
        },
      });
      trace('reputation_grant', { amount: safeAmount, source });
      return safeAmount;
    };
    const claimTownReward = (tierId) => {
      const currentSocial = getSocialState();
      const tier = getTownTierById(tierId);
      if (!tier || currentSocial.reputation < tier.minRep) return false;
      if (currentSocial.claimedRewards?.includes(tierId)) return false;

      const reward = tier.reward;
      const nextSocial = {
        ...currentSocial,
        claimedRewards: [...(currentSocial.claimedRewards || []), tierId],
      };

      if (reward?.type === 'seed' && reward.cropId) {
        nextSocial.unlockedSeeds = Array.from(new Set([...(currentSocial.unlockedSeeds || []), reward.cropId]));
      } else if (reward?.type === 'cosmetic') {
        const cosmeticLabel = reward.label || reward.id;
        if (cosmeticLabel) {
          nextSocial.cosmetics = Array.from(new Set([...(currentSocial.cosmetics || []), cosmeticLabel]));
        }
      } else if (reward?.type === 'vendor' && reward.discount) {
        nextSocial.vendorDiscount = Math.max(currentSocial.vendorDiscount || 0, reward.discount);
      }

      dispatch({
        type: GAME_ACTIONS.UPDATE_SOCIAL,
        payload: nextSocial,
      });

      if (reward?.label) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: {
            message: `🎁 Claimed town reward: ${reward.label}!`,
            type: 'success',
          },
        });
      }

      trace('town_reward_claimed', { tierId, reward: reward?.label });
      return true;
    };
    const getBuildingCoverage = () => buildingCoverageRef.current || {};
    const applyDayAdvanceBuildingEffects = () => {
      const currentState = stateRef.current;
      const plots = Array.isArray(currentState?.plots) ? currentState.plots : [];
      if (!plots.length) return;

      const coverage = getBuildingCoverage();
      let updatedPlots = null;

      const greenhouseCoverage = coverage.greenhouse;
      if (greenhouseCoverage && greenhouseCoverage.size > 0) {
        greenhouseCoverage.forEach((index) => {
          const plot = plots[index];
          if (!plot || plot.state === 'empty') return;
          if (plot.greenhouseBoost) return;
          if (!updatedPlots) {
            updatedPlots = plots.slice();
          }
          updatedPlots[index] = {
            ...plot,
            greenhouseBoost: true,
          };
        });
      }
      if (greenhouseCoverage) {
        for (let i = 0; i < plots.length; i += 1) {
          const plot = plots[i];
          if (!plot?.greenhouseBoost) continue;
          if (greenhouseCoverage.has(i)) continue;
          if (!updatedPlots) {
            updatedPlots = plots.slice();
          }
          updatedPlots[i] = {
            ...plot,
            greenhouseBoost: false,
          };
        }
      }

      const wellCoverage = coverage.well;
      if (wellCoverage && wellCoverage.size > 0) {
        const candidates = [];
        wellCoverage.forEach((index) => {
          const plot = plots[index];
          if (!plot || (plot.state !== 'planted' && plot.state !== 'growing')) return;
          const waterLevel = plot.waterLevel || 0;
          if (waterLevel >= 100) return;
          candidates.push({ index, waterLevel });
        });
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.waterLevel - b.waterLevel);
          const wellMeta = PLACEABLE_BUILDING_LOOKUP.well;
          const maxPlots = Math.min(candidates.length, wellMeta?.effects?.maxPlots || 3);
          const waterAmount = wellMeta?.effects?.waterAmount || 35;
          for (let i = 0; i < maxPlots; i += 1) {
            const target = candidates[i];
            const plot = plots[target.index];
            if (!updatedPlots) {
              updatedPlots = plots.slice();
            }
            updatedPlots[target.index] = {
              ...plot,
              waterLevel: Math.min(100, (plot.waterLevel || 0) + waterAmount),
            };
          }
        }
      }

      if (updatedPlots) {
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      }
    };

    const handleDayAdvance = (dayInfo) => {
      const currentSystems = systemsRef.current;
      const currentState = stateRef.current;
      currentSystems.weatherSystem?.onDayAdvance?.(dayInfo, currentState);
      currentSystems.economicSystem?.onDayAdvance?.(dayInfo, currentState);
      applyDayAdvanceBuildingEffects();
      trace('day_advance', {
        dayCount: dayInfo?.dayCount,
        dayInSeason: dayInfo?.dayInSeason,
        season: dayInfo?.season,
        daysElapsed: dayInfo?.daysElapsed,
      });
    };

    return {
      // Core property setters
      setCoins: (coins) => {
        trace('coins_set', { coins });
        dispatch({ type: GAME_ACTIONS.SET_COINS, payload: coins });
      },
      /**
       * Set XP amount (supports function updater, auto-calculates level)
       * @param {number|Function} xp - XP amount or updater function
       * @deprecated Use grantXP instead for proper tracking and rate limiting
       */
      setXp: (xp, source) => {
        trace('xp_set', { xp, source });
        dispatch({
          type: GAME_ACTIONS.SET_XP,
          payload: xp,
          meta: buildXpMeta(source),
        });
      },

      /**
       * Grants XP with source tracking and rate limiting (PREFERRED)
       * @param {number} amount - XP amount to grant
       * @param {string} source - Source tag for debugging
       * @param {Object} meta - Optional metadata
       */
      grantXP: (amount, source, meta) => {
        const granted = grantXP(amount, source, meta);
        if (granted > 0) {
          updateContractProgress('gain_xp', { amount: granted });
        }
        trace('xp_grant', { amount: granted, source });
        return granted;
      },
      /**
       * Records player interaction for idle detection
       */
      recordInteraction: recordPlayerInteraction,
      updatePlot: (index, plot) => {
        const currentPlots = Array.isArray(stateRef.current?.plots) ? stateRef.current.plots : [];
        if (!isValidPlotIndex(currentPlots, index)) {
          trace('plot_update_invalid', { index });
          return;
        }
        trace('plot_update', { index });
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOT, payload: { index, plot } });
      },
      updatePlots: (plots) => {
        trace('plots_update', { count: Array.isArray(plots) ? plots.length : 'fn' });
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots });
      },
      setGridSize: (size) => {
        trace('grid_resize', { size });
        dispatch({ type: GAME_ACTIONS.SET_GRID_SIZE, payload: size });
      },
      updateInventory: (inventory) => {
        trace('inventory_update', { entries: inventory ? Object.keys(inventory).length : 0 });
        dispatch({ type: GAME_ACTIONS.UPDATE_INVENTORY, payload: inventory });
      },

      // Systems & Metadata
      setWeather: (weather) => dispatch({ type: GAME_ACTIONS.SET_WEATHER, payload: weather }),
      updateWeatherForecast: (forecast) => dispatch({ type: GAME_ACTIONS.UPDATE_WEATHER_FORECAST, payload: forecast }),
      updateBuildings: (buildings) => dispatch({ type: GAME_ACTIONS.UPDATE_BUILDINGS, payload: buildings }),
      updateLivestock: (livestock) => dispatch({ type: GAME_ACTIONS.UPDATE_LIVESTOCK, payload: livestock }),
      updateFishing: (fishing) => dispatch({ type: GAME_ACTIONS.UPDATE_FISHING, payload: fishing }),
      updateAchievements: (achievements) => dispatch({ type: GAME_ACTIONS.UPDATE_ACHIEVEMENTS, payload: achievements }),
      updateCollections: (collections) => dispatch({ type: GAME_ACTIONS.UPDATE_COLLECTIONS, payload: collections }),
      setSeasonalEvents: (events) => dispatch({ type: GAME_ACTIONS.SET_SEASONAL_EVENTS, payload: events }),
      updateActiveEvents: (events) => dispatch({ type: GAME_ACTIONS.UPDATE_ACTIVE_EVENTS, payload: events }),
      setDailyChallenges: (challenges) => dispatch({ type: GAME_ACTIONS.SET_DAILY_CHALLENGES, payload: challenges }),
      updateChallengeProgress: (progress) => dispatch({ type: GAME_ACTIONS.UPDATE_CHALLENGE_PROGRESS, payload: progress }),
      updateDailyQuests: (dailyQuests) => dispatch({ type: GAME_ACTIONS.UPDATE_DAILY_QUESTS, payload: dailyQuests }),
      updateWeeklyContracts: (weeklyContracts) => dispatch({ type: GAME_ACTIONS.UPDATE_WEEKLY_CONTRACTS, payload: weeklyContracts }),
      updateDailyQuestProgress: updateContractProgress,
      updateContractProgress,
      updateDisasterProtections: (protections) => dispatch({ type: GAME_ACTIONS.UPDATE_DISASTER_PROTECTIONS, payload: protections }),
      updatePrestige: (prestige) => dispatch({ type: GAME_ACTIONS.UPDATE_PRESTIGE, payload: prestige }),
      updateSeason: (season) => dispatch({ type: GAME_ACTIONS.UPDATE_SEASON, payload: season }),
      updateResearch: (research) => dispatch({ type: GAME_ACTIONS.UPDATE_RESEARCH, payload: research }),
      updateGenetics: (genetics) => dispatch({ type: GAME_ACTIONS.UPDATE_GENETICS, payload: genetics }),
      updateSocial: (social) => dispatch({ type: GAME_ACTIONS.UPDATE_SOCIAL, payload: social }),
      grantReputation,
      updatePets: (pets) => dispatch({ type: GAME_ACTIONS.UPDATE_PETS, payload: pets }),
      updateProcessingFacilities: (facilities) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES, payload: facilities }),
      updateProcessingQueue: (queue) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_QUEUE, payload: queue }),
      updateProcessedInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY, payload: inventory }),
      updateMarket: (market) => dispatch({ type: GAME_ACTIONS.UPDATE_MARKET, payload: market }),
      updateDailyPlan: (dailyPlan) => dispatch({ type: GAME_ACTIONS.UPDATE_DAILY_PLAN, payload: dailyPlan }),
      recordHarvest: (cropId, cropLabel, harvestValue, amount = 1) => {
        const currentCollections = stateRef.current?.collections || createDefaultCropCollections();
        applyCollectionProgress(currentCollections, cropId, cropLabel, amount);
        const repGain = getHarvestReputationGain(harvestValue);
        if (repGain > 0) {
          grantReputation(repGain, 'harvest');
        }
        grantCompostFromHarvest(amount);
      },
      awardCompost: (amount = 1) => grantCompostFromHarvest(amount),
      convertCompostToFertilizer: (amount = 3) => {
        const currentState = stateRef.current;
        const compostCount = currentState?.inventory?.compost || 0;
        const required = Number.isFinite(amount) ? Math.max(1, Math.floor(amount)) : 3;
        if (compostCount < required) {
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: `Need ${required} compost to craft fertilizer.`, type: 'info' },
          });
          return false;
        }
        const hasCompostBin = (currentState.inventory?.compost_bin || 0) > 0;
        const fertilizerYield = hasCompostBin ? 2 : 1;
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY,
          payload: (currentState) => ({
            ...currentState.inventory,
            compost: Math.max(0, (currentState.inventory?.compost || 0) - required),
            fertilizer: (currentState.inventory?.fertilizer || 0) + fertilizerYield,
          }),
        });
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: {
            message: `🧺 Compost turned into ${fertilizerYield} fertilizer.`,
            type: 'success',
          },
        });
        trace('compost_convert', { required, fertilizerYield, hasCompostBin });
        return true;
      },
      claimTownReward,
      onDayAdvance: handleDayAdvance,

      // UI & Settings
      triggerParticles: (x, y, type, options = {}) => {
        if (typeof window !== 'undefined' && typeof window.triggerParticleEffect === 'function' && stateRef.current.settings.animationsEnabled) {
          window.triggerParticleEffect(x, y, type, options);
        }
      },
      playSound: (methodName, ...args) => {
        if (typeof window !== 'undefined' && window.soundSystem && stateRef.current.settings.soundEnabled) {
          if (typeof window.soundSystem[methodName] === 'function') {
            window.soundSystem[methodName](...args);
          }
        }
      },
      addNotification: (notification) => {
        trace('notification_add', { type: notification?.type, message: notification?.message });
        dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: notification });
      },
      clearNotification: (id) => {
        trace('notification_clear', { id });
        dispatch({ type: GAME_ACTIONS.CLEAR_NOTIFICATION, payload: id });
      },
      setSelectedCrop: (cropId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_CROP, payload: cropId }),
      setDecorateMode: (enabled) => dispatch({ type: GAME_ACTIONS.SET_DECORATE_MODE, payload: enabled }),
      setDecorateTool: (tool) => dispatch({ type: GAME_ACTIONS.SET_DECORATE_TOOL, payload: tool }),
      setSelectedDecoration: (decorationId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_DECORATION, payload: decorationId }),
      setMovingDecorationId: (decorationId) => dispatch({ type: GAME_ACTIONS.SET_MOVING_DECORATION, payload: decorationId }),
      updateDecorations: (decorations) => dispatch({ type: GAME_ACTIONS.UPDATE_DECORATIONS, payload: decorations }),
      setPlaceBuildingMode: (enabled) => dispatch({ type: GAME_ACTIONS.SET_PLACE_BUILDING_MODE, payload: enabled }),
      setSelectedBuildingPlacement: (buildingId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_BUILDING_PLACEMENT, payload: buildingId }),
      updateBuildingPlacements: (placements) => dispatch({ type: GAME_ACTIONS.UPDATE_BUILDING_PLACEMENTS, payload: placements }),

      // Cozy Identity v1 actions
      setFarmName: (name) => dispatch({ type: GAME_ACTIONS.SET_FARM_NAME, payload: name }),
      setTheme: (theme) => dispatch({ type: GAME_ACTIONS.SET_THEME, payload: theme }),
      setPhotoMode: (enabled) => dispatch({ type: GAME_ACTIONS.SET_PHOTO_MODE, payload: enabled }),
      pushUndo: (undoEntry) => dispatch({ type: GAME_ACTIONS.PUSH_UNDO, payload: undoEntry }),
      popUndo: () => dispatch({ type: GAME_ACTIONS.POP_UNDO }),

      updateSettings: (settings) => dispatch({ type: GAME_ACTIONS.UPDATE_SETTINGS, payload: settings }),
      updateAutomation: (automation) => dispatch({ type: GAME_ACTIONS.UPDATE_AUTOMATION, payload: automation }),
      updateGameLoop: (data) => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: data }),
      pauseGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: true } }),
      resumeGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: false } }),

      // Systems Bridge
      setSystems: (newSystems) => setSystemsState(newSystems),

      /**
       * Save/Load actions
       */

      /**
       * Loads game state from localStorage
       * @returns {boolean} True if load succeeded
       */
      loadGame: () => {
        const savedState = loadSavedState();
        if (savedState) {
          trace('game_load', { plots: savedState.plots?.length || 0 });
          dispatch({ type: GAME_ACTIONS.LOAD_GAME, payload: savedState });
          return true;
        }
        trace('game_load_failed', {});
        return false;
      },
      /**
       * Saves current game state to localStorage
       * @returns {boolean} True if save succeeded
       */
      saveGame: () => {
        try {
          const saveTimestamp = Date.now();
          persistSaveData(stateRef.current, { saveTimestamp });
          dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { lastSaveTime: saveTimestamp } });
          trace('game_save', { saveTimestamp });
          return true;
        } catch (error) {
          console.error('[farm] Manual save failed', error);
          trace('game_save_failed', { message: error?.message });
          return false;
        }
      },

      /**
       * Complex actions - these are called by UI and delegated to systems
       */

      /**
       * Plants a crop in the specified plot
       * @param {number} plotIndex - Plot index to plant in
       * @param {string} cropType - Crop type ID (unused, kept for compatibility)
       * @param {Object} cropData - Crop data object
       * @returns {boolean} True if planting succeeded
       */
      plantCrop: (plotIndex, cropType, cropData) => {
        const currentPlots = Array.isArray(stateRef.current?.plots) ? stateRef.current.plots : [];
        if (!isValidPlotIndex(currentPlots, plotIndex)) {
          trace('plant_crop_invalid', { plotIndex, cropType });
          return false;
        }
        if (getBuildingPlacementAtIndex(plotIndex)) {
          trace('plant_crop_blocked', { plotIndex, cropType });
          return false;
        }
        const buildingCoverage = getBuildingCoverage();
        const hasGreenhouseBoost = buildingCoverage.greenhouse?.has?.(plotIndex);
        const currentSystems = systemsRef.current;
        if (currentSystems.farmingSystem?.plantCrop) {
          currentSystems.farmingSystem.update(stateRef.current);
          trace('plant_crop', { plotIndex, cropType });
          return currentSystems.farmingSystem.plantCrop(plotIndex, cropData, {
            greenhouseBoost: hasGreenhouseBoost,
          });
        }
        // Fallback
        const updatedPlots = [...stateRef.current.plots];
        updatedPlots[plotIndex] = {
          id: plotIndex,
          state: 'planted',
          crop: cropData,
          plantedAt: Date.now(),
          growthStage: 1,
          waterLevel: 85,
          progress: 0,
          greenhouseBoost: hasGreenhouseBoost,
        };

        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
        trace('plant_crop_fallback', { plotIndex, cropType });
        return true;
      },

      /**
       * Harvests a crop from the specified plot
       * @param {number} plotIndex - Plot index to harvest from
       * @param {number} earnings - Earnings from harvest (unused, kept for compatibility)
       */
      harvestCrop: (plotIndex, earnings) => {
        // Delegate to farming system via plot update
        const currentState = stateRef.current;
        const currentPlots = Array.isArray(currentState?.plots) ? currentState.plots : [];
        if (!isValidPlotIndex(currentPlots, plotIndex)) {
          trace('harvest_crop_invalid', { plotIndex });
          return false;
        }
        const updatedPlots = [...currentState.plots];
        const plot = updatedPlots[plotIndex];
        if (!plot) {
          trace('harvest_crop_missing', { plotIndex });
          return false;
        }
        const buildingCoverage = getBuildingCoverage();
        const barnReducedLoss = buildingCoverage.barn?.has?.(plotIndex);
        const barnMultiplier = PLACEABLE_BUILDING_LOOKUP.barn?.effects?.fertilityLossMultiplier || 1;
        const fertilityLoss = 0.1 * (barnReducedLoss ? barnMultiplier : 1);

        updatedPlots[plotIndex] = {
          ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, waterLevel: 50, progress: 0,
          soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - fertilityLoss),
          fertilizer: 0,
          greenhouseBoost: false,
        };
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
        trace('harvest_crop', { plotIndex, earnings });
        return true;
      },

      /**
       * Helper actions for systems - these need to be stable, so we use functions that work with current state
       */

      /**
       * Adds money to player's coins
       * @param {number} amount - Amount to add
       */
      earnMoney: (amount) => {
        dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (currentCoins) => currentCoins + amount });
        updateContractProgress('earn_coins', { amount });
        trace('earn_money', { amount });
      },
      /**
       * Spends money if available
       * @param {number} amount - Amount to spend
       * @returns {boolean} True if spent successfully
       */
      spendMoney: (amount) => {
        const currentCoins = stateRef.current?.coins || 0;
        if (currentCoins < amount) return false;
        dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentCoins - amount });
        updateContractProgress('spend_coins', { amount });
        trace('spend_money', { amount });
        return true;
      },

      /**
       * Adds items to inventory
       * @param {string} itemId - Inventory item ID
       * @param {number} amount - Quantity to add
       */
      addToInventory: (itemId, amount = 1) => {
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY,
          payload: (currentInventory) => {
            const currentEntry = currentInventory?.[itemId];
            const currentCount = typeof currentEntry === 'number'
              ? currentEntry
              : (typeof currentEntry === 'object' && currentEntry !== null
                ? (currentEntry.count || currentEntry.quantity || 0)
                : 0);
            const nextCount = currentCount + amount;

            return {
              ...currentInventory,
              [itemId]: typeof currentEntry === 'object' && currentEntry !== null
                ? { ...currentEntry, count: nextCount }
                : nextCount,
            };
          },
        });
      },

      addXP: (amount, source = 'legacy_addXP') => {
        // Forward to grantXP for tracking
        const grantXP = createXPGranter(dispatch, () => stateRef.current, GAME_ACTIONS.SET_XP);
        const granted = grantXP(amount, source);
        if (granted > 0) {
          updateContractProgress('gain_xp', { amount: granted });
        }
      },

      // Bulk actions
      waterAllPlots: () => {
        const currentState = stateRef.current;
        if (!currentState?.plots?.length) return;

        const hasWaterBoost = (currentState.inventory?.water_boost || 0) > 0;
        trace('water_all_plots', { hasWaterBoost });
        const updatedPlots = currentState.plots.map(plot => {
          if (plot.state === 'empty') return plot;
          return {
            ...plot,
            waterLevel: hasWaterBoost ? 100 : Math.min(100, (plot.waterLevel || 0) + 25),
          };
        });

        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });

        if (hasWaterBoost) {
          dispatch({
            type: GAME_ACTIONS.UPDATE_INVENTORY,
            payload: (currentState) => ({
              ...currentState.inventory,
              water_boost: Math.max(0, (currentState.inventory?.water_boost || 0) - 1),
            }),
          });
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: '💧 Water Boost used! All plots refreshed.', type: 'success' },
          });
        }
      },
      fertilizeAllPlots: () => {
        const currentState = stateRef.current;
        if (!currentState?.plots?.length) return;

        const fertilizerCount = currentState.inventory?.fertilizer || 0;
        const cost = 15;
        const emptyPlots = currentState.plots
          .map((plot, index) => (plot.state === 'empty' ? index : null))
          .filter((index) => Number.isInteger(index));
        if (emptyPlots.length === 0) {
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: 'No empty plots to prep with fertilizer.', type: 'info' },
          });
          return;
        }

        const affordableByCoins = Math.floor((currentState.coins || 0) / cost);
        const maxApplications = fertilizerCount + affordableByCoins;
        if (maxApplications <= 0) {
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: 'Not enough fertilizer or coins (15 each) to prep soil.', type: 'error' },
          });
          return;
        }

        const targets = emptyPlots.slice(0, Math.min(emptyPlots.length, maxApplications));
        const targetSet = new Set(targets);
        const fertilizedCount = targets.length;
        const fertilizerUsed = Math.min(fertilizerCount, fertilizedCount);
        const coinUsed = (fertilizedCount - fertilizerUsed) * cost;

        const updatedPlots = currentState.plots.map((plot, index) => {
          if (!targetSet.has(index)) return plot;
          return {
            ...plot,
            soilFertility: Math.min(1.5, (plot.soilFertility || 1.0) + 0.3),
            waterLevel: Math.min(100, (plot.waterLevel || 0) + 10),
            fertilizer: (plot.fertilizer || 0) + 1,
          };
        });

        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });

        if (fertilizerUsed > 0 || coinUsed > 0) {
          dispatch({
            type: GAME_ACTIONS.UPDATE_INVENTORY,
            payload: (currentState) => ({
              ...currentState.inventory,
              fertilizer: Math.max(0, (currentState.inventory?.fertilizer || 0) - fertilizerUsed),
            }),
          });
          if (coinUsed > 0) {
            dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (currentState.coins || 0) - coinUsed });
          }
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: `🌱 Fertilized ${fertilizedCount} empty plot${fertilizedCount === 1 ? '' : 's'}.`, type: 'success' },
          });
        }
      },
      treatAllDiseases: () => {
        const currentState = stateRef.current;
        if (!currentState?.plots?.length) return;

        const hasPesticide = (currentState.inventory?.pesticide || 0) > 0;
        const cost = 20;
        trace('treat_all_diseases', { hasPesticide, cost });
        if (!hasPesticide && currentState.coins < cost) {
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: 'Not enough coins (20) to treat all diseases.', type: 'error' },
          });
          return;
        }

        const diseasedCount = currentState.plots.filter(plot => plot.disease).length;
        if (diseasedCount === 0) {
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: 'No diseased crops to treat.', type: 'info' },
          });
          return;
        }

        const updatedPlots = currentState.plots.map(plot => (
          plot.disease
            ? { ...plot, disease: null, diseasedAt: null }
            : plot
        ));

        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });

        if (hasPesticide) {
          dispatch({
            type: GAME_ACTIONS.UPDATE_INVENTORY,
            payload: (currentState) => ({
              ...currentState.inventory,
              pesticide: Math.max(0, (currentState.inventory?.pesticide || 0) - 1),
            }),
          });
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: { message: '🐛 Pesticide applied. Crops are healthy again!', type: 'success' },
          });
        } else {
          dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins - cost });
        }
      },
      harvestAllReadyCrops: () => {
        const currentState = stateRef.current;
        if (!currentState?.plots?.length) return;

        const townBonus = getTownRepBonus(currentState.social?.reputation);
        const buildingCoverage = getBuildingCoverage();
        const inventoryUpdates = {};
        let totalEarnings = 0;
        let totalXp = 0;
        let totalRepGain = 0;
        let updatedCollections = currentState.collections || createDefaultCropCollections();

        currentState.plots.forEach((plot) => {
          if (plot.state === 'ready' && plot.crop) {
            const collectionBonus = getCollectionBonusMultiplier(currentState.collections, plot.crop.id);
            const marketBonus = getMarketBonusMultiplier(currentState.market, plot.crop.id);
            const earnings = calculateHarvestValue(
              plot,
              currentState.season?.config,
              townBonus * collectionBonus * marketBonus
            );
            totalEarnings += earnings;
            totalXp += Math.floor(earnings * 0.2);
            totalRepGain += getHarvestReputationGain(earnings);
            inventoryUpdates[plot.crop.id] = (inventoryUpdates[plot.crop.id] || 0) + 1;
          }
        });

        Object.entries(inventoryUpdates).forEach(([cropId, amount]) => {
          const cropName = currentState.plots.find(plot => plot?.crop?.id === cropId)?.crop?.name;
          updatedCollections = applyCollectionProgress(updatedCollections, cropId, cropName, amount);
        });

        const harvestedCount = Object.values(inventoryUpdates).reduce((sum, count) => sum + count, 0);
        if (harvestedCount === 0) return;

        if (harvestedCount > 0) {
          updateContractProgress('harvest', {
            amount: harvestedCount,
            weather: currentState.weather,
          });
        }
        if (totalEarnings > 0) {
          updateContractProgress('earn_coins', { amount: totalEarnings });
        }
        if (totalXp > 0) {
          updateContractProgress('gain_xp', { amount: totalXp });
        }
        if (totalRepGain > 0) {
          grantReputation(totalRepGain, 'bulk_harvest');
        }
        grantCompostFromHarvest(harvestedCount);

        // Delegate to harvestAllReadyCrops logic (similar to 45febc0 but preserving earnings calculation)
        dispatch({
          type: GAME_ACTIONS.UPDATE_PLOTS, payload: (currentState) => {
            const updatedPlots = currentState.plots.map((plot, index) => {
              if (plot.state === 'ready' && plot.crop) {
                const barnReducedLoss = buildingCoverage.barn?.has?.(index);
                const barnMultiplier = PLACEABLE_BUILDING_LOOKUP.barn?.effects?.fertilityLossMultiplier || 1;
                const fertilityLoss = 0.1 * (barnReducedLoss ? barnMultiplier : 1);
                // Reset plot
                return {
                  ...plot,
                  state: 'empty',
                  crop: null,
                  plantedAt: null,
                  readyAt: null,
                  growthStage: 0,
                  progress: 0,
                  soilFertility: Math.max(0.5, (plot.soilFertility || 1.0) - fertilityLoss),
                  waterLevel: 50,
                  fertilizer: 0,
                  greenhouseBoost: false,
                };
              }
              return plot;
            });

            // Calculate totals from ready crops before resetting
            // Apply all updates after a delay to ensure state consistency
            setTimeout(() => {
              if (totalEarnings > 0) {
                dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins + totalEarnings });
                // Use legacy setXp but it routes to reducer which handles level up
                dispatch({ type: GAME_ACTIONS.SET_XP, payload: currentState.xp + totalXp });

                // Update inventory
                dispatch({
                  type: GAME_ACTIONS.UPDATE_INVENTORY, payload: (currentInv) => {
                    const newInventory = { ...currentInv };
                    Object.entries(inventoryUpdates).forEach(([cropId, amount]) => {
                      newInventory[cropId] = (newInventory[cropId] || 0) + amount;
                    });
                    return newInventory;
                  }
                });
              }
            }, 0);

            return updatedPlots;
          }
        });
      },
    };
  }, [dispatch]); // CRITICAL: Only dispatch is stable, use refs for everything else

  return (
    <GameContext.Provider value={{ state, actions, systems }}>
      {children}
    </GameContext.Provider >
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}

export { GAME_ACTIONS };
export default GameContext;
