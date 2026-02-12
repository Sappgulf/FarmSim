const MAX_LEVEL = 200;

export const PROGRESSION_BANDS = [
  { id: 'onboarding', minLevel: 1, maxLevel: 3, label: 'Levels 1–3: onboarding' },
  { id: 'early_intent', minLevel: 4, maxLevel: 7, label: 'Levels 4–7: early intent' },
  { id: 'mid_depth', minLevel: 8, maxLevel: 12, label: 'Levels 8–12: mid-game depth' },
  { id: 'mastery', minLevel: 13, maxLevel: 20, label: 'Levels 13–20: mastery' },
  { id: 'prestige', minLevel: 21, maxLevel: MAX_LEVEL, label: '20+: prestige (cosmetic only)' },
];

const clampInt = (value, fallback = 0, min = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.floor(numeric));
};

export const getXpRequiredForLevel = (level) => {
  const safeLevel = Math.max(1, clampInt(level, 1, 1));
  if (safeLevel <= 1) return 0;

  const early = safeLevel - 1;
  if (safeLevel <= 4) {
    return Math.floor(60 * early * early + 40 * early);
  }
  if (safeLevel <= 8) {
    const earlyCap = Math.floor(60 * 3 * 3 + 40 * 3);
    const mid = safeLevel - 4;
    return earlyCap + Math.floor(260 * mid + 95 * mid * mid);
  }

  const earlyCap = Math.floor(60 * 3 * 3 + 40 * 3);
  const midCap = earlyCap + Math.floor(260 * 4 + 95 * 16);
  const late = safeLevel - 8;
  return midCap + Math.floor(520 * late + 140 * late * late + 10 * late * late * late);
};

export const getXpForLevel = getXpRequiredForLevel;

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

export const getProgressionBand = (level) => {
  const safeLevel = Math.max(1, clampInt(level, 1, 1));
  return PROGRESSION_BANDS.find((band) => safeLevel >= band.minLevel && safeLevel <= band.maxLevel)
    || PROGRESSION_BANDS[PROGRESSION_BANDS.length - 1];
};

const DIFFICULTY_MODIFIERS = {
  onboarding: { growthTime: 1, resourceCost: 1, rarityPatience: 1, minigameWindow: 1 },
  early_intent: { growthTime: 1.04, resourceCost: 1.04, rarityPatience: 0.98, minigameWindow: 0.98 },
  mid_depth: { growthTime: 1.08, resourceCost: 1.08, rarityPatience: 0.96, minigameWindow: 0.95 },
  mastery: { growthTime: 1.12, resourceCost: 1.1, rarityPatience: 0.94, minigameWindow: 0.93 },
  prestige: { growthTime: 1.14, resourceCost: 1.1, rarityPatience: 0.94, minigameWindow: 0.92 },
};

export const getDifficultyModifier = (levelOrBand) => {
  const bandId = typeof levelOrBand === 'string'
    ? levelOrBand
    : getProgressionBand(levelOrBand).id;
  return DIFFICULTY_MODIFIERS[bandId] || DIFFICULTY_MODIFIERS.onboarding;
};

export const getEconomyRewardModifier = (level, source = 'generic') => {
  const bandId = getProgressionBand(level).id;
  const byBand = {
    onboarding: { generic: 1, harvest: 1, minigame: 1, passive: 0.95 },
    early_intent: { generic: 0.96, harvest: 0.96, minigame: 0.95, passive: 0.88 },
    mid_depth: { generic: 0.92, harvest: 0.93, minigame: 0.92, passive: 0.8 },
    mastery: { generic: 0.88, harvest: 0.9, minigame: 0.88, passive: 0.72 },
    prestige: { generic: 0.88, harvest: 0.9, minigame: 0.88, passive: 0.72 },
  };
  const row = byBand[bandId] || byBand.onboarding;
  return row[source] ?? row.generic;
};

export const getEconomySinkModifier = (level) => {
  const bandId = getProgressionBand(level).id;
  if (bandId === 'onboarding') return 0.9;
  if (bandId === 'early_intent') return 1;
  if (bandId === 'mid_depth') return 1.08;
  return 1.12;
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
    milestoneDailyXp: clampInt(tracker.milestoneDailyXp, 0, 0),
    challengeDailyXp: clampInt(tracker.challengeDailyXp, 0, 0),
    rareMomentDailyXp: clampInt(tracker.rareMomentDailyXp, 0, 0),
  };

  if (working.dayKey !== dayKey) {
    working.dayKey = dayKey;
    working.harvestCounts = {};
    working.minigameDailyXp = {};
    working.milestoneDailyXp = 0;
    working.challengeDailyXp = 0;
    working.rareMomentDailyXp = 0;
  }

  let grantedXp = baseRequested;

  if (source === 'harvest') {
    const cropId = sourceMeta.cropId || 'unknown_crop';
    const count = (working.harvestCounts[cropId] || 0) + 1;
    working.harvestCounts[cropId] = count;

    const base = Math.max(1, Math.floor(baseRequested * 0.6));
    const multiplier = count <= 8 ? 1 : count <= 16 ? 0.6 : 0.35;
    const uniqueHarvestCount = Object.keys(working.harvestCounts).length;
    const firstOfDayBonus = count === 1 ? 4 : 0;
    const varietyBonus = count === 1 && uniqueHarvestCount <= 3 ? 2 : 0;
    grantedXp = Math.max(1, Math.floor(base * multiplier) + firstOfDayBonus + varietyBonus);
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
  } else if (source === 'planting') {
    grantedXp = 0;
  } else if (source === 'daily_reward') {
    grantedXp = Math.min(6, baseRequested);
  } else if (source === 'challenge') {
    const cap = 80;
    const remaining = Math.max(0, cap - working.challengeDailyXp);
    grantedXp = Math.min(remaining, Math.floor(baseRequested));
    working.challengeDailyXp += grantedXp;
  } else if (source === 'milestone') {
    const cap = 100;
    const remaining = Math.max(0, cap - working.milestoneDailyXp);
    grantedXp = Math.min(remaining, Math.floor(baseRequested));
    working.milestoneDailyXp += grantedXp;
  } else if (source === 'rare_moment') {
    const cap = 20;
    const remaining = Math.max(0, cap - working.rareMomentDailyXp);
    grantedXp = Math.min(remaining, Math.floor(baseRequested));
    working.rareMomentDailyXp += grantedXp;
  }

  return {
    grantedXp: clampInt(grantedXp, 0, 0),
    tracker: working,
  };
};

const getLegacyXpForLevel = (level) => {
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

const getLegacyLevelFromXp = (xp) => {
  const safeXp = clampInt(xp, 0, 0);
  let level = 1;
  for (let next = 2; next <= MAX_LEVEL; next += 1) {
    if (safeXp >= getLegacyXpForLevel(next)) level = next;
    else break;
  }
  return level;
};

export const remapXpToCurrentCurve = (xp, level = 1) => {
  const safeXp = clampInt(xp, 0, 0);
  const safeLevel = Math.max(1, clampInt(level, 1, 1));
  const legacyDerivedLevel = getLegacyLevelFromXp(safeXp);
  const retainedLevel = Math.max(safeLevel, legacyDerivedLevel);

  const legacyFloor = getLegacyXpForLevel(retainedLevel);
  const legacyCeiling = getLegacyXpForLevel(retainedLevel + 1);
  const legacySpan = Math.max(1, legacyCeiling - legacyFloor);
  const legacyProgress = Math.min(1, Math.max(0, (safeXp - legacyFloor) / legacySpan));

  const newFloor = getXpRequiredForLevel(retainedLevel);
  const newCeiling = getXpRequiredForLevel(retainedLevel + 1);
  const newSpan = Math.max(1, newCeiling - newFloor);
  const remapped = newFloor + Math.floor(newSpan * legacyProgress);
  return Math.max(remapped, newFloor);
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
