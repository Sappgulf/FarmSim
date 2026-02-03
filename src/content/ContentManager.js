import baseCrops from '../../content/crops.json';
import baseDecor from '../../content/decor.json';
import baseFestivals from '../../content/festivals.json';
import baseAlmanac from '../../content/almanac.json';
import baseStrings from '../../content/strings.json';
import { isDebugMode } from '../utils/debugTools';

const PACK_META_MODULES = import.meta.glob('../../content/packs/**/pack.json', { eager: true });
const PACK_CROP_MODULES = import.meta.glob('../../content/packs/**/crops.json', { eager: true });
const PACK_DECOR_MODULES = import.meta.glob('../../content/packs/**/decor.json', { eager: true });
const PACK_FESTIVAL_MODULES = import.meta.glob('../../content/packs/**/festivals.json', { eager: true });
const PACK_ALMANAC_MODULES = import.meta.glob('../../content/packs/**/almanac.json', { eager: true });
const PACK_STRING_MODULES = import.meta.glob('../../content/packs/**/strings.json', { eager: true });

const CONTENT_TYPES = ['crops', 'decor', 'festivals', 'almanac', 'strings'];

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

const mergeItems = (baseItems, packItems, report, context) => {
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
    byId.set(item.id, item);
    merged.push(item);
  });
  return merged;
};

const buildContent = () => {
  const report = {
    errors: [],
    warnings: [],
    packs: [],
  };

  const packs = collectPacks();
  report.packs = packs.map((pack) => ({
    id: pack.id,
    name: pack.name,
    version: pack.version,
    contentCounts: pack.contentCounts || {},
    highlights: pack.highlights || [],
  }));

  const base = {
    crops: (baseCrops.items || []).map(normalizeCrop),
    decor: (baseDecor.items || []).map(normalizeDecor),
    festivals: (baseFestivals.items || []).map(normalizeFestival),
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
        'crops'
      );
    }

    const decorPayload = getPackPayload(PACK_DECOR_MODULES, basePath, 'decor.json');
    if (decorPayload?.items?.length) {
      base.decor = mergeItems(
        base.decor,
        decorPayload.items.map(normalizeDecor),
        report,
        'decor'
      );
    }

    const festivalPayload = getPackPayload(PACK_FESTIVAL_MODULES, basePath, 'festivals.json');
    if (festivalPayload?.items?.length) {
      base.festivals = mergeItems(
        base.festivals,
        festivalPayload.items.map(normalizeFestival),
        report,
        'festivals'
      );
    }

    const almanacPayload = getPackPayload(PACK_ALMANAC_MODULES, basePath, 'almanac.json');
    if (almanacPayload?.pages?.length) {
      base.almanac.pages = mergeItems(
        base.almanac.pages,
        almanacPayload.pages.map(normalizeAlmanac),
        report,
        'almanac'
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

  const content = {
    ...base,
    cropsById: buildMapById(base.crops),
    decorById: buildMapById(base.decor),
    festivalsById: buildMapById(base.festivals),
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
