import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";

// Constants
const MIN_SIZE = 3;
const MAX_SIZE = 5;
const SAVE_KEY = "farm_sim_enhanced_v2";

const LEVELS = [
  { id: "lvl1", label: "Novice Farmer", targetCoins: 100, minutes: 6, reward: 25, difficulty: "Easy" },
  { id: "lvl2", label: "Growing Skills", targetCoins: 200, minutes: 8, reward: 40, difficulty: "Medium" },
  { id: "lvl3", label: "Master Gardener", targetCoins: 350, minutes: 10, reward: 70, difficulty: "Hard" },
  { id: "endless", label: "Endless Farm", targetCoins: 999999, minutes: 9999, reward: 0, difficulty: "∞" },
];

const DEFAULT_RULES = {
  seeds: {
    carrot: { stages: 3, secondsPerStage: 8, baseValue: 12, shopPrice: 5, emoji: "🥕", rarity: "common" },
    potato: { stages: 3, secondsPerStage: 10, baseValue: 15, shopPrice: 7, emoji: "🥔", rarity: "common" },
    corn: { stages: 4, secondsPerStage: 12, baseValue: 22, shopPrice: 10, emoji: "🌽", rarity: "uncommon" },
    tomato: { stages: 4, secondsPerStage: 14, baseValue: 28, shopPrice: 14, emoji: "🍅", rarity: "uncommon" },
  },
  fertilizer: { shopPrice: 8, boost: 1.5 },
  pesticide: { shopPrice: 10 },
  wateringCan: { shopPrice: 25, efficiency: 1.2 },
  buildings: {
    greenhouse: { price: 500, name: "Greenhouse", emoji: "🏡", bonus: 0.2 },
    barn: { price: 1000, name: "Barn", emoji: "🏚️", bonus: 0 },
  }
};

// Helper functions
function nowSec() { 
  return Math.floor(Date.now() / 1000); 
}

function loadSave() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const s = localStorage.getItem(SAVE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed?.version === 2) return parsed;
    }
  } catch (e) {
    console.debug('[farm] loadSave error:', e);
  }
  return null;
}

function saveState(s) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    }
  } catch (e) {
    console.debug('[farm] saveState error:', e);
  }
}

function newPlot(state = "empty") {
  if (state === "locked") return {
    state: "locked",
    seed: null,
    growth: 0,
    watered: false,
    fertilized: 0,
    infested: false,
    plantedAt: null
  };
  return {
    state,
    seed: null,
    growth: 0,
    watered: false,
    fertilized: 0,
    infested: false,
    plantedAt: null,
    lastWateredAt: null,
    boosted: false,
    soilFertility: 1
  };
}

function makeGrid(size) {
  const arr = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isEdge = r === 0 || c === 0 || r === size - 1 || c === size - 1;
      arr.push(newPlot(isEdge ? "empty" : "locked"));
    }
  }
  return arr;
}

function FarmSimCanvasFixed() {
  // Load saved data
  const saved = useMemo(() => loadSave(), []);
  
  // Core state
  const [coins, setCoins] = useState(saved?.coins || 50);
  const [score, setScore] = useState(saved?.score || 0);
  const [gridSize, setGridSize] = useState(saved?.gridSize || MIN_SIZE);
  const [plots, setPlots] = useState(() => saved?.plots || makeGrid(MIN_SIZE));
  const [selectedSeed, setSelectedSeed] = useState("carrot");
  const [inventory, setInventory] = useState(saved?.inventory || {
    carrot: 5, potato: 3, corn: 2, tomato: 1,
    fertilizer: 2, pesticide: 2, wateringCan: 0
  });
  const [buildings, setBuildings] = useState(saved?.buildings || {});
  const [shopTab, setShopTab] = useState("seeds");
  const [notifications, setNotifications] = useState([]);
  const [weather, setWeather] = useState({ type: "Sunny", endsAt: nowSec() + 60 });
  const [level, setLevel] = useState(LEVELS[0]);
  const [paused, setPaused] = useState(false);
  
  // Add notification
  const addNotification = (msg, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Plant seed
  const plant = (plotIndex, seed) => {
    if (!DEFAULT_RULES.seeds[seed]) {
      addNotification("Invalid seed!", "error");
      return;
    }
    
    if ((inventory[seed] || 0) <= 0) {
      addNotification(`No ${seed} seeds!`, "error");
      return;
    }
    
    setPlots(prev => {
      const newPlots = [...prev];
      const plot = newPlots[plotIndex];
      if (plot.state !== "empty") return prev;
      
      newPlots[plotIndex] = {
        ...plot,
        state: "planted",
        seed: seed,
        growth: 0,
        plantedAt: nowSec()
      };
      
      setInventory(inv => ({...inv, [seed]: (inv[seed] || 0) - 1}));
      addNotification(`Planted ${seed}!`, "success");
      return newPlots;
    });
  };
  
  // Water plot
  const water = (plotIndex) => {
    setPlots(prev => {
      const newPlots = [...prev];
      const plot = newPlots[plotIndex];
      if (plot.state !== "planted" && plot.state !== "growing") return prev;
      
      newPlots[plotIndex] = {
        ...plot,
        state: "growing",
        watered: true,
        lastWateredAt: nowSec()
      };
      
      addNotification("Watered plot!", "success");
      return newPlots;
    });
  };
  
  // Harvest crop
  const harvest = (plotIndex) => {
    const plot = plots[plotIndex];
    if (plot.state !== "grown") return;
    
    const seed = plot.seed;
    const value = DEFAULT_RULES.seeds[seed]?.baseValue || 10;
    
    setCoins(c => c + value);
    setScore(s => s + value);
    
    setPlots(prev => {
      const newPlots = [...prev];
      newPlots[plotIndex] = newPlot("empty");
      return newPlots;
    });
    
    addNotification(`Harvested ${seed} for ${value} coins!`, "success");
  };
  
  // Clear withered plot
  const clearPlot = (plotIndex) => {
    setPlots(prev => {
      const newPlots = [...prev];
      if (newPlots[plotIndex].state !== "withered") return prev;
      newPlots[plotIndex] = newPlot("empty");
      addNotification("Cleared withered plot", "info");
      return newPlots;
    });
  };
  
  // Buy item
  const buy = (item, qty = 1) => {
    let price = 0;
    
    if (item in DEFAULT_RULES.seeds) {
      price = DEFAULT_RULES.seeds[item].shopPrice * qty;
    } else if (item === "fertilizer") {
      price = DEFAULT_RULES.fertilizer.shopPrice * qty;
    } else if (item === "pesticide") {
      price = DEFAULT_RULES.pesticide.shopPrice * qty;
    } else if (item === "wateringCan") {
      if (inventory.wateringCan > 0) {
        addNotification("Already have watering can!", "error");
        return;
      }
      price = DEFAULT_RULES.wateringCan.shopPrice;
    } else if (item in DEFAULT_RULES.buildings) {
      if (buildings[item]) {
        addNotification(`Already have ${item}!`, "error");
        return;
      }
      price = DEFAULT_RULES.buildings[item].price;
      
      if (coins < price) {
        addNotification("Not enough coins!", "error");
        return;
      }
      
      setCoins(c => c - price);
      setBuildings(prev => ({...prev, [item]: true}));
      addNotification(`Built ${DEFAULT_RULES.buildings[item].name}!`, "success");
      return;
    }
    
    if (coins < price) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(c => c - price);
    setInventory(prev => ({
      ...prev,
      [item]: (prev[item] || 0) + qty
    }));
    
    addNotification(`Bought ${qty}x ${item}!`, "success");
  };
  
  // Simple growth system
  useEffect(() => {
    if (paused) return;
    
    const interval = setInterval(() => {
      setPlots(prev => prev.map(plot => {
        if (plot.state === "growing" && plot.seed) {
          const seed = DEFAULT_RULES.seeds[plot.seed];
          if (!seed) return plot;
          
          const elapsed = nowSec() - (plot.plantedAt || nowSec());
          const totalTime = seed.stages * seed.secondsPerStage;
          
          if (elapsed >= totalTime) {
            return {...plot, state: "grown", growth: seed.stages};
          }
          
          const newGrowth = Math.floor(elapsed / seed.secondsPerStage);
          return {...plot, growth: newGrowth};
        }
        
        // Wither if not watered
        if (plot.state === "planted") {
          const elapsed = nowSec() - (plot.plantedAt || nowSec());
          if (elapsed > 30) {
            return {...plot, state: "withered"};
          }
        }
        
        return plot;
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [paused]);
  
  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      const snapshot = {
        version: 2,
        savedAt: Date.now(),
        coins, score, gridSize, plots, inventory, buildings
      };
      saveState(snapshot);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [coins, score, gridSize, plots, inventory, buildings]);
  
  // Plot Card Component
  const PlotCard = ({ plot, index }) => {
    const seed = plot.seed ? DEFAULT_RULES.seeds[plot.seed] : null;
    const emoji = seed?.emoji || "🌱";
    
    let bgClass = "bg-white";
    if (plot.state === "locked") bgClass = "bg-gray-200";
    else if (plot.state === "withered") bgClass = "bg-red-100";
    else if (plot.state === "grown") bgClass = "bg-green-100";
    else if (plot.state === "growing") bgClass = "bg-yellow-50";
    
    const handleClick = () => {
      if (plot.state === "locked") return;
      if (plot.state === "grown") return harvest(index);
      if (plot.state === "withered") return clearPlot(index);
      if (plot.state === "empty") return plant(index, selectedSeed);
      if (plot.state === "planted") return water(index);
    };
    
    return (
      <div
        onClick={handleClick}
        className={`${bgClass} border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all text-center`}
      >
        {plot.state === "locked" && "🔒"}
        {plot.state === "empty" && "📍"}
        {plot.state === "withered" && "💀"}
        {(plot.state === "planted" || plot.state === "growing" || plot.state === "grown") && (
          <div>
            <div className="text-2xl">{emoji}</div>
            <div className="text-xs mt-1">
              {plot.state === "grown" ? "Ready!" : `${plot.growth}/${seed?.stages || 0}`}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Badge variant="outline">🪙 {coins}</Badge>
              <Badge variant="outline">⭐ {score}</Badge>
              <Badge variant="outline">{weather.type}</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPaused(!paused)} size="sm">
                {paused ? "▶️ Resume" : "⏸️ Pause"}
              </Button>
              <Button onClick={() => {
                localStorage.removeItem(SAVE_KEY);
                window.location.reload();
              }} size="sm" variant="destructive">
                🔄 Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Farm Grid */}
        <Card>
          <CardHeader>
            <CardTitle>🌾 Your Farm</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {plots.map((plot, i) => (
                <PlotCard key={i} plot={plot} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Shop */}
        <Card>
          <CardHeader>
            <CardTitle>🏪 Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={shopTab} onValueChange={setShopTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="seeds">🌱 Seeds</TabsTrigger>
                <TabsTrigger value="tools">🛠️ Tools</TabsTrigger>
                <TabsTrigger value="buildings">🏗️ Buildings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="seeds" className="space-y-2">
                {Object.entries(DEFAULT_RULES.seeds).map(([seed, data]) => (
                  <Button
                    key={seed}
                    onClick={() => buy(seed, 1)}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={coins < data.shopPrice}
                  >
                    <span>{data.emoji} {seed} ({inventory[seed] || 0})</span>
                    <span>{data.shopPrice} 🪙</span>
                  </Button>
                ))}
              </TabsContent>
              
              <TabsContent value="tools" className="space-y-2">
                <Button
                  onClick={() => buy("fertilizer", 1)}
                  variant="outline"
                  className="w-full justify-between"
                  disabled={coins < DEFAULT_RULES.fertilizer.shopPrice}
                >
                  <span>🌿 Fertilizer ({inventory.fertilizer || 0})</span>
                  <span>{DEFAULT_RULES.fertilizer.shopPrice} 🪙</span>
                </Button>
                
                <Button
                  onClick={() => buy("pesticide", 1)}
                  variant="outline"
                  className="w-full justify-between"
                  disabled={coins < DEFAULT_RULES.pesticide.shopPrice}
                >
                  <span>🐛 Pesticide ({inventory.pesticide || 0})</span>
                  <span>{DEFAULT_RULES.pesticide.shopPrice} 🪙</span>
                </Button>
                
                {inventory.wateringCan === 0 && (
                  <Button
                    onClick={() => buy("wateringCan", 1)}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={coins < DEFAULT_RULES.wateringCan.shopPrice}
                  >
                    <span>🚿 Watering Can</span>
                    <span>{DEFAULT_RULES.wateringCan.shopPrice} 🪙</span>
                  </Button>
                )}
              </TabsContent>
              
              <TabsContent value="buildings" className="space-y-2">
                {Object.entries(DEFAULT_RULES.buildings).map(([building, data]) => (
                  <Button
                    key={building}
                    onClick={() => buy(building, 1)}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={coins < data.price || buildings[building]}
                  >
                    <span>{data.emoji} {data.name}</span>
                    <span>{buildings[building] ? "Owned" : `${data.price} 🪙`}</span>
                  </Button>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-sm">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-3 rounded-lg shadow-lg animate-pulse ${
              n.type === "error" ? "bg-red-100 text-red-800" :
              n.type === "success" ? "bg-green-100 text-green-800" :
              "bg-blue-100 text-blue-800"
            }`}
          >
            {n.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmSimCanvasFixed;