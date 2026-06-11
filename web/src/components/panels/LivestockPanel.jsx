/**
 * Livestock Panel Component
 * Animal care and management interface
 */
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Heart,
  Coins,
  Clock,
  ShoppingCart,
  Sparkles,
  Apple,
  AlertTriangle,
  Check,
  Droplet,
} from 'lucide-react';
import { LIVESTOCK } from '../../data/buildings';

// Animal states
const ANIMAL_STATES = {
  happy: { emoji: '😊', label: 'Happy', color: 'text-green-600', bgColor: 'bg-green-100' },
  content: { emoji: '🙂', label: 'Content', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  hungry: { emoji: '😕', label: 'Hungry', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// Feed costs
const FEED_COST = 5;
const WATER_COST = 2;

function LivestockPanelComponent({
  coins = 0,
  ownedAnimals = [], // Array of { type, id, happiness, fedAt, wateredAt, lastProductAt }
  pendingProducts = [], // Products ready to collect
  onBuyAnimal,
  onFeedAnimal,
  onWaterAnimal,
  onCollectProduct,
  onSellAnimal,
  addNotification,
}) {
  // Calculate animal happiness based on care
  const getAnimalState = useCallback((animal) => {
    const now = Date.now() / 1000;
    const timeSinceFed = now - (animal.fedAt || 0);
    const timeSinceWatered = now - (animal.wateredAt || 0);

    const needsFood = timeSinceFed > 180; // 3 minutes
    const needsWater = timeSinceWatered > 120; // 2 minutes

    if (needsFood && needsWater) return ANIMAL_STATES.sad;
    if (needsFood || needsWater) return ANIMAL_STATES.hungry;
    if (animal.happiness >= 80) return ANIMAL_STATES.happy;
    return ANIMAL_STATES.content;
  }, []);

  // Get time until next product
  const getProductTimer = useCallback((animal) => {
    const livestock = LIVESTOCK[animal.type];
    if (!livestock) return null;

    const now = Date.now() / 1000;
    const timeSinceProduct = now - (animal.lastProductAt || now);
    const timeRemaining = Math.max(0, livestock.interval - timeSinceProduct);

    return {
      ready: timeRemaining <= 0,
      secondsLeft: Math.ceil(timeRemaining),
      progress: Math.min(100, (timeSinceProduct / livestock.interval) * 100),
    };
  }, []);

  // Group animals by type
  const animalsByType = ownedAnimals.reduce((acc, animal) => {
    if (!acc[animal.type]) acc[animal.type] = [];
    acc[animal.type].push(animal);
    return acc;
  }, {});

  // Handle buying an animal
  const handleBuy = useCallback(
    (type) => {
      const livestock = LIVESTOCK[type];
      if (!livestock) return;

      const currentCount = (animalsByType[type] || []).length;
      if (currentCount >= livestock.maxCount) {
        addNotification?.(`Max ${livestock.name}s reached (${livestock.maxCount})!`, 'error');
        return;
      }

      if (coins < livestock.price) {
        addNotification?.(`Need ${livestock.price} coins!`, 'error');
        return;
      }

      onBuyAnimal?.(type);
    },
    [coins, animalsByType, onBuyAnimal, addNotification]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🐄</span>
            Livestock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Raise animals for passive income! Feed and water them to keep them happy and productive.
          </p>
        </CardContent>
      </Card>

      {/* Pending products to collect */}
      {pendingProducts.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Sparkles size={16} />
              Ready to Collect!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{product.emoji}</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onCollectProduct?.(i)}
                  >
                    <Coins size={14} className="mr-1" />
                    {product.value}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owned animals */}
      {Object.entries(animalsByType).map(([type, animals]) => {
        const livestock = LIVESTOCK[type];
        if (!livestock) return null;

        return (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{livestock.emoji}</span>
                  <span className="text-base">{livestock.name}s</span>
                  <Badge variant="outline">
                    {animals.length}/{livestock.maxCount}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {animals.map((animal, i) => {
                  const state = getAnimalState(animal);
                  const productTimer = getProductTimer(animal);

                  return (
                    <div
                      key={animal.id || i}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{livestock.emoji}</span>
                          <div>
                            <div className="font-medium text-sm">
                              {livestock.name} #{i + 1}
                            </div>
                            <div className={`text-xs flex items-center gap-1 ${state.color}`}>
                              <span>{state.emoji}</span> {state.label}
                            </div>
                          </div>
                        </div>

                        {/* Product status */}
                        {productTimer?.ready ? (
                          <Badge className="bg-green-100 text-green-700 animate-pulse">
                            <Sparkles size={12} className="mr-1" />
                            {livestock.productEmoji} Ready!
                          </Badge>
                        ) : (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {Math.floor((productTimer?.secondsLeft || 0) / 60)}m
                          </div>
                        )}
                      </div>

                      {/* Production progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Next {livestock.product}</span>
                          <span>{Math.round(productTimer?.progress || 0)}%</span>
                        </div>
                        <Progress value={productTimer?.progress || 0} className="h-1.5" />
                      </div>

                      {/* Care actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFeedAnimal?.(animal.id)}
                          disabled={coins < FEED_COST}
                          className="flex-1"
                        >
                          <Apple size={14} className="mr-1 text-red-500" />
                          Feed ({FEED_COST})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onWaterAnimal?.(animal.id)}
                          disabled={coins < WATER_COST}
                          className="flex-1"
                        >
                          <Droplet size={14} className="mr-1 text-blue-500" />
                          Water ({WATER_COST})
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Buy animals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ShoppingCart size={16} />
            Buy Animals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LIVESTOCK).map(([type, livestock]) => {
              const owned = (animalsByType[type] || []).length;
              const canBuy = owned < livestock.maxCount && coins >= livestock.price;

              return (
                <button
                  key={type}
                  onClick={() => handleBuy(type)}
                  disabled={!canBuy}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${
                      canBuy
                        ? 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer'
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{livestock.emoji}</span>
                    <span className="font-medium text-sm">{livestock.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{livestock.description}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {owned}/{livestock.maxCount}
                    </span>
                    <Badge variant="outline" className="text-amber-600">
                      {livestock.price}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty state - enhanced */}
      {ownedAnimals.length === 0 && (
        <Card className="border-dashed border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="py-8 text-center">
            {/* Animated egg */}
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div
                className="absolute inset-0 bg-amber-100/50 rounded-full animate-ping"
                style={{ animationDuration: '2s' }}
              />
              <div className="relative text-6xl animate-bob" style={{ animationDuration: '1.5s' }}>
                🐣
              </div>
            </div>

            <h3 className="font-semibold text-amber-800 mb-1">No Animals Yet</h3>
            <p className="text-sm text-amber-600 mb-4">Animals provide steady passive income!</p>

            {/* Quick stats */}
            <div className="flex justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg">🐔</div>
                <div className="text-xs text-gray-500">80 coins</div>
              </div>
              <div className="text-center">
                <div className="text-lg">🐄</div>
                <div className="text-xs text-gray-500">200 coins</div>
              </div>
              <div className="text-center">
                <div className="text-lg">🐷</div>
                <div className="text-xs text-gray-500">150 coins</div>
              </div>
            </div>

            <p className="text-xs text-gray-400">Choose an animal above to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const LivestockPanel = memo(LivestockPanelComponent);
