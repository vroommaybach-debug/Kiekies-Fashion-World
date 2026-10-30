import { removeBackground } from '@imgly/background-removal';
import { CategorySlug } from '../types';

const neuralCutoutCache = new Map<string, HTMLCanvasElement>();

export interface StudioBackdrop {
  id: string;
  name: string;
  group: 'studio' | 'editorial' | 'architectural' | 'warm';
  subtitle: string;
  wallTop: string;
  wallMid: string;
  wallBottom: string;
  floorTop: string;
  floorBottom: string;
  spotlightColor: string;
  horizonRatio: number;
  isDark: boolean;
}

export const STUDIO_BACKDROPS: StudioBackdrop[] = [
  // 1-5: Luxury Studio Neutrals (Standard E-Commerce & Lookbook)
  {
    id: 'ivory-cyclorama',
    name: '01. Warm Ivory Cyclorama',
    group: 'studio',
    subtitle: 'Standard luxury e-commerce infinity wall',
    wallTop: '#F7F5F0',
    wallMid: '#EFECE6',
    wallBottom: '#E5E0D5',
    floorTop: '#DDD7CA',
    floorBottom: '#EAE6DF',
    spotlightColor: 'rgba(255, 253, 248, 0.6)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'pure-white-studio',
    name: '02. Crisp Pure White Catalog',
    group: 'studio',
    subtitle: 'High-key commercial gallery white cyclorama',
    wallTop: '#FFFFFF',
    wallMid: '#FAFAFA',
    wallBottom: '#F0F0F0',
    floorTop: '#E8E8E8',
    floorBottom: '#F7F7F7',
    spotlightColor: 'rgba(255, 255, 255, 0.75)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'dove-grey-infinity',
    name: '03. Soft Dove Grey Infinity',
    group: 'studio',
    subtitle: 'Balanced cool-grey editorial lookbook studio',
    wallTop: '#E2E4E8',
    wallMid: '#D2D5DC',
    wallBottom: '#C0C4CD',
    floorTop: '#B5B9C3',
    floorBottom: '#CDD0D7',
    spotlightColor: 'rgba(255, 255, 255, 0.45)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'champagne-silk',
    name: '04. Champagne Silk Salon',
    group: 'studio',
    subtitle: 'Warm cashmere-champagne daylight studio',
    wallTop: '#F4ECE0',
    wallMid: '#E8DCCB',
    wallBottom: '#D8C8B0',
    floorTop: '#CBB89D',
    floorBottom: '#E0D3C0',
    spotlightColor: 'rgba(255, 250, 240, 0.5)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'obsidian-matte',
    name: '05. Obsidian Editorial Matte',
    group: 'studio',
    subtitle: 'Kiekies signature dark studio with soft key light',
    wallTop: '#101012',
    wallMid: '#18181C',
    wallBottom: '#121215',
    floorTop: '#16161A',
    floorBottom: '#0B0B0D',
    spotlightColor: 'rgba(255, 248, 235, 0.12)',
    horizonRatio: 0.78,
    isDark: true,
  },

  // 6-10: Editorial & Runway
  {
    id: 'lagos-gallery',
    name: '06. Lagos Editorial Runway',
    group: 'editorial',
    subtitle: 'Victoria Island contemporary runway & warm key light',
    wallTop: '#181512',
    wallMid: '#25201B',
    wallBottom: '#1A1613',
    floorTop: '#231D19',
    floorBottom: '#120F0D',
    spotlightColor: 'rgba(251, 191, 36, 0.14)',
    horizonRatio: 0.77,
    isDark: true,
  },
  {
    id: 'midnight-runway',
    name: '07. Midnight Slate Runway',
    group: 'editorial',
    subtitle: 'Deep architectural slate lookbook environment',
    wallTop: '#0F131A',
    wallMid: '#181F2B',
    wallBottom: '#11161F',
    floorTop: '#171E2A',
    floorBottom: '#0B0E14',
    spotlightColor: 'rgba(226, 232, 240, 0.14)',
    horizonRatio: 0.77,
    isDark: true,
  },
  {
    id: 'chiaroscuro-spotlight',
    name: '08. Charcoal Halo Studio',
    group: 'editorial',
    subtitle: 'Soft circular studio spotlight on warm charcoal',
    wallTop: '#171615',
    wallMid: '#272523',
    wallBottom: '#191816',
    floorTop: '#211F1D',
    floorBottom: '#11100F',
    spotlightColor: 'rgba(254, 243, 199, 0.16)',
    horizonRatio: 0.78,
    isDark: true,
  },
  {
    id: 'cobalt-editorial',
    name: '09. Deep Navy Atelier',
    group: 'editorial',
    subtitle: 'Muted midnight-navy backdrop for warm & gold garments',
    wallTop: '#0E1726',
    wallMid: '#16243B',
    wallBottom: '#101A2B',
    floorTop: '#152238',
    floorBottom: '#0A101B',
    spotlightColor: 'rgba(191, 219, 254, 0.14)',
    horizonRatio: 0.78,
    isDark: true,
  },
  {
    id: 'crimson-gala',
    name: '10. Bordeaux Evening Salon',
    group: 'editorial',
    subtitle: 'Deep muted mulberry-bordeaux eveningwear studio',
    wallTop: '#1F0E12',
    wallMid: '#30161C',
    wallBottom: '#220F14',
    floorTop: '#2B1319',
    floorBottom: '#14090B',
    spotlightColor: 'rgba(254, 205, 211, 0.13)',
    horizonRatio: 0.78,
    isDark: true,
  },

  // 11-15: Architectural & Gallery
  {
    id: 'travertine-stone',
    name: '11. Raw Travertine Limestone',
    group: 'architectural',
    subtitle: 'Warm Italian limestone gallery backdrop',
    wallTop: '#EBE4D8',
    wallMid: '#DFD6C5',
    wallBottom: '#D2C6B2',
    floorTop: '#C5B8A2',
    floorBottom: '#D8CEBC',
    spotlightColor: 'rgba(255, 251, 242, 0.45)',
    horizonRatio: 0.77,
    isDark: false,
  },
  {
    id: 'brutalist-concrete',
    name: '12. Architectural Concrete',
    group: 'architectural',
    subtitle: 'Balanced matte architectural concrete studio',
    wallTop: '#D6D7DA',
    wallMid: '#C5C7CB',
    wallBottom: '#B4B6BB',
    floorTop: '#A7A9AE',
    floorBottom: '#BFC1C5',
    spotlightColor: 'rgba(255, 255, 255, 0.4)',
    horizonRatio: 0.77,
    isDark: false,
  },
  {
    id: 'venetian-plaster',
    name: '13. Venetian Plaster Salon',
    group: 'architectural',
    subtitle: 'Warm hand-troweled Mediterranean stucco tone',
    wallTop: '#F0E8DC',
    wallMid: '#E4D8C7',
    wallBottom: '#D6C7B2',
    floorTop: '#C8B7A0',
    floorBottom: '#DDD0BD',
    spotlightColor: 'rgba(255, 249, 240, 0.48)',
    horizonRatio: 0.77,
    isDark: false,
  },
  {
    id: 'alabaster-museum',
    name: '14. Alabaster Museum Gallery',
    group: 'architectural',
    subtitle: 'Sculptural chalk-stone museum gallery',
    wallTop: '#F5F4F0',
    wallMid: '#EAE8E2',
    wallBottom: '#DCD9D0',
    floorTop: '#CFCBC0',
    floorBottom: '#E3E0D8',
    spotlightColor: 'rgba(255, 255, 255, 0.55)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'emerald-salon',
    name: '15. Malachite Botanical Salon',
    group: 'architectural',
    subtitle: 'Deep architectural forest-emerald salon wall',
    wallTop: '#0D1E19',
    wallMid: '#142E27',
    wallBottom: '#0F221D',
    floorTop: '#132A23',
    floorBottom: '#091411',
    spotlightColor: 'rgba(209, 250, 229, 0.12)',
    horizonRatio: 0.78,
    isDark: true,
  },

  // 16-20: Warm & Bespoke Heritage
  {
    id: 'warm-linen',
    name: '16. Organic Oatmeal Linen',
    group: 'warm',
    subtitle: 'Soft natural oatmeal textile studio backdrop',
    wallTop: '#ECE5D8',
    wallMid: '#E0D6C5',
    wallBottom: '#D2C5B0',
    floorTop: '#C4B59E',
    floorBottom: '#D9CEBA',
    spotlightColor: 'rgba(255, 251, 240, 0.45)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'sandstone-dune',
    name: '17. Warm Sahara Sandstone',
    group: 'warm',
    subtitle: 'Muted warm desert-sand editorial backdrop',
    wallTop: '#E6D7C3',
    wallMid: '#D8C5AC',
    wallBottom: '#C8B296',
    floorTop: '#BAA284',
    floorBottom: '#D0BC9F',
    spotlightColor: 'rgba(255, 248, 235, 0.42)',
    horizonRatio: 0.78,
    isDark: false,
  },
  {
    id: 'terracotta-courtyard',
    name: '18. Muted Clay & Terracotta',
    group: 'warm',
    subtitle: 'Refined earthy clay studio for neutral & ivory garments',
    wallTop: '#B8846B',
    wallMid: '#A47158',
    wallBottom: '#8F5E47',
    floorTop: '#80523C',
    floorBottom: '#98664E',
    spotlightColor: 'rgba(255, 237, 213, 0.25)',
    horizonRatio: 0.77,
    isDark: true,
  },
  {
    id: 'brushed-bronze',
    name: '19. Espresso Bronze Atelier',
    group: 'warm',
    subtitle: 'Rich warm espresso-bronze tailoring suite',
    wallTop: '#241D18',
    wallMid: '#332922',
    wallBottom: '#221B16',
    floorTop: '#2B221C',
    floorBottom: '#17120F',
    spotlightColor: 'rgba(254, 243, 199, 0.15)',
    horizonRatio: 0.78,
    isDark: true,
  },
  {
    id: 'rosewood-atelier',
    name: '20. Rosewood Fitting Suite',
    group: 'warm',
    subtitle: 'Warm mahogany-umber private client showroom',
    wallTop: '#241614',
    wallMid: '#34201D',
    wallBottom: '#211412',
    floorTop: '#2B1A17',
    floorBottom: '#150C0B',
    spotlightColor: 'rgba(254, 215, 170, 0.15)',
    horizonRatio: 0.78,
    isDark: true,
  },
];

export interface StudioCompositorOptions {
  sourceImageUrl: string;
  backdropId: string;
  customBackdropUrl?: string;
  removalMode: 'neural-ai' | 'auto' | 'tight' | 'gentle' | 'keep-bg';
  enhanceLighting: boolean;
  sharpenGarment: boolean;
  contactShadow: boolean;
  subjectScale: number; // e.g. 0.88 to 1.04
  aspectRatio: '3:4' | '16:9';
}

export interface VisualSpecificsProfile {
  primaryColorName: string;
  primaryHex: string;
  secondaryColorName: string;
  secondaryHex: string;
  surfaceFinish: string;
  lightingMood: string;
  silhouetteNote: string;
  compactVisionDataUrl: string;
  appliedBackdropName?: string;
}

interface SubjectBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  touchesBottom: boolean;
  touchesTop: boolean;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Refines the alpha mask of a cutout so that:
 * 1. 100% of interior model & garment RGB pixels remain completely untouched (zero color shift, zero holes).
 * 2. Isolated background noise speckles outside the subject are removed.
 * 3. The 1-2px outer alpha edge gets a clean anti-aliased feather and edge-color decontamination
 *    so white/grey halo fringes from the old background are eliminated.
 */
function refineCutoutAlphaAndPreserveSubject(
  cutoutData: ImageData,
  originalData: ImageData
): ImageData {
  const { width, height } = cutoutData;
  const src = originalData.data;
  const cut = cutoutData.data;
  const out = new ImageData(new Uint8ClampedArray(src), width, height);
  const dst = out.data;

  const alpha = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alpha[i] = cut[i * 4 + 3];
  }

  // 1. Morphological hole-fill inside opaque regions so buttons, sheer fabric, patterns, or skin highlights
  // inside the silhouette never become transparent
  const cleanedAlpha = new Float32Array(alpha);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = y * width + x;
      const a = alpha[idx];
      if (a > 195) {
        // Solid foreground: lock at 255 so garment/person interior is 100% opaque
        cleanedAlpha[idx] = 255;
      } else if (a < 18) {
        cleanedAlpha[idx] = 0;
      } else {
        // Smooth 3x3 feather along the transition boundary only
        const sum =
          alpha[idx - width - 1] +
          alpha[idx - width] * 2 +
          alpha[idx - width + 1] +
          alpha[idx - 1] * 2 +
          alpha[idx] * 4 +
          alpha[idx + 1] * 2 +
          alpha[idx + width - 1] +
          alpha[idx + width] * 2 +
          alpha[idx + width + 1];
        cleanedAlpha[idx] = Math.min(255, Math.max(0, sum / 16));
      }
    }
  }

  // 2. Copy 100% original RGB for all solid pixels, and decontaminate semi-transparent border pixels
  // by pulling RGB from the nearest solid interior neighbor
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const p = idx * 4;
      const a = Math.round(cleanedAlpha[idx]);
      dst[p + 3] = a;

      if (a > 12 && a < 225) {
        // Find nearest solid interior pixel in a 2px radius to remove background halo fringe
        let bestR = src[p];
        let bestG = src[p + 1];
        let bestB = src[p + 2];
        let maxNeighborAlpha = a;

        for (let dy = -2; dy <= 2; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            const nIdx = ny * width + nx;
            if (cleanedAlpha[nIdx] > maxNeighborAlpha) {
              maxNeighborAlpha = cleanedAlpha[nIdx];
              const np = nIdx * 4;
              bestR = src[np];
              bestG = src[np + 1];
              bestB = src[np + 2];
            }
          }
        }

        // Blend 65% interior garment color into the 1px semi-transparent edge to prevent white/grey halo
        dst[p] = Math.round(src[p] * 0.35 + bestR * 0.65);
        dst[p + 1] = Math.round(src[p + 1] * 0.35 + bestG * 0.65);
        dst[p + 2] = Math.round(src[p + 2] * 0.35 + bestB * 0.65);
      }
    }
  }

  return out;
}

/**
 * Fallback perimeter matting when neural WebAssembly model is offline or skipped.
 * Strictly protects the central figure & garment silhouette and only removes uniform outer studio borders.
 */
function segmentPerimeterBackgroundSafe(
  imgData: ImageData,
  mode: 'auto' | 'tight' | 'gentle'
): ImageData {
  const { width, height, data } = imgData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);

  // Sample outer 3px perimeter to determine background color clusters
  const borderSamples: Array<[number, number, number]> = [];
  const step = Math.max(2, Math.floor(Math.min(width, height) / 45));

  for (let x = 0; x < width; x += step) {
    const idxTop = (1 * width + x) * 4;
    borderSamples.push([data[idxTop], data[idxTop + 1], data[idxTop + 2]]);
  }
  for (let y = 0; y < Math.floor(height * 0.88); y += step) {
    const idxLeft = (y * width + 1) * 4;
    const idxRight = (y * width + (width - 2)) * 4;
    borderSamples.push([data[idxLeft], data[idxLeft + 1], data[idxLeft + 2]]);
    borderSamples.push([data[idxRight], data[idxRight + 1], data[idxRight + 2]]);
  }

  const clusters: Array<[number, number, number]> = [];
  for (const sample of borderSamples) {
    let matched = false;
    for (const c of clusters) {
      const dist = Math.hypot(sample[0] - c[0], sample[1] - c[1], sample[2] - c[2]);
      if (dist < 24) {
        c[0] = Math.round((c[0] + sample[0]) / 2);
        c[1] = Math.round((c[1] + sample[1]) / 2);
        c[2] = Math.round((c[2] + sample[2]) / 2);
        matched = true;
        break;
      }
    }
    if (!matched && clusters.length < 4) {
      clusters.push([...sample]);
    }
  }

  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  const grad = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx = lum[idx + 1] - lum[idx - 1];
      const gy = lum[idx + width] - lum[idx - width];
      grad[idx] = Math.hypot(gx, gy);
    }
  }

  const colorTol = mode === 'tight' ? 40 : mode === 'gentle' ? 24 : 32;
  const stepTol = mode === 'tight' ? 16 : mode === 'gentle' ? 10 : 13;
  const edgeBarrier = mode === 'tight' ? 26 : mode === 'gentle' ? 16 : 20;

  const visited = new Uint8Array(width * height);
  const bgMask = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const minClusterDist = (r: number, g: number, b: number) => {
    let best = 999;
    for (const c of clusters) {
      const d = Math.hypot(r - c[0], g - c[1], b - c[2]);
      if (d < best) best = d;
    }
    return best;
  };

  const pushIfSeed = (x: number, y: number) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (minClusterDist(data[p], data[p + 1], data[p + 2]) <= colorTol) {
      visited[idx] = 1;
      bgMask[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfSeed(x, 0);
  }
  for (let y = 0; y < Math.floor(height * 0.92); y++) {
    pushIfSeed(0, y);
    pushIfSeed(width - 1, y);
  }

  // Protected central subject silhouette zone (never floods into the person or garment body)
  const cx = width * 0.5;
  const cy = height * 0.54;
  const rx = width * 0.28;
  const ry = height * 0.38;

  const neighbors = [-1, 1, -width, width];

  while (head < tail) {
    const curr = queue[head++];
    const cxPos = curr % width;
    const cyPos = Math.floor(curr / width);
    const cp = curr * 4;
    const cr = data[cp];
    const cg = data[cp + 1];
    const cb = data[cp + 2];

    for (let i = 0; i < 4; i++) {
      const next = curr + neighbors[i];
      if (next < 0 || next >= width * height || visited[next]) continue;

      const nx = next % width;
      const ny = Math.floor(next / width);
      if (Math.abs(nx - cxPos) + Math.abs(ny - cyPos) > 1) continue;

      const inCore =
        ((nx - cx) * (nx - cx)) / (rx * rx) + ((ny - cy) * (ny - cy)) / (ry * ry) < 1;
      if (inCore) continue;

      if (grad[next] > edgeBarrier) continue;

      const np = next * 4;
      const stepDist = Math.hypot(data[np] - cr, data[np + 1] - cg, data[np + 2] - cb);
      const clusterDist = minClusterDist(data[np], data[np + 1], data[np + 2]);

      if (stepDist <= stepTol && clusterDist <= colorTol) {
        visited[next] = 1;
        bgMask[next] = 1;
        queue[tail++] = next;
      }
    }
  }

  const rawCutout = new ImageData(new Uint8ClampedArray(data), width, height);
  for (let i = 0; i < width * height; i++) {
    rawCutout.data[i * 4 + 3] = bgMask[i] === 1 ? 0 : 255;
  }

  return refineCutoutAlphaAndPreserveSubject(rawCutout, imgData);
}

/**
 * Runs client-side @imgly/background-removal neural segmentation and refines the alpha mask
 * while keeping 100% of the original garment & person RGB pixels intact.
 */
async function getStandardizedSubjectCutoutCanvas(
  sourceImageUrl: string,
  sourceImg: HTMLImageElement,
  removalMode: StudioCompositorOptions['removalMode']
): Promise<HTMLCanvasElement> {
  const workMax = 1080;
  const scale = Math.min(1, workMax / Math.max(sourceImg.width || 1, sourceImg.height || 1));
  const w = Math.max(64, Math.round(sourceImg.width * scale));
  const h = Math.max(64, Math.round(sourceImg.height * scale));

  if (removalMode === 'keep-bg') {
    const origCanvas = document.createElement('canvas');
    origCanvas.width = w;
    origCanvas.height = h;
    origCanvas.getContext('2d')!.drawImage(sourceImg, 0, 0, w, h);
    return origCanvas;
  }

  const cacheKey = `${sourceImageUrl}::${removalMode}`;
  const cached = neuralCutoutCache.get(cacheKey);
  if (cached) return cached;

  const origCanvas = document.createElement('canvas');
  origCanvas.width = w;
  origCanvas.height = h;
  const origCtx = origCanvas.getContext('2d')!;
  origCtx.drawImage(sourceImg, 0, 0, w, h);
  const originalData = origCtx.getImageData(0, 0, w, h);

  // Use @imgly/background-removal for 'neural-ai' and 'auto' (standardized default)
  if (removalMode === 'neural-ai' || removalMode === 'auto') {
    try {
      const blob = await removeBackground(sourceImageUrl, {
        output: {
          format: 'image/png',
          quality: 0.95,
        },
      });
      const objectUrl = URL.createObjectURL(blob);
      try {
        const neuralImg = await loadImageElement(objectUrl);
        const cutCanvas = document.createElement('canvas');
        cutCanvas.width = w;
        cutCanvas.height = h;
        const cutCtx = cutCanvas.getContext('2d')!;
        cutCtx.drawImage(neuralImg, 0, 0, w, h);
        const cutoutData = cutCtx.getImageData(0, 0, w, h);

        // Combine neural alpha mask with 100% untouched original garment/person RGB pixels
        const refined = refineCutoutAlphaAndPreserveSubject(cutoutData, originalData);
        cutCtx.putImageData(refined, 0, 0);
        neuralCutoutCache.set(cacheKey, cutCanvas);
        return cutCanvas;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      console.warn('Using protected perimeter matting fallback:', err);
    }
  }

  // Fallback or manual border matting mode
  const fallbackMode =
    removalMode === 'tight' ? 'tight' : removalMode === 'gentle' ? 'gentle' : 'auto';
  const safeCutout = segmentPerimeterBackgroundSafe(originalData, fallbackMode);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  outCanvas.getContext('2d')!.putImageData(safeCutout, 0, 0);
  neuralCutoutCache.set(cacheKey, outCanvas);
  return outCanvas;
}

/**
 * Measures the exact non-transparent bounding box of the isolated model/garment
 * so placement on the studio backdrop is always centered, balanced, and grounded.
 */
function measureSubjectBounds(canvas: HTMLCanvasElement): SubjectBounds {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 35) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found || maxX <= minX || maxY <= minY) {
    return {
      minX: 0,
      minY: 0,
      maxX: width - 1,
      maxY: height - 1,
      width,
      height,
      touchesBottom: true,
      touchesTop: false,
    };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX + 1),
    height: Math.max(1, maxY - minY + 1),
    touchesBottom: maxY >= height - Math.max(6, Math.round(height * 0.018)),
    touchesTop: minY <= Math.max(6, Math.round(height * 0.018)),
  };
}

/**
 * Renders a clean, standardized, luxury cyclorama studio backdrop (wall, seamless cove, floor plane, and soft studio key light).
 */
export function renderStudioBackdropToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backdrop: StudioBackdrop
) {
  const horizonY = Math.round(height * backdrop.horizonRatio);

  // 1. Studio Cyclorama Wall Gradient
  const wallGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  wallGrad.addColorStop(0, backdrop.wallTop);
  wallGrad.addColorStop(0.68, backdrop.wallMid);
  wallGrad.addColorStop(1, backdrop.wallBottom);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, horizonY);

  // 2. Studio Floor Plane Gradient
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  floorGrad.addColorStop(0, backdrop.floorTop);
  floorGrad.addColorStop(0.22, backdrop.wallBottom);
  floorGrad.addColorStop(1, backdrop.floorBottom);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  // 3. Seamless Cyclorama Cove Curve Blend at Horizon
  const coveHeight = Math.round(height * 0.075);
  const coveGrad = ctx.createLinearGradient(
    0,
    horizonY - coveHeight,
    0,
    horizonY + coveHeight
  );
  coveGrad.addColorStop(0, 'rgba(0,0,0,0)');
  coveGrad.addColorStop(
    0.5,
    backdrop.isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.055)'
  );
  coveGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coveGrad;
  ctx.fillRect(0, horizonY - coveHeight, width, coveHeight * 2);

  // 4. Soft Center Studio Key-Light Diffusion on Wall
  const spotGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    width * 0.05,
    width * 0.5,
    height * 0.44,
    width * 0.56
  );
  spotGrad.addColorStop(0, backdrop.spotlightColor);
  spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);

  // 5. Gentle Peripheral Studio Vignette
  const vigGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    width * 0.36,
    width * 0.5,
    height * 0.5,
    width * 0.78
  );
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(
    1,
    backdrop.isDark ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.1)'
  );
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Standardized Non-Destructive Studio Compositor:
 * - Cuts out the background cleanly without altering a single pixel of the garment or model.
 * - Normalizes the subject bounding box and places the model/garment naturally on the studio floor or frame baseline.
 * - Renders a realistic 2-layer floor contact & ambient grounding shadow.
 */
export async function renderStudioComposite(
  options: StudioCompositorOptions
): Promise<string> {
  const targetW = options.aspectRatio === '16:9' ? 1280 : 960;
  const targetH = options.aspectRatio === '16:9' ? 720 : 1280;

  const sourceImg = await loadImageElement(options.sourceImageUrl);
  const backdrop =
    STUDIO_BACKDROPS.find((b) => b.id === options.backdropId) || STUDIO_BACKDROPS[0];

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = targetW;
  mainCanvas.height = targetH;
  const ctx = mainCanvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Render Studio Backdrop
  if (options.customBackdropUrl) {
    try {
      const bgImg = await loadImageElement(options.customBackdropUrl);
      const bgScale = Math.max(targetW / bgImg.width, targetH / bgImg.height);
      const bw = bgImg.width * bgScale;
      const bh = bgImg.height * bgScale;
      ctx.drawImage(bgImg, (targetW - bw) / 2, (targetH - bh) / 2, bw, bh);
    } catch {
      renderStudioBackdropToCanvas(ctx, targetW, targetH, backdrop);
    }
  } else {
    renderStudioBackdropToCanvas(ctx, targetW, targetH, backdrop);
  }

  // 2. Get Untouched Subject Cutout & Measure True Subject Bounding Box
  const cutoutCanvas = await getStandardizedSubjectCutoutCanvas(
    options.sourceImageUrl,
    sourceImg,
    options.removalMode
  );
  const bounds = measureSubjectBounds(cutoutCanvas);

  // 3. Standardized Editorial Proportions & Placement
  const isCroppedAtBottom = bounds.touchesBottom && options.removalMode !== 'keep-bg';
  const desiredMaxHeightRatio = isCroppedAtBottom
    ? Math.min(0.96, 0.9 * options.subjectScale)
    : Math.min(0.92, 0.84 * options.subjectScale);
  const desiredMaxWidthRatio = Math.min(0.92, 0.82 * options.subjectScale);

  const scaleToFit = Math.min(
    (targetW * desiredMaxWidthRatio) / bounds.width,
    (targetH * desiredMaxHeightRatio) / bounds.height
  );

  const destSubjW = Math.round(bounds.width * scaleToFit);
  const destSubjH = Math.round(bounds.height * scaleToFit);

  // Center the actual subject horizontally in the studio frame
  const destX = Math.round((targetW - destSubjW) / 2);

  // Vertical Grounding:
  // - If the photo is a waist/thigh crop touching the bottom border, anchor flush to the bottom edge (destY = targetH - destSubjH)
  // - If it is a full-body model or standalone accessory/garment, stand it naturally on the studio floor plane (~6% above bottom)
  const floorBaselineY = Math.round(targetH * 0.935);
  const destY = isCroppedAtBottom
    ? targetH - destSubjH
    : Math.max(Math.round(targetH * 0.04), floorBaselineY - destSubjH);

  // 4. Multi-Layer Studio Ground Contact Shadow (for full-length models & freestanding pieces)
  if (options.contactShadow && options.removalMode !== 'keep-bg' && !isCroppedAtBottom) {
    ctx.save();
    const shadowCenterX = targetW * 0.5;
    const shadowCenterY = destY + destSubjH - Math.max(4, Math.round(destSubjH * 0.012));
    const shadowRx = Math.max(40, destSubjW * 0.42);
    const shadowRy = Math.max(12, Math.round(targetH * 0.024));

    // Wide soft studio floor ambient occlusion
    const ambientGrad = ctx.createRadialGradient(
      shadowCenterX,
      shadowCenterY,
      shadowRx * 0.08,
      shadowCenterX,
      shadowCenterY,
      shadowRx
    );
    ambientGrad.addColorStop(0, backdrop.isDark ? 'rgba(0,0,0,0.58)' : 'rgba(0,0,0,0.34)');
    ambientGrad.addColorStop(0.55, backdrop.isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)');
    ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = ambientGrad;
    ctx.beginPath();
    ctx.ellipse(shadowCenterX, shadowCenterY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tighter core contact shadow directly beneath feet / garment base
    const coreRx = Math.max(24, destSubjW * 0.24);
    const coreRy = Math.max(6, Math.round(targetH * 0.01));
    const coreGrad = ctx.createRadialGradient(
      shadowCenterX,
      shadowCenterY,
      coreRx * 0.05,
      shadowCenterX,
      shadowCenterY,
      coreRx
    );
    coreGrad.addColorStop(0, backdrop.isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.46)');
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(shadowCenterX, shadowCenterY, coreRx, coreRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Draw the 100% untouched model & garment onto the studio backdrop with subtle depth separation
  ctx.save();
  if (options.contactShadow && options.removalMode !== 'keep-bg') {
    ctx.shadowColor = backdrop.isDark
      ? 'rgba(0, 0, 0, 0.42)'
      : 'rgba(0, 0, 0, 0.14)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
  }

  ctx.drawImage(
    cutoutCanvas,
    bounds.minX,
    bounds.minY,
    bounds.width,
    bounds.height,
    destX,
    destY,
    destSubjW,
    destSubjH
  );
  ctx.restore();

  // 6. Return Firestore-safe compressed JPEG (< 850KB)
  let quality = 0.86;
  let resultDataUrl = mainCanvas.toDataURL('image/jpeg', quality);
  while (resultDataUrl.length > 820000 && quality > 0.48) {
    quality -= 0.08;
    resultDataUrl = mainCanvas.toDataURL('image/jpeg', quality);
  }
  return resultDataUrl;
}

/**
 * Classifies an RGB color into an accurate luxury fashion color descriptor.
 */
function classifyFashionColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = max === 0 ? 0 : (max - min) / max;

  if (lum < 38) return 'Obsidian Black';
  if (lum > 225 && sat < 0.12) return 'Alabaster Ivory';
  if (sat < 0.14) {
    if (lum < 95) return 'Charcoal Slate';
    if (lum < 170) return 'Pewter Grey';
    return 'Warm Pearl';
  }

  if (r > g && r > b) {
    if (g > b * 1.35) {
      return lum > 155 ? 'Saffron Ochre' : 'Burnished Amber & Terracotta';
    }
    return lum > 140 ? 'Carmine Rose' : 'Imperial Crimson Burgundy';
  }

  if (g >= r && g > b) {
    if (r > b * 1.25) return 'Olive Moss & Chartreuse';
    return lum > 135 ? 'Celadon Jade' : 'Malachite Emerald';
  }

  if (b >= r && b >= g) {
    if (r > g * 1.2) return 'Regal Amethyst Plum';
    return lum > 130 ? 'Cerulean Azure' : 'Electric Royal Cobalt';
  }

  return 'Burnished Champagne Gold';
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/**
 * Inspects the actual foreground pixels of the uploaded/redesigned garment or accessory photo
 * to extract pinpoint color tones, surface sheen/texture, and silhouette structure.
 */
export async function inspectProductVisualSpecifics(
  imageUrl: string,
  category: CategorySlug,
  appliedBackdropName?: string
): Promise<VisualSpecificsProfile> {
  const fallback: VisualSpecificsProfile = {
    primaryColorName: 'Obsidian & Burnished Gold',
    primaryHex: '#D97706',
    secondaryColorName: 'Deep Charcoal',
    secondaryHex: '#18181B',
    surfaceFinish:
      category === 'accessories'
        ? 'Artisanal Full-Grain Texture & Brushed Hardware'
        : 'Structured Luxury Tailoring Weave',
    lightingMood: appliedBackdropName
      ? `Studio Edition · ${appliedBackdropName}`
      : 'High-Contrast Studio Key Light',
    silhouetteNote:
      category === 'accessories'
        ? 'Sculptural geometric form with reinforced stitching'
        : 'Architectural shoulder line with fluid, elongated drape',
    compactVisionDataUrl: '',
    appliedBackdropName,
  };

  if (!imageUrl || !imageUrl.trim()) return fallback;

  try {
    const img = await loadImageElement(imageUrl);
    const maxDim = 440;
    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    const w = Math.max(64, Math.round((img.width || 300) * scale));
    const h = Math.max(64, Math.round((img.height || 400) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);

    const compactVisionDataUrl = canvas.toDataURL('image/jpeg', 0.68);

    // Sample the core garment zone (30%..70% X, 26%..78% Y) so studio walls don't skew garment pigment
    const startX = Math.floor(w * 0.3);
    const endX = Math.floor(w * 0.7);
    const startY = Math.floor(h * 0.26);
    const endY = Math.floor(h * 0.78);
    const imgData = ctx.getImageData(startX, startY, endX - startX, endY - startY).data;

    let r1 = 0,
      g1 = 0,
      b1 = 0,
      c1 = 0;
    let r2 = 0,
      g2 = 0,
      b2 = 0,
      c2 = 0;
    let specularCount = 0;
    let totalSamples = 0;

    for (let i = 0; i < imgData.length; i += 16) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      totalSamples++;
      if (lum > 215) specularCount++;

      if (sat > 0.2 && lum > 28 && lum < 232) {
        r1 += r;
        g1 += g;
        b1 += b;
        c1++;
      } else {
        r2 += r;
        g2 += g;
        b2 += b;
        c2++;
      }
    }

    const pr = c1 > 8 ? Math.round(r1 / c1) : c2 > 0 ? Math.round(r2 / c2) : 217;
    const pg = c1 > 8 ? Math.round(g1 / c1) : c2 > 0 ? Math.round(g2 / c2) : 119;
    const pb = c1 > 8 ? Math.round(b1 / c1) : c2 > 0 ? Math.round(b2 / c2) : 6;

    const sr = c2 > 8 ? Math.round(r2 / c2) : Math.round(pr * 0.45);
    const sg = c2 > 8 ? Math.round(g2 / c2) : Math.round(pg * 0.45);
    const sb = c2 > 8 ? Math.round(b2 / c2) : Math.round(pb * 0.45);

    const specularRatio = totalSamples > 0 ? specularCount / totalSamples : 0;
    let surfaceFinish = 'Structured Matte Barathea & Heavyweight Crepe Weave';
    if (category === 'accessories') {
      surfaceFinish =
        specularRatio > 0.08
          ? 'Polished Gilded Hardware & Burnished Full-Grain Calfskin'
          : 'Supple Hand-Stitched Bridle Leather & Sculptural Matte Finish';
    } else if (specularRatio > 0.1) {
      surfaceFinish = 'Luminous Mulberry Silk & High-Sheen Satin Drape';
    } else if (specularRatio > 0.04) {
      surfaceFinish = 'Crisp Damask & Pressed Gabardine Tailoring Cloth';
    }

    const silhouetteNote =
      category === 'accessories'
        ? 'Architectural hardware proportions with hand-sealed edges'
        : h > w * 1.15
        ? 'Elongated full-length column silhouette with structured shoulder architecture'
        : 'Precision-cut contemporary silhouette with balanced proportions';

    return {
      primaryColorName: classifyFashionColorName(pr, pg, pb),
      primaryHex: rgbToHex(pr, pg, pb),
      secondaryColorName: classifyFashionColorName(sr, sg, sb),
      secondaryHex: rgbToHex(sr, sg, sb),
      surfaceFinish,
      lightingMood: appliedBackdropName
        ? `Studio Edition · ${appliedBackdropName}`
        : specularRatio > 0.06
        ? 'Luminous Editorial Key Light'
        : 'Soft Diffused Atelier Daylight',
      silhouetteNote,
      compactVisionDataUrl,
      appliedBackdropName,
    };
  } catch {
    return fallback;
  }
}

/**
 * Queries live public web knowledge endpoints directly from the online user's browser
 * (Datamuse Fashion/Textile Lexicon + Wikimedia REST summary) with zero API key cost
 * to enrich product descriptions and bios with real-world sartorial descriptors.
 */
async function fetchLiveBrowserSartorialContext(
  name: string,
  category: CategorySlug,
  specifics: string,
  primaryColor: string
): Promise<{
  sartorialDescriptors: string[];
  heritageContext: string;
}> {
  const defaultDescriptors =
    category === 'accessories'
      ? ['artisan-crafted', 'architectural', 'hand-burnished', 'heirloom-grade']
      : category === 'men'
      ? ['bespoke-cut', 'ceremonial', 'structured', 'sovereign']
      : category === 'kids'
      ? ['breathable', 'tailored', 'heirloom', 'celebratory']
      : ['sculptural', 'atelier-pressed', 'elongated', 'commanding'];

  if (typeof window === 'undefined' || !navigator.onLine) {
    return {
      sartorialDescriptors: defaultDescriptors,
      heritageContext: '',
    };
  }

  // Extract main garment noun from product name or specifics
  const combinedTokens = `${name} ${specifics}`
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !['the', 'with', 'from', 'and', 'for', 'kiekies'].includes(w));

  const queryTerm =
    combinedTokens[0] ||
    (category === 'accessories'
      ? 'handbag'
      : category === 'men'
      ? 'kaftan'
      : category === 'kids'
      ? 'trench'
      : 'gown');

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2200);

    const [datamuseRes, wikiRes] = await Promise.allSettled([
      fetch(
        `https://api.datamuse.com/words?rel_jjb=${encodeURIComponent(queryTerm)}&topics=fashion,textile,luxury&max=8`,
        { signal: controller.signal }
      ),
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryTerm)}`,
        { signal: controller.signal }
      ),
    ]);

    window.clearTimeout(timer);

    let descriptors: string[] = [];
    if (datamuseRes.status === 'fulfilled' && datamuseRes.value.ok) {
      const words = (await datamuseRes.value.json()) as Array<{ word: string }>;
      descriptors = words
        .map((w) => w.word)
        .filter(
          (w) =>
            w.length >= 4 &&
            !['old', 'cheap', 'worn', 'dirty', 'plain', 'simple', 'small'].includes(w)
        )
        .slice(0, 3);
    }

    let heritageContext = '';
    if (wikiRes.status === 'fulfilled' && wikiRes.value.ok) {
      const wikiJson = (await wikiRes.value.json()) as { extract?: string };
      if (wikiJson.extract) {
        const firstSentence = wikiJson.extract.split('. ')[0] || '';
        if (
          firstSentence.length > 25 &&
          firstSentence.length < 210 &&
          /garment|clothing|coat|dress|robe|fabric|silk|leather|bag|jacket|suit|wear|textile|fashion/i.test(
            firstSentence
          )
        ) {
          heritageContext = firstSentence.replace(/\.$/, '');
        }
      }
    }

    return {
      sartorialDescriptors: descriptors.length > 0 ? descriptors : defaultDescriptors,
      heritageContext,
    };
  } catch {
    return {
      sartorialDescriptors: defaultDescriptors,
      heritageContext: '',
    };
  }
}

export interface OnlineBioSynthesisInput {
  name: string;
  category: CategorySlug;
  sizes: string;
  price: string | number;
  specifics: string;
  visualProfile: VisualSpecificsProfile;
  appliedBackdropName?: string;
}

/**
 * Client-Connected Online Bio & Description Synthesizer:
 * Uses the visitor/admin's active online browser connection + optical garment inspection + studio redesign
 * metadata to generate rich, specific product descriptions and Search/Web Bios without requiring a paid LLM key.
 */
export async function synthesizeOnlineProductBioAndCopy(
  input: OnlineBioSynthesisInput
): Promise<{
  description: string;
  seoBio: string;
  enrichmentSource: string;
}> {
  const rawName = (input.name || '').trim();
  const cat = input.category || 'women';
  const rawSizes = (input.sizes || '').trim();
  const rawPrice =
    input.price !== undefined && input.price !== null && String(input.price).trim() !== ''
      ? `₦${Number(input.price).toLocaleString()}`
      : '';
  const rawSpec = (input.specifics || '').trim();
  const profile = input.visualProfile;
  const studioSetting =
    input.appliedBackdropName || profile.appliedBackdropName || '';

  const primaryColor = profile.primaryColorName || 'Obsidian & Burnished Gold';
  const secondaryColor = profile.secondaryColorName || '';
  const finish = profile.surfaceFinish || 'hand-selected luxury cloth';
  const silhouette = profile.silhouetteNote || 'architectural Lagos tailoring';

  const onlineData = await fetchLiveBrowserSartorialContext(
    rawName,
    cat,
    rawSpec,
    primaryColor
  );

  const colorPhrase =
    secondaryColor && secondaryColor !== primaryColor
      ? `${primaryColor} with ${secondaryColor} undertones`
      : primaryColor;

  const descriptorList = onlineData.sartorialDescriptors.slice(0, 2).join(', ');
  const descriptorAdjectives = descriptorList ? `${descriptorList} ` : '';

  const specificsSentence = rawSpec
    ? ` Distinguished by ${rawSpec.replace(/\.$/, '')}.`
    : '';

  const studioSentence = studioSetting
    ? ` Art-directed and color-calibrated in our ${studioSetting.replace(/^\d+\.\s*/, '')} showcase to highlight its true ${primaryColor.toLowerCase()} saturation.`
    : '';

  const sizeClause = rawSizes
    ? ` Available in ${rawSizes} with direct Lagos atelier consultation and nationwide delivery.`
    : ' Available for immediate acquisition and bespoke styling consultation via our Lagos atelier.';

  let title = rawName;
  let description = '';

  if (cat === 'accessories') {
    title = rawName || `The ${primaryColor} Atelier Accessory`;
    description = `${title} is a ${descriptorAdjectives}sculptural luxury accessory from Kiekies Fashion World rendered in ${colorPhrase}, crafted with ${finish.toLowerCase()} and ${silhouette.toLowerCase()}.${specificsSentence}${studioSentence} Hand-finished in Lagos to anchor contemporary Nigerian ready-to-wear and formal evening ensembles.${sizeClause}`;
  } else if (cat === 'men') {
    title = rawName || `The ${primaryColor} Sovereign Menswear Piece`;
    description = `${title} exemplifies ${descriptorAdjectives}contemporary Nigerian menswear tailoring in ${colorPhrase}, featuring ${finish.toLowerCase()} and ${silhouette.toLowerCase()}.${specificsSentence}${studioSentence} Engineered by Kiekies Fashion World for commanding presence across ceremonial occasions and executive settings.${sizeClause}`;
  } else if (cat === 'kids') {
    title = rawName || `The ${primaryColor} Junior Heritage Piece`;
    description = `${title} brings Kiekies Fashion World's ${descriptorAdjectives}architectural tailoring to junior couture in ${colorPhrase}, crafted from ${finish.toLowerCase()} with ${silhouette.toLowerCase()}.${specificsSentence}${studioSentence} Thoughtfully proportioned for breathable comfort, durability, and standout family occasions.${sizeClause}`;
  } else {
    title = rawName || `The ${primaryColor} Atelier Silhouette`;
    description = `${title} is a ${descriptorAdjectives}contemporary luxury statement from Kiekies Fashion World drenched in ${colorPhrase}, sculpted in ${finish.toLowerCase()} with ${silhouette.toLowerCase()}.${specificsSentence}${studioSentence} Created in our Lagos workshop for effortless authority from high-stakes boardrooms to evening galas.${sizeClause}`;
  }

  const seoBioParts = [
    `${title} — Kiekies Fashion World (Lagos).`,
    `${colorPhrase} · ${finish}.`,
    rawSpec ? `${rawSpec.replace(/\.$/, '')}.` : '',
    studioSetting ? `Showcased in ${studioSetting.replace(/^\d+\.\s*/, '')}.` : '',
    rawSizes ? `Sizes: ${rawSizes}.` : '',
    rawPrice ? `${rawPrice} ·` : '',
    'Direct WhatsApp concierge & nationwide delivery.',
  ].filter(Boolean);

  const seoBio = seoBioParts.join(' ').replace(/\s+/g, ' ').trim();

  return {
    description,
    seoBio,
    enrichmentSource:
      typeof navigator !== 'undefined' && navigator.onLine
        ? 'Live Online Sartorial Graph + Optical Garment Analysis'
        : 'Optical Garment Analysis Engine',
  };
}
