import React, { memo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Target, Flame, Calendar, Trophy } from 'lucide-react';
import { generateDailyQuests, shouldResetDaily, getStreakBonus } from '../../systems/QuestSystem';
import { logDebugAction } from '../../../../utils/debugTools';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

/**
 * Daily Quests Tab - Provides daily goals and rewards
 */
const DailyQuestsTab = memo(() => {
  const { state, actions } = useGame();

  // Initialize or reset daily quests
  useEffect(() => {
    // Check if quests need to be reset
    if (!state.dailyQuests || shouldResetDaily(state.dailyQuests?.lastResetTime)) {
      const newQuests = generateDailyQuests(state.level, Date.now());
      const streakReset =
        !state.dailyQuests?.lastResetTime || shouldResetDaily(state.dailyQuests?.lastResetTime);
      const resetTime = Date.now();

      actions.updateDailyQuests({
        quests: newQuests,
        lastResetTime: resetTime,
        streak: streakReset ? state.dailyQuests?.streak || 0 : 0,
        totalCompleted: state.dailyQuests?.totalCompleted || 0,
      });
      logDebugAction('daily_quests_reset', { timestamp: resetTime });
    }
  }, [state.level, state.dailyQuests, actions]);

  const quests = state.dailyQuests?.quests || [];
  const streak = state.dailyQuests?.streak || 0;
  const totalCompleted = state.dailyQuests?.totalCompleted || 0;
  const streakBonus = getStreakBonus(streak);

  // Calculate time until reset
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleClaimReward = (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    const reward = Math.floor(quest.reward * streakBonus);

    // Grant reward
    actions.earnMoney(reward);
    actions.addXP(Math.floor(reward * 0.5), { source: 'daily_reward', label: 'Daily Quest' });

    // Mark as claimed
    const updatedQuests = quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q));

    actions.updateDailyQuests({
      ...state.dailyQuests,
      quests: updatedQuests,
      totalCompleted: totalCompleted + 1,
      streak: streak + (updatedQuests.every((q) => q.claimed) ? 1 : 0), // Increment streak if all claimed
    });
    logDebugAction('daily_quest_claim', { questId });

    // Particle effect
    if (typeof window.triggerParticleEffect === 'function') {
      const button = document.querySelector(`[data-quest-id="${questId}"]`);
      if (button) {
        const rect = button.getBoundingClientRect();
        window.triggerParticleEffect(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          'harvest'
        );
      }
    }

    actions.addNotification({
      message: `🎉 Quest Complete! +${reward}🪙 ${streakBonus > 1 ? `(${Math.round((streakBonus - 1) * 100)}% streak bonus!)` : ''}`,
      type: 'success',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'hard':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const allQuestsCompleted = quests.length > 0 && quests.every((q) => q.claimed);

  return (
    <div className="space-y-4">
      <TabHero
        icon={<Target className="w-5 h-5" />}
        tone="violet"
        title="Daily Quests"
        description="Complete today’s goals, keep the streak alive, and bank the bonus."
        badge={
          <Badge variant="outline" className="bg-white/80 text-violet-700 border-violet-200">
            {quests.length} queued
          </Badge>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Day Streak"
            value={streak}
            hint="Consecutive completions"
            icon={<Flame className="w-4 h-4" />}
          />
          <MetricTile
            tone="violet"
            label="Resets In"
            value={getTimeUntilReset()}
            hint="Daily quest refresh"
            icon={<Calendar className="w-4 h-4" />}
          />
          <MetricTile
            tone="emerald"
            label="Total Complete"
            value={totalCompleted}
            hint="All-time claims"
            icon={<Trophy className="w-4 h-4" />}
          />
        </div>
      </TabHero>

      {/* Streak Bonus Info */}
      {streakBonus > 1 && (
        <Card className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <div className="font-semibold text-orange-800">
                🔥 {streak}-Day Streak! +{Math.round((streakBonus - 1) * 100)}% Bonus Rewards
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {streak >= 30
                  ? '🏆 Maximum streak bonus!'
                  : streak >= 14
                    ? `${30 - streak} days until max bonus!`
                    : streak >= 7
                      ? `${14 - streak} days until +75% bonus!`
                      : `${7 - streak} days until +50% bonus!`}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* All Quests Complete */}
      {allQuestsCompleted && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-center shadow-sm animate-fade-in">
          <div className="text-5xl mb-3">🎉</div>
          <div className="text-xl font-bold text-green-800 mb-2">All Daily Quests Complete!</div>
          <div className="text-sm text-green-600">Come back tomorrow for new challenges! 🌟</div>
        </Card>
      )}

      <TabSection
        title="Today's Quests"
        description="Claim rewards as you finish each daily goal."
        tone="violet"
      >
        {quests.length === 0 ? (
          <TabEmptyState
            icon={<Target className="w-5 h-5" />}
            tone="violet"
            title="Generating today’s quests"
            description="The board refreshes automatically when ready."
          />
        ) : (
          <div className="space-y-3">
            {quests.map((quest) => {
              const progressPercent = (quest.progress / quest.target) * 100;
              const finalReward = Math.floor(quest.reward * streakBonus);

              return (
                <Card
                  key={quest.id}
                  className={`p-4 border-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
                    quest.claimed
                      ? 'bg-gray-50 border-gray-300 opacity-60'
                      : quest.completed
                        ? 'bg-green-50 border-green-400 shadow-lg'
                        : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {quest.type === 'harvest'
                            ? '🌾'
                            : quest.type === 'plant'
                              ? '🌱'
                              : quest.type === 'earn'
                                ? '💰'
                                : quest.type === 'spend'
                                  ? '🛒'
                                  : quest.type === 'build'
                                    ? '🏗️'
                                    : quest.type === 'level'
                                      ? '⭐'
                                      : quest.type === 'weather'
                                        ? '🌤️'
                                        : '🎯'}
                        </span>
                        <span className="font-medium text-gray-800">
                          {quest.description
                            .replace('{count}', quest.target)
                            .replace('{crop}', 'special')}
                        </span>
                      </div>
                      <Badge className={`${getDifficultyColor(quest.difficulty)} text-xs`}>
                        {quest.difficulty}
                      </Badge>
                    </div>

                    {!quest.claimed && (
                      <div className="text-right ml-3">
                        <div className="font-bold text-yellow-600">{finalReward}🪙</div>
                        <div className="text-xs text-gray-500">
                          +{Math.floor(finalReward * 0.5)} XP
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!quest.claimed && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {quest.progress} / {quest.target}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    {quest.claimed ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <Badge className="bg-green-600">✓ Claimed</Badge>
                      </div>
                    ) : quest.completed ? (
                      <Button
                        data-quest-id={quest.id}
                        onClick={() => handleClaimReward(quest.id)}
                        className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
                      >
                        🎁 Claim Reward
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500 italic">In progress...</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabSection>

      {/* Streak Milestones */}
      <TabSection
        title="Streak Milestones"
        description="The more consecutive days you finish, the better the rewards."
        tone="amber"
      >
        <div className="space-y-2 text-sm">
          <div className={`flex justify-between p-2 rounded ${streak >= 3 ? 'bg-green-100' : ''}`}>
            <span>3 Days</span>
            <span className="font-semibold">+25% Rewards {streak >= 3 && '✓'}</span>
          </div>
          <div className={`flex justify-between p-2 rounded ${streak >= 7 ? 'bg-green-100' : ''}`}>
            <span>7 Days</span>
            <span className="font-semibold">+50% Rewards {streak >= 7 && '✓'}</span>
          </div>
          <div className={`flex justify-between p-2 rounded ${streak >= 14 ? 'bg-green-100' : ''}`}>
            <span>14 Days</span>
            <span className="font-semibold">+75% Rewards {streak >= 14 && '✓'}</span>
          </div>
          <div
            className={`flex justify-between p-2 rounded ${streak >= 30 ? 'bg-yellow-100 border-2 border-yellow-500' : ''}`}
          >
            <span>30 Days 🏆</span>
            <span className="font-semibold">+100% Rewards {streak >= 30 && '✓'}</span>
          </div>
        </div>
      </TabSection>

      {/* Tips */}
      <TabSection
        title="Quest Tips"
        description="Quick reminders for keeping the streak alive."
        tone="sky"
      >
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Complete all quests each day to build your streak!</li>
          <li>Longer streaks = bigger rewards!</li>
          <li>Quests reset daily at midnight</li>
          <li>Quest difficulty scales with your level</li>
        </ul>
      </TabSection>
    </div>
  );
});

DailyQuestsTab.displayName = 'DailyQuestsTab';
export default DailyQuestsTab;
