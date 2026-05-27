// rename-weddings.js — converts ALL source images to named slots
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = path.join(__dirname, 'public/images/weddings');

// All image files sorted alphabetically
const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const files = fs.readdirSync(folder)
  .filter(f => {
    const ext = path.extname(f).toLowerCase();
    const full = path.join(folder, f);
    return exts.includes(ext) && !fs.statSync(full).isDirectory();
  })
  .sort();

// Target names in order
const targets = [
  'hero.jpg',
  'ceremony.jpg',
  'dinner.jpg',
  'catamaran.jpg',
  'estate-aerial.jpg',
  'gallery-1.jpg',
  'gallery-2.jpg',
  'gallery-3.jpg',
  'gallery-4.jpg',
  'gallery-5.jpg',
  'gallery-6.jpg',
];

console.log(`\nFound ${files.length} images, mapping to ${targets.length} named slots:\n`);

const used = Math.min(files.length, targets.length);

for (let i = 0; i < used; i++) {
  const src = path.join(folder, files[i]);
  const dst = path.join(folder, targets[i]);
  const mb  = (fs.statSync(src).size / 1024 / 1024).toFixed(1);

  try {
    await sharp(src)
      .resize(2400, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 90, progressive: true, mozjpeg: true })
      .toFile(dst);

    const mbOut = (fs.statSync(dst).size / 1024 / 1024).toFixed(1);
    console.log(`  [${i+1}] ${files[i].substring(0,42).padEnd(42)}  -->  ${targets[i].padEnd(22)} (${mb}MB -> ${mbOut}MB)`);
  } catch (e) {
    console.log(`  ERR ${files[i]}: ${e.message}`);
  }
}

if (files.length > targets.length) {
  console.log(`\n  Note: ${files.length - targets.length} extra image(s) not used.`);
}

console.log('\nDone! Open http://localhost:5173/weddings to review.');
console.log('Tell me if any images need to be swapped (e.g. "hero and ceremony should switch").');
