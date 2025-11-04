import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImage(inputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const sizeBefore = (stats.size / 1024 / 1024).toFixed(2);
    
    // Read and optimize
    await sharp(inputPath)
      .resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toFile(inputPath + '.tmp');
    
    // Replace original with optimized
    fs.unlinkSync(inputPath);
    fs.renameSync(inputPath + '.tmp', inputPath);
    
    const statsAfter = fs.statSync(inputPath);
    const sizeAfter = (statsAfter.size / 1024 / 1024).toFixed(2);
    const savings = ((1 - statsAfter.size / stats.size) * 100).toFixed(1);
    
    console.log(`   ✅ ${path.basename(inputPath)}: ${sizeBefore}MB → ${sizeAfter}MB (${savings}% kleiner)`);
    
  } catch (error) {
    console.error(`   ❌ Error: ${path.basename(inputPath)}:`, error.message);
  }
}

async function optimizeFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folderPath}`);
    return;
  }
  
  console.log(`\n📁 ${path.basename(folderPath)}:`);
  
  const files = fs.readdirSync(folderPath)
    .filter(file => /\.(jpg|jpeg)$/i.test(file))
    .map(file => path.join(folderPath, file));
  
  for (const file of files) {
    await optimizeImage(file);
  }
}

async function main() {
  console.log('\n🚀 AGGRESSIVE IMAGE OPTIMIZATION\n');
  console.log('Strategy: Resize to max 1920px + 80% quality\n');
  
  const villaFolders = [
    'public/images/villas/palacio-tropical',
    'public/images/villas/palicio-musical',
    'public/images/villas/the-palms-villa-estate',
    'public/images/villas/the-view-house'
  ];
  
  for (const folder of villaFolders) {
    await optimizeFolder(path.join(__dirname, folder));
  }
  
  console.log('\n✅ OPTIMIZATION COMPLETE!\n');
}

main().catch(console.error);
