import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { Tabs, TabsList, TabsTrigger } from '../../../ui/tabs';
import { ScrapbookPanel } from '../../../panels/ScrapbookPanel';
import { MEMORIES, MEMORY_CHAPTERS } from '../../../../data/identity';
import { ALMANAC_MEMORY_LINKS } from '../../../../data/almanac';
import { TabHero, MetricTile, TabEmptyState } from './TabSurface';

// Achievement data from original system
const ACHIEVEMENTS = [
  // FARMING BASICS
  {
    id: 'first_harvest',
    name: 'First Harvest',
    desc: 'Harvest your first crop',
    reward: 15,
    icon: '🌱',
    category: 'farming',
    requirement: { type: 'xp', value: 1 },
  },
  {
    id: 'mass_producer',
    name: 'Mass Producer',
    desc: 'Harvest 60 crops total',
    reward: 60,
    icon: '🚜',
    category: 'farming',
    requirement: { type: 'harvests', value: 60 },
  },
  {
    id: 'quality_farmer',
    name: 'Quality Farmer',
    desc: 'Harvest 18 high-quality crops',
    reward: 45,
    icon: '⭐',
    category: 'farming',
    requirement: { type: 'quality_crops', value: 18 },
  },
  {
    id: 'field_master',
    name: 'Field Master',
    desc: 'Unlock the maximum field size',
    reward: 100,
    icon: '🏆',
    category: 'farming',
    requirement: { type: 'max_field', value: 1 },
  },

  // ECONOMIC MASTERY
  {
    id: 'coin_collector',
    name: 'Coin Collector',
    desc: 'Earn 1200 coins total',
    reward: 40,
    icon: '💰',
    category: 'economy',
    requirement: { type: 'total_coins', value: 1200 },
  },
  {
    id: 'millionaire',
    name: 'Farm Millionaire',
    desc: 'Earn 4000 coins total',
    reward: 150,
    icon: '💎',
    category: 'economy',
    requirement: { type: 'total_coins', value: 4000 },
  },
  {
    id: 'market_master',
    name: 'Market Master',
    desc: 'Make 10 profitable trades',
    reward: 80,
    icon: '📈',
    category: 'economy',
    requirement: { type: 'trades', value: 10 },
  },
  {
    id: 'futures_trader',
    name: 'Futures Trader',
    desc: 'Complete 5 futures contracts',
    reward: 70,
    icon: '📊',
    category: 'economy',
    requirement: { type: 'contracts', value: 5 },
  },

  // SKILL & PROGRESSION
  {
    id: 'skill_enthusiast',
    name: 'Skill Enthusiast',
    desc: 'Unlock 5 different skills',
    reward: 75,
    icon: '📚',
    category: 'progression',
    requirement: { type: 'skills_unlocked', value: 5 },
  },
  {
    id: 'prestige_pioneer',
    name: 'Prestige Pioneer',
    desc: 'Achieve your first prestige level',
    reward: 200,
    icon: '🌟',
    category: 'progression',
    requirement: { type: 'prestige_level', value: 1 },
  },
  {
    id: 'research_scientist',
    name: 'Research Scientist',
    desc: 'Complete 3 research projects',
    reward: 120,
    icon: '🔬',
    category: 'progression',
    requirement: { type: 'research_completed', value: 3 },
  },
  {
    id: 'automation_expert',
    name: 'Automation Expert',
    desc: 'Hire 3 different worker types',
    reward: 100,
    icon: '🤖',
    category: 'progression',
    requirement: { type: 'workers_hired', value: 3 },
  },

  // ENVIRONMENTAL & SEASONS
  {
    id: 'weathered',
    name: 'Weather Expert',
    desc: 'Survive 8 weather events',
    reward: 25,
    icon: '⛈️',
    category: 'environment',
    requirement: { type: 'weather_events', value: 8 },
  },
  {
    id: 'season_expert',
    name: 'Season Expert',
    desc: 'Plant 20 crops in their optimal season',
    reward: 35,
    icon: '🍂',
    category: 'environment',
    requirement: { type: 'seasonal_planting', value: 20 },
  },
  {
    id: 'rotation_master',
    name: 'Rotation Master',
    desc: 'Use crop rotation 20 times',
    reward: 60,
    icon: '🔄',
    category: 'environment',
    requirement: { type: 'crop_rotations', value: 20 },
  },
  {
    id: 'companion_gardener',
    name: 'Companion Gardener',
    desc: 'Achieve 10 companion planting bonuses',
    reward: 50,
    icon: '🌿',
    category: 'environment',
    requirement: { type: 'companion_bonuses', value: 10 },
  },

  // CHALLENGES & SPECIAL
  {
    id: 'speed_farmer',
    name: 'Speed Farmer',
    desc: 'Complete Level 1 in under 4 minutes',
    reward: 30,
    icon: '⚡',
    category: 'challenge',
    requirement: { type: 'speed_level', value: 1 },
  },
  {
    id: 'pest_controller',
    name: 'Pest Controller',
    desc: 'Eliminate 20 pest infestations',
    reward: 30,
    icon: '🧽',
    category: 'challenge',
    requirement: { type: 'pests_eliminated', value: 20 },
  },
  {
    id: 'disease_fighter',
    name: 'Disease Fighter',
    desc: 'Cure 30 crop diseases',
    reward: 50,
    icon: '🦠',
    category: 'challenge',
    requirement: { type: 'diseases_cured', value: 30 },
  },
  {
    id: 'efficiency_master',
    name: 'Efficiency Master',
    desc: 'Achieve 95% farm efficiency rating',
    reward: 90,
    icon: '⚙️',
    category: 'challenge',
    requirement: { type: 'efficiency_rating', value: 95 },
  },

  // SOCIAL & COMMUNITY
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    desc: 'Add 5 friends',
    reward: 40,
    icon: '👥',
    category: 'social',
    requirement: { type: 'friends_added', value: 5 },
  },
  {
    id: 'gift_giver',
    name: 'Gift Giver',
    desc: 'Send 20 gifts to friends',
    reward: 60,
    icon: '🎁',
    category: 'social',
    requirement: { type: 'gifts_sent', value: 20 },
  },
  {
    id: 'competition_winner',
    name: 'Competition Winner',
    desc: 'Win a farming competition',
    reward: 100,
    icon: '🏅',
    category: 'social',
    requirement: { type: 'competitions_won', value: 1 },
  },
  {
    id: 'town_builder',
    name: 'Town Builder',
    desc: 'Build 3 town structures',
    reward: 85,
    icon: '🏛️',
    category: 'social',
    requirement: { type: 'town_structures', value: 3 },
  },

  // SPECIALIZED & ADVANCED
  {
    id: 'bee_keeper',
    name: 'Bee Keeper',
    desc: 'Harvest 10 honey products',
    reward: 40,
    icon: '🐝',
    category: 'specialized',
    requirement: { type: 'honey_harvested', value: 10 },
  },
  {
    id: 'processing_tycoon',
    name: 'Processing Tycoon',
    desc: 'Process 50 raw materials',
    reward: 70,
    icon: '🏭',
    category: 'specialized',
    requirement: { type: 'materials_processed', value: 50 },
  },
  {
    id: 'weather_forecaster',
    name: 'Weather Forecaster',
    desc: 'Successfully predict 5 weather changes',
    reward: 35,
    icon: '🌤️',
    category: 'specialized',
    requirement: { type: 'weather_predictions', value: 5 },
  },
  {
    id: 'innovation_leader',
    name: 'Innovation Leader',
    desc: 'Be first to unlock new technology',
    reward: 150,
    icon: '💡',
    category: 'specialized',
    requirement: { type: 'first_tech_unlock', value: 1 },
  },

  // MILESTONE ACHIEVEMENTS
  {
    id: 'centurion',
    name: 'Centurion',
    desc: 'Harvest 100 crops total',
    reward: 200,
    icon: '💯',
    category: 'milestone',
    requirement: { type: 'harvests', value: 100 },
  },
  {
    id: 'land_baron',
    name: 'Land Baron',
    desc: 'Expand to maximum farm size',
    reward: 250,
    icon: '🗺️',
    category: 'milestone',
    requirement: { type: 'max_field', value: 1 },
  },
  {
    id: 'master_farmer',
    name: 'Master Farmer',
    desc: 'Reach prestige level 3',
    reward: 500,
    icon: '👑',
    category: 'milestone',
    requirement: { type: 'prestige_level', value: 3 },
  },
  {
    id: 'farm_legend',
    name: 'Farm Legend',
    desc: 'Complete all other achievements',
    reward: 1000,
    icon: '🏆',
    category: 'milestone',
    requirement: { type: 'all_achievements', value: 1 },
  },
];

const AchievementsTab = memo(() => {
  const { state, actions } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Achievement statistics
  const achievementStats = {
    total: ACHIEVEMENTS.length,
    unlocked: state.achievements.filter((a) => a.unlocked).length,
    completionRate: Math.round(
      (state.achievements.filter((a) => a.unlocked).length / ACHIEVEMENTS.length) * 100
    ),
    categories: {
      farming: ACHIEVEMENTS.filter((a) => a.category === 'farming').length,
      economy: ACHIEVEMENTS.filter((a) => a.category === 'economy').length,
      progression: ACHIEVEMENTS.filter((a) => a.category === 'progression').length,
      environment: ACHIEVEMENTS.filter((a) => a.category === 'environment').length,
      challenge: ACHIEVEMENTS.filter((a) => a.category === 'challenge').length,
      social: ACHIEVEMENTS.filter((a) => a.category === 'social').length,
      specialized: ACHIEVEMENTS.filter((a) => a.category === 'specialized').length,
      milestone: ACHIEVEMENTS.filter((a) => a.category === 'milestone').length,
    },
  };

  const getCategoryIcon = (category) => {
    const icons = {
      farming: '🌾',
      economy: '💰',
      progression: '📈',
      environment: '🌱',
      challenge: '🎯',
      social: '👥',
      specialized: '⭐',
      milestone: '🏆',
    };
    return icons[category] || '🏆';
  };

  const getCategoryName = (category) => {
    const names = {
      farming: 'Farming Basics',
      economy: 'Economic Mastery',
      progression: 'Skill & Progression',
      environment: 'Environmental & Seasons',
      challenge: 'Challenges & Special',
      social: 'Social & Community',
      specialized: 'Specialized & Advanced',
      milestone: 'Milestone Achievements',
    };
    return names[category] || category;
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === selectedCategory);

  const getAchievementProgress = (achievement) => {
    // This would be calculated based on actual game statistics
    // For now, we'll simulate progress based on simple checks
    switch (achievement.requirement.type) {
      case 'xp':
        return Math.min(100, (state.xp / achievement.requirement.value) * 100);
      case 'total_coins':
        return Math.min(100, (state.coins / achievement.requirement.value) * 100);
      case 'harvests':
        return Math.min(
          100,
          ((state.milestones?.progress?.totalHarvests || 0) / achievement.requirement.value) * 100
        );
      case 'quality_crops':
        return Math.min(
          100,
          ((state.milestones?.progress?.totalHarvests || 0) / achievement.requirement.value) * 100
        );
      case 'weather_events':
        return Math.min(
          100,
          ((state.almanac?.counters?.dayCount || 0) / achievement.requirement.value) * 100
        );
      case 'pests_eliminated':
        return Math.min(
          100,
          ((state.milestones?.progress?.totalHarvests || 0) / (achievement.requirement.value * 2)) *
            100
        );
      case 'diseases_cured':
        return Math.min(
          100,
          ((state.milestones?.progress?.totalHarvests || 0) / (achievement.requirement.value * 2)) *
            100
        );
      case 'max_field':
        return state.gridSize >= 5 ? 100 : (state.gridSize / 5) * 100;
      default:
        return state.achievements.find((a) => a.id === achievement.id)?.unlocked ? 100 : 0;
    }
  };

  const claimAchievement = (achievementId) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    const existingAchievement = state.achievements.find((a) => a.id === achievementId);

    if (existingAchievement?.unlocked) {
      actions.addNotification({
        message: 'Achievement already claimed!',
        type: 'info',
      });
      return;
    }

    // Check if requirement is met
    const progress = getAchievementProgress(achievement);
    if (progress < 100) {
      actions.addNotification({
        message: 'Achievement requirement not met yet!',
        type: 'warning',
      });
      return;
    }

    // Grant rewards
    actions.recordMemoryEvent('achievement_claimed', {
      achievementId: achievement.id,
      category: achievement.category,
    });
    const almanacRewardByCategory = {
      farming: 'first_steps',
      economy: 'seedling_economy',
      progression: 'steady_growth',
      milestone: 'legacy_roots',
    };
    const rewardPage = almanacRewardByCategory[achievement.category] || 'town_board_basics';
    actions.unlockAlmanacPage(rewardPage);

    // Mark as unlocked
    const updatedAchievements = [...state.achievements];
    const achievementIndex = updatedAchievements.findIndex((a) => a.id === achievementId);

    if (achievementIndex >= 0) {
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        unlocked: true,
        unlockedAt: Date.now(),
      };
    } else {
      updatedAchievements.push({
        id: achievementId,
        unlocked: true,
        unlockedAt: Date.now(),
      });
    }

    actions.updateAchievements(updatedAchievements);

    actions.addNotification({
      message: `Achievement unlocked: ${achievement.name}! Memory + Almanac depth added.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <TabHero
        icon="🏆"
        tone="amber"
        title="Achievements"
        description="Track milestones, unlock rewards, and feed the scrapbook."
        badge={
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            {achievementStats.unlocked} / {achievementStats.total}
          </Badge>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Unlocked"
            value={`${achievementStats.unlocked}/${achievementStats.total}`}
            hint="Claimed achievements"
            icon="✓"
          />
          <MetricTile
            tone="emerald"
            label="Completion"
            value={`${achievementStats.completionRate}%`}
            hint="Overall progress"
            icon="📈"
          />
          <MetricTile
            tone="violet"
            label="Categories"
            value={Object.keys(achievementStats.categories).length}
            hint="Achievement families"
            icon="🗂️"
          />
        </div>
      </TabHero>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 rounded-2xl bg-slate-50/80 p-1.5 h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="farming">🌾 Farm</TabsTrigger>
          <TabsTrigger value="economy">💰 Econ</TabsTrigger>
          <TabsTrigger value="progression">📈 Skill</TabsTrigger>
          <TabsTrigger value="environment">🌱 Eco</TabsTrigger>
          <TabsTrigger value="challenge">🎯 Challenge</TabsTrigger>
          <TabsTrigger value="social">👥 Social</TabsTrigger>
          <TabsTrigger value="specialized">⭐ Spec</TabsTrigger>
          <TabsTrigger value="milestone">🏆 Goal</TabsTrigger>
        </TabsList>

        {/* Achievement List */}
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredAchievements.length === 0 ? (
            <TabEmptyState
              tone="amber"
              icon="🔍"
              title="Nothing in this filter"
              description="Try another category or return to All to see every milestone you can pursue."
              className="border-amber-100/70"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show all
                </Button>
              }
            />
          ) : (
            filteredAchievements.map((achievement) => {
              const isUnlocked = state.achievements.find((a) => a.id === achievement.id)?.unlocked;
              const progress = getAchievementProgress(achievement);
              const canClaim = progress >= 100 && !isUnlocked;

              return (
                <Card
                  key={achievement.id}
                  className={`p-3 ${isUnlocked ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-gray-600">{achievement.desc}</p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {isUnlocked && <Badge className="bg-green-500">✓ Unlocked</Badge>}
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(achievement.category)}
                      </Badge>
                    </div>
                  </div>

                  {!isUnlocked && (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>

                      <Progress value={progress} className="mb-2" />

                      <div className="text-xs text-gray-500 mb-2">
                        Requirement: {formatDisplayLabel(achievement.requirement.type)} (
                        {achievement.requirement.value})
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-green-600 font-medium">
                      Reward: Memory + Almanac depth
                    </div>

                    {canClaim && (
                      <Button onClick={() => claimAchievement(achievement.id)} size="sm">
                        Claim
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>

      {/* Achievement Statistics */}
      <Card className="p-4 bg-slate-50/80">
        <h4 className="font-semibold mb-3">📊 Achievement Statistics</h4>

        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {Object.entries(achievementStats.categories).map(([category, total]) => {
            const unlocked = ACHIEVEMENTS.filter(
              (a) =>
                a.category === category && state.achievements.find((ua) => ua.id === a.id)?.unlocked
            ).length;

            return (
              <MetricTile
                key={category}
                tone="sky"
                label={getCategoryName(category)}
                value={`${unlocked}/${total}`}
                hint={`${getCategoryIcon(category)} category progress`}
                icon={getCategoryIcon(category)}
              />
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-orange-600">
            {achievementStats.completionRate}% Complete
          </div>
          <div className="text-sm text-gray-600">Keep playing to unlock more achievements!</div>
        </div>
      </Card>

      {/* Recent Achievements */}
      {state.achievements.filter((a) => a.unlocked).length > 0 && (
        <Card className="p-4 bg-white/90">
          <h4 className="font-semibold mb-3">🎉 Recent Achievements</h4>

          <div className="space-y-2">
            {state.achievements
              .filter((a) => a.unlocked)
              .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
              .slice(0, 5)
              .map((achievement) => {
                const achievementData = ACHIEVEMENTS.find((a) => a.id === achievement.id);
                if (!achievementData) return null;

                return (
                  <div
                    key={achievement.id}
                    className="flex justify-between items-center p-2 bg-green-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{achievementData.icon}</span>
                      <span className="font-medium">{achievementData.name}</span>
                    </div>
                    <span className="text-sm text-green-600">Memory + Almanac</span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      <ScrapbookPanel
        chapters={MEMORY_CHAPTERS}
        memories={MEMORIES}
        memoryFlags={state.memoryFlags || {}}
        almanacLinks={ALMANAC_MEMORY_LINKS}
        almanacUnlocked={state.almanac?.unlocked || {}}
        onOpenAlmanac={() => {
          if (typeof window !== 'undefined' && typeof window.switchToTab === 'function') {
            window.switchToTab('almanac');
          }
        }}
        spotlight={state.spotlight}
        onSetSpotlight={(spotlight) => actions.setSpotlight(spotlight)}
        onOpen={() => actions.recordMemoryEvent('scrapbook_opened')}
      />
    </div>
  );
});

AchievementsTab.displayName = 'AchievementsTab';
export default AchievementsTab;
