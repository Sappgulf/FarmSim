# Sora Asset Pipeline

This folder contains a repeatable workflow to generate and track FarmLife icon assets with Sora.

## Files

- `content/sora/icon-manifest.json`: Source of truth for icon IDs, labels, and subjects.
- `scripts/sora/build-icon-prompts.mjs`: Generates prompt and checklist files from the manifest.
- `content/sora/prompts/sora-icon-prompts.md`: Ready-to-paste prompts (generated).
- `content/sora/prompts/icon-checklist.csv`: Tracking sheet for generated assets (generated).
- `public/assets/sora/icons/`: Drop generated icon PNG files here.

## Usage

1. Generate prompt files:

```bash
npm run sora:prompts
```

2. Open `content/sora/prompts/sora-icon-prompts.md` and run each prompt in Sora.
3. Export each icon as transparent PNG at 512x512.
4. Name each file exactly as the prompt ID, for example:

```text
public/assets/sora/icons/tab-farming.png
public/assets/sora/icons/nav-section-farm.png
```

5. Refresh the app. `NavBar` automatically uses generated assets and falls back to Lucide/emoji if missing.

## Notes

- Keep icon framing consistent across all generations.
- Avoid text labels inside icon artwork.
- Re-run `npm run sora:prompts` after any manifest update.
