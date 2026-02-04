import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { CROP_DATA } from '../../constants/cropData';

// Processing facilities from original system
const PROCESSING_FACILITIES = {
  flour_mill: {
    id: 'flour_mill',
    name: "Flour Mill",
    emoji: "🏭",
    description: "Process wheat into flour",
    cost: 400,
    input: "wheat",
    output: "flour",
    ratio: 2, // 2 wheat = 1 flour
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
    input: "any", // accepts any crop
    output: "preserved",
    ratio: 1,
    value_multiplier: 2.0,
    time: 90,
    storage_bonus: 15
  }
};

const getAnyCropInput = (inventory, ratio, preferredCrop) => {
  const preferredAmount = preferredCrop ? (inventory[preferredCrop] || 0) : 0;
  if (preferredCrop && CROP_DATA[preferredCrop] && preferredAmount >= ratio) {
    return preferredCrop;
  }

  return Object.keys(inventory).find(
    (cropId) => CROP_DATA[cropId] && (inventory[cropId] || 0) >= ratio
  );
};

const ProcessingTab = memo(() => {
  const { state, actions } = useGame();

  // Use processing queue from global state with safe defaults
  const processingQueue = state.processingQueue || [];
  const processingFacilities = state.processingFacilities || [];
  const processedInventory = state.processedInventory || {};

  // Process completed items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const completedItems = processingQueue.filter(item =>
        item.finishTime && now >= item.finishTime
      );

      if (completedItems.length > 0) {
        // Process completed items
        completedItems.forEach(item => {
          const facility = PROCESSING_FACILITIES[item.facilityId];

          // Add processed product to inventory
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

        // Remove completed items from global queue
        const updatedQueue = processingQueue.filter(item =>
          !completedItems.some(completed => completed.id === item.id)
        );
        actions.updateProcessingQueue(updatedQueue);

        // Free up processing facilities
        const updatedFacilities = state.processingFacilities.map(facility => {
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

    // Check if already owned
    if (state.processingFacilities.some(f => f.id === facilityId)) {
      actions.addNotification({
        message: 'You already own this facility!',
        type: 'warning'
      });
      return;
    }

    // Check coins
    if (state.coins < facility.cost) {
      actions.addNotification({
        message: 'Not enough coins!',
        type: 'error'
      });
      return;
    }

    // Purchase facility
    actions.setCoins(state.coins - facility.cost);

    const newFacility = {
      id: facilityId,
      ...facility,
      isProcessing: false,
      currentRecipe: null,
      finishTime: null,
      level: 1
    };

    actions.updateProcessingFacilities([
      ...state.processingFacilities,
      newFacility
    ]);

    actions.addNotification({
      message: `Purchased ${facility.name}!`,
      type: 'success'
    });
  };

  const startProcessing = (facilityId) => {
    const facility = state.processingFacilities.find(f => f.id === facilityId);
    if (!facility) return;

    // Check if facility is already processing
    if (facility.isProcessing) {
      actions.addNotification({
        message: 'Facility is already processing!',
        type: 'warning'
      });
      return;
    }

    const inputCropId = facility.input === 'any'
      ? getAnyCropInput(state.inventory, facility.ratio, state.selectedCrop)
      : facility.input;

    // Check if we have enough input materials
    const inputCount = inputCropId ? (state.inventory[inputCropId] || 0) : 0;
    if (!inputCropId || inputCount < facility.ratio) {
      actions.addNotification({
        message: facility.input === 'any'
          ? `Not enough crops! Need ${facility.ratio} of any crop`
          : `Not enough ${facility.input}! Need ${facility.ratio}`,
        type: 'error'
      });
      return;
    }

    // Consume input materials
    actions.updateInventory({
      ...state.inventory,
      [inputCropId]: inputCount - facility.ratio
    });

    // Calculate output quantity
    const outputQuantity = Math.floor(facility.ratio / (facility.input === 'any' ? 1 : facility.ratio));

    // Start processing
    const finishTime = Date.now() + (facility.time * 1000);
    const processingItem = {
      id: Date.now(),
      facilityId: facilityId,
      input: inputCropId,
      output: facility.output,
      quantity: outputQuantity,
      startTime: Date.now(),
      finishTime: finishTime
    };

    // Update facility status
    const updatedFacilities = state.processingFacilities.map(f =>
      f.id === facilityId ? {
        ...f,
        isProcessing: true,
        currentRecipe: facility.output,
        finishTime: finishTime
      } : f
    );
    actions.updateProcessingFacilities(updatedFacilities);

    // Add to processing queue in global state
    actions.updateProcessingQueue([...processingQueue, processingItem]);

    actions.addNotification({
      message: `Started processing ${formatDisplayLabel(facility.output)} in ${facility.name}`,
      type: 'info'
    });
  };

  const collectProcessedItem = (itemId) => {
    const item = processingQueue.find(p => p.id === itemId);
    if (!item) return;

    // Add to processed inventory
    const currentProcessed = state.processedInventory[item.output] || 0;
    actions.updateProcessedInventory({
      ...state.processedInventory,
      [item.output]: currentProcessed + item.quantity
    });

    // Remove from global queue
    const updatedQueue = processingQueue.filter(p => p.id !== itemId);
    actions.updateProcessingQueue(updatedQueue);

    actions.addNotification({
      message: `Collected ${item.quantity} ${formatDisplayLabel(item.output)}`,
      type: 'success'
    });
  };

  const sellProcessedItem = (itemType, quantity) => {
    const currentStock = state.processedInventory[itemType] || 0;
    if (currentStock < quantity) {
      actions.addNotification({
        message: 'Not enough items to sell!',
        type: 'error'
      });
      return;
    }

    // Calculate sell price (base price from facilities)
    const facility = Object.values(PROCESSING_FACILITIES).find(f => f.output === itemType);
    const basePrice = facility ? Math.floor(facility.value_multiplier * 10) : 20;
    const totalValue = basePrice * quantity;

    // Update inventory and coins
    actions.updateProcessedInventory({
      ...state.processedInventory,
      [itemType]: currentStock - quantity
    });

    actions.setCoins(state.coins + totalValue);

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

  return (
    <div className="space-y-4">
      {/* Processing Overview */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-800">🏭 Processing Facilities</h3>
            <p className="text-sm text-amber-700">
              Facilities: {state.processingFacilities.length} • Queue: {processingQueue.length}
            </p>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            {Object.keys(state.processedInventory).length} Products
          </Badge>
        </div>
      </Card>

      {/* Available Facilities */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🏗️ Available Facilities</h4>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(PROCESSING_FACILITIES).map(([id, facility]) => {
            const owned = state.processingFacilities.some(f => f.id === id);

            return (
              <Card key={id} className={`p-3 ${owned ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{facility.emoji}</span>
                    <span className="font-medium">{facility.name}</span>
                  </div>

                  {owned && <Badge className="bg-green-500">Owned</Badge>}
                </div>

                <p className="text-sm text-gray-600 mb-2">{facility.description}</p>

                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>Input: {facility.input === 'any' ? 'Any crop' : facility.input}</span>
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
      {state.processingFacilities.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">⚙️ Your Facilities</h4>

          <div className="space-y-3">
            {state.processingFacilities.map(facility => {
              const status = getFacilityStatus(facility);
              const facilityData = PROCESSING_FACILITIES[facility.id];
              const hasAnyInput = facilityData.input === 'any'
                ? Boolean(getAnyCropInput(state.inventory, facilityData.ratio, state.selectedCrop))
                : true;
              const hasSpecificInput = (state.inventory[facilityData.input] || 0) >= facilityData.ratio;
              const canStartProcessing = facilityData.input === 'any' ? hasAnyInput : hasSpecificInput;

              return (
                <Card key={facility.id} className={`p-3 ${status.bgColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{facility.emoji}</span>
                      <span className="font-medium">{facility.name}</span>
                    </div>

                    <Badge className={status.color}>
                      {status.status}
                    </Badge>
                  </div>

                  {facility.isProcessing && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Processing: {formatDisplayLabel(facility.currentRecipe)}</span>
                        <span>{getTimeLeft(facility.finishTime)}</span>
                      </div>
                      <Progress
                        value={((facility.finishTime - Date.now()) / (facilityData.time * 1000)) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {!facility.isProcessing && (
                    <Button
                      onClick={() => startProcessing(facility.id)}
                      size="sm"
                      disabled={!canStartProcessing}
                      className="w-full"
                    >
                      {!canStartProcessing
                        ? `Need ${facilityData.ratio} ${facilityData.input === 'any' ? 'crop' : facilityData.input}`
                        : 'Start Processing'
                      }
                    </Button>
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
                    <span className="text-sm text-gray-600 ml-2">
                      (Quantity: {item.quantity})
                    </span>
                  </div>

                  {Date.now() >= item.finishTime ? (
                    <Button
                      onClick={() => collectProcessedItem(item.id)}
                      size="sm"
                    >
                      Collect
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {getTimeLeft(item.finishTime)}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Processed Products Inventory */}
      {Object.keys(state.processedInventory).length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">📦 Processed Products</h4>

          <div className="space-y-2">
            {Object.entries(state.processedInventory).map(([product, quantity]) => {
              if (quantity <= 0) return null;

              const facility = Object.values(PROCESSING_FACILITIES).find(f => f.output === product);
              const sellPrice = facility ? Math.floor(facility.value_multiplier * 10) : 20;

              return (
                <Card key={product} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{formatDisplayLabel(product)}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        Stock: {quantity} • Sell: {sellPrice}🪙 each
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => sellProcessedItem(product, 1)}
                        size="sm"
                        variant="outline"
                      >
                        Sell 1
                      </Button>
                      <Button
                        onClick={() => sellProcessedItem(product, Math.min(quantity, 5))}
                        size="sm"
                        variant="outline"
                      >
                        Sell 5
                      </Button>
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

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-blue-600">
              {state.processingFacilities.length}
            </div>
            <div className="text-blue-700">Facilities Owned</div>
          </div>

          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">
              {Object.values(state.processedInventory).reduce((sum, qty) => sum + (qty || 0), 0)}
            </div>
            <div className="text-green-700">Products Made</div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ProcessingTab.displayName = 'ProcessingTab';
export default ProcessingTab;
