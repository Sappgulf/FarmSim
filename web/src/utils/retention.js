import { getDayKey } from '../systems/almanac';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const getWeekKey = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  const day = (date.getDay() + 6) % 7;
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - day + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const weekNumber = 1 + Math.round((thursday - firstThursday) / WEEK_MS);
  return `${thursday.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

export const ensureWeeklyVisits = (weeklyVisits, dayKey = getDayKey(), weekKey = getWeekKey()) => {
  const current = weeklyVisits && typeof weeklyVisits === 'object' ? weeklyVisits : {};
  const normalizedWeekKey = typeof current.weekKey === 'string' ? current.weekKey : null;
  const days = Array.isArray(current.days) ? current.days : [];
  const claimedTiers = Array.isArray(current.claimedTiers) ? current.claimedTiers : [];

  if (normalizedWeekKey !== weekKey) {
    return {
      weekKey,
      days: [dayKey],
      claimedTiers: [],
    };
  }

  if (!days.includes(dayKey)) {
    return {
      weekKey,
      days: [...days, dayKey],
      claimedTiers,
    };
  }

  return {
    weekKey,
    days,
    claimedTiers,
  };
};
