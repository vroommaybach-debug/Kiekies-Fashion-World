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
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Converts a browser File object to a base64 Data URL for local embedding and persistent storage
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
