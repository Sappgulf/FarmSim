import { describe, it, expect } from 'vitest';
import { applyInventoryDelta, canFulfillItems, normalizeInventory } from '../src/systems/inventory.mjs';

describe('inventory', () => {
  it('applyInventoryDelta clamps at zero and supports adds', () => {
    const start = { carrot: 1, potato: 0 };
    const sub = applyInventoryDelta(start, 'carrot', -2);
    const add = applyInventoryDelta(start, 'potato', 3);

    expect(sub.carrot).toBe(0);
    expect(add.potato).toBe(3);
  });

  it('normalizeInventory removes invalid values', () => {
    const normalized = normalizeInventory({ carrot: -2, potato: 4, corn: 'x' });
    expect(normalized.carrot).toBe(0);
    expect(normalized.potato).toBe(4);
    expect(normalized.corn).toBe(0);
  });

  it('canFulfillItems checks quantities', () => {
    const inventory = { carrot: 3, potato: 1 };
    expect(canFulfillItems(inventory, { carrot: 2 })).toBe(true);
    expect(canFulfillItems(inventory, { carrot: 4 })).toBe(false);
  });
});
