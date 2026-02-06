const MAX_LEVEL = 200;

const clampInt = (value, fallback = 0, min = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.floor(numeric));
};

export const getXpForLevel = (level) => {
  const safeLevel = Math.max(1, clampInt(level, 1, 1));
  if (safeLevel <= 1) return 0;

  const l = safeLevel - 1;
  if (safeLevel <= 6) {
    return Math.floor(40 * l * l + 35 * l);
  }
  if (safeLevel <= 11) {
    const earlyCap = Math.floor(40 * 5 * 5 + 35 * 5);
    const mid = safeLevel - 6;
    return earlyCap + Math.floor(180 * mid + 65 * mid * mid);
  }

  const earlyCap = Math.floor(40 * 5 * 5 + 35 * 5);
  const midCap = earlyCap + Math.floor(180 * 5 + 65 * 25);
  const late = safeLevel - 11;
  return midCap + Math.floor(520 * late + 90 * late * late + 8 * late * late * late);
};

export const getLevelFromXp = (xp) => {
  const safeXp = clampInt(xp, 0, 0);
  let level = 1;
  for (let next = 2; next <= MAX_LEVEL; next += 1) {
    if (safeXp >= getXpForLevel(next)) {
      level = next;
    } else {
      break;
    }
  }
  return level;
};

export const getXpProgress = (xp, level) => {
  const safeLevel = Math.max(1, clampInt(level, 1, 1));
  const safeXp = clampInt(xp, 0, 0);
  const currentFloor = getXpForLevel(safeLevel);
  const nextFloor = getXpForLevel(safeLevel + 1);
  const inLevel = Math.max(0, safeXp - currentFloor);
  const needed = Math.max(1, nextFloor - currentFloor);
  return {
    inLevel,
    needed,
    progress: Math.min(100, Math.max(0, (inLevel / needed) * 100)),
  };
};

export const applyXpTuning = (requestedXp, sourceMeta = {}, tracker = {}, dayKey = 'unknown-day') => {
  const baseRequested = clampInt(requestedXp, 0, 0);
  if (baseRequested <= 0) {
    return { grantedXp: 0, tracker };
  }

  const source = sourceMeta?.source || 'generic';
  const working = {
    dayKey: tracker.dayKey || null,
    harvestCounts: { ...(tracker.harvestCounts || {}) },
    minigameDailyXp: { ...(tracker.minigameDailyXp || {}) },
  };

  if (working.dayKey !== dayKey) {
    working.dayKey = dayKey;
    working.harvestCounts = {};
    working.minigameDailyXp = {};
  }

  let grantedXp = baseRequested;

  if (source === 'harvest') {
    const cropId = sourceMeta.cropId || 'unknown_crop';
    const count = (working.harvestCounts[cropId] || 0) + 1;
    working.harvestCounts[cropId] = count;

    const base = Math.max(1, Math.floor(baseRequested * 0.6));
    const multiplier = count <= 8 ? 1 : count <= 16 ? 0.6 : 0.35;
    const firstOfDayBonus = count === 1 ? 4 : 0;
    grantedXp = Math.max(1, Math.floor(base * multiplier) + firstOfDayBonus);
  } else if (source === 'minigame') {
    const minigameId = sourceMeta.minigameId || 'general';
    const usedToday = working.minigameDailyXp[minigameId] || 0;
    const cap = 120;
    const remaining = Math.max(0, cap - usedToday);
    const base = Math.max(2, Math.floor(baseRequested * 0.7));
    const skillFactor = Math.min(1, Math.max(0, Number(sourceMeta.skillFactor) || 0));
    const skillBonus = Math.floor(base * skillFactor * 0.35);
    grantedXp = Math.min(remaining, base + skillBonus);
    working.minigameDailyXp[minigameId] = usedToday + grantedXp;
  } else if (source === 'pet') {
    grantedXp = 0;
  } else if (source === 'daily_reward') {
    grantedXp = Math.min(8, baseRequested);
  }

  return {
    grantedXp: clampInt(grantedXp, 0, 0),
    tracker: working,
  };
};


export const getLevelBandRewards = (level) => {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  if (safeLevel === 3) return { unlock: 'Decor: Cozy Paths', cosmeticTokens: 1 };
  if (safeLevel === 5) return { unlock: 'Farm Slot Upgrade Access', cosmeticTokens: 2 };
  if (safeLevel === 8) return { unlock: 'Festival Variant Rotation', cosmeticTokens: 2 };
  if (safeLevel === 12) return { unlock: 'Almanac Depth Entries', cosmeticTokens: 3 };
  if (safeLevel === 16) return { unlock: 'Master Title Track', cosmeticTokens: 4 };
  return null;
};
