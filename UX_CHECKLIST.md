# UX Checklist — Mobile-First (375px Baseline)

**Date:** 2026-02-03
**Baseline Width:** 375px (iPhone SE, small Android)
**Target:** Clean, fully usable experience on smallest common mobile devices

---

## Core Mobile Requirements

### ✅ = Verified | ⚠️ = Needs Testing | ❌ = Known Issue

---

## 1. Layout & Scrolling

### Horizontal Scroll Prevention
- [ ] ⚠️ No horizontal scroll at 375px width (test all tabs)
- [ ] ⚠️ No content clipping at edges
- [ ] ⚠️ All containers fit within viewport width
- [ ] ⚠️ Farm grid scales appropriately
- [ ] ⚠️ Long text wraps (no overflow)
- [ ] ⚠️ Tables/lists are responsive or scroll horizontally safely

**Test Cases:**
- GameHeader stats bar (coins, XP, level, mood, season)
- GameSidebar tab grid (2 columns)
- Shop item cards and lists
- Inventory lists
- Almanac page content
- Events tab sections

---

### Scroll Behavior
- [ ] ⚠️ No scroll traps (nested scroll containers)
- [ ] ⚠️ No double scroll issues
- [ ] ⚠️ Smooth momentum scrolling
- [ ] ⚠️ ScrollIntoView on tab change (if needed)
- [ ] ⚠️ Tab content scrollable independently
- [ ] ⚠️ Modal/overlay scroll lock (prevent body scroll)

**Test Cases:**
- GameSidebar with 22 tabs (grid scroll)
- Shop with long item lists
- Inventory with many items
- Almanac with many pages
- Scrapbook chapters

---

## 2. Touch Targets & Interaction

### Minimum Tap Target Size (44px × 44px)
- [ ] ⚠️ All buttons ≥ 44px height
- [ ] ⚠️ Tab buttons (GameSidebar) ≥ 44px
- [ ] ⚠️ NavBar section buttons = 56px (per current)
- [ ] ⚠️ Notification close button ≥ 44px
- [ ] ❌ Settings toggle switches ≥ 44px tap area
- [ ] ⚠️ Farm grid plots touchable
- [ ] ⚠️ Card action buttons ≥ 44px
- [ ] ⚠️ Icon-only buttons have large enough hit area

**Audit List:**
1. Button component: `size="sm"` is 32px (h-8) **→ May be too small**
2. Button component: `size="default"` is 40px (h-10) **→ Close but check**
3. Button component: `size="lg"` is 48px (h-12) **→ OK**
4. GameSidebar tabs: Check actual rendered height
5. Notification close (X) button: Currently `h-7 w-7` (28px) **→ TOO SMALL**
6. Settings toggles: Check implementation

---

### Touch Interaction Spacing
- [ ] ⚠️ Minimum 8px spacing between adjacent touch targets
- [ ] ⚠️ Button groups have adequate spacing
- [ ] ⚠️ List items not cramped
- [ ] ⚠️ Form inputs properly spaced

**Test Cases:**
- Farming tab quick action buttons
- Shop purchase buttons in list
- Settings toggle switches
- Achievement category filters

---

### Active States & Feedback
- [ ] ✅ Buttons have active state (scale-95)
- [ ] ✅ Ripple effect on button press
- [ ] ⚠️ Visual feedback on all interactive elements
- [ ] ⚠️ Disabled states clearly indicated (opacity-50)
- [ ] ⚠️ Loading states for async actions
- [ ] ⚠️ Success/error toasts for all actions

---

## 3. Safe Area & Platform Compatibility

### iOS Safe Area (Notch & Home Indicator)
- [ ] ⚠️ Top safe area padding (status bar + notch)
- [ ] ⚠️ Bottom safe area padding (home indicator)
- [ ] ⚠️ NavBar respects safe area bottom
- [ ] ⚠️ GameHeader respects safe area top
- [ ] ⚠️ Notifications positioned correctly (not under status bar)
- [ ] ⚠️ Full-screen modals have safe area insets

**Current Implementation Check:**
- `index.css` should define safe area variables
- Components should use `safe-area-inset-*` where needed

**Test Devices:**
- iPhone 12+ (notch)
- iPhone 14+ (Dynamic Island)
- Modern Android with gesture navigation

---

### Viewport Meta Tag
- [ ] ✅ Already set: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- File: `index.html` line 5

---

## 4. Typography & Readability

### Font Sizes
- [ ] ⚠️ No text smaller than 12px (readable minimum)
- [ ] ⚠️ Body text: 14px (text-sm) or 16px (text-base)
- [ ] ⚠️ Helper text: 12px (text-xs) minimum
- [ ] ⚠️ Headings: 18px+ (text-lg+)
- [ ] ⚠️ Button text: 14px (text-sm) minimum

**Audit List:**
- GameSidebar quick stats footer: `text-[10px]` **→ Too small, should be 12px**
- Notification details: `text-xs` (12px) **→ OK**
- Tab labels: `text-xs` (12px) **→ May be too small for some users**

---

### Line Height & Spacing
- [ ] ⚠️ Line height adequate for readability (1.5 minimum)
- [ ] ⚠️ Paragraph spacing (mt-2 or mt-4)
- [ ] ⚠️ No text wall blocks (break into shorter paragraphs)

---

### Text Wrapping & Truncation
- [ ] ⚠️ Long words wrap or hyphenate
- [ ] ⚠️ Truncation uses ellipsis (...)
- [ ] ⚠️ Tooltip on hover for truncated text (desktop)
- [ ] ⚠️ Full text visible on tap (mobile)

**Test Cases:**
- Long crop names in inventory
- Achievement descriptions
- Almanac page titles
- Event names

---

## 5. Empty States

### User Guidance
- [ ] ⚠️ All empty states have helpful text
- [ ] ⚠️ Empty states suggest next action
- [ ] ⚠️ Friendly tone (not just "No items")

**Required Empty States:**
1. **Pets Tab:** "No pets yet—here's how to get one. Visit the Shop to adopt your first companion!"
2. **Inventory:** "Your inventory is empty. Plant and harvest crops to fill it up!"
3. **Achievements:** "No achievements unlocked yet. Keep farming to earn your first badge!"
4. **Scrapbook:** "No memories yet. Play to create your farm story."
5. **Livestock:** "Your barn is empty. Purchase animals from the Shop to get started!"
6. **Fishing:** "No fish caught yet. Cast your line and start your collection!"
7. **Daily Quests:** "All quests complete! Check back tomorrow for new challenges."
8. **Shop:** (unlikely empty, but if filtered) "No items match your filter."
9. **Disease Management:** "All crops are healthy! No diseases to treat."
10. **Events:** "No active events right now. Check back during festivals!"

---

## 6. Tooltips & Contextual Help

### Information Density
- [ ] ⚠️ Complex features have helper text or tooltips
- [ ] ⚠️ Stat abbreviations explained (Rep = Reputation)
- [ ] ⚠️ Icon-only buttons have aria-label or tooltip
- [ ] ⚠️ Settings options have descriptions

**Targets:**
- GameHeader mood chip (explain mood tiers)
- GameHeader active blessing (explain what it does)
- Building bonuses (tooltip on hover/tap)
- Research tech benefits
- Pet traits (what do they actually do?)

---

## 7. Animations & Motion

### Reduced Motion Support
- [ ] ✅ CSS `prefers-reduced-motion` query implemented
- [ ] ✅ Settings toggle for "Reduced Motion"
- [ ] ⚠️ Animations disabled when reduced motion active
- [ ] ⚠️ Particle effects disabled when reduced motion active
- [ ] ⚠️ Screen shake disabled when reduced motion active
- [ ] ⚠️ Essential motion preserved (progress bars, loading)

---

### Animation Performance
- [ ] ⚠️ All animations use `transform` and `opacity` (not width/height/position)
- [ ] ⚠️ No layout thrash (forced reflow during animation)
- [ ] ⚠️ Animations use `will-change` sparingly (only during animation)
- [ ] ⚠️ 60 FPS target maintained during animations

**Test Cases:**
- Notification entry/exit
- Button ripple effect
- Tab switching transition
- Particle effects (coins, sparkles)
- Weather effects (rain, snow)
- Crop growth animations

---

## 8. Forms & Inputs

### Input Fields (If Any)
- [ ] N/A - Game uses mostly buttons, not forms
- (Reserve for future if text inputs added)

---

## 9. Color & Contrast

### Accessibility
- [ ] ⚠️ Text contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] ⚠️ Interactive elements have clear visual distinction
- [ ] ⚠️ Don't rely on color alone for information
- [ ] ⚠️ Error/success states use icons + color

**Audit List:**
- Light text on light gradient backgrounds
- Badge text contrast
- Notification text contrast
- Disabled button text

---

### Dark Mode (Future)
- [ ] Not implemented yet (future enhancement)

---

## 10. Loading States

### Initial Load
- [ ] ⚠️ Loading screen or skeleton while game loads
- [ ] ⚠️ Progress indicator for large operations
- [ ] ⚠️ Tab lazy loading shows spinner (currently implemented)

---

### Action Feedback
- [ ] ⚠️ Button shows loading state during async action
- [ ] ⚠️ Disabled during processing (prevent double-submit)
- [ ] ⚠️ Toast notification confirms success/failure

---

## 11. Notifications / Toasts

### Notification System Requirements
- [ ] ❌ Auto-dismiss after 3.5 seconds (currently 5s) **→ NEEDS FIX**
- [ ] ⚠️ Close button ≥ 44px tap target (currently 28px) **→ NEEDS FIX**
- [ ] ❌ Pause on hover/press (not implemented) **→ NEEDS IMPLEMENTATION**
- [ ] ⚠️ Grouped/stacked neatly (currently max 4 shown)
- [ ] ⚠️ Close is idempotent (no crash on double-close)
- [ ] ⚠️ Timers cleared on close
- [ ] ⚠️ No layout thrash (transform/opacity only)
- [ ] ⚠️ Mobile positioning (top-right, not under status bar)
- [ ] ⚠️ Readable at 375px width (currently `w-72 sm:w-80`)

**File:** `src/components/farm-sim/ui/NotificationSystem.jsx`

---

## 12. Modal & Overlay Behavior

### Modal UX
- [ ] ⚠️ Backdrop overlay prevents interaction with background
- [ ] ⚠️ Close button clearly visible (X icon)
- [ ] ⚠️ ESC key to close (desktop)
- [ ] ⚠️ Tap outside to close (optional, but common UX)
- [ ] ⚠️ Focus trap (tab cycles within modal)
- [ ] ⚠️ Scroll lock on body when modal open
- [ ] ⚠️ Mobile safe area respected

**Modals to Check:**
- Perfect Harvest mini-game modal
- Any confirmation dialogs
- Settings clear data confirmation

---

## 13. Performance on Mobile

### FPS & Smoothness
- [ ] ⚠️ Maintain 60 FPS on mid-range devices
- [ ] ⚠️ No janky scrolling
- [ ] ⚠️ Smooth tab switching (lazy loading helps)
- [ ] ⚠️ Farm grid rendering performance (large grids)
- [ ] ⚠️ Particle effects don't drop FPS

**Test Devices:**
- iPhone SE (2020) - A13 Bionic
- Mid-range Android (Snapdragon 7 series)

---

### Memory & Battery
- [ ] ⚠️ No memory leaks (clear timers/listeners on unmount)
- [ ] ⚠️ Pause game loop when tab hidden (implemented)
- [ ] ⚠️ Auto-save debounced (2s, already implemented)
- [ ] ⚠️ Reasonable battery usage (no excessive re-renders)

---

## 14. Specific Tab Mobile Checks

### High-Priority Tabs (Mobile UX Critical)

#### Farming Tab
- [ ] ⚠️ Quick action buttons fit at 375px (4 buttons: Water, Harvest, Fertilize, Treat)
- [ ] ⚠️ Crop selection dropdown/grid usable
- [ ] ⚠️ Action feedback (toast + visual change)

#### Shop Tab
- [ ] ⚠️ Item cards fit 1-column at 375px (or 2-column with adequate spacing)
- [ ] ⚠️ Purchase button + owned count visible
- [ ] ⚠️ Scroll performance with long catalog
- [ ] ⚠️ Category filters fit

#### Pets Tab
- [ ] ⚠️ Pet cards layout (1 column at 375px recommended)
- [ ] ⚠️ Stat bars (happiness, health, hunger) readable
- [ ] ⚠️ Action buttons (Feed, Pet, etc.) fit and are tappable
- [ ] ⚠️ Empty state message visible

#### Events Tab (Town Board)
- [ ] ⚠️ Story Dashboard sections don't overflow
- [ ] ⚠️ Perfect Harvest button visible
- [ ] ⚠️ Event timer readable
- [ ] ⚠️ "What's New" highlights layout
- [ ] ⚠️ Wishing Well UI fits

#### Almanac Tab
- [ ] ⚠️ Page cards readable (title + preview)
- [ ] ⚠️ Section navigation fits
- [ ] ⚠️ Philosophy picker usable
- [ ] ⚠️ Locked page hints readable

#### Settings Tab
- [ ] ⚠️ Toggle switches large enough (≥ 44px)
- [ ] ⚠️ Section organization clear
- [ ] ⚠️ Destructive actions (Clear Data) clearly marked
- [ ] ⚠️ Version info readable

---

## 15. Cross-Browser & Device Testing

### Browsers (Mobile)
- [ ] ⚠️ Safari iOS (14+)
- [ ] ⚠️ Chrome Android
- [ ] ⚠️ Firefox Mobile
- [ ] ⚠️ Samsung Internet

### Devices
- [ ] ⚠️ iPhone SE (375px width)
- [ ] ⚠️ iPhone 12/13/14 (390px width)
- [ ] ⚠️ iPhone 14 Pro Max (430px width)
- [ ] ⚠️ Small Android (360-375px)
- [ ] ⚠️ Mid Android (390-412px)

### Orientations
- [ ] ⚠️ Portrait mode primary (optimized)
- [ ] ⚠️ Landscape mode functional (not required to be perfect, but shouldn't break)

---

## 16. Accessibility (Beyond Mobile)

### Keyboard Navigation (Desktop)
- [ ] ⚠️ Tab order logical
- [ ] ⚠️ Focus indicators visible
- [ ] ⚠️ All interactive elements reachable by keyboard
- [ ] ⚠️ Shortcuts documented (if any)

### Screen Readers
- [ ] ⚠️ Semantic HTML (buttons, headings, lists)
- [ ] ⚠️ aria-label on icon-only buttons
- [ ] ⚠️ aria-live regions for notifications
- [ ] ⚠️ Alt text on images (if any)

---

## Known Issues Summary (Prioritized)

### 🔴 CRITICAL (Must Fix)
1. **Notification auto-dismiss:** 5s → 3.5s
2. **Notification close button:** 28px → 44px tap target
3. **Notification pause on hover/press:** Not implemented

### 🟠 HIGH (Should Fix)
1. **GameSidebar quick stats:** Font size 10px → 12px minimum
2. **Settings toggle switches:** Verify ≥ 44px tap area
3. **Tab button sizing:** Ensure ≥ 44px height
4. **Empty states:** Add to all tabs with helpful messaging

### 🟡 MEDIUM (Nice to Have)
1. **Safe area padding:** iOS notch/home indicator support
2. **Reduced motion:** Verify all animations respect setting
3. **Text contrast:** Audit all gradient backgrounds
4. **Long text truncation:** Add tooltips/expand on tap

### 🟢 LOW (Polish)
1. **Tooltip system:** Add contextual help for complex features
2. **Loading states:** Skeleton screens for initial load
3. **Animation performance:** Audit for transform/opacity usage

---

## Testing Checklist (Per Phase 7)

### Manual Testing Scenarios
1. [ ] Load game at 375px width (iPhone SE simulator)
2. [ ] Navigate all 22 tabs - check for overflow/clipping
3. [ ] Rapid tab switching 30+ times
4. [ ] Spawn 50 notifications and close rapidly
5. [ ] Test all touch targets with finger (not pointer)
6. [ ] Test with reduced motion enabled
7. [ ] Test in Safari iOS and Chrome Android
8. [ ] Test portrait and landscape
9. [ ] Test with iOS safe area (notch)
10. [ ] Test all empty states

---

## Next Actions

### Immediate Fixes (Phase 4-5)
1. Fix notification auto-dismiss duration (5s → 3.5s)
2. Fix notification close button size (28px → 44px+)
3. Implement notification pause on hover/press
4. Fix GameSidebar stats font size (10px → 12px)
5. Audit all button sizes (ensure ≥ 40px default, 44px preferred)

### Phase 4 (Tab Polish)
1. Test each tab at 375px width
2. Add empty states with helpful messaging
3. Fix any overflow/clipping issues
4. Verify touch target sizes
5. Optimize layouts for mobile

### Phase 7 (QA)
1. Run full mobile UX test suite
2. Cross-browser testing
3. Cross-device testing
4. Accessibility audit
5. Performance profiling on mobile

---

**End of UX_CHECKLIST.md**
