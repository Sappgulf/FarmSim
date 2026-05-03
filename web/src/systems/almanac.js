import {
  ALMANAC_PAGES,
  ALMANAC_PAGE_INDEX,
  ALMANAC_SEASONS,
  ALMANAC_WEATHER_TYPES,
} from '../data/almanac';

export const getDayKey = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getSeasonBit = (season) => {
  const index = ALMANAC_SEASONS.indexOf(season);
  return index >= 0 ? 1 << index : 0;
};

export const countBits = (mask = 0) => {
  let count = 0;
  let value = mask;
  while (value) {
    count += value & 1;
    value >>= 1;
  }
  return count;
};

export const getAlmanacPage = (id) => ALMANAC_PAGE_INDEX[id] || null;

export const getAlmanacText = (page, philosophyId) => {
  if (!page?.text) return '';
  if (philosophyId && page.text[philosophyId]) return page.text[philosophyId];
  return page.text.default || page.text.nature || page.text.market || page.text.slow || '';
};

export const getUnlockedAlmanacPages = (almanacState) => {
  const unlocked = almanacState?.unlocked || {};
  return ALMANAC_PAGES.filter((page) => unlocked[page.id]);
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getDailyAlmanacInsight = (almanacState, philosophyId, dayKey = getDayKey()) => {
  const unlockedPages = getUnlockedAlmanacPages(almanacState);
  if (!unlockedPages.length) return null;
  const index = hashString(dayKey) % unlockedPages.length;
  const page = unlockedPages[index];
  return {
    page,
    text: getAlmanacText(page, philosophyId),
  };
};

export const isKnownWeatherType = (weather) => ALMANAC_WEATHER_TYPES.includes(weather);
