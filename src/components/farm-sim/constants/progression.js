/**
 * Progression constants and helpers (XP ↔ Level).
 */
export const XP_PER_LEVEL_BASE = 100;
export const MAX_LEVEL_GAIN_PER_GRANT = 3;

/**
 * Compute player level from total XP.
 * @param {number} xp
 * @returns {number}
 */
export const getLevelFromXp = (xp) => {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  return Math.floor(Math.sqrt(safeXp / XP_PER_LEVEL_BASE)) + 1;
};

/**
 * Compute XP threshold for a given level.
 * @param {number} level
 * @returns {number}
 */
export const getXpForLevel = (level) => {
  const safeLevel = Number.isFinite(level) ? Math.max(1, level) : 1;
  return Math.pow(safeLevel - 1, 2) * XP_PER_LEVEL_BASE;
};
