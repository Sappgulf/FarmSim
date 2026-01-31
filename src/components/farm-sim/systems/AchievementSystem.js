/**
 * Achievement System - Handles achievement tracking and unlocking
 */

import { ACHIEVEMENTS } from '../constants/achievementData';

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

    const req = achievement.requirement;
    if (!req) return false;

    // Check based on requirement type
    switch (req.type) {
      case 'harvests':
        const totalHarvested = this.state.collections?.totals?.harvested || 0;
        return totalHarvested >= req.count;

      case 'plants':
        // Count total plants from XP (approximate) or track separately
        return (this.state.xp || 0) >= req.count * 5; // Rough estimate

      case 'coins_earned':
        return (this.state.coins || 0) >= req.count;

      case 'coins_balance':
        return (this.state.coins || 0) >= req.count;

      case 'level':
        return (this.state.level || 1) >= req.count;

      case 'buildings':
        const buildingCount = Object.keys(this.state.buildings || {}).length +
          (this.state.buildingPlacements?.length || 0);
        return buildingCount >= req.count;

      case 'crop_types':
        const discoveredCrops = Object.values(this.state.collections?.crops || {})
          .filter(c => c.discovered).length;
        return discoveredCrops >= req.count;

      case 'expansions':
        return (this.state.gridSize || 3) >= 3 + req.count;

      // Cozy Identity v1 achievements
      case 'collection_discovered':
        const discovered = Object.values(this.state.collections?.crops || {})
          .filter(c => c.discovered).length;
        return discovered >= req.count;

      case 'collection_steadfast':
        const steadfastCount = Object.values(this.state.collections?.crops || {})
          .filter(c => c.milestones?.steadfast).length;
        return steadfastCount >= req.count;

      case 'collection_legend':
        const legendCount = Object.values(this.state.collections?.crops || {})
          .filter(c => c.milestones?.legend).length;
        return legendCount >= req.count;

      case 'reputation':
        return (this.state.social?.reputation || 0) >= req.count;

      case 'seasonal_harvest':
        // Track seasonal harvests in game state (simplified check)
        const currentSeason = this.state.season?.current;
        if (currentSeason === req.season) {
          const totalHarvests = this.state.collections?.totals?.harvested || 0;
          return totalHarvests >= req.count;
        }
        return false;

      case 'seasonal_completion':
        // Check if player has harvested in all 4 seasons (tracked via collections progress)
        // Simplified: check if player has significant harvests
        return (this.state.collections?.totals?.harvested || 0) >= 40;

      case 'photo_mode':
        // Photo mode usage is tracked when entering photo mode
        return this.state.photoMode === true || (this.state.achievements || [])
          .some(a => a.id === 'photo_enthusiast' && a.unlocked);

      case 'decorations_placed':
        return (this.state.decorations?.length || 0) >= req.count;

      case 'identity_complete':
        // Check if farm has a custom name and non-default theme
        const hasCustomName = this.state.farmName && this.state.farmName !== 'My Farm';
        const hasTheme = this.state.theme && this.state.theme !== 'default';
        return hasCustomName || hasTheme;

      // Legacy checks
      default:
        switch (achievement.id) {
          case 'first_harvest':
            const inventoryCount = Object.values(this.state.inventory || {}).reduce((sum, qty) => {
              const count = typeof qty === 'number' ? qty : 0;
              return sum + count;
            }, 0);
            return inventoryCount > 0;

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
  }

  unlockAchievement(achievement) {
    const updatedAchievements = Array.isArray(this.state?.achievements)
      ? [...this.state.achievements]
      : [];
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
        this.actions.grantXP(achievement.reward.xp, 'achievement', { achievementId: achievement.id });
      }
    }
  }

  getAchievements() {
    // Return all achievements from the data file
    return ACHIEVEMENTS.map(a => ({
      ...a,
      icon: a.emoji,
      unlocked: false
    }));
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
