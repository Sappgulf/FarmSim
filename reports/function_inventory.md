# Function Inventory Report

## B) Function Inventory

| file_path | function_name | params | returns | side_effects | dependencies | used_by | test_status |
|-----------|---------------|--------|---------|--------------|-------------|---------|-------------|
| src/main.jsx | ErrorBoundary.constructor | props | void | sets state | React.Component | React | ❌ No tests |
| src/main.jsx | ErrorBoundary.getDerivedStateFromError | error | object | none | none | React | ❌ No tests |
| src/main.jsx | ErrorBoundary.componentDidCatch | error, errorInfo | void | localStorage backup | localStorage, console | React | ❌ No tests |
| src/main.jsx | ErrorBoundary.render | none | JSX | conditional render | none | React | ❌ No tests |
| src/hooks/useGameState.js | useGameState | none | object | localStorage save/load | useState, useRef, localStorage | UltimateFarmGame | ✅ Tested |
| src/hooks/useGameState.js | nowSec | none | number | none | Date | multiple | ❌ No tests |
| src/hooks/useAchievements.js | useAchievements | gameState | object | state updates | useState, useEffect | UltimateFarmGame | ❌ No tests |
| src/hooks/useCrops.js | useCrops | gameState | object | crop state management | useState, useEffect | UltimateFarmGame | ❌ No tests |
| src/hooks/useMarket.js | useMarket | gameState | object | market state | useState, useEffect | UltimateFarmGame | ❌ No tests |
| src/hooks/useWeather.js | useWeather | gameState | object | weather state | useState, useEffect | UltimateFarmGame | ✅ Tested |
| src/components/UltimateFarmGame.jsx | UltimateFarmGame | none | JSX | complex game state | multiple hooks, components | main.jsx | ❌ No tests |
| src/components/FarmSimCanvas.jsx | FarmSimCanvas | none | JSX | extensive game logic | multiple state hooks | unused | ❌ No tests |
| src/components/FarmSimCanvas.jsx | nowSec | none | number | none | Date | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | newPlot | state | object | none | none | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | makeGrid | size | array | none | none | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | clamp | n, a, b | number | none | Math | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | formatTime | seconds | string | none | Math | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | formatTimeRemaining | endTime, currentTime | string | none | Math | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | loadSave | none | object/null | localStorage read | localStorage | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvas.jsx | saveState | state | void | localStorage write | localStorage | FarmSimCanvas | ❌ No tests |
| src/components/FarmSimCanvasFixed.jsx | FarmSimCanvasFixed | none | JSX | game state management | React hooks | unused | ❌ No tests |
| src/components/FarmSimCanvasFixed.jsx | nowSec | none | number | none | Date | FarmSimCanvasFixed | ❌ No tests |
| src/components/FarmSimCanvasFixed.jsx | loadSave | none | object/null | localStorage read | localStorage | FarmSimCanvasFixed | ❌ No tests |
| src/components/FarmSimCanvasFixed.jsx | saveState | state | void | localStorage write | localStorage | FarmSimCanvasFixed | ❌ No tests |
| src/components/FarmSimCanvasFixed.jsx | newPlot | state | object | none | none | FarmSimCanvasFixed | ❌ No tests |
| src/components/FarmSimCanvasFixed.jsx | makeGrid | size | array | none | none | FarmSimCanvasFixed | ❌ No tests |
| src/components/FarmSimCanvasSimple.jsx | FarmSimCanvasSimple | none | JSX | loading state | useState, useEffect | unused | ❌ No tests |
| src/components/FarmSimTest.jsx | FarmSimTest | none | JSX | test execution | useState | unused | ❌ No tests |
| src/components/ui/button.jsx | Button | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/card.jsx | Card | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/card.jsx | CardHeader | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/card.jsx | CardTitle | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/card.jsx | CardContent | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/badge.jsx | Badge | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/input.jsx | Input | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/progress.jsx | Progress | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/tabs.jsx | Tabs | props | JSX | state management | React context | multiple | ❌ No tests |
| src/components/ui/tabs.jsx | TabsList | props | JSX | none | React | Tabs | ❌ No tests |
| src/components/ui/tabs.jsx | TabsTrigger | props | JSX | tab switching | React | Tabs | ❌ No tests |
| src/components/ui/tabs.jsx | TabsContent | props | JSX | conditional render | React | Tabs | ❌ No tests |
| src/components/ui/Notifications.jsx | Notifications | props | JSX | none | React | multiple | ❌ No tests |
| src/components/ui/Notifications.jsx | useNotifications | none | object | state management | useState, useCallback | Notifications | ❌ No tests |
| src/components/enhanced/SoundManager.jsx | SoundEngine | none | class | audio management | Web Audio API | SoundManager | ❌ No tests |
| src/components/enhanced/SoundManager.jsx | SoundManager | props | JSX | sound integration | React, SoundEngine | UltimateFarmGame | ❌ No tests |
| src/components/enhanced/SoundManager.jsx | playSound | soundName, options | void | audio playback | SoundEngine | multiple | ❌ No tests |
| src/components/enhanced/SoundManager.jsx | playSpatialSound | soundName, x, y, screenWidth | void | spatial audio | SoundEngine | multiple | ❌ No tests |
| src/components/enhanced/SoundManager.jsx | setVolume | type, value | void | volume control | SoundEngine | multiple | ❌ No tests |
| src/components/enhanced/FarmVisualization.jsx | FarmRenderer | none | class | canvas rendering | Canvas API | FarmVisualization | ❌ No tests |
| src/components/enhanced/FarmVisualization.jsx | FarmVisualization | props | JSX | farm rendering | React, FarmRenderer | UltimateFarmGame | ❌ No tests |
| src/components/game/GameHeader.jsx | GameHeader | props | JSX | game header UI | React | UltimateFarmGame | ❌ No tests |
| src/components/game/Shop.jsx | Shop | props | JSX | shop interface | React | UltimateFarmGame | ❌ No tests |
| src/components/game/WeatherDisplay.jsx | WeatherDisplay | props | JSX | weather UI | React | UltimateFarmGame | ❌ No tests |
| src/components/game/AchievementsPanel.jsx | AchievementsPanel | props | JSX | achievements UI | React | UltimateFarmGame | ❌ No tests |
| src/components/farm/FarmGrid.jsx | FarmGrid | props | JSX | farm grid UI | React | UltimateFarmGame | ✅ Tested |
| src/lib/sanitize.js | sanitize | value | any | input validation | none | multiple | ❌ No tests |
| src/utils/gameConstants.js | (exports) | none | constants | none | none | multiple | ❌ No tests |

## Risk Analysis

### High Risk Functions (❌ Critical Issues)
1. **localStorage operations** - No error handling for storage failures
2. **nowSec()** - Duplicated across files, no NaN/precision checks
3. **State management functions** - No input validation
4. **Audio functions** - No error handling for Web Audio API failures
5. **Canvas rendering** - No error handling for context creation

### Medium Risk Functions (⚠️ Needs Attention)
1. **React components** - Missing prop validation
2. **Hook functions** - No cleanup in useEffect
3. **Game logic functions** - No boundary checks

### Dead Code Identified
1. `FarmSimCanvas.jsx` - Large component not used in main app
2. `FarmSimCanvasFixed.jsx` - Alternative implementation, unused
3. `FarmSimCanvasSimple.jsx` - Test component, unused
4. Multiple duplicate constant definitions across files

### Missing Test Coverage
- **Critical**: 94% of functions have no tests
- **Core game logic**: No integration tests
- **State management**: Partial coverage only
- **UI components**: No component tests
