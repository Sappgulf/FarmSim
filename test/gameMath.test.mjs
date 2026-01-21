import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMultiplierRound, clamp } from '../src/utils/gameMath.mjs';

test('applyMultiplierRound applies pricing math with rounding', () => {
  assert.equal(applyMultiplierRound(10, 1.25), 13);
  assert.equal(applyMultiplierRound(10, 0.5), 5);
  assert.equal(applyMultiplierRound(0.4, 1.1), 1);
});

test('clamp enforces bounds', () => {
  assert.equal(clamp(5, 1, 10), 5);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(clamp(9, 0, 3), 3);
});
