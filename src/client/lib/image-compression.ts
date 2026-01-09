/**
 * Client-side image compression utility
 * Compresses images before upload to reduce bandwidth and storage costs
 */

export interface CompressionOptions {
    /** Target quality (0-1). Default: 0.8 */
    quality?: number;
    /** Maximum width in pixels. Default: 1920 */
    maxWidth?: number;
    /** Maximum height in pixels. Default: 1080 */
    maxHeight?: number;
    /** Convert to JPEG if file size exceeds this (bytes). Default: 1MB */
    convertThreshold?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    convertThreshold: 1_000_000, // 1MB
};

/**
 * Check if a file is an image that can be compressed
 */
export function isCompressibleImage(file: File): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    // If image is smaller than max, return original dimensions
    if (width <= maxWidth && height <= maxHeight) {
        return { width, height };
    }

    const aspectRatio = width / height;

    if (width > height) {
        // Landscape
        const newWidth = Math.min(width, maxWidth);
        const newHeight = Math.round(newWidth / aspectRatio);
        if (newHeight > maxHeight) {
            return {
                width: Math.round(maxHeight * aspectRatio),
                height: maxHeight,
            };
        }
        return { width: newWidth, height: newHeight };
    } else {
        // Portrait or square
        const newHeight = Math.min(height, maxHeight);
        const newWidth = Math.round(newHeight * aspectRatio);
        if (newWidth > maxWidth) {
            return {
                width: maxWidth,
                height: Math.round(maxWidth / aspectRatio),
            };
        }
        return { width: newWidth, height: newHeight };
    }
}

/**
 * Convert canvas to Blob with specified format and quality
 */
function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            },
            type,
            quality
        );
    });
}

/**
 * Compress an image file
 * 
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file (or original if compression not beneficial)
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    // Skip non-compressible images (GIFs, etc.)
    if (!isCompressibleImage(file)) {
        return file;
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
        // Load the image
        const img = await loadImage(file);
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        // Calculate target dimensions
        const { width, height } = calculateDimensions(
            originalWidth,
            originalHeight,
            opts.maxWidth,
            opts.maxHeight
        );

        // Check if compression is needed
        const needsResize = width !== originalWidth || height !== originalHeight;
        const needsConversion = file.size > opts.convertThreshold && file.type !== 'image/jpeg';

        // If no compression needed and file is small, return original
        if (!needsResize && !needsConversion && file.size < opts.convertThreshold) {
            URL.revokeObjectURL(img.src);
            return file;
        }

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Draw image on canvas (this resizes it)
        ctx.drawImage(img, 0, 0, width, height);

        // Clean up object URL
        URL.revokeObjectURL(img.src);

        // Determine output format
        // Convert to JPEG if file is large (for better compression)
        const outputType = needsConversion || file.size > opts.convertThreshold
            ? 'image/jpeg'
            : file.type;

        // Convert canvas to blob
        const blob = await canvasToBlob(canvas, outputType, opts.quality);

        // Only use compressed version if it's actually smaller
        if (blob.size >= file.size) {
            return file;
        }

        // Create new file with same name but potentially different extension
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const newFileName = outputType === 'image/jpeg' && !file.name.endsWith('.jpg') && !file.name.endsWith('.jpeg')
            ? `${baseName}.jpg`
            : file.name;

        return new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
        });
    } catch (error) {
        // If compression fails, return original file
        console.warn('Image compression failed, using original:', error);
        return file;
    }
}

/**
 * Compress multiple image files
 * 
 * @param files - Array of files to compress
 * @param options - Compression options
 * @returns Array of compressed files
 */
export async function compressImages(
    files: File[],
    options: CompressionOptions = {}
): Promise<File[]> {
    return Promise.all(files.map((file) => compressImage(file, options)));
}
