import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';

const InventoryTab = memo(() => {
  const { state } = useGame();

  // Item emoji mapping
  const itemEmojis = {
    carrot: '🥕',
    potato: '🥔',
    corn: '🌽',
    tomato: '🍅',
    fertilizer: '🌱',
    pesticide: '🐛',
    watering_can: '💧',
    wheat: '🌾',
    apple: '🍎',
    sunflower: '🌻',
  };

  const inventoryItems = Object.entries(state.inventory).filter(([_, qty]) => qty > 0);
  
  // Calculate total items
  const totalItems = inventoryItems.reduce((sum, [_, qty]) => sum + (qty || 0), 0);
  const totalValue = inventoryItems.reduce((sum, [itemId, qty]) => {
    const baseValue = itemId === 'carrot' ? 12 : itemId === 'potato' ? 15 : itemId === 'corn' ? 22 : itemId === 'tomato' ? 28 : 5;
    return sum + (baseValue * (qty || 0));
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
            <p className="text-sm text-gray-400 mt-1">Harvest crops to fill it!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inventoryItems.map(([itemId, quantity]) => (
              <div key={itemId} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{itemEmojis[itemId] || '📦'}</span>
                  <span className="font-medium capitalize">{itemId.replace('_', ' ')}</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  x{quantity}
                </Badge>
              </div>
            ))}
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
