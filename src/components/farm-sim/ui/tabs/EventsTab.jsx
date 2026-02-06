import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { MEMORIES } from '../../../../data/identity';
import { ALMANAC_PAGES } from '../../../../data/almanac';
import { buildFarmCardData } from '../../../../utils/farmCard';
import { getPlanSuggestions } from '../../../../utils/goalHints';
import { getDailyAlmanacInsight, getDayKey } from '../../../../systems/almanac';
import { getContentManager } from '../../../../content/ContentManager';
import { getWeekKey } from '../../../../utils/retention';
import PerfectHarvestModal from '../minigames/PerfectHarvestModal';
import FarmCardShareButton from '../FarmCardShareButton';

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
const WEEKLY_VISIT_TIERS = [
  { visits: 2, reward: { decorId: 'cozy_bench' }, label: 'Cozy Bench' },
  { visits: 4, reward: { decorId: 'birdbath' }, label: 'Birdbath' },
  { visits: 6, reward: { decorId: 'stone_path' }, label: 'Stone Path' },
];

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
  
  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const currentSeason = getCurrentSeason();
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
    actions.earnMoney(activeEvent.rewards.coins);
    actions.addXP(Math.floor(activeEvent.rewards.coins * 0.5));

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
  const activeRuleSet = selectFestivalRuleSet(content.minigames, activeEvent, currentSeason);
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
  const readyCropsCount = (state.plots || []).filter((plot) => plot?.state === 'ready').length;
  const lastSeenSeason = welcomeBackSnapshot.lastSeenSeason || state.season?.current || 'spring';
  const lastSeenDayCount = Math.max(1, welcomeBackSnapshot.lastSeenGameDay || 1);
  const weeklyVisits = state.retention?.weeklyVisits || { weekKey: null, days: [], claimedTiers: [] };
  const weeklyVisitCount = weeklyVisits.days?.length || 0;
  const weeklyClaimedTiers = new Set(weeklyVisits.claimedTiers || []);
  const dailyDelightClaimed = state.retention?.lastDailyDelightClaimDate === dayKey;
  const dailyDelightCount = state.retention?.dailyDelightClaimCount || 0;
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
    actions.earnMoney(DAILY_DELIGHT_COINS);
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
      actions.earnMoney(reward.coins);
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
      {newPackHighlights.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 border-rose-200" data-qa="whats-new-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-rose-800">✨ {whatsNewTitle}</h3>
              <p className="text-sm text-rose-700">Season packs just landed on the Town Board.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-rose-100 text-rose-700">
                {newPackHighlights.length} Pack{newPackHighlights.length > 1 ? 's' : ''}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => actions.dismissWhatsNew(newPackHighlights)}
                className="h-8 px-2 text-[11px]"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            {newPackHighlights.map((highlight, index) => (
              <div key={`${highlight.packName}-${index}`}>
                <div className="font-semibold text-rose-700">{highlight.packName}</div>
                <ul className="list-disc list-inside space-y-1">
                  {highlight.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showWelcomeBack && (
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-amber-200" data-qa="welcome-back-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-amber-800">🌤️ Welcome Back</h3>
              <p className="text-sm text-amber-700">
                Last time: Day {lastSeenDayCount}, {lastSeenSeason.charAt(0).toUpperCase() + lastSeenSeason.slice(1)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismissWelcomeBack}
              className="h-8 px-2 text-[11px]"
              data-qa="welcome-back-dismiss"
            >
              Dismiss
            </Button>
          </div>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-amber-600">Since then</div>
              {sinceThenHighlights.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {sinceThenHighlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-base">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-1 text-xs text-amber-700">Your farm is calm and ready for a gentle return.</div>
              )}
            </div>
            <div className="text-xs text-amber-700">
              <span className="font-semibold">Next cozy thing:</span> {cozySuggestion}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-200" data-qa="daily-delight-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-emerald-800">🍵 Daily Delight</h3>
            <p className="text-sm text-emerald-700">A tiny thank-you for stopping by.</p>
          </div>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
            +{DAILY_DELIGHT_COINS}🪙
          </Badge>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-700">
          <div>
            {dailyDelightClaimed
              ? 'Claimed for today. Come back tomorrow!'
              : 'Claim once per real-world day.'}
          </div>
          <Button
            size="sm"
            onClick={handleDailyDelightClaim}
            disabled={dailyDelightClaimed}
            data-qa="daily-delight-claim"
          >
            {dailyDelightClaimed ? 'Claimed' : 'Claim'}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 border-sky-200" data-qa="weekly-visits-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-sky-800">🗓️ Weekly Visits</h3>
            <p className="text-sm text-sky-700">Cosmetic-only thank-yous for gentle consistency.</p>
          </div>
          <Badge variant="outline" className="bg-sky-100 text-sky-700">
            {weeklyVisitCount} visit{weeklyVisitCount === 1 ? '' : 's'}
          </Badge>
        </div>
        <div className="mt-3 text-xs text-sky-700">
          Week window: {weeklyVisits.weekKey || currentWeekKey}
        </div>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {WEEKLY_VISIT_TIERS.map((tier) => {
            const decor = content.decorById?.[tier.reward.decorId];
            const rewardLabel = decor ? `${decor.emoji} ${decor.name}` : tier.label;
            const isClaimed = weeklyClaimedTiers.has(tier.visits);
            const isEligible = weeklyVisitCount >= tier.visits;
            return (
              <div key={tier.visits} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sky-800">{tier.visits} visits</div>
                  <div className="text-xs text-gray-600">Reward: {rewardLabel}</div>
                </div>
                <Button
                  size="sm"
                  variant={isEligible && !isClaimed ? 'default' : 'outline'}
                  onClick={() => handleWeeklyRewardClaim(tier)}
                  disabled={!isEligible || isClaimed}
                  className="h-8 px-3 text-[11px]"
                  data-qa={`weekly-visit-claim-${tier.visits}`}
                >
                  {isClaimed ? 'Claimed' : (isEligible ? 'Claim' : 'Locked')}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {(onboardingActive || isFirstDay) && (
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-amber-800">📌 Town Board</h3>
              <p className="text-sm text-amber-700">Today’s Plan</p>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-700">
              First Session
            </Badge>
          </div>

          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-amber-600">Today’s Plan</div>
              <ul className="mt-1 space-y-1">
                {planSuggestions.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-amber-700">
              <span className="font-semibold">You’re close to:</span> {closeToTeaser}
            </div>
            <div className="text-xs text-amber-700">
              <span className="font-semibold">Shop Today:</span> {shopSnippet}
            </div>
            <div className="text-xs text-amber-700">
              <span className="font-semibold">Vibe:</span> {vibeLine}
            </div>
          </div>
        </Card>
      )}

      {cozyGoals.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-amber-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-amber-800">🧺 Cozy Goals</h3>
              <p className="text-sm text-amber-700">Optional prompts for a gentle direction.</p>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-700">
              Optional
            </Badge>
          </div>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            {cozyGoals.map((goal) => {
              const isCompleted = completedCozyGoals.has(goal.id);
              return (
                <div key={goal.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-base">{goal.emoji}</span>
                    <span>{goal.text}</span>
                  </div>
                  {isCompleted && (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 text-[10px]">
                      Complete
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Town Board Insight */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-800">📖 Almanac Insight</h3>
            <p className="text-sm text-amber-700">Shared from the Town Board</p>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            Almanac
          </Badge>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          {almanacInsight
            ? (
              <>
                <span className="font-semibold">{almanacInsight.page.title}:</span> {almanacInsight.text}
              </>
            )
            : 'No Almanac pages yet. Keep farming to uncover gentle insights.'
          }
        </div>
      </Card>

      <Card className="p-4 border border-emerald-200 theme-card-surface">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">📸 Share Farm</h3>
            <p className="text-sm text-gray-600">
              Export a Farm Card with today&apos;s spotlight and theme.
            </p>
          </div>
          <FarmCardShareButton size="sm" className="theme-accent-bg theme-accent-border border" />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-100 bg-white/80 p-3 text-sm text-gray-700">
          <div className="text-xs uppercase tracking-wide text-gray-500">Spotlight</div>
          <div className="mt-1 font-semibold">{farmCardSpotlight.title}</div>
          <div className="text-sm text-gray-600">{farmCardSpotlight.text}</div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-lime-50 border-emerald-200" data-qa="festival-game-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-emerald-800">
              {activeRuleSet?.theme?.icon || '🏮'} {activeEvent ? 'Festival Game Live' : 'Town Board Challenge'}
            </h3>
            <p className="text-sm text-emerald-700">
              {activeRuleSet?.instructions || 'Stop the marker in the sweet spot for a cozy reward.'}
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
            {activeEvent ? activeEvent.name : 'Daily'}
          </Badge>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-emerald-700">
            {playLimitLabel} • {activeRuleSet?.rounds || 2} rounds
          </div>
          <Button
            size="sm"
            onClick={() => {
              setGameSummary(null);
              setShowPerfectHarvest(true);
            }}
            disabled={!canPlayFestivalGame}
            data-qa="festival-game-play"
          >
            {canPlayFestivalGame ? 'Play Challenge' : 'Already Played'}
          </Button>
        </div>
        {lastReward && (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-white/70 p-2 text-xs text-emerald-800">
            Last result: <span className="font-semibold capitalize">{lastReward.tier}</span> •
            {' '}{lastReward.mode === 'festival' ? 'Festival' : 'Board'}
            {lastReward.text ? ` • ${lastReward.text}` : ''}
          </div>
        )}
      </Card>

      {/* Season Header */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-800">🎉 Seasonal Events</h3>
            <p className="text-sm text-green-700 capitalize">
              Current Season: {currentSeason} {currentSeason === 'spring' ? '🌸' :
                                              currentSeason === 'summer' ? '☀️' :
                                              currentSeason === 'autumn' ? '🍂' : '❄️'}
            </p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700">
            {seasonEvents.length} Events Available
          </Badge>
        </div>
      </Card>

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

      {/* Active Event */}
      {activeEvent && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeEvent.emoji}</span>
              <div>
                <h4 className="font-semibold text-lg">{activeEvent.name}</h4>
                <p className="text-sm text-gray-600">{activeEvent.description}</p>
              </div>
            </div>
            <Badge className={getRarityColor(activeEvent.rarity)}>
              {activeEvent.rarity}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Time Remaining</span>
              <span className="font-mono">{getEventTimeLeft(activeEvent)}</span>
            </div>
            <Progress
              value={((activeEvent.endsAt - Date.now()) / (activeEvent.durationSeconds * 1000)) * 100}
              className="h-2"
            />
          </div>

          {/* Event Effects */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(activeEvent.effects).map(([effect, value]) => (
              <div key={effect} className="flex justify-between p-2 bg-white rounded">
                <span className="capitalize">{formatDisplayLabel(effect)}:</span>
                <span className="font-semibold">
                  {typeof value === 'boolean' ? (value ? '✓' : '✗') :
                   typeof value === 'number' && value > 1 ? `+${Math.round((value - 1) * 100)}%` :
                   value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trigger Event */}
      {!activeEvent && (
        <Card className="p-4">
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">🎲</div>
              <p>No active seasonal events</p>
              <p className="text-sm">Trigger a random event to earn rewards!</p>
            </div>
            <Button
              onClick={triggerSeasonalEvent}
              className="w-full"
              disabled={seasonEvents.length === 0}
            >
              🎲 Trigger {currentSeason} Event
            </Button>
            {seasonEvents.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No events available for this season
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Available Events */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📅 Available {currentSeason} Events</h4>

        <div className="space-y-3">
          {seasonEvents.map(event => (
            <div key={event.id} className="p-3 border rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{event.emoji}</span>
                  <span className="font-medium">{event.name}</span>
                </div>
                <Badge variant="outline" className={getRarityColor(event.rarity)}>
                  {event.rarity}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">{event.description}</p>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Duration: {Math.round(event.durationSeconds / 60)}m</span>
                <span>Reward: {event.rewards.coins}🪙</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event History */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📜 Recent Events</h4>

        {eventHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No completed events yet</p>
        ) : (
          <div className="space-y-2">
            {eventHistory.slice(0, 5).map((event, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span>{event.emoji} {event.name}</span>
                  <span className="text-green-600 font-semibold">+{event.rewards.coins}🪙</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(event.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Season Info */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">🌸 Season Information</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Spring (Mar-May):</strong> Focus on planting and growth bonuses</p>
          <p><strong>Summer (Jun-Aug):</strong> Harvest festivals and heat events</p>
          <p><strong>Autumn (Sep-Nov):</strong> Epic festivals and crop bonuses</p>
          <p><strong>Winter (Dec-Feb):</strong> Frost resistance and greenhouse boosts</p>
        </div>
      </Card>
    </div>
  );
});

EventsTab.displayName = 'EventsTab';
export default EventsTab;
