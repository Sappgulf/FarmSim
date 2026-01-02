import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { getSoundSystem } from '../systems/SoundSystem';

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
 * Validates and migrates save data to current version
 * @param {Object} savedData - Raw save data from localStorage
 * @returns {Object|null} - Validated and migrated state, or null if invalid
 */
function migrateSaveData(savedData) {
  try {
    // Basic validation
    if (!savedData || typeof savedData !== 'object') {
      console.warn('[farm]', 'Invalid save data format');
      return null;
    }

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
      const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

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
      if (import.meta.env.MODE === 'development') {
        console.debug('[farm]', 'Starting new game');
      }
      return initial;
    }
  );

  // Use refs to access latest state without causing re-renders
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatchRef = React.useRef(dispatch);
  React.useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  // Auto-save debouncing: prevents rapid-fire saves and uses async storage
  const autoSaveTimeoutRef = React.useRef(null);
  const lastSaveStateRef = React.useRef('');

  /**
   * Debounced auto-save with async storage write
   * @param {Object} stateToSave - State object to save
   */
  const debouncedAutoSave = React.useCallback((stateToSave) => {
    // Cancel pending save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Serialize state for comparison (fast shallow check)
    const stateString = JSON.stringify({
      coins: stateToSave.coins,
      xp: stateToSave.xp,
      level: stateToSave.level,
      plotsCount: stateToSave.plots?.length || 0,
      gridSize: stateToSave.gridSize
    });

    // Skip if nothing significant changed
    if (stateString === lastSaveStateRef.current) {
      return;
    }

    // Debounce: wait 2 seconds after last change before saving
    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const saveTimestamp = Date.now();
        const saveData = {
          ...stateToSave,
          saveVersion: SAVE_VERSION,
          notifications: [], // Don't save transient notifications
          gameLoop: {
            ...stateToSave.gameLoop,
            lastSaveTime: saveTimestamp,
          },
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
            if (import.meta.env.MODE === 'development') {
              console.debug('[farm] Game auto-saved');
            }
          } catch (error) {
            console.error('[farm] Auto-save failed:', error);
          }
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(saveToStorage, { timeout: 1000 });
        } else {
          setTimeout(saveToStorage, 0);
        }
      } catch (error) {
        console.error('[farm] Auto-save serialization failed:', error);
      }
    }, 2000); // 2 second debounce
  }, []);

  // Unified game loop with FPS monitoring, auto-save, and subsystem timing
  // PERF FIX: FPS stored in ref and window global, NOT in React state
  // This prevents the entire app from re-rendering on every FPS update
  const fpsRef = useRef(60);

  useEffect(() => {
    if (state.gameLoop.paused) return;

    let frameCount = 0;
    let lastFPSUpdate = performance.now();
    let lastAutoSaveCheck = Date.now();
    let animationFrameId = null;

    const masterGameLoop = (currentTime) => {
      // Use ref to get latest state without dependency
      const currentState = stateRef.current;
      if (currentState.gameLoop.paused) return;

      // Update FPS counter (every second) - STORED IN REF, NOT STATE
      frameCount++;
      if (currentTime - lastFPSUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFPSUpdate));
        fpsRef.current = fps;
        // Expose to window for performance overlay (no React re-render!)
        window.__currentFPS = fps;
        window.__lastFrameTime = currentTime - lastFPSUpdate;
        frameCount = 0;
        lastFPSUpdate = currentTime;
      }

      // Check if auto-save needed (every 30 seconds, but debounced)
      const now = Date.now();
      if (currentState.settings.autoSave && (now - lastAutoSaveCheck >= 30000)) {
        debouncedAutoSave(currentState);
        lastAutoSaveCheck = now;
      }

      // Continue loop
      animationFrameId = requestAnimationFrame(masterGameLoop);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(masterGameLoop);

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.gameLoop.paused, state.settings.autoSave, debouncedAutoSave]);

  // Systems (will be set by FarmSim component)
  const [systems, setSystemsState] = useState({});

  // CRITICAL: Use ref to access systems without triggering re-memoization
  const systemsRef = React.useRef(systems);
  React.useEffect(() => {
    systemsRef.current = systems;
  }, [systems]);

  /**
   * Game action creators - memoized object to prevent infinite loops
   * CRITICAL: Cannot use useCallback inside useMemo - violates Rules of Hooks!
   * Instead, create plain functions inside the memoized object.
   * Use refs for all values to avoid dependencies.
   * @type {Object}
   */
  const actions = useMemo(() => ({
    /**
     * Set coins amount (supports function updater)
     * @param {number|Function} coins - Coins amount or updater function
     */
    setCoins: (coins) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: coins }),
    /**
     * Set XP amount (supports function updater, auto-calculates level)
     * @param {number|Function} xp - XP amount or updater function
     */
    setXp: (xp) => dispatch({ type: GAME_ACTIONS.SET_XP, payload: xp }),
    updatePlot: (index, plot) => dispatch({ type: GAME_ACTIONS.UPDATE_PLOT, payload: { index, plot } }),
    updatePlots: (plots) => dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots }),
    setGridSize: (size) => dispatch({ type: GAME_ACTIONS.SET_GRID_SIZE, payload: size }),
    updateInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_INVENTORY, payload: inventory }),
    setWeather: (weather) => dispatch({ type: GAME_ACTIONS.SET_WEATHER, payload: weather }),
    updateWeatherForecast: (forecast) => dispatch({ type: GAME_ACTIONS.UPDATE_WEATHER_FORECAST, payload: forecast }),
    updateBuildings: (buildings) => dispatch({ type: GAME_ACTIONS.UPDATE_BUILDINGS, payload: buildings }),
    updateLivestock: (livestock) => dispatch({ type: GAME_ACTIONS.UPDATE_LIVESTOCK, payload: livestock }),
    updateFishing: (fishing) => dispatch({ type: GAME_ACTIONS.UPDATE_FISHING, payload: fishing }),
    updateAchievements: (achievements) => dispatch({ type: GAME_ACTIONS.UPDATE_ACHIEVEMENTS, payload: achievements }),
    setSeasonalEvents: (events) => dispatch({ type: GAME_ACTIONS.SET_SEASONAL_EVENTS, payload: events }),
    updateActiveEvents: (events) => dispatch({ type: GAME_ACTIONS.UPDATE_ACTIVE_EVENTS, payload: events }),
    setDailyChallenges: (challenges) => dispatch({ type: GAME_ACTIONS.SET_DAILY_CHALLENGES, payload: challenges }),
    updateChallengeProgress: (progress) => dispatch({ type: GAME_ACTIONS.UPDATE_CHALLENGE_PROGRESS, payload: progress }),
    updateResearch: (research) => dispatch({ type: GAME_ACTIONS.UPDATE_RESEARCH, payload: research }),

    // System setters - FIXED: Use setSystemsState to avoid name collision
    setSystems: (newSystems) => setSystemsState(newSystems),
    updateGenetics: (genetics) => dispatch({ type: GAME_ACTIONS.UPDATE_GENETICS, payload: genetics }),
    updateSocial: (social) => dispatch({ type: GAME_ACTIONS.UPDATE_SOCIAL, payload: social }),
    updatePets: (pets) => dispatch({ type: GAME_ACTIONS.UPDATE_PETS, payload: pets }),
    updateProcessingFacilities: (facilities) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES, payload: facilities }),
    updateProcessingQueue: (queue) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_QUEUE, payload: queue }),
    updateProcessedInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY, payload: inventory }),
    addNotification: (notification) => dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: notification }),
    clearNotification: (id) => dispatch({ type: GAME_ACTIONS.CLEAR_NOTIFICATION, payload: id }),
    setSelectedCrop: (cropId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_CROP, payload: cropId }),
    updateSettings: (settings) => dispatch({ type: GAME_ACTIONS.UPDATE_SETTINGS, payload: settings }),
    updateSeason: (season) => dispatch({ type: GAME_ACTIONS.UPDATE_SEASON, payload: season }),
    updateDailyQuests: (quests) => dispatch({ type: GAME_ACTIONS.UPDATE_DAILY_QUESTS, payload: quests }),
    updateDisasterProtections: (protections) => dispatch({ type: GAME_ACTIONS.UPDATE_DISASTER_PROTECTIONS, payload: protections }),
    updatePrestige: (prestige) => dispatch({ type: GAME_ACTIONS.UPDATE_PRESTIGE, payload: prestige }),
    prestigeReset: (newPrestige) => dispatch({ type: GAME_ACTIONS.PRESTIGE_RESET, payload: newPrestige }),
    pauseGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: true } }),
    resumeGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: false } }),

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
        // FIXED: Use stateRef instead of state to avoid recreating this callback
        const saveTimestamp = Date.now();
        const stateToSave = {
          ...stateRef.current,
          saveVersion: SAVE_VERSION,
          notifications: [], // Don't save transient notifications
          gameLoop: {
            ...stateRef.current.gameLoop,
            lastSaveTime: saveTimestamp,
          },
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        dispatch({
          type: GAME_ACTIONS.UPDATE_GAME_LOOP,
          payload: { lastSaveTime: saveTimestamp },
        });
        return true;
      } catch (error) {
        console.error('[farm]', 'Manual save failed', error);
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
      // Use the farming system to plant the crop properly
      // FIXED: Use systemsRef instead of systems to avoid dependency
      const currentSystems = systemsRef.current;
      if (currentSystems.farmingSystem && currentSystems.farmingSystem.plantCrop) {
        // Update farming system with latest state BEFORE planting
        currentSystems.farmingSystem.update(stateRef.current);
        const result = currentSystems.farmingSystem.plantCrop(plotIndex, cropData);
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm]', 'plantCrop result', result);
        }
        return result;
      } else {
        // Fallback if farming system not available
        console.warn('[farm] FarmingSystem not available for planting');
        const currentState = stateRef.current;
        const updatedPlots = [...currentState.plots];
        updatedPlots[plotIndex] = {
          ...updatedPlots[plotIndex],
          state: 'planted',
          crop: cropData,
          plantedAt: Date.now(),
          growthStage: 1,
          waterLevel: 85,
          fertilizer: 0,
          disease: null,
          soilFertility: updatedPlots[plotIndex]?.soilFertility || 1.0,
          progress: 0
        };
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
        return true;
      }
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
        ...plot,
        state: 'empty',
        crop: null,
        plantedAt: null,
        growthStage: 0,
        waterLevel: 50,
        fertilizer: 0,
        disease: null,
        soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - 0.1),
        progress: 0
      };

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
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
    },

    /**
     * Spends money from player's coins (clamped to 0)
     * @param {number} amount - Amount to spend
     */
    spendMoney: (amount) => {
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (currentCoins) => Math.max(0, currentCoins - amount) });
    },

    /**
     * Adds XP to player (auto-calculates level)
     * @param {number} amount - XP amount to add
     */
    addXP: (amount) => {
      dispatch({ type: GAME_ACTIONS.SET_XP, payload: (currentXp) => currentXp + amount });
    },

    /**
     * Adds items to inventory
     * @param {string} item - Item ID
     * @param {number} amount - Amount to add
     */
    addToInventory: (item, amount) => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY, payload: (currentState) => {
          const newInventory = { ...currentState.inventory };
          newInventory[item] = (newInventory[item] || 0) + amount;
          return newInventory;
        }
      });
    },

    /**
     * Removes items from inventory (clamped to 0, removes key if 0)
     * @param {string} item - Item ID
     * @param {number} amount - Amount to remove
     */
    removeFromInventory: (item, amount) => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY, payload: (currentState) => {
          const newInventory = { ...currentState.inventory };
          newInventory[item] = Math.max(0, (newInventory[item] || 0) - amount);
          if (newInventory[item] === 0) {
            delete newInventory[item];
          }
          return newInventory;
        }
      });
    },

    /**
     * Bulk farming actions
     */

    /**
     * Waters all plots (adds 25% water level, clamped to 100%)
     */
    waterAllPlots: () => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_PLOTS, payload: (currentState) => {
          return currentState.plots.map(plot => ({
            ...plot,
            waterLevel: Math.min(100, (plot.waterLevel || 0) + 25)
          }));
        }
      });
    },

    /**
     * Harvests all ready crops and calculates earnings
     * @returns {void}
     */
    harvestAllReadyCrops: () => {
      // First, calculate totals and update plots
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
              const baseValue = plot.crop.baseValue || 10;
              const soilMultiplier = plot.soilFertility || 1.0;
              const earnings = Math.floor(baseValue * soilMultiplier);

              totalEarnings += earnings;
              // REBALANCED: Reduced XP to 20% of earnings (was 50%)
              totalXp += Math.floor(earnings * 0.2);

              // Track inventory updates
              const cropId = plot.crop.id;
              inventoryUpdates[cropId] = (inventoryUpdates[cropId] || 0) + 1;
            }
          });

          // Apply all updates after a delay to ensure state consistency
          setTimeout(() => {
            if (totalEarnings > 0) {
              dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins + totalEarnings });
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

    fertilizeAllPlots: () => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_PLOTS, payload: (currentState) => {
          const costPerPlot = 15;
          const maxFertilizations = Math.floor(currentState.coins / costPerPlot);
          let fertilizationsApplied = 0;

          const updatedPlots = currentState.plots.map(plot => {
            if (fertilizationsApplied < maxFertilizations) {
              fertilizationsApplied++;
              return {
                ...plot,
                soilFertility: Math.min(1.5, (plot.soilFertility || 1.0) + 0.3),
                waterLevel: Math.min(100, (plot.waterLevel || 0) + 10),
                fertilizer: (plot.fertilizer || 0) + 1
              };
            }
            return plot;
          });

          // Deduct cost for fertilizations applied
          const totalCost = fertilizationsApplied * costPerPlot;
          setTimeout(() => {
            if (totalCost > 0) {
              dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins - totalCost });
            }
          }, 0);

          return updatedPlots;
        }
      });
    },

    /**
     * Treats all diseased plots (costs 20 coins per treatment)
     * @returns {void}
     */
    treatAllDiseases: () => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_PLOTS, payload: (currentState) => {
          const costPerTreatment = 20;
          const diseasedPlots = currentState.plots.filter(p => p.disease).length;
          const maxTreatments = Math.min(diseasedPlots, Math.floor(currentState.coins / costPerTreatment));
          let treatmentsApplied = 0;

          const updatedPlots = currentState.plots.map(plot => {
            if (plot.disease && treatmentsApplied < maxTreatments) {
              treatmentsApplied++;
              return {
                ...plot,
                disease: null
              };
            }
            return plot;
          });

          // Deduct cost for treatments applied
          const totalCost = treatmentsApplied * costPerTreatment;
          setTimeout(() => {
            if (totalCost > 0) {
              dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins - totalCost });
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
    </GameContext.Provider>
  );
}

// Custom hook for using game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Export action types for external use
export { GAME_ACTIONS };

export default GameContext;
