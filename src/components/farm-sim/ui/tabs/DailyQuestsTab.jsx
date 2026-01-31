import React, { memo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Target, Gift, Flame, Calendar, Trophy } from 'lucide-react';
import { generateDailyQuests, generateWeeklyContracts, shouldResetDaily, shouldResetWeekly, getStreakBonus } from '../../systems/QuestSystem';

/**
 * Daily Quests Tab - Provides daily goals and rewards
 */
const DailyQuestsTab = memo(() => {
  const { state, actions } = useGame();

  // Initialize or reset daily quests + weekly contracts
  useEffect(() => {
    // Check if quests need to be reset
    if (!state.dailyQuests || shouldResetDaily(state.dailyQuests?.lastResetTime)) {
      const newQuests = generateDailyQuests(state.level, Date.now());
      const streakReset = !state.dailyQuests?.lastResetTime || shouldResetDaily(state.dailyQuests?.lastResetTime);

      actions.updateDailyQuests({
        quests: newQuests,
        lastResetTime: Date.now(),
        streak: streakReset ? (state.dailyQuests?.streak || 0) : 0,
        totalCompleted: state.dailyQuests?.totalCompleted || 0,
      });
    }

    if (!state.weeklyContracts || shouldResetWeekly(state.weeklyContracts?.lastResetTime)) {
      const newContracts = generateWeeklyContracts(state.level, Date.now());
      actions.updateWeeklyContracts({
        quests: newContracts,
        lastResetTime: Date.now(),
        totalCompleted: state.weeklyContracts?.totalCompleted || 0,
      });
    }
  }, [state.level, state.dailyQuests, state.weeklyContracts, actions]);

  const quests = state.dailyQuests?.quests || [];
  const streak = state.dailyQuests?.streak || 0;
  const totalCompleted = state.dailyQuests?.totalCompleted || 0;
  const streakBonus = getStreakBonus(streak);
  const weeklyContracts = state.weeklyContracts?.quests || [];
  const weeklyCompleted = state.weeklyContracts?.totalCompleted || 0;

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

  const getTimeUntilWeeklyReset = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    const day = nextMonday.getDay();
    const diff = (8 - day) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + diff);
    nextMonday.setHours(0, 0, 0, 0);

    const diffMs = nextMonday - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  const handleClaimReward = (questId, cadence = 'daily') => {
    const isDaily = cadence === 'daily';
    const activeQuests = isDaily ? quests : weeklyContracts;
    const quest = activeQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    const bonusMultiplier = isDaily ? streakBonus : 1;
    const reward = Math.floor(quest.reward * bonusMultiplier);

    // Grant reward
    actions.setCoins(state.coins + reward);
    actions.grantXP(Math.floor(reward * 0.5), 'quest_complete', { questId, reward });
    const repGain = isDaily ? 2 : 5;
    actions.grantReputation?.(repGain, isDaily ? 'daily_quest' : 'weekly_contract');

    // Mark as claimed
    const updatedQuests = activeQuests.map(q =>
      q.id === questId ? { ...q, claimed: true } : q
    );

    if (isDaily) {
      actions.updateDailyQuests({
        ...state.dailyQuests,
        quests: updatedQuests,
        totalCompleted: totalCompleted + 1,
        streak: streak + (updatedQuests.every(q => q.claimed) ? 1 : 0), // Increment streak if all claimed
      });
    } else {
      actions.updateWeeklyContracts({
        ...state.weeklyContracts,
        quests: updatedQuests,
        totalCompleted: weeklyCompleted + 1,
      });
    }

    // Particle effect
    if (typeof window.triggerParticleEffect === 'function') {
      const button = document.querySelector(`[data-quest-id="${questId}"]`);
      if (button) {
        const rect = button.getBoundingClientRect();
        window.triggerParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'harvest');
      }
    }

    actions.addNotification({
      message: `🎉 ${isDaily ? 'Quest' : 'Contract'} Complete! +${reward}🪙 +${repGain}⭐ ${bonusMultiplier > 1 ? `(${Math.round((bonusMultiplier - 1) * 100)}% streak bonus!)` : ''}`,
      type: 'success',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const allQuestsCompleted = quests.length > 0 && quests.every(q => q.claimed);
  const allWeeklyCompleted = weeklyContracts.length > 0 && weeklyContracts.every(q => q.claimed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden relative shadow-lg">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-9xl pointer-events-none">🎯</div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">🎯</span> Daily Quests
            </h3>
            <p className="text-indigo-100 mt-2 max-w-xs">Complete daily tasks to maintain your streak and earn huge bonuses!</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Streak Counter */}
            <div className={`
                 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-2
                 ${streak > 0 ? 'bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-black/20'}
             `}>
              <div className={`relative ${streak > 0 ? 'animate-bounce-slow' : ''}`}>
                <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-400 fill-orange-400 drop-shadow-lg' : 'text-gray-400'}`} />
                {streak > 5 && <div className="absolute inset-0 animate-ping opacity-50 text-orange-400"><Flame className="w-6 h-6 fill-current" /></div>}
              </div>
              <div className="text-right">
                <div className="text-lg font-black leading-none">{streak}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-white/70">Streak</div>
              </div>
            </div>

            <div className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-white/60 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Resets in {getTimeUntilReset()}
            </div>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="mt-6 bg-black/20 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">{totalCompleted} quests completed total</span>
          </div>
          {streakBonus > 1 && (
            <Badge className="bg-orange-500 text-white border-0 animate-pulse">
              🔥 {Math.round((streakBonus - 1) * 100)}% Bonus Active
            </Badge>
          )}
        </div>
      </Card>

      {/* Streak Bonus Info */}
      {streakBonus > 1 && (
        <Card className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border-orange-300">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <div className="font-semibold text-orange-800">
                🔥 {streak}-Day Streak! +{Math.round((streakBonus - 1) * 100)}% Bonus Rewards
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {streak >= 30 ? '🏆 Maximum streak bonus!' :
                  streak >= 14 ? `${30 - streak} days until max bonus!` :
                    streak >= 7 ? `${14 - streak} days until +75% bonus!` :
                      `${7 - streak} days until +50% bonus!`}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* All Quests Complete */}
      {allQuestsCompleted && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <div className="text-xl font-bold text-green-800 mb-2">
            All Daily Quests Complete!
          </div>
          <div className="text-sm text-green-600">
            Come back tomorrow for new challenges! 🌟
          </div>
        </Card>
      )}

      {/* Quest List */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Today's Quests
        </h4>

        {quests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Generating today's quests...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quests.map((quest) => {
              const progressPercent = (quest.progress / quest.target) * 100;
              const finalReward = Math.floor(quest.reward * streakBonus);

              return (
                <Card
                  key={quest.id}
                  className={`p-4 border-2 transition-all ${quest.claimed
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
                          {quest.type === 'harvest' ? '🌾' :
                            quest.type === 'plant' ? '🌱' :
                              quest.type === 'earn' ? '💰' :
                                quest.type === 'spend' ? '🛒' :
                                  quest.type === 'build' ? '🏗️' :
                                    quest.type === 'level' ? '⭐' :
                                      quest.type === 'weather' ? '🌤️' : '🎯'}
                        </span>
                        <span className="font-medium text-gray-800">
                          {quest.description.replace('{count}', quest.target).replace('{crop}', 'special')}
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
                        <span>{quest.progress} / {quest.target}</span>
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
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        🎁 Claim Reward
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        In progress...
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Weekly Contracts */}
      <Card className="p-4 border-2 border-indigo-200 bg-indigo-50/60">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2 text-indigo-900">
            <Trophy className="w-4 h-4" />
            Weekly Contracts
          </h4>
          <div className="text-xs font-mono bg-white/70 px-2 py-1 rounded text-indigo-700 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Resets in {getTimeUntilWeeklyReset()}
          </div>
        </div>

        <div className="text-xs text-indigo-700 mb-3">
          {weeklyCompleted} contracts completed total · Bigger rewards, slower cadence
        </div>

        {weeklyContracts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Generating weekly contracts...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyContracts.map((quest) => {
              const progressPercent = (quest.progress / quest.target) * 100;
              const finalReward = Math.floor(quest.reward);

              return (
                <Card
                  key={quest.id}
                  className={`p-4 border-2 transition-all ${quest.claimed
                    ? 'bg-gray-50 border-gray-300 opacity-60'
                    : quest.completed
                      ? 'bg-emerald-50 border-emerald-400 shadow-lg'
                      : 'border-indigo-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {quest.type === 'harvest' ? '🌾' :
                            quest.type === 'plant' ? '🌱' :
                              quest.type === 'earn' ? '💰' :
                                quest.type === 'spend' ? '🛒' :
                                  quest.type === 'build' ? '🏗️' :
                                    quest.type === 'level' ? '⭐' :
                                      quest.type === 'weather' ? '🌦️' : '🎯'}
                        </span>
                        <span className="font-medium text-gray-800">
                          {quest.description.replace('{count}', quest.target).replace('{crop}', 'premium')}
                        </span>
                      </div>
                      <Badge className={`${getDifficultyColor(quest.difficulty)} text-xs`}>
                        {quest.difficulty}
                      </Badge>
                    </div>

                    {!quest.claimed && (
                      <div className="text-right ml-3">
                        <div className="font-bold text-yellow-700">{finalReward}🪙</div>
                        <div className="text-xs text-gray-500">
                          +{Math.floor(finalReward * 0.5)} XP
                        </div>
                      </div>
                    )}
                  </div>

                  {!quest.claimed && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{quest.progress} / {quest.target}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {quest.claimed ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <Badge className="bg-green-600">✓ Claimed</Badge>
                      </div>
                    ) : quest.completed ? (
                      <Button
                        data-quest-id={quest.id}
                        onClick={() => handleClaimReward(quest.id, 'weekly')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        🎁 Claim Contract
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        In progress...
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {allWeeklyCompleted && (
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-400 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg font-bold text-emerald-800 mb-1">
            Weekly Contracts Complete!
          </div>
          <div className="text-sm text-emerald-700">
            New contracts arrive every Monday. Keep the farm humming!
          </div>
        </Card>
      )}

      {/* Streak Milestones */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">🔥 Streak Milestones</h4>
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
          <div className={`flex justify-between p-2 rounded ${streak >= 30 ? 'bg-gold-100 border-2 border-yellow-500' : ''}`}>
            <span>30 Days 🏆</span>
            <span className="font-semibold">+100% Rewards {streak >= 30 && '✓'}</span>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-800">💡 Quest Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Complete all quests each day to build your streak!</li>
          <li>Longer streaks = bigger rewards!</li>
          <li>Quests reset daily at midnight</li>
          <li>Weekly contracts reset every Monday for bigger payouts</li>
          <li>Quest difficulty scales with your level</li>
        </ul>
      </Card>
    </div>
  );
});

DailyQuestsTab.displayName = 'DailyQuestsTab';
export default DailyQuestsTab;
