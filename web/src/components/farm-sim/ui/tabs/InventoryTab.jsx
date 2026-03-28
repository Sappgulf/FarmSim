import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { DECORATION_DATA } from '../../constants/decorData';
import { CROP_DATA } from '../../constants/cropData';
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

const InventoryTab = memo(() => {
  const { state, actions } = useGame();
  const premiumModeEnabled = isPremiumModeEnabled(state);
  const dailyFocus = useMemo(() => getDailyCropFocus(state), [state]);

  // Item emoji mapping
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
        ? Number(dailyFocus.bonusMultiplier || 1)
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

  return (
    <div className="space-y-4">
      {/* Inventory Overview */}
      <Card className="overflow-hidden border-blue-200/70 bg-gradient-to-br from-white via-blue-50/30 to-violet-50/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">Inventory</div>
            <h3 className="text-lg font-semibold text-slate-900">Your storage</h3>
          </div>
          <Badge variant="outline" className="bg-white/80 text-slate-600">
            {totalItems} items
          </Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 text-center shadow-sm">
            <div className="font-bold text-blue-600">{totalItems}</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Total items</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 text-center shadow-sm">
            <div className="font-bold text-green-600">{totalValue}🪙</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Est. value</div>
          </div>
        </div>
      </Card>

      {dailyFocus?.crop && (
        <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-slate-900">Daily market focus</h4>
              <p className="text-sm text-slate-600">
                Sell {dailyFocus.crop.emoji} {dailyFocus.crop.name} for +{Math.round((dailyFocus.bonusMultiplier - 1) * 100)}% today.
              </p>
            </div>
            <Badge className="bg-amber-600 text-white">
              +{Math.round((dailyFocus.bonusMultiplier - 1) * 100)}%
            </Badge>
          </div>
        </Card>
      )}

      {/* Crops & Quick Sell */}
      <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="font-semibold text-slate-900">Crops</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSellAllCrops}
            disabled={cropSellSummary.totalQuantity === 0}
            className="min-h-[40px]"
          >
            Sell All ({cropSellSummary.totalEarnings}🪙)
          </Button>
        </div>

        {cropItems.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🌾</div>
            <p className="text-slate-500">No crops stored</p>
            <p className="text-sm text-slate-400 mt-1">Harvest to stock up on produce.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cropItems.map(([itemId, quantity]) => {
              const unitPrice = getUnitSellPriceForCrop(state, itemId);
              const isDailyFocusCrop = dailyFocus?.cropId === itemId;
              const bonusMultiplier = isDailyFocusCrop
                ? Number(dailyFocus?.bonusMultiplier || 1)
                : 1;
              const effectiveSellPrice = Math.floor(unitPrice * bonusMultiplier);
              const qty = Number(quantity) || 0;
              const bulkSellCount = Math.min(5, qty);

              return (
                <div key={itemId} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 shadow-sm transition-colors hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{itemEmojis[itemId] || '📦'}</span>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {formatDisplayLabel(itemId)}
                          {isDailyFocusCrop && (
                            <Badge className="text-[10px] bg-amber-600">Daily Focus</Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-600">
                          {effectiveSellPrice}🪙 each
                          {isDailyFocusCrop && (
                            <span className="text-amber-700 font-medium"> ({unitPrice} base)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      x{qty}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSellCrop(itemId, 1)}
                      disabled={qty < 1}
                      className="min-h-[40px]"
                    >
                      Sell 1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSellCrop(itemId, bulkSellCount)}
                      disabled={qty < 1}
                      className="min-h-[40px]"
                    >
                      Sell {bulkSellCount}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSellCrop(itemId, qty)}
                      disabled={qty < 1}
                      className="min-h-[40px]"
                    >
                      Sell All ({effectiveSellPrice * qty}🪙)
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Supplies & Upgrades */}
      <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
        <h4 className="font-semibold text-slate-900">Supplies & upgrades</h4>
        <p className="mt-1 mb-3 text-xs text-slate-500">Fresh saves start with a small starter kit so you can plant immediately.</p>

        {utilityItems.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🧰</div>
            <p className="text-slate-500">No supplies in storage</p>
            <p className="text-sm text-slate-400 mt-1">Visit the Shop to stock up.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {utilityItems.map(([itemId, quantity]) => (
              <div key={itemId} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{itemEmojis[itemId] || '📦'}</span>
                  <span className="font-medium">{formatDisplayLabel(itemId)}</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  x{quantity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Decorations */}
      <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
        <h4 className="mb-3 font-semibold text-slate-900">Decorations</h4>

        {decorationItems.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🧺</div>
            <p className="text-slate-500">No decorations yet</p>
            <p className="text-sm text-slate-400 mt-1">Visit the Shop for cozy decor.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {decorationItems.map(([itemId, quantity]) => {
              const decor = DECORATION_DATA[itemId];
              const entitlementInfo = getItemEntitlementInfo(itemId, 'decor');
              const isPremium = premiumModeEnabled && entitlementInfo?.access === 'premium';
              const isUnlocked = isItemUnlocked(state, itemId, 'decor');
              return (
                <div key={itemId} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/80 p-3 transition-colors hover:bg-rose-50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{decor?.emoji || '🪴'}</span>
                    <div>
                      <div className="font-medium">{decor?.name || formatDisplayLabel(itemId)}</div>
                      <div className="text-xs text-rose-600">{decor?.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPremium && (
                      <Badge
                        variant="warning"
                        className="text-[10px]"
                        data-qa={`premium-badge-${itemId}`}
                      >
                        {entitlementInfo?.badgeLabel || 'Premium'}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-sm">
                      x{quantity}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (isPremium && !isUnlocked) {
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tips */}
      {inventoryItems.length > 0 && (
        <Card className="overflow-hidden border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 p-4">
          <h4 className="font-semibold text-slate-900">Tips</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>• Use quick-sell to free storage and reinvest into seeds</li>
            <li>• Market prices update over time, so selling windows can vary</li>
            <li>• Build processing facilities to increase crop value</li>
          </ul>
        </Card>
      )}
    </div>
  );
});

InventoryTab.displayName = 'InventoryTab';
export default InventoryTab;
