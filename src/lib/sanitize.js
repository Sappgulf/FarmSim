export function sanitize(value) {
  try {
    if (value == null) return '';
    const str = typeof value === 'string' ? value : String(value);
    // Remove control chars except tab/newline/carriage-return
    return str
      .normalize('NFC')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\uFFFD/g, '') // strip replacement char if present
      .replace(/[<>]/g, '') // Remove angle brackets for XSS prevention
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  } catch {
    try { return String(value ?? ''); } catch { return ''; }
  }
}

export function sanitizeNumber(value, min = -Infinity, max = Infinity, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

export function sanitizeString(value, maxLength = 1000) {
  if (typeof value !== 'string') return String(value || '');
  return value.slice(0, maxLength).trim();
}

