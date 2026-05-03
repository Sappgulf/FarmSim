/**
 * AchievementsPanel Component
 * Display achievements and progress
 */
import React, { memo, useMemo, useState } from 'react';
import { Trophy, Lock, Check, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../../data/achievements';

function AchievementsPanelComponent({ unlockedAchievements = [], stats = {}, onClaimReward }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate progress for each achievement
  const achievementsWithProgress = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      const unlocked = unlockedAchievements.includes(achievement.id);
      let progress = 0;
      let target = 1;

      // Calculate progress based on achievement type
      switch (achievement.id) {
        case 'first_harvest':
          progress = Math.min(stats.totalHarvests || 0, 1);
          break;
        case 'mass_producer':
          progress = stats.totalHarvests || 0;
          target = 25;
          break;
        case 'centurion':
          progress = stats.totalHarvests || 0;
          target = 100;
          break;
        case 'quality_farmer':
          progress = stats.qualityHarvests || 0;
          target = 5;
          break;
        case 'pest_controller':
          progress = stats.pestsEliminated || 0;
          target = 10;
          break;
        case 'weathered':
          progress = stats.weatherSurvived || 0;
          target = 3;
          break;
        default:
          progress = unlocked ? 1 : 0;
      }

      return {
        ...achievement,
        unlocked,
        progress: Math.min(progress, target),
        target,
        percent: Math.min((progress / target) * 100, 100),
      };
    });
  }, [unlockedAchievements, stats]);

  // Filter by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return achievementsWithProgress;
    return achievementsWithProgress.filter((a) => a.category === selectedCategory);
  }, [achievementsWithProgress, selectedCategory]);

  // Stats
  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const totalRewards = achievementsWithProgress
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.reward, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Trophy size={20} className="text-amber-500" />
            Achievements
          </span>
          <Badge className="bg-amber-100 text-amber-700">
            {totalUnlocked}/{totalAchievements}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall progress */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800">Overall Progress</span>
            <span className="text-sm text-amber-600">
              {Math.round((totalUnlocked / totalAchievements) * 100)}%
            </span>
          </div>
          <Progress value={(totalUnlocked / totalAchievements) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-amber-600">
            <span>{totalUnlocked} unlocked</span>
            <span>+{totalRewards}🪙 earned</span>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-2 py-1 text-xs rounded-full transition-colors
              ${
                selectedCategory === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            All
          </button>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([id, cat]) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`
                px-2 py-1 text-xs rounded-full transition-colors
                ${
                  selectedCategory === id
                    ? cat.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Achievement list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredAchievements.map((achievement) => {
            const category = ACHIEVEMENT_CATEGORIES[achievement.category];

            return (
              <div
                key={achievement.id}
                className={`
                  p-3 rounded-lg border transition-all
                  ${
                    achievement.unlocked
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xl
                    ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-200'}
                  `}
                  >
                    {achievement.unlocked ? (
                      achievement.icon
                    ) : (
                      <Lock size={18} className="text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium text-sm ${achievement.unlocked ? 'text-green-800' : 'text-gray-700'}`}
                      >
                        {achievement.name}
                      </span>
                      {achievement.unlocked && <Check size={14} className="text-green-500" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{achievement.desc}</p>

                    {/* Progress bar */}
                    {!achievement.unlocked && achievement.target > 1 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {achievement.progress}/{achievement.target}
                          </span>
                          <span>{Math.round(achievement.percent)}%</span>
                        </div>
                        <Progress value={achievement.percent} className="h-1.5" />
                      </div>
                    )}
                  </div>

                  {/* Reward */}
                  <Badge
                    variant="outline"
                    className={achievement.unlocked ? 'bg-green-100 text-green-700' : ''}
                  >
                    +{achievement.reward}🪙
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion bonus hint */}
        {totalUnlocked < totalAchievements && (
          <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-2">
            <Star size={12} className="inline mr-1" />
            Complete all achievements to earn the Farm Legend badge!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const AchievementsPanel = memo(AchievementsPanelComponent);
