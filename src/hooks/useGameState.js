/**
 * Core Game State Hook
 * Manages main game state, saves, and global game logic
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { LEVELS, GAME_SETTINGS, PRESTIGE_LEVELS } from '../data/constants';
import { nowSec } from '../utils/time.mjs';

const INITIAL_STATE = {
  coins: 50,
  score: 0,
  totalEarned: 0,
  name: "My Farm",
  prestige: 0,
  skillPoints: 0,
  levelId: "lvl1",
  levelStatus: "playing",
  levelEndsAt: 0,
  levelStartedAt: 0,
  tutorialComplete: false,
  tutorialStep: 0,
};

export function useGameState() {
  // Core state
  const [coins, setCoins] = useState(INITIAL_STATE.coins);
  const [score, setScore] = useState(INITIAL_STATE.score);
  const [totalEarned, setTotalEarned] = useState(INITIAL_STATE.totalEarned);
  const [name, setName] = useState(INITIAL_STATE.name);
  const [prestige, setPrestige] = useState(INITIAL_STATE.prestige);
  const [skillPoints, setSkillPoints] = useState(INITIAL_STATE.skillPoints);

  // Level/goal tracking
  const [levelId, setLevelId] = useState(INITIAL_STATE.levelId);
  const [levelStatus, setLevelStatus] = useState(INITIAL_STATE.levelStatus);
  const [levelEndsAt, setLevelEndsAt] = useState(INITIAL_STATE.levelEndsAt);
  const [levelStartedAt, setLevelStartedAt] = useState(INITIAL_STATE.levelStartedAt);

  // Tutorial
  const [tutorialComplete, setTutorialComplete] = useState(INITIAL_STATE.tutorialComplete);
  const [tutorialStep, setTutorialStep] = useState(INITIAL_STATE.tutorialStep);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  // Statistics
  const [stats, setStats] = useState({
    totalHarvests: 0,
    qualityHarvests: 0,
    pestsEliminated: 0,
    diseasesCured: 0,
    cropsPlanted: 0,
    weatherSurvived: 0,
  });

  // Get current level data
  const level = LEVELS.find(l => l.id === levelId);
  const prestigeData = PRESTIGE_LEVELS[prestige] || PRESTIGE_LEVELS[0];

  // Add notification
  const addNotification = useCallback((message, type = 'info', duration = GAME_SETTINGS.NOTIFICATION_DURATION) => {
    const id = ++notificationIdRef.current;
    setNotifications(prev => [...prev.slice(-4), { id, message, type, timestamp: Date.now() }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Add coins with prestige multiplier
  const addCoins = useCallback((amount, source = 'unknown') => {
    const multipliedAmount = Math.round(amount * prestigeData.multiplier);
    setCoins(prev => prev + multipliedAmount);
    setTotalEarned(prev => prev + multipliedAmount);
    return multipliedAmount;
  }, [prestigeData.multiplier]);

  // Spend coins
  const spendCoins = useCallback((amount) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    addNotification(`Not enough coins! Need ${amount}`, 'error');
    return false;
  }, [coins, addNotification]);

  // Update statistics
  const updateStats = useCallback((key, increment = 1) => {
    setStats(prev => ({ ...prev, [key]: (prev[key] || 0) + increment }));
  }, []);

  // Check level completion
  const checkLevelProgress = useCallback(() => {
    if (levelStatus !== 'playing' || levelId === 'endless') return;

    const now = nowSec();

    // Check win condition
    if (level && coins >= level.targetCoins) {
      setLevelStatus('won');
      addNotification(`🎉 Level Complete! +${level.reward} coins`, 'success');
      setCoins(prev => prev + level.reward);

      // Auto-advance to next level after delay
      const currentIndex = LEVELS.findIndex(l => l.id === levelId);
      const nextLevel = LEVELS[currentIndex + 1];
      if (nextLevel && nextLevel.id !== 'endless') {
        setTimeout(() => {
          setLevelId(nextLevel.id);
          setLevelEndsAt(nowSec() + nextLevel.minutes * 60);
          setLevelStartedAt(nowSec());
          setLevelStatus('playing');
          addNotification(`Starting ${nextLevel.label}!`, 'info');
        }, 3000);
      }
    }
    // Check time limit
    else if (levelEndsAt > 0 && now >= levelEndsAt) {
      setLevelStatus('lost');
      addNotification(`⏰ Time's up! You earned ${coins}/${level?.targetCoins} coins`, 'error');
    }
  }, [levelStatus, levelId, coins, level, levelEndsAt, addNotification]);

  // Start a specific level
  const startLevel = useCallback((newLevelId) => {
    const newLevel = LEVELS.find(l => l.id === newLevelId);
    if (!newLevel) return;

    setLevelId(newLevelId);
    if (newLevelId === 'endless') {
      setLevelEndsAt(0);
    } else {
      setLevelEndsAt(nowSec() + newLevel.minutes * 60);
    }
    setLevelStartedAt(nowSec());
    setLevelStatus('playing');
    addNotification(`🎯 Starting ${newLevel.label}`, 'info');
  }, [addNotification]);

  // Prestige (reset with bonuses)
  const doPrestige = useCallback(() => {
    const nextPrestige = PRESTIGE_LEVELS[prestige + 1];
    if (!nextPrestige || totalEarned < nextPrestige.requirement) {
      addNotification(`Need ${nextPrestige?.requirement || '???'} total coins to prestige`, 'error');
      return false;
    }

    setPrestige(prev => prev + 1);
    setCoins(50);
    setSkillPoints(prev => prev + 5);
    addNotification(`🌟 Prestiged to ${nextPrestige.name}! Multiplier: ${nextPrestige.multiplier}x`, 'success');
    return true;
  }, [prestige, totalEarned, addNotification]);

  // Advance tutorial
  const advanceTutorial = useCallback(() => {
    setTutorialStep(prev => prev + 1);
  }, []);

  const completeTutorial = useCallback(() => {
    setTutorialComplete(true);
    addNotification('🎉 Tutorial complete! Happy farming!', 'success');
  }, [addNotification]);

  // Get save data
  const getSaveData = useCallback(() => ({
    coins,
    score,
    totalEarned,
    name,
    prestige,
    skillPoints,
    levelId,
    levelStatus,
    levelEndsAt,
    levelStartedAt,
    tutorialComplete,
    tutorialStep,
    stats,
  }), [coins, score, totalEarned, name, prestige, skillPoints, levelId, levelStatus, levelEndsAt, levelStartedAt, tutorialComplete, tutorialStep, stats]);

  // Load save data
  const loadSaveData = useCallback((data) => {
    if (!data) return;
    if (data.coins !== undefined) setCoins(data.coins);
    if (data.score !== undefined) setScore(data.score);
    if (data.totalEarned !== undefined) setTotalEarned(data.totalEarned);
    if (data.name !== undefined) setName(data.name);
    if (data.prestige !== undefined) setPrestige(data.prestige);
    if (data.skillPoints !== undefined) setSkillPoints(data.skillPoints);
    if (data.levelId !== undefined) setLevelId(data.levelId);
    if (data.levelStatus !== undefined) setLevelStatus(data.levelStatus);
    if (data.levelEndsAt !== undefined) setLevelEndsAt(data.levelEndsAt);
    if (data.levelStartedAt !== undefined) setLevelStartedAt(data.levelStartedAt);
    if (data.tutorialComplete !== undefined) setTutorialComplete(data.tutorialComplete);
    if (data.tutorialStep !== undefined) setTutorialStep(data.tutorialStep);
    if (data.stats !== undefined) setStats(data.stats);
  }, []);

  return {
    // State
    coins,
    score,
    totalEarned,
    name,
    prestige,
    skillPoints,
    levelId,
    levelStatus,
    levelEndsAt,
    levelStartedAt,
    level,
    prestigeData,
    tutorialComplete,
    tutorialStep,
    notifications,
    stats,

    // Setters
    setCoins,
    setScore,
    setName,

    // Actions
    addCoins,
    spendCoins,
    addNotification,
    removeNotification,
    updateStats,
    checkLevelProgress,
    startLevel,
    doPrestige,
    advanceTutorial,
    completeTutorial,

    // Save/Load
    getSaveData,
    loadSaveData,
  };
}
