import { describe, it, expect } from 'vitest';
import { computeBuildingBonuses } from '../src/utils/buildingBonuses.mjs';

describe('computeBuildingBonuses', () => {
  it('returns empty for non-array', () => {
    expect(computeBuildingBonuses(null)).toEqual({});
  });

  it('aggregates known buildings', () => {
    expect(computeBuildingBonuses(['barn', 'greenhouse', 'beehive', 'windmill'])).toEqual({
      barnBonus: 0.2,
      greenhouseBonus: 0.5,
      beehiveBonus: 0.25,
      windmillIncome: 5,
    });
  });
});
