/**
 * Image compression utilities for local storage optimization
 * Compresses images to reduce localStorage usage while maintaining quality
 */

const MAX_WIDTH = 800;
const MAX_HEIGHT = 1000;
const QUALITY = 0.7;

/**
 * Compress an image from a data URL
 * @param dataUrl - The original image as a data URL
 * @param maxWidth - Maximum width of the compressed image
 * @param maxHeight - Maximum height of the compressed image
 * @param quality - JPEG quality (0-1)
 * @returns Promise with compressed data URL
 */
export async function compressImage(
  dataUrl: string,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for better compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Estimate the storage size of a data URL in bytes
 */
export function estimateDataUrlSize(dataUrl: string): number {
  // Base64 encoded data is ~4/3 the size of the original binary
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  return Math.round((base64Length * 3) / 4);
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
