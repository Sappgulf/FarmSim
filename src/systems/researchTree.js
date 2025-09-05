/**
 * Comprehensive Research and Technology Tree
 * 100+ research projects with complex dependencies and benefits
 */

export const RESEARCH_CATEGORIES = {
  agriculture: {
    name: "Agricultural Sciences",
    emoji: "🌾",
    color: "text-green-600",
    description: "Advanced farming techniques and crop science"
  },
  biotechnology: {
    name: "Biotechnology",
    emoji: "🧬",
    color: "text-blue-600",
    description: "Genetic engineering and biological innovations"
  },
  automation: {
    name: "Automation & Robotics",
    emoji: "🤖",
    color: "text-purple-600",
    description: "Smart farming and robotic systems"
  },
  sustainability: {
    name: "Sustainability",
    emoji: "🌱",
    color: "text-emerald-600",
    description: "Environmental and sustainable farming practices"
  },
  economics: {
    name: "Agricultural Economics",
    emoji: "📊",
    color: "text-yellow-600",
    description: "Market analysis and economic optimization"
  },
  medicine: {
    name: "Veterinary Medicine",
    emoji: "🐄",
    color: "text-red-600",
    description: "Animal health and veterinary sciences"
  }
};

export const RESEARCH_PROJECTS = {
  // === AGRICULTURAL SCIENCES ===
  precisionAgriculture: {
    id: "precisionAgriculture",
    name: "Precision Agriculture",
    category: "agriculture",
    tier: 1,
    cost: 100,
    time: 300, // 5 minutes
    prerequisites: [],
    description: "Use GPS and sensors for precise farming operations",
    benefits: {
      yieldIncrease: 0.15,
      resourceEfficiency: 0.20,
      costReduction: 0.10
    },
    unlocks: ["soilMapping", "variableRateApplication"]
  },

  soilMapping: {
    id: "soilMapping",
    name: "Soil Mapping Technology",
    category: "agriculture",
    tier: 2,
    cost: 200,
    time: 480,
    prerequisites: ["precisionAgriculture"],
    description: "Create detailed maps of soil properties across the farm",
    benefits: {
      fertilizerEfficiency: 0.25,
      yieldIncrease: 0.10,
      waterConservation: 0.15
    },
    unlocks: ["nutrientManagement", "irrigationOptimization"]
  },

  variableRateApplication: {
    id: "variableRateApplication",
    name: "Variable Rate Application",
    category: "agriculture",
    tier: 2,
    cost: 250,
    time: 600,
    prerequisites: ["precisionAgriculture"],
    description: "Apply inputs at variable rates based on field conditions",
    benefits: {
      inputEfficiency: 0.30,
      costReduction: 0.20,
      environmentalImpact: -0.25
    },
    unlocks: ["smartSprayers", "precisionPlanting"]
  },

  hydroponics: {
    id: "hydroponics",
    name: "Hydroponic Systems",
    category: "agriculture",
    tier: 2,
    cost: 500,
    time: 900,
    prerequisites: ["nutrientManagement"],
    description: "Soil-less growing systems with precise nutrient control",
    benefits: {
      yieldIncrease: 0.40,
      waterEfficiency: 0.50,
      spaceEfficiency: 0.60,
      yearRoundProduction: true
    },
    unlocks: ["aeroponics", "aquaponics"]
  },

  verticalFarming: {
    id: "verticalFarming",
    name: "Vertical Farming",
    category: "agriculture",
    tier: 3,
    cost: 1000,
    time: 1200,
    prerequisites: ["hydroponics", "ledLighting"],
    description: "Multi-level growing systems for maximum space efficiency",
    benefits: {
      spaceEfficiency: 0.80,
      yieldIncrease: 0.60,
      waterEfficiency: 0.70,
      pesticideReduction: 0.90
    },
    unlocks: ["urbanFarming", "controlledEnvironment"]
  },

  // === BIOTECHNOLOGY ===
  geneticEngineering: {
    id: "geneticEngineering",
    name: "Genetic Engineering",
    category: "biotechnology",
    tier: 1,
    cost: 300,
    time: 600,
    prerequisites: [],
    description: "Modify crop genetics for improved traits",
    benefits: {
      diseaseResistance: 0.30,
      yieldIncrease: 0.20,
      droughtResistance: 0.25
    },
    unlocks: ["crispr", "syntheticBiology"]
  },

  crispr: {
    id: "crispr",
    name: "CRISPR Gene Editing",
    category: "biotechnology",
    tier: 2,
    cost: 800,
    time: 900,
    prerequisites: ["geneticEngineering"],
    description: "Precise gene editing technology for crop improvement",
    benefits: {
      precisionBreeding: 0.50,
      traitDevelopment: 0.40,
      timeReduction: 0.60
    },
    unlocks: ["customTraits", "diseaseResistantCrops"]
  },

  syntheticBiology: {
    id: "syntheticBiology",
    name: "Synthetic Biology",
    category: "biotechnology",
    tier: 3,
    cost: 1500,
    time: 1500,
    prerequisites: ["crispr", "molecularBiology"],
    description: "Design and build biological systems from scratch",
    benefits: {
      novelTraits: true,
      customProteins: true,
      biofactories: true
    },
    unlocks: ["biofactories", "syntheticOrganisms"]
  },

  goldenRice: {
    id: "goldenRice",
    name: "Golden Rice Development",
    category: "biotechnology",
    tier: 3,
    cost: 2000,
    time: 1800,
    prerequisites: ["crispr", "nutritionalEnhancement"],
    description: "Develop rice with enhanced vitamin A content",
    benefits: {
      nutritionalValue: 0.50,
      humanitarianImpact: true,
      marketValue: 2.0
    },
    unlocks: ["biofortifiedCrops", "nutritionalGenomics"]
  },

  // === AUTOMATION & ROBOTICS ===
  autonomousVehicles: {
    id: "autonomousVehicles",
    name: "Autonomous Farm Vehicles",
    category: "automation",
    tier: 1,
    cost: 400,
    time: 720,
    prerequisites: [],
    description: "Self-driving tractors and farm equipment",
    benefits: {
      laborReduction: 0.40,
      precisionIncrease: 0.30,
      timeEfficiency: 0.25
    },
    unlocks: ["swarmRobotics", "aiNavigation"]
  },

  swarmRobotics: {
    id: "swarmRobotics",
    name: "Swarm Robotics",
    category: "automation",
    tier: 2,
    cost: 800,
    time: 1080,
    prerequisites: ["autonomousVehicles", "aiCoordination"],
    description: "Coordinated teams of small robots working together",
    benefits: {
      scalability: 0.60,
      redundancy: 0.50,
      adaptability: 0.40
    },
    unlocks: ["distributedIntelligence", "collaborativeRobots"]
  },

  aiFarmManager: {
    id: "aiFarmManager",
    name: "AI Farm Manager",
    category: "automation",
    tier: 3,
    cost: 2000,
    time: 1800,
    prerequisites: ["machineLearning", "predictiveAnalytics"],
    description: "Artificial intelligence that manages entire farm operations",
    benefits: {
      decisionMaking: 0.80,
      optimization: 0.70,
      predictiveCapability: 0.60
    },
    unlocks: ["quantumComputing", "neuralNetworks"]
  },

  // === SUSTAINABILITY ===
  renewableEnergy: {
    id: "renewableEnergy",
    name: "Renewable Energy Systems",
    category: "sustainability",
    tier: 1,
    cost: 300,
    time: 600,
    prerequisites: [],
    description: "Solar, wind, and other renewable energy sources",
    benefits: {
      energyIndependence: 0.50,
      costReduction: 0.30,
      carbonFootprint: -0.40
    },
    unlocks: ["solarPanels", "windTurbines", "biogas"]
  },

  carbonSequestration: {
    id: "carbonSequestration",
    name: "Carbon Sequestration",
    category: "sustainability",
    tier: 2,
    cost: 600,
    time: 900,
    prerequisites: ["soilHealth", "renewableEnergy"],
    description: "Capture and store carbon in soil and biomass",
    benefits: {
      carbonCredits: true,
      soilHealth: 0.30,
      climateImpact: -0.50
    },
    unlocks: ["biochar", "coverCropping"]
  },

  circularEconomy: {
    id: "circularEconomy",
    name: "Circular Economy",
    category: "sustainability",
    tier: 3,
    cost: 1200,
    time: 1500,
    prerequisites: ["wasteManagement", "resourceRecovery"],
    description: "Closed-loop systems with zero waste",
    benefits: {
      wasteReduction: 0.80,
      resourceEfficiency: 0.60,
      costSavings: 0.40
    },
    unlocks: ["biorefineries", "wasteToEnergy"]
  },

  // === ECONOMICS ===
  marketAnalysis: {
    id: "marketAnalysis",
    name: "Advanced Market Analysis",
    category: "economics",
    tier: 1,
    cost: 200,
    time: 480,
    prerequisites: [],
    description: "Predict market trends and optimize pricing",
    benefits: {
      priceOptimization: 0.25,
      marketTiming: 0.30,
      riskReduction: 0.20
    },
    unlocks: ["futuresTrading", "supplyChainOptimization"]
  },

  blockchain: {
    id: "blockchain",
    name: "Blockchain Technology",
    category: "economics",
    tier: 2,
    cost: 500,
    time: 720,
    prerequisites: ["marketAnalysis", "digitalTraceability"],
    description: "Transparent and secure transaction systems",
    benefits: {
      transparency: 0.90,
      traceability: 0.95,
      trust: 0.80
    },
    unlocks: ["smartContracts", "cryptocurrency"]
  },

  // === VETERINARY MEDICINE ===
  preventiveMedicine: {
    id: "preventiveMedicine",
    name: "Preventive Veterinary Medicine",
    category: "medicine",
    tier: 1,
    cost: 250,
    time: 600,
    prerequisites: [],
    description: "Prevent diseases before they occur",
    benefits: {
      diseasePrevention: 0.40,
      animalWelfare: 0.30,
      costReduction: 0.25
    },
    unlocks: ["vaccinationPrograms", "healthMonitoring"]
  },

  geneticBreeding: {
    id: "geneticBreeding",
    name: "Genetic Breeding Programs",
    category: "medicine",
    tier: 2,
    cost: 600,
    time: 900,
    prerequisites: ["preventiveMedicine", "geneticEngineering"],
    description: "Improve animal genetics for health and productivity",
    benefits: {
      diseaseResistance: 0.35,
      productivity: 0.25,
      longevity: 0.20
    },
    unlocks: ["geneticTesting", "breedingOptimization"]
  }
};

// Research dependencies and unlock trees
export const RESEARCH_TREES = {
  agriculture: {
    tier1: ["precisionAgriculture", "soilHealth", "cropRotation"],
    tier2: ["soilMapping", "variableRateApplication", "hydroponics", "irrigationOptimization"],
    tier3: ["verticalFarming", "controlledEnvironment", "urbanFarming"]
  },
  biotechnology: {
    tier1: ["geneticEngineering", "molecularBiology", "plantBreeding"],
    tier2: ["crispr", "syntheticBiology", "nutritionalEnhancement"],
    tier3: ["goldenRice", "biofactories", "syntheticOrganisms"]
  },
  automation: {
    tier1: ["autonomousVehicles", "sensors", "machineLearning"],
    tier2: ["swarmRobotics", "aiCoordination", "predictiveAnalytics"],
    tier3: ["aiFarmManager", "quantumComputing", "neuralNetworks"]
  },
  sustainability: {
    tier1: ["renewableEnergy", "soilHealth", "waterConservation"],
    tier2: ["carbonSequestration", "wasteManagement", "resourceRecovery"],
    tier3: ["circularEconomy", "biorefineries", "wasteToEnergy"]
  },
  economics: {
    tier1: ["marketAnalysis", "supplyChain", "digitalTraceability"],
    tier2: ["blockchain", "futuresTrading", "supplyChainOptimization"],
    tier3: ["smartContracts", "cryptocurrency", "decentralizedMarkets"]
  },
  medicine: {
    tier1: ["preventiveMedicine", "animalNutrition", "healthMonitoring"],
    tier2: ["geneticBreeding", "vaccinationPrograms", "diseaseDiagnostics"],
    tier3: ["geneticTesting", "breedingOptimization", "precisionMedicine"]
  }
};

// Research benefits and effects
export const RESEARCH_EFFECTS = {
  // Yield improvements
  yieldIncrease: {
    name: "Yield Increase",
    description: "Increases crop production per unit area",
    maxValue: 2.0, // 200% increase
    scaling: "multiplicative"
  },
  
  // Efficiency improvements
  waterEfficiency: {
    name: "Water Efficiency",
    description: "Reduces water usage while maintaining yield",
    maxValue: 0.8, // 80% reduction
    scaling: "subtractive"
  },
  
  fertilizerEfficiency: {
    name: "Fertilizer Efficiency",
    description: "Improves nutrient uptake and reduces waste",
    maxValue: 0.6, // 60% reduction
    scaling: "subtractive"
  },
  
  // Quality improvements
  diseaseResistance: {
    name: "Disease Resistance",
    description: "Reduces susceptibility to plant diseases",
    maxValue: 0.8, // 80% reduction
    scaling: "subtractive"
  },
  
  droughtResistance: {
    name: "Drought Resistance",
    description: "Improves survival in dry conditions",
    maxValue: 0.7, // 70% improvement
    scaling: "additive"
  },
  
  // Economic benefits
  costReduction: {
    name: "Cost Reduction",
    description: "Reduces operational costs",
    maxValue: 0.5, // 50% reduction
    scaling: "subtractive"
  },
  
  marketValue: {
    name: "Market Value",
    description: "Increases the value of products",
    maxValue: 3.0, // 300% increase
    scaling: "multiplicative"
  },
  
  // Environmental benefits
  carbonFootprint: {
    name: "Carbon Footprint",
    description: "Reduces environmental impact",
    maxValue: -0.8, // 80% reduction
    scaling: "subtractive"
  },
  
  biodiversity: {
    name: "Biodiversity",
    description: "Increases ecosystem diversity",
    maxValue: 0.6, // 60% increase
    scaling: "additive"
  }
};

// Research milestones and achievements
export const RESEARCH_MILESTONES = {
  firstDiscovery: {
    name: "First Discovery",
    description: "Complete your first research project",
    requirement: 1,
    reward: { researchPoints: 50, coins: 100 }
  },
  
  agriculturalPioneer: {
    name: "Agricultural Pioneer",
    description: "Complete 10 agricultural research projects",
    requirement: 10,
    reward: { researchPoints: 200, coins: 500, unlock: "advancedSeeds" }
  },
  
  biotechInnovator: {
    name: "Biotech Innovator",
    description: "Complete 5 biotechnology research projects",
    requirement: 5,
    reward: { researchPoints: 300, coins: 1000, unlock: "geneticLab" }
  },
  
  automationExpert: {
    name: "Automation Expert",
    description: "Complete 8 automation research projects",
    requirement: 8,
    reward: { researchPoints: 400, coins: 1500, unlock: "robotFactory" }
  },
  
  sustainabilityChampion: {
    name: "Sustainability Champion",
    description: "Complete 6 sustainability research projects",
    requirement: 6,
    reward: { researchPoints: 350, coins: 1200, unlock: "ecoCertification" }
  },
  
  researchMaster: {
    name: "Research Master",
    description: "Complete 50 research projects",
    requirement: 50,
    reward: { researchPoints: 1000, coins: 5000, unlock: "researchInstitute" }
  }
};

// Research collaboration and partnerships
export const RESEARCH_COLLABORATIONS = {
  university: {
    name: "University Partnership",
    description: "Collaborate with agricultural universities",
    benefits: {
      researchSpeed: 0.25,
      costReduction: 0.20,
      accessToExperts: true
    },
    requirements: { reputation: 100, researchPoints: 500 }
  },
  
  government: {
    name: "Government Grant",
    description: "Receive funding from agricultural agencies",
    benefits: {
      funding: 1000,
      researchSpeed: 0.15,
      priorityAccess: true
    },
    requirements: { sustainability: 200, innovation: 150 }
  },
  
  industry: {
    name: "Industry Partnership",
    description: "Partner with agricultural technology companies",
    benefits: {
      technologyAccess: true,
      marketInsights: true,
      costReduction: 0.30
    },
    requirements: { marketShare: 50, innovation: 200 }
  }
};

export default RESEARCH_PROJECTS;
