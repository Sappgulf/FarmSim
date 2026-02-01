# Balance Notes - Sprint C

## Phase 1: Baseline Measurements

### Current Pacing Constants
| Setting | Value | Location |
|---------|-------|----------|
| Day Length | 30,000ms (30s) | `SeasonSystem.js:DEFAULT_DAY_LENGTH_MS` |
| Days Per Season | 4 | `SeasonSystem.js:DEFAULT_DAYS_PER_SEASON` |
| Season Duration | 2 minutes | Calculated |
| Full Year | 8 minutes | 4 seasons × 2 min |
| Harvest Window | 90,000ms (90s) | `cropData.js:HARVEST_WINDOW_MS` |

### Current Crop Economics
| Crop | Cost | Value | ROI | Grow Time | Profit/Min |
|------|------|-------|-----|-----------|------------|
| Carrot | 12 | 24 | 2.0x | 60s | 12 |
| Tomato | 16 | 34 | 2.1x | 80s | 13.5 |
| Potato | 10 | 20 | 2.0x | 52s | 11.5 |
| Lavender | 18 | 38 | 2.1x | 72s | 16.7 |
| Cabbage | 24 | 48 | 2.0x | 100s | 14.4 |
| Corn | 20 | 42 | 2.1x | 92s | 14.3 |
| Wheat | 14 | 28 | 2.0x | 72s | 11.7 |
| Rice | 30 | 66 | 2.2x | 112s | 19.3 |
| Strawberry | 28 | 62 | 2.2x | 96s | 21.3 |
| Watermelon | 60 | 130 | 2.2x | 180s | 23.3 |
| Blueberry | 36 | 78 | 2.2x | 104s | 24.2 |
| Pumpkin | 40 | 88 | 2.2x | 128s | 22.5 |
| Garlic | 18 | 35 | 1.9x | 80s | 12.8 |
| Onion | 14 | 28 | 2.0x | 72s | 11.7 |
| Broccoli | 26 | 55 | 2.1x | 88s | 19.8 |

### Town Reputation Tiers
| Tier | Min Rep | Sell Bonus | Unlock |
|------|---------|------------|--------|
| Garden Neighbor | 0 | 0% | Lavender seeds |
| Cozy Caretaker | 40 | +2% | Town Banner decor |
| Market Partner | 120 | +4% | 3% vendor discount |

### Rep Gain Rate
- Formula: `Math.floor(harvestValue / 50)`, min 1
- At 24 coin harvest → 1 rep
- At 130 coin harvest → 2 rep
- Time to Tier 2 (40 rep): ~40 harvests
- Time to Tier 3 (120 rep): ~80 additional harvests

---

## Phase 2: Target Pacing (Goals)

| Setting | Current | Target | Rationale |
|---------|---------|--------|-----------|
| Day Length | 30s | 4-8 min (adjustable) | More time to enjoy the farm |
| Days Per Season | 4 | 7-14 | Allow weekly rhythm |
| Season Duration | 2 min | 7-14 min | Match real-life week feel |
| Full Year | 8 min | 28-56 min | Substantial but not endless |

### Day Speed Control (New Feature)
- **Slow**: 8 min/day (480,000ms) - Relaxed play
- **Normal**: 5 min/day (300,000ms) - Balanced [DEFAULT]
- **Fast**: 2 min/day (120,000ms) - Quick sessions

---

## Phase 3: Economy Balance Goals

### No Changes Needed (Already Balanced)
- Crop ROI is consistently 2.0-2.2x (healthy, not broken)
- No infinite loops detected
- Watering friction is minimal (sprinklers available)

### Potential Tweaks
- Rep gain could scale slightly faster at higher values to feel rewarding
- Consider: `Math.floor(harvestValue / 40)` for +25% faster progression

---

## Phase 4: Liveliness Audit

### Existing Systems
- Season transitions (CSS-based)
- Weather overlays (event-driven)
- Particle effects (capped via `ParticleEffectsManager`)
- Sound system (event-driven)
- Reduced Motion support (`state.settings.reducedEffects`)

### Planned Additions
- Subtle crop growth feedback (CSS transform on stage change)
- Ambient life (butterflies/leaves) with strict 5-entity cap
- Milestone celebrations (brief confetti burst)

---

## Implementation Checklist ✅
- [x] Add `daySpeed` setting to state/persistence
- [x] Add Day Speed control to Settings UI
- [x] Update `SeasonSystem` to respect `settings.daySpeed`
- [x] Tune rep gain formula (+25% faster: /40)
- [x] Verify CSS already has growth/harvest feedback
- [x] Verify reduced motion support exists
- [x] Build verification passed
