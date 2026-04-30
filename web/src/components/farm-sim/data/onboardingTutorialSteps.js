/**
 * Canonical onboarding tutorial step list + count for reducer / What's New gates.
 * Keep in sync with Tutorial targeting (selectors resolve in the DOM).
 */
export const ONBOARDING_TUTORIAL_STEPS = [
  {
    id: 'plant',
    title: 'Plant Your First Crop',
    description: 'Choose a seed from your pouch, then tap any empty soil patch to sow it.',
    emoji: '🌱',
    targetSelectors: ['[data-onboard="farm-grid"]'],
    placement: 'right',
  },
  {
    id: 'harvest',
    title: 'Harvest & Earn',
    description: 'When your crops glow, tap them to gather produce and earn coins.',
    emoji: '🧺',
    targetSelectors: ['[data-onboard="farm-grid"]'],
    placement: 'right',
  },
  {
    id: 'board',
    title: 'Visit the Town Board',
    description:
      'On your phone: tap More (⚙️) below, open the tab strip, then choose Events. On a wider screen you can tap Events in the side panel.',
    emoji: '📋',
    targetSelectors: ['[data-onboard="events-tab"]', '[data-onboard="events-tutorial-more"]'],
    placement: 'top',
  },
  {
    id: 'ready',
    title: 'You\'re Ready',
    description:
      'Space toggles pause. Open Settings anytime for autosave, audio, and dark mode.\nAutosave stays on unless you turn it off there.',
    emoji: '🎉',
    targetSelectors: [],
    placement: 'bottom',
  },
];

/** Highest onboardingStep index visible in the tutorial until Finish (includes the Ready card). */
export const ONBOARDING_TUTORIAL_ACTIVE_LAST_INDEX = ONBOARDING_TUTORIAL_STEPS.length - 1;

/** Index of the Town Board step within the onboarding tour. */
export const ONBOARDING_TUTORIAL_BOARD_STEP_INDEX = ONBOARDING_TUTORIAL_STEPS.findIndex((s) => s.id === 'board');

/**
 * Caps onboardingStep when plant/harvest/board events fire — lands players on the Ready step, not Completed.
 */
export const ONBOARDING_TUTORIAL_MAX_STEP_FROM_EVENTS = ONBOARDING_TUTORIAL_ACTIVE_LAST_INDEX;

/** When tutorial is fully complete (skipped or Finish), onboardingStep equals this number. */
export const ONBOARDING_TUTORIAL_COMPLETE_STEP_INDEX = ONBOARDING_TUTORIAL_STEPS.length;
