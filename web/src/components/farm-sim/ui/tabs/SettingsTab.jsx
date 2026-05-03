import React, { memo, useCallback, useEffect, useState } from 'react';
import { useGameActions, useGameSelector, useGameStore } from '../../context/GameContext';
import {
  BACKUP_SAVE_KEY,
  SAVE_KEY,
  clearFarmCache,
  createSavePayload,
  importSaveDataToStorage,
} from '../../context/GamePersistence';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { APP_VERSION, getReleaseModeLabel } from '../../../../config/release';

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
    if (typeof window !== 'undefined' && typeof window.switchToTab === 'function') {
      window.switchToTab('farming');
    }
    addNotification('Farm tour restarted — follow the prompts on your farm.', 'success');
  }, [actions, addNotification]);

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
      <Card className="overflow-hidden border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              Settings
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Game controls</h3>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              Save routines, runtime controls, audio, and accessibility preferences all live in one place.
            </p>
          </div>

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
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Runtime
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">Game status</div>
                <div className="text-sm text-slate-600">
                  {paused ? 'Game is paused' : 'Game is running'}
                </div>
              </div>
              <Button
                onClick={handleTogglePause}
                variant={paused ? 'default' : 'outline'}
              >
                {paused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Performance
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">Frame rate</div>
                <div className="text-sm text-slate-600">Current simulation speed</div>
              </div>
              <Badge variant="outline" className="bg-slate-50/80 text-slate-700">
                {fps} FPS
              </Badge>
            </div>
          </div>
        </div>
      </Card>

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

      <Card className="overflow-hidden border-blue-200/70 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              Controls
            </div>
            <h4 className="text-base font-semibold text-slate-900">Keyboard shortcuts</h4>
          </div>
          <Button
            onClick={handleToggleKeyboardShortcuts}
            variant={keyboardShortcutsEnabled ? 'default' : 'outline'}
            size="sm"
          >
            {keyboardShortcutsEnabled ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {[
            ['Switch Tabs', '1 – 9'],
            ['Pause/Resume Game', 'Space'],
            ['Fishing Controls', 'A / D'],
            ['Select Multiple Plots', 'Shift + Click'],
            ['Quick Save', 'Ctrl + S'],
            ['Water All', 'W'],
            ['Harvest All', 'H'],
            ['Fertilize All', 'F'],
            ['Treat Diseases', 'T'],
          ].map(([label, shortcut]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
              <span className="text-slate-700">{label}</span>
              <Badge variant="outline" className="font-mono bg-slate-50/80 text-slate-600">
                {shortcut}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">
              Onboarding
            </div>
            <h4 className="text-base font-semibold text-slate-900">Farm tour replay</h4>
          </div>
          <Button
            onClick={handleResetTutorial}
            variant="outline"
            size="sm"
          >
            Replay
          </Button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Re-run the spotlight tour; we&apos;ll jump you back to the Farm tab so cues line up with the grid.
        </p>
      </Card>

      <Card className="overflow-hidden border-sky-200/70 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600">
              Install
            </div>
            <h4 className="text-base font-semibold text-slate-900">Add to home screen</h4>
          </div>
          <Button
            onClick={handleInstallApp}
            variant="outline"
            size="sm"
          >
            Install
          </Button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Install FarmSim as a standalone app for a more immersive feel.
        </p>
      </Card>

      <Card className="overflow-hidden border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-green-50/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              About
            </div>
            <h4 className="text-base font-semibold text-slate-900">FarmSim</h4>
          </div>
          <Badge variant="outline" className="bg-white/80 text-slate-600">
            {getReleaseModeLabel()}
          </Badge>
        </div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Version</div>
            <div className="font-medium text-slate-900">{APP_VERSION}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Stack</div>
            <div className="font-medium text-slate-900">React + Vite + Tailwind CSS</div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          A modular farm simulation with sound, background music, livestock, fishing, and a growing set of systems that can be tuned without losing the cozy feel.
        </p>

        <div className="mt-4 border-t border-emerald-100 pt-4">
          <p className="text-sm font-semibold text-emerald-800">Recent upgrades</p>
          <ul className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <li className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">Weekly Operations milestone rewards</li>
            <li className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">Streak-based challenge reward boosts</li>
            <li className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">Daily Market Focus bonus crop loop</li>
            <li className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">Reworked Daily Operations board with reroll</li>
            <li className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">Sidebar mounts only active tab content</li>
            <li className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm">Notification Center with saved history</li>
          </ul>
        </div>
      </Card>

    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';
export default SettingsTab;
