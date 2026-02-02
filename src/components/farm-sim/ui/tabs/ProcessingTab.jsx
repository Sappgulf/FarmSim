import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useTick } from '../../context/TickContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

// Processing facilities from original system
import { PROCESSING_FACILITIES } from '../../constants/processingData';
import { CROP_DATA } from '../../constants/cropData';

const ProcessingTab = memo(() => {
  const { state, actions } = useGame();
  const tick = useTick();

  // Use processing queue from global state with safe defaults
  const processingQueue = state.processingQueue || [];
  const processingFacilities = state.processingFacilities || [];
  const processedInventory = state.processedInventory || {};

  const getAvailableAnyCrop = (ratio) => {
    const candidates = Object.keys(CROP_DATA)
      .map(id => ({ id, quantity: state.inventory[id] || 0 }))
      .filter(item => item.quantity >= ratio);

    if (candidates.length === 0) return null;

    return candidates.sort((a, b) => b.quantity - a.quantity)[0].id;
  };

  // Process completed items (centralized tick)
  useEffect(() => {
    if (processingQueue.length === 0) return;

    const now = Date.now();
    const completedItems = processingQueue.filter(item =>
      item.finishTime && now >= item.finishTime
    );

    if (completedItems.length === 0) return;

    const nextProcessedInventory = { ...processedInventory };

    // Process completed items
    completedItems.forEach(item => {
      nextProcessedInventory[item.output] = (nextProcessedInventory[item.output] || 0) + item.quantity;

      actions.addNotification({
        message: `Processing complete! Produced ${item.quantity} ${item.output.replace('_', ' ')}`,
        type: 'success'
      });
    });

    actions.updateProcessedInventory(nextProcessedInventory);

    // Remove completed items from global queue
    const updatedQueue = processingQueue.filter(item =>
      !completedItems.some(completed => completed.id === item.id)
    );
    actions.updateProcessingQueue(updatedQueue);

    // Free up processing facilities
    const updatedFacilities = processingFacilities.map(facility => {
      const completedItem = completedItems.find(item => item.facilityId === facility.id);
      if (completedItem) {
        return { ...facility, isProcessing: false, currentRecipe: null, finishTime: null };
      }
      return facility;
    });
    actions.updateProcessingFacilities(updatedFacilities);
  }, [processingQueue, processedInventory, processingFacilities, tick, actions]);

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

    const inputId = facility.input === 'any'
      ? getAvailableAnyCrop(facility.ratio)
      : facility.input;

    if (!inputId) {
      actions.addNotification({
        message: `Not enough crops! Need ${facility.ratio} of any crop.`,
        type: 'error'
      });
      return;
    }

    // Consume input materials
    const inputCount = state.inventory[inputId] || 0;
    actions.updateInventory({
      ...state.inventory,
      [inputId]: inputCount - facility.ratio
    });

    // Calculate output quantity
    const outputQuantity = 1;

    // Start processing
    const finishTime = Date.now() + (facility.time * 1000);
    const processingItem = {
      id: Date.now(),
      facilityId: facilityId,
      input: inputId,
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
      message: `Started processing ${facility.output.replace('_', ' ')} (using ${inputId.replace('_', ' ')}) in ${facility.name}`,
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
      message: `Collected ${item.quantity} ${item.output.replace('_', ' ')}`,
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
      message: `Sold ${quantity} ${itemType.replace('_', ' ')} for ${totalValue}🪙`,
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
      {/* Processing Overview - Premium */}
      <Card className="p-5 bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/95 backdrop-blur-sm border-amber-200/60 shadow-lg shadow-amber-200/30 relative overflow-hidden">
        {/* Decorative factory */}
        <div className="absolute -right-4 -top-2 text-6xl opacity-10 rotate-12">🏭</div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              🏭 Processing Facilities
            </h3>
            <p className="text-sm text-amber-700/80 font-medium mt-1">
              Facilities: {state.processingFacilities.length} • Queue: {processingQueue.length}
            </p>
          </div>
          <div className="text-center p-3 bg-white/80 rounded-xl border border-amber-100 shadow-sm">
            <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">{Object.keys(state.processedInventory).length}</div>
            <div className="text-xs text-amber-700 font-medium">Products</div>
          </div>
        </div>
      </Card>

      {/* Available Facilities */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🏗️ Available Facilities</h4>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(PROCESSING_FACILITIES).map(([id, facility]) => {
            const owned = state.processingFacilities.some(f => f.id === id);
            const inputLabel = facility.input === 'any' ? 'Any crop' : facility.input;

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
                  <span>Input: {inputLabel}</span>
                  <span>Output: {facility.output.replace('_', ' ')}</span>
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
                ? Boolean(getAvailableAnyCrop(facilityData.ratio))
                : (state.inventory[facilityData.input] || 0) >= facilityData.ratio;
              const inputLabel = facilityData.input === 'any'
                ? 'any crop'
                : facilityData.input;

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
                        <span>Processing: {facility.currentRecipe?.replace('_', ' ')}</span>
                        <span>{getTimeLeft(facility.finishTime)}</span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          Math.max(
                            0,
                            ((facilityData.time * 1000 - Math.max(0, facility.finishTime - Date.now())) / (facilityData.time * 1000)) * 100
                          )
                        )}
                        className="h-2"
                      />
                    </div>
                  )}

                  {!facility.isProcessing && (
                    <Button
                      onClick={() => startProcessing(facility.id)}
                      size="sm"
                      disabled={!hasAnyInput}
                      className="w-full"
                    >
                      {!hasAnyInput
                        ? `Need ${facilityData.ratio} ${inputLabel}`
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
                    <span className="font-medium">{item.output.replace('_', ' ')}</span>
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
                      <span className="font-medium">{product.replace('_', ' ')}</span>
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
