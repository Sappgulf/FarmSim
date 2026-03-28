import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { getContentManager } from '../../../../content/ContentManager';
import { TabHero, MetricTile } from './TabSurface';

const toBuildingDefs = (items = []) => (
  items.map((item) => {
    const costs = Array.isArray(item.costs) ? item.costs : [];
    const bonuses = Array.isArray(item.bonuses) ? item.bonuses : [];
    return {
      id: item.id,
      name: item.name,
      emoji: item.emoji || item.icon || '🏗️',
      baseCost: costs[0] || 0,
      requiredLevel: Number(item.requiredLevel || 1),
      description: item.description || '',
      benefit: bonuses[0] || '',
      category: item.category || 'Utility',
      maxLevel: Number(item.maxLevel || costs.length || 1),
      upgrades: costs.slice(1).map((cost, idx) => ({
        level: idx + 2,
        cost,
        label: `Level ${idx + 2}`,
        bonus: bonuses[idx + 1] || '',
      })),
    };
  })
);

const toSynergies = (items = []) => (
  items.map((item) => ({
    ids: item.buildingIds || [],
    name: item.name,
    bonus: item.bonus || '',
    icon: item.icon || '✨',
  }))
);

const BuildingsTab = memo(() => {
  const { state, actions } = useGame();
  const content = getContentManager();
  const BUILDING_DEFS = useMemo(() => toBuildingDefs(content.buildings || []), [content.buildings]);
  const SYNERGIES = useMemo(() => toSynergies(content.buildingSynergies || []), [content.buildingSynergies]);

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
      <TabHero
        icon="🏗️"
        tone="amber"
        title="Farm Buildings"
        description="Construct, upgrade, and stack synergies across your farm."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            {builtCount}/{BUILDING_DEFS.length} built
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Constructed"
            value={`${builtCount}/${BUILDING_DEFS.length}`}
            hint="Finished structures"
            icon="🏠"
          />
          <MetricTile
            tone="sky"
            label="Player Level"
            value={state.level}
            hint="Unlocks more builds"
            icon="⭐"
          />
          <MetricTile
            tone="emerald"
            label="Synergies"
            value={activeSynergies.length}
            hint="Passive bonuses live"
            icon="✨"
          />
        </div>
      </TabHero>

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
      <Card className="p-4 bg-slate-50/80">
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
