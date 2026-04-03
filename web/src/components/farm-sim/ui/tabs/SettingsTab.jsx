import React, { memo, useCallback, useEffect, useState } from 'react';
import { useGameActions, useGameSelector, useGameStore } from '../../context/GameContext';
import {
  BACKUP_SAVE_KEY,
  SAVE_KEY,
  clearFarmCache,
  createSavePayload,
  importSaveDataToStorage,
} from '../../context/GamePersistence';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { APP_VERSION, getReleaseModeLabel } from '../../../../config/release';
import { START_SCREEN_STORAGE_KEY } from '../StartScreen';
import { TabHero, TabSection, MetricTile } from './TabSurface';

// Subcomponents
import { AudioSettings } from './settings/AudioSettings';
import { SaveLoadSettings } from './settings/SaveLoadSettings';
import { GameplaySettings } from './settings/GameplaySettings';
import { GameStats } from './settings/GameStats';

const SOUND_VOLUME_KEY = 'farmlife_settings_sound_volume';
const MUSIC_VOLUME_KEY = 'farmlife_settings_music_volume';
const DEFAULT_SOUND_VOLUME = 0.3;
const DEFAULT_MUSIC_VOLUME = 0.15;

const readStoredVolume = (key, fallback, max = 1) => {
  if (typeof window === 'undefined') return fallback;
  const stored = Number(window.localStorage.getItem(key));
  if (!Number.isFinite(stored)) return fallback;
  return Math.max(0, Math.min(max, stored));
};

const SettingsTab = memo(() => {
  const actions = useGameActions();
  const store = useGameStore();
  const settings = useGameSelector((state) => state.settings || {});
  const paused = useGameSelector((state) => Boolean(state.gameLoop?.paused));
  const fps = useGameSelector((state) => state.gameLoop?.fps || 0);
  const [soundVolume, setSoundVolume] = useState(() => readStoredVolume(SOUND_VOLUME_KEY, DEFAULT_SOUND_VOLUME));
  const [musicVolume, setMusicVolume] = useState(() => readStoredVolume(MUSIC_VOLUME_KEY, DEFAULT_MUSIC_VOLUME, 0.5));

  const soundEnabled = settings.soundEnabled !== false;
  const musicEnabled = settings.musicEnabled !== false;
  const animationsEnabled = settings.animationsEnabled !== false;
  const autoSaveEnabled = settings.autoSave !== false;
  const keyboardShortcutsEnabled = settings.keyboardShortcuts !== false;
  const showFPS = Boolean(settings.showFPS);
  const reducedMotion = Boolean(settings.reducedMotion);
  const showTooltips = settings.showTooltips !== false;
  const showAlmanacHints = settings.showAlmanacHints !== false;
  const showWelcomeBackSummary = settings.showWelcomeBackSummary !== false;
  const fastMode = Boolean(settings.fastMode);
  const particleEffects = settings.particleEffects !== false;

  const addNotification = useCallback((message, type) => {
    actions.addNotification({ message, type });
  }, [actions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SOUND_VOLUME_KEY, String(soundVolume));
    } catch (error) {
      // Ignore storage failures in restrictive browsers or private mode.
    }
    if (window.soundSystem) {
      window.soundSystem.setVolume(soundVolume);
    }
  }, [soundVolume]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume));
    } catch (error) {
      // Ignore storage failures in restrictive browsers or private mode.
    }
    if (window.musicSystem) {
      window.musicSystem.setVolume(musicVolume);
    }
  }, [musicVolume]);

  const handleToggleSound = useCallback(() => {
    const newState = !soundEnabled;
    actions.updateSettings({
      soundEnabled: newState
    });

    // Update sound system
    if (typeof window !== 'undefined' && window.soundSystem) {
      window.soundSystem.setEnabled(newState);
      if (newState) {
        window.soundSystem.resume();
        window.soundSystem.playClickSound();
      }
    }

    addNotification(`Sound ${newState ? 'enabled 🔊' : 'disabled 🔇'}`, 'info');
  }, [actions, addNotification, soundEnabled]);

  const handleToggleMusic = useCallback(() => {
    const newState = !musicEnabled;
    actions.updateSettings({
      musicEnabled: newState
    });

    // Update music system
    if (typeof window !== 'undefined' && window.musicSystem) {
      window.musicSystem.setEnabled(newState);
      if (newState) {
        window.musicSystem.resume();
        window.musicSystem.play();
      } else {
        window.musicSystem.stop();
      }
    }

    addNotification(`Music ${newState ? 'enabled 🎵' : 'disabled 🔇'}`, 'info');
  }, [actions, addNotification, musicEnabled]);

  const handleSoundVolumeChange = useCallback((e) => {
    const volume = parseFloat(e.target.value);
    setSoundVolume(volume);
    if (typeof window !== 'undefined' && window.soundSystem) {
      window.soundSystem.setVolume(volume);
      window.soundSystem.playClickSound();
    }
  }, []);

  const handleMusicVolumeChange = useCallback((e) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
    if (typeof window !== 'undefined' && window.musicSystem) {
      window.musicSystem.setVolume(volume);
    }
  }, []);

  const handleToggleAnimations = useCallback(() => {
    const nextValue = !animationsEnabled;
    actions.updateSettings({
      animationsEnabled: nextValue
    });
    addNotification(`Animations ${nextValue ? 'enabled' : 'disabled'}`, 'info');
  }, [actions, addNotification, animationsEnabled]);

  const handleToggleAutoSave = useCallback(() => {
    const nextValue = !autoSaveEnabled;
    actions.updateSettings({
      autoSave: nextValue
    });
    addNotification(`Auto-save ${nextValue ? 'enabled' : 'disabled'}`, 'info');
  }, [actions, addNotification, autoSaveEnabled]);

  const handleToggleShowFps = useCallback(() => {
    actions.updateSettings({
      showFPS: !showFPS
    });
  }, [actions, showFPS]);

  const handleToggleReducedMotion = useCallback(() => {
    actions.updateSettings({
      reducedMotion: !reducedMotion
    });
  }, [actions, reducedMotion]);

  const handleToggleTooltips = useCallback(() => {
    actions.updateSettings({
      showTooltips: !showTooltips
    });
  }, [actions, showTooltips]);

  const handleToggleAlmanacHints = useCallback(() => {
    actions.updateSettings({
      showAlmanacHints: !showAlmanacHints
    });
  }, [actions, showAlmanacHints]);

  const handleToggleWelcomeBackSummary = useCallback(() => {
    actions.updateSettings({
      showWelcomeBackSummary: !showWelcomeBackSummary
    });
  }, [actions, showWelcomeBackSummary]);

  const handleToggleFastMode = useCallback(() => {
    actions.updateSettings({
      fastMode: !fastMode
    });
  }, [actions, fastMode]);

  const handleToggleParticleEffects = useCallback(() => {
    actions.updateSettings({
      particleEffects: !particleEffects
    });
  }, [actions, particleEffects]);

  const handleToggleKeyboardShortcuts = useCallback(() => {
    const nextValue = !keyboardShortcutsEnabled;
    actions.updateSettings({ keyboardShortcuts: nextValue });
    addNotification(`Keyboard shortcuts ${nextValue ? 'enabled ⌨️' : 'disabled'}`, 'info');
  }, [actions, addNotification, keyboardShortcutsEnabled]);

  const handleTogglePause = useCallback(() => {
    if (paused) {
      actions.resumeGame();
      return;
    }
    actions.pauseGame();
  }, [actions, paused]);

  const handleSaveGame = useCallback(() => {
    const success = actions.saveGame();
    if (success) {
      addNotification('💾 Game saved successfully!', 'success');
    } else {
      addNotification('❌ Failed to save game', 'error');
    }
  }, [actions, addNotification]);

  const handleLoadGame = useCallback(() => {
    const success = actions.loadGame();
    if (success) {
      addNotification('📂 Game loaded successfully!', 'success');
    } else {
      addNotification('⚠️ No saved game found', 'warning');
    }
  }, [actions, addNotification]);

  const handleResetGame = useCallback(() => {
    if (window.confirm('Reset your farm to a fresh start? This cannot be undone. New saves include a small starter kit (seeds + crop care tools).')) {
      try {
        const result = clearFarmCache({ preserveKeys: [] });
        if (!result.success) {
          addNotification('Failed to reset game', 'error');
          return;
        }
        window.location.reload();
      } catch (error) {
        addNotification('Failed to reset game', 'error');
      }
    }
  }, [addNotification]);

  const handleExportSave = useCallback(() => {
    try {
      const saveData = JSON.stringify(createSavePayload(store.getState()), null, 2);
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farmsim-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification('📤 Save exported successfully!', 'success');
    } catch (error) {
      addNotification('Failed to export save', 'error');
    }
  }, [addNotification, store]);

  const handleImportSave = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          const result = importSaveDataToStorage(importedData, {
            key: SAVE_KEY,
            backupKey: BACKUP_SAVE_KEY,
          });
          if (!result.success) {
            addNotification('Invalid save file format', 'error');
            return;
          }
          addNotification('📥 Save imported! Reloading...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          addNotification('Invalid save file format', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addNotification]);

  const handleClearCache = useCallback(() => {
    if (window.confirm('Clear all cached data? Your save will remain intact.')) {
      try {
        const result = clearFarmCache({ preserveKeys: [SAVE_KEY] });
        if (!result.success) {
          addNotification('Failed to clear cache', 'error');
          return;
        }
        addNotification('🗑️ Cache cleared successfully!', 'success');
      } catch (error) {
        addNotification('Failed to clear cache', 'error');
      }
    }
  }, [addNotification]);

  const handleResetTutorial = useCallback(() => {
    actions.resetOnboarding();
    addNotification('🎓 Tutorial reset! It will show again shortly.', 'success');
  }, [actions, addNotification]);

  const handleResetStartScreen = useCallback(() => {
    try {
      window.localStorage.removeItem(START_SCREEN_STORAGE_KEY);
      addNotification('🌱 Start screen will show again on the next reload.', 'success');
      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      addNotification('Failed to reset start screen', 'error');
    }
  }, [addNotification]);

  const handleInstallApp = useCallback(() => {
    const prompt = window.__pwaInstallPrompt;
    if (prompt) {
      prompt.prompt();
      prompt.userChoice.then((result) => {
        if (result.outcome === 'accepted') {
          addNotification('📲 App installed!', 'success');
        }
        window.__pwaInstallPrompt = null;
      });
      return;
    }
    addNotification('Use your browser menu to install, or the app is already installed.', 'info');
  }, [addNotification]);

  return (
    <div className="space-y-4">
      <TabHero
        icon="⚙️"
        tone="violet"
        title="Game controls"
        description="Save routines, runtime controls, audio, and accessibility live in one place."
        badge={(
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-white/80 text-slate-600">
              {paused ? 'Paused' : 'Running'}
            </Badge>
            <Badge variant="outline" className="bg-white/80 text-slate-600">
              {fps} FPS
            </Badge>
            <Badge variant="outline" className="bg-white/80 text-slate-600">
              Auto-save {autoSaveEnabled ? 'On' : 'Off'}
            </Badge>
          </div>
        )}
        actions={(
          <Button
            onClick={handleTogglePause}
            variant={paused ? 'default' : 'outline'}
            size="sm"
          >
            {paused ? 'Resume game' : 'Pause game'}
          </Button>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile tone="violet" label="Status" value={paused ? 'Paused' : 'Live'} hint="Simulation state" icon={paused ? '⏸️' : '▶️'} />
          <MetricTile tone="sky" label="Frame rate" value={fps} hint="Current simulation speed" icon="◌" />
          <MetricTile tone="emerald" label="Autosave" value={autoSaveEnabled ? 'On' : 'Off'} hint="Background persistence" icon="💾" />
        </div>
      </TabHero>

      <SaveLoadSettings
        handleSaveGame={handleSaveGame}
        handleLoadGame={handleLoadGame}
        handleExportSave={handleExportSave}
        handleImportSave={handleImportSave}
        handleClearCache={handleClearCache}
        handleResetGame={handleResetGame}
      />

      <GameplaySettings
        autoSaveEnabled={autoSaveEnabled}
        animationsEnabled={animationsEnabled}
        showFPS={showFPS}
        reducedMotion={reducedMotion}
        showTooltips={showTooltips}
        showAlmanacHints={showAlmanacHints}
        showWelcomeBackSummary={showWelcomeBackSummary}
        fastMode={fastMode}
        particleEffects={particleEffects}
        handleToggleAnimations={handleToggleAnimations}
        handleToggleAutoSave={handleToggleAutoSave}
        handleToggleShowFps={handleToggleShowFps}
        handleToggleReducedMotion={handleToggleReducedMotion}
        handleToggleTooltips={handleToggleTooltips}
        handleToggleAlmanacHints={handleToggleAlmanacHints}
        handleToggleWelcomeBackSummary={handleToggleWelcomeBackSummary}
        handleToggleFastMode={handleToggleFastMode}
        handleToggleParticleEffects={handleToggleParticleEffects}
      />

      <AudioSettings
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        handleToggleSound={handleToggleSound}
        handleToggleMusic={handleToggleMusic}
        handleSoundVolumeChange={handleSoundVolumeChange}
        handleMusicVolumeChange={handleMusicVolumeChange}
        soundVolume={soundVolume}
        musicVolume={musicVolume}
      />

      <GameStats />

      <TabSection
        title="Keyboard shortcuts"
        description="Quick keys for the most common farm actions."
        tone="sky"
        action={(
          <Button
            onClick={handleToggleKeyboardShortcuts}
            variant={keyboardShortcutsEnabled ? 'default' : 'outline'}
            size="sm"
          >
            {keyboardShortcutsEnabled ? 'On' : 'Off'}
          </Button>
        )}
        bodyClassName="pt-4"
      >
        <div className="overflow-hidden rounded-[24px] border border-slate-200/60 bg-white/72">
          {[
            ['Switch Tabs', '1 – 9'],
            ['Pause / Resume', 'Space'],
            ['Fishing Controls', 'A / D'],
            ['Select Multiple Plots', 'Shift + Click'],
            ['Quick Save', 'Ctrl + S'],
            ['Water All', 'W'],
            ['Harvest All', 'H'],
            ['Fertilize All', 'F'],
            ['Treat Diseases', 'T'],
          ].map(([label, shortcut], index) => (
            <div
              key={label}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 text-sm ${
                index !== 0 ? 'border-t border-slate-200/60' : ''
              }`}
            >
              <span className="text-slate-700">{label}</span>
              <Badge variant="outline" className="font-mono bg-white/80 text-slate-600">
                {shortcut}
              </Badge>
            </div>
          ))}
        </div>
      </TabSection>

      <TabSection
        title="Tutorial reset"
        description="Show the onboarding tutorial again if you want a fresh walkthrough."
        tone="amber"
        action={(
          <Button
            onClick={handleResetTutorial}
            variant="outline"
            size="sm"
          >
            Reset
          </Button>
        )}
      />

      <TabSection
        title="Start screen"
        description="Clear the launch gate so the intro screen appears again on the next refresh."
        tone="emerald"
        action={(
          <Button
            onClick={handleResetStartScreen}
            variant="outline"
            size="sm"
          >
            Replay
          </Button>
        )}
      />

      <TabSection
        title="Install"
        description="Install FarmSim as a standalone app for a more immersive feel."
        tone="sky"
        action={(
          <Button
            onClick={handleInstallApp}
            variant="outline"
            size="sm"
          >
            Install
          </Button>
        )}
      />

      <TabSection
        title="FarmSim"
        description="A modular farm simulation with sound, background music, livestock, fishing, and a growing set of systems that can be tuned without losing the cozy feel."
        tone="emerald"
        action={(
          <Badge variant="outline" className="bg-white/80 text-slate-600">
            {getReleaseModeLabel()}
          </Badge>
        )}
      >
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Version</div>
            <div className="font-medium text-slate-900">{APP_VERSION}</div>
          </div>
          <div className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Stack</div>
            <div className="font-medium text-slate-900">React + Vite + Tailwind CSS</div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Built to stay cozy while supporting sound, music, livestock, fishing, and systems that can keep expanding without losing the mood.
        </p>

        <div className="mt-4 border-t border-slate-200/70 pt-4">
          <p className="text-sm font-semibold text-emerald-800">Recent upgrades</p>
          <ul className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <li className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2">Weekly Operations milestone rewards</li>
            <li className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2">Streak-based challenge reward boosts</li>
            <li className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2">Daily Market Focus bonus crop loop</li>
            <li className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2">Reworked Daily Operations board with reroll</li>
            <li className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2">Sidebar mounts only active tab content</li>
            <li className="rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2">Notification Center with saved history</li>
          </ul>
        </div>
      </TabSection>

    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';
export default SettingsTab;
