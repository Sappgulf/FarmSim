import { GAME_ACTIONS } from './GameActions';
import { SAVE_VERSION, initializePlots } from './GamePersistence';

// Initial game state
export const initialState = {
    // Save metadata
    saveVersion: SAVE_VERSION,

    // Core game state
    coins: 140,
    xp: 0,
    level: 1,
    gridSize: 3,

    // Game objects
    plots: initializePlots(3),
    inventory: {
        fertilizer: 1,
        water_boost: 1,
        starter_flag: 1,
    },
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
    memoryFlags: {},
    memoryCounters: {
        decorationsPlaced: 0,
        festivalsAttended: 0,
    },
    philosophy: null,
    almanac: {
        unlocked: {},
        dates: {},
        counters: {
            weatherSeen: {},
            cropSeasonMask: {},
            seasonsSeen: {},
            dayCount: 0,
        },
        lastDayKey: null,
    },
    seasonalEvents: [],
    activeSeasonalEvents: [],
    dailyChallenges: [],
    dailyChallengeProgress: {},
    lastChallengeReset: Date.now(),
    challengeStreak: 0,
    dailyQuests: null,
    minigames: {
        perfectHarvest: {
            lastPlayedDayKey: null,
            lastFestivalId: null,
            lastResult: null,
            lastPlayedAt: null,
        },
        festivalGame: {
            lastPlayedDayKey: null,
            lastFestivalId: null,
            lastRuleId: null,
            lastResult: null,
            lastPlayedAt: null,
        },
    },
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
    },

    // Pets system
    pets: [],

    // Processing system
    processingFacilities: [],
    processingQueue: [],
    processedInventory: {},

    // UI state
    notifications: [],
    selectedCrop: 'lettuce',
    selectedDecoration: null,
    decorateMode: false,
    onboardingSeen: false,
    onboardingStep: 0,
    onboardingSkipped: false,
    settings: {
        autoSave: true,
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
        showAlmanacHints: true,
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
            return { ...state, coins: newCoins };

        case GAME_ACTIONS.SET_XP:
            const newXp = typeof action.payload === 'function' ? action.payload(state.xp) : action.payload;
            const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;
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

            return {
                ...state,
                xp: newXp,
                level: newLevel,
                ...(didLevelUp && {
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
                        decorationId: null,
                        decorationPlacedAt: null,
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
            const newInventory = typeof action.payload === 'function' ? action.payload(state.inventory) : action.payload;
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
        
        case GAME_ACTIONS.UPDATE_MEMORY_FLAGS:
            const updatedMemoryFlags = typeof action.payload === 'function'
                ? action.payload(state.memoryFlags)
                : action.payload;
            return { ...state, memoryFlags: updatedMemoryFlags };

        case GAME_ACTIONS.UPDATE_MEMORY_COUNTERS:
            const updatedMemoryCounters = typeof action.payload === 'function'
                ? action.payload(state.memoryCounters)
                : action.payload;
            return { ...state, memoryCounters: updatedMemoryCounters };

        case GAME_ACTIONS.UPDATE_ALMANAC:
            return { ...state, almanac: action.payload };

        case GAME_ACTIONS.SET_PHILOSOPHY:
            return { ...state, philosophy: action.payload };

        case GAME_ACTIONS.SET_SEASONAL_EVENTS:
            return { ...state, seasonalEvents: action.payload };

        case GAME_ACTIONS.UPDATE_ACTIVE_EVENTS:
            return { ...state, activeSeasonalEvents: action.payload };

        case GAME_ACTIONS.SET_DAILY_CHALLENGES:
            return { ...state, dailyChallenges: action.payload };

        case GAME_ACTIONS.UPDATE_CHALLENGE_PROGRESS:
            return { ...state, dailyChallengeProgress: action.payload };

        case GAME_ACTIONS.UPDATE_CHALLENGE_STREAK:
            return { ...state, challengeStreak: action.payload };

        case GAME_ACTIONS.UPDATE_LAST_CHALLENGE_RESET:
            return { ...state, lastChallengeReset: action.payload };

        case GAME_ACTIONS.UPDATE_DAILY_QUESTS:
            return { ...state, dailyQuests: action.payload };

        case GAME_ACTIONS.UPDATE_DISASTER_PROTECTIONS:
            return { ...state, disasterProtections: action.payload };

        case GAME_ACTIONS.UPDATE_MINIGAMES:
            return { ...state, minigames: action.payload };

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

        case GAME_ACTIONS.SET_SELECTED_DECORATION:
            return { ...state, selectedDecoration: action.payload };

        case GAME_ACTIONS.SET_DECORATION_MODE:
            return { ...state, decorateMode: action.payload };

        case GAME_ACTIONS.UPDATE_SETTINGS:
            return { ...state, settings: { ...state.settings, ...action.payload } };

        case GAME_ACTIONS.UPDATE_GAME_LOOP:
            return { ...state, gameLoop: { ...state.gameLoop, ...action.payload } };

        case GAME_ACTIONS.UPDATE_ONBOARDING:
            return {
                ...state,
                onboardingSeen: action.payload?.onboardingSeen ?? state.onboardingSeen,
                onboardingStep: action.payload?.onboardingStep ?? state.onboardingStep,
                onboardingSkipped: action.payload?.onboardingSkipped ?? state.onboardingSkipped,
            };

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
