import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

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
        localStorage.removeItem('farm_sim_enhanced_v2');
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
          localStorage.setItem('farm_sim_enhanced_v2', JSON.stringify(importedData));
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
        const saveData = localStorage.getItem('farm_sim_enhanced_v2');
        localStorage.clear();
        if (saveData) {
          localStorage.setItem('farm_sim_enhanced_v2', saveData);
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
    const handleKeyPress = (e) => {
      try {
        // Ctrl + S - Quick Save
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          handleSaveGame();
        }
        // Space - Pause/Resume (only if not in input field)
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
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

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.gameLoop?.paused, actions, handleSaveGame]);

  return (
    <div className="space-y-4">
      {/* Game Controls */}
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

      {/* Save/Load */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">💾 Save & Load</h4>
        
        <div className="space-y-2">
          <Button
            onClick={handleSaveGame}
            className="w-full"
            variant="outline"
          >
            💾 Save Game
          </Button>

          <Button
            onClick={handleLoadGame}
            className="w-full"
            variant="outline"
          >
            📂 Load Game
          </Button>

          <Button
            onClick={handleExportSave}
            className="w-full"
            variant="outline"
          >
            📤 Export Save File
          </Button>

          <Button
            onClick={handleImportSave}
            className="w-full"
            variant="outline"
          >
            📥 Import Save File
          </Button>

          <div className="pt-2 border-t">
            <Button
              onClick={handleClearCache}
              className="w-full"
              variant="outline"
            >
              🗑️ Clear Cache
            </Button>
            
            <Button
              onClick={handleResetGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
              variant="destructive"
            >
              🔄 Reset Farm (Delete All Data)
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🎛️ Preferences</h4>
        
        <div className="space-y-3">
          {/* Auto-save */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Auto-Save</div>
              <div className="text-sm text-gray-600">Save every 30 seconds</div>
            </div>
            <button
              onClick={handleToggleAutoSave}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.autoSave ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.autoSave ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Sound Effects</div>
              <div className="text-sm text-gray-600">Enable game sounds</div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.soundEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Music */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Background Music</div>
              <div className="text-sm text-gray-600">Seasonal music themes</div>
            </div>
            <button
              onClick={handleToggleMusic}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.musicEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.musicEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Animations */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Animations</div>
              <div className="text-sm text-gray-600">Enable UI animations</div>
            </div>
            <button
              onClick={handleToggleAnimations}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.animationsEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Volume Controls */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🔊 Volume Controls</h4>
        
        <div className="space-y-4">
          {/* Sound Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Sound Effects Volume</span>
              <span className="text-gray-600">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              disabled={!state.settings.soundEnabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Music Volume</span>
              <span className="text-gray-600">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.025"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!state.settings.musicEnabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-500">
              🎵 Music theme changes with seasons
            </div>
          </div>
        </div>
      </Card>

      {/* Game Stats */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">📊 Game Statistics</h4>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">{state.level}</div>
            <div className="text-gray-600">Farm Level</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-yellow-600">{state.coins}🪙</div>
            <div className="text-gray-600">Total Coins</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-blue-600">{state.xp} XP</div>
            <div className="text-gray-600">Experience</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-purple-600">{state.gridSize}×{state.gridSize}</div>
            <div className="text-gray-600">Farm Size</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-amber-600">{state.livestock?.animals?.length || 0}</div>
            <div className="text-gray-600">Animals</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-cyan-600">{state.fishing?.stats?.totalCaught || 0}</div>
            <div className="text-gray-600">Fish Caught</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-pink-600">{state.season?.current || 'spring'}</div>
            <div className="text-gray-600 capitalize">Current Season</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-gray-600">{state.weather || 'sunny'}</div>
            <div className="text-gray-600 capitalize">Weather</div>
          </div>
        </div>
      </Card>
      
      {/* Gameplay Settings */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🎮 Gameplay Settings</h4>
        
        <div className="space-y-3">
          {/* Show Tutorial */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Show Tooltips</div>
              <div className="text-sm text-gray-600">Display helpful hints</div>
            </div>
            <button
              onClick={() => actions.updateSettings({
                showTooltips: !state.settings.showTooltips
              })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${(state.settings.showTooltips !== false) ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${(state.settings.showTooltips !== false) ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Fast Mode */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Fast Mode</div>
              <div className="text-sm text-gray-600">2x growth speed (for testing)</div>
            </div>
            <button
              onClick={() => actions.updateSettings({
                fastMode: !state.settings.fastMode
              })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.fastMode ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.fastMode ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Particle Effects */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Particle Effects</div>
              <div className="text-sm text-gray-600">Show harvest & level-up particles</div>
            </div>
            <button
              onClick={() => actions.updateSettings({
                particleEffects: !state.settings.particleEffects
              })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${(state.settings.particleEffects !== false) ? 'bg-green-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${(state.settings.particleEffects !== false) ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
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

      {/* About */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <h4 className="font-semibold mb-2 text-green-800">🌾 About FarmSim</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p><strong>Version:</strong> 4.2.0</p>
          <p><strong>Made with:</strong> React + Vite + Tailwind CSS</p>
          <p className="pt-2">A comprehensive farm simulation game with modular architecture, sound effects, background music, livestock management, fishing, and endless possibilities!</p>
          
          <div className="pt-3 border-t border-green-200 mt-3">
            <p className="font-semibold">✨ New in v4.2.0:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              <li>🎵 Sound effects & seasonal music</li>
              <li>🐄 Livestock management system</li>
              <li>🎣 Fishing mini-game</li>
              <li>🔊 Volume controls</li>
            </ul>
          </div>
        </div>
      </Card>

    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';
export default SettingsTab;
