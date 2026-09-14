const sharp = require('sharp');
const fs = require('fs');

const shot1 =
  'C:/Users/marci/.cursor/projects/d-Negant-Projects-voiceapp/assets/c__Users_marci_AppData_Roaming_Cursor_User_workspaceStorage_db6f75f9b952538efcb0d06750fd0db4_images_image-33c94c63-df94-44a3-a553-bef3fcb5571b.png';
const shot2 =
  'C:/Users/marci/.cursor/projects/d-Negant-Projects-voiceapp/assets/c__Users_marci_AppData_Roaming_Cursor_User_workspaceStorage_db6f75f9b952538efcb0d06750fd0db4_images_image-fb8ffd81-ffd8-4f54-96b0-7f83d24fd723.png';

async function makePhone(shotPath, screenH, phoneW = 420, bezel = 14, radius = 48) {
  const screenW = phoneW - bezel * 2;
  const screen = await sharp(shotPath)
    .resize(screenW, screenH, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer();

  const phoneH = screenH + bezel * 2;
  const frame = Buffer.from(`<svg width="${phoneW}" height="${phoneH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2a2d36"/>
      <stop offset="100%" stop-color="#11131a"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${phoneW}" height="${phoneH}" rx="${radius}" ry="${radius}" fill="url(#b)"/>
  <rect x="${bezel}" y="${bezel}" width="${screenW}" height="${screenH}" rx="${radius - 10}" ry="${radius - 10}" fill="#0b0d14"/>
</svg>`);

  const mask = Buffer.from(
    `<svg width="${screenW}" height="${screenH}"><rect width="100%" height="100%" rx="${radius - 10}" ry="${radius - 10}" fill="white"/></svg>`,
  );
  const roundedScreen = await sharp(screen)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Soft drop shadow plate
  const shadowPad = 40;
  const shadow = await sharp({
    create: {
      width: phoneW + shadowPad * 2,
      height: phoneH + shadowPad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${phoneW}" height="${phoneH}"><rect width="100%" height="100%" rx="${radius}" fill="rgba(19,32,28,0.4)"/></svg>`,
        ),
        left: shadowPad,
        top: shadowPad + 10,
      },
    ])
    .blur(22)
    .png()
    .toBuffer();

  const phone = await sharp(frame)
    .composite([{ input: roundedScreen, left: bezel, top: bezel }])
    .png()
    .toBuffer();

  const withShadow = await sharp({
    create: {
      width: phoneW + shadowPad * 2,
      height: phoneH + shadowPad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadow, left: 0, top: 0 },
      { input: phone, left: shadowPad, top: shadowPad },
    ])
    .png()
    .toBuffer();

  return {
    buf: withShadow,
    w: phoneW + shadowPad * 2,
    h: phoneH + shadowPad * 2,
  };
}

async function main() {
  const size = 1200;
  const out = 'www/assets/images/voice-app-visual.png';
  const logoSvg = fs.readFileSync('assets/logo.svg');

  const bg = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 236, g: 240, b: 247 },
    },
  })
    .png()
    .toBuffer();

  const vignette = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#eef1f7" stop-opacity="0"/>
      <stop offset="100%" stop-color="#c5cddc" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`);

  const phone1 = await makePhone(shot1, 760);
  const phone2 = await makePhone(shot2, 680);

  const p2Left = Math.round(size * 0.42);
  const p2Top = Math.round(size * 0.04);
  const p1Left = Math.round(size * 0.04);
  const p1Top = Math.round(size * 0.12);

  const logoSize = 150;
  const logoPng = await sharp(logoSvg).resize(logoSize, logoSize).png().toBuffer();
  const logoLeft = Math.round(size * 0.055);
  const logoTop = size - logoSize - Math.round(size * 0.055);

  await sharp(bg)
    .composite([
      { input: vignette, left: 0, top: 0 },
      { input: phone2.buf, left: p2Left, top: p2Top },
      { input: phone1.buf, left: p1Left, top: p1Top },
      { input: logoPng, left: logoLeft, top: logoTop },
    ])
    .png()
    .toFile(out);

  fs.copyFileSync(shot1, 'www/assets/images/voice-app-screen-home.png');
  fs.copyFileSync(shot2, 'www/assets/images/voice-app-screen-effects.png');
  console.log('mockup ok', out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
