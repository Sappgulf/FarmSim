/**
 * Rasterizes branded placeholder screenshots for the web app manifest (Chrome install UI).
 * Requires: `@resvg/resvg-js` (same as gen:icons).
 *
 * Run: `npm run gen:screenshots`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const outDir = path.join(webRoot, 'public', 'screenshots');

/**
 * @param {number} w
 * @param {number} h
 * @param {'narrow' | 'wide'} layout
 */
function buildSvg(w, h, layout) {
  const titleY = layout === 'narrow' ? 56 : 72;
  const subY = layout === 'narrow' ? 102 : 118;
  const mockX = layout === 'narrow' ? 44 : 620;
  const mockY = layout === 'narrow' ? 150 : 96;
  const mockW = layout === 'narrow' ? w - 88 : 520;
  const mockH = layout === 'narrow' ? h - subY - 120 : h - mockY - 72;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ecfdf5"/>
      <stop offset="45%" stop-color="#cffafe"/>
      <stop offset="100%" stop-color="#e0e7ff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${layout === 'wide' ? `
  <text x="72" y="${titleY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="52" font-weight="800" fill="#064e3b">FarmSim</text>
  <text x="72" y="${subY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="22" fill="#047857">Crops, animals, seasons — right in your browser.</text>
  ` : `
  <text x="${w / 2}" y="${titleY}" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="40" font-weight="800" fill="#064e3b">FarmSim</text>
  <text x="${w / 2}" y="${subY}" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" fill="#047857">Play anywhere · Save stays on device</text>
  `}
  <g filter="url(#shadow)">
    <rect x="${mockX}" y="${mockY}" width="${mockW}" height="${mockH}" rx="${layout === 'narrow' ? 36 : 28}" fill="#ffffff" stroke="#a7f3d0" stroke-width="3"/>
    <rect x="${mockX + 18}" y="${mockY + 18}" width="${mockW - 36}" height="38" rx="12" fill="url(#accent)" opacity="0.92"/>
    <text x="${mockX + mockW / 2}" y="${mockY + 44}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#ecfdf5">Your farm today</text>
    <!-- Simple crop grid hint -->
    ${Array.from({ length: layout === 'narrow' ? 12 : 9 }, (_, i) => {
      const cols = layout === 'narrow' ? 3 : 3;
      const cell = layout === 'narrow' ? 72 : 64;
      const gap = 10;
      const gx = i % cols;
      const gy = Math.floor(i / cols);
      const ox = mockX + 28 + gx * (cell + gap);
      const oy = mockY + 78 + gy * (cell + gap);
      const fill = ['#86efac', '#bbf7d0', '#fde68a', '#fca5a5'][i % 4];
      return `<rect x="${ox}" y="${oy}" width="${cell}" height="${cell}" rx="14" fill="${fill}" stroke="#047857" stroke-opacity="0.35" stroke-width="2"/>`;
    }).join('\n    ')}
  </g>
</svg>`;
}

function renderPng(filename, width, height, layout) {
  const svg = buildSvg(width, height, layout);
  const resvg = new Resvg(Buffer.from(svg), {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(255,255,255,1)',
  });
  const out = path.join(outDir, filename);
  fs.writeFileSync(out, resvg.render().asPng());
  console.log('[gen:screenshots]', 'Wrote', path.relative(webRoot, out), `${width}x${height}`);
}

fs.mkdirSync(outDir, { recursive: true });

renderPng('narrow.png', 540, 720, 'narrow');
renderPng('wide.png', 1280, 720, 'wide');

console.log('[gen:screenshots] Done');
