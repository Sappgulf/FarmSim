/**
 * WeatherPrediction Component
 * Mini-game for predicting tomorrow's weather
 */
import React, { memo, useState, useCallback } from 'react';
import { CloudSun, Check, X, HelpCircle, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { WEATHER_TYPES } from '../../data/constants';

function WeatherPredictionComponent({
  isOpen,
  onClose,
  currentWeather,
  weatherHistory = [],
  onSubmitPrediction,
}) {
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Weather options for prediction
  const weatherOptions = ['sunny', 'cloudy', 'rainy', 'stormy', 'windy'];

  // Analyze patterns for hints
  const getHint = useCallback(() => {
    if (weatherHistory.length < 2) {
      return 'Not enough weather data yet. Keep farming!';
    }

    const recentWeather = weatherHistory.slice(-3).map((h) => h.weather);

    // Pattern-based hints
    if (recentWeather.every((w) => w === 'sunny')) {
      return 'Extended sunny periods often lead to clouds or heat waves...';
    }
    if (recentWeather.includes('cloudy') && recentWeather.includes('windy')) {
      return 'Clouds and wind together often signal incoming rain...';
    }
    if (recentWeather.filter((w) => w === 'rainy').length >= 2) {
      return 'The rain seems to be clearing up soon!';
    }

    return 'Weather patterns can be unpredictable. Trust your instincts!';
  }, [weatherHistory]);

  // Handle prediction submission
  const handleSubmit = useCallback(() => {
    if (!selectedWeather) return;

    const predictionResult = onSubmitPrediction?.(selectedWeather);

    if (predictionResult) {
      setResult(predictionResult);
    }
  }, [selectedWeather, onSubmitPrediction]);

  // Reset for new prediction
  const handlePlayAgain = useCallback(() => {
    setSelectedWeather(null);
    setResult(null);
    setShowHint(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="max-w-md w-full animate-slide-down">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CloudSun size={24} className="text-blue-500" />
              Weather Prediction
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current conditions */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm text-blue-700 mb-2">Current Weather</div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{WEATHER_TYPES[currentWeather]?.emoji || '☀️'}</span>
              <div>
                <div className="font-semibold">
                  {WEATHER_TYPES[currentWeather]?.name || 'Unknown'}
                </div>
                <div className="text-xs text-blue-600">
                  {WEATHER_TYPES[currentWeather]?.effect || ''}
                </div>
              </div>
            </div>
          </div>

          {!result ? (
            <>
              {/* Weather history */}
              {weatherHistory.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Recent History</div>
                  <div className="flex gap-2">
                    {weatherHistory.slice(-5).map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center p-2 bg-gray-50 rounded-lg"
                        title={WEATHER_TYPES[h.weather]?.name}
                      >
                        <span className="text-xl">{WEATHER_TYPES[h.weather]?.emoji || '❓'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint */}
              {showHint && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-sm text-amber-800">
                  <HelpCircle size={14} className="inline mr-1" />
                  {getHint()}
                </div>
              )}

              {/* Prediction selection */}
              <div>
                <div className="text-sm text-gray-700 mb-2 font-medium">
                  Predict tomorrow's weather:
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {weatherOptions.map((weather) => {
                    const data = WEATHER_TYPES[weather];
                    const isSelected = selectedWeather === weather;

                    return (
                      <button
                        key={weather}
                        onClick={() => setSelectedWeather(weather)}
                        className={`
                          p-3 rounded-xl border-2 transition-all
                          flex flex-col items-center gap-1
                          ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="text-2xl">{data?.emoji || '❓'}</span>
                        <span className="text-[10px] text-gray-600">{data?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="flex-1"
                >
                  <HelpCircle size={14} className="mr-1" />
                  {showHint ? 'Hide' : 'Show'} Hint
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!selectedWeather}
                  className="flex-1"
                >
                  Submit Prediction
                </Button>
              </div>

              {/* Reward info */}
              <div className="text-center text-xs text-gray-500">
                Correct prediction: +50🪙 • Partial: +20🪙
              </div>
            </>
          ) : (
            /* Result screen */
            <div className="text-center py-4">
              <div
                className={`
                w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4
                ${result.correct ? 'bg-green-100' : 'bg-orange-100'}
              `}
              >
                {result.correct ? (
                  <Check size={32} className="text-green-600" />
                ) : (
                  <X size={32} className="text-orange-600" />
                )}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${result.correct ? 'text-green-700' : 'text-orange-700'}`}
              >
                {result.correct ? 'Correct!' : 'Not quite!'}
              </h3>

              <p className="text-gray-600 mb-4">
                {result.correct
                  ? 'Your weather intuition is impressive!'
                  : `The actual weather was ${WEATHER_TYPES[currentWeather]?.name || 'unknown'}`}
              </p>

              {result.reward > 0 && (
                <Badge className="bg-amber-100 text-amber-700 text-lg py-1 px-3 mb-4">
                  <Award size={16} className="inline mr-1" />+{result.reward}🪙
                </Badge>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={handlePlayAgain} className="flex-1">
                  Predict Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const WeatherPrediction = memo(WeatherPredictionComponent);
