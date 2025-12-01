import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const galleryPath = join(__dirname, '../public/gallery');

async function optimizeImages() {
    console.log('🖼️  Starting image optimization...');
    
    const categories = await readdir(galleryPath);
    let totalProcessed = 0;
    let totalSkipped = 0;

    for (const category of categories) {
        const categoryPath = join(galleryPath, category);
        const stat = await readdir(categoryPath, { withFileTypes: true });
        
        if (!stat[0]?.isDirectory()) {
            const files = await readdir(categoryPath);
            
            for (const file of files) {
                if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
                
                const inputPath = join(categoryPath, file);
                const thumbName = file.replace(/\.(jpg|jpeg|png)$/i, '-thumb.webp');
                const thumbPath = join(categoryPath, thumbName);
                
                // Skip if thumbnail already exists and is newer
                if (existsSync(thumbPath)) {
                    totalSkipped++;
                    continue;
                }
                
                try {
                    await sharp(inputPath)
                        .resize(400, 400, { fit: 'cover', position: 'center' })
                        .webp({ quality: 80 })
                        .toFile(thumbPath);
                    
                    totalProcessed++;
                    console.log(`✓ ${category}/${thumbName}`);
                } catch (error) {
                    console.error(`✗ Error processing ${category}/${file}:`, error.message);
                }
            }
        }
    }
    
    console.log(`\n✅ Done! Processed: ${totalProcessed}, Skipped: ${totalSkipped}`);
}

optimizeImages().catch(console.error);
