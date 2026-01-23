# AchievementSystem Null Reference Fix

## Problem
The `AchievementSystem` was trying to access properties on `this.state` when it was `null`, causing the error:
```
Cannot read properties of null (reading 'xp')
```

## Root Cause
The system classes are initialized with `null` state in `FarmSim.jsx`:
```javascript
const achievementSystem = useMemo(() => new AchievementSystem(null, actions), [actions]);
```

But the `AchievementSystem` was trying to access `this.state.xp` and other properties without:
1. Updating the state reference in the `update()` method
2. Null-checking before accessing properties

## Solution Applied

### 1. Update Method - Accept and Store Current State
```javascript
// BEFORE
update() {
  // Tried to use this.state which was null
  this.checkAchievements();
}

// AFTER
update(currentState) {
  // Safety check
  if (!currentState) {
    console.error('[farm] AchievementSystem: update() called with null/undefined state');
    return;
  }
  
  // Update internal state reference
  this.state = currentState;
  
  // Now safe to check achievements
  this.checkAchievements();
}
```

### 2. Added Null Checks Throughout
```javascript
// checkAchievements()
checkAchievements() {
  if (!this.state) {
    console.warn('[farm] AchievementSystem: No state available');
    return;
  }
  // ... rest of method
}

// checkAchievementCondition()
checkAchievementCondition(achievement) {
  if (!this.state) return false;
  
  switch (achievement.id) {
    case 'first_harvest':
      return (this.state.xp || 0) > 0;  // Safe with fallback
    case 'coin_collector':
      return (this.state.coins || 0) >= 300;  // Safe with fallback
    // ... etc
  }
}
```

### 3. Added Default Values for All Property Access
```javascript
// All state property access now has fallbacks:
(this.state.xp || 0)           // Instead of this.state.xp
(this.state.coins || 0)        // Instead of this.state.coins
(this.state.level || 1)        // Instead of this.state.level
(this.state.plots || [])       // Instead of this.state.plots
(this.state.inventory || {})   // Instead of this.state.inventory
```

## Files Modified
- `src/components/farm-sim/systems/AchievementSystem.js`
  - Line 12-27: Updated `update()` method to accept and validate state
  - Line 29-52: Added null check in `checkAchievements()`
  - Line 54-76: Added null check in `checkAchievementCondition()`
  - Line 60-72: Added default values for all property access
  - Line 100-107: Added null check for reward granting
  - Line 155-172: Added null check in `getAchievementProgress()`
  - Line 174-177: Added null check in `getCompletedAchievements()`

## Build Status
✅ Build passes: `npm run build` completes successfully  
✅ No linter errors  
✅ All null references safely handled

## Pattern for Other Systems
This same pattern should be applied to ALL system classes:

```javascript
class SomeSystem {
  constructor(gameState, gameActions) {
    this.state = gameState;  // Can be null initially
    this.actions = gameActions;
  }
  
  update(currentState) {
    // ALWAYS validate and update state first
    if (!currentState) {
      console.error('[farm] SomeSystem: null state');
      return;
    }
    this.state = currentState;
    
    // Now safe to use this.state
  }
  
  someMethod() {
    // ALWAYS check state exists
    if (!this.state) return defaultValue;
    
    // ALWAYS use fallbacks for property access
    const value = this.state.someProperty || defaultValue;
  }
}
```

## Testing
After refresh:
- ✅ No null reference errors
- ✅ Achievement system works correctly
- ✅ Achievements can be unlocked
- ✅ Progress tracking works

**Status: ✅ FIXED**

