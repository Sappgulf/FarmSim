import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const EXPANSION_COSTS = { 3: 60, 4: 180 };
const MAX_SIZE = 5;

const PLOT_ZONES = [
  { id: 'fertile', name: 'Fertile Soil', emoji: '🌱', description: '+25% growth speed in this zone', color: 'bg-green-100 border-green-300' },
  { id: 'irrigated', name: 'Irrigated', emoji: '💧', description: 'Water drains 50% slower', color: 'bg-blue-100 border-blue-300' },
  { id: 'decor', name: 'Decor Garden', emoji: '🪴', description: 'Dedicated decor area, no crop competition', color: 'bg-rose-100 border-rose-300' },
  { id: 'experimental', name: 'Experimental', emoji: '🔬', description: '+10% mutation chance for genetics', color: 'bg-purple-100 border-purple-300' },
];

const EXPANSION_MILESTONES = [
  { id: 'first_expand', name: 'Growing Pains', description: 'Expand farm to 4x4', condition: (size) => size >= 4, reward: '+30 XP' },
  { id: 'full_expand', name: 'Farm Master', description: 'Reach maximum 5x5 farm', condition: (size) => size >= 5, reward: '+50 XP' },
  { id: 'sixteen_plots', name: 'Sweet Sixteen', description: 'Own 16+ plots', condition: (size) => size * size >= 16, reward: 'Plot specialization' },
  { id: 'quarter_century', name: 'Quarter Acre', description: 'Own 25 plots', condition: (size) => size * size >= 25, reward: 'All zones unlocked' },
];

const ExpandTab = memo(() => {
  const { state, actions } = useGame();

  const expansionCost = EXPANSION_COSTS[state.gridSize] || 0;
  const currentPlots = state.gridSize * state.gridSize;
  const nextPlots = state.gridSize < MAX_SIZE ? (state.gridSize + 1) * (state.gridSize + 1) : currentPlots;

  const plotStats = useMemo(() => {
    const plots = Array.isArray(state.plots) ? state.plots : [];
    const planted = plots.filter((p) => p.state === 'planted' || p.state === 'growing').length;
    const ready = plots.filter((p) => p.state === 'ready').length;
    const decor = plots.filter((p) => p.state === 'decor').length;
    const empty = plots.filter((p) => p.state === 'empty').length;
    return { planted, ready, decor, empty, total: plots.length };
  }, [state.plots]);

  const completedMilestones = useMemo(() =>
    EXPANSION_MILESTONES.filter((m) => m.condition(state.gridSize)),
    [state.gridSize]
  );

  const handleExpand = () => {
    if (state.gridSize >= MAX_SIZE) return;
    if (state.coins < expansionCost) {
      actions.addNotification({ message: `Not enough coins! Need ${expansionCost}`, type: 'error' });
      return;
    }
    actions.spendMoney(expansionCost);
    actions.setGridSize(state.gridSize + 1);
    actions.addXP(30, { source: 'milestone', label: 'Farm Expansion' });
    actions.addNotification({ message: `Farm expanded to ${state.gridSize + 1}x${state.gridSize + 1}!`, type: 'success' });
  };

  return (
    <div className="space-y-4">
      {/* Current Farm Status */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-800">Farm Expansion</h3>
            <p className="text-sm text-green-700">Grow your farm and specialize plots</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {state.gridSize}x{state.gridSize}
            </div>
            <div className="text-xs text-gray-600">{currentPlots} Plots</div>
          </div>
        </div>
      </Card>

      {/* Plot Usage Overview */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Plot Usage</h4>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-green-50 rounded-lg text-center">
            <div className="text-lg font-bold text-green-700">{plotStats.planted}</div>
            <div className="text-xs text-green-600">Growing</div>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg text-center">
            <div className="text-lg font-bold text-amber-700">{plotStats.ready}</div>
            <div className="text-xs text-amber-600">Ready</div>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg text-center">
            <div className="text-lg font-bold text-rose-700">{plotStats.decor}</div>
            <div className="text-xs text-rose-600">Decor</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg text-center">
            <div className="text-lg font-bold text-gray-700">{plotStats.empty}</div>
            <div className="text-xs text-gray-600">Empty</div>
          </div>
        </div>
        {/* Usage bar */}
        {plotStats.total > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden">
            {plotStats.planted > 0 && <div className="bg-green-500" style={{ width: `${(plotStats.planted / plotStats.total) * 100}%` }} />}
            {plotStats.ready > 0 && <div className="bg-amber-500" style={{ width: `${(plotStats.ready / plotStats.total) * 100}%` }} />}
            {plotStats.decor > 0 && <div className="bg-rose-400" style={{ width: `${(plotStats.decor / plotStats.total) * 100}%` }} />}
            {plotStats.empty > 0 && <div className="bg-gray-300" style={{ width: `${(plotStats.empty / plotStats.total) * 100}%` }} />}
          </div>
        )}
      </Card>

      {/* Expansion Options */}
      {state.gridSize >= MAX_SIZE ? (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h4 className="text-xl font-bold text-orange-800 mb-2">Maximum Size Reached!</h4>
            <p className="text-orange-700 mb-2">
              Your farm is at its maximum size of {MAX_SIZE}x{MAX_SIZE} ({currentPlots} plots)
            </p>
            <Badge className="bg-orange-600">Farm Master</Badge>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Upgrade Available</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-center">
              <div className="text-sm text-gray-600 mb-1">Current</div>
              <div className="text-2xl font-bold text-gray-800">{state.gridSize}x{state.gridSize}</div>
              <div className="text-xs text-gray-500">{currentPlots} plots</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300 text-center">
              <div className="text-sm text-green-700 mb-1">Next</div>
              <div className="text-2xl font-bold text-green-800">{state.gridSize + 1}x{state.gridSize + 1}</div>
              <div className="text-xs text-green-600">
                {nextPlots} plots (+{nextPlots - currentPlots})
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-700">Expansion Cost:</span>
              <span className="font-bold text-gray-900">{expansionCost}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Your Balance:</span>
              <span className={`font-bold ${state.coins >= expansionCost ? 'text-green-600' : 'text-red-600'}`}>
                {state.coins}
              </span>
            </div>
          </div>

          <Button
            onClick={handleExpand}
            disabled={state.coins < expansionCost}
            className={`w-full ${state.coins >= expansionCost ? 'bg-green-600 hover:bg-green-700' : ''}`}
            size="lg"
          >
            {state.coins >= expansionCost
              ? `Expand Farm (${expansionCost})`
              : `Need ${expansionCost - state.coins} more coins`}
          </Button>
        </Card>
      )}

      {/* Plot Zones Guide */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Plot Zones</h4>
        <p className="text-xs text-gray-500 mb-3">Specialization zones unlock as you expand your farm.</p>
        <div className="space-y-2">
          {PLOT_ZONES.map((zone) => {
            const unlocked = state.gridSize >= 4;
            return (
              <div key={zone.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${unlocked ? zone.color : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                <span className="text-2xl">{unlocked ? zone.emoji : '🔒'}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center gap-2">
                    {zone.name}
                    {!unlocked && <Badge variant="outline" className="text-[10px]">4x4+</Badge>}
                  </div>
                  <div className="text-xs text-gray-600">{zone.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Expansion Milestones */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Expansion Milestones</h4>
        <div className="space-y-2">
          {EXPANSION_MILESTONES.map((milestone) => {
            const completed = milestone.condition(state.gridSize);
            return (
              <div key={milestone.id} className={`flex items-center justify-between p-2 rounded-lg ${completed ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{completed ? '✓' : '○'}</span>
                  <div>
                    <div className={`text-sm font-medium ${completed ? 'text-green-700' : 'text-gray-600'}`}>
                      {milestone.name}
                    </div>
                    <div className="text-xs text-gray-500">{milestone.description}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{milestone.reward}</Badge>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-gray-500 text-center">
          {completedMilestones.length}/{EXPANSION_MILESTONES.length} milestones completed
        </div>
      </Card>
    </div>
  );
});

ExpandTab.displayName = 'ExpandTab';
export default ExpandTab;
