/**
 * Livestock System - Manage animals, production, and care
 */

export const LIVESTOCK_TYPES = {
  CHICKEN: {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🐔',
    description: 'Produces eggs daily. Easy to care for.',
    cost: 100,
    maintenanceCost: 5, // Per day
    productionTime: 30, // seconds
    products: [{ item: 'egg', amount: 1, value: 15 }],
    maxHealth: 100,
    happinessDecay: 2, // Per minute
    hungerRate: 3, // Per minute
    feedCost: 10,
    requirements: {
      space: 1,
      level: 1,
    },
    bonuses: {
      eggs: 1.0,
    },
  },
  COW: {
    id: 'cow',
    name: 'Cow',
    emoji: '🐄',
    description: 'Produces milk. Requires more care.',
    cost: 500,
    maintenanceCost: 15,
    productionTime: 60, // seconds
    products: [{ item: 'milk', amount: 1, value: 40 }],
    maxHealth: 100,
    happinessDecay: 1.5,
    hungerRate: 5,
    feedCost: 25,
    requirements: {
      space: 2,
      level: 3,
    },
    bonuses: {
      milk: 1.0,
    },
  },
  PIG: {
    id: 'pig',
    name: 'Pig',
    emoji: '🐷',
    description: 'Grows quickly for high value.',
    cost: 300,
    maintenanceCost: 10,
    productionTime: 45, // seconds
    products: [{ item: 'truffle', amount: 1, value: 30 }],
    maxHealth: 100,
    happinessDecay: 2.5,
    hungerRate: 6,
    feedCost: 20,
    requirements: {
      space: 1,
      level: 2,
    },
    bonuses: {
      truffles: 1.0,
    },
  },
  SHEEP: {
    id: 'sheep',
    name: 'Sheep',
    emoji: '🐑',
    description: 'Produces wool periodically.',
    cost: 400,
    maintenanceCost: 12,
    productionTime: 90, // seconds
    products: [{ item: 'wool', amount: 1, value: 50 }],
    maxHealth: 100,
    happinessDecay: 1.0,
    hungerRate: 4,
    feedCost: 15,
    requirements: {
      space: 2,
      level: 4,
    },
    bonuses: {
      wool: 1.0,
    },
  },
  GOAT: {
    id: 'goat',
    name: 'Goat',
    emoji: '🐐',
    description: 'Hardy animal, produces cheese.',
    cost: 350,
    maintenanceCost: 8,
    productionTime: 50, // seconds
    products: [{ item: 'cheese', amount: 1, value: 35 }],
    maxHealth: 100,
    happinessDecay: 1.2,
    hungerRate: 3.5,
    feedCost: 18,
    requirements: {
      space: 1,
      level: 3,
    },
    bonuses: {
      cheese: 1.0,
    },
  },
};

/**
 * Livestock System - Handles animal management, feeding, and production
 * @class LivestockSystem
 */
export class LivestockSystem {
  /**
   * Creates a new LivestockSystem instance
   * @param {Object|null} gameState - Current game state (can be null initially)
   * @param {Object} gameActions - Game action dispatchers
   */
  constructor(gameState, gameActions) {
    this.gameState = gameState;
    this.actions = gameActions;
    this.lastUpdate = Date.now();
  }

  /**
   * Updates livestock system state (called by game loop)
   * Updates animal stats (happiness, hunger, health, production)
   * @param {Object} currentState - Current game state
   */
  update(currentState) {
    this.gameState = currentState;
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = now;

    if (!this.gameState.livestock?.animals) {
      return;
    }

    const updatedAnimals = this.gameState.livestock.animals.map((animal) => {
      // Update happiness (decays over time)
      let newHappiness = Math.max(
        0,
        animal.happiness - (animal.type.happinessDecay * deltaTime) / 60
      );

      // Update hunger (increases over time)
      let newHunger = Math.min(100, animal.hunger + (animal.type.hungerRate * deltaTime) / 60);

      // Update health (decreases if hungry or unhappy)
      let newHealth = animal.health;
      if (newHunger > 80 || newHappiness < 20) {
        newHealth = Math.max(0, newHealth - (5 * deltaTime) / 60);
      } else if (newHunger < 30 && newHappiness > 70) {
        // Slowly recover health when well cared for
        newHealth = Math.min(animal.type.maxHealth, newHealth + (2 * deltaTime) / 60);
      }

      // Check if ready to produce
      const timeSinceLastProduction = (now - animal.lastProduction) / 1000;
      let newLastProduction = animal.lastProduction;
      let hasNewProduct = false;

      if (
        timeSinceLastProduction >= animal.type.productionTime &&
        newHealth > 50 &&
        newHappiness > 30
      ) {
        hasNewProduct = true;
        newLastProduction = now;
      }

      return {
        ...animal,
        happiness: newHappiness,
        hunger: newHunger,
        health: newHealth,
        lastProduction: newLastProduction,
        hasProduct: animal.hasProduct || hasNewProduct,
        age: animal.age + deltaTime,
      };
    });

    // Update game state with new animal data
    // React 18+ automatically batches state updates, so no manual batching needed
    if (this.actions.updateLivestock) {
      this.actions.updateLivestock({
        ...this.gameState.livestock,
        animals: updatedAnimals,
      });
    }
  }

  /**
   * Purchases a new animal if requirements are met
   * @param {string} typeId - Animal type ID to purchase
   * @returns {Object} Result object with success status and message
   */
  buyAnimal(typeId) {
    const animalType = Object.values(LIVESTOCK_TYPES).find((t) => t.id === typeId);
    if (!animalType) {
      return { success: false, message: 'Invalid animal type' };
    }

    // Check requirements
    if (this.gameState.level < animalType.requirements.level) {
      return { success: false, message: `Requires level ${animalType.requirements.level}` };
    }

    if (this.gameState.coins < animalType.cost) {
      return { success: false, message: 'Not enough coins' };
    }

    const currentSpace =
      this.gameState.livestock?.animals?.reduce((sum, a) => sum + a.type.requirements.space, 0) ||
      0;
    const maxSpace = this.gameState.livestock?.capacity || 10;

    if (currentSpace + animalType.requirements.space > maxSpace) {
      return { success: false, message: 'Not enough space. Build more barns!' };
    }

    // Create new animal
    const newAnimal = {
      id: Date.now(),
      type: animalType,
      health: animalType.maxHealth,
      happiness: 80,
      hunger: 30,
      age: 0,
      lastProduction: Date.now(),
      hasProduct: false,
      name: `${animalType.name} #${(this.gameState.livestock?.animals?.length || 0) + 1}`,
    };

    // Update state
    this.actions.spendMoney(animalType.cost);
    this.actions.updateLivestock({
      ...this.gameState.livestock,
      animals: [...(this.gameState.livestock?.animals || []), newAnimal],
    });

    this.actions.addNotification({
      message: `${animalType.emoji} Purchased ${animalType.name}!`,
      type: 'success',
    });

    return { success: true, animal: newAnimal };
  }

  // Feed an animal
  feedAnimal(animalId) {
    const animal = this.gameState.livestock?.animals?.find((a) => a.id === animalId);
    if (!animal) return { success: false, message: 'Animal not found' };

    if (this.gameState.coins < animal.type.feedCost) {
      return { success: false, message: 'Not enough coins for feed' };
    }

    // Update animal
    const updatedAnimals = this.gameState.livestock.animals.map((a) => {
      if (a.id === animalId) {
        return {
          ...a,
          hunger: Math.max(0, a.hunger - 50),
          happiness: Math.min(100, a.happiness + 10),
        };
      }
      return a;
    });

    this.actions.spendMoney(animal.type.feedCost);
    this.actions.updateLivestock({
      ...this.gameState.livestock,
      animals: updatedAnimals,
    });

    return { success: true };
  }

  // Pet/interact with animal to increase happiness
  petAnimal(animalId) {
    const updatedAnimals = this.gameState.livestock.animals.map((a) => {
      if (a.id === animalId) {
        return {
          ...a,
          happiness: Math.min(100, a.happiness + 15),
          lastInteraction: Date.now(),
        };
      }
      return a;
    });

    this.actions.updateLivestock({
      ...this.gameState.livestock,
      animals: updatedAnimals,
    });

    return { success: true };
  }

  // Collect product from animal
  collectProduct(animalId) {
    const animal = this.gameState.livestock?.animals?.find((a) => a.id === animalId);
    if (!animal) return { success: false, message: 'Animal not found' };
    if (!animal.hasProduct) return { success: false, message: 'No product ready' };

    // Calculate product value (affected by happiness and health)
    const qualityModifier = (animal.happiness / 100) * 0.3 + (animal.health / 100) * 0.3 + 0.4;
    const products = animal.type.products.map((p) => ({
      ...p,
      actualValue: Math.floor(p.value * qualityModifier),
    }));

    // Update animal
    const updatedAnimals = this.gameState.livestock.animals.map((a) => {
      if (a.id === animalId) {
        return {
          ...a,
          hasProduct: false,
        };
      }
      return a;
    });

    // Give rewards
    const totalValue = products.reduce((sum, p) => sum + p.actualValue * p.amount, 0);
    this.actions.earnMoney(totalValue);

    // Add to inventory
    products.forEach((p) => {
      this.actions.addToInventory(p.item, p.amount);
    });

    this.actions.updateLivestock({
      ...this.gameState.livestock,
      animals: updatedAnimals,
    });

    this.actions.addNotification({
      message: `${animal.type.emoji} Collected ${products[0].item}! +$${totalValue}`,
      type: 'success',
    });

    return { success: true, products, value: totalValue };
  }

  // Sell an animal
  sellAnimal(animalId) {
    const animal = this.gameState.livestock?.animals?.find((a) => a.id === animalId);
    if (!animal) return { success: false, message: 'Animal not found' };

    // Calculate sell value (50% of purchase price + age bonus)
    const ageBonus = Math.floor(animal.age / 60) * 10; // $10 per minute of age
    const sellValue = Math.floor(animal.type.cost * 0.5) + ageBonus;

    // Remove animal
    const updatedAnimals = this.gameState.livestock.animals.filter((a) => a.id !== animalId);

    this.actions.earnMoney(sellValue);
    this.actions.updateLivestock({
      ...this.gameState.livestock,
      animals: updatedAnimals,
    });

    this.actions.addNotification({
      message: `${animal.type.emoji} Sold ${animal.name} for $${sellValue}`,
      type: 'info',
    });

    return { success: true, value: sellValue };
  }

  // Upgrade barn capacity
  upgradeBarn() {
    const currentCapacity = this.gameState.livestock?.capacity || 10;
    const upgradeCost = currentCapacity * 100; // Increases with current capacity

    if (this.gameState.coins < upgradeCost) {
      return { success: false, message: 'Not enough coins' };
    }

    this.actions.spendMoney(upgradeCost);
    this.actions.updateLivestock({
      ...this.gameState.livestock,
      capacity: currentCapacity + 5,
    });

    this.actions.addNotification({
      message: `🏚️ Barn expanded! Capacity: ${currentCapacity + 5}`,
      type: 'success',
    });

    return { success: true, newCapacity: currentCapacity + 5 };
  }

  // Get livestock statistics
  getStats() {
    // Safety check - return default if gameState or livestock is null
    if (!this.gameState || !this.gameState.livestock) {
      return {
        totalAnimals: 0,
        capacity: 10,
        spaceUsed: 0,
        avgHealth: 0,
        avgHappiness: 0,
        readyProducts: 0,
        dailyCost: 0,
      };
    }

    const animals = this.gameState.livestock.animals || [];

    return {
      totalAnimals: animals.length,
      capacity: this.gameState.livestock.capacity || 10,
      spaceUsed: animals.reduce((sum, a) => sum + a.type.requirements.space, 0),
      avgHealth:
        animals.length > 0 ? animals.reduce((sum, a) => sum + a.health, 0) / animals.length : 0,
      avgHappiness:
        animals.length > 0 ? animals.reduce((sum, a) => sum + a.happiness, 0) / animals.length : 0,
      readyProducts: animals.filter((a) => a.hasProduct).length,
      dailyCost: animals.reduce((sum, a) => sum + a.type.maintenanceCost, 0),
    };
  }
}

export default LivestockSystem;
