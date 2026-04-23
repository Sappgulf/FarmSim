import React, { memo, useState, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { LIVESTOCK_TYPES } from '../../systems/LivestockSystem';
import { isDevelopmentMode } from '../../../../config/release';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

/* ── Animal type accent colors for avatar rings ── */
const ANIMAL_RING_COLORS = {
  chicken: 'border-amber-400 shadow-amber-200/60 text-amber-600',
  cow: 'border-slate-400 shadow-slate-200/60 text-slate-600',
  pig: 'border-rose-300 shadow-rose-200/60 text-rose-500',
  sheep: 'border-sky-300 shadow-sky-200/60 text-sky-500',
  goat: 'border-emerald-300 shadow-emerald-200/60 text-emerald-600',
};

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

  /* ── Bulk actions (no new game logic) ── */
  const handleFeedAll = useCallback(() => {
    livestock.animals.forEach(animal => {
      if (animal.hunger > 20 && state.coins >= animal.type.feedCost) {
        handleFeedAnimal(animal.id);
      }
    });
  }, [livestock.animals, state.coins]);

  const handleCollectAll = useCallback(() => {
    livestock.animals.forEach(animal => {
      if (animal.hasProduct) {
        handleCollectProduct(animal.id);
      }
    });
  }, [livestock.animals]);

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

  const getHungerBarColor = (hunger) => {
    if (hunger < 40) return 'from-green-400 via-green-500 to-emerald-600';
    if (hunger < 70) return 'from-yellow-400 via-yellow-500 to-amber-600';
    return 'from-red-400 via-red-500 to-rose-600';
  };

  /* ── Happiness hearts renderer ── */
  const HappinessHearts = ({ value }) => {
    const filled = Math.ceil((value / 100) * 3);
    return (
      <div className="flex items-center gap-0.5" aria-label={`Happiness ${Math.floor(value)}%`}>
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className={`text-sm leading-none ${i <= filled ? 'heart-filled text-rose-500' : 'text-slate-200 dark:text-slate-700'}`}
          >
            ❤️
          </span>
        ))}
      </div>
    );
  };

  /* ── Time remaining formatter ── */
  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return 'Ready!';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    return `${Math.ceil(seconds / 60)}m`;
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            Daily Maintenance: {stats.dailyCost}🪙
          </div>
        )}
      </TabHero>

      {/* Barn Upgrade */}
      <TabSection
        title="Barn Capacity"
        description="Expand to house more animals."
        tone="amber"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🏚️</div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Barn Capacity</h4>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={(stats.spaceUsed / stats.capacity) * 100}
                  className="h-2 w-32"
                  variant="energy"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.spaceUsed}/{stats.capacity}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleUpgradeBarn}
            variant="default"
            size="sm"
            disabled={state.coins < stats.capacity * 100}
            className="hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="font-bold">Expand Barn</div>
              <div className="text-xs">+5 space • {stats.capacity * 100}🪙</div>
            </div>
          </Button>
        </div>
      </TabSection>

      {/* Buy Animals */}
      <TabSection
        title="Buy Animals"
        description="Click to purchase and add to your barn."
        tone="emerald"
      >
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
                      <span className="font-bold text-yellow-600">{animalType.cost}🪙</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Feed:</span>
                      <span>{animalType.feedCost}🪙</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Production:</span>
                      <span className="font-bold text-green-600">
                        {animalType.products[0].value}🪙
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
      </TabSection>

      {/* Your Animals — Barn */}
      <TabSection
        title="Your Animals"
        description="Manage health, happiness, and production."
        tone="sky"
        action={<Badge variant="outline">{livestock.animals.length}</Badge>}
      >
        {livestock.animals.length === 0 ? (
          <TabEmptyState
            icon="🏚️"
            tone="amber"
            title="Your barn is empty"
            description="Purchase your first animal above to start collecting products and earning extra income!"
          />
        ) : (
          <div className="space-y-4">
            {/* Bulk action bar */}
            <div className="flex items-center gap-2 px-1">
              <Button
                onClick={handleFeedAll}
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                disabled={livestock.animals.every(a => a.hunger <= 20) || livestock.animals.every(a => state.coins < a.type.feedCost)}
              >
                🌿 Feed All
              </Button>
              <Button
                onClick={handleCollectAll}
                size="sm"
                variant="success"
                className="text-xs flex-1"
                disabled={!livestock.animals.some(a => a.hasProduct)}
              >
                ✨ Collect All
              </Button>
            </div>

            {/* Stall grid */}
            <div className="barn-shell p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {livestock.animals.map(animal => {
                  const timeSinceProduction = (Date.now() - animal.lastProduction) / 1000;
                  const productionProgress = Math.min(100, (timeSinceProduction / animal.type.productionTime) * 100);
                  const timeLeft = animal.type.productionTime - timeSinceProduction;
                  const ringColor = ANIMAL_RING_COLORS[animal.type.id] || ANIMAL_RING_COLORS.chicken;

                  return (
                    <Card
                      key={animal.id}
                      className={`stall-card p-4 bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-800 dark:to-slate-900/60 border-2 border-transparent hover:border-amber-200/80 dark:hover:border-amber-800/50 ${animal.hasProduct ? 'stall-ready' : ''}`}
                    >
                      {/* Header: Avatar + Name + Sell */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`stall-avatar-ring grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] bg-white dark:bg-slate-800 shadow-md ${ringColor}`}>
                            <span className="text-3xl leading-none select-none">{animal.type.emoji}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 dark:text-gray-100 truncate">{animal.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {animal.type.name} • {Math.floor(animal.age / 60)}m old
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSellAnimal(animal.id)}
                          className="text-[10px] text-slate-400 hover:text-red-500 transition-colors px-1.5 py-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Sell animal"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Meters */}
                      <div className="space-y-2.5 mb-3">
                        {/* Happiness hearts */}
                        <div className="flex items-center justify-between">
                          <HappinessHearts value={animal.happiness} />
                          <span className={`text-[10px] font-semibold ${getHappinessColor(animal.happiness)}`}>
                            {Math.floor(animal.happiness)}%
                          </span>
                        </div>

                        {/* Hunger bar */}
                        <div>
                          <div className="flex justify-between text-[10px] mb-1 text-gray-500 dark:text-gray-400">
                            <span>Hunger</span>
                            <span className={animal.hunger > 70 ? 'text-red-500 font-semibold' : ''}>{Math.floor(animal.hunger)}%</span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${getHungerBarColor(animal.hunger)} transition-all duration-500`}
                              style={{ width: `${animal.hunger}%` }}
                            />
                          </div>
                        </div>

                        {/* Production */}
                        <div>
                          {animal.hasProduct ? (
                            <Badge variant="success" className="badge-glow text-[10px] font-bold">
                              ✨ Ready to collect!
                            </Badge>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                <span>{animal.type.products[0].item}</span>
                                <span>{formatTimeLeft(timeLeft)}</span>
                              </div>
                              <Progress value={productionProgress} variant="growth" className="h-1.5" />
                            </div>
                          )}
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
                          juicy
                        >
                          🌿 Feed
                        </Button>
                        <Button
                          onClick={() => handlePetAnimal(animal.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          juicy
                        >
                          💕 Pet
                        </Button>
                        <Button
                          onClick={() => handleCollectProduct(animal.id)}
                          variant={animal.hasProduct ? 'success' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          disabled={!animal.hasProduct}
                          juicy
                        >
                          {animal.hasProduct ? '✨ Collect' : '⏳ Wait'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </TabSection>
    </div>
  );
});

LivestockTab.displayName = 'LivestockTab';

export default LivestockTab;
