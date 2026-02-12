const SEED_CODE_PREFIX = 'FS1.';

const toBase64 = (value) => {
  if (typeof btoa === 'function') return btoa(value);
  return Buffer.from(value, 'utf-8').toString('base64');
};

const fromBase64 = (value) => {
  if (typeof atob === 'function') return atob(value);
  return Buffer.from(value, 'base64').toString('utf-8');
};

const base64UrlEncode = (value) => {
  const json = JSON.stringify(value);
  return toBase64(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const base64UrlDecode = (encoded) => {
  const padded = encoded + '==='.slice((encoded.length + 3) % 4);
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(escape(fromBase64(b64)));
  return JSON.parse(json);
};

export const validateSeedPayload = (payload = {}) => {
  const errors = [];
  const warnings = [];
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Seed payload missing.'], warnings };
  }
  const version = Number(payload.version);
  if (!Number.isFinite(version) || version < 1) {
    errors.push('Unsupported seed version.');
  }
  if (typeof payload.season !== 'string') {
    errors.push('Season is required.');
  }
  if (!Array.isArray(payload.packs)) {
    errors.push('Pack list is required.');
  }
  if (payload.packs && !Array.isArray(payload.packs)) {
    errors.push('Packs must be an array.');
  }
  if (Array.isArray(payload.packs) && payload.packs.some((id) => typeof id !== 'string')) {
    errors.push('Pack IDs must be strings.');
  }
  if (payload.theme != null && typeof payload.theme !== 'string') {
    warnings.push('Theme was ignored because it is invalid.');
  }
  return { ok: errors.length === 0, errors, warnings };
};

export const encodeSeed = ({ version = 1, seed = null, season = 'spring', packs = [], theme = null } = {}) => {
  const payload = {
    version,
    seed: Number.isFinite(seed) ? Math.floor(seed) : null,
    season,
    packs: [...new Set((packs || []).filter((id) => typeof id === 'string'))].sort(),
    theme: typeof theme === 'string' ? theme : null,
  };
  return `${SEED_CODE_PREFIX}${base64UrlEncode(payload)}`;
};

export const decodeSeed = (code) => {
  try {
    if (typeof code !== 'string' || !code.startsWith(SEED_CODE_PREFIX)) {
      return { error: 'Seed Code format is invalid.' };
    }
    const payload = base64UrlDecode(code.slice(SEED_CODE_PREFIX.length));
    const validation = validateSeedPayload(payload);
    if (!validation.ok) {
      return { error: validation.errors[0] || 'Seed Code validation failed.' };
    }
    return { payload, warnings: validation.warnings };
  } catch {
    return { error: 'Seed Code could not be decoded.' };
  }
};

export const SEED_CODE_VERSION = 1;
