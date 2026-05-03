/**
 * Game Constants Module
 * Centralized game configuration and constants
 */

export const LEVELS = [
  {
    id: 'lvl1',
    label: 'Novice Farmer',
    targetCoins: 100,
    minutes: 6,
    reward: 25,
    difficulty: 'Easy',
  },
  {
    id: 'lvl2',
    label: 'Growing Skills',
    targetCoins: 200,
    minutes: 8,
    reward: 40,
    difficulty: 'Medium',
  },
  {
    id: 'lvl3',
    label: 'Master Gardener',
    targetCoins: 350,
    minutes: 10,
    reward: 70,
    difficulty: 'Hard',
  },
  {
    id: 'lvl4',
    label: 'Farm Expert',
    targetCoins: 500,
    minutes: 12,
    reward: 100,
    difficulty: 'Expert',
  },
  {
    id: 'lvl5',
    label: 'Agricultural Master',
    targetCoins: 750,
    minutes: 15,
    reward: 150,
    difficulty: 'Master',
  },
  {
    id: 'endless',
    label: 'Endless Farm',
    targetCoins: 999999,
    minutes: 9999,
    reward: 0,
    difficulty: '∞',
  },
];

export const SEASONS = ['spring', 'summer', 'fall', 'winter'];

export const SEASON_DATA = {
  spring: {
    growthBonus: 1.2,
    name: 'Spring',
    emoji: '🌸',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Perfect growing conditions',
    multiplier: 1.25,
  },
  summer: {
    growthBonus: 1.1,
    name: 'Summer',
    emoji: '☀️',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Hot and sunny days',
    multiplier: 1.3,
  },
  fall: {
    growthBonus: 1.0,
    name: 'Fall',
    emoji: '🍂',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Harvest season',
    multiplier: 1.2,
  },
  winter: {
    growthBonus: 0.8,
    name: 'Winter',
    emoji: '❄️',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Cold slows growth',
    multiplier: 0.9,
  },
};

export const WEATHER_TYPES = {
  sunny: {
    name: 'Sunny',
    emoji: '☀️',
    effect: 'Normal growth',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  cloudy: {
    name: 'Cloudy',
    emoji: '☁️',
    effect: 'Slightly slower growth',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
  rainy: {
    name: 'Rainy',
    emoji: '🌧️',
    effect: 'Auto-water + growth boost',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  stormy: {
    name: 'Stormy',
    emoji: '⛈️',
    effect: 'Risk of crop damage',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  drought: {
    name: 'Drought',
    emoji: '🏜️',
    effect: 'Fast wilting, water needed',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  frost: {
    name: 'Frost',
    emoji: '🥶',
    effect: 'Growth stopped, frost damage',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
  windy: {
    name: 'Windy',
    emoji: '💨',
    effect: 'Moderate effects',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
};

export const GRID_CONFIG = {
  MIN_SIZE: 3,
  MAX_SIZE: 5,
  EXPANSION_COSTS: {
    4: 60,
    5: 180,
  },
};

export const PRESTIGE_LEVELS = [
  { level: 0, name: 'Beginner', emoji: '🌱', multiplier: 1.0, requirement: 0 },
  { level: 1, name: 'Experienced', emoji: '🌿', multiplier: 1.15, requirement: 500 },
  { level: 2, name: 'Expert', emoji: '🍃', multiplier: 1.35, requirement: 2000 },
  { level: 3, name: 'Master', emoji: '🌳', multiplier: 1.6, requirement: 8000 },
  { level: 4, name: 'Grandmaster', emoji: '🏆', multiplier: 2.0, requirement: 25000 },
  { level: 5, name: 'Legend', emoji: '👑', multiplier: 2.5, requirement: 75000 },
];

export const PRESTIGE_BONUSES = {
  growth_speed: 0.08,
  coin_multiplier: 0.12,
  quality_chance: 0.03,
  skill_points: 5,
};

export const TOOLS = {
  fertilizer: { shopPrice: 8, emoji: '🧪', description: 'Speeds up crop growth' },
  pesticide: { shopPrice: 6, emoji: '🧴', description: 'Eliminates pest infestations' },
  fungicide: { shopPrice: 12, emoji: '💊', description: 'Treats crop diseases' },
  wateringCan: { shopPrice: 40, emoji: '🚿', description: 'Enhanced watering efficiency' },
  sprinkler: { shopPrice: 120, emoji: '💦', description: 'Automatic watering system' },
  scarecrow: { shopPrice: 80, emoji: '🎃', description: 'Protects crops from pests' },
  beeFeed: { shopPrice: 15, emoji: '🍯', description: 'Increases bee happiness' },
};

export const GAME_SETTINGS = {
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  TICK_INTERVAL: 1000, // 1 second game tick
  NOTIFICATION_DURATION: 3000,
  SEASON_DURATION: 300, // 5 minutes per season
  WEATHER_CHANGE_INTERVAL: 30, // seconds
  DRY_WITHER_SECONDS: 80,
};

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to FarmSim! 🌱',
    content: 'Build your dream farm, grow crops, and become a legendary farmer!',
    target: null,
    position: 'center',
  },
  {
    id: 'select-seed',
    title: 'Choose Your Seeds',
    content:
      'Select a seed type from the dropdown. Different crops have different growth times and values.',
    target: 'seed-selector',
    position: 'bottom',
  },
  {
    id: 'plant',
    title: 'Plant Your Crops',
    content: 'Click on an empty plot to plant your selected seed. Watch it grow!',
    target: 'farm-grid',
    position: 'top',
  },
  {
    id: 'water',
    title: 'Water Your Plants',
    content: 'Click the water button on growing crops to keep them healthy and speed up growth.',
    target: 'farm-grid',
    position: 'top',
  },
  {
    id: 'harvest',
    title: 'Harvest Time!',
    content: 'When crops are fully grown (glowing green), click to harvest and earn coins!',
    target: 'farm-grid',
    position: 'top',
  },
  {
    id: 'shop',
    title: 'Visit the Shop',
    content: 'Buy seeds, tools, and upgrades to expand your farming operation.',
    target: 'shop-tab',
    position: 'bottom',
  },
  {
    id: 'weather',
    title: 'Watch the Weather',
    content:
      'Weather affects your crops. Rain waters them automatically, but storms can cause damage!',
    target: 'weather-display',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: "You're Ready! 🎉",
    content: 'Start farming and work towards your goals. Good luck, farmer!',
    target: null,
    position: 'center',
  },
];
