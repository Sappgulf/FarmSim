export const SUPPLY_UNIT_COSTS = Object.freeze({
  fertilizer: 15,
  pesticide: 20,
});

const clampInt = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Math.max(0, Math.floor(fallback));
  return Math.max(0, Math.floor(numeric));
};

/**
 * Plan how many supply units can be applied, consuming inventory first and then
 * optionally buying the remainder with coins.
 *
 * This is intentionally deterministic and side-effect-free so UI + actions can
 * share the same logic and tests can lock it down.
 */
export function planSupplyUsage({ inventoryCount, coins, unitCost, requestedUnits } = {}) {
  const available = clampInt(inventoryCount, 0);
  const budget = clampInt(coins, 0);
  const cost = Math.max(1, clampInt(unitCost, 1));
  const requested = Math.max(0, clampInt(requestedUnits, 0));

  const maxPurchasable = Math.floor(budget / cost);
  const maxUsable = Math.min(requested, available + maxPurchasable);

  const usedFromInventory = Math.min(available, maxUsable);
  const boughtUnits = Math.max(0, maxUsable - usedFromInventory);

  return {
    requestedUnits: requested,
    appliedUnits: maxUsable,
    usedFromInventory,
    boughtUnits,
    coinCost: boughtUnits * cost,
    remainingInventory: available - usedFromInventory,
    unitCost: cost,
  };
}
