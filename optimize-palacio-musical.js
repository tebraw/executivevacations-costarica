import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'images/villas/palicio-musical');
const outputDir = path.join(__dirname, 'public/images/villas/palacio-musical');

async function optimizeImages() {
  try {
    // First, clear output directory
    try {
      const existingFiles = await fs.readdir(outputDir);
      for (const file of existingFiles) {
        await fs.unlink(path.join(outputDir, file));
      }
      console.log('✓ Cleared existing output files\n');
    } catch (err) {
      console.log('Output directory empty or doesn\'t exist\n');
    }

    const files = await fs.readdir(inputDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    console.log(`Found ${pngFiles.length} PNG files to optimize...\n`);
    
    for (const file of pngFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file.replace('.png', '.jpg'));
      
      const stats = await fs.stat(inputPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`Processing: ${file} (${sizeMB} MB)`);
      
      await sharp(inputPath)
        .resize(2000, null, { // Max width 2000px, maintain aspect ratio
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ 
          quality: 85, // High quality JPEG
          mozjpeg: true 
        })
        .toFile(outputPath);
      
      const newStats = await fs.stat(outputPath);
      const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
      const reduction = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);
      
      console.log(`  ✓ Converted to JPG: ${newSizeMB} MB (${reduction}% smaller)\n`);
    }
    
    console.log('✅ All images optimized!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

optimizeImages();
