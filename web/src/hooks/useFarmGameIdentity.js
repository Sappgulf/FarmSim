import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CROPS } from '../data/crops';
import { MEMORIES, MEMORY_CHAPTERS, WISHING_WELL } from '../data/identity';
import { getMoodTierForPoints } from '../utils/farmGameHelpers.mjs';

/**
 * Classic FarmGame identity layer: mood, memories, philosophy, blessings, wishing well.
 *
 * @param {object} options
 * @param {function(string, string, object?): void} options.addNotification
 * @param {string} options.currentSeason
 * @param {string} options.currentWeather
 * @param {object} [options.seasonData]
 * @param {number} options.coins
 * @param {string} options.featuredCropId
 */
export function useFarmGameIdentity({
  addNotification,
  currentSeason,
  currentWeather,
  seasonData,
  coins,
  featuredCropId,
}) {
  const [philosophy, setPhilosophy] = useState(null);
  const [moodPoints, setMoodPoints] = useState(0);
  const [memoryFlags, setMemoryFlags] = useState({});
  const memoryFlagsRef = useRef({});
  const [farmDay, setFarmDay] = useState(1);
  const [lastWishDay, setLastWishDay] = useState(null);
  const [activeBlessing, setActiveBlessing] = useState(null);
  const [storyPulse, setStoryPulse] = useState(false);

  const moodTier = useMemo(() => getMoodTierForPoints(moodPoints), [moodPoints]);

  const growthMultiplier = useMemo(() => {
    if (activeBlessing?.type === 'growth_bonus') {
      return Math.min(1 + activeBlessing.value, 1.2);
    }
    return 1;
  }, [activeBlessing]);

  const featuredCropData = useMemo(() => CROPS[featuredCropId], [featuredCropId]);

  useEffect(() => {
    memoryFlagsRef.current = memoryFlags;
  }, [memoryFlags]);

  const storyPulseTimeoutRef = useRef(null);
  const triggerStoryPulse = useCallback(() => {
    setStoryPulse(true);
    if (storyPulseTimeoutRef.current) {
      clearTimeout(storyPulseTimeoutRef.current);
    }
    storyPulseTimeoutRef.current = setTimeout(() => {
      setStoryPulse(false);
    }, 2400);
  }, []);

  useEffect(
    () => () => {
      if (storyPulseTimeoutRef.current) {
        clearTimeout(storyPulseTimeoutRef.current);
      }
    },
    []
  );

  const bumpMood = useCallback((amount = 1) => {
    if (amount <= 0) return;
    setMoodPoints((prev) => Math.min(prev + amount, 100));
  }, []);

  const unlockMemory = useCallback(
    (memoryId) => {
      if (memoryFlagsRef.current[memoryId]) return false;
      const memory = MEMORIES.find((m) => m.id === memoryId);
      setMemoryFlags((prev) => ({ ...prev, [memoryId]: true }));
      if (memory) {
        addNotification(`📖 Memory saved: ${memory.title}`, 'info');
      }
      triggerStoryPulse();
      return true;
    },
    [addNotification, triggerStoryPulse]
  );

  const prevMoodTierRef = useRef(moodTier.id);
  useEffect(() => {
    if (prevMoodTierRef.current !== moodTier.id) {
      if (['cozy', 'blooming', 'radiant'].includes(moodTier.id)) {
        unlockMemory('first_cozy_mood');
      }
      triggerStoryPulse();
      prevMoodTierRef.current = moodTier.id;
    }
  }, [moodTier.id, unlockMemory, triggerStoryPulse]);

  const vibeLine = useMemo(() => {
    const vibes = moodTier?.vibes || [];
    if (vibes.length === 0) return '';
    const index = farmDay % vibes.length;
    return vibes[index];
  }, [moodTier, farmDay]);

  const cozySuggestion = useMemo(() => {
    if (!philosophy) return '';
    const cropLabel = featuredCropData
      ? `${featuredCropData.emoji} ${featuredCropId}`
      : 'a seasonal crop';
    if (philosophy === 'nature') {
      if (['rainy', 'stormy'].includes(currentWeather)) {
        return `Let the rain handle watering—plant ${cropLabel}.`;
      }
      return `Lean into ${seasonData?.name || currentSeason}: try ${cropLabel}.`;
    }
    if (philosophy === 'market') {
      return `Featured today: ${cropLabel}. Stock a few seeds or sell the next batch.`;
    }
    return 'Place a new building or open the scrapbook for a quiet moment.';
  }, [philosophy, currentWeather, currentSeason, featuredCropId, featuredCropData, seasonData]);

  const memoryTeaserData = useMemo(() => {
    const unlockedCount = MEMORIES.reduce(
      (count, memory) => count + (memoryFlags[memory.id] ? 1 : 0),
      0
    );
    const nextMemory = MEMORIES.find((memory) => !memoryFlags[memory.id]);
    if (!nextMemory) {
      return {
        memoryTeaser: 'All pages are complete. Your story feels whole.',
        memoryProgress: `${unlockedCount}/${MEMORIES.length} complete`,
      };
    }

    const chapter = MEMORY_CHAPTERS.find((c) => c.id === nextMemory.chapterId);
    const chapterMemories = MEMORIES.filter((m) => m.chapterId === nextMemory.chapterId);
    const chapterUnlocked = chapterMemories.reduce(
      (count, m) => count + (memoryFlags[m.id] ? 1 : 0),
      0
    );
    const chapterLabel = chapter
      ? `${chapterUnlocked}/${chapterMemories.length} ${chapter.name}`
      : '';

    return {
      memoryTeaser: nextMemory.hint,
      memoryProgress: chapterLabel,
    };
  }, [memoryFlags]);

  const canWishToday = lastWishDay === null || farmDay !== lastWishDay;
  const canAffordWish = coins >= WISHING_WELL.cost;
  const canWish = canWishToday && canAffordWish;
  const wishDisabledReason = !canWishToday
    ? 'The well is resting until tomorrow.'
    : !canAffordWish
      ? `Need ${WISHING_WELL.cost}🪙 to wish.`
      : '';

  const handleDayRollover = useCallback(() => {
    setFarmDay((prev) => prev + 1);
    if (activeBlessing) {
      setActiveBlessing(null);
      addNotification('🌅 The blessing fades with the new day.', 'info');
    } else {
      addNotification('🌅 A new day begins on the farm.', 'info');
    }
    unlockMemory('first_day_complete');
  }, [activeBlessing, addNotification, unlockMemory]);

  const handleSelectPhilosophy = useCallback(
    (philosophyId) => {
      if (philosophyId === philosophy) return;
      setPhilosophy(philosophyId);
      addNotification('📌 Philosophy selected. Your story has a new direction.', 'info');
      bumpMood(1);
      triggerStoryPulse();
    },
    [addNotification, bumpMood, triggerStoryPulse, philosophy]
  );

  const handleScrapbookOpen = useCallback(() => {
    setStoryPulse(false);
  }, []);

  return {
    philosophy,
    setPhilosophy,
    moodPoints,
    setMoodPoints,
    memoryFlags,
    setMemoryFlags,
    memoryFlagsRef,
    farmDay,
    setFarmDay,
    lastWishDay,
    setLastWishDay,
    activeBlessing,
    setActiveBlessing,
    storyPulse,
    setStoryPulse,
    moodTier,
    growthMultiplier,
    featuredCropData,
    triggerStoryPulse,
    bumpMood,
    unlockMemory,
    vibeLine,
    cozySuggestion,
    memoryTeaserData,
    canWish,
    canWishToday,
    canAffordWish,
    wishDisabledReason,
    handleDayRollover,
    handleSelectPhilosophy,
    handleScrapbookOpen,
  };
}
