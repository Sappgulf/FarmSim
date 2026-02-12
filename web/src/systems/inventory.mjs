function toFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function applyInventoryDelta(inventory, item, delta) {
  const next = { ...inventory };
  const current = toFiniteNumber(next[item], 0);
  const updated = current + toFiniteNumber(delta, 0);
  next[item] = updated < 0 ? 0 : updated;
  return next;
}

export function normalizeInventory(inv) {
  if (!inv || typeof inv !== "object") return {};
  const next = {};
  Object.entries(inv).forEach(([key, value]) => {
    const count = Number.isFinite(value) ? value : 0;
    next[key] = count < 0 ? 0 : count;
  });
  return next;
}

export function canFulfillItems(inventory, items) {
  return Object.entries(items).every(([item, qty]) => (inventory[item] || 0) >= qty);
}
