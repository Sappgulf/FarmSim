/**
 * Quest System - Daily/Weekly quest generation and tracking
 */

import { DAILY_QUEST_TEMPLATES, QUEST_TYPES, WEEKLY_CONTRACT_TEMPLATES } from '../constants/questData';

/**
 * Generate daily quests
 * @param {number} playerLevel - Current player level
 * @param {number} seed - Random seed for reproducible generation
 * @returns {Array} - Array of 3 quests for the day
 */
function createSeededRandom(seed) {
  return (max = 1) => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * max;
  };
}

function selectQuestSet(templates, playerLevel, seed, cadence) {
  const random = createSeededRandom(seed);

  const availableQuests = templates.filter(q => {
    if (q.difficulty === 'easy') return true;
    if (q.difficulty === 'medium') return playerLevel >= 3;
    if (q.difficulty === 'hard') return playerLevel >= 6;
    return false;
  });

  const easyQuests = availableQuests.filter(q => q.difficulty === 'easy');
  const mediumQuests = availableQuests.filter(q => q.difficulty === 'medium');
  const hardQuests = availableQuests.filter(q => q.difficulty === 'hard');

  const selectedQuests = [];

  if (easyQuests.length > 0) {
    const idx = Math.floor(random(easyQuests.length));
    selectedQuests.push({ ...easyQuests[idx] });
  }

  if (mediumQuests.length > 0) {
    const idx = Math.floor(random(mediumQuests.length));
    selectedQuests.push({ ...mediumQuests[idx] });
  }

  if (hardQuests.length > 0) {
    const idx = Math.floor(random(hardQuests.length));
    selectedQuests.push({ ...hardQuests[idx] });
  } else if (mediumQuests.length > 1) {
    const idx = Math.floor(random(mediumQuests.length));
    selectedQuests.push({ ...mediumQuests[idx] });
  }

  return selectedQuests.map((quest, idx) => ({
    ...quest,
    id: `${cadence}-quest-${Date.now()}-${idx}`,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

export function generateDailyQuests(playerLevel, seed = Date.now()) {
  // Seeded random number generator
  return selectQuestSet(DAILY_QUEST_TEMPLATES, playerLevel, seed, 'daily');
}

/**
 * Generate weekly contracts
 * @param {number} playerLevel - Current player level
 * @param {number} seed - Random seed for reproducible generation
 * @returns {Array} - Array of weekly contracts
 */
export function generateWeeklyContracts(playerLevel, seed = Date.now()) {
  return selectQuestSet(WEEKLY_CONTRACT_TEMPLATES, playerLevel, seed, 'weekly');
}

/**
 * Check if it's a new day (daily reset)
 * @param {number} lastResetTime - Timestamp of last reset
 * @returns {boolean}
 */
export function shouldResetDaily(lastResetTime) {
  if (!lastResetTime) return true;
  
  const now = new Date();
  const last = new Date(lastResetTime);
  
  // Check if different calendar day
  return (
    now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  );
}

/**
 * Check if it's a new week (weekly reset on Monday)
 * @param {number} lastResetTime - Timestamp of last reset
 * @returns {boolean}
 */
export function shouldResetWeekly(lastResetTime) {
  if (!lastResetTime) return true;

  const now = new Date();
  const last = new Date(lastResetTime);

  const startOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day + 6) % 7;
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  return startOfWeek(now).getTime() !== startOfWeek(last).getTime();
}

/**
 * Track quest progress based on game action
 * @param {Array} quests - Current quests
 * @param {string} actionType - Type of action performed
 * @param {Object} actionData - Data about the action
 * @returns {Array} - Updated quests
 */
export function updateQuestProgress(quests, actionType, actionData = {}) {
  return quests.map(quest => {
    if (quest.completed) return quest;
    
    let newProgress = quest.progress;
    
    switch (quest.type) {
      case QUEST_TYPES.HARVEST:
        if (actionType === 'harvest') {
          const increment = Number.isFinite(actionData.amount) ? actionData.amount : 1;
          if (quest.requiresCrop && actionData.cropId) {
            // Specific crop harvest (would need to specify in quest)
            newProgress += increment;
          } else if (!quest.requiresCrop) {
            // Any harvest
            newProgress += increment;
          }
        }
        break;
        
      case QUEST_TYPES.PLANT:
        if (actionType === 'plant') {
          if (quest.special === 'diversity') {
            // Track unique crops planted (would need set tracking)
            newProgress = actionData.uniqueCrops || 0;
          } else if (quest.special === 'fill_all') {
            // Check if all plots filled
            newProgress = actionData.allPlotsFilled ? 1 : 0;
          } else {
            // Simple plant count
            const increment = Number.isFinite(actionData.amount) ? actionData.amount : 1;
            newProgress += increment;
          }
        }
        break;
        
      case QUEST_TYPES.EARN:
        if (actionType === 'earn_coins') {
          newProgress += actionData.amount || 0;
        }
        break;
        
      case QUEST_TYPES.SPEND:
        if (actionType === 'spend_coins') {
          newProgress += actionData.amount || 0;
        }
        break;
        
      case QUEST_TYPES.BUILD:
        if (actionType === 'build') {
          newProgress = actionData.buildingCount || newProgress + 1;
        }
        break;
        
      case QUEST_TYPES.LEVEL:
        if (actionType === 'level_up') {
          if (quest.special === 'multi_level') {
            newProgress += actionData.levelDelta || 1;
          } else {
            newProgress = actionData.level || 0;
          }
        } else if (actionType === 'gain_xp') {
          newProgress += actionData.amount || 0;
        }
        break;
        
      case QUEST_TYPES.WEATHER:
        if (actionType === 'harvest' && quest.special === 'rainy_harvest') {
          if (actionData.weather === 'rainy') {
            newProgress += 1;
          }
        } else if (actionType === 'harvest' && quest.special === 'bad_weather') {
          if (['stormy', 'drought', 'snow', 'windy'].includes(actionData.weather)) {
            newProgress += 1;
          }
        } else if (actionType === 'storm_passed' && quest.special === 'storm_survive') {
          if (actionData.noDamage) {
            newProgress = 1;
          }
        }
        break;
    }
    
    // Check if completed
    const completed = newProgress >= quest.target;
    
    return {
      ...quest,
      progress: Math.min(newProgress, quest.target),
      completed,
    };
  });
}

/**
 * Calculate streak bonus
 * @param {number} streak - Current streak
 * @returns {number} - Bonus multiplier (1.0 = no bonus, 1.5 = 50% bonus)
 */
export function getStreakBonus(streak) {
  if (streak >= 30) return 2.0; // 30 days: 100% bonus
  if (streak >= 14) return 1.75; // 14 days: 75% bonus
  if (streak >= 7) return 1.5; // 7 days: 50% bonus
  if (streak >= 3) return 1.25; // 3 days: 25% bonus
  return 1.0; // No bonus
}

export default {
  QUEST_TYPES,
  generateDailyQuests,
  generateWeeklyContracts,
  shouldResetDaily,
  shouldResetWeekly,
  updateQuestProgress,
  getStreakBonus,
};
