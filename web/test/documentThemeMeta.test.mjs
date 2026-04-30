import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DARK_THEME_COLOR,
  DEFAULT_LIGHT_THEME_COLOR,
  resolveFarmSimChrome,
} from '../src/utils/documentThemeMeta';

describe('documentThemeMeta', () => {
  it('uses farm accent in light mode', () => {
    expect(resolveFarmSimChrome('#0ea5e9', false).themeColor).toBe('#0ea5e9');
    expect(resolveFarmSimChrome('#0ea5e9', false).appleStatusBarStyle).toBe('default');
  });

  it('uses dark chrome and translucent status bar in dark mode', () => {
    expect(resolveFarmSimChrome('#0ea5e9', true).themeColor).toBe(DEFAULT_DARK_THEME_COLOR);
    expect(resolveFarmSimChrome('#0ea5e9', true).appleStatusBarStyle).toBe('black-translucent');
  });

  it('falls back to default light accent when hex missing', () => {
    expect(resolveFarmSimChrome('', false).themeColor).toBe(DEFAULT_LIGHT_THEME_COLOR);
    expect(resolveFarmSimChrome(null, false).themeColor).toBe(DEFAULT_LIGHT_THEME_COLOR);
  });
});
