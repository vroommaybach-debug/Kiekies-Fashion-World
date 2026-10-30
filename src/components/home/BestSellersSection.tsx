import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../../types';
import { useRouter } from '../../lib/router';
import { formatNGN } from '../../lib/whatsapp';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';
import { LayoutGrid, Rows } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BestSellersSectionProps {
  products: Product[];
}

const BestSellerCard: React.FC<{ product: Product; compactMobile?: boolean }> = ({
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
      className="bestseller-card group cursor-pointer flex flex-col active:scale-[0.98] transition-transform duration-300"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/product/${product.id}`);
        }
      }}
    >
      {/* Image Container with subtle chromatic border & lift on hover */}
      <div
        className="relative aspect-[3/4] bg-neutral-950 overflow-hidden border transition-all duration-500 mb-3.5 sm:mb-5"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = palette.accent;
          e.currentTarget.style.boxShadow = `0 14px 40px -10px ${palette.glow}`;
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
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
      </div>

      {/* Product Info */}
      <div className="space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-mono text-neutral-400 mb-1 truncate">
            <span style={{ color: palette.accent }}>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">
              {compactMobile
                ? `${product.sizes.length} sizes`
                : `Sizes: ${product.sizes.join(', ')}`}
            </span>
          </div>
          <h3
            className={`font-serif tracking-wide text-white group-hover:text-amber-200 transition-colors font-light line-clamp-1 ${
              compactMobile ? 'text-base sm:text-xl' : 'text-xl'
            }`}
          >
            {product.name}
          </h3>
        </div>
        <p
          className="text-xs sm:text-sm font-mono tracking-wider font-semibold pt-1.5 tabular-nums"
          style={{ color: palette.accent }}
        >
          {formatNGN(product.price)}
        </p>
      </div>
    </div>
  );
};

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mobileTwoCol, setMobileTwoCol] = useState<boolean>(true);
  const bestSellers = products.filter((p) => p.best_seller).slice(0, 6);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || bestSellers.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.bestseller-card');
      if (!cards || cards.length === 0) return;

      gsap.fromTo(
        cards,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [bestSellers.length, mobileTwoCol]);

  if (bestSellers.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="w-full bg-black py-20 sm:py-28 md:py-36 px-5 sm:px-6 md:px-12 border-b border-neutral-900"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4">
          <div>
            <span className="block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-3 font-mono">
              Best Sellers · Quiet Provenance
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase font-light text-white">
              Permanent Foundations
            </h2>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <p className="text-xs text-neutral-400 max-w-xs sm:max-w-sm tracking-wider leading-relaxed">
              Silhouettes embraced by clients across Nigeria and the diaspora.
            </p>

            {/* Mobile Boutique Grid / Editorial Lookbook Switcher */}
            <div className="flex sm:hidden items-center border border-neutral-800 bg-neutral-950 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTwoCol(true)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                  mobileTwoCol ? 'bg-white text-black' : 'text-neutral-400'
                }`}
                aria-label="2-column mobile boutique grid"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setMobileTwoCol(false)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                  !mobileTwoCol ? 'bg-white text-black' : 'text-neutral-400'
                }`}
                aria-label="1-column mobile lookbook view"
              >
                <Rows size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div
          className={`grid ${
            mobileTwoCol ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-8'
          } sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 md:gap-12`}
        >
          {bestSellers.map((product) => (
            <BestSellerCard
              key={product.id}
              product={product}
              compactMobile={mobileTwoCol}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
