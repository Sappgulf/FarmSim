import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { LIVESTOCK_TYPES } from '../../systems/LivestockSystem';
import { isDevelopmentMode } from '../../../../config/release';
import { TabHero, MetricTile, TabEmptyState } from './TabSurface';

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
        soundSystem?.playBuildSound();
        if (isDevelopmentMode()) {
          console.debug('[farm]', 'Animal bought successfully');
        }
      } else {
        soundSystem?.playErrorSound();
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
      soundSystem?.playWaterSound();
    } else {
      soundSystem?.playErrorSound();
    }
  };

  const handlePetAnimal = (animalId) => {
    if (!livestockSystem) return;

    livestockSystem.petAnimal(animalId);
    soundSystem?.playClickSound();
  };

  const handleCollectProduct = (animalId) => {
    if (!livestockSystem) return;

    const result = livestockSystem.collectProduct(animalId);
    if (result.success) {
      soundSystem?.playMoneySound();

      // Trigger particle effect
      if (typeof window.triggerParticleEffect === 'function') {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        window.triggerParticleEffect(centerX, centerY, 'harvest', {
          value: result.value
        });
      }
    }
  };

  const handleSellAnimal = (animalId) => {
    if (!livestockSystem) return;

    const result = livestockSystem.sellAnimal(animalId);
    if (result.success) {
      soundSystem?.playMoneySound();
    }
  };

  const handleUpgradeBarn = () => {
    if (!livestockSystem) return;

    const result = livestockSystem.upgradeBarn();
    if (result.success) {
      soundSystem?.playBuildSound();
    } else {
      soundSystem?.playErrorSound();
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
      <TabHero
        icon="🐄"
        tone="amber"
        title="Livestock Management"
        description="Raise animals, manage capacity, and keep production moving."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            {stats.totalAnimals} animals
          </Badge>
        )}
      >
        <div className="grid gap-3 md:grid-cols-4">
          <MetricTile
            tone="amber"
            label="Animals"
            value={`${stats.totalAnimals}/${stats.capacity}`}
            hint="Current barn occupancy"
            icon="🐄"
          />
          <MetricTile
            tone="emerald"
            label="Avg Health"
            value={`${Math.floor(stats.avgHealth)}%`}
            hint="Herd condition"
            icon="💚"
          />
          <MetricTile
            tone="sky"
            label="Avg Happiness"
            value={`${Math.floor(stats.avgHappiness)}%`}
            hint="Animal mood"
            icon="😊"
          />
          <MetricTile
            tone="violet"
            label="Ready"
            value={stats.readyProducts}
            hint="Products ready to collect"
            icon="🥛"
          />
        </div>
        {stats.dailyCost > 0 && (
          <div className="mt-3 text-center text-sm text-gray-600">
            Daily Maintenance: ${stats.dailyCost}
          </div>
        )}
      </TabHero>

      {/* Barn Upgrade */}
      <Card className="p-4 bg-slate-50/80 shadow-sm hover:shadow-md transition-all">
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
      <Card className="p-4 bg-white/90 shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
          🛒 Buy Animals
          <span className="text-xs text-gray-500 font-normal ml-2">Click to purchase</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(LIVESTOCK_TYPES).map(animalType => {
            const canAfford = state.coins >= animalType.cost;
            const hasSpace = stats.spaceUsed + animalType.requirements.space <= stats.capacity;
            const meetsLevel = state.level >= animalType.requirements.level;
            const canBuy = canAfford && hasSpace && meetsLevel;

            return (
              <Card
                key={animalType.id}
                className={`p-3 cursor-pointer transition-all duration-200 ${canBuy
                    ? 'hover:shadow-lg hover:scale-105 hover:border-green-300 bg-white border-2 border-transparent'
                    : 'opacity-50 bg-gray-50 cursor-not-allowed'
                  }`}
                onClick={() => canBuy && handleBuyAnimal(animalType.id)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{animalType.emoji}</div>
                  <div className="font-bold text-gray-800">{animalType.name}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {animalType.description}
                  </div>

                  <div className="text-sm space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span>Cost:</span>
                      <span className="font-bold text-yellow-600">${animalType.cost}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Feed:</span>
                      <span>${animalType.feedCost}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Production:</span>
                      <span className="font-bold text-green-600">
                        ${animalType.products[0].value}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Time:</span>
                      <span>{animalType.productionTime}s</span>
                    </div>
                  </div>

                  {!meetsLevel && (
                    <Badge variant="destructive" className="text-xs">
                      Level {animalType.requirements.level} Required
                    </Badge>
                  )}
                  {!hasSpace && meetsLevel && (
                    <Badge variant="destructive" className="text-xs">
                      No Space
                    </Badge>
                  )}
                  {!canAfford && meetsLevel && hasSpace && (
                    <Badge variant="destructive" className="text-xs">
                      Can't Afford
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Your Animals */}
      <Card className="p-4 shadow-md">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
          🐾 Your Animals
          <Badge className="ml-2">{livestock.animals.length}</Badge>
        </h4>

        {livestock.animals.length === 0 ? (
          <TabEmptyState
            tone="amber"
            icon="🐄"
            title="Your barn is quiet"
            description="Grab your first animal from Buy Animals below when you have space and coins—you’ll unlock milk, eggs, wool, and more."
            className="border-amber-100/80 bg-amber-50/30"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {livestock.animals.map(animal => {
              const timeSinceProduction = (Date.now() - animal.lastProduction) / 1000;
              const productionProgress = Math.min(100, (timeSinceProduction / animal.type.productionTime) * 100);

              return (
                <Card
                  key={animal.id}
                  className="p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-amber-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{animal.type.emoji}</div>
                      <div>
                        <div className="font-bold text-gray-800">{animal.name}</div>
                        <div className="text-xs text-gray-600">
                          {animal.type.name} • Age: {Math.floor(animal.age / 60)}m
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSellAnimal(animal.id)}
                      className="text-xs"
                    >
                      Sell
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={getHealthColor(animal.health)}>
                          ❤️ Health: {Math.floor(animal.health)}%
                        </span>
                      </div>
                      <Progress value={animal.health} variant="health" className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={getHappinessColor(animal.happiness)}>
                          😊 Happiness: {Math.floor(animal.happiness)}%
                        </span>
                      </div>
                      <Progress value={animal.happiness} variant="xp" className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-orange-600">
                          🍖 Hunger: {Math.floor(animal.hunger)}%
                        </span>
                      </div>
                      <Progress value={animal.hunger} variant="energy" className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-600">
                          {animal.type.products[0].item}: {Math.floor(productionProgress)}%
                        </span>
                      </div>
                      <Progress value={productionProgress} variant="growth" className="h-2" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleFeedAnimal(animal.id)}
                      variant="default"
                      size="sm"
                      className="flex-1 text-xs"
                      disabled={state.coins < animal.type.feedCost}
                    >
                      Feed (${animal.type.feedCost})
                    </Button>
                    <Button
                      onClick={() => handlePetAnimal(animal.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Pet 💕
                    </Button>
                    <Button
                      onClick={() => handleCollectProduct(animal.id)}
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      disabled={!animal.hasProduct}
                    >
                      {animal.hasProduct ? '✨ Collect' : '⏳ Wait'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
});

LivestockTab.displayName = 'LivestockTab';

export default LivestockTab;
