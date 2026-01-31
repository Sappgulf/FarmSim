/**
 * GamePersistence - Save/Load, Migration, and Initialization logic for FarmSim
 */

import { XP_PER_LEVEL_BASE } from '../constants/progression';
import { createDefaultCropCollections, normalizeCollectionsState } from '../constants/collectionData';
import { DEFAULT_DAY_LENGTH_MS, DEFAULT_DAYS_PER_SEASON, SEASONS, SEASON_CONFIG } from '../systems/SeasonSystem';
import { createDefaultMarketState } from '../constants/marketData';
import { DECORATION_LOOKUP } from '../constants/decorationData';
import { PLACEABLE_BUILDING_LOOKUP } from '../constants/placeableBuildingData';
import { buildDailyPlan } from '../constants/townPlan';

export const SAVE_VERSION = 8;

// Available theme palettes
export const THEME_PALETTES = {
    spring: { id: 'spring', name: 'Spring Blossom', emoji: '🌸', primary: '#10b981', accent: '#f472b6', bg: 'from-green-50 to-pink-50' },
    autumn: { id: 'autumn', name: 'Autumn Harvest', emoji: '🍂', primary: '#f59e0b', accent: '#dc2626', bg: 'from-orange-50 to-amber-50' },
    pastel: { id: 'pastel', name: 'Pastel Dreams', emoji: '🎀', primary: '#a78bfa', accent: '#67e8f9', bg: 'from-purple-50 to-cyan-50' },
    midnight: { id: 'midnight', name: 'Cozy Midnight', emoji: '🌙', primary: '#6366f1', accent: '#818cf8', bg: 'from-slate-100 to-indigo-100' },
    default: { id: 'default', name: 'Classic Farm', emoji: '🌿', primary: '#22c55e', accent: '#3b82f6', bg: 'from-green-50 to-blue-50' },
};
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

const normalizeMarket = (market) => {
    const defaults = createDefaultMarketState();
    if (!market || typeof market !== 'object') {
        return defaults;
    }
    return {
        dailyFeaturedCrop: market.dailyFeaturedCrop || defaults.dailyFeaturedCrop,
        dailyMood: market.dailyMood || defaults.dailyMood,
        lastUpdatedDay: clampNumber(market.lastUpdatedDay, defaults.lastUpdatedDay, 1),
    };
};

const normalizeDecorations = (decorations, gridSize) => {
    if (!Array.isArray(decorations)) return [];
    const seen = new Set();
    const maxIndex = Math.max(0, gridSize - 1);
    return decorations.reduce((acc, decor) => {
        if (!decor || typeof decor !== 'object') return acc;
        if (!DECORATION_LOOKUP[decor.type]) return acc;
        const x = Number.isFinite(decor.x) ? Math.floor(decor.x) : null;
        const y = Number.isFinite(decor.y) ? Math.floor(decor.y) : null;
        if (!Number.isInteger(x) || !Number.isInteger(y)) return acc;
        if (x < 0 || y < 0 || x > maxIndex || y > maxIndex) return acc;
        const key = `${x}-${y}`;
        if (seen.has(key)) return acc;
        seen.add(key);
        acc.push({
            id: typeof decor.id === 'string' ? decor.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: decor.type,
            x,
            y,
            rotation: clampNumber(decor.rotation, 0, 0, 359),
        });
        return acc;
    }, []);
};

const normalizeBuildingPlacements = (placements, gridSize) => {
    if (!Array.isArray(placements)) return [];
    const seenCells = new Set();
    const seenBuildings = new Set();
    const maxIndex = Math.max(0, gridSize - 1);
    return placements.reduce((acc, placement) => {
        if (!placement || typeof placement !== 'object') return acc;
        if (!PLACEABLE_BUILDING_LOOKUP[placement.id]) return acc;
        if (seenBuildings.has(placement.id)) return acc;
        const x = Number.isFinite(placement.x) ? Math.floor(placement.x) : null;
        const y = Number.isFinite(placement.y) ? Math.floor(placement.y) : null;
        if (!Number.isInteger(x) || !Number.isInteger(y)) return acc;
        if (x < 0 || y < 0 || x > maxIndex || y > maxIndex) return acc;
        const key = `${x}-${y}`;
        if (seenCells.has(key)) return acc;
        seenCells.add(key);
        seenBuildings.add(placement.id);
        acc.push({ id: placement.id, x, y });
        return acc;
    }, []);
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
                reducedMotion: false,
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

        // Version 3 → 4: Add collections + town reputation metadata + season day tracking
        if (saveVersion < 4) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 3 to 4 (collections + town rep + season days)');
            }
            migratedData.collections = migratedData.collections || createDefaultCropCollections();
            migratedData.social = migratedData.social || { friends: [], reputation: 0, marketListings: [] };
            migratedData.social.townTier = migratedData.social.townTier || null;
            migratedData.social.unlockedPerks = migratedData.social.unlockedPerks || [];
            migratedData.season = migratedData.season || {
                current: SEASONS.SPRING,
                lastChangeTime: Date.now(),
                config: SEASON_CONFIG[SEASONS.SPRING],
            };
            migratedData.season.dayLengthMs = migratedData.season.dayLengthMs || DEFAULT_DAY_LENGTH_MS;
            migratedData.season.daysPerSeason = migratedData.season.daysPerSeason || DEFAULT_DAYS_PER_SEASON;
            migratedData.season.dayInSeason = Number.isFinite(migratedData.season.dayInSeason)
                ? migratedData.season.dayInSeason
                : 1;
            migratedData.season.dayCount = Number.isFinite(migratedData.season.dayCount)
                ? migratedData.season.dayCount
                : 1;
            migratedData.season.dayStartTime = typeof migratedData.season.dayStartTime === 'number'
                ? migratedData.season.dayStartTime
                : migratedData.season.lastChangeTime || Date.now();
        }

        // Version 4 → 5: Add market daily flavor + town reward tracking
        if (saveVersion < 5) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 4 to 5 (market daily + town rewards)');
            }
            migratedData.market = createDefaultMarketState();
            migratedData.social = migratedData.social || { friends: [], reputation: 0, marketListings: [] };
            migratedData.social.claimedRewards = migratedData.social.claimedRewards || [];
            migratedData.social.unlockedSeeds = migratedData.social.unlockedSeeds || [];
            migratedData.social.cosmetics = migratedData.social.cosmetics || [];
            migratedData.social.vendorDiscount = migratedData.social.vendorDiscount || 0;
        }

        // Version 5 → 6: Add farm decorations + decorate mode UI defaults
        if (saveVersion < 6) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 5 to 6 (decorations)');
            }
            migratedData.decorations = [];
            migratedData.decorateMode = false;
            migratedData.decorateTool = 'place';
            migratedData.selectedDecoration = 'fence-post';
            migratedData.movingDecorationId = null;
        }

        // Version 6 → 7: Add placeable building placements + town plan
        if (saveVersion < 7) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 6 to 7 (placeable buildings + town plan)');
            }
            migratedData.buildingPlacements = [];
            migratedData.placeBuildingMode = false;
            migratedData.selectedBuildingPlacement = 'greenhouse';
            migratedData.dailyPlan = buildDailyPlan(migratedData);
        }

        // Version 7 → 8: Add farm identity (name, theme) + photo mode + undo stack
        if (saveVersion < 8) {
            if (import.meta.env.MODE === 'development') {
                console.debug('[farm]', 'Migrating save from version 7 to 8 (farm identity + theme + photo mode)');
            }
            migratedData.farmName = migratedData.farmName || 'My Farm';
            migratedData.theme = migratedData.theme || 'default';
            migratedData.photoMode = false;
            migratedData.undoStack = [];
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
            reducedMotion: false,
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

        migratedData.collections = normalizeCollectionsState(migratedData.collections);

        if (!migratedData.social || typeof migratedData.social !== 'object') {
            migratedData.social = { friends: [], reputation: 0, marketListings: [] };
        }
        migratedData.social = {
            friends: Array.isArray(migratedData.social.friends) ? migratedData.social.friends : [],
            reputation: clampNumber(migratedData.social.reputation, 0, 0),
            marketListings: Array.isArray(migratedData.social.marketListings) ? migratedData.social.marketListings : [],
            townTier: migratedData.social.townTier || null,
            unlockedPerks: Array.isArray(migratedData.social.unlockedPerks) ? migratedData.social.unlockedPerks : [],
            claimedRewards: Array.isArray(migratedData.social.claimedRewards) ? migratedData.social.claimedRewards : [],
            unlockedSeeds: Array.isArray(migratedData.social.unlockedSeeds) ? migratedData.social.unlockedSeeds : [],
            cosmetics: Array.isArray(migratedData.social.cosmetics) ? migratedData.social.cosmetics : [],
            vendorDiscount: clampNumber(migratedData.social.vendorDiscount, 0, 0),
        };

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
        migratedData.market = normalizeMarket(migratedData.market);
        migratedData.decorations = normalizeDecorations(migratedData.decorations, migratedData.gridSize);
        migratedData.decorateMode = Boolean(migratedData.decorateMode);
        migratedData.decorateTool = ['place', 'move', 'remove'].includes(migratedData.decorateTool)
            ? migratedData.decorateTool
            : 'place';
        migratedData.selectedDecoration = DECORATION_LOOKUP[migratedData.selectedDecoration]
            ? migratedData.selectedDecoration
            : 'fence-post';
        migratedData.movingDecorationId = typeof migratedData.movingDecorationId === 'string'
            ? migratedData.movingDecorationId
            : null;
        migratedData.buildingPlacements = normalizeBuildingPlacements(migratedData.buildingPlacements, migratedData.gridSize);
        migratedData.placeBuildingMode = Boolean(migratedData.placeBuildingMode);
        migratedData.selectedBuildingPlacement = PLACEABLE_BUILDING_LOOKUP[migratedData.selectedBuildingPlacement]
            ? migratedData.selectedBuildingPlacement
            : 'greenhouse';
        migratedData.dailyPlan = migratedData.dailyPlan && typeof migratedData.dailyPlan === 'object'
            ? {
                dayCount: clampNumber(migratedData.dailyPlan.dayCount, migratedData.season?.dayCount || 1, 1),
                items: Array.isArray(migratedData.dailyPlan.items) ? migratedData.dailyPlan.items.slice(0, 3) : [],
            }
            : buildDailyPlan(migratedData);

        if (!migratedData.season || typeof migratedData.season !== 'object') {
            migratedData.season = {
                current: SEASONS.SPRING,
                lastChangeTime: Date.now(),
                config: SEASON_CONFIG[SEASONS.SPRING],
            };
        }
        migratedData.season = {
            ...migratedData.season,
            current: migratedData.season.current || SEASONS.SPRING,
            lastChangeTime: clampNumber(migratedData.season.lastChangeTime, Date.now(), 0),
            config: migratedData.season.config || SEASON_CONFIG[migratedData.season.current || SEASONS.SPRING],
            dayLengthMs: clampNumber(migratedData.season.dayLengthMs, DEFAULT_DAY_LENGTH_MS, 5000),
            daysPerSeason: clampNumber(migratedData.season.daysPerSeason, DEFAULT_DAYS_PER_SEASON, 1),
            dayInSeason: clampNumber(migratedData.season.dayInSeason, 1, 1),
            dayCount: clampNumber(migratedData.season.dayCount, 1, 1),
            dayStartTime: clampNumber(migratedData.season.dayStartTime, migratedData.season.lastChangeTime || Date.now(), 0),
        };

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

        // Validate farm identity fields
        migratedData.farmName = typeof migratedData.farmName === 'string' && migratedData.farmName.trim()
            ? migratedData.farmName.slice(0, 30)
            : 'My Farm';
        migratedData.theme = THEME_PALETTES[migratedData.theme] ? migratedData.theme : 'default';
        migratedData.photoMode = false; // Always reset photo mode on load
        migratedData.undoStack = Array.isArray(migratedData.undoStack)
            ? migratedData.undoStack.slice(-10)
            : [];

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
