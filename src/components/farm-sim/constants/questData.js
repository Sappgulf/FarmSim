/**
 * Quest/Contract Data - Data-driven quest definitions
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

export const DAILY_QUEST_TEMPLATES = [
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

export const WEEKLY_CONTRACT_TEMPLATES = [
  { type: QUEST_TYPES.HARVEST, description: 'Harvest {count} crops this week', target: 60, reward: 350, difficulty: 'medium' },
  { type: QUEST_TYPES.HARVEST, description: 'Harvest {count} premium crops', target: 20, reward: 420, difficulty: 'hard', requiresCrop: true },
  { type: QUEST_TYPES.PLANT, description: 'Plant {count} seeds over the week', target: 50, reward: 300, difficulty: 'easy' },
  { type: QUEST_TYPES.PLANT, description: 'Fill the farm {count} times', target: 3, reward: 400, difficulty: 'medium', special: 'fill_all' },
  { type: QUEST_TYPES.EARN, description: 'Earn {count} coins from harvests', target: 2000, reward: 500, difficulty: 'medium' },
  { type: QUEST_TYPES.SPEND, description: 'Invest {count} coins in growth', target: 1200, reward: 450, difficulty: 'medium' },
  { type: QUEST_TYPES.BUILD, description: 'Construct {count} new buildings', target: 2, reward: 500, difficulty: 'hard' },
  { type: QUEST_TYPES.LEVEL, description: 'Gain {count} levels', target: 2, reward: 550, difficulty: 'hard', special: 'multi_level' },
  { type: QUEST_TYPES.WEATHER, description: 'Harvest {count} crops in rough weather', target: 10, reward: 380, difficulty: 'medium', special: 'bad_weather' },
];

export default {
  QUEST_TYPES,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_CONTRACT_TEMPLATES,
};
