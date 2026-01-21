import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGrowthStage } from '../src/systems/growth.mjs';

test('getGrowthStage clamps to bounds', () => {
  assert.equal(getGrowthStage(0, 10, 3), 0);
  assert.equal(getGrowthStage(9, 10, 3), 0);
  assert.equal(getGrowthStage(10, 10, 3), 1);
  assert.equal(getGrowthStage(45, 10, 3), 3);
  assert.equal(getGrowthStage(999, 10, 3), 3);
});
