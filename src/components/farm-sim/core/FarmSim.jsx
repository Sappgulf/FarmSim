import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { GameProvider, useGame } from '../context/GameContext';
import { TickProvider } from '../context/TickContext';

// Import modular components
import GameHeader from '../ui/GameHeader';
import FarmGrid from '../ui/FarmGrid';
import GameSidebar from '../ui/GameSidebar';
import NavBar, { NAV_SECTIONS } from '../ui/NavBar';
import NotificationSystem from '../ui/NotificationSystem';
import TownBoard from '../ui/TownBoard';

import DevDebugOverlay from '../ui/DevDebugOverlay';
import { ParticleEffectsManager } from '../ui/ParticleEffect';
import FPSCounter from '../ui/FPSCounter';
import PerformanceOverlay from '../ui/PerformanceOverlay';
import LevelUpModal from '../ui/LevelUpModal';
import Tutorial from '../ui/Tutorial';
import DevErrorOverlay from '../ui/DevErrorOverlay';
import DevStressPanel from '../ui/DevStressPanel';

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
import { recordPlayerInteraction, isPlayerIdle } from '../services/XPService';
import { getPerfMetrics, isDebugEnabled } from '../services/DebugService';
import { addTrackedEventListener } from '../services/EventListenerService';

/**
 * Main FarmSim Component (Orchestrator)
 * Manages game systems, update loops, and initialization
 * @returns {JSX.Element} The main game component
 */
function FarmSimCore() {
  const { state, actions } = useGame();
  const debugEnabled = isDebugEnabled();

  // Level Up Modal State
  const [levelUpState, setLevelUpState] = useState({ show: false, level: 0 });
  const prevLevelRef = React.useRef(state.level);
  const renderStartRef = React.useRef(0);
  renderStartRef.current = performance.now();

  useLayoutEffect(() => {
    if (!debugEnabled) return;
    const metrics = getPerfMetrics();
    if (metrics) {
      metrics.lastRenderTime = performance.now() - renderStartRef.current;
    }
  });

  // Detect Level Up
  useEffect(() => {
    // Only trigger if level increased and we aren't just initializing
    if (state.level > prevLevelRef.current && prevLevelRef.current > 0) {
      setLevelUpState({ show: true, level: state.level });
    }
    prevLevelRef.current = state.level;
  }, [state.level]);

  // Navigation state for new consolidated nav
  const [activeSection, setActiveSection] = useState('farm');
  const [activeTab, setActiveTab] = useState('farming');

  // Handle section change
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Auto-select first tab of section if not already in that section
    const section = NAV_SECTIONS[sectionId];
    if (section && !section.tabs.includes(activeTab)) {
      setActiveTab(section.tabs[0]);
    }
  };

  // Handle tab change
  const handleTabChange = React.useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Expose tab switching to window for debug/stress testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.switchToTab = handleTabChange;
    }
    return () => {
      if (typeof window !== 'undefined' && window.switchToTab === handleTabChange) {
        delete window.switchToTab;
      }
    };
  }, [handleTabChange]);

  // Initialize systems ONCE - don't recreate on state changes!
  // We pass current state to update() method, so no need to recreate
  const farmingSystem = useMemo(() => {
    const system = new FarmingSystem(null, actions);
    if (import.meta.env.MODE === 'development') {
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
    if (import.meta.env.MODE === 'development') {
      console.debug('[farm]', 'LivestockSystem initialized');
    }
    return system;
  }, [actions]);

  const fishingSystem = useMemo(() => {
    const system = new FishingSystem(null, actions);
    if (import.meta.env.MODE === 'development') {
      console.debug('[farm]', 'FishingSystem initialized');
    }
    return system;
  }, [actions]);

  const soundSystem = useMemo(() => getSoundSystem(), []);

  const musicSystem = useMemo(() => getMusicSystem(), []);

  // Use ref to always have latest state (avoids stale closure in interval)
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      seasonSystem,
      weatherSystem,
      economicSystem,
      achievementSystem,
      diseaseSystem,
      disasterSystem,
      livestockSystem,
      fishingSystem,
      soundSystem,
      musicSystem
    };

    // Only update if systems actually changed (by reference)
    const systemsChanged =
      systemsRef.current.farmingSystem !== farmingSystem ||
      systemsRef.current.seasonSystem !== seasonSystem ||
      systemsRef.current.weatherSystem !== weatherSystem ||
      systemsRef.current.economicSystem !== economicSystem ||
      systemsRef.current.achievementSystem !== achievementSystem ||
      systemsRef.current.diseaseSystem !== diseaseSystem ||
      systemsRef.current.disasterSystem !== disasterSystem ||
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
  }, [
    farmingSystem,
    seasonSystem,
    weatherSystem,
    economicSystem,
    achievementSystem,
    diseaseSystem,
    disasterSystem,
    livestockSystem,
    fishingSystem,
    soundSystem,
    musicSystem,
  ]);

  // Track player interactions for idle detection
  useEffect(() => {
    const handleInteraction = () => recordPlayerInteraction();
    const cleanups = [
      addTrackedEventListener(window, 'click', handleInteraction),
      addTrackedEventListener(window, 'keydown', handleInteraction),
      addTrackedEventListener(window, 'touchstart', handleInteraction),
    ];
    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, []);

  // Idle Visuals Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      // Check idle state using imported service function directly
      if (isPlayerIdle()) {
        if (typeof window.triggerParticleEffect === 'function') {
          // Spawn Zzz particles around the screen center
          const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
          const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
          window.triggerParticleEffect(x, y, 'text', {
            text: 'Zzz...',
            value: 0,
            shake: false // No shake for idle
          });
        }
      }
    }, 1500); // Check every 1.5 seconds
    return () => clearInterval(interval);
  }, []);

  // Initialize sound and music systems
  useEffect(() => {
    const soundSystem = getSoundSystem();
    const musicSystem = getMusicSystem();

    window.soundSystem = soundSystem;
    window.musicSystem = musicSystem;

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
        const currentSettings = stateRef.current.settings;
        if (currentSettings?.musicEnabled !== false && !musicSystem.isPlaying) {
          musicSystem.setSeason(stateRef.current.season?.current || 'spring');
          musicSystem.play();
        }
      } catch (error) {
        // Silent fail - audio might not be available
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm] Audio resume failed:', error);
        }
      }
    };

    // Wait for user interaction before resuming audio
    const cleanups = [
      addTrackedEventListener(document, 'click', handleUserInteraction, { once: true }),
      addTrackedEventListener(document, 'keydown', handleUserInteraction, { once: true }),
      addTrackedEventListener(document, 'touchstart', handleUserInteraction, { once: true }),
    ];

    return () => {
      // Cleanup on unmount
      cleanups.forEach(cleanup => cleanup());
      if (window.soundSystem) {
        delete window.soundSystem;
      }
      if (window.musicSystem) {
        musicSystem.stop();
        delete window.musicSystem;
      }
    };
  }, []);

  useEffect(() => {
    const soundSystem = getSoundSystem();
    const musicSystem = getMusicSystem();
    soundSystem.setEnabled(state.settings?.soundEnabled !== false);
    musicSystem.setEnabled(state.settings?.musicEnabled !== false);

    if (state.settings?.musicEnabled !== false) {
      musicSystem.setSeason(state.season?.current || 'spring');
    }
  }, [state.settings?.soundEnabled, state.settings?.musicEnabled, state.season?.current]);

  // Update music when season changes
  const prevSeasonRef = React.useRef(state.season?.current);
  useEffect(() => {
    const musicSystem = getMusicSystem();
    const currentSeason = state.season?.current;

    // Only update if season actually changed
    if (currentSeason && currentSeason !== prevSeasonRef.current && state.settings?.musicEnabled !== false) {
      musicSystem.setSeason(currentSeason);
      prevSeasonRef.current = currentSeason;
      if (import.meta.env.MODE === 'development') {
        console.debug('[farm]', `Music changed to ${currentSeason} theme`);
      }
    }
  }, [state.season?.current, state.settings?.musicEnabled]);

  // Page Visibility API - pause music/audio when tab hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const musicSystem = getMusicSystem();
      if (document.hidden) {
        // Pause music when tab is hidden
        if (musicSystem.isPlaying) {
          musicSystem.stop();
          if (import.meta.env.MODE === 'development') {
            console.debug('[farm]', 'Music paused (tab hidden)');
          }
        }
      } else {
        // Resume music when tab is visible (if enabled)
        if (stateRef.current?.settings?.musicEnabled !== false && !musicSystem.isPlaying) {
          musicSystem.play();
          if (import.meta.env.MODE === 'development') {
            console.debug('[farm]', 'Music resumed (tab visible)');
          }
        }
      }
    };

    return addTrackedEventListener(document, 'visibilitychange', handleVisibilityChange);
  }, []);

  // Photo mode toggle handler
  const handlePhotoModeToggle = React.useCallback(() => {
    actions.setPhotoMode(!state.photoMode);
    if (!state.photoMode) {
      // Entering photo mode - play sound
      if (window.soundSystem) {
        window.soundSystem.playClickSound();
      }
    }
  }, [actions, state.photoMode]);

  // Apply theme to document root
  useEffect(() => {
    const theme = state.theme || 'default';
    document.documentElement.setAttribute('data-theme', theme);
  }, [state.theme]);

  // Get season colors for theming
  const seasonColors = state.season?.config?.colors || {
    primary: 'from-green-50 to-blue-50'
  };

  // Enhanced season transition effect
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.triggerSeasonTransition = (seasonConfig) => {
        // Create full-screen overlay for smooth transition
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          background: linear-gradient(135deg, ${seasonConfig.colors.primary.split(' ').join(', ')});
          opacity: 0;
          transition: opacity 1.5s ease-in-out;
        `;
        document.body.appendChild(overlay);

        // Fade in overlay
        requestAnimationFrame(() => {
          overlay.style.opacity = '0.95';
        });

        // Add season icon with dramatic entrance (reduced size for subtler effect)
        const icon = document.createElement('div');
        icon.textContent = seasonConfig.emoji;
        icon.style.cssText = `
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          font-size: 80px;
          z-index: 10000;
          pointer-events: none;
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.7));
          animation: season-icon-pop 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;
        document.body.appendChild(icon);

        // Add season name text
        const text = document.createElement('div');
        text.textContent = seasonConfig.name;
        text.style.cssText = `
          position: fixed;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          font-size: 36px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.95);
          z-index: 10000;
          pointer-events: none;
          text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          animation: season-text-appear 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
        `;
        document.body.appendChild(text);

        // Add description text
        const desc = document.createElement('div');
        desc.textContent = seasonConfig.description;
        desc.style.cssText = `
          position: fixed;
          top: 62%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          z-index: 10000;
          pointer-events: none;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          text-align: center;
          max-width: 80%;
          opacity: 0;
          animation: fade-in 1s ease-in 0.6s forwards;
        `;
        document.body.appendChild(desc);

        // Create decorative particles (reduced from 30 to 8 for subtler effect)
        const particleCount = 8;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.textContent = seasonConfig.icon || seasonConfig.emoji;
          particle.style.cssText = `
            position: fixed;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            font-size: ${16 + Math.random() * 12}px;
            z-index: 9998;
            pointer-events: none;
            opacity: 0;
            animation: season-particle-float ${3 + Math.random() * 2}s ease-in-out ${Math.random() * 0.5}s forwards;
          `;
          document.body.appendChild(particle);
          particles.push(particle);
        }

        // Fade out and cleanup
        setTimeout(() => {
          overlay.style.opacity = '0';
          icon.style.opacity = '0';
          text.style.opacity = '0';
          desc.style.opacity = '0';
          icon.style.transform = 'translate(-50%, -50%) scale(0.5)';
          text.style.transform = 'translate(-50%, -50%) scale(0.5)';

          particles.forEach(p => p.style.opacity = '0');

          setTimeout(() => {
            overlay.remove();
            icon.remove();
            text.remove();
            desc.remove();
            particles.forEach(p => p.remove());
          }, 1500);
        }, 2500);
      };
    }
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${seasonColors.primary} theme-bg transition-colors duration-1000 flex flex-col ${state.photoMode ? 'photo-mode' : ''}`}>
      {/* Performance monitoring (dev only) */}
      {debugEnabled && (
        <div className="fixed top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-50 photo-mode-hide">
          FPS: {state.gameLoop.fps}
        </div>
      )}

      {/* Game Header */}
      <div className="photo-mode-hide">
        <GameHeader />
      </div>

      <div className="w-full px-2 sm:px-4 max-w-7xl mx-auto mt-2 photo-mode-hide">
        <TownBoard />
      </div>

      {/* Main Game Area - Mobile Optimized with bottom padding for NavBar */}
      <div className={`flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4 max-w-7xl mx-auto relative w-full pb-24 lg:pb-4 ${state.photoMode ? 'farm-grid-container' : ''}`}>
        {/* Farm Grid - Full width on mobile, larger on desktop */}
        <div className={`w-full lg:flex-1 ${state.photoMode ? '' : ''}`}>
          <FarmGrid />
        </div>

        {/* Game Sidebar - Shows tabs for active section */}
        <div className="w-full lg:w-80 xl:w-96 photo-mode-hide">
          <GameSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Bottom Navigation Bar - Fixed on mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative z-40 photo-mode-hide">
        <NavBar
          activeSection={activeSection}
          activeTab={activeTab}
          onSectionChange={handleSectionChange}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Notification System - Mobile positioned above NavBar */}
      <div className="photo-mode-hide">
        <NotificationSystem />
      </div>

      {/* Particle Effects System */}
      <ParticleEffectsManager />

      {/* FPS Overlay */}
      <div className="photo-mode-hide">
        <FPSCounter />
      </div>

      {/* Performance Overlay (dev, toggle with `) */}
      <div className="photo-mode-hide">
        <PerformanceOverlay />
      </div>

      {/* Onboarding Tutorial (auto-shows for new players) */}
      <div className="photo-mode-hide">
        <Tutorial />
      </div>

      {/* Level Up Celebration */}
      {levelUpState.show && !state.photoMode && (
        <LevelUpModal
          level={levelUpState.level}
          onClose={() => setLevelUpState(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Developer Debug Overlay (dev only) */}
      <div className="photo-mode-hide">
        <DevDebugOverlay />
      </div>

      {/* Developer Stress Panel (dev only) */}
      <div className="photo-mode-hide">
        <DevStressPanel />
      </div>

      {/* Developer Error Overlay (dev only, shows on errors) */}
      <div className="photo-mode-hide">
        <DevErrorOverlay />
      </div>

      {/* Photo Mode Toggle Button */}
      <button
        onClick={handlePhotoModeToggle}
        className="photo-mode-btn"
        title={state.photoMode ? 'Exit Photo Mode' : 'Enter Photo Mode'}
        aria-label={state.photoMode ? 'Exit Photo Mode' : 'Enter Photo Mode'}
      >
        {state.photoMode ? '✖ Exit' : '📷 Photo'}
      </button>
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
