export function sanitize(value) {
  try {
    if (value == null) return '';
    const str = typeof value === 'string' ? value : String(value);
    // Remove control chars except tab/newline/carriage-return
    return str
      .normalize('NFC')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\uFFFD/g, ''); // strip replacement char if present
  } catch {
    try { return String(value ?? ''); } catch { return ''; }
  }
}

