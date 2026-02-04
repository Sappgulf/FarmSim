import { isReleaseMode } from '../../../config/release';
import { getContentManager } from '../../../content/ContentManager';

export const ENTITLEMENT_MODES = {
  FREE_MODE: 'free',
  PREMIUM_MODE: 'premium',
};

const DEFAULT_ENTITLEMENTS = {
  mode: ENTITLEMENT_MODES.FREE_MODE,
  packs: [],
  lockedCosmetics: {
    decor: {},
    farmTheme: null,
  },
};

const ensureObject = (value, fallback = {}) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
);

export const normalizeEntitlements = (entitlements) => {
  const base = entitlements && typeof entitlements === 'object' ? entitlements : {};
  const mode = base.mode === ENTITLEMENT_MODES.PREMIUM_MODE
    ? ENTITLEMENT_MODES.PREMIUM_MODE
    : ENTITLEMENT_MODES.FREE_MODE;
  const packs = Array.isArray(base.packs)
    ? base.packs.filter((id) => typeof id === 'string')
    : [];
  const lockedCosmetics = ensureObject(base.lockedCosmetics, {});
  const lockedDecor = ensureObject(lockedCosmetics.decor, {});
  const farmTheme = typeof lockedCosmetics.farmTheme === 'string' ? lockedCosmetics.farmTheme : null;

  return {
    ...DEFAULT_ENTITLEMENTS,
    ...base,
    mode,
    packs,
    lockedCosmetics: {
      ...DEFAULT_ENTITLEMENTS.lockedCosmetics,
      ...lockedCosmetics,
      decor: lockedDecor,
      farmTheme,
    },
  };
};

export const getEntitlementsState = (state) => normalizeEntitlements(state?.entitlements);

export const getEntitlementMode = (state) => {
  if (isReleaseMode()) return ENTITLEMENT_MODES.FREE_MODE;
  return getEntitlementsState(state).mode;
};

export const isPremiumModeEnabled = (state) => (
  getEntitlementMode(state) === ENTITLEMENT_MODES.PREMIUM_MODE
);

export const listUnlockedPacks = (state) => getEntitlementsState(state).packs;

export const setEntitlementMode = (entitlements, mode) => ({
  ...normalizeEntitlements(entitlements),
  mode: mode === ENTITLEMENT_MODES.PREMIUM_MODE
    ? ENTITLEMENT_MODES.PREMIUM_MODE
    : ENTITLEMENT_MODES.FREE_MODE,
});

export const grantEntitlement = (entitlements, packId) => {
  if (!packId) return normalizeEntitlements(entitlements);
  const next = normalizeEntitlements(entitlements);
  if (!next.packs.includes(packId)) {
    next.packs = [...next.packs, packId];
  }
  return next;
};

export const revokeEntitlement = (entitlements, packId) => {
  if (!packId) return normalizeEntitlements(entitlements);
  const next = normalizeEntitlements(entitlements);
  next.packs = next.packs.filter((id) => id !== packId);
  return next;
};

export const getPackMeta = (packId) => {
  if (!packId) return null;
  const content = getContentManager();
  return content?.packsById?.[packId] || null;
};

export const getPackAccess = (packId) => (
  getPackMeta(packId)?.access || 'free'
);

export const getItemEntitlementInfo = (itemId, type) => {
  if (!itemId) return null;
  const content = getContentManager();
  const maps = {
    crops: content?.cropsById,
    decor: content?.decorById,
    festivals: content?.festivalsById,
    minigames: content?.minigamesById,
    almanac: content?.almanacPageById,
  };
  const fallbackMaps = Object.values(maps);
  const itemMap = type ? maps[type] : null;
  const item = itemMap?.[itemId] || fallbackMaps.find((map) => map?.[itemId])?.[itemId];
  if (!item) return null;
  const packId = item.packId || null;
  const packMeta = packId ? getPackMeta(packId) : null;
  const access = packMeta?.access || 'free';
  const badgeLabel = packMeta?.badgeLabel || (access === 'premium' ? 'Premium' : null);
  return { item, packId, access, badgeLabel, packMeta };
};

const isPackUnlockedWithEntitlements = (entitlements, packId, packAccess) => {
  if (isReleaseMode()) return true;
  if (entitlements.mode !== ENTITLEMENT_MODES.PREMIUM_MODE) return true;
  if (packAccess !== 'premium') return true;
  if (!packId) return true;
  return entitlements.packs.includes(packId);
};

export const isPackUnlocked = (state, packId, packAccess = 'free') => {
  const entitlements = getEntitlementsState(state);
  return isPackUnlockedWithEntitlements(entitlements, packId, packAccess);
};

export const isItemUnlocked = (state, itemId, type) => {
  if (!isPremiumModeEnabled(state)) return true;
  const info = getItemEntitlementInfo(itemId, type);
  if (!info?.packId) return true;
  return isPackUnlocked(state, info.packId, info.access);
};

export const applyCosmeticFallbacks = (state) => {
  const entitlements = getEntitlementsState(state);
  if (!isPremiumModeEnabled(state)) {
    return { nextState: { ...state, entitlements }, fallbackCount: 0 };
  }

  const content = getContentManager();
  const plots = Array.isArray(state.plots) ? state.plots : [];
  const lockedDecor = { ...entitlements.lockedCosmetics.decor };
  let fallbackCount = 0;
  let plotsChanged = false;

  const nextPlots = plots.map((plot, index) => {
    if (plot?.state !== 'decor' || !plot.decorationId) return plot;
    const decor = content?.decorById?.[plot.decorationId];
    const packId = decor?.packId || null;
    const access = packId ? getPackAccess(packId) : 'free';
    if (isPackUnlockedWithEntitlements(entitlements, packId, access)) return plot;

    fallbackCount += 1;
    plotsChanged = true;
    lockedDecor[index] = plot.decorationId;
    return {
      ...plot,
      state: 'empty',
      crop: null,
      decorationId: null,
      decorationPlacedAt: null,
      plantedAt: null,
      growthStage: 0,
      progress: 0,
    };
  });

  if (!plotsChanged) {
    return {
      nextState: { ...state, entitlements },
      fallbackCount,
    };
  }

  return {
    nextState: {
      ...state,
      plots: nextPlots,
      entitlements: {
        ...entitlements,
        lockedCosmetics: {
          ...entitlements.lockedCosmetics,
          decor: lockedDecor,
        },
      },
    },
    fallbackCount,
  };
};
