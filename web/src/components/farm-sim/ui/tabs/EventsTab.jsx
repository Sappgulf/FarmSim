import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { MEMORIES } from '../../../../data/identity';
import { ALMANAC_PAGES } from '../../../../data/almanac';
import { buildFarmCardData } from '../../../../utils/farmCard';
import { getPlanSuggestions } from '../../../../utils/goalHints';
import { getDailyAlmanacInsight, getDayKey } from '../../../../systems/almanac';
import { FARM_TITLES, WEEKLY_SPECIAL_DAY } from '../../../../data/cozyExpansion';
import { getContentManager } from '../../../../content/ContentManager';
import { getWeekKey } from '../../../../utils/retention';
import { getDailyCropFocus } from '../../../../utils/dailyFocus';
import { getDailyOperationProgress } from '../../../../utils/challengesBoard';
import { getDifficultyModifier, getProgressionBand } from '../../systems/progression';
import PerfectHarvestModal from '../minigames/PerfectHarvestModal';
import FarmCardShareButton from '../FarmCardShareButton';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

const FALLBACK_RULE_SET = {
  id: 'fallback_rule',
  title: 'Festival Timing',
  instructions: 'Stop the marker in the sweet spot.',
  rounds: 2,
  speedCurve: [0.5, 0.65],
  targetWindows: { gold: 0.05, silver: 0.08, bronze: 0.1 },
  playLimit: 'daily',
  theme: { icon: '🏮', panel: 'from-amber-50 to-orange-50' },
  rewards: {
    gold: { coins: 15, reputation: 1 },
    silver: { coins: 10, reputation: 1 },
    bronze: { coins: 6 },
    miss: { coins: 4 },
  },
};

const WELCOME_BACK_GAP_HOURS = 6;
const DAILY_DELIGHT_COINS = 5;
const FESTIVAL_PARTICIPATION_COST_BY_BAND = { onboarding: 0, early_intent: 2, mid_depth: 3, mastery: 4, prestige: 4 };
const WEEKLY_VISIT_TIERS = [
  { visits: 2, reward: { decorId: 'cozy_bench' }, label: 'Cozy Bench' },
  { visits: 4, reward: { decorId: 'birdbath' }, label: 'Birdbath' },
  { visits: 6, reward: { decorId: 'stone_path' }, label: 'Stone Path' },
];
const VALID_SEASONS = new Set(['spring', 'summer', 'autumn', 'winter']);

const PLAN_ACTIONS = {
  harvest: { tabId: 'farming', label: 'Open field' },
  plant: { tabId: 'farming', label: 'Open field' },
  wait: { tabId: 'farming', label: 'View crops' },
  explore: { tabId: 'farming', label: 'Open field' },
  earn: { tabId: 'shop', label: 'Open shop' },
  shop: { tabId: 'shop', label: 'Open shop' },
  build: { tabId: 'buildings', label: 'Open build' },
  board: { tabId: 'events', label: 'Stay here' },
};

const switchToTab = (tabId) => {
  if (typeof window !== 'undefined' && typeof window.switchToTab === 'function') {
    window.switchToTab(tabId);
  }
};

const selectFestivalRuleSet = (rules = [], activeEvent, season) => {
  const list = Array.isArray(rules) ? rules : [];
  const defaultRule = list.find((rule) => rule.isDefault) || list[0] || FALLBACK_RULE_SET;

  if (activeEvent) {
    const matchById = list.find((rule) => rule.festivalIds?.includes(activeEvent.id));
    if (matchById) return matchById;

    const tags = new Set([
      activeEvent.season,
      ...(activeEvent.seasonTags || []),
      season,
    ].filter(Boolean));
    const matchByTag = list.find((rule) => rule.seasonTags?.some((tag) => tags.has(tag)));
    if (matchByTag) return matchByTag;
  }

  return defaultRule || FALLBACK_RULE_SET;
};

const getPlayLimitLabel = (ruleSet, activeEvent) => {
  const limit = ruleSet?.playLimit || (activeEvent ? 'festival_day' : 'daily');
  if (limit === 'festival_day') return '1 play per festival day';
  if (limit === 'festival') return '1 play per festival';
  return '1 play per day';
};

export const deriveActiveSeason = (state = {}) => {
  const currentSeason = state?.season?.current;
  if (typeof currentSeason === 'string' && VALID_SEASONS.has(currentSeason)) {
    return currentSeason;
  }

  const lastSeenSeason = state?.retention?.lastSeenSeason;
  if (typeof lastSeenSeason === 'string' && VALID_SEASONS.has(lastSeenSeason)) {
    return lastSeenSeason;
  }

  return 'spring';
};

const EventsTab = memo(() => {
  const { state, actions } = useGame();
  const [welcomeBackSnapshot] = useState(() => ({
    lastSessionAt: state.retention?.lastSessionAt ?? null,
    lastSeenDayKey: state.retention?.lastSeenDayKey ?? null,
    lastSeenGameDay: state.retention?.lastSeenGameDay ?? 0,
    lastSeenSeason: state.retention?.lastSeenSeason ?? null,
    lastWelcomeBackShownAt: state.retention?.lastWelcomeBackShownAt ?? null,
    lastWelcomeBackDayKey: state.retention?.lastWelcomeBackDayKey ?? null,
  }));
  const content = getContentManager();
  const [eventHistory, setEventHistory] = useState([]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(() => {
    const initialDayKey = getDayKey();
    const lastSessionAt = welcomeBackSnapshot.lastSessionAt;
    const hasGap = lastSessionAt
      ? (Date.now() - lastSessionAt) >= WELCOME_BACK_GAP_HOURS * 60 * 60 * 1000
      : false;
    const alreadyShown = welcomeBackSnapshot.lastWelcomeBackDayKey === initialDayKey;
    return (state.settings?.showWelcomeBackSummary !== false) && hasGap && !alreadyShown;
  });
  const [showPerfectHarvest, setShowPerfectHarvest] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  const [gameSummary, setGameSummary] = useState(null);
  const stateRef = useRef(state);
  const eventTimersRef = useRef(new Map());
  const packHighlights = (content.report?.packs || [])
    .filter((pack) => pack.highlights?.length)
    .map((pack) => ({
      id: pack.id,
      version: pack.version,
      packName: pack.name,
      items: pack.highlights,
    }));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      eventTimersRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      eventTimersRef.current.clear();
    };
  }, []);

  const currentSeason = deriveActiveSeason(state);
  const seasonEvents = content.festivals.filter((event) =>
    event.season === currentSeason || event.seasonTags?.includes(currentSeason)
  );

  // Trigger random seasonal event
  const triggerSeasonalEvent = () => {
    if (seasonEvents.length === 0) return;

    // Check if there's already an active event
    if (state.activeSeasonalEvents && state.activeSeasonalEvents.length > 0) {
      actions.addNotification({
        message: 'An event is already active!',
        type: 'warning'
      });
      return;
    }

    // Select random event
    const randomEvent = seasonEvents[Math.floor(Math.random() * seasonEvents.length)];
    const eventWithTimer = {
      ...randomEvent,
      startedAt: Date.now(),
      endsAt: Date.now() + (randomEvent.durationSeconds * 1000),
      season: currentSeason,
    };

    // Start the event
    actions.updateActiveEvents([eventWithTimer]);

    actions.addNotification({
      message: `${randomEvent.emoji} ${randomEvent.name} has begun!`,
      type: 'success'
    });
    actions.recordAlmanacEvent('festival_start', { eventId: randomEvent.id, season: currentSeason });

    // Auto-end event after duration
    const timeoutId = setTimeout(() => {
      endSeasonalEvent(eventWithTimer.id);
    }, randomEvent.durationSeconds * 1000);
    eventTimersRef.current.set(eventWithTimer.id, timeoutId);
  };

  // End seasonal event and grant rewards
  const endSeasonalEvent = (eventId) => {
    const currentState = stateRef.current;
    const activeEvent = currentState.activeSeasonalEvents?.find((event) => event.id === eventId);
    if (!activeEvent) return;

    // Grant rewards
    actions.earnMoney(activeEvent.rewards.coins, 'daily_reward');
    actions.addXP(Math.floor(activeEvent.rewards.coins * 0.5), { source: 'daily_reward', label: 'Festival Reward' });

    // Add to event history
    const completedEvent = {
      ...activeEvent,
      completedAt: Date.now(),
      rewards: activeEvent.rewards
    };

    setEventHistory(prev => [completedEvent, ...prev.slice(0, 9)]); // Keep last 10
    actions.recordMemoryEvent('festival_attended', { eventId: activeEvent.id });
    actions.recordAlmanacEvent('festival_attended', { eventId: activeEvent.id, season: activeEvent.season });

    // Clear active event
    actions.updateActiveEvents([]);
    const timeoutId = eventTimersRef.current.get(eventId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      eventTimersRef.current.delete(eventId);
    }

    actions.addNotification({
      message: `${activeEvent.emoji} ${activeEvent.name} ended! +${activeEvent.rewards.coins}🪙`,
      type: 'success'
    });
  };

  const getEventTimeLeft = (event) => {
    const timeLeft = Math.max(0, event.endsAt - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'epic': return 'border-purple-500 bg-purple-50 text-purple-700';
      case 'rare': return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'uncommon': return 'border-green-500 bg-green-50 text-green-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const activeEvent = state.activeSeasonalEvents?.[0];
  const almanacInsight = getDailyAlmanacInsight(state.almanac, state.philosophy);
  const whatsNewTitle = content.strings?.ui?.whatsNewTitle || "What's New";
  const dayKey = getDayKey();
  const currentWeekKey = getWeekKey();
  const whatsNewDismissed = state.whatsNew?.dismissed || {};
  const newPackHighlights = packHighlights.filter(
    (pack) => whatsNewDismissed[pack.id] !== pack.version
  );
  const cozyGoals = state.cozyGoals?.lastGeneratedGoals?.goals || [];
  const completedCozyGoals = new Set(state.cozyGoals?.completedGoalIds || []);
  const minigameState = state.minigames?.festivalGame || state.minigames?.perfectHarvest || {};
  const reducedMotion = state.settings?.reducedMotion === true || state.settings?.animationsEnabled === false;
  const baseRuleSet = selectFestivalRuleSet(content.minigames, activeEvent, currentSeason);
  const minigameDifficulty = getDifficultyModifier(getProgressionBand(state.level || 1).id);
  const activeRuleSet = {
    ...baseRuleSet,
    targetWindows: {
      ...baseRuleSet.targetWindows,
      gold: Math.max(0.04, (baseRuleSet.targetWindows?.gold || 0.05) * minigameDifficulty.minigameWindow),
      silver: Math.max(0.07, (baseRuleSet.targetWindows?.silver || 0.08) * minigameDifficulty.minigameWindow),
      bronze: Math.max(0.09, (baseRuleSet.targetWindows?.bronze || 0.1) * minigameDifficulty.minigameWindow),
    },
  };
  const playLimitLabel = getPlayLimitLabel(activeRuleSet, activeEvent);
  const playLimit = activeRuleSet?.playLimit || (activeEvent ? 'festival_day' : 'daily');
  const playedFestival = activeEvent ? minigameState.lastFestivalId === activeEvent.id : false;
  const playedToday = minigameState.lastPlayedDayKey === dayKey;
  const playedSameFestivalDay = playedFestival && playedToday;
  const canPlayFestivalGame = activeEvent
    ? (playLimit === 'festival' ? !playedFestival : !playedSameFestivalDay)
    : (playLimit === 'daily' ? !playedToday : !playedToday);
  const onboardingActive = !state.onboardingSkipped && (state.onboardingStep || 0) < 3;
  const isFirstDay = (state.almanac?.counters?.dayCount || 0) <= 0;
  const farmCardSpotlight = buildFarmCardData(state).spotlight;
  const activeTitleId = state.cozyExpansion?.farmTitles?.activeId || 'home_grower';
  const activeTitleName = FARM_TITLES[activeTitleId]?.name || FARM_TITLES.home_grower.name;
  const weeklySpecialToday = new Date(`${dayKey}T00:00:00`).getDay() === WEEKLY_SPECIAL_DAY.dayIndex;
  const readyCropsCount = (state.plots || []).filter((plot) => plot?.state === 'ready').length;
  const lastSeenSeason = welcomeBackSnapshot.lastSeenSeason || state.season?.current || 'spring';
  const lastSeenDayCount = Math.max(1, welcomeBackSnapshot.lastSeenGameDay || 1);
  const weeklyVisits = state.retention?.weeklyVisits || { weekKey: null, days: [], claimedTiers: [] };
  const weeklyVisitCount = weeklyVisits.days?.length || 0;
  const weeklyClaimedTiers = new Set(weeklyVisits.claimedTiers || []);
  const dailyDelightClaimed = state.retention?.lastDailyDelightClaimDate === dayKey;
  const dailyDelightCount = state.retention?.dailyDelightClaimCount || 0;
  const dailyFocus = useMemo(() => getDailyCropFocus(state, dayKey), [state, dayKey]);
  const dailyOperations = useMemo(() => {
    const operations = Array.isArray(state.dailyChallenges) ? state.dailyChallenges : [];
    return operations
      .map((challenge) => {
        const progress = getDailyOperationProgress(state, challenge);
        const target = Math.max(1, Math.floor(Number(challenge?.target) || 1));
        return {
          ...challenge,
          progress,
          target,
          percent: Math.min(100, Math.round((progress / target) * 100)),
        };
      })
      .sort((a, b) => {
        if (Boolean(a.claimed) !== Boolean(b.claimed)) return a.claimed ? 1 : -1;
        return b.percent - a.percent;
      });
  }, [state]);
  const sinceThenHighlights = useMemo(() => {
    const highlights = [];
    if (activeEvent) {
      highlights.push(`Festival active: ${activeEvent.emoji} ${activeEvent.name}`);
    } else if (seasonEvents.length > 0) {
      highlights.push(`Seasonal events ready: ${seasonEvents.length} ${currentSeason} picks`);
    }
    if (readyCropsCount > 0) {
      highlights.push(`${readyCropsCount} crop${readyCropsCount === 1 ? '' : 's'} ready to harvest`);
    }
    if (newPackHighlights.length > 0) {
      highlights.push(`${newPackHighlights.length} new pack highlight${newPackHighlights.length === 1 ? '' : 's'}`);
    }
    return highlights.slice(0, 2);
  }, [activeEvent, seasonEvents.length, currentSeason, readyCropsCount, newPackHighlights.length]);
  const cozySuggestion = useMemo(() => {
    if (activeEvent) {
      return `Join the ${activeEvent.name} challenge for a cozy reward.`;
    }
    if (readyCropsCount > 0) {
      return 'Harvest the ready crops for a quick, satisfying win.';
    }
    if (newPackHighlights.length > 0) {
      return 'Peek the latest pack highlights on the Town Board.';
    }
    return `Plant a seasonal favorite for ${currentSeason}.`;
  }, [activeEvent, readyCropsCount, newPackHighlights.length, currentSeason]);

  useEffect(() => {
    actions.generateCozyGoals(dayKey);
  }, [actions, dayKey]);

  const planSuggestions = getPlanSuggestions(state, 2);
  const boardDirectionCards = useMemo(() => {
    const cards = [];

    if (dailyFocus?.crop) {
      cards.push({
        id: 'daily-focus',
        eyebrow: 'Market focus',
        title: `${dailyFocus.crop.emoji} ${dailyFocus.crop.name}`,
        detail: `Sells for +${Math.round((dailyFocus.bonusMultiplier - 1) * 100)}% today.`,
        actionLabel: 'Open inventory',
        actionTab: 'inventory',
      });
    }

    const topOperation = dailyOperations.find((challenge) => !challenge.claimed) || dailyOperations[0];
    if (topOperation) {
      cards.push({
        id: 'daily-op',
        eyebrow: 'Daily operation',
        title: topOperation.name,
        detail: topOperation.description,
        progressLabel: `${Math.min(topOperation.progress, topOperation.target)} / ${topOperation.target}`,
        progressPercent: topOperation.percent,
        actionLabel: 'Open operations',
        actionTab: 'challenges',
      });
    }

    const nextGoal = cozyGoals.find((goal) => !completedCozyGoals.has(goal.id)) || cozyGoals[0];
    if (nextGoal) {
      cards.push({
        id: 'cozy-goal',
        eyebrow: 'Soft goal',
        title: `${nextGoal.emoji} ${nextGoal.text}`,
        detail: 'Optional progress if you want a gentler route.',
        actionLabel: 'Open field',
        actionTab: 'farming',
      });
    }

    return cards.slice(0, 3);
  }, [cozyGoals, completedCozyGoals, dailyFocus, dailyOperations]);
  const nextMemory = MEMORIES.find((memory) => !state.memoryFlags?.[memory.id]);
  const nextAlmanac = ALMANAC_PAGES.find((page) => !state.almanac?.unlocked?.[page.id]);
  const closeToTeaser = nextMemory?.hint || nextAlmanac?.hint || 'All pages are complete. Your story feels whole.';
  const shopSnippet = state.coins >= 5
    ? 'Boosts and daily decor picks are ready in the Shop.'
    : 'Shop boosts unlock once you have a few more coins.';
  const vibeLine = state.season?.config?.description || 'The farm feels calm and ready for small wins.';

  const handleDismissWelcomeBack = () => {
    setShowWelcomeBack(false);
    actions.updateRetention({
      lastWelcomeBackShownAt: Date.now(),
      lastWelcomeBackDayKey: dayKey,
    });
  };

  const handleDailyDelightClaim = () => {
    if (dailyDelightClaimed) return;
    const nextCount = dailyDelightCount + 1;
    actions.earnMoney(DAILY_DELIGHT_COINS, 'daily_reward');
    actions.updateRetention({
      lastDailyDelightClaimDate: dayKey,
      dailyDelightClaimCount: nextCount,
    });
    actions.addNotification({
      message: `🍵 Daily Delight claimed: +${DAILY_DELIGHT_COINS}🪙`,
      type: 'success',
    });

    if (nextCount % 7 === 0) {
      const nextPage = ALMANAC_PAGES.find((page) => !state.almanac?.unlocked?.[page.id]);
      if (nextPage) {
        actions.unlockAlmanacPage(nextPage.id);
      }
    }
  };

  const handleWeeklyRewardClaim = (tier) => {
    if (!tier || weeklyClaimedTiers.has(tier.visits)) return;
    if (weeklyVisitCount < tier.visits) return;
    const decorId = tier.reward?.decorId;
    if (!decorId) return;
    const decorName = content.decorById?.[decorId]?.name || tier.label || decorId;
    actions.updateInventory((inventory) => ({
      ...inventory,
      [decorId]: (inventory?.[decorId] || 0) + 1,
    }));
    actions.updateRetention({
      weeklyVisits: {
        ...weeklyVisits,
        claimedTiers: [...(weeklyVisits.claimedTiers || []), tier.visits],
      },
    });
    actions.addNotification({
      message: `🎀 Weekly Visits reward: ${decorName}`,
      type: 'success',
    });
  };

  const handleFestivalGameComplete = (tier, detail) => {
    const rewardTable = activeRuleSet?.rewards || {};
    const reward = rewardTable[tier] || rewardTable.miss || null;
    if (!reward) return;

    const summaryParts = [];
    if (reward.coins) {
      actions.earnMoney(reward.coins, 'minigame');
      summaryParts.push(`+${reward.coins}🪙`);
    }
    if (reward.reputation) {
      const currentSocial = stateRef.current.social || { friends: [], reputation: 0, marketListings: [] };
      actions.updateSocial({
        ...currentSocial,
        reputation: (currentSocial.reputation || 0) + reward.reputation,
      });
      summaryParts.push(`+${reward.reputation} rep`);
    }
    if (reward.decor) {
      actions.updateInventory((inventory) => ({
        ...inventory,
        [reward.decor]: (inventory?.[reward.decor] || 0) + 1,
      }));
      const decorName = content.decorById?.[reward.decor]?.name || reward.decor;
      summaryParts.push(`+${decorName}`);
    }
    if (reward.almanacPageId) {
      actions.unlockAlmanacPage(reward.almanacPageId);
      summaryParts.push('Almanac page');
    }

    const nextMinigames = {
      ...(stateRef.current.minigames || {}),
      festivalGame: {
        lastPlayedDayKey: dayKey,
        lastFestivalId: activeEvent ? activeEvent.id : null,
        lastRuleId: activeRuleSet?.id || null,
        lastResult: tier,
        lastPlayedAt: Date.now(),
      },
    };
    actions.updateMinigames(nextMinigames);
    actions.recordCozyGoalEvent('festival_game_played', {
      season: currentSeason,
      eventId: activeEvent?.id || null,
    });
    actions.recordAlmanacEvent('festival_game', {
      eventId: activeEvent?.id || null,
      season: currentSeason,
    });

    const summaryText = summaryParts.length ? summaryParts.join(' · ') : 'Reward applied';
    const summary = { tier, reward, text: summaryText, detail };
    setLastReward({ tier, reward, mode: activeEvent ? 'festival' : 'board', text: summaryText });
    setGameSummary(summary);

    actions.addNotification({
      message: `🏮 Festival reward: ${summaryText}`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <TabHero
        icon="🏮"
        tone="amber"
        title="Events Board"
        description="Seasonal events, town-board prompts, and small daily reasons to return."
        badge={(
          <Badge variant="outline" className="border-amber-200 bg-white/80 text-amber-700">
            {seasonEvents.length} seasonal events
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Season"
            value={currentSeason}
            hint={vibeLine}
            icon={currentSeason === 'spring' ? '🌸' : currentSeason === 'summer' ? '☀️' : currentSeason === 'autumn' ? '🍂' : '❄️'}
          />
          <MetricTile
            tone="emerald"
            label="Ready Crops"
            value={readyCropsCount}
            hint="Best quick-win signal"
            icon="🌾"
          />
          <MetricTile
            tone="violet"
            label="Plan Hints"
            value={planSuggestions.length}
            hint="Town-board guidance"
            icon="📌"
          />
        </div>
      </TabHero>

      {newPackHighlights.length > 0 ? (
        <TabSection
          title={whatsNewTitle}
          description="Season packs just landed on the Town Board."
          tone="rose"
          action={(
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-white/80 text-slate-600">
                {newPackHighlights.length} Pack{newPackHighlights.length > 1 ? 's' : ''}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => actions.dismissWhatsNew(newPackHighlights)}
                className="min-h-[44px] px-2 text-[11px]"
              >
                Dismiss
              </Button>
            </div>
          )}
          data-qa="whats-new-card"
        >
          <div className="space-y-4">
            {newPackHighlights.map((highlight, index) => (
              <div key={`${highlight.packName}-${index}`} className="grid gap-2 border-b border-rose-100/70 pb-3 last:border-0 last:pb-0">
                <div className="text-sm font-semibold text-rose-700">{highlight.packName}</div>
                <ul className="grid gap-1 text-sm text-slate-700">
                  {highlight.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabSection>
      ) : null}

      {showWelcomeBack ? (
        <TabSection
          title="Welcome back"
          description={`Last time: Day ${lastSeenDayCount}, ${lastSeenSeason.charAt(0).toUpperCase() + lastSeenSeason.slice(1)}`}
          tone="amber"
          action={(
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismissWelcomeBack}
              className="min-h-[44px] px-2 text-[11px]"
              data-qa="welcome-back-dismiss"
            >
              Dismiss
            </Button>
          )}
          data-qa="welcome-back-card"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-amber-600">Since then</div>
              {sinceThenHighlights.length > 0 ? (
                <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                  {sinceThenHighlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-amber-700">Your farm is calm and ready for a gentle return.</p>
              )}
            </div>
            <div className="rounded-[22px] border border-amber-100/80 bg-white/72 px-4 py-3 text-sm text-slate-700">
              <div className="text-[11px] uppercase tracking-wide text-amber-600">Next cozy thing</div>
              <p className="mt-1 leading-6">{cozySuggestion}</p>
            </div>
          </div>
        </TabSection>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <TabSection
          title="Daily delight"
          description="A tiny thank-you for stopping by."
          tone="emerald"
          action={<Badge variant="outline" className="bg-white/80 text-slate-600">+{DAILY_DELIGHT_COINS}🪙</Badge>}
          data-qa="daily-delight-card"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">
              {dailyDelightClaimed ? 'Claimed for today. Come back tomorrow!' : 'Claim once per real-world day.'}
            </p>
            <Button
              size="sm"
              onClick={handleDailyDelightClaim}
              disabled={dailyDelightClaimed}
              data-qa="daily-delight-claim"
            >
              {dailyDelightClaimed ? 'Claimed' : 'Claim'}
            </Button>
          </div>
        </TabSection>

        <TabSection
          title="Weekly visits"
          description="Cosmetic-only thank-yous for gentle consistency."
          tone="sky"
          action={(
            <Badge variant="outline" className="bg-white/80 text-slate-600">
              {weeklyVisitCount} visit{weeklyVisitCount === 1 ? '' : 's'}
            </Badge>
          )}
          data-qa="weekly-visits-card"
        >
          <div className="space-y-3">
            <div className="text-xs text-slate-600">Week window: {weeklyVisits.weekKey || currentWeekKey}</div>
            <div className="space-y-2">
              {WEEKLY_VISIT_TIERS.map((tier) => {
                const decor = content.decorById?.[tier.reward.decorId];
                const rewardLabel = decor ? `${decor.emoji} ${decor.name}` : tier.label;
                const isClaimed = weeklyClaimedTiers.has(tier.visits);
                const isEligible = weeklyVisitCount >= tier.visits;
                return (
                  <div key={tier.visits} className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5">
                    <div>
                      <div className="font-semibold text-sky-800">{tier.visits} visits</div>
                      <div className="text-xs text-slate-600">Reward: {rewardLabel}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={isEligible && !isClaimed ? 'default' : 'outline'}
                      onClick={() => handleWeeklyRewardClaim(tier)}
                      disabled={!isEligible || isClaimed}
                      className="min-h-[44px] px-3 text-[11px]"
                      data-qa={`weekly-visit-claim-${tier.visits}`}
                    >
                      {isClaimed ? 'Claimed' : (isEligible ? 'Claim' : 'Locked')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </TabSection>
      </div>

      <TabSection
        title="Town Board"
        description="Today’s plan, market focus, and next gentle push."
        tone="amber"
        action={(
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            {onboardingActive || isFirstDay ? 'First Session' : 'Live board'}
          </Badge>
        )}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-amber-600">Today&apos;s Plan</div>
            <div className="mt-2 space-y-2">
              {planSuggestions.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-amber-100/70 bg-white/72 px-3 py-2.5 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <span>{item.emoji}</span>
                    <span>{item.text}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[40px] shrink-0"
                    onClick={() => switchToTab(PLAN_ACTIONS[item.id]?.tabId || 'farming')}
                  >
                    {PLAN_ACTIONS[item.id]?.label || 'Open'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[20px] border border-amber-100/70 bg-white/72 px-4 py-3 text-sm text-slate-700">
              <div><span className="font-semibold text-amber-800">You&apos;re close to:</span> {closeToTeaser}</div>
              <div className="mt-1"><span className="font-semibold text-amber-800">Shop today:</span> {shopSnippet}</div>
              <div className="mt-1"><span className="font-semibold text-amber-800">Vibe:</span> {vibeLine}</div>
            </div>
          </div>
          <div className="space-y-3">
            {boardDirectionCards.map((card) => (
              <div key={card.id} className="rounded-[22px] border border-amber-100/80 bg-white/78 px-4 py-3 text-sm text-slate-700">
                <div className="text-[11px] uppercase tracking-wide text-amber-600">{card.eyebrow}</div>
                <div className="mt-1 font-semibold text-slate-900">{card.title}</div>
                <div className="mt-1 text-sm text-slate-600">{card.detail}</div>
                {card.progressLabel ? (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Progress</span>
                      <span>{card.progressLabel}</span>
                    </div>
                    <Progress value={card.progressPercent} className="h-2" />
                  </div>
                ) : null}
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[40px]"
                    onClick={() => switchToTab(card.actionTab)}
                  >
                    {card.actionLabel}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabSection>

      {cozyGoals.length > 0 ? (
        <TabSection
          title="Cozy goals"
          description="Optional prompts for a gentle direction."
          tone="amber"
          action={<Badge variant="outline" className="bg-amber-100 text-amber-700">Optional</Badge>}
        >
          <div className="space-y-2">
            {cozyGoals.map((goal) => {
              const isCompleted = completedCozyGoals.has(goal.id);
              return (
                <div key={goal.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <span>{goal.emoji}</span>
                    <span>{goal.text}</span>
                  </div>
                  {isCompleted ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 text-[10px]">
                      Complete
                    </Badge>
                  ) : null}
                </div>
              );
            })}
          </div>
        </TabSection>
      ) : null}

      {weeklySpecialToday ? (
        <TabSection
          title="Weekly special day"
          description={WEEKLY_SPECIAL_DAY.boardCopy}
          tone="rose"
          action={<Badge variant="outline" className="bg-rose-100 text-rose-700">Town Board</Badge>}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <TabSection
          title="Almanac insight"
          description="Shared from the Town Board."
          tone="amber"
          action={<Badge variant="outline" className="bg-amber-100 text-amber-700">Almanac</Badge>}
        >
          <div className="text-sm leading-6 text-slate-700">
            {almanacInsight ? (
              <>
                <span className="font-semibold text-amber-800">{almanacInsight.page.title}:</span> {almanacInsight.text}
              </>
            ) : (
              'No Almanac pages yet. Keep farming to uncover gentle insights.'
            )}
          </div>
        </TabSection>

        <TabSection
          title="Share farm"
          description="Export a Farm Card with today&apos;s spotlight and theme."
          tone="emerald"
          action={<FarmCardShareButton size="sm" className="theme-accent-bg theme-accent-border border" />}
        >
          <div className="rounded-[22px] border border-emerald-100/80 bg-white/72 p-4 text-sm text-slate-700">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Spotlight</div>
            <div className="mt-1 font-semibold text-slate-900">{farmCardSpotlight.title}</div>
            <div className="text-sm text-slate-600">{farmCardSpotlight.text}</div>
            <div className="mt-2 text-xs text-slate-500">
              Current Title: <span className="font-semibold text-slate-700">{activeTitleName}</span>
            </div>
          </div>
        </TabSection>
      </div>

      <TabSection
        title={activeEvent ? 'Festival game live' : 'Town board challenge'}
        description={activeRuleSet?.instructions || 'Stop the marker in the sweet spot for a cozy reward.'}
        tone="emerald"
        action={(
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
            {activeEvent ? activeEvent.name : 'Daily'}
          </Badge>
        )}
        data-qa="festival-game-card"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-emerald-700">
            {playLimitLabel} • {activeRuleSet?.rounds || 2} rounds
          </div>
          <Button
            size="sm"
            onClick={() => {
              const levelBand = getProgressionBand(state.level || 1).id;
              const entryCost = FESTIVAL_PARTICIPATION_COST_BY_BAND[levelBand] || 0;
              if (entryCost > 0 && (state.coins || 0) >= entryCost) {
                actions.spendMoney(entryCost, { optional: true });
                actions.addNotification({
                  message: `🏮 Festival entry: -${entryCost}🪙`,
                  type: 'info',
                });
              }
              setGameSummary(null);
              setShowPerfectHarvest(true);
            }}
            disabled={!canPlayFestivalGame}
            data-qa="festival-game-play"
          >
            {canPlayFestivalGame ? 'Play Challenge' : 'Already Played'}
          </Button>
        </div>
        {lastReward ? (
          <div className="mt-3 rounded-[18px] border border-emerald-100/80 bg-white/72 px-3 py-2 text-xs text-emerald-800">
            Last result: <span className="font-semibold capitalize">{lastReward.tier}</span> •
            {' '}{lastReward.mode === 'festival' ? 'Festival' : 'Board'}
            {lastReward.text ? ` • ${lastReward.text}` : ''}
          </div>
        ) : null}
      </TabSection>

      <TabSection
        title="Seasonal events"
        description={`Current season: ${currentSeason} ${currentSeason === 'spring' ? '🌸' : currentSeason === 'summer' ? '☀️' : currentSeason === 'autumn' ? '🍂' : '❄️'}`}
        tone="emerald"
        action={<Badge variant="outline" className="bg-white/80 text-slate-600">{seasonEvents.length} Events Available</Badge>}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span>{seasonEvents.length} event{seasonEvents.length === 1 ? '' : 's'} ready now.</span>
          <span className="rounded-full border border-emerald-100 bg-white/72 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Active season: {currentSeason}
          </span>
        </div>
      </TabSection>

      <PerfectHarvestModal
        isOpen={showPerfectHarvest}
        onClose={() => setShowPerfectHarvest(false)}
        onComplete={(tier, detail) => {
          handleFestivalGameComplete(tier, detail);
        }}
        reducedMotion={reducedMotion}
        ruleSet={activeRuleSet}
        rewardSummary={gameSummary}
      />

      {activeEvent ? (
        <TabSection
          title={`${activeEvent.emoji} ${activeEvent.name}`}
          description={activeEvent.description}
          tone="amber"
          action={<Badge className={getRarityColor(activeEvent.rarity)}>{activeEvent.rarity}</Badge>}
          data-qa="active-event-card"
        >
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-700">
                <span>Time remaining</span>
                <span className="font-mono">{getEventTimeLeft(activeEvent)}</span>
              </div>
              <Progress
                value={((activeEvent.endsAt - Date.now()) / (activeEvent.durationSeconds * 1000)) * 100}
                className="h-2"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(activeEvent.effects).map(([effect, value]) => (
                <div key={effect} className="flex items-center justify-between rounded-[18px] border border-white/80 bg-white/72 px-3 py-2 text-sm">
                  <span className="capitalize text-slate-700">{formatDisplayLabel(effect)}</span>
                  <span className="font-semibold text-slate-900">
                    {typeof value === 'boolean' ? (value ? '✓' : '✗')
                      : typeof value === 'number' && value > 1 ? `+${Math.round((value - 1) * 100)}%`
                        : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabSection>
      ) : (
        <TabEmptyState
          icon="🎲"
          title="No active seasonal events"
          description={seasonEvents.length > 0 ? 'Trigger a random event to earn rewards.' : 'No events available for this season.'}
          tone="slate"
          action={(
            <Button
              onClick={triggerSeasonalEvent}
              className="w-full"
              disabled={seasonEvents.length === 0}
            >
              🎲 Trigger {currentSeason} Event
            </Button>
          )}
          data-qa="trigger-event-card"
        />
      )}

      <TabSection
        title={`Available ${currentSeason} events`}
        description="The current season pulls from the local board of possible events."
        tone="slate"
      >
        {seasonEvents.length === 0 ? (
          <p className="py-2 text-sm text-slate-600">Nothing is scheduled here yet.</p>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-slate-200/60 bg-white/72">
            {seasonEvents.map((event, index) => (
              <div
                key={event.id}
                className={`flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between ${
                  index !== 0 ? 'border-t border-slate-200/60' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{event.emoji}</span>
                    <span className="font-semibold text-slate-900">{event.name}</span>
                  </div>
                  <p className="text-sm text-slate-600">{event.description}</p>
                  <div className="text-xs text-slate-500">
                    Duration: {Math.round(event.durationSeconds / 60)}m · Reward: {event.rewards.coins}🪙
                  </div>
                </div>
                <Badge variant="outline" className={getRarityColor(event.rarity)}>
                  {event.rarity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </TabSection>

      <TabSection
        title="Recent events"
        description="A short history of what the farm has already seen."
        tone="slate"
      >
        {eventHistory.length === 0 ? (
          <p className="py-2 text-sm text-slate-600">No completed events yet.</p>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-slate-200/60 bg-white/72">
            {eventHistory.slice(0, 5).map((event, index) => (
              <div
                key={index}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 text-sm ${
                  index !== 0 ? 'border-t border-slate-200/60' : ''
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-900">{event.emoji} {event.name}</div>
                  <div className="text-xs text-slate-500">{new Date(event.completedAt).toLocaleDateString()}</div>
                </div>
                <div className="font-semibold text-emerald-700">+{event.rewards.coins}🪙</div>
              </div>
            ))}
          </div>
        )}
      </TabSection>

      <TabSection
        title="Season information"
        description="A compact reminder of how each season tends to behave."
        tone="sky"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ['Spring (Mar-May)', 'Focus on planting and growth bonuses'],
            ['Summer (Jun-Aug)', 'Harvest festivals and heat events'],
            ['Autumn (Sep-Nov)', 'Epic festivals and crop bonuses'],
            ['Winter (Dec-Feb)', 'Frost resistance and greenhouse boosts'],
          ].map(([seasonLabel, text]) => (
            <div key={seasonLabel} className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{seasonLabel}:</span> {text}
            </div>
          ))}
        </div>
      </TabSection>
    </div>
  );
});

EventsTab.displayName = 'EventsTab';
export default EventsTab;
