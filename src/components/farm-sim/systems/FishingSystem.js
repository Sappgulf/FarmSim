/**
 * Fishing System - Pond management and fishing mini-game
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
    capacity: 3,
    regenRate: 1,
    cost: 0,
    name: 'Basic Pond'
  },
  IMPROVED: {
    level: 2,
    capacity: 5,
    regenRate: 1.5,
    cost: 500,
    name: 'Improved Pond',
    rarityBonus: 1.1
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

const QUALITY_TIERS = [
  { min: 0.9, label: 'Perfect', multiplier: 1.45 },
  { min: 0.75, label: 'Great', multiplier: 1.25 },
  { min: 0.55, label: 'Good', multiplier: 1.05 },
  { min: 0, label: 'Rough', multiplier: 0.9 },
];

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
    this.activeCatch = null;
  }

  getCurrentUpgrade() {
    const pondLevel = Math.max(1, Math.min(4, this.gameState?.fishing?.pond?.level || 1));
    const upgradeKey = Object.keys(POND_UPGRADES)[pondLevel - 1];
    return POND_UPGRADES[upgradeKey] || POND_UPGRADES.BASIC;
  }

  getPondAssist() {
    const level = this.getCurrentUpgrade().level || 1;
    return {
      reelStep: 0.085 + (level - 1) * 0.012,
      zoneBonus: (level - 1) * 0.012,
      progressBonus: (level - 1) * 0.05,
      tensionRecovery: (level - 1) * 0.06,
    };
  }

  /**
   * Updates fishing system state (called by game loop)
   * Regenerates fish population and updates pond state
   * @param {Object} currentState - Current game state
   */
  update(currentState) {
    this.gameState = currentState;
    const now = Date.now();
    const deltaTimeSec = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    if (!this.gameState?.fishing?.pond) return;

    const pond = this.gameState.fishing.pond;
    const upgrade = this.getCurrentUpgrade();

    if (pond.population < pond.maxPopulation) {
      const newPopulation = Math.min(
        pond.maxPopulation,
        pond.population + (upgrade.regenRate * deltaTimeSec / 60)
      );

      this.actions.updateFishing({
        ...this.gameState.fishing,
        pond: {
          ...pond,
          population: newPopulation
        }
      });
    }

  }

  /**
   * Starts a fishing attempt (mini-game)
   * @returns {Object} Result object with success status and fish data if caught
   */
  castLine() {
    if (!this.gameState?.fishing?.pond) {
      return { success: false, message: 'Pond not available' };
    }

    const pond = this.gameState.fishing.pond;

    if (pond.population < 10) {
      return { success: false, message: 'Not enough fish in pond. Wait for population to recover.' };
    }

    if (this.activeCatch) {
      return { success: false, message: 'Already fishing!' };
    }

    const hookedFish = this.determineFish();
    const now = Date.now();
    const assist = this.getPondAssist();
    const fishDifficulty = clamp(hookedFish.difficulty || 1, 1, 5);
    const size = Math.floor(Math.random() * (hookedFish.size.max - hookedFish.size.min + 1) + hookedFish.size.min);
    const zoneHalfWidth = clamp(0.16 - fishDifficulty * 0.014 + assist.zoneBonus, 0.08, 0.18);

    this.activeCatch = {
      fish: hookedFish,
      size,
      difficulty: fishDifficulty,
      startTime: now,
      lastStepTime: now,
      elapsedMs: 0,
      timeLimit: 7800 + (fishDifficulty * 1900),
      playerPosition: 0.5,
      fishPosition: Math.random() * 0.8 + 0.1,
      fishVelocity: (Math.random() - 0.5) * 0.35,
      progress: 0.15,
      lineTension: 0.1,
      zoneHalfWidth,
      inZone: false,
      distance: 0,
      qualityWindowMs: 0,
      consecutiveTicksInZone: 0,
      assist,
    };

    this.actions.updateFishing({
      ...this.gameState.fishing,
      pond: {
        ...this.gameState.fishing.pond,
        population: Math.max(0, this.gameState.fishing.pond.population - 5)
      }
    });

    return { success: true, catch: this.getActiveCatch() };
  }

  /**
   * Determines which fish was caught using weighted random selection
   * @private
   * @returns {Object} Fish object with type and stats
   */
  determineFish() {
    const upgrade = this.getCurrentUpgrade();
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

  /**
   * Step mini-game simulation
   * @param {number} deltaMs - Delta in milliseconds
   * @returns {Object} Current state or terminal result
   */
  stepMiniGame(deltaMs) {
    if (!this.activeCatch) return { success: false };

    const now = Date.now();
    const timeDelta = Number.isFinite(deltaMs) && deltaMs > 0
      ? clamp(deltaMs, 16, 350)
      : clamp(now - this.activeCatch.lastStepTime, 16, 350);

    this.activeCatch.lastStepTime = now;
    this.activeCatch.elapsedMs += timeDelta;

    const dt = timeDelta / 1000;
    const phase = (this.activeCatch.elapsedMs / 1000) * (1.5 + this.activeCatch.difficulty * 0.2);
    const drift = Math.sin(phase + this.activeCatch.difficulty) * 0.18;
    const dartChance = 0.035 + this.activeCatch.difficulty * 0.01;

    if (Math.random() < dartChance) {
      this.activeCatch.fishVelocity += (Math.random() < 0.5 ? -1 : 1) * (0.25 + this.activeCatch.difficulty * 0.06);
    }

    this.activeCatch.fishVelocity += drift * dt + (Math.random() - 0.5) * 0.25 * dt;

    const maxSpeed = 0.45 + this.activeCatch.difficulty * 0.12;
    this.activeCatch.fishVelocity = clamp(this.activeCatch.fishVelocity, -maxSpeed, maxSpeed);
    this.activeCatch.fishPosition += this.activeCatch.fishVelocity * dt;

    if (this.activeCatch.fishPosition < 0) {
      this.activeCatch.fishPosition = 0;
      this.activeCatch.fishVelocity = Math.abs(this.activeCatch.fishVelocity) * 0.7;
    } else if (this.activeCatch.fishPosition > 1) {
      this.activeCatch.fishPosition = 1;
      this.activeCatch.fishVelocity = -Math.abs(this.activeCatch.fishVelocity) * 0.7;
    }

    const distance = Math.abs(this.activeCatch.playerPosition - this.activeCatch.fishPosition);
    const inZone = distance <= this.activeCatch.zoneHalfWidth;
    this.activeCatch.inZone = inZone;
    this.activeCatch.distance = distance;

    if (inZone) {
      const control = 1 - (distance / Math.max(0.001, this.activeCatch.zoneHalfWidth));
      const progressGain = dt * (0.16 + this.activeCatch.difficulty * 0.045)
        * (0.65 + control)
        * (1 + this.activeCatch.assist.progressBonus);

      this.activeCatch.progress = clamp(this.activeCatch.progress + progressGain, 0, 1);
      this.activeCatch.lineTension = clamp(
        this.activeCatch.lineTension - dt * (0.24 + this.activeCatch.assist.tensionRecovery),
        0,
        1
      );
      this.activeCatch.qualityWindowMs += timeDelta;
      this.activeCatch.consecutiveTicksInZone += 1;
    } else {
      const pressure = clamp(distance / Math.max(0.001, this.activeCatch.zoneHalfWidth), 1, 2.5);
      this.activeCatch.progress = clamp(
        this.activeCatch.progress - dt * (0.11 + this.activeCatch.difficulty * 0.03) * pressure,
        0,
        1
      );
      this.activeCatch.lineTension = clamp(
        this.activeCatch.lineTension + dt * (0.13 + this.activeCatch.difficulty * 0.09) * pressure,
        0,
        1
      );
      this.activeCatch.consecutiveTicksInZone = 0;
    }

    if (this.activeCatch.lineTension >= 1) {
      return this.fishEscaped('line_snap');
    }

    if (this.activeCatch.elapsedMs >= this.activeCatch.timeLimit) {
      return this.fishEscaped('timeout');
    }

    if (this.activeCatch.progress >= 1) {
      return this.catchSuccess();
    }

    return {
      success: true,
      inProgress: true,
      state: this.getActiveCatch(),
    };
  }

  // Mini-game: update player position
  updateReelPosition(direction) {
    if (!this.activeCatch) return { success: false };

    const moveAmount = this.activeCatch.assist.reelStep;

    if (direction === 'left') {
      this.activeCatch.playerPosition = clamp(this.activeCatch.playerPosition - moveAmount, 0, 1);
    } else if (direction === 'right') {
      this.activeCatch.playerPosition = clamp(this.activeCatch.playerPosition + moveAmount, 0, 1);
    }

    // Aggressive reeling adds slight tension, rewarding precise corrections over spam.
    this.activeCatch.lineTension = clamp(this.activeCatch.lineTension + 0.015, 0, 1);

    return {
      success: true,
      inProgress: true,
      state: this.getActiveCatch(),
    };
  }

  // Successful catch
  catchSuccess() {
    if (!this.activeCatch) return { success: false };

    const catchState = this.activeCatch;
    const fish = catchState.fish;
    const size = catchState.size;
    const sizeRange = Math.max(1, fish.size.max - fish.size.min);

    const timeRatio = clamp(1 - (catchState.elapsedMs / catchState.timeLimit), 0, 1);
    const controlRatio = clamp(catchState.qualityWindowMs / Math.max(1, catchState.elapsedMs), 0, 1);
    const tensionScore = 1 - catchState.lineTension;
    const qualityScore = clamp(0.45 * controlRatio + 0.35 * timeRatio + 0.2 * tensionScore, 0, 1);

    const qualityTier = QUALITY_TIERS.find((tier) => qualityScore >= tier.min) || QUALITY_TIERS[QUALITY_TIERS.length - 1];
    const sizeMultiplier = 1 + ((size - fish.size.min) / sizeRange);
    const difficultyMultiplier = 1 + (catchState.difficulty * 0.35);
    const value = Math.max(
      1,
      Math.floor(fish.baseValue * sizeMultiplier * difficultyMultiplier * qualityTier.multiplier)
    );
    const xpReward = Math.max(2, Math.floor((fish.difficulty * 4) + (qualityScore * 8)));

    this.actions.earnMoney(value);
    this.actions.addXP(xpReward, { source: 'minigame', minigameId: 'fishing', skillFactor: qualityScore, label: 'Fishing Catch' });
    this.actions.addToInventory(fish.id, 1);

    const previousStats = this.gameState.fishing.stats || {};
    const streak = (previousStats.streak || 0) + 1;
    const newStats = {
      ...previousStats,
      totalCaught: (previousStats.totalCaught || 0) + 1,
      totalValue: (previousStats.totalValue || 0) + value,
      largestFish: Math.max(previousStats.largestFish || 0, size),
      streak,
      bestStreak: Math.max(previousStats.bestStreak || 0, streak),
      lastCatchQuality: qualityTier.label,
      lastCatchAt: Date.now(),
      byType: {
        ...(previousStats.byType || {}),
        [fish.id]: ((previousStats.byType || {})[fish.id] || 0) + 1
      }
    };

    this.actions.updateFishing({
      ...this.gameState.fishing,
      stats: newStats
    });

    this.actions.addNotification({
      message: `${fish.emoji} ${qualityTier.label} catch: ${fish.name} (${size}cm) +$${value} +${xpReward} XP`,
      type: 'success'
    });

    const result = {
      success: true,
      caught: true,
      fish,
      size,
      value,
      xpReward,
      quality: qualityTier.label,
      qualityScore,
    };

    this.activeCatch = null;
    return result;
  }

  // Fish escaped
  fishEscaped(reason = 'escaped') {
    if (!this.activeCatch) return { success: false };

    const fish = this.activeCatch.fish;
    const reasonLabel = reason === 'line_snap'
      ? 'The line snapped'
      : reason === 'timeout'
        ? 'The fish tired you out'
        : 'The fish got away';

    const previousStats = this.gameState.fishing.stats || {};
    this.actions.updateFishing({
      ...this.gameState.fishing,
      stats: {
        ...previousStats,
        streak: 0,
        escapes: (previousStats.escapes || 0) + 1,
        lastEscapeReason: reason,
        lastEscapeAt: Date.now(),
      },
    });

    this.actions.addNotification({
      message: `${fish.emoji} ${reasonLabel}!`,
      type: 'warning'
    });

    const result = {
      success: true,
      caught: false,
      escaped: true,
      fish,
      reason,
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

    this.actions.updateFishing({
      ...this.gameState.fishing,
      pond: {
        ...this.gameState.fishing.pond,
        level: currentLevel + 1,
        maxPopulation: 100 + (currentLevel * 50)
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
    return this.activeCatch ? { ...this.activeCatch } : null;
  }

  // Cancel fishing
  cancelFishing() {
    if (this.activeCatch) {
      this.actions.addNotification({
        message: '🎣 Stopped fishing',
        type: 'info'
      });
      this.activeCatch = null;
    }
  }

  // Get statistics
  getStats() {
    if (!this.gameState) {
      return {
        totalCaught: 0,
        totalValue: 0,
        largestFish: 0,
        streak: 0,
        bestStreak: 0,
        escapes: 0,
        lastCatchQuality: null,
        byType: {},
        pondLevel: 1,
        pondPopulation: 0
      };
    }

    return {
      totalCaught: this.gameState.fishing?.stats?.totalCaught || 0,
      totalValue: this.gameState.fishing?.stats?.totalValue || 0,
      largestFish: this.gameState.fishing?.stats?.largestFish || 0,
      streak: this.gameState.fishing?.stats?.streak || 0,
      bestStreak: this.gameState.fishing?.stats?.bestStreak || 0,
      escapes: this.gameState.fishing?.stats?.escapes || 0,
      lastCatchQuality: this.gameState.fishing?.stats?.lastCatchQuality || null,
      byType: this.gameState.fishing?.stats?.byType || {},
      pondLevel: this.gameState.fishing?.pond?.level || 1,
      pondPopulation: Math.floor(this.gameState.fishing?.pond?.population || 0)
    };
  }
}

export default FishingSystem;
