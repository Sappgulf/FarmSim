/**
 * Achievement Tracking Hook
 * Detects and unlocks achievements based on game state
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';

export function useAchievements(addNotification, playSound, fireConfetti) {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [recentUnlock, setRecentUnlock] = useState(null);
  const checkQueueRef = useRef([]);

  // Unlock an achievement
  const unlockAchievement = useCallback(
    (achievementId) => {
      setUnlockedAchievements((prev) => {
        if (prev.includes(achievementId)) return prev;

        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return prev;

        // Show notification
        if (addNotification) {
          addNotification(
            `${achievement.icon} Achievement Unlocked: ${achievement.name}! +${achievement.reward}`,
            'success'
          );
        }

        // Play sound and effects
        if (playSound) playSound();
        if (fireConfetti) fireConfetti('medium');

        // Set recent unlock for celebration
        setRecentUnlock(achievement);
        setTimeout(() => setRecentUnlock(null), 3000);

        return [...prev, achievementId];
      });
    },
    [addNotification, playSound, fireConfetti]
  );

  // Check achievements based on current state
  const checkAchievements = useCallback(
    (gameState) => {
      const {
        stats = {},
        totalEarned = 0,
        prestige = 0,
        gridSize = 3,
        buildings = [],
        discoveredHybrids = [],
        inventory = {},
        levelId,
        levelStatus,
        levelStartedAt,
      } = gameState;

      const checks = [];

      // FARMING ACHIEVEMENTS
      if (stats.totalHarvests >= 1) checks.push('first_harvest');
      if (stats.totalHarvests >= 25) checks.push('mass_producer');
      if (stats.totalHarvests >= 100) checks.push('centurion');
      if (stats.qualityHarvests >= 5) checks.push('quality_farmer');
      if (gridSize >= 5) checks.push('field_master');

      // ECONOMY ACHIEVEMENTS
      if (totalEarned >= 300) checks.push('coin_collector');
      if (totalEarned >= 800) checks.push('millionaire');
      if (totalEarned >= 1000) checks.push('thousand_coins');

      // PROGRESSION ACHIEVEMENTS
      if (prestige >= 1) checks.push('prestige_pioneer');
      if (prestige >= 3) checks.push('master_farmer');

      // BUILDING ACHIEVEMENTS
      if (buildings.length >= 1) checks.push('first_building');
      if (buildings.length >= 5) checks.push('farm_empire');

      // ENVIRONMENTAL ACHIEVEMENTS
      if (stats.weatherSurvived >= 3) checks.push('weathered');
      if (stats.cropsPlanted >= 5) checks.push('season_expert'); // Simplified check

      // CHALLENGE ACHIEVEMENTS
      if (stats.pestsEliminated >= 10) checks.push('pest_controller');
      if (stats.diseasesCured >= 15) checks.push('disease_fighter');

      // BREEDING ACHIEVEMENTS
      if (discoveredHybrids.length >= 1) checks.push('first_hybrid');
      if (discoveredHybrids.length >= 3) checks.push('mutation_hunter');

      // Speed farmer check (Level 1 in under 4 minutes)
      if (levelId === 'lvl1' && levelStatus === 'won' && levelStartedAt) {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - levelStartedAt;
        if (elapsed < 240) checks.push('speed_farmer');
      }

      // Check for legend (all achievements)
      const allOtherAchievements = ACHIEVEMENTS.filter((a) => a.id !== 'farm_legend').map(
        (a) => a.id
      );
      const hasAll = allOtherAchievements.every(
        (id) => unlockedAchievements.includes(id) || checks.includes(id)
      );
      if (hasAll) checks.push('farm_legend');

      // Unlock any new achievements
      checks.forEach((id) => {
        if (!unlockedAchievements.includes(id)) {
          unlockAchievement(id);
        }
      });
    },
    [unlockedAchievements, unlockAchievement]
  );

  // Get achievement progress
  const getAchievementProgress = useCallback((achievementId, gameState) => {
    const {
      stats = {},
      totalEarned = 0,
      buildings = [],
      discoveredHybrids = [],
      gridSize = 3,
      prestige = 0,
    } = gameState;

    switch (achievementId) {
      case 'first_harvest':
        return { current: Math.min(stats.totalHarvests || 0, 1), target: 1 };
      case 'mass_producer':
        return { current: stats.totalHarvests || 0, target: 25 };
      case 'centurion':
        return { current: stats.totalHarvests || 0, target: 100 };
      case 'quality_farmer':
        return { current: stats.qualityHarvests || 0, target: 5 };
      case 'field_master':
        return { current: gridSize, target: 5 };
      case 'coin_collector':
        return { current: totalEarned, target: 300 };
      case 'millionaire':
        return { current: totalEarned, target: 800 };
      case 'thousand_coins':
        return { current: totalEarned, target: 1000 };
      case 'prestige_pioneer':
        return { current: prestige, target: 1 };
      case 'master_farmer':
        return { current: prestige, target: 3 };
      case 'first_building':
        return { current: Math.min(buildings.length, 1), target: 1 };
      case 'farm_empire':
        return { current: buildings.length, target: 5 };
      case 'weathered':
        return { current: stats.weatherSurvived || 0, target: 3 };
      case 'pest_controller':
        return { current: stats.pestsEliminated || 0, target: 10 };
      case 'disease_fighter':
        return { current: stats.diseasesCured || 0, target: 15 };
      case 'first_hybrid':
        return { current: Math.min(discoveredHybrids.length, 1), target: 1 };
      case 'mutation_hunter':
        return { current: discoveredHybrids.length, target: 3 };
      default:
        return { current: 0, target: 1 };
    }
  }, []);

  // Get total reward from unlocked achievements
  const getTotalReward = useCallback(() => {
    return unlockedAchievements.reduce((total, id) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      return total + (achievement?.reward || 0);
    }, 0);
  }, [unlockedAchievements]);

  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    return Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);
  }, [unlockedAchievements]);

  // Save/load
  const getSaveData = useCallback(
    () => ({
      unlockedAchievements,
    }),
    [unlockedAchievements]
  );

  const loadSaveData = useCallback((data) => {
    if (data?.unlockedAchievements) {
      setUnlockedAchievements(data.unlockedAchievements);
    }
  }, []);

  return {
    unlockedAchievements,
    recentUnlock,
    unlockAchievement,
    checkAchievements,
    getAchievementProgress,
    getTotalReward,
    getCompletionPercentage,
    getSaveData,
    loadSaveData,
  };
}
