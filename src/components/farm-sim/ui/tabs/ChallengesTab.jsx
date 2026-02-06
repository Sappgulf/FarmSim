import React, { memo, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { useTick } from '../../context/TickContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { getDayKey } from '../../../../systems/almanac';
import { getWeekKey } from '../../../../utils/retention';
import {
  buildDailyOperations,
  getDailyOperationProgress,
  getResetCountdownLabel,
} from '../../../../utils/challengesBoard';
import { logDebugAction } from '../../../../utils/debugTools';

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
  useTick();

  const dayKey = getDayKey();
  const weekKey = getWeekKey();
  const dailyChallenges = Array.isArray(state.dailyChallenges) ? state.dailyChallenges : [];
  const challengeSetDayKey = dailyChallenges[0]?.dayKey || null;
  const streakMultiplier = getStreakRewardMultiplier(state.challengeStreak || 0);

  const weeklyOpsState = useMemo(() => {
    const raw = state.dailyChallengeProgress?.operationsWeek;
    if (!raw || raw.weekKey !== weekKey) {
      return {
        weekKey,
        completedDays: [],
        claimedTiers: [],
      };
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
    if (!shouldRebuild) {
      return;
    }

    const nextChallenges = buildDailyOperations(state.level, dayKey);
    actions.setDailyChallenges(nextChallenges);
    actions.updateLastChallengeReset(Date.now());

    logDebugAction('daily_challenge_reset', {
      dayKey,
      count: nextChallenges.length,
    });
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
    if (!targetChallenge || targetChallenge.claimed || !targetChallenge.completed) {
      return;
    }

    const allClaimedBefore = dailyChallenges.length > 0 && dailyChallenges.every((challenge) => challenge.claimed);
    const updatedChallenges = dailyChallenges.map((challenge) => (
      challenge.id === challengeId
        ? { ...challenge, claimed: true, completed: true }
        : challenge
    ));
    const allClaimedAfter = updatedChallenges.length > 0 && updatedChallenges.every((challenge) => challenge.claimed);

    const rewardCoins = Math.floor((targetChallenge.reward?.coins || 0) * streakMultiplier);
    const rewardXp = Math.floor((targetChallenge.reward?.xp || 0) * streakMultiplier);

    actions.setDailyChallenges(updatedChallenges);
    actions.setCoins((coins) => coins + rewardCoins);
    actions.setXp((xp) => xp + rewardXp);

    if (!allClaimedBefore && allClaimedAfter) {
      actions.updateChallengeStreak((state.challengeStreak || 0) + 1);
      const nextWeeklyState = weeklyOpsState.weekKey === weekKey
        ? weeklyOpsState
        : { weekKey, completedDays: [], claimedTiers: [] };
      const completedDays = nextWeeklyState.completedDays.includes(dayKey)
        ? nextWeeklyState.completedDays
        : [...nextWeeklyState.completedDays, dayKey];
      actions.updateChallengeProgress({
        ...(state.dailyChallengeProgress || {}),
        operationsWeek: {
          ...nextWeeklyState,
          completedDays,
        },
      });
    }

    actions.addNotification({
      message: `Challenge cleared! +${rewardCoins}🪙 +${rewardXp} XP${streakMultiplier > 1 ? ` (${Math.round((streakMultiplier - 1) * 100)}% streak boost)` : ''}`,
      type: 'success',
    });

    logDebugAction('daily_challenge_claim', {
      challengeId,
      allClaimedAfter,
      streak: state.challengeStreak,
    });
  };

  const handleRefresh = () => {
    if (!canRefresh) {
      return;
    }

    const nextChallenges = buildDailyOperations(state.level, dayKey).map((challenge) => ({
      ...challenge,
      rerolledToday: true,
    }));

    actions.setCoins((coins) => Math.max(0, coins - REFRESH_COST));
    actions.setDailyChallenges(nextChallenges);
    actions.updateChallengeProgress({});

    actions.addNotification({
      message: `Refreshed daily operations for ${REFRESH_COST}🪙.`,
      type: 'info',
    });

    logDebugAction('daily_challenge_refresh', {
      dayKey,
      cost: REFRESH_COST,
    });
  };

  const handleClaimWeeklyMilestone = (milestoneDays) => {
    if (weeklyOpsState.claimedTiers.includes(milestoneDays)) {
      return;
    }
    if (weeklyOpsState.completedDays.length < milestoneDays) {
      return;
    }
    const milestone = WEEKLY_MILESTONES.find((tier) => tier.days === milestoneDays);
    if (!milestone) {
      return;
    }

    actions.setCoins((coins) => coins + milestone.coins);
    actions.setXp((xp) => xp + milestone.xp);
    actions.updateChallengeProgress({
      ...(state.dailyChallengeProgress || {}),
      operationsWeek: {
        ...weeklyOpsState,
        claimedTiers: [...weeklyOpsState.claimedTiers, milestoneDays],
      },
    });
    actions.addNotification({
      message: `Weekly milestone claimed! +${milestone.coins}🪙 +${milestone.xp} XP`,
      type: 'success',
    });
    logDebugAction('weekly_ops_milestone_claim', {
      milestoneDays,
      weekKey,
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-orange-800">🎯 Daily Operations</h3>
            <p className="text-sm text-orange-700">Rotating goals that reward planning, growth, and consistency.</p>
          </div>
          <Badge variant="outline" className="bg-white text-orange-700">
            🔥 Streak: {state.challengeStreak || 0}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
          <span>Resets in: {getResetCountdownLabel(state.lastChallengeReset || Date.now())}</span>
          <span className="font-medium text-orange-700">
            Reward Boost: +{Math.round((streakMultiplier - 1) * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={!canRefresh}
            className="min-h-[38px]"
          >
            Refresh ({REFRESH_COST}🪙)
          </Button>
        </div>
      </Card>

      {challengesWithProgress.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-600">Generating daily operations...</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {challengesWithProgress.map((challenge) => {
            const styles = getDifficultyStyles(challenge.difficulty);
            const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));

            return (
              <Card
                key={challenge.id}
                className={`p-4 border ${challenge.claimed ? 'bg-gray-50 border-gray-200 opacity-70' : `${styles.panel} ${styles.border}`}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{challenge.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                      <p className="text-sm text-gray-700">{challenge.description}</p>
                    </div>
                  </div>

                  <Badge className={`${styles.badge} text-white`}>{challenge.difficulty}</Badge>
                </div>

                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress: {challenge.progress}/{challenge.target}</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="mb-3" />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-gray-700">
                    Reward: +{challenge.reward?.coins || 0}🪙 +{challenge.reward?.xp || 0} XP
                  </div>

                  {challenge.claimed ? (
                    <Badge className="bg-emerald-600">✓ Claimed</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(challenge.id)}
                      disabled={!challenge.completed}
                    >
                      {challenge.completed ? 'Claim Reward' : 'In Progress'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">📊 Progress Snapshot</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-white rounded text-center">
            <div className="font-bold text-emerald-700">{claimedCount}/{challengesWithProgress.length}</div>
            <div className="text-gray-600">Claimed Today</div>
          </div>
          <div className="p-2 bg-white rounded text-center">
            <div className="font-bold text-orange-700">{state.challengeStreak || 0}</div>
            <div className="text-gray-600">Current Streak</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h4 className="font-semibold mb-2 text-indigo-800">🗓️ Weekly Operations Milestones</h4>
        <p className="text-xs text-indigo-700 mb-3">
          Clear all daily operations on multiple days this week to unlock milestone rewards.
        </p>
        <div className="space-y-2">
          {WEEKLY_MILESTONES.map((milestone) => {
            const reached = weeklyOpsState.completedDays.length >= milestone.days;
            const claimed = weeklyOpsState.claimedTiers.includes(milestone.days);
            return (
              <div key={milestone.days} className="p-3 rounded-lg bg-white border border-indigo-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm text-indigo-900">
                      {milestone.days} completion days this week
                    </div>
                    <div className="text-xs text-indigo-700">
                      Reward: +{milestone.coins}🪙 +{milestone.xp} XP
                    </div>
                  </div>
                  {claimed ? (
                    <Badge className="bg-emerald-600">Claimed</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClaimWeeklyMilestone(milestone.days)}
                      disabled={!reached}
                    >
                      {reached ? 'Claim' : `${weeklyOpsState.completedDays.length}/${milestone.days}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
});

ChallengesTab.displayName = 'ChallengesTab';

export default ChallengesTab;
