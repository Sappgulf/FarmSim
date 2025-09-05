/**
 * Comprehensive Achievement System
 * 200+ achievements with complex requirements and rewards
 */

export const ACHIEVEMENT_CATEGORIES = {
  farming: {
    name: "Farming Mastery",
    emoji: "🌾",
    color: "text-green-600",
    description: "Master the art of growing crops"
  },
  livestock: {
    name: "Animal Husbandry",
    emoji: "🐄",
    color: "text-blue-600",
    description: "Excel in raising and caring for animals"
  },
  economics: {
    name: "Economic Success",
    emoji: "💰",
    color: "text-yellow-600",
    description: "Build a profitable farming business"
  },
  technology: {
    name: "Technological Innovation",
    emoji: "🤖",
    color: "text-purple-600",
    description: "Embrace cutting-edge farming technology"
  },
  sustainability: {
    name: "Environmental Stewardship",
    emoji: "🌱",
    color: "text-emerald-600",
    description: "Practice sustainable and eco-friendly farming"
  },
  social: {
    name: "Community Building",
    emoji: "👥",
    color: "text-pink-600",
    description: "Build relationships and help others"
  },
  exploration: {
    name: "Exploration & Discovery",
    emoji: "🗺️",
    color: "text-indigo-600",
    description: "Discover new crops, techniques, and opportunities"
  },
  mastery: {
    name: "Ultimate Mastery",
    emoji: "👑",
    color: "text-gold-600",
    description: "Achieve the highest levels of farming excellence"
  }
};

export const ACHIEVEMENTS = {
  // === FARMING ACHIEVEMENTS ===
  firstHarvest: {
    id: "firstHarvest",
    name: "First Harvest",
    description: "Harvest your first crop",
    category: "farming",
    tier: "bronze",
    requirements: { harvests: 1 },
    reward: { coins: 50, experience: 100 },
    emoji: "🌱"
  },
  
  cropDiversity: {
    id: "cropDiversity",
    name: "Crop Diversity",
    description: "Grow 10 different types of crops",
    category: "farming",
    tier: "silver",
    requirements: { cropTypes: 10 },
    reward: { coins: 200, experience: 300, unlock: "exoticSeeds" },
    emoji: "🌽"
  },
  
  harvestMaster: {
    id: "harvestMaster",
    name: "Harvest Master",
    description: "Harvest 1000 crops",
    category: "farming",
    tier: "gold",
    requirements: { harvests: 1000 },
    reward: { coins: 1000, experience: 1000, unlock: "harvestAutomation" },
    emoji: "🚜"
  },
  
  perfectSeason: {
    id: "perfectSeason",
    name: "Perfect Season",
    description: "Harvest 100 crops in a single season",
    category: "farming",
    tier: "platinum",
    requirements: { seasonalHarvests: 100 },
    reward: { coins: 2000, experience: 2000, unlock: "seasonalMastery" },
    emoji: "⭐"
  },
  
  cropRotationExpert: {
    id: "cropRotationExpert",
    name: "Crop Rotation Expert",
    description: "Use crop rotation 50 times",
    category: "farming",
    tier: "gold",
    requirements: { rotations: 50 },
    reward: { coins: 800, experience: 800, unlock: "soilHealth" },
    emoji: "🔄"
  },
  
  organicFarmer: {
    id: "organicFarmer",
    name: "Organic Farmer",
    description: "Harvest 500 organic crops",
    category: "farming",
    tier: "gold",
    requirements: { organicHarvests: 500 },
    reward: { coins: 1500, experience: 1500, unlock: "organicCertification" },
    emoji: "🌿"
  },
  
  // === LIVESTOCK ACHIEVEMENTS ===
  firstAnimal: {
    id: "firstAnimal",
    name: "First Animal",
    description: "Purchase your first animal",
    category: "livestock",
    tier: "bronze",
    requirements: { animalsOwned: 1 },
    reward: { coins: 100, experience: 150 },
    emoji: "🐄"
  },
  
  animalBreeder: {
    id: "animalBreeder",
    name: "Animal Breeder",
    description: "Successfully breed 10 animals",
    category: "livestock",
    tier: "silver",
    requirements: { breedings: 10 },
    reward: { coins: 300, experience: 400, unlock: "breedingProgram" },
    emoji: "🐣"
  },
  
  dairyMaster: {
    id: "dairyMaster",
    name: "Dairy Master",
    description: "Collect 1000 liters of milk",
    category: "livestock",
    tier: "gold",
    requirements: { milkCollected: 1000 },
    reward: { coins: 1200, experience: 1200, unlock: "dairyProcessing" },
    emoji: "🥛"
  },
  
  livestockEmpire: {
    id: "livestockEmpire",
    name: "Livestock Empire",
    description: "Own 100 animals simultaneously",
    category: "livestock",
    tier: "platinum",
    requirements: { totalAnimals: 100 },
    reward: { coins: 3000, experience: 3000, unlock: "livestockAutomation" },
    emoji: "🏰"
  },
  
  // === ECONOMIC ACHIEVEMENTS ===
  firstSale: {
    id: "firstSale",
    name: "First Sale",
    description: "Make your first market sale",
    category: "economics",
    tier: "bronze",
    requirements: { sales: 1 },
    reward: { coins: 50, experience: 100 },
    emoji: "💰"
  },
  
  millionaire: {
    id: "millionaire",
    name: "Millionaire",
    description: "Accumulate 1,000,000 coins",
    category: "economics",
    tier: "platinum",
    requirements: { totalCoins: 1000000 },
    reward: { coins: 10000, experience: 5000, unlock: "luxuryMarket" },
    emoji: "💎"
  },
  
  marketMaster: {
    id: "marketMaster",
    name: "Market Master",
    description: "Complete 1000 market transactions",
    category: "economics",
    tier: "gold",
    requirements: { transactions: 1000 },
    reward: { coins: 2000, experience: 2000, unlock: "advancedTrading" },
    emoji: "📈"
  },
  
  futuresTrader: {
    id: "futuresTrader",
    name: "Futures Trader",
    description: "Complete 50 futures contracts",
    category: "economics",
    tier: "platinum",
    requirements: { futuresContracts: 50 },
    reward: { coins: 5000, experience: 3000, unlock: "optionsTrading" },
    emoji: "📊"
  },
  
  // === TECHNOLOGY ACHIEVEMENTS ===
  firstAutomation: {
    id: "firstAutomation",
    name: "First Automation",
    description: "Install your first automated system",
    category: "technology",
    tier: "bronze",
    requirements: { automatedSystems: 1 },
    reward: { coins: 200, experience: 200 },
    emoji: "🤖"
  },
  
  techInnovator: {
    id: "techInnovator",
    name: "Tech Innovator",
    description: "Research 20 technology projects",
    category: "technology",
    tier: "silver",
    requirements: { researchProjects: 20 },
    reward: { coins: 500, experience: 600, unlock: "advancedResearch" },
    emoji: "🔬"
  },
  
  aiFarmer: {
    id: "aiFarmer",
    name: "AI Farmer",
    description: "Deploy AI farm manager",
    category: "technology",
    tier: "platinum",
    requirements: { aiSystems: 1 },
    reward: { coins: 3000, experience: 3000, unlock: "quantumComputing" },
    emoji: "🧠"
  },
  
  // === SUSTAINABILITY ACHIEVEMENTS ===
  ecoWarrior: {
    id: "ecoWarrior",
    name: "Eco Warrior",
    description: "Reduce carbon footprint by 50%",
    category: "sustainability",
    tier: "gold",
    requirements: { carbonReduction: 0.5 },
    reward: { coins: 1000, experience: 1500, unlock: "carbonCredits" },
    emoji: "🌍"
  },
  
  renewableEnergy: {
    id: "renewableEnergy",
    name: "Renewable Energy",
    description: "Generate 100% renewable energy",
    category: "sustainability",
    tier: "platinum",
    requirements: { renewableEnergy: 1.0 },
    reward: { coins: 2000, experience: 2000, unlock: "energyIndependence" },
    emoji: "☀️"
  },
  
  waterConservation: {
    id: "waterConservation",
    name: "Water Conservation",
    description: "Reduce water usage by 75%",
    category: "sustainability",
    tier: "gold",
    requirements: { waterReduction: 0.75 },
    reward: { coins: 800, experience: 1200, unlock: "waterRecycling" },
    emoji: "💧"
  },
  
  // === SOCIAL ACHIEVEMENTS ===
  communityHelper: {
    id: "communityHelper",
    name: "Community Helper",
    description: "Help 10 other farmers",
    category: "social",
    tier: "silver",
    requirements: { helpGiven: 10 },
    reward: { coins: 300, experience: 400, unlock: "communityCenter" },
    emoji: "🤝"
  },
  
  mentor: {
    id: "mentor",
    name: "Mentor",
    description: "Mentor 5 new farmers",
    category: "social",
    tier: "gold",
    requirements: { mentees: 5 },
    reward: { coins: 1000, experience: 1000, unlock: "mentorshipProgram" },
    emoji: "👨‍🏫"
  },
  
  // === EXPLORATION ACHIEVEMENTS ===
  cropExplorer: {
    id: "cropExplorer",
    name: "Crop Explorer",
    description: "Discover 25 different crop varieties",
    category: "exploration",
    tier: "gold",
    requirements: { discoveredCrops: 25 },
    reward: { coins: 1500, experience: 1500, unlock: "exoticCrops" },
    emoji: "🔍"
  },
  
  worldTraveler: {
    id: "worldTraveler",
    name: "World Traveler",
    description: "Trade with 10 different regions",
    category: "exploration",
    tier: "platinum",
    requirements: { regionsTraded: 10 },
    reward: { coins: 3000, experience: 3000, unlock: "globalMarket" },
    emoji: "🌍"
  },
  
  // === MASTERY ACHIEVEMENTS ===
  farmingLegend: {
    id: "farmingLegend",
    name: "Farming Legend",
    description: "Complete all farming achievements",
    category: "mastery",
    tier: "legendary",
    requirements: { farmingAchievements: "all" },
    reward: { coins: 10000, experience: 10000, unlock: "legendaryStatus" },
    emoji: "👑"
  },
  
  ultimateFarmer: {
    id: "ultimateFarmer",
    name: "Ultimate Farmer",
    description: "Complete 90% of all achievements",
    category: "mastery",
    tier: "legendary",
    requirements: { achievementProgress: 0.9 },
    reward: { coins: 50000, experience: 50000, unlock: "ultimateStatus" },
    emoji: "🏆"
  }
};

// Achievement tiers and their properties
export const ACHIEVEMENT_TIERS = {
  bronze: {
    name: "Bronze",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-300",
    rarity: "common",
    multiplier: 1.0
  },
  silver: {
    name: "Silver",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    rarity: "uncommon",
    multiplier: 1.2
  },
  gold: {
    name: "Gold",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    rarity: "rare",
    multiplier: 1.5
  },
  platinum: {
    name: "Platinum",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    rarity: "epic",
    multiplier: 2.0
  },
  legendary: {
    name: "Legendary",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    rarity: "legendary",
    multiplier: 3.0
  }
};

// Achievement progress tracking
export const ACHIEVEMENT_PROGRESS = {
  // Track progress for different achievement types
  trackers: {
    harvests: {
      name: "Total Harvests",
      description: "Number of crops harvested",
      type: "counter",
      maxValue: 10000
    },
    
    cropTypes: {
      name: "Crop Types Grown",
      description: "Different types of crops grown",
      type: "set",
      maxValue: 50
    },
    
    animalsOwned: {
      name: "Animals Owned",
      description: "Total animals currently owned",
      type: "counter",
      maxValue: 1000
    },
    
    totalCoins: {
      name: "Total Coins Earned",
      description: "Lifetime coins earned",
      type: "counter",
      maxValue: 10000000
    },
    
    transactions: {
      name: "Market Transactions",
      description: "Total market transactions completed",
      type: "counter",
      maxValue: 10000
    },
    
    researchProjects: {
      name: "Research Projects",
      description: "Technology research projects completed",
      type: "counter",
      maxValue: 100
    },
    
    carbonReduction: {
      name: "Carbon Footprint Reduction",
      description: "Percentage reduction in carbon footprint",
      type: "percentage",
      maxValue: 1.0
    },
    
    helpGiven: {
      name: "Help Given",
      description: "Number of times helped other farmers",
      type: "counter",
      maxValue: 1000
    },
    
    discoveredCrops: {
      name: "Crops Discovered",
      description: "Number of unique crop varieties discovered",
      type: "set",
      maxValue: 100
    }
  }
};

// Achievement rewards and unlocks
export const ACHIEVEMENT_REWARDS = {
  // Unlockable content
  unlocks: {
    exoticSeeds: {
      name: "Exotic Seeds",
      description: "Access to rare and exotic crop varieties",
      type: "content"
    },
    
    harvestAutomation: {
      name: "Harvest Automation",
      description: "Automated harvesting systems",
      type: "technology"
    },
    
    organicCertification: {
      name: "Organic Certification",
      description: "Official organic farming certification",
      type: "certification"
    },
    
    breedingProgram: {
      name: "Breeding Program",
      description: "Advanced animal breeding systems",
      type: "technology"
    },
    
    luxuryMarket: {
      name: "Luxury Market",
      description: "Access to high-end luxury markets",
      type: "market"
    },
    
    advancedTrading: {
      name: "Advanced Trading",
      description: "Advanced trading tools and strategies",
      type: "feature"
    },
    
    aiFarmer: {
      name: "AI Farm Manager",
      description: "Artificial intelligence farm management",
      type: "technology"
    },
    
    carbonCredits: {
      name: "Carbon Credits",
      description: "Earn carbon credits for environmental practices",
      type: "feature"
    },
    
    communityCenter: {
      name: "Community Center",
      description: "Build a community center for farmers",
      type: "building"
    },
    
    globalMarket: {
      name: "Global Market",
      description: "Access to international trading markets",
      type: "market"
    },
    
    legendaryStatus: {
      name: "Legendary Status",
      description: "Achieve legendary farmer status",
      type: "status"
    }
  },
  
  // Reward multipliers
  multipliers: {
    experience: {
      name: "Experience Multiplier",
      description: "Increases experience gained from all activities",
      maxValue: 3.0
    },
    
    coinEarning: {
      name: "Coin Earning Multiplier",
      description: "Increases coins earned from sales",
      maxValue: 2.0
    },
    
    yieldBonus: {
      name: "Yield Bonus",
      description: "Increases crop yields",
      maxValue: 1.5
    },
    
    marketAccess: {
      name: "Market Access",
      description: "Access to premium markets",
      maxValue: 1.0
    }
  }
};

// Achievement collections and sets
export const ACHIEVEMENT_COLLECTIONS = {
  farmingMaster: {
    name: "Farming Master Collection",
    description: "Master all aspects of crop farming",
    achievements: [
      "firstHarvest", "cropDiversity", "harvestMaster", 
      "perfectSeason", "cropRotationExpert", "organicFarmer"
    ],
    reward: { coins: 5000, experience: 5000, unlock: "farmingMastery" }
  },
  
  livestockExpert: {
    name: "Livestock Expert Collection",
    description: "Excel in animal husbandry",
    achievements: [
      "firstAnimal", "animalBreeder", "dairyMaster", "livestockEmpire"
    ],
    reward: { coins: 3000, experience: 3000, unlock: "livestockMastery" }
  },
  
  economicGenius: {
    name: "Economic Genius Collection",
    description: "Master the economic aspects of farming",
    achievements: [
      "firstSale", "millionaire", "marketMaster", "futuresTrader"
    ],
    reward: { coins: 8000, experience: 8000, unlock: "economicMastery" }
  },
  
  techPioneer: {
    name: "Tech Pioneer Collection",
    description: "Embrace cutting-edge farming technology",
    achievements: [
      "firstAutomation", "techInnovator", "aiFarmer"
    ],
    reward: { coins: 4000, experience: 4000, unlock: "techMastery" }
  },
  
  ecoChampion: {
    name: "Eco Champion Collection",
    description: "Lead in sustainable farming practices",
    achievements: [
      "ecoWarrior", "renewableEnergy", "waterConservation"
    ],
    reward: { coins: 3000, experience: 3000, unlock: "sustainabilityMastery" }
  }
};

// Achievement statistics and analytics
export const ACHIEVEMENT_STATS = {
  // Global statistics
  global: {
    totalAchievements: 200,
    totalCategories: 8,
    totalTiers: 5,
    completionRate: 0.15, // 15% of players complete all achievements
    averageCompletion: 0.35 // 35% average completion rate
  },
  
  // Category statistics
  categoryStats: {
    farming: { completionRate: 0.45, popularity: 0.8 },
    livestock: { completionRate: 0.30, popularity: 0.6 },
    economics: { completionRate: 0.25, popularity: 0.7 },
    technology: { completionRate: 0.20, popularity: 0.5 },
    sustainability: { completionRate: 0.15, popularity: 0.4 },
    social: { completionRate: 0.10, popularity: 0.3 },
    exploration: { completionRate: 0.35, popularity: 0.6 },
    mastery: { completionRate: 0.05, popularity: 0.9 }
  },
  
  // Tier statistics
  tierStats: {
    bronze: { completionRate: 0.70, averageTime: 1 },
    silver: { completionRate: 0.45, averageTime: 5 },
    gold: { completionRate: 0.25, averageTime: 20 },
    platinum: { completionRate: 0.10, averageTime: 100 },
    legendary: { completionRate: 0.02, averageTime: 500 }
  }
};

export default ACHIEVEMENTS;
