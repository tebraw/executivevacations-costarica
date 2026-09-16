import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';
import path from 'path';

async function optimizeImages() {
  console.log('\n🖼️  OPTIMIZING IMAGES...\n');
  
  // Optimize all villa images
  const villaFolders = [
    'public/images/villas/palacio-tropical',
    'public/images/villas/palicio-musical',
    'public/images/villas/the-view-house'
  ];

  for (const folder of villaFolders) {
    if (fs.existsSync(folder)) {
      console.log(`\n📁 Optimizing: ${folder}`);
      
      try {
        const files = await imagemin([`${folder}/*.{jpg,jpeg,png}`], {
          destination: folder,
          plugins: [
            imageminMozjpeg({
              quality: 85,
              progressive: true
            }),
            imageminPngquant({
              quality: [0.8, 0.9]
            })
          ]
        });
        
        console.log(`✅ Optimized ${files.length} images in ${path.basename(folder)}`);
        
        // Show file sizes
        files.forEach(file => {
          const stats = fs.statSync(file.destinationPath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          console.log(`   - ${path.basename(file.destinationPath)}: ${sizeMB} MB`);
        });
        
      } catch (error) {
        console.error(`❌ Error optimizing ${folder}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ IMAGE OPTIMIZATION COMPLETE!\n');
}

optimizeImages().catch(console.error);
