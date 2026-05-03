/**
 * Day/Night Cycle Hook
 * Visual and gameplay time-of-day system
 */
import { useState, useCallback, useEffect, useRef } from 'react';

// Time periods with gameplay effects
export const TIME_PERIODS = {
  dawn: {
    id: 'dawn',
    name: 'Dawn',
    emoji: '🌅',
    hours: [5, 6, 7],
    description: 'The farm awakens',
    bgGradient: 'from-orange-100 via-pink-50 to-blue-100',
    overlayColor: 'rgba(255, 200, 150, 0.1)',
    effects: {
      growthBonus: 1.1,
      qualityBonus: 0.05,
    },
  },
  morning: {
    id: 'morning',
    name: 'Morning',
    emoji: '☀️',
    hours: [8, 9, 10, 11],
    description: 'Peak growing hours',
    bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
    overlayColor: 'rgba(255, 255, 200, 0.05)',
    effects: {
      growthBonus: 1.2,
      qualityBonus: 0.1,
    },
  },
  afternoon: {
    id: 'afternoon',
    name: 'Afternoon',
    emoji: '🌤️',
    hours: [12, 13, 14, 15, 16],
    description: 'Steady progress',
    bgGradient: 'from-yellow-50 via-amber-50 to-orange-50',
    overlayColor: 'rgba(255, 220, 150, 0.08)',
    effects: {
      growthBonus: 1.0,
      harvestBonus: 1.1,
    },
  },
  evening: {
    id: 'evening',
    name: 'Evening',
    emoji: '🌆',
    hours: [17, 18, 19],
    description: 'Golden hour harvest',
    bgGradient: 'from-orange-100 via-rose-50 to-purple-100',
    overlayColor: 'rgba(255, 150, 100, 0.12)',
    effects: {
      harvestBonus: 1.15,
      qualityBonus: 0.08,
    },
  },
  night: {
    id: 'night',
    name: 'Night',
    emoji: '🌙',
    hours: [20, 21, 22, 23, 0, 1, 2, 3, 4],
    description: 'Crops rest and recover',
    bgGradient: 'from-indigo-100 via-purple-100 to-slate-200',
    overlayColor: 'rgba(50, 50, 100, 0.15)',
    effects: {
      growthBonus: 0.8,
      healingBonus: 1.5, // Crops recover from damage faster
      pestChance: 0.5, // Fewer pests at night
    },
  },
};

// Game time moves faster than real time (1 game hour = X real seconds)
const GAME_HOUR_DURATION = 60; // 60 seconds per game hour (24 min full day)

export function useDayNight(useRealTime = false) {
  const [gameHour, setGameHour] = useState(() => {
    if (useRealTime) {
      return new Date().getHours();
    }
    return 8; // Start at 8 AM
  });

  const [gameMinute, setGameMinute] = useState(0);
  const lastTickRef = useRef(Date.now());

  // Get current time period
  const getCurrentPeriod = useCallback(() => {
    for (const [, period] of Object.entries(TIME_PERIODS)) {
      if (period.hours.includes(gameHour)) {
        return period;
      }
    }
    return TIME_PERIODS.morning;
  }, [gameHour]);

  const currentPeriod = getCurrentPeriod();

  // Format time display
  const getTimeDisplay = useCallback(() => {
    const hour12 = gameHour % 12 || 12;
    const ampm = gameHour < 12 ? 'AM' : 'PM';
    const min = gameMinute.toString().padStart(2, '0');
    return `${hour12}:${min} ${ampm}`;
  }, [gameHour, gameMinute]);

  // Game tick for time progression
  useEffect(() => {
    if (useRealTime) {
      // Sync with real time every minute
      const interval = setInterval(() => {
        const now = new Date();
        setGameHour(now.getHours());
        setGameMinute(now.getMinutes());
      }, 60000);

      // Initial sync
      const now = new Date();
      setGameHour(now.getHours());
      setGameMinute(now.getMinutes());

      return () => clearInterval(interval);
    }

    // Accelerated game time
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      // Calculate how many game minutes passed
      const realSecondsPerGameMinute = GAME_HOUR_DURATION / 60;
      const gameMinutesPassed = delta / 1000 / realSecondsPerGameMinute;

      setGameMinute((prev) => {
        const newMinute = prev + gameMinutesPassed;
        if (newMinute >= 60) {
          setGameHour((h) => (h + Math.floor(newMinute / 60)) % 24);
          return newMinute % 60;
        }
        return newMinute;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [useRealTime]);

  // Check if it's a specific time period
  const isPeriod = useCallback(
    (periodId) => {
      return currentPeriod.id === periodId;
    },
    [currentPeriod]
  );

  // Get current effects
  const getEffects = useCallback(() => {
    return currentPeriod.effects || {};
  }, [currentPeriod]);

  // Get visual styling
  const getVisuals = useCallback(() => {
    return {
      bgGradient: currentPeriod.bgGradient,
      overlayColor: currentPeriod.overlayColor,
    };
  }, [currentPeriod]);

  // Set specific time (for testing/events)
  const setTime = useCallback((hour, minute = 0) => {
    setGameHour(hour % 24);
    setGameMinute(minute % 60);
  }, []);

  // Skip to next period
  const skipToPeriod = useCallback((periodId) => {
    const period = TIME_PERIODS[periodId];
    if (period) {
      setGameHour(period.hours[0]);
      setGameMinute(0);
    }
  }, []);

  // Save/load
  const getSaveData = useCallback(
    () => ({
      gameHour,
      gameMinute,
    }),
    [gameHour, gameMinute]
  );

  const loadSaveData = useCallback((data) => {
    if (data?.gameHour !== undefined) setGameHour(data.gameHour);
    if (data?.gameMinute !== undefined) setGameMinute(data.gameMinute);
  }, []);

  return {
    gameHour,
    gameMinute,
    currentPeriod,
    timeDisplay: getTimeDisplay(),
    isPeriod,
    getEffects,
    getVisuals,
    setTime,
    skipToPeriod,
    getSaveData,
    loadSaveData,
    TIME_PERIODS,
  };
}
