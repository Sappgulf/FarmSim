/**
 * Comprehensive Livestock System
 * Advanced animal husbandry with breeding, genetics, and production
 */

export const LIVESTOCK_SPECIES = {
  // === DAIRY ANIMALS ===
  cow: {
    name: "Holstein Cow",
    emoji: "🐄",
    category: "dairy",
    baseCost: 500,
    maintenanceCost: 20,
    spaceRequired: 4,
    lifespan: 20, // years
    maturityAge: 2, // years
    breedingAge: 2,
    gestationPeriod: 9, // months
    maxOffspring: 1,
    production: {
      milk: {
        daily: 25, // liters
        quality: "high",
        seasonality: "year-round"
      },
      manure: {
        daily: 30, // kg
        fertilizerValue: 0.8
      }
    },
    feed: {
      grass: 15, // kg daily
      hay: 8,
      grain: 3,
      water: 50 // liters
    },
    health: {
      baseHealth: 100,
      diseaseResistance: 0.7,
      stressResistance: 0.6
    },
    genetics: {
      milkProduction: { min: 0.8, max: 1.2, heritability: 0.3 },
      diseaseResistance: { min: 0.6, max: 1.0, heritability: 0.4 },
      feedEfficiency: { min: 0.9, max: 1.1, heritability: 0.5 }
    },
    breeds: ["holstein", "jersey", "guernsey", "ayrshire"],
    specialTraits: ["highMilk", "docile", "hardy"]
  },

  goat: {
    name: "Nubian Goat",
    emoji: "🐐",
    category: "dairy",
    baseCost: 200,
    maintenanceCost: 8,
    spaceRequired: 1,
    lifespan: 15,
    maturityAge: 1,
    breedingAge: 1,
    gestationPeriod: 5,
    maxOffspring: 2,
    production: {
      milk: {
        daily: 3,
        quality: "premium",
        seasonality: "seasonal"
      },
      manure: {
        daily: 2,
        fertilizerValue: 0.9
      }
    },
    feed: {
      grass: 2,
      hay: 1,
      browse: 3,
      water: 5
    },
    health: {
      baseHealth: 85,
      diseaseResistance: 0.8,
      stressResistance: 0.7
    },
    genetics: {
      milkProduction: { min: 0.7, max: 1.3, heritability: 0.4 },
      diseaseResistance: { min: 0.7, max: 1.0, heritability: 0.3 },
      feedEfficiency: { min: 0.8, max: 1.2, heritability: 0.4 }
    },
    breeds: ["nubian", "saanen", "alpine", "boer"],
    specialTraits: ["agile", "browsing", "mountainAdapted"]
  },

  // === MEAT ANIMALS ===
  pig: {
    name: "Berkshire Pig",
    emoji: "🐷",
    category: "meat",
    baseCost: 300,
    maintenanceCost: 15,
    spaceRequired: 2,
    lifespan: 12,
    maturityAge: 0.5,
    breedingAge: 0.5,
    gestationPeriod: 3.5,
    maxOffspring: 8,
    production: {
      meat: {
        yield: 0.7, // kg per kg live weight
        quality: "premium",
        processingTime: 6 // months
      },
      manure: {
        daily: 5,
        fertilizerValue: 0.7
      }
    },
    feed: {
      grain: 2.5,
      vegetables: 1,
      water: 8
    },
    health: {
      baseHealth: 90,
      diseaseResistance: 0.6,
      stressResistance: 0.8
    },
    genetics: {
      growthRate: { min: 0.8, max: 1.2, heritability: 0.4 },
      meatQuality: { min: 0.7, max: 1.3, heritability: 0.5 },
      feedEfficiency: { min: 0.9, max: 1.1, heritability: 0.6 }
    },
    breeds: ["berkshire", "yorkshire", "duroc", "hampshire"],
    specialTraits: ["fastGrowing", "omnivorous", "intelligent"]
  },

  sheep: {
    name: "Merino Sheep",
    emoji: "🐑",
    category: "fiber",
    baseCost: 250,
    maintenanceCost: 10,
    spaceRequired: 1.5,
    lifespan: 12,
    maturityAge: 1,
    breedingAge: 1,
    gestationPeriod: 5,
    maxOffspring: 2,
    production: {
      wool: {
        annual: 4, // kg
        quality: "fine",
        seasonality: "annual"
      },
      meat: {
        yield: 0.5,
        quality: "good",
        processingTime: 12
      },
      manure: {
        daily: 2,
        fertilizerValue: 0.8
      }
    },
    feed: {
      grass: 3,
      hay: 1,
      water: 4
    },
    health: {
      baseHealth: 80,
      diseaseResistance: 0.7,
      stressResistance: 0.9
    },
    genetics: {
      woolQuality: { min: 0.8, max: 1.2, heritability: 0.6 },
      diseaseResistance: { min: 0.6, max: 1.0, heritability: 0.4 },
      hardiness: { min: 0.7, max: 1.3, heritability: 0.5 }
    },
    breeds: ["merino", "suffolk", "dorset", "romney"],
    specialTraits: ["grazing", "hardy", "flocking"]
  },

  // === POULTRY ===
  chicken: {
    name: "Rhode Island Red",
    emoji: "🐔",
    category: "poultry",
    baseCost: 15,
    maintenanceCost: 1,
    spaceRequired: 0.1,
    lifespan: 8,
    maturityAge: 0.2, // 2.5 months
    breedingAge: 0.2,
    gestationPeriod: 0.02, // 21 days
    maxOffspring: 12,
    production: {
      eggs: {
        daily: 0.8,
        quality: "good",
        seasonality: "year-round"
      },
      meat: {
        yield: 0.6,
        quality: "good",
        processingTime: 0.5
      },
      manure: {
        daily: 0.1,
        fertilizerValue: 0.9
      }
    },
    feed: {
      grain: 0.12,
      insects: 0.05,
      water: 0.2
    },
    health: {
      baseHealth: 70,
      diseaseResistance: 0.6,
      stressResistance: 0.7
    },
    genetics: {
      eggProduction: { min: 0.8, max: 1.2, heritability: 0.3 },
      diseaseResistance: { min: 0.5, max: 1.0, heritability: 0.4 },
      foraging: { min: 0.7, max: 1.3, heritability: 0.5 }
    },
    breeds: ["rhodeIslandRed", "leghorn", "sussex", "orpington"],
    specialTraits: ["foraging", "hardy", "prolific"]
  },

  duck: {
    name: "Pekin Duck",
    emoji: "🦆",
    category: "poultry",
    baseCost: 25,
    maintenanceCost: 1.5,
    spaceRequired: 0.2,
    lifespan: 10,
    maturityAge: 0.3,
    breedingAge: 0.3,
    gestationPeriod: 0.03, // 28 days
    maxOffspring: 8,
    production: {
      eggs: {
        daily: 0.6,
        quality: "premium",
        seasonality: "seasonal"
      },
      meat: {
        yield: 0.7,
        quality: "premium",
        processingTime: 0.4
      },
      feathers: {
        annual: 0.5,
        quality: "good"
      }
    },
    feed: {
      grain: 0.15,
      aquatic: 0.1,
      water: 0.5
    },
    health: {
      baseHealth: 75,
      diseaseResistance: 0.7,
      stressResistance: 0.8
    },
    genetics: {
      eggProduction: { min: 0.7, max: 1.3, heritability: 0.4 },
      waterAdaptation: { min: 0.8, max: 1.2, heritability: 0.6 },
      foraging: { min: 0.6, max: 1.4, heritability: 0.5 }
    },
    breeds: ["pekin", "mallard", "muscovy", "khakiCampbell"],
    specialTraits: ["aquatic", "foraging", "pestControl"]
  },

  // === SPECIALTY ANIMALS ===
  alpaca: {
    name: "Huacaya Alpaca",
    emoji: "🦙",
    category: "fiber",
    baseCost: 800,
    maintenanceCost: 12,
    spaceRequired: 2,
    lifespan: 20,
    maturityAge: 2,
    breedingAge: 2,
    gestationPeriod: 11,
    maxOffspring: 1,
    production: {
      fiber: {
        annual: 3, // kg
        quality: "luxury",
        seasonality: "annual"
      },
      manure: {
        daily: 1.5,
        fertilizerValue: 0.9
      }
    },
    feed: {
      grass: 2,
      hay: 1,
      water: 3
    },
    health: {
      baseHealth: 85,
      diseaseResistance: 0.8,
      stressResistance: 0.6
    },
    genetics: {
      fiberQuality: { min: 0.7, max: 1.3, heritability: 0.7 },
      temperament: { min: 0.6, max: 1.0, heritability: 0.5 },
      hardiness: { min: 0.8, max: 1.2, heritability: 0.4 }
    },
    breeds: ["huacaya", "suri"],
    specialTraits: ["luxuryFiber", "gentle", "mountainAdapted"]
  },

  rabbit: {
    name: "New Zealand Rabbit",
    emoji: "🐰",
    category: "meat",
    baseCost: 50,
    maintenanceCost: 2,
    spaceRequired: 0.2,
    lifespan: 8,
    maturityAge: 0.2,
    breedingAge: 0.2,
    gestationPeriod: 0.03, // 31 days
    maxOffspring: 8,
    production: {
      meat: {
        yield: 0.6,
        quality: "lean",
        processingTime: 0.3
      },
      fur: {
        annual: 0.3,
        quality: "good"
      },
      manure: {
        daily: 0.2,
        fertilizerValue: 1.0
      }
    },
    feed: {
      hay: 0.1,
      vegetables: 0.05,
      water: 0.3
    },
    health: {
      baseHealth: 80,
      diseaseResistance: 0.7,
      stressResistance: 0.5
    },
    genetics: {
      growthRate: { min: 0.8, max: 1.2, heritability: 0.5 },
      reproduction: { min: 0.7, max: 1.3, heritability: 0.4 },
      diseaseResistance: { min: 0.6, max: 1.0, heritability: 0.3 }
    },
    breeds: ["newZealand", "californian", "rex", "angora"],
    specialTraits: ["fastBreeding", "efficient", "quiet"]
  },

  // === AQUACULTURE ===
  fish: {
    name: "Rainbow Trout",
    emoji: "🐟",
    category: "aquaculture",
    baseCost: 100,
    maintenanceCost: 5,
    spaceRequired: 0.5, // per 100 fish
    lifespan: 7,
    maturityAge: 2,
    breedingAge: 2,
    gestationPeriod: 0.08, // 3 months
    maxOffspring: 1000,
    production: {
      meat: {
        yield: 0.8,
        quality: "premium",
        processingTime: 1.5
      },
      roe: {
        annual: 0.1,
        quality: "premium"
      }
    },
    feed: {
      pellets: 0.02,
      insects: 0.01,
      water: 0.1
    },
    health: {
      baseHealth: 75,
      diseaseResistance: 0.6,
      stressResistance: 0.7
    },
    genetics: {
      growthRate: { min: 0.8, max: 1.2, heritability: 0.4 },
      diseaseResistance: { min: 0.5, max: 1.0, heritability: 0.3 },
      waterQuality: { min: 0.7, max: 1.3, heritability: 0.5 }
    },
    breeds: ["rainbowTrout", "brownTrout", "brookTrout", "steelhead"],
    specialTraits: ["coldWater", "carnivorous", "sensitive"]
  },

  // === EXOTIC ANIMALS ===
  ostrich: {
    name: "African Ostrich",
    emoji: "🦆",
    category: "exotic",
    baseCost: 2000,
    maintenanceCost: 30,
    spaceRequired: 10,
    lifespan: 50,
    maturityAge: 3,
    breedingAge: 3,
    gestationPeriod: 1.5, // 6 weeks
    maxOffspring: 15,
    production: {
      meat: {
        yield: 0.4,
        quality: "premium",
        processingTime: 12
      },
      eggs: {
        annual: 40,
        quality: "giant",
        seasonality: "seasonal"
      },
      feathers: {
        annual: 1,
        quality: "luxury"
      }
    },
    feed: {
      grass: 5,
      grain: 2,
      water: 10
    },
    health: {
      baseHealth: 90,
      diseaseResistance: 0.8,
      stressResistance: 0.7
    },
    genetics: {
      size: { min: 0.9, max: 1.1, heritability: 0.6 },
      eggProduction: { min: 0.7, max: 1.3, heritability: 0.4 },
      temperament: { min: 0.5, max: 1.0, heritability: 0.5 }
    },
    breeds: ["african", "masai", "somali"],
    specialTraits: ["giant", "fast", "territorial"]
  }
};

// Animal categories
export const ANIMAL_CATEGORIES = {
  dairy: { name: "Dairy", emoji: "🥛", color: "text-blue-600" },
  meat: { name: "Meat", emoji: "🥩", color: "text-red-600" },
  fiber: { name: "Fiber", emoji: "🧶", color: "text-purple-600" },
  poultry: { name: "Poultry", emoji: "🐔", color: "text-orange-600" },
  aquaculture: { name: "Aquaculture", emoji: "🐟", color: "text-cyan-600" },
  exotic: { name: "Exotic", emoji: "🦆", color: "text-pink-600" }
};

// Breeding system
export const BREEDING_SYSTEM = {
  // Genetic traits that can be improved through breeding
  traits: {
    production: {
      name: "Production",
      description: "Increases output of primary products",
      maxLevel: 10,
      heritability: 0.3
    },
    health: {
      name: "Health",
      description: "Reduces disease susceptibility",
      maxLevel: 10,
      heritability: 0.4
    },
    efficiency: {
      name: "Feed Efficiency",
      description: "Reduces feed requirements",
      maxLevel: 10,
      heritability: 0.5
    },
    temperament: {
      name: "Temperament",
      description: "Improves handling and reduces stress",
      maxLevel: 10,
      heritability: 0.4
    },
    hardiness: {
      name: "Hardiness",
      description: "Increases resistance to environmental stress",
      maxLevel: 10,
      heritability: 0.3
    }
  },

  // Breeding strategies
  strategies: {
    lineBreeding: {
      name: "Line Breeding",
      description: "Breed closely related animals to fix traits",
      risk: "high",
      reward: "high",
      inbreedingRisk: 0.3
    },
    outcrossing: {
      name: "Outcrossing",
      description: "Breed unrelated animals for hybrid vigor",
      risk: "low",
      reward: "medium",
      inbreedingRisk: 0.0
    },
    backcrossing: {
      name: "Backcrossing",
      description: "Breed hybrid back to parent to recover traits",
      risk: "medium",
      reward: "medium",
      inbreedingRisk: 0.1
    }
  }
};

// Animal health and disease system
export const HEALTH_SYSTEM = {
  diseases: {
    mastitis: {
      name: "Mastitis",
      species: ["cow", "goat"],
      symptoms: ["reducedMilk", "fever", "swelling"],
      treatment: "antibiotics",
      prevention: "hygiene",
      severity: "moderate"
    },
    footRot: {
      name: "Foot Rot",
      species: ["sheep", "goat"],
      symptoms: ["lameness", "swelling", "odor"],
      treatment: "antibiotics",
      prevention: "dryConditions",
      severity: "moderate"
    },
    coccidiosis: {
      name: "Coccidiosis",
      species: ["chicken", "rabbit"],
      symptoms: ["diarrhea", "lethargy", "weightLoss"],
      treatment: "antiprotozoal",
      prevention: "cleanliness",
      severity: "high"
    },
    ich: {
      name: "Ichthyophthirius",
      species: ["fish"],
      symptoms: ["whiteSpots", "scratching", "lethargy"],
      treatment: "antiparasitic",
      prevention: "waterQuality",
      severity: "high"
    }
  },

  treatments: {
    antibiotics: { cost: 50, effectiveness: 0.9, sideEffects: ["resistance"] },
    antiprotozoal: { cost: 30, effectiveness: 0.8, sideEffects: ["toxicity"] },
    antiparasitic: { cost: 40, effectiveness: 0.85, sideEffects: ["waterQuality"] },
    vaccination: { cost: 20, effectiveness: 0.95, sideEffects: [] }
  }
};

// Animal welfare and ethics
export const WELFARE_SYSTEM = {
  requirements: {
    space: {
      minimum: 1.0, // square meters per animal
      recommended: 2.0,
      luxury: 5.0
    },
    social: {
      herd: ["cow", "sheep", "alpaca"],
      pair: ["duck", "rabbit"],
      solitary: ["ostrich"]
    },
    enrichment: {
      toys: ["pig", "rabbit"],
      scratching: ["cow", "sheep"],
      swimming: ["duck", "fish"]
    }
  },

  stressFactors: {
    overcrowding: 0.3,
    isolation: 0.2,
    poorNutrition: 0.4,
    disease: 0.5,
    weather: 0.1
  }
};

export default LIVESTOCK_SPECIES;
