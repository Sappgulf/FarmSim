import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { CROP_DATA } from '../../constants/cropData';

// Facility upgrade tiers: each level reduces time and boosts value
const FACILITY_LEVELS = {
  1: { timeMultiplier: 1.0, valueMultiplier: 1.0, label: 'Basic' },
  2: { timeMultiplier: 0.75, valueMultiplier: 1.2, label: 'Improved' },
  3: { timeMultiplier: 0.5, valueMultiplier: 1.5, label: 'Advanced' },
};

const getUpgradeCost = (currentLevel, baseCost) =>
  Math.floor(baseCost * (currentLevel + 1) * 0.8);

// Processing facilities with chain recipes added
const PROCESSING_FACILITIES = {
  flour_mill: {
    id: 'flour_mill',
    name: "Flour Mill",
    emoji: "🏭",
    description: "Process wheat into flour",
    cost: 400,
    input: "wheat",
    output: "flour",
    ratio: 2,
    value_multiplier: 2.8,
    time: 45
  },
  juice_press: {
    id: 'juice_press',
    name: "Juice Press",
    emoji: "🧃",
    description: "Process fruits into juice",
    cost: 300,
    input: "apple",
    output: "apple_juice",
    ratio: 3,
    value_multiplier: 2.5,
    time: 35
  },
  oil_press: {
    id: 'oil_press',
    name: "Oil Press",
    emoji: "🫒",
    description: "Extract oil from seeds",
    cost: 500,
    input: "sunflower",
    output: "sunflower_oil",
    ratio: 3,
    value_multiplier: 3.2,
    time: 75
  },
  preservation_facility: {
    id: 'preservation_facility',
    name: "Preservation Facility",
    emoji: "🥫",
    description: "Preserve crops for longer storage",
    cost: 600,
    input: "any",
    output: "preserved",
    ratio: 1,
    value_multiplier: 2.0,
    time: 90,
    storage_bonus: 15
  },
  bakery: {
    id: 'bakery',
    name: "Bakery",
    emoji: "🍞",
    description: "Bake flour into bread (chain recipe)",
    cost: 700,
    input: "flour",
    inputSource: "processed",
    output: "bread",
    ratio: 2,
    value_multiplier: 4.5,
    time: 60
  },
  jam_kitchen: {
    id: 'jam_kitchen',
    name: "Jam Kitchen",
    emoji: "🍓",
    description: "Cook any fruit into artisan jam",
    cost: 550,
    input: "any_fruit",
    output: "jam",
    ratio: 4,
    value_multiplier: 3.8,
    time: 50
  }
};

const FRUIT_CROPS = new Set(['apple', 'strawberry', 'blueberry', 'grape', 'melon', 'watermelon', 'cherry', 'peach', 'pear', 'orange', 'lemon', 'pineapple', 'banana', 'cranberry']);

const getAnyCropInput = (inventory, ratio, preferredCrop) => {
  const preferredAmount = preferredCrop ? (inventory[preferredCrop] || 0) : 0;
  if (preferredCrop && CROP_DATA[preferredCrop] && preferredAmount >= ratio) {
    return preferredCrop;
  }
  return Object.keys(inventory).find(
    (cropId) => CROP_DATA[cropId] && (inventory[cropId] || 0) >= ratio
  );
};

const getFruitInput = (inventory, ratio) => {
  return Object.keys(inventory).find(
    (cropId) => FRUIT_CROPS.has(cropId) && (inventory[cropId] || 0) >= ratio
  );
};

const getEffectiveTime = (baseTime, level) => {
  const tier = FACILITY_LEVELS[level] || FACILITY_LEVELS[1];
  return Math.floor(baseTime * tier.timeMultiplier);
};

const getEffectiveValueMultiplier = (baseMultiplier, level) => {
  const tier = FACILITY_LEVELS[level] || FACILITY_LEVELS[1];
  return baseMultiplier * tier.valueMultiplier;
};

const ProcessingTab = memo(() => {
  const { state, actions } = useGame();

  const processingQueue = state.processingQueue || [];
  const processedInventory = state.processedInventory || {};

  // Process completed items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const completedItems = processingQueue.filter(item =>
        item.finishTime && now >= item.finishTime
      );

      if (completedItems.length > 0) {
        completedItems.forEach(item => {
          const currentProcessed = state.processedInventory[item.output] || 0;
          actions.updateProcessedInventory({
            ...state.processedInventory,
            [item.output]: currentProcessed + item.quantity
          });
          actions.addNotification({
            message: `Processing complete! Produced ${item.quantity} ${formatDisplayLabel(item.output)}`,
            type: 'success'
          });
        });

        const updatedQueue = processingQueue.filter(item =>
          !completedItems.some(completed => completed.id === item.id)
        );
        actions.updateProcessingQueue(updatedQueue);

        const updatedFacilities = (state.processingFacilities || []).map(facility => {
          const completedItem = completedItems.find(item => item.facilityId === facility.id);
          if (completedItem) {
            return { ...facility, isProcessing: false, currentRecipe: null, finishTime: null };
          }
          return facility;
        });
        actions.updateProcessingFacilities(updatedFacilities);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [processingQueue, state.processedInventory]);

  const buyProcessingFacility = (facilityId) => {
    const facility = PROCESSING_FACILITIES[facilityId];
    if ((state.processingFacilities || []).some(f => f.id === facilityId)) {
      actions.addNotification({ message: 'You already own this facility!', type: 'warning' });
      return;
    }
    if (state.coins < facility.cost) {
      actions.addNotification({ message: 'Not enough coins!', type: 'error' });
      return;
    }

    actions.spendMoney(facility.cost);
    const newFacility = {
      id: facilityId,
      ...facility,
      isProcessing: false,
      currentRecipe: null,
      finishTime: null,
      level: 1
    };
    actions.updateProcessingFacilities([...(state.processingFacilities || []), newFacility]);
    actions.addNotification({ message: `Purchased ${facility.name}!`, type: 'success' });
    actions.addXP(15);
  };

  const upgradeFacility = (facilityId) => {
    const facilities = state.processingFacilities || [];
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) return;

    const currentLevel = facility.level || 1;
    if (currentLevel >= 3) {
      actions.addNotification({ message: 'Facility is already max level!', type: 'warning' });
      return;
    }

    const facilityData = PROCESSING_FACILITIES[facilityId];
    const cost = getUpgradeCost(currentLevel, facilityData.cost);
    if (state.coins < cost) {
      actions.addNotification({ message: `Need ${cost}🪙 to upgrade!`, type: 'error' });
      return;
    }

    actions.spendMoney(cost);
    const updatedFacilities = facilities.map(f =>
      f.id === facilityId ? { ...f, level: currentLevel + 1 } : f
    );
    actions.updateProcessingFacilities(updatedFacilities);
    const nextTier = FACILITY_LEVELS[currentLevel + 1];
    actions.addNotification({
      message: `${facilityData.name} upgraded to ${nextTier.label}! Faster processing & better value.`,
      type: 'success'
    });
    actions.addXP(25);
  };

  const resolveInput = (facility, facilityData) => {
    const level = facility.level || 1;
    const ratio = facilityData.ratio;

    // Chain recipe: input from processed inventory
    if (facilityData.inputSource === 'processed') {
      const available = processedInventory[facilityData.input] || 0;
      return available >= ratio ? { cropId: facilityData.input, source: 'processed' } : null;
    }

    // Fruit input
    if (facilityData.input === 'any_fruit') {
      const fruitId = getFruitInput(state.inventory, ratio);
      return fruitId ? { cropId: fruitId, source: 'inventory' } : null;
    }

    // Any crop input
    if (facilityData.input === 'any') {
      const cropId = getAnyCropInput(state.inventory, ratio, state.selectedCrop);
      return cropId ? { cropId, source: 'inventory' } : null;
    }

    // Specific crop input
    const available = state.inventory[facilityData.input] || 0;
    return available >= ratio ? { cropId: facilityData.input, source: 'inventory' } : null;
  };

  const startProcessing = (facilityId) => {
    const facilities = state.processingFacilities || [];
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility || facility.isProcessing) {
      if (facility?.isProcessing) {
        actions.addNotification({ message: 'Facility is already processing!', type: 'warning' });
      }
      return;
    }

    const facilityData = PROCESSING_FACILITIES[facilityId];
    const level = facility.level || 1;
    const resolved = resolveInput(facility, facilityData);

    if (!resolved) {
      const inputLabel = facilityData.inputSource === 'processed'
        ? formatDisplayLabel(facilityData.input)
        : facilityData.input === 'any_fruit'
          ? 'fruit'
          : facilityData.input === 'any' ? 'crop' : facilityData.input;
      actions.addNotification({
        message: `Not enough ${inputLabel}! Need ${facilityData.ratio}`,
        type: 'error'
      });
      return;
    }

    // Consume input
    if (resolved.source === 'processed') {
      const current = processedInventory[resolved.cropId] || 0;
      actions.updateProcessedInventory({
        ...processedInventory,
        [resolved.cropId]: current - facilityData.ratio
      });
    } else {
      actions.updateInventory({
        ...state.inventory,
        [resolved.cropId]: (state.inventory[resolved.cropId] || 0) - facilityData.ratio
      });
    }

    const effectiveTime = getEffectiveTime(facilityData.time, level);
    const outputQuantity = 1;
    const finishTime = Date.now() + (effectiveTime * 1000);
    const processingItem = {
      id: Date.now(),
      facilityId,
      input: resolved.cropId,
      output: facilityData.output,
      quantity: outputQuantity,
      startTime: Date.now(),
      finishTime,
      effectiveTime
    };

    const updatedFacilities = facilities.map(f =>
      f.id === facilityId ? {
        ...f, isProcessing: true, currentRecipe: facilityData.output, finishTime
      } : f
    );
    actions.updateProcessingFacilities(updatedFacilities);
    actions.updateProcessingQueue([...processingQueue, processingItem]);
    actions.addNotification({
      message: `Started processing ${formatDisplayLabel(facilityData.output)} in ${facilityData.name}`,
      type: 'info'
    });
  };

  const collectProcessedItem = (itemId) => {
    const item = processingQueue.find(p => p.id === itemId);
    if (!item) return;
    const currentProcessed = processedInventory[item.output] || 0;
    actions.updateProcessedInventory({
      ...processedInventory,
      [item.output]: currentProcessed + item.quantity
    });
    const updatedQueue = processingQueue.filter(p => p.id !== itemId);
    actions.updateProcessingQueue(updatedQueue);
    actions.addNotification({
      message: `Collected ${item.quantity} ${formatDisplayLabel(item.output)}`,
      type: 'success'
    });
  };

  const sellProcessedItem = (itemType, quantity) => {
    const currentStock = processedInventory[itemType] || 0;
    if (currentStock < quantity) {
      actions.addNotification({ message: 'Not enough items to sell!', type: 'error' });
      return;
    }
    const facility = Object.values(PROCESSING_FACILITIES).find(f => f.output === itemType);
    const basePrice = facility ? Math.floor(facility.value_multiplier * 10) : 20;
    // Apply level bonus if facility is owned
    const ownedFacility = (state.processingFacilities || []).find(f => PROCESSING_FACILITIES[f.id]?.output === itemType);
    const level = ownedFacility?.level || 1;
    const effectivePrice = Math.floor(basePrice * (FACILITY_LEVELS[level]?.valueMultiplier || 1));
    const totalValue = effectivePrice * quantity;

    actions.updateProcessedInventory({
      ...processedInventory,
      [itemType]: currentStock - quantity
    });
    actions.earnMoney(totalValue);
    actions.addXP(Math.floor(totalValue * 0.05));
    actions.addNotification({
      message: `Sold ${quantity} ${formatDisplayLabel(itemType)} for ${totalValue}🪙`,
      type: 'success'
    });
  };

  const getTimeLeft = (finishTime) => {
    if (!finishTime) return '';
    const timeLeft = Math.max(0, finishTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getFacilityStatus = (facility) => {
    if (facility.isProcessing) {
      return { status: 'Processing', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
    return { status: 'Idle', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const ownedFacilities = state.processingFacilities || [];

  return (
    <div className="space-y-4">
      {/* Processing Overview */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-800">🏭 Processing Facilities</h3>
            <p className="text-sm text-amber-700">
              Facilities: {ownedFacilities.length} • Queue: {processingQueue.length}
            </p>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            {Object.values(processedInventory).reduce((s, q) => s + (q > 0 ? 1 : 0), 0)} Products
          </Badge>
        </div>
      </Card>

      {/* Available Facilities */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🏗️ Available Facilities</h4>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(PROCESSING_FACILITIES).map(([id, facility]) => {
            const owned = ownedFacilities.some(f => f.id === id);
            const isChain = !!facility.inputSource;
            return (
              <Card key={id} className={`p-3 ${owned ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{facility.emoji}</span>
                    <div>
                      <span className="font-medium">{facility.name}</span>
                      {isChain && (
                        <Badge variant="outline" className="ml-2 text-[10px] bg-purple-50 text-purple-700">Chain</Badge>
                      )}
                    </div>
                  </div>
                  {owned && <Badge className="bg-green-500">Owned</Badge>}
                </div>
                <p className="text-sm text-gray-600 mb-2">{facility.description}</p>
                <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 mb-2 gap-1">
                  <span>Input: {facility.input === 'any' ? 'Any crop' : facility.input === 'any_fruit' ? 'Any fruit' : formatDisplayLabel(facility.input)}{isChain ? ' (processed)' : ''}</span>
                  <span>Output: {formatDisplayLabel(facility.output)}</span>
                  <span>Ratio: {facility.ratio}:1</span>
                </div>
                {!owned ? (
                  <Button
                    onClick={() => buyProcessingFacility(id)}
                    size="sm"
                    disabled={state.coins < facility.cost}
                    className="w-full"
                  >
                    Buy ({facility.cost}🪙)
                  </Button>
                ) : (
                  <div className="text-center text-sm text-green-600 font-medium">
                    ✓ Facility Owned
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Owned Facilities */}
      {ownedFacilities.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">⚙️ Your Facilities</h4>
          <div className="space-y-3">
            {ownedFacilities.map(facility => {
              const status = getFacilityStatus(facility);
              const facilityData = PROCESSING_FACILITIES[facility.id];
              if (!facilityData) return null;
              const level = facility.level || 1;
              const tier = FACILITY_LEVELS[level] || FACILITY_LEVELS[1];
              const effectiveTime = getEffectiveTime(facilityData.time, level);
              const resolved = resolveInput(facility, facilityData);
              const canStartProcessing = !!resolved;
              const canUpgrade = level < 3;
              const upgradeCost = canUpgrade ? getUpgradeCost(level, facilityData.cost) : 0;

              const inputLabel = facilityData.inputSource === 'processed'
                ? formatDisplayLabel(facilityData.input)
                : facilityData.input === 'any_fruit'
                  ? 'fruit'
                  : facilityData.input === 'any' ? 'crop' : facilityData.input;

              return (
                <Card key={facility.id} className={`p-3 ${status.bgColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{facilityData.emoji}</span>
                      <div>
                        <span className="font-medium">{facilityData.name}</span>
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Lv.{level} {tier.label}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={status.color}>
                      {status.status}
                    </Badge>
                  </div>

                  {/* Level info */}
                  <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
                    <span>Time: {effectiveTime}s</span>
                    <span>Value: x{getEffectiveValueMultiplier(facilityData.value_multiplier, level).toFixed(1)}</span>
                  </div>

                  {facility.isProcessing && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Processing: {formatDisplayLabel(facility.currentRecipe)}</span>
                        <span>{getTimeLeft(facility.finishTime)}</span>
                      </div>
                      <Progress
                        value={Math.max(0, 100 - ((facility.finishTime - Date.now()) / (effectiveTime * 1000)) * 100)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {!facility.isProcessing && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startProcessing(facility.id)}
                        size="sm"
                        disabled={!canStartProcessing}
                        className="flex-1"
                      >
                        {!canStartProcessing
                          ? `Need ${facilityData.ratio} ${inputLabel}`
                          : 'Start Processing'
                        }
                      </Button>
                      {canUpgrade && (
                        <Button
                          onClick={() => upgradeFacility(facility.id)}
                          size="sm"
                          variant="outline"
                          disabled={state.coins < upgradeCost}
                          className="shrink-0"
                        >
                          ⬆ Upgrade ({upgradeCost}🪙)
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* Processing Queue */}
      {processingQueue.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">⏳ Processing Queue</h4>
          <div className="space-y-2">
            {processingQueue.map(item => (
              <Card key={item.id} className="p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{formatDisplayLabel(item.output)}</span>
                    <span className="text-sm text-gray-600 ml-2">(x{item.quantity})</span>
                  </div>
                  {Date.now() >= item.finishTime ? (
                    <Button onClick={() => collectProcessedItem(item.id)} size="sm">
                      Collect
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">{getTimeLeft(item.finishTime)}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Processed Products Inventory */}
      {Object.keys(processedInventory).some(k => (processedInventory[k] || 0) > 0) && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">📦 Processed Products</h4>
          <div className="space-y-2">
            {Object.entries(processedInventory).map(([product, quantity]) => {
              if (quantity <= 0) return null;
              const facility = Object.values(PROCESSING_FACILITIES).find(f => f.output === product);
              const ownedF = ownedFacilities.find(f => PROCESSING_FACILITIES[f.id]?.output === product);
              const level = ownedF?.level || 1;
              const basePrice = facility ? Math.floor(facility.value_multiplier * 10) : 20;
              const sellPrice = Math.floor(basePrice * (FACILITY_LEVELS[level]?.valueMultiplier || 1));

              return (
                <Card key={product} className="p-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="font-medium">{formatDisplayLabel(product)}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        Stock: {quantity} • {sellPrice}🪙/ea
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => sellProcessedItem(product, 1)} size="sm" variant="outline">
                        Sell 1
                      </Button>
                      <Button onClick={() => sellProcessedItem(product, Math.min(quantity, 5))} size="sm" variant="outline">
                        Sell {Math.min(quantity, 5)}
                      </Button>
                      {quantity > 5 && (
                        <Button onClick={() => sellProcessedItem(product, quantity)} size="sm" variant="outline">
                          Sell All
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* Processing Statistics */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">📊 Processing Statistics</h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-blue-600">{ownedFacilities.length}</div>
            <div className="text-blue-700 text-xs">Facilities</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">
              {Object.values(processedInventory).reduce((sum, qty) => sum + Math.max(0, qty || 0), 0)}
            </div>
            <div className="text-green-700 text-xs">In Stock</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-purple-600">
              {ownedFacilities.reduce((sum, f) => sum + ((f.level || 1) - 1), 0)}
            </div>
            <div className="text-purple-700 text-xs">Upgrades</div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ProcessingTab.displayName = 'ProcessingTab';
export default ProcessingTab;
