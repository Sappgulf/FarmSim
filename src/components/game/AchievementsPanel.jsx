import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Trophy, Star, Lock } from 'lucide-react';

/**
 * Achievements Panel Component
 * Displays achievement progress and unlocked rewards
 */
export function AchievementsPanel({ 
  unlockedAchievements, 
  achievementProgress, 
  onClaimReward 
}) {
  const sortedAchievements = Object.entries(achievementProgress || {}).sort((a, b) => {
    const [, progressA] = a;
    const [, progressB] = b;
    
    // Completed achievements first
    if (progressA.completed && !progressB.completed) return -1;
    if (!progressA.completed && progressB.completed) return 1;
    
    // Then by progress percentage
    return progressB.percentage - progressA.percentage;
  });

  const getAchievementIcon = (achievement) => {
    if (achievement.completed) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (achievement.percentage > 0) {
      return <Star className="w-5 h-5 text-blue-500" />;
    } else {
      return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAchievementColor = (achievement) => {
    if (achievement.completed) return 'border-yellow-200 bg-yellow-50';
    if (achievement.percentage > 50) return 'border-blue-200 bg-blue-50';
    if (achievement.percentage > 0) return 'border-green-200 bg-green-50';
    return 'border-gray-200 bg-gray-50';
  };

  const formatProgress = (current, target) => {
    return `${current.toLocaleString()} / ${target.toLocaleString()}`;
  };

  const completedCount = unlockedAchievements.length;
  const totalCount = sortedAchievements.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </div>
          <Badge variant="outline">
            {completedCount} / {totalCount} Completed
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <Progress 
            value={(completedCount / totalCount) * 100} 
            className="h-2"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-96 overflow-y-auto space-y-3">
          {sortedAchievements.map(([id, achievement]) => (
            <div 
              key={id}
              className={`p-4 rounded-lg border transition-all ${getAchievementColor(achievement)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getAchievementIcon(achievement)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {formatProgress(achievement.current, achievement.target)}
                        </span>
                        <span className="font-semibold">
                          {Math.round(achievement.percentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={achievement.percentage} 
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Reward Display */}
                <div className="text-right">
                  {achievement.completed && !achievement.rewardClaimed && (
                    <button
                      onClick={() => onClaimReward(id)}
                      className="mb-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                    >
                      Claim Reward
                    </button>
                  )}
                  <div className="text-xs">
                    <div className="font-semibold text-green-600">
                      💰 ${achievement.coinReward}
                    </div>
                    <div className="text-gray-500">
                      ⭐ {achievement.xpReward} XP
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Type Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  {achievement.type?.replace('_', ' ').toUpperCase()}
                </Badge>
                
                {achievement.completed && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <Trophy className="w-3 h-3" />
                    <span>Unlocked!</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {sortedAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No achievements data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
