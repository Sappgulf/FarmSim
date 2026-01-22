# FarmSim

A relaxing farm simulation game built with React, Vite, and Tailwind CSS.

## Features

- **Farm Grid**: Plant, water, and harvest crops on an expandable 3x3 to 5x5 grid
- **Crop Variety**: Multiple crops with different growth times and values
- **Weather System**: Dynamic weather and seasons that affect crop growth
- **Buildings**: Barn, Greenhouse, Beehive, Windmill with actual gameplay effects
- **Quality System**: Crops can be Normal, Good, Excellent, or Perfect quality
- **Combo System**: Fast harvests multiply your earnings
- **Achievements**: 32 achievements to unlock
- **Mobile Optimized**: Touch-friendly UI with 44px+ tap targets
- **PWA Ready**: Works offline after first load

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

Open `http://localhost:5173` in your browser.

## Game Controls

### Desktop
- **Click** empty plot to plant selected seed
- **Click** growing crop to water
- **Click** ready crop to harvest
- **Backtick (`)** Toggle debug overlay (dev mode only)

### Mobile
- **Tap** plots to interact
- **Bottom nav** Farm / Shop / Menu
- **Harvest All** button appears when crops are ready

## Project Structure

```
src/
├── components/
│   ├── FarmGame.jsx        # Main game component
│   ├── MenuDrawer.jsx      # Settings and menu drawer
│   ├── DebugOverlay.jsx    # FPS and state debug
│   ├── game/               # Game UI components
│   │   ├── FarmGrid.jsx
│   │   ├── PlotTile.jsx
│   │   ├── StatsBar.jsx
│   │   ├── BottomNav.jsx
│   │   └── ...
│   ├── panels/             # Side panel components
│   │   ├── ShopPanel.jsx
│   │   ├── InventoryPanel.jsx
│   │   ├── AchievementsPanel.jsx
│   │   └── BreedingPanel.jsx
│   └── ui/                 # Base UI components
├── hooks/                  # Custom React hooks
│   ├── useGameState.js     # Game state management
│   ├── useFarm.js          # Farm logic
│   ├── useWeather.js       # Weather system
│   └── useTutorial.js      # Tutorial flow
├── data/                   # Game data
│   ├── constants.js        # Game settings
│   ├── crops.js            # Crop definitions
│   ├── buildings.js        # Building definitions
│   └── achievements.js     # Achievement definitions
├── systems/                # Pure game logic
│   ├── growth.mjs
│   ├── inventory.mjs
│   └── pricing.mjs
├── utils/                  # Utilities
│   ├── save.mjs            # Save/load system
│   ├── time.mjs
│   └── gameMath.mjs
└── config/                 # Configuration
    └── economy.mjs
```

## Building Effects

| Building | Effect |
|----------|--------|
| Barn | +20% harvest value |
| Greenhouse | 50% faster growth |
| Beehive | +25% quality chance |
| Windmill | +5 coins per minute |
| Well | Auto-waters adjacent plots |
| Silo | Auto-sells when storage full |

## Smoke Test Checklist

1. [ ] Fresh load - game starts, tutorial shows
2. [ ] Skip tutorial - game playable
3. [ ] Plant seed - animation plays, seed decrements from inventory
4. [ ] Water crop - water indicator shows
5. [ ] Harvest ready crop - coins increase, combo badge shows
6. [ ] Harvest All - harvests all ready crops at once
7. [ ] Buy seeds - coins decrease, inventory increases
8. [ ] Buy building - building appears in owned list
9. [ ] Expand farm - grid grows to next size
10. [ ] Settings - sound toggle works
11. [ ] Refresh page - save loads correctly
12. [ ] Clear data (via Menu > Reset) - fresh start works
13. [ ] Mobile - bottom nav works, 3 tabs (Farm/Shop/Menu)
14. [ ] Menu drawer - opens on Menu tap, closes on backdrop tap

## Performance Targets

- Initial load: < 2s on 3G
- FPS during gameplay: 60fps stable
- Bundle size: < 75KB gzip JS, < 15KB gzip CSS

## License

MIT
