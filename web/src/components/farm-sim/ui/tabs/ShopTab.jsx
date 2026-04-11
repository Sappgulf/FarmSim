import React, { memo, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
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
import { getDayKey } from '../../../../systems/almanac';

const DECOR_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'garden', label: 'Garden' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'lighting', label: 'Lights' },
  { id: 'path', label: 'Paths' },
  { id: 'fence', label: 'Fences' },
];

const SHOP_TAB_TARGETS = {
  fertilizer: 'farming',
  pesticide: 'farming',
  water_boost: 'farming',
  watering_can: 'farming',
  quality_seeds: 'farming',
  sprinkler: 'farming',
  rain_collector: 'farming',
  precision_hoe: 'farming',
  drone_harvester: 'farming',
  lucky_lure: 'fishing',
  soil_analyzer: 'farming',
  greenhouse: 'weather',
  compost_bin: 'farming',
  hydroponics_rack: 'research',
  soil_nanites: 'research',
  market_terminal: 'inventory',
};

const switchToTab = (tabId) => {
  if (typeof window !== 'undefined' && typeof window.switchToTab === 'function') {
    window.switchToTab(tabId);
  }
};

const ShopTab = memo(() => {
  const { state, actions } = useGame();
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [decorCategory, setDecorCategory] = useState('all');
  const highlightTimerRef = useRef(null);
  const todayKey = getDayKey();
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
    return decorationList.filter((item) =>
      item.category === decorCategory || item.tags?.includes(decorCategory)
    );
  }, [decorationList, decorCategory]);

  const shopItems = useMemo(() => ({
    supplies: [
      { id: 'fertilizer', name: 'Fertilizer', emoji: '🌱', cost: SUPPLY_UNIT_COSTS.fertilizer, description: 'Boost soil before the next harvest', effect: 'Use from Farming actions' },
      { id: 'pesticide', name: 'Pesticide', emoji: '🐛', cost: SUPPLY_UNIT_COSTS.pesticide, description: 'Clear disease before it spreads', effect: 'Use from Farming actions' },
      { id: 'water_boost', name: 'Water Boost', emoji: '💧', cost: 5, description: 'Instant refill for thirsty plots', effect: '+100% water' },
    ],
    tools: [
      { id: 'watering_can', name: 'Watering Can', emoji: '🚿', cost: 40, description: 'Stronger manual watering', effect: '+10 water per use', unique: true },
      { id: 'quality_seeds', name: 'Quality Seeds', emoji: '🌰', cost: 25, description: 'Higher-grade seed stock', effect: '+20% harvest value', unique: true },
      { id: 'sprinkler', name: 'Sprinkler', emoji: '💦', cost: 100, description: 'Passive irrigation for every cycle', effect: '+6 water every 12s', unique: true },
      { id: 'rain_collector', name: 'Rain Collector', emoji: '🛢️', cost: 170, description: 'Pushes sprinklers harder and faster', effect: 'Sprinklers: +4 water, faster cycle', unique: true },
      { id: 'precision_hoe', name: 'Precision Hoe', emoji: '⛏️', cost: 140, description: 'Cleaner rows, less seed waste', effect: '-10% seed costs', unique: true },
      { id: 'drone_harvester', name: 'Drone Harvester', emoji: '🛸', cost: 420, description: 'Handles small harvest waves', effect: 'Auto-harvest up to 2 ready plots', unique: true },
      { id: 'lucky_lure', name: 'Lucky Lure Kit', emoji: '🪝', cost: 220, description: 'Better odds on rare fish', effect: '+35% rare fish odds', unique: true },
    ],
    upgrades: [
      { id: 'soil_analyzer', name: 'Soil Analyzer', emoji: '🔬', cost: 150, description: 'Reveal soil quality and payout', effect: 'Est. harvest value', unique: true },
      { id: 'greenhouse', name: 'Mini Greenhouse', emoji: '🏡', cost: 300, description: 'Blunts rough weather', effect: '-25% weather penalties', unique: true },
      { id: 'compost_bin', name: 'Compost Bin', emoji: '🗑️', cost: 75, description: 'Restore fertility faster', effect: '+50% fertility regen', unique: true },
      { id: 'hydroponics_rack', name: 'Hydroponics Rack', emoji: '🧫', cost: 260, description: 'Quicker indoor growth cycles', effect: '+8% crop growth speed', unique: true },
      { id: 'soil_nanites', name: 'Soil Nanites', emoji: '⚙️', cost: 360, description: 'Protect topsoil after harvest', effect: 'Higher post-harvest fertility floor', unique: true },
      { id: 'market_terminal', name: 'Market Terminal', emoji: '📈', cost: 390, description: 'Better pricing on every sale', effect: '+10% harvest value', unique: true },
    ],
  }), []);

  const plotCounts = useMemo(() => {
    const plots = Array.isArray(state.plots) ? state.plots : [];
    return plots.reduce((summary, plot) => {
      if (!plot) return summary;
      if (plot.state === 'ready') summary.ready += 1;
      if (plot.state === 'empty') summary.empty += 1;
      if (plot.state !== 'empty') summary.active += 1;
      if (plot.state !== 'empty' && Number(plot.waterLevel || 0) < 45) summary.thirsty += 1;
      if (plot.disease) summary.diseased += 1;
      return summary;
    }, { ready: 0, empty: 0, active: 0, thirsty: 0, diseased: 0 });
  }, [state.plots]);

  const uniqueItems = useMemo(
    () => [...shopItems.tools, ...shopItems.upgrades],
    [shopItems]
  );

  const upcomingBlueprints = useMemo(() => (
    uniqueItems
      .filter((item) => item.unique && (state.inventory[item.id] || 0) === 0)
      .sort((a, b) => {
        const aGap = Math.max(0, a.cost - (state.coins || 0));
        const bGap = Math.max(0, b.cost - (state.coins || 0));
        if (aGap !== bGap) return aGap - bGap;
        return a.cost - b.cost;
      })
      .slice(0, 3)
      .map((item) => ({
        ...item,
        coinsNeeded: Math.max(0, item.cost - (state.coins || 0)),
      }))
  ), [state.coins, state.inventory, uniqueItems]);

  const featuredDecor = useMemo(() => {
    if (decorationList.length === 0) return [];
    const numericSeed = Number(String(todayKey).replaceAll('-', '')) || 0;
    const offset = numericSeed % decorationList.length;
    return Array.from({ length: Math.min(3, decorationList.length) }, (_, index) => (
      decorationList[(offset + index * 3) % decorationList.length]
    ));
  }, [decorationList, todayKey]);

  const recommendedOffers = useMemo(() => {
    const offers = [];
    const pushOffer = (item, reason, accent) => {
      if (!item) return;
      if (item.unique && (state.inventory[item.id] || 0) > 0) return;
      if (offers.some((entry) => entry.id === item.id)) return;
      offers.push({
        ...item,
        reason,
        accent,
        canAfford: (state.coins || 0) >= item.cost,
        coinsNeeded: Math.max(0, item.cost - (state.coins || 0)),
      });
    };

    if (plotCounts.ready >= 2) {
      pushOffer(shopItems.tools.find((item) => item.id === 'drone_harvester'), 'Several plots are ready at once.', 'amber');
      pushOffer(shopItems.upgrades.find((item) => item.id === 'market_terminal'), 'A bigger harvest wave makes sell bonuses matter.', 'amber');
    }
    if (plotCounts.thirsty >= 2) {
      pushOffer(shopItems.tools.find((item) => item.id === 'sprinkler'), 'Multiple plots are running dry.', 'sky');
      pushOffer(shopItems.supplies.find((item) => item.id === 'water_boost'), 'You need a quick refill right now.', 'sky');
    }
    if (plotCounts.diseased > 0) {
      pushOffer(shopItems.supplies.find((item) => item.id === 'pesticide'), 'Disease is active on the field.', 'rose');
    }
    if (plotCounts.active >= 3 && (state.inventory.soil_analyzer || 0) === 0) {
      pushOffer(shopItems.upgrades.find((item) => item.id === 'soil_analyzer'), 'A fuller farm benefits from plot-by-plot value reads.', 'emerald');
    }
    if (plotCounts.empty >= 2 && (state.inventory.precision_hoe || 0) === 0) {
      pushOffer(shopItems.tools.find((item) => item.id === 'precision_hoe'), 'You still have open soil to expand planting.', 'emerald');
    }
    if (offers.length < 3) {
      pushOffer(shopItems.tools.find((item) => item.id === 'quality_seeds'), 'A safe value upgrade if you want cleaner profits.', 'violet');
    }

    return offers.slice(0, 3);
  }, [plotCounts, shopItems, state.coins, state.inventory]);

  const triggerHighlight = useCallback((itemId) => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    setHighlightedItemId(itemId);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedItemId(null);
    }, 900);
  }, []);

  const handlePurchase = useCallback((item) => {
    if (DECORATION_DATA[item.id]) {
      const entitlementInfo = getItemEntitlementInfo(item.id, 'decor');
      if (premiumModeEnabled && entitlementInfo?.access === 'premium' && !isItemUnlocked(state, item.id, 'decor')) {
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
      actions.addNotification({ message: `Purchased ${item.emoji} ${item.name}!`, type: 'success' });
      triggerHighlight(item.id);

      if (DECORATION_DATA[item.id]) {
        actions.recordMemoryEvent('shop_decor_purchase');
        actions.recordCozyGoalEvent('shop_decor_purchase', { itemId: item.id });
      }
    } else {
      actions.addNotification({ message: `Not enough coins! Need ${item.cost}`, type: 'error' });
    }
  }, [state, actions, premiumModeEnabled, triggerHighlight]);

  const renderShopItem = useCallback((item, bgClass) => {
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
            {item.effect && <div className="text-xs text-green-600 font-medium mt-0.5">{item.effect}</div>}
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
            {isOwned ? 'Owned' : `${item.cost}🪙`}
          </Button>
        </div>
      </div>
    );
  }, [state.inventory, state.coins, highlightedItemId, handlePurchase]);

  return (
    <div className="space-y-4">
      <TabHero
        icon="🛒"
        tone="amber"
        title="Farm Shop"
        description="Stock field supplies, automation, and decor in one stop."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            {state.coins}🪙
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Balance"
            value={`${state.coins}🪙`}
            hint="Coins on hand"
            icon="💰"
          />
          <MetricTile
            tone="emerald"
            label="Supplies"
            value={shopItems.supplies.length}
            hint="Consumables in stock"
            icon="🌱"
          />
          <MetricTile
            tone="violet"
            label="Decor Items"
            value={filteredDecor.length}
            hint="Visible right now"
            icon="🪴"
          />
        </div>
      </TabHero>

      {recommendedOffers.length > 0 ? (
        <TabSection
          title="Field picks"
          description="Recommended from the current farm state."
          tone="amber"
          action={<Badge variant="outline" className="bg-white/80 text-amber-700">Today</Badge>}
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {recommendedOffers.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-amber-100/80 bg-white/88 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="mt-2 font-semibold text-slate-900">{item.name}</div>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {item.cost}🪙
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-700">{item.reason}</p>
                <p className="mt-1 text-xs text-slate-500">{item.effect}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    {item.canAfford ? 'Ready to buy' : `Save ${item.coinsNeeded}🪙 more`}
                  </span>
                  <Button
                    size="sm"
                    variant={item.canAfford ? 'default' : 'outline'}
                    onClick={() => {
                      if (item.canAfford) {
                        handlePurchase(item);
                        return;
                      }
                      switchToTab(SHOP_TAB_TARGETS[item.id] || 'farming');
                    }}
                    className="min-h-[40px]"
                  >
                    {item.canAfford ? 'Buy now' : 'Prep field'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabSection>
      ) : null}

      {upcomingBlueprints.length > 0 ? (
        <TabSection
          title="Blueprint watch"
          description="The next permanent upgrades within reach."
          tone="violet"
          action={<span className="text-xs text-slate-500">Unowned</span>}
        >
          <div className="grid gap-2">
            {upcomingBlueprints.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200/70 bg-white/80 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-600">{item.effect}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{item.cost}🪙</div>
                  <div className="text-[11px] text-slate-500">
                    {item.coinsNeeded === 0 ? 'Affordable now' : `${item.coinsNeeded}🪙 to go`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabSection>
      ) : null}

      {/* Supplies */}
      <TabSection
        title="Farming supplies"
        description="Quick-use items for watering, treating, and boosting plots."
        tone="emerald"
      >
        <div className="space-y-2">
          {shopItems.supplies.map((item) => renderShopItem(item, 'bg-green-50'))}
        </div>
      </TabSection>

      {featuredDecor.length > 0 ? (
        <TabSection
          title="Today at the stall"
          description="A rotating decor shelf for the current day."
          tone="rose"
          action={<Badge variant="outline" className="bg-white/80 text-rose-700">{todayKey}</Badge>}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {featuredDecor.map((item) => {
              const ownedCount = state.inventory[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-rose-100/80 bg-white/88 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="mt-2 font-semibold text-slate-900">{item.name}</div>
                    </div>
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                      {item.cost}🪙
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.description}</p>
                  <div className="mt-1 text-xs font-medium capitalize text-rose-600">
                    {item.category} · {item.rarity}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {ownedCount > 0 ? `Owned x${ownedCount}` : 'Fresh today'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePurchase(item)}
                      disabled={state.coins < item.cost}
                      className="min-h-[40px]"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabSection>
      ) : null}

      {/* Decor Catalog */}
      <TabSection
        title="Decor catalog"
        description="Filter by style, then place from inventory."
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
          ) : filteredDecor.map((item, index) => {
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
                        <Badge variant="warning" className="text-[10px]" data-qa={`premium-badge-${item.id}`}>
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
                    <Badge variant="outline" className="text-[10px]">x{ownedCount}</Badge>
                  )}
                  <Button
                    onClick={() => handlePurchase(item)}
                    size="sm"
                    disabled={state.coins < item.cost}
                    className="ml-2"
                  >
                    {item.cost}🪙
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </TabSection>

      {/* Tools */}
      <TabSection
        title="Tools & equipment"
        description="Permanent tools for speed, watering, and automation."
        tone="sky"
      >
        <div className="space-y-2">
          {shopItems.tools.map((item) => renderShopItem(item, 'bg-blue-50'))}
        </div>
      </TabSection>

      {/* Upgrades */}
      <TabSection
        title="Field upgrades"
        description="Long-term systems that raise output and resilience."
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
