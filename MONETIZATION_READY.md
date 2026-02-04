# Monetization-Ready Cosmetics (Disabled by Default)

**Sprint:** G3 — Monetization-Ready Cosmetics (Disabled by Default)  
**Status:** Foundations only (no payments, no paywalls)

## Goals
- Introduce a centralized entitlement layer for **cosmetic-only** content.
- Keep **FREE_MODE** as the default behavior (identical to current gameplay).
- Allow future premium packs via metadata (`pack.json`) without new loaders.
- Preserve save/load stability and avoid data loss when entitlements are missing.

## Non-Goals
- No payments, no store SDKs, no network calls.
- No gameplay-affecting gates (economy, crops, upgrades, progression).
- No paywalls or forced purchases.
- No UI changes in free mode (premium UI only appears when dev flag enables premium mode).

---

## Entitlement Model
**Single source of truth:** `src/components/farm-sim/entitlements/EntitlementManager.js`

### Modes
- **FREE_MODE** (`free`): default, all content is accessible.
- **PREMIUM_MODE** (`premium`): access is based on entitlements.
- **Release mode override:** release builds force FREE_MODE.

### Stored State (Save Data)
```json
entitlements: {
  mode: "free" | "premium",
  packs: ["pack-id-1", "pack-id-2"],
  lockedCosmetics: {
    decor: { "plotIndex": "decorId" },
    farmTheme: null
  }
}
```

### EntitlementManager APIs
- `isPackUnlocked(packId)`
- `isItemUnlocked(itemId)` (decor items map back to pack)
- `listUnlockedPacks()`
- `grantEntitlement(packId)` (dev-only helper)
- `revokeEntitlement(packId)` (dev-only helper)

**Fail-safe behavior**
- Missing/corrupt entitlements:
  - FREE_MODE: allow.
  - PREMIUM_MODE: treat as not owned, never crash.

---

## Pack Metadata Extensions
**Location:** `content/packs/<pack_id>/pack.json`

New optional fields (defaults applied):
```json
{
  "access": "free" | "premium",
  "skuId": "string",
  "badgeLabel": "Premium"
}
```

**Defaults**
- `access`: `"free"`
- `badgeLabel`: `"Premium"` when access is `"premium"`

**Validation**
- `access` must be `"free"` or `"premium"`.
- `skuId` (if present) must be alphanumeric/._-.
- Pack IDs must be unique.

---

## Free Mode vs Premium Mode

### FREE_MODE (Default)
- **Identical to current game behavior.**
- No premium badges.
- No locks or prompts.
- All cosmetics are usable.

### PREMIUM_MODE (Debug-only)
- Premium packs/items show a **“Premium” badge** in lists.
- Premium cosmetics are still visible (browsing allowed).
- **Attempting to use a locked cosmetic** shows:
  - **Title:** “Premium Item”
  - **Body:** “This cosmetic isn’t owned on this device.”
  - **Actions:** “OK” (+ “Grant Access” in debug only)

---

## Save/Load Safety & Fallbacks
When premium mode is enabled and a save references a locked cosmetic:
- The cosmetic **reverts to default** (no crash).
- A toast appears: **“A premium cosmetic isn’t owned; reverted to default.”**
- The original cosmetic reference is preserved in `entitlements.lockedCosmetics`.

This ensures:
- **No save corruption.**
- **No irreversible loss** unless the user re-saves intentionally.

---

## Adding Premium Packs in the Future (No Payments Yet)
1. Add `access: "premium"` to `pack.json`.
2. Optional: add `skuId` placeholder (for future storefront mapping).
3. Validate via `?debug=1` → **Re-validate** in Debug Stress Panel.
4. Use debug **Entitlements** panel to grant/revoke access for testing.

---

## Safety Rules (Hard Requirements)
- Premium gating is **cosmetic-only** (decor, themes, frames, skins, pet cosmetics).
- No gameplay advantage.
- Premium mode is **off by default**.
- Debug tools remain **hidden in release mode**.
