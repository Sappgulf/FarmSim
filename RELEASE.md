# Release Process — FarmSim

## Versioning Rules (SemVer)
- **APP_VERSION** (app release): `MAJOR.MINOR.PATCH` in `src/config/release.js`.
  - **PATCH**: bug fixes, polish, content-only updates.
  - **MINOR**: new features, new systems, new tabs.
  - **MAJOR**: save-breaking or structural rewrites (avoid).
- **SAVE_VERSION** (save schema): tracked separately in `src/components/farm-sim/context/GamePersistence.js`.
  - Only bump when save data shape changes.

## Release Modes
- **Development mode**: default locally (`npm run dev`).
- **Release mode**: shipping build (Vite production or `VITE_RELEASE_MODE=true`).
  - Debug panels/tools hidden.
  - QA harness not visible.
  - Debug logging suppressed.

## Release Checklist (Must Pass)
1) **Run QA suite** (QA Mode panel in `?debug=1`).
2) **Fix failures** (QA suite, console errors, or uncaught exceptions).
3) **Validate content** (content validation errors = 0; warnings allowed but logged).
4) **Update CHANGELOG.md** with release notes (Added/Changed/Fixed/Performance/UI/UX).
5) **Bump APP_VERSION** in `src/config/release.js`.
6) **Verify “What’s New”** appears once per version and dismisses cleanly.
7) **Confirm save/load** works on latest save without migration errors.

> Optional helper: run `window.canRelease()` in dev mode to print a release gate summary.

## Rollback Guidance
- If a release fails, roll APP_VERSION back to the prior tag and restore the previous CHANGELOG entry.
- If a save schema bump shipped incorrectly, revert the SAVE_VERSION change and re-run migrations on a branch before shipping.
