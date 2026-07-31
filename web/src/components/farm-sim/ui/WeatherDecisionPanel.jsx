import React, { memo, useMemo } from 'react';
import { Bug, CloudRain, Droplets, ShieldCheck, Sprout } from 'lucide-react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { getWeatherMeta } from '../constants/weatherData';

const PLAN_BY_WEATHER = {
  stormy: {
    key: 'protect',
    title: 'Storm front',
    detail: 'Brace the field to reduce damage from the next gust.',
    action: 'Brace the field',
    icon: ShieldCheck,
    tone: 'storm',
  },
  drought: {
    key: 'water',
    title: 'Dry spell',
    detail: 'Deep-water active plots and slow the next water drain.',
    action: 'Deep-water plots',
    icon: Droplets,
    tone: 'dry',
  },
  rainy: {
    key: 'scout',
    title: 'Rain window',
    detail: 'Scout now to keep the next disease check quieter.',
    action: 'Scout for disease',
    icon: Bug,
    tone: 'rain',
  },
  snow: {
    key: 'protect',
    title: 'Cold watch',
    detail: 'Protect the beds while growth slows in the cold.',
    action: 'Protect the beds',
    icon: ShieldCheck,
    tone: 'cold',
  },
  windy: {
    key: 'protect',
    title: 'Windy morning',
    detail: 'Secure the field before wind stress reaches the crops.',
    action: 'Secure the field',
    icon: ShieldCheck,
    tone: 'wind',
  },
  sunny: {
    key: 'tend',
    title: 'Good growing light',
    detail: 'Tend the beds and keep the next planting cycle steady.',
    action: 'Tend the beds',
    icon: Sprout,
    tone: 'sunny',
  },
  cloudy: {
    key: 'tend',
    title: 'Soft light',
    detail: 'A calm day for tending soil and checking young crops.',
    action: 'Tend the beds',
    icon: CloudRain,
    tone: 'cloudy',
  },
};

const FALLBACK_PLAN = PLAN_BY_WEATHER.sunny;

const WeatherDecisionPanel = memo(() => {
  const actions = useGameActions();
  const weather = useGameSelector((state) => state.weather || 'sunny');
  const weatherPlan = useGameSelector((state) => state.weatherPlan || 'observe');
  const weatherPlanTarget = useGameSelector((state) => state.weatherPlanTarget || null);
  const weatherPlansLanded = useGameSelector((state) => state.weatherPlanHistory?.length || 0);
  const weatherForecast = useGameSelector((state) => state.weatherForecast);
  const growingCount = useGameSelector(
    (state) =>
      (Array.isArray(state.plots) ? state.plots : []).filter(
        (plot) => plot?.state === 'growing' || plot?.state === 'planted'
      ).length
  );
  const diseasedCount = useGameSelector(
    (state) =>
      (Array.isArray(state.plots) ? state.plots : []).filter((plot) => Boolean(plot?.disease))
        .length
  );

  const plan = PLAN_BY_WEATHER[weather] || FALLBACK_PLAN;
  const WeatherIcon = plan.icon;
  const forecast = useMemo(
    () => (Array.isArray(weatherForecast) ? weatherForecast.slice(0, 2) : []),
    [weatherForecast]
  );
  const forecastText = useMemo(
    () => forecast.map((item) => getWeatherMeta(item?.type || 'sunny').label).join(' · '),
    [forecast]
  );
  const forecastWeather = forecast[0]?.type || weather;
  const targetWeather = forecastWeather || weather;
  const targetPlan = PLAN_BY_WEATHER[targetWeather] || FALLBACK_PLAN;
  const TargetWeatherIcon = targetPlan.icon;
  const targetIsCurrent = targetWeather === weather;
  const isQueued = weatherPlanTarget?.weather === targetWeather && weatherPlan === targetPlan.key;
  const isActive = !weatherPlanTarget && targetIsCurrent && weatherPlan === targetPlan.key;

  return (
    <section
      className={`weather-decision-panel weather-decision-panel--${plan.tone}`}
      aria-label="Field plan"
      data-onboard="weather-plan"
    >
      <div className="weather-decision-panel__copy">
        <div className="weather-decision-panel__eyebrow">
          <span className="weather-decision-panel__icon" aria-hidden="true">
            <WeatherIcon size={17} strokeWidth={2.2} />
          </span>
          <span>Field plan</span>
        </div>
        <h3>{targetIsCurrent ? plan.title : `Next: ${targetPlan.title}`}</h3>
        <p>
          {targetIsCurrent
            ? plan.detail
            : `Prepare now for ${getWeatherMeta(targetWeather).label.toLowerCase()}: ${targetPlan.detail.toLowerCase()}`}
        </p>
        {forecastText && (
          <span className="weather-decision-panel__forecast">Next: {forecastText}</span>
        )}
        {weatherPlansLanded > 0 && (
          <span className="weather-decision-panel__streak">
            {weatherPlansLanded} forecast beat{weatherPlansLanded === 1 ? '' : 's'} handled
          </span>
        )}
      </div>

      <div className="weather-decision-panel__actions">
        <button
          type="button"
          className="weather-decision-panel__button"
          onClick={() => actions.prepareWeatherPlan?.(targetWeather)}
        >
          <TargetWeatherIcon size={16} aria-hidden="true" />
          {isQueued ? 'Plan queued' : isActive ? 'Plan active' : targetPlan.action}
        </button>
        {growingCount > 0 && (
          <button
            type="button"
            className="weather-decision-panel__secondary"
            data-onboard="field-care"
            onClick={() => actions.waterAllPlots?.()}
          >
            <Droplets size={15} aria-hidden="true" />
            Water all beds
          </button>
        )}
        {diseasedCount > 0 && (
          <button
            type="button"
            className="weather-decision-panel__secondary"
            onClick={() => actions.treatAllDiseases?.()}
          >
            <Bug size={15} aria-hidden="true" />
            Treat {diseasedCount} infected
          </button>
        )}
      </div>
    </section>
  );
});

WeatherDecisionPanel.displayName = 'WeatherDecisionPanel';

export default WeatherDecisionPanel;
