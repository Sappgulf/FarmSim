import React, { useEffect, useMemo, useState } from 'react';
import { GameProvider, useGame } from '../context/GameContext';
import { TickProvider } from '../context/TickContext';

// Import modular components
import GameHeader from '../ui/GameHeader';
import FarmGrid from '../ui/FarmGrid';
import GameSidebar from '../ui/GameSidebar';
import NavBar, { NAV_SECTIONS } from '../ui/NavBar';
import NotificationSystem from '../ui/NotificationSystem';
import { ParticleEffectsManager } from '../ui/ParticleEffect';
import FPSCounter from '../ui/FPSCounter';
import PerformanceOverlay from '../ui/PerformanceOverlay';
import DebugStressPanel from '../ui/DebugStressPanel';
import QAModePanel from '../ui/QAModePanel';
import Tutorial from '../ui/Tutorial';
import { logDebugAction } from '../../../utils/debugTools';

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

/**
 * Main FarmSim Component (Orchestrator)
 * Manages game systems, update loops, and initialization
 * @returns {JSX.Element} The main game component
 */
function FarmSimCore() {
  const { state, actions } = useGame();

  // Navigation state for new consolidated nav
  const [activeSection, setActiveSection] = useState('farm');
  const [activeTab, setActiveTab] = useState('farming');

  // Handle section change
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    logDebugAction('nav_section_change', { sectionId });
    // Auto-select first tab of section if not already in that section
    const section = NAV_SECTIONS[sectionId];
    if (section && !section.tabs.includes(activeTab)) {
      setActiveTab(section.tabs[0]);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    logDebugAction('tab_change', { tabId });
    // Also switch sidebar tab via global method (for legacy compat)
    if (typeof window.switchToTab === 'function') {
      window.switchToTab(tabId);
    }
    if (tabId === 'events') {
      actions.recordOnboardingEvent('board_open');
    }
  };

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
    if (state.gameLoop.paused) return;

    let lastUpdateTime = performance.now();
    const targetFPS = 10; // 10 FPS = 100ms per frame
    const targetFrameTime = 1000 / targetFPS; // 100ms

    let animationFrameId = null;

    const systemUpdateLoop = (currentTime) => {
      // Use stateRef.current to always get latest state (fixes stale closure bug!)
      const currentState = stateRef.current;

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
  }, [state.gameLoop.paused, seasonSystem, farmingSystem, weatherSystem, economicSystem, achievementSystem, diseaseSystem, disasterSystem, livestockSystem, fishingSystem]);

  // Initialize sound and music systems
  useEffect(() => {
    const soundSystem = getSoundSystem();
    const musicSystem = getMusicSystem();

    window.soundSystem = soundSystem;
    window.musicSystem = musicSystem;

    soundSystem.setEnabled(state.settings?.soundEnabled !== false);
    musicSystem.setEnabled(state.settings?.musicEnabled !== false);

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
        if (state.settings?.musicEnabled !== false && !musicSystem.isPlaying) {
          musicSystem.setSeason(state.season?.current || 'spring');
          musicSystem.play();
        }

        // Remove listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      } catch (error) {
        // Silent fail - audio might not be available
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm] Audio resume failed:', error);
        }
      }
    };

    // Wait for user interaction before resuming audio
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    // Set season for music (will start playing after user interaction)
    if (state.settings?.musicEnabled !== false) {
      musicSystem.setSeason(state.season?.current || 'spring');
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
  }, [state.settings?.soundEnabled, state.settings?.musicEnabled]);

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

        // Add season icon with dramatic entrance
        const icon = document.createElement('div');
        icon.textContent = seasonConfig.emoji;
        icon.style.cssText = `
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          font-size: 150px;
          z-index: 10000;
          pointer-events: none;
          filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.9));
          animation: season-icon-pop 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
          font-size: 48px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.95);
          z-index: 10000;
          pointer-events: none;
          text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          animation: season-text-appear 2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
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
          font-size: 18px;
          color: rgba(255, 255, 255, 0.85);
          z-index: 10000;
          pointer-events: none;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          text-align: center;
          max-width: 80%;
          opacity: 0;
          animation: fade-in 1s ease-in 0.8s forwards;
        `;
        document.body.appendChild(desc);

        // Create decorative particles
        const particleCount = 30;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.textContent = seasonConfig.icon || seasonConfig.emoji;
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
    <div className={`min-h-screen bg-gradient-to-br ${seasonColors.primary} transition-colors duration-1000 flex flex-col`}>
      {/* Performance monitoring (dev only) */}
      {import.meta.env.MODE === 'development' && (
        <div className="fixed top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-50">
          FPS: {state.gameLoop.fps}
        </div>
      )}

      {/* Game Header */}
      <GameHeader />

      {/* Main Game Area - Mobile Optimized with bottom padding for NavBar */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4 max-w-7xl mx-auto relative w-full pb-24 lg:pb-4">
        {/* Farm Grid - Full width on mobile, larger on desktop */}
        <div className="w-full lg:flex-1 order-2 lg:order-1">
          <FarmGrid />
        </div>

        {/* Game Sidebar - Shows tabs for active section */}
        <div className="w-full lg:w-80 xl:w-96 order-1 lg:order-2">
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

      {/* Performance Overlay (dev, toggle with `) */}
      <PerformanceOverlay />

      {/* Debug Stress Panel (?debug=1) */}
      <DebugStressPanel />

      {/* QA Mode Panel (?debug=1) */}
      <QAModePanel />

      {/* Onboarding Tutorial (auto-shows for new players) */}
      <Tutorial />
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
