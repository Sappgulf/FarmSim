import React, { memo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { getContentManager } from '../../../../content/ContentManager';
import { TabHero, MetricTile, TabSection } from './TabSurface';
import {
  SPECIALIZATION_ORDER,
  SPECIALIZATION_PATHS,
  canSelectSpecialization,
  getCompletedResearchCount,
  getFarmSpecialization,
  getSpecializationModifiers,
  getSpecializationSwitchCost,
  getUnlockedSpecializationIds,
} from '../../../../utils/farmSpecializations';

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

const getSpecializationToneClass = (specializationId) => {
  switch (specializationId) {
    case 'crops':
      return 'border-emerald-200 bg-emerald-50/70';
    case 'livestock':
      return 'border-amber-200 bg-amber-50/70';
    case 'processing':
      return 'border-orange-200 bg-orange-50/70';
    case 'hybrid':
      return 'border-sky-200 bg-sky-50/70';
    case 'cozy':
      return 'border-rose-200 bg-rose-50/70';
    default:
      return 'border-slate-200 bg-slate-50/70';
  }
};

const ResearchTab = memo(() => {
  const { state, actions } = useGame();
  const content = getContentManager();
  const RESEARCH_PROJECTS = buildResearchMap(content.research || []);
  const RESEARCH_NAMES = Object.fromEntries(Object.values(RESEARCH_PROJECTS).map((entry) => [entry.id, entry.name]));
  const specializationModifiers = getSpecializationModifiers(state);
  const selectedSpecialization = getFarmSpecialization(state);
  const unlockedSpecializations = getUnlockedSpecializationIds(state);
  const completedResearchCount = getCompletedResearchCount(state);
  const activeSpecializationId = selectedSpecialization?.id || state.research?.specialization?.chosenId || null;
  const switchCost = getSpecializationSwitchCost(state);

  // Use research state from global state
  const activeResearch = state.research?.active || null;
  const researchStartTime = state.research?.startTime || null;

  const getEffectiveResearchDuration = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];
    if (!research) return 1;
    return Math.max(1, research.time / Math.max(1, specializationModifiers.researchSpeedMultiplier || 1));
  };

  // Research progress simulation
  useEffect(() => {
    if (!activeResearch || !researchStartTime) return;

    const research = RESEARCH_PROJECTS[activeResearch];
    if (!research) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - researchStartTime;
      const duration = getEffectiveResearchDuration(activeResearch);
      const progress = Math.min(100, (elapsed / (duration * 10)) * 100); // Scale time for demo

      if (progress >= 100) {
        completeResearch(activeResearch);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeResearch, researchStartTime, specializationModifiers.researchSpeedMultiplier]);

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
    const xpReward = Math.floor(research.cost * 0.5 * (specializationModifiers.researchXpMultiplier || 1));
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

    const elapsed = Date.now() - researchStartTime;
    const duration = getEffectiveResearchDuration(researchId);
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

    const elapsed = Date.now() - researchStartTime;
    const remaining = Math.max(0, (getEffectiveResearchDuration(researchId) * 10) - elapsed);
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

  const handleSelectSpecialization = (specializationId) => {
    const path = SPECIALIZATION_PATHS[specializationId];
    if (!path) return;

    if (!canSelectSpecialization(state, specializationId)) {
      actions.addNotification({
        message: `Need level ${path.unlock.level} and ${path.unlock.completedResearch} completed projects.`,
        type: 'warning',
      });
      return;
    }

    if (activeSpecializationId === specializationId) {
      return;
    }

    const selectionCost = activeSpecializationId ? switchCost : 0;
    if (selectionCost > 0 && state.coins < selectionCost) {
      actions.addNotification({
        message: `Need ${selectionCost}🪙 to retool the lab focus.`,
        type: 'error',
      });
      return;
    }

    if (selectionCost > 0) {
      actions.spendMoney(selectionCost);
    }

    const previousHistory = Array.isArray(state.research?.specialization?.history)
      ? state.research.specialization.history
      : [];
    const nextHistory = [
      ...previousHistory,
      {
        id: specializationId,
        changedAt: Date.now(),
        cost: selectionCost,
      },
    ].slice(-8);

    actions.updateResearch({
      ...state.research,
      specialization: {
        chosenId: specializationId,
        changedAt: Date.now(),
        history: nextHistory,
      },
    });

    actions.addNotification({
      message: `${path.icon} ${path.name} is now guiding the farm.`,
      type: 'success',
    });
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

      <TabSection
        title="Farm Paths"
        description="Commit the lab to a style of farm and let that choice shape the sim."
        tone="violet"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="violet"
            label="Active Path"
            value={selectedSpecialization?.name || 'Uncommitted'}
            hint={selectedSpecialization ? selectedSpecialization.tagline : 'Choose a specialty once the lab matures'}
            icon={selectedSpecialization?.icon || '🧭'}
          />
          <MetricTile
            tone="sky"
            label="Unlocked"
            value={`${unlockedSpecializations.length}/${SPECIALIZATION_ORDER.length}`}
            hint="Paths available right now"
            icon="🔓"
          />
          <MetricTile
            tone="amber"
            label="Lab Depth"
            value={`${completedResearchCount} projects`}
            hint="Completed research milestone count"
            icon="🧪"
          />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {SPECIALIZATION_ORDER.map((specializationId) => {
            const path = SPECIALIZATION_PATHS[specializationId];
            const unlocked = canSelectSpecialization(state, specializationId);
            const selected = activeSpecializationId === specializationId;
            const actionLabel = selected
              ? 'Active focus'
              : activeSpecializationId
                ? `Switch (${switchCost}🪙)`
                : 'Commit focus';

            return (
              <Card
                key={specializationId}
                className={`rounded-[28px] border p-4 shadow-sm transition-all ${getSpecializationToneClass(specializationId)} ${selected ? 'ring-2 ring-offset-2 ring-slate-300' : ''} ${!unlocked ? 'opacity-80' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{path.icon}</span>
                      <span className="font-semibold text-slate-900">{path.name}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{path.tagline}</p>
                  </div>
                  {selected ? (
                    <Badge className="bg-slate-900 text-white">Active</Badge>
                  ) : unlocked ? (
                    <Badge variant="outline" className="bg-white/80">Ready</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-white/70">Locked</Badge>
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-600">{path.description}</p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white/80 px-2.5 py-1">
                    Lvl {path.unlock.level}
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1">
                    {path.unlock.completedResearch} research done
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {path.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl bg-white/75 px-3 py-2 text-sm text-slate-700">
                      {highlight}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => handleSelectSpecialization(specializationId)}
                    size="sm"
                    disabled={!unlocked || selected}
                    className="w-full"
                  >
                    {actionLabel}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </TabSection>

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
                  <span>Time: {Math.round(getEffectiveResearchDuration(id) / 60)}m</span>
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
      </TabSection>

      <TabSection
        title="Research Snapshot"
        description="A quick readout of the lab’s progress."
        tone="slate"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="sky"
            label="Projects Completed"
            value={state.research?.completed?.length || 0}
            hint="Unlocked by progress"
            icon="✓"
          />
          <MetricTile
            tone="violet"
            label="Current Path"
            value={selectedSpecialization?.name || 'Open'}
            hint={selectedSpecialization ? selectedSpecialization.tagline : 'No specialization chosen yet'}
            icon={selectedSpecialization?.icon || '🧭'}
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
