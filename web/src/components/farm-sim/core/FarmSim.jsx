import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { GameProvider, useGameActions, useGameSelector, useGameStore } from '../context/GameContext';
import { TickProvider } from '../context/TickContext';

// Import modular components
import GameHeader from '../ui/GameHeader';
import FarmGrid from '../ui/FarmGrid';
import GameSidebar from '../ui/GameSidebar';
import NavBar, { NAV_SECTIONS } from '../ui/NavBar';
import NotificationSystem from '../ui/NotificationSystem';
import { ParticleEffectsManager } from '../ui/ParticleEffect';
import FPSCounter from '../ui/FPSCounter';
import PerfHud from '../ui/PerfHud';
import Tutorial from '../ui/Tutorial';
import WhatsNewModal from '../ui/WhatsNewModal';
import PremiumLockModal from '../ui/PremiumLockModal';
import LevelUpModal from '../ui/LevelUpModal';
import AchievementUnlockModal from '../ui/AchievementUnlockModal';
import WeatherEffects from '../ui/WeatherEffects';
import { StartScreen, START_SCREEN_STORAGE_KEY } from '../ui/StartScreen';
import { logDebugAction } from '../../../utils/debugTools';
import { getFarmTheme, getFarmThemeVars } from '../../../data/farmThemes';
import { isDevelopmentMode, shouldShowDebugTools } from '../../../config/release';
import { TIME_OF_DAY_VISUALS, VISUAL_WEATHER_ROTATION } from '../../../data/cozyExpansion';
import { getDayKey } from '../../../systems/almanac';

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
  const fps = useGameSelector((state) => state.gameLoop?.fps || 0);
  const coins = useGameSelector((state) => state.coins || 0);
  const xp = useGameSelector((state) => state.xp || 0);
  const level = useGameSelector((state) => state.level || 1);
  const musicEnabled = useGameSelector((state) => state.settings?.musicEnabled !== false);
  const soundEnabled = useGameSelector((state) => state.settings?.soundEnabled !== false);
  const reducedMotionEnabled = useGameSelector((state) => state.settings?.reducedMotion === true);
  const seasonCurrent = useGameSelector((state) => state.season?.current || 'spring');
  const seasonConfig = useGameSelector((state) => state.season?.config || null);
  const cozyVisualWeather = useGameSelector((state) => state.cozyExpansion?.visualState?.weather || null);
  const hasCozyVisualWeather = useGameSelector((state) => Boolean(state.cozyExpansion?.visualState?.weather));
  const dayCount = useGameSelector((state) => state.almanac?.counters?.dayCount || 0);
  const farmThemeId = useGameSelector((state) => state.farmTheme || null);
  const weather = useGameSelector((state) => state.weather || 'sunny');
  const ghostVisitActive = useGameSelector((state) => Boolean(state.ghostVisit?.active));
  const plots = useGameSelector((state) => (Array.isArray(state.plots) ? state.plots : []));
  const notifications = useGameSelector((state) => (Array.isArray(state.notifications) ? state.notifications : []));
  const onboardingSeen = useGameSelector((state) => Boolean(state.onboardingSeen || state.onboardingSkipped));

  const debugToolsAllowed = shouldShowDebugTools();
  const debugQueryEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debug') === '1';
  }, []);

  // Navigation state for new consolidated nav
  const [activeSection, setActiveSection] = useState('farm');
  const [activeTab, setActiveTab] = useState('farming');
  const [timePeriod, setTimePeriod] = useState('day');
  const [showStartScreen, setShowStartScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(START_SCREEN_STORAGE_KEY) !== 'true';
  });

  const computeTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 17 && hour < 20) return 'dusk';
    if (hour >= 20 || hour < 5) return 'night';
    return 'day';
  };

  const findSectionForTab = useCallback((tabId) => (
    Object.values(NAV_SECTIONS).find((section) => section.tabs.includes(tabId))?.id || null
  ), []);

  // Handle section change
  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    logDebugAction('nav_section_change', { sectionId });
    // Auto-select first tab of section if not already in that section
    const section = NAV_SECTIONS[sectionId];
    if (section && !section.tabs.includes(activeTab)) {
      setActiveTab(section.tabs[0]);
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const sectionId = findSectionForTab(tabId);
    if (sectionId) {
      setActiveSection(sectionId);
    }
    logDebugAction('tab_change', { tabId });
    if (tabId === 'events') {
      actions.recordOnboardingEvent('board_open');
    }
  }, [actions, findSectionForTab]);

  const dismissStartScreen = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(START_SCREEN_STORAGE_KEY, 'true');
    }
    setShowStartScreen(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.switchToTab = (tabId) => {
      if (typeof tabId === 'string') {
        handleTabChange(tabId);
      }
    };

    return () => {
      delete window.switchToTab;
    };
  }, [handleTabChange]);

  // Initialize systems ONCE - don't recreate on state changes!
  // We pass current state to update() method, so no need to recreate
  const farmingSystem = useMemo(() => {
    const system = new FarmingSystem(null, actions);
    if (isDevelopmentMode()) {
      console.debug('[farm]', 'FarmingSystem initialized');
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
      console.debug('[farm]', 'LivestockSystem initialized');
    }
    return system;
  }, [actions]);

  const fishingSystem = useMemo(() => {
    const system = new FishingSystem(null, actions);
    if (isDevelopmentMode()) {
      console.debug('[farm]', 'FishingSystem initialized');
    }
    return system;
  }, [actions]);

  const soundSystem = useMemo(() => getSoundSystem(), []);

  const musicSystem = useMemo(() => getMusicSystem(), []);

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
      musicSystem
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          window.__farmPerf.maxUpdateMs = Math.max(window.__farmPerf.maxUpdateMs, window.__lastUpdateTime);
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
  }, [paused, store, seasonSystem, farmingSystem, weatherSystem, economicSystem, achievementSystem, diseaseSystem, disasterSystem, livestockSystem, fishingSystem]);

  // Initialize sound and music systems
  useEffect(() => {
    const soundSystem = getSoundSystem();
    const musicSystem = getMusicSystem();

    window.soundSystem = soundSystem;
    window.musicSystem = musicSystem;

    soundSystem.setEnabled(soundEnabled);
    musicSystem.setEnabled(musicEnabled);

    // Resume audio context only after user interaction (browser requirement)
    // Don't auto-resume here - let user interaction trigger it
    let hasInteracted = false;
    const handleUserInteraction = async () => {
      if (hasInteracted) return;
      hasInteracted = true;

      try {
        await soundSystem.resume();
        await musicSystem.resume();

        // Start music after audio context is resumed
        if (musicEnabled && !musicSystem.isPlaying) {
          musicSystem.setSeason(seasonCurrent);
          musicSystem.play();
        }

        // Remove listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      } catch (error) {
        // Silent fail - audio might not be available
        if (isDevelopmentMode()) {
          console.debug('[farm] Audio resume failed:', error);
        }
      }
    };

    // Wait for user interaction before resuming audio
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    // Set season for music (will start playing after user interaction)
    if (musicEnabled) {
      musicSystem.setSeason(seasonCurrent);
    }

    return () => {
      // Cleanup on unmount
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      if (window.soundSystem) {
        delete window.soundSystem;
      }
      if (window.musicSystem) {
        musicSystem.stop();
        delete window.musicSystem;
      }
    };
  }, [musicEnabled, seasonCurrent, soundEnabled]);

  // Update music when season changes
  const prevSeasonRef = React.useRef(seasonCurrent);
  useEffect(() => {
    const musicSystem = getMusicSystem();
    const currentSeason = seasonCurrent;

    // Only update if season actually changed
    if (currentSeason && currentSeason !== prevSeasonRef.current && musicEnabled) {
      musicSystem.setSeason(currentSeason);
      prevSeasonRef.current = currentSeason;
      if (isDevelopmentMode()) {
        console.debug('[farm]', `Music changed to ${currentSeason} theme`);
      }
    }
  }, [musicEnabled, seasonCurrent]);

  // Get season colors for theming
  const seasonColors = seasonConfig?.colors || {
    primary: 'from-green-50 to-blue-50'
  };

  // Enhanced season transition effect
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let activeNodes = [];
    let activeTimers = [];

    const clearActiveTransition = () => {
      activeTimers.forEach((timerId) => clearTimeout(timerId));
      activeTimers = [];
      activeNodes.forEach((node) => {
        if (node && typeof node.remove === 'function') {
          node.remove();
        }
      });
      activeNodes = [];
    };

    const createGradient = (seasonConfig) => {
      const gradientStops = Array.isArray(seasonConfig?.overlayGradient)
        ? seasonConfig.overlayGradient
        : ['#dcfce7', '#dbeafe'];
      return `linear-gradient(135deg, ${gradientStops.join(', ')})`;
    };

    window.triggerSeasonTransition = (seasonConfig = {}) => {
      clearActiveTransition();

      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      // Create full-screen overlay for smooth transition.
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        background: ${createGradient(seasonConfig)};
        opacity: 0;
        transition: opacity ${prefersReducedMotion ? '300ms' : '1.5s'} ease-in-out;
      `;
      document.body.appendChild(overlay);
      activeNodes.push(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = prefersReducedMotion ? '0.7' : '0.95';
      });

      const icon = document.createElement('div');
      icon.textContent = seasonConfig.emoji || '🌱';
      icon.style.cssText = `
        position: fixed;
        top: 40%;
        left: 50%;
        transform: ${prefersReducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0)'};
        font-size: clamp(64px, 12vw, 150px);
        z-index: 10000;
        pointer-events: none;
        filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.9));
        animation: ${prefersReducedMotion ? 'fade-in 300ms ease-out forwards' : 'season-icon-pop 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'};
      `;
      document.body.appendChild(icon);
      activeNodes.push(icon);

      const text = document.createElement('div');
      text.textContent = seasonConfig.name || 'Season';
      text.style.cssText = `
        position: fixed;
        top: 55%;
        left: 50%;
        transform: ${prefersReducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0)'};
        font-size: clamp(28px, 6vw, 48px);
        font-weight: bold;
        color: rgba(255, 255, 255, 0.95);
        z-index: 10000;
        pointer-events: none;
        text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        animation: ${prefersReducedMotion ? 'fade-in 300ms ease-out 80ms forwards' : 'season-text-appear 2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards'};
      `;
      document.body.appendChild(text);
      activeNodes.push(text);

      const desc = document.createElement('div');
      desc.textContent = seasonConfig.description || '';
      desc.style.cssText = `
        position: fixed;
        top: 62%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: clamp(14px, 2.8vw, 18px);
        color: rgba(255, 255, 255, 0.85);
        z-index: 10000;
        pointer-events: none;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        text-align: center;
        max-width: min(80%, 560px);
        opacity: 0;
        animation: fade-in 1s ease-in 0.8s forwards;
      `;
      document.body.appendChild(desc);
      activeNodes.push(desc);

      if (!prefersReducedMotion) {
        const particles = [];
        const particleCount = 24;
        for (let i = 0; i < particleCount; i += 1) {
          const particle = document.createElement('div');
          particle.textContent = seasonConfig.icon || seasonConfig.emoji || '✨';
          particle.style.cssText = `
            position: fixed;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            font-size: ${20 + Math.random() * 30}px;
            z-index: 9998;
            pointer-events: none;
            opacity: 0;
            animation: season-particle-float ${3 + Math.random() * 2}s ease-in-out ${Math.random() * 0.5}s forwards;
          `;
          document.body.appendChild(particle);
          particles.push(particle);
          activeNodes.push(particle);
        }
      }

      const fadeTimer = setTimeout(() => {
        overlay.style.opacity = '0';
        icon.style.opacity = '0';
        text.style.opacity = '0';
        desc.style.opacity = '0';
        icon.style.transform = 'translate(-50%, -50%) scale(0.5)';
        text.style.transform = 'translate(-50%, -50%) scale(0.5)';

        const cleanupTimer = setTimeout(() => {
          clearActiveTransition();
        }, prefersReducedMotion ? 400 : 1500);
        activeTimers.push(cleanupTimer);
      }, prefersReducedMotion ? 1200 : 2500);

      activeTimers.push(fadeTimer);
    };

    return () => {
      clearActiveTransition();
      delete window.triggerSeasonTransition;
    };
  }, []);

  useEffect(() => {
    const updatePeriod = () => {
      const next = computeTimePeriod();
      setTimePeriod((prev) => {
        if (prev !== 'night' && next === 'night') {
          actions.recordCozyExpansionEvent?.('nightfall', { dayKey: getDayKey() });
        }
        return next;
      });
    };

    updatePeriod();
    const timer = setInterval(updatePeriod, 60000);
    return () => clearInterval(timer);
  }, [actions]);

  useEffect(() => {
    if (hasCozyVisualWeather) return;
    const weather = VISUAL_WEATHER_ROTATION[dayCount % VISUAL_WEATHER_ROTATION.length];
    actions.recordCozyExpansionEvent?.('weather_changed', { weather });
  }, [actions, dayCount, hasCozyVisualWeather]);

  const activeTheme = getFarmTheme(farmThemeId);
  const activeThemeId = activeTheme.id;
  const themeVars = getFarmThemeVars(activeTheme);
  const plotSummary = useMemo(() => {
    let active = 0;
    let ready = 0;
    let empty = 0;
    for (const plot of plots) {
      if (!plot) continue;
      if (plot.state === 'empty') {
        empty += 1;
      } else {
        active += 1;
      }
      if (plot.state === 'ready') {
        ready += 1;
      }
    }
    return { active, ready, empty };
  }, [plots]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const renderGameToText = () => JSON.stringify({
      screen: showStartScreen ? 'start' : 'game',
      section: activeSection,
      tab: activeTab,
      paused,
      timePeriod,
      season: seasonCurrent,
      weather: cozyVisualWeather || weather,
      day: dayCount,
      coins,
      xp,
      level,
      farmTheme: activeThemeId,
      plots: plotSummary,
      ui: {
        notifications: notifications.length,
        onboardingSeen,
        ghostVisitActive,
      },
    });

    window.render_game_to_text = renderGameToText;
    return () => {
      if (window.render_game_to_text === renderGameToText) {
        delete window.render_game_to_text;
      }
    };
  }, [
    activeSection,
    activeTab,
    activeThemeId,
    coins,
    cozyVisualWeather,
    dayCount,
    ghostVisitActive,
    level,
    notifications.length,
    onboardingSeen,
    paused,
    plotSummary,
    seasonCurrent,
    showStartScreen,
    timePeriod,
    weather,
    xp,
  ]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${seasonColors.primary} transition-colors duration-1000 flex flex-col relative overflow-hidden`}
      data-farm-theme={activeTheme.id}
      style={{ ...themeVars, filter: TIME_OF_DAY_VISUALS[timePeriod]?.filter || 'none' }}
    >
      {showStartScreen && (
        <StartScreen
          onStart={dismissStartScreen}
        />
      )}

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
      <WeatherEffects weather={cozyVisualWeather || weather} intensity={0.45} timePeriod={timePeriod} />

      {/* Performance monitoring (dev only) */}
      {isDevelopmentMode() && (
        <div className="fixed top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-50">
          FPS: {fps}
        </div>
      )}

      {!showStartScreen && (
        <>
          {/* Game Header */}
          <div className="relative z-20"><GameHeader /></div>

          {ghostVisitActive && (
            <div className="relative z-30 mx-2 sm:mx-4 mt-2 max-w-7xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] lg:mx-auto rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800">
              👻 Ghost Visit (Read Only) — actions are disabled until you exit in Social.
            </div>
          )}

          {/* Main Game Area - Mobile Optimized with bottom padding for NavBar */}
          <div className="relative z-20 flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4 max-w-7xl mx-auto w-full pb-24 lg:pb-4">
            {/* Farm Grid - First on mobile, left on desktop */}
            <div className="w-full lg:flex-1 order-1 lg:order-1">
              <FarmGrid />
            </div>

            {/* Game Sidebar - Below farm on mobile, right column on desktop */}
            <div className="w-full lg:w-80 xl:w-96 order-2 lg:order-2">
              <GameSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </div>

          {/* Bottom Navigation Bar - Fixed on mobile */}
          <div className="fixed bottom-0 left-0 right-0 lg:relative z-40">
            <NavBar
              activeSection={activeSection}
              activeTab={activeTab}
              onSectionChange={handleSectionChange}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Notification System - Mobile positioned above NavBar */}
          <NotificationSystem />

          {/* Particle Effects System */}
          <ParticleEffectsManager />

          {/* FPS Overlay */}
          <FPSCounter />
          <PerfHud />

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

          {/* Onboarding Tutorial (auto-shows for new players) */}
          <Tutorial />

          {/* What's New should not interrupt the launch screen on first load. */}
          <WhatsNewModal />
        </>
      )}

      {/* Premium lock modal (premium mode only) */}
      <PremiumLockModal />

      {/* Level up celebration */}
      <LevelUpModal />

      {/* Achievement unlock celebration */}
      <AchievementUnlockModal />
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
