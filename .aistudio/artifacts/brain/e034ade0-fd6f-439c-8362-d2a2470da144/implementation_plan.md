# Kiekies Atelier AI Photo Studio, Pinpoint SEO & Search/Web Bio Suite

A complete, zero-failure creative and SEO suite inside the Kiekies Fashion Admin Dashboard combining:
1. **Inline AI Photo Studio & Background Replacement** powered by Nano Banana Pro (`gemini-3-pro-image` with multi-model cascade and subject-lock protection).
2. **Pinpoint Garment/Accessory Description & Search/Web Bio Generator** that inspects real visual specifics from the uploaded item alongside admin inputs.
3. **Full Vercel & Express Troubleshooting Fixes** eliminating the `"string did not match the expected pattern"` error and SPA reload issues across all environments.

## User Review & Critical Decisions

> [!IMPORTANT]
> This revised plan incorporates your request for a complete **Search & Web Bio Description** suite grounded in real garment/accessory specifics, alongside root-cause fixes for the earlier generation errors on Vercel and mobile browsers.

- **Confirmed Decision 1 — Root-Cause Fix for Earlier Pattern & Reload Errors**:
  - *Why the Pattern Error Happened on Vercel*: Previously, `vercel.json` routed *every* path—including `/api/*`—to `/index.html`, and Vercel lacked standalone serverless functions in `/api`. When Safari/mobile called `/api/generate-description`, it received HTML instead of JSON, causing WebKit to throw `"The string did not match the expected pattern"`.
  - *Permanent Fix*: We will exclude `/api/*` from the SPA rewrite in `vercel.json`, add dedicated Vercel Serverless Functions for both AI endpoints, downscale vision payloads (`<= 512px` for analysis) so requests never exceed Vercel's 4.5MB body limit, and use safe text-first JSON parsing.
- **Confirmed Decision 2 — Pinpoint Product Specifics + Search & Web Bio Suite**:
  - Adds a dedicated **Specifics & Search/Web Bio** module that extracts real visual traits from the uploaded photo (color saturation, fabric sheen/weave, hardware finish, cut/silhouette) combined with admin inputs (Name, Category, Sizes, Price, and Optional Specifics/Material Notes) to generate both:
    1. **Pinpoint Product Description** (for the product page & catalog).
    2. **Search Engine & Web Bio Copy** (optimized for Google Search snippets, OpenGraph cards, AI search indexing, and WhatsApp/Instagram catalog bios), plus a global **Storefront Search & Web Bio** manager.
- **Confirmed Decision 3 — Inline AI Photo Studio with Subject-Lock & Zero-Failure Route**:
  - Embedded directly inside the **Product Form**, **Hero Banner**, and **Category Uploaders** with presets for **Luxury Studio Backdrops** (Warm Ivory, Obsidian Matte, Architectural Concrete), **Lagos Editorial Runway & Gallery**, and **Custom Scene Prompts**, protected by a side-by-side **Before vs. After** comparison and **Keep Original** safeguard.

---

## 1. Overview & Core Concept

- **What It Does**: Provides the store administrator with a unified pre-publish suite on every upload:
  1. **AI Background Replacement & Studio Lighting**: Replaces raw photo backgrounds with shoot-worthy luxury environments while locking the model and clothing 100% intact.
  2. **Pinpoint Product & Search/Web Bio Copywriter**: Inspects the actual garment or accessory photo alongside every field entered by the admin to craft accurate, detail-rich product copy and SEO/Web bio metadata that never hallucinates or fails.
- **Target Audience / Persona**: The Kiekies Fashion Creative Director and Store Administrator managing catalog releases, search visibility, and editorial visuals.
- **Key Value**: Guarantees magazine-grade visuals and search-dominating product/web bios on every upload, backed by a multi-tier generation pipeline that cannot fail even under high API demand or static hosting constraints.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Upload Image & Enter Any Available Specifics**: Admin uploads a garment or accessory photo and enters any combination of fields (Name, Category, Sizes, Price, or optional Specifics like *"hand-beadedaso-oke trim, brass clasp, satin lining"*).
  2. **Inline AI Photo Studio (Retouch & Background Swap)**:
     - Admin selects **Warm Ivory Studio**, **Obsidian Matte**, **Architectural Concrete**, **Lagos Editorial Runway & Gallery**, or types a **Custom Scene Prompt**.
     - Toggles **Studio Lighting & Color-True Garment Sharpening**.
     - Reviews the **Side-by-Side Before & After** preview and clicks **Apply Retouched Photo** or **Keep Original**.
  3. **Pinpoint Product & Search/Web Bio Suite**:
     - Clicking **Generate Pinpoint Description & Web Bio** inspects the image's real visual traits (dominant/secondary color hexes, luminance contrast, material texture, silhouette) alongside all admin fields.
     - Populates two distinct, editable outputs:
       - **Catalog & Product Page Description**: Pinpoint architectural breakdown of the garment or accessory's cut, material feel, hardware/stitching details, and fit across available sizes.
       - **Search & Web Bio Snippet (SEO Meta & Social Bio)**: Concise, high-ranking search summary and web bio tailored for Google Search, OpenGraph social cards, and instant copy-paste into Instagram/WhatsApp bios.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-Contrast Editorial Atelier ("Bold Restraint") in deep obsidian (`#000000` / `#0A0A0A`) with `1px solid #262626` hairline dividers and `#F59E0B` warm gold studio accents.
  - *Typography & Hierarchy*: `Cormorant Garamond` display headings, `Plus Jakarta Sans` prose, and `JetBrains Mono` (`tabular-nums`) for detected visual traits, chromatic swatches, and character counts.
  - *Component Styling & Layout*: Zero nested card clutter; clean 2-column comparison frames and single-line action buttons (`whitespace-nowrap`).
- **Interactive Feedback & Motion**:
  - Live detected visual specifics bar showing extracted color swatches, luminance grade, and category attributes before and during generation.
  - One-click **Copy Web Bio** and **Apply to Product** buttons with instant confirmation feedback (`<= 200ms`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Three-Tier Grounded Generation Pipeline (Guaranteed Zero Failure)**
  - *Chosen Approach*:
    - **Tier 1 (Primary Multimodal AI)**: Server-side Gemini (`gemini-3-pro-image` -> `gemini-3.1-flash-image` -> `gemini-3.1-flash-lite-image` for photo studio; `gemini-3.8-flash` -> `gemini-flash-latest` -> `gemini-3.1-flash-lite` for pinpoint copy & web bio).
    - **Tier 2 (Client Canvas Optical & Chromatic Inspector)**: Before calling the server, the browser inspects the uploaded image on an offscreen HTML5 Canvas—extracting exact primary/secondary color tones, brightness contrast, warm/cool cast, and aspect framing—and sends a compact `<= 512px` base64 vision frame plus the extracted optical profile to the server.
    - **Tier 3 (Deterministic Grounded Composer & Studio Lighting Engine)**: If the cloud model is rate-limited (503) or if `GEMINI_API_KEY` has not yet been pasted into Vercel settings, the system uses the real extracted optical profile + admin specifics to compose a pinpoint, garment-accurate description/web bio and studio-lit canvas backdrop locally so generation **never** throws an error.
  - *Why*: Gives you the full power of Gemini and Nano Banana Pro while ensuring 100% uptime in every deployment scenario.

- **Decision 2: Strict Subject-Lock & Canvas Edge-Lighting Compositor for Photo Studio**
  - *Chosen Approach*: Pairs the strict subject-preservation prompt (*"Do NOT alter the model, face, skin tone, hands, or garment silhouette/texture; replace ONLY the background environment"*) with a side-by-side **Before vs. After** inspector so the admin always has final visual approval before pushing to Firestore.
  - *Why*: Protects brand integrity and ensures clothing details remain 100% accurate to what the customer receives.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD (/admin)                            │
│                                                                            │
│  ┌────────────────────────────────────┐  ┌──────────────────────────────┐  │
│  │   INLINE ATELIER AI PHOTO STUDIO   │  │ PINPOINT SEO & WEB BIO SUITE │  │
│  │ • Hero / Category / Product Slots  │  │ • Visual Trait Inspector     │  │
│  │ • Presets: Ivory, Obsidian,        │  │   (Color, Texture, Cut, Size)│  │
│  │   Concrete, Lagos Runway, Custom   │  │ • Admin Specifics Input      │  │
│  │ • Lighting & Garment Sharpening    │  │ • Outputs:                   │  │
│  │ • Before / After Split Inspector   │  │   1) Pinpoint Product Copy   │  │
│  │ • [Apply Photo] / [Keep Original]  │  │   2) Search & Web Bio Snippet│  │
│  └─────────────────┬──────────────────┘  └──────────────┬───────────────┘  │
└────────────────────┼────────────────────────────────────┼──────────────────┘
                     │ POST /api/retouch-image            │ POST /api/generate-description
                     ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│       DUAL-RUNTIME SERVERLESS & EXPRESS LAYER (server.ts + /api/*.ts)      │
│                                                                            │
│  • vercel.json routes /api/* to Vercel Functions & sub-pages to /index.html│
│  • Sanitizes base64 payloads (< 512px for vision, < 890KB for storage)     │
│  • Image Cascade: gemini-3-pro-image -> gemini-3.1-flash-image -> lite     │
│  • Copy Cascade:  gemini-3.8-flash -> gemini-flash-latest -> lite          │
│  • Grounded Optical & Specifics Fallback Engine (Zero-Error Guarantee)     │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│               FIRESTORE REAL-TIME STOREFRONT & SEO META LAYER              │
│                                                                            │
│  • Stores approved image, pinpoint description & web bio in Firestore      │
│  • Injects Search & Web Bio into <MetaSEO /> OpenGraph & JSON-LD Schema    │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Product Specifics & Web Bio Fields**: Extends the product form and metadata with `specifics` (admin notes on fabric/cut/hardware) and `seo_bio` (Search & Web Bio snippet automatically injected into the product page's `<MetaSEO>` description and JSON-LD schema).
  - **Storefront Web Bio Config**: Allows the admin to generate and save a global Search & Web Bio for the brand alongside Hero and Category settings.

- **Interactive Component & State Mapping**:
  - **Visual Trait Inspector**: Whenever an image is uploaded or linked, automatically extracts and displays its dominant/accent color swatches, lighting mood, and category framing.
  - **Pinpoint Description & Web Bio Button**: Sends the compressed vision thumbnail, extracted optical traits, and all filled form fields (`name`, `category`, `sizes`, `price`, `specifics`) to `/api/generate-description`, returning both `description` (product editorial copy) and `seoBio` (Search & Web Bio snippet) in a single click.
  - **Inline AI Photo Studio Drawer**: Expands on any image slot (Hero, 4 Category Doors, Primary Product Photo, Gallery Photos) with preset buttons, custom scene input, studio lighting toggle, Paid Key connector (`paid_model_flow`), and Before/After comparison.
