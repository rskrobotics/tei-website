import sharp from "sharp";
import { readdir, mkdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const galleryPath = join(__dirname, "../public/gallery");

// Configuration
const THUMB_SIZE = 400;
const THUMB_QUALITY = 80;
const FULL_MAX_SIZE = 2500;
const FULL_QUALITY = 88;
const SKIP_THUMB_THRESHOLD = 500 * 1024; // 500KB - don't create thumbs if smaller

async function getFileSize(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function optimizeImages() {
  console.log("🖼️  Starting image optimization...");
  console.log(
    `📊 Config: Thumbs ${THUMB_SIZE}px @ ${THUMB_QUALITY}%, Full max ${FULL_MAX_SIZE}px @ ${FULL_QUALITY}%`,
  );
  console.log(
    `⏭️  Skipping thumbnails for files smaller than ${Math.round(SKIP_THUMB_THRESHOLD / 1024)}KB\n`,
  );

  const categories = await readdir(galleryPath);
  let thumbsProcessed = 0;
  let thumbsSkipped = 0;
  let fullProcessed = 0;
  let fullSkipped = 0;
  let thumbsTooSmall = 0;

  for (const category of categories) {
    // Skip .DS_Store and other hidden files
    if (category.startsWith(".")) continue;

    const categoryPath = join(galleryPath, category);
    const dirEntries = await readdir(categoryPath, { withFileTypes: true });

    if (!dirEntries[0] || !dirEntries[0].isDirectory()) {
      const files = await readdir(categoryPath);

      for (const file of files) {
        if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;

        const inputPath = join(categoryPath, file);
        const fileSize = await getFileSize(inputPath);
        const baseName = file.replace(/\.(jpg|jpeg|png)$/i, "");
        const thumbName = `${baseName}-thumb.webp`;
        const thumbPath = join(categoryPath, thumbName);
        const fullName = `${baseName}-full.webp`;
        const fullPath = join(categoryPath, fullName);

        // Process thumbnail (skip if file is small)
        if (existsSync(thumbPath)) {
          thumbsSkipped++;
        } else if (fileSize < SKIP_THUMB_THRESHOLD) {
          thumbsTooSmall++;
        } else {
          try {
            await sharp(inputPath)
              .resize(THUMB_SIZE, THUMB_SIZE, {
                fit: "cover",
                position: "center",
              })
              .webp({ quality: THUMB_QUALITY })
              .toFile(thumbPath);

            const thumbSize = await getFileSize(thumbPath);
            thumbsProcessed++;
            console.log(
              `✓ Thumb: ${category}/${thumbName} (${Math.round(thumbSize / 1024)}KB)`,
            );
          } catch (error) {
            console.error(
              `✗ Error processing thumb ${category}/${file}:`,
              error.message,
            );
          }
        }

        // Process full-size optimized version
        if (existsSync(fullPath)) {
          fullSkipped++;
        } else {
          try {
            // Get original dimensions to avoid upscaling
            const metadata = await sharp(inputPath).metadata();
            const maxDimension = Math.max(
              metadata.width || 0,
              metadata.height || 0,
            );

            // Only resize if image is larger than our max
            let sharpInstance = sharp(inputPath);
            if (maxDimension > FULL_MAX_SIZE) {
              sharpInstance = sharpInstance.resize(
                FULL_MAX_SIZE,
                FULL_MAX_SIZE,
                {
                  fit: "inside",
                  withoutEnlargement: true,
                },
              );
            }

            await sharpInstance
              .webp({ quality: FULL_QUALITY })
              .toFile(fullPath);

            const fullSize = await getFileSize(fullPath);
            const savedKB = Math.round((fileSize - fullSize) / 1024);
            const savedPercent = Math.round((1 - fullSize / fileSize) * 100);
            fullProcessed++;
            console.log(
              `✓ Full:  ${category}/${fullName} (${Math.round(fullSize / 1024)}KB, saved ${savedKB}KB / ${savedPercent}%)`,
            );
          } catch (error) {
            console.error(
              `✗ Error processing full ${category}/${file}:`,
              error.message,
            );
          }
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Optimization Complete!");
  console.log("=".repeat(60));
  console.log(
    `📸 Thumbnails: ${thumbsProcessed} created, ${thumbsSkipped} already existed`,
  );
  console.log(
    `🖼️  Full-size:  ${fullProcessed} created, ${fullSkipped} already existed`,
  );
  console.log(`⏭️  Thumbnails skipped (small files): ${thumbsTooSmall}`);
  console.log("=".repeat(60));
}

optimizeImages().catch(console.error);
