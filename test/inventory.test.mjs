import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyInventoryDelta, canFulfillItems, normalizeInventory } from '../src/systems/inventory.mjs';

test('applyInventoryDelta clamps at zero and supports adds', () => {
  const start = { carrot: 1, potato: 0 };
  const sub = applyInventoryDelta(start, 'carrot', -2);
  const add = applyInventoryDelta(start, 'potato', 3);

  assert.equal(sub.carrot, 0);
  assert.equal(add.potato, 3);
});

test('normalizeInventory removes invalid values', () => {
  const normalized = normalizeInventory({ carrot: -2, potato: 4, corn: 'x' });
  assert.equal(normalized.carrot, 0);
  assert.equal(normalized.potato, 4);
  assert.equal(normalized.corn, 0);
});

test('canFulfillItems checks quantities', () => {
  const inventory = { carrot: 3, potato: 1 };
  assert.equal(canFulfillItems(inventory, { carrot: 2 }), true);
  assert.equal(canFulfillItems(inventory, { carrot: 4 }), false);
});
