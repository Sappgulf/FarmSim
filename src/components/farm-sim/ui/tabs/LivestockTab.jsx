import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { LIVESTOCK_TYPES } from '../../systems/LivestockSystem';

const LivestockTab = memo(() => {
  const { state, actions, systems } = useGame();
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Get systems from context
  const livestockSystem = systems?.livestockSystem;
  const soundSystem = systems?.soundSystem;

  const livestock = {
    animals: (state.livestock?.animals) || [],
    capacity: (state.livestock?.capacity) || 10,
    totalProduced: (state.livestock?.totalProduced) || 0
  };

  // Safety check for LIVESTOCK_TYPES
  if (!LIVESTOCK_TYPES || typeof LIVESTOCK_TYPES !== 'object') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <div className="text-lg font-semibold text-red-700">Error Loading Livestock Types</div>
          <div className="text-sm text-red-500 mt-2">LIVESTOCK_TYPES failed to import</div>
        </div>
      </div>
    );
  }

  // If system isn't available yet, show loading
  if (!livestockSystem) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-3">🐄</div>
          <div className="text-lg font-semibold text-gray-700">Loading Livestock System...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait a moment</div>
        </div>
      </div>
    );
  }

  const stats = livestockSystem.getStats() || {
    totalAnimals: 0,
    capacity: 10,
    spaceUsed: 0,
    avgHealth: 0,
    avgHappiness: 0,
    readyProducts: 0,
    dailyCost: 0
  };

  const handleBuyAnimal = (typeId) => {
    if (!livestockSystem) {
      console.error('[farm]', 'LivestockTab: livestockSystem not available');
      actions.addNotification({
        message: 'Livestock system not ready yet',
        type: 'error'
      });
      return;
    }

    try {
      const result = livestockSystem.buyAnimal(typeId);
      if (result.success) {
        actions.playSound('playBuildSound');
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm]', 'Animal bought successfully');
        }
      } else {
        actions.playSound('playErrorSound');
        actions.addNotification({
          message: result.message,
          type: 'error'
        });
        console.warn('[farm]', 'Failed to buy animal:', result.message);
      }
    } catch (error) {
      console.error('[farm]', 'LivestockTab: Error buying animal', error);
      actions.addNotification({
        message: 'Error buying animal',
        type: 'error'
      });
    }
  };

  const handleFeedAnimal = (animalId) => {
    if (!livestockSystem) return;

    const result = livestockSystem.feedAnimal(animalId);
    if (result.success) {
      actions.playSound('playWaterSound');
    } else {
      actions.playSound('playErrorSound');
    }
  };

  const handlePetAnimal = (animalId) => {
    if (!livestockSystem) return;

    livestockSystem.petAnimal(animalId);
    actions.playSound('playClickSound');
  };

  const handleCollectProduct = (animalId) => {
    if (!livestockSystem) return;

    const result = livestockSystem.collectProduct(animalId);
    if (result.success) {
      actions.playSound('playMoneySound');

      // Trigger particle effect
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 3;
      actions.triggerParticles(centerX, centerY, 'harvest', {
        value: result.value
      });
    }
  };

  const handleSellAnimal = (animalId) => {
    if (!livestockSystem) return;

    const result = livestockSystem.sellAnimal(animalId);
    if (result.success) {
      actions.playSound('playMoneySound');
    }
  };

  const handleUpgradeBarn = () => {
    if (!livestockSystem) return;

    const result = livestockSystem.upgradeBarn();
    if (result.success) {
      actions.playSound('playBuildSound');
    } else {
      actions.playSound('playErrorSound');
    }
  };

  const getHealthColor = (health) => {
    if (health > 70) return 'text-green-600';
    if (health > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHappinessColor = (happiness) => {
    if (happiness > 70) return 'text-green-600';
    if (happiness > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Header Stats - Premium */}
      <Card className="p-5 bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/95 backdrop-blur-sm border-amber-200/60 shadow-lg shadow-amber-200/30 relative overflow-hidden">
        {/* Decorative cow */}
        <div className="absolute -right-4 -top-2 text-6xl opacity-10 rotate-12">🐄</div>

        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 relative z-10">
          🐄 Livestock Management
          <Badge variant="outline" className="ml-auto text-xs bg-white/80 shadow-sm">
            {stats.totalAnimals} Animals
          </Badge>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          <div className="text-center p-3 bg-white/70 rounded-xl border border-amber-100 shadow-sm">
            <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">{stats.totalAnimals}/{stats.capacity}</div>
            <div className="text-xs text-amber-700/80 font-medium">Animals</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-xl border border-green-100 shadow-sm">
            <div className="text-2xl font-black text-green-600">{Math.floor(stats.avgHealth)}%</div>
            <div className="text-xs text-green-700/80 font-medium">Avg Health</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-xl border border-blue-100 shadow-sm">
            <div className="text-2xl font-black text-blue-600">{Math.floor(stats.avgHappiness)}%</div>
            <div className="text-xs text-blue-700/80 font-medium">Avg Happiness</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-xl border border-purple-100 shadow-sm">
            <div className="text-2xl font-black text-purple-600">{stats.readyProducts}</div>
            <div className="text-xs text-purple-700/80 font-medium">Ready to Collect</div>
          </div>
        </div>

        {stats.dailyCost > 0 && (
          <div className="mt-3 text-center text-sm text-amber-700/70 font-medium relative z-10">
            💰 Daily Maintenance: ${stats.dailyCost}
          </div>
        )}
      </Card>

      {/* Barn Upgrade */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🏚️</div>
            <div>
              <h4 className="font-bold text-gray-800">Barn Capacity</h4>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={(stats.spaceUsed / stats.capacity) * 100}
                  className="h-2 w-32"
                  variant="energy"
                />
                <span className="text-sm text-gray-600">
                  {stats.spaceUsed}/{stats.capacity}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleUpgradeBarn}
            variant="primary"
            size="sm"
            disabled={state.coins < stats.capacity * 100}
            className="hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="font-bold">Expand Barn</div>
              <div className="text-xs">+5 space • ${stats.capacity * 100}</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Buy Animals */}
      <h4 className="font-bold px-1 mb-2 text-gray-700 flex items-center justify-between">
        <span>🛒 Livestock Market</span>
        <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-full border">
          Barn Space: {stats.spaceUsed}/{stats.capacity}
        </span>
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {Object.values(LIVESTOCK_TYPES).map(animalType => {
          const canAfford = state.coins >= animalType.cost;
          const hasSpace = stats.spaceUsed + animalType.requirements.space <= stats.capacity;
          const meetsLevel = state.level >= animalType.requirements.level;
          const canBuy = canAfford && hasSpace && meetsLevel;

          return (
            <div
              key={animalType.id}
              className={`
                    relative p-3 rounded-xl border-2 transition-all cursor-pointer group
                    ${canBuy
                  ? 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-60 grayscale-[0.3]'
                }
                `}
              onClick={() => canBuy && handleBuyAnimal(animalType.id)}
            >
              <div className="text-center relative z-10">
                <div className="text-4xl mb-1 transform group-hover:scale-110 transition-transform duration-200">
                  {animalType.emoji}
                </div>
                <div className="font-bold text-gray-900 text-sm">{animalType.name}</div>

                <div className="mt-2 space-y-1">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 w-full justify-center">
                    {animalType.cost}🪙
                  </Badge>
                  <div className="text-[10px] text-gray-500">
                    Produces: <span className="text-green-600 font-semibold">{animalType.products[0].item}</span>
                  </div>
                </div>
              </div>

              {/* Lock/Error Overlays */}
              {!meetsLevel && (
                <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-20">
                  <Badge variant="destructive" className="text-[10px]">Lv.{animalType.requirements.level}</Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Your Animals */}
      <h4 className="font-bold px-1 mb-2 text-gray-700 flex items-center gap-2">
        <span>🐾 Your Herd</span>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{livestock.animals.length}</Badge>
      </h4>

      {livestock.animals.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
          <div className="text-4xl mb-2 opacity-50">🏚️</div>
          <p className="text-gray-500 font-medium">Your barn is empty.</p>
          <p className="text-xs text-gray-400">Visit the market above to start your herd!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {livestock.animals.map(animal => {
            const timeSinceProduction = (Date.now() - animal.lastProduction) / 1000;
            const productionProgress = Math.min(100, (timeSinceProduction / animal.type.productionTime) * 100);
            const isReady = animal.hasProduct;

            return (
              <Card
                key={animal.id}
                className={`
                    p-3 transition-all duration-200 border-l-4 relative overflow-hidden
                    ${isReady ? 'border-l-green-500 shadow-md ring-1 ring-green-100' : 'border-l-gray-300 hover:border-l-amber-300'}
                  `}
              >
                {isReady && <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-bl-lg animate-pulse" />}

                <div className="flex gap-3">
                  {/* Animal Icon/Avatar */}
                  <div className="flex flex-col items-center justify-center min-w-[3rem]">
                    <div className="text-3xl mb-1">{animal.type.emoji}</div>
                    <div className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500">
                      {Math.floor(animal.age / 60)}m
                    </div>
                  </div>

                  {/* Stats & Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-900 leading-tight">{animal.name}</div>
                        <div className="text-xs text-gray-500">{animal.type.name}</div>
                      </div>

                      {/* Mini Status Icons */}
                      <div className="flex gap-1">
                        <div className={`text-xs ${getHealthColor(animal.health)}`} title="Health">
                          ❤️ {Math.floor(animal.health)}
                        </div>
                        <div className={`text-xs ${getHappinessColor(animal.happiness)}`} title="Happiness">
                          😊 {Math.floor(animal.happiness)}
                        </div>
                      </div>
                    </div>

                    {/* Compact Progress Bars */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>Hunger</span>
                          <span className={animal.hunger > 80 ? 'text-red-500' : ''}>{Math.floor(animal.hunger)}%</span>
                        </div>
                        <Progress value={animal.hunger} className="h-1.5" variant={animal.hunger > 80 ? "destructive" : "default"} />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span className={isReady ? 'text-green-600 font-bold' : ''}>Production</span>
                          <span>{Math.floor(productionProgress)}%</span>
                        </div>
                        <Progress value={productionProgress} className="h-1.5" variant="growth" />
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleFeedAnimal(animal.id)}
                        size="xs"
                        variant="outline"
                        className="flex-1 h-7 text-[10px] border-amber-200 hover:bg-amber-50 text-amber-800"
                        disabled={state.coins < animal.type.feedCost}
                      >
                        🍎 Feed ({animal.type.feedCost}🪙)
                      </Button>

                      <Button
                        onClick={() => handlePetAnimal(animal.id)}
                        size="xs"
                        variant="ghost"
                        className="px-2 h-7 text-[10px] hover:text-pink-600 hover:bg-pink-50"
                      >
                        💕
                      </Button>

                      <Button
                        onClick={() => handleCollectProduct(animal.id)}
                        size="xs"
                        className={`flex-1 h-7 text-[10px] font-bold transition-all ${isReady ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}
                        disabled={!animal.hasProduct}
                      >
                        {isReady ? `✨ Collect` : 'Wait'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
});

LivestockTab.displayName = 'LivestockTab';

export default LivestockTab;

