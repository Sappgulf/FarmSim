import { ALMANAC_PAGES } from '../data/almanac';
import { MEMORIES, MOOD_TIERS, PHILOSOPHIES } from '../data/identity';
import { getAlmanacText } from '../systems/almanac';
import { getDayKey } from '../systems/almanac';
import { getSpotlightSelection } from './farmCard';

const countUnlocked = (map = {}) => Object.values(map).filter(Boolean).length;

export const getJournalMoodTier = (state) => {
  const memoryCount = countUnlocked(state?.memoryFlags || {});
  const almanacCount = countUnlocked(state?.almanac?.unlocked || {});
  const cozyCount = state?.cozyGoals?.completedGoalIds?.length || 0;
  const points = (memoryCount * 8) + (almanacCount * 4) + (cozyCount * 6);

  let tier = MOOD_TIERS[0];
  for (const candidate of MOOD_TIERS) {
    if (points >= candidate.min) tier = candidate;
  }
  return tier;
};

export const getLatestUnlockedMemory = (state) => {
  if (state?.lastUnlockedMemoryId) {
    return MEMORIES.find((memory) => memory.id === state.lastUnlockedMemoryId) || null;
  }

  const unlocked = new Set(Object.keys(state?.memoryFlags || {}).filter((id) => state?.memoryFlags?.[id]));
  const sorted = MEMORIES
    .filter((memory) => unlocked.has(memory.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return sorted[sorted.length - 1] || null;
};

const getSpotlightLabel = (state) => {
  const spotlight = getSpotlightSelection(state);
  if (spotlight.type === 'memory' && spotlight.id) {
    const memory = MEMORIES.find((entry) => entry.id === spotlight.id);
    return memory ? `${memory.icon} ${memory.title}` : 'your scrapbook';
  }
  if (spotlight.type === 'almanac' && spotlight.id) {
    const page = ALMANAC_PAGES.find((entry) => entry.id === spotlight.id);
    return page ? `${page.icon || '📖'} ${page.title}` : 'the almanac';
  }
  return 'the field notes';
};

const buildReflectionText = ({ seasonLabel, moodTier, philosophy, spotlightLabel, latestMemoryTitle, dayCount }) => {
  if (philosophy?.id === 'nature') {
    return `${seasonLabel} keeps the farm in a ${moodTier.name.toLowerCase()} mood. Day ${dayCount} feels anchored by ${spotlightLabel.toLowerCase()} and the memory of ${latestMemoryTitle}.`;
  }
  if (philosophy?.id === 'market') {
    return `Day ${dayCount} closes with a ${moodTier.name.toLowerCase()} read on the farm. ${spotlightLabel} is the clearest signal, while ${latestMemoryTitle} keeps the work personal.`;
  }
  if (philosophy?.id === 'slow') {
    return `${seasonLabel} is settling in gently. ${spotlightLabel} and ${latestMemoryTitle} make Day ${dayCount} feel less like output and more like a place to return to.`;
  }
  return `${seasonLabel} leaves the farm in a ${moodTier.name.toLowerCase()} mood. ${spotlightLabel} and ${latestMemoryTitle} are the clearest threads worth keeping.`;
};

const getPreviousDayKey = (dayKey) => {
  if (!dayKey) return null;
  const date = new Date(`${dayKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

export const buildJournalEntry = (state, {
  dayKey = getDayKey(),
  reason = 'day_rollover',
  flags = {},
} = {}) => {
  const moodTier = getJournalMoodTier(state);
  const philosophy = PHILOSOPHIES.find((entry) => entry.id === state?.philosophy) || null;
  const latestMemory = getLatestUnlockedMemory(state);
  const season = state?.season?.current || 'spring';
  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);
  const spotlight = getSpotlightSelection(state);
  const spotlightLabel = getSpotlightLabel(state);
  const dayCount = Math.max(1, state?.almanac?.counters?.dayCount || 1);
  const latestMemoryTitle = latestMemory?.title || 'recent small moments';

  return {
    id: `${dayKey}:${reason}`,
    dayKey,
    createdAt: Date.now(),
    season,
    dayCount,
    reason,
    moodTierId: moodTier.id,
    moodName: moodTier.name,
    moodIcon: moodTier.emoji,
    philosophyId: philosophy?.id || null,
    philosophyName: philosophy?.name || 'Unchosen',
    latestMemoryId: latestMemory?.id || null,
    latestMemoryTitle,
    spotlightType: spotlight?.type || 'memory',
    spotlightId: spotlight?.id || null,
    spotlightLabel,
    title: `${seasonLabel} Journal · Day ${dayCount}`,
    reflection: buildReflectionText({
      seasonLabel,
      moodTier,
      philosophy,
      spotlightLabel,
      latestMemoryTitle,
      dayCount,
    }),
    flags: {
      scrapbookOpened: Boolean(flags.scrapbookOpened),
      philosophyTouched: Boolean(flags.philosophyTouched),
      spotlightTouched: Boolean(flags.spotlightTouched),
    },
  };
};

export const upsertJournalEntry = (journalState, state, options = {}) => {
  const currentJournal = journalState || { entries: [], ritual: {} };
  const dayKey = options.dayKey || getDayKey();
  const entries = Array.isArray(currentJournal.entries) ? currentJournal.entries : [];
  const existingEntry = entries.find((entry) => entry.dayKey === dayKey) || null;
  const mergedFlags = {
    scrapbookOpened: Boolean(existingEntry?.flags?.scrapbookOpened || options.flags?.scrapbookOpened),
    philosophyTouched: Boolean(existingEntry?.flags?.philosophyTouched || options.flags?.philosophyTouched),
    spotlightTouched: Boolean(existingEntry?.flags?.spotlightTouched || options.flags?.spotlightTouched),
  };
  const nextEntry = buildJournalEntry(state, {
    ...options,
    dayKey,
    flags: mergedFlags,
  });
  const nextEntries = existingEntry
    ? entries.map((entry) => (entry.dayKey === dayKey ? { ...entry, ...nextEntry } : entry))
    : [...entries, nextEntry].slice(-24);

  const previousDayKey = getPreviousDayKey(dayKey);
  const previousRitual = currentJournal.ritual || {};
  const carriedStreak = previousRitual.lastEntryDayKey === previousDayKey
    ? Math.max(0, Number(previousRitual.streak || 0)) + 1
    : 1;

  return {
    entries: nextEntries,
    ritual: {
      lastEntryDayKey: dayKey,
      streak: existingEntry ? (previousRitual.streak || 1) : carriedStreak,
      lastScrapbookDayKey: mergedFlags.scrapbookOpened ? dayKey : (previousRitual.lastScrapbookDayKey || null),
      lastPhilosophyDayKey: mergedFlags.philosophyTouched ? dayKey : (previousRitual.lastPhilosophyDayKey || null),
      lastSpotlightDayKey: mergedFlags.spotlightTouched ? dayKey : (previousRitual.lastSpotlightDayKey || null),
    },
  };
};

export const getJournalOverview = (state) => {
  const journal = state?.journal || { entries: [], ritual: {} };
  const entries = Array.isArray(journal.entries) ? journal.entries : [];
  const season = state?.season?.current || 'spring';
  const currentSeasonEntries = entries.filter((entry) => entry.season === season);
  const latestEntry = entries[entries.length - 1] || null;
  const todayKey = getDayKey();
  const ritual = journal.ritual || {};

  return {
    totalEntries: entries.length,
    seasonEntries: currentSeasonEntries.length,
    streak: Number(ritual.streak || 0),
    latestEntry,
    todayChecklist: [
      {
        id: 'philosophy',
        label: 'Touch the farm philosophy',
        done: ritual.lastPhilosophyDayKey === todayKey || Boolean(state?.philosophy),
      },
      {
        id: 'scrapbook',
        label: 'Open the scrapbook once',
        done: ritual.lastScrapbookDayKey === todayKey,
      },
      {
        id: 'spotlight',
        label: 'Aim the Farm Card spotlight',
        done: ritual.lastSpotlightDayKey === todayKey || state?.spotlight?.mode === 'favorite',
      },
    ],
    recentEntries: entries.slice(-3).reverse(),
  };
};

