/**
 * Quest System - Daily quest generation and tracking
 */

export const QUEST_TYPES = {
  HARVEST: 'harvest',
  PLANT: 'plant',
  EARN: 'earn',
  SPEND: 'spend',
  BUILD: 'build',
  LEVEL: 'level',
  WEATHER: 'weather',
};

export const QUEST_TEMPLATES = [
  // Harvest quests
  { type: QUEST_TYPES.HARVEST, description: 'Harvest {count} crops', target: 10, reward: 50, difficulty: 'easy' },
  { type: QUEST_TYPES.HARVEST, description: 'Harvest {count} {crop} crops', target: 5, reward: 75, difficulty: 'medium', requiresCrop: true },
  { type: QUEST_TYPES.HARVEST, description: 'Harvest {count} crops without any withering', target: 15, reward: 100, difficulty: 'hard', special: 'no_wither' },
  
  // Planting quests
  { type: QUEST_TYPES.PLANT, description: 'Plant {count} seeds', target: 8, reward: 40, difficulty: 'easy' },
  { type: QUEST_TYPES.PLANT, description: 'Fill all your plots with crops', target: 1, reward: 80, difficulty: 'medium', special: 'fill_all' },
  { type: QUEST_TYPES.PLANT, description: 'Plant {count} different crop types', target: 5, reward: 100, difficulty: 'hard', special: 'diversity' },
  
  // Economic quests
  { type: QUEST_TYPES.EARN, description: 'Earn {count} coins from harvests', target: 200, reward: 75, difficulty: 'easy' },
  { type: QUEST_TYPES.EARN, description: 'Earn {count} coins total', target: 500, reward: 150, difficulty: 'medium' },
  { type: QUEST_TYPES.SPEND, description: 'Spend {count} coins on crops', target: 100, reward: 60, difficulty: 'easy' },
  
  // Building quests
  { type: QUEST_TYPES.BUILD, description: 'Build any structure', target: 1, reward: 100, difficulty: 'medium' },
  { type: QUEST_TYPES.BUILD, description: 'Own {count} buildings', target: 3, reward: 200, difficulty: 'hard' },
  
  // Level quests
  { type: QUEST_TYPES.LEVEL, description: 'Reach level {count}', target: 5, reward: 150, difficulty: 'medium' },
  { type: QUEST_TYPES.LEVEL, description: 'Gain {count} XP', target: 100, reward: 75, difficulty: 'easy' },
  
  // Weather quests
  { type: QUEST_TYPES.WEATHER, description: 'Harvest during rainy weather', target: 3, reward: 80, difficulty: 'medium', special: 'rainy_harvest' },
  { type: QUEST_TYPES.WEATHER, description: 'Survive a storm without crop damage', target: 1, reward: 120, difficulty: 'hard', special: 'storm_survive' },
];

/**
 * Generate daily quests
 * @param {number} playerLevel - Current player level
 * @param {number} seed - Random seed for reproducible generation
 * @returns {Array} - Array of 3 quests for the day
 */
export function generateDailyQuests(playerLevel, seed = Date.now()) {
  // Seeded random number generator
  const random = (max = 1) => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * max;
  };
  
  // Select quests based on player level
  const availableQuests = QUEST_TEMPLATES.filter(q => {
    if (q.difficulty === 'easy') return true;
    if (q.difficulty === 'medium') return playerLevel >= 3;
    if (q.difficulty === 'hard') return playerLevel >= 6;
    return false;
  });
  
  // Pick 3 random quests (1 easy, 1 medium, 1 hard if available)
  const easyQuests = availableQuests.filter(q => q.difficulty === 'easy');
  const mediumQuests = availableQuests.filter(q => q.difficulty === 'medium');
  const hardQuests = availableQuests.filter(q => q.difficulty === 'hard');
  
  const selectedQuests = [];
  
  // Pick 1 easy
  if (easyQuests.length > 0) {
    const idx = Math.floor(random(easyQuests.length));
    selectedQuests.push({ ...easyQuests[idx] });
  }
  
  // Pick 1 medium
  if (mediumQuests.length > 0) {
    const idx = Math.floor(random(mediumQuests.length));
    selectedQuests.push({ ...mediumQuests[idx] });
  }
  
  // Pick 1 hard (or medium if hard not available)
  if (hardQuests.length > 0) {
    const idx = Math.floor(random(hardQuests.length));
    selectedQuests.push({ ...hardQuests[idx] });
  } else if (mediumQuests.length > 1) {
    const idx = Math.floor(random(mediumQuests.length));
    selectedQuests.push({ ...mediumQuests[idx] });
  }
  
  // Add IDs and initialize progress
  return selectedQuests.map((quest, idx) => ({
    ...quest,
    id: `quest-${Date.now()}-${idx}`,
    progress: 0,
    completed: false,
    claimed: false,
  }));
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
          newProgress = actionData.level || 0;
        } else if (actionType === 'gain_xp') {
          newProgress += actionData.amount || 0;
        }
        break;
        
      case QUEST_TYPES.WEATHER:
        if (actionType === 'harvest' && quest.special === 'rainy_harvest') {
          if (actionData.weather === 'rainy') {
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
  QUEST_TEMPLATES,
  generateDailyQuests,
  shouldResetDaily,
  updateQuestProgress,
  getStreakBonus,
};
