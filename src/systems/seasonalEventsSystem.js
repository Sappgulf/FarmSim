// Seasonal Events & Festivals System
// Adds dynamic seasonal content with festivals, competitions, and special mechanics

// Event Types
const EVENT_TYPES = {
  FESTIVAL: 'festival',
  COMPETITION: 'competition', 
  WEATHER_EVENT: 'weather_event',
  MARKET_EVENT: 'market_event'
};

// Seasonal Events Configuration
const SEASONAL_EVENTS = {
  spring: [
    {
      id: 'spring_planting_competition',
      name: '🌱 Spring Planting Competition',
      type: EVENT_TYPES.COMPETITION,
      description: 'Plant 50 crops in 5 minutes to win special seeds!',
      duration: 300, // 5 minutes in seconds
      requirements: { level: 5 },
      rewards: {
        xp: 500,
        money: 2000,
        items: { 'rare_seeds': 10, 'fertilizer': 20 }
      },
      objectives: [
        { type: 'plant_crops', target: 50, current: 0 }
      ],
      startMessage: '🌱 Spring Planting Competition has started! Plant 50 crops in 5 minutes!',
      probability: 0.3
    },
    {
      id: 'spring_growth_festival',
      name: '🌸 Spring Growth Festival',
      type: EVENT_TYPES.FESTIVAL,
      description: 'All crops grow 50% faster during this celebration!',
      duration: 1800, // 30 minutes
      requirements: { level: 3 },
      effects: {
        crop_growth_multiplier: 1.5,
        xp_multiplier: 1.2
      },
      rewards: {
        xp: 300,
        money: 1000
      },
      startMessage: '🌸 Spring Growth Festival is here! Crops grow faster!',
      probability: 0.4
    },
    {
      id: 'early_bloom',
      name: '🌺 Early Bloom Event',
      type: EVENT_TYPES.WEATHER_EVENT,
      description: 'Perfect growing conditions boost all plant health!',
      duration: 900, // 15 minutes
      requirements: { level: 1 },
      effects: {
        disease_resistance: 0.8,
        water_efficiency: 1.3
      },
      startMessage: '🌺 Early Bloom conditions detected! Plants are thriving!',
      probability: 0.5
    }
  ],
  
  summer: [
    {
      id: 'summer_heat_wave',
      name: '🔥 Summer Heat Wave',
      type: EVENT_TYPES.WEATHER_EVENT,
      description: 'Extreme heat! Only drought-resistant crops survive.',
      duration: 1200, // 20 minutes
      requirements: { level: 8 },
      effects: {
        drought_damage: true,
        water_consumption: 2.0,
        drought_resistant_bonus: 1.4
      },
      penalties: {
        non_drought_resistant_penalty: 0.3
      },
      startMessage: '🔥 Heat Wave Warning! Protect your non-drought resistant crops!',
      probability: 0.4
    },
    {
      id: 'midsummer_festival',
      name: '☀️ Midsummer Festival',
      type: EVENT_TYPES.FESTIVAL,
      description: 'Celebrate the longest day with bonus harvest values!',
      duration: 2400, // 40 minutes
      requirements: { level: 10 },
      effects: {
        harvest_value_multiplier: 1.6,
        energy_regeneration: 1.3
      },
      rewards: {
        xp: 800,
        money: 3000,
        items: { 'golden_fertilizer': 5 }
      },
      startMessage: '☀️ Midsummer Festival begins! Harvests are worth more!',
      probability: 0.2
    },
    {
      id: 'desert_oasis_discovery',
      name: '🏜️ Desert Oasis Discovery',
      type: EVENT_TYPES.MARKET_EVENT,
      description: 'Desert crops are in high demand! 200% market value.',
      duration: 1800, // 30 minutes
      requirements: { level: 12, unlockedZones: ['desert'] },
      effects: {
        crop_price_multipliers: {
          cactus: 2.0,
          dates: 2.0,
          agave: 2.0
        }
      },
      startMessage: '🏜️ Desert crops are highly sought after! Sell now!',
      probability: 0.3
    }
  ],
  
  autumn: [
    {
      id: 'harvest_festival',
      name: '🍂 Grand Harvest Festival',
      type: EVENT_TYPES.FESTIVAL,
      description: 'The biggest celebration of the year! Massive XP bonuses!',
      duration: 3600, // 1 hour
      requirements: { level: 7 },
      effects: {
        xp_multiplier: 2.5,
        harvest_bonus_chance: 0.3,
        processing_speed: 1.4
      },
      rewards: {
        xp: 1500,
        money: 5000,
        items: { 
          'festival_seeds': 15,
          'golden_watering_can': 1,
          'harvest_crown': 1
        }
      },
      startMessage: '🍂 Grand Harvest Festival has begun! Massive XP bonuses await!',
      probability: 0.6
    },
    {
      id: 'autumn_abundance',
      name: '🎃 Autumn Abundance',
      type: EVENT_TYPES.COMPETITION,
      description: 'Harvest 100 crops to unlock the Pumpkin King title!',
      duration: 2700, // 45 minutes
      requirements: { level: 15 },
      objectives: [
        { type: 'harvest_crops', target: 100, current: 0 }
      ],
      rewards: {
        xp: 1200,
        money: 4000,
        items: { 'pumpkin_seeds': 25 },
        title: 'Pumpkin King'
      },
      startMessage: '🎃 Autumn Abundance challenge! Harvest 100 crops for glory!',
      probability: 0.4
    },
    {
      id: 'maple_syrup_boom',
      name: '🍁 Maple Syrup Market Boom',
      type: EVENT_TYPES.MARKET_EVENT,
      description: 'Processed tree products sell for premium prices!',
      duration: 1500, // 25 minutes
      requirements: { level: 18, hasProcessingPlants: true },
      effects: {
        processing_value_multiplier: 2.2,
        tree_crop_bonus: 1.8
      },
      startMessage: '🍁 Maple syrup market is booming! Process tree products now!',
      probability: 0.3
    }
  ],
  
  winter: [
    {
      id: 'winter_market',
      name: '❄️ Exclusive Winter Market',
      type: EVENT_TYPES.MARKET_EVENT,
      description: 'Special winter-only crops become available for purchase!',
      duration: 5400, // 90 minutes
      requirements: { level: 6 },
      effects: {
        special_crops_available: true,
        cold_resistant_bonus: 1.5
      },
      specialCrops: {
        'ice_berry': { 
          name: 'Ice Berry', 
          emoji: '🧊', 
          cost: 100, 
          value: 250, 
          growTime: 120,
          coldResistant: true,
          onlyInWinter: true
        },
        'frost_flower': { 
          name: 'Frost Flower', 
          emoji: '❄️', 
          cost: 150, 
          value: 400, 
          growTime: 180,
          coldResistant: true,
          onlyInWinter: true
        },
        'winter_root': { 
          name: 'Winter Root', 
          emoji: '🥕', 
          cost: 80, 
          value: 200, 
          growTime: 90,
          coldResistant: true,
          onlyInWinter: true
        }
      },
      rewards: {
        xp: 600,
        money: 2500
      },
      startMessage: '❄️ Winter Market is open! Exclusive winter crops available!',
      probability: 0.5
    },
    {
      id: 'blizzard_challenge',
      name: '🌨️ Blizzard Survival Challenge',
      type: EVENT_TYPES.WEATHER_EVENT,
      description: 'Harsh blizzard conditions test your farming skills!',
      duration: 1800, // 30 minutes
      requirements: { level: 20 },
      effects: {
        cold_damage: true,
        energy_drain: 1.5,
        cold_resistant_immunity: true
      },
      penalties: {
        non_cold_resistant_penalty: 0.2
      },
      rewards: {
        xp: 1000,
        money: 3500,
        items: { 'winter_shield': 3 }
      },
      startMessage: '🌨️ Blizzard incoming! Only cold-resistant crops will survive!',
      probability: 0.25
    },
    {
      id: 'holiday_spirit',
      name: '🎄 Holiday Spirit Festival',
      type: EVENT_TYPES.FESTIVAL,
      description: 'Spread joy and earn bonus rewards for community actions!',
      duration: 2700, // 45 minutes
      requirements: { level: 5 },
      effects: {
        gift_bonus: 1.8,
        community_xp: 1.4,
        happiness_multiplier: 2.0
      },
      objectives: [
        { type: 'give_gifts', target: 10, current: 0 },
        { type: 'help_neighbors', target: 5, current: 0 }
      ],
      rewards: {
        xp: 900,
        money: 2800,
        items: { 'holiday_decorations': 10 }
      },
      startMessage: '🎄 Holiday Spirit Festival! Spread joy to earn rewards!',
      probability: 0.4
    }
  ]
};

// Seasonal Event System Class
class SeasonalEventsSystem {
  constructor() {
    this.activeEvents = [];
    this.eventHistory = [];
    this.lastEventCheck = Date.now();
    this.eventCheckInterval = 300000; // Check every 5 minutes for new events
    this.currentSeason = this.getCurrentSeason();
    this.eventEffects = {};
    this.completedObjectives = {};
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  update(gameState) {
    const now = Date.now();
    
    // Check for new events
    if (now - this.lastEventCheck > this.eventCheckInterval) {
      this.checkForNewEvents(gameState);
      this.lastEventCheck = now;
    }
    
    // Update active events
    this.updateActiveEvents(gameState);
    
    // Apply event effects
    this.applyEventEffects(gameState);
    
    return {
      activeEvents: this.activeEvents,
      eventEffects: this.eventEffects,
      currentSeason: this.currentSeason
    };
  }

  checkForNewEvents(gameState) {
    const seasonEvents = SEASONAL_EVENTS[this.currentSeason] || [];
    
    seasonEvents.forEach(eventTemplate => {
      // Check if event meets requirements
      if (!this.meetsRequirements(eventTemplate, gameState)) return;
      
      // Check if event is already active
      if (this.activeEvents.find(e => e.id === eventTemplate.id)) return;
      
      // Check if event was recently completed
      const recentEvent = this.eventHistory.find(e => 
        e.id === eventTemplate.id && 
        Date.now() - e.completedAt < 3600000 // 1 hour cooldown
      );
      if (recentEvent) return;
      
      // Random chance to trigger
      if (Math.random() < eventTemplate.probability) {
        this.startEvent(eventTemplate);
      }
    });
  }

  meetsRequirements(eventTemplate, gameState) {
    const req = eventTemplate.requirements;
    
    if (req.level && gameState.level < req.level) return false;
    if (req.unlockedZones && !req.unlockedZones.every(zone => 
      gameState.farmZones?.some(z => z.type === zone && z.unlocked)
    )) return false;
    if (req.hasProcessingPlants && Object.keys(gameState.processingPlants || {}).length === 0) return false;
    
    return true;
  }

  startEvent(eventTemplate) {
    const event = {
      ...eventTemplate,
      startTime: Date.now(),
      endTime: Date.now() + (eventTemplate.duration * 1000),
      progress: { ...eventTemplate.objectives?.reduce((acc, obj) => ({...acc, [obj.type]: 0}), {}) || {} }
    };
    
    this.activeEvents.push(event);
    
    return {
      type: 'event_started',
      event: event,
      message: event.startMessage
    };
  }

  updateActiveEvents(gameState) {
    const now = Date.now();
    
    this.activeEvents = this.activeEvents.filter(event => {
      if (now > event.endTime) {
        this.completeEvent(event, gameState);
        return false;
      }
      return true;
    });
  }

  completeEvent(event, gameState) {
    // Check if objectives were completed
    const objectivesCompleted = event.objectives?.every(obj => 
      (event.progress[obj.type] || 0) >= obj.target
    ) ?? true;
    
    if (objectivesCompleted && event.rewards) {
      this.grantRewards(event.rewards, gameState);
    }
    
    // Add to history
    this.eventHistory.push({
      ...event,
      completedAt: Date.now(),
      successful: objectivesCompleted
    });
    
    return {
      type: 'event_completed',
      event: event,
      successful: objectivesCompleted,
      rewards: objectivesCompleted ? event.rewards : null
    };
  }

  grantRewards(rewards, gameState) {
    const grantedRewards = {};
    
    if (rewards.xp) {
      gameState.experience = (gameState.experience || 0) + rewards.xp;
      grantedRewards.xp = rewards.xp;
    }
    
    if (rewards.money) {
      gameState.money = (gameState.money || 0) + rewards.money;
      grantedRewards.money = rewards.money;
    }
    
    if (rewards.items) {
      gameState.inventory = gameState.inventory || {};
      Object.entries(rewards.items).forEach(([item, amount]) => {
        gameState.inventory[item] = (gameState.inventory[item] || 0) + amount;
      });
      grantedRewards.items = rewards.items;
    }
    
    if (rewards.title) {
      gameState.titles = gameState.titles || [];
      if (!gameState.titles.includes(rewards.title)) {
        gameState.titles.push(rewards.title);
        grantedRewards.title = rewards.title;
      }
    }
    
    return grantedRewards;
  }

  applyEventEffects(gameState) {
    this.eventEffects = {};
    
    this.activeEvents.forEach(event => {
      if (event.effects) {
        Object.entries(event.effects).forEach(([effect, value]) => {
          this.eventEffects[effect] = value;
        });
      }
    });
  }

  recordProgress(progressType, amount = 1) {
    this.activeEvents.forEach(event => {
      if (event.objectives) {
        event.objectives.forEach(obj => {
          if (obj.type === progressType) {
            event.progress[progressType] = (event.progress[progressType] || 0) + amount;
          }
        });
      }
    });
  }

  getActiveEventsByType(type) {
    return this.activeEvents.filter(event => event.type === type);
  }

  getSeasonalCrops() {
    const winterMarket = this.activeEvents.find(e => e.id === 'winter_market');
    return winterMarket?.specialCrops || {};
  }

  getEventStatus() {
    return {
      activeEvents: this.activeEvents.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        timeRemaining: Math.max(0, event.endTime - Date.now()),
        progress: event.progress,
        objectives: event.objectives
      })),
      currentSeason: this.currentSeason,
      eventEffects: this.eventEffects
    };
  }

  // Apply seasonal modifiers to crops
  applyCropModifiers(crop, plotState) {
    let modifiers = {
      growthMultiplier: 1.0,
      valueMultiplier: 1.0,
      diseaseResistance: 1.0,
      waterEfficiency: 1.0
    };

    // Apply event effects
    if (this.eventEffects.crop_growth_multiplier) {
      modifiers.growthMultiplier *= this.eventEffects.crop_growth_multiplier;
    }
    
    if (this.eventEffects.harvest_value_multiplier) {
      modifiers.valueMultiplier *= this.eventEffects.harvest_value_multiplier;
    }
    
    if (this.eventEffects.disease_resistance) {
      modifiers.diseaseResistance *= this.eventEffects.disease_resistance;
    }
    
    if (this.eventEffects.water_efficiency) {
      modifiers.waterEfficiency *= this.eventEffects.water_efficiency;
    }

    // Handle drought effects
    if (this.eventEffects.drought_damage && !crop.droughtResistant) {
      modifiers.growthMultiplier *= (this.eventEffects.non_drought_resistant_penalty || 0.5);
    }
    
    if (this.eventEffects.drought_resistant_bonus && crop.droughtResistant) {
      modifiers.valueMultiplier *= this.eventEffects.drought_resistant_bonus;
    }

    // Handle cold effects
    if (this.eventEffects.cold_damage && !crop.coldResistant) {
      modifiers.growthMultiplier *= (this.eventEffects.non_cold_resistant_penalty || 0.5);
    }
    
    if (this.eventEffects.cold_resistant_bonus && crop.coldResistant) {
      modifiers.valueMultiplier *= this.eventEffects.cold_resistant_bonus;
    }

    // Handle specific crop price bonuses
    if (this.eventEffects.crop_price_multipliers && this.eventEffects.crop_price_multipliers[crop.name.toLowerCase()]) {
      modifiers.valueMultiplier *= this.eventEffects.crop_price_multipliers[crop.name.toLowerCase()];
    }

    return modifiers;
  }
}

export default SeasonalEventsSystem;
