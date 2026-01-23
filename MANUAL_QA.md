# FarmSim Manual QA Checklist

## Test Environment
- Browser: Chrome (latest)
- Device: Desktop / Mobile (specify)
- Grid Size: 5×5 (25 plots)

---

## A) Baseline Stress Test

### 1. Full Grid Plant + Harvest
- [ ] Start fresh game
- [ ] Expand to 5×5 grid
- [ ] Plant all 25 plots with carrots
- [ ] Wait for all to mature
- [ ] Harvest all at once (bulk or individual)
- **Expected**: No frame drops, particles render smoothly

### 2. Rapid Click Test
- [ ] Rapidly click 10+ plots in succession
- **Expected**: No lag, responsive clicks

---

## B) Performance Overlay

### 3. Toggle Overlay
- [ ] Press backtick (`) key
- [ ] Verify overlay appears with: FPS, Frame time, Memory, Entity count
- [ ] Press ` again to hide
- **Expected**: Toggle works, no errors in console

### 4. FPS Stability
- [ ] With overlay visible, observe FPS during:
  - Idle (no actions): **Target: 55-60 FPS**
  - Planting: **Target: 50+ FPS**
  - Harvesting (particles active): **Target: 45+ FPS**

---

## C) Memory & Leak Detection

### 5. Long-Run Test (10 min)
- [ ] Open DevTools > Memory tab
- [ ] Take initial heap snapshot
- [ ] Play game normally for 10 minutes
  - Plant/harvest cycles
  - Switch tabs
  - Toggle settings
- [ ] Take final heap snapshot
- **Expected**: Memory growth < 20MB, no runaway growth

### 6. Tab Switch Test
- [ ] Switch to another browser tab for 30 seconds
- [ ] Return to game tab
- **Expected**: Game resumes, no errors, FPS recovers

---

## D) Edge Cases

### 7. Pause/Resume
- [ ] Press pause button in header
- [ ] Wait 10 seconds
- [ ] Resume game
- **Expected**: Game resumes correctly, no duplicate updates

### 8. Save/Load Cycle
- [ ] Save game manually
- [ ] Refresh page
- [ ] Verify game loads correctly
- **Expected**: All progress preserved, no corrupted state

---

## E) Visual Quality

### 9. Particles
- [ ] Harvest a mature crop
- [ ] Observe particle explosion
- **Expected**: Smooth animation, coins fly upward, fade out

### 10. Transitions
- [ ] Hover over farm plots
- **Expected**: Smooth lift effect, no jitter

---

## Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Stress Test | ⬜ | |
| Rapid Click | ⬜ | |
| Overlay Toggle | ⬜ | |
| FPS Stability | ⬜ | |
| Long-Run | ⬜ | |
| Tab Switch | ⬜ | |
| Pause/Resume | ⬜ | |
| Save/Load | ⬜ | |
| Particles | ⬜ | |
| Transitions | ⬜ | |

**Tester**: ________________
**Date**: ________________
