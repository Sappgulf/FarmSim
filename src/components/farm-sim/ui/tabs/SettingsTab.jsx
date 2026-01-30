import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

// Subcomponents
import { AudioSettings } from './settings/AudioSettings';
import { SaveLoadSettings } from './settings/SaveLoadSettings';
import { GameplaySettings } from './settings/GameplaySettings';
import { GameStats } from './settings/GameStats';
import { resetTutorial } from '../../ui/Tutorial';
import { SAVE_BACKUP_KEY, SAVE_KEY } from '../../context/GamePersistence';
import { addTrackedEventListener } from '../../services/EventListenerService';

const SettingsTab = memo(() => {
  const { state, actions } = useGame();
  const [soundVolume, setSoundVolume] = React.useState(0.3);
  const [musicVolume, setMusicVolume] = React.useState(0.15);

  const handleToggleSound = () => {
    const newState = !state.settings.soundEnabled;
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

    actions.addNotification({
      message: `Sound ${newState ? 'enabled 🔊' : 'disabled 🔇'}`,
      type: 'info'
    });
  };

  const handleToggleMusic = () => {
    const newState = !state.settings.musicEnabled;
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

    actions.addNotification({
      message: `Music ${newState ? 'enabled 🎵' : 'disabled 🔇'}`,
      type: 'info'
    });
  };

  const handleSoundVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setSoundVolume(volume);
    if (typeof window !== 'undefined' && window.soundSystem) {
      window.soundSystem.setVolume(volume);
      window.soundSystem.playClickSound();
    }
  };

  const handleMusicVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
    if (typeof window !== 'undefined' && window.musicSystem) {
      window.musicSystem.setVolume(volume);
    }
  };

  const handleToggleAnimations = () => {
    actions.updateSettings({
      animationsEnabled: !state.settings.animationsEnabled
    });
    actions.addNotification({
      message: `Animations ${!state.settings.animationsEnabled ? 'enabled' : 'disabled'}`,
      type: 'info'
    });
  };

  const handleToggleAutoSave = () => {
    actions.updateSettings({
      autoSave: !state.settings.autoSave
    });
    actions.addNotification({
      message: `Auto-save ${!state.settings.autoSave ? 'enabled' : 'disabled'}`,
      type: 'info'
    });
  };

  const handleSaveGame = () => {
    const success = actions.saveGame();
    if (success) {
      actions.addNotification({
        message: '💾 Game saved successfully!',
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: '❌ Failed to save game',
        type: 'error'
      });
    }
  };

  const handleLoadGame = () => {
    const success = actions.loadGame();
    if (success) {
      actions.addNotification({
        message: '📂 Game loaded successfully!',
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: '⚠️ No saved game found',
        type: 'warning'
      });
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset your farm? This cannot be undone!')) {
      try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(SAVE_BACKUP_KEY);
        window.location.reload();
      } catch (error) {
        actions.addNotification({
          message: 'Failed to reset game',
          type: 'error'
        });
      }
    }
  };

  const handleExportSave = () => {
    try {
      const saveData = JSON.stringify(state, null, 2);
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farmsim-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      actions.addNotification({
        message: '📤 Save exported successfully!',
        type: 'success'
      });
    } catch (error) {
      actions.addNotification({
        message: 'Failed to export save',
        type: 'error'
      });
    }
  };

  const handleImportSave = () => {
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
          const existingSave = localStorage.getItem(SAVE_KEY);
          if (existingSave) {
            localStorage.setItem(SAVE_BACKUP_KEY, existingSave);
          }
          localStorage.setItem(SAVE_KEY, JSON.stringify(importedData));
          actions.addNotification({
            message: '📥 Save imported! Reloading...',
            type: 'success'
          });
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          actions.addNotification({
            message: 'Invalid save file format',
            type: 'error'
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all cached data? Your save will remain intact.')) {
      try {
        // Clear all localStorage except save
        const saveData = localStorage.getItem(SAVE_KEY);
        const backupData = localStorage.getItem(SAVE_BACKUP_KEY);
        localStorage.clear();
        if (saveData) {
          localStorage.setItem(SAVE_KEY, saveData);
        }
        if (backupData) {
          localStorage.setItem(SAVE_BACKUP_KEY, backupData);
        }
        actions.addNotification({
          message: '🗑️ Cache cleared successfully!',
          type: 'success'
        });
      } catch (error) {
        actions.addNotification({
          message: 'Failed to clear cache',
          type: 'error'
        });
      }
    }
  };

  // Keyboard shortcuts - added after all handlers are defined
  React.useEffect(() => {
    const isEditableTarget = (target) => {
      if (!target || typeof target !== 'object') return false;
      const tagName = target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tagName)) return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const handleKeyPress = (e) => {
      try {
        const targetIsEditable = isEditableTarget(e.target);
        // Ctrl + S - Quick Save
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          handleSaveGame();
        }
        // Space - Pause/Resume (only if not in input field)
        if (e.key === ' ' && !targetIsEditable) {
          e.preventDefault();
          if (state.gameLoop?.paused) {
            actions.resumeGame();
          } else {
            actions.pauseGame();
          }
        }
      } catch (error) {
        console.error('[farm]', 'Settings: Keyboard shortcut error', error);
      }
    };

    return addTrackedEventListener(window, 'keydown', handleKeyPress);
  }, [state.gameLoop?.paused, actions, handleSaveGame]);

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
                {state.gameLoop.paused ? 'Game is paused' : 'Game is running'}
              </div>
            </div>
            <Button
              onClick={state.gameLoop.paused ? actions.resumeGame : actions.pauseGame}
              variant={state.gameLoop.paused ? 'default' : 'outline'}
            >
              {state.gameLoop.paused ? '▶️ Resume' : '⏸️ Pause'}
            </Button>
          </div>

          {/* FPS Display */}
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <div>
              <div className="font-medium">Performance</div>
              <div className="text-sm text-gray-600">Current frame rate</div>
            </div>
            <Badge variant="outline" className="text-lg">
              {state.gameLoop.fps} FPS
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
        state={state}
        actions={actions}
        handleToggleAnimations={handleToggleAnimations}
        handleToggleAutoSave={handleToggleAutoSave}
      />

      <AudioSettings
        state={state}
        handleToggleSound={handleToggleSound}
        handleToggleMusic={handleToggleMusic}
        handleSoundVolumeChange={handleSoundVolumeChange}
        handleMusicVolumeChange={handleMusicVolumeChange}
        soundVolume={soundVolume}
        musicVolume={musicVolume}
      />

      <GameStats state={state} />

      {/* Keyboard Shortcuts (Static) */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h4 className="font-semibold mb-3">⌨️ Keyboard Shortcuts</h4>

        <div className="space-y-2 text-sm">
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
            onClick={() => {
              resetTutorial();
              actions.addNotification({
                message: '🎓 Tutorial reset! Refresh to see it again.',
                type: 'success'
              });
            }}
            variant="outline"
            size="sm"
          >
            Reset Tutorial
          </Button>
        </div>
      </Card>

      {/* About (Static) */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <h4 className="font-semibold mb-2 text-green-800">🌾 About FarmSim</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p><strong>Version:</strong> 4.6.0</p>
          <p><strong>Made with:</strong> React + Vite + Tailwind CSS</p>
          <p className="pt-2">A comprehensive farm simulation game with modular architecture, sound effects, background music, livestock management, fishing, and endless possibilities!</p>

          <div className="pt-3 border-t border-green-200 mt-3">
            <p className="font-semibold">✨ New in v4.6.0 (Polish Update)</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              <li>🎨 <strong>Refined Visuals</strong>: Glassmorphism UI & enhanced animations</li>
              <li>🎵 <strong>Audio System</strong>: New sound effects for actions & level ups</li>
              <li>⚡ <strong>Performance</strong>: Modular architecture & optimized visuals</li>
              <li>🚜 <strong>Gameplay</strong>: New crop selection grid & improved shop logic</li>
            </ul>
          </div>
        </div>
      </Card>

    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';
export default SettingsTab;
