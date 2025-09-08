import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FarmGrid } from './farm/FarmGrid';
import { EXPANDED_CROPS as expandedCrops } from '../data/expandedCrops';
import { useWeather } from '../hooks/useWeather';
import { useMarket } from '../hooks/useMarket';
import { useAchievements } from '../hooks/useAchievements';

export default function MainFarmGame() {
  console.log('🚜 Main Farm Game - Loading...');

  // Core game state
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [money, setMoney] = useState(100);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Progress tracking
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalHarvests, setTotalHarvests] = useState(0);
  const [qualityHarvests, setQualityHarvests] = useState(0);

  // Farm configuration
  const [farmSize, setFarmSize] = useState(3);
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [seedInventory, setSeedInventory] = useState({
    wheat: 5,
    carrot: 3,
    tomato: 2
  });

  // Farm plots state
  const [plots, setPlots] = useState(() => {
    const initialPlots = {};
    const totalPlots = farmSize * farmSize;
    for (let i = 0; i < totalPlots; i++) {
      initialPlots[i] = {
        id: i,
        state: 'empty', // empty, planted, ready, withered
        crop: null,
        plantedAt: 0,
        progress: 0,
        wateredAt: 0,
        fertilizedAt: 0,
        quality: 1.0,
        health: 1.0
      };
    }
    return initialPlots;
  });

  // Notification system
  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: Date.now()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);

    // Simple sound feedback
    if (soundEnabled && typeof Audio !== 'undefined') {
      try {
        const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgYGjOS0fPTgC4FK3XJ8umWSwsTWa7m6p9NGQ5Mn+DyvmgYGjOS0fPTgC4FK3XJ8umWSwsTWa7m6p9NGQ5Mn+DyvmgYGjOS0fPTgC4FK3XJ8umWSwsTWa7m6p9NGQ5Mn+DyvmgYGjOS0fPTgC4FK3XJ8umWSwsTWa7m6p9NGQ5Mn+DyvmgYGjOS0fPTgC4FK3XJ8umWSwsTWa7m6p9NGQ5Mn+DyvmgYGjOS0fPTgC4FK3XJ8umWSwsTWa7m6p9NGQ5M');
        beep.play().catch(() => {});
      } catch (e) {}
    }
  }, [soundEnabled]);

  // Logging system
  const addLog = useCallback((message) => {
    console.debug('[FarmGame]', message);
  }, []);

  // Hook integrations
  const weather = useWeather({
    currentTime: gameTime,
    addNotification,
    addLog,
    nowSec: () => gameTime
  });

  const market = useMarket({
    currentTime: gameTime,
    addNotification,
    addLog,
    nowSec: () => gameTime
  });

  const achievements = useAchievements({
    totalEarned,
    totalHarvests,
    qualityHarvests,
    weatherEvents: weather?.weatherEvents || 0,
    addNotification,
    addLog,
    addCoins: (amount) => {
      setMoney(prev => prev + amount);
      setTotalEarned(prev => prev + amount);
    }
  });

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!isPaused) {
        setGameTime(time => time + 1);
      }
    }, 1000);
    return () => clearInterval(gameLoop);
  }, [isPaused]);

  // Update crop growth
  useEffect(() => {
    if (isPaused) return;

    setPlots(currentPlots => {
      const updatedPlots = { ...currentPlots };
      let hasChanges = false;

      Object.keys(updatedPlots).forEach(plotId => {
        const plot = updatedPlots[plotId];
        if (plot.state === 'planted' && plot.crop) {
          const cropData = expandedCrops[plot.crop];
          if (!cropData) return;

          const timeGrown = gameTime - plot.plantedAt;
          const baseGrowthTime = cropData.growthTime || 60;
          
          // Apply weather effects
          let growthMultiplier = 1.0;
          if (weather?.current?.type === 'rain') growthMultiplier *= 1.2;
          if (weather?.current?.type === 'drought') growthMultiplier *= 0.8;
          if (weather?.current?.type === 'storm') growthMultiplier *= 0.6;

          // Apply watering bonus
          const timeSinceWatered = gameTime - plot.wateredAt;
          if (timeSinceWatered < 30) growthMultiplier *= 1.1;

          const adjustedGrowthTime = baseGrowthTime / growthMultiplier;
          const newProgress = Math.min(100, (timeGrown / adjustedGrowthTime) * 100);

          if (newProgress !== plot.progress) {
            updatedPlots[plotId] = {
              ...plot,
              progress: newProgress,
              state: newProgress >= 100 ? 'ready' : 'planted'
            };
            hasChanges = true;

            // Notification when crop is ready
            if (newProgress >= 100 && plot.progress < 100) {
              addNotification(`${cropData.name} is ready for harvest! ${cropData.emoji}`, 'success');
            }
          }
        }
      });

      return hasChanges ? updatedPlots : currentPlots;
    });
  }, [gameTime, isPaused, weather?.current, addNotification]);

  // Auto-save
  useEffect(() => {
    const saveData = {
      gameTime,
      money,
      experience,
      level,
      totalEarned,
      totalHarvests,
      qualityHarvests,
      farmSize,
      selectedCrop,
      seedInventory,
      plots,
      soundEnabled,
      savedAt: Date.now()
    };

    try {
      localStorage.setItem('mainFarmGame_save', JSON.stringify(saveData));
    } catch (error) {
      console.warn('Failed to save game:', error);
    }
  }, [gameTime, money, experience, level, totalEarned, totalHarvests, qualityHarvests, farmSize, selectedCrop, seedInventory, plots, soundEnabled]);

  // Load save data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('mainFarmGame_save');
      if (savedData) {
        const data = JSON.parse(savedData);
        setGameTime(data.gameTime || 0);
        setMoney(data.money || 100);
        setExperience(data.experience || 0);
        setLevel(data.level || 1);
        setTotalEarned(data.totalEarned || 0);
        setTotalHarvests(data.totalHarvests || 0);
        setQualityHarvests(data.qualityHarvests || 0);
        setFarmSize(data.farmSize || 3);
        setSelectedCrop(data.selectedCrop || 'wheat');
        setSeedInventory(data.seedInventory || { wheat: 5, carrot: 3, tomato: 2 });
        setPlots(data.plots || {});
        setSoundEnabled(data.soundEnabled !== false);
        addNotification('Game loaded successfully!', 'success');
      }
    } catch (error) {
      console.warn('Failed to load save:', error);
      addNotification('Failed to load save data', 'error');
    }
  }, [addNotification]);

  // Game actions
  const plantCrop = useCallback((plotId) => {
    const plot = plots[plotId];
    const cropData = expandedCrops[selectedCrop];
    
    if (!plot || plot.state !== 'empty' || !cropData) return;
    
    const seeds = seedInventory[selectedCrop] || 0;
    if (seeds <= 0) {
      addNotification(`No ${cropData.name} seeds available!`, 'error');
      return;
    }

    setSeedInventory(prev => ({
      ...prev,
      [selectedCrop]: Math.max(0, (prev[selectedCrop] || 0) - 1)
    }));

    setPlots(prev => ({
      ...prev,
      [plotId]: {
        ...prev[plotId],
        state: 'planted',
        crop: selectedCrop,
        plantedAt: gameTime,
        progress: 0,
        quality: 1.0,
        health: 1.0
      }
    }));

    addNotification(`Planted ${cropData.name} ${cropData.emoji}`, 'success');
  }, [plots, selectedCrop, seedInventory, gameTime, addNotification]);

  const harvestCrop = useCallback((plotId) => {
    const plot = plots[plotId];
    if (!plot || plot.state !== 'ready' || !plot.crop) return;

    const cropData = expandedCrops[plot.crop];
    if (!cropData) return;

    // Calculate earnings with quality bonus
    const baseValue = cropData.baseValue || 20;
    const qualityBonus = (plot.quality - 1.0) * 0.5;
    const earnings = Math.floor(baseValue * (1 + qualityBonus));

    setMoney(prev => prev + earnings);
    setTotalEarned(prev => prev + earnings);
    setTotalHarvests(prev => prev + 1);
    
    if (plot.quality >= 1.5) {
      setQualityHarvests(prev => prev + 1);
    }

    setExperience(prev => prev + 10);
    
    // Level up check
    const newLevel = Math.floor(experience / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      addNotification(`Level up! You are now level ${newLevel}!`, 'success');
    }

    setPlots(prev => ({
      ...prev,
      [plotId]: {
        ...prev[plotId],
        state: 'empty',
        crop: null,
        plantedAt: 0,
        progress: 0,
        quality: 1.0,
        health: 1.0
      }
    }));

    addNotification(`Harvested ${cropData.name} for $${earnings}! ${cropData.emoji}`, 'success');
  }, [plots, experience, level, addNotification]);

  const waterPlot = useCallback((plotId) => {
    const plot = plots[plotId];
    if (!plot || plot.state !== 'planted') return;

    setPlots(prev => ({
      ...prev,
      [plotId]: {
        ...prev[plotId],
        wateredAt: gameTime,
        quality: Math.min(2.0, prev[plotId].quality + 0.1)
      }
    }));

    addNotification('Plot watered! 💧', 'info');
  }, [plots, gameTime, addNotification]);

  // Available crops for UI
  const availableCrops = useMemo(() => {
    return Object.entries(expandedCrops)
      .filter(([key, crop]) => {
        // Show basic crops initially, unlock more as player levels up
        const basicCrops = ['wheat', 'carrot', 'tomato', 'corn', 'potato'];
        if (basicCrops.includes(key)) return true;
        return level >= (crop.levelRequired || 5);
      })
      .slice(0, 12); // Limit to first 12 for UI
  }, [level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      
      {/* Simple Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-green-800">🚜 Farm Simulator</h1>
            <div className="flex flex-wrap gap-4">
              <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                💰 ${money}
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                ⭐ Level {level}
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                🎯 XP: {experience}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                ⏰ {Math.floor(gameTime / 60)}:{String(gameTime % 60).padStart(2, '0')}
              </div>
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant={isPaused ? "default" : "secondary"}
                size="sm"
              >
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notif.type === 'success' ? 'bg-green-100 border border-green-400' :
                notif.type === 'error' ? 'bg-red-100 border border-red-400' :
                'bg-blue-100 border border-blue-400'
              }`}
            >
              {notif.message}
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto p-4 space-y-6">
        {/* Weather Display */}
        {weather?.current && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{weather.current.emoji || '☀️'}</div>
                <div>
                  <div className="font-semibold">{weather.current.name || 'Clear'}</div>
                  <div className="text-sm text-gray-600">{weather.current.description || 'Perfect farming weather'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Farm Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚜 Your Farm
                  <Badge variant="secondary">{farmSize}×{farmSize}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FarmGrid
                  plots={plots}
                  farmSize={farmSize}
                  expandedCrops={expandedCrops}
                  onPlotClick={(plotId) => {
                    const plot = plots[plotId];
                    if (plot.state === 'empty') {
                      plantCrop(plotId);
                    } else if (plot.state === 'ready') {
                      harvestCrop(plotId);
                    } else if (plot.state === 'planted') {
                      waterPlot(plotId);
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Crop Selection */}
            <Card>
              <CardHeader>
                <CardTitle>🌱 Select Crop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {availableCrops.map(([key, crop]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCrop(key)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        selectedCrop === key
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-lg">{crop.emoji}</div>
                      <div className="font-semibold">{crop.name}</div>
                      <div className="text-xs text-gray-600">
                        Seeds: {seedInventory[key] || 0}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Simple Shop */}
            <Card>
              <CardHeader>
                <CardTitle>🏪 Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableCrops.slice(0, 4).map(([key, crop]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span>{crop.emoji}</span>
                        <span className="text-sm">{crop.name} Seeds</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const cost = (crop.price || 10) * 2;
                          if (money >= cost) {
                            setMoney(prev => prev - cost);
                            setSeedInventory(prev => ({
                              ...prev,
                              [key]: (prev[key] || 0) + 5
                            }));
                            addNotification(`Bought 5 ${crop.name} seeds!`, 'success');
                          } else {
                            addNotification('Not enough money!', 'error');
                          }
                        }}
                        disabled={money < ((crop.price || 10) * 2)}
                      >
                        ${(crop.price || 10) * 2}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Simple Stats */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Earned:</span>
                    <span className="font-semibold">${totalEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Harvests:</span>
                    <span className="font-semibold">{totalHarvests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Harvests:</span>
                    <span className="font-semibold">{qualityHarvests}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
