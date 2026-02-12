export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function applyMultiplierRound(value, multiplier, min = 1) {
  const safeMultiplier = Number.isFinite(multiplier) ? multiplier : 1;
  const updated = Math.round(value * safeMultiplier);
  return Math.max(min, updated);
}
