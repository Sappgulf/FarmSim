import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';

const ShopTab = memo(() => {
  const { state, actions } = useGame();

  const UNIQUE_UPGRADE_IDS = ['watering_can', 'sprinkler', 'greenhouse', 'soil_analyzer', 'compost_bin'];

  const shopItems = {
    supplies: [
      { id: 'fertilizer', name: 'Fertilizer', emoji: '🌱', cost: 8, description: 'Boosts crop growth by 25%', effect: '+25% growth speed' },
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
      { id: 'compost_bin', name: 'Compost Bin', emoji: '🗑️', cost: 75, description: 'Restore soil fertility faster', effect: '+50% fertility' },
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

      // Play sound
      if (window.soundSystem) {
        window.soundSystem.playBuildSound(); // Or generic buy sound
      }

    } else {
      actions.addNotification({
        message: `Not enough coins! Need ${item.cost}🪙`,
        type: 'error'
      });
      if (window.soundSystem) window.soundSystem.playErrorSound();
    }
  };

  const renderShopItem = (item, colorClass, btnColorClass) => {
    const owned = isOwned(item.id);
    return (
      <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg transition-all ${owned ? 'bg-gray-100 opacity-80' : `${colorClass} hover:opacity-90`}`}>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{item.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{item.name}</div>
              {owned && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">OWNED</span>}
            </div>
            <div className="text-xs text-gray-600">{item.description}</div>
            <div className={`text-xs font-medium mt-0.5 ${btnColorClass.replace('bg-', 'text-').replace('text-white', '')}`}>{item.effect}</div>
          </div>
        </div>
        {owned ? (
          <Button
            size="sm"
            variant="ghost"
            disabled
            className="ml-2 text-gray-500"
          >
            Owned
          </Button>
        ) : (
          <Button
            onClick={() => handlePurchase(item)}
            size="sm"
            disabled={state.coins < item.cost}
            className={`ml-2 ${btnColorClass}`}
          >
            {item.cost}🪙
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Player Balance */}
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-orange-800">🛒 Farm Shop</h3>
            <p className="text-sm text-orange-600">Your one-stop shop for farming needs</p>
            <p className="text-xs text-orange-700/80 mt-1">
              Upgrades collected: <span className="font-semibold">{ownedUpgradeCount}</span> / {UNIQUE_UPGRADE_IDS.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{state.coins}🪙</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
        </div>
        {allUpgradesOwned && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            🌟 All permanent upgrades collected
          </div>
        )}
      </Card>

      {/* Supplies */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-green-700">🌱 Farming Supplies</h4>
        <div className="space-y-2">
          {shopItems.supplies.map(item => renderShopItem(item, 'bg-green-50', 'bg-green-600 text-white hover:bg-green-700'))}
        </div>
      </Card>

      {/* Tools */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-blue-700">🔧 Tools & Equipment</h4>
        <div className="space-y-2">
          {shopItems.tools.map(item => renderShopItem(item, 'bg-blue-50', 'bg-blue-600 text-white hover:bg-blue-700'))}
        </div>
      </Card>

      {/* Upgrades */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-purple-700">⭐ Premium Upgrades</h4>
        {allUpgradesOwned && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            You have every permanent upgrade. Stock up on supplies or focus on new achievements!
          </div>
        )}
        <div className="space-y-2">
          {shopItems.upgrades.map(item => renderShopItem(item, 'bg-purple-50', 'bg-purple-600 text-white hover:bg-purple-700'))}
        </div>
      </Card>
    </div>
  );
});

ShopTab.displayName = 'ShopTab';
export default ShopTab;
