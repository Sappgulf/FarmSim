import { getContentManager } from '../../../content/ContentManager';

/**
 * Decoration Data - Cosmetic farm decor items
 * Data-only entries used by shop + placement tools.
 */

const content = getContentManager();

export const DECORATION_DATA = content.decorById;
export const DECORATION_LIST = content.decor;

export const getDecorationById = (decorId) => DECORATION_DATA[decorId];

export const getDecorationsByCategory = (category) =>
  DECORATION_LIST.filter((decor) => decor.category === category);

export const isLightingDecoration = (decor) => decor?.tags?.includes('lighting');

export const isSeasonalDecoration = (decor) => decor?.tags?.includes('seasonal');

export const isPathOrFenceDecoration = (decor) =>
  decor?.tags?.includes('path') || decor?.tags?.includes('fence');

export default DECORATION_DATA;
