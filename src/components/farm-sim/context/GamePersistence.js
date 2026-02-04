/**
 * GamePersistence - Save/Load, Migration, and Initialization logic for FarmSim
 */

export const SAVE_VERSION = 3;
export const SAVE_KEY = 'farm_sim_enhanced_v2';
export const BACKUP_SAVE_KEY = `${SAVE_KEY}_backup`;
export const QA_SAVE_KEY = `${SAVE_KEY}__qa__`;
export const QA_BACKUP_SAVE_KEY = `${QA_SAVE_KEY}_backup`;

/**
 * Helper function to initialize plots
 * @param {number} gridSize - The size of the grid (gridSize x gridSize)
 * @returns {Array} Array of plot objects
 */
export const initializePlots = (gridSize) => {
    const totalPlots = gridSize * gridSize;
    return Array(totalPlots).fill(null).map((_, index) => ({
        id: index,
        state: 'empty',
        crop: null,
        decorationId: null,
        decorationPlacedAt: null,
        growthStage: 0,
        plantedAt: null,
        waterLevel: 100,
        fertilizer: 0,
        disease: null,
        soilFertility: 1.0,
        progress: 0
    }));
};

const clampNumber = (value, fallback, { min, max } = {}) => {
    if (value === null || value === undefined) return fallback;
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return fallback;
    if (typeof min === 'number' && numberValue < min) return min;
    if (typeof max === 'number' && numberValue > max) return max;
    return numberValue;
};

const ensureBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

const ensureObject = (value, fallback = {}) => (
    value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
);

const normalizePlots = (plots, gridSize) => {
    const defaults = initializePlots(gridSize);
    if (!Array.isArray(plots)) return defaults;
    const allowedStates = new Set(['empty', 'planted', 'growing', 'ready', 'withered', 'decor']);
    return defaults.map((fallbackPlot, index) => {
        const plot = plots[index];
        if (!plot || typeof plot !== 'object') return fallbackPlot;
        const state = allowedStates.has(plot.state) ? plot.state : fallbackPlot.state;
        const decorationId = typeof plot.decorationId === 'string' ? plot.decorationId : null;
        return {
            ...fallbackPlot,
            ...plot,
            id: index,
            state,
            crop: plot.crop && typeof plot.crop === 'object' ? plot.crop : null,
            decorationId: state === 'decor' ? decorationId : null,
            decorationPlacedAt: clampNumber(plot.decorationPlacedAt, null, { min: 0 }),
            growthStage: clampNumber(plot.growthStage, fallbackPlot.growthStage, { min: 0 }),
            waterLevel: clampNumber(plot.waterLevel, fallbackPlot.waterLevel, { min: 0, max: 100 }),
            fertilizer: clampNumber(plot.fertilizer, fallbackPlot.fertilizer, { min: 0 }),
            soilFertility: clampNumber(plot.soilFertility, fallbackPlot.soilFertility, { min: 0, max: 2 }),
            progress: clampNumber(plot.progress, fallbackPlot.progress, { min: 0, max: 1 }),
        };
    });
};

/**
 * Validates and migrates save data to current version
 * @param {Object} savedData - Raw save data from localStorage
 * @returns {Object|null} - Validated and migrated state, or null if invalid
 */
export function migrateSaveData(savedData) {
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

        // Version 1 → 2: Almanac + philosophy support
        if (saveVersion < 2) {
            migratedData.philosophy = typeof migratedData.philosophy === 'string'
                ? migratedData.philosophy
                : null;
            migratedData.almanac = migratedData.almanac || {
                unlocked: {},
                dates: {},
                counters: {
                    weatherSeen: {},
                    cropSeasonMask: {},
                    seasonsSeen: {},
                    dayCount: 0,
                },
                lastDayKey: null,
            };
        }

        // Version 2 → 3: Mini-games state
        if (saveVersion < 3) {
            migratedData.minigames = migratedData.minigames || {
                perfectHarvest: {
                    lastPlayedDayKey: null,
                    lastFestivalId: null,
                    lastResult: null,
                    lastPlayedAt: null,
                },
            };
        }

        // Validate critical fields
        migratedData.coins = clampNumber(migratedData.coins, 100, { min: 0 });
        migratedData.xp = clampNumber(migratedData.xp, 0, { min: 0 });
        migratedData.level = clampNumber(migratedData.level, 1, { min: 1 });
        migratedData.gridSize = Math.round(clampNumber(migratedData.gridSize, 3, { min: 3, max: 5 }));

        migratedData.plots = normalizePlots(migratedData.plots, migratedData.gridSize);

        // Ensure livestock structure exists
        if (!migratedData.livestock || typeof migratedData.livestock !== 'object') {
            migratedData.livestock = { animals: [], capacity: 10, totalProduced: 0 };
        }

        // Ensure fishing structure exists
        if (!migratedData.fishing || typeof migratedData.fishing !== 'object') {
            migratedData.fishing = {
                pond: { level: 1, population: 100, maxPopulation: 100 },
                stats: { totalCaught: 0, totalValue: 0, largestFish: 0, byType: {} }
            };
        }

        migratedData.inventory = ensureObject(migratedData.inventory, {});
        migratedData.buildings = ensureObject(migratedData.buildings, {});
        migratedData.achievements = Array.isArray(migratedData.achievements) ? migratedData.achievements : [];
        migratedData.memoryFlags = ensureObject(migratedData.memoryFlags, {});
        migratedData.memoryCounters = ensureObject(migratedData.memoryCounters, {
            decorationsPlaced: 0,
            festivalsAttended: 0,
        });
        migratedData.philosophy = typeof migratedData.philosophy === 'string'
            ? migratedData.philosophy
            : null;
        migratedData.almanac = ensureObject(migratedData.almanac, {
            unlocked: {},
            dates: {},
            counters: {
                weatherSeen: {},
                cropSeasonMask: {},
                seasonsSeen: {},
                dayCount: 0,
            },
            lastDayKey: null,
        });
        migratedData.almanac.unlocked = ensureObject(migratedData.almanac.unlocked, {});
        migratedData.almanac.dates = ensureObject(migratedData.almanac.dates, {});
        migratedData.almanac.counters = ensureObject(migratedData.almanac.counters, {
            weatherSeen: {},
            cropSeasonMask: {},
            seasonsSeen: {},
            dayCount: 0,
        });
        migratedData.almanac.counters.weatherSeen = ensureObject(
            migratedData.almanac.counters.weatherSeen,
            {}
        );
        migratedData.almanac.counters.cropSeasonMask = ensureObject(
            migratedData.almanac.counters.cropSeasonMask,
            {}
        );
        migratedData.almanac.counters.seasonsSeen = ensureObject(
            migratedData.almanac.counters.seasonsSeen,
            {}
        );
        migratedData.almanac.counters.dayCount = clampNumber(
            migratedData.almanac.counters.dayCount,
            0,
            { min: 0 }
        );
        migratedData.almanac.lastDayKey = typeof migratedData.almanac.lastDayKey === 'string'
            ? migratedData.almanac.lastDayKey
            : null;
        migratedData.seasonalEvents = Array.isArray(migratedData.seasonalEvents) ? migratedData.seasonalEvents : [];
        migratedData.activeSeasonalEvents = Array.isArray(migratedData.activeSeasonalEvents) ? migratedData.activeSeasonalEvents : [];
        migratedData.dailyChallenges = Array.isArray(migratedData.dailyChallenges) ? migratedData.dailyChallenges : [];
        migratedData.dailyChallengeProgress = ensureObject(migratedData.dailyChallengeProgress, {});
        migratedData.notifications = Array.isArray(migratedData.notifications) ? migratedData.notifications : [];
        migratedData.minigames = ensureObject(migratedData.minigames, {
            perfectHarvest: {
                lastPlayedDayKey: null,
                lastFestivalId: null,
                lastResult: null,
                lastPlayedAt: null,
            },
        });
        migratedData.minigames.perfectHarvest = ensureObject(migratedData.minigames.perfectHarvest, {
            lastPlayedDayKey: null,
            lastFestivalId: null,
            lastResult: null,
            lastPlayedAt: null,
        });
        migratedData.minigames.perfectHarvest.lastPlayedDayKey = typeof migratedData.minigames.perfectHarvest.lastPlayedDayKey === 'string'
            ? migratedData.minigames.perfectHarvest.lastPlayedDayKey
            : null;
        migratedData.minigames.perfectHarvest.lastFestivalId = typeof migratedData.minigames.perfectHarvest.lastFestivalId === 'string'
            ? migratedData.minigames.perfectHarvest.lastFestivalId
            : null;
        migratedData.minigames.perfectHarvest.lastResult = typeof migratedData.minigames.perfectHarvest.lastResult === 'string'
            ? migratedData.minigames.perfectHarvest.lastResult
            : null;
        migratedData.minigames.perfectHarvest.lastPlayedAt = clampNumber(
            migratedData.minigames.perfectHarvest.lastPlayedAt,
            null,
            { min: 0 }
        );
        migratedData.weather = typeof migratedData.weather === 'string' ? migratedData.weather : 'sunny';
        migratedData.weatherForecast = Array.isArray(migratedData.weatherForecast) ? migratedData.weatherForecast : [];
        migratedData.processingFacilities = Array.isArray(migratedData.processingFacilities) ? migratedData.processingFacilities : [];
        migratedData.processingQueue = Array.isArray(migratedData.processingQueue) ? migratedData.processingQueue : [];
        migratedData.processedInventory = ensureObject(migratedData.processedInventory, {});
        migratedData.pets = Array.isArray(migratedData.pets) ? migratedData.pets : [];
        migratedData.social = ensureObject(migratedData.social, { friends: [], reputation: 0, marketListings: [] });
        migratedData.genetics = ensureObject(migratedData.genetics, {});
        migratedData.research = ensureObject(migratedData.research, {});
        migratedData.prestige = ensureObject(migratedData.prestige, {
            tier: 0,
            totalRebirtths: 0,
            legacyPoints: 0,
            legacyBonuses: {},
            heirloomSeeds: [],
        });

        migratedData.settings = {
            autoSave: ensureBoolean(migratedData.settings?.autoSave, true),
            soundEnabled: ensureBoolean(migratedData.settings?.soundEnabled, true),
            musicEnabled: ensureBoolean(migratedData.settings?.musicEnabled, true),
            animationsEnabled: ensureBoolean(migratedData.settings?.animationsEnabled, true),
            showFPS: ensureBoolean(migratedData.settings?.showFPS, false),
            showAlmanacHints: ensureBoolean(migratedData.settings?.showAlmanacHints, true),
        };

        migratedData.selectedDecoration = typeof migratedData.selectedDecoration === 'string'
            ? migratedData.selectedDecoration
            : null;
        migratedData.decorateMode = ensureBoolean(migratedData.decorateMode, false);

        migratedData.gameLoop = {
            lastUpdate: clampNumber(migratedData.gameLoop?.lastUpdate, Date.now(), { min: 0 }),
            fps: clampNumber(migratedData.gameLoop?.fps, 60, { min: 0 }),
            paused: ensureBoolean(migratedData.gameLoop?.paused, false),
            lastSaveTime: clampNumber(migratedData.gameLoop?.lastSaveTime, Date.now(), { min: 0 }),
            pauseReason: typeof migratedData.gameLoop?.pauseReason === 'string' ? migratedData.gameLoop.pauseReason : null,
            pausedAt: clampNumber(migratedData.gameLoop?.pausedAt, null, { min: 0 }),
        };

        migratedData.season = ensureObject(migratedData.season, {
            current: 'spring',
            lastChangeTime: Date.now(),
            config: null,
        });
        if (typeof migratedData.season.current !== 'string') {
            migratedData.season.current = 'spring';
        }
        if (!Number.isFinite(migratedData.season.lastChangeTime)) {
            migratedData.season.lastChangeTime = Date.now();
        }

        if (typeof migratedData.lastChallengeReset !== 'number') {
            migratedData.lastChallengeReset = Date.now();
        }
        if (typeof migratedData.challengeStreak !== 'number') {
            migratedData.challengeStreak = 0;
        }

        migratedData.saveVersion = SAVE_VERSION;
        return migratedData;
    } catch (error) {
        console.error('[farm]', 'Error migrating save data', error);
        return null;
    }
}

export const createSavePayload = (state, saveTimestamp = Date.now()) => ({
    ...state,
    saveVersion: SAVE_VERSION,
    notifications: [],
    gameLoop: { ...state.gameLoop, lastSaveTime: saveTimestamp },
});

export const saveStateToStorage = (state, { key = SAVE_KEY, backupKey = BACKUP_SAVE_KEY } = {}) => {
    try {
        const saveTimestamp = Date.now();
        const payload = createSavePayload(state, saveTimestamp);
        const existing = localStorage.getItem(key);
        if (existing && backupKey) {
            localStorage.setItem(backupKey, existing);
        }
        localStorage.setItem(key, JSON.stringify(payload));
        return { success: true, timestamp: saveTimestamp };
    } catch (error) {
        console.error('[farm]', 'Failed to save state', error);
        return { success: false, error };
    }
};

export const loadSavedStateFromKey = (key) => {
    try {
        const savedDataString = localStorage.getItem(key);
        if (!savedDataString) return null;
        const savedData = JSON.parse(savedDataString);
        const migratedData = migrateSaveData(savedData);
        if (!migratedData) return null;
        migratedData.notifications = [];
        return migratedData;
    } catch (error) {
        console.error('[farm]', 'Failed to load saved game', error);
        return null;
    }
};

export const clearSaveKey = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('[farm]', 'Failed to clear save key', error);
    }
};

/**
 * Loads and validates saved game state from localStorage
 * @returns {Object|null} - Loaded state or null if no valid save exists
 */
export function loadSavedState() {
    try {
        const primary = loadSavedStateFromKey(SAVE_KEY);
        if (primary) return primary;

        return loadSavedStateFromKey(BACKUP_SAVE_KEY);
    } catch (error) {
        console.error('[farm]', 'Failed to load saved game', error);
        return null;
    }
}
