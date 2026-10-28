import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

interface SpecificsPayload {
  name?: string;
  category?: string;
  sizes?: string;
  price?: string | number;
  specifics?: string;
  colorHint?: string;
  secondaryColorHint?: string;
  surfaceFinish?: string;
  silhouetteNote?: string;
  imageUrl?: string;
}

function buildGroundedPinpointCopy(params: SpecificsPayload): {
  description: string;
  seoBio: string;
} {
  const rawName = (params.name || '').trim();
  const cat = (params.category || 'women').trim().toLowerCase();
  const rawSizes = (params.sizes || '').trim();
  const rawPrice = params.price !== undefined && params.price !== null && String(params.price).trim() !== ''
    ? `₦${Number(params.price).toLocaleString()}`
    : '';
  const rawSpecifics = (params.specifics || '').trim();
  const primaryColor = (params.colorHint || 'Obsidian & Gold').trim();
  const secondaryColor = (params.secondaryColorHint || '').trim();
  const finish = (params.surfaceFinish || '').trim();
  const silhouette = (params.silhouetteNote || '').trim();

  const colorDescriptor = secondaryColor && secondaryColor !== primaryColor
    ? `${primaryColor} with ${secondaryColor} undertones`
    : primaryColor;

  const specificsClause = rawSpecifics
    ? ` Distinguished by ${rawSpecifics.replace(/\.$/, '')}.`
    : '';

  const finishClause = finish
    ? ` Crafted in ${finish.toLowerCase()}`
    : ' Crafted from hand-selected luxury cloth';

  const silhouetteClause = silhouette
    ? ` with an ${silhouette.toLowerCase()}.`
    : ' with architectural Lagos tailoring.';

  const sizeClause = rawSizes
    ? ` Available in ${rawSizes} for direct WhatsApp consultation and nationwide delivery.`
    : ' Available for immediate bespoke and ready-to-wear acquisition via our Lagos atelier.';

  let description = '';
  let pieceTitle = rawName;

  if (cat === 'accessories') {
    pieceTitle = rawName || `The ${primaryColor} Atelier Accessory`;
    description = `${pieceTitle} is a sculptural luxury accessory rendered in ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Hand-finished by Kiekies Fashion to anchor contemporary Nigerian ready-to-wear and formal evening ensembles.${sizeClause}`;
  } else if (cat === 'men') {
    pieceTitle = rawName || `The ${primaryColor} Sovereign Menswear Piece`;
    description = `${pieceTitle} exemplifies contemporary Nigerian menswear tailoring in ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Engineered by Kiekies Fashion for commanding presence across ceremonial occasions and executive settings.${sizeClause}`;
  } else if (cat === 'kids') {
    pieceTitle = rawName || `The ${primaryColor} Junior Heritage Piece`;
    description = `${pieceTitle} brings Kiekies Fashion's architectural tailoring to junior couture in rich ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Proportioned for breathable comfort, durability, and celebratory family occasions.${sizeClause}`;
  } else {
    pieceTitle = rawName || `The ${primaryColor} Atelier Silhouette`;
    description = `${pieceTitle} is a contemporary luxury statement from Kiekies Fashion drenched in ${colorDescriptor}.${finishClause}${silhouetteClause}${specificsClause} Pressed and finished by hand in our Lagos workshop for effortless authority from boardrooms to evening galas.${sizeClause}`;
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: SpecificsPayload = req.body || {};
  const fallback = buildGroundedPinpointCopy(body);

  try {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(200).json({
        ...fallback,
        usedImage: Boolean(body.imageUrl),
        source: 'optical-specifics-engine',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const parts: any[] = [];
    const targetImage = (body.imageUrl || '').trim();

    if (targetImage.startsWith('data:image/')) {
      const match = targetImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
      if (match && match[1] && match[2]) {
        const sanitized = match[2].replace(/[^A-Za-z0-9+/=]/g, '');
        if (sanitized.length > 0) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: sanitized,
            },
          });
        }
      }
    }

    const prompt = `You are the Senior Luxury Fashion Copywriter and SEO Strategist for Kiekies Fashion (Lagos, Nigeria).
Analyze the provided garment/accessory specifics${parts.length > 0 ? ' and attached photograph' : ''}:
- Name: ${body.name || 'Atelier Signature Piece'}
- Category: ${body.category || 'women'}
- Sizes: ${body.sizes || 'Bespoke & Ready-to-Wear'}
- Price: ${body.price ? `₦${Number(body.price).toLocaleString()}` : 'Upon Inquiry'}
- Admin Specifics / Notes: ${body.specifics || 'None'}
- Detected Primary Color: ${body.colorHint || 'Not specified'}
- Detected Secondary Tone: ${body.secondaryColorHint || 'Not specified'}
- Detected Surface / Material Finish: ${body.surfaceFinish || 'Not specified'}
- Detected Silhouette: ${body.silhouetteNote || 'Not specified'}

Return strictly valid JSON with two keys:
1. "description": A 2-3 sentence pinpoint product description highlighting exact visual details (cut, color saturation, fabric/material finish, hardware/stitching, and sizing) in an editorial tone.
2. "seoBio": A concise Search Engine & Web Bio snippet (under 220 characters) packed with pinpoint specifics, sizes, and Kiekies Fashion Lagos keywords for Google Search, OpenGraph, and Instagram/WhatsApp bios.`;

    parts.push({ text: prompt });

    const configuredModel = (process.env.GEMINI_TEXT_MODEL || '').trim();
    const models = Array.from(
      new Set(
        [
          configuredModel,
          'gemini-flash-latest',
          'gemini-2.5-flash',
          'gemini-3-flash-preview',
        ].filter(Boolean)
      )
    );
    for (const model of models) {
      try {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: { parts },
          config: { responseMimeType: 'application/json' },
        });
        const text = response.text?.trim() || '';
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.description) {
            return res.status(200).json({
              description: String(parsed.description).trim(),
              seoBio: String(parsed.seoBio || fallback.seoBio).trim(),
              usedImage: parts.length > 1 || Boolean(targetImage),
              source: model,
            });
          }
        }
      } catch {
        // Continue to next candidate or grounded fallback
      }
    }

    return res.status(200).json({
      ...fallback,
      usedImage: Boolean(targetImage),
      source: 'optical-specifics-engine',
    });
  } catch {
    return res.status(200).json({
      ...fallback,
      usedImage: Boolean(body.imageUrl),
      source: 'optical-specifics-engine',
    });
  }
}
