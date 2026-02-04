# AGENT.md — Farm Sim Engineering Agent Contract

## Purpose
This repository is an HTML/JS Farm Sim. Your job as an agent is to ship correct, stable, performant changes with minimal disruption. You must be deterministic, traceable, and avoid duplicate implementations.

## Operating Principles
- **Audit-first.** Read repo structure and relevant docs before changing anything.
- **No duplicates.** Never implement a feature/system twice. Extend existing code.
- **Small, testable diffs.** Prefer targeted changes over rewrites.
- **Performance is a feature.** Avoid per-tick/ per-frame work unless strictly required.
- **Stability > features.** Crashes, leaks, and console errors are P0.
- **Mobile-first.** Must work at 375px width without clipping or horizontal scroll.
- **Docs are part of the product.** Update docs when behavior changes.

## Required Workflow (Do Not Skip)
1) **Repo Audit**
   - Identify entrypoints, state/store, UI tabs, minigames, notifications, save/load.
   - Read ALL `.md` files. Especially `MEMORY.md`, `CHANGELOG.md`, `UI_MAP.md` (if present).
2) **Inventory + Non-Duplication Check**
   - Create/refresh an internal list: “Already Exists / Partial / Missing” for the area you’ll touch.
   - If overlap exists, refactor/consolidate instead of adding parallel code.
3) **Reproduction + Baseline**
   - Reproduce the bug or measure baseline performance before changes.
   - Capture steps and symptoms in the PR/commit notes or `CHANGELOG.md` (dev notes section).
4) **Implement**
   - Make minimal diffs.
   - Keep API boundaries clean (minigames, toasts, tabs).
   - Avoid introducing new dependencies unless justified and lightweight.
5) **Verification**
   - No console errors in normal play.
   - No crashes under stress (tab switching, notification spam, plot fill/harvest, save/load).
   - Ensure no progressive slowdown / timer/listener leaks.
   - Validate mobile fit at 375px.
6) **Document**
   - Update `CHANGELOG.md`.
   - Update any relevant docs (`UI_MAP.md`, `QA_REPORT.md`, `PWA_NOTES.md`, etc.).

## Engineering Constraints
### Performance
- One authoritative render loop (if applicable). Avoid stacked intervals/rAF.
- No `querySelector` inside hot loops; cache DOM refs.
- Batch DOM writes; separate layout reads from writes.
- Prefer CSS `transform/opacity` for animations.
- Lists render only on open / data change (avoid constant rerenders).

### Stability
- All close/destroy operations must be **idempotent**.
- Never mutate arrays while iterating forward (use backwards loop or mark+filter).
- Cleanup: remove listeners, clear timers, cancel rAF on unmount/close.
- Save/load must validate schema and clamp invalid values.

### Mobile
- Tap targets ≥ 44px.
- Safe-area padding on iOS.
- No horizontal scroll, no clipped modals, no scroll traps.

## Output Requirements (Every Run)
When you finish a task, produce:
- Summary of changes (bullets)
- Bugs fixed (bullets)
- Perf impact (baseline vs after if measured)
- Files changed (exact list)
- Remaining known issues (if any)

## Forbidden Moves
- Full rewrites without explicit instruction.
- Introducing new architecture (framework/state system/router) unless requested.
- Adding features that weren’t requested.
- Duplicating content definitions or creating parallel systems.
- Leaving debug tooling enabled by default.

## Definitions
- **P0:** crash, data loss, save corruption, console spam, severe perf regression.
- **P1:** broken flow, broken UI on mobile, obvious jank, minigame unreliability.
- **P2:** cosmetic/layout inconsistencies, copy issues, minor polish.
