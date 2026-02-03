import { getContentManager } from '../../../content/ContentManager';

/**
 * Centralized Crop Data Constants
 * Single source of truth for all crop information across the game
 */

// Crop categories for filtering
export const CROP_CATEGORIES = {
  VEGETABLE: 'vegetable',
  GRAIN: 'grain',
  FRUIT: 'fruit',
  SPECIALTY: 'specialty',
};

// Seasons
export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  FALL: 'fall',
  WINTER: 'winter',
};

const content = getContentManager();

export const CROP_DATA = content.cropsById;
export const CROP_LIST = content.crops;

export const getCropById = (id) => CROP_DATA[id];

export const getAllCrops = () => CROP_LIST;

export const getCropsByCategory = (category) =>
  CROP_LIST.filter((crop) => crop.category === category);

export const getCropsBySeason = (season) =>
  CROP_LIST.filter((crop) => crop.season === season);

export const getCropsByLevel = (playerLevel) =>
  CROP_LIST.filter((crop) => crop.level <= playerLevel);

export default CROP_DATA;
