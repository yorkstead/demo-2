const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:\\Users\\4twen\\.gemini\\antigravity\\brain\\b9df40d4-3539-4363-a37e-c6cbe5ebc1c2';
const files = fs.readdirSync(brainDir);

const wideFile = path.join(brainDir, files.find(f => f.startsWith('truck_cargo_shift') && f.endsWith('.jpg')));
const closeFile = path.join(brainDir, files.find(f => f.startsWith('busted_pallet_runners') && f.endsWith('.jpg')));
const afterFile = path.join(brainDir, files.find(f => f.startsWith('reworked_pallet_after') && f.endsWith('.jpg')));

const publicImagesDir = path.join(__dirname, '..', 'public', 'images');

function createStampSvg(width, header, details, color = '#fbbf24') {
  const svg = `<svg width="${width}" height="76" viewBox="0 0 ${width} 76" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="76" fill="rgba(6, 13, 23, 0.90)" />
    <line x1="0" y1="0" x2="${width}" y2="0" stroke="${color}" stroke-width="3" />
    <text x="24" y="30" fill="#ffffff" font-family="monospace, -apple-system, sans-serif" font-size="16" font-weight="900" letter-spacing="1.5">
      ${header}
    </text>
    <text x="24" y="56" fill="${color}" font-family="monospace, -apple-system, sans-serif" font-size="14" font-weight="bold" letter-spacing="1">
      ${details}
    </text>
    <circle cx="${width - 45}" cy="38" r="18" stroke="${color}" stroke-width="2.5" fill="none" />
    <circle cx="${width - 45}" cy="38" r="5" fill="${color}" />
    <line x1="${width - 70}" y1="38" x2="${width - 20}" y2="38" stroke="${color}" stroke-width="2" />
    <line x1="${width - 45}" y1="13" x2="${width - 45}" y2="63" stroke="${color}" stroke-width="2" />
  </svg>`;
  return Buffer.from(svg);
}

async function processImages() {
  console.log('Stamping Denver Mountain Time forensic banners onto images...');

  // 1. Wide Shot
  const wideMeta = await sharp(wideFile).metadata();
  const wideStamp = createStampSvg(
    wideMeta.width,
    'DENVER EXPRESS WAREHOUSING • DOCK BAY 2 • INBOUND CARGO SHIFT #RW-0842-B2',
    'GPS: 39.8058° N, 104.9877° W • 2026-09-07 23:21:13 MDT (DENVER MOUNTAIN TIME)',
    '#fbbf24'
  );
  await sharp(wideFile)
    .composite([{ input: wideStamp, gravity: 'south' }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(publicImagesDir, 'truck-cargo-shift-wide.jpg'));
  console.log('✓ Stamped truck-cargo-shift-wide.jpg with Denver Mountain Time');

  // 2. Close-up Shot
  const closeMeta = await sharp(closeFile).metadata();
  const closeStamp = createStampSvg(
    closeMeta.width,
    'DENVER EXPRESS WAREHOUSING • DOCK BAY 2 • BUSTED RUNNER DETAIL #RW-0842-D1',
    'GPS: 39.8058° N, 104.9877° W • 2026-09-07 23:22:04 MDT (DENVER MOUNTAIN TIME)',
    '#f87171'
  );
  await sharp(closeFile)
    .composite([{ input: closeStamp, gravity: 'south' }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(publicImagesDir, 'busted-pallet-runners-close.jpg'));
  console.log('✓ Stamped busted-pallet-runners-close.jpg with Denver Mountain Time');

  // 3. After Shot
  const afterMeta = await sharp(afterFile).metadata();
  const afterStamp = createStampSvg(
    afterMeta.width,
    'DENVER EXPRESS WAREHOUSING • DOCK BAY 2 • ROAD-READY REWORK CERTIFIED #RW-0842-OK',
    'GPS: 39.8058° N, 104.9877° W • 2026-09-07 23:48:30 MDT (DENVER MOUNTAIN TIME)',
    '#34d399'
  );
  await sharp(afterFile)
    .composite([{ input: afterStamp, gravity: 'south' }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(publicImagesDir, 'reworked-pallet-after.jpg'));
  console.log('✓ Stamped reworked-pallet-after.jpg with Denver Mountain Time');
}

processImages().catch((err) => {
  console.error('Error stamping images:', err);
  process.exit(1);
});
