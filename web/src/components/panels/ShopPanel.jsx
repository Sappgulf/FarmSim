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
import { formatDisplayLabel } from '../../utils/textFormat';

function ShopPanelComponent({
  coins,
  inventory,
  gridSize,
  buildings,
  recommendedSeedId,
  recommendationReason,
  recommendationTitle,
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
        {recommendedSeedId && recommendationTitle && recommendationReason && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700/70">
                  Recommended Next Buy
                </div>
                <div className="mt-1 text-base font-semibold text-amber-950">
                  {recommendationTitle}
                </div>
                <p className="mt-1 text-sm text-amber-900/80">
                  {recommendationReason}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
                {CROPS[recommendedSeedId]?.emoji || '🌱'}
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="seeds" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 gap-1 h-auto p-1">
            <TabsTrigger value="seeds" className="text-xs flex items-center gap-1 py-2">
              <Leaf size={13} />
              Seeds
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs flex items-center gap-1 py-2">
              <Wrench size={13} />
              Tools
            </TabsTrigger>
            <TabsTrigger value="buildings" className="text-xs flex items-center gap-1 py-2">
              <Building2 size={13} />
              Build
            </TabsTrigger>
            <TabsTrigger value="expand" className="text-xs flex items-center gap-1 py-2">
              <Expand size={13} />
              Expand
            </TabsTrigger>
          </TabsList>

          {/* Seeds Tab */}
          <TabsContent value="seeds" className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
            {availableSeeds.map((seed) => {
              const qty = getQuantity(seed.id);
              const totalCost = seed.shopPrice * qty;
              const canAfford = coins >= totalCost;
              const inStock = inventory[seed.id] || 0;

              return (
                <div
                  key={seed.id}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border
                    ${RARITY_COLORS[seed.rarity] || 'bg-gray-50'}
                    transition-all hover:shadow-sm
                    ${recommendedSeedId === seed.id ? 'ring-2 ring-amber-300 ring-offset-2' : ''}
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl flex-shrink-0">{seed.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm truncate">{formatDisplayLabel(seed.id)}</div>
                        {recommendedSeedId === seed.id && (
                          <Badge className="h-5 border-amber-300 bg-amber-100 px-1.5 text-[10px] text-amber-800">
                            Best now
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                        <span>+{seed.baseValue}🪙</span>
                        <span>•</span>
                        <span className="capitalize">{seed.season}</span>
                        {inStock > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 ml-0.5">
                            ×{inStock}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {/* Quantity selector */}
                    <div className="flex items-center bg-white rounded-lg border overflow-hidden shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(seed.id, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600 text-sm font-bold disabled:opacity-40"
                        disabled={qty <= 1}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button
                        onClick={() => handleQuantityChange(seed.id, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => onBuySeeds?.(seed.id, qty)}
                      disabled={!canAfford}
                      className="min-w-[62px] h-7 text-xs px-2"
                    >
                      {totalCost}🪙
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
            {availableTools.map((tool) => {
              const canAfford = coins >= tool.shopPrice;
              const owned = inventory[tool.id] || 0;

              return (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 hover:bg-slate-100 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl flex-shrink-0">{tool.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{formatDisplayLabel(tool.id)}</div>
                      <div className="text-xs text-gray-500 truncate">{tool.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {owned > 0 && (
                      <Badge variant="outline" className="text-xs">
                        ×{owned}
                      </Badge>
                    )}
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
          <TabsContent value="buildings" className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
            {availableBuildings.map((building) => {
              const canAfford = coins >= building.price;

              return (
                <div
                  key={building.id}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm
                    ${building.owned
                      ? 'bg-emerald-50 border-emerald-200'
                      : canAfford
                        ? 'bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl flex-shrink-0">{building.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{building.name}</div>
                      <div className="text-xs text-gray-500 truncate">{building.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {building.owned ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">✓ Owned</Badge>
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
