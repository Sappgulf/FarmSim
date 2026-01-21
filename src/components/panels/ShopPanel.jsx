/**
 * ShopPanel Component
 * Buy seeds, tools, and upgrades
 */
import React, { memo, useState, useMemo } from 'react';
import { ShoppingCart, Leaf, Wrench, Expand, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CROPS, RARITY_COLORS } from '../../data/crops';
import { TOOLS, GRID_CONFIG } from '../../data/constants';
import { BUILDINGS } from '../../data/buildings';

function ShopPanelComponent({
  coins,
  inventory,
  gridSize,
  buildings,
  onBuySeeds,
  onBuyTool,
  onExpandFarm,
  onBuyBuilding,
}) {
  const [quantities, setQuantities] = useState({});

  // Available seeds (non-mutation crops)
  const availableSeeds = useMemo(() => {
    return Object.entries(CROPS).map(([id, crop]) => ({
      id,
      ...crop,
    }));
  }, []);

  // Available tools
  const availableTools = useMemo(() => {
    return Object.entries(TOOLS).map(([id, tool]) => ({
      id,
      ...tool,
    }));
  }, []);

  // Available buildings
  const availableBuildings = useMemo(() => {
    return Object.entries(BUILDINGS).map(([id, building]) => ({
      id,
      ...building,
      owned: buildings?.includes(id) || false,
    }));
  }, [buildings]);

  // Expansion cost
  const expansionCost = gridSize < GRID_CONFIG.MAX_SIZE
    ? GRID_CONFIG.EXPANSION_COSTS[gridSize + 1] || 999
    : null;

  const handleQuantityChange = (itemId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  const getQuantity = (itemId) => quantities[itemId] || 1;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart size={20} className="text-blue-600" />
          Farm Shop
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="seeds" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="seeds" className="text-xs sm:text-sm">
              <Leaf size={14} className="mr-1" />
              Seeds
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs sm:text-sm">
              <Wrench size={14} className="mr-1" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="buildings" className="text-xs sm:text-sm">
              <Building2 size={14} className="mr-1" />
              Build
            </TabsTrigger>
            <TabsTrigger value="expand" className="text-xs sm:text-sm">
              <Expand size={14} className="mr-1" />
              Expand
            </TabsTrigger>
          </TabsList>

          {/* Seeds Tab */}
          <TabsContent value="seeds" className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableSeeds.map((seed) => {
              const qty = getQuantity(seed.id);
              const totalCost = seed.shopPrice * qty;
              const canAfford = coins >= totalCost;
              const inStock = inventory[seed.id] || 0;

              return (
                <div
                  key={seed.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${RARITY_COLORS[seed.rarity] || 'bg-gray-50'}
                    transition-colors
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{seed.emoji}</span>
                    <div>
                      <div className="font-medium capitalize text-sm">{seed.id}</div>
                      <div className="text-xs text-gray-500">
                        +{seed.baseValue}🪙 • {seed.season}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {inStock} owned
                    </Badge>

                    {/* Quantity selector */}
                    <div className="flex items-center gap-1 bg-white rounded border">
                      <button
                        onClick={() => handleQuantityChange(seed.id, -1)}
                        className="px-2 py-1 hover:bg-gray-100 text-sm"
                        disabled={qty <= 1}
                      >
                        -
                      </button>
                      <span className="px-2 text-sm tabular-nums">{qty}</span>
                      <button
                        onClick={() => handleQuantityChange(seed.id, 1)}
                        className="px-2 py-1 hover:bg-gray-100 text-sm"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => onBuySeeds?.(seed.id, qty)}
                      disabled={!canAfford}
                      className="min-w-[70px]"
                    >
                      {totalCost}🪙
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableTools.map((tool) => {
              const canAfford = coins >= tool.shopPrice;
              const owned = inventory[tool.id] || 0;

              return (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tool.emoji}</span>
                    <div>
                      <div className="font-medium capitalize text-sm">{tool.id}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {owned} owned
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => onBuyTool?.(tool.id)}
                      disabled={!canAfford}
                    >
                      {tool.shopPrice}🪙
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Buildings Tab */}
          <TabsContent value="buildings" className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableBuildings.map((building) => {
              const canAfford = coins >= building.price;

              return (
                <div
                  key={building.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${building.owned ? 'bg-green-50 border-green-200' : 'bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{building.emoji}</span>
                    <div>
                      <div className="font-medium text-sm">{building.name}</div>
                      <div className="text-xs text-gray-500">{building.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {building.owned ? (
                      <Badge className="bg-green-100 text-green-700">Owned</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onBuyBuilding?.(building.id)}
                        disabled={!canAfford}
                      >
                        {building.price}🪙
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Expand Tab */}
          <TabsContent value="expand" className="space-y-4">
            <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-4xl mb-2">🌾</div>
              <h3 className="font-bold text-lg text-amber-800">Farm Size</h3>
              <p className="text-amber-600 mb-4">
                Current: {gridSize}x{gridSize} plots
              </p>

              {expansionCost ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Expand to {gridSize + 1}x{gridSize + 1} plots
                  </p>
                  <Button
                    onClick={onExpandFarm}
                    disabled={coins < expansionCost}
                    className="w-full"
                  >
                    <Expand size={16} className="mr-2" />
                    Expand for {expansionCost}🪙
                  </Button>
                </>
              ) : (
                <Badge className="bg-purple-100 text-purple-700">
                  Maximum Size Reached!
                </Badge>
              )}
            </div>

            {/* Expansion benefits */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-bold text-green-600">+{(gridSize + 1) * 2 - 1}</div>
                <div className="text-xs text-gray-500">New plots</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-bold text-blue-600">+{Math.round(((gridSize + 1) * 2 - 1) * 15)}🪙</div>
                <div className="text-xs text-gray-500">Potential earnings</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export const ShopPanel = memo(ShopPanelComponent);
