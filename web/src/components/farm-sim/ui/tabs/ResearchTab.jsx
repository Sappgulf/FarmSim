import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { getContentManager } from '../../../../content/ContentManager';

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

// Helper function to format unlock names
const formatUnlocks = (unlocks) => {
  return unlocks.map(id => UNLOCK_NAMES[id] || formatDisplayLabel(id)).join(', ');
};

// Helper function to format research names (for prerequisites)
const formatResearchNames = (ids, namesById = {}) => {
  return ids.map(id => namesById[id] || formatDisplayLabel(id)).join(', ');
};

const buildResearchMap = (items = []) => (
  Object.fromEntries(items.map((item) => [
    item.id,
    {
      id: item.id,
      name: item.name,
      emoji: item.emoji || item.icon || '🔬',
      description: item.description || '',
      cost: Number(item.cost || 0),
      time: Number(item.durationSeconds || 0),
      unlocks: Array.isArray(item.unlocks) ? item.unlocks : [],
      prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : [],
      category: item.category || 'general',
    }
  ]))
);

const ResearchTab = memo(() => {
  const { state, actions } = useGame();
  const content = getContentManager();
  const RESEARCH_PROJECTS = buildResearchMap(content.research || []);
  const RESEARCH_NAMES = Object.fromEntries(Object.values(RESEARCH_PROJECTS).map((entry) => [entry.id, entry.name]));

  // Use research state from global state
  const activeResearch = state.research?.active || null;
  const researchStartTime = state.research?.startTime || null;

  // Research progress simulation
  useEffect(() => {
    if (!activeResearch || !researchStartTime) return;

    const research = RESEARCH_PROJECTS[activeResearch];
    if (!research) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - researchStartTime;
      const duration = Math.max(1, research.time);
      const progress = Math.min(100, (elapsed / (duration * 10)) * 100); // Scale time for demo

      if (progress >= 100) {
        completeResearch(activeResearch);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeResearch, researchStartTime]);

  const startResearch = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];
    if (!research) return;

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
    actions.spendMoney(research.cost);

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
    if (!research) return;

    // Grant XP reward
    const xpReward = Math.floor(research.cost * 0.5);
    actions.addXP(xpReward, { source: 'milestone', label: 'Research Complete' });

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
    if (!research) return 0;
    const elapsed = Date.now() - researchStartTime;
    const duration = Math.max(1, research.time);
    return Math.min(100, (elapsed / (duration * 10)) * 100);
  };

  const canResearch = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];
    if (!research) return false;

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
    if (!research) return '';
    const elapsed = Date.now() - researchStartTime;
    const remaining = Math.max(0, (Math.max(1, research.time) * 10) - elapsed);
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
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">🔬 Research Laboratory</h3>
            <p className="text-sm text-blue-700">
              Completed: {state.research?.completed?.length || 0}/{Object.keys(RESEARCH_PROJECTS).length}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            {activeResearch ? '🔄 Researching' : '⏸️ Idle'}
          </Badge>
        </div>
      </Card>

      {/* Active Research */}
      {activeResearch && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h4 className="font-semibold mb-3">⚡ Active Research</h4>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{RESEARCH_PROJECTS[activeResearch].emoji}</span>
            <div className="flex-1">
              <div className="font-semibold">{RESEARCH_PROJECTS[activeResearch].name}</div>
              <div className="text-sm text-gray-600">
                Time Left: {getTimeLeft(activeResearch)}
              </div>
            </div>
          </div>

          <Progress value={getResearchProgress(activeResearch)} className="mb-2" />
          <div className="text-xs text-center text-gray-600">
            {Math.round(getResearchProgress(activeResearch))}% Complete
          </div>
        </Card>
      )}

      {/* Research Projects */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📚 Research Projects</h4>

        <div className="space-y-3">
          {Object.entries(RESEARCH_PROJECTS).map(([id, research]) => {
            const available = canResearch(id);
            const completed = isCompleted(id);
            const researching = isResearching(id);

            return (
              <Card key={id} className={`p-3 ${getCategoryColor(research.category)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{research.emoji}</span>
                    <span className="font-medium">{research.name}</span>
                  </div>

                  <div className="flex gap-1">
                    {completed && <Badge className="bg-green-500">✓ Done</Badge>}
                    {researching && <Badge className="bg-blue-500">🔄 Active</Badge>}
                    {!available && !completed && <Badge variant="outline">🔒 Locked</Badge>}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">{research.description}</p>

                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>Cost: {research.cost}🪙</span>
                  <span>Time: {Math.round(research.time / 60)}m</span>
                </div>

                {/* Prerequisites */}
                {research.prerequisites.length > 0 && (
                  <div className="text-xs text-gray-600 mb-2">
                    Requires: {formatResearchNames(research.prerequisites, RESEARCH_NAMES)}
                  </div>
                )}

                {/* Unlocks */}
                {research.unlocks.length > 0 && (
                  <div className="text-xs text-green-600 mb-2">
                    Unlocks: {formatUnlocks(research.unlocks)}
                  </div>
                )}

                {!completed && !researching && (
                  <Button
                    onClick={() => startResearch(id)}
                    size="sm"
                    disabled={!available || state.coins < research.cost}
                    className="w-full"
                  >
                    {available ? 'Start Research' : 'Prerequisites Required'}
                  </Button>
                )}

                {researching && (
                  <div className="text-center text-sm text-blue-600 font-medium">
                    Researching... ({getTimeLeft(id)})
                  </div>
                )}
              </Card>
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
              {state.research?.completed?.length || 0}
            </div>
            <div className="text-blue-700">Projects Completed</div>
          </div>

          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">
              {Object.keys(RESEARCH_PROJECTS).length - (state.research?.completed?.length || 0)}
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
