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

const RARITY_CLASSES = {
  common: { border: 'border-slate-300', bg: 'bg-slate-50/50', text: 'text-slate-600', label: 'Common' },
  uncommon: { border: 'border-green-400', bg: 'bg-green-50/50', text: 'text-green-700', label: 'Uncommon' },
  rare: { border: 'border-blue-400', bg: 'bg-blue-50/50', text: 'text-blue-700', label: 'Rare' },
  epic: { border: 'border-purple-400', bg: 'bg-purple-50/50', text: 'text-purple-700', label: 'Epic' },
  legendary: { border: 'border-amber-400', bg: 'bg-amber-50/50', text: 'text-amber-700', label: 'Legendary' },
};

const getItemRarity = (item) => {
  if (item.rarity) return item.rarity;
  const cost = item.cost || 0;
  if (cost >= 400) return 'legendary';
  if (cost >= 300) return 'epic';
  if (cost >= 150) return 'rare';
  if (cost >= 50) return 'uncommon';
  return 'common';
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
      if (!state.memoryFlags?.first_shop_purchase) {
        actions.unlockMemory('first_shop_purchase');
      }
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

  const renderPremiumCard = useCallback((item, options = {}) => {
    const { isPremiumDecor = false, showReason = false, isBlueprint = false } = options;
    const rarity = getItemRarity(item);
    const style = RARITY_CLASSES[rarity];
    const ownedCount = state.inventory[item.id] || 0;
    const isOwned = item.unique && ownedCount > 0;
    const isHighlighted = highlightedItemId === item.id;
    const canAfford = item.canAfford !== undefined ? item.canAfford : (state.coins || 0) >= item.cost;

    const inner = (
      <div className={`relative flex flex-col rounded-[14px] bg-white/90 p-3 h-full ${style.bg} ${isHighlighted ? 'ring-2 ring-amber-200' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-3xl shrink-0">{item.emoji}</span>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-sm leading-tight truncate">{item.name}</div>
              {isOwned && (
                <Badge variant="success" className="text-[10px] mt-1">
                  ✓ Owned
                </Badge>
              )}
              {!isOwned && ownedCount > 0 && (
                <Badge variant="outline" className="text-[10px] mt-1">
                  x{ownedCount}
                </Badge>
              )}
              {isPremiumDecor && (
                <Badge variant="warning" className="text-[10px] mt-1" data-qa={`premium-badge-${item.id}`}>
                  Premium
                </Badge>
              )}
            </div>
          </div>
          <div className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 text-amber-900 shadow-sm border border-amber-300/50">
            {item.cost}🪙
          </div>
        </div>

        {showReason && item.reason && (
          <p className="mt-1 text-xs text-slate-700 italic">{item.reason}</p>
        )}

        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.description}</p>

        {item.effect && (
          <div className={`mt-1 text-xs font-medium flex items-center gap-1 ${style.text}`}>
            <span>⚡</span>
            <span>{item.effect}</span>
          </div>
        )}

        {isBlueprint && item.coinsNeeded > 0 && (
          <div className="mt-1 text-[11px] text-slate-500">
            {item.coinsNeeded}🪙 to go
          </div>
        )}

        <div className="mt-auto pt-2">
          {isBlueprint ? (
            <Button size="sm" variant="outline" disabled className="w-full">
              Save up
            </Button>
          ) : showReason && !canAfford ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => switchToTab(SHOP_TAB_TARGETS[item.id] || 'farming')}
              className="w-full"
            >
              Prep field
            </Button>
          ) : (
            <Button
              onClick={() => handlePurchase(item)}
              size="sm"
              disabled={!canAfford || isOwned}
              juicy
              shine={isPremiumDecor}
              variant={isPremiumDecor ? 'gold' : 'default'}
              className="w-full"
            >
              {isOwned ? 'Owned' : 'Buy'}
            </Button>
          )}
        </div>
      </div>
    );

    if (rarity === 'legendary') {
      return (
        <div key={item.id} className="shimmer-border-gold p-[2px] rounded-2xl card-game-hover">
          {inner}
        </div>
      );
    }

    return (
      <div key={item.id} className={`rounded-2xl border-2 ${style.border} bg-white/60 p-[2px] card-game-hover`}>
        {inner}
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedOffers.map((item) => renderPremiumCard(item, { showReason: true }))}
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingBlueprints.map((item) => renderPremiumCard(item, { isBlueprint: true }))}
          </div>
        </TabSection>
      ) : null}

      {/* Supplies */}
      <TabSection
        title="Farming supplies"
        description="Quick-use items for watering, treating, and boosting plots."
        tone="emerald"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopItems.supplies.map((item) => renderPremiumCard(item))}
        </div>
      </TabSection>

      {featuredDecor.length > 0 ? (
        <TabSection
          title="Today at the stall"
          description="A rotating decor shelf for the current day."
          tone="rose"
          action={<Badge variant="outline" className="bg-white/80 text-rose-700">{todayKey}</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDecor.map((item) => {
              const entitlementInfo = getItemEntitlementInfo(item.id, 'decor');
              const isPremium = premiumModeEnabled && entitlementInfo?.access === 'premium';
              return renderPremiumCard(item, { isPremiumDecor: isPremium });
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-smart">
          {filteredDecor.length === 0 ? (
            <TabEmptyState
              icon="🪴"
              tone="rose"
              title="No decor in this category"
              description="Try a different filter or keep shopping."
            />
          ) : filteredDecor.map((item) => {
            const entitlementInfo = getItemEntitlementInfo(item.id, 'decor');
            const isPremium = premiumModeEnabled && entitlementInfo?.access === 'premium';
            return renderPremiumCard(item, { isPremiumDecor: isPremium });
          })}
        </div>
      </TabSection>

      {/* Tools */}
      <TabSection
        title="Tools & equipment"
        description="Permanent tools for speed, watering, and automation."
        tone="sky"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopItems.tools.map((item) => renderPremiumCard(item))}
        </div>
      </TabSection>

      {/* Upgrades */}
      <TabSection
        title="Field upgrades"
        description="Long-term systems that raise output and resilience."
        tone="violet"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopItems.upgrades.map((item) => renderPremiumCard(item))}
        </div>
      </TabSection>
    </div>
  );
});

ShopTab.displayName = 'ShopTab';
export default ShopTab;
