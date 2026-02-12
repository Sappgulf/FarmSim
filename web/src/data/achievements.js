/**
 * Achievements Data Module
 */

export const ACHIEVEMENTS = [
  // FARMING BASICS
  { id: "first_harvest", name: "First Harvest", desc: "Harvest your first crop", reward: 15, icon: "🌱", category: "farming" },
  { id: "mass_producer", name: "Mass Producer", desc: "Harvest 25 crops total", reward: 60, icon: "🚜", category: "farming" },
  { id: "quality_farmer", name: "Quality Farmer", desc: "Harvest 5 high-quality crops", reward: 45, icon: "⭐", category: "farming" },
  { id: "field_master", name: "Field Master", desc: "Unlock the maximum field size", reward: 100, icon: "🏆", category: "farming" },

  // ECONOMIC MASTERY
  { id: "coin_collector", name: "Coin Collector", desc: "Earn 300 coins total", reward: 40, icon: "💰", category: "economy" },
  { id: "millionaire", name: "Farm Millionaire", desc: "Earn 800 coins total", reward: 150, icon: "💎", category: "economy" },
  { id: "market_master", name: "Market Master", desc: "Make 10 profitable trades", reward: 80, icon: "📈", category: "economy" },
  { id: "futures_trader", name: "Futures Trader", desc: "Complete 5 futures contracts", reward: 70, icon: "📊", category: "economy" },

  // SKILL & PROGRESSION
  { id: "skill_enthusiast", name: "Skill Enthusiast", desc: "Unlock 5 different skills", reward: 75, icon: "📚", category: "progression" },
  { id: "prestige_pioneer", name: "Prestige Pioneer", desc: "Achieve your first prestige level", reward: 200, icon: "🌟", category: "progression" },
  { id: "research_scientist", name: "Research Scientist", desc: "Complete 3 research projects", reward: 120, icon: "🔬", category: "progression" },
  { id: "automation_expert", name: "Automation Expert", desc: "Hire 3 different worker types", reward: 100, icon: "🤖", category: "progression" },

  // ENVIRONMENTAL & SEASONS
  { id: "weathered", name: "Weather Expert", desc: "Survive 3 weather events", reward: 25, icon: "⛈️", category: "environment" },
  { id: "season_expert", name: "Season Expert", desc: "Plant 5 crops in their optimal season", reward: 35, icon: "🍂", category: "environment" },
  { id: "rotation_master", name: "Rotation Master", desc: "Use crop rotation 20 times", reward: 60, icon: "🔄", category: "environment" },
  { id: "bee_friend", name: "Bee Friend", desc: "Maintain max bee happiness for 5 minutes", reward: 50, icon: "🐝", category: "environment" },

  // CHALLENGES & SPECIAL
  { id: "speed_farmer", name: "Speed Farmer", desc: "Complete Level 1 in under 4 minutes", reward: 30, icon: "⚡", category: "challenge" },
  { id: "pest_controller", name: "Pest Controller", desc: "Eliminate 10 pest infestations", reward: 30, icon: "🧽", category: "challenge" },
  { id: "disease_fighter", name: "Disease Fighter", desc: "Cure 15 crop diseases", reward: 50, icon: "💊", category: "challenge" },
  { id: "no_wilt", name: "Perfect Care", desc: "Go 10 minutes without any crop wilting", reward: 90, icon: "💚", category: "challenge" },

  // BREEDING & DISCOVERY
  { id: "first_hybrid", name: "Hybrid Pioneer", desc: "Breed your first hybrid crop", reward: 75, icon: "🧬", category: "breeding" },
  { id: "mutation_hunter", name: "Mutation Hunter", desc: "Discover 3 crop mutations", reward: 100, icon: "✨", category: "breeding" },
  { id: "legendary_breeder", name: "Legendary Breeder", desc: "Create a legendary hybrid", reward: 200, icon: "🔥", category: "breeding" },
  { id: "complete_collection", name: "Seed Collector", desc: "Unlock all crop varieties", reward: 300, icon: "📖", category: "breeding" },

  // BUILDINGS & INFRASTRUCTURE
  { id: "first_building", name: "Builder", desc: "Construct your first building", reward: 50, icon: "🏗️", category: "building" },
  { id: "farm_empire", name: "Farm Empire", desc: "Own 5 different buildings", reward: 150, icon: "🏰", category: "building" },
  { id: "livestock_owner", name: "Animal Lover", desc: "Own your first livestock", reward: 40, icon: "🐄", category: "building" },
  { id: "pet_master", name: "Pet Master", desc: "Max out a pet's happiness", reward: 60, icon: "❤️", category: "building" },

  // MILESTONE ACHIEVEMENTS
  { id: "centurion", name: "Centurion", desc: "Harvest 100 crops total", reward: 200, icon: "💯", category: "milestone" },
  { id: "thousand_coins", name: "Wealthy Farmer", desc: "Earn 1000 coins total", reward: 250, icon: "🪙", category: "milestone" },
  { id: "master_farmer", name: "Master Farmer", desc: "Reach prestige level 3", reward: 500, icon: "👑", category: "milestone" },
  { id: "farm_legend", name: "Farm Legend", desc: "Complete all other achievements", reward: 1000, icon: "🏆", category: "milestone" }
];

export const ACHIEVEMENT_CATEGORIES = {
  farming: { name: "Farming", emoji: "🌾", color: "bg-green-100 text-green-800" },
  economy: { name: "Economy", emoji: "💰", color: "bg-yellow-100 text-yellow-800" },
  progression: { name: "Progression", emoji: "📈", color: "bg-blue-100 text-blue-800" },
  environment: { name: "Environment", emoji: "🌍", color: "bg-teal-100 text-teal-800" },
  challenge: { name: "Challenge", emoji: "⚡", color: "bg-orange-100 text-orange-800" },
  breeding: { name: "Breeding", emoji: "🧬", color: "bg-purple-100 text-purple-800" },
  building: { name: "Building", emoji: "🏗️", color: "bg-amber-100 text-amber-800" },
  milestone: { name: "Milestone", emoji: "🏆", color: "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800" },
};

export const DAILY_CHALLENGES = [
  {
    id: "harvest_master",
    name: "Harvest Master",
    description: "Harvest {target} crops",
    emoji: "🌾",
    generateTarget: () => Math.floor(Math.random() * 15) + 10,
    trackKey: "harvests",
    reward: { coins: 50, xp: 25 }
  },
  {
    id: "coin_collector",
    name: "Coin Collector",
    description: "Earn {target} coins",
    emoji: "💰",
    generateTarget: () => Math.floor(Math.random() * 200) + 100,
    trackKey: "coinsEarned",
    reward: { coins: 75, xp: 30 }
  },
  {
    id: "speed_farmer",
    name: "Speed Farmer",
    description: "Plant {target} seeds in under 5 minutes",
    emoji: "⚡",
    generateTarget: () => Math.floor(Math.random() * 8) + 7,
    trackKey: "planted",
    reward: { coins: 100, xp: 40 }
  },
  {
    id: "pest_hunter",
    name: "Pest Hunter",
    description: "Eliminate {target} pests",
    emoji: "🐛",
    generateTarget: () => Math.floor(Math.random() * 5) + 3,
    trackKey: "pestsKilled",
    reward: { coins: 60, xp: 35 }
  },
  {
    id: "quality_crops",
    name: "Quality Control",
    description: "Harvest {target} excellent+ quality crops",
    emoji: "⭐",
    generateTarget: () => Math.floor(Math.random() * 5) + 3,
    trackKey: "qualityHarvests",
    reward: { coins: 80, xp: 45 }
  }
];

export const SEASONAL_EVENTS = {
  spring: [
    {
      id: "spring_festival",
      name: "Spring Planting Festival",
      emoji: "🌸",
      description: "Double XP for planting, 25% faster growth",
      duration: 300,
      effects: { growth_speed: 1.25, planting_xp: 2.0 },
      rewards: { coins: 100 },
      rarity: "common"
    },
    {
      id: "flower_bloom",
      name: "Flower Bloom Event",
      emoji: "🌺",
      description: "Flower crops give bonus coins",
      duration: 240,
      effects: { flower_bonus: 1.5 },
      rewards: { coins: 75 },
      rarity: "uncommon"
    }
  ],
  summer: [
    {
      id: "harvest_moon",
      name: "Harvest Moon Festival",
      emoji: "🌕",
      description: "All crops give 50% more coins!",
      duration: 180,
      effects: { harvest_bonus: 1.5 },
      rewards: { coins: 200 },
      rarity: "rare"
    },
    {
      id: "summer_solstice",
      name: "Summer Solstice",
      emoji: "☀️",
      description: "No watering needed, faster growth",
      duration: 360,
      effects: { no_watering: true, growth_speed: 1.3 },
      rewards: { coins: 150 },
      rarity: "uncommon"
    }
  ],
  fall: [
    {
      id: "pumpkin_fest",
      name: "Pumpkin Festival",
      emoji: "🎃",
      description: "Pumpkins sell for triple value!",
      duration: 420,
      effects: { pumpkin_bonus: 3.0 },
      rewards: { coins: 300 },
      rarity: "epic"
    },
    {
      id: "thanksgiving",
      name: "Thanksgiving Feast",
      emoji: "🦃",
      description: "Bonus for crop diversity",
      duration: 240,
      effects: { diversity_bonus: 50 },
      rewards: { coins: 250 },
      rarity: "rare"
    }
  ],
  winter: [
    {
      id: "winter_wonder",
      name: "Winter Wonderland",
      emoji: "❄️",
      description: "Greenhouse crops immune to frost",
      duration: 300,
      effects: { greenhouse_boost: 2.0, frost_immunity: true },
      rewards: { coins: 175 },
      rarity: "uncommon"
    }
  ]
};
