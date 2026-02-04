const ACRONYMS = new Set(['ai', 'fps', 'gps', 'pwa', 'ui', 'ux', 'xp']);

export const formatDisplayLabel = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value);
  if (!raw.includes('_') && !raw.includes('-')) return raw;

  return raw
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (!word) return '';
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      if (/^\d+$/.test(word)) return word;
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(' ');
};
