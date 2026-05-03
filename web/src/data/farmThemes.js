export const FARM_THEMES = [
  {
    id: 'meadow',
    name: 'Meadowlight',
    description: 'Fresh greens and morning light.',
    palette: {
      accent: '#16a34a',
      accentSoft: 'rgba(22, 163, 74, 0.16)',
      backgroundStart: '#f0fdf4',
      backgroundEnd: '#ecfdf5',
      card: '#ffffff',
      cardAlt: '#dcfce7',
      ink: '#064e3b',
      border: '#bbf7d0',
      muted: '#4b5563',
    },
  },
  {
    id: 'dusk',
    name: 'Dusk Ember',
    description: 'Warm sunset glow and soft ember tones.',
    palette: {
      accent: '#f97316',
      accentSoft: 'rgba(249, 115, 22, 0.18)',
      backgroundStart: '#fff7ed',
      backgroundEnd: '#ffedd5',
      card: '#ffffff',
      cardAlt: '#ffedd5',
      ink: '#7c2d12',
      border: '#fed7aa',
      muted: '#6b7280',
    },
  },
  {
    id: 'harvest',
    name: 'Harvest Gold',
    description: 'Golden fields and steady warmth.',
    palette: {
      accent: '#d97706',
      accentSoft: 'rgba(217, 119, 6, 0.18)',
      backgroundStart: '#fffbeb',
      backgroundEnd: '#fef3c7',
      card: '#ffffff',
      cardAlt: '#fde68a',
      ink: '#78350f',
      border: '#fcd34d',
      muted: '#6b7280',
    },
  },
  {
    id: 'tide',
    name: 'Tidepool',
    description: 'Cool sky blues and gentle tides.',
    palette: {
      accent: '#0ea5e9',
      accentSoft: 'rgba(14, 165, 233, 0.18)',
      backgroundStart: '#f0f9ff',
      backgroundEnd: '#e0f2fe',
      card: '#ffffff',
      cardAlt: '#bae6fd',
      ink: '#0c4a6e',
      border: '#7dd3fc',
      muted: '#4b5563',
    },
  },
];

export const getFarmTheme = (themeId) =>
  FARM_THEMES.find((theme) => theme.id === themeId) || FARM_THEMES[0];

export const getFarmThemeVars = (theme) => ({
  '--farm-theme-accent': theme?.palette?.accent,
  '--farm-theme-accent-soft': theme?.palette?.accentSoft,
  '--farm-theme-card': theme?.palette?.card,
  '--farm-theme-card-alt': theme?.palette?.cardAlt,
  '--farm-theme-ink': theme?.palette?.ink,
  '--farm-theme-border': theme?.palette?.border,
  '--farm-theme-muted': theme?.palette?.muted,
});
