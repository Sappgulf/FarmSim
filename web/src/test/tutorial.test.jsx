import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { isTutorialInteractiveTarget, resolveTutorialTarget } from '../components/farm-sim/ui/Tutorial';

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

describe('resolveTutorialTarget', () => {
  beforeEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
  });

  it('skips anchors inside display:none and prefers the visible fallback', () => {
    const deadWrap = document.createElement('div');
    deadWrap.style.display = 'none';
    const hiddenEvents = document.createElement('button');
    hiddenEvents.type = 'button';
    hiddenEvents.setAttribute('data-onboard', 'events-tab');
    deadWrap.appendChild(hiddenEvents);
    document.body.appendChild(deadWrap);

    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.setAttribute('data-onboard', 'events-tutorial-more');
    moreBtn.textContent = 'More';
    document.body.appendChild(moreBtn);

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRtc() {
      if (this.getAttribute?.('data-onboard') === 'events-tutorial-more') {
        return { width: 72, height: 48, top: 0, left: 0, bottom: 48, right: 72, x: 0, y: 0, toJSON: () => ({}) };
      }
      return { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => ({}) };
    });

    const resolved = resolveTutorialTarget(['[data-onboard="events-tab"]', '[data-onboard="events-tutorial-more"]']);
    expect(resolved).toBe(moreBtn);
  });

  it('returns Events tab first when it has usable layout geometry', () => {
    const eventsBtn = document.createElement('button');
    eventsBtn.type = 'button';
    eventsBtn.setAttribute('data-onboard', 'events-tab');
    eventsBtn.textContent = 'Events';
    document.body.appendChild(eventsBtn);

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRtc() {
      if (this.getAttribute?.('data-onboard') === 'events-tab') {
        return { width: 88, height: 40, top: 0, left: 0, bottom: 40, right: 88, x: 0, y: 0, toJSON: () => ({}) };
      }
      return { width: 72, height: 48, top: 0, left: 0, bottom: 48, right: 72, x: 0, y: 0, toJSON: () => ({}) };
    });

    const first = resolveTutorialTarget(['[data-onboard="events-tab"]', '[data-onboard="events-tutorial-more"]']);
    expect(first).toBe(eventsBtn);
  });
});
