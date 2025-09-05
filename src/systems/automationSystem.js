/**
 * Advanced Automation System
 * AI-powered farmhands, robotic systems, and smart farming technology
 */

export const AUTOMATION_TYPES = {
  // === BASIC AUTOMATION ===
  sprinkler: {
    name: "Smart Sprinkler System",
    emoji: "💧",
    category: "irrigation",
    cost: 500,
    maintenanceCost: 10,
    energyConsumption: 2,
    efficiency: 0.8,
    coverage: 9, // plots
    features: ["moistureSensing", "weatherIntegration", "scheduling"],
    upgrades: ["precisionNozzles", "soilSensors", "weatherStation"],
    description: "Automatically waters crops based on soil moisture and weather"
  },

  fertilizer: {
    name: "Automated Fertilizer Spreader",
    emoji: "🌱",
    category: "nutrition",
    cost: 800,
    maintenanceCost: 15,
    energyConsumption: 3,
    efficiency: 0.9,
    coverage: 12,
    features: ["nutrientAnalysis", "variableRate", "timing"],
    upgrades: ["soilTesting", "precisionApplication", "organicOptions"],
    description: "Applies fertilizer based on soil analysis and crop needs"
  },

  harvester: {
    name: "Autonomous Harvester",
    emoji: "🚜",
    category: "harvesting",
    cost: 2000,
    maintenanceCost: 50,
    energyConsumption: 10,
    efficiency: 0.95,
    coverage: 25,
    features: ["ripenessDetection", "gentleHandling", "sorting"],
    upgrades: ["aiVision", "qualitySorting", "packaging"],
    description: "Harvests crops at optimal ripeness with minimal damage"
  },

  // === ADVANCED AUTOMATION ===
  drone: {
    name: "Agricultural Drone",
    emoji: "🚁",
    category: "monitoring",
    cost: 1500,
    maintenanceCost: 25,
    energyConsumption: 5,
    efficiency: 0.85,
    coverage: 100,
    features: ["aerialImaging", "pestDetection", "growthMonitoring"],
    upgrades: ["thermalImaging", "spraying", "aiAnalysis"],
    description: "Monitors crops from above and detects issues early"
  },

  robot: {
    name: "Farm Robot",
    emoji: "🤖",
    category: "general",
    cost: 5000,
    maintenanceCost: 100,
    energyConsumption: 15,
    efficiency: 0.9,
    coverage: 50,
    features: ["multiTask", "learning", "adaptation"],
    upgrades: ["aiBrain", "toolSwitching", "collaboration"],
    description: "Versatile robot that can perform multiple farming tasks"
  },

  greenhouse: {
    name: "Smart Greenhouse",
    emoji: "🏠",
    category: "environment",
    cost: 3000,
    maintenanceCost: 75,
    energyConsumption: 20,
    efficiency: 0.95,
    coverage: 36,
    features: ["climateControl", "lighting", "ventilation"],
    upgrades: ["co2Enrichment", "hydroponics", "aiOptimization"],
    description: "Controlled environment for year-round crop production"
  },

  // === AI SYSTEMS ===
  aiManager: {
    name: "AI Farm Manager",
    emoji: "🧠",
    category: "intelligence",
    cost: 10000,
    maintenanceCost: 200,
    energyConsumption: 50,
    efficiency: 0.98,
    coverage: 200,
    features: ["predictiveAnalytics", "optimization", "learning"],
    upgrades: ["machineLearning", "weatherPrediction", "marketAnalysis"],
    description: "AI system that manages entire farm operations"
  },

  blockchain: {
    name: "Blockchain Tracker",
    emoji: "⛓️",
    category: "traceability",
    cost: 2000,
    maintenanceCost: 30,
    energyConsumption: 10,
    efficiency: 1.0,
    coverage: 1000,
    features: ["traceability", "certification", "transparency"],
    upgrades: ["smartContracts", "marketplace", "sustainability"],
    description: "Tracks products from farm to consumer with blockchain"
  }
};

// AI Farmhand personalities and specializations
export const AI_FARMHANDS = {
  // === SPECIALIZED FARMHANDS ===
  cropSpecialist: {
    name: "Crop Specialist",
    emoji: "🌾",
    personality: "analytical",
    specialization: "crops",
    skills: {
      planting: 0.9,
      harvesting: 0.8,
      pestControl: 0.7,
      soilAnalysis: 0.9,
      weatherPrediction: 0.6
    },
    traits: ["detailOriented", "patient", "knowledgeable"],
    cost: 1000,
    maintenanceCost: 50,
    description: "Expert in crop cultivation and soil management"
  },

  livestockExpert: {
    name: "Livestock Expert",
    emoji: "🐄",
    personality: "caring",
    specialization: "animals",
    skills: {
      animalCare: 0.9,
      breeding: 0.8,
      healthMonitoring: 0.9,
      feeding: 0.8,
      milking: 0.7
    },
    traits: ["empathetic", "observant", "gentle"],
    cost: 1200,
    maintenanceCost: 60,
    description: "Specialized in animal husbandry and welfare"
  },

  mechanic: {
    name: "Farm Mechanic",
    emoji: "🔧",
    personality: "practical",
    specialization: "machinery",
    skills: {
      repair: 0.9,
      maintenance: 0.9,
      optimization: 0.7,
      troubleshooting: 0.8,
      innovation: 0.6
    },
    traits: ["handsOn", "problemSolver", "reliable"],
    cost: 800,
    maintenanceCost: 40,
    description: "Keeps all farm equipment running smoothly"
  },

  marketAnalyst: {
    name: "Market Analyst",
    emoji: "📊",
    personality: "strategic",
    specialization: "economics",
    skills: {
      marketAnalysis: 0.9,
      pricePrediction: 0.8,
      trading: 0.7,
      riskAssessment: 0.8,
      optimization: 0.7
    },
    traits: ["strategic", "dataDriven", "opportunistic"],
    cost: 1500,
    maintenanceCost: 75,
    description: "Analyzes markets and optimizes farm economics"
  },

  // === GENERALIST FARMHANDS ===
  allRounder: {
    name: "All-Rounder",
    emoji: "👨‍🌾",
    personality: "versatile",
    specialization: "general",
    skills: {
      planting: 0.7,
      harvesting: 0.7,
      animalCare: 0.6,
      repair: 0.6,
      marketAnalysis: 0.5
    },
    traits: ["adaptable", "hardworking", "loyal"],
    cost: 600,
    maintenanceCost: 30,
    description: "Versatile worker capable of handling various tasks"
  },

  apprentice: {
    name: "AI Apprentice",
    emoji: "🎓",
    personality: "learning",
    specialization: "development",
    skills: {
      learning: 0.9,
      adaptation: 0.8,
      innovation: 0.7,
      collaboration: 0.8,
      problemSolving: 0.7
    },
    traits: ["curious", "eager", "growing"],
    cost: 400,
    maintenanceCost: 20,
    description: "Young AI that learns and improves over time"
  }
};

// Automation tasks and priorities
export const AUTOMATION_TASKS = {
  // === URGENT TASKS ===
  watering: {
    name: "Watering",
    priority: "urgent",
    frequency: "daily",
    duration: 2, // hours
    energyCost: 5,
    successRate: 0.9,
    requirements: ["water", "energy"],
    automation: ["sprinkler", "robot"]
  },

  harvesting: {
    name: "Harvesting",
    priority: "high",
    frequency: "asNeeded",
    duration: 4,
    energyCost: 10,
    successRate: 0.95,
    requirements: ["energy", "storage"],
    automation: ["harvester", "robot"]
  },

  // === REGULAR TASKS ===
  fertilizing: {
    name: "Fertilizing",
    priority: "medium",
    frequency: "weekly",
    duration: 3,
    energyCost: 8,
    successRate: 0.85,
    requirements: ["fertilizer", "energy"],
    automation: ["fertilizer", "robot"]
  },

  pestControl: {
    name: "Pest Control",
    priority: "medium",
    frequency: "asNeeded",
    duration: 2,
    energyCost: 6,
    successRate: 0.8,
    requirements: ["pesticide", "energy"],
    automation: ["drone", "robot"]
  },

  // === MONITORING TASKS ===
  healthCheck: {
    name: "Health Monitoring",
    priority: "low",
    frequency: "daily",
    duration: 1,
    energyCost: 2,
    successRate: 0.95,
    requirements: ["sensors"],
    automation: ["drone", "aiManager"]
  },

  soilAnalysis: {
    name: "Soil Analysis",
    priority: "low",
    frequency: "weekly",
    duration: 1,
    energyCost: 3,
    successRate: 0.9,
    requirements: ["sensors", "lab"],
    automation: ["robot", "aiManager"]
  }
};

// Smart farming technologies
export const SMART_TECHNOLOGIES = {
  // === SENSORS ===
  soilSensors: {
    name: "Soil Moisture Sensors",
    type: "sensor",
    cost: 100,
    dataPoints: ["moisture", "ph", "nutrients", "temperature"],
    accuracy: 0.95,
    batteryLife: 365, // days
    description: "Monitors soil conditions in real-time"
  },

  weatherStation: {
    name: "Weather Station",
    type: "sensor",
    cost: 500,
    dataPoints: ["temperature", "humidity", "rainfall", "wind", "pressure"],
    accuracy: 0.98,
    batteryLife: 30,
    description: "Provides hyperlocal weather data"
  },

  // === AI SYSTEMS ===
  computerVision: {
    name: "Computer Vision System",
    type: "ai",
    cost: 2000,
    capabilities: ["diseaseDetection", "ripenessAssessment", "pestIdentification"],
    accuracy: 0.92,
    processingPower: "high",
    description: "AI that can see and identify crop issues"
  },

  predictiveAnalytics: {
    name: "Predictive Analytics",
    type: "ai",
    cost: 3000,
    capabilities: ["yieldPrediction", "diseaseForecasting", "marketAnalysis"],
    accuracy: 0.88,
    processingPower: "veryHigh",
    description: "Predicts future outcomes based on data patterns"
  },

  // === CONNECTIVITY ===
  iotNetwork: {
    name: "IoT Network",
    type: "connectivity",
    cost: 1000,
    capabilities: ["deviceCommunication", "dataCollection", "remoteControl"],
    range: 1000, // meters
    reliability: 0.99,
    description: "Connects all farm devices and sensors"
  },

  cloudPlatform: {
    name: "Cloud Platform",
    type: "connectivity",
    cost: 500,
    capabilities: ["dataStorage", "processing", "analytics", "sharing"],
    storage: 1000, // GB
    uptime: 0.999,
    description: "Cloud-based platform for farm data management"
  }
};

// Automation efficiency and optimization
export const EFFICIENCY_SYSTEM = {
  // Performance metrics
  metrics: {
    energyEfficiency: {
      name: "Energy Efficiency",
      description: "Energy used per unit of work",
      target: 0.8,
      measurement: "kWh per task"
    },
    timeEfficiency: {
      name: "Time Efficiency",
      description: "Time saved compared to manual work",
      target: 0.7,
      measurement: "hours saved per day"
    },
    resourceEfficiency: {
      name: "Resource Efficiency",
      description: "Resources saved through optimization",
      target: 0.6,
      measurement: "percentage reduction"
    },
    qualityEfficiency: {
      name: "Quality Efficiency",
      description: "Consistency and quality of output",
      target: 0.9,
      measurement: "success rate"
    }
  },

  // Optimization strategies
  strategies: {
    loadBalancing: {
      name: "Load Balancing",
      description: "Distribute tasks evenly across available systems",
      benefit: 0.15,
      implementation: "medium"
    },
    predictiveMaintenance: {
      name: "Predictive Maintenance",
      description: "Maintain equipment before it breaks",
      benefit: 0.25,
      implementation: "high"
    },
    adaptiveScheduling: {
      name: "Adaptive Scheduling",
      description: "Adjust schedules based on conditions",
      benefit: 0.20,
      implementation: "medium"
    },
    resourceOptimization: {
      name: "Resource Optimization",
      description: "Optimize use of water, fertilizer, and energy",
      benefit: 0.30,
      implementation: "high"
    }
  }
};

// Integration with existing systems
export const SYSTEM_INTEGRATION = {
  weatherIntegration: {
    name: "Weather Integration",
    description: "Automation responds to weather conditions",
    benefits: ["waterConservation", "diseasePrevention", "optimalTiming"],
    requirements: ["weatherStation", "aiManager"]
  },

  marketIntegration: {
    name: "Market Integration",
    description: "Automation adjusts based on market conditions",
    benefits: ["priceOptimization", "demandResponse", "profitMaximization"],
    requirements: ["marketAnalyst", "blockchain"]
  },

  sustainabilityIntegration: {
    name: "Sustainability Integration",
    description: "Automation focuses on environmental sustainability",
    benefits: ["carbonReduction", "waterConservation", "biodiversity"],
    requirements: ["aiManager", "sensors"]
  }
};

export default AUTOMATION_TYPES;
