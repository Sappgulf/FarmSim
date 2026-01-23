/**
 * Achievement System - Handles achievement tracking and unlocking
 */

export class AchievementSystem {
  constructor(gameState, gameActions) {
    this.state = gameState;
    this.actions = gameActions;
    this.lastCheck = Date.now();
  }

  update(currentState) {
    // FIXED: Update internal state reference
    if (!currentState) {
      console.error('[farm] AchievementSystem: update() called with null/undefined state');
      return;
    }
    
    this.state = currentState;
    
    // Check achievements periodically (every 5 seconds)
    const now = Date.now();
    if (now - this.lastCheck < 5000) return;

    this.lastCheck = now;
    this.checkAchievements();
  }

  checkAchievements() {
    // Safety check - ensure state exists before checking achievements
    if (!this.state) {
      console.warn('[farm] AchievementSystem: No state available for achievement checks');
      return;
    }
    
    const achievements = this.getAchievements();
    let hasNewAchievement = false;
    const unlockedIds = new Set(
      (this.state.achievements || [])
        .filter(achievement => achievement.unlocked)
        .map(achievement => achievement.id)
    );

    achievements.forEach(achievement => {
      if (unlockedIds.has(achievement.id)) {
        return;
      }

      if (this.checkAchievementCondition(achievement)) {
        this.unlockAchievement(achievement);
        hasNewAchievement = true;
      }
    });

    if (hasNewAchievement) {
      this.actions.addNotification({
        message: 'New achievement unlocked!',
        type: 'success'
      });
    }
  }

  checkAchievementCondition(achievement) {
    // Safety check - ensure state exists
    if (!this.state) return false;
    
    switch (achievement.id) {
      case 'first_harvest':
        return (this.state.xp || 0) > 0;

      case 'coin_collector':
        return (this.state.coins || 0) >= 300;

      case 'level_up':
        return (this.state.level || 1) >= 5;

      case 'big_farmer':
        return (this.state.plots || []).filter(p => p.state !== 'empty').length >= 5;

      case 'master_farmer':
        return (this.state.level || 1) >= 10;

      default:
        return false;
    }
  }

  unlockAchievement(achievement) {
    const updatedAchievements = [...this.state.achievements];
    const achievementIndex = updatedAchievements.findIndex(a => a.id === achievement.id);

    if (achievementIndex >= 0) {
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        unlocked: true,
        unlockedAt: Date.now()
      };
    } else {
      updatedAchievements.push({
        ...achievement,
        unlocked: true,
        unlockedAt: Date.now()
      });
    }

    this.actions.updateAchievements(updatedAchievements);

    // Grant rewards
    if (achievement.reward && this.state) {
      if (achievement.reward.coins) {
        this.actions.setCoins((this.state.coins || 0) + achievement.reward.coins);
      }
      if (achievement.reward.xp) {
        if (typeof this.actions.addXP === 'function') {
          this.actions.addXP(achievement.reward.xp, `achievement:${achievement.id}`);
        } else {
          this.actions.setXp((this.state.xp || 0) + achievement.reward.xp);
        }
      }
    }
  }

  getAchievements() {
    return [
      {
        id: 'first_harvest',
        name: 'First Harvest',
        description: 'Harvest your first crop',
        icon: '🌱',
        reward: { coins: 50, xp: 25 },
        unlocked: false
      },
      {
        id: 'coin_collector',
        name: 'Coin Collector',
        description: 'Earn 300 coins',
        icon: '💰',
        reward: { coins: 100, xp: 50 },
        unlocked: false
      },
      {
        id: 'level_up',
        name: 'Growing Farmer',
        description: 'Reach level 5',
        icon: '⭐',
        reward: { coins: 200, xp: 100 },
        unlocked: false
      },
      {
        id: 'big_farmer',
        name: 'Big Farmer',
        description: 'Have 5 crops planted at once',
        icon: '🚜',
        reward: { coins: 150, xp: 75 },
        unlocked: false
      },
      {
        id: 'master_farmer',
        name: 'Master Farmer',
        description: 'Reach level 10',
        icon: '👑',
        reward: { coins: 500, xp: 250 },
        unlocked: false
      }
    ];
  }

  getAchievementProgress(achievementId) {
    const achievement = this.getAchievements().find(a => a.id === achievementId);
    if (!achievement || !this.state) return 0;

    switch (achievement.id) {
      case 'coin_collector':
        return Math.min(100, ((this.state.coins || 0) / 300) * 100);
      case 'level_up':
        return Math.min(100, ((this.state.level || 1) / 5) * 100);
      case 'big_farmer':
        const activePlots = (this.state.plots || []).filter(p => p.state !== 'empty').length;
        return Math.min(100, (activePlots / 5) * 100);
      case 'master_farmer':
        return Math.min(100, ((this.state.level || 1) / 10) * 100);
      default:
        return this.checkAchievementCondition(achievement) ? 100 : 0;
    }
  }

  getCompletedAchievements() {
    if (!this.state || !this.state.achievements) return [];
    return this.state.achievements.filter(a => a.unlocked);
  }

  getTotalAchievements() {
    return this.getAchievements().length;
  }

  getAchievementStats() {
    const completed = this.getCompletedAchievements();
    return {
      completed: completed.length,
      total: this.getTotalAchievements(),
      completionRate: Math.round((completed.length / this.getTotalAchievements()) * 100),
      recent: completed.slice(-3) // Last 3 unlocked achievements
    };
  }
}
