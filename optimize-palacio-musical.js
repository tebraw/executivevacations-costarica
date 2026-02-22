import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'public/images/villas/palacio-musical');
const outputDir = inputDir; // Overwrite in same directory

async function optimizeImages() {
  try {
    const files = await fs.readdir(inputDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    console.log(`Found ${pngFiles.length} PNG files to optimize...`);
    
    for (const file of pngFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      const stats = await fs.stat(inputPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`\nProcessing: ${file} (${sizeMB} MB)`);
      
      await sharp(inputPath)
        .resize(2000, null, { // Max width 2000px, maintain aspect ratio
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ 
          quality: 85, // High quality JPEG
          mozjpeg: true 
        })
        .toFile(outputPath.replace('.png', '.jpg'));
      
      const newStats = await fs.stat(outputPath.replace('.png', '.jpg'));
      const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
      const reduction = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);
      
      console.log(`  ✓ Converted to JPG: ${newSizeMB} MB (${reduction}% smaller)`);
      
      // Delete original PNG
      await fs.unlink(inputPath);
      console.log(`  ✓ Deleted original PNG`);
    }
    
    console.log('\n✅ All images optimized!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

optimizeImages();
