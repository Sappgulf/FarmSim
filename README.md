# 🌾 FarmLife - Advanced Farm Simulation Game

**Version: 5.5.5** - *Repo truth, farm rhythm, web shell, and iOS parity polish*

A comprehensive React-based farm simulation game featuring a clean modular architecture, advanced genetic breeding systems, dynamic weather mechanics with real-time visual effects, sophisticated agricultural management tools, processing plants, research systems, pet management, daily quests, seasonal cycles, livestock management, fishing mini-games, procedural sound effects, dynamic background music, and premium visual polish with particle effects and animations.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.6-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.8-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)

---

## 🚀 Quick Start

```bash
# Install web dependencies
npm run install:web

# Start web app from repo root
npm run dev

# Run web tests
npm run test

# Build web app
npm run build

# Preview web build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) to start farming!

Node `22` is the expected local and CI runtime (`.nvmrc`).

### Monorepo Layout

```text
/
├── web/                 # Existing Vite web app
├── ios/                 # Native iOS app (SwiftUI + SpriteKit)
│   ├── App/             # iOS UI target source
│   ├── GameCore/        # Swift package for core sim logic
│   ├── project.yml      # XcodeGen spec
│   └── Makefile         # iOS helper commands
└── shared/
    ├── content/         # Canonical game content JSON
    ├── schema/          # Content/save contracts
    └── vectors/         # Cross-platform deterministic vectors
```

### Web Commands

```bash
# From repo root (forwarded to /web)
npm run dev
npm run test
npm run build

# Or run directly in /web
cd web
npm install
npm run dev
```

### iOS Commands

```bash
# Generate the Xcode project (deterministic from ios/project.yml)
npm run ios:gen

# Build GameCore tests
npm run ios:test:core

# Build app against a generic iOS Simulator destination
npm run ios:build

# Build the small/large lanes; both default to generic simulator builds
npm run ios:build:small
npm run ios:build:large
```

If `xcodegen` is missing:

```bash
brew install xcodegen
```

If you need an explicit simulator target, override the Make destination instead of editing scripts:

```bash
IOS_DESTINATION='platform=iOS Simulator,name=<Installed Device Name>' npm run ios:build
SMALL_DESTINATION='platform=iOS Simulator,name=<Installed Small Device>' npm run ios:build:small
LARGE_DESTINATION='platform=iOS Simulator,name=<Installed Large Device>' npm run ios:build:large
```

### Shared Content Contract

- Canonical content lives in `shared/content`.
- Web content loading uses Vite aliases:
  - `@shared -> ../shared`
  - `@content -> ../shared/content`
- Contract docs:
  - `shared/schema/content-contract.md`
  - `shared/schema/save-contract.md`
  - `shared/schema/save-example.v1.json`
  - `shared/schema/save-example.v16.json`
  - `shared/vectors/sim_vectors.json`

### Add A Crop

1. Edit `shared/content/crops.json` and add a new item in `items[]`.
2. Keep required fields aligned with `shared/schema/content-contract.md`.
3. Run `npm run test`, `npm run build`, and `npm run ios:test:core`.
4. Rebuild iOS (`npm run ios:build`) so bundled shared content refreshes.

### Add/Update Shared Content Item

1. Edit the relevant file in `shared/content` (`decor.json`, `festivals.json`, `research.json`, etc.).
2. Keep field contracts aligned with `shared/schema/content-contract.md`.
3. If save shape changes are required, update:
   - `shared/schema/save-contract.md`
   - `shared/schema/save-example.v16.json`
   - GameCore migration/tests in `ios/GameCore/Sources/GameCore/Persistence.swift` and `ios/GameCore/Tests`.

### iOS Design System Notes

- Runtime design system source:
  - `ios/App/Sources/DesignSystem.swift`
  - `ios/App/Sources/DesignSystem/Typography.swift`
  - `ios/App/Sources/DesignSystem/Components.swift`
- Stable ownership anchor:
  - `ios/FarmSimApp/DesignSystem/`

---

## 🎮 Game Overview

**FarmLife** is an immersive farming simulation where you manage your own virtual farm with realistic agriculture mechanics. Plant crops, breed hybrid varieties, research new technologies, manage pets, battle diseases and disasters, complete daily quests, raise livestock, go fishing, enjoy procedural sound effects and dynamic music, and build advanced agricultural infrastructure.

### Key Features:
- 🏗️ **Modular Architecture** - Clean, scalable React codebase with centralized state management
- 🌱 **Advanced Farming** - Real-time crop growth with visual stages and smooth animations
- 🧬 **Genetics System** - Crossbreed crops to create hybrids with special traits
- 🌦️ **Dynamic Weather** - 7 weather types with real-time visual effects (rain, snow, storms)
- 🍂 **Seasonal Cycles** - 4 seasons with unique bonuses, colors, and transitions
- ✨ **Premium Visual Effects** - Particle systems, ripple effects, and polished animations
- 🏭 **Processing Plants** - Value-added agriculture with 4 processing facilities
- 🎯 **Daily Quests** - Daily challenges with streak bonuses and rewards
- 🦠 **Disease Management** - Combat crop diseases with treatments and resistance
- 🌪️ **Natural Disasters** - Weather events that challenge your farm
- 🐾 **Pet System** - Adopt and care for pets that provide bonuses
- 🏆 **Achievements** - 36+ achievements across 8 categories
- 📊 **Analytics Dashboard** - Track your farm performance and statistics
- 🎵 **Sound Effects System** - Procedural audio feedback for all game actions
- 🎶 **Background Music** - Dynamic seasonal themes with seamless transitions
- 🐄 **Livestock Management** - Raise animals for passive income and products
- 🎣 **Fishing Mini-Game** - Interactive fishing with keyboard controls and rarity system

---

## ✨ Core Systems

### 🏗️ Modular Architecture

The game is built with a **clean, modular architecture** that separates concerns and makes the codebase maintainable and scalable:

```
src/components/farm-sim/
├── core/                    # Main game orchestrator
│   └── FarmSim.jsx         # Entry point with context provider
├── context/                # Centralized state management
│   └── GameContext.jsx     # React Context + useReducer
├── systems/                # Independent game logic systems
│   ├── FarmingSystem.js    # Crop growth and management
│   ├── WeatherSystem.js    # Weather simulation
│   ├── EconomicSystem.js   # Market dynamics
│   ├── AchievementSystem.js# Achievement tracking
│   ├── DiseaseSystem.js    # Disease mechanics
│   ├── DisasterSystem.js   # Natural disasters
│   ├── QuestSystem.js      # Daily quests
│   ├── LivestockSystem.js  # Animal management and production
│   ├── FishingSystem.js    # Fishing mechanics and mini-game
│   ├── SoundSystem.js      # Procedural sound effects
│   └── MusicSystem.js      # Dynamic background music
├── constants/              # Game data and configuration
│   ├── cropData.js         # Crop definitions
│   ├── buildingData.js     # Building types
│   ├── achievementData.js  # Achievement definitions
│   └── ...                 # More data files
└── ui/                     # User interface components
    ├── GameHeader.jsx      # Top bar with stats
    ├── FarmGrid.jsx        # Interactive farm grid
    ├── GameSidebar.jsx     # Tab navigation
    └── tabs/               # 19 specialized game tabs
```

**Benefits:**
- ✅ **Clean Separation** - Each system handles one responsibility
- ✅ **Easy Testing** - Systems can be tested in isolation
- ✅ **Scalability** - Add new features without affecting existing code
- ✅ **Performance** - Optimized with memoization and efficient state updates
- ✅ **Maintainability** - Easy to find and modify specific functionality

### 🌱 Advanced Farming System

**Real-Time Crop Growth with Visual Feedback:**
- ✨ **Animated progress bars** with shine effects showing exact growth percentage
- 🌱 **Visual crop growth** - crops grow taller and change appearance through stages
- 🎉 **"Pop" animation** when crops are ready to harvest
- 🎨 **Color-coded plot states** (empty, growing, ready, withered)
- 👆 **Interactive hover preview** - see what you're planting before you click
- 📦 **Bulk actions** for efficient farm management
- 🗑️ **Click to clear** withered crops from plots

**Harvest Celebration:**
- 💰 **Coin particle effects** that fly upward when harvesting
- 💵 **Floating earnings text** showing exactly how much you made
- 🎊 **Level-up fireworks** with sparkle particles when you level up
- 🤏 **Subtle screen shake** for satisfying tactile feedback

**Crop Quality Tiers:**
- Bronze (1.0x) → Silver (1.2x) → Gold (1.5x) → Platinum (2.0x)
- Higher quality = more valuable harvests
- Upgrade seeds through research and breeding

**Base Crops:**
- 🥕 **Carrot** - Fast-growing starter crop (10s)
- 🥔 **Potato** - Reliable staple crop (15s)
- 🌽 **Corn** - High-value crop (20s)
- 🍅 **Tomato** - Premium crop (25s)

### 🧬 Genetic Breeding System

**Create Hybrid Crops** by combining different varieties:

| Parent 1 | Parent 2 | Hybrid Result | Traits |
|----------|----------|---------------|--------|
| Carrot | Potato | Hardy Root | Fast Growth + Disease Resistant |
| Corn | Tomato | Golden Fruit | High Value + Weather Resistant |
| Carrot | Corn | Super Grain | Fast Growth + Weather Resistant |
| Potato | Tomato | Garden Gem | Disease Resistant + High Value |

**Genetic Traits:**
- 🛡️ **Disease Resistance** - Reduced infection chances
- ⚡ **Fast Growth** - Shorter growth cycles
- 💰 **High Value** - Increased crop worth
- 🌦️ **Weather Resistant** - Protection from weather effects

**Breeding Mechanics:**
1. Plant two different crop types
2. Grow them to maturity
3. Access Genetics Tab
4. Select parent crops
5. Crossbreed to create hybrid seeds
6. Plant hybrids with combined traits!

### 🌦️ Dynamic Weather System

**7 Weather Types** with real-time visual effects:

| Weather | Growth Effect | Disease Risk | Visual Effect |
|---------|--------------|--------------|---------------|
| ☀️ Sunny | +20% | Low | Clear skies, ideal conditions |
| 🌧️ Rainy | +10% | Moderate blight | **Animated rain drops** falling |
| ☁️ Cloudy | 0% | Low | Neutral, no effects |
| 🏜️ Drought | -30% | High stress | Needs irrigation |
| ⛈️ Storm | -20% | Moderate | **Heavy rain + lightning flashes** |
| ❄️ Snow | -40% | Low | **Gentle snowflakes** drifting down |
| 💨 Windy | -10% | Low | Minor effects |

**Weather Features:**
- 🎬 **Real-time visual effects** - See rain, snow, and storms as they happen
- 📅 **3-day forecast** - Plan ahead with weather predictions
- 🎮 **Weather mini-game** - Bonus rewards for correct predictions
- 🔄 **Seasonal weather patterns** - Weather changes based on current season

**Protection Strategies:**
- 🏠 Build **Greenhouses** for complete weather immunity
- 💧 Install **Irrigation Systems** for drought protection
- 🧬 Breed **Weather-Resistant** crops
- 📊 Monitor forecasts to optimize planting

### 🍂 Seasonal Cycle System

**4 Dynamic Seasons** that transform your farm:

| Season | Duration | Growth Speed | Bonuses | Theme |
|--------|----------|--------------|---------|-------|
| 🌸 **Spring** | 2 min | +25% | Disease resistance +10% | Pink & green gradient |
| ☀️ **Summer** | 2 min | +15% | Crop value +30% | Yellow & orange glow |
| 🍂 **Fall** | 2 min | Normal | Crop value +40%, quality +30% | Amber harvest colors |
| ❄️ **Winter** | 2 min | -30% | Disease resistance +30% | Blue & white frost |

**Season Features:**
- 🎨 **Dynamic background colors** - Farm theme changes with each season
- 🎬 **Smooth season transitions** - Full-screen overlay with emoji animation
- 🌦️ **Season-specific weather** - Weather patterns match the season
- 💰 **Strategic bonuses** - Plan harvests around optimal seasons
- ⏱️ **Real-time countdown** - See time remaining until next season

**Strategic Season Planning:**
- **Spring**: Best time to plant for fast growth
- **Summer**: Maximize profits with high crop values
- **Fall**: Perfect harvest season with peak prices and quality
- **Winter**: Focus on disease-resistant crops and planning

### 🏗️ Buildings & Infrastructure

**6 Building Types** with active benefits:

| Building | Cost | Benefits |
|----------|------|----------|
| 🏠 **Greenhouse** | $500 | Weather protection, +10% growth |
| 💧 **Irrigation** | $400 | Drought immunity, +15% growth |
| 🤖 **Automation Hub** | $800 | Auto-harvest, +20% efficiency |
| 🔬 **Research Lab** | $600 | Unlock genetic modifications |
| 🏚️ **Barn** | $450 | House 10 animals, +25% production |
| 🏭 **Silo** | $350 | +50% storage capacity |

### 🏭 Processing System

**Add Value to Your Crops** with 4 processing facilities:

- 🌾 **Flour Mill** - Wheat → Flour (2x value)
- 🥤 **Juice Press** - Tomato → Juice (1.8x value)
- 🌽 **Corn Processor** - Corn → Cornmeal (2.2x value)
- 🥗 **Salad Bar** - Mixed Crops → Salads (3x value)

**Processing Strategy:**
- Build early for profit multiplication
- Time harvests with processing capacity
- Higher quality crops = more valuable processed goods

### 🎯 Daily Quests System

**Complete Daily Challenges** for rewards:

- 🎯 **Daily Goals** - Harvest X crops, earn Y gold, plant Z seeds
- 🔥 **Streak Bonuses** - Consecutive days increase rewards
- 🏆 **Quest Rewards** - Gold, XP, and special items
- ⏰ **Daily Reset** - New quests every 24 hours
- 📊 **Progress Tracking** - Real-time countdown and completion %

### 🦠 Disease Management

**3 Disease Types:**
- 🍄 **Crop Blight** - Fungal infection (treat with fungicide)
- 🐛 **Pest Infestation** - Insect damage (treat with pesticide)
- 😰 **Crop Stress** - Environmental damage (requires care)

**Treatment Options:**
- 💊 **Fungicide** (3 uses) - Cures blight
- 🔫 **Pesticide** (3 uses) - Eliminates pests
- 🧬 **Breed Resistant Crops** - Natural immunity
- 🏠 **Build Greenhouses** - Environmental protection

**Disease Mechanics:**
- Weather influences infection rates
- Visual indicators on diseased crops
- Untreated diseases reduce yield and quality
- Genetic resistance provides permanent protection

### 🌪️ Natural Disasters

**Weather Events** that challenge your farm:

- ⛈️ **Severe Storms** - Crop damage, building risks
- 🌊 **Floods** - Water damage, soil erosion
- 🏜️ **Droughts** - Extended dry periods
- 🥶 **Frost** - Cold damage to crops

**Disaster Preparedness:**
- Build protective infrastructure
- Maintain emergency resources
- Monitor weather forecasts
- Breed resilient crop varieties

### 🐾 Pet System

**Adopt 3 Pet Types:**
- 🐕 **Dog** - Increases happiness, scares pests
- 🐈 **Cat** - Catches mice, provides companionship
- 🐔 **Chicken** - Produces eggs daily

**Pet Mechanics:**
- Feed and care for your pets
- Gain XP and level up
- Unlock bonuses at higher levels
- Each pet provides unique benefits

### 🏆 Achievement System

**36+ Achievements** across 8 categories:

| Category | Example Achievements |
|----------|---------------------|
| 🌱 **Farming** | First Harvest, Master Harvester (100 crops) |
| 💰 **Economy** | Millionaire ($1000 earned), Farm Tycoon ($5000) |
| 🏗️ **Building** | Architect (3 buildings), Infrastructure Master |
| 🧬 **Genetics** | Hybrid Creator, Master Breeder |
| 🦠 **Disease** | Disease Fighter, Prevention Expert |
| 🏅 **Level** | Experienced Farmer (Lv 5), Master Farmer (Lv 10) |
| 🐾 **Pets** | Animal Lover (5 pets), Rancher (10 pets) |
| 🔬 **Research** | Researcher, Tech Pioneer |

**Achievement Rewards:**
- 💰 Gold bonuses ($50 - $2000)
- 🎖️ Progress tracking
- 🏆 Filterable categories
- 📊 Detailed progress bars

### 🎵 Sound Effects System

**Procedural Audio Generation** using Web Audio API - Zero external audio files required!

**10+ Distinct Sound Effects** for all game actions:

- 🌱 **Plant Sound** - Gentle ascending chirps when planting seeds
- 🌾 **Harvest Sound** - Satisfying pop and ding when crops are ready
- 💰 **Money Sound** - Classic "cha-ching" for coin rewards and earnings
- ⬆️ **Level Up Sound** - Triumphant fanfare melody when leveling up
- 💧 **Water Sound** - Splash effect for feeding animals and watering crops
- 🔨 **Build Sound** - Deep thud for constructing buildings
- 🏆 **Achievement Sound** - Ascending arpeggio for unlocking achievements
- ❌ **Error Sound** - Descending tones for invalid actions
- 🔔 **Notification Sound** - Quick tones for alerts and updates
- ☀️ **Weather Sound** - Ambient sounds for weather changes

**Settings Integration:**
- 🔊 Toggle sound effects on/off in Settings tab
- 🎚️ Volume control (coming soon)
- 📱 Auto-pause when tab is not active

### 🎶 Background Music System

**Procedural Music Generation** - Dynamic themes that adapt to your farm!

**4 Seasonal Themes** with unique melodies and moods:

| Season | Melody | Tempo | Mood | Instrument |
|--------|--------|-------|------|------------|
| 🌸 **Spring** | Bright, uplifting in C major | 120 BPM | Cheerful | Sine wave |
| ☀️ **Summer** | Warm, lazy melody | 100 BPM | Relaxed | Triangle wave |
| 🍂 **Fall** | Contemplative, nostalgic | 90 BPM | Warm | Triangle wave |
| ❄️ **Winter** | Gentle, crystalline | 80 BPM | Calm | Sine wave |

**Advanced Features:**
- 🎼 **ADSR Envelope** for natural, professional sound
- 🥁 **Bass Notes** every 4 beats for rhythm
- ⏰ **Precise Scheduling** using AudioContext timing
- 🔄 **Seamless Looping** with no gaps or interruptions
- 🔊 **Low Volume** (15%) to enhance immersion without distraction
- 🎵 **Automatic Transitions** - Music changes when seasons change

**Settings Integration:**
- 🎶 Toggle background music on/off in Settings tab
- 🌱 **Seasonal Awareness** - Music reflects current season automatically

### 🐄 Livestock Management System

**Raise 5 Animal Types** for passive income and products:

| Animal | Cost | Product | Value | Time | Feed | Space |
|--------|------|---------|-------|------|------|-------|
| 🐔 **Chicken** | $100 | Egg | $15 | 30s | $10 | 1 |
| 🐷 **Pig** | $300 | Truffle | $30 | 45s | $20 | 1 |
| 🐐 **Goat** | $350 | Cheese | $35 | 50s | $18 | 1 |
| 🐄 **Cow** | $500 | Milk | $40 | 60s | $25 | 2 |
| 🐑 **Sheep** | $400 | Wool | $50 | 90s | $15 | 2 |

**Animal Stats & Care:**
- ❤️ **Health** (0-100%) - Decreases if hungry or unhappy
- 😊 **Happiness** (0-100%) - Boost by petting, decays over time
- 🍖 **Hunger** (0-100%) - Feed regularly to maintain health
- ⏱️ **Production Timer** - Ready when health > 50% and happiness > 30%

**Quality Production:**
```javascript
qualityModifier = (happiness * 0.3) + (health * 0.3) + 0.4
actualValue = baseValue * qualityModifier
```

**Barn Capacity Management:**
- 🏠 **Start with 10 space** - Expandable barn capacity
- 💰 **Upgrade Cost**: currentCapacity × $100
- 📈 **Expansion**: +5 space per upgrade
- 📏 **Space Requirements**: Different animals need 1 or 2 spaces

**Animal Lifecycle:**
1. 🛒 **Purchase** animals from Shop tab (requires level)
2. 🍽️ **Feed** animals regularly to keep them healthy
3. 🐕 **Pet** animals to boost happiness
4. 📦 **Collect** products when ready
5. 💵 **Sell** aged animals for profit (50% base + age bonus)

### 🎣 Fishing System

**Interactive Fishing Mini-Game** with progressive difficulty and rewards!

**5 Fish Rarity Tiers:**

| Fish | Emoji | Rarity | Value | Size | Difficulty |
|------|-------|--------|-------|------|------------|
| Common Fish | 🐟 | 60% | $20 | 5-15cm | 1 |
| Bass | 🐠 | 25% | $40 | 10-25cm | 2 |
| Trout | 🎣 | 10% | $80 | 20-40cm | 3 |
| Salmon | 🐡 | 4% | $150 | 30-60cm | 4 |
| Golden Koi | 🐲 | 1% | $500 | 40-100cm | 5 |

**Mini-Game Mechanics:**
1. 🎣 **Cast Line** - Consumes 5 pond population
2. 🐟 **Fish Hooked** - Random fish based on rarity weights
3. 🎮 **Reel Control** - Use A/D or Arrow Keys to move reel
4. 🎯 **Target Zone** - Keep reel in green zone to gain progress
5. ✅ **Success** - Reach 100% progress to catch
6. ❌ **Escape** - Fish escapes if progress drops or time runs out

**Mini-Game UI:**
```
Progress: ████████░░ 80%

[Target Zone (Green)]    [Your Reel 🎣]
├──────────────┤          │
│              │          │
│   GREEN      │     ▼    │
│              │          │
├──────────────┴──────────┘

⬅️ Left (A)    Right (D) ➡️
```

**Difficulty Scaling:**
- 🎚️ **Higher Difficulty** = Faster target zone movement
- ⚡ **Higher Difficulty** = Increased escape chance
- ⏱️ **Higher Difficulty** = Longer time limit
- 📏 **Size Bonus** = +50% value for maximum size fish

**Pond Upgrades:**

| Level | Name | Capacity | Regen | Cost | Rarity Bonus |
|-------|------|----------|-------|------|--------------|
| 1 | Basic Pond | 3 | 1.0x | $0 | 1.0x |
| 2 | Improved Pond | 5 | 1.5x | $500 | 1.1x |
| 3 | Advanced Pond | 8 | 2.0x | $1500 | 1.25x |
| 4 | Master Pond | 12 | 3.0x | $5000 | 1.5x |

**Fish Collection:**
- 📚 **Encyclopedia** - Track all caught fish types
- 📊 **Statistics** - Total caught, total value, largest fish size
- ❓ **Mystery Fish** - Unknown fish show as "???" until caught
- 🏆 **Completion** - Fill your fishing encyclopedia

### 📊 Analytics Dashboard

**Track Your Farm Performance:**
- 📈 Total crops harvested
- 💵 Total gold earned
- 🏆 Achievements unlocked
- 🎯 Quests completed
- ⏱️ Play time statistics
- 📊 Crop production graphs
- 💹 Economic trends

---

## 🎮 Game Tabs

**19 Specialized Interfaces:**

1. 🌱 **Farming** - Crop selection and quick actions
2. 🎒 **Inventory** - Item management and statistics
3. 🛒 **Shop** - Purchase seeds, tools, and upgrades
4. 🏗️ **Buildings** - Construct infrastructure
5. 🔬 **Research** - Unlock technology upgrades
6. 🧬 **Genetics** - Breed hybrid crops
7. 🌦️ **Weather** - Forecast and weather mini-game
8. 🐾 **Pets** - Adopt and care for animals
9. 🐄 **Livestock** - Manage animals and collect products
10. 🎣 **Fishing** - Cast lines and play fishing mini-game
11. 🎯 **Daily Quests** - Complete daily challenges
12. 🦠 **Disease Management** - Monitor and treat diseases
13. 🏭 **Processing** - Process crops for higher value
14. 🎉 **Events** - Seasonal calendar events
15. 🏆 **Achievements** - Track your progress
16. 👥 **Social** - Friends and leaderboard
17. 🗺️ **Expand** - Grow your farm size
18. 🎁 **Mystery Shop** - Special rare items
19. 🎯 **Challenges** - Special challenge mode
20. 📊 **Analytics** - Farm statistics and insights
21. ⚙️ **Settings** - Game configuration and controls

---

## 🎯 Gameplay Tips

### 🚀 Getting Started

1. **Plant Your First Crops** - Start with carrots (fastest growth)
2. **Harvest and Sell** - Earn gold to expand
3. **Build Infrastructure** - Greenhouse + Irrigation = success
4. **Research Technology** - Unlock advanced features
5. **Breed Hybrids** - Create superior crop varieties
6. **Complete Quests** - Daily rewards add up fast!

### 💡 Pro Strategies

**Early Game (Levels 1-5):**
- Focus on fast-growing crops (carrots, potatoes)
- Save gold for first greenhouse ($500)
- Complete daily quests for bonus income
- Research basic genetics early
- Start with chickens ($100) for easy passive income

**Mid Game (Levels 6-10):**
- Build processing facilities for value multiplication
- Start breeding hybrid crops
- Expand farm to 4×4 or 5×5
- Invest in automation hub
- Maintain disease treatments
- Upgrade to cows and sheep for higher-value products
- Begin fishing for variety and extra income

**Late Game (Level 10+):**
- Focus on platinum-quality hybrids
- Optimize processing chains
- Complete all achievements
- Master weather prediction mini-game
- Build complete infrastructure
- Maintain large livestock herd for steady income
- Upgrade fishing pond to Master level for rare fish
- Collect entire fish encyclopedia

### 🎮 Hotkeys (Coming Soon)

- **Space** - Harvest all ready crops
- **W** - Water selected plots
- **F** - Fertilize selected plots
- **B** - Toggle bulk selection mode
- **G** - Quick switch to Genetics tab
- **S** - Manual save game
- **1-4** - Quick crop selection

---

## 🛠️ Technical Details

### Tech Stack

- **React 18.2.0** - Modern React with hooks and strict mode
- **Vite 4.0.0** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.3.0** - Utility-first styling system
- **Lucide React** - Beautiful icon library
- **Vitest** - Fast unit testing framework

### Architecture Highlights

**State Management:**
- React Context API for global state
- useReducer for predictable state updates
- Local Storage for save/load persistence
- Auto-save every 30 seconds

**Performance:**
- Component memoization with React.memo()
- System updates at 10 FPS for smooth animations
- Efficient re-rendering with selective updates
- 60 FPS target for game loop

**Code Quality:**
- Modular system architecture
- Single responsibility principle
- Clean separation of concerns
- JSDoc documentation
- Error boundaries for resilience

### Project Structure

```
FarmLife/
├── src/
│   ├── components/
│   │   ├── farm-sim/           # Main game module
│   │   │   ├── core/          # Game orchestration
│   │   │   ├── context/       # State management
│   │   │   ├── systems/       # Game logic
│   │   │   ├── constants/     # Game data
│   │   │   └── ui/            # UI components
│   │   ├── ui/                # Reusable UI primitives
│   │   └── GameErrorBoundary.jsx
│   ├── index.css              # Global styles
│   └── main.jsx               # App entry point
├── public/                    # Static assets
├── dist/                      # Production build
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:ui          # Test UI
npm run test:coverage    # Coverage report
npm run test:watch       # Watch mode

# Quality Assurance
npm run audit            # Full code audit
npm run lint             # Lint check
npm run qa:full          # Complete QA suite
```

### Save System

**Local Storage Persistence:**
- Automatic save every 30 seconds
- Manual save via Settings tab
- Cross-session continuity
- Backup saves on errors
- Version migration support

**Saved Data:**
- All game progress and statistics
- Crop genetics and breeding history
- Buildings and infrastructure
- Pet data and levels
- Achievement progress
- Quest completion history

---

## 📈 Version History

### v4.2.0 - Major Content Update: Livestock, Fishing, Sound & Music (Current)
- 🎵 **Sound Effects System** - Procedural audio feedback for all game actions
- 🎶 **Background Music** - Dynamic seasonal themes with seamless transitions
- 🐄 **Livestock Management** - Raise animals for passive income and products
- 🎣 **Fishing Mini-Game** - Interactive fishing with keyboard controls and rarity system
- 🏗️ **New Game Systems** - LivestockSystem, FishingSystem, MusicSystem
- 🎮 **New UI Tabs** - Livestock and Fishing tabs with full functionality
- 🔧 **State Management** - Added livestock and fishing state to GameContext
- 🎯 **Settings Integration** - Sound and music toggles in settings
- 📊 **Analytics Updates** - Track livestock and fishing statistics
- ⚡ **Performance Optimized** - Zero impact on existing performance

### v4.1.0 - Polish & Visual Effects Update
- ✨ **Particle Effects System** - Enhanced physics with coins, sparkles, and floating text
- 🌦️ **Real-time Weather Visuals** - Animated rain, snow, and lightning effects
- 🍂 **Seasonal Cycles** - 4 seasons with unique bonuses and smooth transitions
- 🎨 **Visual Polish** - Shine effects on progress bars, glow shadows, and gradients
- 🌊 **Ripple Effects** - Material Design ripples on all button clicks
- 🌱 **Crop Growth Animation** - Crops visually grow through stages
- 🎉 **Enhanced Celebrations** - Better harvest and level-up effects with screen shake
- 💅 **UI Improvements** - Hover previews, tooltips, and micro-interactions
- 🗑️ **Quality of Life** - Click to clear withered crops
- ⚡ **Performance** - Stale state fix for accurate crop growth
- 🎁 **Mystery Shop** - Rare items and special seeds
- 📊 **Analytics Dashboard** - Performance tracking
- 🧹 **Code Cleanup** - Removed legacy components and systems
- ⚡ **Performance** - Optimized rendering and state updates
- 📚 **Documentation** - Complete README overhaul

### v3.1.0 - Polish & Enhancement Update
- Visual polish across all tabs
- Real-time crop growth progress bars
- Enhanced UI with animations
- Expanded shop system
- Bug fixes and optimizations

### v3.0.0 - Modular Architecture Update
- Centralized state management
- Independent game systems
- 14 specialized UI tabs
- Performance optimizations
- Auto-save system

### v2.1.0 - Quality of Life Update
- Interactive tutorial
- Hotkey controls
- Processing plants
- Enhanced UI

### v2.0.0 - Advanced Genetics & Weather
- Genetic breeding system
- Advanced weather mechanics
- Building systems
- Seed quality progression

### v1.0.0 - Initial Release
- Basic farming mechanics
- Core crop growing
- Simple economy

---

## 🎨 Game Design Philosophy

**FarmLife** is designed with these principles:

1. **Depth Without Complexity** - Rich systems that are easy to learn
2. **Strategic Choice** - Multiple viable paths to success
3. **Rewarding Progression** - Constant sense of achievement
4. **Emergent Gameplay** - Systems interact in interesting ways
5. **Respectful of Time** - No artificial grind or waiting
6. **Polished Experience** - Smooth animations and clear feedback

---

## 🤝 Contributing

This is a personal project showcasing advanced React game development techniques. The codebase demonstrates:

- ✅ Complex state management with multiple interdependent systems
- ✅ Genetic algorithm simulation for crop breeding
- ✅ Dynamic weather system implementation
- ✅ Economic simulation with market fluctuations
- ✅ Achievement and progression systems
- ✅ Modular architecture with clean separation of concerns

---

## 📝 License

Private project - Educational and demonstration purposes.

---

## 🙏 Acknowledgments

Built with:
- ⚛️ **React** - UI framework
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🎯 **Lucide** - Icons
- 💚 **Love for farming games** - Inspiration

---

**Happy Farming! 🚜🌾**

*Grow your dream farm, one crop at a time.*

---

## 📞 Support

For questions or issues:
1. Check the in-game Settings tab
2. Review this README
3. Inspect browser console for errors
4. Clear save data if needed (Settings > Clear Data)

---

**Made with 💚 by passionate game developers**

*Version 5.5.5 - May 2026*
