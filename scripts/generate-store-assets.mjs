#!/usr/bin/env node
/**
 * Store listing assets: 512 icon + 1024×500 feature graphic from logo.svg
 * Usage: npm run generate:store-assets
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceSvg = path.join(root, 'assets/logo.svg');
const outDir = path.join(root, 'docs/store/assets');

async function renderLogo(size) {
  const svg = await readFile(sourceSvg);
  return sharp(svg, { density: Math.max(72, Math.ceil((size / 512) * 300)) })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const icon512 = await renderLogo(512);
  // Play requires opaque 512 icon — composite on warm charcoal
  const iconOut = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 28, g: 25, b: 23 },
    },
  })
    .composite([{ input: icon512, gravity: 'centre' }])
    .png()
    .toBuffer();
  await writeFile(path.join(outDir, 'icon-512.png'), iconOut);
  console.log('icon-512.png');

  const logo360 = await renderLogo(360);
  const feature = await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 3,
      background: { r: 28, g: 25, b: 23 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#292524"/>
                <stop offset="100%" stop-color="#1c1917"/>
              </linearGradient>
            </defs>
            <rect width="1024" height="500" fill="url(#g)"/>
            <text x="520" y="230" fill="#FBBF24" font-family="Georgia, serif" font-size="64" font-weight="700">Voice App</text>
            <text x="520" y="290" fill="#D6D3D1" font-family="Georgia, serif" font-size="28">Local voice effects · optional AI</text>
          </svg>`,
        ),
        top: 0,
        left: 0,
      },
      { input: logo360, left: 80, top: 70 },
    ])
    .png()
    .toBuffer();

  await writeFile(path.join(outDir, 'feature-graphic.png'), feature);
  console.log('feature-graphic.png');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
