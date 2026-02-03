import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { DECORATION_DATA } from '../../constants/decorData';

const InventoryTab = memo(() => {
  const { state, actions } = useGame();

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
    parsnip: '🥕',
    okra: '🫛',
    cranberry: '🫐',
  };

  const inventoryItems = Object.entries(state.inventory).filter(([_, qty]) => qty > 0);
  const decorationItems = inventoryItems.filter(([itemId]) => !!DECORATION_DATA[itemId]);
  const cropItems = inventoryItems.filter(([itemId]) => !DECORATION_DATA[itemId]);
  
  // Calculate total items
  const totalItems = inventoryItems.reduce((sum, [_, qty]) => sum + (qty || 0), 0);
  const totalValue = inventoryItems.reduce((sum, [itemId, qty]) => {
    const baseValue = itemId === 'carrot' ? 12
      : itemId === 'potato' ? 15
      : itemId === 'corn' ? 22
      : itemId === 'tomato' ? 28
      : itemId === 'parsnip' ? 15
      : itemId === 'okra' ? 26
      : itemId === 'cranberry' ? 44
      : 5;
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
        ) : cropItems.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🌾</div>
            <p className="text-gray-500">No crops stored</p>
            <p className="text-sm text-gray-400 mt-1">Harvest to stock up on produce.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cropItems.map(([itemId, quantity]) => (
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

      {/* Decorations */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🪴 Decorations</h4>

        {decorationItems.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🧺</div>
            <p className="text-gray-500">No decorations yet</p>
            <p className="text-sm text-gray-400 mt-1">Visit the Shop for cozy decor.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {decorationItems.map(([itemId, quantity]) => {
              const decor = DECORATION_DATA[itemId];
              return (
                <div key={itemId} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{decor?.emoji || '🪴'}</span>
                    <div>
                      <div className="font-medium">{decor?.name || itemId}</div>
                      <div className="text-xs text-rose-600">{decor?.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      x{quantity}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => {
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
