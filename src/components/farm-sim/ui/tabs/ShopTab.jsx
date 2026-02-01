import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { CROP_DATA } from '../../constants/cropData';
import { getMarketBonusLabel } from '../../constants/marketData';

const ShopTab = memo(() => {
  const { state, actions } = useGame();
  const vendorDiscount = state.social?.vendorDiscount || 0;
  const marketState = state.market;
  const featuredCrop = useMemo(() => (
    marketState?.dailyFeaturedCrop ? CROP_DATA[marketState.dailyFeaturedCrop] : null
  ), [marketState?.dailyFeaturedCrop]);
  const discountLabel = vendorDiscount > 0 ? `-${Math.round(vendorDiscount * 100)}%` : null;
  const getDiscountedCost = (cost) => {
    if (!vendorDiscount) return cost;
    return Math.max(1, Math.round(cost * (1 - vendorDiscount)));
  };

  const UNIQUE_UPGRADE_IDS = ['watering_can', 'sprinkler', 'greenhouse', 'soil_analyzer', 'compost_bin'];

  const shopItems = {
    supplies: [
      { id: 'fertilizer', name: 'Fertilizer', emoji: '🌱', cost: 8, description: 'Prep soil for faster growth', effect: '+10% growth speed' },
      { id: 'pesticide', name: 'Pesticide', emoji: '🐛', cost: 6, description: 'Eliminates crop diseases', effect: 'Cure diseases' },
      { id: 'water_boost', name: 'Water Boost', emoji: '💧', cost: 5, description: 'Maintains water level', effect: '+100% water' },
    ],
    tools: [
      { id: 'watering_can', name: 'Watering Can', emoji: '🚿', cost: 40, description: 'Better watering efficiency', effect: 'Permanent' },
      { id: 'quality_seeds', name: 'Quality Seeds', emoji: '🌰', cost: 25, description: 'Higher yield crops', effect: '+20% value' },
      { id: 'sprinkler', name: 'Sprinkler', emoji: '💦', cost: 100, description: 'Auto-waters thirsty plots over time', effect: 'Automation' },
    ],
    upgrades: [
      { id: 'soil_analyzer', name: 'Soil Analyzer', emoji: '🔬', cost: 150, description: 'Shows soil fertility levels', effect: 'Visibility' },
      { id: 'greenhouse', name: 'Mini Greenhouse', emoji: '🏡', cost: 300, description: 'Weather-proof single plot', effect: 'Weather immunity' },
      { id: 'compost_bin', name: 'Compost Bin', emoji: '🗑️', cost: 75, description: 'Boosts compost-to-fertilizer yield', effect: '+1 fertilizer craft' },
    ]
  };

  // Check if item is already owned (for one-time purchases)
  const isOwned = (itemId) => {
    if (!UNIQUE_UPGRADE_IDS.includes(itemId)) return false;
    return (state.inventory[itemId] || 0) > 0;
  };

  const ownedUpgradeCount = UNIQUE_UPGRADE_IDS.filter((id) => (state.inventory[id] || 0) > 0).length;
  const allUpgradesOwned = ownedUpgradeCount === UNIQUE_UPGRADE_IDS.length;

  const handlePurchase = (item) => {
    if (isOwned(item.id)) {
      return; // Double safety
    }

    const finalCost = getDiscountedCost(item.cost);
    if (state.coins >= finalCost) {
      actions.setCoins(state.coins - finalCost);
      actions.updateInventory({
        ...state.inventory,
        [item.id]: (state.inventory[item.id] || 0) + 1
      });
      actions.addNotification({
        message: `Purchased ${item.emoji} ${item.name}!`,
        type: 'success'
      });

      // Play sound
      if (window.soundSystem) {
        window.soundSystem.playBuildSound(); // Or generic buy sound
      }

    } else {
      actions.addNotification({
        message: `Not enough coins! Need ${finalCost}🪙`,
        type: 'error'
      });
      if (window.soundSystem) window.soundSystem.playErrorSound();
    }
  };

  const renderShopItem = (item, colorClass, btnColorClass) => {
    const owned = isOwned(item.id);
    const finalCost = getDiscountedCost(item.cost);
    const canAfford = state.coins >= finalCost;

    return (
      <Card
        key={item.id}
        className={`
          relative overflow-hidden group/shop-item transition-all duration-300 border-2
          ${owned
            ? 'bg-slate-50/50 border-slate-200 opacity-75'
            : `bg-white hover:bg-gradient-to-br ${colorClass} hover:border-white shadow-md hover:shadow-2xl hover:-translate-y-1.5 border-slate-100`
          }
          p-5 rounded-[1.5rem]
        `}
      >
        {/* Glow effect on hover */}
        {!owned && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/shop-item:opacity-100 transition-opacity pointer-events-none" />
        )}

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center text-4xl
              transition-all duration-500 group-hover/shop-item:scale-110 group-hover/shop-item:rotate-6
              ${owned ? 'bg-slate-200 grayscale' : 'bg-white shadow-inner'}
            `}>
              {item.emoji}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`font-black text-lg tracking-tight ${owned ? 'text-slate-500' : 'text-slate-800'}`}>
                  {item.name}
                </div>
                {owned && (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5">
                    Collected
                  </Badge>
                )}
              </div>
              <div className="text-sm text-slate-500 font-medium mt-0.5 leading-tight">{item.description}</div>

              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary" className="bg-white/60 text-slate-600 border-none font-bold text-[10px] uppercase tracking-wider px-2 py-1">
                  ⚡ {item.effect}
                </Badge>
                {discountLabel && !owned && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Promo Active
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ml-4">
            {owned ? (
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 font-black text-xl">
                ✓
              </div>
            ) : (
              <Button
                onClick={() => handlePurchase(item)}
                disabled={!canAfford}
                className={`
                  h-14 px-6 rounded-2xl font-black text-lg shadow-xl transition-all duration-300
                  ${canAfford
                    ? `${btnColorClass} hover:scale-105 active:scale-95 hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)]`
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none'
                  }
                `}
              >
                <span className="mr-1.5">💰</span>
                {finalCost}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Player Balance - Premium AAA Card */}
      <Card className="p-8 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 border-none shadow-[0_20px_50px_rgba(245,158,11,0.3)] relative overflow-hidden group">
        {/* Animated particles background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.4)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(0,0,0,0.2)_0%,transparent_50%)]" />
        </div>

        {/* Decorative coin icon - Enhanced */}
        <div className="absolute -right-8 -top-8 text-[12rem] opacity-10 rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-0">💰</div>

        <div className="flex justify-between items-end relative z-10">
          <div className="space-y-4">
            <div>
              <h3 className="text-4xl font-black text-white tracking-tighter drop-shadow-md">FARM SHOP</h3>
              <p className="text-amber-100/80 font-bold text-sm uppercase tracking-[0.2em] mt-1">Global Supplies & Tech</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                <div className="text-[10px] font-black text-amber-100 tracking-widest uppercase">Legacy Items</div>
                <div className="text-xl font-black text-white">{ownedUpgradeCount}<span className="text-white/40 font-bold mx-1">/</span>{UNIQUE_UPGRADE_IDS.length}</div>
              </div>

              {discountLabel && (
                <div className="px-4 py-2 bg-emerald-500/30 backdrop-blur-md rounded-xl border border-emerald-400/30 shadow-inner flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <div className="text-xs font-black text-white uppercase tracking-wider">{discountLabel} SAVINGS</div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-amber-100 uppercase tracking-widest mb-1 opacity-80">Your Treasury</div>
            <div className="text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-end gap-2">
              {state.coins}
              <span className="text-4xl">🪙</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Market Board - Premium HUD Widget */}
      <Card className="p-6 border-emerald-500/20 bg-gradient-to-r from-emerald-900 to-teal-900 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-4xl shadow-inner">
              {marketState?.dailyMood?.emoji || '📈'}
            </div>
            <div>
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Market Sentiment</div>
              <div className="text-2xl font-black text-white tracking-tight">{marketState?.dailyMood?.label || 'Steady Market'}</div>
              <div className="text-xs text-emerald-200/60 font-medium mt-1">{marketState?.dailyMood?.description}</div>
            </div>
          </div>

          <div className="h-12 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center gap-5 bg-black/20 px-6 py-3 rounded-2xl border border-white/5">
            <div className="text-right">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Stock of the Day</div>
              <div className="text-xl font-black text-white tracking-wide">
                {featuredCrop ? featuredCrop.name : 'NO DATA'}
              </div>
              <div className="text-[10px] font-black text-yellow-500 uppercase flex items-center justify-end gap-1 mt-1">
                <span className="animate-bounce">▲</span> {getMarketBonusLabel(marketState)} Yield
              </div>
            </div>
            <div className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {featuredCrop ? featuredCrop.emoji : '❓'}
            </div>
          </div>
        </div>
      </Card>

      {/* Shop Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Supplies */}
        <div className="space-y-4">
          <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 ml-2">
            <span className="w-1.5 h-6 bg-green-500 rounded-full" />
            🌱 Farming Supplies
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {shopItems.supplies.map(item => renderShopItem(item, 'from-green-50 to-emerald-50', 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'))}
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-4">
          <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 ml-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
            🔧 Tools & Equipment
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {shopItems.tools.map(item => renderShopItem(item, 'from-blue-50 to-indigo-50', 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'))}
          </div>
        </div>
      </div>

      {/* Upgrades - Full Width */}
      <div className="space-y-4 pt-4">
        <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 ml-2">
          <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
          ⭐ Kingdom Upgrades
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.upgrades.map(item => renderShopItem(item, 'from-purple-50 to-violet-50', 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white'))}
        </div>
      </div>
    </div>
  );
});

ShopTab.displayName = 'ShopTab';
export default ShopTab;
