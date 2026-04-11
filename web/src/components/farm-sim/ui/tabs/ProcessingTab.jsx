import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { CROP_DATA } from '../../constants/cropData';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';
import { getFarmSpecialization, getSpecializationModifiers } from '../../../../utils/farmSpecializations';

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

const mergeCompletedProducts = (inventory, completedItems) => {
  const nextInventory = { ...(inventory || {}) };
  completedItems.forEach((item) => {
    const quantity = Math.max(0, Number(item?.quantity) || 0);
    if (quantity <= 0 || !item?.output) return;
    nextInventory[item.output] = Math.max(0, Number(nextInventory[item.output] || 0)) + quantity;
  });
  return nextInventory;
};

const ProcessingTab = memo(() => {
  const { state, actions } = useGame();
  const specialization = getSpecializationModifiers(state);
  const activePath = getFarmSpecialization(state);

  const processingQueue = state.processingQueue || [];
  const processedInventory = state.processedInventory || {};
  const processingFacilities = state.processingFacilities || [];

  // Process completed items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const completedItems = processingQueue.filter(item =>
        item.finishTime && now >= item.finishTime
      );

      if (completedItems.length > 0) {
        const completedIds = new Set(completedItems.map((item) => item.id));
        const completedFacilityIds = new Set(completedItems.map((item) => item.facilityId));

        actions.updateProcessedInventory((currentInventory) => (
          mergeCompletedProducts(currentInventory, completedItems)
        ));

        actions.updateProcessingQueue((currentQueue) => (
          (currentQueue || []).filter((item) => !completedIds.has(item.id))
        ));

        actions.updateProcessingFacilities((currentFacilities) => (
          (currentFacilities || []).map((facility) => (
            completedFacilityIds.has(facility.id)
              ? { ...facility, isProcessing: false, currentRecipe: null, finishTime: null }
              : facility
          ))
        ));

        completedItems.forEach(item => {
          actions.addNotification({
            message: `Processing complete! Produced ${item.quantity} ${formatDisplayLabel(item.output)}`,
            type: 'success'
          });
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [actions, processingQueue]);

  const buyProcessingFacility = (facilityId) => {
    const facility = PROCESSING_FACILITIES[facilityId];
    const purchaseCost = Math.floor(facility.cost * (specialization.processingCostMultiplier || 1));
    if (processingFacilities.some(f => f.id === facilityId)) {
      actions.addNotification({ message: 'You already own this facility!', type: 'warning' });
      return;
    }
    if (state.coins < purchaseCost) {
      actions.addNotification({ message: 'Not enough coins!', type: 'error' });
      return;
    }

    actions.spendMoney(purchaseCost);
    const newFacility = {
      id: facilityId,
      ...facility,
      isProcessing: false,
      currentRecipe: null,
      finishTime: null,
      level: 1
    };
    actions.updateProcessingFacilities((currentFacilities) => [
      ...((currentFacilities || [])),
      newFacility,
    ]);
    actions.addNotification({ message: `Purchased ${facility.name}!`, type: 'success' });
    actions.addXP(15);
  };

  const upgradeFacility = (facilityId) => {
    const facility = processingFacilities.find(f => f.id === facilityId);
    if (!facility) return;

    const currentLevel = facility.level || 1;
    if (currentLevel >= 3) {
      actions.addNotification({ message: 'Facility is already max level!', type: 'warning' });
      return;
    }

    const facilityData = PROCESSING_FACILITIES[facilityId];
    const cost = Math.floor(
      getUpgradeCost(currentLevel, facilityData.cost) * (specialization.processingCostMultiplier || 1)
    );
    if (state.coins < cost) {
      actions.addNotification({ message: `Need ${cost}🪙 to upgrade!`, type: 'error' });
      return;
    }

    actions.spendMoney(cost);
    const updatedFacilities = processingFacilities.map(f =>
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
    const facility = processingFacilities.find(f => f.id === facilityId);
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
      actions.updateProcessedInventory((currentInventory) => ({
        ...(currentInventory || {}),
        [resolved.cropId]: Math.max(0, Number(currentInventory?.[resolved.cropId] || 0) - facilityData.ratio),
      }));
    } else {
      actions.updateInventory({
        ...state.inventory,
        [resolved.cropId]: (state.inventory[resolved.cropId] || 0) - facilityData.ratio
      });
    }

    const effectiveTime = Math.max(
      1,
      Math.floor(getEffectiveTime(facilityData.time, level) * (specialization.processingTimeMultiplier || 1))
    );
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

    const updatedFacilities = processingFacilities.map(f =>
      f.id === facilityId ? {
        ...f, isProcessing: true, currentRecipe: facilityData.output, finishTime
      } : f
    );
    actions.updateProcessingFacilities(updatedFacilities);
    actions.updateProcessingQueue((currentQueue) => [...(currentQueue || []), processingItem]);
    actions.addNotification({
      message: `Started processing ${formatDisplayLabel(facilityData.output)} in ${facilityData.name}`,
      type: 'info'
    });
  };

  const collectProcessedItem = (itemId) => {
    const item = processingQueue.find(p => p.id === itemId);
    if (!item) return;
    actions.updateProcessedInventory((currentInventory) => ({
      ...(currentInventory || {}),
      [item.output]: Math.max(0, Number(currentInventory?.[item.output] || 0)) + item.quantity,
    }));
    actions.updateProcessingQueue((currentQueue) => (
      (currentQueue || []).filter((queueItem) => queueItem.id !== itemId)
    ));
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
    const effectivePrice = Math.floor(
      basePrice
      * (FACILITY_LEVELS[level]?.valueMultiplier || 1)
      * (specialization.processingValueMultiplier || 1)
    );
    const totalValue = effectivePrice * quantity;

    actions.updateProcessedInventory((currentInventory) => ({
      ...(currentInventory || {}),
      [itemType]: Math.max(0, Number(currentInventory?.[itemType] || 0) - quantity),
    }));
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

  const ownedFacilities = processingFacilities;

  return (
    <div className="space-y-4">
      <TabHero
        icon="🏭"
        tone="amber"
        title="Processing Hub"
        description="Turn crops into higher-value goods, manage the queue, and sell the finished stock."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-amber-700 border-amber-200">
            {ownedFacilities.length} facilities
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="amber"
            label="Facilities"
            value={ownedFacilities.length}
            hint="Owned processors"
            icon="🏭"
          />
          <MetricTile
            tone="sky"
            label="Queue"
            value={processingQueue.length}
            hint="In-progress batches"
            icon="⏳"
          />
          <MetricTile
            tone="emerald"
            label="Products"
            value={Object.values(processedInventory).reduce((s, q) => s + (q > 0 ? 1 : 0), 0)}
            hint="Different finished goods"
            icon="📦"
          />
        </div>
        {activePath?.id === 'processing' ? (
          <div className="mt-3 text-center text-sm text-slate-600">
            {activePath.icon} {activePath.name} is active: lower facility costs, faster batches, richer sales.
          </div>
        ) : null}
      </TabHero>

      {/* Available Facilities */}
      <TabSection
        title="Available facilities"
        description="Buy a processor when the recipe is worth the footprint."
        tone="amber"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Object.entries(PROCESSING_FACILITIES).map(([id, facility]) => {
            const owned = ownedFacilities.some(f => f.id === id);
            const isChain = !!facility.inputSource;
            return (
              <div
                key={id}
                className={`rounded-[24px] border p-4 transition-all duration-200 hover:-translate-y-0.5 ${owned ? 'border-emerald-200/70 bg-emerald-50/60' : 'border-slate-200/70 bg-white/90'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{facility.emoji}</span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{facility.name}</span>
                        {isChain ? <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700">Chain</Badge> : null}
                      </div>
                      <p className="text-sm text-slate-600">{facility.description}</p>
                    </div>
                  </div>
                  {owned ? <Badge className="bg-emerald-600 text-white">Owned</Badge> : null}
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                  <span>Input: {facility.input === 'any' ? 'Any crop' : facility.input === 'any_fruit' ? 'Any fruit' : formatDisplayLabel(facility.input)}{isChain ? ' (processed)' : ''}</span>
                  <span>Output: {formatDisplayLabel(facility.output)}</span>
                  <span>Ratio: {facility.ratio}:1</span>
                </div>
                <div className="mt-3">
                  {!owned ? (
                    <Button
                      onClick={() => buyProcessingFacility(id)}
                      size="sm"
                      disabled={state.coins < facility.cost}
                      className="w-full"
                    >
                      Buy ({Math.floor(facility.cost * (specialization.processingCostMultiplier || 1))}🪙)
                    </Button>
                  ) : (
                    <div className="text-center text-sm font-medium text-emerald-700">✓ Facility Owned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </TabSection>

      {/* Owned Facilities */}
      {ownedFacilities.length > 0 ? (
        <TabSection
          title="Your facilities"
          description="Manage queues, upgrades, and the next batch."
          tone="sky"
        >
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
                <div key={facility.id} className={`rounded-[24px] border p-4 ${status.bgColor}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{facilityData.emoji}</span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{facilityData.name}</span>
                          <Badge variant="outline" className="text-[10px] bg-white/80">
                            Lv.{level} {tier.label}
                          </Badge>
                        </div>
                        <div className={`text-xs font-medium ${status.color}`}>{status.status}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Time: {effectiveTime}s</span>
                    <span>Value: x{getEffectiveValueMultiplier(facilityData.value_multiplier, level).toFixed(1)}</span>
                  </div>

                  {facility.isProcessing ? (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Processing: {formatDisplayLabel(facility.currentRecipe)}</span>
                        <span>{getTimeLeft(facility.finishTime)}</span>
                      </div>
                      <Progress
                        value={Math.max(0, 100 - ((facility.finishTime - Date.now()) / (effectiveTime * 1000)) * 100)}
                        className="h-2"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => startProcessing(facility.id)}
                        size="sm"
                        disabled={!canStartProcessing}
                        className="flex-1"
                      >
                        {!canStartProcessing ? `Need ${facilityData.ratio} ${inputLabel}` : 'Start Processing'}
                      </Button>
                      {canUpgrade ? (
                        <Button
                          onClick={() => upgradeFacility(facility.id)}
                          size="sm"
                          variant="outline"
                          disabled={state.coins < upgradeCost}
                          className="shrink-0"
                        >
                          ⬆ Upgrade ({upgradeCost}🪙)
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabSection>
      ) : (
        <TabEmptyState
          icon="🏭"
          tone="sky"
          title="No facilities owned yet"
          description="Buy a processor above to start building out your production line."
        />
      )}

      {/* Processing Queue */}
      {processingQueue.length > 0 ? (
        <TabSection
          title="Processing queue"
          description="Ready batches waiting for collection."
          tone="violet"
        >
          <div className="space-y-2">
            {processingQueue.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[20px] border border-slate-200/70 bg-white/90 px-3 py-2.5">
                <div>
                  <span className="font-medium text-slate-900">{formatDisplayLabel(item.output)}</span>
                  <span className="ml-2 text-sm text-slate-600">(x{item.quantity})</span>
                </div>
                {Date.now() >= item.finishTime ? (
                  <Button onClick={() => collectProcessedItem(item.id)} size="sm">
                    Collect
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">{getTimeLeft(item.finishTime)}</span>
                )}
              </div>
            ))}
          </div>
        </TabSection>
      ) : (
        <TabEmptyState
          icon="⏳"
          tone="violet"
          title="Queue is empty"
          description="Start a batch once you have the right input stock."
        />
      )}

      {/* Processed Products Inventory */}
      {Object.keys(processedInventory).some(k => (processedInventory[k] || 0) > 0) ? (
        <TabSection
          title="Processed products"
          description="Finished stock ready to sell."
          tone="emerald"
        >
          <div className="space-y-2">
            {Object.entries(processedInventory).map(([product, quantity]) => {
              if (quantity <= 0) return null;
              const facility = Object.values(PROCESSING_FACILITIES).find(f => f.output === product);
              const ownedF = ownedFacilities.find(f => PROCESSING_FACILITIES[f.id]?.output === product);
              const level = ownedF?.level || 1;
              const basePrice = facility ? Math.floor(facility.value_multiplier * 10) : 20;
              const sellPrice = Math.floor(basePrice * (FACILITY_LEVELS[level]?.valueMultiplier || 1));

              return (
              <div key={product} className="flex flex-col gap-3 rounded-[20px] border border-slate-200/70 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium text-slate-900">{formatDisplayLabel(product)}</span>
                  <span className="ml-2 text-sm text-slate-600">Stock: {quantity} • {sellPrice}🪙/ea</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => sellProcessedItem(product, 1)} size="sm" variant="outline">
                    Sell 1
                  </Button>
                  <Button onClick={() => sellProcessedItem(product, Math.min(quantity, 5))} size="sm" variant="outline">
                    Sell {Math.min(quantity, 5)}
                  </Button>
                  {quantity > 5 ? (
                    <Button onClick={() => sellProcessedItem(product, quantity)} size="sm" variant="outline">
                      Sell All
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
          </div>
        </TabSection>
      ) : (
        <TabEmptyState
          icon="📦"
          tone="emerald"
          title="No processed goods yet"
          description="Completed batches will appear here for quick selling."
        />
      )}

      {/* Processing Statistics */}
      <TabSection
        title="Processing statistics"
        description="The current shape of your processing layer."
        tone="slate"
      >
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 text-sm">
          <MetricTile
            tone="amber"
            label="Facilities"
            value={ownedFacilities.length}
            hint="Owned processors"
            icon="🏭"
          />
          <MetricTile
            tone="emerald"
            label="In Stock"
            value={Object.values(processedInventory).reduce((sum, qty) => sum + Math.max(0, qty || 0), 0)}
            hint="Finished quantity"
            icon="📦"
          />
          <MetricTile
            tone="violet"
            label="Upgrades"
            value={ownedFacilities.reduce((sum, f) => sum + ((f.level || 1) - 1), 0)}
            hint="Total tiers gained"
            icon="⬆️"
          />
        </div>
      </TabSection>
    </div>
  );
});

ProcessingTab.displayName = 'ProcessingTab';
export default ProcessingTab;
