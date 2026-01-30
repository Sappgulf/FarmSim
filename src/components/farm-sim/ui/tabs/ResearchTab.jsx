import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useTick } from '../../context/TickContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

// Mapping for unlock IDs to user-friendly names
const UNLOCK_NAMES = {
  premium_seeds: 'Premium Seeds',
  auto_irrigation: 'Auto Irrigation',
  resistant_crops: 'Pest-Resistant Crops',
  price_alerts: 'Price Alerts',
  trend_analysis: 'Trend Analysis',
  weather_immunity: 'Weather Immunity',
  fertility_boost: 'Fertility Boost',
  basic_automation: 'Basic Automation'
};

// Mapping for research IDs to user-friendly names (for prerequisites)
const RESEARCH_NAMES = {
  hybrid_crops: 'Hybrid Crops',
  irrigation_system: 'Advanced Irrigation',
  pest_genetics: 'Pest Genetics',
  market_analytics: 'Market Analytics',
  climate_control: 'Climate Control',
  soil_enhancement: 'Soil Enhancement',
  automation_core: 'Automation Core'
};

// Helper function to format unlock names
const formatUnlocks = (unlocks) => {
  return unlocks.map(id => UNLOCK_NAMES[id] || id).join(', ');
};

// Helper function to format research names (for prerequisites)
const formatResearchNames = (ids) => {
  return ids.map(id => RESEARCH_NAMES[id] || id).join(', ');
};

// Research projects from original system
const RESEARCH_PROJECTS = {
  hybrid_crops: {
    id: 'hybrid_crops',
    name: "Hybrid Crops",
    emoji: "🧬",
    description: "Develop superior crop varieties",
    cost: 100,
    time: 300, // 5 minutes
    unlocks: ["premium_seeds"],
    prerequisites: [],
    category: "genetics",
    completed: false,
    progress: 0,
    started: false
  },
  irrigation_system: {
    id: 'irrigation_system',
    name: "Advanced Irrigation",
    emoji: "💧",
    description: "Automated watering systems",
    cost: 150,
    time: 480,
    unlocks: ["auto_irrigation"],
    prerequisites: ["hybrid_crops"],
    category: "technology",
    completed: false,
    progress: 0,
    started: false
  },
  pest_genetics: {
    id: 'pest_genetics',
    name: "Pest Genetics",
    emoji: "🧪",
    description: "Genetic pest resistance",
    cost: 200,
    time: 600,
    unlocks: ["resistant_crops"],
    prerequisites: ["hybrid_crops"],
    category: "genetics",
    completed: false,
    progress: 0,
    started: false
  },
  market_analytics: {
    id: 'market_analytics',
    name: "Market Analytics",
    emoji: "📊",
    description: "Advanced market prediction AI",
    cost: 250,
    time: 720,
    unlocks: ["price_alerts", "trend_analysis"],
    prerequisites: [],
    category: "economics",
    completed: false,
    progress: 0,
    started: false
  },
  climate_control: {
    id: 'climate_control',
    name: "Climate Control",
    emoji: "🌡️",
    description: "Weather-independent farming",
    cost: 400,
    time: 900,
    unlocks: ["weather_immunity"],
    prerequisites: ["irrigation_system", "pest_genetics"],
    category: "technology",
    completed: false,
    progress: 0,
    started: false
  },
  soil_enhancement: {
    id: 'soil_enhancement',
    name: "Soil Enhancement",
    emoji: "🌱",
    description: "Advanced soil fertility techniques",
    cost: 180,
    time: 540,
    unlocks: ["fertility_boost"],
    prerequisites: [],
    category: "agriculture",
    completed: false,
    progress: 0,
    started: false
  },
  automation_core: {
    id: 'automation_core',
    name: "Automation Core",
    emoji: "🤖",
    description: "Foundation for automated farming",
    cost: 300,
    time: 800,
    unlocks: ["basic_automation"],
    prerequisites: ["irrigation_system"],
    category: "technology",
    completed: false,
    progress: 0,
    started: false
  }
};

const ResearchTab = memo(() => {
  const { state, actions } = useGame();
  const tick = useTick();

  // Use research state from global state
  const activeResearch = state.research?.active || null;
  const researchStartTime = state.research?.startTime || null;
  const completedCount = state.research?.completed?.length || 0;
  const totalProjects = Object.keys(RESEARCH_PROJECTS).length;
  const allResearchCompleted = completedCount >= totalProjects;

  // Research progress simulation (centralized tick)
  useEffect(() => {
    if (!activeResearch || !researchStartTime) return;

    const research = RESEARCH_PROJECTS[activeResearch];
    const elapsed = Date.now() - researchStartTime;
    const progress = Math.min(100, (elapsed / (research.time * 10)) * 100); // Scale time for demo

    if (progress >= 100) {
      completeResearch(activeResearch);
    }
  }, [activeResearch, researchStartTime, tick]);

  const startResearch = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];

    // Check prerequisites
    const hasPrerequisites = research.prerequisites.every(prereq =>
      state.research?.completed?.includes(prereq)
    );

    if (!hasPrerequisites) {
      actions.addNotification({
        message: 'Prerequisites not met!',
        type: 'error'
      });
      return;
    }

    // Check if player has enough coins
    if (state.coins < research.cost) {
      actions.addNotification({
        message: 'Not enough coins!',
        type: 'error'
      });
      return;
    }

    // Deduct cost
    actions.setCoins(state.coins - research.cost);

    // Start research in global state
    const updatedResearch = {
      ...state.research,
      active: researchId,
      startTime: Date.now()
    };
    actions.updateResearch(updatedResearch);

    actions.addNotification({
      message: `Started researching ${research.name}`,
      type: 'info'
    });
  };

  const completeResearch = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];

    // Grant XP reward
    const xpReward = Math.floor(research.cost * 0.5);
    actions.grantXP(xpReward, 'research_complete', { researchId });

    // Mark as completed
    // Update research state - complete project and reset active research
    const updatedResearch = {
      ...state.research,
      completed: [...(state.research?.completed || []), researchId],
      active: null,
      startTime: null
    };
    actions.updateResearch(updatedResearch);

    actions.addNotification({
      message: `Research completed: ${research.name}! +${xpReward} XP`,
      type: 'success'
    });
  };

  const getResearchProgress = (researchId) => {
    if (activeResearch !== researchId || !researchStartTime) return 0;

    const research = RESEARCH_PROJECTS[researchId];
    const elapsed = Date.now() - researchStartTime;
    return Math.min(100, (elapsed / (research.time * 10)) * 100);
  };

  const canResearch = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];

    // Check if already completed
    if (state.research?.completed?.includes(researchId)) return false;

    // Check prerequisites
    return research.prerequisites.every(prereq =>
      state.research?.completed?.includes(prereq)
    );
  };

  const isResearching = (researchId) => {
    return activeResearch === researchId;
  };

  const isCompleted = (researchId) => {
    return state.research?.completed?.includes(researchId);
  };

  const getTimeLeft = (researchId) => {
    if (!isResearching(researchId) || !researchStartTime) return '';

    const research = RESEARCH_PROJECTS[researchId];
    const elapsed = Date.now() - researchStartTime;
    const remaining = Math.max(0, (research.time * 10) - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'genetics': return 'border-purple-500 bg-purple-50';
      case 'technology': return 'border-blue-500 bg-blue-50';
      case 'economics': return 'border-green-500 bg-green-50';
      case 'agriculture': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Research Lab Status */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <span className="text-xl">🔬</span> Research Laboratory
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Completed: <span className="font-bold">{completedCount}</span> / {totalProjects}
            </p>
          </div>
          <Badge
            variant={activeResearch ? "default" : "secondary"}
            className={activeResearch ? "bg-blue-600 animate-pulse" : allResearchCompleted ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"}
          >
            {activeResearch ? '🔄 Researching' : allResearchCompleted ? '✅ Fully Researched' : '⏸️ Lab Idle'}
          </Badge>
        </div>
      </Card>

      {allResearchCompleted && !activeResearch && (
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏁</div>
            <div>
              <h4 className="font-semibold text-emerald-900">All research completed</h4>
              <p className="text-sm text-emerald-800/80">
                Every upgrade is unlocked. Focus on production, expansion, and achievements to keep growing your legacy.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Research */}
      {activeResearch && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-800">
            <span className="animate-spin">⚡</span> Active Project
          </h4>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">
              {RESEARCH_PROJECTS[activeResearch].emoji}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900">{RESEARCH_PROJECTS[activeResearch].name}</div>
              <div className="text-sm text-gray-600 font-mono">
                Reviewing results... {getTimeLeft(activeResearch)}
              </div>
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-yellow-600">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-yellow-600">
                  {Math.round(getResearchProgress(activeResearch))}%
                </span>
              </div>
            </div>
            <Progress value={getResearchProgress(activeResearch)} className="h-3 bg-yellow-100" indicatorClassName="bg-yellow-500" />
          </div>
        </Card>
      )}

      {/* Research Projects */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <span>📚</span> Available Projects
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(RESEARCH_PROJECTS).map(([id, research]) => {
            const available = canResearch(id);
            const completed = isCompleted(id);
            const researching = isResearching(id);

            return (
              <div key={id} className={`
                p-3 rounded-xl border-2 transition-all relative overflow-hidden
                ${getCategoryColor(research.category)}
                ${completed ? 'opacity-80' : 'opacity-100'}
                ${researching ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
              `}>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center text-xl backdrop-blur-sm">
                      {research.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">{research.name}</div>
                      <div className="text-[10px] uppercase font-bold tracking-wider opacity-60 mt-0.5">{research.category}</div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {completed && <Badge className="bg-green-500 hover:bg-green-600 border-none shadow-sm">✓ Done</Badge>}
                    {researching && <Badge className="bg-blue-500 hover:bg-blue-600 border-none shadow-sm animate-pulse">Running</Badge>}
                    {!available && !completed && <Badge variant="outline" className="bg-gray-200/50 border-gray-300 text-gray-500">🔒 Locked</Badge>}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 min-h-[40px] leading-snug">{research.description}</p>

                <div className="flex justify-between items-center text-xs font-medium text-gray-600 mb-3 bg-white/40 p-2 rounded-lg">
                  <span className="flex items-center gap-1">💰 {research.cost}</span>
                  <span className="flex items-center gap-1">⏱️ {Math.round(research.time / 60)}m</span>
                </div>

                {/* Prerequisites */}
                {!available && !completed && research.prerequisites.length > 0 && (
                  <div className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded border border-red-100">
                    <span className="font-bold">Missing: </span>
                    {formatResearchNames(research.prerequisites.filter(p => !state.research?.completed?.includes(p)))}
                  </div>
                )}

                {/* Unlocks */}
                {research.unlocks.length > 0 && (
                  <div className="text-xs text-green-700 mb-3 bg-green-50/50 p-1.5 rounded">
                    <span className="font-bold">Unlocks: </span> {formatUnlocks(research.unlocks)}
                  </div>
                )}

                {!completed && !researching && (
                  <Button
                    onClick={() => startResearch(id)}
                    size="sm"
                    disabled={!available || state.coins < research.cost}
                    className="w-full font-semibold shadow-sm"
                    variant={available ? "default" : "secondary"}
                  >
                    {available ? (state.coins < research.cost ? 'Insufficient Coins' : 'Start Research') : 'Locked'}
                  </Button>
                )}

                {researching && (
                  <div className="text-center py-2 bg-blue-50 rounded-lg text-sm text-blue-700 font-bold border border-blue-100">
                    Research in Progress...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Research Statistics */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">📊 Research Statistics</h4>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-blue-600">
              {completedCount}
            </div>
            <div className="text-blue-700">Projects Completed</div>
          </div>

          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">
              {Math.max(0, totalProjects - completedCount)}
            </div>
            <div className="text-green-700">Projects Remaining</div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ResearchTab.displayName = 'ResearchTab';
export default ResearchTab;
