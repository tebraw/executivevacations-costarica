import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = path.join(__dirname, 'public/images/weddings');
const outFolder = path.join(__dirname, 'public/images/weddings/compressed');

if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const files = fs.readdirSync(folder).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return exts.includes(ext) && !fs.statSync(path.join(folder, f)).isDirectory();
});

console.log(`\nFound ${files.length} images to compress...\n`);

for (const file of files) {
  const inputPath  = path.join(folder, file);
  const outName    = path.basename(file, path.extname(file)) + '.jpg';
  const outputPath = path.join(outFolder, outName);

  const sizeBefore = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(1);

  try {
    await sharp(inputPath)
      .resize(2400, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(outputPath);

    const sizeAfter = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
    console.log(`  OK  ${file.padEnd(30)} ${sizeBefore} MB  -->  ${sizeAfter} MB`);
  } catch (err) {
    console.log(`  ERR ${file}: ${err.message}`);
  }
}

console.log(`\nDone! Compressed images are in:\n  public/images/weddings/compressed/\n`);
console.log('Next steps:');
console.log('  1. Upload files from /compressed/ to Nano Banana for AI enhancement');
console.log('  2. Download enhanced files back to /weddings/');
console.log('  3. Rename to: hero.jpg, ceremony.jpg, dinner.jpg, catamaran.jpg, estate-aerial.jpg, gallery-1.jpg ... gallery-6.jpg');
