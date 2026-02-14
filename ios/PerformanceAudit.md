# FarmSim iOS Performance Audit Report

**Date:** 2026-02-14  
**Auditor:** Agent C (Performance Engineer)  
**Scope:** 60fps gameplay optimization

---

## Executive Summary

The FarmSim SwiftUI game has been audited for performance issues that could impact 60fps gameplay. Most critical issues have been addressed with conservative, targeted fixes. The game should now maintain smooth 60fps on modern iOS devices.

### Performance Grade: B+
- ✅ No expensive computations in view bodies
- ✅ Proper @ObservationIgnored usage  
- ⚠️ Game loop updates 12x/sec (acceptable but could throttle further)
- ✅ LazyVStack used for large lists
- ✅ drawingGroup applied to complex Canvas views

---

## Issues Found & Fixed

### 1. FarmView.swift

#### Issue: Atmosphere overlay recreated Color objects every frame
**Severity:** Medium  
**Impact:** Unnecessary Color allocations ~12x/sec

**Fix:** Extracted to separate `AtmosphereOverlayView` with static Color constants
```swift
private struct AtmosphereOverlayView: View {
    private static let dawn = Color(red: 1.0, green: 0.82, blue: 0.62)
    // ... static constants prevent recreation
}
```

#### Issue: Multiple onChange handlers creating observation overhead
**Severity:** Low  
**Impact:** Minor observation registration overhead

**Fix:** Consolidated related settings observations and removed separate hudTimeProgress observer (now bundled with renderSnapshot)

#### Issue: Day rollover Task could accumulate
**Severity:** Low  
**Impact:** Potential memory/Task accumulation if triggered rapidly

**Fix:** Added guard to prevent duplicate overlays, proper weak self pattern, and cancellation check
```swift
.onChange(of: store.dayRolloverToken) { _, _ in
    guard !showDayRolloverOverlay else { return } // Prevent duplicates
    // ... Task with weak self and cancellation check
}
```

---

### 2. BarnInventoryView.swift

#### Issue: VStack used instead of LazyVStack
**Severity:** Medium  
**Impact:** All shelves rendered even when off-screen

**Fix:** Changed to LazyVStack for better virtualization with large inventories
```swift
LazyVStack(alignment: .leading, spacing: DS.Space.md, pinnedViews: []) {
    // ... shelf content
}
```

#### Issue: Multiple onChange handlers with identical bodies
**Severity:** Low  
**Impact:** Code duplication, harder maintenance

**Fix:** Added single `refreshDisplayedShelves()` method called by all observers

---

### 3. TownMarketView.swift

#### Issue: VStack used instead of LazyVStack in Market view
**Severity:** Low  
**Impact:** All market sections rendered upfront

**Fix:** Changed to LazyVStack with stable IDs for header/picker
```swift
LazyVStack(alignment: .leading, spacing: DS.Space.lg, pinnedViews: []) {
    TownMarketHeader(reducedMotion: reducedMotion)
        .id("header")
    // ...
}
```

#### Issue: DealBadge animation syntax suboptimal
**Severity:** Low  
**Impact:** Animation re-evaluation on every body call

**Fix:** Moved animation to use value parameter
```swift
.animation(reducedMotion ? nil : .easeInOut(duration: 1.1).repeatForever(autoreverses: true), value: pulse)
```

---

### 4. GameLoopDriver.swift

#### Issue: MainActor hop in game loop
**Severity:** Medium  
**Impact:** Unnecessary context switching 12x/sec

**Fix:** Removed redundant MainActor.run since GameLoopDriver is @MainActor
```swift
// Before: await MainActor.run { self?.store?.stepAutoTime() }
// After: Direct call since we're already on MainActor
guard let self = self, !Task.isCancelled else { break }
self.store?.stepAutoTime()
```

#### Issue: SoundManager creating new AVAudioPlayerNode for every sound
**Severity:** Medium  
**Impact:** Memory churn, frequent allocation/deallocation

**Fix:** Implemented node pooling to reuse player nodes
```swift
private var availableNodes: [AVAudioPlayerNode] = []
private let maxPooledNodes = 5

// Reuse pooled nodes or create new ones
if let pooled = availableNodes.popLast() {
    playerNode = pooled
} else {
    playerNode = AVAudioPlayerNode()
}
```

#### Issue: Missing SoundEffect enum cases
**Severity:** Low  
**Impact:** Warnings, incomplete implementation

**Fix:** Added missing cases: `.notification`, `.streak`, `.welcome`

---

### 5. GameStore.swift

#### Issue: HUD update frequency
**Severity:** Low  
**Impact:** View updates 4x/sec (acceptable)

**Assessment:** Already optimized with 0.25s throttle. renderSnapshot updates are necessary for gameplay.

**Documentation:** Added clarifying comments about update frequency expectations

#### Issue: recomputeDerivedStateCaches iterates all tiles every update
**Severity:** Low  
**Impact:** O(n) tile iteration on every state change

**Assessment:** Acceptable for typical grid sizes (4x4 to 12x12 = 16-144 tiles). Would need optimization if grid grows significantly.

---

## Instruments Profiling Recommendations

### 1. Time Profiler
**Command:** Product > Profile > Time Profiler

**Look for:**
- `FarmView.body` taking >8ms consistently
- `GameStore.syncState` >5ms calls
- `BarnInventoryView.visibleShelves` taking >10ms

**Expected:** View bodies should complete in <5ms on modern devices

### 2. Core Animation
**Command:** Product > Profile > Core Animation

**Look for:**
- Yellow/red bars in "Frame Rate" track
- "Offscreen Passes" spikes
- "GPU Usage" >80% sustained

**Expected:** Consistent 60fps with occasional drops during sheet presentations

### 3. Allocations
**Command:** Product > Profile > Allocations

**Look for:**
- Continuous growth in `AVAudioPlayerNode` instances (should be fixed by pooling)
- Unbounded growth in `Color` or `LinearGradient` allocations
- `Task` accumulation in FarmView

**Expected:** Memory should plateau after ~30 seconds of gameplay

### 4. Energy Log
**Command:** Product > Profile > Energy Log

**Look for:**
- Sustained "High" energy usage
- Frequent "Discrete Graphics" usage on iPad

**Expected:** "Low" to "Medium" energy usage during active gameplay

---

## Performance Tips for Future Development

### When Adding New Views:
1. Use `LazyVStack`/`LazyHStack` for scrollable content >10 items
2. Apply `.drawingGroup()` to complex static graphics
3. Extract complex subviews to reduce parent body size
4. Use `@ViewBuilder` for conditional UI, not `if` in body

### When Adding Observable Properties:
1. Mark cached/computed values with `@ObservationIgnored`
2. Group related properties that update together
3. Throttle rapidly changing values (e.g., game loop counters)
4. Use token-based observation (hapticToken pattern) for triggers

### When Adding Animations:
1. Always respect `accessibilityReduceMotion`
2. Use `.animation(value:)` over `.animation()`
3. Avoid animating properties that trigger layout
4. Consider `.drawingGroup()` for animated complex views

### Memory Management:
1. Use `[weak self]` in all closures capturing self
2. Pool reusable resources (nodes, buffers, textures)
3. Clear caches on `UIApplication.didReceiveMemoryWarningNotification`
4. Use Instruments Leaks template to verify no retain cycles

---

## Files Modified

1. `/Users/austinbeatty/Downloads/FarmSim/ios/App/Sources/FarmView.swift`
   - Added `AtmosphereOverlayView` 
   - Consolidated onChange handlers
   - Fixed day rollover Task handling

2. `/Users/austinbeatty/Downloads/FarmSim/ios/App/Sources/Inventory/Barn/BarnInventoryView.swift`
   - Changed to LazyVStack
   - Added refreshDisplayedShelves helper

3. `/Users/austinbeatty/Downloads/FarmSim/ios/App/Sources/TownMarketView.swift`
   - Changed to LazyVStack
   - Optimized DealBadge animation

4. `/Users/austinbeatty/Downloads/FarmSim/ios/App/Sources/GameLoopDriver.swift`
   - Removed unnecessary MainActor hop
   - Added AVAudioPlayerNode pooling
   - Added missing SoundEffect cases

5. `/Users/austinbeatty/Downloads/FarmSim/ios/App/Sources/GameStore.swift`
   - Added documentation comments

## Files Added

1. `/Users/austinbeatty/Downloads/FarmSim/ios/App/Sources/Performance/PerformanceMonitor.swift`
   - FPS monitoring via CADisplayLink
   - Memory usage tracking
   - View render time measurement utilities
   - Performance guidelines documentation

---

## Conclusion

All identified performance issues have been addressed with conservative, targeted fixes. The game should now maintain smooth 60fps gameplay on modern iOS devices (iPhone 12+ / iPad Air 4+). 

**Next Steps:**
1. Profile on target devices using Instruments
2. Test with large inventories (100+ items) to validate LazyVStack benefits
3. Monitor memory usage during extended play sessions
4. Consider further optimizations if targeting older devices (iPhone X/XS era)

**No further optimizations recommended** unless profiling reveals specific bottlenecks.
