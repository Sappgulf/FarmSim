import { MEMORIES, MOOD_TIERS, PHILOSOPHIES } from '../data/identity';
import { ALMANAC_PAGES } from '../data/almanac';
import { getAlmanacText } from '../systems/almanac';
import { getFarmTheme } from '../data/farmThemes';
import { getCropById } from '../components/farm-sim/constants/cropData';
import { FARM_TITLES } from '../data/cozyExpansion';

export const FARM_CARD_SIZE = 1080;

const PET_EMOJIS = {
  dog: '🐕',
  cat: '🐱',
  chicken: '🐔',
};

const DEFAULT_FARM_NAME = 'Willowbrook Farm';

const countUnlocked = (map = {}) => Object.values(map).filter(Boolean).length;

const getMoodPoints = (state) => {
  const memoryCount = countUnlocked(state.memoryFlags || {});
  const almanacCount = countUnlocked(state.almanac?.unlocked || {});
  const cozyCount = state.cozyGoals?.completedGoalIds?.length || 0;
  return (memoryCount * 8) + (almanacCount * 4) + (cozyCount * 6);
};

const getMoodTier = (state) => {
  const points = getMoodPoints(state);
  let tier = MOOD_TIERS[0];
  for (const candidate of MOOD_TIERS) {
    if (points >= candidate.min) tier = candidate;
  }
  return tier;
};

const getLatestMemoryId = (state) => {
  if (state.lastUnlockedMemoryId) return state.lastUnlockedMemoryId;
  const unlocked = new Set(Object.keys(state.memoryFlags || {}).filter((id) => state.memoryFlags?.[id]));
  const sorted = MEMORIES
    .filter((memory) => unlocked.has(memory.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return sorted[sorted.length - 1]?.id || null;
};

const getLatestAlmanacId = (state) => {
  if (state.lastUnlockedAlmanacId) return state.lastUnlockedAlmanacId;
  const dates = state.almanac?.dates || {};
  const entries = Object.entries(dates)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => a[1] - b[1]);
  return entries[entries.length - 1]?.[0] || null;
};

export const getSpotlightSelection = (state) => {
  const spotlight = state.spotlight || { mode: 'latest', type: 'memory', id: null };
  if (spotlight.mode === 'favorite' && spotlight.id) {
    return spotlight;
  }
  const latestMemoryId = getLatestMemoryId(state);
  if (latestMemoryId) {
    return { mode: 'latest', type: 'memory', id: latestMemoryId };
  }
  const latestAlmanacId = getLatestAlmanacId(state);
  if (latestAlmanacId) {
    return { mode: 'latest', type: 'almanac', id: latestAlmanacId };
  }
  return { mode: 'latest', type: 'memory', id: null };
};

const getSpotlightContent = (state) => {
  const spotlight = getSpotlightSelection(state);
  if (spotlight.type === 'memory' && spotlight.id) {
    const memory = MEMORIES.find((entry) => entry.id === spotlight.id);
    if (memory) {
      return {
        title: spotlight.mode === 'favorite' ? 'Spotlight Memory' : 'Latest Memory',
        text: `${memory.title}: ${memory.description}`,
        icon: memory.icon,
      };
    }
  }
  if (spotlight.type === 'almanac' && spotlight.id) {
    const page = ALMANAC_PAGES.find((entry) => entry.id === spotlight.id);
    if (page) {
      return {
        title: 'Favorite Almanac Page',
        text: `${page.title}: ${getAlmanacText(page, state.philosophy)}`,
        icon: page.icon || '📖',
      };
    }
  }
  const cropId = state.selectedCrop || 'lettuce';
  const crop = getCropById(cropId);
  return {
    title: 'Featured Crop',
    text: crop ? `${crop.name}: ${crop.description || 'A steady favorite on the farm.'}` : 'A steady favorite on the farm.',
    icon: crop?.emoji || '🌱',
  };
};

export const buildFarmCardData = (state) => {
  const theme = getFarmTheme(state.farmTheme);
  const moodTier = getMoodTier(state);
  const philosophy = PHILOSOPHIES.find((entry) => entry.id === state.philosophy) || null;
  const spotlight = getSpotlightContent(state);
  const pet = state.pets?.[0] || null;
  const petEmoji = pet?.type ? PET_EMOJIS[pet.type] : null;
  const season = state.season?.current || 'spring';
  const dayCount = Math.max(1, state.almanac?.counters?.dayCount || 1);
  const activeTitleId = state.cozyExpansion?.farmTitles?.activeId || 'home_grower';
  const activeFarmTitle = FARM_TITLES[activeTitleId]?.name || FARM_TITLES.home_grower.name;

  return {
    farmName: state.farmName || DEFAULT_FARM_NAME,
    season,
    dayCount,
    activeFarmTitle,
    moodTier,
    philosophy,
    pet: pet
      ? { name: pet.name, emoji: petEmoji || '🐾' }
      : { name: 'No companion yet', emoji: '🐾' },
    spotlight,
    theme,
  };
};

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
  const lines = wrapText(ctx, text, maxWidth);
  const limited = lines.slice(0, maxLines);
  const needsEllipsis = lines.length > maxLines;
  if (needsEllipsis && limited.length) {
    let last = limited[limited.length - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    limited[limited.length - 1] = `${last}…`;
  }
  limited.forEach((line, index) => {
    ctx.fillText(line, x, y + (index * lineHeight));
  });
  return limited.length;
};

export const renderFarmCard = async (data, { size = FARM_CARD_SIZE, returnCanvas = false } = {}) => {
  await new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(resolve);
    } else {
      setTimeout(resolve, 0);
    }
  });
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { blob: null, canvas: null };

  const { theme, moodTier, philosophy, spotlight } = data;
  const palette = theme.palette;

  const background = ctx.createLinearGradient(0, 0, size, size);
  background.addColorStop(0, palette.backgroundStart);
  background.addColorStop(1, palette.backgroundEnd);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  const padding = 70;
  const cardSize = size - (padding * 2);
  drawRoundedRect(ctx, padding, padding, cardSize, cardSize, 48);
  ctx.fillStyle = palette.card;
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 4;
  ctx.stroke();

  const headerX = padding + 56;
  let cursorY = padding + 90;

  ctx.fillStyle = palette.ink;
  ctx.font = '700 58px "Inter", "Segoe UI", sans-serif';
  drawWrappedText(ctx, data.farmName, headerX, cursorY, cardSize - 220, 64, 2);

  ctx.font = '600 30px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = palette.muted;
  ctx.fillText(`${data.season.charAt(0).toUpperCase() + data.season.slice(1)} • Day ${data.dayCount}`, headerX, cursorY + 80);
  ctx.fillText(`Title: ${data.activeFarmTitle}`, headerX, cursorY + 118);

  const pillX = padding + cardSize - 260;
  const pillY = padding + 64;
  const pillWidth = 200;
  const pillHeight = 64;
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 32);
  ctx.fillStyle = palette.accentSoft;
  ctx.fill();
  ctx.fillStyle = palette.accent;
  ctx.font = '600 28px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Farm Card', pillX + pillWidth / 2, pillY + pillHeight / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  cursorY += 150;

  ctx.fillStyle = palette.ink;
  ctx.font = '600 32px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(`${moodTier.emoji} ${moodTier.name}`, headerX, cursorY);
  ctx.fillStyle = palette.muted;
  ctx.font = '500 26px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(`Philosophy: ${philosophy?.name || 'Unchosen'}`, headerX + 220, cursorY);

  cursorY += 56;

  ctx.fillStyle = palette.ink;
  ctx.font = '500 26px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(`Companion: ${data.pet.emoji} ${data.pet.name}`, headerX, cursorY);

  cursorY += 70;

  const highlightX = headerX;
  const highlightY = cursorY;
  const highlightWidth = cardSize - 112;
  const highlightHeight = 300;

  drawRoundedRect(ctx, highlightX, highlightY, highlightWidth, highlightHeight, 36);
  ctx.fillStyle = palette.cardAlt;
  ctx.fill();

  ctx.fillStyle = palette.ink;
  ctx.font = '600 28px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(`${spotlight.icon} ${spotlight.title}`, highlightX + 32, highlightY + 48);

  ctx.fillStyle = palette.muted;
  ctx.font = '500 26px "Inter", "Segoe UI", sans-serif';
  drawWrappedText(ctx, spotlight.text, highlightX + 32, highlightY + 96, highlightWidth - 64, 36, 4);

  const footerY = padding + cardSize - 64;
  ctx.fillStyle = palette.muted;
  ctx.font = '500 22px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('FarmSim • Share your cozy farm', headerX, footerY);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png');
  });

  return { blob, canvas: returnCanvas ? canvas : null };
};

export const exportFarmCard = async (state) => {
  const data = buildFarmCardData(state);
  const { blob } = await renderFarmCard(data);
  if (!blob) throw new Error('Failed to render Farm Card.');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `farm-card-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { blob };
};
