/**
 * Rasterizes web/public/icons/favicon.svg into PNG assets for PWAs / iOS.
 * Run after changing the SVG: `npm run gen:icons`
 *
 * Install UI screenshots (manifest): `npm run gen:screenshots`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const svgPath = path.join(webRoot, 'public', 'icons', 'favicon.svg');
const outDir = path.join(webRoot, 'public', 'icons');

function renderAtWidth(sizePx, outfile) {
  const svgBuffer = fs.readFileSync(svgPath);
  const resvg = new Resvg(svgBuffer, {
    fitTo: { mode: 'width', value: sizePx },
    background: 'rgba(255,255,255,0)',
  });
  fs.writeFileSync(path.join(outDir, outfile), resvg.render().asPng());
}

if (!fs.existsSync(svgPath)) {
  console.error('[gen:icons] Missing', svgPath);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

renderAtWidth(192, 'icon-192.png');
renderAtWidth(512, 'icon-512.png');
renderAtWidth(180, 'apple-touch-icon.png');

console.log('[gen:icons] Wrote PNGs to public/icons');
