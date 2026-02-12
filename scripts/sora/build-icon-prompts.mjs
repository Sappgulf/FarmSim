import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'shared', 'content', 'sora', 'icon-manifest.json');
const outputDir = path.join(root, 'shared', 'content', 'sora', 'prompts');
const markdownPath = path.join(outputDir, 'sora-icon-prompts.md');
const checklistPath = path.join(outputDir, 'icon-checklist.csv');

const manifestRaw = await fs.readFile(manifestPath, 'utf8');
const manifest = JSON.parse(manifestRaw);

const sharedStyle = [
  `Visual direction: ${manifest.style.direction}`,
  `Shape language: ${manifest.style.shape}`,
  `Materials: ${manifest.style.materials}`,
  `Lighting: ${manifest.style.lighting}`,
  `Palette: ${manifest.style.palette}`,
  `Consistency: ${manifest.style.consistency}`,
  `Output format: ${manifest.output.format}`,
  `Output size: ${manifest.output.size}`,
  `Background: ${manifest.output.background}`,
  `Padding: ${manifest.output.padding}`,
  `Forbidden elements: ${manifest.output.forbidden}`,
].join('\n');

const iconSections = manifest.icons.map((icon, index) => {
  const prompt = [
    `Create exactly one game UI icon named "${icon.id}" for a farm simulation game.`,
    `Subject: ${icon.subject}.`,
    `Intent: ${icon.notes}.`,
    `Category: ${icon.category}.`,
    sharedStyle,
    'Deliver only the icon artwork, with transparent background.',
  ].join(' ');

  return [
    `## ${index + 1}. ${icon.label} (${icon.id})`,
    '',
    '```text',
    prompt,
    '```',
    '',
  ].join('\n');
});

const markdown = [
  '# Sora Icon Prompts',
  '',
  `Project: ${manifest.project}`,
  `Model: ${manifest.model}`,
  `Generated from manifest date: ${manifest.generatedAt}`,
  `Total icons: ${manifest.icons.length}`,
  '',
  'Use each prompt independently in Sora to keep style and framing consistent.',
  '',
  ...iconSections,
].join('\n');

const checklistLines = [
  'id,label,category,status,file',
  ...manifest.icons.map((icon) => `${icon.id},${icon.label},${icon.category},todo,public/assets/sora/icons/${icon.id}.png`),
  '',
];

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(markdownPath, markdown, 'utf8');
await fs.writeFile(checklistPath, checklistLines.join('\n'), 'utf8');

console.log(`Wrote ${markdownPath}`);
console.log(`Wrote ${checklistPath}`);
console.log(`Prepared ${manifest.icons.length} prompts.`);
