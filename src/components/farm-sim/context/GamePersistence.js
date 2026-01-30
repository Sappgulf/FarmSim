/**
 * GamePersistence - Save/Load, Migration, and Initialization logic for FarmSim
 */

import { XP_PER_LEVEL_BASE } from '../constants/progression';

export const SAVE_VERSION = 3;
export const SAVE_KEY = 'farm_sim_enhanced_v2';
export const SAVE_BACKUP_KEY = `${SAVE_KEY}_backup`;

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
        growthStage: 0,
        plantedAt: null,
        waterLevel: 100,
        fertilizer: 0,
        disease: null,
        soilFertility: 1.0,
        progress: 0
    }));
};

const clampNumber = (value, fallback, min = null, max = null) => {
    const safeValue = Number.isFinite(value) ? value : fallback;
    if (min !== null && safeValue < min) return min;
    if (max !== null && safeValue > max) return max;
    return safeValue;
};

const normalizeQuestState = (questState, defaults = {}) => {
    if (!questState || typeof questState !== 'object') {
        return {
            ...defaults,
            quests: [],
            lastResetTime: null,
            totalCompleted: 0,
        };
    }
    return {
        ...defaults,
        ...questState,
        quests: Array.isArray(questState.quests) ? questState.quests : [],
        lastResetTime: typeof questState.lastResetTime === 'number' ? questState.lastResetTime : null,
        totalCompleted: clampNumber(questState.totalCompleted, 0, 0),
        streak: clampNumber(questState.streak, defaults.streak ?? 0, 0),
    };
};

const normalizeAutomation = (automation) => {
    if (!automation || typeof automation !== 'object') {
        return { lastAutoWaterAt: 0 };
    }
    return {
        ...automation,
        lastAutoWaterAt: clampNumber(automation.lastAutoWaterAt, 0, 0),
    };
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

        // Version 1 → 2: Rebalance XP curve while preserving level progress
        if (saveVersion < 2) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 1 to 2 (XP rebalance)');
            }
            const oldXpBase = 50;
            const level = Number.isFinite(migratedData.level) ? Math.max(1, migratedData.level) : 1;
            const xp = Number.isFinite(migratedData.xp) ? Math.max(0, migratedData.xp) : 0;
            const oldXpForCurrent = Math.pow(level - 1, 2) * oldXpBase;
            const oldXpForNext = Math.pow(level, 2) * oldXpBase;
            const progress = oldXpForNext > oldXpForCurrent
                ? (xp - oldXpForCurrent) / (oldXpForNext - oldXpForCurrent)
                : 0;
            const clampedProgress = Math.min(1, Math.max(0, progress));
            const newXpForCurrent = Math.pow(level - 1, 2) * XP_PER_LEVEL_BASE;
            const newXpForNext = Math.pow(level, 2) * XP_PER_LEVEL_BASE;
            migratedData.xp = Math.round(
                newXpForCurrent + clampedProgress * (newXpForNext - newXpForCurrent)
            );
        }

        // Version 2 → 3: Add weekly contracts + automation metadata
        if (saveVersion < 3) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 2 to 3 (contracts + automation)');
            }
            migratedData.weeklyContracts = migratedData.weeklyContracts || null;
            migratedData.automation = migratedData.automation || { lastAutoWaterAt: 0 };
        }

        // Validate critical fields
        migratedData.coins = clampNumber(migratedData.coins, 100, 0);
        migratedData.xp = clampNumber(migratedData.xp, 0, 0);
        migratedData.level = clampNumber(migratedData.level, 1, 1);
        migratedData.gridSize = clampNumber(migratedData.gridSize, 3, 1);

        migratedData.settings = {
            autoSave: true,
            soundEnabled: true,
            musicEnabled: true,
            animationsEnabled: true,
            ...(migratedData.settings || {}),
        };

        migratedData.gameLoop = {
            lastUpdate: Date.now(),
            fps: 60,
            paused: false,
            lastSaveTime: Date.now(),
            ...(migratedData.gameLoop || {}),
        };

        if (!Array.isArray(migratedData.plots)) {
            console.warn('[farm]', 'Invalid plots data, will reinitialize');
            migratedData.plots = initializePlots(migratedData.gridSize || 3);
        }

        if (!Array.isArray(migratedData.achievements)) {
            migratedData.achievements = [];
        }

        if (!migratedData.dailyQuests || typeof migratedData.dailyQuests !== 'object') {
            migratedData.dailyQuests = null;
        } else {
            migratedData.dailyQuests = normalizeQuestState(migratedData.dailyQuests, { streak: 0 });
        }

        if (!migratedData.weeklyContracts || typeof migratedData.weeklyContracts !== 'object') {
            migratedData.weeklyContracts = null;
        } else {
            migratedData.weeklyContracts = normalizeQuestState(migratedData.weeklyContracts);
        }

        migratedData.automation = normalizeAutomation(migratedData.automation);

        // Ensure livestock structure exists
        if (!migratedData.livestock || typeof migratedData.livestock !== 'object') {
            migratedData.livestock = { animals: [], capacity: 10, totalProduced: 0 };
        }

        // Ensure fishing structure exists
        if (!migratedData.fishing || typeof migratedData.fishing !== 'object') {
            migratedData.fishing = {
                pond: { level: 1, population: 100, maxPopulation: 100 },
                stats: { totalCaught: 0, totalValue: 0, largestFish: 0, byType: {}, streak: 0, bestStreak: 0 }
            };
        } else {
            if (!migratedData.fishing.pond || typeof migratedData.fishing.pond !== 'object') {
                migratedData.fishing.pond = { level: 1, population: 100, maxPopulation: 100 };
            }
            if (!migratedData.fishing.stats || typeof migratedData.fishing.stats !== 'object') {
                migratedData.fishing.stats = { totalCaught: 0, totalValue: 0, largestFish: 0, byType: {}, streak: 0, bestStreak: 0 };
            } else {
                if (typeof migratedData.fishing.stats.streak !== 'number') {
                    migratedData.fishing.stats.streak = 0;
                }
                if (typeof migratedData.fishing.stats.bestStreak !== 'number') {
                    migratedData.fishing.stats.bestStreak = 0;
                }
            }
        }

        // Ensure gridSize matches plots length
        if (migratedData.plots.length !== migratedData.gridSize * migratedData.gridSize) {
            migratedData.plots = initializePlots(migratedData.gridSize || 3);
        }

        migratedData.saveVersion = SAVE_VERSION;
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
export function loadSavedState() {
    try {
        const savedDataString = localStorage.getItem(SAVE_KEY);
        const backupDataString = localStorage.getItem(SAVE_BACKUP_KEY);

        if (!savedDataString && !backupDataString) return null;

        const attemptLoad = (dataString, sourceLabel) => {
            if (!dataString) return null;
            try {
                const savedData = JSON.parse(dataString);
                const migratedData = migrateSaveData(savedData);
                if (migratedData) {
                    migratedData.notifications = [];
                    return migratedData;
                }
            } catch (error) {
                console.error('[farm]', `Failed to parse ${sourceLabel} save`, error);
            }
            return null;
        };

        const primary = attemptLoad(savedDataString, 'primary');
        if (primary) return primary;

        const backup = attemptLoad(backupDataString, 'backup');
        if (backup) {
            console.warn('[farm]', 'Primary save invalid, restored from backup');
            return backup;
        }

        return null;
    } catch (error) {
        console.error('[farm]', 'Failed to load saved game', error);
        return null;
    }
}

export function buildSavePayload(stateToSave, saveTimestamp = Date.now()) {
    return {
        ...stateToSave,
        saveVersion: SAVE_VERSION,
        notifications: [],
        gameLoop: { ...stateToSave.gameLoop, lastSaveTime: saveTimestamp },
    };
}

export function persistSaveData(stateToSave, options = {}) {
    const saveTimestamp = options.saveTimestamp || Date.now();
    const payload = buildSavePayload(stateToSave, saveTimestamp);
    const serialized = JSON.stringify(payload);

    const previous = localStorage.getItem(SAVE_KEY);
    if (previous) {
        localStorage.setItem(SAVE_BACKUP_KEY, previous);
    }

    localStorage.setItem(SAVE_KEY, serialized);
    return { saveTimestamp, payload };
}
