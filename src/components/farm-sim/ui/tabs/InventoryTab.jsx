import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { CROP_DATA } from '../../constants/cropData';

import { ITEM_META } from '../../constants/inventoryData';

const InventoryTab = memo(() => {
  const { state } = useGame();

  const itemMeta = ITEM_META;

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
      {/* Inventory Overview - Premium */}
      <Card className="p-5 bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-purple-50/95 backdrop-blur-sm border-blue-200/60 shadow-lg shadow-blue-200/30 relative overflow-hidden">
        {/* Decorative backpack */}
        <div className="absolute -right-4 -top-2 text-6xl opacity-10 rotate-12">🎒</div>

        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-3 flex items-center gap-2 relative z-10">
          🎒 Your Inventory
        </h3>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-blue-100">
            <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {totalItems}
            </div>
            <div className="text-xs text-blue-700 font-medium">Total Items</div>
          </div>
          <div className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-emerald-100">
            <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              {totalValue}💰
            </div>
            <div className="text-xs text-emerald-700 font-medium">Est. Value</div>
          </div>
        </div>
      </Card>

      {/* Items List - Premium */}
      <Card className="p-5 bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-sm shadow-lg border-slate-200/60">
        <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          📦 Items
        </h4>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="text-5xl mb-3 opacity-60">📭</div>
            <p className="text-slate-500 font-medium">Your inventory is empty</p>
            <p className="text-sm text-slate-400 mt-1">Harvest crops or visit the shop!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {inventoryItems.map(([itemId, quantity]) => {
              const { name, emoji, unitValue } = getItemDetails(itemId);
              return (
                <div
                  key={itemId}
                  className="flex justify-between items-center p-3.5 bg-gradient-to-r from-white to-slate-50/80 border border-slate-200/60 hover:border-slate-300 hover:shadow-md rounded-xl transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl text-2xl shadow-sm">
                      {emoji}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{name}</div>
                      <div className="text-xs text-slate-500">
                        {unitValue ? `💰 ~${unitValue} each` : 'Special Item'}
                      </div>
                    </div>
                  </div>
                  <Badge className="text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 shadow-md shadow-blue-200/40">
                    ×{quantity}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tips - Premium */}
      {inventoryItems.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-amber-50/80 to-yellow-50/70 border-amber-200/50 shadow-sm">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            💡 Pro Tips
          </h4>
          <ul className="text-sm text-amber-700/80 space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-amber-500">•</span> Use items from Shop tab to boost your farm</li>
            <li className="flex items-start gap-2"><span className="text-amber-500">•</span> Sell crops at the best prices for profit</li>
            <li className="flex items-start gap-2"><span className="text-amber-500">•</span> Build processing facilities to increase crop value</li>
          </ul>
        </Card>
      )}
    </div>
  );
});

InventoryTab.displayName = 'InventoryTab';
export default InventoryTab;
