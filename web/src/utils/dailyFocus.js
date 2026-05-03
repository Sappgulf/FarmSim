import { CROP_LIST } from '../components/farm-sim/constants/cropData';
import { getDayKey } from '../systems/almanac';

export const DAILY_FOCUS_BONUS_MULTIPLIER = 1.25;

const buildDaySeed = (dayKey = '') =>
  String(dayKey)
    .split('')
    .reduce((seed, char) => seed + char.charCodeAt(0), 0);

export const getEligibleDailyFocusCrops = (level = 1) => {
  const numericLevel = Math.max(1, Math.floor(Number(level) || 1));
  const eligible = CROP_LIST.filter((crop) => Number(crop?.level || 1) <= numericLevel);
  return eligible.length > 0 ? eligible : CROP_LIST;
};

export const getDailyCropFocus = (state = {}, dayKey = getDayKey()) => {
  const eligible = getEligibleDailyFocusCrops(state?.level || 1);
  if (!Array.isArray(eligible) || eligible.length === 0) {
    return null;
  }

  const index = buildDaySeed(dayKey) % eligible.length;
  const crop = eligible[index];
  if (!crop) return null;

  return {
    dayKey,
    cropId: crop.id,
    crop,
    bonusMultiplier: DAILY_FOCUS_BONUS_MULTIPLIER,
  };
};

export default {
  DAILY_FOCUS_BONUS_MULTIPLIER,
  getDailyCropFocus,
  getEligibleDailyFocusCrops,
};
