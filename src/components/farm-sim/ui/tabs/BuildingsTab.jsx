import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const BuildingsTab = memo(() => {
  const { state, actions } = useGame();

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
      actions.spendMoney(building.cost);
      actions.updateBuildings({
        ...state.buildings,
        [building.id]: { built: true, level: 1, builtAt: Date.now() }
      });
      
      // Trigger building construction effect (dust particles + screen shake)
      if (typeof window.triggerParticleEffect === 'function') {
        // Find the button that was clicked and get its position
        setTimeout(() => {
          const buildingCard = document.querySelector(`[data-building-id="${building.id}"]`);
          if (buildingCard) {
            const rect = buildingCard.getBoundingClientRect();
            window.triggerParticleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'plant', { shake: false });
          }
        }, 50);
      }
      
      // Play construction sound (using plant sound as proxy)
      if (typeof window.soundSystem !== 'undefined') {
        window.soundSystem.playPlantSound();
      }
      
      actions.addNotification({
        message: `Built ${building.emoji} ${building.name}!`,
        type: 'success'
      });
      actions.addXP(20);
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
      {/* Farm Overview */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-800">🏗️ Farm Buildings</h3>
            <p className="text-sm text-amber-600">Construct buildings to boost your farm</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{builtCount}/{buildings.length}</div>
            <div className="text-xs text-gray-600">Constructed</div>
          </div>
        </div>
      </Card>

      {/* Available Buildings */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🏘️ Available Buildings</h4>
        <div className="space-y-3">
          {buildings.map(building => {
            const isBuilt = state.buildings[building.id]?.built;
            const canAfford = state.coins >= building.cost;
            const isLocked = building.requiredLevel && state.level < building.requiredLevel;

            return (
              <Card 
                key={building.id}
                data-building-id={building.id}
                className={`p-3 border-2 transition-all ${
                  isBuilt 
                    ? 'bg-green-50 border-green-300 animate-slide-up' 
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
                          <Badge variant="outline" className="text-xs">
                            Lv.{building.requiredLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{building.category}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isBuilt ? (
                      <Badge className="bg-green-600">✓ Built</Badge>
                    ) : isLocked ? (
                      <Badge className="bg-gray-400">🔒 Locked</Badge>
                    ) : (
                      <Badge variant="outline">{building.benefit}</Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{building.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-semibold">Cost:</span> {building.cost}🪙
                  </div>
                  
                  {!isBuilt && (
                    <Button
                      onClick={() => handleBuild(building)}
                      size="sm"
                      disabled={!canAfford || isLocked}
                      className={canAfford && !isLocked ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {isLocked 
                        ? `🔒 Level ${building.requiredLevel}` 
                        : canAfford 
                        ? '🔨 Build Now' 
                        : `Need ${building.cost}🪙`
                      }
                    </Button>
                  )}
                  
                  {isBuilt && (
                    <div className="text-sm text-green-700 font-medium">
                      🎉 Active
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Building Benefits Summary */}
      {builtCount > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <h4 className="font-semibold mb-3 text-green-800">✨ Active Benefits</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {buildings
              .filter(b => state.buildings[b.id]?.built)
              .map(building => (
                <div key={building.id} className="flex items-center gap-2 p-2 bg-white rounded">
                  <span className="text-lg">{building.emoji}</span>
                  <span className="text-green-700 font-medium">{building.benefit}</span>
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
