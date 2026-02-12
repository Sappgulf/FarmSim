export function applyInventoryDelta(inventory, item, delta) {
  const next = { ...inventory };
  const current = Number.isFinite(next[item]) ? next[item] : 0;
  const updated = current + delta;
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
