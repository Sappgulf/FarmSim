/**
 * @fileoverview Browser storage keys used by FarmSim. Import this instead of
 * scattering magic strings. Full migration logic stays in GamePersistence.
 */

export {
  SAVE_KEY,
  BACKUP_SAVE_KEY,
  QA_SAVE_KEY,
  QA_BACKUP_SAVE_KEY,
} from '../components/farm-sim/context/GamePersistence.js';

import { SAVE_CONFIG } from '../utils/save.mjs';

/** Legacy {@link ../components/FarmGame.jsx} slot (`save.mjs`). */
export const LEGACY_FARMGAME_SAVE_KEY = SAVE_CONFIG.key;

/** Human-readable map for tools and docs (not exhaustive of dynamic QA keys). */
export const SAVE_STORAGE_KEYS_DOC = {
  enhancedPrimary: 'farm_sim_enhanced_v2',
  enhancedBackup: 'farm_sim_enhanced_v2_backup',
  legacyFarmGame: LEGACY_FARMGAME_SAVE_KEY,
};
