// Community Features System
// Adds social gameplay with neighboring farms, markets, challenges, and tours

// Neighboring Farm Types
const NEIGHBOR_FARMS = {
  organic: {
    name: "Green Valley Organic",
    owner: "Emma Thompson",
    emoji: "🌿",
    specialty: "organic_crops",
    personality: "eco_friendly",
    tradePreferences: ["organic_fertilizer", "compost", "heirloom_seeds"],
    producesWell: ["organic_wheat", "organic_tomato", "herbs"],
    tradingStyle: "generous", // pays 110% market price for wanted items
    description: "A sustainable farm focused on organic practices"
  },
  tech: {
    name: "Future Farms Inc",
    owner: "Dr. Alex Chen",
    emoji: "🔬",
    specialty: "hybrid_crops",
    personality: "innovative",
    tradePreferences: ["research_data", "hybrid_seeds", "tech_equipment"],
    producesWell: ["hybrid_corn", "gmo_crops", "lab_vegetables"],
    tradingStyle: "premium", // pays 120% for tech items, 90% for basic crops
    description: "High-tech farm using cutting-edge agricultural science"
  },
  livestock: {
    name: "Happy Pastures Ranch",
    owner: "Jake Martinez",
    emoji: "🐄",
    specialty: "animal_products",
    personality: "traditional",
    tradePreferences: ["animal_feed", "hay", "veterinary_supplies"],
    producesWell: ["milk", "eggs", "cheese", "wool"],
    tradingStyle: "bulk", // prefers large quantity trades
    description: "Family ranch specializing in happy, healthy livestock"
  },
  exotic: {
    name: "Tropical Paradise Farm",
    owner: "Luna Rodriguez",
    emoji: "🌺",
    specialty: "rare_crops",
    personality: "adventurous",
    tradePreferences: ["rare_seeds", "tropical_fruits", "spices"],
    producesWell: ["dragon_fruit", "passion_fruit", "exotic_spices"],
    tradingStyle: "exclusive", // trades rare items only
    description: "Exotic farm growing the world's most unique crops"
  },
  community: {
    name: "Community Garden Co-op",
    owner: "The Collective",
    emoji: "🤝",
    specialty: "cooperation",
    personality: "helpful",
    tradePreferences: ["shared_resources", "community_projects", "seeds"],
    producesWell: ["community_crops", "shared_harvest", "cooperation_points"],
    tradingStyle: "cooperative", // uses barter system
    description: "A cooperative farm focused on community building"
  }
};

// Farmer's Market Events
const FARMERS_MARKET_EVENTS = {
  weekly: [
    {
      id: "fresh_produce_fair",
      name: "🥕 Fresh Produce Fair",
      description: "Bring your freshest crops for premium prices!",
      duration: 2400, // 40 minutes
      bonuses: {
        fresh_crop_multiplier: 1.4,
        quality_bonus: 1.3,
        organic_premium: 1.2
      },
      requirements: { level: 5 },
      probability: 0.8
    },
    {
      id: "seed_swap_saturday",
      name: "🌱 Seed Swap Saturday",
      description: "Trade seeds with other farmers for variety!",
      duration: 1800, // 30 minutes
      bonuses: {
        seed_trade_bonus: 0.5, // 50% off seed costs
        rare_seed_chance: 0.3
      },
      specialOffers: ["rare_seeds", "heirloom_varieties", "hybrid_starters"],
      requirements: { level: 3 },
      probability: 0.6
    },
    {
      id: "livestock_showcase",
      name: "🐔 Livestock Showcase",
      description: "Show off your animals and trade breeding stock!",
      duration: 3600, // 1 hour
      bonuses: {
        animal_happiness_boost: 20,
        breeding_success_rate: 1.5,
        livestock_value: 1.3
      },
      requirements: { livestock_count: 5 },
      probability: 0.4
    },
    {
      id: "preserves_contest",
      name: "🫙 Preserves & Processing Contest",
      description: "Best processed goods win prizes and recognition!",
      duration: 2700, // 45 minutes
      bonuses: {
        processing_efficiency: 1.6,
        processed_value: 1.5,
        recipe_discovery: 0.4
      },
      requirements: { processing_facilities: 1 },
      probability: 0.5
    }
  ],
  monthly: [
    {
      id: "harvest_festival",
      name: "🎃 Grand Harvest Festival",
      description: "Month-long celebration of farming achievements!",
      duration: 7200, // 2 hours
      bonuses: {
        all_crop_multiplier: 1.8,
        xp_multiplier: 2.0,
        community_points: 100
      },
      rewards: {
        festival_ribbon: 1,
        premium_seeds: 25,
        festival_decorations: 10
      },
      requirements: { level: 10 },
      probability: 1.0 // guaranteed monthly
    }
  ]
};

// Cooperative Challenge Types
const COOPERATIVE_CHALLENGES = {
  supply_drive: {
    name: "🚚 Community Supply Drive",
    description: "Work together to supply the local food bank!",
    duration: 10800, // 3 hours
    goals: {
      wheat: 500,
      vegetables: 300,
      fruits: 200,
      dairy: 100
    },
    rewards: {
      community_points: 200,
      supply_drive_medal: 1,
      tax_reduction: 0.1, // 10% tax reduction for a week
      reputation: 50
    },
    minParticipants: 1, // can do solo but better with others
    maxParticipants: 10
  },
  research_project: {
    name: "🔬 Agricultural Research Project",
    description: "Collaborate on developing new farming techniques!",
    duration: 14400, // 4 hours
    goals: {
      research_points: 1000,
      experimental_plots: 50,
      data_samples: 200
    },
    rewards: {
      research_breakthrough: 1,
      new_crop_variety: 1,
      science_points: 500,
      innovation_badge: 1
    },
    minParticipants: 3,
    maxParticipants: 8
  },
  disaster_relief: {
    name: "🌪️ Disaster Relief Effort",
    description: "Help rebuild farms affected by natural disasters!",
    duration: 7200, // 2 hours
    goals: {
      building_materials: 100,
      emergency_supplies: 150,
      volunteer_hours: 300
    },
    rewards: {
      hero_status: 1,
      disaster_preparedness: 1,
      community_gratitude: 100,
      relief_medal: 1
    },
    minParticipants: 2,
    maxParticipants: 12
  },
  innovation_fair: {
    name: "💡 Innovation Fair",
    description: "Showcase and share farming innovations!",
    duration: 5400, // 1.5 hours
    goals: {
      innovations_shared: 25,
      workshops_attended: 40,
      technology_demos: 15
    },
    rewards: {
      innovation_points: 300,
      tech_upgrade: 1,
      inventor_title: 1,
      patent_application: 1
    },
    minParticipants: 1,
    maxParticipants: 15
  }
};

// Farm Tour Destinations
const TOUR_DESTINATIONS = {
  showcase_farms: [
    {
      id: "rainbow_acres",
      name: "🌈 Rainbow Acres",
      owner: "Iris Bloom",
      theme: "colorful_crops",
      features: ["flower_gardens", "rainbow_vegetables", "butterfly_sanctuary"],
      inspiration_bonus: "crop_variety",
      visit_cost: 50,
      rewards: { inspiration_points: 25, flower_seeds: 10 },
      description: "A vibrant farm showcasing crops in every color of the rainbow"
    },
    {
      id: "clockwork_farm",
      name: "⚙️ Clockwork Precision Farm",
      owner: "Gears McGillicuddy",
      theme: "automation",
      features: ["robot_harvesters", "automated_irrigation", "ai_planning"],
      inspiration_bonus: "automation_efficiency",
      visit_cost: 100,
      rewards: { automation_blueprints: 3, efficiency_boost: 7 },
      description: "A marvel of agricultural automation and precision"
    },
    {
      id: "heritage_homestead",
      name: "🏚️ Heritage Homestead",
      owner: "Grandpa Wilkins",
      theme: "traditional",
      features: ["heirloom_varieties", "traditional_tools", "old_techniques"],
      inspiration_bonus: "crop_resilience",
      visit_cost: 25,
      rewards: { heirloom_seeds: 15, wisdom_points: 30 },
      description: "A traditional farm preserving ancient farming wisdom"
    }
  ],
  educational_tours: [
    {
      id: "university_research",
      name: "🎓 University Research Station",
      theme: "education",
      features: ["research_labs", "experimental_plots", "student_projects"],
      learning_bonus: "research_efficiency",
      visit_cost: 75,
      rewards: { research_points: 100, knowledge_certificate: 1 },
      description: "Learn cutting-edge agricultural science"
    }
  ]
};

// Community System Class
class CommunitySystem {
  constructor() {
    this.neighbors = {};
    this.activeMarketEvents = [];
    this.activeChallenges = [];
    this.communityPoints = 0;
    this.reputation = 100;
    this.lastMarketEventCheck = Date.now();
    this.marketEventInterval = 900000; // Check every 15 minutes
    this.completedTours = [];
    this.tradingHistory = [];
    this.challengeParticipation = [];
    
    this.initializeNeighbors();
  }

  initializeNeighbors() {
    // Create neighbor farm instances with random characteristics
    Object.entries(NEIGHBOR_FARMS).forEach(([key, farmTemplate]) => {
      this.neighbors[key] = {
        ...farmTemplate,
        relationship: 50, // 0-100 relationship level
        lastTradeTime: 0,
        inventory: this.generateNeighborInventory(farmTemplate),
        currentNeeds: this.generateNeighborNeeds(farmTemplate),
        tradeCooldown: 0
      };
    });
  }

  generateNeighborInventory(farmTemplate) {
    const inventory = {};
    farmTemplate.producesWell.forEach(item => {
      inventory[item] = Math.floor(Math.random() * 50) + 10;
    });
    return inventory;
  }

  generateNeighborNeeds(farmTemplate) {
    const needs = {};
    farmTemplate.tradePreferences.forEach(item => {
      if (Math.random() < 0.6) { // 60% chance they need this item
        needs[item] = Math.floor(Math.random() * 20) + 5;
      }
    });
    return needs;
  }

  update(gameState) {
    const now = Date.now();
    
    // Check for new farmer's market events
    if (now - this.lastMarketEventCheck > this.marketEventInterval) {
      this.checkForMarketEvents(gameState);
      this.lastMarketEventCheck = now;
    }
    
    // Update active market events
    this.updateMarketEvents();
    
    // Update neighbor relationships and inventories
    this.updateNeighbors(gameState);
    
    // Update active challenges
    this.updateChallenges(gameState);
    
    return {
      neighbors: this.neighbors,
      activeMarketEvents: this.activeMarketEvents,
      activeChallenges: this.activeChallenges,
      communityPoints: this.communityPoints,
      reputation: this.reputation
    };
  }

  checkForMarketEvents(gameState) {
    // Check for weekly events
    FARMERS_MARKET_EVENTS.weekly.forEach(eventTemplate => {
      if (this.meetsEventRequirements(eventTemplate, gameState)) {
        if (Math.random() < eventTemplate.probability) {
          this.startMarketEvent(eventTemplate);
        }
      }
    });

    // Check for monthly events (higher chance on certain days)
    const dayOfMonth = new Date().getDate();
    if (dayOfMonth >= 25 || dayOfMonth <= 3) { // End/beginning of month
      FARMERS_MARKET_EVENTS.monthly.forEach(eventTemplate => {
        if (this.meetsEventRequirements(eventTemplate, gameState)) {
          if (Math.random() < eventTemplate.probability) {
            this.startMarketEvent(eventTemplate);
          }
        }
      });
    }
  }

  meetsEventRequirements(eventTemplate, gameState) {
    if (eventTemplate.requirements.level && gameState.level < eventTemplate.requirements.level) {
      return false;
    }
    if (eventTemplate.requirements.livestock_count && 
        Object.values(gameState.livestock || {}).reduce((sum, count) => sum + count, 0) < eventTemplate.requirements.livestock_count) {
      return false;
    }
    if (eventTemplate.requirements.processing_facilities && 
        Object.keys(gameState.processingPlants || {}).length < eventTemplate.requirements.processing_facilities) {
      return false;
    }
    return true;
  }

  startMarketEvent(eventTemplate) {
    const event = {
      ...eventTemplate,
      startTime: Date.now(),
      endTime: Date.now() + (eventTemplate.duration * 1000),
      participation: 0
    };
    
    this.activeMarketEvents.push(event);
    return event;
  }

  updateMarketEvents() {
    const now = Date.now();
    this.activeMarketEvents = this.activeMarketEvents.filter(event => {
      return now <= event.endTime;
    });
  }

  updateNeighbors(gameState) {
    Object.keys(this.neighbors).forEach(neighborId => {
      const neighbor = this.neighbors[neighborId];
      
      // Reduce trade cooldown
      if (neighbor.tradeCooldown > 0) {
        neighbor.tradeCooldown--;
      }
      
      // Gradually regenerate inventory
      neighbor.producesWell.forEach(item => {
        if (Math.random() < 0.3) { // 30% chance to produce more
          neighbor.inventory[item] = (neighbor.inventory[item] || 0) + Math.floor(Math.random() * 5) + 1;
        }
      });
      
      // Update needs occasionally
      if (Math.random() < 0.2) { // 20% chance to update needs
        neighbor.currentNeeds = this.generateNeighborNeeds(NEIGHBOR_FARMS[neighborId]);
      }
      
      // Relationship decay if no interaction
      if (Date.now() - neighbor.lastTradeTime > 3600000) { // 1 hour
        neighbor.relationship = Math.max(0, neighbor.relationship - 0.1);
      }
    });
  }

  updateChallenges(gameState) {
    // Remove completed or expired challenges
    this.activeChallenges = this.activeChallenges.filter(challenge => {
      const now = Date.now();
      return now <= challenge.endTime && !challenge.completed;
    });
  }

  // Trading with neighbors
  tradeWithNeighbor(neighborId, offer, request) {
    const neighbor = this.neighbors[neighborId];
    if (!neighbor || neighbor.tradeCooldown > 0) {
      return { success: false, message: "Trade not available right now" };
    }

    // Check if neighbor wants what we're offering
    const offerValue = this.calculateTradeValue(offer, neighbor, 'offer');
    const requestValue = this.calculateTradeValue(request, neighbor, 'request');
    
    // Apply trading style modifiers
    const styleModifier = this.getTradingStyleModifier(neighbor, offer, request);
    const adjustedOfferValue = offerValue * styleModifier;
    
    if (adjustedOfferValue >= requestValue * 0.8) { // Allow some flexibility
      // Execute trade
      this.executeTrade(neighborId, offer, request);
      return { 
        success: true, 
        message: `Trade completed with ${neighbor.name}!`,
        relationshipChange: 5
      };
    } else {
      return { 
        success: false, 
        message: `${neighbor.owner} wants a better deal` 
      };
    }
  }

  calculateTradeValue(items, neighbor, type) {
    let totalValue = 0;
    Object.entries(items).forEach(([item, quantity]) => {
      let baseValue = this.getItemBaseValue(item);
      
      if (type === 'offer' && neighbor.tradePreferences.includes(item)) {
        baseValue *= 1.3; // 30% bonus for preferred items
      }
      if (type === 'request' && neighbor.producesWell.includes(item)) {
        baseValue *= 0.7; // 30% discount for items they produce well
      }
      
      totalValue += baseValue * quantity;
    });
    return totalValue;
  }

  getTradingStyleModifier(neighbor, offer, request) {
    const farmData = NEIGHBOR_FARMS[Object.keys(NEIGHBOR_FARMS).find(key => 
      NEIGHBOR_FARMS[key].name === neighbor.name)];
    
    switch (farmData.tradingStyle) {
      case 'generous': return 1.1;
      case 'premium': return this.hasHighTechItems(offer) ? 1.2 : 0.9;
      case 'bulk': return Object.values(offer).reduce((sum, qty) => sum + qty, 0) >= 10 ? 1.15 : 0.95;
      case 'exclusive': return this.hasRareItems(offer) ? 1.3 : 0.8;
      case 'cooperative': return 1.0; // Uses barter system
      default: return 1.0;
    }
  }

  hasHighTechItems(items) {
    const techItems = ['hybrid_seeds', 'tech_equipment', 'research_data'];
    return Object.keys(items).some(item => techItems.includes(item));
  }

  hasRareItems(items) {
    const rareItems = ['rare_seeds', 'exotic_spices', 'dragon_fruit'];
    return Object.keys(items).some(item => rareItems.includes(item));
  }

  getItemBaseValue(item) {
    // Base values for different item types
    const values = {
      // Basic crops
      wheat: 25, corn: 30, tomato: 35, carrot: 20,
      // Processed items
      flour: 40, bread: 60, cheese: 80, wine: 120,
      // Animals & products
      milk: 50, eggs: 45, wool: 70, leather: 90,
      // Special items
      rare_seeds: 200, hybrid_seeds: 150, heirloom_seeds: 100,
      research_data: 300, tech_equipment: 500,
      // Resources
      fertilizer: 80, compost: 60, pesticide: 90
    };
    return values[item] || 50; // Default value
  }

  executeTrade(neighborId, offer, request) {
    const neighbor = this.neighbors[neighborId];
    
    // Update neighbor inventory
    Object.entries(offer).forEach(([item, quantity]) => {
      neighbor.inventory[item] = (neighbor.inventory[item] || 0) + quantity;
    });
    
    Object.entries(request).forEach(([item, quantity]) => {
      neighbor.inventory[item] = Math.max(0, (neighbor.inventory[item] || 0) - quantity);
    });
    
    // Update relationship and trading history
    neighbor.relationship = Math.min(100, neighbor.relationship + 5);
    neighbor.lastTradeTime = Date.now();
    neighbor.tradeCooldown = 3; // 3 game cycles before next trade
    
    this.tradingHistory.push({
      neighborId,
      offer,
      request,
      timestamp: Date.now()
    });
  }

  // Farmer's Market participation
  participateInMarketEvent(eventId, contribution) {
    const event = this.activeMarketEvents.find(e => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };
    
    event.participation += contribution;
    this.communityPoints += contribution * 2;
    
    return {
      success: true,
      message: `Contributed to ${event.name}!`,
      pointsEarned: contribution * 2
    };
  }

  // Farm tours
  visitFarm(farmId) {
    const farm = TOUR_DESTINATIONS.showcase_farms.find(f => f.id === farmId) ||
                 TOUR_DESTINATIONS.educational_tours.find(f => f.id === farmId);
    
    if (!farm) return { success: false, message: "Farm not found" };
    
    if (this.completedTours.includes(farmId)) {
      return { success: false, message: "Already visited this farm recently" };
    }
    
    this.completedTours.push(farmId);
    this.communityPoints += farm.rewards.inspiration_points || 0;
    
    return {
      success: true,
      farm: farm,
      rewards: farm.rewards,
      inspiration: farm.inspiration_bonus
    };
  }

  // Get community status
  getCommunityStatus() {
    return {
      communityPoints: this.communityPoints,
      reputation: this.reputation,
      activeMarketEvents: this.activeMarketEvents.length,
      neighborRelationships: Object.values(this.neighbors).map(n => ({
        name: n.name,
        relationship: n.relationship
      })),
      completedTrades: this.tradingHistory.length,
      availableTours: TOUR_DESTINATIONS.showcase_farms.filter(f => 
        !this.completedTours.includes(f.id)
      ).length
    };
  }
}

export default CommunitySystem;
