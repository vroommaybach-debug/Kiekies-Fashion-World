import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useRouter } from '../../lib/router';
import { formatNGN } from '../../lib/whatsapp';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';

interface BestSellersSectionProps {
  products: Product[];
}

const BestSellerCard: React.FC<{ product: Product }> = ({ product }) => {
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
      className="group cursor-pointer flex flex-col"
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
        className="relative aspect-[3/4] bg-neutral-950 overflow-hidden border transition-all duration-500 mb-5"
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
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
      </div>

      {/* Product Info */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-mono text-neutral-400 mb-1">
            <span style={{ color: palette.accent }}>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>Sizes: {product.sizes.join(', ')}</span>
          </div>
          <h3 className="font-serif text-xl tracking-wide text-white group-hover:text-amber-200 transition-colors font-light">
            {product.name}
          </h3>
        </div>
        <p className="text-sm font-mono tracking-wider font-semibold pt-2" style={{ color: palette.accent }}>
          {formatNGN(product.price)}
        </p>
      </div>
    </div>
  );
};

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products }) => {
  const bestSellers = products.filter((p) => p.best_seller).slice(0, 6);

  if (bestSellers.length === 0) return null;

  return (
    <section className="w-full bg-black py-28 md:py-36 px-6 md:px-12 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-3 font-mono">
              Quiet Provenance
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide uppercase font-light text-white">
              Permanent Foundations
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm tracking-wider leading-relaxed">
            Silhouettes embraced by clients across Nigeria and the diaspora. Understated pieces that require no fanfare.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {bestSellers.map((product) => (
            <BestSellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
