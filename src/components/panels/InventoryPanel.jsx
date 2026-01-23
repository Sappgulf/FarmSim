/**
 * InventoryPanel Component
 * Display and manage inventory items
 */
import React, { memo, useMemo } from 'react';
import { Package, Leaf, Wrench, FlaskConical, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ALL_CROPS } from '../../data/crops';
import { TOOLS } from '../../data/constants';

function InventoryPanelComponent({
  inventory,
  selectedSeed,
  onSelectSeed,
  onSellItem,
  onOpenShop,
}) {
  // Categorize inventory items
  const categorized = useMemo(() => {
    const seeds = [];
    const harvested = [];
    const tools = [];
    const other = [];

    for (const [item, qty] of Object.entries(inventory)) {
      if (qty <= 0) continue;

      // Check if it's a crop/seed
      if (ALL_CROPS[item]) {
        seeds.push({ id: item, qty, data: ALL_CROPS[item] });
      }
      // Check if it's a tool
      else if (TOOLS[item]) {
        tools.push({ id: item, qty, data: TOOLS[item] });
      }
      // Other items (processed goods, etc.)
      else {
        other.push({ id: item, qty });
      }
    }

    return { seeds, harvested, tools, other };
  }, [inventory]);

  const totalItems = Object.values(inventory).reduce((sum, qty) => sum + Math.max(0, qty), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Package size={20} className="text-amber-600" />
            Inventory
          </span>
          <Badge variant="outline">{totalItems} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seeds Section */}
        {categorized.seeds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <Leaf size={14} className="text-green-600" />
              Seeds & Crops
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categorized.seeds.map(({ id, qty, data }) => (
                <button
                  key={id}
                  onClick={() => onSelectSeed?.(id)}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border text-left transition-all
                    ${selectedSeed === id
                      ? 'bg-green-100 border-green-400 ring-2 ring-green-400 ring-offset-1'
                      : 'bg-slate-50 border-gray-200 hover:bg-slate-100'
                    }
                  `}
                >
                  <span className="text-xl">{data.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium capitalize truncate">{id}</div>
                    <div className="text-xs text-gray-500">×{qty}</div>
                  </div>
                  {selectedSeed === id && (
                    <Badge className="bg-green-500 text-white text-[10px]">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools Section */}
        {categorized.tools.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <Wrench size={14} className="text-blue-600" />
              Tools & Items
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categorized.tools.map(({ id, qty, data }) => (
                <div
                  key={id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-gray-200"
                >
                  <span className="text-xl">{data.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium capitalize truncate">{id}</div>
                    <div className="text-xs text-gray-500">×{qty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Items */}
        {categorized.other.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <FlaskConical size={14} className="text-purple-600" />
              Other Items
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categorized.other.map(({ id, qty }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-gray-200"
                >
                  <span className="text-sm capitalize truncate">{id.replace(/_/g, ' ')}</span>
                  <Badge variant="secondary">×{qty}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state - enhanced */}
        {totalItems === 0 && (
          <div className="text-center py-8">
            {/* Animated icon */}
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-amber-100 rounded-2xl rotate-6 animate-pulse" />
              <div className="absolute inset-0 bg-amber-50 rounded-2xl -rotate-3" />
              <div className="relative bg-white rounded-2xl p-4 shadow-lg flex items-center justify-center">
                <Package size={40} className="text-amber-400 animate-bob" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-pulse" size={18} />
            </div>

            <h3 className="font-semibold text-gray-800 mb-1">Inventory Empty</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your farming adventure starts at the shop!
            </p>

            {onOpenShop && (
              <Button
                onClick={onOpenShop}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg group"
              >
                <ShoppingCart size={16} className="mr-2" />
                Visit Shop
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}

            {/* Hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="text-lg">🥕</span>
              <span>Buy seeds to start planting!</span>
              <span className="text-lg">🌱</span>
            </div>
          </div>
        )}

        {/* Quick seed selector */}
        {categorized.seeds.length > 0 && (
          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Quick Select Seed
            </label>
            <select
              value={selectedSeed}
              onChange={(e) => onSelectSeed?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              id="seed-selector"
            >
              {categorized.seeds.map(({ id, qty, data }) => (
                <option key={id} value={id}>
                  {data.emoji} {id} ({qty} available)
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const InventoryPanel = memo(InventoryPanelComponent);
