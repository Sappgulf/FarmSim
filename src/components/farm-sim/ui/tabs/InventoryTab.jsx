import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { CROP_DATA } from '../../constants/cropData';

const InventoryTab = memo(() => {
  const { state } = useGame();

  const itemMeta = {
    fertilizer: { name: 'Fertilizer', emoji: '🌱', unitValue: 8 },
    pesticide: { name: 'Pesticide', emoji: '🐛', unitValue: 6 },
    water_boost: { name: 'Water Boost', emoji: '💧', unitValue: 5 },
    watering_can: { name: 'Watering Can', emoji: '🚿', unitValue: 40 },
    quality_seeds: { name: 'Quality Seeds', emoji: '🌰', unitValue: 25 },
    sprinkler: { name: 'Sprinkler', emoji: '💦', unitValue: 100 },
    soil_analyzer: { name: 'Soil Analyzer', emoji: '🔬', unitValue: 150 },
    greenhouse: { name: 'Mini Greenhouse', emoji: '🏡', unitValue: 300 },
    compost_bin: { name: 'Compost Bin', emoji: '🗑️', unitValue: 75 },
  };

  const inventoryItems = Object.entries(state.inventory).filter(([_, qty]) => qty > 0);

  const getItemDetails = (itemId) => {
    const cropData = CROP_DATA[itemId];
    if (cropData) {
      return {
        name: cropData.name,
        emoji: cropData.emoji,
        unitValue: cropData.baseValue,
      };
    }

    if (itemMeta[itemId]) {
      return itemMeta[itemId];
    }

    return {
      name: itemId.replace(/_/g, ' '),
      emoji: '📦',
      unitValue: null,
    };
  };

  // Calculate total items
  const totalItems = inventoryItems.reduce((sum, [_, qty]) => sum + (qty || 0), 0);
  const totalValue = inventoryItems.reduce((sum, [itemId, qty]) => {
    const { unitValue } = getItemDetails(itemId);
    return sum + (unitValue ? unitValue * (qty || 0) : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Inventory Overview */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🎒 Your Inventory</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-blue-600">{totalItems}</div>
            <div className="text-blue-700">Total Items</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">{totalValue}🪙</div>
            <div className="text-green-700">Est. Value</div>
          </div>
        </div>
      </Card>

      {/* Items List */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📦 Items</h4>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500">Your inventory is empty</p>
            <p className="text-sm text-gray-400 mt-1">Harvest crops or visit the shop!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {inventoryItems.map(([itemId, quantity]) => {
              const { name, emoji, unitValue } = getItemDetails(itemId);
              return (
                <div key={itemId} className="flex justify-between items-center p-3 bg-white border border-gray-100 hover:border-gray-300 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-2xl">
                      {emoji}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{name}</div>
                      <div className="text-xs text-gray-500">
                        {unitValue ? `Value: ~${unitValue}🪙 ea` : 'Value: —'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-sm border-2 border-gray-200">
                      x{quantity}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      {inventoryItems.length > 0 && (
        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold mb-2">💡 Tips</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use items from Shop tab to boost your farm</li>
            <li>• Sell crops at the best prices for profit</li>
            <li>• Build processing facilities to increase crop value</li>
          </ul>
        </Card>
      )}
    </div>
  );
});

InventoryTab.displayName = 'InventoryTab';
export default InventoryTab;
