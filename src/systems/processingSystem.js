/**
 * Processing Facilities System
 * Transform raw crops into higher-value processed products
 */

// Processing facilities that can be built
export const PROCESSING_FACILITIES = {
  mill: {
    id: 'mill',
    name: 'Grain Mill',
    emoji: '🏭',
    description: 'Process grains into flour and other products',
    cost: 5000,
    unlockLevel: 8,
    buildTime: 120, // minutes
    capacity: 50, // items per batch
    energyCost: 20,
    recipes: ['flour', 'cornmeal', 'oats'],
    maintenance: 100,
    size: 2 // 2x2 grid spaces
  },
  
  juicer: {
    id: 'juicer',
    name: 'Juice Press',
    emoji: '🥤',
    description: 'Extract juices from fruits and vegetables',
    cost: 3000,
    unlockLevel: 6,
    buildTime: 90,
    capacity: 30,
    energyCost: 15,
    recipes: ['apple_juice', 'carrot_juice', 'berry_mix'],
    maintenance: 75,
    size: 1
  },
  
  bakery: {
    id: 'bakery',
    name: 'Artisan Bakery',
    emoji: '🍞',
    description: 'Bake bread and pastries from processed ingredients',
    cost: 8000,
    unlockLevel: 12,
    buildTime: 180,
    capacity: 20,
    energyCost: 30,
    recipes: ['bread', 'croissants', 'pies'],
    maintenance: 150,
    size: 2,
    requires: ['mill'] // Must have mill first
  },
  
  preservery: {
    id: 'preservery',
    name: 'Preserve Kitchen',
    emoji: '🥫',
    description: 'Create jams, pickles, and preserved goods',
    cost: 4500,
    unlockLevel: 10,
    buildTime: 150,
    capacity: 25,
    energyCost: 20,
    recipes: ['strawberry_jam', 'pickles', 'dried_fruits'],
    maintenance: 90,
    size: 1
  },
  
  dairy: {
    id: 'dairy',
    name: 'Dairy Processing',
    emoji: '🧀',
    description: 'Process milk into cheese, butter, and yogurt',
    cost: 6000,
    unlockLevel: 14,
    buildTime: 200,
    capacity: 15,
    energyCost: 25,
    recipes: ['cheese', 'butter', 'yogurt'],
    maintenance: 120,
    size: 2,
    requires: ['livestock'] // Must have livestock
  },
  
  winery: {
    id: 'winery',
    name: 'Artisan Winery',
    emoji: '🍷',
    description: 'Ferment fruits into premium wines and spirits',
    cost: 12000,
    unlockLevel: 18,
    buildTime: 300,
    capacity: 10,
    energyCost: 35,
    recipes: ['grape_wine', 'fruit_wine', 'brandy'],
    maintenance: 200,
    size: 3,
    specialRequirement: 'premium_crops'
  },

  greenhouse_processor: {
    id: 'greenhouse_processor',
    name: 'Climate-Controlled Processor',
    emoji: '🌡️',
    description: 'Advanced facility for exotic and delicate processing',
    cost: 15000,
    unlockLevel: 22,
    buildTime: 240,
    capacity: 8,
    energyCost: 45,
    recipes: ['exotic_spices', 'rare_extracts', 'medicinal_tinctures'],
    maintenance: 250,
    size: 2,
    requires: ['greenhouse']
  }
};

// Recipes for processing raw materials into products
export const PROCESSING_RECIPES = {
  // Mill recipes
  flour: {
    id: 'flour',
    name: 'All-Purpose Flour',
    emoji: '🌾',
    facility: 'mill',
    inputs: { wheat: 5 },
    outputs: { flour: 8 },
    processingTime: 30, // minutes
    baseValue: 45,
    category: 'staples',
    description: 'Essential baking ingredient made from wheat'
  },
  
  cornmeal: {
    id: 'cornmeal',
    name: 'Stone-Ground Cornmeal',
    emoji: '🌽',
    facility: 'mill',
    inputs: { corn: 4 },
    outputs: { cornmeal: 6 },
    processingTime: 25,
    baseValue: 35,
    category: 'staples',
    description: 'Coarse meal perfect for bread and polenta'
  },

  // Juicer recipes
  apple_juice: {
    id: 'apple_juice',
    name: 'Fresh Apple Juice',
    emoji: '🧃',
    facility: 'juicer',
    inputs: { apple: 8 },
    outputs: { apple_juice: 3 },
    processingTime: 15,
    baseValue: 60,
    category: 'beverages',
    description: 'Pure, fresh-pressed apple juice'
  },
  
  carrot_juice: {
    id: 'carrot_juice',
    name: 'Organic Carrot Juice',
    emoji: '🥕',
    facility: 'juicer',
    inputs: { carrot: 10 },
    outputs: { carrot_juice: 4 },
    processingTime: 20,
    baseValue: 40,
    category: 'beverages',
    description: 'Nutrient-rich vegetable juice'
  },

  // Bakery recipes
  bread: {
    id: 'bread',
    name: 'Artisan Sourdough',
    emoji: '🍞',
    facility: 'bakery',
    inputs: { flour: 3, water: 1 },
    outputs: { bread: 2 },
    processingTime: 120,
    baseValue: 80,
    category: 'baked_goods',
    description: 'Handcrafted sourdough bread'
  },
  
  croissants: {
    id: 'croissants',
    name: 'Butter Croissants',
    emoji: '🥐',
    facility: 'bakery',
    inputs: { flour: 2, butter: 2 },
    outputs: { croissants: 4 },
    processingTime: 90,
    baseValue: 25,
    category: 'baked_goods',
    description: 'Flaky, buttery pastries'
  },

  // Preservery recipes
  strawberry_jam: {
    id: 'strawberry_jam',
    name: 'Strawberry Preserves',
    emoji: '🍓',
    facility: 'preservery',
    inputs: { strawberry: 12, sugar: 2 },
    outputs: { strawberry_jam: 6 },
    processingTime: 45,
    baseValue: 35,
    category: 'preserves',
    description: 'Sweet strawberry jam with chunks of fruit'
  },

  // Dairy recipes
  cheese: {
    id: 'cheese',
    name: 'Farmhouse Cheese',
    emoji: '🧀',
    facility: 'dairy',
    inputs: { milk: 8 },
    outputs: { cheese: 2 },
    processingTime: 180,
    baseValue: 120,
    category: 'dairy',
    description: 'Aged cheese with rich, complex flavor'
  },

  // Winery recipes
  grape_wine: {
    id: 'grape_wine',
    name: 'Premium Wine',
    emoji: '🍷',
    facility: 'winery',
    inputs: { grape: 20 },
    outputs: { grape_wine: 3 },
    processingTime: 1440, // 24 hours
    baseValue: 200,
    category: 'premium',
    description: 'Fine wine aged to perfection'
  },

  // Exotic recipes
  exotic_spices: {
    id: 'exotic_spices',
    name: 'Rare Spice Blend',
    emoji: '🌶️',
    facility: 'greenhouse_processor',
    inputs: { exotic_herbs: 5, rare_peppers: 3 },
    outputs: { exotic_spices: 2 },
    processingTime: 90,
    baseValue: 300,
    category: 'luxury',
    description: 'Exotic spice blend for gourmet cooking'
  }
};

// Quality multipliers for processed goods
export const PROCESSING_QUALITY_MULTIPLIERS = {
  bronze: 1.0,
  silver: 1.3,
  gold: 1.6,
  platinum: 2.2
};

export class ProcessingSystem {
  constructor() {
    this.facilities = {};
    this.processingQueue = [];
    this.completedProducts = {};
    this.totalProcessed = 0;
  }

  // Build a new processing facility
  buildFacility(facilityId, gameState) {
    const facility = PROCESSING_FACILITIES[facilityId];
    if (!facility) return { success: false, error: 'Unknown facility' };

    // Check requirements
    if (gameState.level < facility.unlockLevel) {
      return { success: false, error: 'Level requirement not met' };
    }

    if (gameState.money < facility.cost) {
      return { success: false, error: 'Insufficient funds' };
    }

    // Check facility prerequisites
    if (facility.requires) {
      for (const requirement of facility.requires) {
        if (!this.facilities[requirement] && !gameState.buildings[requirement]) {
          return { success: false, error: `Requires ${requirement}` };
        }
      }
    }

    // Build facility
    this.facilities[facilityId] = {
      ...facility,
      level: 1,
      built: Date.now(),
      lastMaintenance: Date.now(),
      efficiency: 1.0,
      currentBatch: null
    };

    return { 
      success: true, 
      cost: facility.cost,
      buildTime: facility.buildTime 
    };
  }

  // Start processing a recipe
  startProcessing(facilityId, recipeId, quantity, inputInventory) {
    const facility = this.facilities[facilityId];
    const recipe = PROCESSING_RECIPES[recipeId];

    if (!facility || !recipe) {
      return { success: false, error: 'Invalid facility or recipe' };
    }

    if (facility.currentBatch) {
      return { success: false, error: 'Facility is busy' };
    }

    // Check if we have enough inputs
    const neededInputs = {};
    Object.entries(recipe.inputs).forEach(([item, amount]) => {
      neededInputs[item] = amount * quantity;
    });

    for (const [item, needed] of Object.entries(neededInputs)) {
      if (!inputInventory[item] || inputInventory[item] < needed) {
        return { success: false, error: `Need ${needed} ${item}` };
      }
    }

    // Calculate processing time with efficiency
    const baseTime = recipe.processingTime * quantity;
    const processTime = Math.round(baseTime / facility.efficiency);

    // Start processing
    const batch = {
      recipeId,
      quantity,
      startTime: Date.now(),
      endTime: Date.now() + (processTime * 60 * 1000),
      inputs: neededInputs,
      expectedOutputs: this.calculateOutputs(recipe, quantity, facility)
    };

    facility.currentBatch = batch;
    this.processingQueue.push({
      facilityId,
      batch,
      endTime: batch.endTime
    });

    return { 
      success: true, 
      batch,
      consumedInputs: neededInputs,
      processingTime: processTime 
    };
  }

  // Calculate expected outputs considering quality and facility efficiency
  calculateOutputs(recipe, quantity, facility) {
    const outputs = {};
    
    Object.entries(recipe.outputs).forEach(([item, baseAmount]) => {
      let amount = baseAmount * quantity;
      
      // Apply facility efficiency
      amount = Math.round(amount * facility.efficiency);
      
      // Quality bonus (simplified - would use input quality in real implementation)
      const qualityMultiplier = PROCESSING_QUALITY_MULTIPLIERS.silver; // Default to silver
      
      outputs[item] = {
        quantity: amount,
        quality: 'silver',
        value: Math.round(recipe.baseValue * qualityMultiplier)
      };
    });

    return outputs;
  }

  // Check for completed processing
  updateProcessing() {
    const now = Date.now();
    const completed = [];

    this.processingQueue = this.processingQueue.filter(item => {
      if (item.endTime <= now) {
        const facility = this.facilities[item.facilityId];
        if (facility && facility.currentBatch) {
          completed.push({
            facilityId: item.facilityId,
            outputs: facility.currentBatch.expectedOutputs
          });
          facility.currentBatch = null;
          this.totalProcessed++;
        }
        return false;
      }
      return true;
    });

    return completed;
  }

  // Upgrade a facility
  upgradeFacility(facilityId, gameState) {
    const facility = this.facilities[facilityId];
    if (!facility) return { success: false, error: 'Facility not found' };

    const upgradeCost = Math.round(PROCESSING_FACILITIES[facilityId].cost * 0.5 * facility.level);
    
    if (gameState.money < upgradeCost) {
      return { success: false, error: 'Insufficient funds' };
    }

    facility.level++;
    facility.efficiency = Math.min(2.0, 1.0 + (facility.level - 1) * 0.2); // Max 2x efficiency
    facility.capacity = Math.round(PROCESSING_FACILITIES[facilityId].capacity * (1 + facility.level * 0.1));

    return { 
      success: true, 
      cost: upgradeCost, 
      newLevel: facility.level,
      newEfficiency: facility.efficiency 
    };
  }

  // Perform maintenance on facility
  performMaintenance(facilityId, gameState) {
    const facility = this.facilities[facilityId];
    if (!facility) return { success: false, error: 'Facility not found' };

    const maintenanceCost = PROCESSING_FACILITIES[facilityId].maintenance;
    
    if (gameState.money < maintenanceCost) {
      return { success: false, error: 'Insufficient funds' };
    }

    facility.lastMaintenance = Date.now();
    facility.efficiency = Math.min(2.0, facility.efficiency + 0.1); // Boost efficiency

    return { 
      success: true, 
      cost: maintenanceCost,
      newEfficiency: facility.efficiency 
    };
  }

  // Get available recipes for a facility
  getAvailableRecipes(facilityId) {
    const facility = this.facilities[facilityId];
    if (!facility) return [];

    return Object.values(PROCESSING_RECIPES).filter(recipe => 
      recipe.facility === facilityId
    );
  }

  // Get facility status
  getFacilityStatus(facilityId) {
    const facility = this.facilities[facilityId];
    if (!facility) return null;

    const needsMaintenance = (Date.now() - facility.lastMaintenance) > (7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      ...facility,
      isProcessing: !!facility.currentBatch,
      needsMaintenance,
      timeRemaining: facility.currentBatch ? 
        Math.max(0, facility.currentBatch.endTime - Date.now()) : 0
    };
  }

  // Get processing statistics
  getProcessingStats() {
    return {
      totalFacilities: Object.keys(this.facilities).length,
      totalProcessed: this.totalProcessed,
      activeBatches: this.processingQueue.length,
      facilities: Object.keys(this.facilities).map(id => ({
        id,
        ...this.getFacilityStatus(id)
      }))
    };
  }
}

export default ProcessingSystem;
