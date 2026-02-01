import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { PLACEABLE_BUILDINGS } from '../../constants/placeableBuildingData';

const BuildingsTab = memo(() => {
  const { state, actions } = useGame();
  const placeableBuildings = PLACEABLE_BUILDINGS;
  const placeBuildingMode = state.placeBuildingMode;
  const selectedPlacement = state.selectedBuildingPlacement;
  const buildingPlacements = Array.isArray(state.buildingPlacements) ? state.buildingPlacements : [];

  const buildings = [
    {
      id: 'well',
      name: 'Water Well',
      emoji: '💧',
      cost: 150,
      requiredLevel: 2,
      description: 'Reduces water needs by 50% + weather protection',
      benefit: '-50% Water',
      category: 'Utility'
    },
    {
      id: 'silo',
      name: 'Silo',
      emoji: '🗼',
      cost: 200,
      requiredLevel: 3,
      description: 'Auto-sell crops when storage is full',
      benefit: 'Auto-sell',
      category: 'Storage'
    },
    {
      id: 'barn',
      name: 'Barn',
      emoji: '🏚️',
      cost: 350,
      requiredLevel: 4,
      description: '+20% harvest value + disease protection',
      benefit: '+20% Value',
      category: 'Production'
    },
    {
      id: 'workshop',
      name: 'Workshop',
      emoji: '🔧',
      cost: 450,
      requiredLevel: 5,
      description: 'Unlocks advanced tool crafting',
      benefit: 'Crafting',
      category: 'Utility'
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      emoji: '🏠',
      cost: 600,
      requiredLevel: 6,
      description: '+50% growth + weather damage immunity!',
      benefit: '+50% Growth',
      category: 'Production'
    },
    {
      id: 'windmill',
      name: 'Windmill',
      emoji: '🏭',
      cost: 800,
      requiredLevel: 7,
      description: 'Processes crops into premium goods',
      benefit: '+2x Value',
      category: 'Processing'
    },
  ];

  const handleBuild = (building) => {
    // Check level requirement
    if (building.requiredLevel && state.level < building.requiredLevel) {
      actions.addNotification({
        message: `🔒 Reach Level ${building.requiredLevel} to unlock ${building.name}!`,
        type: 'warning'
      });
      return;
    }

    if (state.coins >= building.cost && !state.buildings[building.id]) {
      actions.setCoins(state.coins - building.cost);
      actions.updateDailyQuestProgress?.('spend_coins', { amount: building.cost });

      const updatedBuildings = {
        ...state.buildings,
        [building.id]: { built: true, level: 1, builtAt: Date.now() }
      };
      actions.updateBuildings(updatedBuildings);
      const buildingCount = Object.keys(updatedBuildings).filter(id => updatedBuildings[id]?.built).length;
      actions.updateDailyQuestProgress?.('build', { buildingCount });

      // Trigger building construction effect (dust particles + screen shake)
      if (typeof window.triggerParticleEffect === 'function') {
        // Find the button that was clicked and get its position
        setTimeout(() => {
          // Use safe action for particles
          const buildingCard = document.querySelector(`[data-building-id="${building.id}"]`);
          if (buildingCard) {
            const rect = buildingCard.getBoundingClientRect();
            actions.triggerParticles(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
              'plant',
              { shake: false }
            );
          }
        }, 50);

        // Use safe action for sound
        actions.playSound('playPlantSound');
      }

      actions.addNotification({
        message: `Built ${building.emoji} ${building.name}!`,
        type: 'success'
      });
      actions.grantXP(20, 'building_purchase', { buildingId: building.id });
    } else if (state.buildings[building.id]) {
      actions.addNotification({
        message: `${building.name} is already built!`,
        type: 'warning'
      });
    } else {
      actions.addNotification({
        message: `Not enough coins! Need ${building.cost}🪙`,
        type: 'error'
      });
    }
  };

  const handlePlacementToggle = () => {
    const nextMode = !placeBuildingMode;
    actions.setPlaceBuildingMode(nextMode);
    if (nextMode) {
      actions.setDecorateMode(false);
    }
  };

  const handleSelectPlacement = (buildingId) => {
    actions.setSelectedBuildingPlacement(buildingId);
    actions.setPlaceBuildingMode(true);
    actions.setDecorateMode(false);
  };

  const handleClearPlacement = (buildingId) => {
    const nextPlacements = buildingPlacements.filter((placement) => placement.id !== buildingId);
    actions.updateBuildingPlacements(nextPlacements);
    actions.addNotification({
      message: '🏗️ Building placement cleared.',
      type: 'info',
    });
  };

  const builtCount = Object.keys(state.buildings).filter(id => state.buildings[id]?.built).length;

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
      {/* Farm Overview - Premium */}
      <Card className="p-5 bg-gradient-to-br from-amber-50/95 via-yellow-50/90 to-orange-50/95 backdrop-blur-sm border-amber-200/60 shadow-lg shadow-amber-200/30 relative overflow-hidden">
        {/* Decorative crane */}
        <div className="absolute -right-4 -top-2 text-6xl opacity-10 rotate-12">🏗️</div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              🏗️ Farm Buildings
            </h3>
            <p className="text-sm text-amber-700/80 font-medium mt-1">Construct buildings to boost your farm</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {builtCount}/{buildings.length}
            </div>
            <div className="text-xs text-amber-600 font-medium">Constructed</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-indigo-900">🏗️ Place Buildings</h4>
            <p className="text-xs text-indigo-700 mt-1">
              Place up to three cozy buildings on the farm grid for local bonuses.
            </p>
          </div>
          <Button
            size="sm"
            variant={placeBuildingMode ? 'default' : 'outline'}
            onClick={handlePlacementToggle}
            className="min-h-[44px]"
          >
            {placeBuildingMode ? 'Placing' : 'Start Placing'}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {placeableBuildings.map((building) => {
            const isBuilt = Boolean(state.buildings?.[building.id]?.built);
            const placement = buildingPlacements.find((item) => item.id === building.id);
            return (
              <div
                key={building.id}
                className={`rounded-xl border p-3 text-sm ${isBuilt ? 'bg-white/80 border-indigo-200' : 'bg-gray-100 border-gray-200 opacity-70'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{building.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{building.name}</div>
                      <div className="text-[10px] text-gray-500">{building.description}</div>
                    </div>
                  </div>
                  {placement ? (
                    <Badge className="bg-indigo-600">Placed</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Not placed</Badge>
                  )}
                </div>

                {isBuilt ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={selectedPlacement === building.id && placeBuildingMode ? 'default' : 'outline'}
                      onClick={() => handleSelectPlacement(building.id)}
                      className="text-xs"
                    >
                      {placement ? 'Move' : 'Place'}
                    </Button>
                    {placement && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClearPlacement(building.id)}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 text-[10px] text-gray-500">Build this first to place it.</div>
                )}

                {placement && (
                  <div className="mt-2 text-[10px] text-gray-500">
                    Placed at ({placement.x + 1}, {placement.y + 1})
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {placeBuildingMode && (
          <div className="mt-3 text-xs text-indigo-700">
            Tap an empty plot to place the selected building. Buildings cannot overlap crops or decorations.
          </div>
        )}
      </Card>

      {/* Available Buildings */}
      <h4 className="font-semibold px-1 mb-2 text-gray-700">🏘️ Construction Projects</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {buildings.map(building => {
          const isBuilt = state.buildings[building.id]?.built;
          const canAfford = state.coins >= building.cost;
          const isLocked = building.requiredLevel && state.level < building.requiredLevel;

          return (
            <div
              key={building.id}
              data-building-id={building.id}
              className={`
                relative p-4 rounded-xl border-2 transition-all group overflow-hidden
                ${isBuilt
                  ? 'bg-green-50 border-green-400 opacity-90'
                  : isLocked
                    ? 'bg-gray-100 border-gray-200 opacity-70 grayscale-[0.5]'
                    : `bg-white hover:shadow-md ${getCategoryColor(building.category)}`
                }
              `}
            >
              {/* Background Pattern/Decor */}
              <div className="absolute right-0 top-0 opacity-5 text-[5rem] leading-none pointer-events-none select-none">
                {building.emoji}
              </div>

              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-3xl shadow-sm
                    ${isBuilt ? 'bg-white' : 'bg-white/80'}
                  `}>
                    {isLocked ? '🔒' : building.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {building.name}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase bg-white/50 backdrop-blur-sm mt-1">
                      {building.category}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  {state.buildings[building.id]?.builtAt && (
                    <div className="text-[10px] text-gray-500 mb-1">
                      Built Lv.{state.buildings[building.id].level}
                    </div>
                  )}
                  {isBuilt ? (
                    <Badge className="bg-green-600 shadow-sm">✓ Built</Badge>
                  ) : isLocked ? (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-600">Lv.{building.requiredLevel}</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                      {building.benefit}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 min-h-[40px] leading-snug relative z-10">
                {building.description}
              </p>

              <div className="flex justify-between items-center relative z-10">
                {!isBuilt && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Construction Cost</span>
                    <div className={`font-bold ${canAfford ? 'text-gray-900' : 'text-red-600'}`}>
                      {building.cost}🪙
                    </div>
                  </div>
                )}

                {!isBuilt && (
                  <Button
                    onClick={() => handleBuild(building)}
                    size="sm"
                    disabled={!canAfford || isLocked}
                    className={`
                        shadow-sm font-semibold transition-all
                        ${canAfford && !isLocked
                        ? 'bg-green-600 hover:bg-green-700 w-full ml-4'
                        : 'w-full ml-4 opacity-80'
                      }
                    `}
                  >
                    {isLocked
                      ? `Locked (Lv.${building.requiredLevel})`
                      : canAfford
                        ? '🔨 Build'
                        : 'Insufficient Funds'
                    }
                  </Button>
                )}

                {isBuilt && (
                  <div className="w-full text-center py-1.5 bg-green-100/50 rounded-lg border border-green-200 text-sm text-green-800 font-bold flex items-center justify-center gap-2">
                    <span className="animate-pulse">●</span> Operational
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Building Benefits Summary - Premium */}
      {builtCount > 0 && (
        <Card className="p-5 bg-gradient-to-br from-emerald-50/95 via-green-50/90 to-teal-50/95 backdrop-blur-sm border-emerald-200/60 shadow-lg shadow-emerald-200/30">
          <h4 className="font-bold text-lg text-emerald-800 mb-3 flex items-center gap-2">
            ✨ Active Benefits
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {buildings
              .filter(b => state.buildings[b.id]?.built)
              .map(building => (
                <div
                  key={building.id}
                  className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-2xl">{building.emoji}</span>
                  <span className="text-emerald-700 font-bold text-sm">{building.benefit}</span>
                </div>
              ))
            }
          </div>
        </Card>
      )}
    </div>
  );
});

BuildingsTab.displayName = 'BuildingsTab';
export default BuildingsTab;
