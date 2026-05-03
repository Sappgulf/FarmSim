/**
 * Processing Panel Component
 * Workshop crop processing interface
 */
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Factory, Clock, Coins, ChevronRight, Package, Sparkles, Lock } from 'lucide-react';
import { PROCESSING_RECIPES } from '../../data/buildings';
import { CROPS } from '../../data/crops';

function ProcessingPanelComponent({
  inventory = {},
  coins = 0,
  hasWorkshop = false,
  onProcess,
  onCollect,
  processingQueue = [],
  completedProducts = [],
  addNotification,
}) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Get available recipes based on inventory
  const availableRecipes = Object.entries(PROCESSING_RECIPES)
    .filter(([inputId]) => CROPS[inputId]) // Only base crops
    .map(([inputId, recipe]) => ({
      inputId,
      inputCrop: CROPS[inputId],
      ...recipe,
      available: (inventory[inputId] || 0) >= 1,
      inventoryCount: inventory[inputId] || 0,
    }));

  // Calculate processing value
  const calculateValue = useCallback((inputId, qty) => {
    const recipe = PROCESSING_RECIPES[inputId];
    const crop = CROPS[inputId];
    if (!recipe || !crop) return 0;
    return Math.floor(crop.baseValue * recipe.multiplier * qty);
  }, []);

  // Handle starting processing
  const handleStartProcessing = useCallback(() => {
    if (!selectedRecipe || !hasWorkshop) return;

    const { inputId, inventoryCount } = selectedRecipe;
    const processQty = Math.min(quantity, inventoryCount);

    if (processQty <= 0) {
      addNotification?.('Not enough crops to process!', 'error');
      return;
    }

    onProcess?.(inputId, processQty);
    setSelectedRecipe(null);
    setQuantity(1);
  }, [selectedRecipe, quantity, hasWorkshop, onProcess, addNotification]);

  // Collect completed products
  const handleCollect = useCallback(
    (productId, index) => {
      onCollect?.(productId, index);
    },
    [onCollect]
  );

  if (!hasWorkshop) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="text-amber-600" size={32} />
          </div>
          <h3 className="font-bold text-amber-800 mb-2">Workshop Required</h3>
          <p className="text-amber-600 text-sm mb-4">
            Build a Workshop (500 coins) to unlock crop processing
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-500">
            <Factory size={14} />
            <span>Process crops into valuable goods for 2-4x profits!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Factory className="text-amber-600" size={20} />
            Crop Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Transform raw crops into valuable products for increased profits!
          </p>

          {/* Processing queue */}
          {processingQueue.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currently Processing
              </div>
              {processingQueue.map((item, i) => (
                <ProcessingItem key={i} item={item} />
              ))}
            </div>
          )}

          {/* Completed products */}
          {completedProducts.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} />
                Ready to Collect
              </div>
              {completedProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{product.emoji}</span>
                    <div>
                      <div className="font-medium text-green-800">{product.name}</div>
                      <div className="text-xs text-green-600">x{product.quantity}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleCollect(product.id, i)}
                  >
                    <Coins size={14} className="mr-1" />
                    Collect {product.value}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipe selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Available Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {availableRecipes.map((recipe) => (
              <button
                key={recipe.inputId}
                onClick={() => setSelectedRecipe(recipe)}
                disabled={!recipe.available}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all text-left
                  ${
                    selectedRecipe?.inputId === recipe.inputId
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                      : recipe.available
                        ? 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Input */}
                  <div className="text-center">
                    <span className="text-2xl">{recipe.inputCrop.emoji}</span>
                    <div className="text-xs text-gray-500">{recipe.inventoryCount}x</div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={16} className="text-gray-400" />

                  {/* Output */}
                  <div className="text-center">
                    <span className="text-2xl">{recipe.emoji}</span>
                    <div className="text-xs font-medium text-gray-700">{recipe.name}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                    <Coins size={12} />
                    {recipe.multiplier}x value
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={10} />
                    {recipe.time}s
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Process button */}
          {selectedRecipe && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-amber-800">
                    Process {selectedRecipe.inputCrop.emoji} into {selectedRecipe.emoji}
                  </div>
                  <div className="text-sm text-amber-600">
                    {selectedRecipe.inventoryCount} available
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity((q) => Math.min(selectedRecipe.inventoryCount, q + 1))
                    }
                    disabled={quantity >= selectedRecipe.inventoryCount}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-600">Output value:</span>
                <span className="font-bold text-green-600">
                  {calculateValue(selectedRecipe.inputId, quantity)} coins
                </span>
              </div>

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleStartProcessing}
              >
                <Factory size={16} className="mr-2" />
                Start Processing ({selectedRecipe.time * quantity}s)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Processing item with progress
function ProcessingItem({ item }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(item.timeRemaining || 0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - item.startTime;
      const total = item.duration * 1000;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);
      setTimeLeft(Math.max(0, Math.ceil((total - elapsed) / 1000)));
    }, 100);

    return () => clearInterval(interval);
  }, [item]);

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{item.emoji}</span>
          <span className="font-medium text-amber-800">{item.name}</span>
          <span className="text-sm text-amber-600">x{item.quantity}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-amber-600">
          <Clock size={14} />
          {timeLeft}s
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

export const ProcessingPanel = memo(ProcessingPanelComponent);
