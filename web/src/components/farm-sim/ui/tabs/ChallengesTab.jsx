import React, { memo, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { useTick } from '../../context/TickContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { CircularProgress } from '../../../ui/circular-progress';
import { getDayKey } from '../../../../systems/almanac';
import { getWeekKey } from '../../../../utils/retention';
import { buildDailyOperations, getDailyOperationProgress } from '../../../../utils/challengesBoard';
import { logDebugAction } from '../../../../utils/debugTools';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';
import { Trophy, Clock, Coins, Star, Check } from 'lucide-react';

const REFRESH_COST = 90;
const WEEKLY_MILESTONES = [
  { days: 2, coins: 120, xp: 70 },
  { days: 4, coins: 220, xp: 120 },
  { days: 6, coins: 360, xp: 200 },
];

const getDifficultyStyles = (difficulty) => {
  switch (difficulty) {
    case 'hard':
      return { badge: 'bg-red-600', border: 'border-red-200', panel: 'bg-red-50' };
    case 'medium':
      return { badge: 'bg-amber-600', border: 'border-amber-200', panel: 'bg-amber-50' };
    default:
      return { badge: 'bg-emerald-600', border: 'border-emerald-200', panel: 'bg-emerald-50' };
  }
};

const getStreakRewardMultiplier = (streak = 0) => {
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.3;
  if (streak >= 3) return 1.15;
  return 1;
};

const ChallengesTab = memo(() => {
  const { state, actions } = useGame();
  const tick = useTick();

  const dayKey = getDayKey();
  const weekKey = getWeekKey();
  const dailyChallenges = Array.isArray(state.dailyChallenges) ? state.dailyChallenges : [];
  const challengeSetDayKey = dailyChallenges[0]?.dayKey || null;
  const streakMultiplier = getStreakRewardMultiplier(state.challengeStreak || 0);

  const weeklyOpsState = useMemo(() => {
    const raw = state.dailyChallengeProgress?.operationsWeek;
    if (!raw || raw.weekKey !== weekKey) {
      return { weekKey, completedDays: [], claimedTiers: [] };
    }
    return {
      weekKey,
      completedDays: Array.isArray(raw.completedDays) ? raw.completedDays : [],
      claimedTiers: Array.isArray(raw.claimedTiers) ? raw.claimedTiers : [],
    };
  }, [state.dailyChallengeProgress, weekKey]);

  const isChallengeSetValid = useMemo(() => (
    dailyChallenges.length > 0 &&
    dailyChallenges.every((challenge) => (
      typeof challenge?.type === 'string' &&
      Number.isFinite(Number(challenge?.target))
    ))
  ), [dailyChallenges]);

  useEffect(() => {
    const shouldRebuild = !isChallengeSetValid || challengeSetDayKey !== dayKey;
    if (!shouldRebuild) return;
    const nextChallenges = buildDailyOperations(state.level, dayKey);
    actions.setDailyChallenges(nextChallenges);
    actions.updateLastChallengeReset(Date.now());
    logDebugAction('daily_challenge_reset', { dayKey, count: nextChallenges.length });
  }, [actions, challengeSetDayKey, dayKey, isChallengeSetValid, state.level]);

  const challengesWithProgress = useMemo(() => (
    dailyChallenges.map((challenge) => {
      const progress = getDailyOperationProgress(state, challenge);
      const target = Math.max(1, Math.floor(Number(challenge?.target) || 1));
      return {
        ...challenge,
        progress,
        target,
        completed: Boolean(challenge?.claimed) || progress >= target,
      };
    })
  ), [dailyChallenges, state]);

  const allClaimed = challengesWithProgress.length > 0 && challengesWithProgress.every((challenge) => challenge.claimed);
  const claimedCount = challengesWithProgress.filter((challenge) => challenge.claimed).length;
  const canRefresh = !allClaimed && state.coins >= REFRESH_COST && !dailyChallenges.some((challenge) => challenge.rerolledToday);

  const handleClaim = (challengeId) => {
    const targetChallenge = challengesWithProgress.find((challenge) => challenge.id === challengeId);
    if (!targetChallenge || targetChallenge.claimed || !targetChallenge.completed) return;

    const allClaimedBefore = dailyChallenges.length > 0 && dailyChallenges.every((challenge) => challenge.claimed);
    const updatedChallenges = dailyChallenges.map((challenge) => (
      challenge.id === challengeId ? { ...challenge, claimed: true, completed: true } : challenge
    ));
    const allClaimedAfter = updatedChallenges.length > 0 && updatedChallenges.every((challenge) => challenge.claimed);

    const rewardCoins = Math.floor((targetChallenge.reward?.coins || 0) * streakMultiplier);
    const rewardXp = Math.floor((targetChallenge.reward?.xp || 0) * streakMultiplier);

    actions.setDailyChallenges(updatedChallenges);
    actions.earnMoney(rewardCoins);
    actions.addXP(rewardXp, { source: 'challenge', label: 'Challenge Reward' });

    if (!allClaimedBefore && allClaimedAfter) {
      actions.updateChallengeStreak((state.challengeStreak || 0) + 1);
      const nextWeeklyState = weeklyOpsState.weekKey === weekKey ? weeklyOpsState : { weekKey, completedDays: [], claimedTiers: [] };
      const completedDays = nextWeeklyState.completedDays.includes(dayKey)
        ? nextWeeklyState.completedDays
        : [...nextWeeklyState.completedDays, dayKey];
      actions.updateChallengeProgress({
        ...(state.dailyChallengeProgress || {}),
        operationsWeek: { ...nextWeeklyState, completedDays },
      });
    }

    actions.addNotification({
      message: `Challenge cleared! +${rewardCoins} coins +${rewardXp} XP${streakMultiplier > 1 ? ` (${Math.round((streakMultiplier - 1) * 100)}% streak boost)` : ''}`,
      type: 'success',
    });

    logDebugAction('daily_challenge_claim', { challengeId, allClaimedAfter, streak: state.challengeStreak });
  };

  const handleRefresh = () => {
    if (!canRefresh) return;
    const nextChallenges = buildDailyOperations(state.level, dayKey).map((challenge) => ({
      ...challenge,
      rerolledToday: true,
    }));
    actions.spendMoney(REFRESH_COST);
    actions.setDailyChallenges(nextChallenges);
    actions.updateChallengeProgress({});
    actions.addNotification({
      message: `Refreshed daily operations for ${REFRESH_COST} coins.`,
      type: 'info',
    });
    logDebugAction('daily_challenge_refresh', { dayKey, cost: REFRESH_COST });
  };

  const handleClaimWeeklyMilestone = (milestoneDays) => {
    if (weeklyOpsState.claimedTiers.includes(milestoneDays)) return;
    if (weeklyOpsState.completedDays.length < milestoneDays) return;
    const milestone = WEEKLY_MILESTONES.find((tier) => tier.days === milestoneDays);
    if (!milestone) return;

    actions.earnMoney(milestone.coins);
    actions.addXP(milestone.xp, { source: 'milestone', label: 'Challenge Milestone' });
    actions.updateChallengeProgress({
      ...(state.dailyChallengeProgress || {}),
      operationsWeek: {
        ...weeklyOpsState,
        claimedTiers: [...weeklyOpsState.claimedTiers, milestoneDays],
      },
    });
    actions.addNotification({
      message: `Weekly milestone claimed! +${milestone.coins} coins +${milestone.xp} XP`,
      type: 'success',
    });
    logDebugAction('weekly_ops_milestone_claim', { milestoneDays, weekKey });
  };

  const resetMs = useMemo(() => {
    const base = Number(state.lastChallengeReset || Date.now());
    return Math.max(0, base + 24 * 60 * 60 * 1000 - Date.now());
  }, [state.lastChallengeReset, tick]);
  const isUrgent = resetMs < 60 * 60 * 1000;
  const hoursLeft = Math.floor(resetMs / (60 * 60 * 1000));
  const minsLeft = Math.floor((resetMs % (60 * 60 * 1000)) / (60 * 1000));

  return (
    <div className="space-y-5">
      <TabHero
        icon="🎯"
        tone="amber"
        title="Daily Operations"
        description="Rotating goals that reward planning, growth, and consistency."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            🔥 Streak: {state.challengeStreak || 0}
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Resets In"
            value={
              <span className={`inline-flex items-center gap-1 ${isUrgent ? 'animate-urgency-pulse' : ''}`}>
                <Clock className="w-3.5 h-3.5" />
                {hoursLeft}h {minsLeft}m
              </span>
            }
            hint="Daily board refresh"
            icon={<Clock className="w-4 h-4" />}
          />
          <MetricTile
            tone="emerald"
            label="Reward Boost"
            value={`+${Math.round((streakMultiplier - 1) * 100)}%`}
            hint="Streak multiplier"
            icon="🔥"
          />
          <div className="flex items-center justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={!canRefresh}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Refresh ({REFRESH_COST}🪙)
            </Button>
          </div>
        </div>
      </TabHero>

      <TabSection title="Daily Operations" description="Claim rewards as you finish each goal." tone="amber">
        {challengesWithProgress.length === 0 ? (
          <TabEmptyState icon="🎯" tone="amber" title="Generating daily operations..." description="The board refreshes automatically when ready." />
        ) : allClaimed ? (
          <TabEmptyState icon={<Trophy className="w-6 h-6" />} tone="amber" title="All challenges completed!" description="Come back tomorrow for a fresh set of operations." />
        ) : (
          <div className="space-y-4">
            {challengesWithProgress.map((challenge) => {
              const styles = getDifficultyStyles(challenge.difficulty);
              const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
              const diffColor = challenge.difficulty === 'hard' ? 'red' : challenge.difficulty === 'medium' ? 'amber' : 'emerald';
              const diffLabel = challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1);

              return (
                <Card
                  key={challenge.id}
                  className={`relative p-4 transition-all duration-200 ${
                    challenge.claimed
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : `${styles.panel} ${styles.border}`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      <CircularProgress
                        value={progressPercent}
                        size={60}
                        strokeWidth={5}
                        color={diffColor}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xl">{challenge.emoji}</span>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {challenge.name}
                        </h4>
                        <Badge className={`text-[10px] px-2 py-0.5 ${styles.badge} text-white`}>
                          {diffLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                        {challenge.description}
                      </p>
                      {!challenge.claimed && (
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                          <span>Progress: {challenge.progress}/{challenge.target}</span>
                          <span className="inline-flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-500" />
                            {Math.floor((challenge.reward?.coins || 0) * streakMultiplier)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {Math.floor((challenge.reward?.xp || 0) * streakMultiplier)} XP
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {challenge.claimed ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-semibold">Claimed</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleClaim(challenge.id)}
                          disabled={!challenge.completed}
                          className="min-h-[36px] text-xs"
                          variant={challenge.completed ? 'success' : 'secondary'}
                        >
                          {challenge.completed ? 'Claim' : 'In Progress'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabSection>

      <TabSection title="Progress Snapshot" description="Category coverage and completion depth." tone="sky">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-white rounded-2xl text-center shadow-sm dark:bg-slate-800">
            <div className="font-bold text-emerald-700 text-lg">{claimedCount}/{challengesWithProgress.length}</div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Claimed Today</div>
          </div>
          <div className="p-3 bg-white rounded-2xl text-center shadow-sm dark:bg-slate-800">
            <div className="font-bold text-orange-700 text-lg">{state.challengeStreak || 0}</div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Current Streak</div>
          </div>
        </div>
      </TabSection>

      <TabSection title="Weekly Operations Milestones" description="Clear all daily operations on multiple days this week to unlock milestone rewards." tone="emerald">
        <div className="relative px-2 pt-6 pb-2">
          <div className="relative h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
            <div
              className="absolute top-0 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyOpsState.completedDays.length / 6) * 100)}%` }}
            />
          </div>
          <div className="relative flex justify-between -mt-3.5">
            {WEEKLY_MILESTONES.map((milestone) => {
              const reached = weeklyOpsState.completedDays.length >= milestone.days;
              const claimed = weeklyOpsState.claimedTiers.includes(milestone.days);
              return (
                <div key={milestone.days} className="flex flex-col items-center gap-2 w-20">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all ${
                      claimed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : reached
                        ? 'bg-white border-emerald-500 text-emerald-600 dark:bg-slate-800'
                        : 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-700 dark:border-slate-600'
                    }`}
                  >
                    {claimed ? <Check className="w-3 h-3" /> : `${milestone.days}d`}
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{milestone.days} Days</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">+{milestone.coins}🪙 +{milestone.xp} XP</div>
                  </div>
                  {!claimed && reached && (
                    <Button size="sm" variant="success" className="h-6 text-[10px] px-2" onClick={() => handleClaimWeeklyMilestone(milestone.days)}>
                      Claim
                    </Button>
                  )}
                  {claimed && <Badge variant="success" className="text-[10px]">Claimed</Badge>}
                </div>
              );
            })}
          </div>
        </div>
      </TabSection>
    </div>
  );
});

ChallengesTab.displayName = 'ChallengesTab';
export default ChallengesTab;
