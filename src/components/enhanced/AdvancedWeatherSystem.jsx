import React, { useEffect, useState } from 'react';
import { 
  Sun, CloudRain, CloudSnow, Wind, Zap, CloudDrizzle, 
  Thermometer, Droplets, Eye, AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

/**
 * Advanced Weather System with Realistic Weather Patterns
 * Includes weather forecasting, seasonal changes, and climate effects
 */

const ADVANCED_WEATHER_TYPES = {
  sunny: {
    name: "Sunny",
    icon: Sun,
    emoji: "☀️",
    effects: {
      growthRate: 1.0,
      waterConsumption: 1.2,
      diseaseChance: 0.1,
      yieldBonus: 0.05
    },
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    description: "Perfect growing conditions with abundant sunlight"
  },
  partlyCloudy: {
    name: "Partly Cloudy",
    icon: Sun,
    emoji: "⛅",
    effects: {
      growthRate: 0.95,
      waterConsumption: 1.0,
      diseaseChance: 0.12,
      yieldBonus: 0.02
    },
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    description: "Mild conditions with some cloud cover"
  },
  cloudy: {
    name: "Cloudy",
    icon: CloudDrizzle,
    emoji: "☁️",
    effects: {
      growthRate: 0.9,
      waterConsumption: 0.8,
      diseaseChance: 0.15,
      yieldBonus: -0.05
    },
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    description: "Overcast skies reduce photosynthesis"
  },
  lightRain: {
    name: "Light Rain",
    icon: CloudDrizzle,
    emoji: "🌦️",
    effects: {
      growthRate: 1.1,
      waterConsumption: 0.5,
      diseaseChance: 0.25,
      yieldBonus: 0.1,
      autoWater: true
    },
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    description: "Gentle rain provides natural irrigation"
  },
  heavyRain: {
    name: "Heavy Rain",
    icon: CloudRain,
    emoji: "🌧️",
    effects: {
      growthRate: 0.8,
      waterConsumption: 0,
      diseaseChance: 0.4,
      yieldBonus: -0.1,
      autoWater: true,
      floodRisk: 0.1
    },
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    description: "Heavy rainfall may cause flooding and root rot"
  },
  thunderstorm: {
    name: "Thunderstorm",
    icon: Zap,
    emoji: "⛈️",
    effects: {
      growthRate: 0.6,
      waterConsumption: 0,
      diseaseChance: 0.5,
      yieldBonus: -0.2,
      autoWater: true,
      damageRisk: 0.15
    },
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Severe weather with lightning and strong winds"
  },
  drought: {
    name: "Drought",
    icon: Sun,
    emoji: "🏜️",
    effects: {
      growthRate: 0.5,
      waterConsumption: 2.0,
      diseaseChance: 0.05,
      yieldBonus: -0.4,
      witherRisk: 0.3
    },
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Extreme heat and water scarcity"
  },
  frost: {
    name: "Frost",
    icon: CloudSnow,
    emoji: "❄️",
    effects: {
      growthRate: 0.3,
      waterConsumption: 0.5,
      diseaseChance: 0.05,
      yieldBonus: -0.3,
      frostDamage: 0.2
    },
    color: "text-blue-300",
    bgColor: "bg-blue-50",
    description: "Freezing temperatures damage sensitive crops"
  },
  windy: {
    name: "Windy",
    icon: Wind,
    emoji: "💨",
    effects: {
      growthRate: 0.85,
      waterConsumption: 1.3,
      diseaseChance: 0.08,
      yieldBonus: -0.05,
      pollinationBonus: 0.2
    },
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Strong winds aid pollination but stress plants"
  },
  heatwave: {
    name: "Heatwave",
    icon: Thermometer,
    emoji: "🔥",
    effects: {
      growthRate: 0.4,
      waterConsumption: 2.5,
      diseaseChance: 0.3,
      yieldBonus: -0.5,
      heatStress: 0.4
    },
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Extreme heat causes severe plant stress"
  }
};

const SEASONAL_WEATHER_PATTERNS = {
  spring: {
    weights: {
      sunny: 0.3,
      partlyCloudy: 0.25,
      cloudy: 0.15,
      lightRain: 0.2,
      heavyRain: 0.05,
      thunderstorm: 0.03,
      windy: 0.02
    },
    temperatureRange: [15, 25],
    humidityRange: [60, 80]
  },
  summer: {
    weights: {
      sunny: 0.4,
      partlyCloudy: 0.2,
      cloudy: 0.1,
      lightRain: 0.1,
      heavyRain: 0.05,
      thunderstorm: 0.08,
      drought: 0.05,
      heatwave: 0.02
    },
    temperatureRange: [25, 35],
    humidityRange: [50, 70]
  },
  fall: {
    weights: {
      sunny: 0.25,
      partlyCloudy: 0.25,
      cloudy: 0.2,
      lightRain: 0.15,
      heavyRain: 0.08,
      windy: 0.05,
      frost: 0.02
    },
    temperatureRange: [10, 20],
    humidityRange: [65, 85]
  },
  winter: {
    weights: {
      cloudy: 0.3,
      partlyCloudy: 0.2,
      sunny: 0.15,
      lightRain: 0.1,
      heavyRain: 0.05,
      frost: 0.15,
      windy: 0.05
    },
    temperatureRange: [0, 15],
    humidityRange: [70, 90]
  }
};

export function AdvancedWeatherSystem({ 
  currentWeather, 
  onWeatherChange, 
  season = 'spring',
  forecastDays = 5 
}) {
  const [forecast, setForecast] = useState([]);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [climateData, setClimateData] = useState({
    temperature: 20,
    humidity: 65,
    pressure: 1013,
    windSpeed: 10
  });

  // Generate realistic weather forecast
  const generateForecast = (currentSeason, days) => {
    const pattern = SEASONAL_WEATHER_PATTERNS[currentSeason];
    const newForecast = [];
    
    for (let i = 0; i < days; i++) {
      // Use weighted random selection based on season
      const random = Math.random();
      let cumulative = 0;
      let selectedWeather = 'sunny';
      
      for (const [weather, weight] of Object.entries(pattern.weights)) {
        cumulative += weight;
        if (random <= cumulative) {
          selectedWeather = weather;
          break;
        }
      }
      
      // Generate climate data
      const tempRange = pattern.temperatureRange;
      const humidRange = pattern.humidityRange;
      
      newForecast.push({
        day: i + 1,
        weather: selectedWeather,
        temperature: Math.round(tempRange[0] + Math.random() * (tempRange[1] - tempRange[0])),
        humidity: Math.round(humidRange[0] + Math.random() * (humidRange[1] - humidRange[0])),
        chanceOfRain: selectedWeather.includes('rain') || selectedWeather === 'thunderstorm' ? 
          Math.round(60 + Math.random() * 40) : Math.round(Math.random() * 30),
        windSpeed: Math.round(5 + Math.random() * 20)
      });
    }
    
    return newForecast;
  };

  useEffect(() => {
    setForecast(generateForecast(season, forecastDays));
  }, [season, forecastDays]);

  // Update weather history
  useEffect(() => {
    if (currentWeather) {
      setWeatherHistory(prev => {
        const newHistory = [...prev, {
          weather: currentWeather,
          timestamp: Date.now(),
          ...climateData
        }];
        return newHistory.slice(-24); // Keep last 24 weather changes
      });
    }
  }, [currentWeather, climateData]);

  const getCurrentWeatherData = () => {
    return ADVANCED_WEATHER_TYPES[currentWeather] || ADVANCED_WEATHER_TYPES.sunny;
  };

  const getWeatherIcon = (weatherType) => {
    const weatherData = ADVANCED_WEATHER_TYPES[weatherType];
    const IconComponent = weatherData?.icon || Sun;
    return <IconComponent className="w-6 h-6" />;
  };

  const getWeatherSeverity = (weatherType) => {
    const dangerous = ['thunderstorm', 'drought', 'heatwave', 'frost'];
    const warning = ['heavyRain', 'windy'];
    
    if (dangerous.includes(weatherType)) return 'danger';
    if (warning.includes(weatherType)) return 'warning';
    return 'normal';
  };

  const currentWeatherData = getCurrentWeatherData();
  const severity = getWeatherSeverity(currentWeather);

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <Card className={`${currentWeatherData.bgColor} border-2 ${
        severity === 'danger' ? 'border-red-500' : 
        severity === 'warning' ? 'border-yellow-500' : 
        'border-gray-200'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white shadow-md ${currentWeatherData.color}`}>
              {getWeatherIcon(currentWeather)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentWeatherData.emoji}</span>
                <span>{currentWeatherData.name}</span>
                {severity !== 'normal' && (
                  <AlertTriangle className={`w-5 h-5 ${
                    severity === 'danger' ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {currentWeatherData.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-500" />
              <div className="text-lg font-bold">{climateData.temperature}°C</div>
              <div className="text-xs text-gray-500">Temperature</div>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-bold">{climateData.humidity}%</div>
              <div className="text-xs text-gray-500">Humidity</div>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <div className="text-lg font-bold">{climateData.windSpeed} km/h</div>
              <div className="text-xs text-gray-500">Wind Speed</div>
            </div>
            <div className="text-center">
              <Eye className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <div className="text-lg font-bold">{climateData.pressure} hPa</div>
              <div className="text-xs text-gray-500">Pressure</div>
            </div>
          </div>

          {/* Weather Effects */}
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Farming Effects:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                Growth Rate: 
                <Badge variant={currentWeatherData.effects.growthRate >= 1 ? "default" : "secondary"} className="ml-1">
                  {(currentWeatherData.effects.growthRate * 100).toFixed(0)}%
                </Badge>
              </div>
              <div>
                Water Usage: 
                <Badge variant={currentWeatherData.effects.waterConsumption <= 1 ? "default" : "secondary"} className="ml-1">
                  {(currentWeatherData.effects.waterConsumption * 100).toFixed(0)}%
                </Badge>
              </div>
              <div>
                Disease Risk: 
                <Badge variant={currentWeatherData.effects.diseaseChance <= 0.2 ? "default" : "secondary"} className="ml-1">
                  {(currentWeatherData.effects.diseaseChance * 100).toFixed(0)}%
                </Badge>
              </div>
              <div>
                Yield Bonus: 
                <Badge variant={currentWeatherData.effects.yieldBonus >= 0 ? "default" : "secondary"} className="ml-1">
                  {currentWeatherData.effects.yieldBonus >= 0 ? '+' : ''}{(currentWeatherData.effects.yieldBonus * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {forecast.map((day, index) => {
              const dayWeather = ADVANCED_WEATHER_TYPES[day.weather];
              return (
                <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    {index === 0 ? 'Today' : `Day ${day.day}`}
                  </div>
                  <div className={`mb-2 ${dayWeather.color}`}>
                    {getWeatherIcon(day.weather)}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">{day.temperature}°C</div>
                    <div className="text-gray-500">{day.chanceOfRain}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Climate Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Climate Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Seasonal Progress</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">
                  {weatherHistory.filter(h => h.weather.includes('rain')).length}
                </div>
                <div className="text-gray-500">Rainy Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-500">
                  {weatherHistory.filter(h => h.weather === 'sunny').length}
                </div>
                <div className="text-gray-500">Sunny Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-500">
                  {weatherHistory.filter(h => ['drought', 'heatwave', 'thunderstorm'].includes(h.weather)).length}
                </div>
                <div className="text-gray-500">Severe Weather</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ADVANCED_WEATHER_TYPES, SEASONAL_WEATHER_PATTERNS };
export default AdvancedWeatherSystem;
