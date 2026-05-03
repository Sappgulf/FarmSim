/**
 * Pure helpers for the classic {@link ../components/FarmGame.jsx} UI (mood tiers, seasonal crops).
 * Kept separate to shrink the main component and keep game math testable.
 */
import { MOOD_TIERS } from '../data/identity';

/** @type {Record<string, string>} */
export const FEATURED_CROP_BY_SEASON = {
  spring: 'carrot',
  summer: 'corn',
  fall: 'pumpkin',
  winter: 'garlic',
};

/**
 * @param {number} points
 * @returns {typeof MOOD_TIERS[number]}
 */
export function getMoodTierForPoints(points) {
  let tier = MOOD_TIERS[0];
  for (const candidate of MOOD_TIERS) {
    if (points >= candidate.min) tier = candidate;
  }
  return tier;
}

/**
 * @param {string} [season]
 * @returns {string}
 */
export function getFeaturedCropId(season) {
  return FEATURED_CROP_BY_SEASON[season] || 'carrot';
}
