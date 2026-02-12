import { getContentManager } from '../content/ContentManager';

/**
 * Almanac data - sections and page definitions.
 * Almanac pages are knowledge entries unlocked through events.
 */

const content = getContentManager();

export const ALMANAC_SEASONS = content.almanac.seasons || ['spring', 'summer', 'fall', 'winter'];
export const ALMANAC_WEATHER_TYPES = content.almanac.weatherTypes || [
  'sunny',
  'cloudy',
  'rainy',
  'stormy',
  'drought',
  'snow',
  'windy',
];

export const ALMANAC_SECTIONS = content.almanac.sections;
export const ALMANAC_PAGES = content.almanac.pages;
export const ALMANAC_PAGE_INDEX = content.almanacPageById;
export const ALMANAC_MEMORY_LINKS = content.almanac.memoryLinks || {
  first_rainy_harvest: 'rainsoft_fields',
  festival_first: 'gathering_light',
  festival_regular: 'festival_regular',
};
