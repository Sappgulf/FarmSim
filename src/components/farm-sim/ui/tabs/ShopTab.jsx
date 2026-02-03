import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { DECORATION_DATA } from '../../constants/decorData';

const ShopTab = memo(() => {
  const { state, actions } = useGame();
  const decorationList = useMemo(() => Object.values(DECORATION_DATA), []);

  const decorRotation = useMemo(() => {
    if (decorationList.length === 0) return [];
    const rotationKey = new Date().toDateString();
    const seed = rotationKey.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    const startIndex = seed % decorationList.length;
    const rotated = [
      ...decorationList.slice(startIndex),
      ...decorationList.slice(0, startIndex),
    ];
    return rotated.slice(0, 4);
  }, [decorationList]);

  const shopItems = {
    supplies: [
      { id: 'fertilizer', name: 'Fertilizer', emoji: '🌱', cost: 8, description: 'Boosts crop growth by 25%', effect: '+25% growth speed' },
      { id: 'pesticide', name: 'Pesticide', emoji: '🐛', cost: 6, description: 'Eliminates crop diseases', effect: 'Cure diseases' },
      { id: 'water_boost', name: 'Water Boost', emoji: '💧', cost: 5, description: 'Maintains water level', effect: '+100% water' },
    ],
    tools: [
      { id: 'watering_can', name: 'Watering Can', emoji: '🚿', cost: 40, description: 'Better watering efficiency', effect: 'Permanent' },
      { id: 'quality_seeds', name: 'Quality Seeds', emoji: '🌰', cost: 25, description: 'Higher yield crops', effect: '+20% value' },
      { id: 'sprinkler', name: 'Sprinkler', emoji: '💦', cost: 100, description: 'Auto-waters adjacent plots', effect: 'Automation' },
    ],
    upgrades: [
      { id: 'soil_analyzer', name: 'Soil Analyzer', emoji: '🔬', cost: 150, description: 'Shows soil fertility levels', effect: 'Visibility' },
      { id: 'greenhouse', name: 'Mini Greenhouse', emoji: '🏡', cost: 300, description: 'Weather-proof single plot', effect: 'Weather immunity' },
      { id: 'compost_bin', name: 'Compost Bin', emoji: '🗑️', cost: 75, description: 'Restore soil fertility faster', effect: '+50% fertility' },
    ],
    decor: decorRotation,
  };

  const handlePurchase = (item) => {
    if (state.coins >= item.cost) {
      actions.setCoins(state.coins - item.cost);
      actions.updateInventory({
        ...state.inventory,
        [item.id]: (state.inventory[item.id] || 0) + 1
      });
      actions.addNotification({
        message: `Purchased ${item.emoji} ${item.name}!`,
        type: 'success'
      });

      if (DECORATION_DATA[item.id]) {
        actions.recordMemoryEvent('shop_decor_purchase');
      }
    } else {
      actions.addNotification({
        message: `Not enough coins! Need ${item.cost}🪙`,
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Player Balance */}
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-orange-800">🛒 Farm Shop</h3>
            <p className="text-sm text-orange-600">Your one-stop shop for farming needs</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{state.coins}🪙</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
        </div>
      </Card>

      {/* Supplies */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-green-700">🌱 Farming Supplies</h4>
        <div className="space-y-2">
          {shopItems.supplies.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-all">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                  <div className="text-xs text-green-600 font-medium mt-0.5">{item.effect}</div>
                </div>
              </div>
              <Button
                onClick={() => handlePurchase(item)}
                size="sm"
                disabled={state.coins < item.cost}
                className="ml-2"
              >
                {item.cost}🪙
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Decor Rotation */}
      <Card className="p-4 bg-rose-50 border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-rose-700">🪴 Daily Decor Picks</h4>
          <span className="text-xs text-rose-600">Refreshes daily</span>
        </div>
        <div className="space-y-2">
          {shopItems.decor.map(item => {
            const ownedCount = state.inventory[item.id] || 0;
            return (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white/80 hover:bg-white rounded-lg transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-600">{item.description}</div>
                    <div className="text-xs text-rose-600 font-medium mt-0.5">
                      {item.category} • {item.rarity}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    Owned: {ownedCount}
                  </Badge>
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
      </Card>

      {/* Tools */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-blue-700">🔧 Tools & Equipment</h4>
        <div className="space-y-2">
          {shopItems.tools.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">{item.effect}</div>
                </div>
              </div>
              <Button
                onClick={() => handlePurchase(item)}
                size="sm"
                disabled={state.coins < item.cost}
                className="ml-2"
              >
                {item.cost}🪙
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Upgrades */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-purple-700">⭐ Premium Upgrades</h4>
        <div className="space-y-2">
          {shopItems.upgrades.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                  <div className="text-xs text-purple-600 font-medium mt-0.5">{item.effect}</div>
                </div>
              </div>
              <Button
                onClick={() => handlePurchase(item)}
                size="sm"
                disabled={state.coins < item.cost}
                className="ml-2"
              >
                {item.cost}🪙
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

ShopTab.displayName = 'ShopTab';
export default ShopTab;
