import { removeBackground } from '@imgly/background-removal';
import { CategorySlug } from '../types';

const neuralCutoutCache = new Map<string, ImageBitmap | HTMLImageElement>();

function parseHexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16) || 240,
      parseInt(clean.slice(2, 4), 16) || 236,
      parseInt(clean.slice(4, 6), 16) || 228,
    ];
  }
  return [240, 236, 228];
}

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
  rimLightColor: string;
  horizonRatio: number; // 0.72 to 0.84
  textureType: 'cyclorama' | 'plaster' | 'concrete' | 'travertine' | 'runway' | 'linen' | 'arch';
}

export const STUDIO_BACKDROPS: StudioBackdrop[] = [
  // 1-5: Luxury Studio
  {
    id: 'ivory-cyclorama',
    name: '01. Warm Ivory Cyclorama',
    group: 'studio',
    subtitle: 'Classic Vogue e-commerce infinity wall',
    wallTop: '#F7F4EE',
    wallMid: '#EFECE4',
    wallBottom: '#E3DEC9',
    floorTop: '#DCD6C4',
    floorBottom: '#EAE6DC',
    spotlightColor: 'rgba(255, 252, 245, 0.65)',
    rimLightColor: 'rgba(255, 248, 231, 0.35)',
    horizonRatio: 0.78,
    textureType: 'cyclorama',
  },
  {
    id: 'obsidian-matte',
    name: '02. Obsidian Editorial Matte',
    group: 'studio',
    subtitle: 'Kiekies signature dark studio with warm key light',
    wallTop: '#0B0B0C',
    wallMid: '#151518',
    wallBottom: '#0E0E10',
    floorTop: '#121215',
    floorBottom: '#08080A',
    spotlightColor: 'rgba(245, 158, 11, 0.18)',
    rimLightColor: 'rgba(251, 191, 36, 0.28)',
    horizonRatio: 0.78,
    textureType: 'cyclorama',
  },
  {
    id: 'pure-white-studio',
    name: '03. Crisp Pure White Catalog',
    group: 'studio',
    subtitle: 'High-key commercial white cyclorama',
    wallTop: '#FFFFFF',
    wallMid: '#FBFBFB',
    wallBottom: '#F2F2F2',
    floorTop: '#EBEBEB',
    floorBottom: '#F9F9F9',
    spotlightColor: 'rgba(255, 255, 255, 0.8)',
    rimLightColor: 'rgba(255, 255, 255, 0.4)',
    horizonRatio: 0.79,
    textureType: 'cyclorama',
  },
  {
    id: 'dove-grey-infinity',
    name: '04. Soft Dove Grey Infinity',
    group: 'studio',
    subtitle: 'Neutral cool-grey luxury lookbook wall',
    wallTop: '#D8DADF',
    wallMid: '#C6C9D0',
    wallBottom: '#B2B6BF',
    floorTop: '#A8ACB5',
    floorBottom: '#C4C7CE',
    spotlightColor: 'rgba(255, 255, 255, 0.45)',
    rimLightColor: 'rgba(241, 245, 249, 0.3)',
    horizonRatio: 0.78,
    textureType: 'cyclorama',
  },
  {
    id: 'champagne-silk',
    name: '05. Champagne Silk Salon',
    group: 'studio',
    subtitle: 'Luminous warm gold-champagne studio',
    wallTop: '#F3E9D7',
    wallMid: '#E6D6BC',
    wallBottom: '#D4BE9B',
    floorTop: '#C5AC87',
    floorBottom: '#DFCEAFA',
    spotlightColor: 'rgba(254, 243, 199, 0.55)',
    rimLightColor: 'rgba(245, 158, 11, 0.25)',
    horizonRatio: 0.77,
    textureType: 'linen',
  },

  // 6-10: Editorial & Runway
  {
    id: 'lagos-gallery',
    name: '06. Lagos Editorial Runway',
    group: 'editorial',
    subtitle: 'Victoria Island contemporary runway & amber key light',
    wallTop: '#161311',
    wallMid: '#241E1A',
    wallBottom: '#181412',
    floorTop: '#2A221D',
    floorBottom: '#120F0D',
    spotlightColor: 'rgba(234, 88, 12, 0.24)',
    rimLightColor: 'rgba(245, 158, 11, 0.35)',
    horizonRatio: 0.76,
    textureType: 'runway',
  },
  {
    id: 'midnight-runway',
    name: '07. Midnight Velvet Runway',
    group: 'editorial',
    subtitle: 'High-contrast fashion week beam on dark slate',
    wallTop: '#07090E',
    wallMid: '#101520',
    wallBottom: '#090C12',
    floorTop: '#141A26',
    floorBottom: '#06080C',
    spotlightColor: 'rgba(148, 163, 184, 0.22)',
    rimLightColor: 'rgba(226, 232, 240, 0.32)',
    horizonRatio: 0.76,
    textureType: 'runway',
  },
  {
    id: 'chiaroscuro-spotlight',
    name: '08. Chiaroscuro Halo Spotlight',
    group: 'editorial',
    subtitle: 'Dramatic circular theater halo on charcoal',
    wallTop: '#121110',
    wallMid: '#262320',
    wallBottom: '#141210',
    floorTop: '#1F1C19',
    floorBottom: '#0E0D0C',
    spotlightColor: 'rgba(253, 230, 138, 0.28)',
    rimLightColor: 'rgba(251, 191, 36, 0.3)',
    horizonRatio: 0.78,
    textureType: 'cyclorama',
  },
  {
    id: 'cobalt-editorial',
    name: '09. Imperial Cobalt Editorial',
    group: 'editorial',
    subtitle: 'Deep indigo-cobalt editorial wash for warm tones',
    wallTop: '#0C162C',
    wallMid: '#152548',
    wallBottom: '#0E1A33',
    floorTop: '#16284C',
    floorBottom: '#091122',
    spotlightColor: 'rgba(96, 165, 250, 0.22)',
    rimLightColor: 'rgba(191, 219, 254, 0.3)',
    horizonRatio: 0.78,
    textureType: 'cyclorama',
  },
  {
    id: 'crimson-gala',
    name: '10. Crimson Gala Portrait',
    group: 'editorial',
    subtitle: 'Deep carmine-burgundy eveningwear studio',
    wallTop: '#22090E',
    wallMid: '#3B1019',
    wallBottom: '#260A10',
    floorTop: '#330E16',
    floorBottom: '#160509',
    spotlightColor: 'rgba(251, 113, 133, 0.2)',
    rimLightColor: 'rgba(253, 164, 175, 0.28)',
    horizonRatio: 0.78,
    textureType: 'cyclorama',
  },

  // 11-15: Architectural & Gallery
  {
    id: 'travertine-stone',
    name: '11. Raw Travertine Limestone',
    group: 'architectural',
    subtitle: 'Italian travertine stone wall with gallery plinth',
    wallTop: '#EAE2D3',
    wallMid: '#DDD2BE',
    wallBottom: '#CFC1A8',
    floorTop: '#C2B297',
    floorBottom: '#D6C8B0',
    spotlightColor: 'rgba(255, 250, 240, 0.5)',
    rimLightColor: 'rgba(254, 243, 199, 0.3)',
    horizonRatio: 0.76,
    textureType: 'travertine',
  },
  {
    id: 'brutalist-concrete',
    name: '12. Sunlit Brutalist Concrete',
    group: 'architectural',
    subtitle: 'Architectural cast concrete with diagonal daylight',
    wallTop: '#CECFD2',
    wallMid: '#B8B9BD',
    wallBottom: '#A2A4A9',
    floorTop: '#94969B',
    floorBottom: '#B0B2B6',
    spotlightColor: 'rgba(255, 255, 255, 0.48)',
    rimLightColor: 'rgba(255, 255, 255, 0.3)',
    horizonRatio: 0.76,
    textureType: 'concrete',
  },
  {
    id: 'venetian-plaster',
    name: '13. Venetian Plaster Archway',
    group: 'architectural',
    subtitle: 'Hand-troweled warm stucco with subtle arch shadow',
    wallTop: '#EFE6D8',
    wallMid: '#E3D5C1',
    wallBottom: '#D4C3AA',
    floorTop: '#C6B296',
    floorBottom: '#DBCBB4',
    spotlightColor: 'rgba(255, 247, 237, 0.55)',
    rimLightColor: 'rgba(254, 215, 170, 0.3)',
    horizonRatio: 0.75,
    textureType: 'arch',
  },
  {
    id: 'alabaster-museum',
    name: '14. Alabaster Museum Salon',
    group: 'architectural',
    subtitle: 'Sculptural white-stone museum gallery with skylight',
    wallTop: '#F4F3EF',
    wallMid: '#E8E6DF',
    wallBottom: '#DAD7CE',
    floorTop: '#CBC7BC',
    floorBottom: '#E2DFD7',
    spotlightColor: 'rgba(255, 255, 255, 0.6)',
    rimLightColor: 'rgba(255, 255, 255, 0.35)',
    horizonRatio: 0.77,
    textureType: 'plaster',
  },
  {
    id: 'emerald-salon',
    name: '15. Malachite Emerald Salon',
    group: 'architectural',
    subtitle: 'Deep architectural jewel-green salon wall',
    wallTop: '#091E18',
    wallMid: '#103329',
    wallBottom: '#0B241D',
    floorTop: '#122E25',
    floorBottom: '#071712',
    spotlightColor: 'rgba(52, 211, 153, 0.18)',
    rimLightColor: 'rgba(167, 243, 208, 0.25)',
    horizonRatio: 0.78,
    textureType: 'plaster',
  },

  // 16-20: Outdoor & Warm Heritage
  {
    id: 'terracotta-courtyard',
    name: '16. Sahara Terracotta Courtyard',
    group: 'warm',
    subtitle: 'Sun-baked clay courtyard wall with golden bounce',
    wallTop: '#C87D55',
    wallMid: '#B56942',
    wallBottom: '#9E5632',
    floorTop: '#8C4A28',
    floorBottom: '#AD623C',
    spotlightColor: 'rgba(254, 215, 170, 0.38)',
    rimLightColor: 'rgba(253, 186, 116, 0.35)',
    horizonRatio: 0.76,
    textureType: 'arch',
  },
  {
    id: 'golden-hour-terrace',
    name: '17. Golden Hour Penthouse',
    group: 'warm',
    subtitle: 'Warm sunset amber horizon glow',
    wallTop: '#FDE68A',
    wallMid: '#F59E0B',
    wallBottom: '#B45309',
    floorTop: '#78350F',
    floorBottom: '#92400E',
    spotlightColor: 'rgba(254, 243, 199, 0.5)',
    rimLightColor: 'rgba(253, 224, 71, 0.4)',
    horizonRatio: 0.75,
    textureType: 'runway',
  },
  {
    id: 'warm-linen',
    name: '18. Organic Oatmeal Linen',
    group: 'warm',
    subtitle: 'Woven raw oatmeal linen studio backdrop',
    wallTop: '#EBE3D5',
    wallMid: '#DED3C0',
    wallBottom: '#CFC1AA',
    floorTop: '#C1B097',
    floorBottom: '#D6C9B4',
    spotlightColor: 'rgba(255, 251, 235, 0.5)',
    rimLightColor: 'rgba(254, 243, 199, 0.3)',
    horizonRatio: 0.78,
    textureType: 'linen',
  },
  {
    id: 'brushed-bronze',
    name: '19. Brushed Bronze Atelier',
    group: 'warm',
    subtitle: 'Warm metallic umber-bronze tailoring lounge',
    wallTop: '#2A211B',
    wallMid: '#3D3027',
    wallBottom: '#261E18',
    floorTop: '#332820',
    floorBottom: '#1C1511',
    spotlightColor: 'rgba(251, 191, 36, 0.22)',
    rimLightColor: 'rgba(252, 211, 77, 0.3)',
    horizonRatio: 0.78,
    textureType: 'plaster',
  },
  {
    id: 'rosewood-atelier',
    name: '20. Rosewood Bespoke Fitting Room',
    group: 'warm',
    subtitle: 'Rich mahogany-rosewood private client suite',
    wallTop: '#281512',
    wallMid: '#3C201C',
    wallBottom: '#241310',
    floorTop: '#311A16',
    floorBottom: '#180C0A',
    spotlightColor: 'rgba(251, 146, 60, 0.22)',
    rimLightColor: 'rgba(253, 186, 116, 0.28)',
    horizonRatio: 0.77,
    textureType: 'plaster',
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
  subjectScale: number; // 0.85 to 1.08
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
 * Runs client-side @imgly/background-removal in the browser (free, zero API cost)
 * and caches the transparent cutout per source image so switching among the 20 backdrops is instant.
 */
async function getNeuralBackgroundCutout(
  sourceImageUrl: string
): Promise<HTMLImageElement | ImageBitmap> {
  const cached = neuralCutoutCache.get(sourceImageUrl);
  if (cached) return cached;

  const blob = await removeBackground(sourceImageUrl, {
    output: {
      format: 'image/png',
      quality: 0.92,
    },
  });
  const objectUrl = URL.createObjectURL(blob);
  const cutoutImg = await loadImageElement(objectUrl);
  neuralCutoutCache.set(sourceImageUrl, cutoutImg);
  return cutoutImg;
}

/**
 * Draws the procedural high-fashion studio backdrop onto the given canvas context.
 */
export function renderStudioBackdropToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backdrop: StudioBackdrop
) {
  const horizonY = Math.round(height * backdrop.horizonRatio);

  // 1. Wall Gradient
  const wallGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  wallGrad.addColorStop(0, backdrop.wallTop);
  wallGrad.addColorStop(0.65, backdrop.wallMid);
  wallGrad.addColorStop(1, backdrop.wallBottom);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, horizonY);

  // 2. Floor Gradient
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  floorGrad.addColorStop(0, backdrop.floorTop);
  floorGrad.addColorStop(0.25, backdrop.wallBottom);
  floorGrad.addColorStop(1, backdrop.floorBottom);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  // 3. Soft Cyclorama Cove Curve Blend at Horizon
  const coveHeight = Math.round(height * 0.08);
  const coveGrad = ctx.createLinearGradient(0, horizonY - coveHeight, 0, horizonY + coveHeight);
  coveGrad.addColorStop(0, 'rgba(0,0,0,0)');
  coveGrad.addColorStop(0.5, 'rgba(0,0,0,0.08)');
  coveGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coveGrad;
  ctx.fillRect(0, horizonY - coveHeight, width, coveHeight * 2);

  // 4. Architectural Texture Details
  ctx.save();
  if (backdrop.textureType === 'arch') {
    // Diagonal sunlit Mediterranean arch shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.beginPath();
    ctx.arc(width * 0.5, horizonY * 0.52, width * 0.36, Math.PI, 0, false);
    ctx.lineTo(width * 0.86, horizonY);
    ctx.lineTo(width * 0.14, horizonY);
    ctx.closePath();
    ctx.fill();
  } else if (backdrop.textureType === 'concrete' || backdrop.textureType === 'travertine') {
    // Subtle architectural slab lines & diagonal window sunbeam
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.33, 0);
    ctx.lineTo(width * 0.33, horizonY);
    ctx.moveTo(width * 0.67, 0);
    ctx.lineTo(width * 0.67, horizonY);
    ctx.moveTo(0, horizonY * 0.5);
    ctx.lineTo(width, horizonY * 0.5);
    ctx.stroke();

    // Sunbeam polygon
    const beamGrad = ctx.createLinearGradient(width * 0.15, 0, width * 0.85, horizonY);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.65, 0);
    ctx.lineTo(width * 0.92, horizonY);
    ctx.lineTo(width * 0.42, horizonY);
    ctx.closePath();
    ctx.fill();
  } else if (backdrop.textureType === 'runway') {
    // Runway perspective lines & floor sheen
    ctx.strokeStyle = backdrop.rimLightColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.36, horizonY);
    ctx.lineTo(width * 0.12, height);
    ctx.moveTo(width * 0.64, horizonY);
    ctx.lineTo(width * 0.88, height);
    ctx.stroke();
  } else if (backdrop.textureType === 'linen') {
    // Subtle linen weave crosshatch
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < horizonY; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 5. Center Key-Light Spotlight Halo
  const spotGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    width * 0.04,
    width * 0.5,
    height * 0.45,
    width * 0.58
  );
  spotGrad.addColorStop(0, backdrop.spotlightColor);
  spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);

  // 6. Subtle Editorial Edge Vignette
  const vigGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    width * 0.32,
    width * 0.5,
    height * 0.5,
    width * 0.78
  );
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Edge-preserving border flood-fill segmentation:
 * Samples border clusters & Sobel gradient barriers so the interior model & garment remain 100% untouched.
 */
function segmentSubjectFromBackground(
  imgData: ImageData,
  mode: 'auto' | 'tight' | 'gentle'
): ImageData {
  const { width, height, data } = imgData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const outData = out.data;

  // 1. Sample border pixels along top, left, right, and upper-bottom corners
  const borderSamples: Array<[number, number, number]> = [];
  const step = Math.max(2, Math.floor(Math.min(width, height) / 40));

  for (let x = 0; x < width; x += step) {
    const idxTop = (2 * width + x) * 4;
    borderSamples.push([data[idxTop], data[idxTop + 1], data[idxTop + 2]]);
  }
  for (let y = 0; y < Math.floor(height * 0.85); y += step) {
    const idxLeft = (y * width + 2) * 4;
    const idxRight = (y * width + (width - 3)) * 4;
    borderSamples.push([data[idxLeft], data[idxLeft + 1], data[idxLeft + 2]]);
    borderSamples.push([data[idxRight], data[idxRight + 1], data[idxRight + 2]]);
  }

  // Compute k-medoid clusters (up to 4 dominant background colors on the border)
  const clusters: Array<[number, number, number]> = [];
  for (const sample of borderSamples) {
    let matched = false;
    for (const c of clusters) {
      const dist = Math.hypot(sample[0] - c[0], sample[1] - c[1], sample[2] - c[2]);
      if (dist < 28) {
        c[0] = Math.round((c[0] + sample[0]) / 2);
        c[1] = Math.round((c[1] + sample[1]) / 2);
        c[2] = Math.round((c[2] + sample[2]) / 2);
        matched = true;
        break;
      }
    }
    if (!matched && clusters.length < 5) {
      clusters.push([...sample]);
    }
  }

  // 2. Compute luminance & local gradient magnitude (edge barrier)
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

  const colorTol = mode === 'tight' ? 54 : mode === 'gentle' ? 30 : 42;
  const stepTol = mode === 'tight' ? 22 : mode === 'gentle' ? 12 : 16;
  const edgeBarrier = mode === 'tight' ? 36 : mode === 'gentle' ? 20 : 28;

  // 3. BFS Flood-Fill from outer perimeter with central ellipse subject guard
  const visited = new Uint8Array(width * height);
  const bgMask = new Uint8Array(width * height); // 1 = background
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
    if (minClusterDist(data[p], data[p + 1], data[p + 2]) <= colorTol * 1.15) {
      visited[idx] = 1;
      bgMask[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfSeed(x, 0);
    pushIfSeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfSeed(0, y);
    pushIfSeed(width - 1, y);
  }

  // Protected inner core where the model/garment torso sits
  const cx = width * 0.5;
  const cy = height * 0.52;
  const rx = width * 0.22;
  const ry = height * 0.34;

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

      // Never flood inside the protected central garment/model core unless virtually identical to wall
      const inCore =
        ((nx - cx) * (nx - cx)) / (rx * rx) + ((ny - cy) * (ny - cy)) / (ry * ry) < 1;

      if (grad[next] > (inCore ? edgeBarrier * 0.55 : edgeBarrier)) {
        continue;
      }

      const np = next * 4;
      const nr = data[np];
      const ng = data[np + 1];
      const nb = data[np + 2];

      const stepDist = Math.hypot(nr - cr, ng - cg, nb - cb);
      const clusterDist = minClusterDist(nr, ng, nb);

      const allowedCluster = inCore ? colorTol * 0.55 : colorTol;
      const allowedStep = inCore ? stepTol * 0.6 : stepTol;

      if (stepDist <= allowedStep && clusterDist <= allowedCluster) {
        visited[next] = 1;
        bgMask[next] = 1;
        queue[tail++] = next;
      }
    }
  }

  // 4. Apply Soft Alpha Feathering (3x3 box blur on alpha mask along boundaries)
  const alphaFloat = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alphaFloat[i] = bgMask[i] === 1 ? 0 : 255;
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const sum =
        alphaFloat[idx - width - 1] +
        alphaFloat[idx - width] +
        alphaFloat[idx - width + 1] +
        alphaFloat[idx - 1] +
        alphaFloat[idx] * 2 +
        alphaFloat[idx + 1] +
        alphaFloat[idx + width - 1] +
        alphaFloat[idx + width] +
        alphaFloat[idx + width + 1];
      outData[idx * 4 + 3] = Math.round(sum / 10);
    }
  }

  return out;
}

/**
 * Applies subtle studio lighting harmony, ambient backdrop light color match,
 * and color-true fabric sharpening to the foreground subject only.
 */
function enhanceSubjectPixels(
  imgData: ImageData,
  enhanceLight: boolean,
  sharpen: boolean,
  ambientRgb: [number, number, number]
): ImageData {
  const { width, height, data } = imgData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const dst = out.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha < 15) continue;

      // Stronger ambient light wrap near the subject edges so the cutout never looks pasted on
      const isEdge = alpha < 235;
      const ambientWeight = enhanceLight ? (isEdge ? 0.14 : 0.05) : 0;

      for (let c = 0; c < 3; c++) {
        let val = data[idx + c];

        // Crisp fabric weave unsharp mask
        if (sharpen) {
          const center = val * 5;
          const neighbors =
            data[((y - 1) * width + x) * 4 + c] +
            data[((y + 1) * width + x) * 4 + c] +
            data[(y * width + (x - 1)) * 4 + c] +
            data[(y * width + (x + 1)) * 4 + c];
          const highPass = center - neighbors;
          val = val + highPass * 0.18;
        }

        // Studio S-curve contrast & subtle ambient backdrop light color match
        if (enhanceLight) {
          const norm = Math.max(0, Math.min(1, val / 255));
          const sCurve =
            norm < 0.5
              ? 2 * norm * norm * 0.12 + norm * 0.88
              : (1 - 2 * (1 - norm) * (1 - norm)) * 0.14 + norm * 0.86;
          val = sCurve * 255 * 1.02;
          val = val * (1 - ambientWeight) + ambientRgb[c] * ambientWeight;
        }

        dst[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
    }
  }

  return out;
}

/**
 * Main non-destructive compositor:
 * Removes the background in-browser (via @imgly/background-removal or instant Canvas border matting)
 * and places the untouched model & garment onto any of the 20 pre-loaded studio environments.
 */
export async function renderStudioComposite(
  options: StudioCompositorOptions
): Promise<string> {
  const targetW = options.aspectRatio === '16:9' ? 1280 : 960;
  const targetH = options.aspectRatio === '16:9' ? 720 : 1280;

  const sourceImg = await loadImageElement(options.sourceImageUrl);
  const backdrop =
    STUDIO_BACKDROPS.find((b) => b.id === options.backdropId) || STUDIO_BACKDROPS[0];
  const ambientRgb = parseHexToRgb(backdrop.wallMid);

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = targetW;
  mainCanvas.height = targetH;
  const ctx = mainCanvas.getContext('2d')!;

  // 1. Render chosen Studio Backdrop (or custom uploaded background photo)
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

  // 2. Prepare Subject Layer at matching resolution
  const subjCanvas = document.createElement('canvas');
  const fitScale =
    Math.min(targetW / sourceImg.width, targetH / sourceImg.height) * options.subjectScale;
  const drawW = Math.max(64, Math.round(sourceImg.width * fitScale));
  const drawH = Math.max(64, Math.round(sourceImg.height * fitScale));
  subjCanvas.width = drawW;
  subjCanvas.height = drawH;
  const subjCtx = subjCanvas.getContext('2d')!;

  let usedNeuralCutout = false;
  if (options.removalMode === 'neural-ai') {
    try {
      const neuralImg = await getNeuralBackgroundCutout(options.sourceImageUrl);
      subjCtx.drawImage(neuralImg, 0, 0, drawW, drawH);
      usedNeuralCutout = true;
    } catch (err) {
      console.warn('@imgly/background-removal fallback to Canvas edge matting:', err);
      subjCtx.drawImage(sourceImg, 0, 0, drawW, drawH);
    }
  } else {
    subjCtx.drawImage(sourceImg, 0, 0, drawW, drawH);
  }

  let subjData = subjCtx.getImageData(0, 0, drawW, drawH);

  if (!usedNeuralCutout && options.removalMode !== 'keep-bg') {
    const fallbackMode = options.removalMode === 'neural-ai' ? 'auto' : options.removalMode;
    subjData = segmentSubjectFromBackground(subjData, fallbackMode);
  }

  if (options.enhanceLighting || options.sharpenGarment) {
    subjData = enhanceSubjectPixels(
      subjData,
      options.enhanceLighting,
      options.sharpenGarment,
      ambientRgb
    );
  }

  subjCtx.putImageData(subjData, 0, 0);

  const destX = Math.round((targetW - drawW) / 2);
  const destY = Math.round(targetH - drawH - targetH * 0.03);

  // 3. Render Studio Ground Contact Shadow beneath subject
  if (options.contactShadow) {
    ctx.save();
    const shadowY = Math.min(targetH - 18, destY + drawH - 10);
    const shadowGrad = ctx.createRadialGradient(
      targetW * 0.5,
      shadowY,
      drawW * 0.04,
      targetW * 0.5,
      shadowY,
      drawW * 0.38
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
    shadowGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.18)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(
      targetW * 0.5,
      shadowY,
      drawW * 0.36,
      Math.max(14, drawH * 0.035),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 4. Composite Subject with soft drop shadow & ambient rim-light glow
  ctx.save();
  if (options.enhanceLighting && options.removalMode !== 'keep-bg') {
    ctx.shadowColor = backdrop.rimLightColor;
    ctx.shadowBlur = 16;
  }
  ctx.drawImage(subjCanvas, destX, Math.max(0, destY));
  ctx.restore();

  // 5. Return Firestore-safe compressed JPEG (< 890KB)
  let quality = 0.84;
  let resultDataUrl = mainCanvas.toDataURL('image/jpeg', quality);
  while (resultDataUrl.length > 820000 && quality > 0.45) {
    quality -= 0.1;
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
 * Inspects the actual pixels of the garment or accessory photo to extract
 * pinpoint color tones, surface sheen/texture, and a compact <=480px vision frame for API calls.
 */
export async function inspectProductVisualSpecifics(
  imageUrl: string,
  category: CategorySlug
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
    lightingMood: 'High-Contrast Studio Key Light',
    silhouetteNote:
      category === 'accessories'
        ? 'Sculptural geometric form with reinforced stitching'
        : 'Architectural shoulder line with fluid, elongated drape',
    compactVisionDataUrl: '',
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

    // Compact base64 thumbnail (~25KB-45KB) so Vercel serverless body limits (4.5MB) are never exceeded
    const compactVisionDataUrl = canvas.toDataURL('image/jpeg', 0.68);

    // Sample the central garment/accessory region (25%..75% X, 22%..82% Y)
    const startX = Math.floor(w * 0.25);
    const endX = Math.floor(w * 0.75);
    const startY = Math.floor(h * 0.22);
    const endY = Math.floor(h * 0.82);
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

      if (sat > 0.22 && lum > 30 && lum < 230) {
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

    const pr = c1 > 10 ? Math.round(r1 / c1) : c2 > 0 ? Math.round(r2 / c2) : 217;
    const pg = c1 > 10 ? Math.round(g1 / c1) : c2 > 0 ? Math.round(g2 / c2) : 119;
    const pb = c1 > 10 ? Math.round(b1 / c1) : c2 > 0 ? Math.round(b2 / c2) : 6;

    const sr = c2 > 10 ? Math.round(r2 / c2) : Math.round(pr * 0.45);
    const sg = c2 > 10 ? Math.round(g2 / c2) : Math.round(pg * 0.45);
    const sb = c2 > 10 ? Math.round(b2 / c2) : Math.round(pb * 0.45);

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
      lightingMood: specularRatio > 0.06 ? 'Luminous Editorial Key Light' : 'Soft Diffused Atelier Daylight',
      silhouetteNote,
      compactVisionDataUrl,
    };
  } catch {
    return fallback;
  }
}
