import { useState, useEffect, useCallback } from 'react';
import { ACHIEVEMENTS } from '../utils/gameConstants';

/**
 * Achievement System Hook
 * Tracks progress and unlocks achievements
 */
export function useAchievements(gameState) {
  const { 
    totalEarned, 
    totalHarvests, 
    qualityHarvests,
    weatherEvents,
    addNotification, 
    addLog,
    addCoins
  } = gameState;

  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({});

  // Check if achievement is unlocked
  const isUnlocked = useCallback((achievementId) => {
    return unlockedAchievements.includes(achievementId);
  }, [unlockedAchievements]);

  // Unlock an achievement
  const unlockAchievement = useCallback((achievementId) => {
    if (isUnlocked(achievementId)) return false;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return false;

    setUnlockedAchievements(prev => [...prev, achievementId]);
    addCoins(achievement.reward);
    
    addNotification(
      `🏆 Achievement Unlocked: ${achievement.name}! +${achievement.reward} coins`,
      "success"
    );
    
    addLog(`🏆 ${achievement.name}: ${achievement.desc}`);
    
    return true;
  }, [isUnlocked, addCoins, addNotification, addLog]);

  // Update achievement progress
  const updateProgress = useCallback((achievementId, progress) => {
    setAchievementProgress(prev => ({
      ...prev,
      [achievementId]: progress
    }));
  }, []);

  // Check specific achievements
  const checkAchievements = useCallback(() => {
    // First Harvest
    if (totalHarvests >= 1 && !isUnlocked("first_harvest")) {
      unlockAchievement("first_harvest");
    }

    // Green Thumb - 10 harvests
    if (totalHarvests >= 10 && !isUnlocked("green_thumb")) {
      unlockAchievement("green_thumb");
    }

    // Mass Producer - 25 harvests
    if (totalHarvests >= 25 && !isUnlocked("mass_producer")) {
      unlockAchievement("mass_producer");
    }

    // Quality Farmer - 5 high quality crops
    if (qualityHarvests >= 5 && !isUnlocked("quality_farmer")) {
      unlockAchievement("quality_farmer");
    }

    // Weather Expert - survive 3 weather events
    if (weatherEvents >= 3 && !isUnlocked("weathered")) {
      unlockAchievement("weathered");
    }

    // Coin Collector - earn 300 coins total
    if (totalEarned >= 300 && !isUnlocked("coin_collector")) {
      unlockAchievement("coin_collector");
    }

    // Farm Millionaire - earn 800 coins total
    if (totalEarned >= 800 && !isUnlocked("millionaire")) {
      unlockAchievement("millionaire");
    }

    // Update progress for incomplete achievements
    updateProgress("green_thumb", Math.min(100, (totalHarvests / 10) * 100));
    updateProgress("mass_producer", Math.min(100, (totalHarvests / 25) * 100));
    updateProgress("quality_farmer", Math.min(100, (qualityHarvests / 5) * 100));
    updateProgress("weathered", Math.min(100, (weatherEvents / 3) * 100));
    updateProgress("coin_collector", Math.min(100, (totalEarned / 300) * 100));
    updateProgress("millionaire", Math.min(100, (totalEarned / 800) * 100));
    
  }, [
    totalHarvests, 
    qualityHarvests, 
    weatherEvents, 
    totalEarned, 
    isUnlocked, 
    unlockAchievement, 
    updateProgress
  ]);

  // Check achievements when relevant stats change
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Get achievement statistics
  const getStats = useCallback(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievements.length;
    const totalRewards = unlockedAchievements.reduce((sum, id) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      return sum + (achievement?.reward || 0);
    }, 0);

    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.floor((unlocked / total) * 100) : 0,
      totalRewards
    };
  }, [unlockedAchievements]);

  // Get next achievement to work towards
  const getNextAchievement = useCallback(() => {
    const locked = ACHIEVEMENTS.filter(a => !isUnlocked(a.id));
    if (locked.length === 0) return null;

    // Find the achievement with highest progress
    return locked.reduce((best, current) => {
      const currentProgress = achievementProgress[current.id] || 0;
      const bestProgress = achievementProgress[best.id] || 0;
      return currentProgress > bestProgress ? current : best;
    });
  }, [isUnlocked, achievementProgress]);

  return {
    // State
    unlockedAchievements,
    achievementProgress,
    
    // Utilities
    isUnlocked,
    unlockAchievement,
    checkAchievements,
    
    // Computed values
    stats: getStats(),
    nextAchievement: getNextAchievement(),
    
    // All achievements with progress
    allAchievements: ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: isUnlocked(achievement.id),
      progress: achievementProgress[achievement.id] || 0
    }))
  };
}
