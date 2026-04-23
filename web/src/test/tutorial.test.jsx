import { describe, expect, it } from 'vitest';
import { isTutorialInteractiveTarget } from '../components/farm-sim/ui/Tutorial';

describe('Tutorial drag guard', () => {
  it('does not treat buttons and form controls as drag handles', () => {
    expect(isTutorialInteractiveTarget({
      closest: (selector) => (selector.includes('button') ? {} : null),
    })).toBe(true);

    expect(isTutorialInteractiveTarget({
      closest: (selector) => (selector.includes('input') ? {} : null),
    })).toBe(true);

    expect(isTutorialInteractiveTarget({
      closest: (selector) => (selector.includes('label') ? {} : null),
    })).toBe(true);
  });

  it('allows dragging from non-interactive surfaces', () => {
    expect(isTutorialInteractiveTarget({
      closest: () => null,
    })).toBe(false);
  });
});
