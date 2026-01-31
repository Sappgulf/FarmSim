import React, { memo, useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';

// Achievement data from original system
const ACHIEVEMENTS = [
  // FARMING BASICS
  { id: "first_harvest", name: "First Harvest", desc: "Harvest your first crop", reward: 15, icon: "🌱", category: "farming", requirement: { type: "xp", value: 1 } },
  { id: "mass_producer", name: "Mass Producer", desc: "Harvest 25 crops total", reward: 60, icon: "🚜", category: "farming", requirement: { type: "harvests", value: 25 } },
  { id: "quality_farmer", name: "Quality Farmer", desc: "Harvest 5 high-quality crops", reward: 45, icon: "⭐", category: "farming", requirement: { type: "quality_crops", value: 5 } },
  { id: "field_master", name: "Field Master", desc: "Unlock the maximum field size", reward: 100, icon: "🏆", category: "farming", requirement: { type: "max_field", value: 1 } },

  // ECONOMIC MASTERY
  { id: "coin_collector", name: "Coin Collector", desc: "Earn 300 coins total", reward: 40, icon: "💰", category: "economy", requirement: { type: "total_coins", value: 300 } },
  { id: "millionaire", name: "Farm Millionaire", desc: "Earn 800 coins total", reward: 150, icon: "💎", category: "economy", requirement: { type: "total_coins", value: 800 } },
  { id: "market_master", name: "Market Master", desc: "Make 10 profitable trades", reward: 80, icon: "📈", category: "economy", requirement: { type: "trades", value: 10 } },
  { id: "futures_trader", name: "Futures Trader", desc: "Complete 5 futures contracts", reward: 70, icon: "📊", category: "economy", requirement: { type: "contracts", value: 5 } },

  // SKILL & PROGRESSION
  { id: "skill_enthusiast", name: "Skill Enthusiast", desc: "Unlock 5 different skills", reward: 75, icon: "📚", category: "progression", requirement: { type: "skills_unlocked", value: 5 } },
  { id: "prestige_pioneer", name: "Prestige Pioneer", desc: "Achieve your first prestige level", reward: 200, icon: "🌟", category: "progression", requirement: { type: "prestige_level", value: 1 } },
  { id: "research_scientist", name: "Research Scientist", desc: "Complete 3 research projects", reward: 120, icon: "🔬", category: "progression", requirement: { type: "research_completed", value: 3 } },
  { id: "automation_expert", name: "Automation Expert", desc: "Hire 3 different worker types", reward: 100, icon: "🤖", category: "progression", requirement: { type: "workers_hired", value: 3 } },

  // ENVIRONMENTAL & SEASONS
  { id: "weathered", name: "Weather Expert", desc: "Survive 3 weather events", reward: 25, icon: "⛈️", category: "environment", requirement: { type: "weather_events", value: 3 } },
  { id: "season_expert", name: "Season Expert", desc: "Plant 5 crops in their optimal season", reward: 35, icon: "🍂", category: "environment", requirement: { type: "seasonal_planting", value: 5 } },
  { id: "rotation_master", name: "Rotation Master", desc: "Use crop rotation 20 times", reward: 60, icon: "🔄", category: "environment", requirement: { type: "crop_rotations", value: 20 } },
  { id: "companion_gardener", name: "Companion Gardener", desc: "Achieve 10 companion planting bonuses", reward: 50, icon: "🌿", category: "environment", requirement: { type: "companion_bonuses", value: 10 } },

  // CHALLENGES & SPECIAL
  { id: "speed_farmer", name: "Speed Farmer", desc: "Complete Level 1 in under 4 minutes", reward: 30, icon: "⚡", category: "challenge", requirement: { type: "speed_level", value: 1 } },
  { id: "pest_controller", name: "Pest Controller", desc: "Eliminate 10 pest infestations", reward: 30, icon: "🧽", category: "challenge", requirement: { type: "pests_eliminated", value: 10 } },
  { id: "disease_fighter", name: "Disease Fighter", desc: "Cure 15 crop diseases", reward: 50, icon: "🦠", category: "challenge", requirement: { type: "diseases_cured", value: 15 } },
  { id: "efficiency_master", name: "Efficiency Master", desc: "Achieve 95% farm efficiency rating", reward: 90, icon: "⚙️", category: "challenge", requirement: { type: "efficiency_rating", value: 95 } },

  // SOCIAL & COMMUNITY
  { id: "social_butterfly", name: "Social Butterfly", desc: "Add 5 friends", reward: 40, icon: "👥", category: "social", requirement: { type: "friends_added", value: 5 } },
  { id: "gift_giver", name: "Gift Giver", desc: "Send 20 gifts to friends", reward: 60, icon: "🎁", category: "social", requirement: { type: "gifts_sent", value: 20 } },
  { id: "competition_winner", name: "Competition Winner", desc: "Win a farming competition", reward: 100, icon: "🏅", category: "social", requirement: { type: "competitions_won", value: 1 } },
  { id: "town_builder", name: "Town Builder", desc: "Build 3 town structures", reward: 85, icon: "🏛️", category: "social", requirement: { type: "town_structures", value: 3 } },

  // SPECIALIZED & ADVANCED
  { id: "bee_keeper", name: "Bee Keeper", desc: "Harvest 10 honey products", reward: 40, icon: "🐝", category: "specialized", requirement: { type: "honey_harvested", value: 10 } },
  { id: "processing_tycoon", name: "Processing Tycoon", desc: "Process 50 raw materials", reward: 70, icon: "🏭", category: "specialized", requirement: { type: "materials_processed", value: 50 } },
  { id: "weather_forecaster", name: "Weather Forecaster", desc: "Successfully predict 5 weather changes", reward: 35, icon: "🌤️", category: "specialized", requirement: { type: "weather_predictions", value: 5 } },
  { id: "innovation_leader", name: "Innovation Leader", desc: "Be first to unlock new technology", reward: 150, icon: "💡", category: "specialized", requirement: { type: "first_tech_unlock", value: 1 } },

  // MILESTONE ACHIEVEMENTS
  { id: "centurion", name: "Centurion", desc: "Harvest 100 crops total", reward: 200, icon: "💯", category: "milestone", requirement: { type: "harvests", value: 100 } },
  { id: "land_baron", name: "Land Baron", desc: "Expand to maximum farm size", reward: 250, icon: "🗺️", category: "milestone", requirement: { type: "max_field", value: 1 } },
  { id: "master_farmer", name: "Master Farmer", desc: "Reach prestige level 3", reward: 500, icon: "👑", category: "milestone", requirement: { type: "prestige_level", value: 3 } },
  { id: "farm_legend", name: "Farm Legend", desc: "Complete all other achievements", reward: 1000, icon: "🏆", category: "milestone", requirement: { type: "all_achievements", value: 1 } }
];

const AchievementsTab = memo(() => {
  const { state, actions } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Achievement statistics
  const achievementStats = {
    total: ACHIEVEMENTS.length,
    unlocked: state.achievements.filter(a => a.unlocked).length,
    completionRate: Math.round((state.achievements.filter(a => a.unlocked).length / ACHIEVEMENTS.length) * 100),
    categories: {
      farming: ACHIEVEMENTS.filter(a => a.category === 'farming').length,
      economy: ACHIEVEMENTS.filter(a => a.category === 'economy').length,
      progression: ACHIEVEMENTS.filter(a => a.category === 'progression').length,
      environment: ACHIEVEMENTS.filter(a => a.category === 'environment').length,
      challenge: ACHIEVEMENTS.filter(a => a.category === 'challenge').length,
      social: ACHIEVEMENTS.filter(a => a.category === 'social').length,
      specialized: ACHIEVEMENTS.filter(a => a.category === 'specialized').length,
      milestone: ACHIEVEMENTS.filter(a => a.category === 'milestone').length,
    }
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
      milestone: '🏆'
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
      milestone: 'Milestone Achievements'
    };
    return names[category] || category;
  };

  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const getAchievementProgress = (achievement) => {
    // This would be calculated based on actual game statistics
    // For now, we'll simulate progress based on simple checks
    switch (achievement.requirement.type) {
      case 'xp':
        return Math.min(100, (state.xp / achievement.requirement.value) * 100);
      case 'total_coins':
        return Math.min(100, (state.coins / achievement.requirement.value) * 100);
      case 'harvests':
        // Simulate harvest count (would be tracked in real game)
        return Math.min(100, ((state.level * 10) / achievement.requirement.value) * 100);
      case 'max_field':
        return state.gridSize >= 5 ? 100 : (state.gridSize / 5) * 100;
      default:
        return state.achievements.find(a => a.id === achievement.id)?.unlocked ? 100 : 0;
    }
  };

  const claimAchievement = (achievementId) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const existingAchievement = state.achievements.find(a => a.id === achievementId);

    if (existingAchievement?.unlocked) {
      actions.addNotification({
        message: 'Achievement already claimed!',
        type: 'info'
      });
      return;
    }

    // Check if requirement is met
    const progress = getAchievementProgress(achievement);
    if (progress < 100) {
      actions.addNotification({
        message: 'Achievement requirement not met yet!',
        type: 'warning'
      });
      return;
    }

    // Grant rewards
    actions.setCoins(state.coins + achievement.reward);
    actions.setXp(state.xp + Math.floor(achievement.reward * 0.5));

    // Mark as unlocked
    const updatedAchievements = [...state.achievements];
    const achievementIndex = updatedAchievements.findIndex(a => a.id === achievementId);

    if (achievementIndex >= 0) {
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        unlocked: true,
        unlockedAt: Date.now()
      };
    } else {
      updatedAchievements.push({
        id: achievementId,
        unlocked: true,
        unlockedAt: Date.now()
      });
    }

    actions.updateAchievements(updatedAchievements);

    actions.addNotification({
      message: `Achievement unlocked: ${achievement.name}! +${achievement.reward}🪙`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-4">
      {/* Achievement Overview - Premium */}
      <Card className="p-5 bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/95 backdrop-blur-sm border-amber-200/60 shadow-lg shadow-amber-200/30 relative overflow-hidden">
        {/* Decorative trophy */}
        <div className="absolute -right-4 -top-2 text-6xl opacity-10 rotate-12">🏆</div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              🏆 Achievements
            </h3>
            <p className="text-sm text-amber-700/80 font-medium mt-1">
              {achievementStats.unlocked}/{achievementStats.total} Unlocked ({achievementStats.completionRate}%)
            </p>
          </div>
          <div className="text-center p-3 bg-white/80 rounded-xl border border-amber-100 shadow-sm">
            <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">{achievementStats.unlocked}</div>
            <div className="text-xs text-amber-700 font-medium">of {achievementStats.total}</div>
          </div>
        </div>

        <Progress value={achievementStats.completionRate} className="h-3 mt-4 bg-amber-100" />
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="farming">🌾 Farming</TabsTrigger>
          <TabsTrigger value="economy">💰 Economy</TabsTrigger>
          <TabsTrigger value="progression">📈 Progression</TabsTrigger>
        </TabsList>

        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 h-auto">
          <TabsTrigger value="environment">🌱 Environment</TabsTrigger>
          <TabsTrigger value="challenge">🎯 Challenge</TabsTrigger>
          <TabsTrigger value="social">👥 Social</TabsTrigger>
          <TabsTrigger value="milestone">🏆 Milestone</TabsTrigger>
        </TabsList>

        {/* Achievement List */}
        <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredAchievements.map(achievement => {
            const isUnlocked = state.achievements.find(a => a.id === achievement.id)?.unlocked;
            const progress = getAchievementProgress(achievement);
            const canClaim = progress >= 100 && !isUnlocked;

            return (
              <Card
                key={achievement.id}
                className={`
                    p-3 transition-all border-l-4 
                    ${isUnlocked ? 'bg-green-50 border-l-green-500 border-y-green-100 border-r-green-100' :
                    canClaim ? 'bg-amber-50 border-l-amber-500 border-y-amber-100 border-r-amber-100 shadow-md transform scale-[1.01]' :
                      'bg-white border-l-gray-200'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-2xl">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isUnlocked ? 'text-green-900' : 'text-gray-900'}`}>{achievement.name}</h4>
                      <p className="text-xs text-gray-600">{achievement.desc}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isUnlocked && <Badge className="bg-green-600 shadow-sm">Claimed</Badge>}
                    {canClaim && <Badge className="bg-amber-500 animate-pulse shadow-sm">Ready!</Badge>}
                    <span className="text-[10px] text-gray-400 font-mono uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                      {getCategoryIcon(achievement.category)} {achievement.category}
                    </span>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="mt-2 text-sm bg-gray-50/50 p-2 rounded-lg">
                    <div className="flex justify-between text-xs mb-1 font-medium text-gray-500">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>

                    <Progress value={progress} className={`h-2 mb-2 ${canClaim ? 'bg-amber-200' : 'bg-gray-200'}`} indicatorClassName={canClaim ? 'bg-amber-500' : 'bg-blue-500'} />

                    <div className="text-[10px] text-gray-400 font-mono">
                      REQ: {achievement.requirement.type.replace('_', ' ').toUpperCase()} ({achievement.requirement.value})
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                    REWARDS:
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">+{achievement.reward}🪙</Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">+{Math.floor(achievement.reward * 0.5)} XP</Badge>
                  </div>

                  {canClaim && (
                    <Button
                      onClick={() => claimAchievement(achievement.id)}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold animate-bounce"
                    >
                      CLAIM REWARD
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Tabs>

      {/* Achievement Statistics */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">📊 Achievement Statistics</h4>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(achievementStats.categories).map(([category, total]) => {
            const unlocked = ACHIEVEMENTS.filter(a => a.category === category && state.achievements.find(ua => ua.id === a.id)?.unlocked).length;

            return (
              <div key={category} className="text-center p-2 bg-white rounded">
                <div className="font-bold text-blue-600">
                  {unlocked}/{total}
                </div>
                <div className="text-blue-700">
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-orange-600">
            {achievementStats.completionRate}% Complete
          </div>
          <div className="text-sm text-gray-600">
            Keep playing to unlock more achievements!
          </div>
        </div>
      </Card>

      {/* Recent Achievements */}
      {state.achievements.filter(a => a.unlocked).length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">🎉 Recent Achievements</h4>

          <div className="space-y-2">
            {state.achievements
              .filter(a => a.unlocked)
              .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
              .slice(0, 5)
              .map(achievement => {
                const achievementData = ACHIEVEMENTS.find(a => a.id === achievement.id);
                if (!achievementData) return null;

                return (
                  <div key={achievement.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{achievementData.icon}</span>
                      <span className="font-medium">{achievementData.name}</span>
                    </div>
                    <span className="text-sm text-green-600">+{achievementData.reward}🪙</span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
});

AchievementsTab.displayName = 'AchievementsTab';
export default AchievementsTab;
