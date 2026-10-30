/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Product, SiteConfig } from './types';
import {
  getProducts,
  getSiteConfig,
  subscribeToStorefront,
  getVerifiedCachedSiteConfig,
  getVerifiedCachedProducts,
  preloadImageAsset,
} from './lib/db';
import { DEFAULT_SITE_CONFIG, INITIAL_PRODUCTS } from './lib/defaultData';
import { RouterProvider, useRouter, parseRoute } from './lib/router';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { BrandPreloader } from './components/BrandPreloader';

import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { OrderSummaryPage } from './pages/OrderSummaryPage';
import { CartPage } from './pages/CartPage';
import { AdminPage } from './pages/AdminPage';

// Blank placeholder config used only before Firestore responds on cold cache so legacy hero never renders
const EMPTY_BOOT_SITE_CONFIG: SiteConfig = {
  hero: { imageUrl: '' },
  category_heroes: {
    women: '',
    men: '',
    kids: '',
    accessories: '',
  },
};

function AppContent() {
  const { path } = useRouter();
  const route = parseRoute(path);

  const [products, setProducts] = useState<Product[]>(
    () => getVerifiedCachedProducts() || []
  );
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(
    () => getVerifiedCachedSiteConfig() || EMPTY_BOOT_SITE_CONFIG
  );
  const [isBootReady, setIsBootReady] = useState<boolean>(false);
  const [showPreloader, setShowPreloader] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const [prods, config] = await Promise.all([
        getProducts({ status: 'all' }),
        getSiteConfig(),
      ]);

      const resolvedConfig = config || DEFAULT_SITE_CONFIG;
      const resolvedProducts =
        prods && prods.length > 0 ? prods : INITIAL_PRODUCTS;

      setProducts(resolvedProducts);
      setSiteConfig(resolvedConfig);

      // Preload & decode the exact active hero image before lifting the preloader
      if (resolvedConfig.hero?.imageUrl) {
        await preloadImageAsset(resolvedConfig.hero.imageUrl, 3800);
      }
    } catch (err) {
      console.error('Failed to load initial atelier data:', err);
      setSiteConfig((prev) =>
        prev.hero.imageUrl ? prev : DEFAULT_SITE_CONFIG
      );
      setProducts((prev) => (prev.length > 0 ? prev : INITIAL_PRODUCTS));
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const minAnimationPromise = new Promise<void>((resolve) =>
      window.setTimeout(resolve, 1350)
    );

    Promise.all([loadData(), minAnimationPromise]).then(() => {
      if (mounted) {
        setIsBootReady(true);
      }
    });

    const unsubscribe = subscribeToStorefront(
      (liveProducts) => {
        if (mounted && liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      },
      async (liveConfig) => {
        if (mounted && liveConfig?.hero?.imageUrl) {
          await preloadImageAsset(liveConfig.hero.imageUrl, 2500);
          if (mounted) {
            setSiteConfig(liveConfig);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadData]);

  const isHome = route.name === 'home';

  const renderCurrentView = () => {
    switch (route.name) {
      case 'home':
        return (
          <HomePage
            products={products.filter((p) => p.status === 'published')}
            siteConfig={siteConfig}
            isReady={isBootReady}
          />
        );

      case 'product':
        return (
          <ProductDetailPage
            productId={route.param || ''}
            products={products.filter((p) => p.status === 'published')}
          />
        );

      case 'category':
        return (
          <CategoryPage
            slug={route.param || 'women'}
            products={products.filter((p) => p.status === 'published')}
            categoryHeroes={siteConfig.category_heroes}
          />
        );

      case 'order':
        return <OrderSummaryPage orderCode={route.param || ''} />;

      case 'cart':
        return <CartPage />;

      case 'admin':
        return (
          <AdminPage
            products={products}
            siteConfig={siteConfig}
            onRefreshData={loadData}
            initialTab="hero"
          />
        );

      case 'admin_orders':
        return (
          <AdminPage
            products={products}
            siteConfig={siteConfig}
            onRefreshData={loadData}
            initialTab="orders"
          />
        );

      default:
        return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 pt-24 pb-16">
            <h1 className="font-serif text-4xl mb-4">404 · Page Not Found</h1>
            <p className="text-xs text-neutral-400 mb-8 max-w-sm text-center">
              The requested chamber does not exist in our atelier.
            </p>
            <a
              href="/"
              className="border border-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
            >
              Return Home
            </a>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      {/* Kiki's Fashion World Motion-Graphics Preloader */}
      {showPreloader && (
        <BrandPreloader
          isReady={isBootReady}
          onExited={() => setShowPreloader(false)}
        />
      )}

      {/* Whisper Navbar */}
      <Navbar faintOnHero={isHome} />

      {/* Main View */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </RouterProvider>
  );
}
