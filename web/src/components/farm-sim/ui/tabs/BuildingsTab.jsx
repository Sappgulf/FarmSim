import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const BUILDING_DEFS = [
  {
    id: 'well', name: 'Water Well', emoji: '💧', baseCost: 150, requiredLevel: 10,
    description: 'Reduces water needs by 50% + weather protection',
    benefit: '-50% Water', category: 'Utility', maxLevel: 3,
    upgrades: [
      { level: 2, cost: 300, label: 'Deep Well', bonus: '-70% Water' },
      { level: 3, cost: 600, label: 'Artesian Well', bonus: '-90% Water' },
    ],
  },
  {
    id: 'silo', name: 'Silo', emoji: '🗼', baseCost: 200, requiredLevel: 3,
    description: 'Auto-sell crops when storage is full',
    benefit: 'Auto-sell', category: 'Storage', maxLevel: 3,
    upgrades: [
      { level: 2, cost: 400, label: 'Large Silo', bonus: '+10% sell price' },
      { level: 3, cost: 800, label: 'Mega Silo', bonus: '+25% sell price' },
    ],
  },
  {
    id: 'barn', name: 'Barn', emoji: '🏚️', baseCost: 350, requiredLevel: 8,
    description: '+20% harvest value + disease protection',
    benefit: '+20% Value', category: 'Production', maxLevel: 3,
    upgrades: [
      { level: 2, cost: 700, label: 'Big Barn', bonus: '+35% Value' },
      { level: 3, cost: 1400, label: 'Grand Barn', bonus: '+50% Value' },
    ],
  },
  {
    id: 'workshop', name: 'Workshop', emoji: '🔧', baseCost: 450, requiredLevel: 5,
    description: 'Unlocks advanced tool crafting',
    benefit: 'Crafting', category: 'Utility', maxLevel: 3,
    upgrades: [
      { level: 2, cost: 900, label: 'Forge', bonus: '-20% tool cost' },
      { level: 3, cost: 1800, label: 'Master Forge', bonus: '-40% tool cost' },
    ],
  },
  {
    id: 'greenhouse', name: 'Greenhouse', emoji: '🏠', baseCost: 600, requiredLevel: 13,
    description: '+50% growth + weather damage immunity!',
    benefit: '+50% Growth', category: 'Production', maxLevel: 3,
    upgrades: [
      { level: 2, cost: 1200, label: 'Advanced Greenhouse', bonus: '+75% Growth' },
      { level: 3, cost: 2400, label: 'Crystal Greenhouse', bonus: '+100% Growth' },
    ],
  },
  {
    id: 'windmill', name: 'Windmill', emoji: '🏭', baseCost: 800, requiredLevel: 16,
    description: 'Processes crops into premium goods',
    benefit: '+2x Value', category: 'Processing', maxLevel: 3,
    upgrades: [
      { level: 2, cost: 1600, label: 'Steam Mill', bonus: '+2.5x Value' },
      { level: 3, cost: 3200, label: 'Auto Mill', bonus: '+3x Value' },
    ],
  },
];

const SYNERGIES = [
  { ids: ['well', 'greenhouse'], name: 'Hydro Garden', bonus: '+15% growth speed', icon: '💦' },
  { ids: ['barn', 'silo'], name: 'Supply Chain', bonus: '+10% sell value', icon: '📦' },
  { ids: ['workshop', 'windmill'], name: 'Industrial Hub', bonus: '-15% processing time', icon: '⚙️' },
  { ids: ['well', 'barn', 'greenhouse'], name: 'Full Farm', bonus: '+20% all yields', icon: '🌾' },
];

const BuildingsTab = memo(() => {
  const { state, actions } = useGame();

  const getBuildingState = (id) => state.buildings[id] || null;
  const getBuildingLevel = (id) => state.buildings[id]?.level || 0;

  const activeSynergies = useMemo(() => {
    return SYNERGIES.filter((syn) =>
      syn.ids.every((id) => state.buildings[id]?.built)
    );
  }, [state.buildings]);

  const builtCount = useMemo(() =>
    Object.keys(state.buildings).filter((id) => state.buildings[id]?.built).length,
    [state.buildings]
  );

  const handleBuild = (building) => {
    if (building.requiredLevel && state.level < building.requiredLevel) {
      actions.addNotification({ message: `Reach Level ${building.requiredLevel} to unlock ${building.name}!`, type: 'warning' });
      return;
    }
    if (state.buildings[building.id]?.built) {
      actions.addNotification({ message: `${building.name} is already built!`, type: 'warning' });
      return;
    }
    if (state.coins < building.baseCost) {
      actions.addNotification({ message: `Not enough coins! Need ${building.baseCost}`, type: 'error' });
      return;
    }
    actions.spendMoney(building.baseCost);
    actions.updateBuildings({
      ...state.buildings,
      [building.id]: { built: true, level: 1, builtAt: Date.now() },
    });
    if (typeof window.triggerParticleEffect === 'function') {
      setTimeout(() => {
        const el = document.querySelector(`[data-building-id="${building.id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          window.triggerParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'plant', { shake: false });
        }
      }, 50);
    }
    actions.addNotification({ message: `Built ${building.emoji} ${building.name}!`, type: 'success' });
    actions.addXP(20, { source: 'milestone', label: 'Building Upgrade' });
  };

  const handleUpgrade = (building, upgrade) => {
    const currentLevel = getBuildingLevel(building.id);
    if (currentLevel < upgrade.level - 1) return;
    if (currentLevel >= upgrade.level) {
      actions.addNotification({ message: `Already at ${upgrade.label}!`, type: 'warning' });
      return;
    }
    if (state.coins < upgrade.cost) {
      actions.addNotification({ message: `Not enough coins! Need ${upgrade.cost}`, type: 'error' });
      return;
    }
    actions.spendMoney(upgrade.cost);
    actions.updateBuildings({
      ...state.buildings,
      [building.id]: { ...state.buildings[building.id], level: upgrade.level },
    });
    actions.addNotification({ message: `${building.emoji} Upgraded to ${upgrade.label}!`, type: 'success' });
    actions.addXP(25, { source: 'milestone', label: `${building.name} Upgrade` });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Production': return 'bg-green-50 border-green-200';
      case 'Storage': return 'bg-blue-50 border-blue-200';
      case 'Processing': return 'bg-purple-50 border-purple-200';
      case 'Utility': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Farm Overview */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-800">Farm Buildings</h3>
            <p className="text-sm text-amber-600">Construct and upgrade buildings</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{builtCount}/{BUILDING_DEFS.length}</div>
            <div className="text-xs text-gray-600">Constructed</div>
          </div>
        </div>
      </Card>

      {/* Active Synergies */}
      {activeSynergies.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h4 className="font-semibold mb-2 text-indigo-800">Active Synergies</h4>
          <div className="space-y-1.5">
            {activeSynergies.map((syn) => (
              <div key={syn.name} className="flex items-center gap-2 text-sm p-2 bg-white/70 rounded-lg">
                <span className="text-lg">{syn.icon}</span>
                <span className="font-medium text-indigo-700">{syn.name}</span>
                <Badge variant="outline" className="ml-auto text-[10px] text-indigo-600">{syn.bonus}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Buildings */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Available Buildings</h4>
        <div className="space-y-3">
          {BUILDING_DEFS.map((building) => {
            const bState = getBuildingState(building.id);
            const isBuilt = bState?.built;
            const currentLevel = bState?.level || 0;
            const canAfford = state.coins >= building.baseCost;
            const isLocked = building.requiredLevel && state.level < building.requiredLevel;
            const nextUpgrade = isBuilt
              ? building.upgrades.find((u) => u.level === currentLevel + 1)
              : null;

            return (
              <Card
                key={building.id}
                data-building-id={building.id}
                className={`p-3 border-2 transition-all ${
                  isBuilt
                    ? 'bg-green-50 border-green-300'
                    : isLocked
                    ? 'bg-gray-50 border-gray-300 opacity-60'
                    : getCategoryColor(building.category)
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{isLocked ? '🔒' : building.emoji}</span>
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {building.name}
                        {building.requiredLevel && (
                          <Badge variant="outline" className="text-xs">Lv.{building.requiredLevel}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{building.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {isBuilt ? (
                      <Badge className="bg-green-600">Lv.{currentLevel}/{building.maxLevel}</Badge>
                    ) : isLocked ? (
                      <Badge className="bg-gray-400">Locked</Badge>
                    ) : (
                      <Badge variant="outline">{building.benefit}</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-2">{building.description}</p>

                {/* Upgrade tier progress */}
                {isBuilt && (
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: building.maxLevel }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < currentLevel ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Active bonus for current level */}
                {isBuilt && currentLevel >= 2 && (
                  <div className="text-xs text-green-700 mb-2 font-medium">
                    Active: {building.upgrades.find((u) => u.level === currentLevel)?.bonus || building.benefit}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {!isBuilt && (
                    <>
                      <div className="text-sm">
                        <span className="font-semibold">Cost:</span> {building.baseCost}
                      </div>
                      <Button
                        onClick={() => handleBuild(building)}
                        size="sm"
                        disabled={!canAfford || isLocked}
                        className={canAfford && !isLocked ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {isLocked
                          ? `Level ${building.requiredLevel}`
                          : canAfford
                          ? 'Build Now'
                          : `Need ${building.baseCost}`}
                      </Button>
                    </>
                  )}

                  {isBuilt && nextUpgrade && (
                    <>
                      <div className="text-sm">
                        <span className="font-medium text-blue-700">{nextUpgrade.label}:</span>{' '}
                        <span className="text-xs text-gray-600">{nextUpgrade.bonus}</span>
                      </div>
                      <Button
                        onClick={() => handleUpgrade(building, nextUpgrade)}
                        size="sm"
                        disabled={state.coins < nextUpgrade.cost}
                        className={state.coins >= nextUpgrade.cost ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        {state.coins >= nextUpgrade.cost
                          ? `Upgrade ${nextUpgrade.cost}`
                          : `Need ${nextUpgrade.cost}`}
                      </Button>
                    </>
                  )}

                  {isBuilt && !nextUpgrade && (
                    <div className="text-sm text-green-700 font-medium w-full text-center">
                      Max Level
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Synergy Guide */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">Synergy Guide</h4>
        <div className="space-y-2 text-sm">
          {SYNERGIES.map((syn) => {
            const active = syn.ids.every((id) => state.buildings[id]?.built);
            const progress = syn.ids.filter((id) => state.buildings[id]?.built).length;
            return (
              <div key={syn.name} className={`flex items-center justify-between p-2 rounded-lg ${active ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span>{syn.icon}</span>
                  <span className={active ? 'text-green-700 font-medium' : 'text-gray-600'}>{syn.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{progress}/{syn.ids.length}</span>
                  {active && <Badge className="bg-green-600 text-[10px]">{syn.bonus}</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
});

BuildingsTab.displayName = 'BuildingsTab';
export default BuildingsTab;
