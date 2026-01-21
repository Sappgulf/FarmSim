# FarmLife Architecture Notes

## Code Organization

### Main Game Component
The `SimpleFarmGame.jsx` file (7000+ lines) is the primary game component. While large, it maintains good organization:

**Current Structure:**
- Constants and data definitions (crops, weather, buildings, etc.)
- React state management (30+ state variables)
- Game logic functions (planting, harvesting, breeding, etc.)
- Effect hooks for game loop, weather, achievements
- Render methods for different tabs/sections

**Considerations for Future Refactoring:**
While the component works well, future improvements could include:

1. **Extract Data Modules** (Priority: Low)
   - Move crop data, weather data, buildings to `src/data/` directory
   - Already partially done with `expandedCrops.js` and `livestockSystem.js`

2. **Extract Game Systems** (Priority: Medium)
   - Separate systems (market, processing, community) already in `src/systems/`
   - Could extract more logic into these systems

3. **Extract Sub-Components** (Priority: Low)
   - Farm tabs could be individual components
   - Shop sections could be componentized
   - Already done for some UI (WeatherDisplay, AchievementsPanel, etc.)

4. **Custom Hooks** (Priority: Medium)
   - Weather system: Already in `useWeather.js`
   - Market system: Already in `useMarket.js`
   - Could extract: breeding logic, disease system, season management

**Why Not Refactor Now:**
- The current structure is functional and maintainable
- No performance issues
- State is highly interconnected (refactoring would be complex)
- Risk of introducing bugs
- Follows "if it ain't broke, don't fix it" principle

## Build Configuration

### Vite Setup
- Base path set to `'./'` for flexible deployment
- React plugin configured
- Path aliases set up (@/ points to src/)
- Development server configured for local testing

### Tailwind CSS
- Configured to scan all JSX files
- Custom animations and keyframes defined
- Extended theme with game-specific styles

## Code Quality Improvements Applied

1. ✅ **Logging System**: Centralized logger with environment-aware output
2. ✅ **Save Versioning**: Migration system for backward compatibility
3. ✅ **Error Handling**: Enhanced error boundary with save backup
4. ✅ **JSDoc Comments**: Added to utility functions
5. ✅ **Code Cleanup**: Removed unused files and duplicate code
6. ✅ **TODO Resolution**: Fixed incomplete storm damage implementation

## Performance Considerations

The game runs smoothly because:
- Efficient React state updates
- Selective re-renders using useMemo and useCallback
- Optimized game loop (runs every second, not per frame)
- LocalStorage for persistence (no network calls)
- Sound system uses Web Audio API (efficient)

## Testing Strategy

- Vitest configured for unit/integration tests
- Test files in `src/test/`
- Coverage reports available via `npm run test:coverage`
- Manual testing for gameplay feel

## Deployment Notes

- PWA-ready with service worker
- Works offline after first load
- Responsive design for mobile/desktop
- No external API dependencies
- Can be hosted as static files

---

*Last Updated: 2025-11-02*
*FarmLife Version: 2.3.0*

