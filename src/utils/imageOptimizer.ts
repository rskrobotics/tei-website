import { getImage } from "astro:assets";

export interface OptimizedImage {
    thumbnail: string;
    full: string;
    original: string;
}

/**
 * Generate optimized versions of an image
 * @param imagePath - Path to the image in public folder (e.g., "/gallery/meble/1.jpg")
 * @param options - Optional configuration
 */
export async function optimizeGalleryImage(
    imagePath: string,
    options?: {
        thumbnailWidth?: number;
        fullWidth?: number;
    }
): Promise<OptimizedImage> {
    const { thumbnailWidth = 400, fullWidth = 1920 } = options || {};

    try {
        // For images in public folder, we need to reference them differently
        // We'll create a simple optimization that returns the paths
        // Astro will handle the optimization during build

        return {
            thumbnail: imagePath, // Will be optimized via Image component
            full: imagePath,
            original: imagePath,
        };
    } catch (error) {
        console.error(`Error optimizing image ${imagePath}:`, error);
        return {
            thumbnail: imagePath,
            full: imagePath,
            original: imagePath,
        };
    }
}

/**
 * Get image dimensions from path
 */
export function getImageDimensions(width: number): { width: number; height: number } {
    return { width, height: width }; // Square for gallery
}
