import React, { memo, useCallback, useState } from 'react';
import { useGameActions, useGameSelector, useGameStore } from '../../context/GameContext';
import { SAVE_KEY } from '../../context/GamePersistence';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { APP_VERSION, getReleaseModeLabel } from '../../../../config/release';

// Subcomponents
import { AudioSettings } from './settings/AudioSettings';
import { SaveLoadSettings } from './settings/SaveLoadSettings';
import { GameplaySettings } from './settings/GameplaySettings';
import { GameStats } from './settings/GameStats';

const SettingsTab = memo(() => {
  const actions = useGameActions();
  const store = useGameStore();
  const settings = useGameSelector((state) => state.settings || {});
  const paused = useGameSelector((state) => Boolean(state.gameLoop?.paused));
  const fps = useGameSelector((state) => state.gameLoop?.fps || 0);
  const [soundVolume, setSoundVolume] = useState(0.3);
  const [musicVolume, setMusicVolume] = useState(0.15);

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
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
      } catch (error) {
        addNotification('Failed to reset game', 'error');
      }
    }
  }, [addNotification]);

  const handleExportSave = useCallback(() => {
    try {
      const saveData = JSON.stringify(store.getState(), null, 2);
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
          localStorage.setItem(SAVE_KEY, JSON.stringify(importedData));
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
        // Clear all localStorage except save
        const saveData = localStorage.getItem(SAVE_KEY);
        localStorage.clear();
        if (saveData) {
          localStorage.setItem(SAVE_KEY, saveData);
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
      {/* Game Controls Header (Kept inline as it's simple) */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">⚙️ Game Settings</h3>

        <div className="space-y-3">
          {/* Pause/Resume */}
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <div>
              <div className="font-medium">Game Status</div>
              <div className="text-sm text-gray-600">
                {paused ? 'Game is paused' : 'Game is running'}
              </div>
            </div>
            <Button
              onClick={handleTogglePause}
              variant={paused ? 'default' : 'outline'}
            >
              {paused ? '▶️ Resume' : '⏸️ Pause'}
            </Button>
          </div>

          {/* FPS Display */}
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <div>
              <div className="font-medium">Performance</div>
              <div className="text-sm text-gray-600">Current frame rate</div>
            </div>
            <Badge variant="outline" className="text-lg">
              {fps} FPS
            </Badge>
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

      {/* Keyboard Shortcuts */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">⌨️ Keyboard Shortcuts</h4>
          <Button
            onClick={handleToggleKeyboardShortcuts}
            variant={keyboardShortcutsEnabled ? 'default' : 'outline'}
            size="sm"
          >
            {keyboardShortcutsEnabled ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Switch Tabs</span>
            <Badge variant="outline" className="font-mono">1 – 9</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Pause/Resume Game</span>
            <Badge variant="outline" className="font-mono">Space</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Fishing Controls</span>
            <Badge variant="outline" className="font-mono">A / D</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Select Multiple Plots</span>
            <Badge variant="outline" className="font-mono">Shift + Click</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Quick Save</span>
            <Badge variant="outline" className="font-mono">Ctrl + S</Badge>
          </div>
          <div className="border-t border-blue-100 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Water All</span>
            <Badge variant="outline" className="font-mono">W</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Harvest All</span>
            <Badge variant="outline" className="font-mono">H</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Fertilize All</span>
            <Badge variant="outline" className="font-mono">F</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Treat Diseases</span>
            <Badge variant="outline" className="font-mono">T</Badge>
          </div>

        </div>
      </Card>

      {/* Tutorial Settings */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
        <h4 className="font-semibold mb-3">🎓 Tutorial</h4>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Reset Tutorial</div>
            <div className="text-sm text-gray-600">Show the onboarding tutorial again</div>
          </div>
          <Button
            onClick={handleResetTutorial}
            variant="outline"
            size="sm"
          >
            Reset Tutorial
          </Button>
        </div>
      </Card>

      {/* Install App */}
      <Card className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50">
        <h4 className="font-semibold mb-3">📲 Install App</h4>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Add to Home Screen</div>
            <div className="text-sm text-gray-600">Install FarmSim as a standalone app</div>
          </div>
          <Button
            onClick={handleInstallApp}
            variant="outline"
            size="sm"
          >
            Install
          </Button>
        </div>
      </Card>

      {/* About (Static) */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <h4 className="font-semibold mb-2 text-green-800">🌾 About FarmSim</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p><strong>Version:</strong> {APP_VERSION}</p>
          <p><strong>Mode:</strong> {getReleaseModeLabel()}</p>
          <p><strong>Made with:</strong> React + Vite + Tailwind CSS</p>
          <p className="pt-2">A comprehensive farm simulation game with modular architecture, sound effects, background music, livestock management, fishing, and endless possibilities!</p>

          <div className="pt-3 border-t border-green-200 mt-3">
            <p className="font-semibold">✨ Recent upgrades:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              <li>🗓️ Weekly Operations milestone rewards</li>
              <li>🔥 Streak-based challenge reward boosts</li>
              <li>📈 Daily Market Focus bonus crop loop</li>
              <li>🎯 Reworked Daily Operations board with reroll</li>
              <li>🚀 Sidebar now mounts only active tab content</li>
              <li>🔔 Notification Center with saved history</li>
              <li>🌾 Inventory quick-sell actions for crops</li>
            </ul>
          </div>
        </div>
      </Card>

    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';
export default SettingsTab;
