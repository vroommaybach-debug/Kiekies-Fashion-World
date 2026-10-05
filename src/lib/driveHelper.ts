/**
 * Normalizes image URLs, specifically handling Google Drive links,
 * Dropbox links, and standard web URLs so they display directly as images.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Google Drive links:
  // e.g. https://drive.google.com/file/d/1ABCXYZ_123/view?usp=sharing
  // e.g. https://drive.google.com/open?id=1ABCXYZ_123
  // e.g. https://drive.google.com/uc?id=1ABCXYZ_123
  // e.g. https://drive.google.com/file/d/1ABCXYZ_123
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    let fileId: string | null = null;

    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      fileId = fileMatch[1];
    } else {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }

    if (fileId) {
      // https://lh3.googleusercontent.com/d/FILE_ID is Google's high-speed CDN direct image endpoint
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Dropbox links:
  // convert dl=0 to raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

/**
 * Checks if a string is a Google Drive link
 */
export function isGoogleDriveUrl(url: string): boolean {
  return (
    url.includes('drive.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('googleusercontent.com/d/')
  );
}

/**
 * Compresses and resizes a browser File object into an optimized JPEG Data URL
 * guaranteed to fit comfortably inside Firestore's document size limits (< 220KB)
 * while maintaining crisp editorial visual quality across mobile and desktop.
 */
export function fileToDataUrl(file: File, maxDimension = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl.slice(0, 850000));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          let compressed = canvas.toDataURL('image/jpeg', quality);

          // Step down quality if still large so Firestore document never exceeds 1MB
          let currentQuality = quality;
          while (compressed.length > 220000 && currentQuality > 0.35) {
            currentQuality -= 0.12;
            compressed = canvas.toDataURL('image/jpeg', currentQuality);
          }

          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
