# 📁 FarmLife Project Structure

**Version:** 4.0.0  
**Last Updated:** January 2024

---

## 🌳 Directory Tree

```
FarmLife/
├── 📄 README.md                    # Comprehensive game documentation
├── 📄 REFACTOR_SUMMARY.md          # Refactoring details and metrics
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 package.json                 # Dependencies and scripts
├── 📄 vite.config.js              # Vite build configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 postcss.config.js           # PostCSS configuration
├── 📄 vitest.config.js            # Vitest test configuration
├── 📄 index.html                  # HTML entry point
│
├── 📁 public/                     # Static assets
│   ├── 📁 icons/
│   │   └── favicon.svg
│   ├── manifest.webmanifest       # PWA manifest
│   └── sw.js                      # Service worker
│
├── 📁 dist/                       # Production build output
│   ├── 📁 assets/                 # Bundled JS and CSS
│   ├── 📁 icons/
│   ├── index.html
│   ├── manifest.webmanifest
│   └── sw.js
│
└── 📁 src/                        # Source code
    ├── 📄 main.jsx                # Application entry point
    ├── 📄 index.css               # Global styles
    │
    └── 📁 components/             # React components
        │
        ├── 📄 GameErrorBoundary.jsx    # Error handling wrapper
        │
        ├── 📁 ui/                      # Reusable UI primitives
        │   ├── badge.jsx              # Badge component
        │   ├── button.jsx             # Button component
        │   ├── card.jsx               # Card component
        │   ├── input.jsx              # Input component
        │   ├── progress.jsx           # Progress bar component
        │   ├── tabs.jsx               # Tabs component
        │   ├── Notifications.jsx      # Generic notification system
        │   └── CommunityNotifications.jsx
        │
        └── 📁 farm-sim/                # ⭐ Main game module
            ├── 📄 README.md           # Architecture documentation
            │
            ├── 📁 core/               # Game orchestration
            │   └── FarmSim.jsx        # Main game component
            │
            ├── 📁 context/            # State management
            │   └── GameContext.jsx    # React Context + useReducer
            │
            ├── 📁 systems/            # Game logic systems (8 systems)
            │   ├── FarmingSystem.js      # Crop growth, planting, harvesting
            │   ├── WeatherSystem.js      # Weather simulation & effects
            │   ├── EconomicSystem.js     # Market dynamics & pricing
            │   ├── AchievementSystem.js  # Achievement tracking
            │   ├── DiseaseSystem.js      # Disease mechanics
            │   ├── DisasterSystem.js     # Natural disasters
            │   ├── QuestSystem.js        # Daily quest generation
            │   └── SoundSystem.js        # Audio management
            │
            ├── 📁 constants/          # Game data & configuration (7 files)
            │   ├── cropData.js           # Crop definitions
            │   ├── buildingData.js       # Building types
            │   ├── achievementData.js    # Achievement definitions
            │   ├── diseaseData.js        # Disease types
            │   ├── disasterData.js       # Disaster types
            │   ├── mysterySeedData.js    # Mystery shop items
            │   └── prestigeData.js       # Prestige system data
            │
            └── 📁 ui/                 # UI components
                ├── GameHeader.jsx        # Top bar with stats & controls
                ├── FarmGrid.jsx          # Interactive farm plot grid
                ├── GameSidebar.jsx       # Tab navigation sidebar
                ├── NotificationSystem.jsx # Toast notifications
                ├── ParticleEffect.jsx    # Visual effects
                ├── WeatherEffects.jsx    # Weather animations
                │
                └── 📁 tabs/              # Game interface tabs (19 tabs)
                    ├── FarmingTab.jsx             # Crop selection & quick actions
                    ├── InventoryTab.jsx           # Item management
                    ├── ShopTab.jsx                # Purchase items
                    ├── BuildingsTab.jsx           # Construct buildings
                    ├── ResearchTab.jsx            # Technology research
                    ├── GeneticsTab.jsx            # Crop breeding
                    ├── WeatherTab.jsx             # Weather forecast & mini-game
                    ├── PetsTab.jsx                # Pet adoption & care
                    ├── DailyQuestsTab.jsx         # Daily challenges
                    ├── DiseaseManagementTab.jsx   # Monitor & treat diseases
                    ├── ProcessingTab.jsx          # Crop processing
                    ├── EventsTab.jsx              # Seasonal events
                    ├── AchievementsTab.jsx        # Achievement tracking
                    ├── SocialTab.jsx              # Friends & leaderboard
                    ├── ExpandTab.jsx              # Farm expansion
                    ├── MysteryShopTab.jsx         # Special rare items
                    ├── ChallengesTab.jsx          # Challenge mode
                    ├── AnalyticsTab.jsx           # Statistics & insights
                    └── SettingsTab.jsx            # Game configuration
```

---

## 📊 File Statistics

### Total Files by Category

| Category | Count | Description |
|----------|-------|-------------|
| **Documentation** | 3 | README, summaries, guides |
| **Configuration** | 5 | Build, style, test configs |
| **Core Systems** | 8 | Game logic systems |
| **Game Data** | 7 | Constants and definitions |
| **UI Components** | 26 | React components (19 tabs + 7 shared) |
| **Entry Points** | 2 | main.jsx, index.html |
| **Assets** | 3 | Icons, manifests, service workers |
| **Total Source** | ~50 | Active source files |

---

## 🏗️ Architecture Layers

### Layer 1: Entry Point
```
index.html → main.jsx → GameErrorBoundary → FarmSim
```

### Layer 2: Game Core
```
FarmSim.jsx
├── GameProvider (Context)
├── Systems (Game Logic)
└── UI Components
```

### Layer 3: State Management
```
GameContext.jsx
├── State (useReducer)
├── Actions (dispatch)
└── Save/Load (localStorage)
```

### Layer 4: Game Systems
```
8 Independent Systems:
├── FarmingSystem    (crop lifecycle)
├── WeatherSystem    (weather simulation)
├── EconomicSystem   (market dynamics)
├── AchievementSystem (progress tracking)
├── DiseaseSystem    (health mechanics)
├── DisasterSystem   (random events)
├── QuestSystem      (daily challenges)
└── SoundSystem      (audio)
```

### Layer 5: User Interface
```
UI Components:
├── GameHeader       (stats & controls)
├── FarmGrid         (interactive farm)
├── GameSidebar      (tabs navigation)
├── NotificationSystem (alerts)
└── 19 Specialized Tabs
```

---

## 📦 Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",           // UI framework
  "react-dom": "^18.2.0",       // DOM rendering
  "lucide-react": "^0.539.0"    // Icon library
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.0.0",      // Vite React plugin
  "@testing-library/react": "^13.4.0",   // Testing utilities
  "@testing-library/jest-dom": "^5.16.5", // Testing matchers
  "@vitest/ui": "^0.34.6",               // Test UI
  "@vitest/coverage-v8": "^0.34.6",      // Coverage reports
  "tailwindcss": "^3.3.0",               // CSS framework
  "autoprefixer": "^10.4.0",             // CSS prefixing
  "postcss": "^8.4.0",                   // CSS processing
  "vite": "^4.0.0",                      // Build tool
  "vitest": "^0.34.6",                   // Testing framework
  "jsdom": "^22.1.0"                     // DOM simulation
}
```

---

## 🎯 Component Responsibilities

### Core Components

#### `FarmSim.jsx`
- **Purpose:** Main game orchestrator
- **Responsibilities:**
  - Initialize game systems
  - Coordinate system updates
  - Render game layout
  - Manage game loop

#### `GameContext.jsx`
- **Purpose:** Centralized state management
- **Responsibilities:**
  - Define game state structure
  - Implement reducer logic
  - Provide actions to components
  - Handle save/load persistence

#### `GameHeader.jsx`
- **Purpose:** Top navigation bar
- **Responsibilities:**
  - Display player stats (gold, level, XP)
  - Show current weather
  - Provide quick action buttons
  - Display game time/season

#### `FarmGrid.jsx`
- **Purpose:** Interactive farm visualization
- **Responsibilities:**
  - Render farm plots
  - Handle plot interactions
  - Show crop growth progress
  - Display plot states (empty, growing, ready, withered)

#### `GameSidebar.jsx`
- **Purpose:** Tab navigation
- **Responsibilities:**
  - Render tab buttons
  - Manage active tab state
  - Display tab content
  - Mobile-responsive layout

#### `NotificationSystem.jsx`
- **Purpose:** User feedback
- **Responsibilities:**
  - Display toast notifications
  - Auto-dismiss after timeout
  - Queue multiple notifications
  - Different types (success, error, info)

---

## 🧩 System Interactions

### Game Loop Flow
```
1. User Action (click, button press)
   ↓
2. GameContext Action (dispatch)
   ↓
3. Reducer Updates State
   ↓
4. Components Re-render (memoized)
   ↓
5. Systems Update (every 100ms)
   ↓
6. Auto-save (every 30s)
```

### System Dependencies
```
FarmingSystem
├── Depends on: WeatherSystem (growth modifiers)
├── Depends on: DiseaseSystem (health checks)
└── Triggers: AchievementSystem (harvest events)

WeatherSystem
├── Triggers: DiseaseSystem (infection rates)
├── Triggers: DisasterSystem (weather events)
└── Independent update cycle

EconomicSystem
├── Depends on: FarmingSystem (supply/demand)
└── Independent price updates

AchievementSystem
├── Listens to: All systems (event tracking)
└── No dependencies
```

---

## 🎨 Styling Architecture

### Tailwind CSS Utility Classes
```
Global styles: src/index.css
Component styles: Inline Tailwind classes
Theme: tailwind.config.js
```

### Color Palette
- **Primary:** Green tones (farm theme)
- **Secondary:** Blue tones (sky/water)
- **Accent:** Amber/yellow (gold/sun)
- **States:**
  - Success: Green
  - Warning: Orange
  - Danger: Red
  - Info: Blue

---

## 🔧 Build Configuration

### Development
```bash
npm run dev
# Vite dev server on http://localhost:5173
# Hot module replacement (HMR)
# Fast refresh for React
```

### Production
```bash
npm run build
# Output: dist/
# Minified and optimized
# Code splitting enabled
# ~237 KB main bundle
# ~24 lazy-loaded chunks
```

### Preview
```bash
npm run preview
# Preview production build locally
# http://localhost:4173
```

---

## 📈 Performance Metrics

### Bundle Analysis
```
Main Bundle:     237 KB (gzipped: 72 KB)
CSS:             55 KB (gzipped: 10 KB)
Lazy Chunks:     24 chunks (2-14 KB each)
Total:           ~400 KB (gzipped: ~150 KB)
```

### Render Performance
```
Target FPS:      60
System Updates:  10 Hz (every 100ms)
Auto-save:       Every 30 seconds
Component Memo:  Yes (React.memo)
```

---

## 🧪 Testing Structure

### Test Configuration
```
Framework:       Vitest
Environment:     jsdom (browser simulation)
Coverage:        v8 provider
UI:              @vitest/ui
```

### Test Categories
1. **Unit Tests** - Individual functions/components
2. **Integration Tests** - System interactions
3. **Smoke Tests** - Basic functionality checks
4. **Performance Tests** - Render performance

---

## 🚀 Deployment

### Build Output (`dist/`)
```
dist/
├── index.html              # Entry HTML
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker
├── icons/                  # App icons
└── assets/                 # Bundled JS/CSS
    ├── index-[hash].js     # Main bundle
    ├── index-[hash].css    # Styles
    └── [tab]-[hash].js     # Lazy chunks
```

### Deployment Platforms
- ✅ **Vercel** - Recommended (auto-deploy)
- ✅ **Netlify** - Static hosting
- ✅ **GitHub Pages** - Free hosting
- ✅ **Any static host** - Universal compatibility

---

## 📝 Naming Conventions

### Files
- **Components:** PascalCase (e.g., `FarmGrid.jsx`)
- **Systems:** PascalCase (e.g., `FarmingSystem.js`)
- **Constants:** camelCase (e.g., `cropData.js`)
- **Styles:** kebab-case (e.g., `index.css`)
- **Config:** kebab-case (e.g., `vite.config.js`)

### Code
- **Components:** PascalCase (e.g., `FarmGrid`)
- **Functions:** camelCase (e.g., `harvestCrop`)
- **Constants:** UPPER_CASE (e.g., `CROP_TYPES`)
- **Variables:** camelCase (e.g., `cropData`)
- **CSS Classes:** kebab-case (e.g., `farm-grid`)

---

## 🎯 Design Principles

1. **Modular Architecture**
   - Each system is independent
   - Clear separation of concerns
   - Easy to test and maintain

2. **Component Hierarchy**
   - Top-down data flow
   - Props down, events up
   - Context for global state

3. **Performance First**
   - Memoized components
   - Code splitting
   - Lazy loading
   - Efficient re-renders

4. **Developer Experience**
   - Clear file structure
   - Consistent naming
   - Comprehensive docs
   - Easy navigation

5. **Scalability**
   - Add systems without breaking existing
   - New tabs are isolated
   - Data-driven configurations
   - Extensible architecture

---

## 🔍 Quick Reference

### Adding a New Game Tab
1. Create `NewTab.jsx` in `src/components/farm-sim/ui/tabs/`
2. Import in `GameSidebar.jsx`
3. Add to tabs array
4. Tab automatically appears in sidebar

### Adding a New Game System
1. Create `NewSystem.js` in `src/components/farm-sim/systems/`
2. Implement `update(state)` method
3. Import in `FarmSim.jsx`
4. Add to system initialization
5. Call `update()` in game loop

### Adding Game Data
1. Create `newData.js` in `src/components/farm-sim/constants/`
2. Export data structure
3. Import where needed
4. Data drives UI/logic

### Modifying State
1. Add state to `GameContext.jsx` initial state
2. Add action type constant
3. Implement reducer case
4. Create action creator
5. Use in components via `actions.newAction()`

---

## 📚 Further Reading

- **Architecture Guide:** `src/components/farm-sim/README.md`
- **Refactor Details:** `REFACTOR_SUMMARY.md`
- **Game Documentation:** `README.md`

---

**Project structure optimized for clarity, scalability, and maintainability! 🎉**

*Last updated: January 2024*

