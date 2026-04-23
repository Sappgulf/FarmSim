import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { DECORATION_DATA } from '../../constants/decorData';
import { CROP_DATA } from '../../constants/cropData';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';
import {
  getItemEntitlementInfo,
  isItemUnlocked,
  isPremiumModeEnabled,
} from '../../entitlements/EntitlementManager';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { getDailyCropFocus } from '../../../../utils/dailyFocus';

const getUnitSellPriceForCrop = (state, cropId) => {
  const marketPrice = Number(state.inventory?.[`${cropId}_price`]);
  if (Number.isFinite(marketPrice) && marketPrice > 0) {
    return Math.floor(marketPrice);
  }
  return Math.max(1, Math.floor(Number(CROP_DATA[cropId]?.baseValue) || 10));
};

const RARITY_CLASSES = {
  common: { border: 'border-slate-300', bg: 'bg-slate-50/50', text: 'text-slate-600' },
  uncommon: { border: 'border-green-400', bg: 'bg-green-50/50', text: 'text-green-700' },
  rare: { border: 'border-blue-400', bg: 'bg-blue-50/50', text: 'text-blue-700' },
  epic: { border: 'border-purple-400', bg: 'bg-purple-50/50', text: 'text-purple-700' },
  legendary: { border: 'border-amber-400', bg: 'bg-amber-50/50', text: 'text-amber-700' },
};

const getCropRarity = (cropId) => {
  const crop = CROP_DATA[cropId];
  if (!crop) return 'common';
  const level = crop.level || 1;
  if (level >= 10) return 'legendary';
  if (level >= 7) return 'epic';
  if (level >= 5) return 'rare';
  if (level >= 3) return 'uncommon';
  return 'common';
};

const getUtilityRarity = (itemId) => {
  const costMap = {
    fertilizer: 15, pesticide: 20, water_boost: 5, watering_can: 40,
    quality_seeds: 25, sprinkler: 100, rain_collector: 170,
    precision_hoe: 140, drone_harvester: 420, lucky_lure: 220,
    soil_analyzer: 150, greenhouse: 300, compost_bin: 75,
    hydroponics_rack: 260, soil_nanites: 360, market_terminal: 390,
  };
  const cost = costMap[itemId] || 0;
  if (cost >= 400) return 'legendary';
  if (cost >= 300) return 'epic';
  if (cost >= 150) return 'rare';
  if (cost >= 50) return 'uncommon';
  return 'common';
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'crops', label: 'Crops' },
  { id: 'decorations', label: 'Decorations' },
  { id: 'utilities', label: 'Utilities' },
];

const InventoryTab = memo(() => {
  const { state, actions } = useGame();
  const premiumModeEnabled = isPremiumModeEnabled(state);
  const dailyFocus = useMemo(() => getDailyCropFocus(state), [state]);
  const [activeCategory, setActiveCategory] = useState('all');

  const itemEmojis = {
    carrot: '🥕',
    potato: '🥔',
    corn: '🌽',
    tomato: '🍅',
    fertilizer: '🌱',
    pesticide: '🐛',
    watering_can: '💧',
    water_boost: '💧',
    wheat: '🌾',
    apple: '🍎',
    sunflower: '🌻',
    parsnip: '🥕',
    okra: '🫛',
    cranberry: '🫐',
    snowdrop: '❄️',
    turnip: '🌱',
    ginger_root: '🫚',
    quality_seeds: '🌰',
    sprinkler: '💦',
    rain_collector: '🛢️',
    precision_hoe: '⛏️',
    drone_harvester: '🛸',
    soil_analyzer: '🔬',
    greenhouse: '🏡',
    compost_bin: '🗑️',
    hydroponics_rack: '🧫',
    soil_nanites: '⚙️',
    market_terminal: '📈',
  };

  const inventoryItems = useMemo(() => (
    Object.entries(state.inventory || {}).filter(([itemId, qty]) => (
      !itemId.endsWith('_price') && Number(qty) > 0
    ))
  ), [state.inventory]);

  const cropItems = useMemo(() => (
    inventoryItems.filter(([itemId]) => Boolean(CROP_DATA[itemId]))
  ), [inventoryItems]);

  const decorationItems = useMemo(() => (
    inventoryItems.filter(([itemId]) => Boolean(DECORATION_DATA[itemId]))
  ), [inventoryItems]);

  const utilityItems = useMemo(() => (
    inventoryItems.filter(([itemId]) => !CROP_DATA[itemId] && !DECORATION_DATA[itemId])
  ), [inventoryItems]);

  const totalItems = useMemo(() => (
    inventoryItems.reduce((sum, [_, qty]) => sum + (Number(qty) || 0), 0)
  ), [inventoryItems]);

  const totalValue = useMemo(() => (
    inventoryItems.reduce((sum, [itemId, qty]) => {
      if (CROP_DATA[itemId]) {
        const unitPrice = getUnitSellPriceForCrop(state, itemId);
        const bonusMultiplier = dailyFocus?.cropId === itemId
          ? Number(dailyFocus.bonusMultiplier || 1)
          : 1;
        return sum + Math.floor(unitPrice * (Number(qty) || 0) * bonusMultiplier);
      }
      return sum + (Number(qty) || 0) * 5;
    }, 0)
  ), [inventoryItems, state, dailyFocus]);

  const cropSellSummary = useMemo(() => (
    cropItems.reduce((summary, [cropId, quantity]) => {
      const qty = Number(quantity) || 0;
      const unitPrice = getUnitSellPriceForCrop(state, cropId);
      const bonusMultiplier = dailyFocus?.cropId === cropId
        ? Number(dailyFocus?.bonusMultiplier || 1)
        : 1;
      summary.totalQuantity += qty;
      summary.totalEarnings += Math.floor(unitPrice * qty * bonusMultiplier);
      return summary;
    }, { totalQuantity: 0, totalEarnings: 0 })
  ), [cropItems, state, dailyFocus]);

  const handleSellCrop = (cropId, quantity) => {
    const result = actions.sellInventoryCrop(cropId, quantity);
    if (!result?.success) {
      actions.addNotification({
        message: `No ${formatDisplayLabel(cropId)} available to sell.`,
        type: 'info',
      });
      return;
    }

    actions.addNotification({
      message: `Sold ${result.quantity} ${formatDisplayLabel(cropId)} for ${result.earnings}🪙${result.isDailyFocus ? ' (Daily Focus bonus)' : ''}`,
      type: 'success',
    });
  };

  const handleSellAllCrops = () => {
    const result = actions.sellAllInventoryCrops();
    if (!result?.success) {
      actions.addNotification({
        message: 'No crops in inventory to sell.',
        type: 'info',
      });
      return;
    }

    actions.addNotification({
      message: `Sold ${result.totalQuantity} crops for ${result.totalEarnings}🪙`,
      type: 'success',
    });
  };

  const filteredItems = useMemo(() => {
    switch (activeCategory) {
      case 'crops': return cropItems;
      case 'decorations': return decorationItems;
      case 'utilities': return utilityItems;
      default: return [...cropItems, ...utilityItems, ...decorationItems];
    }
  }, [activeCategory, cropItems, utilityItems, decorationItems]);

  const renderInventoryCard = ([itemId, quantity]) => {
    const qty = Number(quantity) || 0;
    const isCrop = Boolean(CROP_DATA[itemId]);
    const isDecor = Boolean(DECORATION_DATA[itemId]);
    let rarity = 'common';
    if (isCrop) rarity = getCropRarity(itemId);
    else if (isDecor) rarity = DECORATION_DATA[itemId]?.rarity || 'common';
    else rarity = getUtilityRarity(itemId);
    const style = RARITY_CLASSES[rarity];

    const unitPrice = isCrop ? getUnitSellPriceForCrop(state, itemId) : null;
    const isDailyFocusCrop = dailyFocus?.cropId === itemId;
    const bonusMultiplier = isDailyFocusCrop ? Number(dailyFocus?.bonusMultiplier || 1) : 1;
    const effectiveSellPrice = unitPrice ? Math.floor(unitPrice * bonusMultiplier) : null;
    const bulkSellCount = isCrop ? Math.min(5, qty) : 0;

    const decor = isDecor ? DECORATION_DATA[itemId] : null;
    const entitlementInfo = isDecor ? getItemEntitlementInfo(itemId, 'decor') : null;
    const isPremiumDecor = isDecor && premiumModeEnabled && entitlementInfo?.access === 'premium';

    const inner = (
      <div className={`relative flex flex-col items-center text-center rounded-[14px] bg-white/90 p-4 h-full ${style.bg}`}>
        <div className="text-4xl mb-2">{itemEmojis[itemId] || '📦'}</div>
        <div className="font-semibold text-slate-900 text-sm leading-tight mb-1">
          {isDecor ? decor?.name : formatDisplayLabel(itemId)}
        </div>
        {isDailyFocusCrop && (
          <Badge className="text-[10px] bg-amber-600 mb-2">Daily Focus</Badge>
        )}
        {isPremiumDecor && (
          <Badge variant="warning" className="text-[10px] mb-2" data-qa={`premium-badge-${itemId}`}>
            {entitlementInfo?.badgeLabel || 'Premium'}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs mb-2">
          x{qty}
        </Badge>
        {effectiveSellPrice !== null && (
          <div className="text-xs text-slate-600 mb-2">
            {effectiveSellPrice}🪙 each
            {isDailyFocusCrop && (
              <span className="text-amber-700 font-medium"> ({unitPrice} base)</span>
            )}
          </div>
        )}

        <div className="mt-auto w-full sell-reveal">
          {isCrop && (
            <div className="flex flex-col gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSellCrop(itemId, 1)}
                disabled={qty < 1}
                className="w-full min-h-[36px] text-xs"
              >
                Sell 1
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSellCrop(itemId, bulkSellCount)}
                disabled={qty < 1}
                className="w-full min-h-[36px] text-xs"
              >
                Sell {bulkSellCount}
              </Button>
              <Button
                size="sm"
                onClick={() => handleSellCrop(itemId, qty)}
                disabled={qty < 1}
                className="w-full min-h-[36px] text-xs"
              >
                Sell All ({effectiveSellPrice * qty}🪙)
              </Button>
            </div>
          )}
          {isDecor && (
            <Button
              size="sm"
              className="w-full min-h-[36px] text-xs"
              onClick={() => {
                const isUnlocked = isItemUnlocked(state, itemId, 'decor');
                if (isPremiumDecor && !isUnlocked) {
                  actions.showPremiumLockPrompt({
                    itemId,
                    packId: entitlementInfo?.packId || null,
                    badgeLabel: entitlementInfo?.badgeLabel || null,
                  });
                  return;
                }
                actions.setSelectedDecoration(itemId);
                actions.setDecorationMode(true);
                actions.addNotification({
                  message: `🪴 Selected ${decor?.name || 'decor'} for placement.`,
                  type: 'info'
                });
              }}
            >
              Place
            </Button>
          )}
        </div>
      </div>
    );

    if (rarity === 'legendary') {
      return (
        <div key={itemId} className="inventory-card shimmer-border-gold p-[2px] rounded-2xl card-game-hover">
          {inner}
        </div>
      );
    }

    return (
      <div key={itemId} className={`inventory-card rounded-2xl border-2 ${style.border} bg-white/60 p-[2px] card-game-hover`}>
        {inner}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <TabHero
        icon="📦"
        tone="sky"
        title="Inventory Storage"
        description="Track stored crops, supplies, and decor before deciding what to sell or place."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-sky-700 border-sky-200">
            {totalItems} items
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="sky"
            label="Total Items"
            value={totalItems}
            hint="All stored inventory"
            icon="📦"
          />
          <MetricTile
            tone="emerald"
            label="Est. Value"
            value={`${totalValue}🪙`}
            hint="Approximate liquidation value"
            icon="💰"
          />
          <MetricTile
            tone="violet"
            label="Crop Types"
            value={cropItems.length}
            hint="Distinct harvests stored"
            icon="🌾"
          />
        </div>
      </TabHero>

      {dailyFocus?.crop && (
        <TabSection
          title="Daily market focus"
          description={`Sell ${dailyFocus.crop.emoji} ${dailyFocus.crop.name} for +${Math.round((dailyFocus.bonusMultiplier - 1) * 100)}% today.`}
          tone="amber"
          action={<Badge className="bg-amber-600 text-white">+{Math.round((dailyFocus.bonusMultiplier - 1) * 100)}%</Badge>}
        />
      )}

      <TabSection
        title="Inventory"
        description="Filter by category, then sell or place items."
        tone="sky"
        action={activeCategory === 'crops' || activeCategory === 'all' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSellAllCrops}
            disabled={cropSellSummary.totalQuantity === 0}
            className="min-h-[44px]"
          >
            Sell All ({cropSellSummary.totalEarnings}🪙)
          </Button>
        ) : null}
      >
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-smart scrollbar-gutter-stable">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[34px] ${
                activeCategory === cat.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/90 text-sky-600 hover:bg-sky-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <TabEmptyState
            icon="📦"
            tone="sky"
            title="No items here"
            description="Harvest, craft, or shop to fill your inventory."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(renderInventoryCard)}
          </div>
        )}
      </TabSection>

      {/* Tips */}
      {inventoryItems.length > 0 && (
        <TabSection title="Tips" description="Small reminders for keeping storage efficient." tone="slate">
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• Use quick-sell to free storage and reinvest into seeds</li>
            <li>• Market prices update over time, so selling windows can vary</li>
            <li>• Build processing facilities to increase crop value</li>
          </ul>
        </TabSection>
      )}
    </div>
  );
});

InventoryTab.displayName = 'InventoryTab';
export default InventoryTab;
