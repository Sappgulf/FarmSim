# Full Polish Pass Checklist

## Phase 1: Audit [DONE]
| Item | Status | Location |
|------|--------|----------|
| Tabs inventory (23) | ✅ DONE | `ui/tabs/*.jsx` |
| Systems inventory (14) | ✅ DONE | `systems/*.js` |
| UI components (17) | ✅ DONE | `ui/*.jsx` |
| Markdown docs (8) | ✅ DONE | `*.md` |
| CalendarSystem + Day Length | ✅ DONE | `CalendarSystem.js` |
| NotificationSystem cleanup | ✅ DONE | `NotificationSystem.jsx` |
| NavBar tap targets ≥56px | ✅ DONE | `NavBar.jsx` |
| Production build | ✅ DONE | No errors |

---

## Phase 2: Tab-by-Tab QA
| Tab | Status | Notes |
|-----|--------|-------|
| Farming | TODO | Crop selection, plant/harvest |
| Inventory | TODO | Item display, usage |
| Shop | TODO | Buy flow, costs |
| Buildings | TODO | Build/upgrade |
| Research | TODO | Unlock flow |
| Genetics | TODO | Breeding UI |
| Weather | TODO | Forecast display |
| Pets | TODO | Adopt/feed |
| Livestock | TODO | Animals, products |
| Fishing | TODO | Minigame |
| Events | TODO | Seasonal display |
| Processing | TODO | Queue batches |
| Achievements | TODO | Claim flow |
| Collections | TODO | Progress tracking |
| Social | TODO | Friends, rep |
| Analytics | TODO | Stats display |
| Mystery Shop | TODO | Purchase flow |
| Quests | TODO | Daily/weekly |
| Diseases | TODO | Cure application |
| Expand | TODO | Grid upgrade |
| Settings | TODO | All toggles |

---

## Phase 3: UI Consistency
| Component | Status | Notes |
|-----------|--------|-------|
| Buttons | ✅ DONE | Consistent hover/active/disabled |
| Panels/modals | ✅ DONE | TabWrapper, consistent headers |
| Notifications | ✅ DONE | Capped, cleanup on unmount |
| Mobile tap targets | ✅ DONE | ≥44px verified in NavBar |
| Safe-area padding | ✅ DONE | `.safe-area-pb` class |

---

## Phase 4: Feature Polish
| Feature | Status | Notes |
|---------|--------|-------|
| Calendar/day rollover | ✅ DONE | CalendarSystem implemented |
| Seasons/weather | TODO | Visual match |
| Shop rotation | TODO | Deterministic check |
| Collections/achievements | TODO | Idempotent rewards |
| Decorations/buildings | TODO | Placement UX |
| Audio | TODO | Volume consistency |
| Save/load | TODO | Backup validation |

---

## Phase 5: Performance
| Item | Status | Notes |
|------|--------|-------|
| Single game loop | ✅ DONE | 10 FPS rAF |
| Profiling overlay | ✅ DONE | `?debug=1` |
| Memory leak sweep | ✅ DONE | mountedRef, timer cleanup |
| Page Visibility throttle | ✅ DONE | Audio paused when hidden |

---

## Phase 6: Stress Tests
| Test | Status | Notes |
|------|--------|-------|
| Tab switching 30x | TODO | No crash |
| Full plots + harvest | TODO | No slowdown |
| 50 notifications | TODO | No crash |
| Decoration spam | TODO | No slowdown |
| 30-day advance | TODO | Consistency |
| Save/load cycle | TODO | No corruption |
| Mobile 375px | TODO | No overflow |

---

## Summary
- **Total Items**: 65
- **Done**: 6
- **In Progress**: 0
- **TODO**: 59
