import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';
import cropsDoc from '@shared/content/crops.json';
import geneticsDoc from '@shared/content/genetics.json';
import vectorsDoc from '@shared/vectors/sim_vectors.json';

const cloneState = (value) => JSON.parse(JSON.stringify(value));

const mapToCanonical = (mapObj) => {
  const entries = Object.entries(mapObj || {}).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return '-';
  return entries.map(([key, value]) => `${key}:${value}`).join(',');
};

const stateHash = (state) => {
  const tileToken = (state.tiles || [])
    .map((tile) => (tile?.cropId ? `${tile.cropId}@${tile.plantedDay}` : '-'))
    .join('|');
  const canonical = [
    `day=${state.day}`,
    `coins=${state.coins}`,
    `tiles=${tileToken}`,
    `seeds=${mapToCanonical(state.seeds)}`,
    `crops=${mapToCanonical(state.crops)}`,
  ].join(';');
  return createHash('sha256').update(canonical).digest('hex');
};

const simulateVector = (vector) => {
  const state = cloneState(vector.initialState);
  for (const action of vector.actions) {
    if (action.type === 'advance_day') {
      state.day += 1;
      continue;
    }

    if (action.type === 'plant') {
      const tile = state.tiles[action.tile];
      const seeds = state.seeds?.[action.cropId] || 0;
      if (!tile || tile.cropId || seeds <= 0) continue;
      tile.cropId = action.cropId;
      tile.plantedDay = state.day;
      state.seeds[action.cropId] = seeds - 1;
      continue;
    }

    if (action.type === 'harvest') {
      const tile = state.tiles[action.tile];
      if (!tile || !tile.cropId) continue;
      const cropDef = vector.cropDefs?.[tile.cropId];
      if (!cropDef) continue;
      const growth = state.day - tile.plantedDay;
      if (growth < cropDef.daysToGrow) continue;
      const cropId = tile.cropId;
      tile.cropId = null;
      tile.plantedDay = null;
      state.crops[cropId] = (state.crops[cropId] || 0) + 1;
      state.coins += cropDef.sellPrice;
    }
  }
  return state;
};

describe('Shared sim vectors', () => {
  it('match expected vector hashes', () => {
    expect(vectorsDoc.version).toBe(1);
    vectorsDoc.vectors.forEach((vector) => {
      const endState = simulateVector(vector);
      expect(stateHash(endState)).toBe(vector.expectedEndStateHash);
    });
  });

  it('keeps genetics outputs backed by crop definitions', () => {
    const cropIds = new Set((cropsDoc.items || []).map((crop) => crop.id));
    const missingOutputs = (geneticsDoc.items || [])
      .map((recipe) => recipe.outputCropID)
      .filter((outputCropID) => !cropIds.has(outputCropID));

    expect(missingOutputs).toEqual([]);
  });
});
