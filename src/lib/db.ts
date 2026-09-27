import { Product, SiteConfig, Order, OrderItem, CategorySlug, SiteConfigCategoryHeroes } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { DEFAULT_SITE_CONFIG, INITIAL_PRODUCTS } from './defaultData';

const STORAGE_KEYS = {
  PRODUCTS: 'kiekies_products_v1',
  SITE_CONFIG: 'kiekies_site_config_v1',
  ORDERS: 'kiekies_orders_v1',
};

// --- FILE UPLOADER & IMAGE CACHING SERVICE ---

/**
 * Uploads a local file from the device to the server's permanent storage.
 * Returns a permanent universal URL accessible to all users globally (/uploads/...).
 */
export async function uploadImageToServer(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });

        if (!res.ok) {
          throw new Error(`Upload failed with status ${res.status}`);
        }

        const data = await res.json();
        resolve(data.url);
      } catch (err) {
        console.warn('Server upload failed, falling back to local dataUrl:', err);
        // Fallback to local data URL if server call fails
        resolve(reader.result as string);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads and caches a Google Drive or external image onto the server permanently.
 * This guarantees the image will never shut off, break from CORS, or hit Drive rate limits.
 */
export async function cacheRemoteUrlToServer(url: string): Promise<string> {
  // If already a local server upload, return as-is
  if (url.startsWith('/uploads/')) return url;

  try {
    const res = await fetch('/api/cache-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.url; // Returns /uploads/...
    }
  } catch (err) {
    console.warn('Server cache-url failed, returning original url:', err);
  }

  // Fallback to direct normalized URL
  return url;
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

// Local Storage Fallback Helpers
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
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
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
  localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(config));
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// --- SITE CONFIG API ---
export async function getSiteConfig(): Promise<SiteConfig> {
  // 1. Try server API (Shared across all visitors)
  try {
    const res = await fetch('/api/site-config');
    if (res.ok) {
      const config = await res.json();
      saveLocalSiteConfig(config);
      return config;
    }
  } catch (err) {
    // offline or dev without server
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('site_config').select('*');
      if (!error && data && data.length > 0) {
        const configMap: Partial<SiteConfig> = {};
        data.forEach((row: { key: string; value: any }) => {
          if (row.key === 'hero') configMap.hero = row.value;
          if (row.key === 'category_heroes') configMap.category_heroes = row.value;
        });
        if (configMap.hero && configMap.category_heroes) {
          return configMap as SiteConfig;
        }
      }
    } catch (err) {
      console.warn('Falling back to local site_config:', err);
    }
  }

  return getLocalSiteConfig();
}

export async function updateSiteConfigHero(imageUrl: string): Promise<SiteConfig> {
  // Cache to server disk if it's a remote/drive link
  const permanentUrl = await cacheRemoteUrlToServer(imageUrl);

  // 1. Update server
  try {
    await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'hero',
        value: { imageUrl: permanentUrl },
      }),
    });
  } catch (err) {
    console.warn('Server site-config update failed:', err);
  }

  const current = getLocalSiteConfig();
  const updated: SiteConfig = {
    ...current,
    hero: { imageUrl: permanentUrl },
  };
  saveLocalSiteConfig(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('site_config').upsert({
        key: 'hero',
        value: { imageUrl: permanentUrl },
      });
    } catch (err) {
      console.error('Supabase updateSiteConfigHero error:', err);
    }
  }
  return updated;
}

export async function updateSiteConfigCategoryHeroes(heroes: SiteConfigCategoryHeroes): Promise<SiteConfig> {
  // Ensure images are cached
  const permanentHeroes: SiteConfigCategoryHeroes = {
    women: await cacheRemoteUrlToServer(heroes.women),
    men: await cacheRemoteUrlToServer(heroes.men),
    kids: await cacheRemoteUrlToServer(heroes.kids),
    accessories: await cacheRemoteUrlToServer(heroes.accessories),
  };

  try {
    await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'category_heroes',
        value: permanentHeroes,
      }),
    });
  } catch (err) {
    console.warn('Server site-config update failed:', err);
  }

  const current = getLocalSiteConfig();
  const updated: SiteConfig = {
    ...current,
    category_heroes: permanentHeroes,
  };
  saveLocalSiteConfig(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('site_config').upsert({
        key: 'category_heroes',
        value: permanentHeroes,
      });
    } catch (err) {
      console.error('Supabase updateSiteConfigCategoryHeroes error:', err);
    }
  }
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

  // 1. Try server API (Centralized for all users)
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (featured !== undefined) params.append('featured', String(featured));
    if (best_seller !== undefined) params.append('best_seller', String(best_seller));

    const res = await fetch(`/api/products?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalProducts(data);
        return data;
      }
    }
  } catch (err) {
    // fallback
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (typeof featured === 'boolean') {
        query = query.eq('featured', featured);
      }
      if (typeof best_seller === 'boolean') {
        query = query.eq('best_seller', best_seller);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as Product[];
      }
    } catch (err) {
      console.warn('Falling back to local products:', err);
    }
  }

  // 3. Fallback to local
  let products = getLocalProducts();
  if (status !== 'all') {
    products = products.filter(p => p.status === status);
  }
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  if (typeof featured === 'boolean') {
    products = products.filter(p => p.featured === featured);
  }
  if (typeof best_seller === 'boolean') {
    products = products.filter(p => p.best_seller === best_seller);
  }

  return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return data as Product;
    } catch (err) {
      console.warn('Supabase getProductById failed:', err);
    }
  }

  const products = getLocalProducts();
  return products.find(p => p.id === id) || null;
}

export async function createProduct(input: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  // Cache primary and gallery images to server if they are Google Drive or external
  const permanentPrimary = await cacheRemoteUrlToServer(input.image_url);
  const permanentGallery = await Promise.all(
    (input.gallery_urls || []).map((u) => cacheRemoteUrlToServer(u))
  );

  const payload = {
    ...input,
    image_url: permanentPrimary,
    gallery_urls: permanentGallery,
  };

  // 1. Post to Server API
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const newProduct = await res.json();
      const local = getLocalProducts();
      saveLocalProducts([newProduct, ...local]);
      return newProduct;
    }
  } catch (err) {
    console.warn('Server createProduct failed, saving locally:', err);
  }

  // Fallback
  const id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const created_at = new Date().toISOString();
  const newProduct: Product = {
    ...payload,
    id,
    created_at,
  };

  const products = getLocalProducts();
  saveLocalProducts([newProduct, ...products]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').insert(newProduct);
    } catch (err) {
      console.error('Supabase createProduct error:', err);
    }
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  // Cache updated images if present
  let permanentUpdates = { ...updates };
  if (updates.image_url) {
    permanentUpdates.image_url = await cacheRemoteUrlToServer(updates.image_url);
  }
  if (updates.gallery_urls) {
    permanentUpdates.gallery_urls = await Promise.all(
      updates.gallery_urls.map((u) => cacheRemoteUrlToServer(u))
    );
  }

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permanentUpdates),
    });
    if (res.ok) {
      const updated = await res.json();
      const local = getLocalProducts();
      const idx = local.findIndex((p) => p.id === id);
      if (idx !== -1) {
        local[idx] = updated;
        saveLocalProducts(local);
      }
      return updated;
    }
  } catch (e) {
    // fallback
  }

  const products = getLocalProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedProduct = { ...products[index], ...permanentUpdates };
  products[index] = updatedProduct;
  saveLocalProducts(products);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').update(permanentUpdates).eq('id', id);
    } catch (err) {
      console.error('Supabase updateProduct error:', err);
    }
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  } catch (e) {
    // fallback
  }

  const products = getLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  saveLocalProducts(filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase deleteProduct error:', err);
    }
  }

  return true;
}

// --- ORDERS API ---
export async function createOrder(
  items: OrderItem[],
  total: number,
  customer_name?: string,
  customer_phone?: string
): Promise<Order> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total, customer_name, customer_phone }),
    });
    if (res.ok) {
      const order = await res.json();
      const local = getLocalOrders();
      saveLocalOrders([order, ...local]);
      return order;
    }
  } catch (e) {
    // fallback
  }

  const code = generateOrderCode();
  const id = 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const created_at = new Date().toISOString();

  const newOrder: Order = {
    id,
    code,
    items,
    total,
    status: 'new',
    created_at,
    customer_name,
    customer_phone,
  };

  const orders = getLocalOrders();
  saveLocalOrders([newOrder, ...orders]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').insert(newOrder);
    } catch (err) {
      console.error('Supabase createOrder error:', err);
    }
  }

  return newOrder;
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const normalized = code.trim().toUpperCase();

  try {
    const res = await fetch(`/api/orders/${normalized}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('code', normalized)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          code: data.code,
          items: data.items,
          total: Number(data.total),
          status: data.status,
          created_at: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Supabase getOrderByCode error:', err);
    }
  }

  const orders = getLocalOrders();
  return orders.find(o => o.code.toUpperCase() === normalized) || null;
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const orders = await res.json();
      saveLocalOrders(orders);
      return orders;
    }
  } catch (e) {
    // fallback
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          code: d.code,
          items: d.items,
          total: Number(d.total),
          status: d.status,
          created_at: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getAllOrders failed:', err);
    }
  }

  return getLocalOrders();
}

export async function updateOrderStatus(
  id: string,
  status: 'new' | 'confirmed' | 'fulfilled'
): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      const local = getLocalOrders();
      const idx = local.findIndex((o) => o.id === id || o.code === id);
      if (idx !== -1) {
        local[idx] = updated;
        saveLocalOrders(local);
      }
      return updated;
    }
  } catch (e) {
    // fallback
  }

  const orders = getLocalOrders();
  const index = orders.findIndex(o => o.id === id || o.code === id);
  if (index !== -1) {
    orders[index].status = status;
    saveLocalOrders(orders);
  }

  return index !== -1 ? orders[index] : null;
}
