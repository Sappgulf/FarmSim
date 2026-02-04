# Expansion + Polish Pass Checklist

**Date:** 2026-02-03  
**Scope:** Pets UI polish, notification system upgrade, tab sweep, bug check, performance sanity.

## Tab + Feature Inventory (Audit)
- **Pets tab UI + data model:** `src/components/farm-sim/ui/tabs/PetsTab.jsx`, `src/components/farm-sim/context/GameReducer.js` (pets state), `src/components/farm-sim/context/GamePersistence.js` (pets migration).  
- **Notifications/toasts:** `src/components/farm-sim/ui/NotificationSystem.jsx`, `src/components/farm-sim/context/GameReducer.js` (ADD/CLEAR actions), `src/components/farm-sim/context/GameContext.jsx` (action creators).  
- **Tabs/panels routing + UI primitives:** `src/components/farm-sim/ui/GameSidebar.jsx` (lazy tabs), `src/components/farm-sim/ui/NavBar.jsx` (sectioned navigation), `src/components/ui/tabs.jsx` (tabs primitives), `src/components/ui/card.jsx` + `src/components/ui/button.jsx` (core UI).  
- **Save/load + versioning:** `src/components/farm-sim/context/GamePersistence.js` (SAVE_VERSION, migrations), `src/components/farm-sim/context/GameContext.jsx` (auto-save/load).  

## Pets Tab (AAA UI + Copy)
- **DONE:** Add Pets header/subheader with friendly copy. (`src/components/farm-sim/ui/tabs/PetsTab.jsx`)  
- **DONE:** Card-based pet listing with icon fallback, mood/status, and trait chips. (`src/components/farm-sim/ui/tabs/PetsTab.jsx`)  
- **DONE:** Empty state + “How to get a pet” hint. (`src/components/farm-sim/ui/tabs/PetsTab.jsx`)  
- **DONE:** Quick actions sized for mobile (≥44px tap targets via button sizing). (`src/components/farm-sim/ui/tabs/PetsTab.jsx`)  

## Notifications (Auto-close + Close “×” + Stability)
- **DONE:** Auto-dismiss default 3500ms with hover/press pause. (`src/components/farm-sim/ui/NotificationSystem.jsx`)  
- **DONE:** Close button always visible with larger hit area + aria-label. (`src/components/farm-sim/ui/NotificationSystem.jsx`)  
- **DONE:** Idempotent close + timer cleanup. (`src/components/farm-sim/ui/NotificationSystem.jsx`)  
- **DONE:** Max visible count capped with “+N more” summary. (`src/components/farm-sim/ui/NotificationSystem.jsx`)  

## Text Cleanup (Underscores → Friendly Labels)
- **DONE:** Shared formatter for snake_case display labels. (`src/utils/textFormat.js`)  
- **DONE:** Apply formatter in Pets/Inventory/Processing/Genetics/Achievements/Events/Research tabs.  
  - `src/components/farm-sim/ui/tabs/PetsTab.jsx`  
  - `src/components/farm-sim/ui/tabs/InventoryTab.jsx`  
  - `src/components/farm-sim/ui/tabs/ProcessingTab.jsx`  
  - `src/components/farm-sim/ui/tabs/GeneticsTab.jsx`  
  - `src/components/farm-sim/ui/tabs/AchievementsTab.jsx`  
  - `src/components/farm-sim/ui/tabs/EventsTab.jsx`  
  - `src/components/farm-sim/ui/tabs/ResearchTab.jsx`  

## General Tab/Feature Polish
- **DONE:** Normalize snake_case labels across tabs and update copy consistency. (`src/components/farm-sim/ui/tabs/*`, `src/utils/textFormat.js`)  
- **DONE:** Confirm tab switching uses controlled handler + cleanup for global switcher. (`src/components/farm-sim/ui/GameSidebar.jsx`)  

## Bug Check + Performance Sanity
- **IN PROGRESS:** Rapid tab switching, notification spam/close, pet actions, save → reload. (Playwright attempt failed; retry needed.)  
- **DONE:** Confirm notifications and pets rendering are event-driven (no per-tick UI). (`src/components/farm-sim/ui/NotificationSystem.jsx`, `src/components/farm-sim/ui/tabs/PetsTab.jsx`)  
