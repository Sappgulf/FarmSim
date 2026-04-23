import React, { memo, useEffect, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { CircularProgress } from '../../../ui/circular-progress';
import { Target, Flame, Calendar, Trophy, Check, Coins, Star, Clock } from 'lucide-react';
import { generateDailyQuests, shouldResetDaily, getStreakBonus } from '../../systems/QuestSystem';
import { logDebugAction } from '../../../../utils/debugTools';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

const DailyQuestsTab = memo(() => {
  const { state, actions } = useGame();
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (!state.dailyQuests || shouldResetDaily(state.dailyQuests?.lastResetTime)) {
      const newQuests = generateDailyQuests(state.level, Date.now());
      const streakReset = !state.dailyQuests?.lastResetTime || shouldResetDaily(state.dailyQuests?.lastResetTime);
      const resetTime = Date.now();
      actions.updateDailyQuests({
        quests: newQuests,
        lastResetTime: resetTime,
        streak: streakReset ? (state.dailyQuests?.streak || 0) : 0,
        totalCompleted: state.dailyQuests?.totalCompleted || 0,
      });
      logDebugAction('daily_quests_reset', { timestamp: resetTime });
    }
  }, [state.level, state.dailyQuests, actions]);

  const quests = state.dailyQuests?.quests || [];
  const streak = state.dailyQuests?.streak || 0;
  const totalCompleted = state.dailyQuests?.totalCompleted || 0;
  const streakBonus = getStreakBonus(streak);

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
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;
    const reward = Math.floor(quest.reward * streakBonus);
    actions.earnMoney(reward);
    actions.addXP(Math.floor(reward * 0.5), { source: 'daily_reward', label: 'Daily Quest' });
    const updatedQuests = quests.map(q =>
      q.id === questId ? { ...q, claimed: true } : q
    );
    actions.updateDailyQuests({
      ...state.dailyQuests,
      quests: updatedQuests,
      totalCompleted: totalCompleted + 1,
      streak: streak + (updatedQuests.every(q => q.claimed) ? 1 : 0),
    });
    logDebugAction('daily_quest_claim', { questId });
    if (typeof window.triggerParticleEffect === 'function') {
      const button = document.querySelector(`[data-quest-id="${questId}"]`);
      if (button) {
        const rect = button.getBoundingClientRect();
        window.triggerParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'harvest');
      }
    }
    actions.addNotification({
      message: `Quest Complete! +${reward} coins ${streakBonus > 1 ? `(${Math.round((streakBonus - 1) * 100)}% streak bonus!)` : ''}`,
      type: 'success',
    });
  };

  const getQuestCategory = (type) => {
    switch (type) {
      case 'harvest':
      case 'plant':
      case 'weather':
        return 'Farming';
      case 'earn':
      case 'spend':
        return 'Economy';
      case 'build':
      case 'level':
        return 'Social';
      default:
        return 'Social';
    }
  };

  const categories = ['All', 'Farming', 'Economy', 'Social'];

  const filteredQuests = useMemo(() => {
    if (activeCategory === 'All') return quests;
    return quests.filter((q) => getQuestCategory(q.type) === activeCategory);
  }, [quests, activeCategory]);

  const allQuestsCompleted = quests.length > 0 && quests.every(q => q.claimed);

  const streakMilestones = [3, 7, 14, 30];
  const nextMilestone = streakMilestones.find(m => streak < m) || 30;
  const prevMilestone = streakMilestones[streakMilestones.indexOf(nextMilestone) - 1] || 0;
  const streakProgress = nextMilestone === 30 && streak >= 30
    ? 100
    : ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  const categoryAccent = {
    Farming: 'bg-green-500',
    Economy: 'bg-amber-500',
    Social: 'bg-sky-500',
  };

  const categoryChip = {
    Farming: 'bg-green-100 text-green-700',
    Economy: 'bg-amber-100 text-amber-700',
    Social: 'bg-sky-100 text-sky-700',
  };

  return (
    <div className="space-y-5">
      <TabHero
        icon={<Target className="w-5 h-5" />}
        tone="violet"
        title="Daily Quests"
        description="Complete today’s goals, keep the streak alive, and bank the bonus."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-violet-700 border-violet-200">
            {quests.length} queued
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile tone="amber" label="Day Streak" value={streak} hint="Consecutive completions" icon={<Flame className="w-4 h-4" />} />
          <MetricTile tone="violet" label="Resets In" value={getTimeUntilReset()} hint="Daily quest refresh" icon={<Calendar className="w-4 h-4" />} />
          <MetricTile tone="emerald" label="Total Complete" value={totalCompleted} hint="All-time claims" icon={<Trophy className="w-4 h-4" />} />
        </div>
      </TabHero>

      <Card className="p-5 flex items-center gap-5 overflow-hidden">
        <div className="relative shrink-0">
          <CircularProgress value={streakProgress} size={84} strokeWidth={6} color="orange">
            <div className="flex flex-col items-center leading-none">
              <span className="text-xl animate-flame-pulse">🔥</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{streak}</span>
            </div>
          </CircularProgress>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {streak >= 30 ? 'Maximum Streak!' : `${nextMilestone}-Day Streak Goal`}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {streak >= 30 ? 'You’ve hit the top streak bonus. Incredible!' : `${nextMilestone - streak} days until the next milestone`}
          </div>
          {streakBonus > 1 && (
            <Badge variant="warning" className="mt-2 text-[10px]">
              +{Math.round((streakBonus - 1) * 100)}% Reward Bonus
            </Badge>
          )}
        </div>
        <div className="hidden sm:block text-right shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Resets In</div>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-end gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            {getTimeUntilReset()}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <TabSection title="Today's Quests" description="Claim rewards as you finish each daily goal." tone="violet">
        {quests.length === 0 ? (
          <TabEmptyState icon={<Target className="w-5 h-5" />} tone="violet" title="Generating today’s quests" description="The board refreshes automatically when ready." />
        ) : (
          <div className="space-y-4">
            {filteredQuests.map((quest) => {
              const progressPercent = (quest.progress / quest.target) * 100;
              const finalReward = Math.floor(quest.reward * streakBonus);
              const category = getQuestCategory(quest.type);
              const accent = categoryAccent[category] || 'bg-slate-500';
              const chip = categoryChip[category] || 'bg-slate-100 text-slate-700';
              const questIcon =
                quest.type === 'harvest' ? '🌾' :
                quest.type === 'plant' ? '🌱' :
                quest.type === 'earn' ? '💰' :
                quest.type === 'spend' ? '🛒' :
                quest.type === 'build' ? '🏗️' :
                quest.type === 'level' ? '⭐' :
                quest.type === 'weather' ? '🌤️' : '🎯';

              return (
                <Card
                  key={quest.id}
                  className={`relative overflow-hidden p-0 transition-all duration-200 ${
                    quest.claimed
                      ? 'bg-green-50/70 border-green-300 opacity-75'
                      : quest.completed
                      ? 'bg-green-50 border-green-400 shadow-md'
                      : 'bg-white border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent} rounded-l-[32px]`} />
                  <div className="flex items-center gap-4 p-4 pl-5">
                    <div className="shrink-0 flex flex-col items-center gap-1 w-10">
                      <span className="text-2xl leading-none">{questIcon}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${chip}`}>{category}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {quest.description.replace('{count}', quest.target).replace('{crop}', 'special')}
                      </div>
                      {!quest.claimed && (
                        <div className="mt-2.5">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>{quest.progress} / {quest.target}</span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2 min-w-[80px]">
                      {!quest.claimed && (
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-sm font-bold text-amber-600">
                            <Coins className="w-3.5 h-3.5" />
                            {finalReward}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
                            <Star className="w-3 h-3" />
                            +{Math.floor(finalReward * 0.5)} XP
                          </div>
                        </div>
                      )}
                      {quest.claimed ? (
                        <div className="flex items-center gap-1 text-green-700">
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-semibold">Done</span>
                        </div>
                      ) : quest.completed ? (
                        <Button
                          data-quest-id={quest.id}
                          onClick={() => handleClaimReward(quest.id)}
                          size="sm"
                          className="min-h-[36px] text-xs bg-green-600 hover:bg-green-700"
                        >
                          Claim
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">In Progress</Badge>
                      )}
                    </div>
                  </div>
                  {quest.claimed && (
                    <div className="absolute top-3 right-3 text-green-500/20 pointer-events-none">
                      <Check className="w-12 h-12" />
                    </div>
                  )}
                </Card>
              );
            })}

            {allQuestsCompleted && (
              <Card className="relative overflow-hidden p-6 text-center border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 animate-fade-in">
                <div className="absolute inset-0 chest-shimmer opacity-30 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-5xl mb-3 animate-bounce">🎁</div>
                  <div className="text-lg font-bold text-amber-900">Daily Bonus Unlocked!</div>
                  <div className="text-sm text-amber-700 mt-1">Every quest cleared — your streak grows stronger. See you tomorrow!</div>
                </div>
              </Card>
            )}
          </div>
        )}
      </TabSection>

      <TabSection title="Streak Milestones" description="The more consecutive days you finish, the better the rewards." tone="amber">
        <div className="space-y-2 text-sm">
          <div className={`flex justify-between p-2 rounded-xl ${streak >= 3 ? 'bg-green-100' : 'bg-white/60'}`}>
            <span className="font-medium">3 Days</span>
            <span className="font-semibold text-emerald-700">+25% Rewards {streak >= 3 && '✓'}</span>
          </div>
          <div className={`flex justify-between p-2 rounded-xl ${streak >= 7 ? 'bg-green-100' : 'bg-white/60'}`}>
            <span className="font-medium">7 Days</span>
            <span className="font-semibold text-emerald-700">+50% Rewards {streak >= 7 && '✓'}</span>
          </div>
          <div className={`flex justify-between p-2 rounded-xl ${streak >= 14 ? 'bg-green-100' : 'bg-white/60'}`}>
            <span className="font-medium">14 Days</span>
            <span className="font-semibold text-emerald-700">+75% Rewards {streak >= 14 && '✓'}</span>
          </div>
          <div className={`flex justify-between p-2 rounded-xl ${streak >= 30 ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-white/60'}`}>
            <span className="font-medium">30 Days 🏆</span>
            <span className="font-semibold text-emerald-700">+100% Rewards {streak >= 30 && '✓'}</span>
          </div>
        </div>
      </TabSection>

      <TabSection title="Quest Tips" description="Quick reminders for keeping the streak alive." tone="sky">
        <ul className="text-sm text-blue-700 space-y-1.5 list-disc list-inside dark:text-blue-300">
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
