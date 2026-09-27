// Client-side color extractor and palette generator
// Extracts dominant vibrant accent colors from images with canvas sampling & instant fallback

export interface ColorPalette {
  dominant: string;       // Hex e.g. #E65100
  accent: string;         // Vibrant accent
  bgWash: string;         // e.g. rgba(r,g,b, 0.15)
  glow: string;           // e.g. rgba(r,g,b, 0.4)
  borderGlow: string;     // e.g. rgba(r,g,b, 0.35)
  gradient: string;       // e.g. linear-gradient(...)
  rgb: [number, number, number];
}

const COLOR_CACHE = new Map<string, ColorPalette>();

// Deterministic fallback palettes for instant render & CORS-restricted images
const CURATED_PALETTES: ColorPalette[] = [
  {
    dominant: '#D97706', // Rich Ochre / Amber
    accent: '#F59E0B',
    bgWash: 'rgba(217, 119, 6, 0.14)',
    glow: 'rgba(245, 158, 11, 0.35)',
    borderGlow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.22), transparent 70%)',
    rgb: [217, 119, 6],
  },
  {
    dominant: '#E11D48', // Vibrant Crimson / Fuchsia
    accent: '#FB7185',
    bgWash: 'rgba(225, 29, 72, 0.14)',
    glow: 'rgba(251, 113, 133, 0.35)',
    borderGlow: 'rgba(251, 113, 133, 0.4)',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(225, 29, 72, 0.22), transparent 70%)',
    rgb: [225, 29, 72],
  },
  {
    dominant: '#059669', // Emerald / Malachite
    accent: '#10B981',
    bgWash: 'rgba(5, 150, 105, 0.14)',
    glow: 'rgba(16, 185, 129, 0.35)',
    borderGlow: 'rgba(16, 185, 129, 0.4)',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(5, 150, 105, 0.22), transparent 70%)',
    rgb: [5, 150, 105],
  },
  {
    dominant: '#2563EB', // Royal Cobalt Blue
    accent: '#60A5FA',
    bgWash: 'rgba(37, 99, 235, 0.14)',
    glow: 'rgba(96, 165, 250, 0.35)',
    borderGlow: 'rgba(96, 165, 250, 0.4)',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.22), transparent 70%)',
    rgb: [37, 99, 235],
  },
  {
    dominant: '#9333EA', // Imperial Violet
    accent: '#C084FC',
    bgWash: 'rgba(147, 51, 234, 0.14)',
    glow: 'rgba(192, 132, 252, 0.35)',
    borderGlow: 'rgba(192, 132, 252, 0.4)',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(147, 51, 234, 0.22), transparent 70%)',
    rgb: [147, 51, 234],
  },
  {
    dominant: '#EA580C', // Terracotta / Solar Orange
    accent: '#FB923C',
    bgWash: 'rgba(234, 88, 12, 0.14)',
    glow: 'rgba(251, 146, 60, 0.35)',
    borderGlow: 'rgba(251, 146, 60, 0.4)',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(234, 88, 12, 0.22), transparent 70%)',
    rgb: [234, 88, 12],
  },
];

export function getFallbackPalette(seed: string): ColorPalette {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_PALETTES.length;
  return CURATED_PALETTES[index];
}

export function extractPaletteFromImage(
  imageUrl: string,
  callback?: (palette: ColorPalette) => void
): ColorPalette {
  if (COLOR_CACHE.has(imageUrl)) {
    const cached = COLOR_CACHE.get(imageUrl)!;
    if (callback) callback(cached);
    return cached;
  }

  const fallback = getFallbackPalette(imageUrl);
  COLOR_CACHE.set(imageUrl, fallback);

  // Attempt client-side canvas sampling asynchronously
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 32;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        let bestScore = -1;
        let bestR = fallback.rgb[0];
        let bestG = fallback.rgb[1];
        let bestB = fallback.rgb[2];

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          // Compute saturation and brightness
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lum = (max + min) / 2;

          // Ignore extreme darks and extreme lights to isolate rich garment pigments
          if (lum > 25 && lum < 235 && delta > 30) {
            const saturation = delta / max;
            const score = saturation * 2 + (lum > 50 && lum < 190 ? 1 : 0.5);
            if (score > bestScore) {
              bestScore = score;
              bestR = r;
              bestG = g;
              bestB = b;
            }
          }
        }

        const hex = `#${((1 << 24) + (bestR << 16) + (bestG << 8) + bestB).toString(16).slice(1)}`;
        const palette: ColorPalette = {
          dominant: hex,
          accent: hex,
          bgWash: `rgba(${bestR}, ${bestG}, ${bestB}, 0.16)`,
          glow: `rgba(${bestR}, ${bestG}, ${bestB}, 0.45)`,
          borderGlow: `rgba(${bestR}, ${bestG}, ${bestB}, 0.5)`,
          gradient: `radial-gradient(circle at 50% 30%, rgba(${bestR}, ${bestG}, ${bestB}, 0.25), transparent 75%)`,
          rgb: [bestR, bestG, bestB],
        };

        COLOR_CACHE.set(imageUrl, palette);
        if (callback) callback(palette);
      } catch (err) {
        // CORS restriction or canvas taint, keep fallback silently
      }
    };
  }

  return fallback;
}
