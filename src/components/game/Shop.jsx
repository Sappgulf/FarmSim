import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SEED_TYPES, BUILDING_TYPES } from '../../utils/gameConstants';
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Store } from 'lucide-react';

/**
 * Enhanced Shop Component
 * Handles purchasing seeds and buildings with market pricing
 */
export function Shop({ 
  gameState, 
  marketPrices, 
  economicEvent, 
  onBuySeeds, 
  onBuyBuilding,
  onSellCrops
}) {
  const [quantityInputs, setQuantityInputs] = useState({});
  const [sellQuantityInputs, setSellQuantityInputs] = useState({});

  const handleQuantityChange = (seedType, quantity) => {
    setQuantityInputs(prev => ({ ...prev, [seedType]: quantity }));
  };

  const handleSellQuantityChange = (seedType, quantity) => {
    setSellQuantityInputs(prev => ({ ...prev, [seedType]: quantity }));
  };

  const getQuantity = (seedType) => {
    return parseInt(quantityInputs[seedType] || '1', 10) || 1;
  };

  const getSellQuantity = (seedType) => {
    return parseInt(sellQuantityInputs[seedType] || '1', 10) || 1;
  };

  const getPriceIcon = (trend) => {
    if (trend > 0.1) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < -0.1) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const canAfford = (cost) => gameState.coins >= cost;

  const getInventoryCount = (type) => gameState.inventory[type] || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Market & Shop
          <Badge variant="outline">${gameState.coins.toFixed(2)}</Badge>
        </CardTitle>
        {economicEvent && (
          <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-center gap-2">
              <span className="text-yellow-800 font-semibold">📈 Market Event:</span>
              <span className="text-yellow-700">{economicEvent.name}</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">{economicEvent.description}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy-seeds" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buy-seeds">Buy Seeds</TabsTrigger>
            <TabsTrigger value="sell-crops">Sell Crops</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="market">Market Info</TabsTrigger>
          </TabsList>

          {/* Buy Seeds Tab */}
          <TabsContent value="buy-seeds" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(SEED_TYPES).map(([type, seed]) => {
                const currentPrice = marketPrices[type]?.buyPrice || seed.cost;
                const quantity = getQuantity(type);
                const totalCost = currentPrice * quantity;
                const priceChange = marketPrices[type]?.trend || 0;

                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{seed.emoji}</span>
                      <div>
                        <h4 className="font-semibold">{seed.name}</h4>
                        <p className="text-sm text-gray-600">
                          {seed.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold">
                            {formatPrice(currentPrice)}
                          </span>
                          {getPriceIcon(priceChange)}
                          <span className="text-xs text-gray-500">
                            (base: {formatPrice(seed.cost)})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="999"
                        value={quantityInputs[type] || '1'}
                        onChange={(e) => handleQuantityChange(type, e.target.value)}
                        className="w-20"
                      />
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          Total: {formatPrice(totalCost)}
                        </div>
                        <Button
                          onClick={() => onBuySeeds(type, quantity)}
                          disabled={!canAfford(totalCost)}
                          size="sm"
                          className="mt-1"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Buy {quantity}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Sell Crops Tab */}
          <TabsContent value="sell-crops" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(SEED_TYPES).map(([type, seed]) => {
                const inventory = getInventoryCount(type);
                if (inventory === 0) return null;

                const sellPrice = marketPrices[type]?.sellPrice || (seed.cost * 0.8);
                const quantity = Math.min(getSellQuantity(type), inventory);
                const totalEarnings = sellPrice * quantity;
                const priceChange = marketPrices[type]?.trend || 0;

                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{seed.emoji}</span>
                      <div>
                        <h4 className="font-semibold">{seed.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Have: {inventory}</Badge>
                          <span className="text-sm font-semibold">
                            {formatPrice(sellPrice)} each
                          </span>
                          {getPriceIcon(priceChange)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={inventory}
                        value={sellQuantityInputs[type] || '1'}
                        onChange={(e) => handleSellQuantityChange(type, e.target.value)}
                        className="w-20"
                      />
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          Earn: {formatPrice(totalEarnings)}
                        </div>
                        <Button
                          onClick={() => onSellCrops(type, quantity)}
                          disabled={quantity === 0}
                          size="sm"
                          className="mt-1"
                          variant="outline"
                        >
                          💰 Sell {quantity}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Buildings Tab */}
          <TabsContent value="buildings" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(BUILDING_TYPES).map(([type, building]) => {
                const owned = gameState.buildings[type] || 0;
                const nextCost = building.cost * Math.pow(1.5, owned);

                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{building.emoji}</span>
                      <div>
                        <h4 className="font-semibold">{building.name}</h4>
                        <p className="text-sm text-gray-600">{building.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">Owned: {owned}</Badge>
                          <span className="text-sm">
                            Effect: {building.effect}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatPrice(nextCost)}
                      </div>
                      <Button
                        onClick={() => onBuyBuilding(type)}
                        disabled={!canAfford(nextCost)}
                        size="sm"
                        className="mt-1"
                      >
                        Buy Next
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Market Info Tab */}
          <TabsContent value="market" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">📊 Current Market Trends</h3>
              <div className="grid gap-3">
                {Object.entries(marketPrices).map(([type, priceData]) => {
                  const seed = SEED_TYPES[type];
                  if (!seed) return null;

                  return (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{seed.emoji}</span>
                        <span className="font-medium">{seed.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Buy Price</div>
                          <div className="font-semibold">{formatPrice(priceData.buyPrice)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Sell Price</div>
                          <div className="font-semibold">{formatPrice(priceData.sellPrice)}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriceIcon(priceData.trend)}
                          <span className="text-sm">
                            {priceData.trend > 0 ? '+' : ''}{(priceData.trend * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
