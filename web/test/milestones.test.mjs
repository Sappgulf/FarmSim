import { describe, expect, it } from 'vitest';
import { createMilestoneManager } from '../src/systems/milestones';

describe('milestone manager event updates', () => {
  it('returns the same progress reference when an event does not change progress', () => {
    const manager = createMilestoneManager([]);
    const progress = { uniqueCropsGrown: 4, decorSetsCompleted: 2 };

    const unknownEventResult = manager.onEvent('unknown_event', {}, progress);
    const sameUniqueCropResult = manager.onEvent('unique_crop', { size: 3 }, progress);
    const sameDecorResult = manager.onEvent('decor_set', { count: 2 }, progress);

    expect(unknownEventResult).toBe(progress);
    expect(sameUniqueCropResult).toBe(progress);
    expect(sameDecorResult).toBe(progress);
  });

  it('returns a new progress object when an event changes counters', () => {
    const manager = createMilestoneManager([]);
    const progress = { daysPlayed: 1, totalHarvests: 5 };

    const dayAdvanceResult = manager.onEvent('day_advance', {}, progress);
    const harvestResult = manager.onEvent('harvest', { count: 2 }, progress);

    expect(dayAdvanceResult).not.toBe(progress);
    expect(dayAdvanceResult.daysPlayed).toBe(2);
    expect(harvestResult).not.toBe(progress);
    expect(harvestResult.totalHarvests).toBe(7);
  });
});
