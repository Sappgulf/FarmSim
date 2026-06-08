import React, { memo, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { DECORATION_DATA } from '../../constants/decorData';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';
import {
  getItemEntitlementInfo,
  isItemUnlocked,
  isPremiumModeEnabled,
} from '../../entitlements/EntitlementManager';
import { SUPPLY_UNIT_COSTS } from '../../../../utils/supplies';

const DECOR_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'garden', label: 'Garden' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'lighting', label: 'Lights' },
  { id: 'path', label: 'Paths' },
  { id: 'fence', label: 'Fences' },
];

const ShopTab = memo(() => {
  const { state, actions } = useGame();
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [decorCategory, setDecorCategory] = useState('all');
  const highlightTimerRef = useRef(null);
  const decorationList = useMemo(() => Object.values(DECORATION_DATA), []);
  const premiumModeEnabled = isPremiumModeEnabled(state);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const filteredDecor = useMemo(() => {
    if (decorCategory === 'all') return decorationList;
    return decorationList.filter(
      (item) => item.category === decorCategory || item.tags?.includes(decorCategory)
    );
  }, [decorationList, decorCategory]);

  const shopItems = useMemo(
    () => ({
      supplies: [
        {
          id: 'fertilizer',
          name: 'Fertilizer',
          emoji: '🌱',
          cost: SUPPLY_UNIT_COSTS.fertilizer,
          description: 'Consumable supply for fertilizing plots',
          effect: 'Use in Farming quick actions',
        },
        {
          id: 'pesticide',
          name: 'Pesticide',
          emoji: '🐛',
          cost: SUPPLY_UNIT_COSTS.pesticide,
          description: 'Consumable supply for treating diseased crops',
          effect: 'Use in Farming quick actions',
        },
        {
          id: 'water_boost',
          name: 'Water Boost',
          emoji: '💧',
          cost: 5,
          description: 'Maintains water level',
          effect: '+100% water',
        },
      ],
      tools: [
        {
          id: 'watering_can',
          name: 'Watering Can',
          emoji: '🚿',
          cost: 40,
          description: 'Improves watering actions',
          effect: '+10 water per use',
          unique: true,
        },
        {
          id: 'quality_seeds',
          name: 'Quality Seeds',
          emoji: '🌰',
          cost: 25,
          description: 'Premium seeds for higher yields',
          effect: '+20% harvest value',
          unique: true,
        },
        {
          id: 'sprinkler',
          name: 'Sprinkler',
          emoji: '💦',
          cost: 100,
          description: 'Automated irrigation system',
          effect: '+6 water every 12s',
          unique: true,
        },
        {
          id: 'rain_collector',
          name: 'Rain Collector',
          emoji: '🛢️',
          cost: 170,
          description: 'Boosts sprinkler pressure and cadence',
          effect: 'Sprinklers: +4 water, faster cycle',
          unique: true,
        },
        {
          id: 'precision_hoe',
          name: 'Precision Hoe',
          emoji: '⛏️',
          cost: 140,
          description: 'Cleaner rows reduce seed waste',
          effect: '-10% seed costs',
          unique: true,
        },
        {
          id: 'drone_harvester',
          name: 'Drone Harvester',
          emoji: '🛸',
          cost: 420,
          description: 'Automates small batches of harvesting',
          effect: 'Auto-harvest up to 2 ready plots',
          unique: true,
        },
        {
          id: 'lucky_lure',
          name: 'Lucky Lure Kit',
          emoji: '🪝',
          cost: 220,
          description: 'Premium lure kit that attracts rare fish',
          effect: '+35% rare fish odds',
          unique: true,
        },
      ],
      upgrades: [
        {
          id: 'soil_analyzer',
          name: 'Soil Analyzer',
          emoji: '🔬',
          cost: 150,
          description: 'Reveals soil and yield details',
          effect: 'Est. harvest value',
          unique: true,
        },
        {
          id: 'greenhouse',
          name: 'Mini Greenhouse',
          emoji: '🏡',
          cost: 300,
          description: 'Softens harsh weather impacts',
          effect: '-25% weather penalties',
          unique: true,
        },
        {
          id: 'compost_bin',
          name: 'Compost Bin',
          emoji: '🗑️',
          cost: 75,
          description: 'Restore soil fertility faster',
          effect: '+50% fertility regen',
          unique: true,
        },
        {
          id: 'hydroponics_rack',
          name: 'Hydroponics Rack',
          emoji: '🧫',
          cost: 260,
          description: 'Circulating roots boost indoor growth',
          effect: '+8% crop growth speed',
          unique: true,
        },
        {
          id: 'soil_nanites',
          name: 'Soil Nanites',
          emoji: '⚙️',
          cost: 360,
          description: 'Microscopic bots preserve topsoil',
          effect: 'Higher post-harvest fertility floor',
          unique: true,
        },
        {
          id: 'market_terminal',
          name: 'Market Terminal',
          emoji: '📈',
          cost: 390,
          description: 'AI market edge for better sell prices',
          effect: '+10% harvest value',
          unique: true,
        },
      ],
    }),
    []
  );

  const triggerHighlight = useCallback((itemId) => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    setHighlightedItemId(itemId);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedItemId(null);
    }, 900);
  }, []);

  const handlePurchase = useCallback(
    (item) => {
      if (DECORATION_DATA[item.id]) {
        const entitlementInfo = getItemEntitlementInfo(item.id, 'decor');
        if (
          premiumModeEnabled &&
          entitlementInfo?.access === 'premium' &&
          !isItemUnlocked(state, item.id, 'decor')
        ) {
          actions.showPremiumLockPrompt({
            itemId: item.id,
            packId: entitlementInfo?.packId || null,
            badgeLabel: entitlementInfo?.badgeLabel || null,
          });
          return;
        }
      }
      const ownedCount = state.inventory[item.id] || 0;
      if (item.unique && ownedCount > 0) {
        actions.addNotification({ message: `${item.name} already owned.`, type: 'info' });
        return;
      }
      if (state.coins >= item.cost) {
        actions.spendMoney(item.cost);
        actions.updateInventory({
          ...state.inventory,
          [item.id]: (state.inventory[item.id] || 0) + 1,
        });
        actions.addNotification({
          message: `Purchased ${item.emoji} ${item.name}!`,
          type: 'success',
        });
        triggerHighlight(item.id);

        if (DECORATION_DATA[item.id]) {
          actions.recordMemoryEvent('shop_decor_purchase');
          actions.recordCozyGoalEvent('shop_decor_purchase', { itemId: item.id });
        }
      } else {
        actions.addNotification({ message: `Not enough coins! Need ${item.cost}`, type: 'error' });
      }
    },
    [state, actions, premiumModeEnabled, triggerHighlight]
  );

  const renderShopItem = useCallback(
    (item, bgClass) => {
      const ownedCount = state.inventory[item.id] || 0;
      const isOwned = item.unique && ownedCount > 0;
      const isHighlighted = highlightedItemId === item.id;
      return (
        <div
          key={item.id}
          className={`flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white sm:flex-row sm:items-center sm:justify-between ${bgClass} ${isHighlighted ? 'ring-2 ring-amber-200' : ''}`}
        >
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <div className="font-medium text-slate-900">{item.name}</div>
              <div className="text-xs text-gray-600">{item.description}</div>
              {item.effect && (
                <div className="text-xs text-green-600 font-medium mt-0.5">{item.effect}</div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {ownedCount > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {item.unique ? 'Owned' : `x${ownedCount}`}
              </Badge>
            )}
            <Button
              onClick={() => handlePurchase(item)}
              size="sm"
              disabled={state.coins < item.cost || isOwned}
              className="min-w-[72px] shrink-0"
            >
              {isOwned ? 'Owned' : `${item.cost}`}
            </Button>
          </div>
        </div>
      );
    },
    [state.inventory, state.coins, highlightedItemId, handlePurchase]
  );

  return (
    <div className="space-y-4">
      <TabHero
        icon="🛒"
        tone="amber"
        title="Farm Shop"
        description="Buy supplies, tools, upgrades, and decor without bouncing between screens."
        badge={
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            {state.coins}🪙
          </Badge>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Balance"
            value={`${state.coins}🪙`}
            hint="Spendable coins"
            icon="💰"
          />
          <MetricTile
            tone="emerald"
            label="Supplies"
            value={shopItems.supplies.length}
            hint="Consumables available"
            icon="🌱"
          />
          <MetricTile
            tone="violet"
            label="Decor Items"
            value={filteredDecor.length}
            hint="Catalog currently shown"
            icon="🪴"
          />
        </div>
      </TabHero>

      {/* Supplies */}
      <TabSection
        title="Farming supplies"
        description="Consumables and support items for active farm work."
        tone="emerald"
      >
        <div className="space-y-2">
          {shopItems.supplies.map((item) => renderShopItem(item, 'bg-green-50'))}
        </div>
      </TabSection>

      {/* Decor Catalog */}
      <TabSection
        title="Decor catalog"
        description="Filter by style and place the pieces that fit your farm."
        tone="rose"
        action={<span className="text-xs text-slate-500">{filteredDecor.length} items</span>}
      >
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-smart scrollbar-gutter-stable">
          {DECOR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setDecorCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[34px] ${
                decorCategory === cat.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/90 text-rose-600 hover:bg-rose-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-smart">
          {filteredDecor.length === 0 ? (
            <TabEmptyState
              icon="🪴"
              tone="rose"
              title="No decor in this category"
              description="Try a different filter or keep shopping."
            />
          ) : (
            filteredDecor.map((item, index) => {
              const ownedCount = state.inventory[item.id] || 0;
              const isHighlighted = highlightedItemId === item.id;
              const entitlementInfo = getItemEntitlementInfo(item.id, 'decor');
              const isPremium = premiumModeEnabled && entitlementInfo?.access === 'premium';
              return (
                <div
                  key={item.id}
                  className={`flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white sm:flex-row sm:items-center sm:justify-between ${isHighlighted ? 'ring-2 ring-amber-200' : ''}`}
                  style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {isPremium && (
                          <Badge
                            variant="warning"
                            className="text-[10px]"
                            data-qa={`premium-badge-${item.id}`}
                          >
                            {entitlementInfo?.badgeLabel || 'Premium'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{item.description}</div>
                      <div className="text-xs text-rose-600 font-medium mt-0.5 capitalize">
                        {item.category} &middot; {item.rarity}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
                    {ownedCount > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        x{ownedCount}
                      </Badge>
                    )}
                    <Button
                      onClick={() => handlePurchase(item)}
                      size="sm"
                      disabled={state.coins < item.cost}
                      className="ml-2"
                    >
                      {item.cost}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </TabSection>

      {/* Tools */}
      <TabSection
        title="Tools & equipment"
        description="One-off tools and automation upgrades for the field."
        tone="sky"
      >
        <div className="space-y-2">
          {shopItems.tools.map((item) => renderShopItem(item, 'bg-blue-50'))}
        </div>
      </TabSection>

      {/* Upgrades */}
      <TabSection
        title="Premium upgrades"
        description="Late-game systems that quietly widen the farm’s ceiling."
        tone="violet"
      >
        <div className="space-y-2">
          {shopItems.upgrades.map((item) => renderShopItem(item, 'bg-purple-50'))}
        </div>
      </TabSection>
    </div>
  );
});

ShopTab.displayName = 'ShopTab';
export default ShopTab;
