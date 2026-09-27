export type CategorySlug = 'women' | 'men' | 'kids' | 'accessories';

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  price: number; // in NGN (Nigerian Naira ₦)
  image_url: string;
  gallery_urls: string[];
  sizes: string[];
  description: string | null;
  featured: boolean;
  best_seller: boolean;
  status: 'draft' | 'published';
  created_at: string;
}

export interface SiteConfigHero {
  imageUrl: string;
}

export interface SiteConfigCategoryHeroes {
  women: string;
  men: string;
  kids: string;
  accessories: string;
}

export interface SiteConfig {
  hero: SiteConfigHero;
  category_heroes: SiteConfigCategoryHeroes;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  code: string; // 6-character human-typeable (e.g. "KB89XZ")
  items: OrderItem[];
  total: number;
  status: 'new' | 'confirmed' | 'fulfilled';
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  size: string;
  quantity: number;
}
