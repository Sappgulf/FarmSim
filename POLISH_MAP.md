# Polish Map — Triple-A UI/UX Enhancement Pass

**Date:** 2026-02-03
**Version:** 5.0.0 → 5.1.0 (Polish Update)
**Mission:** Keep what we have, expand and polish incrementally

---

## Tab Inventory & Polish Targets

### 1. Farming Tab
**File:** `src/components/farm-sim/ui/tabs/FarmingTab.jsx`
**Purpose:** Crop selection and quick farming actions (plant, harvest, water, fertilize, treat)
**Key Actions:**
- Select crop type to plant
- Quick actions: Water All, Harvest All, Fertilize All, Treat All
- Bulk operations on all eligible plots

**Known Issues:**
- [ ] Display text uses underscores (need formatter)
- [ ] Icon consistency (emoji vs lucide icons)
- [ ] Empty state messaging could be improved
- [ ] Quick action button spacing on mobile

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** HIGH (core gameplay loop)

---

### 2. Inventory Tab
**File:** `src/components/farm-sim/ui/tabs/InventoryTab.jsx`
**Purpose:** View and manage all items, seeds, resources
**Key Actions:**
- View item counts
- Categorized inventory display
- Item details and descriptions

**Known Issues:**
- [ ] Category labels may use underscores
- [ ] List rendering performance (if inventory is large)
- [ ] Empty state per category
- [ ] Icon/emoji consistency

**UI Components Used:** Card, Badge
**Polish Priority:** MEDIUM

---

### 3. Shop Tab
**File:** `src/components/farm-sim/ui/tabs/ShopTab.jsx`
**Purpose:** Purchase seeds, tools, upgrades, and items
**Key Actions:**
- Browse shop catalog
- Purchase items (with coin check)
- View owned counts
- Daily rotation picks

**Known Issues:**
- [ ] "Owned" state visual clarity
- [ ] Pricing display consistency
- [ ] Purchase feedback (toast + visual highlight)
- [ ] Category organization/tabs
- [ ] Scroll performance on long lists

**UI Components Used:** Card, Button, Badge
**Polish Priority:** HIGH (monetization loop)

---

### 4. Buildings Tab
**File:** `src/components/farm-sim/ui/tabs/BuildingsTab.jsx`
**Purpose:** Construct infrastructure (greenhouse, irrigation, barn, etc.)
**Key Actions:**
- View available buildings
- Purchase/build (with cost check)
- View building benefits
- Upgrade buildings

**Known Issues:**
- [ ] Building benefit display clarity
- [ ] Built vs Available states
- [ ] Cost display formatting
- [ ] Empty state for unlocks

**UI Components Used:** Card, Button, Badge
**Polish Priority:** MEDIUM

---

### 5. Expand Tab
**File:** `src/components/farm-sim/ui/tabs/ExpandTab.jsx`
**Purpose:** Grow farm grid size
**Key Actions:**
- View current grid size
- Purchase expansion (with cost scaling)
- Preview next size

**Known Issues:**
- [ ] Cost calculation display
- [ ] Visual preview of expansion
- [ ] Maximum size messaging

**UI Components Used:** Card, Button
**Polish Priority:** LOW (simple feature)

---

### 6. Research Tab
**File:** `src/components/farm-sim/ui/tabs/ResearchTab.jsx`
**Purpose:** Unlock technology upgrades and improvements
**Key Actions:**
- Browse research tree
- Unlock technologies (with cost)
- View tech benefits
- Prerequisites/dependencies

**Known Issues:**
- [ ] Research tree layout/hierarchy
- [ ] Locked vs Unlocked states
- [ ] Benefit descriptions clarity
- [ ] Cost formatting

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** MEDIUM

---

### 7. Genetics Tab
**File:** `src/components/farm-sim/ui/tabs/GeneticsTab.jsx`
**Purpose:** Breed hybrid crops with combined traits
**Key Actions:**
- Select parent crops
- Crossbreed to create hybrids
- View hybrid traits
- Manage seed inventory

**Known Issues:**
- [ ] Parent selection UI clarity
- [ ] Trait display formatting
- [ ] Hybrid recipe visualization
- [ ] Empty state for no hybrids

**UI Components Used:** Card, Button, Badge
**Polish Priority:** MEDIUM

---

### 8. Weather Tab
**File:** `src/components/farm-sim/ui/tabs/WeatherTab.jsx`
**Purpose:** View forecast and play weather prediction mini-game
**Key Actions:**
- View current weather
- 3-day forecast
- Weather mini-game (predictions)
- View weather effects

**Known Issues:**
- [ ] Weather icon consistency
- [ ] Forecast layout on mobile
- [ ] Mini-game UI polish
- [ ] Effect descriptions clarity

**UI Components Used:** Card, Button, Badge
**Polish Priority:** LOW (secondary feature)

---

### 9. Pets Tab
**File:** `src/components/farm-sim/ui/tabs/PetsTab.jsx`
**Purpose:** Adopt and care for farm pets (dog, cat, chicken)
**Key Actions:**
- Browse available pets
- Adopt pet (with cost)
- Feed, pet, care for animals
- View pet stats (happiness, health, hunger)
- Level up pets

**Known Issues:**
- [ ] Pet card layout and visual hierarchy
- [ ] Stat bars (happiness, health, hunger) visual clarity
- [ ] Action button arrangement (Feed, Pet, etc.)
- [ ] Empty state ("No pets yet—here's how to get one.")
- [ ] Pet trait/bonus display formatting
- [ ] Level progression visualization

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** HIGH (engaging feature, needs visual strength)

---

### 10. Livestock Tab
**File:** `src/components/farm-sim/ui/tabs/LivestockTab.jsx`
**Purpose:** Manage livestock animals (chicken, pig, goat, cow, sheep)
**Key Actions:**
- Purchase animals
- Feed and pet animals
- Collect products (eggs, milk, wool, etc.)
- Upgrade barn capacity
- Sell animals

**Known Issues:**
- [ ] Animal card layout consistency
- [ ] Production timer display
- [ ] Quality modifier visualization
- [ ] Barn capacity UI clarity
- [ ] Empty barn state

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** MEDIUM

---

### 11. Fishing Tab
**File:** `src/components/farm-sim/ui/tabs/FishingTab.jsx`
**Purpose:** Interactive fishing mini-game with rarity tiers
**Key Actions:**
- Cast fishing line
- Play reel mini-game (A/D controls)
- Catch fish (5 rarity tiers)
- Upgrade pond
- View fish encyclopedia

**Known Issues:**
- [ ] Mini-game UI polish (controls, progress bar)
- [ ] Fish collection visualization
- [ ] Pond upgrade UI clarity
- [ ] Rarity tier visual distinction
- [ ] Empty encyclopedia state

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** MEDIUM (mini-game quality)

---

### 12. Challenges Tab
**File:** `src/components/farm-sim/ui/tabs/ChallengesTab.jsx`
**Purpose:** Special challenge mode with objectives
**Key Actions:**
- View available challenges
- Start challenge
- Track progress
- Claim rewards

**Known Issues:**
- [ ] Challenge card layout
- [ ] Progress tracking clarity
- [ ] Reward display
- [ ] Empty state for completed

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** LOW

---

### 13. Events Tab (Town Board)
**File:** `src/components/farm-sim/ui/tabs/EventsTab.jsx`
**Purpose:** Town Board hub with seasonal events, festivals, Story Dashboard, Perfect Harvest mini-game
**Key Actions:**
- View active seasonal events
- Trigger/end events
- Story Dashboard (mood, philosophy, memory teaser)
- Wishing Well (daily blessing)
- Perfect Harvest timing mini-game
- View "What's New" pack highlights
- Daily almanac insight

**Known Issues:**
- [ ] Section organization (too many features?)
- [ ] Perfect Harvest mini-game button visibility
- [ ] Story Dashboard layout on mobile
- [ ] Event timer display clarity
- [ ] "What's New" highlights formatting

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** HIGH (central hub, complex layout)

---

### 14. Processing Tab
**File:** `src/components/farm-sim/ui/tabs/ProcessingTab.jsx`
**Purpose:** Process crops for higher value (flour mill, juice press, etc.)
**Key Actions:**
- Select processing facility
- Queue crops for processing
- Collect processed goods
- View facility upgrades

**Known Issues:**
- [ ] Processing queue visualization
- [ ] Facility status display
- [ ] Value multiplier clarity
- [ ] Empty queue state

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** MEDIUM

---

### 15. Achievements Tab
**File:** `src/components/farm-sim/ui/tabs/AchievementsTab.jsx`
**Purpose:** Track progress across 8 achievement categories, view Scrapbook
**Key Actions:**
- View achievements by category
- Track progress bars
- Claim rewards
- View unlocked achievements
- Browse Scrapbook memories by chapter

**Known Issues:**
- [ ] Category filter UI
- [ ] Progress bar visual clarity
- [ ] Reward display
- [ ] Scrapbook chapter navigation
- [ ] Empty chapter state

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** MEDIUM

---

### 16. Almanac Tab
**File:** `src/components/farm-sim/ui/tabs/AlmanacTab.jsx`
**Purpose:** Farm Almanac signature feature—living journal of farm knowledge
**Key Actions:**
- Browse almanac sections
- View unlocked pages
- Read page content
- Filter by section
- Choose farm philosophy

**Known Issues:**
- [ ] Page card layout and readability
- [ ] Locked page hint display
- [ ] Philosophy picker UI
- [ ] Section navigation
- [ ] Empty section state

**UI Components Used:** Card, Button, Badge
**Polish Priority:** HIGH (signature feature)

---

### 17. Social Tab
**File:** `src/components/farm-sim/ui/tabs/SocialTab.jsx`
**Purpose:** Friends, leaderboard, reputation system
**Key Actions:**
- View friends list
- Manage reputation
- View leaderboard
- Social interactions

**Known Issues:**
- [ ] Placeholder content (may not be fully implemented)
- [ ] Leaderboard layout
- [ ] Reputation visualization
- [ ] Empty friends list state

**UI Components Used:** Card, Button, Badge
**Polish Priority:** LOW (secondary feature)

---

### 18. Analytics Tab
**File:** `src/components/farm-sim/ui/tabs/AnalyticsTab.jsx`
**Purpose:** Farm statistics and performance insights (debug-friendly)
**Key Actions:**
- View farm metrics
- Track production trends
- Economic analysis
- Play time statistics

**Known Issues:**
- [ ] Chart/graph implementation (may need polish)
- [ ] Stat display formatting
- [ ] Data visualization clarity
- [ ] Empty data state

**UI Components Used:** Card, Badge
**Polish Priority:** LOW (debug/power user feature)

---

### 19. Mystery Shop Tab
**File:** `src/components/farm-sim/ui/tabs/MysteryShopTab.jsx`
**Purpose:** Special rare items and mystery seeds
**Key Actions:**
- Browse mystery items
- Purchase rare items
- View mystery seed results
- Limited-time offers

**Known Issues:**
- [ ] Item rarity visual distinction
- [ ] Mystery reveal experience
- [ ] Price display clarity
- [ ] Empty shop state

**UI Components Used:** Card, Button, Badge
**Polish Priority:** LOW

---

### 20. Daily Quests Tab
**File:** `src/components/farm-sim/ui/tabs/DailyQuestsTab.jsx`
**Purpose:** Daily challenges with streak bonuses
**Key Actions:**
- View daily quests
- Track quest progress
- Claim quest rewards
- View streak bonus
- Daily reset countdown

**Known Issues:**
- [ ] Quest card layout
- [ ] Progress visualization
- [ ] Streak bonus display
- [ ] Reset timer formatting
- [ ] Empty quest state (after completion)

**UI Components Used:** Card, Button, Badge, Progress
**Polish Priority:** MEDIUM

---

### 21. Disease Management Tab
**File:** `src/components/farm-sim/ui/tabs/DiseaseManagementTab.jsx`
**Purpose:** Monitor and treat crop diseases
**Key Actions:**
- View diseased crops
- Apply treatments (fungicide, pesticide)
- View treatment inventory
- Disease prevention tips

**Known Issues:**
- [ ] Disease indicator clarity
- [ ] Treatment application UI
- [ ] Inventory display
- [ ] Empty state (no diseases)

**UI Components Used:** Card, Button, Badge
**Polish Priority:** LOW

---

### 22. Settings Tab
**File:** `src/components/farm-sim/ui/tabs/SettingsTab.jsx`
**Purpose:** Game configuration and controls
**Key Actions:**
- Toggle sound effects
- Toggle background music
- Toggle animations
- Toggle reduced motion
- Toggle almanac hints
- Manual save/load
- Clear data
- View version info

**Known Issues:**
- [ ] Toggle switch visual design
- [ ] Section organization (categorize settings)
- [ ] Setting descriptions clarity
- [ ] Destructive action confirmation (clear data)
- [ ] Version/about info formatting

**UI Components Used:** Card, Button, Badge
**Polish Priority:** MEDIUM (UX critical)

---

## UI Components Inventory

### Primitive Components
**Location:** `src/components/ui/`

#### Button (`button.jsx`)
**Variants:** default, destructive, secondary, outline, ghost, success, warning, premium, gold
**Sizes:** default, sm, lg, xl, icon, icon-sm
**Features:**
- Ripple effect animation
- Gradient backgrounds
- Active state scaling
- Focus rings
- Disabled states
- ✅ **Status:** Well-polished, comprehensive

**Known Issues:**
- [ ] Ensure consistent tap target size (≥ 44px) on mobile

---

#### Card (`card.jsx`)
**Features:**
- Base card container
- Glass card variant (blur effect)
- Border and shadow styling

**Known Issues:**
- [ ] Ensure consistent padding across all uses
- [ ] Mobile spacing optimization

---

#### Badge (`badge.jsx`)
**Features:**
- Label/tag component
- Color variants
- Size options

**Known Issues:**
- [ ] Text truncation on long labels
- [ ] Consistent size usage

---

#### Progress (`progress.jsx`)
**Features:**
- Progress bar visualization
- Percentage display
- Color theming

**Known Issues:**
- [ ] Animation smoothness
- [ ] Label positioning consistency

---

#### Tabs (`tabs.jsx`)
**Features:**
- Tab navigation component
- Active state styling
- Content switching

**Known Issues:**
- [ ] Scroll behavior on many tabs
- [ ] Active indicator visual clarity

---

### Game-Specific Components
**Location:** `src/components/farm-sim/ui/`

#### GameHeader (`GameHeader.jsx`)
**Purpose:** Top stats bar with coins, XP, level, mood, season
**Features:**
- Sticky header with backdrop blur
- Gradient coin display
- XP progress bar
- Season indicator
- Mood chip
- Active blessing display

**Known Issues:**
- [ ] Stats overflow on narrow screens (< 375px)
- [ ] Icon alignment consistency
- [ ] Mood chip size optimization

---

#### GameSidebar (`GameSidebar.jsx`)
**Purpose:** Main tab navigation with 22 tabs
**Features:**
- Lazy-loaded tabs
- 2-column grid layout
- Active tab highlighting
- Quick stats footer
- Tab icons (lucide + emoji fallback)

**Known Issues:**
- [ ] Icon consistency (mix of lucide icons and emoji)
- [ ] Scroll behavior with many tabs
- [ ] Active state ring visibility
- [ ] Tab label truncation

---

#### NavBar (`NavBar.jsx`)
**Purpose:** Bottom navigation with 5 main sections (Farm, Items, Build, Animals, More)
**Features:**
- Mobile-first 56px touch targets
- Section-based grouping
- Active state with scale transform
- Notification badges

**Known Issues:**
- [ ] Section icons may need standardization
- [ ] Badge positioning on small screens
- [ ] Safe area padding for iOS

---

#### NotificationSystem (`NotificationSystem.jsx`)
**Purpose:** Toast notification stack
**Features:**
- Auto-dismiss after 5s (DEFAULT - **NEEDS CHANGE to 3.5s**)
- Manual close button
- 4 types: success, error, warning, info
- Staggered entry animations
- Shows max 4 notifications + count

**Known Issues:**
- [x] **CRITICAL:** Auto-dismiss is 5s, needs to be 3.5s (per requirements)
- [ ] Close button tap target size
- [ ] Pause on hover/press (not implemented)
- [ ] Timer clearing on rapid close
- [ ] Mobile positioning (safe area)
- [ ] Layout thrash prevention (use transform/opacity only)

---

#### FarmGrid (`FarmGrid.jsx`)
**Purpose:** Interactive farm plot grid
**Features:**
- Visual crop growth stages
- Plot state indicators (empty, growing, ready, withered)
- Click to plant/harvest/clear
- Hover preview
- Animations

**Known Issues:**
- [ ] Grid scaling on small screens
- [ ] Touch target size for plots
- [ ] Animation performance (many plots)

---

#### ParticleEffect (`ParticleEffect.jsx`)
**Purpose:** Visual effects for harvests, level-ups, etc.
**Features:**
- Coin burst animation
- Floating text
- Sparkle effects
- Screen shake

**Known Issues:**
- [ ] Performance with many particles
- [ ] Reduced motion support check
- [ ] Cleanup on unmount

---

#### WeatherEffects (`WeatherEffects.jsx`)
**Purpose:** Real-time weather animations (rain, snow, lightning)
**Features:**
- Animated rain drops
- Snowflakes
- Lightning flashes
- Storm effects

**Known Issues:**
- [ ] Performance optimization (particle count)
- [ ] Reduced motion support
- [ ] Z-index layering

---

## Icon System Analysis

### Current Icon Sources
1. **Lucide React Icons** - Used for UI controls, tabs, navigation
   - Examples: CheckCircle, AlertCircle, Info, X, Circle
   - **Status:** Consistent, professional

2. **Emoji** - Used for content items (crops, decor, pets, festivals)
   - Examples: 🌱, 🐕, 🎉, 🏠
   - **Status:** Inconsistent sizing, alignment issues

3. **Mixed Usage** - Some tabs use both
   - GameSidebar uses `TAB_INFO` from NavBar which includes both icon + emoji
   - **Issue:** Need to standardize fallback pattern

### Icon Standards (from UI_GUIDE.md)
- Small: 16px (`.icon-16`)
- Medium: 20px (`.icon-20`)
- Large: 24px (`.icon-24`)

### Missing Icons / Fallbacks Needed
- [ ] Tab icons should consistently use lucide when available, emoji as fallback
- [ ] Content icons (crops, decor) should use normalized emoji size
- [ ] Action buttons should prefer lucide icons
- [ ] Missing icon placeholder (neutral Circle icon)

### Icon Validation
- ContentManager has debug preflight warnings for missing content icons
- Accessible via `?debug=1` mode

---

## Display Text / Copy Issues

### Underscore Text Problems
**Examples Found:**
- `pet_food` → should display as "Pet Food"
- `pest_prevention` → should display as "Pest Prevention"
- `crop_quality` → should display as "Crop Quality"
- Various inventory items, traits, bonuses use snake_case

**Solution Needed:**
- Implement safe display formatter function
- Apply ONLY to display strings, never to IDs
- Pattern: `snake_case` → `Title Case`

### Copy Tone & Consistency
**Targets:**
- [ ] Consistent capitalization (Title Case for labels, Sentence case for descriptions)
- [ ] Concise helper text (1-2 sentences max)
- [ ] Good empty states with guidance
  - Example: "No pets yet—here's how to get one."
  - Example: "No quests available. Check back tomorrow!"
- [ ] Action button labels (consistent verbs: Buy, Adopt, Claim, Unlock, etc.)

---

## Save/Load System
**Files:**
- `src/components/farm-sim/context/GamePersistence.js` - Save/load logic + migrations
- `src/components/farm-sim/context/GameReducer.js` - State schema
- `src/components/farm-sim/context/GameContext.jsx` - Auto-save loop

**Features:**
- Auto-save every 30 seconds
- Manual save via Settings
- Version migration support
- Backup save slot
- localStorage persistence

**Known Issues:**
- [ ] Large save size optimization (consider compression)
- [ ] Migration testing for new fields
- [ ] Save validation on load

---

## Performance Considerations

### Current Performance Status (from PERF_NOTES.md)
- System update loop: rAF throttled to 10 FPS
- Auto-save: debounced 2s with change detection
- FPS counter: debug-only
- Stress testing: debug panel available

### Known Performance Risks
1. **Notification System:** Many rapid notifications could cause layout thrash
2. **Farm Grid:** Large grids with many plots + animations
3. **Tab Switching:** Lazy loading helps, but rapid switching stress test needed
4. **Particle Effects:** Too many particles could impact FPS
5. **Weather Effects:** Rain/snow particle count

### Performance Requirements (Per Mission)
- ✅ No per-tick UI work (only update on open/data change)
- ✅ Smooth animations (prefer transform/opacity)
- ✅ Avoid layout thrash
- ✅ Cache DOM refs, batch writes with rAF
- [ ] Verify no regression after polish changes

---

## Mobile-First Requirements (375px Baseline)

### Critical Checks
- [ ] No horizontal scroll at 375px width
- [ ] All tap targets ≥ 44px
- [ ] Safe area padding for iOS (notch, home indicator)
- [ ] No scroll traps or double scroll containers
- [ ] Readable text at base size (no sub-12px)
- [ ] Touch-friendly spacing between interactive elements

### Known Mobile Issues
- [ ] GameHeader stats may overflow at 375px
- [ ] GameSidebar tab grid needs scroll testing
- [ ] Shop/Inventory lists on small screens
- [ ] Events tab (too much content?)
- [ ] Settings tab toggle switches sizing

---

## Content Pipeline Integration

### Content Files (from CONTENT_PIPELINE.md)
**Base Content:** `content/*.json`
- crops.json
- decor.json
- festivals.json
- almanac.json
- strings.json

**Season Packs:** `content/packs/<pack_id>/`
- Current: `season-pack-v1` with crops, decor, festivals, almanac

**Content Manager:** `src/content/ContentManager.js`
- Load/merge/validate at boot
- Debug validation via `?debug=1`
- ID conflict detection

### Content Expansion Opportunities (Phase 6)
- [ ] Add 2-3 new crops per season (data-only)
- [ ] Add 3-5 new decor items (data-only)
- [ ] Add 1-2 new festivals (data-only)
- [ ] Add 5-10 new almanac pages (data-only)
- [ ] Validate all additions via debug tools

---

## Polish Priorities Summary

### HIGH Priority (Core Loop)
1. **Farming Tab** - Core gameplay, must be perfect
2. **Shop Tab** - Monetization loop, clear owned states
3. **Pets Tab** - Visual strength, card layout, stats clarity
4. **Events Tab** - Central hub, complex layout needs organization
5. **Almanac Tab** - Signature feature, readability critical
6. **Notification System** - Used everywhere, needs professional upgrade

### MEDIUM Priority (Important Features)
1. Settings Tab - UX critical, needs clear organization
2. Achievements Tab - Progress tracking clarity
3. Inventory Tab - List performance and clarity
4. Daily Quests Tab - Engagement driver
5. Livestock Tab - Animal management UI
6. Fishing Tab - Mini-game quality
7. Processing Tab - Value chain clarity
8. Research Tab - Tech tree navigation
9. Genetics Tab - Parent selection UX
10. Buildings Tab - Benefit clarity

### LOW Priority (Secondary Features)
1. Expand Tab - Simple feature
2. Weather Tab - Secondary mechanic
3. Challenges Tab - Optional content
4. Social Tab - May have placeholder content
5. Analytics Tab - Debug/power user
6. Mystery Shop Tab - Special feature
7. Disease Management Tab - Reactive feature

---

## Next Steps

### Immediate Actions (Phase 1)
- [x] Complete this POLISH_MAP.md
- [ ] Create UX_CHECKLIST.md (mobile-first requirements)
- [ ] Update QA_REPORT.md with test skeleton for this run

### Phase 2: Copy + Text
- [ ] Implement display formatter (snake_case → Title Case)
- [ ] Apply formatter to all display text (preserve IDs)
- [ ] Copy pass: capitalization, helper text, empty states

### Phase 3: Icons + Visual
- [ ] Standardize icon usage (lucide preferred, emoji fallback)
- [ ] Fix missing icons
- [ ] Update UI_GUIDE.md with icon rules
- [ ] Audit button variants usage
- [ ] Card/panel padding consistency

### Phase 4: Tab-by-Tab Polish
- [ ] Start with HIGH priority tabs
- [ ] Layout, spacing, alignment fixes
- [ ] Responsiveness testing at 375px
- [ ] Feedback improvements (toasts, highlights)
- [ ] Performance optimization per tab

### Phase 5: Notification Polish
- [ ] Change auto-dismiss from 5s to 3.5s
- [ ] Ensure close button is ≥ 44px tap target
- [ ] Implement pause on hover/press
- [ ] Test timer clearing on rapid close
- [ ] Mobile positioning with safe area
- [ ] Verify no layout thrash (transform/opacity only)

### Phase 6: Content Expansion
- [ ] Add small content pack (2-3 crops, 3-5 decor, 1-2 festivals, 5-10 almanac pages)
- [ ] Validate IDs, icons, prices
- [ ] Test save/load compatibility

### Phase 7: Bug Check
- [ ] Rapid tab switching (30+ times)
- [ ] Notification stress (50+ rapid spawns + close)
- [ ] Farm grid stress (fill + harvest cycles)
- [ ] Shop/tab stress (open/close repeatedly)
- [ ] Save → reload under heavy state
- [ ] Zero console errors target

### Phase 8: Performance Sanity
- [ ] Confirm no new per-tick work
- [ ] List rendering only on open/data change
- [ ] No progressive slowdown
- [ ] Update PERF_NOTES.md

---

**End of POLISH_MAP.md**
