/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, SiteConfig } from './types';
import { getProducts, getSiteConfig, subscribeToStorefront } from './lib/db';
import { DEFAULT_SITE_CONFIG, INITIAL_PRODUCTS } from './lib/defaultData';
import { RouterProvider, useRouter, parseRoute } from './lib/router';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { OrderSummaryPage } from './pages/OrderSummaryPage';
import { CartPage } from './pages/CartPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const { path } = useRouter();
  const route = parseRoute(path);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  const loadData = async () => {
    try {
      const [prods, config] = await Promise.all([
        getProducts({ status: 'all' }),
        getSiteConfig(),
      ]);
      if (prods && prods.length > 0) setProducts(prods);
      if (config) setSiteConfig(config);
    } catch (err) {
      console.error('Failed to load initial atelier data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorefront(
      (liveProducts) => {
        if (liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      },
      (liveConfig) => {
        if (liveConfig) {
          setSiteConfig(liveConfig);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const isHome = route.name === 'home';

  // Render route content
  const renderCurrentView = () => {
    switch (route.name) {
      case 'home':
        return (
          <HomePage
            products={products.filter((p) => p.status === 'published')}
            siteConfig={siteConfig}
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
      {/* Whisper Navbar (transparent on hero, dark glass on scroll or subpages) */}
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
