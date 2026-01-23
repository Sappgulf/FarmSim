/**
 * Achievement Data - Comprehensive achievement system
 * Categories: Farming, Economy, Buildings, Collection, Social, Mastery, Special
 */

export const ACHIEVEMENTS = [
  // === FARMING ACHIEVEMENTS ===
  {
    id: 'first_plant',
    name: 'First Steps',
    description: 'Plant your first crop',
    emoji: '🌱',
    category: 'farming',
    requirement: { type: 'plants', count: 1 },
    reward: { coins: 10, xp: 5 },
    rarity: 'common',
  },
  {
    id: 'novice_farmer',
    name: 'Novice Farmer',
    description: 'Plant 10 crops',
    emoji: '👨‍🌾',
    category: 'farming',
    requirement: { type: 'plants', count: 10 },
    reward: { coins: 25, xp: 15 },
    rarity: 'common',
  },
  {
    id: 'experienced_farmer',
    name: 'Experienced Farmer',
    description: 'Plant 50 crops',
    emoji: '🚜',
    category: 'farming',
    requirement: { type: 'plants', count: 50 },
    reward: { coins: 100, xp: 50 },
    rarity: 'uncommon',
  },
  {
    id: 'master_farmer',
    name: 'Master Farmer',
    description: 'Plant 200 crops',
    emoji: '🌾',
    category: 'farming',
    requirement: { type: 'plants', count: 200 },
    reward: { coins: 500, xp: 200 },
    rarity: 'rare',
  },
  
  // === HARVEST ACHIEVEMENTS ===
  {
    id: 'first_harvest',
    name: 'First Harvest',
    description: 'Harvest your first crop',
    emoji: '🎉',
    category: 'farming',
    requirement: { type: 'harvests', count: 1 },
    reward: { coins: 15, xp: 10 },
    rarity: 'common',
  },
  {
    id: 'bountiful_harvest',
    name: 'Bountiful Harvest',
    description: 'Harvest 25 crops',
    emoji: '🌽',
    category: 'farming',
    requirement: { type: 'harvests', count: 25 },
    reward: { coins: 75, xp: 30 },
    rarity: 'common',
  },
  {
    id: 'harvest_hero',
    name: 'Harvest Hero',
    description: 'Harvest 100 crops',
    emoji: '🏆',
    category: 'farming',
    requirement: { type: 'harvests', count: 100 },
    reward: { coins: 300, xp: 100 },
    rarity: 'uncommon',
  },
  {
    id: 'harvest_legend',
    name: 'Harvest Legend',
    description: 'Harvest 500 crops',
    emoji: '👑',
    category: 'farming',
    requirement: { type: 'harvests', count: 500 },
    reward: { coins: 1000, xp: 500 },
    rarity: 'epic',
  },

  // === ECONOMY ACHIEVEMENTS ===
  {
    id: 'first_coin',
    name: 'First Coin',
    description: 'Earn your first coin',
    emoji: '🪙',
    category: 'economy',
    requirement: { type: 'coins_earned', count: 1 },
    reward: { coins: 5, xp: 5 },
    rarity: 'common',
  },
  {
    id: 'small_fortune',
    name: 'Small Fortune',
    description: 'Earn 100 coins total',
    emoji: '💰',
    category: 'economy',
    requirement: { type: 'coins_earned', count: 100 },
    reward: { coins: 50, xp: 25 },
    rarity: 'common',
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Earn 500 coins total',
    emoji: '💼',
    category: 'economy',
    requirement: { type: 'coins_earned', count: 500 },
    reward: { coins: 200, xp: 75 },
    rarity: 'uncommon',
  },
  {
    id: 'tycoon',
    name: 'Farm Tycoon',
    description: 'Earn 2000 coins total',
    emoji: '🏦',
    category: 'economy',
    requirement: { type: 'coins_earned', count: 2000 },
    reward: { coins: 750, xp: 300 },
    rarity: 'rare',
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Earn 5000 coins total',
    emoji: '💎',
    category: 'economy',
    requirement: { type: 'coins_earned', count: 5000 },
    reward: { coins: 2000, xp: 1000 },
    rarity: 'epic',
  },
  {
    id: 'wealthy',
    name: 'Wealthy Farmer',
    description: 'Have 1000 coins at once',
    emoji: '💵',
    category: 'economy',
    requirement: { type: 'coins_balance', count: 1000 },
    reward: { coins: 500, xp: 200 },
    rarity: 'uncommon',
  },

  // === LEVEL & XP ACHIEVEMENTS ===
  {
    id: 'level_5',
    name: 'Growing Skills',
    description: 'Reach level 5',
    emoji: '⭐',
    category: 'progression',
    requirement: { type: 'level', count: 5 },
    reward: { coins: 100, xp: 0 },
    rarity: 'common',
  },
  {
    id: 'level_10',
    name: 'Expert Farmer',
    description: 'Reach level 10',
    emoji: '🌟',
    category: 'progression',
    requirement: { type: 'level', count: 10 },
    reward: { coins: 300, xp: 0 },
    rarity: 'uncommon',
  },
  {
    id: 'level_20',
    name: 'Agricultural Master',
    description: 'Reach level 20',
    emoji: '✨',
    category: 'progression',
    requirement: { type: 'level', count: 20 },
    reward: { coins: 1000, xp: 0 },
    rarity: 'rare',
  },

  // === BUILDINGS ACHIEVEMENTS ===
  {
    id: 'first_building',
    name: 'First Construction',
    description: 'Build your first building',
    emoji: '🏗️',
    category: 'buildings',
    requirement: { type: 'buildings', count: 1 },
    reward: { coins: 50, xp: 25 },
    rarity: 'common',
  },
  {
    id: 'architect',
    name: 'Architect',
    description: 'Build 3 different buildings',
    emoji: '🏛️',
    category: 'buildings',
    requirement: { type: 'buildings', count: 3 },
    reward: { coins: 200, xp: 100 },
    rarity: 'uncommon',
  },
  {
    id: 'master_builder',
    name: 'Master Builder',
    description: 'Build all buildings',
    emoji: '🏰',
    category: 'buildings',
    requirement: { type: 'buildings', count: 6 },
    reward: { coins: 500, xp: 250 },
    rarity: 'rare',
  },

  // === COLLECTION ACHIEVEMENTS ===
  {
    id: 'crop_collector',
    name: 'Crop Collector',
    description: 'Grow 5 different crop types',
    emoji: '📦',
    category: 'collection',
    requirement: { type: 'crop_types', count: 5 },
    reward: { coins: 100, xp: 50 },
    rarity: 'common',
  },
  {
    id: 'diverse_farmer',
    name: 'Diverse Farmer',
    description: 'Grow 10 different crop types',
    emoji: '🎨',
    category: 'collection',
    requirement: { type: 'crop_types', count: 10 },
    reward: { coins: 300, xp: 150 },
    rarity: 'uncommon',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Grow all crop types',
    emoji: '🏅',
    category: 'collection',
    requirement: { type: 'crop_types', count: 18 },
    reward: { coins: 1000, xp: 500 },
    rarity: 'epic',
  },

  // === EXPANSION ACHIEVEMENTS ===
  {
    id: 'expand_once',
    name: 'Room to Grow',
    description: 'Expand your farm once',
    emoji: '📏',
    category: 'expansion',
    requirement: { type: 'expansions', count: 1 },
    reward: { coins: 75, xp: 40 },
    rarity: 'common',
  },
  {
    id: 'max_expansion',
    name: 'Maximum Capacity',
    description: 'Expand farm to maximum size',
    emoji: '🗺️',
    category: 'expansion',
    requirement: { type: 'expansions', count: 2 },
    reward: { coins: 300, xp: 150 },
    rarity: 'uncommon',
  },

  // === SPEED ACHIEVEMENTS ===
  {
    id: 'speed_planter',
    name: 'Speed Planter',
    description: 'Plant 10 crops in under 60 seconds',
    emoji: '⚡',
    category: 'speed',
    requirement: { type: 'plants_per_minute', count: 10 },
    reward: { coins: 150, xp: 75 },
    rarity: 'uncommon',
  },
  {
    id: 'efficient_harvester',
    name: 'Efficient Harvester',
    description: 'Harvest 15 crops in under 60 seconds',
    emoji: '💨',
    category: 'speed',
    requirement: { type: 'harvests_per_minute', count: 15 },
    reward: { coins: 200, xp: 100 },
    rarity: 'uncommon',
  },

  // === SPECIAL ACHIEVEMENTS ===
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play between midnight and 4 AM',
    emoji: '🦉',
    category: 'special',
    requirement: { type: 'play_time', time: 'night' },
    reward: { coins: 100, xp: 50 },
    rarity: 'rare',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play between 5 AM and 7 AM',
    emoji: '🐦',
    category: 'special',
    requirement: { type: 'play_time', time: 'early' },
    reward: { coins: 100, xp: 50 },
    rarity: 'rare',
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Play for 7 days in a row',
    emoji: '📅',
    category: 'special',
    requirement: { type: 'login_streak', count: 7 },
    reward: { coins: 500, xp: 250 },
    rarity: 'epic',
  },
  {
    id: 'marathon_session',
    name: 'Marathon Session',
    description: 'Play for 2 hours straight',
    emoji: '⏱️',
    category: 'special',
    requirement: { type: 'play_duration', hours: 2 },
    reward: { coins: 300, xp: 150 },
    rarity: 'rare',
  },

  // === QUALITY ACHIEVEMENTS ===
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Harvest 10 perfect quality crops',
    emoji: '✨',
    category: 'quality',
    requirement: { type: 'perfect_harvests', count: 10 },
    reward: { coins: 250, xp: 125 },
    rarity: 'uncommon',
  },
  {
    id: 'quality_control',
    name: 'Quality Control',
    description: 'Harvest 50 perfect quality crops',
    emoji: '🌟',
    category: 'quality',
    requirement: { type: 'perfect_harvests', count: 50 },
    reward: { coins: 750, xp: 375 },
    rarity: 'rare',
  },

  // === WEATHER ACHIEVEMENTS ===
  {
    id: 'weather_warrior',
    name: 'Weather Warrior',
    description: 'Survive 10 storms without crop loss',
    emoji: '⛈️',
    category: 'weather',
    requirement: { type: 'storms_survived', count: 10 },
    reward: { coins: 400, xp: 200 },
    rarity: 'rare',
  },
  {
    id: 'sun_seeker',
    name: 'Sun Seeker',
    description: 'Harvest during sunny weather 25 times',
    emoji: '☀️',
    category: 'weather',
    requirement: { type: 'sunny_harvests', count: 25 },
    reward: { coins: 200, xp: 100 },
    rarity: 'uncommon',
  },
];

/**
 * Achievement categories for filtering and display
 */
export const ACHIEVEMENT_CATEGORIES = {
  farming: { name: 'Farming', emoji: '🌾', color: 'green' },
  economy: { name: 'Economy', emoji: '💰', color: 'yellow' },
  progression: { name: 'Progression', emoji: '⭐', color: 'blue' },
  buildings: { name: 'Buildings', emoji: '🏗️', color: 'orange' },
  collection: { name: 'Collection', emoji: '📦', color: 'purple' },
  expansion: { name: 'Expansion', emoji: '🗺️', color: 'cyan' },
  speed: { name: 'Speed', emoji: '⚡', color: 'red' },
  special: { name: 'Special', emoji: '✨', color: 'pink' },
  quality: { name: 'Quality', emoji: '💎', color: 'indigo' },
  weather: { name: 'Weather', emoji: '🌦️', color: 'sky' },
};

/**
 * Rarity tiers
 */
export const ACHIEVEMENT_RARITIES = {
  common: { name: 'Common', color: 'gray', stars: 1 },
  uncommon: { name: 'Uncommon', color: 'green', stars: 2 },
  rare: { name: 'Rare', color: 'blue', stars: 3 },
  epic: { name: 'Epic', color: 'purple', stars: 4 },
  legendary: { name: 'Legendary', color: 'orange', stars: 5 },
};

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category) => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

/**
 * Get achievement by ID
 */
export const getAchievement = (id) => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

/**
 * Calculate total achievement rewards
 */
export const getTotalAchievementRewards = () => {
  return ACHIEVEMENTS.reduce((total, achievement) => ({
    coins: total.coins + achievement.reward.coins,
    xp: total.xp + achievement.reward.xp,
  }), { coins: 0, xp: 0 });
};

export default ACHIEVEMENTS;

