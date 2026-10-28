import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY || '').trim(),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const UPLOADS_DIR = path.resolve(PUBLIC_DIR, 'uploads');
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Serve uploaded images statically with permanent public caching
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '30d',
  immutable: true,
}));

// Default database schema & seed
function getInitialStore() {
  return {
    site_config: {
      hero: {
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1800&auto=format&fit=crop',
      },
      category_heroes: {
        women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop',
        men: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop',
        kids: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1400&auto=format&fit=crop',
        accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1400&auto=format&fit=crop',
      },
    },
    products: [
      {
        id: 'prod-001',
        name: 'The Sovereign Saffron Trench',
        category: 'women',
        price: 185000,
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16'],
        description: 'Double-breasted heavyweight wool-crepe blend drenched in vivid saffron ochre, with architectural storm flaps, structured throat latch, and extended self-tie belt. Cut with ample ease for movement through executive boardrooms and evening transitions.',
        featured: true,
        best_seller: true,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        id: 'prod-002',
        name: 'Electric Cobalt Column Gown',
        category: 'women',
        price: 165000,
        image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['UK 8', 'UK 10', 'UK 12', 'UK 14'],
        description: 'Vivid royal cobalt silk with micro-pleated asymmetrical drape. Designed with structured shoulder pads and an elongated column silhouette for commanding gala presence.',
        featured: false,
        best_seller: true,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 'prod-003',
        name: 'Crimson Barathea Silk Suit',
        category: 'women',
        price: 210000,
        image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16'],
        description: 'Deep carmine single-button blazer paired with high-rise pressed cigarette trousers. Satin peak lapels woven with Italian barathea weave.',
        featured: false,
        best_seller: true,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'prod-004',
        name: 'Emerald Sculpted Silk Halter',
        category: 'women',
        price: 145000,
        image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['UK 8', 'UK 10', 'UK 12', 'UK 14'],
        description: 'Heavyweight bias-cut mulberry silk in deep malachite green, sculpted with an architectural low back and fluid floor-skimming hemline.',
        featured: false,
        best_seller: false,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        id: 'prod-005',
        name: 'Ceremonial Malachite Agbada',
        category: 'men',
        price: 195000,
        image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        description: 'Razor-sharp contemporary reimagining of ceremonial Yoruba tailoring in rich jewel-toned damask. Geometric tonal embroidery along the neckline with matching tapered trousers.',
        featured: false,
        best_seller: true,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: 'prod-006',
        name: 'Imperial Indigo Double-Breasted Kaftan',
        category: 'men',
        price: 160000,
        image_url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['M', 'L', 'XL', 'XXL'],
        description: 'Crisp tailored mandarin collar kaftan in deep indigo blue, featuring hidden placket horn buttons and razor-pressed matching trousers.',
        featured: false,
        best_seller: false,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      },
      {
        id: 'prod-007',
        name: 'Terracotta Junior Heritage Trench',
        category: 'kids',
        price: 85000,
        image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'],
        description: 'Scaled-down architectural tailoring in water-repellent rich terracotta gabardine. Soft horn buttons and contrast silk satin lining.',
        featured: false,
        best_seller: true,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        id: 'prod-008',
        name: 'Solar Ochre Structured Jumpsuit',
        category: 'kids',
        price: 72000,
        image_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['4-5Y', '6-7Y', '8-9Y'],
        description: 'Wide-leg linen-cotton blend jumpsuit in warm solar ochre, fitted with a belted waist and utility pocketing.',
        featured: false,
        best_seller: false,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      },
      {
        id: 'prod-009',
        name: 'Amber Calfskin Monolith Tote',
        category: 'accessories',
        price: 120000,
        image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['One Size'],
        description: 'Hand-molded full-grain calfskin in saturated cognac amber, featuring brushed gold hardware and protective base studs. Engineered to house a 15-inch laptop and daily essentials.',
        featured: false,
        best_seller: true,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      },
      {
        id: 'prod-010',
        name: 'Burnished Saffron Cinched Harness',
        category: 'accessories',
        price: 48000,
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1400&auto=format&fit=crop',
        gallery_urls: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1400&auto=format&fit=crop',
        ],
        sizes: ['S (26-29)', 'M (30-33)', 'L (34-37)'],
        description: 'Sculptural Italian bridle leather belt with gilded brass hardware, engineered to accentuate oversized blazers and column dresses.',
        featured: false,
        best_seller: false,
        status: 'published',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      },
    ],
    orders: [],
  };
}

// Read database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return getInitialStore();
  }
}

// Write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// --- API ROUTES ---

// 0. AI Pinpoint Product Description & Search/Web Bio Generator (Multimodal Image + Specifics)
function synthesizeLuxurySeoDescription(params: {
  name?: string;
  category?: string;
  sizes?: string;
  price?: string | number;
  specifics?: string;
  colorHint?: string;
  secondaryColorHint?: string;
  surfaceFinish?: string;
  silhouetteNote?: string;
  hasImage?: boolean;
}): { description: string; seoBio: string } {
  const rawName = (params.name || '').trim();
  const cat = (params.category || 'women').trim().toLowerCase();
  const rawSizes = (params.sizes || '').trim();
  const rawPrice =
    params.price !== undefined && params.price !== null && String(params.price).trim() !== ''
      ? `₦${Number(params.price).toLocaleString()}`
      : '';
  const rawSpecifics = (params.specifics || '').trim();
  const primaryColor = (params.colorHint || 'Obsidian & Gold').trim();
  const secondaryColor = (params.secondaryColorHint || '').trim();
  const finish = (params.surfaceFinish || '').trim();
  const silhouette = (params.silhouetteNote || '').trim();

  const colorDescriptor =
    secondaryColor && secondaryColor !== primaryColor
      ? `${primaryColor} with ${secondaryColor} undertones`
      : primaryColor;

  const specificsClause = rawSpecifics
    ? ` Distinguished by ${rawSpecifics.replace(/\.$/, '')}.`
    : '';

  const finishClause = finish
    ? ` Crafted in ${finish.toLowerCase()}`
    : ' Crafted from hand-selected luxury cloth';

  const silhouetteClause = silhouette
    ? ` with ${silhouette.toLowerCase()}.`
    : ' with architectural Lagos tailoring.';

  const sizeClause = rawSizes
    ? ` Available in ${rawSizes} with bespoke Lagos atelier consultation and direct nationwide fulfillment.`
    : ' Available for immediate acquisition and private styling consultation via our Lagos atelier.';

  let description = '';
  let pieceTitle = rawName;

  if (cat === 'accessories') {
    pieceTitle = rawName || `The ${primaryColor} Atelier Accessory`;
    description = `${pieceTitle} is a sculptural luxury accessory rendered in ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Hand-finished by Kiekies Fashion to anchor contemporary Nigerian ready-to-wear and evening ensembles.${sizeClause}`;
  } else if (cat === 'men') {
    pieceTitle = rawName || `The ${primaryColor} Sovereign Menswear Piece`;
    description = `${pieceTitle} exemplifies contemporary Nigerian menswear tailoring in ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Engineered by Kiekies Fashion for commanding presence across ceremonial occasions and executive settings.${sizeClause}`;
  } else if (cat === 'kids') {
    pieceTitle = rawName || `The ${primaryColor} Junior Heritage Piece`;
    description = `${pieceTitle} brings Kiekies Fashion's architectural tailoring to junior couture in rich ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Proportioned for breathable comfort, durability, and celebratory family occasions.${sizeClause}`;
  } else {
    pieceTitle = rawName || `The ${primaryColor} Atelier Silhouette`;
    description = `${pieceTitle} is a contemporary luxury statement from Kiekies Fashion drenched in ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Pressed and finished by hand in our Lagos workshop for effortless authority from high-stakes boardrooms to evening galas.${sizeClause}`;
  }

  const bioParts = [
    `${pieceTitle} by Kiekies Fashion (Lagos).`,
    `${colorDescriptor}${finish ? ` · ${finish}` : ''}.`,
    rawSpecifics ? `${rawSpecifics.replace(/\.$/, '')}.` : '',
    rawSizes ? `Sizes: ${rawSizes}.` : '',
    rawPrice ? `${rawPrice} ·` : '',
    'Direct WhatsApp concierge & nationwide delivery.',
  ].filter(Boolean);

  const seoBio = bioParts.join(' ').replace(/\s+/g, ' ').trim();
  return { description, seoBio };
}

app.post('/api/generate-description', async (req, res) => {
  try {
    const {
      name,
      category,
      sizes,
      price,
      specifics,
      imageUrl,
      galleryUrls,
      colorHint,
      secondaryColorHint,
      surfaceFinish,
      silhouetteNote,
    } = req.body || {};

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanCategory = typeof category === 'string' && category.trim() ? category.trim() : 'women';
    const cleanSizes = typeof sizes === 'string' ? sizes.trim() : '';
    const cleanPrice = price !== undefined && price !== null && String(price).trim() !== '' ? String(price).trim() : '';
    const cleanSpecifics = typeof specifics === 'string' ? specifics.trim() : '';
    const cleanColorHint = typeof colorHint === 'string' ? colorHint.trim() : '';
    const cleanSecondaryColor = typeof secondaryColorHint === 'string' ? secondaryColorHint.trim() : '';
    const cleanSurfaceFinish = typeof surfaceFinish === 'string' ? surfaceFinish.trim() : '';
    const cleanSilhouette = typeof silhouetteNote === 'string' ? silhouetteNote.trim() : '';

    // Pick primary image or first gallery image if available
    let targetImage = typeof imageUrl === 'string' ? imageUrl.trim() : '';
    if (!targetImage && typeof galleryUrls === 'string' && galleryUrls.trim()) {
      targetImage = galleryUrls.split('\n')[0].trim();
    }

    const fallbackCopy = synthesizeLuxurySeoDescription({
      name: cleanName,
      category: cleanCategory,
      sizes: cleanSizes,
      price: cleanPrice,
      specifics: cleanSpecifics,
      colorHint: cleanColorHint,
      secondaryColorHint: cleanSecondaryColor,
      surfaceFinish: cleanSurfaceFinish,
      silhouetteNote: cleanSilhouette,
      hasImage: Boolean(targetImage),
    });

    const parts: any[] = [];

    // Attempt to attach the product image for visual analysis
    if (targetImage) {
      const dataUrlMatch = targetImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);

      if (dataUrlMatch && dataUrlMatch[1] && dataUrlMatch[2]) {
        const sanitizedBase64 = dataUrlMatch[2].replace(/[^A-Za-z0-9+/=]/g, '');
        if (sanitizedBase64.length > 0) {
          parts.push({
            inlineData: {
              mimeType: dataUrlMatch[1],
              data: sanitizedBase64,
            },
          });
        }
      } else if (targetImage.startsWith('/uploads/')) {
        const localFile = path.join(PUBLIC_DIR, targetImage.replace(/^\//, ''));
        if (fs.existsSync(localFile)) {
          const buf = fs.readFileSync(localFile);
          const ext = path.extname(localFile).toLowerCase();
          const mimeType =
            ext === '.png'
              ? 'image/png'
              : ext === '.webp'
              ? 'image/webp'
              : 'image/jpeg';
          parts.push({
            inlineData: {
              mimeType,
              data: buf.toString('base64'),
            },
          });
        }
      } else if (targetImage.startsWith('http://') || targetImage.startsWith('https://')) {
        try {
          let fetchUrl = targetImage;
          const driveMatch =
            targetImage.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
            targetImage.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (driveMatch && driveMatch[1]) {
            fetchUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
          }

          const imgRes = await fetch(fetchUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            },
          });
          const contentType = imgRes.headers.get('content-type') || '';
          if (imgRes.ok && contentType.startsWith('image/')) {
            const arrBuf = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(arrBuf).toString('base64');
            parts.push({
              inlineData: {
                mimeType: contentType.split(';')[0],
                data: base64Data,
              },
            });
          }
        } catch (imgErr) {
          console.warn('Could not fetch remote image for Gemini analysis, continuing with metadata:', imgErr);
        }
      }
    }

    const availableMetadataLines: string[] = [];
    if (cleanName) availableMetadataLines.push(`- Piece / Item Name: ${cleanName}`);
    if (cleanCategory) availableMetadataLines.push(`- Collection Category: ${cleanCategory}`);
    if (cleanSizes) availableMetadataLines.push(`- Available Sizes / Dimensions: ${cleanSizes}`);
    if (cleanPrice) availableMetadataLines.push(`- Price: ₦${Number(cleanPrice).toLocaleString()}`);
    if (cleanSpecifics) availableMetadataLines.push(`- Admin Specifics (Fabric / Cut / Hardware): ${cleanSpecifics}`);
    if (cleanColorHint) availableMetadataLines.push(`- Detected Primary Color: ${cleanColorHint}`);
    if (cleanSecondaryColor) availableMetadataLines.push(`- Detected Secondary Tone: ${cleanSecondaryColor}`);
    if (cleanSurfaceFinish) availableMetadataLines.push(`- Detected Material / Surface Finish: ${cleanSurfaceFinish}`);
    if (cleanSilhouette) availableMetadataLines.push(`- Detected Silhouette / Form: ${cleanSilhouette}`);

    const promptText = `You are the Senior Luxury Fashion Copywriter and SEO Strategist for Kiekies Fashion, a contemporary luxury Nigerian fashion house and atelier based in Lagos.

Write a pinpoint product description AND a concise Search/Web Bio utilizing all available specifics below${parts.length > 0 ? ' and the attached product photograph' : ''}:
${availableMetadataLines.join('\n')}

Return strictly valid JSON with two keys:
1. "description": A 2 to 3 sentence pinpoint editorial description highlighting the item's exact visual specifics (color saturation, fabric/material finish, cut/silhouette, hardware/stitching details, and available sizes) tailored to "${cleanCategory}".
2. "seoBio": A concise Search Engine & Web Bio snippet (under 220 characters) packed with pinpoint specifics, sizes, price, and Kiekies Fashion Lagos keywords for Google Search, OpenGraph cards, and Instagram/WhatsApp bios.`;

    parts.push({ text: promptText });

    const configuredModel = (process.env.GEMINI_TEXT_MODEL || '').trim();
    const candidateModels = Array.from(
      new Set(
        [
          configuredModel,
          'gemini-flash-latest',
          'gemini-2.5-flash',
          'gemini-3-flash-preview',
        ].filter(Boolean)
      )
    );
    let generatedDescription = '';
    let generatedSeoBio = '';
    let activeSource = 'optical-specifics-engine';

    if ((process.env.GEMINI_API_KEY || '').trim()) {
      for (const modelName of candidateModels) {
        try {
          const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: { responseMimeType: 'application/json' },
          });
          const text = response.text?.trim() || '';
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed.description) {
              generatedDescription = String(parsed.description).trim();
              generatedSeoBio = String(parsed.seoBio || fallbackCopy.seoBio).trim();
              activeSource = modelName;
              break;
            }
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} attempt warning:`, modelErr?.message || modelErr);
        }
      }
    }

    return res.json({
      description: generatedDescription || fallbackCopy.description,
      seoBio: generatedSeoBio || fallbackCopy.seoBio,
      usedImage: parts.length > 1 || Boolean(targetImage),
      source: activeSource,
    });
  } catch (err: any) {
    console.error('Description generation fallback triggered:', err);
    const fallbackCopy = synthesizeLuxurySeoDescription(req.body || {});
    return res.json({
      description: fallbackCopy.description,
      seoBio: fallbackCopy.seoBio,
      usedImage: Boolean(req.body?.imageUrl),
      source: 'optical-specifics-engine',
    });
  }
});

// 1. Upload File & Return Universal Permanent URL
app.post('/api/upload', (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Missing dataUrl in request body' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 DataURL' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extension from mimeType or original filename
    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('svg')) ext = '.svg';
    else if (filename) {
      const parsedExt = path.extname(filename);
      if (parsedExt) ext = parsedExt;
    }

    const safeName = `kiekies_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    return res.json({ url: publicUrl, filename: safeName, size: buffer.length });
  } catch (err: any) {
    console.error('Server upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload processing failed' });
  }
});

// 2. Cache & Permanentize Remote/Google Drive Image to Local Server Storage
app.post('/api/cache-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Missing url in request body' });
    }

    // Convert Drive link if needed
    let fetchUrl = url;
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      fetchUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return res.status(400).json({ error: `Could not fetch remote image: ${response.statusText}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';

    const safeName = `drive_cache_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    return res.json({ url: publicUrl, originalUrl: url });
  } catch (err: any) {
    console.error('Cache url error:', err);
    return res.status(500).json({ error: err.message || 'Remote image caching failed' });
  }
});

// 3. Site Config API
app.get('/api/site-config', (req, res) => {
  const db = readDb();
  return res.json(db.site_config);
});

app.post('/api/site-config', (req, res) => {
  const db = readDb();
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ error: 'Missing key or value' });
  }

  db.site_config[key] = value;
  writeDb(db);
  return res.json({ success: true, site_config: db.site_config });
});

// 4. Products API
app.get('/api/products', (req, res) => {
  const db = readDb();
  let products = db.products || [];

  const { category, status, featured, best_seller } = req.query;

  if (category && category !== 'all') {
    products = products.filter((p: any) => p.category === category);
  }
  if (status && status !== 'all') {
    products = products.filter((p: any) => p.status === status);
  }
  if (featured !== undefined) {
    products = products.filter((p: any) => String(p.featured) === String(featured));
  }
  if (best_seller !== undefined) {
    products = products.filter((p: any) => String(p.best_seller) === String(best_seller));
  }

  products.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDb();
  const product = (db.products || []).find((p: any) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json(product);
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  const id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newProduct = {
    ...req.body,
    id,
    created_at: new Date().toISOString(),
  };

  db.products = [newProduct, ...(db.products || [])];
  writeDb(db);
  return res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDb();
  const index = (db.products || []).findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const updated = {
    ...db.products[index],
    ...req.body,
    id: req.params.id,
  };

  db.products[index] = updated;
  writeDb(db);
  return res.json(updated);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  db.products = (db.products || []).filter((p: any) => p.id !== req.params.id);
  writeDb(db);
  return res.json({ success: true });
});

// 5. Orders API
app.get('/api/orders', (req, res) => {
  const db = readDb();
  const orders = (db.orders || []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return res.json(orders);
});

app.get('/api/orders/:code', (req, res) => {
  const db = readDb();
  const normalized = req.params.code.trim().toUpperCase();
  const order = (db.orders || []).find((o: any) => o.code.toUpperCase() === normalized);
  if (!order) return res.status(404).json({ error: 'Order dossier not found' });
  return res.json(order);
});

app.post('/api/orders', (req, res) => {
  const db = readDb();
  const { items, total, customer_name, customer_phone } = req.body;

  // 6-character human-typeable code
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const id = 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newOrder = {
    id,
    code,
    items: items || [],
    total: Number(total) || 0,
    status: 'new',
    created_at: new Date().toISOString(),
    customer_name,
    customer_phone,
  };

  db.orders = [newOrder, ...(db.orders || [])];
  writeDb(db);
  return res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDb();
  const { status } = req.body;
  const index = (db.orders || []).findIndex(
    (o: any) => o.id === req.params.id || o.code === req.params.id
  );
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  db.orders[index].status = status;
  writeDb(db);
  return res.json(db.orders[index]);
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Kiekies Atelier Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
