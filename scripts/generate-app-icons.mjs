#!/usr/bin/env node
/**
 * Generuje ikony aplikacji iOS i Android z assets/logo.svg
 * Uruchom: npm run generate:icons
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceSvg = path.join(root, 'assets/logo.svg');

const iosDir = path.join(
  root,
  'ios/VoiceApp/Images.xcassets/AppIcon.appiconset',
);

const androidDensities = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const iosIcons = [
  { filename: 'Icon-App-20x20@2x.png', size: 40 },
  { filename: 'Icon-App-20x20@3x.png', size: 60 },
  { filename: 'Icon-App-29x29@2x.png', size: 58 },
  { filename: 'Icon-App-29x29@3x.png', size: 87 },
  { filename: 'Icon-App-40x40@2x.png', size: 80 },
  { filename: 'Icon-App-40x40@3x.png', size: 120 },
  { filename: 'Icon-App-60x60@2x.png', size: 120 },
  { filename: 'Icon-App-60x60@3x.png', size: 180 },
  { filename: 'Icon-App-1024x1024@1x.png', size: 1024 },
];

async function renderPng(size) {
  const svg = await readFile(sourceSvg);
  return sharp(svg, { density: Math.max(72, Math.ceil((size / 512) * 300)) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function generateIosIcons() {
  await mkdir(iosDir, { recursive: true });

  for (const icon of iosIcons) {
    const buffer = await renderPng(icon.size);
    await writeFile(path.join(iosDir, icon.filename), buffer);
    console.log(`iOS  ${icon.filename} (${icon.size}px)`);
  }

  const contents = {
    images: [
      {
        filename: 'Icon-App-20x20@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '20x20',
      },
      {
        filename: 'Icon-App-20x20@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '20x20',
      },
      {
        filename: 'Icon-App-29x29@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '29x29',
      },
      {
        filename: 'Icon-App-29x29@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '29x29',
      },
      {
        filename: 'Icon-App-40x40@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '40x40',
      },
      {
        filename: 'Icon-App-40x40@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '40x40',
      },
      {
        filename: 'Icon-App-60x60@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '60x60',
      },
      {
        filename: 'Icon-App-60x60@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '60x60',
      },
      {
        filename: 'Icon-App-1024x1024@1x.png',
        idiom: 'ios-marketing',
        scale: '1x',
        size: '1024x1024',
      },
    ],
    info: { author: 'generate-app-icons', version: 1 },
  };

  await writeFile(
    path.join(iosDir, 'Contents.json'),
    `${JSON.stringify(contents, null, 2)}\n`,
  );
}

async function generateAndroidIcons() {
  for (const [folder, size] of Object.entries(androidDensities)) {
    const dir = path.join(root, 'android/app/src/main/res', folder);
    await mkdir(dir, { recursive: true });

    const buffer = await renderPng(size);
    await writeFile(path.join(dir, 'ic_launcher.png'), buffer);
    await writeFile(path.join(dir, 'ic_launcher_round.png'), buffer);
    console.log(`Android ${folder} (${size}px)`);
  }
}

async function main() {
  console.log(`Źródło: ${sourceSvg}\n`);
  await generateIosIcons();
  console.log('');
  await generateAndroidIcons();
  console.log('\nGotowe — ikony iOS i Android wygenerowane.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
