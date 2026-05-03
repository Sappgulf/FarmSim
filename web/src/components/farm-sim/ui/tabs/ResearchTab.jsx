import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { getContentManager } from '../../../../content/ContentManager';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

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

  const projectCount = Object.keys(RESEARCH_PROJECTS).length;
  const completedCount = state.research?.completed?.length || 0;
  const labFullyComplete =
    projectCount > 0 &&
    completedCount >= projectCount &&
    !activeResearch;

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
      <TabHero
        icon="🔬"
        tone="sky"
        title="Research Laboratory"
        description="Track projects, unlock upgrades, and keep the lab moving."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-sky-700 border-sky-200">
            {activeResearch ? '🔄 Researching' : '⏸️ Idle'}
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="sky"
            label="Completed"
            value={`${state.research?.completed?.length || 0}/${Object.keys(RESEARCH_PROJECTS).length}`}
            hint="Finished projects"
            icon="✓"
          />
          <MetricTile
            tone="violet"
            label="Active"
            value={activeResearch ? RESEARCH_PROJECTS[activeResearch]?.name || 'Working' : 'Idle'}
            hint={activeResearch ? 'Current project' : 'No project running'}
            icon="⚙️"
          />
          <MetricTile
            tone="emerald"
            label="Remaining"
            value={Object.keys(RESEARCH_PROJECTS).length - (state.research?.completed?.length || 0)}
            hint="Ready to discover"
            icon="📚"
          />
        </div>
      </TabHero>

      {/* Active Research */}
      {activeResearch && (
        <TabSection
          title="Active Research"
          description="The current project is still running."
          tone="amber"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{RESEARCH_PROJECTS[activeResearch].emoji}</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{RESEARCH_PROJECTS[activeResearch].name}</div>
              <div className="text-sm text-gray-600">
                Time Left: {getTimeLeft(activeResearch)}
              </div>
            </div>
          </div>

          <Progress value={getResearchProgress(activeResearch)} className="mb-2" />
          <div className="text-xs text-center text-gray-600">
            {Math.round(getResearchProgress(activeResearch))}% Complete
          </div>
        </TabSection>
      )}

      {/* Research Projects */}
      <TabSection
        title="Research Projects"
        description="Pick the next project that matters most to your farm."
        tone="sky"
      >
        {labFullyComplete ? (
          <TabEmptyState
            icon="🏆"
            tone="violet"
            title="Research tree complete"
            description="You've finished every lab project for now. Check Achievements or the Almanac for your next milestones."
            action={(
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => typeof window.switchToTab === 'function' && window.switchToTab('achievements')}
              >
                Open Achievements
              </Button>
            )}
          />
        ) : (
        <div className="space-y-3">
          {Object.entries(RESEARCH_PROJECTS).map(([id, research]) => {
            const available = canResearch(id);
            const completed = isCompleted(id);
            const researching = isResearching(id);

            return (
              <Card key={id} className={`p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${getCategoryColor(research.category)}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{research.emoji}</span>
                    <span className="font-medium text-slate-900">{research.name}</span>
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
                    className="w-full min-h-[44px]"
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
        )}
      </TabSection>

      <TabSection
        title="Research Snapshot"
        description="A quick readout of the lab’s progress."
        tone="slate"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile
            tone="sky"
            label="Projects Completed"
            value={state.research?.completed?.length || 0}
            hint="Unlocked by progress"
            icon="✓"
          />
          <MetricTile
            tone="emerald"
            label="Projects Remaining"
            value={Object.keys(RESEARCH_PROJECTS).length - (state.research?.completed?.length || 0)}
            hint="Still waiting in the queue"
            icon="📚"
          />
        </div>
      </TabSection>
    </div>
  );
});

ResearchTab.displayName = 'ResearchTab';
export default ResearchTab;
