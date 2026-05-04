/**
 * Farm spotlight / walkthrough (GameContext + Tutorial must stay aligned).
 * Step index matches `recordOnboardingEvent` mapping in GameContext.
 */
export const ONBOARDING_STEPS = [
  {
    id: 'plant',
    title: 'Plant something',
    description: 'Pick a crop and tap an empty plot to get growing.',
    emoji: '🌱',
    target: '[data-onboard="farm-grid"]',
    placement: 'right',
  },
  {
    id: 'harvest',
    title: 'Harvest it',
    description: 'Tap a glowing crop to harvest and earn coins.',
    emoji: '🧺',
    target: '[data-onboard="farm-grid"]',
    placement: 'right',
  },
  {
    id: 'board',
    title: 'Visit the Town Board',
    description: 'Open More → Events to see today’s plan.',
    emoji: '📌',
    target: '[data-onboard="events-tab"]',
    placement: 'top',
  },
];

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;
