import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Volume2, VolumeX, Settings, Pause, Play, Maximize2, 
  Zap, Trophy, Star, TrendingUp, Users, Gift, 
  Brain, Dna, Bot, Leaf, DollarSign, MapPin,
  ChevronRight, ChevronDown, Target, Award
} from 'lucide-react';

// Enhanced components
import { AdvancedParticleSystem, triggerParticles } from './enhanced/AdvancedParticleSystem';
import { SoundManager, playSound, setVolume } from './enhanced/SoundManager';
import { AdvancedWeatherSystem } from './enhanced/AdvancedWeatherSystem';
import { FarmVisualization } from './enhanced/FarmVisualization';

// Data systems
import { EXPANDED_CROPS, CROP_CATEGORIES, CROP_RARITY } from '../data/expandedCrops';
import { LIVESTOCK_SPECIES, ANIMAL_CATEGORIES } from '../data/livestockSystem';
import { AUTOMATION_TYPES, AI_FARMHANDS } from '../systems/automationSystem';
import { RESEARCH_PROJECTS, RESEARCH_CATEGORIES } from '../systems/researchTree';
import { MARKET_TYPES, ECONOMIC_EVENTS } from '../systems/economySystem';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_TIERS } from '../systems/achievementSystem';

/**
 * Ultimate Farm Game - The Most Comprehensive Farming Simulation
 * Integrates all advanced systems: crops, livestock, automation, research, economy, achievements
 */

const GAME_MODES = {
  casual: {
    name: "Casual Mode",
    description: "Relaxed gameplay with helpful guidance",
    difficulty: 0.5,
    timeScale: 1.0,
    features: ["tutorials", "hints", "autoSave"]
  },
  standard: {
    name: "Standard Mode",
    description: "Balanced challenge with realistic progression",
    difficulty: 1.0,
    timeScale: 1.0,
    features: ["realistic", "challenging", "rewarding"]
  },
  expert: {
    name: "Expert Mode",
    description: "Maximum challenge for experienced players",
    difficulty: 1.5,
    timeScale: 0.8,
    features: ["hardcore", "realistic", "competitive"]
  },
  creative: {
    name: "Creative Mode",
    description: "Unlimited resources for experimentation",
    difficulty: 0.0,
    timeScale: 2.0,
    features: ["unlimited", "creative", "experimental"]
  }
};

export function UltimateFarmGame() {
  // Game state
  const [gameMode, setGameMode] = useState('standard');
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Player stats
  const [playerLevel, setPlayerLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [coins, setCoins] = useState(1000);
  const [reputation, setReputation] = useState(0);
  
  // Farm state
  const [farmSize, setFarmSize] = useState(5);
  const [plots, setPlots] = useState([]);
  const [animals, setAnimals] = useState({});
  const [buildings, setBuildings] = useState({});
  const [automation, setAutomation] = useState({});
  
  // Research and technology
  const [researchPoints, setResearchPoints] = useState(0);
  const [completedResearch, setCompletedResearch] = useState([]);
  const [activeResearch, setActiveResearch] = useState(null);
  
  // Market and economy
  const [marketAccess, setMarketAccess] = useState(['local']);
  const [marketPrices, setMarketPrices] = useState({});
  const [economicEvents, setEconomicEvents] = useState([]);
  
  // Achievements
  const [achievements, setAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({});
  
  // UI state
  const [activeTab, setActiveTab] = useState('farm');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Performance and quality
  const [qualityPreset, setQualityPreset] = useState('high');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volumes, setVolumes] = useState({
    master: 0.7,
    sfx: 0.8,
    music: 0.5
  });

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Initialize plots
    const initialPlots = Array.from({ length: farmSize * farmSize }, (_, i) => ({
      id: i,
      state: 'empty',
      crop: null,
      plantedAt: 0,
      wateredAt: 0,
      fertilizedAt: 0,
      quality: 1.0,
      health: 1.0
    }));
    setPlots(initialPlots);
    
    // Initialize market prices
    const initialPrices = {};
    Object.keys(EXPANDED_CROPS).forEach(cropId => {
      initialPrices[cropId] = EXPANDED_CROPS[cropId].baseValue;
    });
    setMarketPrices(initialPrices);
    
    // Start game loop
    startGameLoop();
  };

  const startGameLoop = () => {
    const gameLoop = setInterval(() => {
      if (!isPaused) {
        setGameTime(prev => prev + 1);
        updateGameSystems();
      }
    }, 1000);
    
    return () => clearInterval(gameLoop);
  };

  const updateGameSystems = () => {
    // Update crop growth
    updateCropGrowth();
    
    // Update animal production
    updateAnimalProduction();
    
    // Update automation
    updateAutomation();
    
    // Update market prices
    updateMarketPrices();
    
    // Check achievements
    checkAchievements();
    
    // Update research
    updateResearch();
  };

  const updateCropGrowth = () => {
    setPlots(prev => prev.map(plot => {
      if (plot.state === 'growing' && plot.crop) {
        const crop = EXPANDED_CROPS[plot.crop];
        const growthTime = crop.growthTime;
        const elapsed = gameTime - plot.plantedAt;
        const progress = Math.min(elapsed / growthTime, 1);
        
        if (progress >= 1) {
          return { ...plot, state: 'ready' };
        }
        
        return { ...plot, progress };
      }
      return plot;
    }));
  };

  const updateAnimalProduction = () => {
    // Update animal production cycles
    setAnimals(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(animalType => {
        const animal = updated[animalType];
        if (animal && animal.count > 0) {
          const species = LIVESTOCK_SPECIES[animalType];
          if (species && species.production) {
            // Update production based on animal care and time
            const productionRate = species.production.milk?.daily || 0;
            const newProduction = (animal.production || 0) + productionRate * animal.count * 0.01;
            updated[animalType] = { ...animal, production: newProduction };
          }
        }
      });
      return updated;
    });
  };

  const updateAutomation = () => {
    // Update automation systems
    setAutomation(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(systemId => {
        const system = updated[systemId];
        if (system && system.active) {
          // Process automation tasks
          processAutomationTasks(systemId, system);
        }
      });
      return updated;
    });
  };

  const updateMarketPrices = () => {
    // Simulate market price fluctuations
    setMarketPrices(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cropId => {
        const basePrice = EXPANDED_CROPS[cropId]?.baseValue || 10;
        const volatility = 0.1;
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = Math.max(basePrice * 0.5, updated[cropId] * (1 + change));
        updated[cropId] = Math.round(newPrice);
      });
      return updated;
    });
  };

  const checkAchievements = () => {
    // Check for achievement progress
    const newProgress = { ...achievementProgress };
    
    // Example: Check harvest achievements
    const totalHarvests = plots.filter(p => p.state === 'ready').length;
    if (totalHarvests >= 1 && !achievements.includes('firstHarvest')) {
      unlockAchievement('firstHarvest');
    }
    
    setAchievementProgress(newProgress);
  };

  const updateResearch = () => {
    if (activeResearch) {
      const research = RESEARCH_PROJECTS[activeResearch];
      if (research) {
        const elapsed = gameTime - (activeResearch.startedAt || 0);
        if (elapsed >= research.time) {
          completeResearch(activeResearch);
        }
      }
    }
  };

  const plantCrop = (plotId, cropId) => {
    const crop = EXPANDED_CROPS[cropId];
    if (!crop) return;
    
    if (coins < crop.price) {
      playSound('error');
      return;
    }
    
    setCoins(prev => prev - crop.price);
    setPlots(prev => prev.map(plot => 
      plot.id === plotId 
        ? { ...plot, state: 'growing', crop: cropId, plantedAt: gameTime }
        : plot
    ));
    
    // Trigger effects
    if (qualityPreset !== 'low') {
      triggerParticles(200, 200, 'plant');
    }
    playSound('plant');
    
    // Add experience
    addExperience(10);
  };

  const harvestCrop = (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.state !== 'ready') return;
    
    const crop = EXPANDED_CROPS[plot.crop];
    if (!crop) return;
    
    const value = Math.round(crop.baseValue * plot.quality);
    setCoins(prev => prev + value);
    setPlots(prev => prev.map(p => 
      p.id === plotId 
        ? { ...p, state: 'empty', crop: null, plantedAt: 0, quality: 1.0 }
        : p
    ));
    
    // Trigger effects
    if (qualityPreset !== 'low') {
      triggerParticles(200, 200, 'harvest');
    }
    playSound('harvest');
    
    // Add experience
    addExperience(20);
  };

  const buyAnimal = (animalType) => {
    const species = LIVESTOCK_SPECIES[animalType];
    if (!species) return;
    
    if (coins < species.baseCost) {
      playSound('error');
      return;
    }
    
    setCoins(prev => prev - species.baseCost);
    setAnimals(prev => ({
      ...prev,
      [animalType]: {
        count: (prev[animalType]?.count || 0) + 1,
        health: 1.0,
        happiness: 1.0,
        production: 0
      }
    }));
    
    playSound('success');
    addExperience(15);
  };

  const startResearch = (researchId) => {
    const research = RESEARCH_PROJECTS[researchId];
    if (!research || researchPoints < research.cost) return;
    
    setResearchPoints(prev => prev - research.cost);
    setActiveResearch({
      id: researchId,
      startedAt: gameTime
    });
    
    playSound('success');
  };

  const completeResearch = (researchId) => {
    setCompletedResearch(prev => [...prev, researchId]);
    setActiveResearch(null);
    
    // Apply research benefits
    const research = RESEARCH_PROJECTS[researchId];
    if (research.benefits) {
      // Apply benefits to game systems
      console.log('Research completed:', research.name, research.benefits);
    }
    
    playSound('achievement');
    addExperience(100);
  };

  const unlockAchievement = (achievementId) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;
    
    setAchievements(prev => [...prev, achievementId]);
    
    // Apply rewards
    if (achievement.reward) {
      if (achievement.reward.coins) {
        setCoins(prev => prev + achievement.reward.coins);
      }
      if (achievement.reward.experience) {
        addExperience(achievement.reward.experience);
      }
    }
    
    // Trigger effects
    if (qualityPreset !== 'low') {
      triggerParticles(400, 200, 'achievement');
    }
    playSound('achievement');
  };

  const addExperience = (amount) => {
    setExperience(prev => {
      const newExp = prev + amount;
      const newLevel = Math.floor(newExp / 1000) + 1;
      if (newLevel > playerLevel) {
        setPlayerLevel(newLevel);
        playSound('level_up');
        triggerParticles(400, 100, 'magic');
      }
      return newExp;
    });
  };

  const processAutomationTasks = (systemId, system) => {
    // Process automation system tasks
    // This would handle watering, fertilizing, harvesting, etc.
  };

  // Filter crops by category
  const filteredCrops = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.entries(EXPANDED_CROPS);
    }
    return Object.entries(EXPANDED_CROPS).filter(([_, crop]) => 
      crop.category === selectedCategory
    );
  }, [selectedCategory]);

  // Calculate farm statistics
  const farmStats = useMemo(() => {
    const totalPlots = plots.length;
    const plantedPlots = plots.filter(p => p.state !== 'empty').length;
    const readyPlots = plots.filter(p => p.state === 'ready').length;
    const totalAnimals = Object.values(animals).reduce((sum, animal) => sum + (animal?.count || 0), 0);
    
    return {
      totalPlots,
      plantedPlots,
      readyPlots,
      totalAnimals,
      efficiency: totalPlots > 0 ? (plantedPlots / totalPlots) * 100 : 0
    };
  }, [plots, animals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Enhanced Audio System */}
      <SoundManager enabled={soundEnabled} volumes={volumes} />
      
      {/* Game Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                🌾 Ultimate Farm Simulator
              </h1>
              <Badge variant="outline" className="text-xs">
                {GAME_MODES[gameMode].name}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Level {playerLevel}</span>
                  <Progress value={(experience % 1000) / 10} className="w-16 h-2" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">💰</span>
                  <span className="font-semibold">{coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">🧠</span>
                  <span className="font-semibold">{researchPoints}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="farm">🚜 Farm</TabsTrigger>
            <TabsTrigger value="crops">🌾 Crops</TabsTrigger>
            <TabsTrigger value="animals">🐄 Animals</TabsTrigger>
            <TabsTrigger value="automation">🤖 Automation</TabsTrigger>
            <TabsTrigger value="research">🔬 Research</TabsTrigger>
            <TabsTrigger value="market">💰 Market</TabsTrigger>
            <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* Farm Tab */}
          <TabsContent value="farm" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Your Farm</span>
                      <Badge variant="outline">
                        {farmStats.plantedPlots}/{farmStats.totalPlots} plots
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <FarmVisualization
                      plots={plots}
                      gridSize={farmSize}
                      weather="sunny"
                      timeOfDay="day"
                      onPlotClick={(index) => {
                        const plot = plots[index];
                        if (plot.state === 'empty') {
                          // Show crop selection
                        } else if (plot.state === 'ready') {
                          harvestCrop(plot.id);
                        }
                      }}
                      onPlotRightClick={(index) => {
                        // Show plot options
                      }}
                    />
                    
                    {qualityPreset !== 'low' && (
                      <AdvancedParticleSystem
                        width={400}
                        height={400}
                        className="absolute top-0 left-0"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Farm Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Plots Planted:</span>
                      <Badge>{farmStats.plantedPlots}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ready to Harvest:</span>
                      <Badge variant="secondary">{farmStats.readyPlots}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Animals:</span>
                      <Badge variant="outline">{farmStats.totalAnimals}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <Badge variant="outline">{farmStats.efficiency.toFixed(1)}%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" onClick={() => setActiveTab('crops')}>
                      🌱 Plant Crops
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab('animals')}>
                      🐄 Manage Animals
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab('automation')}>
                      🤖 Automation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Crops Tab */}
          <TabsContent value="crops" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Crop Selection</h2>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {Object.entries(CROP_CATEGORIES).map(([key, category]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    {category.emoji} {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCrops.map(([cropId, crop]) => {
                const rarity = CROP_RARITY[crop.rarity];
                const category = CROP_CATEGORIES[crop.category];
                
                return (
                  <Card key={cropId} className={`${rarity.bgColor} ${rarity.borderColor} border-2`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <span className="text-2xl">{crop.emoji}</span>
                        <div>
                          <div className="font-semibold">{crop.name}</div>
                          <Badge variant="outline" className={`text-xs ${rarity.color}`}>
                            {rarity.name}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-gray-600">{crop.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">${crop.price}</span>
                        <Button
                          size="sm"
                          disabled={coins < crop.price}
                          onClick={() => {
                            // Plant crop logic
                            playSound('click');
                          }}
                        >
                          Plant
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Growth: {crop.growthTime}s • Value: ${crop.baseValue}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Animals Tab */}
          <TabsContent value="animals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(LIVESTOCK_SPECIES).map(([animalId, animal]) => {
                const category = ANIMAL_CATEGORIES[animal.category];
                
                return (
                  <Card key={animalId} className={`${category.color.replace('text-', 'border-')} border-2`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{animal.emoji}</span>
                        <div>
                          <div className="font-semibold">{animal.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{animal.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Cost: ${animal.baseCost}</div>
                        <div>Space: {animal.spaceRequired}</div>
                        <div>Lifespan: {animal.lifespan}y</div>
                        <div>Maturity: {animal.maturityAge}y</div>
                      </div>
                      <Button
                        className="w-full"
                        disabled={coins < animal.baseCost}
                        onClick={() => buyAnimal(animalId)}
                      >
                        Buy ${animal.baseCost}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(RESEARCH_PROJECTS).map(([researchId, research]) => {
                    const category = RESEARCH_CATEGORIES[research.category];
                    const isCompleted = completedResearch.includes(researchId);
                    const canResearch = researchPoints >= research.cost && !isCompleted;
                    
                    return (
                      <div key={researchId} className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{category.emoji}</span>
                          <div>
                            <div className="font-semibold">{research.name}</div>
                            <Badge variant="outline" className="text-xs">
                              Tier {research.tier}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{research.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cost: {research.cost} RP</span>
                          <Button
                            size="sm"
                            disabled={!canResearch || isCompleted}
                            onClick={() => startResearch(researchId)}
                          >
                            {isCompleted ? 'Completed' : 'Research'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Research Points</span>
                        <span>{researchPoints}</span>
                      </div>
                      <Progress value={researchPoints / 1000 * 100} className="h-2" />
                    </div>
                    
                    {activeResearch && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold">Active Research</div>
                        <div className="text-sm text-gray-600">
                          {RESEARCH_PROJECTS[activeResearch.id]?.name}
                        </div>
                        <Progress value={50} className="h-2 mt-2" />
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      Completed: {completedResearch.length} projects
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(ACHIEVEMENTS).map(([achievementId, achievement]) => {
                    const category = ACHIEVEMENT_CATEGORIES[achievement.category];
                    const tier = ACHIEVEMENT_TIERS[achievement.tier];
                    const isUnlocked = achievements.includes(achievementId);
                    
                    return (
                      <div key={achievementId} className={`p-3 rounded-lg border ${isUnlocked ? tier.bgColor : 'bg-gray-50'} ${tier.borderColor} border-2`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{achievement.emoji}</span>
                          <div>
                            <div className="font-semibold">{achievement.name}</div>
                            <Badge variant="outline" className={`text-xs ${tier.color}`}>
                              {tier.name}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{category.name}</span>
                          {isUnlocked && (
                            <Badge variant="default" className="text-xs">
                              ✓ Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievement Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Overall Progress</span>
                        <span>{achievements.length}/{Object.keys(ACHIEVEMENTS).length}</span>
                      </div>
                      <Progress value={achievements.length / Object.keys(ACHIEVEMENTS).length * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(ACHIEVEMENT_CATEGORIES).map(([categoryId, category]) => {
                        const categoryAchievements = Object.keys(ACHIEVEMENTS).filter(
                          id => ACHIEVEMENTS[id].category === categoryId
                        );
                        const unlocked = categoryAchievements.filter(id => achievements.includes(id)).length;
                        
                        return (
                          <div key={categoryId} className="flex justify-between items-center">
                            <span className="text-sm">{category.emoji} {category.name}</span>
                            <span className="text-sm">{unlocked}/{categoryAchievements.length}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Game Mode</label>
                    <div className="space-y-2">
                      {Object.entries(GAME_MODES).map(([modeId, mode]) => (
                        <div key={modeId} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={modeId}
                            name="gameMode"
                            value={modeId}
                            checked={gameMode === modeId}
                            onChange={(e) => setGameMode(e.target.value)}
                          />
                          <label htmlFor={modeId} className="text-sm">
                            <div className="font-medium">{mode.name}</div>
                            <div className="text-gray-600">{mode.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(volumes).map(([type, value]) => (
                    <div key={type}>
                      <div className="flex justify-between mb-2">
                        <span className="capitalize text-sm">{type} Volume</span>
                        <span className="text-sm">{Math.round(value * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={value}
                        onChange={(e) => setVolumes(prev => ({
                          ...prev,
                          [type]: parseFloat(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default UltimateFarmGame;
