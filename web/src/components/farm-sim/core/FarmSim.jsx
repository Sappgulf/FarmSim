import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import {
  GameProvider,
  useGameActions,
  useGameSelector,
  useGameStore,
} from '../context/GameContext';
import { TickProvider } from '../context/TickContext';

// Import modular components
import GameHeader from '../ui/GameHeader';
import FarmGrid from '../ui/FarmGrid';
import GameSidebar from '../ui/GameSidebar';
import NavBar from '../ui/NavBar';
import NotificationSystem from '../ui/NotificationSystem';
import SwUpdateBanner from '../ui/SwUpdateBanner';
import { ParticleEffectsManager } from '../ui/ParticleEffect';
import FarmRhythmPanel from '../ui/FarmRhythmPanel';
const FPSCounter = lazy(() => import('../ui/FPSCounter'));
const PerfHud = lazy(() => import('../ui/PerfHud'));
const Tutorial = lazy(() => import('../ui/Tutorial'));
const WhatsNewModal = lazy(() => import('../ui/WhatsNewModal'));
const PremiumLockModal = lazy(() => import('../ui/PremiumLockModal'));
const WeatherEffects = lazy(() => import('../ui/WeatherEffects'));
import { getFarmTheme, getFarmThemeVars } from '../../../data/farmThemes';
import { isDevelopmentMode, shouldShowDebugTools } from '../../../config/release';
import { TIME_OF_DAY_VISUALS } from '../../../data/cozyExpansion';

// Import systems
import { FarmingSystem } from '../systems/FarmingSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { EconomicSystem } from '../systems/EconomicSystem';
import { AchievementSystem } from '../systems/AchievementSystem';
import { DiseaseSystem } from '../systems/DiseaseSystem';
import { DisasterSystem } from '../systems/DisasterSystem';
import { SeasonSystem } from '../systems/SeasonSystem';
import { LivestockSystem } from '../systems/LivestockSystem';
import { FishingSystem } from '../systems/FishingSystem';
import { getSoundSystem } from '../systems/SoundSystem';
import { getMusicSystem } from '../systems/MusicSystem';
import { DEFAULT_ACTIVE_TAB, useFarmNavigation } from './useFarmNavigation';
import { useFarmAudioLifecycle } from './useFarmAudioLifecycle';
import { useSeasonTransitionEffect } from './useSeasonTransitionEffect';
import { useTimeOfDayVisualState } from './useTimeOfDayVisualState';
import { useVisualWeatherRotation } from './useVisualWeatherRotation';
import { createLogger } from '../../../utils/logger';

const log = createLogger('FarmSimCore');

const PerformanceOverlay = lazy(() => import('../ui/PerformanceOverlay'));
const DebugStressPanel = lazy(() => import('../ui/DebugStressPanel'));
const QAModePanel = lazy(() => import('../ui/QAModePanel'));

/**
 * Main FarmSim Component (Orchestrator)
 * Manages game systems, update loops, and initialization
 * @returns {JSX.Element} The main game component
 */
export function FarmSimCore() {
  const actions = useGameActions();
  const store = useGameStore();
  const paused = useGameSelector((state) => Boolean(state.gameLoop?.paused));
  const musicEnabled = useGameSelector((state) => state.settings?.musicEnabled !== false);
  const soundEnabled = useGameSelector((state) => state.settings?.soundEnabled !== false);
  const reducedMotionEnabled = useGameSelector((state) => state.settings?.reducedMotion === true);
  const particleEffectsEnabled = useGameSelector(
    (state) => state.settings?.particleEffects !== false
  );
  const seasonCurrent = useGameSelector((state) => state.season?.current || 'spring');
  const seasonConfig = useGameSelector((state) => state.season?.config || null);
  const cozyVisualWeather = useGameSelector(
    (state) => state.cozyExpansion?.visualState?.weather || null
  );
  const hasCozyVisualWeather = useGameSelector((state) =>
    Boolean(state.cozyExpansion?.visualState?.weather)
  );
  const dayCount = useGameSelector((state) => state.almanac?.counters?.dayCount || 0);
  const farmThemeId = useGameSelector((state) => state.farmTheme || null);
  const weather = useGameSelector((state) => state.weather || 'sunny');
  const ghostVisitActive = useGameSelector((state) => Boolean(state.ghostVisit?.active));
  const isFirstRunMode = useGameSelector((state) => {
    return !state.onboardingSeen && !state.onboardingSkipped && (state.onboardingStep || 0) === 0;
  });

  const debugToolsAllowed = shouldShowDebugTools();
  const debugQueryEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debug') === '1';
  }, []);

  const { activeTab, activeSection, handleSectionChange, handleTabChange } = useFarmNavigation({
    actions,
  });
  const timePeriod = useTimeOfDayVisualState(actions);

  // Initialize systems ONCE - don't recreate on state changes!
  // We pass current state to update() method, so no need to recreate
  const farmingSystem = useMemo(() => {
    const system = new FarmingSystem(null, actions);
    if (isDevelopmentMode()) {
      log.debug('FarmingSystem initialized');
    }
    return system;
  }, [actions]);

  const weatherSystem = useMemo(() => new WeatherSystem(null, actions), [actions]);

  const economicSystem = useMemo(() => new EconomicSystem(null, actions), [actions]);

  const diseaseSystem = useMemo(() => new DiseaseSystem(null, actions), [actions]);

  const disasterSystem = useMemo(() => new DisasterSystem(null, actions), [actions]);

  const achievementSystem = useMemo(() => new AchievementSystem(null, actions), [actions]);

  const seasonSystem = useMemo(() => new SeasonSystem(null, actions), [actions]);

  const livestockSystem = useMemo(() => {
    const system = new LivestockSystem(null, actions);
    if (isDevelopmentMode()) {
      log.debug('LivestockSystem initialized');
    }
    return system;
  }, [actions]);

  const fishingSystem = useMemo(() => {
    const system = new FishingSystem(null, actions);
    if (isDevelopmentMode()) {
      log.debug('FishingSystem initialized');
    }
    return system;
  }, [actions]);

  const soundSystem = useMemo(() => getSoundSystem(), []);

  const musicSystem = useMemo(() => getMusicSystem(), []);

  useFarmAudioLifecycle({
    soundSystem,
    musicSystem,
    soundEnabled,
    musicEnabled,
    seasonCurrent,
  });
  useSeasonTransitionEffect();
  useVisualWeatherRotation({ actions, dayCount, hasCozyVisualWeather });

  // Update context with systems - only when systems actually change
  // Use ref to track previous systems to avoid unnecessary updates
  const systemsRef = React.useRef({});
  const actionsRef = React.useRef(actions);

  // Keep actions ref updated (actions object should be stable, but ref adds safety)
  React.useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  React.useEffect(() => {
    const newSystems = {
      farmingSystem,
      livestockSystem,
      fishingSystem,
      soundSystem,
      musicSystem,
    };

    // Only update if systems actually changed (by reference)
    const systemsChanged =
      systemsRef.current.farmingSystem !== farmingSystem ||
      systemsRef.current.livestockSystem !== livestockSystem ||
      systemsRef.current.fishingSystem !== fishingSystem ||
      systemsRef.current.soundSystem !== soundSystem ||
      systemsRef.current.musicSystem !== musicSystem;

    if (systemsChanged) {
      systemsRef.current = newSystems;
      // Use ref to avoid dependency on actions
      actionsRef.current.setSystems(newSystems);
    }
    // Removed actions from dependencies - using ref instead to prevent infinite loop
  }, [farmingSystem, livestockSystem, fishingSystem, soundSystem, musicSystem]);

  // System update loop - Optimized with requestAnimationFrame for better timing
  useEffect(() => {
    if (paused) return;

    let lastUpdateTime = performance.now();
    const targetFPS = 10; // 10 FPS = 100ms per frame
    const targetFrameTime = 1000 / targetFPS; // 100ms

    let animationFrameId = null;

    const systemUpdateLoop = (currentTime) => {
      const currentState = store.getState();

      if (currentState.gameLoop.paused) {
        return;
      }

      // Throttle to target FPS (10 FPS)
      const deltaTime = currentTime - lastUpdateTime;
      if (deltaTime >= targetFrameTime) {
        // PERF: Measure update time
        const updateStart = performance.now();

        // Batch all system updates in a single frame
        // Order matters: dependencies first, dependents last
        seasonSystem.update(currentState);
        weatherSystem.update(currentState);
        farmingSystem.update(currentState);
        livestockSystem.update(currentState);
        fishingSystem.update(currentState);
        economicSystem.update(currentState);
        achievementSystem.update(currentState);
        diseaseSystem.update(currentState);
        disasterSystem.update(currentState);

        // PERF: Record update time for overlay
        window.__lastUpdateTime = performance.now() - updateStart;
        if (isDevelopmentMode()) {
          window.__farmPerf = window.__farmPerf || { loops: 0, maxUpdateMs: 0 };
          window.__farmPerf.loops += 1;
          window.__farmPerf.maxUpdateMs = Math.max(
            window.__farmPerf.maxUpdateMs,
            window.__lastUpdateTime
          );
        }

        lastUpdateTime = currentTime - (deltaTime % targetFrameTime); // Maintain frame timing
      }

      // Continue loop
      animationFrameId = requestAnimationFrame(systemUpdateLoop);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(systemUpdateLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    paused,
    store,
    seasonSystem,
    farmingSystem,
    weatherSystem,
    economicSystem,
    achievementSystem,
    diseaseSystem,
    disasterSystem,
    livestockSystem,
    fishingSystem,
  ]);

  // Get season colors for theming
  const seasonColors = seasonConfig?.colors || {
    primary: 'from-green-50 to-blue-50',
  };

  const focusGameplayArea = React.useCallback(() => {
    const gameplayArea = document.getElementById('farm-main-content');
    if (!gameplayArea) return;

    gameplayArea.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    const focusTarget =
      gameplayArea.querySelector(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || gameplayArea;
    if (typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
  }, []);

  const activeTheme = getFarmTheme(farmThemeId);
  const themeVars = getFarmThemeVars(activeTheme);
  const playfieldFirst = activeTab === DEFAULT_ACTIVE_TAB;
  const playfieldOrderClass = playfieldFirst ? 'order-1' : 'order-2';
  const toolsOrderClass = playfieldFirst ? 'order-2' : 'order-1';

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${seasonColors.primary} transition-colors duration-1000 flex flex-col relative overflow-hidden`}
      data-farm-theme={activeTheme.id}
      style={{ ...themeVars, filter: TIME_OF_DAY_VISUALS[timePeriod]?.filter || 'none' }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-colors duration-700"
        style={{ backgroundColor: TIME_OF_DAY_VISUALS[timePeriod]?.tint || 'transparent' }}
      />
      {!reducedMotionEnabled && timePeriod === 'morning' && (
        <div className="ambient-vfx ambient-vfx--dawn" aria-hidden="true" />
      )}
      {!reducedMotionEnabled && timePeriod === 'night' && (
        <div className="ambient-vfx ambient-vfx--night" aria-hidden="true" />
      )}
      <Suspense fallback={null}>
        <WeatherEffects weather={cozyVisualWeather || weather} intensity={0.45} />
      </Suspense>

      {/* Game Header */}
      <div className="relative z-20">
        <GameHeader onFocusGameplay={focusGameplayArea} />
      </div>

      {ghostVisitActive && (
        <div className="relative z-30 mx-2 sm:mx-4 mt-2 max-w-7xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] lg:mx-auto rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800">
          👻 Ghost Visit (Read Only) — actions are disabled until you exit in Social.
        </div>
      )}

      {/* Main Game Area - Mobile Optimized with bottom padding for NavBar */}
      <main
        id="farm-main-content"
        tabIndex={-1}
        className="relative z-20 flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4 max-w-7xl mx-auto w-full pb-24 lg:pb-4"
        aria-label="Farm gameplay and controls"
      >
        {/* Farm Grid - Full width on mobile, larger on desktop */}
        <div
          className={`w-full lg:flex-1 ${playfieldOrderClass} lg:order-1`}
          role="region"
          aria-label="Farm playfield"
          data-shell-region="playfield"
          data-mobile-priority={playfieldFirst ? 'primary' : 'support'}
        >
          <FarmRhythmPanel onNavigate={handleTabChange} />
          <FarmGrid />
        </div>

        {/* Game Sidebar - Shows tabs for active section */}
        <div
          className={`w-full lg:w-80 xl:w-96 ${toolsOrderClass} lg:order-2`}
          role="complementary"
          aria-label="Farm tools"
          data-shell-region="tools"
          data-mobile-priority={playfieldFirst ? 'support' : 'primary'}
        >
          <GameSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </main>

      {/* Bottom Navigation Bar - Fixed on mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative z-40">
        <NavBar
          activeSection={activeSection}
          activeTab={activeTab}
          isFirstRunMode={isFirstRunMode}
          onSectionChange={handleSectionChange}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Notification System - Mobile positioned above NavBar */}
      <NotificationSystem />

      <SwUpdateBanner />

      {/* Particle Effects System */}
      <ParticleEffectsManager
        reducedMotion={reducedMotionEnabled}
        particleEffectsEnabled={particleEffectsEnabled}
      />

      <Suspense fallback={null}>
        {/* FPS Overlay */}
        <FPSCounter />
        <PerfHud />

        {/* Onboarding Tutorial (auto-shows for new players) */}
        <Tutorial />

        {/* What's New modal (once per app version) */}
        <WhatsNewModal />

        {/* Premium lock modal (premium mode only) */}
        <PremiumLockModal />
      </Suspense>

      {debugToolsAllowed && (
        <Suspense fallback={null}>
          {/* Performance Overlay (dev, toggle with `) */}
          <PerformanceOverlay />

          {/* Debug Stress Panel (?debug=1) */}
          {debugQueryEnabled ? <DebugStressPanel /> : null}

          {/* QA Mode Panel (?debug=1) */}
          {debugQueryEnabled ? <QAModePanel /> : null}
        </Suspense>
      )}
    </div>
  );
}

// Main export with context provider
export default function FarmSim() {
  return (
    <GameProvider>
      <TickProvider>
        <FarmSimCore />
      </TickProvider>
    </GameProvider>
  );
}
