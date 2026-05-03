import { describe, it, expect } from 'vitest';
import { planSupplyUsage } from '../utils/supplies';

describe('supplies', () => {
  it('uses inventory first, then buys remainder with coins', () => {
    const planned = planSupplyUsage({
      inventoryCount: 2,
      coins: 45,
      unitCost: 15,
      requestedUnits: 10,
    });

    expect(planned.appliedUnits).toBe(5);
    expect(planned.usedFromInventory).toBe(2);
    expect(planned.boughtUnits).toBe(3);
    expect(planned.coinCost).toBe(45);
    expect(planned.remainingInventory).toBe(0);
  });

  it('does not buy when inventory covers the request', () => {
    const planned = planSupplyUsage({
      inventoryCount: 7,
      coins: 0,
      unitCost: 15,
      requestedUnits: 3,
    });

    expect(planned.appliedUnits).toBe(3);
    expect(planned.usedFromInventory).toBe(3);
    expect(planned.boughtUnits).toBe(0);
    expect(planned.coinCost).toBe(0);
    expect(planned.remainingInventory).toBe(4);
  });

  it('applies nothing when request is zero', () => {
    const planned = planSupplyUsage({
      inventoryCount: 5,
      coins: 999,
      unitCost: 15,
      requestedUnits: 0,
    });

    expect(planned.appliedUnits).toBe(0);
    expect(planned.coinCost).toBe(0);
  });
});
