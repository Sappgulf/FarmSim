import baseCrops from '../../content/crops.json';
import baseDecor from '../../content/decor.json';
import baseFestivals from '../../content/festivals.json';
import baseAlmanac from '../../content/almanac.json';
import baseMinigames from '../../content/minigames.json';
import baseStrings from '../../content/strings.json';
import { isDebugMode } from '../utils/debugTools';
import { MILESTONE_DEFINITIONS } from '../data/milestones';
import { SEED_CODE_VERSION, validateSeedPayload } from '../utils/seedCode';
import { SNAPSHOT_VERSION, validateSnapshotPayload } from '../utils/farmSnapshot';

const PACK_META_MODULES = import.meta.glob('../../content/packs/**/pack.json', { eager: true });
const PACK_CROP_MODULES = import.meta.glob('../../content/packs/**/crops.json', { eager: true });
const PACK_DECOR_MODULES = import.meta.glob('../../content/packs/**/decor.json', { eager: true });
const PACK_FESTIVAL_MODULES = import.meta.glob('../../content/packs/**/festivals.json', { eager: true });
const PACK_ALMANAC_MODULES = import.meta.glob('../../content/packs/**/almanac.json', { eager: true });
const PACK_MINIGAME_MODULES = import.meta.glob('../../content/packs/**/minigames.json', { eager: true });
const PACK_STRING_MODULES = import.meta.glob('../../content/packs/**/strings.json', { eager: true });

const CONTENT_TYPES = ['crops', 'decor', 'festivals', 'minigames', 'almanac', 'strings'];
const PACK_ACCESS_VALUES = new Set(['free', 'premium']);
const SKU_ID_PATTERN = /^[a-z0-9._-]+$/i;

const clampNumber = (value, fallback, { min, max } = {}) => {
  if (value === null || value === undefined) return fallback;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  if (typeof min === 'number' && numberValue < min) return min;
  if (typeof max === 'number' && numberValue > max) return max;
  return numberValue;
};

const normalizeTags = (tags, fallback = []) => {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return fallback;
};

const normalizeCrop = (crop) => {
  const seasonTags = normalizeTags(crop.seasonTags, crop.season ? [crop.season] : []);
  return {
    ...crop,
    seasonTags,
    icon: crop.icon || crop.emoji || '',
    emoji: crop.emoji || crop.icon || '🌱',
    cost: clampNumber(crop.cost, 0, { min: 0 }),
    baseValue: clampNumber(crop.baseValue, 0, { min: 0 }),
    growthTime: clampNumber(crop.growthTime, 1, { min: 1 }),
    stages: clampNumber(crop.stages, 1, { min: 1 }),
    level: clampNumber(crop.level, 1, { min: 1 }),
  };
};

const normalizeDecor = (decor) => {
  const seasonTags = normalizeTags(decor.seasonTags, decor.season ? [decor.season] : []);
  return {
    ...decor,
    seasonTags,
    icon: decor.icon || decor.emoji || '',
    emoji: decor.emoji || decor.icon || '🪴',
    cost: clampNumber(decor.cost, 0, { min: 0 }),
    placementRules: {
      gridSnap: decor.placementRules?.gridSnap ?? true,
      ...decor.placementRules,
    },
  };
};

const normalizeFestival = (festival) => {
  const seasonTags = normalizeTags(festival.seasonTags, festival.season ? [festival.season] : []);
  const durationSeconds = clampNumber(
    festival.durationSeconds ?? festival.duration,
    0,
    { min: 0 }
  );
  return {
    ...festival,
    seasonTags,
    icon: festival.icon || festival.emoji || '🎉',
    emoji: festival.emoji || festival.icon || '🎉',
    cadence: festival.cadence || 'weekly',
    durationSeconds,
  };
};

const normalizeAlmanac = (page) => ({
  ...page,
  icon: page.icon || '📖',
  text: page.text || {},
});

const normalizeMinigame = (entry) => ({
  ...entry,
  rounds: clampNumber(entry.rounds, 1, { min: 1, max: 3 }),
  speedCurve: Array.isArray(entry.speedCurve) ? entry.speedCurve : [],
  targetWindows: entry.targetWindows || {},
  rewards: entry.rewards || {},
  theme: entry.theme || {},
  sfx: entry.sfx || {},
});

const buildMapById = (items = []) => {
  const map = {};
  items.forEach((item) => {
    if (item?.id) map[item.id] = item;
  });
  return map;
};

const getPackBasePath = (packPath) => packPath.replace(/\/pack\.json$/, '');

const getPackPayload = (modules, basePath, filename) => {
  const match = modules[`${basePath}/${filename}`];
  if (!match) return null;
  return match.default || match;
};

const normalizePackMeta = (pack) => {
  const access = PACK_ACCESS_VALUES.has(pack?.access) ? pack.access : 'free';
  const skuId = typeof pack?.skuId === 'string' ? pack.skuId : null;
  const badgeLabel = typeof pack?.badgeLabel === 'string'
    ? pack.badgeLabel
    : access === 'premium'
      ? 'Premium'
      : null;
  return {
    ...pack,
    access,
    skuId,
    badgeLabel,
  };
};

const validatePackMeta = (pack, report, seenIds) => {
  if (!pack?.id || typeof pack.id !== 'string') {
    report.errors.push({
      type: 'pack',
      issue: 'missing_id',
      message: 'pack.json missing id',
      context: 'packs',
    });
    return;
  }
  if (seenIds.has(pack.id)) {
    report.errors.push({
      type: 'pack',
      issue: 'duplicate_pack_id',
      message: `pack id ${pack.id} duplicated`,
      context: 'packs',
    });
  } else {
    seenIds.add(pack.id);
  }
  if (pack.access && !PACK_ACCESS_VALUES.has(pack.access)) {
    report.errors.push({
      type: 'pack',
      issue: 'invalid_access',
      message: `pack ${pack.id} has invalid access "${pack.access}"`,
      context: 'packs',
    });
  }
  if (pack.skuId && !SKU_ID_PATTERN.test(pack.skuId)) {
    report.warnings.push({
      type: 'pack',
      issue: 'invalid_sku_id',
      message: `pack ${pack.id} skuId "${pack.skuId}" should be alphanumeric/._-`,
      context: 'packs',
    });
  }
};

const collectPacks = () => {
  const packs = Object.entries(PACK_META_MODULES).map(([path, module]) => {
    const basePath = getPackBasePath(path);
    const pack = module.default || module;
    return {
      ...pack,
      __path: basePath,
    };
  });
  packs.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  return packs;
};

const validateItems = (type, items, report, context) => {
  items.forEach((item, index) => {
    if (!item?.id || typeof item.id !== 'string') {
      report.errors.push({
        type,
        issue: 'missing_id',
        message: `${type} item missing id at index ${index}`,
        context,
      });
      return;
    }
    if (!item.name) {
      report.warnings.push({
        type,
        issue: 'missing_name',
        message: `${type} ${item.id} missing name`,
        context,
      });
    }
    if (!item.icon && !item.emoji) {
      report.warnings.push({
        type,
        issue: 'missing_icon',
        message: `${type} ${item.id} missing icon/emoji (fallback applied)`,
        context,
      });
    }

    if (type === 'crops') {
      if (!Array.isArray(item.seasonTags) || item.seasonTags.length === 0) {
        report.warnings.push({
          type,
          issue: 'missing_season_tags',
          message: `crop ${item.id} missing seasonTags`,
          context,
        });
      }
    }

    if (type === 'decor') {
      if (!item.category) {
        report.warnings.push({
          type,
          issue: 'missing_category',
          message: `decor ${item.id} missing category`,
          context,
        });
      }
      if (!item.placementRules?.gridSnap) {
        report.warnings.push({
          type,
          issue: 'missing_grid_snap',
          message: `decor ${item.id} placementRules.gridSnap not set`,
          context,
        });
      }
    }

    if (type === 'festivals') {
      if (!item.cadence) {
        report.warnings.push({
          type,
          issue: 'missing_cadence',
          message: `festival ${item.id} missing cadence`,
          context,
        });
      }
      if (!item.description) {
        report.warnings.push({
          type,
          issue: 'missing_description',
          message: `festival ${item.id} missing description`,
          context,
        });
      }
    }

    if (type === 'minigames') {
      if (!item.title) {
        report.warnings.push({
          type,
          issue: 'missing_title',
          message: `minigame ${item.id} missing title`,
          context,
        });
      }
      if (!Number.isFinite(item.rounds)) {
        report.warnings.push({
          type,
          issue: 'missing_rounds',
          message: `minigame ${item.id} missing rounds`,
          context,
        });
      }
      if (!Array.isArray(item.speedCurve) || item.speedCurve.length === 0) {
        report.warnings.push({
          type,
          issue: 'missing_speed_curve',
          message: `minigame ${item.id} missing speedCurve`,
          context,
        });
      }
      const windows = item.targetWindows || {};
      if (!Number.isFinite(windows.gold) || !Number.isFinite(windows.silver) || !Number.isFinite(windows.bronze)) {
        report.warnings.push({
          type,
          issue: 'missing_target_windows',
          message: `minigame ${item.id} missing targetWindows`,
          context,
        });
      }
      if (!item.rewards || typeof item.rewards !== 'object') {
        report.warnings.push({
          type,
          issue: 'missing_rewards',
          message: `minigame ${item.id} missing rewards table`,
          context,
        });
      }
    }
  });
};

const validateAlmanac = (sections, pages, report, context) => {
  const sectionIds = new Set(sections.map((section) => section.id));
  pages.forEach((page) => {
    if (!sectionIds.has(page.section)) {
      report.errors.push({
        type: 'almanac',
        issue: 'invalid_section',
        message: `almanac page ${page.id} references unknown section ${page.section}`,
        context,
      });
    }
  });
};

const mergeItems = (baseItems, packItems, report, context, packId) => {
  const merged = [...baseItems];
  const byId = new Map(baseItems.map((item) => [item.id, item]));
  packItems.forEach((item) => {
    if (!item?.id) return;
    if (byId.has(item.id)) {
      report.warnings.push({
        type: context,
        issue: 'duplicate_id',
        message: `${context} ${item.id} already exists; skipping pack entry`,
        context,
      });
      return;
    }
    const withPack = packId ? { ...item, packId } : item;
    byId.set(item.id, withPack);
    merged.push(withPack);
  });
  return merged;
};


const validateSocialLiteSchemas = (report) => {
  MILESTONE_DEFINITIONS.forEach((milestone) => {
    if (!milestone?.id || !milestone?.type || !Number.isFinite(milestone?.target)) {
      report.errors.push({
        type: 'milestones',
        issue: 'invalid_milestone',
        message: `milestone ${milestone?.id || 'unknown'} is invalid`,
        context: 'milestones',
      });
    }
  });
  const seedValidation = validateSeedPayload({ version: SEED_CODE_VERSION, season: 'spring', packs: [] });
  if (!seedValidation.ok) {
    report.errors.push({ type: 'seed_code', issue: 'seed_version', message: 'Seed code schema validation failed', context: 'seed' });
  }
  const snapshotValidation = validateSnapshotPayload({ version: SNAPSHOT_VERSION, plots: [] });
  if (!snapshotValidation.ok) {
    report.errors.push({ type: 'snapshot', issue: 'snapshot_schema', message: 'Snapshot schema validation failed', context: 'snapshot' });
  }
};

const buildContent = () => {
  const report = {
    errors: [],
    warnings: [],
    packs: [],
  };

  const packs = collectPacks();
  const packIdSet = new Set();
  packs.forEach((pack) => validatePackMeta(pack, report, packIdSet));
  const normalizedPacks = packs.map((pack) => normalizePackMeta(pack));
  report.packs = normalizedPacks.map((pack) => ({
    id: pack.id,
    name: pack.name,
    version: pack.version,
    access: pack.access,
    skuId: pack.skuId,
    badgeLabel: pack.badgeLabel,
    contentCounts: pack.contentCounts || {},
    highlights: pack.highlights || [],
  }));

  const base = {
    crops: (baseCrops.items || []).map(normalizeCrop),
    decor: (baseDecor.items || []).map(normalizeDecor),
    festivals: (baseFestivals.items || []).map(normalizeFestival),
    minigames: (baseMinigames.items || []).map(normalizeMinigame),
    almanac: {
      sections: baseAlmanac.sections || [],
      pages: (baseAlmanac.pages || []).map(normalizeAlmanac),
      seasons: baseAlmanac.seasons || [],
      weatherTypes: baseAlmanac.weatherTypes || [],
      memoryLinks: baseAlmanac.memoryLinks || {},
    },
    strings: baseStrings || {},
  };

  packs.forEach((pack) => {
    const basePath = pack.__path;
    const cropPayload = getPackPayload(PACK_CROP_MODULES, basePath, 'crops.json');
    if (cropPayload?.items?.length) {
      base.crops = mergeItems(
        base.crops,
        cropPayload.items.map(normalizeCrop),
        report,
        'crops',
        pack.id
      );
    }

    const decorPayload = getPackPayload(PACK_DECOR_MODULES, basePath, 'decor.json');
    if (decorPayload?.items?.length) {
      base.decor = mergeItems(
        base.decor,
        decorPayload.items.map(normalizeDecor),
        report,
        'decor',
        pack.id
      );
    }

    const festivalPayload = getPackPayload(PACK_FESTIVAL_MODULES, basePath, 'festivals.json');
    if (festivalPayload?.items?.length) {
      base.festivals = mergeItems(
        base.festivals,
        festivalPayload.items.map(normalizeFestival),
        report,
        'festivals',
        pack.id
      );
    }

    const almanacPayload = getPackPayload(PACK_ALMANAC_MODULES, basePath, 'almanac.json');
    if (almanacPayload?.pages?.length) {
      base.almanac.pages = mergeItems(
        base.almanac.pages,
        almanacPayload.pages.map(normalizeAlmanac),
        report,
        'almanac',
        pack.id
      );
    }

    const minigamePayload = getPackPayload(PACK_MINIGAME_MODULES, basePath, 'minigames.json');
    if (minigamePayload?.items?.length) {
      base.minigames = mergeItems(
        base.minigames,
        minigamePayload.items.map(normalizeMinigame),
        report,
        'minigames',
        pack.id
      );
    }

    const stringPayload = getPackPayload(PACK_STRING_MODULES, basePath, 'strings.json');
    if (stringPayload) {
      base.strings = {
        ...base.strings,
        ...stringPayload,
      };
    }
  });

  CONTENT_TYPES.forEach((type) => {
    if (type === 'almanac' || type === 'strings') return;
    validateItems(type, base[type], report, 'base');
  });
  validateAlmanac(base.almanac.sections, base.almanac.pages, report, 'base');
  validateSocialLiteSchemas(report);

  const content = {
    ...base,
    packs: report.packs,
    packsById: buildMapById(report.packs),
    cropsById: buildMapById(base.crops),
    decorById: buildMapById(base.decor),
    festivalsById: buildMapById(base.festivals),
    minigamesById: buildMapById(base.minigames),
    almanacPageById: buildMapById(base.almanac.pages),
    almanacSectionById: buildMapById(base.almanac.sections),
    philosophyById: buildMapById(base.strings.philosophies || []),
    report,
  };

  if (isDebugMode()) {
    if (report.errors.length) {
      console.warn('[farm]', 'Content validation errors:', report.errors);
    }
    if (report.warnings.length) {
      console.warn('[farm]', 'Content validation warnings:', report.warnings);
    }
  }

  return content;
};

let contentCache = null;

export const getContentManager = () => {
  if (!contentCache) {
    contentCache = buildContent();
  }
  return contentCache;
};

export const revalidateContent = () => {
  contentCache = buildContent();
  return contentCache;
};

export const printContentReport = () => {
  const content = getContentManager();
  const { report } = content;
  console.info('[farm]', 'Content Report', {
    packCount: report.packs.length,
    packs: report.packs,
    errors: report.errors,
    warnings: report.warnings,
  });
};

export default getContentManager;
