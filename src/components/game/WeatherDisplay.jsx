import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CloudRain, Sun, Cloud, CloudLightning, Wind } from 'lucide-react';

/**
 * Weather Display Component
 * Shows current weather, forecast, and weather effects
 */
export function WeatherDisplay({ 
  weather, 
  weatherForecast, 
  weatherEvents, 
  currentTime,
  onForceWeatherChange 
}) {
  const getWeatherIcon = (weatherType) => {
    switch (weatherType) {
      case 'rainy': return <CloudRain className="w-5 h-5" />;
      case 'sunny': return <Sun className="w-5 h-5" />;
      case 'cloudy': return <Cloud className="w-5 h-5" />;
      case 'stormy': return <CloudLightning className="w-5 h-5" />;
      case 'drought': return <Wind className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  const getWeatherColor = (weatherType) => {
    switch (weatherType) {
      case 'rainy': return 'text-blue-600';
      case 'sunny': return 'text-yellow-600';
      case 'cloudy': return 'text-gray-600';
      case 'stormy': return 'text-purple-600';
      case 'drought': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const timeRemaining = Math.max(0, weather.endsAt - currentTime);
  const timeRemainingPercent = ((weather.endsAt - weather.startTime) > 0) ? 
    ((timeRemaining / (weather.endsAt - weather.startTime)) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌤️ Weather System
          <Badge variant="outline">{weatherEvents} events survived</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Weather */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={getWeatherColor(weather.type)}>
                {getWeatherIcon(weather.type)}
              </span>
              <span className="font-semibold capitalize">{weather.type}</span>
              <Badge variant="outline">
                Intensity: {Math.floor(weather.intensity * 100)}%
              </Badge>
            </div>
            <button
              onClick={onForceWeatherChange}
              className="text-xs text-blue-600 hover:text-blue-800"
              title="Force weather change (debug)"
            >
              Change Weather
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time Remaining:</span>
              <span>{Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s</span>
            </div>
            <Progress value={100 - timeRemainingPercent} className="h-2" />
          </div>
        </div>

        {/* Weather Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">Growth Effect</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {weather.type === 'rainy' && '⬆️'}
                {weather.type === 'sunny' && '➡️'}
                {weather.type === 'cloudy' && '⬇️'}
                {weather.type === 'stormy' && '⬇️'}
                {weather.type === 'drought' && '⬇️'}
              </span>
              <span className="text-sm">
                {weather.type === 'rainy' && '+30% faster growth'}
                {weather.type === 'sunny' && 'Normal growth rate'}
                {weather.type === 'cloudy' && '-20% growth speed'}
                {weather.type === 'stormy' && '-40% growth speed'}
                {weather.type === 'drought' && '-50% growth speed'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">Special Effects</h4>
            <div className="text-sm">
              {weather.type === 'rainy' && '💧 Auto-watering crops'}
              {weather.type === 'sunny' && '☀️ Perfect conditions'}
              {weather.type === 'cloudy' && '☁️ Reduced sunlight'}
              {weather.type === 'stormy' && '⛈️ Risk of crop damage'}
              {weather.type === 'drought' && '🌵 Crops need extra water'}
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        {weatherForecast.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">📅 5-Day Forecast</h4>
            <div className="grid grid-cols-5 gap-2">
              {weatherForecast.map((day, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600 mb-1">Day {day.day}</div>
                  <div className={`mb-1 ${getWeatherColor(day.weather)}`}>
                    {getWeatherIcon(day.weather)}
                  </div>
                  <div className="text-xs">
                    <div>{day.temperature}°C</div>
                    <div>{day.precipitation}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
