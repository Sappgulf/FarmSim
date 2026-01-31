import { GAME_ACTIONS } from './GameActions';
import { SAVE_VERSION, initializePlots } from './GamePersistence';
import { createDefaultCropCollections } from '../constants/collectionData';
import { DEFAULT_DAY_LENGTH_MS, DEFAULT_DAYS_PER_SEASON } from '../systems/SeasonSystem';
import { getLevelFromXp, getXpForLevel, MAX_LEVEL_GAIN_PER_GRANT } from '../constants/progression';

const MAX_NOTIFICATIONS = 25;
const pruneNotifications = (notifications) => (
    notifications.length > MAX_NOTIFICATIONS
        ? notifications.slice(-MAX_NOTIFICATIONS)
        : notifications
);

// Initial game state
export const initialState = {
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
    dailyQuests: null,
    weeklyContracts: null,
    disasterProtections: {},
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
    },

    collections: createDefaultCropCollections(),

    // Pets system
    pets: [],

    // Processing system
    processingFacilities: [],
    processingQueue: [],
    processedInventory: {},

    // UI state
    notifications: [],
    selectedCrop: 'carrot',
    decorateMode: false,
    decorateTool: 'place',
    selectedDecoration: 'fence-post',
    movingDecorationId: null,
    decorations: [],
    settings: {
        autoSave: true,
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
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

/**
 * Game reducer function
 * @param {Object} state - Current game state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New game state
 */
export function gameReducer(state, action) {
    switch (action.type) {
        case GAME_ACTIONS.SET_COINS:
            const newCoins = typeof action.payload === 'function' ? action.payload(state.coins) : action.payload;
            const safeCoins = Number.isFinite(newCoins) ? Math.max(0, newCoins) : state.coins;
            return { ...state, coins: safeCoins };

        case GAME_ACTIONS.SET_XP:
            const rawXp = typeof action.payload === 'function' ? action.payload(state.xp) : action.payload;
            const safeXp = Number.isFinite(rawXp) ? Math.max(0, rawXp) : state.xp;
            const maxAllowedXp = getXpForLevel((state.level || 1) + MAX_LEVEL_GAIN_PER_GRANT);
            const newXp = Math.min(safeXp, maxAllowedXp);
            const newLevel = getLevelFromXp(newXp);
            const didLevelUp = newLevel > state.level;

            if (didLevelUp && typeof window !== 'undefined') {
                setTimeout(() => {
                    if (typeof window.triggerParticleEffect === 'function') {
                        const centerX = window.innerWidth / 2;
                        const centerY = window.innerHeight / 3;
                        window.triggerParticleEffect(centerX, centerY, 'levelup', {
                            text: `🎉 Level ${newLevel}!`,
                            shake: true
                        });
                    }
                }, 100);
            }

            if (action.meta?.stack) {
                const stackLines = action.meta.stack.split('\n').map(line => line.trim());
                const callsite = stackLines.find(line =>
                    line.includes('/src/')
                    && !line.includes('GameContext.jsx')
                    && !line.includes('GameReducer.js')
                );
                console.debug('[farm]', 'XP grant', {
                    source: action.meta.source || callsite || 'unknown',
                    amount: newXp - state.xp,
                    timestamp: action.meta.timestamp || Date.now(),
                    callsite,
                    xp: { before: state.xp, after: newXp },
                    level: { before: state.level, after: newLevel }
                });
            }

            const levelUpTimestamp = didLevelUp ? Date.now() : null;
            return {
                ...state,
                xp: newXp,
                level: newLevel,
                ...(didLevelUp && {
                    notifications: pruneNotifications([
                        ...state.notifications,
                        {
                            id: `${levelUpTimestamp}-${Math.random().toString(36).substr(2, 9)}`,
                            message: `🎉 Level ${newLevel} Reached!`,
                            type: 'success',
                            createdAt: levelUpTimestamp,
                            timestamp: levelUpTimestamp,
                        }
                    ])
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
            const plotsPayload = typeof action.payload === 'function' ? action.payload(state) : action.payload;
            return { ...state, plots: plotsPayload };

        case GAME_ACTIONS.SET_GRID_SIZE:
            const newGridSize = action.payload;
            const newTotalPlots = newGridSize * newGridSize;
            const existingPlots = state.plots;

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

        case GAME_ACTIONS.UPDATE_COLLECTIONS:
            return { ...state, collections: typeof action.payload === 'function' ? action.payload(state.collections) : action.payload };

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
            const createdAt = Date.now();
            const uniqueId = `${createdAt}-${Math.random().toString(36).substr(2, 9)}`;
            return {
                ...state,
                notifications: pruneNotifications([...state.notifications, {
                    id: uniqueId,
                    ...action.payload,
                    timestamp: createdAt,
                    createdAt,
                }]),
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

        case GAME_ACTIONS.LOAD_GAME:
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
                notifications: [],
            };

        default:
            return state;
    }
}
