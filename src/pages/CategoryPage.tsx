import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CategorySlug, Product, SiteConfigCategoryHeroes } from '../types';
import { useRouter } from '../lib/router';
import { formatNGN } from '../lib/whatsapp';
import { MetaSEO } from '../components/MetaSEO';
import { extractPaletteFromImage, ColorPalette } from '../lib/colorExtractor';
import { SlidersHorizontal, LayoutGrid, Rows } from 'lucide-react';

interface CategoryPageProps {
  slug: string;
  products: Product[];
  categoryHeroes: SiteConfigCategoryHeroes;
}

const CategoryProductCard: React.FC<{ product: Product; compactMobile?: boolean }> = ({
  product,
  compactMobile = false,
}) => {
  const { navigate } = useRouter();
  const [palette, setPalette] = useState<ColorPalette>(() =>
    extractPaletteFromImage(product.image_url)
  );

  useEffect(() => {
    extractPaletteFromImage(product.image_url, (p) => setPalette(p));
  }, [product.image_url]);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="category-product-card group cursor-pointer flex flex-col active:scale-[0.98] transition-transform duration-300"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/product/${product.id}`);
        }
      }}
    >
      <div
        className="relative aspect-[3/4] bg-neutral-950 overflow-hidden border transition-all duration-500 mb-3.5 sm:mb-4"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = palette.accent;
          e.currentTarget.style.boxShadow = `0 12px 35px -8px ${palette.glow}`;
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0px)';
        }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-mono text-neutral-400 truncate">
          <span>
            {compactMobile
              ? `${product.sizes.length} sizes`
              : `Sizes: ${product.sizes.join(', ')}`}
          </span>
        </div>
        <h3
          className={`font-serif tracking-wide text-white group-hover:text-amber-200 transition-colors font-light line-clamp-1 ${
            compactMobile ? 'text-base sm:text-lg' : 'text-lg'
          }`}
        >
          {product.name}
        </h3>
        <p
          className="text-xs font-mono tracking-wider font-semibold tabular-nums"
          style={{ color: palette.accent }}
        >
          {formatNGN(product.price)}
        </p>
      </div>
    </div>
  );
};

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug, products, categoryHeroes }) => {
  const { navigate } = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [mobileTwoCol, setMobileTwoCol] = useState<boolean>(true);

  const validSlug = (
    ['women', 'men', 'kids', 'accessories'].includes(slug) ? slug : 'women'
  ) as CategorySlug;

  const categoryTitles: Record<
    CategorySlug,
    { title: string; subtitle: string; description: string }
  > = {
    women: {
      title: "Women's Collection",
      subtitle: 'The Executive Silhouette',
      description:
        'Saffron trenches, cobalt column gowns, and tailored separates engineered for authority and ease.',
    },
    men: {
      title: "Men's Collection",
      subtitle: 'The Modern Monolith',
      description:
        'Sculptural malachite agbadas, imperial indigo kaftans, and ceremonial suiting.',
    },
    kids: {
      title: "Kids' Heritage",
      subtitle: 'The Scaled Legacy',
      description:
        'Terracotta junior gabardines and solar ochre pieces with heirloom standards.',
    },
    accessories: {
      title: 'Artisanal Accessories',
      subtitle: 'Sculptural Leather & Form',
      description:
        'Cognac calfskin monolith bags, burnished harness belts, and tactile finishing hardware.',
    },
  };

  const meta = categoryTitles[validSlug];
  const heroImage = categoryHeroes[validSlug];

  const [categoryPalette, setCategoryPalette] = useState<ColorPalette>(() =>
    extractPaletteFromImage(heroImage || validSlug)
  );

  useEffect(() => {
    if (!heroImage) return;
    extractPaletteFromImage(heroImage, (p) => setCategoryPalette(p));
  }, [heroImage, validSlug]);

  // Filter products by category
  let categoryProducts = products.filter((p) => p.category === validSlug);

  // Sort
  categoryProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Staggered card entrance animation when switching category or sort
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.category-product-card');
      if (!cards || cards.length === 0) return;

      gsap.fromTo(
        cards,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [validSlug, sortBy, mobileTwoCol, categoryProducts.length]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: typeof window !== 'undefined' ? window.location.origin : 'https://kiekiesfashion.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: meta.title,
        item: `${typeof window !== 'undefined' ? window.location.origin : 'https://kiekiesfashion.com'}/category/${validSlug}`,
      },
    ],
  };

  const allTabs: Array<{ slug: CategorySlug; label: string }> = [
    { slug: 'women', label: 'Women' },
    { slug: 'men', label: 'Men' },
    { slug: 'kids', label: 'Kids' },
    { slug: 'accessories', label: 'Accessories' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 sm:pt-24 pb-24 relative overflow-hidden">
      {/* Dynamic Background Wash */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none transition-all duration-1000 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${categoryPalette.accent}, transparent 70%)`,
        }}
      />

      <MetaSEO
        title={`${meta.title} | Kiekies Fashion World`}
        description={meta.description}
        image={heroImage}
        jsonLd={breadcrumbSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-neutral-400">
            <li>
              <button
                onClick={() => navigate('/')}
                className="min-h-[36px] hover:text-white transition-colors"
              >
                Home
              </button>
            </li>
            <li aria-hidden="true" className="text-neutral-600">
              /
            </li>
            <li className="text-neutral-200 capitalize">{validSlug}</li>
          </ol>
        </nav>

        {/* Category Header Banner */}
        <div
          className="relative w-full h-56 sm:h-80 md:h-96 overflow-hidden border mb-6 sm:mb-8 bg-neutral-950 transition-colors"
          style={{
            borderColor: categoryPalette.borderGlow || 'rgba(255, 255, 255, 0.15)',
            boxShadow: `0 15px 45px -10px ${categoryPalette.bgWash}`,
          }}
        >
          {heroImage && (
            <img
              src={heroImage}
              alt={meta.title}
              className="w-full h-full object-cover brightness-95 contrast-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span
                className="text-[10px] tracking-[0.38em] uppercase font-mono block mb-1.5 sm:mb-2"
                style={{ color: categoryPalette.accent }}
              >
                {meta.subtitle}
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-light tracking-wide uppercase">
                {meta.title}
              </h1>
            </div>
            <p className="text-xs text-neutral-200 max-w-sm font-light leading-relaxed hidden sm:block">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Sleek Touch-Friendly Category Switcher Rail */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-4 mb-4 border-b border-neutral-900">
          {allTabs.map((tab) => {
            const active = tab.slug === validSlug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => navigate(`/category/${tab.slug}`)}
                className={`min-h-[44px] px-4 py-2 text-xs uppercase tracking-[0.2em] font-mono border transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                  active
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter, Mobile View Toggle & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-neutral-800 mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
            {categoryProducts.length} {categoryProducts.length === 1 ? 'piece' : 'pieces'}
          </span>

          <div className="flex items-center gap-3">
            {/* Mobile Grid View Switcher */}
            <div className="flex sm:hidden items-center border border-neutral-800 bg-neutral-950">
              <button
                type="button"
                onClick={() => setMobileTwoCol(true)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                  mobileTwoCol ? 'bg-white text-black' : 'text-neutral-400'
                }`}
                aria-label="2-column mobile grid"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setMobileTwoCol(false)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                  !mobileTwoCol ? 'bg-white text-black' : 'text-neutral-400'
                }`}
                aria-label="1-column mobile lookbook"
              >
                <Rows size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-neutral-400 hidden xs:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="min-h-[44px] bg-black border border-neutral-800 text-xs uppercase tracking-wider text-neutral-200 py-1.5 px-3 focus:border-white focus:outline-none font-mono"
              >
                <option value="newest">Newest Releases</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 border border-neutral-900 bg-neutral-950">
            <p className="font-serif text-xl text-neutral-300 mb-2">New Pieces In Workshop</p>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              The {validSlug} atelier is currently finalizing this season&apos;s releases. Reach out on WhatsApp for upcoming lookbook previews.
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className={`grid ${
              mobileTwoCol ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-8'
            } sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 md:gap-12`}
          >
            {categoryProducts.map((product) => (
              <CategoryProductCard
                key={product.id}
                product={product}
                compactMobile={mobileTwoCol}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
