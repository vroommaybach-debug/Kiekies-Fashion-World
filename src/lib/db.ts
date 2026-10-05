import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  db,
  OperationType,
  handleFirestoreError,
} from './firebase';
import {
  Product,
  SiteConfig,
  Order,
  OrderItem,
  CategorySlug,
  SiteConfigCategoryHeroes,
} from '../types';
import { DEFAULT_SITE_CONFIG, INITIAL_PRODUCTS } from './defaultData';
import { fileToDataUrl, normalizeImageUrl } from './driveHelper';

const STORAGE_KEYS = {
  PRODUCTS: 'kiekies_products_v1',
  SITE_CONFIG: 'kiekies_site_config_v1',
  ORDERS: 'kiekies_orders_v1',
};

// Sanitize & enforce blueprint volumetric boundaries
function sanitizeId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned || `item-${Date.now()}`;
}

function sanitizeProductPayload(p: Product): Product {
  const cleanImageUrl = normalizeImageUrl(p.image_url).slice(0, 890000);
  const rawGallery = Array.isArray(p.gallery_urls) && p.gallery_urls.length > 0
    ? p.gallery_urls.map((u) => normalizeImageUrl(u).slice(0, 890000)).filter(Boolean)
    : [cleanImageUrl];
  const boundedGallery = rawGallery.slice(0, 10);
  if (boundedGallery.length === 0) boundedGallery.push(cleanImageUrl);

  const rawSizes = Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes.map((s) => String(s).trim().slice(0, 50)).filter(Boolean)
    : ['One Size'];
  const boundedSizes = rawSizes.slice(0, 15);
  if (boundedSizes.length === 0) boundedSizes.push('One Size');

  const validCategories: CategorySlug[] = ['women', 'men', 'kids', 'accessories'];
  const category: CategorySlug = validCategories.includes(p.category) ? p.category : 'women';

  return {
    id: sanitizeId(p.id),
    name: String(p.name || 'Untitled Garment').trim().slice(0, 200),
    category,
    price: Math.max(0, Number(p.price) || 0),
    image_url: cleanImageUrl,
    gallery_urls: boundedGallery,
    sizes: boundedSizes,
    description: p.description ? String(p.description).trim().slice(0, 5000) : null,
    featured: Boolean(p.featured),
    best_seller: Boolean(p.best_seller),
    status: p.status === 'draft' ? 'draft' : 'published',
    created_at: String(p.created_at || new Date().toISOString()).slice(0, 64),
  };
}

/**
 * Compresses and prepares a device File for instant, permanent Firestore persistence.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  const compressedDataUrl = await fileToDataUrl(file, 1200, 0.78);
  return compressedDataUrl;
}

// Generate 6-character uppercase alphanumeric code
export function generateOrderCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Local Storage Cache Helpers
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch {
    // Ignore storage quota warnings on local cache
  }
}

function getLocalSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
      return DEFAULT_SITE_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

function saveLocalSiteConfig(config: SiteConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(config));
  } catch {
    // Ignore storage quota warnings on local cache
  }
}

// Seed initial catalog and site_config into Firestore if empty
let seedingPromise: Promise<void> | null = null;

export async function ensureFirestoreSeeded(): Promise<void> {
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const productsQuery = query(collection(db, 'products'), where('price', '>=', 0));
      const [heroSnap, catSnap, productsSnap] = await Promise.all([
        getDoc(doc(db, 'site_config', 'hero')),
        getDoc(doc(db, 'site_config', 'category_heroes')),
        getDocs(productsQuery),
      ]);

      const now = new Date().toISOString().slice(0, 64);

      if (!heroSnap.exists()) {
        await setDoc(doc(db, 'site_config', 'hero'), {
          key: 'hero',
          imageUrl: DEFAULT_SITE_CONFIG.hero.imageUrl,
          updated_at: now,
        });
      }

      if (!catSnap.exists()) {
        await setDoc(doc(db, 'site_config', 'category_heroes'), {
          key: 'category_heroes',
          women: DEFAULT_SITE_CONFIG.category_heroes.women,
          men: DEFAULT_SITE_CONFIG.category_heroes.men,
          kids: DEFAULT_SITE_CONFIG.category_heroes.kids,
          accessories: DEFAULT_SITE_CONFIG.category_heroes.accessories,
          updated_at: now,
        });
      }

      if (productsSnap.empty) {
        await Promise.all(
          INITIAL_PRODUCTS.map((p) => {
            const clean = sanitizeProductPayload(p);
            return setDoc(doc(db, 'products', clean.id), clean);
          })
        );
      }
    } catch (error) {
      console.warn('Initial Firestore seed check warning:', error);
    }
  })();

  return seedingPromise;
}

// Real-time Subscriptions for Live Storefront Sync
export function subscribeToStorefront(
  onProductsChange: (products: Product[]) => void,
  onSiteConfigChange: (config: SiteConfig) => void
): () => void {
  let unsubProducts: (() => void) | null = null;
  let unsubHero: (() => void) | null = null;
  let unsubCategories: (() => void) | null = null;
  let cancelled = false;

  ensureFirestoreSeeded().then(() => {
    if (cancelled) return;

    const productsQuery = query(collection(db, 'products'), where('price', '>=', 0));
    unsubProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as Product);
          list.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          saveLocalProducts(list);
          onProductsChange(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    unsubHero = onSnapshot(
      doc(db, 'site_config', 'hero'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.imageUrl) {
            const current = getLocalSiteConfig();
            const next: SiteConfig = {
              hero: { imageUrl: data.imageUrl },
              category_heroes: { ...current.category_heroes },
            };
            saveLocalSiteConfig(next);
            onSiteConfigChange(next);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_config/hero');
      }
    );

    unsubCategories = onSnapshot(
      doc(db, 'site_config', 'category_heroes'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const current = getLocalSiteConfig();
          const next: SiteConfig = {
            hero: { ...current.hero },
            category_heroes: {
              women: data.women || current.category_heroes.women,
              men: data.men || current.category_heroes.men,
              kids: data.kids || current.category_heroes.kids,
              accessories: data.accessories || current.category_heroes.accessories,
            },
          };
          saveLocalSiteConfig(next);
          onSiteConfigChange(next);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_config/category_heroes');
      }
    );
  });

  return () => {
    cancelled = true;
    if (unsubProducts) unsubProducts();
    if (unsubHero) unsubHero();
    if (unsubCategories) unsubCategories();
  };
}

// --- SITE CONFIG API ---
export async function getSiteConfig(): Promise<SiteConfig> {
  await ensureFirestoreSeeded();
  try {
    const [heroSnap, catSnap] = await Promise.all([
      getDoc(doc(db, 'site_config', 'hero')),
      getDoc(doc(db, 'site_config', 'category_heroes')),
    ]);

    const current = getLocalSiteConfig();
    const config: SiteConfig = {
      hero: { ...current.hero },
      category_heroes: { ...current.category_heroes },
    };

    if (heroSnap.exists()) {
      const data = heroSnap.data();
      if (data.imageUrl) {
        config.hero = { imageUrl: data.imageUrl };
      }
    }

    if (catSnap.exists()) {
      const data = catSnap.data();
      config.category_heroes = {
        women: data.women || config.category_heroes.women,
        men: data.men || config.category_heroes.men,
        kids: data.kids || config.category_heroes.kids,
        accessories: data.accessories || config.category_heroes.accessories,
      };
    }

    saveLocalSiteConfig(config);
    return config;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'site_config/hero');
  }
}

export async function updateSiteConfigHero(imageUrl: string): Promise<SiteConfig> {
  const cleanUrl = normalizeImageUrl(imageUrl).slice(0, 890000);
  const now = new Date().toISOString().slice(0, 64);
  const path = 'site_config/hero';

  try {
    await setDoc(doc(db, 'site_config', 'hero'), {
      key: 'hero',
      imageUrl: cleanUrl,
      updated_at: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  const current = getLocalSiteConfig();
  const updated: SiteConfig = {
    ...current,
    hero: { imageUrl: cleanUrl },
  };
  saveLocalSiteConfig(updated);
  return updated;
}

export async function updateSiteConfigCategoryHeroes(
  heroes: SiteConfigCategoryHeroes
): Promise<SiteConfig> {
  const cleanHeroes: SiteConfigCategoryHeroes = {
    women: normalizeImageUrl(heroes.women).slice(0, 890000),
    men: normalizeImageUrl(heroes.men).slice(0, 890000),
    kids: normalizeImageUrl(heroes.kids).slice(0, 890000),
    accessories: normalizeImageUrl(heroes.accessories).slice(0, 890000),
  };
  const now = new Date().toISOString().slice(0, 64);
  const path = 'site_config/category_heroes';

  try {
    await setDoc(doc(db, 'site_config', 'category_heroes'), {
      key: 'category_heroes',
      women: cleanHeroes.women,
      men: cleanHeroes.men,
      kids: cleanHeroes.kids,
      accessories: cleanHeroes.accessories,
      updated_at: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  const current = getLocalSiteConfig();
  const updated: SiteConfig = {
    ...current,
    category_heroes: cleanHeroes,
  };
  saveLocalSiteConfig(updated);
  return updated;
}

// --- PRODUCTS API ---
export interface ProductQueryOptions {
  category?: CategorySlug | 'all';
  status?: 'published' | 'draft' | 'all';
  featured?: boolean;
  best_seller?: boolean;
}

export async function getProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  const { category, status = 'published', featured, best_seller } = options;
  await ensureFirestoreSeeded();

  let products: Product[] = [];

  try {
    const productsQuery = query(collection(db, 'products'), where('price', '>=', 0));
    const snap = await getDocs(productsQuery);
    if (!snap.empty) {
      products = snap.docs.map((d) => d.data() as Product);
      saveLocalProducts(products);
    } else {
      products = getLocalProducts();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }

  if (status !== 'all') {
    products = products.filter((p) => p.status === status);
  }
  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }
  if (typeof featured === 'boolean') {
    products = products.filter((p) => p.featured === featured);
  }
  if (typeof best_seller === 'boolean') {
    products = products.filter((p) => p.best_seller === best_seller);
  }

  return products.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const cleanId = sanitizeId(id);
  try {
    const snap = await getDoc(doc(db, 'products', cleanId));
    if (snap.exists()) {
      return snap.data() as Product;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `products/${cleanId}`);
  }

  const products = getLocalProducts();
  return products.find((p) => p.id === cleanId) || null;
}

export async function createProduct(
  input: Omit<Product, 'id' | 'created_at'>
): Promise<Product> {
  const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const created_at = new Date().toISOString().slice(0, 64);

  const newProduct = sanitizeProductPayload({
    ...input,
    id,
    created_at,
  });

  const path = `products/${newProduct.id}`;
  try {
    await setDoc(doc(db, 'products', newProduct.id), newProduct);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  const local = getLocalProducts();
  saveLocalProducts([newProduct, ...local.filter((p) => p.id !== newProduct.id)]);
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const cleanId = sanitizeId(id);
  const existing = await getProductById(cleanId);
  if (!existing) return null;

  const updatedProduct = sanitizeProductPayload({
    ...existing,
    ...updates,
    id: existing.id,
    created_at: existing.created_at,
  });

  const path = `products/${cleanId}`;
  try {
    await setDoc(doc(db, 'products', cleanId), updatedProduct);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  const local = getLocalProducts();
  const idx = local.findIndex((p) => p.id === cleanId);
  if (idx !== -1) {
    local[idx] = updatedProduct;
    saveLocalProducts(local);
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const cleanId = sanitizeId(id);
  const path = `products/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'products', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }

  const local = getLocalProducts().filter((p) => p.id !== cleanId);
  saveLocalProducts(local);
  return true;
}

// --- ORDERS API ---
export async function createOrder(
  items: OrderItem[],
  total: number
): Promise<Order> {
  const code = generateOrderCode();
  const created_at = new Date().toISOString().slice(0, 64);

  const boundedItems: OrderItem[] = (items || []).slice(0, 20).map((item) => ({
    productId: String(item.productId || '').slice(0, 128),
    name: String(item.name || '').slice(0, 200),
    size: String(item.size || 'One Size').slice(0, 50),
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Math.max(0, Number(item.price) || 0),
    imageUrl: String(item.imageUrl || '').slice(0, 2000),
  }));

  const newOrder: Order = {
    id: code,
    code,
    items: boundedItems,
    total: Math.max(0, Number(total) || 0),
    status: 'new',
    created_at,
  };

  const path = `orders/${code}`;
  try {
    await setDoc(doc(db, 'orders', code), newOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return newOrder;
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  if (!normalized) return null;

  const path = `orders/${normalized}`;
  try {
    const snap = await getDoc(doc(db, 'orders', normalized));
    if (snap.exists()) {
      return snap.data() as Order;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  return null;
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersQuery = query(collection(db, 'orders'), where('total', '>=', 0));
    const snap = await getDocs(ordersQuery);
    const list = snap.docs.map((d) => d.data() as Order);
    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function updateOrderStatus(
  idOrCode: string,
  status: 'new' | 'confirmed' | 'fulfilled'
): Promise<Order | null> {
  const cleanCode = sanitizeId(idOrCode);
  const path = `orders/${cleanCode}`;
  try {
    await updateDoc(doc(db, 'orders', cleanCode), { status });
    const updated = await getDoc(doc(db, 'orders', cleanCode));
    return updated.exists() ? (updated.data() as Order) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
