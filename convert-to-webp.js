import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicImagesDir = path.join(__dirname, 'public/images');

let totalBefore = 0;
let totalAfter = 0;
let convertedCount = 0;

async function convertToWebP(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  // Skip if webp already exists and is newer
  if (fs.existsSync(outputPath)) {
    const inStat = fs.statSync(inputPath);
    const outStat = fs.statSync(outputPath);
    if (outStat.mtimeMs > inStat.mtimeMs) {
      console.log(`  ⏭  Skipped (already converted): ${path.basename(outputPath)}`);
      return;
    }
  }

  const sizeBefore = fs.statSync(inputPath).size;
  totalBefore += sizeBefore;

  await sharp(inputPath)
    .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 82, effort: 4 })
    .toFile(outputPath);

  const sizeAfter = fs.statSync(outputPath).size;
  totalAfter += sizeAfter;
  convertedCount++;

  const savings = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1);
  const beforeMB = (sizeBefore / 1024 / 1024).toFixed(2);
  const afterKB = (sizeAfter / 1024).toFixed(0);
  console.log(`  ✅ ${path.basename(inputPath)}: ${beforeMB}MB → ${afterKB}KB (${savings}% kleiner)`);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  console.log('\n🚀 WebP Konvertierung für alle Bilder\n');

  const allFiles = walkDir(publicImagesDir);
  const imageFiles = allFiles.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  console.log(`📁 Gefunden: ${imageFiles.length} Bilder\n`);

  for (const file of imageFiles) {
    const folder = path.basename(path.dirname(file));
    console.log(`\n📂 ${folder}/`);
    await convertToWebP(file);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ${convertedCount} Bilder konvertiert`);
  console.log(`💾 Gesamt vorher: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`💾 Gesamt nachher: ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`🎉 Eingespart: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)} MB (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
