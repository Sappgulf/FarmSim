import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Volume2, VolumeX, Settings, Pause, Play, Maximize2, 
  Zap, Trophy, Star, TrendingUp, Users, Gift 
} from 'lucide-react';

// Enhanced components
import { AdvancedParticleSystem, triggerParticles } from './enhanced/AdvancedParticleSystem';
import { SoundManager, playSound, setVolume } from './enhanced/SoundManager';
import { AdvancedWeatherSystem } from './enhanced/AdvancedWeatherSystem';
import { FarmVisualization } from './enhanced/FarmVisualization';

// Original game components
import FarmSimCanvas from './FarmSimCanvas';

/**
 * Enhanced Farm Game - Next Generation Farming Experience
 * Integrates advanced visual effects, sound, weather, and gameplay systems
 */

const ENHANCEMENT_FEATURES = {
  advancedGraphics: {
    name: "Advanced Graphics",
    description: "Beautiful 3D-like visuals with particle effects",
    icon: Zap,
    enabled: true
  },
  spatialAudio: {
    name: "Spatial Audio",
    description: "Immersive 3D sound effects and dynamic music",
    icon: Volume2,
    enabled: true
  },
  weatherSystem: {
    name: "Weather System",
    description: "Realistic weather patterns affecting gameplay",
    icon: Trophy,
    enabled: true
  },
  performanceMode: {
    name: "Performance Mode",
    description: "Optimized for 60fps on all devices",
    icon: TrendingUp,
    enabled: false
  }
};

const QUALITY_PRESETS = {
  ultra: {
    name: "Ultra",
    particles: true,
    animations: true,
    shadows: true,
    weather: true,
    sound: true,
    targetFPS: 60
  },
  high: {
    name: "High",
    particles: true,
    animations: true,
    shadows: false,
    weather: true,
    sound: true,
    targetFPS: 45
  },
  medium: {
    name: "Medium",
    particles: false,
    animations: true,
    shadows: false,
    weather: false,
    sound: true,
    targetFPS: 30
  },
  low: {
    name: "Low",
    particles: false,
    animations: false,
    shadows: false,
    weather: false,
    sound: false,
    targetFPS: 30
  }
};

export function EnhancedFarmGame() {
  // Enhanced game state
  const [enhancementMode, setEnhancementMode] = useState(true);
  const [qualityPreset, setQualityPreset] = useState('high');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volumes, setVolumes] = useState({
    master: 0.7,
    sfx: 0.8,
    music: 0.5
  });
  
  // Performance monitoring
  const [fps, setFps] = useState(60);
  const [performance, setPerformance] = useState('good');
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });
  
  // Game state integration
  const [gameData, setGameData] = useState({
    plots: [],
    weather: 'sunny',
    timeOfDay: 'day',
    season: 'spring',
    coins: 100,
    level: 1,
    achievements: []
  });

  // Auto-detect device capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasHighPerformance = navigator.hardwareConcurrency >= 4;
      const hasGoodGPU = !!window.WebGLRenderingContext;
      
      let recommendedPreset = 'medium';
      
      if (!isMobile && hasHighPerformance && hasGoodGPU) {
        recommendedPreset = 'ultra';
      } else if (!isMobile && hasHighPerformance) {
        recommendedPreset = 'high';
      } else if (isMobile && hasGoodGPU) {
        recommendedPreset = 'medium';
      } else {
        recommendedPreset = 'low';
      }
      
      setQualityPreset(recommendedPreset);
    };
    
    detectCapabilities();
  }, []);

  // FPS monitoring
  useEffect(() => {
    const monitorFPS = () => {
      const now = Date.now();
      fpsCounterRef.current.frames++;
      
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        const currentFPS = Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime));
        setFps(currentFPS);
        
        // Auto-adjust quality based on performance
        if (currentFPS < 30 && qualityPreset !== 'low') {
          console.log('Performance degraded, reducing quality');
          const presets = ['ultra', 'high', 'medium', 'low'];
          const currentIndex = presets.indexOf(qualityPreset);
          if (currentIndex < presets.length - 1) {
            setQualityPreset(presets[currentIndex + 1]);
          }
        }
        
        setPerformance(currentFPS >= 50 ? 'excellent' : currentFPS >= 30 ? 'good' : 'poor');
        
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }
      
      requestAnimationFrame(monitorFPS);
    };
    
    monitorFPS();
  }, [qualityPreset]);

  // Enhanced game actions with effects
  const enhancedActions = {
    plantSeed: (plotIndex, seedType) => {
      // Trigger visual and audio effects
      if (QUALITY_PRESETS[qualityPreset].particles) {
        const plotElement = document.querySelector(`[data-plot="${plotIndex}"]`);
        if (plotElement) {
          const rect = plotElement.getBoundingClientRect();
          triggerParticles(rect.left + rect.width/2, rect.top + rect.height/2, 'plant');
        }
      }
      
      if (QUALITY_PRESETS[qualityPreset].sound) {
        playSound('plant');
      }
      
      // Call original game logic
      return true;
    },
    
    harvestCrop: (plotIndex) => {
      if (QUALITY_PRESETS[qualityPreset].particles) {
        const plotElement = document.querySelector(`[data-plot="${plotIndex}"]`);
        if (plotElement) {
          const rect = plotElement.getBoundingClientRect();
          triggerParticles(rect.left + rect.width/2, rect.top + rect.height/2, 'harvest');
        }
      }
      
      if (QUALITY_PRESETS[qualityPreset].sound) {
        playSound('harvest');
      }
      
      return true;
    },
    
    earnCoins: (amount) => {
      if (QUALITY_PRESETS[qualityPreset].particles) {
        triggerParticles(400, 100, 'coins');
      }
      
      if (QUALITY_PRESETS[qualityPreset].sound) {
        playSound('coins');
      }
      
      return true;
    },
    
    unlockAchievement: (achievement) => {
      if (QUALITY_PRESETS[qualityPreset].particles) {
        triggerParticles(400, 200, 'achievement');
      }
      
      if (QUALITY_PRESETS[qualityPreset].sound) {
        playSound('achievement');
      }
      
      return true;
    }
  };

  // Volume control
  const handleVolumeChange = (type, value) => {
    const newVolumes = { ...volumes, [type]: value };
    setVolumes(newVolumes);
    setVolume(type, value);
  };

  // Quality preset application
  const applyQualityPreset = (preset) => {
    setQualityPreset(preset);
    const settings = QUALITY_PRESETS[preset];
    
    // Apply settings to various systems
    if (window.particleSystem) {
      window.particleSystem.enabled = settings.particles;
    }
    
    setSoundEnabled(settings.sound);
    
    // Update CSS for animations
    document.documentElement.style.setProperty(
      '--animation-duration', 
      settings.animations ? '0.3s' : '0s'
    );
  };

  const currentPreset = QUALITY_PRESETS[qualityPreset];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Enhanced Audio System */}
      <SoundManager enabled={soundEnabled} volumes={volumes} />
      
      {/* Performance HUD */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <Card className="p-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              performance === 'excellent' ? 'bg-green-500' : 
              performance === 'good' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span>{fps} FPS</span>
            <Badge variant="outline" className="text-xs">
              {currentPreset.name}
            </Badge>
          </div>
        </Card>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEnhancementMode(!enhancementMode)}
          >
            {enhancementMode ? <Zap className="w-4 h-4 text-yellow-500" /> : <Settings className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Enhancement Mode Toggle */}
      {enhancementMode ? (
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  🌾 Enhanced Farm Simulator
                </h1>
                <p className="text-gray-600 mt-2">
                  Next-generation farming with advanced graphics, spatial audio, and realistic weather
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {gameData.coins.toLocaleString()} 🪙
                  </div>
                  <div className="text-sm text-gray-500">Level {gameData.level}</div>
                </div>
              </div>
            </div>

            {/* Feature Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(ENHANCEMENT_FEATURES).map(([key, feature]) => {
                const IconComponent = feature.icon;
                const isEnabled = currentPreset[key] !== false;
                
                return (
                  <Card key={key} className={`p-3 ${isEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-5 h-5 ${isEnabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-semibold text-sm">{feature.name}</div>
                        <div className="text-xs text-gray-500">{isEnabled ? 'Active' : 'Disabled'}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Tabs defaultValue="farm" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="farm">🚜 Farm</TabsTrigger>
              <TabsTrigger value="weather">🌤️ Weather</TabsTrigger>
              <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
              <TabsTrigger value="stats">📊 Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="farm" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Farm View */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>Your Farm</span>
                        <Badge variant="outline">
                          {gameData.season} • {gameData.timeOfDay}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      {/* Enhanced Farm Visualization */}
                      <div className="relative">
                        <FarmVisualization
                          plots={gameData.plots}
                          gridSize={5}
                          weather={gameData.weather}
                          timeOfDay={gameData.timeOfDay}
                          onPlotClick={(index) => enhancedActions.plantSeed(index, 'carrot')}
                          onPlotRightClick={(index) => enhancedActions.harvestCrop(index)}
                        />
                        
                        {/* Particle System Overlay */}
                        {currentPreset.particles && (
                          <AdvancedParticleSystem
                            width={400}
                            height={400}
                            className="absolute top-0 left-0"
                          />
                        )}
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-600">
                        <p>🖱️ Left click to plant • Right click to harvest</p>
                        <p>✨ Enhanced with particle effects and spatial audio</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Plots Planted:</span>
                        <Badge>{gameData.plots.filter(p => p.state !== 'empty').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Ready to Harvest:</span>
                        <Badge variant="secondary">{gameData.plots.filter(p => p.state === 'ready').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Achievements:</span>
                        <Badge variant="outline">{gameData.achievements.length}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Weather</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {gameData.weather === 'sunny' ? '☀️' : 
                           gameData.weather === 'rain' ? '🌧️' : '☁️'}
                        </div>
                        <div className="font-semibold capitalize">{gameData.weather}</div>
                        <div className="text-sm text-gray-500 mt-2">
                          Affects crop growth and water needs
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weather" className="space-y-4">
              <AdvancedWeatherSystem
                currentWeather={gameData.weather}
                season={gameData.season}
                onWeatherChange={(weather) => setGameData(prev => ({ ...prev, weather }))}
              />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Achievement System</h3>
                    <p className="text-gray-600 mb-4">
                      Track your farming progress with enhanced visual effects
                    </p>
                    <Button onClick={() => enhancedActions.unlockAchievement('test')}>
                      🎉 Test Achievement Effect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quality Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Graphics Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-sm text-gray-500">
                            Target: {preset.targetFPS} FPS
                          </div>
                        </div>
                        <Button
                          variant={qualityPreset === key ? "default" : "outline"}
                          onClick={() => applyQualityPreset(key)}
                        >
                          {qualityPreset === key ? "Active" : "Select"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Audio Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audio Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(volumes).map(([type, value]) => (
                      <div key={type}>
                        <div className="flex justify-between mb-2">
                          <span className="capitalize">{type} Volume</span>
                          <span>{Math.round(value * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={value}
                          onChange={(e) => handleVolumeChange(type, parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => playSound('success')}
                        className="w-full"
                      >
                        🎵 Test Sound
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>FPS:</span>
                        <Badge className={
                          fps >= 50 ? 'bg-green-500' : 
                          fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {fps}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline" className="capitalize">
                          {performance}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality:</span>
                        <Badge variant="secondary">
                          {currentPreset.name}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Particles:</span>
                        <Badge variant={currentPreset.particles ? "default" : "secondary"}>
                          {currentPreset.particles ? "On" : "Off"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Animations:</span>
                        <Badge variant={currentPreset.animations ? "default" : "secondary"}>
                          {currentPreset.animations ? "On" : "Off"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Weather:</span>
                        <Badge variant={currentPreset.weather ? "default" : "secondary"}>
                          {currentPreset.weather ? "On" : "Off"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>CPU Cores: {navigator.hardwareConcurrency || 'Unknown'}</div>
                      <div>WebGL: {!!window.WebGLRenderingContext ? 'Supported' : 'Not Supported'}</div>
                      <div>Audio: {!!window.AudioContext ? 'Supported' : 'Not Supported'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        /* Fallback to Original Game */
        <div className="container mx-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Farm Simulator (Classic Mode)</h1>
            <Button onClick={() => setEnhancementMode(true)}>
              Enable Enhancements ✨
            </Button>
          </div>
          <FarmSimCanvas />
        </div>
      )}
    </div>
  );
}

export default EnhancedFarmGame;
