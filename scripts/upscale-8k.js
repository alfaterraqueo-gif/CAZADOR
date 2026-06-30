const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGET = 7680; // 8K width (longest edge)
const webDir = path.join(__dirname, '..');

const files = [
  'cancer-en-su-hora-final.png',
  'virus-newcastle.png',
  'manolo-fernandez-zoom.png',
];

async function enhance(file) {
  const input = path.join(webDir, file);
  const output = input;
  const meta = await sharp(input).metadata();
  const scale = TARGET / Math.max(meta.width, meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);

  await sharp(input)
    .resize(w, h, { kernel: sharp.kernel.lanczos3, fit: 'fill' })
    .modulate({ brightness: 1.04, saturation: 1.12 })
    .sharpen({ sigma: 1.2, m1: 1.1, m2: 0.5 })
    .png({ compressionLevel: 6, quality: 100, effort: 10 })
    .toFile(output + '.tmp');

  fs.renameSync(output + '.tmp', output);
  const stat = fs.statSync(output);
  console.log(`${file}: ${meta.width}x${meta.height} -> ${w}x${h} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
}

(async () => {
  for (const f of files) await enhance(f);
  console.log('Done.');
})();