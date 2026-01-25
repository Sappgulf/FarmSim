import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

// Daily challenge types from original system
const DAILY_CHALLENGE_TYPES = [
  {
    id: "harvest_master",
    name: "Harvest Master",
    description: "Harvest {target} crops",
    emoji: "🌾",
    generateTarget: () => Math.floor(Math.random() * 15) + 10, // 10-25 crops
    checkProgress: (progress, target) => progress.harvests >= target,
    reward: { coins: 50, xp: 25, items: { "fertilizer": 2 } }
  },
  {
    id: "coin_collector",
    name: "Coin Collector",
    description: "Earn {target} coins",
    emoji: "💰",
    generateTarget: () => Math.floor(Math.random() * 200) + 100, // 100-300 coins
    checkProgress: (progress, target) => progress.coinsEarned >= target,
    reward: { coins: 75, xp: 30, items: { "pesticide": 1 } }
  },
  {
    id: "speed_farmer",
    name: "Speed Farmer",
    description: "Plant {target} seeds in under 5 minutes",
    emoji: "⚡",
    generateTarget: () => Math.floor(Math.random() * 8) + 7, // 7-15 seeds
    checkProgress: (progress, target) => progress.planted >= target && progress.timeSpent <= 300,
    reward: { coins: 100, xp: 40, items: { "speed_fertilizer": 2 } }
  },
  {
    id: "pest_hunter",
    name: "Pest Hunter",
    description: "Eliminate {target} pests",
    emoji: "🐛",
    generateTarget: () => Math.floor(Math.random() * 5) + 3, // 3-8 pests
    checkProgress: (progress, target) => progress.pestsKilled >= target,
    reward: { coins: 60, xp: 35, items: { "super_pesticide": 1 } }
  },
  {
    id: "weather_warrior",
    name: "Weather Warrior",
    description: "Survive {target} weather events without crop loss",
    emoji: "🌪️",
    generateTarget: () => Math.floor(Math.random() * 3) + 2, // 2-5 events
    checkProgress: (progress, target) => progress.weatherSurvived >= target,
    reward: { coins: 125, xp: 50, items: { "weather_shield": 1 } }
  }
];

const ChallengesTab = memo(() => {
  const { state, actions } = useGame();

  // Ensure dailyChallenges exists
  const dailyChallenges = state.dailyChallenges || [];
  const challengeProgress = state.dailyChallengeProgress || {};
  const lastChallengeReset = state.lastChallengeReset || Date.now();

  // Generate daily challenges if none exist or if it's a new day
  useEffect(() => {
    const now = Date.now();
    const timeSinceReset = now - lastChallengeReset;
    const oneDay = 24 * 60 * 60 * 1000;

    // Generate new challenges if none exist or if it's been more than a day
    if (dailyChallenges.length === 0 || timeSinceReset > oneDay) {
      generateNewChallenges();
      if (actions.updateSettings) {
        actions.updateSettings({ lastChallengeReset: now });
      }
    }
  }, [lastChallengeReset, dailyChallenges.length]);

  const generateNewChallenges = () => {
    // Select 3 random challenges
    const shuffled = [...DAILY_CHALLENGE_TYPES].sort(() => 0.5 - Math.random());
    const selectedChallenges = shuffled.slice(0, 3).map(challenge => ({
      ...challenge,
      target: challenge.generateTarget(),
      description: challenge.description.replace('{target}', challenge.generateTarget()),
      completed: false
    }));

    actions.setDailyChallenges(selectedChallenges);
    actions.updateChallengeProgress({});
  };

  const handleCompleteChallenge = (challengeId) => {
    const challenge = dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    // Grant rewards
    actions.setCoins(state.coins + challenge.reward.coins);
    actions.grantXP(challenge.reward.xp, 'challenge_complete', { challengeId: challengeId });

    // Mark challenge as completed
    const updatedChallenges = dailyChallenges.map(c =>
      c.id === challengeId ? { ...c, completed: true } : c
    );
    actions.setDailyChallenges(updatedChallenges);

    // Update streak
    actions.updateSettings({ challengeStreak: state.challengeStreak + 1 });

    actions.addNotification({
      message: `Challenge completed! +${challenge.reward.coins}🪙 +${challenge.reward.xp} XP`,
      type: 'success'
    });
  };

  const getTimeUntilReset = () => {
    const now = Date.now();
    const lastReset = state.lastChallengeReset;
    const nextReset = lastReset + (24 * 60 * 60 * 1000); // Next day
    const timeLeft = Math.max(0, nextReset - now);

    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Challenge Header */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-orange-800">🎯 Daily Challenges</h3>
          <Badge variant="outline" className="bg-orange-100 text-orange-700">
            🔥 Streak: {state.challengeStreak}
          </Badge>
        </div>

        <div className="text-sm text-orange-700 mb-2">
          Complete challenges to earn rewards and build your streak!
        </div>

        <div className="text-xs text-gray-600">
          Resets in: {getTimeUntilReset()}
        </div>
      </Card>

      {/* Active Challenges */}
      {dailyChallenges.length > 0 ? (
        <div className="space-y-3">
          {dailyChallenges.map(challenge => {
            const progress = challengeProgress[challenge.id] || {};
            const currentProgress = Object.values(progress)[0] || 0;
            const progressPercent = Math.min(100, Math.max(0, (currentProgress / challenge.target) * 100));
            const isCompleted = challenge.completed || currentProgress >= challenge.target;

            return (
              <Card key={challenge.id} className={`p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.emoji}</span>
                    <div>
                      <h4 className="font-semibold">{challenge.name}</h4>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>

                  {isCompleted && (
                    <Badge className="bg-green-500">✓ Completed</Badge>
                  )}
                </div>

                {!isCompleted && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress: {currentProgress}/{challenge.target}</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>

                    <Progress value={progressPercent} className="mb-3" />

                    <Button
                      onClick={() => handleCompleteChallenge(challenge.id)}
                      size="sm"
                      className="w-full"
                      disabled={currentProgress < challenge.target}
                    >
                      {currentProgress >= challenge.target ? 'Claim Reward' : 'In Progress'}
                    </Button>
                  </>
                )}

                {isCompleted && (
                  <div className="text-sm text-green-700 font-medium">
                    Reward: +{challenge.reward.coins}🪙 +{challenge.reward.xp} XP
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <div className="text-gray-500 mb-4">
            <div className="text-4xl mb-2">🎯</div>
            <p>No challenges available</p>
          </div>
          <Button onClick={generateNewChallenges}>
            Generate Challenges
          </Button>
        </Card>
      )}

      {/* Challenge Statistics */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📊 Challenge Stats</h4>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-600">{state.challengeStreak}</div>
            <div className="text-blue-700">Current Streak</div>
          </div>

          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-600">
              {state.dailyChallenges.filter(c => c.completed).length}/{state.dailyChallenges.length}
            </div>
            <div className="text-green-700">Today's Progress</div>
          </div>
        </div>

        {/* Streak bonuses */}
        {state.challengeStreak >= 3 && (
          <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
            <div className="font-medium text-yellow-800">🔥 Streak Bonus!</div>
            <div className="text-yellow-700">
              {state.challengeStreak >= 7 ? '+50% XP from challenges' :
                state.challengeStreak >= 5 ? '+30% XP from challenges' :
                  '+15% XP from challenges'}
            </div>
          </div>
        )}
      </Card>

      {/* Challenge Tips */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Complete all daily challenges to maximize rewards</li>
          <li>• Building a streak gives bonus XP multipliers</li>
          <li>• Challenges reset every 24 hours</li>
          <li>• Higher streaks unlock better rewards</li>
        </ul>
      </Card>
    </div>
  );
});

ChallengesTab.displayName = 'ChallengesTab';
export default ChallengesTab;
