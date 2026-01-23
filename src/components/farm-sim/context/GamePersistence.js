/**
 * GamePersistence - Save/Load, Migration, and Initialization logic for FarmSim
 */

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'farm_sim_enhanced_v2';

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

        // Validate critical fields
        if (typeof migratedData.coins !== 'number' || !Number.isFinite(migratedData.coins) || migratedData.coins < 0) {
            migratedData.coins = 100; // Reset to default if corrupted
        }
        if (typeof migratedData.xp !== 'number' || !Number.isFinite(migratedData.xp) || migratedData.xp < 0) {
            migratedData.xp = 0;
        }
        if (typeof migratedData.level !== 'number' || !Number.isFinite(migratedData.level) || migratedData.level < 1) {
            migratedData.level = 1;
        }

        if (!Array.isArray(migratedData.plots)) {
            console.warn('[farm]', 'Invalid plots data, will reinitialize');
            migratedData.plots = initializePlots(migratedData.gridSize || 3);
        }

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
        if (!savedDataString) return null;

        const savedData = JSON.parse(savedDataString);
        const migratedData = migrateSaveData(savedData);

        if (!migratedData) return null;

        // Clear notifications on load
        migratedData.notifications = [];
        return migratedData;
    } catch (error) {
        console.error('[farm]', 'Failed to load saved game', error);
        return null;
    }
}
