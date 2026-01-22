import { clamp } from "./gameMath.mjs";
import { normalizeInventory } from "../systems/inventory.mjs";

// Default save configuration
export const SAVE_CONFIG = {
  key: 'farmSim_save_v3',
  minSize: 3,
  maxSize: 5,
  version: 3,
};

function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function normalizeSaveData(raw, { minSize, maxSize, version }) {
  if (!raw || typeof raw !== "object") return null;
  const saveVersion = raw.version ?? 1;
  if (saveVersion !== 1 && saveVersion !== version) return null;

  const normalized = { ...raw, version: saveVersion };
  normalized.coins = Math.max(0, normalizeNumber(raw.coins, 0));
  normalized.score = Math.max(0, normalizeNumber(raw.score, 0));
  normalized.totalEarned = Math.max(0, normalizeNumber(raw.totalEarned, 0));

  if (typeof raw.gridSize === "number") {
    normalized.gridSize = clamp(raw.gridSize, minSize, maxSize);
  }

  if (Array.isArray(raw.plots) && typeof normalized.gridSize === "number") {
    normalized.plots = raw.plots.slice(0, normalized.gridSize * normalized.gridSize);
  }

  if (raw.inventory) {
    normalized.inventory = normalizeInventory(raw.inventory);
  }

  if (Array.isArray(raw.availableOrders)) {
    normalized.availableOrders = raw.availableOrders;
  }
  if (raw.activeOrder && typeof raw.activeOrder === "object") {
    normalized.activeOrder = raw.activeOrder;
  }
  if (Number.isFinite(raw.ordersCompleted)) {
    normalized.ordersCompleted = Math.max(0, raw.ordersCompleted);
  }
  if (Number.isFinite(raw.orderStreak)) {
    normalized.orderStreak = Math.max(0, raw.orderStreak);
  }
  if (Number.isFinite(raw.nextOrderRefreshAt)) {
    normalized.nextOrderRefreshAt = raw.nextOrderRefreshAt;
  }

  return normalized;
}

export function loadSave({ key, minSize, maxSize, version }) {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    try {
      localStorage.setItem(`${key}_corrupt_${Date.now()}`, raw);
      localStorage.removeItem(key);
    } catch {}
    if (import.meta.env.DEV) console.debug("[farm] loadSave parse error:", e);
    return null;
  }

  return normalizeSaveData(parsed, { minSize, maxSize, version });
}

export function saveState({ key, data }) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    if (import.meta.env.DEV) console.debug("[farm] saveState error:", e);
  }
}

// Convenience functions using default config
export function loadGameSave() {
  return loadSave(SAVE_CONFIG);
}

// Throttled save to prevent excessive writes
let saveTimeout = null;
let lastSaveData = null;

export function saveGameState(data) {
  lastSaveData = { ...data, version: SAVE_CONFIG.version };

  // Debounce saves to max once per 2 seconds
  if (saveTimeout) return;

  saveTimeout = setTimeout(() => {
    if (lastSaveData) {
      saveState({ key: SAVE_CONFIG.key, data: lastSaveData });
    }
    saveTimeout = null;
  }, 2000);
}

// Force immediate save (for critical moments like page unload)
export function saveGameStateImmediate(data) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  saveState({ key: SAVE_CONFIG.key, data: { ...data, version: SAVE_CONFIG.version } });
}
