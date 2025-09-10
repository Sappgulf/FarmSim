import React, { useState, useEffect, useCallback } from 'react';
import soundManager from '../utils/soundManager';
import TutorialOverlay from './TutorialOverlay';
import MarketSystem from '../systems/marketSystem';
import ProcessingSystem from '../systems/processingSystem';
import AIFarmingSystem from '../systems/aiFarmingSystem';

// Simple crop data
const CROPS = {
  wheat: { name: 'Wheat', emoji: '🌾', cost: 10, value: 25, growTime: 30 },
  carrot: { name: 'Carrot', emoji: '🥕', cost: 15, value: 35, growTime: 45 },
  tomato: { name: 'Tomato', emoji: '🍅', cost: 20, value: 50, growTime: 60 },
  corn: { name: 'Corn', emoji: '🌽', cost: 25, value: 65, growTime: 75 }
};

// Zone-specific crops
const ZONE_CROPS = {
  // Desert Oasis Zone
  cactus: { name: 'Cactus Fruit', emoji: '🌵', cost: 40, value: 85, growTime: 90, zones: ['desert'], droughtResistant: true },
  dates: { name: 'Dates', emoji: '🌴', cost: 50, value: 110, growTime: 120, zones: ['desert'], droughtResistant: true },
  agave: { name: 'Agave', emoji: '🪴', cost: 35, value: 75, growTime: 80, zones: ['desert'], droughtResistant: true },
  
  // Forest Grove Zone  
  mushroom: { name: 'Mushrooms', emoji: '🍄', cost: 30, value: 70, growTime: 50, zones: ['forest'], shadeTolerant: true },
  berries: { name: 'Wild Berries', emoji: '🫐', cost: 25, value: 55, growTime: 40, zones: ['forest'], shadeTolerant: true },
  herbs: { name: 'Forest Herbs', emoji: '🌿', cost: 20, value: 45, growTime: 35, zones: ['forest'], shadeTolerant: true },
  
  // Mountain Terrace Zone
  alpine: { name: 'Alpine Vegetables', emoji: '🥬', cost: 45, value: 95, growTime: 70, zones: ['mountain'], coldResistant: true },
  potato: { name: 'Mountain Potato', emoji: '🥔', cost: 30, value: 65, growTime: 60, zones: ['mountain'], coldResistant: true },
  cabbage: { name: 'Alpine Cabbage', emoji: '🥬', cost: 35, value: 75, growTime: 65, zones: ['mountain'], coldResistant: true },
  
  // Coastal Farm Zone
  seaweed: { name: 'Seaweed', emoji: '🌊', cost: 25, value: 60, growTime: 30, zones: ['coastal'], saltTolerant: true },
  saltherbs: { name: 'Salt Herbs', emoji: '🧂', cost: 40, value: 90, growTime: 55, zones: ['coastal'], saltTolerant: true },
  kelp: { name: 'Kelp', emoji: '🦑', cost: 35, value: 80, growTime: 45, zones: ['coastal'], saltTolerant: true }
};

// Combined crops for easy access
const ALL_CROPS = { ...CROPS, ...ZONE_CROPS };

// Weather types
const WEATHER = {
  sunny: { 
    name: 'Sunny', 
    emoji: '☀️', 
    growthMultiplier: 1.2, 
    description: 'Perfect farming weather',
    diseaseChance: 0.01,
    stormChance: 0.0
  },
  rainy: { 
    name: 'Rainy', 
    emoji: '🌧️', 
    growthMultiplier: 1.1, 
    description: 'Good for growth but increases disease risk',
    diseaseChance: 0.03,
    stormChance: 0.05
  },
  cloudy: { 
    name: 'Cloudy', 
    emoji: '☁️', 
    growthMultiplier: 1.0, 
    description: 'Mild conditions',
    diseaseChance: 0.015,
    stormChance: 0.0
  },
  drought: { 
    name: 'Drought', 
    emoji: '🌵', 
    growthMultiplier: 0.7, 
    description: 'Crops struggle without irrigation',
    diseaseChance: 0.02,
    stormChance: 0.0
  },
  stormy: { 
    name: 'Stormy', 
    emoji: '⛈️', 
    growthMultiplier: 0.8, 
    description: 'Dangerous weather - crops may be damaged',
    diseaseChance: 0.05,
    stormChance: 0.15
  }
};

// Zone-specific weather patterns
const ZONE_WEATHER = {
  desert: {
    hot: { 
      name: 'Scorching Heat', 
      emoji: '🔥', 
      growthMultiplier: 0.6, 
      description: 'Extreme heat - only drought-resistant crops survive',
      diseaseChance: 0.01,
      stormChance: 0.0,
      zoneBonus: { droughtResistant: 1.3 }
    },
    sandstorm: { 
      name: 'Sandstorm', 
      emoji: '🌪️', 
      growthMultiplier: 0.5, 
      description: 'Fierce winds damage unprotected crops',
      diseaseChance: 0.02,
      stormChance: 0.3,
      zoneBonus: { droughtResistant: 1.0 }
    }
  },
  forest: {
    misty: { 
      name: 'Forest Mist', 
      emoji: '🌫️', 
      growthMultiplier: 1.2, 
      description: 'Perfect humidity for shade crops',
      diseaseChance: 0.04,
      stormChance: 0.0,
      zoneBonus: { shadeTolerant: 1.4 }
    },
    humid: { 
      name: 'Humid', 
      emoji: '💧', 
      growthMultiplier: 1.3, 
      description: 'High moisture perfect for forest plants',
      diseaseChance: 0.06,
      stormChance: 0.05,
      zoneBonus: { shadeTolerant: 1.3 }
    }
  },
  mountain: {
    cold: { 
      name: 'Mountain Cold', 
      emoji: '🥶', 
      growthMultiplier: 0.7, 
      description: 'Harsh cold - only hardy crops survive',
      diseaseChance: 0.01,
      stormChance: 0.05,
      zoneBonus: { coldResistant: 1.4 }
    },
    blizzard: { 
      name: 'Blizzard', 
      emoji: '❄️', 
      growthMultiplier: 0.3, 
      description: 'Severe snowstorm threatens all crops',
      diseaseChance: 0.01,
      stormChance: 0.4,
      zoneBonus: { coldResistant: 1.1 }
    }
  },
  coastal: {
    foggy: { 
      name: 'Sea Fog', 
      emoji: '🌊', 
      growthMultiplier: 1.1, 
      description: 'Moisture-rich fog benefits marine crops',
      diseaseChance: 0.03,
      stormChance: 0.0,
      zoneBonus: { saltTolerant: 1.3 }
    },
    salty: { 
      name: 'Salt Spray', 
      emoji: '🧂', 
      growthMultiplier: 0.8, 
      description: 'Salty conditions perfect for adapted crops',
      diseaseChance: 0.02,
      stormChance: 0.1,
      zoneBonus: { saltTolerant: 1.5 }
    }
  }
};

// Zone-specific livestock system
const ZONE_LIVESTOCK = {
  basic: {
    chicken: { 
      name: 'Chicken', 
      emoji: '🐔', 
      cost: 50, 
      product: 'eggs', 
      productEmoji: '🥚', 
      value: 8, 
      time: 30, 
      description: 'Basic farm chicken - reliable egg production'
    },
    cow: { 
      name: 'Cow', 
      emoji: '🐄', 
      cost: 200, 
      product: 'milk', 
      productEmoji: '🥛', 
      value: 15, 
      time: 45, 
      description: 'Traditional dairy cow - produces fresh milk'
    },
    pig: { 
      name: 'Pig', 
      emoji: '🐷', 
      cost: 120, 
      product: 'bacon', 
      productEmoji: '🥓', 
      value: 20, 
      time: 60, 
      description: 'Farm pig - high-value meat production'
    }
  },
  desert: {
    camel: { 
      name: 'Camel', 
      emoji: '🐪', 
      cost: 300, 
      product: 'camel_milk', 
      productEmoji: '🥛', 
      value: 25, 
      time: 50, 
      description: 'Desert camel - heat-resistant, nutrient-rich milk',
      adaptation: 'heat'
    },
    goat: { 
      name: 'Desert Goat', 
      emoji: '🐐', 
      cost: 150, 
      product: 'goat_cheese', 
      productEmoji: '🧀', 
      value: 18, 
      time: 40, 
      description: 'Hardy desert goat - produces artisan cheese',
      adaptation: 'heat'
    },
    lizard: { 
      name: 'Desert Lizard', 
      emoji: '🦎', 
      cost: 80, 
      product: 'scales', 
      productEmoji: '⚪', 
      value: 12, 
      time: 25, 
      description: 'Exotic desert lizard - scales used for crafting',
      adaptation: 'heat'
    }
  },
  forest: {
    boar: { 
      name: 'Wild Boar', 
      emoji: '🐗', 
      cost: 180, 
      product: 'truffle', 
      productEmoji: '🍄', 
      value: 30, 
      time: 70, 
      description: 'Forest boar - finds valuable truffles',
      adaptation: 'shade'
    },
    deer: { 
      name: 'Forest Deer', 
      emoji: '🦌', 
      cost: 250, 
      product: 'antler', 
      productEmoji: '🦴', 
      value: 22, 
      time: 80, 
      description: 'Majestic deer - antlers for medicine',
      adaptation: 'shade'
    },
    rabbit: { 
      name: 'Forest Rabbit', 
      emoji: '🐰', 
      cost: 60, 
      product: 'fur', 
      productEmoji: '🧶', 
      value: 10, 
      time: 20, 
      description: 'Quick forest rabbit - soft fur production',
      adaptation: 'shade'
    }
  },
  mountain: {
    yak: { 
      name: 'Mountain Yak', 
      emoji: '🐂', 
      cost: 400, 
      product: 'yak_wool', 
      productEmoji: '🧶', 
      value: 35, 
      time: 90, 
      description: 'Hardy yak - premium cold-weather wool',
      adaptation: 'cold'
    },
    goat_mountain: { 
      name: 'Mountain Goat', 
      emoji: '🐐', 
      cost: 220, 
      product: 'mountain_cheese', 
      productEmoji: '🧀', 
      value: 28, 
      time: 55, 
      description: 'Agile mountain goat - alpine cheese',
      adaptation: 'cold'
    },
    eagle: { 
      name: 'Mountain Eagle', 
      emoji: '🦅', 
      cost: 500, 
      product: 'feather', 
      productEmoji: '🪶', 
      value: 40, 
      time: 120, 
      description: 'Majestic eagle - rare flight feathers',
      adaptation: 'cold'
    }
  },
  coastal: {
    seagull: { 
      name: 'Seagull', 
      emoji: '🐦', 
      cost: 100, 
      product: 'sea_egg', 
      productEmoji: '🥚', 
      value: 12, 
      time: 35, 
      description: 'Coastal seagull - salt-enriched eggs',
      adaptation: 'salt'
    },
    crab: { 
      name: 'Shore Crab', 
      emoji: '🦀', 
      cost: 80, 
      product: 'shell', 
      productEmoji: '🐚', 
      value: 15, 
      time: 25, 
      description: 'Shore crab - decorative shells',
      adaptation: 'salt'
    },
    seal: { 
      name: 'Harbor Seal', 
      emoji: '🦭', 
      cost: 350, 
      product: 'blubber', 
      productEmoji: '⚪', 
      value: 32, 
      time: 100, 
      description: 'Harbor seal - valuable blubber oil',
      adaptation: 'salt'
    }
  }
};

// Zone-specific buildings with unique benefits and adaptations
const ZONE_BUILDINGS = {
  basic: {
    farmhouse: {
      name: 'Traditional Farmhouse',
      emoji: '🏠',
      cost: 2500,
      description: 'Classic farmhouse that increases crop storage capacity',
      benefits: ['Crop storage +50%', 'Faster plant growth +10%'],
      unlockLevel: 5
    },
    windmill: {
      name: 'Grain Windmill',
      emoji: '🏰',
      cost: 3500,
      description: 'Processes crops into higher-value products',
      benefits: ['Grain processing', 'Crop value +15%'],
      unlockLevel: 8
    }
  },
  desert: {
    oasisPump: {
      name: 'Oasis Water Pump',
      emoji: '💧',
      cost: 5000,
      description: 'Advanced irrigation system for desert farming',
      benefits: ['Heat resistance +40%', 'Water efficiency +60%'],
      unlockLevel: 6,
      requiredZone: 'desert'
    },
    solarArray: {
      name: 'Solar Energy Array',
      emoji: '☀️',
      cost: 8000,
      description: 'Harnesses desert sun for energy production',
      benefits: ['Generates passive income', 'Powers other buildings'],
      unlockLevel: 10,
      requiredZone: 'desert'
    },
    dune_shelter: {
      name: 'Sandstorm Shelter',
      emoji: '🏚️',
      cost: 6500,
      description: 'Protects crops and livestock from sandstorms',
      benefits: ['Storm protection 80%', 'Livestock safety +90%'],
      unlockLevel: 12,
      requiredZone: 'desert'
    }
  },
  forest: {
    treehouse: {
      name: 'Canopy Treehouse',
      emoji: '🌳',
      cost: 4500,
      description: 'Elevated storage and wildlife observation post',
      benefits: ['Forest animal bonus +25%', 'Mushroom growth +40%'],
      unlockLevel: 9,
      requiredZone: 'forest'
    },
    lumberMill: {
      name: 'Forest Lumber Mill',
      emoji: '🪚',
      cost: 7500,
      description: 'Processes wood and forest products',
      benefits: ['Wood production', 'Building cost -20%'],
      unlockLevel: 11,
      requiredZone: 'forest'
    },
    wildlifeCenter: {
      name: 'Wildlife Research Center',
      emoji: '🦉',
      cost: 9000,
      description: 'Studies forest ecosystems and improves wildlife yield',
      benefits: ['Rare animal encounters +50%', 'Research speed +30%'],
      unlockLevel: 13,
      requiredZone: 'forest'
    }
  },
  mountain: {
    miningShaft: {
      name: 'Mountain Mining Shaft',
      emoji: '⛏️',
      cost: 10000,
      description: 'Extracts valuable minerals from mountain terrain',
      benefits: ['Mineral extraction', 'Cold resistance +50%'],
      unlockLevel: 13,
      requiredZone: 'mountain'
    },
    cableway: {
      name: 'Alpine Cableway',
      emoji: '🚠',
      cost: 12000,
      description: 'Transport system for mountain zones',
      benefits: ['Transport speed +60%', 'Resource movement +40%'],
      unlockLevel: 15,
      requiredZone: 'mountain'
    },
    observatory: {
      name: 'Weather Observatory',
      emoji: '🔭',
      cost: 8500,
      description: 'Predicts weather and prevents avalanches',
      benefits: ['Weather prediction', 'Disaster warning +3 hours'],
      unlockLevel: 14,
      requiredZone: 'mountain'
    }
  },
  coastal: {
    lighthouse: {
      name: 'Coastal Lighthouse',
      emoji: '🗼',
      cost: 7000,
      description: 'Guides fishing boats and sea trade vessels',
      benefits: ['Maritime trade +40%', 'Sea product bonus +25%'],
      unlockLevel: 16,
      requiredZone: 'coastal'
    },
    seaweedFarm: {
      name: 'Kelp Cultivation Farm',
      emoji: '🌊',
      cost: 9500,
      description: 'Underwater farming for marine plants',
      benefits: ['Seaweed production', 'Salt water purification'],
      unlockLevel: 17,
      requiredZone: 'coastal'
    },
    harborPier: {
      name: 'Deep Water Harbor',
      emoji: '⚓',
      cost: 15000,
      description: 'Major shipping hub for inter-zone trade',
      benefits: ['Trade route efficiency +50%', 'International markets'],
      unlockLevel: 18,
      requiredZone: 'coastal'
    }
  }
};

// Advanced Automation Systems
const AUTOMATION_SYSTEMS = {
  cropAutomation: {
    name: 'Crop Automation System',
    emoji: '🤖',
    description: 'Automatically plants, waters, and harvests crops',
    cost: 50000,
    unlockLevel: 20,
    benefits: [
      'Auto-plant seeds when plots are empty',
      'Auto-water crops every cycle',
      'Auto-harvest ready crops',
      'Optimizes crop rotation'
    ],
    maintenance: 100, // Cost per hour
    efficiency: 85 // % efficiency vs manual
  },
  livestockAutomation: {
    name: 'Livestock Management AI',
    emoji: '🐄',
    description: 'AI-powered livestock care and production optimization',
    cost: 35000,
    unlockLevel: 18,
    benefits: [
      'Auto-feed livestock when hungry',
      'Auto-collect products when ready',
      'Health monitoring and care',
      'Breeding optimization'
    ],
    maintenance: 75,
    efficiency: 90
  },
  weatherAutomation: {
    name: 'Smart Weather Response',
    emoji: '⛈️',
    description: 'Automated weather disaster preparation and response',
    cost: 40000,
    unlockLevel: 22,
    benefits: [
      'Auto-prepare for incoming disasters',
      'Livestock shelter management',
      'Resource protection protocols',
      'Emergency response systems'
    ],
    maintenance: 80,
    efficiency: 95
  },
  tradeAutomation: {
    name: 'Autonomous Trade Network',
    emoji: '🚛',
    description: 'Automated inter-zone trading and resource optimization',
    cost: 60000,
    unlockLevel: 25,
    benefits: [
      'Auto-trade excess resources',
      'Market price optimization',
      'Route efficiency planning',
      'Supply chain management'
    ],
    maintenance: 120,
    efficiency: 88
  },
  masterAutomation: {
    name: 'Quantum Farm Controller',
    emoji: '🧠',
    description: 'Ultimate AI system that manages entire farm ecosystem',
    cost: 100000,
    unlockLevel: 30,
    benefits: [
      'All automation systems integrated',
      'Predictive farming analytics',
      'Multi-zone optimization',
      'Profit maximization algorithms'
    ],
    maintenance: 200,
    efficiency: 98
  }
};

// Dynamic weather events and disasters
const WEATHER_EVENTS = {
  desert: {
    sandstorm: {
      name: 'Massive Sandstorm',
      emoji: '🌪️',
      probability: 0.02, // 2% chance per weather cycle
      duration: 3, // weather cycles
      effects: {
        cropDamage: 0.4, // 40% damage to unprotected crops
        animalStress: 0.2, // 20% stress to animals
        buildingDamage: 0.1, // 10% building damage
        bonus: { glass: 5 } // produces glass from sand
      },
      description: 'Fierce sandstorm damages crops but creates valuable glass'
    },
    heatwave: {
      name: 'Extreme Heatwave',
      emoji: '🔥',
      probability: 0.03,
      duration: 2,
      effects: {
        cropWilt: 0.3,
        waterConsumption: 2.0, // double water usage
        animalStress: 0.3,
        bonus: { solarEnergy: 10 }
      },
      description: 'Scorching heat wilts crops but generates solar energy'
    }
  },
  forest: {
    wildfire: {
      name: 'Forest Fire',
      emoji: '🔥',
      probability: 0.015,
      duration: 2,
      effects: {
        cropDestruction: 0.6, // destroys crops
        animalFlee: 0.4, // animals temporarily leave
        bonus: { ash: 15, charcoal: 5 } // fertile ash and charcoal
      },
      description: 'Devastating fire destroys crops but creates fertile ash'
    },
    fog: {
      name: 'Dense Fog',
      emoji: '🌫️',
      probability: 0.04,
      duration: 1,
      effects: {
        visibility: 0.5, // reduces efficiency
        moistureBonus: 1.3, // increases growth
        mushoomBoost: 2.0 // mushrooms love fog
      },
      description: 'Thick fog slows work but boosts moisture-loving crops'
    }
  },
  mountain: {
    avalanche: {
      name: 'Avalanche',
      emoji: '❄️',
      probability: 0.01,
      duration: 1,
      effects: {
        areaDestruction: 0.8, // destroys everything in path
        snowDeposit: 20, // leaves snow for water
        roadBlocking: 3 // blocks transport for 3 cycles
      },
      description: 'Destructive avalanche but provides water reserves'
    },
    blizzard: {
      name: 'Severe Blizzard',
      emoji: '🌨️',
      probability: 0.025,
      duration: 3,
      effects: {
        animalShelter: 0.5, // animals need shelter
        cropFreeze: 0.4,
        iceHarvest: 10 // can harvest ice
      },
      description: 'Harsh blizzard freezes crops but enables ice harvesting'
    }
  },
  coastal: {
    hurricane: {
      name: 'Hurricane',
      emoji: '🌀',
      probability: 0.015,
      duration: 2,
      effects: {
        massiveDestruction: 0.7,
        flooding: 0.5,
        bonus: { rareSeed: 3, driftwood: 8 } // brings rare items
      },
      description: 'Devastating hurricane brings destruction and rare treasures'
    },
    tsunami: {
      name: 'Tsunami Wave',
      emoji: '🌊',
      probability: 0.005,
      duration: 1,
      effects: {
        totalFlood: 0.9, // floods everything
        saltDeposit: 25, // leaves salt deposits
        seaweedBonus: 15 // washes up seaweed
      },
      description: 'Catastrophic wave floods land but deposits valuable resources'
    }
  }
};

// Genetic traits for crops
const GENETIC_TRAITS = {
  diseaseResistance: {
    name: 'Disease Resistance',
    emoji: '🛡️',
    description: 'Reduces disease susceptibility',
    levels: { bronze: 0.8, silver: 0.6, gold: 0.4, platinum: 0.2 }
  },
  fastGrowth: {
    name: 'Fast Growth',
    emoji: '⚡',
    description: 'Reduces growth time',
    levels: { bronze: 0.9, silver: 0.8, gold: 0.7, platinum: 0.6 }
  },
  highYield: {
    name: 'High Yield',
    emoji: '💰',
    description: 'Increases crop value',
    levels: { bronze: 1.2, silver: 1.4, gold: 1.6, platinum: 2.0 }
  },
  weatherResistance: {
    name: 'Weather Resistance',
    emoji: '🌪️',
    description: 'Reduces weather damage',
    levels: { bronze: 0.8, silver: 0.6, gold: 0.4, platinum: 0.2 }
  },
  droughtTolerance: {
    name: 'Drought Tolerance',
    emoji: '�️',
    description: 'Survives without irrigation',
    levels: { bronze: 0.9, silver: 1.0, gold: 1.1, platinum: 1.2 }
  }
};

// Seed quality levels
const SEED_QUALITIES = {
  bronze: { name: 'Bronze', emoji: '🥉', color: 'text-amber-600', multiplier: 1.0, traits: 1 },
  silver: { name: 'Silver', emoji: '🥈', color: 'text-gray-500', multiplier: 1.3, traits: 2 },
  gold: { name: 'Gold', emoji: '🥇', color: 'text-yellow-500', multiplier: 1.6, traits: 3 },
  platinum: { name: 'Platinum', emoji: '💎', color: 'text-purple-600', multiplier: 2.0, traits: 4 }
};

// Hybrid crop combinations
const HYBRID_COMBINATIONS = {
  'wheat+corn': { 
    result: 'wheatcorn', 
    name: 'Wheat-Corn Hybrid', 
    emoji: '🌾🌽', 
    baseValue: 80,
    growTime: 45,
    traits: ['fastGrowth', 'highYield']
  },
  'tomato+carrot': { 
    result: 'tomatocarrot', 
    name: 'Tomato-Carrot Hybrid', 
    emoji: '🍅🥕', 
    baseValue: 120,
    growTime: 50,
    traits: ['diseaseResistance', 'weatherResistance']
  },
  'corn+tomato': { 
    result: 'corntomato', 
    name: 'Corn-Tomato Hybrid', 
    emoji: '🌽🍅', 
    baseValue: 100,
    growTime: 40,
    traits: ['highYield', 'droughtTolerance']
  }
};

// Livestock data
const LIVESTOCK = {
  chicken: { name: 'Chicken', emoji: '🐔', cost: 150, income: 8, interval: 20, food: 'grain', housing: 'coop' },
  cow: { name: 'Cow', emoji: '🐄', cost: 500, income: 25, interval: 45, food: 'hay', housing: 'barn' },
  pig: { name: 'Pig', emoji: '🐷', cost: 300, income: 15, interval: 30, food: 'corn', housing: 'pen' },
  sheep: { name: 'Sheep', emoji: '🐑', cost: 400, income: 20, interval: 35, food: 'grass', housing: 'pasture' },
  goat: { name: 'Goat', emoji: '🐐', cost: 350, income: 18, interval: 25, food: 'hay', housing: 'pen' }
};

// Buildings data
const BUILDINGS = {
  coop: { name: 'Chicken Coop', emoji: '🏠', cost: 800, capacity: 6, animals: ['chicken'], description: 'Houses up to 6 chickens' },
  barn: { name: 'Cow Barn', emoji: '🏚️', cost: 2000, capacity: 4, animals: ['cow'], description: 'Houses up to 4 cows' },
  pen: { name: 'Animal Pen', emoji: '🏭', cost: 1200, capacity: 5, animals: ['pig', 'goat'], description: 'Houses pigs and goats' },
  pasture: { name: 'Sheep Pasture', emoji: '🌾', cost: 1500, capacity: 8, animals: ['sheep'], description: 'Large pasture for sheep' },
  silo: { name: 'Feed Silo', emoji: '🏗️', cost: 1000, capacity: 100, animals: [], description: 'Stores animal feed' },
  greenhouse: { name: 'Greenhouse', emoji: '🏡', cost: 3000, capacity: 0, animals: [], description: 'Protected crop growing' },
  // Advanced buildings
  advancedGreenhouse: {
    name: 'Advanced Greenhouse',
    emoji: '🏠',
    cost: 5000,
    capacity: 0,
    animals: [],
    description: 'Complete weather protection, +30% growth rate, disease immunity'
  },
  irrigationSystem: {
    name: 'Irrigation System',
    emoji: '💧',
    cost: 2500,
    capacity: 0,
    animals: [],
    description: 'Auto-watering, drought immunity, +15% growth in dry weather'
  },
  breedingLab: {
    name: 'Breeding Laboratory',
    emoji: '🧬',
    cost: 4000,
    capacity: 0,
    animals: [],
    description: 'Research hybrid crops and enhance seed genetics'
  },
  weatherStation: {
    name: 'Weather Station',
    emoji: '📡',
    cost: 1500,
    capacity: 0,
    animals: [],
    description: 'Weather forecast, storm alerts, +10% weather resistance'
  },
  seedProcessor: {
    name: 'Seed Processor',
    emoji: '⚙️',
    cost: 3500,
    capacity: 0,
    animals: [],
    description: 'Upgrade seed quality and modify genetic traits'
  }
};

// Crop diseases
const DISEASES = {
  blight: { name: 'Crop Blight', emoji: '🦠', treatment: 'fungicide', damage: 0.5, description: 'Reduces crop value by 50%' },
  pest: { name: 'Pest Infestation', emoji: '🐛', treatment: 'pesticide', damage: 0.3, description: 'Slows growth by 30%' },
  drought: { name: 'Crop Stress', emoji: '🌵', treatment: 'fertilizer', damage: 0.2, description: 'Stunts growth' }
};

// Seasonal events
const SEASONS = {
  spring: { name: 'Spring Festival', emoji: '🌸', bonus: 1.2, specialCrop: 'tulip', description: 'All crops 20% more valuable!' },
  summer: { name: 'Summer Heat', emoji: '☀️', bonus: 1.0, specialCrop: 'sunflower', description: 'Perfect growing weather' },
  autumn: { name: 'Harvest Festival', emoji: '🍂', bonus: 1.5, specialCrop: 'pumpkin', description: 'Harvest bonuses active!' },
  winter: { name: 'Winter Market', emoji: '❄️', bonus: 0.8, specialCrop: 'pine', description: 'Slower growth, special crops available' }
};

// Special crops for events
const SPECIAL_CROPS = {
  tulip: { name: 'Tulip', emoji: '🌷', cost: 30, value: 80, growTime: 40, seasonal: 'spring' },
  sunflower: { name: 'Sunflower', emoji: '🌻', cost: 35, value: 90, growTime: 50, seasonal: 'summer' },
  pumpkin: { name: 'Pumpkin', emoji: '🎃', cost: 40, value: 120, growTime: 90, seasonal: 'autumn' },
  pine: { name: 'Pine Tree', emoji: '🌲', cost: 50, value: 150, growTime: 120, seasonal: 'winter' }
};

// Contracts system
const CONTRACT_TEMPLATES = [
  { crop: 'wheat', quantity: 10, bonus: 1.5, time: 300, client: 'Local Bakery' },
  { crop: 'carrot', quantity: 8, bonus: 1.3, time: 240, client: 'Restaurant Chain' },
  { crop: 'tomato', quantity: 5, bonus: 1.4, time: 180, client: 'Farmer\'s Market' },
  { crop: 'corn', quantity: 12, bonus: 1.6, time: 360, client: 'Food Processing Co.' }
];

// Shop items
const SHOP_ITEMS = {
  tools: {
    wateringCan: { name: 'Watering Can', emoji: '🪣', cost: 200, description: 'Water crops for +0.3x quality boost' },
    fertilizer: { name: 'Premium Fertilizer', emoji: '🌿', cost: 350, description: 'Fertilize crops for +0.5x quality boost' },
    harvester: { name: 'Auto Harvester', emoji: '🤖', cost: 1500, description: 'Automatically harvests ready crops' },
    sprinkler: { name: 'Sprinkler System', emoji: '💦', cost: 1200, description: 'Auto-waters all crops' },
    fungicide: { name: 'Fungicide', emoji: '🧪', cost: 100, description: 'Treats crop blight' },
    pesticide: { name: 'Pesticide', emoji: '🦟', cost: 80, description: 'Eliminates pests' }
  },
  feed: {
    grain: { name: 'Grain Feed', emoji: '🌾', cost: 20, description: 'Feed for chickens (x10 portions)' },
    hay: { name: 'Hay Bales', emoji: '🟫', cost: 30, description: 'Feed for cows and goats (x10 portions)' },
    corn: { name: 'Corn Feed', emoji: '🌽', cost: 25, description: 'Feed for pigs (x10 portions)' },
    grass: { name: 'Grass Pellets', emoji: '🟢', cost: 15, description: 'Feed for sheep (x10 portions)' }
  },
  seeds: {
    wheatBulk: { name: 'Wheat Seeds (Bulk)', emoji: '🌾', cost: 80, description: 'Get 20 wheat seeds' },
    carrotBulk: { name: 'Carrot Seeds (Bulk)', emoji: '🥕', cost: 120, description: 'Get 20 carrot seeds' },
    tomatoBulk: { name: 'Tomato Seeds (Bulk)', emoji: '🍅', cost: 160, description: 'Get 20 tomato seeds' },
    cornBulk: { name: 'Corn Seeds (Bulk)', emoji: '🌽', cost: 200, description: 'Get 20 corn seeds' }
  }
};

// Research tree
const RESEARCH = {
  irrigation: { name: 'Irrigation System', cost: 5, description: 'Crops grow 20% faster', unlocked: false },
  greenhouse: { name: 'Greenhouse', cost: 8, description: 'Weather has no effect', unlocked: false },
  automation: { name: 'Auto-Harvest', cost: 12, description: 'Crops auto-harvest when ready', unlocked: false },
  genetics: { name: 'Crop Genetics', cost: 15, description: 'All crops worth 50% more', unlocked: false }
};

// Achievements
const ACHIEVEMENTS = {
  firstHarvest: { name: 'First Harvest', description: 'Harvest your first crop', reward: 50, unlocked: false },
  bigSpender: { name: 'Big Spender', description: 'Spend $500 total', reward: 100, unlocked: false },
  levelFive: { name: 'Experienced Farmer', description: 'Reach level 5', reward: 200, unlocked: false },
  levelTen: { name: 'Master Farmer', description: 'Reach level 10', reward: 500, unlocked: false },
  hundredHarvests: { name: 'Master Harvester', description: 'Complete 100 harvests', reward: 500, unlocked: false },
  millionaire: { name: 'Millionaire', description: 'Earn $1000 total', reward: 1000, unlocked: false },
  animalLover: { name: 'Animal Lover', description: 'Own 5 animals', reward: 300, unlocked: false },
  rancher: { name: 'Rancher', description: 'Own 10 animals', reward: 600, unlocked: false },
  architect: { name: 'Architect', description: 'Build 3 different buildings', reward: 400, unlocked: false },
  researcher: { name: 'Researcher', description: 'Unlock all research', reward: 800, unlocked: false },
  tycoon: { name: 'Farm Tycoon', description: 'Have $5000 at once', reward: 2000, unlocked: false },
  
  // Zone-specific achievements
  desertExplorer: { name: 'Desert Explorer', description: 'Unlock the Desert Oasis', reward: 500, unlocked: false },
  forestRanger: { name: 'Forest Ranger', description: 'Unlock the Forest Grove', reward: 750, unlocked: false },
  mountaineer: { name: 'Mountaineer', description: 'Unlock the Mountain Terrace', reward: 1000, unlocked: false },
  coastalFarmer: { name: 'Coastal Farmer', description: 'Unlock the Coastal Farm', reward: 1500, unlocked: false },
  globalFarmer: { name: 'Global Farmer', description: 'Unlock all farming zones', reward: 3000, unlocked: false },
  specialistGrower: { name: 'Specialist Grower', description: 'Harvest 10 zone-specific crops', reward: 1000, unlocked: false },
  zoneExpert: { name: 'Zone Expert', description: 'Plant in all 5 zones', reward: 800, unlocked: false }
};

// Farm visitors/NPCs
const VISITORS = [
  { name: 'Merchant Tom', emoji: '👨‍💼', offer: 'buysCrops', bonus: 1.2, description: 'Buys crops at 20% premium' },
  { name: 'Seed Sally', emoji: '👩‍🌾', offer: 'sellsSeeds', bonus: 0.8, description: 'Sells seeds at 20% discount' },
  { name: 'Tool Trader', emoji: '🔧', offer: 'sellsTools', bonus: 0.9, description: 'Discounted tools and supplies' },
  { name: 'Quest Giver', emoji: '📜', offer: 'givesQuest', bonus: 2.0, description: 'Special delivery missions' }
];

// Tutorial steps
const TUTORIAL_STEPS = [
  { 
    title: "Welcome to Your Farm!", 
    content: "Let's start by planting your first crop. Click on an empty plot and select a crop to plant.",
    highlight: "plots",
    action: "plant"
  },
  { 
    title: "Water Your Crops", 
    content: "Click the watering can and then click your planted crop to help it grow faster.",
    highlight: "water",
    action: "water" 
  },
  { 
    title: "Wait and Harvest", 
    content: "Watch your crop grow! When it's ready, click to harvest and earn money.",
    highlight: "harvest",
    action: "harvest"
  },
  { 
    title: "Genetic Breeding", 
    content: "Visit the Genetics tab to crossbreed different crops and create superior hybrid varieties!",
    highlight: "genetics",
    action: "genetics"
  },
  { 
    title: "Weather & Buildings", 
    content: "Check the weather forecast and build greenhouses to protect your crops from storms.",
    highlight: "weather",
    action: "build"
  },
  { 
    title: "You're Ready!", 
    content: "Master farmer! You now know the basics. Explore all the features and build your agricultural empire!",
    highlight: "complete",
    action: "complete"
  }
];

// Processing plants for value-added agriculture
const PROCESSING_PLANTS = {
  mill: {
    name: 'Grain Mill',
    emoji: '🏭',
    cost: 2000,
    description: 'Process wheat into flour (+50% value)',
    inputs: ['wheat'],
    outputs: { flour: { multiplier: 1.5, time: 10 } },
    unlocked: false
  },
  juicer: {
    name: 'Juice Factory',
    emoji: '🧃',
    cost: 2500,
    description: 'Turn tomatoes into juice (+60% value)',
    inputs: ['tomato'],
    outputs: { juice: { multiplier: 1.6, time: 15 } },
    unlocked: false
  },
  distillery: {
    name: 'Corn Distillery', 
    emoji: '🥃',
    cost: 3000,
    description: 'Distill corn into ethanol (+80% value)',
    inputs: ['corn'],
    outputs: { ethanol: { multiplier: 1.8, time: 20 } },
    unlocked: false
  },
  preservery: {
    name: 'Preserving Plant',
    emoji: '🥫', 
    cost: 2200,
    description: 'Preserve carrots (+40% value)',
    inputs: ['carrot'],
    outputs: { preserves: { multiplier: 1.4, time: 12 } },
    unlocked: false
  }
};

// Farm zones for expansion
const ZONE_TYPES = {
  basic: { 
    name: 'Basic Farm', 
    cost: 0, 
    plots: 9, 
    unlocked: true,
    emoji: '🌱',
    description: 'Traditional farming zone suitable for common crops',
    climate: 'temperate',
    specialBonus: 'Balanced growth for all basic crops'
  },
  desert: { 
    name: 'Desert Oasis', 
    cost: 5000, 
    plots: 9, 
    unlocked: false,
    emoji: '🏜️',
    description: 'Arid zone perfect for drought-resistant plants',
    climate: 'arid',
    specialCrops: ['cactus', 'dates', 'agave'],
    weatherTypes: ['sunny', 'hot', 'sandstorm'],
    specialBonus: 'Drought-resistant crops grow 30% faster'
  },
  forest: { 
    name: 'Forest Grove', 
    cost: 4000, 
    plots: 9, 
    unlocked: false,
    emoji: '🌲',
    description: 'Shaded woodland area for shade-loving crops',
    climate: 'humid',
    specialCrops: ['mushroom', 'berries', 'herbs'],
    weatherTypes: ['rainy', 'misty', 'cloudy'],
    specialBonus: 'Shade crops immune to sun damage'
  },
  mountain: { 
    name: 'Mountain Terrace', 
    cost: 6000, 
    plots: 6, 
    unlocked: false,
    emoji: '⛰️',
    description: 'High-altitude terraces for cold-weather crops',
    climate: 'alpine',
    specialCrops: ['alpine', 'potato', 'cabbage'],
    weatherTypes: ['snow', 'windy', 'cold'],
    specialBonus: 'Cold-resistant crops have higher quality'
  },
  coastal: {
    name: 'Coastal Farm',
    cost: 4500,
    plots: 9,
    unlocked: false,
    emoji: '🌊',
    description: 'Salt-air farm zone for marine agriculture',
    climate: 'maritime',
    specialCrops: ['seaweed', 'saltherbs', 'kelp'],
    weatherTypes: ['foggy', 'windy', 'salty'],
    specialBonus: 'Salt-tolerant crops worth 25% more'
  }
};

// Hotkey mappings
const HOTKEYS = {
  'Space': 'Harvest all ready crops',
  'w': 'Water selected plots', 
  'f': 'Fertilize selected plots',
  'h': 'Show/hide hotkey help',
  's': 'Save game',
  'b': 'Toggle bulk selection mode',
  'Escape': 'Clear selection',
  '1-4': 'Select crop type (1=wheat, 2=carrot, 3=tomato, 4=corn)',
  'g': 'Go to Genetics tab',
  'Tab': 'Switch between farm zones'
};

export default function SimpleFarmGame() {
  // Core game state
  const [money, setMoney] = useState(100);
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [gameTime, setGameTime] = useState(0);
  const [totalHarvests, setTotalHarvests] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [researchPoints, setResearchPoints] = useState(0);
  
  // Weather and notifications
  const [currentWeather, setCurrentWeather] = useState('sunny');
  const [notifications, setNotifications] = useState([]);
  
  // Farm features
  const [farmSize, setFarmSize] = useState(3);
  const [hasWateringCan, setHasWateringCan] = useState(false);
  const [hasFertilizer, setHasFertilizer] = useState(false);
  
  // New feature states
  const [livestock, setLivestock] = useState({});
  const [buildings, setBuildings] = useState({});
  const [feed, setFeed] = useState({ grain: 0, hay: 0, corn: 0, grass: 0 });
  const [tools, setTools] = useState({ 
    wateringCan: false, 
    fertilizer: false, 
    harvester: false, 
    sprinkler: false
  });
  const [research, setResearch] = useState(RESEARCH);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [activeTab, setActiveTab] = useState('farm');
  const [shopCategory, setShopCategory] = useState('tools');
  
  // Enhanced features
  const [currentSeason, setCurrentSeason] = useState('spring');
  const [seasonTimeLeft, setSeasonTimeLeft] = useState(300); // 5 minutes per season
  const [marketPrices, setMarketPrices] = useState({
    wheat: 1.0, carrot: 1.0, tomato: 1.0, corn: 1.0
  });
  const [activeContracts, setActiveContracts] = useState([]);
  const [completedContracts, setCompletedContracts] = useState([]);
  const [currentVisitor, setCurrentVisitor] = useState(null);
  const [visitorTimeLeft, setVisitorTimeLeft] = useState(0);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState({});
  const [specialSeeds, setSpecialSeeds] = useState({
    tulip: 0, sunflower: 0, pumpkin: 0, pine: 0
  });
  
  // Advanced breeding system
  const [seedQualities, setSeedQualities] = useState({
    wheat: 'bronze', carrot: 'bronze', tomato: 'bronze', corn: 'bronze'
  });
  const [hybridSeeds, setHybridSeeds] = useState({});
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [stormDamage, setStormDamage] = useState({});
  const [protectedPlots, setProtectedPlots] = useState(new Set());
  const [irrigatedPlots, setIrrigatedPlots] = useState(new Set());
  
  // Consumable items inventory
  const [inventory, setInventory] = useState({
    fungicide: 0,
    pesticide: 0
  });
  
  // Quality of Life Features
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedPlots, setSelectedPlots] = useState(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showHotkeyHelp, setShowHotkeyHelp] = useState(false);
  const [farmZones, setFarmZones] = useState([
    { id: 0, name: 'Main Farm', type: 'basic', unlocked: true, plots: Array.from({length: 9}, (_, i) => i) }
  ]);
  const [activeZone, setActiveZone] = useState(0);
  const [processingPlants, setProcessingPlants] = useState({});
  
  // Multi-zone expansion states
  const [currentZone, setCurrentZone] = useState('basic');
  const [zoneData, setZoneData] = useState({
    basic: {
      unlocked: true,
      crops: {},
      weather: 'sunny',
      lastWeatherChange: Date.now(),
      resources: { fertilizer: 5, seeds: 10 }
    },
    desert: {
      unlocked: false,
      crops: {},
      weather: 'hot',
      lastWeatherChange: Date.now(),
      resources: { fertilizer: 0, seeds: 0 }
    },
    forest: {
      unlocked: false,
      crops: {},
      weather: 'misty',
      lastWeatherChange: Date.now(),
      resources: { fertilizer: 0, seeds: 0 }
    },
    mountain: {
      unlocked: false,
      crops: {},
      weather: 'cold',
      lastWeatherChange: Date.now(),
      resources: { fertilizer: 0, seeds: 0 }
    },
    coastal: {
      unlocked: false,
      crops: {},
      weather: 'foggy',
      lastWeatherChange: Date.now(),
      resources: { fertilizer: 0, seeds: 0 }
    }
  });
  const [transportCooldown, setTransportCooldown] = useState(0);
  
  // Zone livestock system
  const [zoneLivestock, setZoneLivestock] = useState({
    basic: {},
    desert: {},
    forest: {},
    mountain: {},
    coastal: {}
  });
  const [livestockProducts, setLivestockProducts] = useState({});
  
  // Weather events and disasters
  const [activeWeatherEvents, setActiveWeatherEvents] = useState({});
  const [weatherEventHistory, setWeatherEventHistory] = useState([]);
  const [disasterResources, setDisasterResources] = useState({
    glass: 0, ash: 0, charcoal: 0, ice: 0, salt: 0, 
    driftwood: 0, rareSeed: 0, seaweed: 0
  });
  
  // Zone mastery system
  const [zoneMastery, setZoneMastery] = useState({
    basic: { level: 1, xp: 0, perks: [] },
    desert: { level: 0, xp: 0, perks: [] },
    forest: { level: 0, xp: 0, perks: [] },
    mountain: { level: 0, xp: 0, perks: [] },
    coastal: { level: 0, xp: 0, perks: [] }
  });
  
  // Zone-specific buildings
  const [zoneBuildings, setZoneBuildings] = useState({
    basic: {},
    desert: {},
    forest: {},
    mountain: {},
    coastal: {}
  });
  
  // Advanced automation systems
  const [automationSystems, setAutomationSystems] = useState({});
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [automationFunds, setAutomationFunds] = useState(1000); // Separate fund for automation maintenance
  
  // Market and Processing Systems
  const [marketSystem] = useState(() => new MarketSystem());
  const [processingSystem] = useState(() => new ProcessingSystem());
  const [marketPricesHistory, setMarketPricesHistory] = useState({});
  const [activeMarketEvents, setActiveMarketEvents] = useState([]);
  const [processingInventory, setProcessingInventory] = useState({});
  const [activeFacilities, setActiveFacilities] = useState({});
  
  // Bot Automation System
  const [aiFarmingSystem] = useState(() => new AIFarmingSystem());
  const [activeBots, setActiveBots] = useState({});
  const [aiEnergy, setAiEnergy] = useState(100);
  const [aiDecisions, setAiDecisions] = useState([]);
  
  const [animations, setAnimations] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Seed inventory
  const [seeds, setSeeds] = useState(() => {
    const initialSeeds = {};
    // Initialize all crops with 0 seeds, give starter seeds only for basic crops
    Object.keys(ALL_CROPS).forEach(cropType => {
      if (['wheat', 'carrot', 'tomato', 'corn'].includes(cropType)) {
        initialSeeds[cropType] = cropType === 'wheat' ? 5 : cropType === 'carrot' ? 2 : cropType === 'tomato' ? 1 : 0;
      } else {
        initialSeeds[cropType] = 0;
      }
    });
    return initialSeeds;
  });

  // Farm plots
  const [plots, setPlots] = useState(() => {
    const initial = {};
    for (let i = 0; i < 9; i++) {
      initial[i] = {
        state: 'empty',
        crop: null,
        plantedAt: 0,
        progress: 0,
        watered: false,
        fertilized: false,
        quality: 1.0,
        seedQuality: 'bronze',
        traits: [],
        weatherDamage: 0,
        diseaseResistance: 1.0
      };
    }
    return initial;
  });

  // Save/Load System
  const saveGame = () => {
    const gameState = {
      money, selectedCrop, gameTime, totalHarvests, totalEarned, totalSpent,
      experience, level, researchPoints, currentWeather, farmSize,
      hasWateringCan, hasFertilizer, livestock, buildings, feed, tools,
      research, achievements, seeds, plots, currentSeason, seasonTimeLeft,
      marketPrices, activeContracts, completedContracts, diseaseOutbreaks, specialSeeds,
      seedQualities, hybridSeeds, weatherForecast, stormDamage, protectedPlots: Array.from(protectedPlots), 
      irrigatedPlots: Array.from(irrigatedPlots), inventory, tutorialStep, showTutorial, 
      farmZones, activeZone, processingPlants, view3D, animations, autoSaveEnabled, soundEnabled
    };
    
    try {
      localStorage.setItem('farmLifeSave', JSON.stringify(gameState));
      addNotification('💾 Game saved successfully!', 'success');
      
      // Play save sound
      if (soundEnabled) {
        soundManager.playSuccess();
      }
    } catch (error) {
      addNotification('❌ Failed to save game', 'error');
      if (soundEnabled) {
        soundManager.playError();
      }
    }
  };

  const loadGame = () => {
    try {
      const savedGame = localStorage.getItem('farmLifeSave');
      if (savedGame) {
        const gameState = JSON.parse(savedGame);
        
        // Load all state
        setMoney(gameState.money || 100);
        setSelectedCrop(gameState.selectedCrop || 'wheat');
        setGameTime(gameState.gameTime || 0);
        setTotalHarvests(gameState.totalHarvests || 0);
        setTotalEarned(gameState.totalEarned || 0);
        setTotalSpent(gameState.totalSpent || 0);
        setExperience(gameState.experience || 0);
        setLevel(gameState.level || 1);
        setResearchPoints(gameState.researchPoints || 0);
        setCurrentWeather(gameState.currentWeather || 'sunny');
        setFarmSize(gameState.farmSize || 3);
        setHasWateringCan(gameState.hasWateringCan || false);
        setHasFertilizer(gameState.hasFertilizer || false);
        setLivestock(gameState.livestock || {});
        setBuildings(gameState.buildings || {});
        setFeed(gameState.feed || { grain: 0, hay: 0, corn: 0, grass: 0 });
        setTools(gameState.tools || { wateringCan: false, fertilizer: false, harvester: false, sprinkler: false });
        setResearch(gameState.research || RESEARCH);
        setAchievements(gameState.achievements || ACHIEVEMENTS);
        setSeeds(gameState.seeds || { wheat: 5, carrot: 2, tomato: 1, corn: 0 });
        setPlots(gameState.plots || (() => {
          const initial = {};
          for (let i = 0; i < 9; i++) {
            initial[i] = { state: 'empty', crop: null, plantedAt: 0, progress: 0, watered: false, fertilized: false, quality: 1.0 };
          }
          return initial;
        })());
        setCurrentSeason(gameState.currentSeason || 'spring');
        setSeasonTimeLeft(gameState.seasonTimeLeft || 300);
        setMarketPrices(gameState.marketPrices || { wheat: 1.0, carrot: 1.0, tomato: 1.0, corn: 1.0 });
        setActiveContracts(gameState.activeContracts || []);
        setCompletedContracts(gameState.completedContracts || []);
        setDiseaseOutbreaks(gameState.diseaseOutbreaks || {});
        setSpecialSeeds(gameState.specialSeeds || { tulip: 0, sunflower: 0, pumpkin: 0, pine: 0 });
        setSeedQualities(gameState.seedQualities || { wheat: 'bronze', carrot: 'bronze', tomato: 'bronze', corn: 'bronze' });
        setHybridSeeds(gameState.hybridSeeds || {});
        setWeatherForecast(gameState.weatherForecast || []);
        setStormDamage(gameState.stormDamage || {});
        setProtectedPlots(new Set(gameState.protectedPlots || []));
        setIrrigatedPlots(new Set(gameState.irrigatedPlots || []));
        setInventory(gameState.inventory || { fungicide: 0, pesticide: 0 });
        setTutorialStep(gameState.tutorialStep || 0);
        setShowTutorial(gameState.showTutorial ?? true);
        setFarmZones(gameState.farmZones || [
          { id: 0, name: 'Main Farm', type: 'basic', unlocked: true, plots: Array.from({length: 9}, (_, i) => i) }
        ]);
        setActiveZone(gameState.activeZone || 0);
        setProcessingPlants(gameState.processingPlants || {});
        setAnimations(gameState.animations ?? true);
        setAutoSaveEnabled(gameState.autoSaveEnabled ?? true);
        setSoundEnabled(gameState.soundEnabled ?? true);
        
        // Sync sound manager with loaded state
        if (gameState.soundEnabled ?? true) {
          soundManager.enable();
        } else {
          soundManager.disable();
        }
        
        addNotification('📁 Game loaded successfully!', 'success');
        
        // Play load sound
        if (gameState.soundEnabled ?? true) {
          soundManager.playSuccess();
        }
        return true;
      }
    } catch (error) {
      addNotification('❌ Failed to load game', 'error');
      if (soundEnabled) {
        soundManager.playError();
      }
    }
    return false;
  };

  // Load game on component mount
  useEffect(() => {
    loadGame();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveEnabled) {
      const autoSave = setInterval(() => {
        saveGame();
      }, 30000);
      return () => clearInterval(autoSave);
    }
  }, [money, level, totalHarvests, livestock, buildings, autoSaveEnabled]);

  // Hotkey system
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger hotkeys when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          harvestAllReady();
          break;
        case 'w':
          e.preventDefault();
          waterSelectedPlots();
          break;
        case 'f':
          e.preventDefault();
          fertilizeSelectedPlots();
          break;
        case 'h':
          e.preventDefault();
          setShowHotkeyHelp(!showHotkeyHelp);
          break;
        case 's':
          e.preventDefault();
          saveGame();
          break;
        case 'b':
          e.preventDefault();
          setBulkActionMode(!bulkActionMode);
          break;
        case 'escape':
          e.preventDefault();
          setSelectedPlots(new Set());
          break;
        case '1':
          e.preventDefault();
          setSelectedCrop('wheat');
          break;
        case '2':
          e.preventDefault();
          setSelectedCrop('carrot');
          break;
        case '3':
          e.preventDefault();
          setSelectedCrop('tomato');
          break;
        case '4':
          e.preventDefault();
          setSelectedCrop('corn');
          break;
        case 'g':
          e.preventDefault();
          setActiveTab('genetics');
          break;
        case 'tab':
          e.preventDefault();
          switchToNextZone();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bulkActionMode, showHotkeyHelp, selectedPlots]);

  // Tutorial progress
  const nextTutorialStep = useCallback(() => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      addNotification('🎓 Tutorial completed! You\'re now a master farmer!', 'success');
    }
  }, [tutorialStep]);

  // Check tutorial completion conditions
  useEffect(() => {
    if (!showTutorial) return;
    
    const currentStep = TUTORIAL_STEPS[tutorialStep];
    if (!currentStep) return;

    switch(currentStep.action) {
      case 'plant':
        if (Object.values(plots).some(plot => plot.state === 'growing' || plot.state === 'ready')) {
          setTimeout(nextTutorialStep, 1000);
        }
        break;
      case 'water':
        if (Object.values(plots).some(plot => plot.watered)) {
          setTimeout(nextTutorialStep, 1000);
        }
        break;
      case 'harvest':
        if (totalHarvests > 0) {
          setTimeout(nextTutorialStep, 1000);
        }
        break;
      case 'genetics':
        if (activeTab === 'genetics') {
          setTimeout(nextTutorialStep, 1000);
        }
        break;
      case 'build':
        if (Object.keys(buildings).length > 0) {
          setTimeout(nextTutorialStep, 1000);
        }
        break;
    }
  }, [plots, totalHarvests, activeTab, buildings, tutorialStep, showTutorial, nextTutorialStep]);
  const addNotification = (message, type = 'info') => {
    const notif = { id: Date.now(), message, type };
    setNotifications(prev => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 3000);
  };

  // Enhanced game timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(time => {
        const newTime = time + 1;
        
        // Change weather every 60 seconds - zone-specific
        if (newTime % 60 === 0) {
          // Update weather for current zone
          updateZoneWeather(currentZone);
          
          // Also update other unlocked zones independently
          Object.keys(zoneData).forEach(zoneType => {
            if (zoneData[zoneType].unlocked && zoneType !== currentZone) {
              updateZoneWeather(zoneType);
            }
          });
        }
        
        // Season progression (5 minutes per season)
        setSeasonTimeLeft(prev => {
          if (prev <= 1) {
            const seasons = Object.keys(SEASONS);
            const currentIndex = seasons.indexOf(currentSeason);
            const nextSeason = seasons[(currentIndex + 1) % seasons.length];
            setCurrentSeason(nextSeason);
            addNotification(`🗓️ ${SEASONS[nextSeason].name} has begun!`, 'season');
            return 300; // Reset to 5 minutes
          }
          return prev - 1;
        });
        
        // Market price fluctuations every 2 minutes  
        if (newTime % 120 === 0) {
          // Update dynamic market system
          marketSystem.updateMarket({ 
            level, 
            money, 
            currentSeason, 
            inventory: processingInventory 
          });
          
          setMarketPricesHistory(prev => ({
            ...prev,
            [Date.now()]: marketSystem.currentPrices
          }));
          
          setActiveMarketEvents(marketSystem.activeEvents);
          
          setMarketPrices(prev => {
            const newPrices = {};
            Object.keys(prev).forEach(crop => {
              // Use market system prices or fallback to old system
              newPrices[crop] = marketSystem.getPrice(crop) ? 
                marketSystem.getPrice(crop) / ALL_CROPS[crop]?.baseValue || ALL_CROPS[crop]?.value || 25 :
                Math.max(0.7, Math.min(1.3, prev[crop] + ((Math.random() - 0.5) * 0.2)));
            });
            return newPrices;
          });
        }
        
        // Check processing system for completed batches
        const completedBatches = processingSystem.updateProcessing();
        if (completedBatches.length > 0) {
          completedBatches.forEach(batch => {
            setProcessingInventory(prev => {
              const updated = { ...prev };
              Object.entries(batch.outputs).forEach(([item, data]) => {
                updated[item] = (updated[item] || 0) + data.quantity;
              });
              return updated;
            });
            
            addNotification(`🏭 Processing complete! Produced ${Object.keys(batch.outputs).length} products`, 'success');
          });
        }
        
        // Update AI Farming System
        aiFarmingSystem.updateAI({
          plots, seeds, level, money, marketPrices, 
          currentSeason, ALL_CROPS: ALL_CROPS
        });
        
        // Execute Bot automation tasks
        const aiTasks = aiFarmingSystem.executeAutomationQueue({
          plots, seeds, level, money, marketPrices
        });
        
        if (aiTasks.length > 0) {
          aiTasks.forEach(task => {
            switch (task.type) {
              case 'plant':
                if (seeds[task.crop] > 0 && plots[task.plotId]?.state === 'empty') {
                  plantCrop(task.plotId);
                  addNotification(`🤖 Bot planted ${task.crop} on plot ${task.plotId + 1}`, 'info');
                }
                break;
              case 'harvest':
                if (plots[task.plotId]?.state === 'ready') {
                  harvestCrop(task.plotId);
                  addNotification(`🤖 Bot harvested plot ${task.plotId + 1}`, 'info');
                }
                break;
              case 'water':
                if (plots[task.plotId]?.state === 'planted' && !plots[task.plotId]?.watered) {
                  waterPlot(task.plotId);
                }
                break;
              case 'fertilize':
                if (plots[task.plotId]?.state === 'planted' && !plots[task.plotId]?.fertilized) {
                  fertilizePlot(task.plotId);
                }
                break;
            }
          });
          
          setAiDecisions(prev => [...aiTasks, ...prev].slice(0, 20)); // Keep last 20 decisions
        }
        
        // Update Bot energy
        const aiStatus = aiFarmingSystem.getAIStatus();
        setAiEnergy(aiStatus.energy);
        
        // Visitor system (every 3-5 minutes)
        if (!currentVisitor && Math.random() < 0.003) { // 0.3% chance per second
          const visitor = VISITORS[Math.floor(Math.random() * VISITORS.length)];
          setCurrentVisitor(visitor);
          setVisitorTimeLeft(120); // 2 minutes to interact
          addNotification(`${visitor.emoji} ${visitor.name} is visiting!`, 'visitor');
        }
        
        // Countdown visitor time
        if (currentVisitor && visitorTimeLeft > 0) {
          setVisitorTimeLeft(prev => {
            if (prev <= 1) {
              setCurrentVisitor(null);
              addNotification('👋 Visitor has left', 'info');
              return 0;
            }
            return prev - 1;
          });
        }
        
        // Random disease outbreaks (rare)
        if (Math.random() < 0.001) { // 0.1% chance per second
          const diseaseTypes = Object.keys(DISEASES);
          const disease = diseaseTypes[Math.floor(Math.random() * diseaseTypes.length)];
          const plotsWithCrops = Object.keys(plots).filter(id => plots[id].state === 'planted');
          
          if (plotsWithCrops.length > 0) {
            const affectedPlot = plotsWithCrops[Math.floor(Math.random() * plotsWithCrops.length)];
            setDiseaseOutbreaks(prev => ({
              ...prev,
              [affectedPlot]: disease
            }));
            addNotification(`${DISEASES[disease].emoji} ${DISEASES[disease].name} outbreak in plot ${parseInt(affectedPlot) + 1}!`, 'error');
          }
        }
        
        // Contract expiration
        setActiveContracts(prev => 
          prev.filter(contract => {
            if (newTime >= contract.deadline) {
              addNotification(`⏰ Contract with ${contract.client} expired!`, 'error');
              return false;
            }
            return true;
          })
        );
        
        // Livestock income generation with enhanced system
        setLivestock(currentLivestock => {
          const updated = { ...currentLivestock };
          let hasIncome = false;
          
          Object.keys(updated).forEach(animalId => {
            const animal = updated[animalId];
            if (newTime - animal.lastFed < LIVESTOCK[animal.type].interval * 2) {
              if (newTime - animal.lastProduced >= LIVESTOCK[animal.type].interval) {
                updated[animalId] = { ...animal, lastProduced: newTime };
                const income = LIVESTOCK[animal.type].income;
                setMoney(prev => prev + income);
                hasIncome = true;
              }
            }
          });
          
          if (hasIncome) {
            addNotification('🐄 Animals produced income!', 'success');
          }
          
          return updated;
        });
        
        // Transport cooldown
        if (transportCooldown > 0) {
          setTransportCooldown(prev => prev - 1);
        }
        
        // Weather event system - check every 30 seconds
        if (newTime % 30 === 0) {
          Object.keys(zoneData).forEach(zoneType => {
            if (zoneData[zoneType]?.unlocked) {
              triggerWeatherEvent(zoneType);
            }
          });
        }
        
        // Update active weather events
        setActiveWeatherEvents(prev => {
          const updated = { ...prev };
          let hasChanges = false;
          
          Object.keys(updated).forEach(zoneType => {
            const event = updated[zoneType];
            if (event) {
              event.remainingDuration -= 1;
              if (event.remainingDuration <= 0) {
                delete updated[zoneType];
                addNotification(`✅ ${event.name} has ended in ${ZONE_TYPES[zoneType].name}`, 'info');
                hasChanges = true;
              }
            }
          });
          
          return hasChanges ? updated : prev;
        });
        
        // Livestock happiness and stress recovery
        setZoneLivestock(prev => {
          const updated = { ...prev };
          let hasChanges = false;
          
          Object.keys(updated).forEach(zoneType => {
            Object.keys(updated[zoneType]).forEach(animalType => {
              const animal = updated[zoneType][animalType];
              if (animal && animal.count > 0) {
                // Gradual stress reduction and happiness recovery
                if (animal.stress > 0) {
                  updated[zoneType][animalType].stress = Math.max(0, animal.stress - 1);
                  hasChanges = true;
                }
                if (animal.happiness < 100 && animal.stress === 0) {
                  updated[zoneType][animalType].happiness = Math.min(100, animal.happiness + 1);
                  hasChanges = true;
                }
              }
            });
          });
          
          return hasChanges ? updated : prev;
        });
        
        // Advanced automation system processing
        if (automationEnabled && newTime % 60 === 0) { // Every minute
          // Pay maintenance costs every hour
          if (newTime % 3600 === 0) {
            payMaintenanceCosts();
          }
          
          // Crop automation
          if (automationSystems.cropAutomation?.active) {
            // Auto-plant empty plots with best crops
            Object.entries(plots).forEach(([plotId, plot]) => {
              if (plot.state === 'empty') {
                const bestCrop = ['wheat', 'carrot', 'tomato', 'corn']
                  .find(crop => seeds[crop] > 0);
                if (bestCrop) {
                  plantCrop(parseInt(plotId), bestCrop);
                }
              }
              
              // Auto-water crops
              if (plot.state === 'growing' && !plot.watered && tools.wateringCan) {
                waterCrop(parseInt(plotId));
              }
              
              // Auto-harvest ready crops
              if (plot.state === 'ready') {
                harvestCrop(parseInt(plotId));
              }
            });
          }
          
          // Livestock automation
          if (automationSystems.livestockAutomation?.active) {
            Object.keys(zoneLivestock).forEach(zoneType => {
              Object.keys(zoneLivestock[zoneType]).forEach(animalType => {
                const animal = ZONE_LIVESTOCK[zoneType]?.find(a => a.id === animalType);
                if (animal) {
                  // Auto-collect products
                  collectLivestockProducts(zoneType, animalType);
                }
              });
            });
          }
          
          // Weather automation
          if (automationSystems.weatherAutomation?.active && Object.keys(activeWeatherEvents).length > 0) {
            // Auto-prepare for disasters (could include resource protection)
            addNotification('🤖 Weather AI preparing for disaster mitigation...', 'info');
          }
          
          // Trade automation
          if (automationSystems.tradeAutomation?.active && newTime % 300 === 0) { // Every 5 minutes
            // Auto-trade excess resources for profit
            const excessCrops = Object.entries(inventory).filter(([crop, amount]) => amount > 50);
            if (excessCrops.length > 0) {
              addNotification('🚛 Trade AI executing resource optimization...', 'info');
            }
          }
        }
        
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSeason, currentVisitor, visitorTimeLeft, plots]);

  // Update crop growth
  useEffect(() => {
    setPlots(currentPlots => {
      const updated = { ...currentPlots };
      let hasChanges = false;
      let autoHarvested = 0;

      Object.keys(updated).forEach(plotId => {
        const plot = updated[plotId];
        if (plot.state === 'planted' && plot.crop) {
          const cropData = ALL_CROPS[plot.crop] || 
            Object.values(HYBRID_COMBINATIONS).find(h => h.result === plot.crop);
          
          // Weather effects with building protection and zone bonuses
          let weather = WEATHER[currentWeather] || ZONE_WEATHER[currentZone]?.[currentWeather] || WEATHER.sunny;
          if (buildings.advancedGreenhouse || (buildings.greenhouse && research.greenhouse.unlocked)) {
            weather = WEATHER.sunny; // Perfect conditions
          }
          
          const timeGrown = gameTime - plot.plantedAt;
          
          // Base growth multiplier
          let growthMultiplier = weather.growthMultiplier;
          
          // Zone-specific weather bonuses
          if (ZONE_WEATHER[currentZone]?.[currentWeather]) {
            const zoneWeather = ZONE_WEATHER[currentZone][currentWeather];
            
            // Apply zone bonuses based on crop adaptation
            if (zoneWeather.zoneBonus) {
              Object.entries(zoneWeather.zoneBonus).forEach(([trait, bonus]) => {
                if (cropData?.[trait]) {
                  growthMultiplier *= bonus;
                }
              });
            }
          }
          
          // Building bonuses
          if (buildings.advancedGreenhouse) growthMultiplier += 0.3;
          else if (buildings.greenhouse) growthMultiplier += 0.2;
          if (buildings.irrigationSystem || research.irrigation.unlocked) growthMultiplier += 0.2;
          
          // Trait bonuses
          if (plot.traits.includes('fastGrowth')) {
            const bonus = GENETIC_TRAITS.fastGrowth.levels[plot.seedQuality];
            growthMultiplier *= bonus;
          }
          if (plot.traits.includes('droughtTolerance') && currentWeather === 'drought') {
            const bonus = GENETIC_TRAITS.droughtTolerance.levels[plot.seedQuality];
            growthMultiplier *= bonus;
          }
          
          // Zone adaptation bonuses (applies to existing trait system)
          if (currentZone === 'desert' && cropData?.droughtResistant) growthMultiplier *= 1.2;
          if (currentZone === 'forest' && cropData?.shadeTolerant) growthMultiplier *= 1.2;
          if (currentZone === 'mountain' && cropData?.coldResistant) growthMultiplier *= 1.2;
          if (currentZone === 'coastal' && cropData?.saltTolerant) growthMultiplier *= 1.2;
          
          // Standard bonuses
          if (plot.watered) growthMultiplier += 0.2;
          if (plot.fertilized) growthMultiplier += 0.3;
          if (irrigatedPlots.has(parseInt(plotId))) growthMultiplier += 0.15;
          
          // Auto-watering from sprinkler system or irrigation
          if ((tools.sprinkler || buildings.irrigationSystem) && !plot.watered) {
            updated[plotId] = { ...plot, watered: true, quality: Math.min(2.0, plot.quality + 0.3) };
            hasChanges = true;
          }
          
          // Storm damage effects
          if (stormDamage[plotId]) {
            growthMultiplier *= (1 - stormDamage[plotId]);
          }
          
          const adjustedGrowTime = cropData.growTime / growthMultiplier;
          const progress = Math.min(100, (timeGrown / adjustedGrowTime) * 100);
          
          if (progress !== plot.progress) {
            const newState = progress >= 100 ? 'ready' : 'planted';
            updated[plotId] = { ...updated[plotId], progress: progress, state: newState };
            hasChanges = true;
            
            // Auto-harvest if research unlocked OR auto harvester tool
            if (newState === 'ready' && (research.automation.unlocked || tools.harvester)) {
              let earnings = cropData.value * plot.quality;
              
              // Apply trait bonuses
              if (plot.traits.includes('highYield')) {
                const bonus = GENETIC_TRAITS.highYield.levels[plot.seedQuality];
                earnings *= bonus;
              }
              
              earnings = Math.floor(earnings * (research.genetics.unlocked ? 1.5 : 1));
              const xpGain = cropData.value / 5;
              
              setMoney(prev => prev + earnings);
              setTotalEarned(prev => prev + earnings);
              setTotalHarvests(prev => prev + 1);
              setExperience(prev => prev + xpGain);
              setResearchPoints(prev => prev + 1);
              
              updated[plotId] = {
                state: 'empty',
                crop: null,
                plantedAt: 0,
                progress: 0,
                watered: false,
                fertilized: false,
                quality: 1.0,
                seedQuality: 'bronze',
                traits: [],
                weatherDamage: 0,
                diseaseResistance: 1.0
              };
              autoHarvested++;
            }
          }
          
          // Disease check with trait resistance
          if (!diseaseOutbreaks[plotId] && Math.random() < weather.diseaseChance * plot.diseaseResistance) {
            const diseases = Object.keys(DISEASES);
            const disease = diseases[Math.floor(Math.random() * diseases.length)];
            setDiseaseOutbreaks(prev => ({ ...prev, [plotId]: disease }));
            addNotification(`${DISEASES[disease].emoji} ${DISEASES[disease].name} outbreak in plot ${parseInt(plotId) + 1}!`, 'error');
          }
        }
      });

      if (autoHarvested > 0) {
        addNotification(`🤖 Auto-harvested ${autoHarvested} crops!`, 'success');
      }

      return hasChanges ? updated : currentPlots;
    });
  }, [gameTime, currentWeather, research, tools]);

  // Plant crop with genetics and zone bonuses
  const plantCrop = (plotId) => {
    const isHybrid = hybridSeeds[selectedCrop] > 0;
    const hasSeeds = isHybrid ? hybridSeeds[selectedCrop] > 0 : seeds[selectedCrop] > 0;
    
    if (hasSeeds && plots[plotId].state === 'empty') {
      // Check if crop is suitable for current zone
      const cropData = ALL_CROPS[selectedCrop];
      const canPlantInZone = currentZone === 'basic' || 
        (cropData?.droughtResistant && currentZone === 'desert') ||
        (cropData?.shadeTolerant && currentZone === 'forest') ||
        (cropData?.coldResistant && currentZone === 'mountain') ||
        (cropData?.saltTolerant && currentZone === 'coastal') ||
        ZONE_TYPES[currentZone]?.specialCrops?.includes(selectedCrop);
      
      if (!canPlantInZone && currentZone !== 'basic') {
        addNotification(`❌ ${selectedCrop} cannot grow in ${ZONE_TYPES[currentZone].name}!`, 'error');
        return;
      }
      
      // Deduct seeds
      if (isHybrid) {
        setHybridSeeds(prev => ({ ...prev, [selectedCrop]: prev[selectedCrop] - 1 }));
      } else {
        setSeeds(prev => ({ ...prev, [selectedCrop]: prev[selectedCrop] - 1 }));
      }
      
      // Generate traits based on seed quality
      const quality = isHybrid ? 'gold' : seedQualities[selectedCrop] || 'bronze';
      const maxTraits = SEED_QUALITIES[quality].traits;
      const availableTraits = Object.keys(GENETIC_TRAITS);
      const traits = [];
      
      // Add hybrid traits if applicable
      if (isHybrid) {
        const hybridData = Object.values(HYBRID_COMBINATIONS).find(h => h.result === selectedCrop);
        if (hybridData) {
          traits.push(...hybridData.traits);
        }
      } else {
        // Random traits based on quality
        for (let i = 0; i < maxTraits && i < availableTraits.length; i++) {
          if (Math.random() < 0.7) { // 70% chance per trait slot
            const trait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
            if (!traits.includes(trait)) {
              traits.push(trait);
            }
          }
        }
      }
      
      // Calculate zone bonus
      let zoneBonus = 1.0;
      if (currentZone !== 'basic') {
        const zoneData = ZONE_TYPES[currentZone];
        if (zoneData.specialCrops?.includes(selectedCrop)) {
          zoneBonus = 1.3; // 30% bonus for zone-specific crops
        } else if (canPlantInZone) {
          zoneBonus = 1.1; // 10% bonus for adapted crops
        }
      }
      
      setPlots({
        ...plots,
        [plotId]: {
          state: 'planted',
          crop: selectedCrop,
          plantedAt: gameTime,
          progress: 0,
          watered: false,
          fertilized: false,
          quality: zoneBonus, // Start with zone bonus
          seedQuality: quality,
          traits: traits,
          weatherDamage: 0,
          diseaseResistance: traits.includes('diseaseResistance') ? 
            GENETIC_TRAITS.diseaseResistance.levels[quality] : 1.0,
          zoneBonus: zoneBonus
        }
      });
      
      if (traits.length > 0) {
        addNotification(`🧬 Planted ${selectedCrop} with traits: ${traits.map(t => GENETIC_TRAITS[t].emoji).join('')}`, 'success');
      }
      
      if (zoneBonus > 1.0) {
        addNotification(`🌍 Zone bonus: +${Math.round((zoneBonus - 1) * 100)}% for ${selectedCrop}!`, 'info');
      }
      
      // Play plant sound
      if (soundEnabled) {
        soundManager.playPlant();
      }
    }
  };

  // Enhanced harvest crop
  const harvestCrop = (plotId, sellCrop = true) => {
    const plot = plots[plotId];
    if (plot.state === 'ready' && plot.crop) {
      const cropData = CROPS[plot.crop] || SPECIAL_CROPS[plot.crop];
      const baseValue = cropData.value * plot.quality;
      const marketMultiplier = marketPrices[plot.crop] || 1.0;
      const seasonBonus = SEASONS[currentSeason].bonus;
      const diseaseReduction = diseaseOutbreaks[plotId] ? (1 - DISEASES[diseaseOutbreaks[plotId]].damage) : 1.0;
      
      const earnings = Math.floor(baseValue * marketMultiplier * seasonBonus * diseaseReduction * (research.genetics.unlocked ? 1.5 : 1));
      const xpGain = cropData.value / 5;
      
      // Check for contract completion
      const completedContracts = activeContracts.filter(contract => 
        contract.crop === plot.crop && contract.delivered < contract.quantity
      );
      
      if (completedContracts.length > 0) {
        const contract = completedContracts[0];
        contract.delivered = (contract.delivered || 0) + 1;
        
        if (contract.delivered >= contract.quantity) {
          const contractBonus = Math.floor(earnings * contract.bonus);
          setMoney(prev => prev + contractBonus);
          addNotification(`📋 Contract completed! Bonus: $${contractBonus}`, 'success');
          setActiveContracts(prev => prev.filter(c => c.id !== contract.id));
        }
      }
      
      if (sellCrop) {
        setMoney(money + earnings);
        setTotalEarned(totalEarned + earnings);
      }
      setTotalHarvests(totalHarvests + 1);
      setExperience(prev => prev + xpGain);
      setResearchPoints(prev => prev + 1);
      
      // Level up check
      const newLevel = Math.floor((experience + xpGain) / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setMoney(prev => prev + newLevel * 10);
        addNotification(`🎉 Level Up! You are now level ${newLevel}!`, 'levelup');
        
        // Play level up sound
        if (soundEnabled) {
          soundManager.playLevelUp();
        }
      }
      
      if (plot.quality > 1.5) {
        addNotification(`🌟 High quality ${cropData.name} for $${earnings}!`, 'success');
      }
      
      // Clear disease
      if (diseaseOutbreaks[plotId]) {
        setDiseaseOutbreaks(prev => {
          const updated = { ...prev };
          delete updated[plotId];
          return updated;
        });
      }
      
      setPlots({
        ...plots,
        [plotId]: {
          state: 'empty',
          crop: null,
          plantedAt: 0,
          progress: 0,
          watered: false,
          fertilized: false,
          quality: 1.0
        }
      });
      
      checkAchievements();
      
      // Play harvest sound
      if (soundEnabled) {
        soundManager.playHarvest();
      }
    }
  };

  // Buy seeds with zone unlock checks
  const buySeeds = (cropType, quantity = 5) => {
    const cropData = ALL_CROPS[cropType];
    const isZoneSpecific = ZONE_CROPS[cropType] !== undefined;
    
    // Check if zone is unlocked for zone-specific crops
    if (isZoneSpecific) {
      const requiredZoneUnlocked = 
        (cropData.droughtResistant && zoneData.desert?.unlocked) ||
        (cropData.shadeTolerant && zoneData.forest?.unlocked) ||
        (cropData.coldResistant && zoneData.mountain?.unlocked) ||
        (cropData.saltTolerant && zoneData.coastal?.unlocked);
      
      if (!requiredZoneUnlocked) {
        addNotification(`🔒 Unlock the required zone first to buy ${cropType} seeds!`, 'error');
        return;
      }
    }
    
    const cost = cropData.cost * quantity;
    if (money >= cost) {
      setMoney(money - cost);
      setTotalSpent(prev => prev + cost);
      setSeeds(prev => ({ ...prev, [cropType]: (prev[cropType] || 0) + quantity }));
      checkAchievements();
      
      // Play purchase sound
      if (soundEnabled) {
        soundManager.playPurchase();
      }
    } else {
      addNotification(`💰 Need $${cost} to buy ${quantity} ${cropType} seeds!`, 'error');
      if (soundEnabled) {
        soundManager.playError();
      }
    }
  };

  // Expand farm
  const expandFarm = () => {
    const cost = farmSize * 100;
    if (money >= cost && farmSize < 6) {
      setMoney(money - cost);
      const newSize = farmSize + 1;
      setFarmSize(newSize);
      
      setPlots(prev => {
        const newPlots = { ...prev };
        const totalPlots = newSize * newSize;
        for (let i = Object.keys(prev).length; i < totalPlots; i++) {
          newPlots[i] = {
            state: 'empty',
            crop: null,
            plantedAt: 0,
            progress: 0,
            watered: false,
            fertilized: false,
            quality: 1.0
          };
        }
        return newPlots;
      });
      
      addNotification(`🏗️ Farm expanded to ${newSize}x${newSize}!`, 'expansion');
    }
  };

  // Water plot
  const waterPlot = (plotId) => {
    if (!hasWateringCan) return;
    
    const plot = plots[plotId];
    if (plot && plot.state === 'planted' && !plot.watered) {
      setPlots(prev => ({
        ...prev,
        [plotId]: {
          ...prev[plotId],
          watered: true,
          quality: Math.min(2.0, prev[plotId].quality + 0.3)
        }
      }));
      addNotification('💧 Crop watered!', 'info');
    }
  };

  // Fertilize plot
  const fertilizePlot = (plotId) => {
    if (!hasFertilizer) return;
    
    const plot = plots[plotId];
    if (plot && plot.state === 'planted' && !plot.fertilized) {
      setPlots(prev => ({
        ...prev,
        [plotId]: {
          ...prev[plotId],
          fertilized: true,
          quality: Math.min(2.0, prev[plotId].quality + 0.5)
        }
      }));
      addNotification('🌿 Crop fertilized!', 'info');
    }
  };

  // Bulk Action Functions
  const harvestAllReady = useCallback(() => {
    const readyPlots = Object.entries(plots).filter(([_, plot]) => plot.state === 'ready');
    if (readyPlots.length === 0) {
      addNotification('🌾 No crops ready for harvest!', 'info');
      return;
    }
    
    readyPlots.forEach(([plotId]) => harvestCrop(parseInt(plotId)));
    addNotification(`🌾 Harvested ${readyPlots.length} crops!`, 'success');
  }, [plots]);

  const waterSelectedPlots = useCallback(() => {
    if (!hasWateringCan) {
      addNotification('💧 Need watering can first!', 'error');
      return;
    }
    
    if (selectedPlots.size === 0) {
      addNotification('💧 No plots selected! Use bulk mode (B key) to select plots.', 'info');
      return;
    }
    
    let wateredCount = 0;
    selectedPlots.forEach(plotId => {
      const plot = plots[plotId];
      if (plot && plot.state === 'growing' && !plot.watered) {
        waterPlot(plotId);
        wateredCount++;
      }
    });
    
    if (wateredCount > 0) {
      addNotification(`💧 Watered ${wateredCount} plots!`, 'success');
    } else {
      addNotification('💧 No plots needed watering!', 'info');
    }
  }, [selectedPlots, hasWateringCan, plots]);

  const fertilizeSelectedPlots = useCallback(() => {
    if (!hasFertilizer) {
      addNotification('🌿 Need fertilizer first!', 'error');
      return;
    }
    
    if (selectedPlots.size === 0) {
      addNotification('🌿 No plots selected! Use bulk mode (B key) to select plots.', 'info');
      return;
    }
    
    let fertilizedCount = 0;
    selectedPlots.forEach(plotId => {
      const plot = plots[plotId];
      if (plot && plot.state === 'growing' && !plot.fertilized) {
        fertilizePlot(plotId);
        fertilizedCount++;
      }
    });
    
    if (fertilizedCount > 0) {
      addNotification(`🌿 Fertilized ${fertilizedCount} plots!`, 'success');
    } else {
      addNotification('🌿 No plots needed fertilizing!', 'info');
    }
  }, [selectedPlots, hasFertilizer, plots]);

  const switchToNextZone = useCallback(() => {
    const unlockedZones = farmZones.filter(zone => zone.unlocked);
    const currentIndex = unlockedZones.findIndex(zone => zone.id === activeZone);
    const nextIndex = (currentIndex + 1) % unlockedZones.length;
    setActiveZone(unlockedZones[nextIndex].id);
    addNotification(`🗺️ Switched to ${unlockedZones[nextIndex].name}`, 'info');
  }, [farmZones, activeZone]);

  const togglePlotSelection = useCallback((plotId) => {
    if (!bulkActionMode) return;
    
    setSelectedPlots(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(plotId)) {
        newSelected.delete(plotId);
      } else {
        newSelected.add(plotId);
      }
      return newSelected;
    });
  }, [bulkActionMode]);

  // Buy tools
  const buyTool = (tool) => {
    const costs = { wateringCan: 200, fertilizer: 350 };
    
    if (money >= costs[tool]) {
      setMoney(money - costs[tool]);
      setTotalSpent(prev => prev + costs[tool]);
      if (tool === 'wateringCan') {
        setHasWateringCan(true);
        addNotification('🪣 Watering Can purchased!', 'purchase');
      } else if (tool === 'fertilizer') {
        setHasFertilizer(true);
        addNotification('🌿 Fertilizer purchased!', 'purchase');
      }
      checkAchievements();
    }
  };

  // Livestock functions
  const buyAnimal = (animalType) => {
    const animalData = LIVESTOCK[animalType];
    const requiredHousing = animalData.housing;
    
    // Check if player has required building
    if (!buildings[requiredHousing]) {
      addNotification(`Need ${BUILDINGS[requiredHousing].name} first!`, 'error');
      return;
    }
    
    // Check building capacity
    const animalsInBuilding = Object.values(livestock).filter(
      animal => LIVESTOCK[animal.type].housing === requiredHousing
    ).length;
    
    if (animalsInBuilding >= BUILDINGS[requiredHousing].capacity) {
      addNotification(`${BUILDINGS[requiredHousing].name} is full!`, 'error');
      return;
    }
    
    if (money >= animalData.cost) {
      setMoney(money - animalData.cost);
      setTotalSpent(prev => prev + animalData.cost);
      
      const animalId = Date.now().toString();
      setLivestock(prev => ({
        ...prev,
        [animalId]: {
          type: animalType,
          lastFed: gameTime,
          lastProduced: gameTime,
          happiness: 100,
          building: requiredHousing
        }
      }));
      
      addNotification(`${animalData.emoji} ${animalData.name} purchased!`, 'purchase');
      checkAchievements();
    }
  };

  const feedAnimal = (animalId) => {
    const animal = livestock[animalId];
    const animalData = LIVESTOCK[animal.type];
    const feedType = animalData.food;
    
    if (animal && feed[feedType] > 0 && gameTime - animal.lastFed >= 30) {
      setFeed(prev => ({ ...prev, [feedType]: prev[feedType] - 1 }));
      setLivestock(prev => ({
        ...prev,
        [animalId]: {
          ...prev[animalId],
          lastFed: gameTime,
          happiness: Math.min(100, prev[animalId].happiness + 20)
        }
      }));
      addNotification(`🌾 ${animalData.name} fed!`, 'info');
    } else if (feed[feedType] === 0) {
      addNotification(`No ${feedType} left! Buy more from shop.`, 'error');
    }
  };

  // Building functions
  const buyBuilding = (buildingType) => {
    const buildingData = BUILDINGS[buildingType];
    if (money >= buildingData.cost && !buildings[buildingType]) {
      setMoney(money - buildingData.cost);
      setTotalSpent(prev => prev + buildingData.cost);
      setBuildings(prev => ({
        ...prev,
        [buildingType]: {
          built: true,
          level: 1,
          builtAt: gameTime
        }
      }));
      addNotification(`�️ ${buildingData.name} built!`, 'purchase');
      checkAchievements();
    }
  };

  // Enhanced shop function to handle disease treatments
  const buyShopItem = (category, itemId) => {
    const item = SHOP_ITEMS[category][itemId];
    
    if (money >= item.cost) {
      setMoney(money - item.cost);
      setTotalSpent(prev => prev + item.cost);
      
      if (category === 'tools') {
        // Handle consumable items (fungicide, pesticide)
        if (itemId === 'fungicide' || itemId === 'pesticide') {
          setInventory(prev => ({
            ...prev,
            [itemId]: prev[itemId] + 3 // Add 3 uses per purchase
          }));
        } else {
          // Handle permanent tools (watering can, harvester, etc.)
          setTools(prev => ({ ...prev, [itemId]: true }));
          if (itemId === 'wateringCan') setHasWateringCan(true);
          if (itemId === 'fertilizer') setHasFertilizer(true);
        }
      } else if (category === 'feed') {
        const feedType = itemId.replace('Feed', '').replace('Bales', '').replace('Pellets', '').toLowerCase();
        setFeed(prev => ({ ...prev, [feedType]: prev[feedType] + 10 }));
      } else if (category === 'seeds') {
        const seedType = itemId.replace('Bulk', '').toLowerCase();
        setSeeds(prev => ({ ...prev, [seedType]: prev[seedType] + 20 }));
      }
      
      const purchaseMsg = (itemId === 'fungicide' || itemId === 'pesticide') 
        ? `${item.emoji} ${item.name} purchased! (+3 uses)`
        : `${item.emoji} ${item.name} purchased!`;
      addNotification(purchaseMsg, 'purchase');
      checkAchievements();
    }
  };

  // Treat disease function
  const treatDisease = (plotId) => {
    const disease = diseaseOutbreaks[plotId];
    const treatment = DISEASES[disease].treatment;
    
    // Check if it's a consumable item (fungicide, pesticide)
    if (treatment === 'fungicide' || treatment === 'pesticide') {
      if (inventory[treatment] > 0) {
        // Consume one use of the treatment
        setInventory(prev => ({
          ...prev,
          [treatment]: prev[treatment] - 1
        }));
        setDiseaseOutbreaks(prev => {
          const updated = { ...prev };
          delete updated[plotId];
          return updated;
        });
        addNotification(`💊 ${DISEASES[disease].name} treated successfully! (${inventory[treatment] - 1} ${treatment} remaining)`, 'success');
      } else {
        addNotification(`❌ Need ${treatment} to treat this disease! Buy from shop.`, 'error');
      }
    } else if (tools[treatment]) {
      // Handle permanent tools (like fertilizer for drought)
      setDiseaseOutbreaks(prev => {
        const updated = { ...prev };
        delete updated[plotId];
        return updated;
      });
      addNotification(`💊 ${DISEASES[disease].name} treated successfully!`, 'success');
    } else {
      addNotification(`❌ Need ${treatment} to treat this disease!`, 'error');
    }
  };

  // Visitor interaction
  const interactWithVisitor = () => {
    if (!currentVisitor) return;
    
    const visitor = currentVisitor;
    
    if (visitor.offer === 'buysCrops') {
      // Sell all ready crops at premium
      let totalSold = 0;
      Object.entries(plots).forEach(([plotId, plot]) => {
        if (plot.state === 'ready') {
          const cropData = CROPS[plot.crop] || SPECIAL_CROPS[plot.crop];
          const earnings = Math.floor(cropData.value * plot.quality * visitor.bonus);
          setMoney(prev => prev + earnings);
          totalSold += earnings;
          
          setPlots(prev => ({
            ...prev,
            [plotId]: {
              state: 'empty', crop: null, plantedAt: 0, progress: 0,
              watered: false, fertilized: false, quality: 1.0
            }
          }));
        }
      });
      
      if (totalSold > 0) {
        addNotification(`${visitor.emoji} Sold crops for $${totalSold}!`, 'success');
      } else {
        addNotification('❌ No crops ready to sell!', 'error');
      }
    } else if (visitor.offer === 'sellsSeeds') {
      // Get discount on next seed purchase
      addNotification(`${visitor.emoji} Seed discount active for 60 seconds!`, 'success');
    } else if (visitor.offer === 'givesQuest') {
      // Generate a new contract
      generateContract();
    }
    
    setCurrentVisitor(null);
    setVisitorTimeLeft(0);
  };

  // Generate new contract
  const generateContract = () => {
    const template = CONTRACT_TEMPLATES[Math.floor(Math.random() * CONTRACT_TEMPLATES.length)];
    const contract = {
      id: Date.now(),
      ...template,
      deadline: gameTime + template.time,
      delivered: 0
    };
    
    setActiveContracts(prev => [...prev, contract]);
    addNotification(`📋 New contract: Deliver ${contract.quantity} ${contract.crop} to ${contract.client}!`, 'contract');
  };

  // Processing Plant Functions
  const buildProcessingPlant = (plantType) => {
    const plant = PROCESSING_PLANTS[plantType];
    if (!plant || money < plant.cost) {
      addNotification(`❌ Cannot afford ${plant.name}! Need $${plant.cost}`, 'error');
      return;
    }
    
    if (processingPlants[plantType]) {
      addNotification(`❌ ${plant.name} already built!`, 'error');
      return;
    }
    
    setMoney(prev => prev - plant.cost);
    setTotalSpent(prev => prev + plant.cost);
    setProcessingPlants(prev => ({
      ...prev,
      [plantType]: {
        ...plant,
        built: true,
        queue: [],
        processing: null,
        finishTime: 0
      }
    }));
    
    addNotification(`🏭 ${plant.name} constructed!`, 'success');
  };

  const processCrop = (plantType, cropType, quantity = 1) => {
    const plant = processingPlants[plantType];
    if (!plant || !plant.built) {
      addNotification(`❌ ${PROCESSING_PLANTS[plantType].name} not built!`, 'error');
      return;
    }
    
    if (!plant.inputs.includes(cropType)) {
      addNotification(`❌ Cannot process ${cropType} in this plant!`, 'error');
      return;
    }
    
    // Check if we have enough crops in inventory
    const availableCrops = Object.values(plots).filter(plot => 
      plot.state === 'ready' && plot.crop === cropType
    ).length;
    
    if (availableCrops < quantity) {
      addNotification(`❌ Need ${quantity} ${cropType} crops ready for harvest!`, 'error');
      return;
    }
    
    // Harvest the required crops and start processing
    let harvested = 0;
    Object.entries(plots).forEach(([plotId, plot]) => {
      if (harvested < quantity && plot.state === 'ready' && plot.crop === cropType) {
        harvestCrop(parseInt(plotId), false); // Harvest without selling
        harvested++;
      }
    });
    
    const output = plant.outputs[Object.keys(plant.outputs)[0]];
    const processingTime = output.time * 1000; // Convert to milliseconds
    
    setProcessingPlants(prev => ({
      ...prev,
      [plantType]: {
        ...prev[plantType],
        processing: {
          crop: cropType,
          quantity,
          startTime: Date.now(),
          finishTime: Date.now() + processingTime,
          outputValue: CROPS[cropType].value * output.multiplier * quantity
        }
      }
    }));
    
    addNotification(`🏭 Processing ${quantity} ${cropType} in ${plant.name}!`, 'success');
  };

  const collectProcessedGoods = (plantType) => {
    const plant = processingPlants[plantType];
    if (!plant || !plant.processing) return;
    
    if (Date.now() < plant.processing.finishTime) {
      const timeLeft = Math.ceil((plant.processing.finishTime - Date.now()) / 1000);
      addNotification(`⏰ Processing not complete! ${timeLeft}s remaining.`, 'info');
      return;
    }
    
    const value = plant.processing.outputValue;
    setMoney(prev => prev + value);
    setTotalEarned(prev => prev + value);
    
    setProcessingPlants(prev => ({
      ...prev,
      [plantType]: {
        ...prev[plantType],
        processing: null
      }
    }));
    
    addNotification(`💰 Collected processed goods worth $${value}!`, 'success');
  };

  // Advanced breeding system functions
  const breedCrops = (crop1, crop2) => {
    if (!buildings.breedingLab) {
      addNotification('❌ Need Breeding Laboratory to crossbreed crops!', 'error');
      return;
    }

    const combination = `${crop1}+${crop2}`;
    const reverseCombo = `${crop2}+${crop1}`;
    const hybrid = HYBRID_COMBINATIONS[combination] || HYBRID_COMBINATIONS[reverseCombo];
    
    if (hybrid && seeds[crop1] >= 5 && seeds[crop2] >= 5) {
      setSeeds(prev => ({
        ...prev,
        [crop1]: prev[crop1] - 5,
        [crop2]: prev[crop2] - 5
      }));
      
      setHybridSeeds(prev => ({
        ...prev,
        [hybrid.result]: (prev[hybrid.result] || 0) + 3
      }));
      
      addNotification(`🧬 Created ${hybrid.name} hybrid seeds!`, 'success');
      addExperience(50);
    } else {
      addNotification('❌ Need 5 seeds of each type or invalid combination!', 'error');
    }
  };

  // Upgrade seed quality
  const upgradeSeedQuality = (crop) => {
    if (!buildings.seedProcessor) {
      addNotification('❌ Need Seed Processor to upgrade seed quality!', 'error');
      return;
    }

    const currentQuality = seedQualities[crop];
    const qualityLevels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = qualityLevels.indexOf(currentQuality);
    
    if (currentIndex < qualityLevels.length - 1) {
      const nextQuality = qualityLevels[currentIndex + 1];
      const cost = (currentIndex + 2) * 500; // 1000, 1500, 2000
      
      if (money >= cost && seeds[crop] >= 10) {
        setMoney(prev => prev - cost);
        setSeeds(prev => ({ ...prev, [crop]: prev[crop] - 10 }));
        setSeedQualities(prev => ({ ...prev, [crop]: nextQuality }));
        
        addNotification(`⭐ Upgraded ${crop} seeds to ${nextQuality} quality!`, 'success');
      } else {
        addNotification(`❌ Need $${cost} and 10 ${crop} seeds!`, 'error');
      }
    } else {
      addNotification('✨ Seeds already at maximum quality!', 'info');
    }
  };

  // Weather forecast (if weather station built)
  const generateWeatherForecast = () => {
    if (!buildings.weatherStation) return [];
    
    const forecast = [];
    const weatherTypes = Object.keys(WEATHER);
    
    for (let i = 0; i < 5; i++) {
      forecast.push({
        day: i + 1,
        weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        severity: Math.random()
      });
    }
    
    return forecast;
  };

  // Storm damage calculation
  const applyStormDamage = () => {
    const weather = WEATHER[currentWeather];
    if (weather.stormChance > 0 && Math.random() < weather.stormChance) {
      const newStormDamage = {};
      
      Object.entries(plots).forEach(([plotId, plot]) => {
        if (plot.state === 'planted' && !protectedPlots.has(parseInt(plotId))) {
          // Check weather resistance trait
          const hasWeatherResistance = plot.traits.includes('weatherResistance');
          const resistance = hasWeatherResistance ? 
            GENETIC_TRAITS.weatherResistance.levels[plot.seedQuality] : 1.0;
          
          if (Math.random() < weather.stormChance * resistance) {
            const damage = 0.2 + Math.random() * 0.3; // 20-50% damage
            newStormDamage[plotId] = damage;
          }
        }
      });
      
      if (Object.keys(newStormDamage).length > 0) {
        setStormDamage(prev => ({ ...prev, ...newStormDamage }));
        addNotification(`⛈️ Storm damaged ${Object.keys(newStormDamage).length} crops!`, 'error');
        
        if (buildings.weatherStation) {
          addNotification('📡 Weather station detected the storm!', 'info');
        }
      }
    }
  };

  // Zone weather update system
  const updateZoneWeather = (zoneType) => {
    let availableWeather;
    
    if (zoneType === 'basic') {
      // Basic zone uses standard weather
      availableWeather = Object.keys(WEATHER);
    } else {
      // Other zones use zone-specific weather + some standard weather
      const zoneWeather = Object.keys(ZONE_WEATHER[zoneType] || {});
      const standardWeather = ['sunny', 'rainy', 'cloudy']; // Always available
      availableWeather = [...zoneWeather, ...standardWeather];
    }
    
    const randomWeather = availableWeather[Math.floor(Math.random() * availableWeather.length)];
    
    if (zoneType === currentZone) {
      setCurrentWeather(randomWeather);
    }
    
    // Update zone data
    setZoneData(prev => ({
      ...prev,
      [zoneType]: {
        ...prev[zoneType],
        weather: randomWeather,
        lastWeatherChange: Date.now()
      }
    }));
  };

  // Get current weather effects including zone bonuses
  const getCurrentWeatherEffects = () => {
    const weather = WEATHER[currentWeather] || ZONE_WEATHER[currentZone]?.[currentWeather] || WEATHER.sunny;
    return weather;
  };

  // Zone management functions
  const unlockZone = (zoneType) => {
    const unlockCosts = {
      desert: { money: 5000, level: 5 },
      forest: { money: 7500, level: 8 },
      mountain: { money: 10000, level: 12 },
      coastal: { money: 15000, level: 15 }
    };
    
    const cost = unlockCosts[zoneType];
    if (cost && money >= cost.money && level >= cost.level) {
      setMoney(prev => prev - cost.money);
      setZoneData(prev => ({
        ...prev,
        [zoneType]: {
          ...prev[zoneType],
          unlocked: true
        }
      }));
      
      // Show unlock notification
      addNotification(`🗺️ ${ZONE_TYPES[zoneType].name} unlocked!`, 'success');
      
      // Show new crops notification
      const newCrops = ZONE_TYPES[zoneType].specialCrops;
      if (newCrops && newCrops.length > 0) {
        const cropEmojis = newCrops.map(cropType => ALL_CROPS[cropType]?.emoji).join('');
        addNotification(`🌱 New crops available: ${cropEmojis} Check the shop!`, 'info');
      }
      
      checkAchievements();
    }
  };

  const switchZone = (zoneType) => {
    if (zoneData[zoneType]?.unlocked) {
      setCurrentZone(zoneType);
      setCurrentWeather(zoneData[zoneType].weather);
      addNotification(`🚀 Traveled to ${ZONE_TYPES[zoneType].name}`, 'info');
    }
  };

  const transportResources = (fromZone, toZone, resourceType, amount) => {
    if (transportCooldown > 0) {
      addNotification('🚛 Transport on cooldown!', 'error');
      return;
    }
    
    if (amount <= 0 || amount > (zoneData[fromZone]?.resources[resourceType] || 0)) {
      addNotification('❌ Invalid transport amount!', 'error');
      return;
    }
    
    const transportCost = Math.ceil(amount * 0.1); // 10% transport fee
    if (money < transportCost) {
      addNotification(`💰 Need $${transportCost} for transport!`, 'error');
      return;
    }
    
    setMoney(prev => prev - transportCost);
    setZoneData(prev => ({
      ...prev,
      [fromZone]: {
        ...prev[fromZone],
        resources: {
          ...prev[fromZone].resources,
          [resourceType]: (prev[fromZone].resources[resourceType] || 0) - amount
        }
      },
      [toZone]: {
        ...prev[toZone],
        resources: {
          ...prev[toZone].resources,
          [resourceType]: (prev[toZone].resources[resourceType] || 0) + amount
        }
      }
    }));
    
    setTransportCooldown(30); // 30 second cooldown
    addNotification(`🚛 Transported ${amount} ${resourceType} for $${transportCost}`, 'success');
  };

  // Zone livestock management functions
  const buyLivestock = (zoneType, animalType) => {
    const animal = ZONE_LIVESTOCK[zoneType]?.[animalType];
    if (!animal) return;
    
    // Check if zone is unlocked
    if (!zoneData[zoneType]?.unlocked && zoneType !== 'basic') {
      addNotification(`🔒 Unlock ${ZONE_TYPES[zoneType].name} first!`, 'error');
      return;
    }
    
    if (money >= animal.cost) {
      setMoney(prev => prev - animal.cost);
      setZoneLivestock(prev => ({
        ...prev,
        [zoneType]: {
          ...prev[zoneType],
          [animalType]: {
            count: (prev[zoneType][animalType]?.count || 0) + 1,
            lastProduced: Date.now(),
            stress: 0,
            happiness: 100
          }
        }
      }));
      
      addNotification(`🐾 Bought ${animal.name} for ${ZONE_TYPES[zoneType].name}!`, 'success');
      checkAchievements();
    } else {
      addNotification(`💰 Need $${animal.cost} to buy ${animal.name}!`, 'error');
    }
  };

  const collectLivestockProducts = (zoneType, animalType) => {
    const animal = ZONE_LIVESTOCK[zoneType]?.[animalType];
    const livestock = zoneLivestock[zoneType]?.[animalType];
    
    if (!animal || !livestock || livestock.count === 0) return;
    
    const timeSinceLastProduced = Date.now() - livestock.lastProduced;
    const productionTime = animal.time * 1000; // convert to milliseconds
    
    if (timeSinceLastProduced >= productionTime) {
      const quantity = livestock.count;
      const baseValue = animal.value * quantity;
      
      // Apply happiness bonus
      const happinessBonus = livestock.happiness / 100;
      const finalValue = Math.floor(baseValue * happinessBonus);
      
      setMoney(prev => prev + finalValue);
      setLivestockProducts(prev => ({
        ...prev,
        [animal.product]: (prev[animal.product] || 0) + quantity
      }));
      
      // Update last produced time
      setZoneLivestock(prev => ({
        ...prev,
        [zoneType]: {
          ...prev[zoneType],
          [animalType]: {
            ...livestock,
            lastProduced: Date.now()
          }
        }
      }));
      
      addNotification(`${animal.productEmoji} Collected ${quantity} ${animal.product} for $${finalValue}!`, 'success');
      
      // Add zone mastery XP
      addZoneMasteryXP(zoneType, quantity * 2);
    } else {
      const timeLeft = Math.ceil((productionTime - timeSinceLastProduced) / 1000);
      addNotification(`⏱️ ${animal.name} needs ${timeLeft}s more to produce!`, 'info');
    }
  };

  // Zone mastery system
  const addZoneMasteryXP = (zoneType, amount) => {
    setZoneMastery(prev => {
      const current = prev[zoneType];
      const newXP = current.xp + amount;
      const xpForNextLevel = (current.level + 1) * 100; // 100 XP per level
      
      if (newXP >= xpForNextLevel && current.level < 10) {
        // Level up!
        const newLevel = current.level + 1;
        addNotification(`⭐ ${ZONE_TYPES[zoneType].name} reached level ${newLevel}!`, 'levelup');
        
        return {
          ...prev,
          [zoneType]: {
            ...current,
            level: newLevel,
            xp: newXP - xpForNextLevel,
            perks: [...current.perks, `level_${newLevel}`]
          }
        };
      }
      
      return {
        ...prev,
        [zoneType]: {
          ...current,
          xp: newXP
        }
      };
    });
  };

  // Zone building system
  const buyZoneBuilding = (zoneType, buildingId) => {
    const building = ZONE_BUILDINGS[zoneType]?.[buildingId];
    if (!building) {
      addNotification(`❌ Building not found!`, 'error');
      return;
    }
    
    // Check requirements
    if (!zoneData[zoneType]?.unlocked) {
      addNotification(`❌ Must unlock ${ZONE_TYPES[zoneType].name} first!`, 'error');
      return;
    }
    
    if (level < building.unlockLevel) {
      addNotification(`❌ Requires level ${building.unlockLevel}!`, 'error');
      return;
    }
    
    if (money < building.cost) {
      addNotification(`❌ Need $${building.cost} to build ${building.name}!`, 'error');
      return;
    }
    
    if (zoneBuildings[zoneType][buildingId]) {
      addNotification(`❌ ${building.name} already built in this zone!`, 'error');
      return;
    }
    
    // Purchase building
    setMoney(prev => prev - building.cost);
    setTotalSpent(prev => prev + building.cost);
    
    setZoneBuildings(prev => ({
      ...prev,
      [zoneType]: {
        ...prev[zoneType],
        [buildingId]: {
          name: building.name,
          level: 1,
          builtAt: gameTime,
          active: true
        }
      }
    }));
    
    addNotification(`🏗️ ${building.name} built in ${ZONE_TYPES[zoneType].name}!`, 'success');
    addZoneMasteryXP(zoneType, 50); // Building gives significant mastery XP
    checkAchievements();
  };

  // Advanced automation system functions
  const buyAutomationSystem = (systemId) => {
    const system = AUTOMATION_SYSTEMS[systemId];
    if (!system) {
      addNotification(`❌ Automation system not found!`, 'error');
      return;
    }
    
    if (level < system.unlockLevel) {
      addNotification(`❌ Requires level ${system.unlockLevel}!`, 'error');
      return;
    }
    
    if (money < system.cost) {
      addNotification(`❌ Need $${system.cost} for ${system.name}!`, 'error');
      return;
    }
    
    if (automationSystems[systemId]) {
      addNotification(`❌ ${system.name} already purchased!`, 'error');
      return;
    }
    
    setMoney(prev => prev - system.cost);
    setTotalSpent(prev => prev + system.cost);
    
    setAutomationSystems(prev => ({
      ...prev,
      [systemId]: {
        name: system.name,
        active: true,
        efficiency: system.efficiency,
        lastMaintenance: Date.now(),
        totalUptime: 0
      }
    }));
    
    addNotification(`🤖 ${system.name} installed and activated!`, 'success');
    addZoneMasteryXP(currentZone, 100); // Automation gives major mastery XP
  };

  const toggleAutomation = (systemId) => {
    setAutomationSystems(prev => ({
      ...prev,
      [systemId]: {
        ...prev[systemId],
        active: !prev[systemId].active
      }
    }));
    
    const newState = !automationSystems[systemId].active;
    addNotification(`🤖 ${AUTOMATION_SYSTEMS[systemId].name} ${newState ? 'activated' : 'deactivated'}!`, 'info');
  };

  const payMaintenanceCosts = () => {
    let totalCost = 0;
    Object.entries(automationSystems).forEach(([systemId, data]) => {
      if (data.active) {
        totalCost += AUTOMATION_SYSTEMS[systemId].maintenance;
      }
    });
    
    if (automationFunds >= totalCost) {
      setAutomationFunds(prev => prev - totalCost);
      return true;
    } else {
      // Disable automation systems if can't afford maintenance
      setAutomationSystems(prev => {
        const updated = {};
        Object.keys(prev).forEach(systemId => {
          updated[systemId] = { ...prev[systemId], active: false };
        });
        return updated;
      });
      addNotification(`⚠️ Automation systems disabled - insufficient maintenance funds!`, 'error');
      return false;
    }
  };

  // Weather event system
  const triggerWeatherEvent = (zoneType) => {
    const events = WEATHER_EVENTS[zoneType];
    if (!events || !zoneData[zoneType]?.unlocked) return;
    
    // Check if there's already an active event in this zone
    if (activeWeatherEvents[zoneType]) return;
    
    // Random chance for each event type
    const eventTypes = Object.keys(events);
    for (const eventType of eventTypes) {
      const event = events[eventType];
      if (Math.random() < event.probability) {
        // Trigger event!
        const eventData = {
          ...event,
          type: eventType,
          zone: zoneType,
          startTime: Date.now(),
          remainingDuration: event.duration
        };
        
        setActiveWeatherEvents(prev => ({
          ...prev,
          [zoneType]: eventData
        }));
        
        addNotification(`⚠️ ${event.emoji} ${event.name} in ${ZONE_TYPES[zoneType].name}!`, 'error');
        
        // Apply immediate effects
        applyWeatherEventEffects(zoneType, eventData);
        break;
      }
    }
  };

  const applyWeatherEventEffects = (zoneType, event) => {
    const effects = event.effects;
    
    // Apply crop damage
    if (effects.cropDamage || effects.cropWilt || effects.cropDestruction) {
      const damageRate = effects.cropDamage || effects.cropWilt || effects.cropDestruction || 0;
      // TODO: Apply damage to crops in this zone
      addNotification(`🌾 Crops damaged by ${event.name}!`, 'error');
    }
    
    // Apply livestock effects
    if (effects.animalStress || effects.animalFlee) {
      const stressRate = effects.animalStress || effects.animalFlee || 0;
      setZoneLivestock(prev => {
        const updated = { ...prev };
        if (updated[zoneType]) {
          Object.keys(updated[zoneType]).forEach(animalType => {
            const animal = updated[zoneType][animalType];
            if (animal) {
              updated[zoneType][animalType] = {
                ...animal,
                stress: Math.min(100, animal.stress + stressRate * 100),
                happiness: Math.max(0, animal.happiness - stressRate * 50)
              };
            }
          });
        }
        return updated;
      });
    }
    
    // Add bonus resources
    if (effects.bonus) {
      setDisasterResources(prev => {
        const updated = { ...prev };
        Object.entries(effects.bonus).forEach(([resource, amount]) => {
          updated[resource] = (updated[resource] || 0) + amount;
        });
        return updated;
      });
      
      const bonusItems = Object.entries(effects.bonus).map(([resource, amount]) => `${amount} ${resource}`).join(', ');
      addNotification(`✨ Gained resources from disaster: ${bonusItems}`, 'success');
    }
  };

  // Building effect functions
  const buyAdvancedBuilding = (buildingId) => {
    const building = BUILDINGS[buildingId];
    if (money >= building.cost && !buildings[buildingId]) {
      setMoney(money - building.cost);
      setBuildings(prev => ({ ...prev, [buildingId]: true }));
      
      // Apply immediate effects
      if (buildingId === 'advancedGreenhouse' || buildingId === 'greenhouse') {
        // Protect all plots
        const allPlots = new Set(Object.keys(plots).map(id => parseInt(id)));
        setProtectedPlots(allPlots);
        addNotification('🏠 All crops now protected from weather!', 'success');
      }
      
      if (buildingId === 'irrigationSystem') {
        // Auto-irrigate all plots
        const allPlots = new Set(Object.keys(plots).map(id => parseInt(id)));
        setIrrigatedPlots(allPlots);
        addNotification('💧 Irrigation system covering all plots!', 'success');
      }
      
      if (buildingId === 'weatherStation') {
        const forecast = generateWeatherForecast();
        setWeatherForecast(forecast);
        addNotification('📡 Weather station providing 5-day forecast!', 'success');
      }
      
      addNotification(`${building.emoji} ${building.name} constructed!`, 'purchase');
      checkAchievements();
    }
  };

  // Check if player has ready crops of specific type
  const hasReadyCrops = (cropType) => {
    return Object.values(plots).some(plot => 
      plot.state === 'ready' && plot.crop === cropType
    );
  };

  // Deliver crops to contract
  const deliverToContract = (contractId) => {
    const contract = activeContracts.find(c => c.id === contractId);
    if (!contract) return;

    let delivered = 0;
    const updatedPlots = { ...plots };
    
    // Find and harvest matching crops
    Object.entries(plots).forEach(([plotId, plot]) => {
      if (plot.state === 'ready' && plot.crop === contract.crop && delivered < (contract.quantity - contract.delivered)) {
        delivered++;
        updatedPlots[plotId] = {
          state: 'empty', crop: null, plantedAt: 0, progress: 0,
          watered: false, fertilized: false, quality: 1.0
        };
      }
    });

    if (delivered > 0) {
      setPlots(updatedPlots);
      
      const updatedContract = {
        ...contract,
        delivered: contract.delivered + delivered
      };

      if (updatedContract.delivered >= updatedContract.quantity) {
        // Contract completed
        setActiveContracts(prev => prev.filter(c => c.id !== contractId));
        setCompletedContracts(prev => [...prev, updatedContract]);
        setMoney(prev => prev + updatedContract.reward);
        addNotification(`✅ Contract completed! Earned $${updatedContract.reward}`, 'success');
      } else {
        // Update progress
        setActiveContracts(prev => prev.map(c => 
          c.id === contractId ? updatedContract : c
        ));
        addNotification(`📦 Delivered ${delivered} ${contract.crop}`, 'success');
      }
    } else {
      addNotification(`❌ No ready ${contract.crop} crops to deliver!`, 'error');
    }
  };

  // Cancel contract
  const cancelContract = (contractId) => {
    setActiveContracts(prev => prev.filter(c => c.id !== contractId));
    addNotification('❌ Contract cancelled', 'error');
  };

  // Research functions
  const buyResearch = (researchId) => {
    const researchData = research[researchId];
    if (researchPoints >= researchData.cost && !researchData.unlocked) {
      setResearchPoints(prev => prev - researchData.cost);
      setResearch(prev => ({
        ...prev,
        [researchId]: { ...prev[researchId], unlocked: true }
      }));
      addNotification(`🔬 ${researchData.name} unlocked!`, 'research');
    }
  };

  // Achievement checking
  const checkAchievements = () => {
    const updates = {};
    let newAchievements = false;

    // Check each achievement
    if (!achievements.firstHarvest.unlocked && totalHarvests >= 1) {
      updates.firstHarvest = { ...achievements.firstHarvest, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.bigSpender.unlocked && totalSpent >= 500) {
      updates.bigSpender = { ...achievements.bigSpender, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.levelFive.unlocked && level >= 5) {
      updates.levelFive = { ...achievements.levelFive, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.levelTen.unlocked && level >= 10) {
      updates.levelTen = { ...achievements.levelTen, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.hundredHarvests.unlocked && totalHarvests >= 100) {
      updates.hundredHarvests = { ...achievements.hundredHarvests, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.millionaire.unlocked && totalEarned >= 1000) {
      updates.millionaire = { ...achievements.millionaire, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.animalLover.unlocked && Object.keys(livestock).length >= 5) {
      updates.animalLover = { ...achievements.animalLover, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.rancher.unlocked && Object.keys(livestock).length >= 10) {
      updates.rancher = { ...achievements.rancher, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.architect.unlocked && Object.keys(buildings).length >= 3) {
      updates.architect = { ...achievements.architect, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.researcher.unlocked && Object.values(research).every(r => r.unlocked)) {
      updates.researcher = { ...achievements.researcher, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.tycoon.unlocked && money >= 5000) {
      updates.tycoon = { ...achievements.tycoon, unlocked: true };
      newAchievements = true;
    }

    // Zone achievements
    if (!achievements.desertExplorer.unlocked && zoneData.desert?.unlocked) {
      updates.desertExplorer = { ...achievements.desertExplorer, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.forestRanger.unlocked && zoneData.forest?.unlocked) {
      updates.forestRanger = { ...achievements.forestRanger, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.mountaineer.unlocked && zoneData.mountain?.unlocked) {
      updates.mountaineer = { ...achievements.mountaineer, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.coastalFarmer.unlocked && zoneData.coastal?.unlocked) {
      updates.coastalFarmer = { ...achievements.coastalFarmer, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.globalFarmer.unlocked && 
        zoneData.desert?.unlocked && zoneData.forest?.unlocked && 
        zoneData.mountain?.unlocked && zoneData.coastal?.unlocked) {
      updates.globalFarmer = { ...achievements.globalFarmer, unlocked: true };
      newAchievements = true;
    }

    if (newAchievements) {
      setAchievements(prev => ({ ...prev, ...updates }));
      
      // Award money for achievements
      Object.values(updates).forEach(achievement => {
        setMoney(prev => prev + achievement.reward);
        addNotification(`🏆 Achievement: ${achievement.name}! +$${achievement.reward}`, 'achievement');
      });
    }
  };

  // Run achievement checks periodically
  useEffect(() => {
    checkAchievements();
  }, [money, level, totalHarvests, totalEarned, totalSpent, livestock, buildings, research, zoneData]);

  // Display helpers
  const getPlotDisplay = (plot) => {
    if (plot.state === 'empty') return '🟫';
    if (plot.state === 'planted') {
      if (plot.progress < 33) return '🌱';
      if (plot.progress < 66) return '🌿';
      return '🌾';
    }
    if (plot.state === 'ready') return CROPS[plot.crop].emoji;
  };

  const getQualityColor = (quality) => {
    if (quality >= 1.8) return 'border-purple-400 bg-purple-50';
    if (quality >= 1.5) return 'border-yellow-400 bg-yellow-50';
    if (quality >= 1.2) return 'border-green-400 bg-green-50';
    return 'border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-2 sm:p-4">
      
      {/* Notifications - Mobile Optimized */}
      {notifications.length > 0 && (
        <div className="fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-50 space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg text-sm sm:text-base max-w-full sm:max-w-sm animate-bounce ${
                notif.type === 'levelup' ? 'bg-purple-100 border-2 border-purple-400 text-purple-800' :
                notif.type === 'achievement' ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-800' :
                notif.type === 'research' ? 'bg-blue-100 border-2 border-blue-400 text-blue-800' :
                notif.type === 'success' ? 'bg-green-100 border-2 border-green-400 text-green-800' :
                notif.type === 'error' ? 'bg-red-100 border-2 border-red-400 text-red-800' :
                'bg-blue-100 border-2 border-blue-400 text-blue-800'
              }`}
            >
              {notif.message}
            </div>
          ))}
        </div>
      )}


      {/* Hotkey Help Overlay */}
      {showHotkeyHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-800">⌨️ Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHotkeyHelp(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(HOTKEYS).map(([key, description]) => (
                <div key={key} className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                    {key}
                  </kbd>
                  <span className="text-sm text-gray-700">{description}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Tip: Use bulk mode (B key) to select multiple plots, then use W/F to water/fertilize them all at once!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Selection Mode Indicator */}
      {bulkActionMode && (
        <div className="fixed top-4 left-4 z-40 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          🔲 Bulk Mode: {selectedPlots.size} plots selected (ESC to clear)
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-green-800">🚜 FarmLife</h1>
              <div className="flex gap-2">
                <button
                  onClick={saveGame}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 touch-manipulation"
                >
                  � Save
                </button>
                <button
                  onClick={loadGame}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 touch-manipulation"
                >
                  📂 Load
                </button>
              </div>
            </div>
            
            {/* Weather Display */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 md:px-4 py-2 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">
                  {WEATHER[currentWeather]?.emoji || ZONE_WEATHER[currentZone]?.[currentWeather]?.emoji || '☀️'}
                </span>
                <div>
                  <div className="font-semibold text-blue-800 text-sm md:text-base">
                    {WEATHER[currentWeather]?.name || ZONE_WEATHER[currentZone]?.[currentWeather]?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-blue-600 hidden md:block">
                    {WEATHER[currentWeather]?.description || ZONE_WEATHER[currentZone]?.[currentWeather]?.description || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone Selector - Mobile Optimized */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 sm:px-4 py-3 rounded-lg border-2 border-emerald-200 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">{ZONE_TYPES[currentZone].emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-emerald-800 text-base sm:text-lg truncate">{ZONE_TYPES[currentZone].name}</div>
                  <div className="text-xs sm:text-sm text-emerald-600 hidden sm:block">{ZONE_TYPES[currentZone].description}</div>
                  <div className="text-xs text-emerald-500">{ZONE_TYPES[currentZone].climate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={currentZone}
                  onChange={(e) => switchZone(e.target.value)}
                  className="px-2 sm:px-3 py-2 border-2 border-emerald-300 rounded-lg bg-white text-sm touch-manipulation"
                >
                  {Object.entries(ZONE_TYPES).map(([key, zone]) => (
                    <option 
                      key={key} 
                      value={key} 
                      disabled={!zoneData[key]?.unlocked}
                    >
                      {zone.emoji} {zone.name} {!zoneData[key]?.unlocked ? '🔒' : ''}
                    </option>
                  ))}
                </select>
                {transportCooldown > 0 && (
                  <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded whitespace-nowrap">
                    ⏱️ {transportCooldown}s
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar - Mobile Optimized */}
          <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={harvestAllReady}
                className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm hover:bg-green-600 flex items-center gap-1 touch-manipulation"
              >
                🌾 <span className="hidden sm:inline">Harvest All </span><span className="sm:hidden">All </span>(Space)
              </button>
              <button
                onClick={() => setBulkActionMode(!bulkActionMode)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center gap-1 touch-manipulation ${
                  bulkActionMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                🔲 <span className="hidden sm:inline">Bulk Mode </span><span className="sm:hidden">Bulk </span>(B) {bulkActionMode && `[${selectedPlots.size}]`}
              </button>
              {hasWateringCan && (
                <button
                  onClick={waterSelectedPlots}
                  className="px-2 sm:px-3 py-1 bg-cyan-500 text-white rounded text-xs sm:text-sm hover:bg-cyan-600 flex items-center gap-1 touch-manipulation"
                  disabled={!bulkActionMode || selectedPlots.size === 0}
                >
                  💧 <span className="hidden sm:inline">Water </span>(W)
                </button>
              )}
              {hasFertilizer && (
                <button
                  onClick={fertilizeSelectedPlots}
                  className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 flex items-center gap-1 touch-manipulation"
                  disabled={!bulkActionMode || selectedPlots.size === 0}
                >
                  🌿 <span className="hidden sm:inline">Fertilize </span>(F)
                </button>
              )}
              {selectedPlots.size > 0 && (
                <button
                  onClick={() => setSelectedPlots(new Set())}
                  className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs sm:text-sm hover:bg-red-600 flex items-center gap-1 touch-manipulation"
                >
                  ❌ <span className="hidden sm:inline">Clear </span>(ESC)
                </button>
              )}
              <button
                onClick={() => setShowHotkeyHelp(true)}
                className="px-2 sm:px-3 py-1 bg-purple-500 text-white rounded text-xs sm:text-sm hover:bg-purple-600 flex items-center gap-1 touch-manipulation"
              >
                ⌨️ <span className="hidden sm:inline">Keys </span>(H)
              </button>
              {!showTutorial && (
                <button
                  onClick={() => {setShowTutorial(true); setTutorialStep(0);}}
                  className="px-2 sm:px-3 py-1 bg-orange-500 text-white rounded text-xs sm:text-sm hover:bg-orange-600 flex items-center gap-1 touch-manipulation"
                >
                  🎓 <span className="hidden sm:inline">Tutorial</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs sm:text-sm">
            <div className="bg-yellow-100 px-2 sm:px-4 py-2 rounded-lg text-center">
              <div className="text-sm sm:text-lg font-bold">${money}</div>
              <div className="text-xs text-gray-600">Money</div>
            </div>
            <div className="bg-blue-100 px-2 sm:px-4 py-2 rounded-lg text-center">
              <div className="text-sm sm:text-lg font-bold">Lv.{level}</div>
              <div className="text-xs text-gray-600">Level</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${((experience % 100) / 100) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-purple-100 px-2 sm:px-4 py-2 rounded-lg text-center">
              <div className="text-sm sm:text-lg font-bold">{Math.floor(experience)}</div>
              <div className="text-xs text-gray-600">XP</div>
            </div>
            <div className="bg-cyan-100 px-2 sm:px-4 py-2 rounded-lg text-center">
              <div className="text-sm sm:text-lg font-bold">{researchPoints}</div>
              <div className="text-xs text-gray-600">Research</div>
            </div>
            <div className="bg-green-100 px-2 sm:px-4 py-2 rounded-lg text-center">
              <div className="text-sm sm:text-lg font-bold">{totalHarvests}</div>
              <div className="text-xs text-gray-600">Harvests</div>
            </div>
            <div className="bg-orange-100 px-2 sm:px-4 py-2 rounded-lg text-center">
              <div className="text-sm sm:text-lg font-bold">{Object.keys(livestock).length}</div>
              <div className="text-xs text-gray-600">Animals</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex overflow-x-auto border-b">
            {[
              { id: 'farm', name: '🚜 Farm', icon: '🌱' },
              { id: 'zones', name: '🗺️ Zones', icon: '🌍' },
              { id: 'market', name: '📈 Market', icon: '💰' },
              { id: 'trade', name: '🚛 Trade', icon: '📦' },
              { id: 'shop', name: '🏪 Shop', icon: '🛒' },
              { id: 'processing', name: '🏭 Processing', icon: '⚙️' },
              { id: 'ai', name: '🤖 Bots', icon: '🧠' },
              { id: 'livestock', name: '🐄 Livestock', icon: '🐔' },
              { id: 'buildings', name: '🏗️ Buildings', icon: '🏠' },
              { id: 'contracts', name: '📋 Contracts', icon: '📄' },
              { id: 'breeding', name: '🧬 Genetics', icon: '🔬' },
              { id: 'research', name: '🔬 Research', icon: '⚗️' },
              { id: 'achievements', name: '🏆 Achievements', icon: '🎯' },
              { id: 'stats', name: '📊 Stats', icon: '📈' },
              { id: 'settings', name: '⚙️ Settings', icon: '🔧' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-2 sm:px-4 py-3 text-center font-medium transition-colors touch-manipulation ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg sm:text-xl">{tab.icon}</span>
                  <span className="text-xs sm:text-sm">
                    <span className="sm:hidden">{tab.name.split(' ')[1] || tab.name.split(' ')[0]}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Farm Tab */}
        {activeTab === 'farm' && (
          <>
            {/* Current Visitor */}
            {currentVisitor && (
              <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 mb-6">
                <h3 className="font-bold text-lg mb-2">{currentVisitor.emoji} {currentVisitor.name} is visiting!</h3>
                <p className="text-sm mb-3">{currentVisitor.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Leaves in {Math.ceil(visitorTimeLeft / 1000)}s
                  </span>
                  <button
                    onClick={interactWithVisitor}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Interact
                  </button>
                </div>
              </div>
            )}

            {/* Disease Alert */}
            {Object.keys(diseaseOutbreaks).length > 0 && (
              <div className="bg-red-100 p-4 rounded-lg border border-red-300 mb-6">
                <h3 className="font-bold text-lg mb-2">🦠 Disease Outbreak!</h3>
                <div className="space-y-2">
                  {Object.entries(diseaseOutbreaks).map(([plotId, disease]) => (
                    <div key={plotId} className="flex justify-between items-center">
                      <span>Plot {plotId}: {DISEASES[disease].name}</span>
                      <button
                        onClick={() => treatDisease(plotId)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Treat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crop Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Select Crop to Plant</h2>
              
              {/* Regular and Zone-Specific Crops */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
                {Object.entries(ALL_CROPS).filter(([key, crop]) => {
                  // Show basic crops always
                  if (!ZONE_CROPS[key]) return true;
                  
                  // For zone-specific crops, check if the zone is unlocked
                  if (crop.droughtResistant && !zoneData.desert?.unlocked) return false;
                  if (crop.shadeTolerant && !zoneData.forest?.unlocked) return false;
                  if (crop.coldResistant && !zoneData.mountain?.unlocked) return false;
                  if (crop.saltTolerant && !zoneData.coastal?.unlocked) return false;
                  
                  return true;
                }).map(([key, crop]) => {
                  const marketMultiplier = marketPrices[key] || 1.0;
                  const isZoneSpecific = ZONE_CROPS[key] !== undefined;
                  const canPlantInCurrentZone = currentZone === 'basic' || 
                    (crop?.droughtResistant && currentZone === 'desert') ||
                    (crop?.shadeTolerant && currentZone === 'forest') ||
                    (crop?.coldResistant && currentZone === 'mountain') ||
                    (crop?.saltTolerant && currentZone === 'coastal') ||
                    ZONE_TYPES[currentZone]?.specialCrops?.includes(key);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCrop(key)}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all touch-manipulation ${
                        selectedCrop === key
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      } ${seeds[key] === 0 ? 'opacity-50' : ''} ${
                        !canPlantInCurrentZone ? 'opacity-25 cursor-not-allowed' : ''
                      } ${isZoneSpecific ? 'bg-gradient-to-br from-blue-50 to-purple-50' : ''}`}
                      disabled={!canPlantInCurrentZone}
                    >
                      <div className="text-2xl md:text-3xl mb-2">
                        {crop.emoji}
                        {isZoneSpecific && <span className="text-xs">🌍</span>}
                      </div>
                      <div className="font-semibold text-sm md:text-base">{crop.name}</div>
                      <div className="text-xs md:text-sm text-gray-600">Seeds: {seeds[key] || 0}</div>
                      {!canPlantInCurrentZone && (
                        <div className="text-xs text-red-500">❌ Wrong zone</div>
                      )}
                      {isZoneSpecific && (
                        <div className="text-xs text-purple-600">
                          {crop.droughtResistant && '🌵'} 
                          {crop.shadeTolerant && '🌿'} 
                          {crop.coldResistant && '❄️'} 
                          {crop.saltTolerant && '🌊'}
                        </div>
                      )}
                      <div className={`text-xs md:text-sm ${marketMultiplier > 1.0 ? 'text-green-600' : marketMultiplier < 1.0 ? 'text-red-600' : 'text-gray-600'}`}>
                        Sell: ${Math.floor((research.genetics.unlocked ? crop.value * 1.5 : crop.value) * marketMultiplier)}
                        {marketMultiplier !== 1.0 && (
                          <span className="ml-1">({marketMultiplier > 1.0 ? '+' : ''}{Math.round((marketMultiplier - 1) * 100)}%)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{crop.growTime}s to grow</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          buySeeds(key);
                        }}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 touch-manipulation"
                        disabled={money < crop.cost * 5 || !canPlantInCurrentZone}
                      >
                        Buy 5 (${crop.cost * 5})
                      </button>
                    </button>
                  );
                })}
              </div>

              {/* Seasonal Special Crops */}
              {currentSeason && currentSeason.specialCrops && currentSeason.specialCrops.length > 0 && (
                <div>
                  <h3 className="text-md font-bold mb-2 text-purple-700">🌟 {currentSeason.name} Special Crops</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    {currentSeason.specialCrops.map(cropKey => {
                      const crop = SPECIAL_CROPS[cropKey];
                      if (!crop) return null;
                      return (
                        <button
                          key={cropKey}
                          onClick={() => setSelectedCrop(cropKey)}
                          className={`p-3 md:p-4 rounded-lg border-2 transition-all border-purple-300 bg-purple-50 touch-manipulation ${
                            selectedCrop === cropKey ? 'border-purple-500 bg-purple-100' : 'hover:border-purple-400'
                          } ${seeds[cropKey] === 0 ? 'opacity-50' : ''}`}
                        >
                          <div className="text-2xl md:text-3xl mb-2">{crop.emoji}</div>
                          <div className="font-semibold text-sm md:text-base text-purple-800">{crop.name}</div>
                          <div className="text-xs md:text-sm text-purple-600">Seeds: {seeds[cropKey] || 0}</div>
                          <div className="text-xs md:text-sm text-purple-700">Sell: ${crop.value}</div>
                          <div className="text-xs text-purple-500">{crop.growTime}s to grow</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              buySeeds(cropKey);
                            }}
                            className="mt-2 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 touch-manipulation"
                            disabled={money < crop.cost * 5}
                          >
                            Buy 5 (${crop.cost * 5})
                          </button>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Farm Grid - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h2 className="text-lg sm:text-xl font-bold">Your Farm ({farmSize}x{farmSize})</h2>
                {farmSize < 6 && (
                  <button
                    onClick={expandFarm}
                    className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm sm:text-base touch-manipulation"
                    disabled={money < farmSize * 100}
                  >
                    🏗️ Expand (${farmSize * 100})
                  </button>
                )}
              </div>
              {/* Mobile-optimized grid with larger touch targets */}
              <div 
                className="grid gap-2 sm:gap-3 max-w-full sm:max-w-4xl mx-auto" 
                style={{ gridTemplateColumns: `repeat(${farmSize}, 1fr)` }}
              >
                {Object.entries(plots).map(([plotId, plot]) => {
                  const isDisease = diseaseOutbreaks[plotId];
                  const marketMultiplier = marketPrices[plot.crop] || 1.0;
                  const isProtected = protectedPlots.has(parseInt(plotId));
                  const isIrrigated = irrigatedPlots.has(parseInt(plotId));
                  const hasStormDamage = stormDamage[plotId] > 0;
                  
                  return (
                    <button
                      key={plotId}
                      onClick={() => {
                        if (bulkActionMode) {
                          togglePlotSelection(Number(plotId));
                        } else if (isDisease) {
                          treatDisease(plotId);
                        } else if (plot.state === 'empty') {
                          plantCrop(Number(plotId));
                        } else if (plot.state === 'ready') {
                          harvestCrop(Number(plotId));
                        } else if (plot.state === 'planted') {
                          if (hasWateringCan && !plot.watered) waterPlot(Number(plotId));
                          else if (hasFertilizer && !plot.fertilized) fertilizePlot(Number(plotId));
                        }
                      }}
                      className={`aspect-square min-h-20 md:min-h-28 border-2 rounded-xl flex flex-col items-center justify-center relative touch-manipulation transition-all duration-200 shadow-sm hover:shadow-md ${
                        selectedPlots.has(Number(plotId)) ? 'ring-4 ring-blue-400 ring-opacity-60 scale-105' : ''
                      } ${
                        isDisease ? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 animate-pulse' :
                        hasStormDamage ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100' :
                        isProtected ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100' :
                        plot.seedQuality === 'platinum' ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100' :
                        plot.seedQuality === 'gold' ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' :
                        plot.seedQuality === 'silver' ? 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100' :
                        plot.state === 'empty' ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-green-400' :
                        plot.state === 'ready' ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100' :
                        'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100'
                      }`}
                    >
                      {/* Main Plot Content */}
                      <div className="text-2xl md:text-3xl mb-1">
                        {isDisease ? '🦠' : getPlotDisplay(plot)}
                      </div>
                      
                      {/* Top Status Bar */}
                      <div className="absolute top-1 left-1 right-1 flex justify-between items-start">
                        {/* Left indicators */}
                        <div className="flex flex-col gap-0.5">
                          {/* Genetic traits */}
                          {!isDisease && plot.traits && plot.traits.length > 0 && plot.state !== 'empty' && (
                            <div className="flex">
                              {plot.traits.slice(0, 2).map((trait, index) => (
                                <span key={trait} className="text-xs bg-white bg-opacity-80 rounded px-1">
                                  {GENETIC_TRAITS[trait]?.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Building/tool effects */}
                          <div className="flex gap-0.5">
                            {isProtected && <span className="text-xs bg-blue-200 rounded px-1">🛡️</span>}
                            {isIrrigated && <span className="text-xs bg-blue-200 rounded px-1">💧</span>}
                            {!isDisease && plot.watered && !isIrrigated && <span className="text-xs bg-blue-200 rounded px-1">💧</span>}
                            {tools.sprinkler && plot.state === 'planted' && <span className="text-xs bg-blue-200 rounded px-1">💦</span>}
                          </div>
                        </div>
                        
                        {/* Right indicators */}
                        <div className="flex flex-col gap-0.5 items-end">
                          {/* Seed quality */}
                          {!isDisease && plot.seedQuality && plot.seedQuality !== 'bronze' && plot.state !== 'empty' && (
                            <span className="text-xs bg-white bg-opacity-80 rounded px-1">
                              {SEED_QUALITIES[plot.seedQuality]?.emoji}
                            </span>
                          )}
                          
                          {/* Market status */}
                          {!isDisease && plot.state === 'ready' && marketMultiplier !== 1.0 && (
                            <span className={`text-xs px-1 rounded ${marketMultiplier > 1.0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                              {marketMultiplier > 1.0 ? '📈' : '📉'}
                            </span>
                          )}
                          
                          {/* Storm damage */}
                          {hasStormDamage && (
                            <span className="text-xs bg-orange-200 text-orange-800 px-1 rounded">
                              ⛈️
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Bottom Status Bar */}
                      <div className="absolute bottom-1 left-1 right-1 flex justify-between items-end">
                        {/* Left bottom indicators */}
                        <div className="flex gap-0.5">
                          {!isDisease && plot.fertilized && <span className="text-xs bg-green-200 rounded px-1">🌿</span>}
                        </div>
                        
                        {/* Right bottom indicators */}
                        <div className="flex gap-0.5">
                          {/* Quality multiplier */}
                          {!isDisease && plot.quality > 1.0 && plot.state === 'ready' && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded font-bold">
                              {plot.quality.toFixed(1)}x
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Growth progress bar */}
                      {!isDisease && plot.state === 'planted' && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-b-xl overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000"
                            style={{ width: `${plot.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {/* Disease indicator */}
                      {isDisease && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-b-xl text-center font-semibold">
                          {DISEASES[isDisease].name.substring(0, 10)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 md:mt-6 text-center space-y-2">
                <p className="text-gray-700 text-sm font-medium">💡 Click empty plots to plant • Click ready crops to harvest • Click diseased plots to treat</p>
                {(hasWateringCan || hasFertilizer) && !tools.sprinkler && (
                  <p className="text-xs md:text-sm text-blue-600 font-medium">🔧 Click planted crops to use tools</p>
                )}
                {tools.sprinkler && (
                  <p className="text-xs md:text-sm text-blue-600 font-medium">💦 Sprinkler system auto-watering crops!</p>
                )}
                {(tools.harvester || research.automation.unlocked) && (
                  <p className="text-xs md:text-sm text-green-600 font-medium">🤖 Auto-harvest enabled!</p>
                )}
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-xs md:text-sm text-gray-700">
                    <span className="font-semibold">Selected:</span> {(CROPS[selectedCrop] || SPECIAL_CROPS[selectedCrop])?.emoji} {(CROPS[selectedCrop] || SPECIAL_CROPS[selectedCrop])?.name} 
                    <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800 font-semibold">Seeds: {seeds[selectedCrop] || 0}</span>
                  </p>
                </div>
                {Object.keys(diseaseOutbreaks).length > 0 && (
                  <p className="text-xs md:text-sm text-red-600 font-semibold bg-red-50 p-2 rounded-lg">🦠 {Object.keys(diseaseOutbreaks).length} active disease(s) - Click diseased plots to treat</p>
                )}
                {currentSeason && (
                  <p className="text-xs md:text-sm text-purple-600 bg-purple-50 p-2 rounded-lg">
                    <span className="font-semibold">📅 {currentSeason.name}:</span> {currentSeason.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tools Shop */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🛠️ Tools & Upgrades</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!hasWateringCan && (
                  <div className="p-4 border-2 border-blue-200 rounded-lg">
                    <div className="text-2xl mb-2">🪣</div>
                    <div className="font-semibold">Watering Can</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Water crops to boost quality (+0.3x) and growth speed
                    </div>
                    <button
                      onClick={() => buyTool('wateringCan')}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={money < 200}
                    >
                      Buy for $200
                    </button>
                  </div>
                )}
                
                {!hasFertilizer && (
                  <div className="p-4 border-2 border-green-200 rounded-lg">
                    <div className="text-2xl mb-2">🌿</div>
                    <div className="font-semibold">Premium Fertilizer</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Fertilize crops for major quality boost (+0.5x)
                    </div>
                    <button
                      onClick={() => buyTool('fertilizer')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      disabled={money < 350}
                    >
                      Buy for $350
                    </button>
                  </div>
                )}
                
                {hasWateringCan && hasFertilizer && (
                  <div className="col-span-full text-center p-8 bg-green-50 rounded-lg">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="font-semibold text-green-800">All tools unlocked!</div>
                    <div className="text-sm text-green-600">You're now a master farmer!</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-6">
            {/* Zone Unlock Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🗺️ Farm Zones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ZONE_TYPES).map(([zoneType, zone]) => (
                  <div key={zoneType} className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{zone.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{zone.name}</h3>
                        <p className="text-sm text-gray-600">{zone.climate}</p>
                      </div>
                      {zoneData[zoneType]?.unlocked && (
                        <button
                          onClick={() => switchZone(zoneType)}
                          className="ml-auto px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Visit
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{zone.description}</p>
                    
                    {/* Special Crops */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Special Crops:</p>
                      <div className="flex flex-wrap gap-1">
                        {zone.specialCrops?.map(cropType => (
                          <span key={cropType} className="text-xs bg-green-100 px-2 py-1 rounded">
                            {ALL_CROPS[cropType]?.emoji} {ALL_CROPS[cropType]?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Weather Types */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Weather:</p>
                      <div className="flex flex-wrap gap-1">
                        {zone.weatherTypes?.map(weather => (
                          <span key={weather} className="text-xs bg-blue-100 px-2 py-1 rounded">
                            {ZONE_WEATHER[zoneType]?.[weather]?.emoji || WEATHER[weather]?.emoji} {weather}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Unlock/Status */}
                    {!zoneData[zoneType]?.unlocked ? (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                          Requires: Level {zoneType === 'desert' ? 5 : zoneType === 'forest' ? 8 : zoneType === 'mountain' ? 12 : 15}, ${zoneType === 'desert' ? '5,000' : zoneType === 'forest' ? '7,500' : zoneType === 'mountain' ? '10,000' : '15,000'}
                        </div>
                        <button
                          onClick={() => unlockZone(zoneType)}
                          disabled={level < (zoneType === 'desert' ? 5 : zoneType === 'forest' ? 8 : zoneType === 'mountain' ? 12 : 15) || 
                                   money < (zoneType === 'desert' ? 5000 : zoneType === 'forest' ? 7500 : zoneType === 'mountain' ? 10000 : 15000)}
                          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
                        >
                          🔓 Unlock Zone
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-sm text-green-600 font-semibold mb-2">✅ Unlocked</div>
                        <div className="text-xs text-gray-600">
                          Current weather: {WEATHER[zoneData[zoneType]?.weather]?.emoji || ZONE_WEATHER[zoneType]?.[zoneData[zoneType]?.weather]?.emoji} {zoneData[zoneType]?.weather}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Locked Crops Preview */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🔒 Locked Zone Crops</h2>
              <p className="text-gray-600 mb-4">Unlock these zones to access their special crops:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ZONE_TYPES).filter(([zoneType, _]) => 
                  zoneType !== 'basic' && !zoneData[zoneType]?.unlocked
                ).map(([zoneType, zone]) => (
                  <div key={zoneType} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{zone.emoji}</span>
                      <div>
                        <h3 className="font-semibold">{zone.name}</h3>
                        <p className="text-xs text-gray-500">
                          Unlock: Level {zoneType === 'desert' ? 5 : zoneType === 'forest' ? 8 : zoneType === 'mountain' ? 12 : 15}, 
                          ${zoneType === 'desert' ? '5,000' : zoneType === 'forest' ? '7,500' : zoneType === 'mountain' ? '10,000' : '15,000'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Special Crops:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {zone.specialCrops?.map(cropType => {
                          const crop = ALL_CROPS[cropType];
                          return (
                            <div key={cropType} className="text-center p-2 bg-white rounded border opacity-75">
                              <div className="text-xl mb-1">{crop?.emoji}</div>
                              <div className="text-xs font-medium">{crop?.name}</div>
                              <div className="text-xs text-gray-500">${crop?.value}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.entries(ZONE_TYPES).filter(([zoneType, _]) => 
                zoneType !== 'basic' && !zoneData[zoneType]?.unlocked
              ).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  🎉 All zones unlocked! All special crops are now available.
                </div>
              )}
            </div>
            
            {/* Resource Transport Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🚛 Resource Transport</h2>
              {transportCooldown > 0 && (
                <div className="bg-orange-100 border border-orange-300 rounded p-3 mb-4">
                  ⏱️ Transport cooldown: {transportCooldown} seconds
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(zoneData).filter(([_, data]) => data.unlocked).map(([zoneType, data]) => (
                  <div key={zoneType} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">
                      {ZONE_TYPES[zoneType].emoji} {ZONE_TYPES[zoneType].name}
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm">
                        📦 Fertilizer: {data.resources?.fertilizer || 0}
                      </div>
                      <div className="text-sm">
                        🌱 Seeds: {data.resources?.seeds || 0}
                      </div>
                      {zoneType !== currentZone && (
                        <div className="mt-3 space-y-2">
                          <button
                            onClick={() => transportResources(currentZone, zoneType, 'fertilizer', 5)}
                            disabled={transportCooldown > 0 || (zoneData[currentZone]?.resources?.fertilizer || 0) < 5}
                            className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
                          >
                            ← Transport 5 Fertilizer (${Math.ceil(5 * 0.1)})
                          </button>
                          <button
                            onClick={() => transportResources(currentZone, zoneType, 'seeds', 10)}
                            disabled={transportCooldown > 0 || (zoneData[currentZone]?.resources?.seeds || 0) < 10}
                            className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
                          >
                            ← Transport 10 Seeds (${Math.ceil(10 * 0.1)})
                          </button>
                        </div>
                      )}
                      {zoneType === currentZone && (
                        <div className="text-xs text-green-600 font-semibold">📍 Current Location</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Zone Livestock Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🐄 Zone Livestock</h2>
              
              {/* Current Zone Livestock */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {ZONE_TYPES[currentZone].emoji} {ZONE_TYPES[currentZone].name} - Available Animals
                </h3>
                
                {ZONE_LIVESTOCK[currentZone] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(ZONE_LIVESTOCK[currentZone]).map(([animalId, animal]) => {
                      const owned = zoneLivestock[currentZone]?.[animalId] || 0;
                      const canAfford = money >= animal.cost;
                      
                      return (
                        <div key={animalId} className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{animal.emoji}</span>
                            <div>
                              <h4 className="font-semibold">{animal.name}</h4>
                              <p className="text-xs text-gray-600">
                                Adapted to: {animal.adaptation}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{animal.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Cost:</span>
                              <span className="font-semibold">${animal.cost}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Production:</span>
                              <span className="font-semibold">{animal.productEmoji} {animal.product} (${animal.value})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Interval:</span>
                              <span className="font-semibold">{animal.time}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Owned:</span>
                              <span className="font-semibold text-green-600">{owned}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <button
                              onClick={() => buyLivestock(currentZone, animalId)}
                              disabled={!canAfford}
                              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                            >
                              🛒 Buy {animal.name}
                            </button>
                            
                            {owned > 0 && (
                              <button
                                onClick={() => collectLivestockProducts(currentZone, animalId)}
                                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                📦 Collect Products ({owned} available)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    🚫 No livestock available in this zone
                  </div>
                )}
              </div>
              
              {/* All Zones Livestock Overview */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🌍 All Zones Livestock Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ZONE_TYPES).map(([zoneType, zone]) => {
                    const totalAnimals = Object.values(zoneLivestock[zoneType] || {}).reduce((sum, count) => sum + count, 0);
                    const zoneAnimals = ZONE_LIVESTOCK[zoneType] || {};
                    
                    return (
                      <div key={zoneType} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{zone.emoji}</span>
                          <div>
                            <h4 className="font-semibold">{zone.name}</h4>
                            <p className="text-xs text-gray-500">
                              {zoneData[zoneType]?.unlocked ? `${totalAnimals} animals` : 'Locked'}
                            </p>
                          </div>
                        </div>
                        
                        {zoneData[zoneType]?.unlocked ? (
                          <div className="space-y-1">
                            {Object.entries(zoneAnimals).map(([animalId, animal]) => {
                              const owned = zoneLivestock[zoneType]?.[animalId] || 0;
                              return (
                                <div key={animalId} className="flex justify-between text-sm">
                                  <span>{animal.emoji} {animal.name}</span>
                                  <span className="font-semibold">{owned}</span>
                                </div>
                              );
                            })}
                            {Object.keys(zoneAnimals).length === 0 && (
                              <p className="text-xs text-gray-500">No animals available</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Unlock this zone to see livestock
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Active Weather Events */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">⛈️ Weather Events & Disasters</h2>
              
              {Object.values(activeWeatherEvents).length > 0 ? (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-red-600">🚨 Active Disasters</h3>
                  {Object.values(activeWeatherEvents).map(event => (
                    <div key={event.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{event.emoji}</span>
                        <div>
                          <h4 className="font-semibold text-red-800">{event.name}</h4>
                          <p className="text-sm text-red-600">
                            Zone: {ZONE_TYPES[event.zone].emoji} {ZONE_TYPES[event.zone].name}
                          </p>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-sm font-semibold text-red-600">
                            {Math.ceil(event.remainingDuration / 60)}m remaining
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mb-2">{event.description}</p>
                      <div className="text-xs text-red-600">
                        Effects: {event.effects.cropDamage && `${event.effects.cropDamage}% crop damage`}
                        {event.effects.livestockStress && `, ${event.effects.livestockStress}% livestock stress`}
                        {event.effects.resourceLoss && `, ${event.effects.resourceLoss}% resource loss`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  ☀️ No active weather events. All zones are calm.
                </div>
              )}
              
              {/* Disaster Resources */}
              {disasterResources && Object.keys(disasterResources).length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">🎁 Disaster Recovery Resources</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These resources were collected from weather events and disasters:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(disasterResources).map(([resource, amount]) => (
                      <div key={resource} className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border text-center">
                        <div className="text-lg mb-1">
                          {resource === 'glass' && '🪟'}
                          {resource === 'ash' && '🌋'}
                          {resource === 'charcoal' && '⚫'}
                          {resource === 'ice' && '🧊'}
                          {resource === 'salt' && '🧂'}
                          {resource === 'driftwood' && '🪵'}
                          {resource === 'rareSeeds' && '🌟'}
                          {resource === 'seaweed' && '🌿'}
                        </div>
                        <div className="font-semibold text-sm">{amount}</div>
                        <div className="text-xs text-gray-600 capitalize">{resource}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Zone Mastery Progression */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🏆 Zone Mastery</h2>
              <p className="text-gray-600 mb-6">
                Gain mastery XP by farming, managing livestock, and surviving disasters in each zone.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(ZONE_TYPES).map(([zoneType, zone]) => {
                  const mastery = zoneMastery[zoneType] || { level: 1, xp: 0 };
                  const nextLevelXP = mastery.level * 100; // 100 XP per level
                  const progress = (mastery.xp / nextLevelXP) * 100;
                  
                  // Calculate mastery bonuses
                  const cropBonus = mastery.level * 2; // 2% per level
                  const livestockBonus = mastery.level * 3; // 3% per level
                  const resourceBonus = mastery.level * 1; // 1% per level
                  
                  return (
                    <div key={zoneType} className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-indigo-50">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{zone.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{zone.name}</h3>
                          <p className="text-sm text-gray-600">
                            {zoneData[zoneType]?.unlocked ? `Level ${mastery.level} Master` : 'Zone Locked'}
                          </p>
                        </div>
                      </div>
                      
                      {zoneData[zoneType]?.unlocked ? (
                        <>
                          {/* XP Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress to Level {mastery.level + 1}</span>
                              <span>{mastery.xp} / {nextLevelXP} XP</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Mastery Bonuses */}
                          <div className="space-y-2 text-sm">
                            <h4 className="font-semibold text-purple-700">Current Bonuses:</h4>
                            <div className="grid grid-cols-1 gap-1">
                              <div className="flex justify-between">
                                <span>🌱 Crop Value:</span>
                                <span className="font-semibold text-green-600">+{cropBonus}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>🐄 Livestock Production:</span>
                                <span className="font-semibold text-blue-600">+{livestockBonus}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>📦 Resource Efficiency:</span>
                                <span className="font-semibold text-purple-600">+{resourceBonus}%</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* XP Sources */}
                          <div className="mt-4 pt-3 border-t border-purple-200">
                            <h4 className="font-semibold text-purple-700 text-sm mb-2">XP Sources:</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>• Harvest crops: +10 XP</div>
                              <div>• Collect livestock products: +15 XP</div>
                              <div>• Survive disasters: +25 XP</div>
                              <div>• Plant zone-specific crops: +5 XP</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          🔒 Unlock this zone to start gaining mastery
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Market Tab - Dynamic Market System */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">📈 Dynamic Market</h2>
              <p className="text-gray-600 mb-6">
                Track real-time prices, market trends, and seasonal fluctuations. Take advantage of market events and complete contracts for bonus profits.
              </p>
              
              {/* Market Events */}
              {activeMarketEvents.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">🚨 Active Market Events</h3>
                  <div className="space-y-2">
                    {activeMarketEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-sm text-yellow-700">{event.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Market Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {Object.entries(ALL_CROPS).slice(0, 9).map(([cropId, crop]) => {
                  const currentPrice = marketSystem.getPrice(cropId) || crop.baseValue || crop.value;
                  const trend = marketSystem.getTrend(cropId);
                  const priceHistory = marketSystem.getPriceHistory(cropId);
                  
                  return (
                    <div key={cropId} className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{crop.emoji}</span>
                          <span className="font-semibold">{crop.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold">${currentPrice}</span>
                            <span className="text-sm">{trend.emoji}</span>
                          </div>
                          <div className="text-xs text-gray-600">{trend.name}</div>
                        </div>
                      </div>
                      
                      {/* Simple price trend indicator */}
                      <div className="flex gap-1 mb-2">
                        {priceHistory.slice(-7).map((price, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 h-2 rounded ${
                              price > currentPrice ? 'bg-red-300' : 
                              price < currentPrice ? 'bg-green-300' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Quick sell button */}
                      {(seeds[cropId] > 0 || processingInventory[cropId] > 0) && (
                        <button 
                          onClick={() => {
                            const available = seeds[cropId] || 0;
                            if (available > 0) {
                              const sellAmount = Math.min(available, 10);
                              const earnings = sellAmount * currentPrice;
                              setSeeds(prev => ({ ...prev, [cropId]: prev[cropId] - sellAmount }));
                              setMoney(prev => prev + earnings);
                              addNotification(`💰 Sold ${sellAmount} ${crop.name} for $${earnings}`, 'success');
                            }
                          }}
                          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Quick Sell (${seeds[cropId] || 0} available)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Contracts */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">📋 Available Contracts</h3>
                {marketSystem.activeContracts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketSystem.activeContracts.map(contract => (
                      <div key={contract.id} className="bg-white p-4 rounded border">
                        <h4 className="font-semibold">{contract.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{contract.description}</p>
                        <div className="text-sm">
                          <div>Reward: <span className="font-bold text-green-600">${contract.reward}</span></div>
                          <div>Bonus: <span className="font-bold text-blue-600">{Math.round((contract.bonus - 1) * 100)}%</span></div>
                          <div className="text-xs text-gray-500">
                            Expires: {Math.ceil((contract.endTime - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                        <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                          Accept Contract
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No contracts available. Check back later!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trade Tab - Inter-Zone Trade Routes */}
        {activeTab === 'trade' && (
          <div className="space-y-6">
            {/* Trade Routes Overview */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🚛 Inter-Zone Trade Routes</h2>
              <p className="text-gray-600 mb-6">
                Establish trade routes between your unlocked zones to exchange crops, livestock products, and resources.
              </p>
              
              {/* Current Zone Trade Hub */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  📍 Current Location: {ZONE_TYPES[currentZone].emoji} {ZONE_TYPES[currentZone].name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Available Crops */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-green-700 mb-2">🌾 Available Crops</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(inventory).filter(([crop, amount]) => amount > 0).map(([crop, amount]) => (
                        <div key={crop} className="flex justify-between text-sm">
                          <span>{ALL_CROPS[crop]?.emoji} {ALL_CROPS[crop]?.name}</span>
                          <span className="font-semibold">{amount}</span>
                        </div>
                      ))}
                      {Object.entries(inventory).filter(([crop, amount]) => amount > 0).length === 0 && (
                        <div className="text-xs text-gray-500">No crops in inventory</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Available Livestock Products */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-blue-700 mb-2">🥛 Livestock Products</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(ZONE_LIVESTOCK[currentZone] || {}).map(([animalId, animal]) => {
                        const owned = zoneLivestock[currentZone]?.[animalId] || 0;
                        return owned > 0 ? (
                          <div key={animalId} className="flex justify-between text-sm">
                            <span>{animal.emoji} {animal.product}</span>
                            <span className="font-semibold">{owned} producers</span>
                          </div>
                        ) : null;
                      }).filter(Boolean)}
                      {Object.keys(ZONE_LIVESTOCK[currentZone] || {}).length === 0 && (
                        <div className="text-xs text-gray-500">No livestock in this zone</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Zone Resources */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-purple-700 mb-2">📦 Zone Resources</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>🌱 Seeds</span>
                        <span className="font-semibold">{zoneData[currentZone]?.resources?.seeds || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>📦 Fertilizer</span>
                        <span className="font-semibold">{zoneData[currentZone]?.resources?.fertilizer || 0}</span>
                      </div>
                      {disasterResources && Object.entries(disasterResources).map(([resource, amount]) => (
                        <div key={resource} className="flex justify-between text-sm">
                          <span>
                            {resource === 'glass' && '🪟'} 
                            {resource === 'ash' && '🌋'} 
                            {resource === 'charcoal' && '⚫'} 
                            {resource === 'ice' && '🧊'} 
                            {resource === 'salt' && '🧂'} 
                            {resource === 'driftwood' && '🪵'} 
                            {resource === 'rareSeeds' && '🌟'} 
                            {resource === 'seaweed' && '🌿'} 
                            {resource.charAt(0).toUpperCase() + resource.slice(1)}
                          </span>
                          <span className="font-semibold">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trade Route Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(ZONE_TYPES).filter(([zoneType, _]) => 
                  zoneType !== currentZone && zoneData[zoneType]?.unlocked
                ).map(([zoneType, zone]) => (
                  <div key={zoneType} className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{zone.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{zone.name}</h3>
                        <p className="text-sm text-gray-600">
                          Climate: {zone.climate}
                        </p>
                      </div>
                    </div>
                    
                    {/* Trade Opportunities */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700">🔄 Trade Opportunities</h4>
                      
                      {/* Crop Exchanges */}
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-semibold text-green-700 text-sm mb-2">Crop Exchange</h5>
                        <div className="space-y-2">
                          {zone.specialCrops?.slice(0, 2).map(cropType => {
                            const crop = ALL_CROPS[cropType];
                            const hasBasicCrops = Object.entries(inventory).some(([c, amount]) => 
                              ['wheat', 'carrot', 'potato', 'corn'].includes(c) && amount >= 10
                            );
                            
                            return (
                              <div key={cropType} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span>10 Basic Crops</span>
                                  <span>→</span>
                                  <span>{crop?.emoji} 5 {crop?.name}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    // Find a basic crop with enough quantity
                                    const basicCrop = Object.entries(inventory).find(([c, amount]) => 
                                      ['wheat', 'carrot', 'potato', 'corn'].includes(c) && amount >= 10
                                    );
                                    
                                    if (basicCrop) {
                                      setInventory(prev => ({
                                        ...prev,
                                        [basicCrop[0]]: prev[basicCrop[0]] - 10,
                                        [cropType]: (prev[cropType] || 0) + 5
                                      }));
                                      addNotification(`📦 Traded 10 ${ALL_CROPS[basicCrop[0]]?.name} for 5 ${crop?.name}!`, 'success');
                                      addZoneMasteryXP(currentZone, 20); // Trading gives mastery XP
                                    }
                                  }}
                                  disabled={!hasBasicCrops}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-300"
                                >
                                  Trade
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Livestock Product Exchange */}
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-semibold text-blue-700 text-sm mb-2">Livestock Products</h5>
                        <div className="space-y-2">
                          {Object.entries(ZONE_LIVESTOCK[zoneType] || {}).slice(0, 2).map(([animalId, animal]) => {
                            const theirCount = zoneLivestock[zoneType]?.[animalId] || 0;
                            const canTrade = money >= 500; // Cost to establish trade route
                            
                            return (
                              <div key={animalId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span>$500</span>
                                  <span>→</span>
                                  <span>{animal.emoji} {animal.product}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (theirCount > 0) {
                                      setMoney(prev => prev - 500);
                                      // Simulate getting their product
                                      setInventory(prev => ({
                                        ...prev,
                                        [animal.product]: (prev[animal.product] || 0) + theirCount
                                      }));
                                      addNotification(`🚛 Imported ${theirCount} ${animal.product} from ${zone.name}!`, 'success');
                                      addZoneMasteryXP(currentZone, 25);
                                    }
                                  }}
                                  disabled={!canTrade || theirCount === 0}
                                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-300"
                                >
                                  Import
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Resource Trading */}
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-semibold text-purple-700 text-sm mb-2">Resource Trading</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span>$200</span>
                              <span>→</span>
                              <span>📦 5 Resources</span>
                            </div>
                            <button
                              onClick={() => {
                                setMoney(prev => prev - 200);
                                // Add random resources based on zone type
                                const newResources = { ...zoneData[currentZone].resources };
                                newResources.fertilizer = (newResources.fertilizer || 0) + 3;
                                newResources.seeds = (newResources.seeds || 0) + 2;
                                
                                setZoneData(prev => ({
                                  ...prev,
                                  [currentZone]: {
                                    ...prev[currentZone],
                                    resources: newResources
                                  }
                                }));
                                
                                addNotification(`📦 Imported resources from ${zone.name}!`, 'success');
                                addZoneMasteryXP(currentZone, 15);
                              }}
                              disabled={money < 200}
                              className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:bg-gray-300"
                            >
                              Import
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.entries(ZONE_TYPES).filter(([zoneType, _]) => 
                zoneType !== currentZone && zoneData[zoneType]?.unlocked
              ).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  🔒 Unlock more zones to establish trade routes!<br/>
                  <span className="text-sm">Trade routes allow you to exchange crops, livestock products, and resources between zones.</span>
                </div>
              )}
            </div>
            
            {/* Trade Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">📊 Trade Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <div className="text-3xl mb-2">🌾</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(inventory).reduce((sum, amount) => sum + amount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Crops</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl mb-2">🐄</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(zoneLivestock).reduce((total, zoneAnimals) => 
                      total + Object.values(zoneAnimals).reduce((sum, count) => sum + count, 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Livestock</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-3xl mb-2">🗺️</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(zoneData).filter(zone => zone.unlocked).length}
                  </div>
                  <div className="text-sm text-gray-600">Unlocked Zones</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏪 General Store</h2>
            
            {/* Shop Categories */}
            <div className="flex mb-6 border-b">
              {[
                { id: 'tools', name: '🛠️ Tools', count: Object.keys(SHOP_ITEMS.tools).length },
                { id: 'feed', name: '🌾 Feed', count: Object.keys(SHOP_ITEMS.feed).length },
                { id: 'seeds', name: '🌱 Seeds', count: Object.keys(SHOP_ITEMS.seeds).length }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setShopCategory(cat.id)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    shopCategory === cat.id
                      ? 'text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Current Feed Inventory */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">📦 Your Inventory</h3>
              <div className="flex gap-4 text-sm">
                <div>🌾 Grain: {feed.grain}</div>
                <div>🟫 Hay: {feed.hay}</div>
                <div>🌽 Corn: {feed.corn}</div>
                <div>🟢 Grass: {feed.grass}</div>
                <div>🧪 Fungicide: {inventory.fungicide}</div>
                <div>🦟 Pesticide: {inventory.pesticide}</div>
              </div>
            </div>

            {/* Shop Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(SHOP_ITEMS[shopCategory]).map(([itemId, item]) => {
                // Handle different ownership logic for consumables vs permanent tools
                const isConsumable = itemId === 'fungicide' || itemId === 'pesticide';
                const owned = shopCategory === 'tools' && !isConsumable && tools[itemId];
                
                return (
                  <div key={itemId} className={`p-4 border-2 rounded-lg ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-2xl mb-1">{item.emoji}</div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                        {isConsumable && (
                          <div className="text-xs text-blue-600 mt-1">
                            In stock: {inventory[itemId]} uses
                          </div>
                        )}
                      </div>
                      {owned && <div className="text-green-500 text-xl">✅</div>}
                    </div>
                    <div className="mt-3">
                      <div className="text-lg font-bold text-green-600 mb-2">
                        ${item.cost}
                        {isConsumable && <span className="text-sm text-gray-500"> (+3 uses)</span>}
                      </div>
                      {!owned ? (
                        <button
                          onClick={() => buyShopItem(shopCategory, itemId)}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          disabled={money < item.cost}
                        >
                          {isConsumable ? 'Buy More' : 'Buy Now'}
                        </button>
                      ) : (
                        <div className="w-full px-4 py-2 bg-green-500 text-white rounded text-center">
                          Owned
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buildings Tab */}
        {activeTab === 'buildings' && (
          <div className="space-y-6">
            {/* Basic Buildings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏗️ Basic Farm Buildings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(BUILDINGS).filter(([id]) => 
                  !['advancedGreenhouse', 'irrigationSystem', 'breedingLab', 'weatherStation', 'seedProcessor'].includes(id)
                ).map(([buildingId, building]) => {
                  const owned = buildings[buildingId];
                  const animalsCount = Object.values(livestock).filter(
                    animal => LIVESTOCK[animal.type].housing === buildingId
                  ).length;
                  
                  return (
                    <div key={buildingId} className={`p-4 border-2 rounded-lg ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-3xl mb-2">{building.emoji}</div>
                          <div className="font-semibold">{building.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{building.description}</div>
                          {building.capacity > 0 && (
                            <div className="text-sm text-blue-600">
                              Capacity: {building.capacity} animals
                            </div>
                          )}
                        </div>
                        {owned && <div className="text-green-500 text-xl">✅</div>}
                      </div>
                      
                      {owned && building.capacity > 0 && (
                        <div className="mb-3 p-2 bg-blue-50 rounded">
                          <div className="text-sm font-medium">
                            Occupancy: {animalsCount}/{building.capacity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(animalsCount / building.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <div className="text-lg font-bold text-green-600 mb-2">${building.cost}</div>
                        {!owned ? (
                          <button
                            onClick={() => buyBuilding(buildingId)}
                            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                            disabled={money < building.cost}
                          >
                            Build Now
                          </button>
                        ) : (
                          <div className="w-full px-4 py-2 bg-green-500 text-white rounded text-center">
                            Built
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Buildings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏭 Advanced Agricultural Technology</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(BUILDINGS).filter(([id]) => 
                  ['advancedGreenhouse', 'irrigationSystem', 'breedingLab', 'weatherStation', 'seedProcessor'].includes(id)
                ).map(([buildingId, building]) => {
                  const owned = buildings[buildingId];
                  
                  return (
                    <div key={buildingId} className={`p-4 border-2 rounded-lg ${owned ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-3xl mb-2">{building.emoji}</div>
                          <div className="font-semibold">{building.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{building.description}</div>
                        </div>
                        {owned && <div className="text-purple-500 text-xl">✅</div>}
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-lg font-bold text-purple-600 mb-2">${building.cost}</div>
                        {!owned ? (
                          <button
                            onClick={() => buyAdvancedBuilding(buildingId)}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                            disabled={money < building.cost}
                          >
                            Build Advanced
                          </button>
                        ) : (
                          <div className="w-full px-4 py-2 bg-purple-500 text-white rounded text-center">
                            Advanced Tech Active
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone-Specific Buildings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏗️ Zone-Specific Buildings</h2>
              <p className="text-gray-600 mb-6">
                Build specialized structures that provide unique benefits in each zone.
              </p>
              
              {/* Current Zone Buildings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {ZONE_TYPES[currentZone].emoji} {ZONE_TYPES[currentZone].name} - Available Buildings
                </h3>
                
                {ZONE_BUILDINGS[currentZone] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(ZONE_BUILDINGS[currentZone]).map(([buildingId, building]) => {
                      const owned = zoneBuildings[currentZone]?.[buildingId];
                      const canAfford = money >= building.cost;
                      const levelMet = level >= building.unlockLevel;
                      const zoneUnlocked = zoneData[currentZone]?.unlocked;
                      
                      return (
                        <div key={buildingId} className={`p-4 border-2 rounded-lg ${
                          owned ? 'border-blue-400 bg-blue-50' : 
                          (!canAfford || !levelMet || !zoneUnlocked) ? 'border-gray-200 bg-gray-50' : 
                          'border-gray-200 hover:border-blue-300'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-3xl mb-2">{building.emoji}</div>
                              <div className="font-semibold">{building.name}</div>
                              <div className="text-sm text-gray-600 mb-2">{building.description}</div>
                            </div>
                            {owned && <div className="text-blue-500 text-xl">✅</div>}
                          </div>
                          
                          {/* Benefits */}
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-blue-700 mb-1">Benefits:</h4>
                            <ul className="text-xs text-blue-600 space-y-1">
                              {building.benefits.map((benefit, index) => (
                                <li key={index}>• {benefit}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Requirements */}
                          <div className="mb-3 text-xs text-gray-600">
                            <div className={level >= building.unlockLevel ? 'text-green-600' : 'text-red-600'}>
                              ▶ Level {building.unlockLevel} {level >= building.unlockLevel ? '✓' : '✗'}
                            </div>
                            {building.requiredZone && (
                              <div className={zoneUnlocked ? 'text-green-600' : 'text-red-600'}>
                                ▶ {ZONE_TYPES[building.requiredZone].name} Zone {zoneUnlocked ? '✓' : '✗'}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3">
                            <div className="text-lg font-bold text-blue-600 mb-2">${building.cost}</div>
                            {!owned ? (
                              <button
                                onClick={() => buyZoneBuilding(currentZone, buildingId)}
                                disabled={!canAfford || !levelMet || !zoneUnlocked}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                              >
                                Build Now
                              </button>
                            ) : (
                              <div className="w-full px-4 py-2 bg-blue-500 text-white rounded text-center">
                                Built & Active
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    🚫 No zone-specific buildings available in this zone
                  </div>
                )}
              </div>
              
              {/* All Zones Building Overview */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🌍 All Zones Building Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ZONE_TYPES).map(([zoneType, zone]) => {
                    const totalBuildings = Object.keys(ZONE_BUILDINGS[zoneType] || {}).length;
                    const builtBuildings = Object.keys(zoneBuildings[zoneType] || {}).length;
                    const progressPercent = totalBuildings > 0 ? (builtBuildings / totalBuildings) * 100 : 0;
                    
                    return (
                      <div key={zoneType} className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-blue-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{zone.emoji}</span>
                          <div>
                            <h4 className="font-semibold">{zone.name}</h4>
                            <p className="text-xs text-gray-500">
                              {zoneData[zoneType]?.unlocked ? `${builtBuildings}/${totalBuildings} built` : 'Locked'}
                            </p>
                          </div>
                        </div>
                        
                        {zoneData[zoneType]?.unlocked ? (
                          <>
                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {Math.round(progressPercent)}% Complete
                              </div>
                            </div>
                            
                            {/* Built Buildings List */}
                            <div className="space-y-1">
                              {Object.entries(ZONE_BUILDINGS[zoneType] || {}).map(([buildingId, building]) => {
                                const owned = zoneBuildings[zoneType]?.[buildingId];
                                return (
                                  <div key={buildingId} className="flex justify-between text-sm">
                                    <span className={owned ? 'text-green-600' : 'text-gray-500'}>
                                      {building.emoji} {building.name}
                                    </span>
                                    <span className="font-semibold">
                                      {owned ? '✓' : '○'}
                                    </span>
                                  </div>
                                );
                              })}
                              {totalBuildings === 0 && (
                                <p className="text-xs text-gray-500">No specialized buildings</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Unlock this zone to build specialized structures
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Active Contracts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">📋 Active Contracts</h2>
                <button
                  onClick={generateContract}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Find New Contract
                </button>
              </div>
              
              {activeContracts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No active contracts. Generate new contracts to earn bonus rewards!
                </p>
              ) : (
                <div className="space-y-4">
                  {activeContracts.map(contract => (
                    <div key={contract.id} className="border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{contract.client}</h3>
                          <p className="text-sm text-gray-600">{contract.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">${contract.reward}</div>
                          <div className="text-xs text-gray-500">
                            Deadline: {Math.max(0, Math.ceil((contract.deadline - gameTime) / 1000))}s
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          Progress: {contract.delivered}/{contract.quantity} {contract.crop}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deliverToContract(contract.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            disabled={!hasReadyCrops(contract.crop)}
                          >
                            Deliver Crop
                          </button>
                          <button
                            onClick={() => cancelContract(contract.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(contract.delivered / contract.quantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Contracts */}
            {completedContracts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">✅ Completed Contracts</h2>
                <div className="space-y-2">
                  {completedContracts.slice(-5).map(contract => (
                    <div key={contract.id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">{contract.client} - {contract.quantity} {contract.crop}</span>
                      <span className="text-sm font-bold text-green-600">+${contract.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Tab - Enhanced Processing Facilities */}
        {activeTab === 'processing' && (
          <div className="space-y-6">
            {/* Processing System Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">🏭 Processing Facilities</h2>
              <p className="text-gray-600 mb-6">
                Build specialized facilities to transform raw crops into high-value processed products. Create production chains for maximum profit!
              </p>
              
              {/* Processing Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{Object.keys(activeFacilities).length}</div>
                  <div className="text-sm text-gray-600">Active Facilities</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{processingSystem.totalProcessed}</div>
                  <div className="text-sm text-gray-600">Total Processed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{Object.keys(processingInventory).length}</div>
                  <div className="text-sm text-gray-600">Product Types</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{processingSystem.processingQueue.length}</div>
                  <div className="text-sm text-gray-600">Active Batches</div>
                </div>
              </div>

              {/* Build New Facilities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">🏗️ Build New Facilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'juicer', name: 'Juice Press', emoji: '🥤', cost: 3000, unlockLevel: 6, description: 'Extract juices from fruits and vegetables' },
                    { id: 'mill', name: 'Grain Mill', emoji: '🏭', cost: 5000, unlockLevel: 8, description: 'Process grains into flour and meal' },
                    { id: 'preservery', name: 'Preserve Kitchen', emoji: '🥫', cost: 4500, unlockLevel: 10, description: 'Create jams, pickles, and preserved goods' },
                    { id: 'bakery', name: 'Artisan Bakery', emoji: '🍞', cost: 8000, unlockLevel: 12, description: 'Bake bread and pastries from ingredients' },
                    { id: 'dairy', name: 'Dairy Processing', emoji: '🧀', cost: 6000, unlockLevel: 14, description: 'Process milk into cheese and butter' },
                    { id: 'winery', name: 'Artisan Winery', emoji: '🍷', cost: 12000, unlockLevel: 18, description: 'Ferment fruits into wines and spirits' }
                  ].map((facility) => {
                    const owned = activeFacilities[facility.id];
                    const canBuild = level >= facility.unlockLevel && money >= facility.cost;
                    
                    return (
                      <div key={facility.id} className={`p-4 border-2 rounded-lg ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-2xl mb-1">{facility.emoji}</div>
                            <div className="font-semibold">{facility.name}</div>
                            <div className="text-sm text-gray-600 mb-2">{facility.description}</div>
                            <div className="text-xs">
                              <div>Unlock Level: {facility.unlockLevel}</div>
                            </div>
                          </div>
                          {owned && <div className="text-green-500 text-xl">✅</div>}
                        </div>
                        
                        <div className="text-lg font-bold text-green-600 mb-3">${facility.cost.toLocaleString()}</div>
                        
                        {!owned ? (
                          <button
                            onClick={() => {
                              if (canBuild) {
                                setMoney(prev => prev - facility.cost);
                                setActiveFacilities(prev => ({ 
                                  ...prev, 
                                  [facility.id]: { 
                                    ...facility, 
                                    level: 1, 
                                    efficiency: 1.0,
                                    built: Date.now(),
                                    currentBatch: null
                                  }
                                }));
                                addNotification(`🏭 ${facility.name} built successfully!`, 'success');
                              }
                            }}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={!canBuild}
                          >
                            {level < facility.unlockLevel ? `Level ${facility.unlockLevel} Required` : 'Build Facility'}
                          </button>
                        ) : (
                          <div className="text-center bg-green-500 text-white py-2 rounded">
                            Level {owned.level} - Built ✅
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Facilities & Production */}
              {Object.keys(activeFacilities).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">⚙️ Production Management</h3>
                  <div className="space-y-4">
                    {Object.entries(activeFacilities).map(([facilityId, facility]) => {
                      // Simple recipes based on facility type
                      const recipes = {
                        juicer: [
                          { id: 'apple_juice', name: 'Apple Juice', emoji: '🧃', inputs: { apple: 5 }, value: 80, time: 15 },
                          { id: 'carrot_juice', name: 'Carrot Juice', emoji: '🥕', inputs: { carrot: 6 }, value: 70, time: 20 }
                        ],
                        mill: [
                          { id: 'flour', name: 'Flour', emoji: '🌾', inputs: { wheat: 4 }, value: 60, time: 30 },
                          { id: 'cornmeal', name: 'Cornmeal', emoji: '🌽', inputs: { corn: 3 }, value: 55, time: 25 }
                        ],
                        bakery: [
                          { id: 'bread', name: 'Artisan Bread', emoji: '🍞', inputs: { wheat: 3 }, value: 120, time: 60 }
                        ],
                        preservery: [
                          { id: 'jam', name: 'Fruit Jam', emoji: '🍓', inputs: { tomato: 5 }, value: 90, time: 45 }
                        ]
                      };
                      
                      const availableRecipes = recipes[facilityId] || [];
                      
                      return (
                        <div key={facilityId} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{facility.emoji}</span>
                              <div>
                                <div className="font-semibold">{facility.name}</div>
                                <div className="text-sm text-gray-600">Level {facility.level}</div>
                              </div>
                            </div>
                            
                            {facility.currentBatch && (
                              <div className="bg-blue-100 px-3 py-1 rounded">
                                <div className="text-sm font-medium text-blue-800">Processing...</div>
                                <div className="text-xs text-blue-600">Please wait...</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Available Recipes */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableRecipes.map(recipe => (
                              <div key={recipe.id} className="bg-white p-3 rounded border">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{recipe.emoji}</span>
                                  <div>
                                    <div className="font-medium text-sm">{recipe.name}</div>
                                  </div>
                                </div>
                                
                                <div className="text-xs space-y-1 mb-3">
                                  <div>Needs: {Object.entries(recipe.inputs).map(([item, amount]) => `${amount} ${ALL_CROPS[item]?.emoji || ''} ${ALL_CROPS[item]?.name || item}`).join(', ')}</div>
                                  <div>Time: {recipe.time} min</div>
                                  <div className="font-bold text-green-600">Value: ${recipe.value}</div>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    // Check if we have the required inputs
                                    const hasInputs = Object.entries(recipe.inputs).every(([item, amount]) => {
                                      return (seeds[item] || 0) >= amount;
                                    });
                                    
                                    if (hasInputs && !facility.currentBatch) {
                                      // Consume inputs
                                      setSeeds(prev => {
                                        const updated = { ...prev };
                                        Object.entries(recipe.inputs).forEach(([item, amount]) => {
                                          updated[item] = Math.max(0, (updated[item] || 0) - amount);
                                        });
                                        return updated;
                                      });
                                      
                                      // Start processing
                                      setActiveFacilities(prev => ({
                                        ...prev,
                                        [facilityId]: {
                                          ...facility,
                                          currentBatch: {
                                            recipe: recipe.id,
                                            finishTime: Date.now() + (recipe.time * 60 * 1000)
                                          }
                                        }
                                      }));
                                      
                                      // Set timeout to complete processing
                                      setTimeout(() => {
                                        setProcessingInventory(prev => ({
                                          ...prev,
                                          [recipe.id]: (prev[recipe.id] || 0) + 1
                                        }));
                                        
                                        setActiveFacilities(prev => ({
                                          ...prev,
                                          [facilityId]: {
                                            ...prev[facilityId],
                                            currentBatch: null
                                          }
                                        }));
                                        
                                        addNotification(`✅ ${recipe.name} ready for collection!`, 'success');
                                      }, recipe.time * 60 * 1000);
                                      
                                      addNotification(`🏭 Started processing ${recipe.name}!`, 'success');
                                    } else if (!hasInputs) {
                                      const missing = Object.entries(recipe.inputs).filter(([item, amount]) => (seeds[item] || 0) < amount);
                                      addNotification(`❌ Need more: ${missing.map(([item, amount]) => `${amount} ${ALL_CROPS[item]?.name || item}`).join(', ')}`, 'error');
                                    }
                                  }}
                                  className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                                  disabled={facility.currentBatch}
                                >
                                  Start Processing
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Processed Goods Inventory */}
              {Object.keys(processingInventory).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">📦 Processed Goods Inventory</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(processingInventory).map(([item, quantity]) => (
                      <div key={item} className="bg-yellow-50 p-3 rounded border text-center">
                        <div className="font-semibold text-sm capitalize">{item.replace('_', ' ')}</div>
                        <div className="text-lg font-bold text-yellow-700">{quantity}</div>
                        <button
                          onClick={() => {
                            const baseValue = 50; // Simplified value calculation
                            const marketPrice = marketSystem.getPrice(item) || baseValue;
                            const earnings = quantity * marketPrice;
                            
                            setProcessingInventory(prev => ({ ...prev, [item]: 0 }));
                            setMoney(prev => prev + earnings);
                            addNotification(`💰 Sold ${quantity} ${item} for $${earnings}`, 'success');
                          }}
                          className="w-full mt-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Sell All
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bots Tab - Bot Farming & Automation */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Bot System Status */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🤖 Bot Farming System</h2>
              <p className="text-gray-600 mb-6">
                Deploy advanced bots to automate your farming operations. Each bot has unique capabilities and can be upgraded for better performance.
              </p>
              
              {/* Bot Energy and Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{aiEnergy}%</div>
                  <div className="text-sm text-gray-600">Bot Energy</div>
                  <div className={`w-full h-2 bg-gray-200 rounded mt-2`}>
                    <div 
                      className={`h-full rounded transition-all ${aiEnergy > 50 ? 'bg-blue-500' : aiEnergy > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${aiEnergy}%` }}
                    />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{Object.keys(activeBots).length}</div>
                  <div className="text-sm text-gray-600">Active Bots</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{aiDecisions.length}</div>
                  <div className="text-sm text-gray-600">AI Decisions</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(activeBots).reduce((sum, bot) => sum + (bot.tasksCompleted || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
              </div>

              {/* Available Bots */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'seedBot', name: 'Seed Bot', emoji: '🤖', cost: 15000, unlockLevel: 15, description: 'Automatically plants optimal crops based on market conditions' },
                  { id: 'harvestBot', name: 'Harvest Bot', emoji: '🚜', cost: 18000, unlockLevel: 18, description: 'Harvests crops at optimal ripeness for maximum value' },
                  { id: 'careBot', name: 'Care Bot', emoji: '💧', cost: 12000, unlockLevel: 12, description: 'Provides precision watering, fertilizing, and pest control' },
                  { id: 'analyticsBot', name: 'Analytics Bot', emoji: '🧠', cost: 25000, unlockLevel: 20, description: 'Provides market predictions and optimization strategies' },
                  { id: 'droneSwarm', name: 'Drone Swarm', emoji: '🚁', cost: 35000, unlockLevel: 25, description: 'Aerial monitoring and precision agriculture from above' }
                ].map((bot) => {
                  const owned = activeBots[bot.id];
                  const canDeploy = level >= bot.unlockLevel && money >= bot.cost && aiEnergy >= 20;
                  
                  return (
                    <div key={bot.id} className={`p-4 border-2 rounded-lg ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-2xl mb-1">{bot.emoji}</div>
                          <div className="font-semibold">{bot.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{bot.description}</div>
                          <div className="text-xs">
                            <div>Unlock Level: {bot.unlockLevel}</div>
                            <div>Energy Cost: 20/hour</div>
                          </div>
                        </div>
                        {owned && (
                          <div className="text-center">
                            <div className="text-green-500 text-xl">🟢</div>
                            <div className="text-xs text-gray-600">Level {owned.aiLevel || 1}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-lg font-bold text-green-600 mb-3">${bot.cost.toLocaleString()}</div>
                      
                      {!owned ? (
                        <button
                          onClick={() => {
                            if (canDeploy) {
                              setMoney(prev => prev - bot.cost);
                              setAiEnergy(prev => Math.max(0, prev - 20));
                              setActiveBots(prev => ({ 
                                ...prev, 
                                [bot.id]: { 
                                  ...bot, 
                                  aiLevel: 1,
                                  deployedAt: Date.now(),
                                  tasksCompleted: 0,
                                  status: 'active'
                                }
                              }));
                              addNotification(`🤖 ${bot.name} deployed successfully!`, 'success');
                            }
                          }}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          disabled={!canDeploy}
                        >
                          {level < bot.unlockLevel ? `Level ${bot.unlockLevel} Required` : 
                           aiEnergy < 20 ? 'Low Bot Energy' : 'Deploy Bot'}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-center bg-green-500 text-white py-2 rounded">
                            Active - {owned.tasksCompleted || 0} tasks completed
                          </div>
                          <button
                            onClick={() => {
                              const upgradeCost = bot.cost * 0.6;
                              if (money >= upgradeCost) {
                                setMoney(prev => prev - upgradeCost);
                                setActiveBots(prev => ({
                                  ...prev,
                                  [bot.id]: {
                                    ...prev[bot.id],
                                    aiLevel: (prev[bot.id].aiLevel || 1) + 1
                                  }
                                }));
                                addNotification(`⬆️ ${bot.name} upgraded!`, 'success');
                              }
                            }}
                            className="w-full px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            Upgrade (${Math.round(bot.cost * 0.6).toLocaleString()})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Recent AI Decisions */}
              {aiDecisions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">🧠 Recent AI Decisions</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {aiDecisions.slice(0, 10).map((decision, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>
                          {decision.type === 'plant' && `🌱 Planted ${decision.crop} on plot ${decision.plotId + 1}`}
                          {decision.type === 'harvest' && `🚜 Harvested plot ${decision.plotId + 1}`}
                          {decision.type === 'water' && `💧 Watered plot ${decision.plotId + 1}`}
                          {decision.type === 'fertilize' && `🌿 Fertilized plot ${decision.plotId + 1}`}
                        </span>
                        <span className="text-gray-500">
                          {new Date(decision.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Livestock Tab */}
        {activeTab === 'livestock' && (
          <div className="space-y-6">
            {/* Buy Animals */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🐄 Buy Livestock</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(LIVESTOCK).map(([key, animal]) => (
                  <div key={key} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="text-3xl mb-2">{animal.emoji}</div>
                    <div className="font-semibold">{animal.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Produces ${animal.income} every {animal.interval}s
                    </div>
                    <button
                      onClick={() => buyAnimal(key)}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      disabled={money < animal.cost}
                    >
                      Buy for ${animal.cost}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Animals */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏠 Your Animals ({Object.keys(livestock).length})</h2>
              {Object.keys(livestock).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🐑</div>
                  <p>No animals yet. Buy some livestock to start earning passive income!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(livestock).map(([animalId, animal]) => {
                    const animalData = LIVESTOCK[animal.type];
                    const timeSinceFed = gameTime - animal.lastFed;
                    const canFeed = timeSinceFed >= 30;
                    const isHungry = timeSinceFed > animalData.interval;
                    
                    return (
                      <div key={animalId} className={`p-4 border-2 rounded-lg ${isHungry ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="text-2xl mb-1">{animalData.emoji}</div>
                        <div className="text-sm font-semibold">{animalData.name}</div>
                        <div className="text-xs text-gray-600 mb-2">
                          Fed: {Math.max(0, 30 - timeSinceFed)}s ago
                        </div>
                        <button
                          onClick={() => feedAnimal(animalId)}
                          className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 disabled:opacity-50"
                          disabled={!canFeed}
                        >
                          🌾 Feed {canFeed ? '' : `(${30 - timeSinceFed}s)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breeding/Genetics Tab */}
        {activeTab === 'breeding' && (
          <div className="space-y-6">
            {/* Weather Forecast */}
            {buildings.weatherStation && weatherForecast.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">📡 5-Day Weather Forecast</h2>
                <div className="grid grid-cols-5 gap-2">
                  {weatherForecast.map(day => (
                    <div key={day.day} className="text-center p-2 border rounded">
                      <div className="text-lg">{WEATHER[day.weather].emoji}</div>
                      <div className="text-xs">Day {day.day}</div>
                      <div className="text-xs">{WEATHER[day.weather].name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seed Quality Upgrade */}
            {buildings.seedProcessor && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">⚙️ Seed Quality Enhancement</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(CROPS).map(([cropKey, crop]) => {
                    const currentQuality = seedQualities[cropKey];
                    const qualityData = SEED_QUALITIES[currentQuality];
                    const qualityLevels = ['bronze', 'silver', 'gold', 'platinum'];
                    const currentIndex = qualityLevels.indexOf(currentQuality);
                    const canUpgrade = currentIndex < qualityLevels.length - 1;
                    const cost = canUpgrade ? (currentIndex + 2) * 500 : 0;
                    
                    return (
                      <div key={cropKey} className="border-2 border-gray-200 rounded-lg p-4">
                        <div className="text-2xl mb-2">{crop.emoji}</div>
                        <div className="font-semibold">{crop.name}</div>
                        <div className={`text-sm ${qualityData.color}`}>
                          {qualityData.emoji} {qualityData.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">Seeds: {seeds[cropKey]}</div>
                        {canUpgrade ? (
                          <button
                            onClick={() => upgradeSeedQuality(cropKey)}
                            className="w-full px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                            disabled={money < cost || seeds[cropKey] < 10}
                          >
                            Upgrade (${cost})
                          </button>
                        ) : (
                          <div className="w-full px-3 py-1 bg-gold text-white rounded text-sm text-center">
                            Max Quality
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hybrid Breeding */}
            {buildings.breedingLab && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">🧬 Crop Breeding Laboratory</h2>
                
                {/* Hybrid Seeds Inventory */}
                {Object.keys(hybridSeeds).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">🌟 Hybrid Seeds</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(hybridSeeds).map(([hybridKey, quantity]) => {
                        const hybridData = Object.values(HYBRID_COMBINATIONS).find(h => h.result === hybridKey);
                        return hybridData && quantity > 0 ? (
                          <div key={hybridKey} className="border-2 border-purple-300 bg-purple-50 rounded-lg p-3">
                            <div className="text-2xl mb-1">{hybridData.emoji}</div>
                            <div className="font-semibold text-sm">{hybridData.name}</div>
                            <div className="text-xs text-purple-600">Quantity: {quantity}</div>
                            <div className="text-xs text-gray-500">
                              Traits: {hybridData.traits.map(t => GENETIC_TRAITS[t].emoji).join('')}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Breeding Interface */}
                <h3 className="text-lg font-bold mb-2">🔬 Create Hybrid Crops</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(HYBRID_COMBINATIONS).map(([combo, hybrid]) => {
                    const [crop1, crop2] = combo.split('+');
                    const canBreed = seeds[crop1] >= 5 && seeds[crop2] >= 5;
                    
                    return (
                      <div key={combo} className="border-2 border-blue-200 rounded-lg p-4">
                        <div className="text-center mb-3">
                          <div className="text-lg">{CROPS[crop1].emoji} + {CROPS[crop2].emoji}</div>
                          <div className="text-xs text-gray-600">{CROPS[crop1].name} + {CROPS[crop2].name}</div>
                        </div>
                        <div className="text-center mb-3">
                          <div className="text-2xl">🧬</div>
                          <div className="text-lg font-bold">{hybrid.emoji}</div>
                          <div className="font-semibold text-sm">{hybrid.name}</div>
                        </div>
                        <div className="text-xs text-gray-600 mb-3">
                          <div>Value: ${hybrid.baseValue}</div>
                          <div>Growth: {hybrid.growTime}s</div>
                          <div>Traits: {hybrid.traits.map(t => GENETIC_TRAITS[t].emoji).join('')}</div>
                        </div>
                        <button
                          onClick={() => breedCrops(crop1, crop2)}
                          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          disabled={!canBreed}
                        >
                          Breed (5+5 seeds)
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Genetics Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🧬 Genetic Traits Reference</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(GENETIC_TRAITS).map(([traitKey, trait]) => (
                  <div key={traitKey} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{trait.emoji}</span>
                      <span className="font-semibold">{trait.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{trait.description}</div>
                    <div className="text-xs">
                      <div className="grid grid-cols-4 gap-1">
                        {Object.entries(trait.levels).map(([quality, value]) => (
                          <div key={quality} className="text-center">
                            <div className={SEED_QUALITIES[quality].color}>
                              {SEED_QUALITIES[quality].emoji}
                            </div>
                            <div>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Building Requirements */}
            {(!buildings.breedingLab || !buildings.seedProcessor) && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">🏗️ Required Buildings</h3>
                <div className="text-sm text-yellow-700">
                  {!buildings.breedingLab && <div>• Build a Breeding Laboratory to create hybrid crops</div>}
                  {!buildings.seedProcessor && <div>• Build a Seed Processor to upgrade seed quality</div>}
                  {!buildings.weatherStation && <div>• Build a Weather Station for weather forecasts</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🔬 Research Tree</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800">Research Points: {researchPoints}</div>
              <div className="text-sm text-blue-600">Earn 1 point per harvest</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(research).map(([key, item]) => (
                <div key={key} className={`p-4 border-2 rounded-lg ${item.unlocked ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                    {item.unlocked && <div className="text-green-500 text-xl">✅</div>}
                  </div>
                  {!item.unlocked && (
                    <button
                      onClick={() => buyResearch(key)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={researchPoints < item.cost}
                    >
                      Research ({item.cost} points)
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Advanced Automation Systems */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold mb-4">🤖 Advanced Automation Systems</h3>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-purple-800">Automation Status</div>
                  <button
                    onClick={() => setAutomationEnabled(!automationEnabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      automationEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {automationEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <div className="text-sm text-purple-600">
                  Maintenance Fund: ${automationFunds} | 
                  Active Systems: {Object.values(automationSystems).filter(s => s.active).length}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(AUTOMATION_SYSTEMS).map(([systemId, system]) => {
                  const owned = automationSystems[systemId];
                  const canAfford = money >= system.cost;
                  const levelMet = level >= system.unlockLevel;
                  
                  return (
                    <div key={systemId} className={`p-4 border-2 rounded-lg ${
                      owned ? (owned.active ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50') : 
                      (!canAfford || !levelMet) ? 'border-gray-200 bg-gray-50' : 
                      'border-gray-200 hover:border-purple-300'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-3xl mb-2">{system.emoji}</div>
                          <div className="font-semibold">{system.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{system.description}</div>
                        </div>
                        <div className="text-right">
                          {owned && (
                            <div className={`text-xl ${owned.active ? 'text-green-500' : 'text-orange-500'}`}>
                              {owned.active ? '🟢' : '🟡'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Benefits */}
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-purple-700 mb-1">Capabilities:</h4>
                        <ul className="text-xs text-purple-600 space-y-1">
                          {system.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* System Stats */}
                      <div className="mb-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded">
                            <div className="font-semibold">Efficiency</div>
                            <div className="text-purple-600">{system.efficiency}%</div>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <div className="font-semibold">Maintenance</div>
                            <div className="text-purple-600">${system.maintenance}/hr</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Requirements */}
                      <div className="mb-3 text-xs text-gray-600">
                        <div className={level >= system.unlockLevel ? 'text-green-600' : 'text-red-600'}>
                          ▶ Level {system.unlockLevel} {level >= system.unlockLevel ? '✓' : '✗'}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-lg font-bold text-purple-600 mb-2">${system.cost}</div>
                        {!owned ? (
                          <button
                            onClick={() => buyAutomationSystem(systemId)}
                            disabled={!canAfford || !levelMet}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
                          >
                            Install System
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => toggleAutomation(systemId)}
                              className={`w-full px-4 py-2 rounded ${
                                owned.active 
                                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {owned.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="text-xs text-center text-gray-600">
                              Efficiency: {owned.efficiency}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Automation Control Panel */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">🎛️ Automation Control Panel</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-semibold text-green-700 mb-2">Auto-Farming</h5>
                    <div className="text-sm text-gray-600">
                      {automationSystems.cropAutomation?.active ? (
                        <div className="text-green-600">
                          ✅ Crops auto-managed<br/>
                          🌱 Next plant cycle: 2m<br/>
                          💧 Water cycle: Active
                        </div>
                      ) : (
                        <div className="text-gray-500">❌ Manual farming mode</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-semibold text-blue-700 mb-2">Auto-Livestock</h5>
                    <div className="text-sm text-gray-600">
                      {automationSystems.livestockAutomation?.active ? (
                        <div className="text-blue-600">
                          ✅ Livestock auto-cared<br/>
                          🥛 Collection: Active<br/>
                          🍖 Feeding: Scheduled
                        </div>
                      ) : (
                        <div className="text-gray-500">❌ Manual livestock care</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-semibold text-purple-700 mb-2">Smart Systems</h5>
                    <div className="text-sm text-gray-600">
                      <div>Trade AI: {automationSystems.tradeAutomation?.active ? '🟢' : '🔴'}</div>
                      <div>Weather AI: {automationSystems.weatherAutomation?.active ? '🟢' : '🔴'}</div>
                      <div>Master AI: {automationSystems.masterAutomation?.active ? '🟢' : '🔴'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Maintenance Funding */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Maintenance Fund</span>
                    <span className="text-lg font-bold">${automationFunds}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (money >= 1000) {
                          setMoney(prev => prev - 1000);
                          setAutomationFunds(prev => prev + 1000);
                          addNotification('💰 Added $1000 to automation fund!', 'success');
                        }
                      }}
                      disabled={money < 1000}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
                    >
                      Add $1000
                    </button>
                    <button
                      onClick={() => {
                        if (money >= 5000) {
                          setMoney(prev => prev - 5000);
                          setAutomationFunds(prev => prev + 5000);
                          addNotification('💰 Added $5000 to automation fund!', 'success');
                        }
                      }}
                      disabled={money < 5000}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      Add $5000
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Hourly cost: ${Object.entries(automationSystems)
                      .filter(([_, data]) => data.active)
                      .reduce((sum, [systemId, _]) => sum + AUTOMATION_SYSTEMS[systemId].maintenance, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏆 Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(achievements).map(([key, achievement]) => (
                <div key={key} className={`p-4 border-2 rounded-lg ${achievement.unlocked ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{achievement.name}</div>
                        {achievement.unlocked && <div className="text-yellow-500 text-xl">🏆</div>}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                      <div className="text-sm font-medium text-green-600">Reward: ${achievement.reward}</div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="mt-2 text-xs bg-yellow-200 px-2 py-1 rounded text-yellow-800">
                      ✨ Completed!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">📊 Farm Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Financial Stats */}
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-3">💰 Financial</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Money:</span>
                    <span className="font-bold">${money}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earned:</span>
                    <span className="text-green-600">${totalEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="text-red-600">${totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit:</span>
                    <span className={`font-bold ${totalEarned - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${totalEarned - totalSpent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farm Stats */}
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">🌱 Farm Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="font-bold">{level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{Math.floor(experience)} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Harvests:</span>
                    <span>{totalHarvests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Farm Size:</span>
                    <span>{farmSize}x{farmSize} ({farmSize * farmSize} plots)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Research Points:</span>
                    <span>{researchPoints}</span>
                  </div>
                </div>
              </div>

              {/* Livestock Stats */}
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3">🐄 Livestock</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Animals:</span>
                    <span className="font-bold">{Object.keys(livestock).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buildings Built:</span>
                    <span>{Object.keys(buildings).length}</span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(LIVESTOCK).map(([type, data]) => {
                      const count = Object.values(livestock).filter(animal => animal.type === type).length;
                      return count > 0 ? (
                        <div key={type} className="flex justify-between">
                          <span>{data.emoji} {data.name}s:</span>
                          <span>{count}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Tools & Research */}
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">🔧 Tools & Research</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tools Owned:</span>
                    <span className="font-bold">{Object.values(tools).filter(Boolean).length}/4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Research Unlocked:</span>
                    <span>{Object.values(research).filter(r => r.unlocked).length}/4</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Active Tools:</div>
                    {Object.entries(tools).map(([tool, owned]) => 
                      owned ? (
                        <div key={tool} className="text-xs text-green-600">
                          ✓ {tool.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-3">🏆 Achievements</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-bold">
                      {Object.values(achievements).filter(a => a.unlocked).length}/{Object.keys(achievements).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievement Rewards:</span>
                    <span className="text-green-600">
                      ${Object.values(achievements).filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ 
                        width: `${(Object.values(achievements).filter(a => a.unlocked).length / Object.keys(achievements).length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                <h3 className="font-semibold text-cyan-800 mb-3">📦 Inventory</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-gray-600 mb-1">Seeds:</div>
                  {Object.entries(seeds).map(([crop, count]) => (
                    <div key={crop} className="flex justify-between">
                      <span>{CROPS[crop].emoji} {CROPS[crop].name}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-600 mb-1 mt-3">Feed:</div>
                  {Object.entries(feed).map(([feedType, count]) => (
                    <div key={feedType} className="flex justify-between">
                      <span>{feedType}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Game Time */}
            <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-700">
                ⏱️ Playing Time: {Math.floor(gameTime / 60)}m {gameTime % 60}s
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Weather changes every 60 seconds • Current: {WEATHER[currentWeather].emoji} {WEATHER[currentWeather].name}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">⚙️ Game Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Save/Load Section */}
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">💾 Save & Load</h3>
                <div className="space-y-3">
                  <button
                    onClick={saveGame}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    💾 Save Game
                  </button>
                  <button
                    onClick={loadGame}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📁 Load Game
                  </button>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-600">Auto-Save:</span>
                    <button
                      onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        autoSaveEnabled 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {autoSaveEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Auto-save occurs every 30 seconds when enabled
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3">🎨 Display</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Animations:</span>
                    <button
                      onClick={() => setAnimations(!animations)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        animations 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {animations ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tutorial:</span>
                    <button
                      onClick={() => setShowTutorial(!showTutorial)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        showTutorial 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {showTutorial ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sound Effects:</span>
                    <button
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        if (!soundEnabled) {
                          soundManager.enable();
                          soundManager.playSuccess();
                        } else {
                          soundManager.disable();
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        soundEnabled 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {soundEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Game Reset */}
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <h3 className="font-semibold text-red-800 mb-3">🔄 Reset Game</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to restart the tutorial? This will reset tutorial progress only.')) {
                        setTutorialStep(0);
                        setShowTutorial(true);
                        addNotification('📚 Tutorial restarted!', 'info');
                      }
                    }}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    📚 Restart Tutorial
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
                        localStorage.removeItem('farmLifeSave');
                        window.location.reload();
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🗑️ Reset All Data
                  </button>
                  <div className="text-xs text-red-600">
                    ⚠️ Warning: Reset All Data will permanently delete your saved game!
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">ℹ️ Game Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-mono">v2.3.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Save File Size:</span>
                    <span className="font-mono">
                      {(() => {
                        try {
                          const saveData = localStorage.getItem('farmLifeSave');
                          return saveData ? `${Math.round(new Blob([saveData]).size / 1024)}KB` : 'No Save';
                        } catch {
                          return 'Unknown';
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Play Time:</span>
                    <span>{Math.floor(gameTime / 60)}m {gameTime % 60}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievements:</span>
                    <span>{Object.values(achievements).filter(a => a.unlocked).length}/{Object.keys(achievements).length}</span>
                  </div>
                </div>
              </div>

              {/* Export/Import Save */}
              <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200 md:col-span-2">
                <h3 className="font-semibold text-indigo-800 mb-3">🔄 Export/Import Save</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      try {
                        const saveData = localStorage.getItem('farmLifeSave');
                        if (saveData) {
                          const blob = new Blob([saveData], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `farmlife-save-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          addNotification('📤 Save file exported!', 'success');
                        } else {
                          addNotification('❌ No save file to export!', 'error');
                        }
                      } catch (error) {
                        addNotification('❌ Failed to export save!', 'error');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    📤 Export Save
                  </button>
                  <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer text-center">
                    📥 Import Save
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const saveData = event.target.result;
                              JSON.parse(saveData); // Validate JSON
                              localStorage.setItem('farmLifeSave', saveData);
                              addNotification('📥 Save file imported! Reload to apply.', 'success');
                            } catch (error) {
                              addNotification('❌ Invalid save file!', 'error');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Export your save file to backup your progress or share with friends. Import to restore a backup.
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      
      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial && tutorialStep < TUTORIAL_STEPS.length}
        step={tutorialStep}
        totalSteps={TUTORIAL_STEPS.length}
        title={TUTORIAL_STEPS[tutorialStep]?.title || ''}
        content={TUTORIAL_STEPS[tutorialStep]?.content || ''}
        position="center"
        onNext={() => {
          if (tutorialStep < TUTORIAL_STEPS.length - 1) {
            setTutorialStep(tutorialStep + 1);
          } else {
            setShowTutorial(false);
            addNotification('🎓 Tutorial completed! Happy farming!', 'success');
          }
        }}
        onPrevious={() => {
          if (tutorialStep > 0) {
            setTutorialStep(tutorialStep - 1);
          }
        }}
        onSkip={() => {
          setShowTutorial(false);
          addNotification('📚 Tutorial skipped. Access it anytime in Settings!', 'info');
        }}
      />
    </div>
  );
}
