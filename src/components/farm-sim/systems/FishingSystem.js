/**
 * Fishing System - Pond management and fishing mini-game
 */

export const FISH_TYPES = {
  COMMON: {
    id: 'common',
    name: 'Common Fish',
    emoji: '🐟',
    rarity: 0.6, // 60% chance
    baseValue: 20,
    difficulty: 1,
    size: { min: 5, max: 15 },
    description: 'A typical pond fish'
  },
  UNCOMMON: {
    id: 'uncommon',
    name: 'Bass',
    emoji: '🐠',
    rarity: 0.25, // 25% chance
    baseValue: 40,
    difficulty: 2,
    size: { min: 10, max: 25 },
    description: 'A feisty bass'
  },
  RARE: {
    id: 'rare',
    name: 'Trout',
    emoji: '🎣',
    rarity: 0.1, // 10% chance
    baseValue: 80,
    difficulty: 3,
    size: { min: 20, max: 40 },
    description: 'A beautiful trout'
  },
  EPIC: {
    id: 'epic',
    name: 'Salmon',
    emoji: '🐡',
    rarity: 0.04, // 4% chance
    baseValue: 150,
    difficulty: 4,
    size: { min: 30, max: 60 },
    description: 'A prized salmon'
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Golden Koi',
    emoji: '🐲',
    rarity: 0.01, // 1% chance
    baseValue: 500,
    difficulty: 5,
    size: { min: 40, max: 100 },
    description: 'A legendary golden koi!'
  }
};

export const POND_UPGRADES = {
  BASIC: {
    level: 1,
    capacity: 3, // Max concurrent fishing attempts
    regenRate: 1, // Fish population regeneration
    cost: 0,
    name: 'Basic Pond'
  },
  IMPROVED: {
    level: 2,
    capacity: 5,
    regenRate: 1.5,
    cost: 500,
    name: 'Improved Pond',
    rarityBonus: 1.1 // 10% better rarity chances
  },
  ADVANCED: {
    level: 3,
    capacity: 8,
    regenRate: 2,
    cost: 1500,
    name: 'Advanced Pond',
    rarityBonus: 1.25
  },
  MASTER: {
    level: 4,
    capacity: 12,
    regenRate: 3,
    cost: 5000,
    name: 'Master Pond',
    rarityBonus: 1.5
  }
};

/**
 * Fishing System - Handles pond management, fish catching, and mini-game mechanics
 * @class FishingSystem
 */
export class FishingSystem {
  /**
   * Creates a new FishingSystem instance
   * @param {Object|null} gameState - Current game state (can be null initially)
   * @param {Object} gameActions - Game action dispatchers
   */
  constructor(gameState, gameActions) {
    this.gameState = gameState;
    this.actions = gameActions;
    this.lastUpdate = Date.now();
    this.pondPopulation = null;
    
    // Mini-game state
    this.activeCatch = null;
  }

  /**
   * Updates fishing system state (called by game loop)
   * Regenerates fish population and updates pond state
   * @param {Object} currentState - Current game state
   */
  update(currentState) {
    this.gameState = currentState;
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    if (!this.gameState.fishing) return;

    // Regenerate fish population
    const pond = this.gameState.fishing.pond;
    const level = Math.max(1, Math.min(4, pond.level || 1)); // Clamp level between 1-4
    const upgradeKey = Object.keys(POND_UPGRADES)[level - 1];
    const upgrade = POND_UPGRADES[upgradeKey];

    if (!upgrade) {
      console.error('[farm]', 'FishingSystem: Invalid upgrade level', { level, upgradeKey });
      return;
    }
    
    if (!Number.isFinite(this.pondPopulation)) {
      this.pondPopulation = pond.population;
    }

    if (this.pondPopulation < pond.maxPopulation) {
      const newPopulation = Math.min(
        pond.maxPopulation,
        this.pondPopulation + (upgrade.regenRate * deltaTime / 60) // Regen per minute
      );

      this.pondPopulation = newPopulation;

      const shouldSync = Math.abs(newPopulation - pond.population) >= 0.5 || newPopulation >= pond.maxPopulation;
      if (shouldSync) {
        this.actions.updateFishing({
          ...this.gameState.fishing,
          pond: {
            ...pond,
            population: newPopulation
          }
        });
      }
    }
  }

  /**
   * Starts a fishing attempt (mini-game)
   * @returns {Object} Result object with success status and fish data if caught
   */
  castLine() {
    if (!this.gameState?.fishing?.pond) {
      console.error('[farm]', 'FishingSystem: Pond not available - system may not be initialized properly');
      return { success: false, message: 'Pond not available' };
    }

    const pond = this.gameState.fishing.pond;
    
    if (pond.population < 10) {
      return { success: false, message: 'Not enough fish in pond. Wait for population to recover.' };
    }

    if (this.activeCatch) {
      return { success: false, message: 'Already fishing!' };
    }

    // Determine what fish was hooked
    const hookedFish = this.determineFish();

    // Create mini-game state
    this.activeCatch = {
      fish: hookedFish,
      startTime: Date.now(),
      progress: 0,
      difficulty: hookedFish.difficulty,
      targetZone: Math.random(), // Where the fish wants to be (0-1)
      playerPosition: 0.5, // Player's reel position (0-1)
      timeLimit: 5000 + (hookedFish.difficulty * 2000), // 5-15 seconds based on difficulty
      escapeChance: hookedFish.difficulty * 0.15, // Higher difficulty = more likely to escape
      size: Math.floor(Math.random() * (hookedFish.size.max - hookedFish.size.min) + hookedFish.size.min)
    };

    // Reduce pond population
    const newPopulation = Math.max(0, (this.pondPopulation ?? this.gameState.fishing.pond.population) - 5);
    this.pondPopulation = newPopulation;

    this.actions.updateFishing({
      ...this.gameState.fishing,
      pond: {
        ...this.gameState.fishing.pond,
        population: newPopulation
      }
    });

    return { success: true, catch: this.activeCatch };
  }

  /**
   * Determines which fish was caught using weighted random selection
   * @private
   * @returns {Object} Fish object with type and stats
   */
  determineFish() {
    const pond = this.gameState.fishing.pond;
    const level = Math.max(1, Math.min(4, pond.level || 1)); // Clamp level between 1-4
    const upgradeKey = Object.keys(POND_UPGRADES)[level - 1];
    const upgrade = POND_UPGRADES[upgradeKey];

    if (!upgrade) {
      console.error('[farm]', 'FishingSystem: Invalid upgrade level', { level, upgradeKey });
      return FISH_TYPES.COMMON;
    }

    const rarityBonus = upgrade.rarityBonus || 1.0;

    const fishArray = Object.values(FISH_TYPES).map((fish) => {
      const adjustedWeight = fish.rarity * (fish.rarity < 0.1 ? rarityBonus : 1.0);
      return { fish, weight: adjustedWeight };
    });

    const totalWeight = fishArray.reduce((sum, entry) => sum + entry.weight, 0);
    const roll = Math.random() * (totalWeight || 1);
    let cumulative = 0;

    for (const entry of fishArray) {
      cumulative += entry.weight;
      if (roll <= cumulative) {
        return { ...entry.fish };
      }
    }

    return { ...FISH_TYPES.COMMON };
  }

  // Mini-game: update player position
  updateReelPosition(direction) {
    if (!this.activeCatch) return { success: false };

    const moveAmount = 0.1;
    
    if (direction === 'left') {
      this.activeCatch.playerPosition = Math.max(0, this.activeCatch.playerPosition - moveAmount);
    } else if (direction === 'right') {
      this.activeCatch.playerPosition = Math.min(1, this.activeCatch.playerPosition + moveAmount);
    }

    // Check if player is in target zone
    const distance = Math.abs(this.activeCatch.playerPosition - this.activeCatch.targetZone);
    const inZone = distance < 0.15; // Within 15% is "good"

    if (inZone) {
      this.activeCatch.progress += 0.05; // Gain progress
    } else {
      this.activeCatch.progress -= 0.02; // Lose progress
      
      // Fish might escape if player is way off
      if (distance > 0.4 && Math.random() < this.activeCatch.escapeChance) {
        return this.fishEscaped();
      }
    }

    // Fish changes target zone occasionally (more dynamic)
    if (Math.random() < 0.08) {
      // Move target zone to a new random position
      this.activeCatch.targetZone = Math.random();
    } else if (Math.random() < 0.03) {
      // Occasionally make small adjustments
      this.activeCatch.targetZone = Math.max(0.1, Math.min(0.9,
        this.activeCatch.targetZone + (Math.random() - 0.5) * 0.2
      ));
    }

    // Check win condition
    if (this.activeCatch.progress >= 1.0) {
      return this.catchSuccess();
    }

    // Check time limit
    const elapsed = Date.now() - this.activeCatch.startTime;
    if (elapsed > this.activeCatch.timeLimit) {
      return this.fishEscaped();
    }

    return { success: true, inProgress: true, state: this.activeCatch };
  }

  // Successful catch
  catchSuccess() {
    if (!this.activeCatch) return { success: false };

    const fish = this.activeCatch.fish;
    const size = this.activeCatch.size;

    // Calculate value based on size (with bonus for perfect catches)
    const sizeMultiplier = 1 + ((size - fish.size.min) / (fish.size.max - fish.size.min));
    const difficultyBonus = this.activeCatch.difficulty * 0.5; // Bonus for harder fish
    const currentStreak = (this.gameState.fishing.stats?.streak || 0) + 1;
    const streakBonus = Math.min(0.2, currentStreak * 0.02);
    const value = Math.floor(fish.baseValue * sizeMultiplier * (1 + difficultyBonus) * (1 + streakBonus));

    // Give rewards
    this.actions.earnMoney(value);
    this.actions.addXP(fish.difficulty * 5);
    
    // Add to inventory/collection
    this.actions.addToInventory(fish.id, 1);

    // Update statistics
    const newStats = {
      totalCaught: (this.gameState.fishing.stats?.totalCaught || 0) + 1,
      totalValue: (this.gameState.fishing.stats?.totalValue || 0) + value,
      largestFish: Math.max(this.gameState.fishing.stats?.largestFish || 0, size),
      byType: {
        ...(this.gameState.fishing.stats?.byType || {}),
        [fish.id]: ((this.gameState.fishing.stats?.byType || {})[fish.id] || 0) + 1
      },
      streak: currentStreak,
      bestStreak: Math.max(this.gameState.fishing.stats?.bestStreak || 0, currentStreak)
    };

    this.actions.updateFishing({
      ...this.gameState.fishing,
      stats: newStats
    });

    const streakMessage = currentStreak > 1 ? ` (Streak x${currentStreak})` : '';
    this.actions.addNotification({
      message: `${fish.emoji} Caught ${fish.name} (${size}cm)! +$${value}${streakMessage}`,
      type: 'success'
    });

    const result = {
      success: true,
      caught: true,
      fish,
      size,
      value
    };

    this.activeCatch = null;
    return result;
  }

  // Fish escaped
  fishEscaped() {
    if (!this.activeCatch) return { success: false };

    const fish = this.activeCatch.fish;

    const nextStats = {
      ...(this.gameState.fishing?.stats || {}),
      streak: 0,
      bestStreak: this.gameState.fishing?.stats?.bestStreak || 0
    };

    this.actions.updateFishing({
      ...this.gameState.fishing,
      stats: nextStats
    });

    this.actions.addNotification({
      message: `${fish.emoji} The ${fish.name} got away! Streak reset.`,
      type: 'warning'
    });

    const result = {
      success: true,
      caught: false,
      escaped: true,
      fish
    };

    this.activeCatch = null;
    return result;
  }

  // Upgrade pond
  upgradePond() {
    const currentLevel = this.gameState.fishing?.pond?.level || 1;
    
    if (currentLevel >= Object.keys(POND_UPGRADES).length) {
      return { success: false, message: 'Pond already at max level' };
    }

    const nextUpgrade = POND_UPGRADES[Object.keys(POND_UPGRADES)[currentLevel]];
    
    if (this.gameState.coins < nextUpgrade.cost) {
      return { success: false, message: 'Not enough coins' };
    }

    this.actions.spendMoney(nextUpgrade.cost);
    
    const nextMaxPopulation = 100 + (currentLevel * 50);
    this.pondPopulation = Math.min(
      this.pondPopulation ?? this.gameState.fishing.pond.population,
      nextMaxPopulation
    );

    this.actions.updateFishing({
      ...this.gameState.fishing,
      pond: {
        ...this.gameState.fishing.pond,
        level: currentLevel + 1,
        maxPopulation: nextMaxPopulation,
        population: this.pondPopulation
      }
    });

    this.actions.addNotification({
      message: `🎣 Pond upgraded to ${nextUpgrade.name}!`,
      type: 'success'
    });

    return { success: true, upgrade: nextUpgrade };
  }

  // Get current mini-game state
  getActiveCatch() {
    return this.activeCatch;
  }

  // Cancel fishing
  cancelFishing() {
    if (this.activeCatch) {
      this.actions.addNotification({
        message: `🎣 Stopped fishing`,
        type: 'info'
      });
      this.activeCatch = null;
    }
  }

  // Get statistics
  getStats() {
    // Safety check - return default if gameState is null
    if (!this.gameState) {
      return {
        totalCaught: 0,
        totalValue: 0,
        largestFish: 0,
        byType: {},
        streak: 0,
        bestStreak: 0,
        pondLevel: 1,
        pondPopulation: 0
      };
    }
    
    return {
      totalCaught: this.gameState.fishing?.stats?.totalCaught || 0,
      totalValue: this.gameState.fishing?.stats?.totalValue || 0,
      largestFish: this.gameState.fishing?.stats?.largestFish || 0,
      byType: this.gameState.fishing?.stats?.byType || {},
      streak: this.gameState.fishing?.stats?.streak || 0,
      bestStreak: this.gameState.fishing?.stats?.bestStreak || 0,
      pondLevel: this.gameState.fishing?.pond?.level || 1,
      pondPopulation: Math.floor(this.gameState.fishing?.pond?.population || 0)
    };
  }
}

export default FishingSystem;
