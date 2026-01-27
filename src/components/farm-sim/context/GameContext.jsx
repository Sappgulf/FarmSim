import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { getSoundSystem } from '../systems/SoundSystem';
import { createXPGranter, recordLevelUp, recordPlayerInteraction } from '../services/XPService';
import { calculateHarvestValue } from '../constants/cropData';
import { updateQuestProgress } from '../systems/QuestSystem';

// Game Context for centralized state management
// Provide a default value to prevent "useGame must be used within a GameProvider" errors
// during lazy loading or StrictMode double renders
const GameContext = createContext(null);

// Initialize sound system
const soundSystem = getSoundSystem();

// Save format version for migration
const SAVE_VERSION = 1;
const SAVE_KEY = 'farm_sim_enhanced_v2';

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

  // Livestock
  UPDATE_LIVESTOCK: 'UPDATE_LIVESTOCK',

  // Fishing
  UPDATE_FISHING: 'UPDATE_FISHING',

  // Achievements
  UPDATE_ACHIEVEMENTS: 'UPDATE_ACHIEVEMENTS',

  // Seasonal events
  SET_SEASONAL_EVENTS: 'SET_SEASONAL_EVENTS',
  UPDATE_ACTIVE_EVENTS: 'UPDATE_ACTIVE_EVENTS',

  // Daily challenges
  SET_DAILY_CHALLENGES: 'SET_DAILY_CHALLENGES',
  UPDATE_CHALLENGE_PROGRESS: 'UPDATE_CHALLENGE_PROGRESS',

  // Daily quests
  UPDATE_DAILY_QUESTS: 'UPDATE_DAILY_QUESTS',

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

  // Game settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',

  // Performance
  UPDATE_GAME_LOOP: 'UPDATE_GAME_LOOP',

  // Pets
  UPDATE_PETS: 'UPDATE_PETS',

  // Processing
  UPDATE_PROCESSING_FACILITIES: 'UPDATE_PROCESSING_FACILITIES',
  UPDATE_PROCESSING_QUEUE: 'UPDATE_PROCESSING_QUEUE',
  UPDATE_PROCESSED_INVENTORY: 'UPDATE_PROCESSED_INVENTORY',

  // Save/Load
  LOAD_GAME: 'LOAD_GAME',
};

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

/**
 * Migration helper for save data
 */
function migrateSaveData(savedData) {
  try {
    // Get save version (defaults to 0 for old saves)
    const saveVersion = savedData.saveVersion || 0;
    let migratedData = { ...savedData };

    // Version 0 → 1: Add save version and any new fields
    if (saveVersion < 1) {
      if (import.meta.env.MODE === 'development') {
        console.debug('[farm]', 'Migrating save from version 0 to 1');
      }
      migratedData.saveVersion = 1;

      // Ensure all required fields exist with fallbacks
      migratedData.settings = migratedData.settings || {
        autoSave: true,
        soundEnabled: true,
        animationsEnabled: true,
      };

      migratedData.gameLoop = migratedData.gameLoop || {
        lastUpdate: Date.now(),
        fps: 60,
        paused: false,
      };
      if (typeof migratedData.gameLoop.lastSaveTime !== 'number') {
        migratedData.gameLoop.lastSaveTime = Date.now();
      }
    }

    // Validate critical fields
    if (typeof migratedData.coins !== 'number' || migratedData.coins < 0) {
      console.warn('[farm]', 'Invalid coins value, resetting to 0');
      migratedData.coins = 0;
    }

    if (typeof migratedData.xp !== 'number' || migratedData.xp < 0) {
      console.warn('[farm]', 'Invalid XP value, resetting to 0');
      migratedData.xp = 0;
    }

    if (typeof migratedData.level !== 'number' || migratedData.level < 1) {
      console.warn('[farm]', 'Invalid level value, resetting to 1');
      migratedData.level = 1;
    }

    if (!Array.isArray(migratedData.plots)) {
      console.warn('[farm]', 'Invalid plots data, will reinitialize');
      migratedData.plots = initializePlots(migratedData.gridSize || 3);
    }

    // Ensure livestock structure exists
    if (!migratedData.livestock || typeof migratedData.livestock !== 'object') {
      console.warn('[farm]', 'Invalid livestock data, resetting to defaults');
      migratedData.livestock = {
        animals: [],
        capacity: 10,
        totalProduced: 0
      };
    } else {
      // Ensure required properties exist
      if (!Array.isArray(migratedData.livestock.animals)) {
        console.warn('[farm]', 'Invalid livestock animals array, resetting');
        migratedData.livestock.animals = [];
      }
      if (typeof migratedData.livestock.capacity !== 'number') {
        migratedData.livestock.capacity = 10;
      }
      if (typeof migratedData.livestock.totalProduced !== 'number') {
        migratedData.livestock.totalProduced = 0;
      }
    }

    // Ensure fishing structure exists
    if (!migratedData.fishing || typeof migratedData.fishing !== 'object') {
      console.warn('[farm]', 'Invalid fishing data, resetting to defaults');
      migratedData.fishing = {
        pond: { level: 1, population: 100, maxPopulation: 100 },
        stats: { totalCaught: 0, totalValue: 0, largestFish: 0, byType: {} }
      };
    } else {
      // Ensure pond structure
      if (!migratedData.fishing.pond || typeof migratedData.fishing.pond !== 'object') {
        migratedData.fishing.pond = { level: 1, population: 100, maxPopulation: 100 };
      }
      // Ensure stats structure
      if (!migratedData.fishing.stats || typeof migratedData.fishing.stats !== 'object') {
        migratedData.fishing.stats = { totalCaught: 0, totalValue: 0, largestFish: 0, byType: {} };
      }
    }

    // Ensure gridSize matches plots length
    if (migratedData.plots.length !== migratedData.gridSize * migratedData.gridSize) {
      console.warn('[farm]', 'Plot count mismatch, reinitializing plots');
      migratedData.plots = initializePlots(migratedData.gridSize || 3);
    }

    // Set current save version
    migratedData.saveVersion = SAVE_VERSION;

    if (import.meta.env.MODE === 'development') {
      console.debug('[farm]', `Save data migrated to version ${SAVE_VERSION}`);
    }
    return migratedData;
  } catch (error) {
    console.error('[farm]', 'Error migrating save data', error);
    return null;
  }
}

/**
 * Loads and validates saved game state from localStorage
 * @returns {Object|null} - Loaded state or null if no valid save exists
 */
function loadSavedState() {
  try {
    const savedDataString = localStorage.getItem(SAVE_KEY);
    if (!savedDataString) {
      if (import.meta.env.MODE === 'development') {
        console.debug('[farm]', 'No saved game found');
      }
      return null;
    }

    const savedData = JSON.parse(savedDataString);
    const migratedData = migrateSaveData(savedData);

    if (!migratedData) {
      console.warn('[farm]', 'Could not migrate save data, starting fresh');
      return null;
    }

    // Clear notifications on load (they're transient)
    migratedData.notifications = [];

    return migratedData;
  } catch (error) {
    console.error('[farm]', 'Failed to load saved game', error);
    // Backup corrupted save
    try {
      const corruptedSave = localStorage.getItem(SAVE_KEY);
      localStorage.setItem(`${SAVE_KEY}_corrupted_${Date.now()}`, corruptedSave);
      if (import.meta.env.MODE === 'development') {
        console.debug('[farm]', 'Corrupted save backed up');
      }
    } catch (backupError) {
      console.error('[farm]', 'Could not backup corrupted save', backupError);
    }
    return null;
  }
}

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
      byType: {}
    }
  },

  // Weather system
  weather: 'sunny',
  weatherForecast: [],

  // Season system
  season: {
    current: 'spring',
    lastChangeTime: Date.now(),
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
  },

  // Pets system
  pets: [],

  // Processing system
  processingFacilities: [],
  processingQueue: [],
  processedInventory: {},

  // UI state
  notifications: [],
  selectedCrop: 'carrot', // Currently selected crop for planting
  settings: {
    autoSave: true,
    soundEnabled: true,
    musicEnabled: true,
    animationsEnabled: true,
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
      return { ...state, plots: action.payload };

    case GAME_ACTIONS.SET_GRID_SIZE:
      const newGridSize = action.payload;
      const newTotalPlots = newGridSize * newGridSize;
      const existingPlots = state.plots;

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

      return { ...state, gridSize: newGridSize, plots: updatedPlots };

    case GAME_ACTIONS.UPDATE_INVENTORY:
      const newInventory = typeof action.payload === 'function' ? action.payload(state) : action.payload;
      return { ...state, inventory: newInventory };

    case GAME_ACTIONS.SET_WEATHER:
      return { ...state, weather: action.payload };

    case GAME_ACTIONS.UPDATE_WEATHER_FORECAST:
      return { ...state, weatherForecast: action.payload };

    case GAME_ACTIONS.UPDATE_BUILDINGS:
      return { ...state, buildings: action.payload };

    case GAME_ACTIONS.UPDATE_LIVESTOCK:
      return { ...state, livestock: action.payload };

    case GAME_ACTIONS.UPDATE_FISHING:
      return { ...state, fishing: action.payload };

    case GAME_ACTIONS.UPDATE_ACHIEVEMENTS:
      return { ...state, achievements: action.payload };

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
      return {
        ...state,
        notifications: [...state.notifications, {
          id: uniqueId,
          ...action.payload,
          timestamp: Date.now(),
        }],
      };

    case GAME_ACTIONS.CLEAR_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case GAME_ACTIONS.UPDATE_SEASON:
      return { ...state, season: action.payload };

    case GAME_ACTIONS.SET_SELECTED_CROP:
      return { ...state, selectedCrop: action.payload };

    case GAME_ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

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

  // Use refs to access latest state without causing re-renders in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatchRef = useRef(dispatch);
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const updateDailyQuestProgress = useCallback((actionType, actionData = {}) => {
    const currentDailyQuests = stateRef.current.dailyQuests;
    if (!currentDailyQuests?.quests?.length) return;

    const updatedQuests = updateQuestProgress(
      currentDailyQuests.quests,
      actionType,
      actionData
    );

    const hasChanges = updatedQuests.some((quest, index) => {
      const previousQuest = currentDailyQuests.quests[index];
      return (
        quest.progress !== previousQuest.progress
        || quest.completed !== previousQuest.completed
      );
    });

    if (!hasChanges) return;

    if (dispatchRef.current) {
      dispatchRef.current({
        type: GAME_ACTIONS.UPDATE_DAILY_QUESTS,
        payload: { ...currentDailyQuests, quests: updatedQuests },
      });
    }
  }, []);

  const previousLevelRef = useRef(state.level);
  useEffect(() => {
    if (state.level > previousLevelRef.current) {
      updateDailyQuestProgress('level_up', { level: state.level });
    }
    previousLevelRef.current = state.level;
  }, [state.level, updateDailyQuestProgress]);

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
        const saveData = {
          ...stateToSave,
          saveVersion: SAVE_VERSION,
          notifications: [],
          gameLoop: { ...stateToSave.gameLoop, lastSaveTime: saveTimestamp },
        };
        const serialized = JSON.stringify(saveData);

        // Use async storage write to avoid blocking main thread
        // localStorage.setItem is synchronous, but we can defer it with setTimeout
        // requestIdleCallback has limited browser support, so use setTimeout fallback
        const saveToStorage = () => {
          try {
            localStorage.setItem(SAVE_KEY, serialized);
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

  // Performance loops: FPS monitoring and Auto-save trigger
  const fpsRef = useRef(60);
  useEffect(() => {
    if (state.gameLoop.paused) return;

    let frameCount = 0;
    let lastFPSUpdate = performance.now();
    let lastAutoSaveCheck = Date.now();
    let animationFrameId = null;

    const masterGameLoop = (currentTime) => {
      const currentState = stateRef.current;
      if (currentState.gameLoop.paused) return;

      frameCount++;
      if (currentTime - lastFPSUpdate >= 1000) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_GAME_LOOP,
          payload: {
            fps: Math.round((frameCount * 1000) / (currentTime - lastFPSUpdate)),
            lastUpdate: Date.now()
          },
        });
        frameCount = 0;
        lastFPSUpdate = currentTime;
      }

      const now = Date.now();
      if (currentState.settings.autoSave && (now - lastAutoSaveCheck >= 30000)) {
        debouncedAutoSave(currentState);
        lastAutoSaveCheck = now;
      }

      animationFrameId = requestAnimationFrame(masterGameLoop);
    };

    animationFrameId = requestAnimationFrame(masterGameLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [state.gameLoop.paused, state.settings.autoSave, debouncedAutoSave]);

  // System management (bridging React state with external game systems)
  const [systems, setSystemsState] = useState({});
  // CRITICAL: Use ref to access systems without triggering re-memoization
  const systemsRef = React.useRef(systems);
  React.useEffect(() => {
    systemsRef.current = systems;
  }, [systems]);

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

    return ({
    // Core property setters
    setCoins: (coins) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: coins }),
    /**
     * Set XP amount (supports function updater, auto-calculates level)
     * @param {number|Function} xp - XP amount or updater function
     * @deprecated Use grantXP instead for proper tracking and rate limiting
     */
    setXp: (xp, source) => dispatch({
      type: GAME_ACTIONS.SET_XP,
      payload: xp,
      meta: buildXpMeta(source),
    }),

    /**
     * Grants XP with source tracking and rate limiting (PREFERRED)
     * @param {number} amount - XP amount to grant
     * @param {string} source - Source tag for debugging
     * @param {Object} meta - Optional metadata
     */
    grantXP: (amount, source, meta) => {
      const granted = grantXP(amount, source, meta);
      if (granted > 0) {
        updateDailyQuestProgress('gain_xp', { amount: granted });
      }
      return granted;
    },
    /**
     * Records player interaction for idle detection
     */
    recordInteraction: recordPlayerInteraction,
    updatePlot: (index, plot) => dispatch({ type: GAME_ACTIONS.UPDATE_PLOT, payload: { index, plot } }),
    updatePlots: (plots) => dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots }),
    setGridSize: (size) => dispatch({ type: GAME_ACTIONS.SET_GRID_SIZE, payload: size }),
    updateInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_INVENTORY, payload: inventory }),

    // Systems & Metadata
    setWeather: (weather) => dispatch({ type: GAME_ACTIONS.SET_WEATHER, payload: weather }),
    updateWeatherForecast: (forecast) => dispatch({ type: GAME_ACTIONS.UPDATE_WEATHER_FORECAST, payload: forecast }),
    updateBuildings: (buildings) => dispatch({ type: GAME_ACTIONS.UPDATE_BUILDINGS, payload: buildings }),
    updateLivestock: (livestock) => dispatch({ type: GAME_ACTIONS.UPDATE_LIVESTOCK, payload: livestock }),
    updateFishing: (fishing) => dispatch({ type: GAME_ACTIONS.UPDATE_FISHING, payload: fishing }),
    updateAchievements: (achievements) => dispatch({ type: GAME_ACTIONS.UPDATE_ACHIEVEMENTS, payload: achievements }),
    updateDailyQuests: (dailyQuests) => dispatch({ type: GAME_ACTIONS.UPDATE_DAILY_QUESTS, payload: dailyQuests }),
    updateDailyQuestProgress,
    updateSeason: (season) => dispatch({ type: GAME_ACTIONS.UPDATE_SEASON, payload: season }),

    // UI & Settings
    addNotification: (notification) => dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: notification }),
    clearNotification: (id) => dispatch({ type: GAME_ACTIONS.CLEAR_NOTIFICATION, payload: id }),
    setSelectedCrop: (cropId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_CROP, payload: cropId }),
    updateSettings: (settings) => dispatch({ type: GAME_ACTIONS.UPDATE_SETTINGS, payload: settings }),
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
        dispatch({ type: GAME_ACTIONS.LOAD_GAME, payload: savedState });
        return true;
      }
      return false;
    },
    /**
     * Saves current game state to localStorage
     * @returns {boolean} True if save succeeded
     */
    saveGame: () => {
      try {
        const saveTimestamp = Date.now();
        const stateToSave = {
          ...stateRef.current,
          saveVersion: SAVE_VERSION,
          notifications: [],
          gameLoop: { ...stateRef.current.gameLoop, lastSaveTime: saveTimestamp },
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { lastSaveTime: saveTimestamp } });
        return true;
      } catch (error) {
        console.error('[farm] Manual save failed', error);
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
      const currentSystems = systemsRef.current;
      if (currentSystems.farmingSystem?.plantCrop) {
        currentSystems.farmingSystem.update(stateRef.current);
        return currentSystems.farmingSystem.plantCrop(plotIndex, cropData);
      }
      // Fallback
      const updatedPlots = [...stateRef.current.plots];
      updatedPlots[plotIndex] = {
        id: plotIndex, state: 'planted', crop: cropData, plantedAt: Date.now(), growthStage: 1, waterLevel: 85, progress: 0
      };

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
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
      const updatedPlots = [...currentState.plots];
      const plot = updatedPlots[plotIndex];

      updatedPlots[plotIndex] = {
        ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, waterLevel: 50, progress: 0,
        soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - 0.1)
      };
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
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
      updateDailyQuestProgress('earn_coins', { amount });
    },

    addXP: (amount, source = 'legacy_addXP') => {
      // Forward to grantXP for tracking
      const grantXP = createXPGranter(dispatch, () => stateRef.current, GAME_ACTIONS.SET_XP);
      const granted = grantXP(amount, source);
      if (granted > 0) {
        updateDailyQuestProgress('gain_xp', { amount: granted });
      }
    },

    // Bulk actions
    waterAllPlots: () => {
      const currentState = stateRef.current;
      if (!currentState?.plots?.length) return;

      const hasWaterBoost = (currentState.inventory?.water_boost || 0) > 0;
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

      const hasFertilizer = (currentState.inventory?.fertilizer || 0) > 0;
      const cost = 15;
      if (!hasFertilizer && currentState.coins < cost) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: { message: 'Not enough coins (15) to fertilize all plots.', type: 'error' },
        });
        return;
      }

      const updatedPlots = currentState.plots.map(plot => {
        if (plot.state === 'empty') return plot;
        return {
          ...plot,
          soilFertility: Math.min(1.5, (plot.soilFertility || 1.0) + 0.3),
          waterLevel: Math.min(100, (plot.waterLevel || 0) + 10),
          fertilizer: (plot.fertilizer || 0) + 1,
        };
      });

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });

      if (hasFertilizer) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY,
          payload: (currentState) => ({
            ...currentState.inventory,
            fertilizer: Math.max(0, (currentState.inventory?.fertilizer || 0) - 1),
          }),
        });
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: { message: '🌱 Fertilizer applied to all plots.', type: 'success' },
        });
      } else {
        dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins - cost });
      }
    },
    treatAllDiseases: () => {
      const currentState = stateRef.current;
      if (!currentState?.plots?.length) return;

      const hasPesticide = (currentState.inventory?.pesticide || 0) > 0;
      const cost = 20;
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
      // Delegate to harvestAllReadyCrops logic (similar to 45febc0 but preserving earnings calculation)
      dispatch({
        type: GAME_ACTIONS.UPDATE_PLOTS, payload: (currentState) => {
          const updatedPlots = currentState.plots.map(plot => {
            if (plot.state === 'ready' && plot.crop) {
              // Reset plot
              return {
                ...plot,
                state: 'empty',
                crop: null,
                plantedAt: null,
                readyAt: null,
                growthStage: 0,
                progress: 0,
                soilFertility: Math.max(0.5, (plot.soilFertility || 1.0) - 0.1),
                waterLevel: 50,
              };
            }
            return plot;
          });

          // Calculate totals from ready crops before resetting
          let totalEarnings = 0;
          let totalXp = 0;
          const inventoryUpdates = {};

          currentState.plots.forEach(plot => {
            if (plot.state === 'ready' && plot.crop) {
              const earnings = calculateHarvestValue(plot, currentState.season?.config);

              totalEarnings += earnings;
              // REBALANCED: Reduced XP to 20% of earnings (was 50%)
              totalXp += Math.floor(earnings * 0.2);

              // Track inventory updates
              const cropId = plot.crop.id;
              inventoryUpdates[cropId] = (inventoryUpdates[cropId] || 0) + 1;
            }
          });

          const harvestedCount = Object.values(inventoryUpdates).reduce((sum, count) => sum + count, 0);
          if (harvestedCount > 0) {
            updateDailyQuestProgress('harvest', {
              amount: harvestedCount,
              weather: currentState.weather,
            });
          }
          if (totalEarnings > 0) {
            updateDailyQuestProgress('earn_coins', { amount: totalEarnings });
          }
          if (totalXp > 0) {
            updateDailyQuestProgress('gain_xp', { amount: totalXp });
          }

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
  }), [dispatch]); // CRITICAL: Only dispatch is stable, use refs for everything else

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
