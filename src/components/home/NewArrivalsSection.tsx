import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../../types';
import { useRouter } from '../../lib/router';
import { formatNGN } from '../../lib/whatsapp';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';
import { ArrowUpRight, Radio } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface NewArrivalsSectionProps {
  products: Product[];
}

const ProductFeedCard: React.FC<{ product: Product }> = ({ product }) => {
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
      className="product-feed-card flex-shrink-0 w-[300px] sm:w-[350px] md:w-[400px] group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/product/${product.id}`);
        }
      }}
    >
      {/* Image Container with Dynamic Chromatic Border and Glow */}
      <div
        className="relative aspect-[3/4] bg-neutral-950 overflow-hidden border transition-all duration-500 mb-4"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = palette.accent;
          e.currentTarget.style.boxShadow = `0 12px 35px -8px ${palette.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient bottom color wash */}
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${palette.bgWash} 0%, transparent 60%)`,
          }}
        />

        {/* Floating Quick Action */}
        <div
          className="absolute bottom-4 right-4 w-10 h-10 border flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            borderColor: palette.accent,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: palette.accent,
          }}
        >
          <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Unboxed Metadata */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-mono text-neutral-400">
          <span style={{ color: palette.accent }}>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span>{product.sizes.length} sizes</span>
        </div>
        <h3 className="font-serif text-xl tracking-wide text-white group-hover:text-amber-200 transition-colors line-clamp-1 font-light">
          {product.name}
        </h3>
        <p className="text-sm font-mono tracking-wider font-semibold" style={{ color: palette.accent }}>
          {formatNGN(product.price)}
        </p>
      </div>
    </div>
  );
};

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const newArrivals = products.slice(0, 8);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Set up pinning & horizontal scroll with GSAP on larger screens (>= 768px)
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      if (!triggerRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const totalWidth = track.scrollWidth - window.innerWidth + 200;

      const tween = gsap.to(track, {
        x: () => -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top top',
          end: () => `+=${totalWidth * 1.1}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [products]);

  return (
    <section ref={sectionRef} className="w-full bg-black border-b border-neutral-900 overflow-hidden">
      {/* Kinetic Live Feed Ticker */}
      <div className="w-full bg-neutral-950 border-b border-neutral-900 py-3 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-[11px] uppercase tracking-[0.3em] font-mono text-neutral-400 mx-4">
              <span className="flex items-center gap-2 text-emerald-400">
                <Radio size={12} className="animate-pulse" />
                Live Feed
              </span>
              <span>·</span>
              <span className="text-white">Active Lagos Releases</span>
              <span>·</span>
              <span className="text-amber-400">100% Saturated Palette</span>
              <span>·</span>
              <span>Bespoke Hand Finishing</span>
              <span>·</span>
              <span className="text-fuchsia-400">WhatsApp Atelier Ready</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div ref={triggerRef} className="py-20 md:py-28 min-h-[560px]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-mono block mb-2">
                Real-Time Workshop Dispatch
              </span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-wide uppercase font-light text-white">
                New Arrivals — The Live Feed
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm tracking-wider font-light">
              Scroll to scrub through recent cuts from our workshop floor. Each garment generates its own chromatic resonance.
            </p>
          </div>
        </div>

        {/* Horizontal Track (pinned on desktop, momentum swipe on mobile) */}
        <div
          ref={trackRef}
          className="flex gap-8 px-6 md:px-12 overflow-x-auto md:overflow-visible hide-scrollbar will-change-transform pb-6"
        >
          {newArrivals.map((product) => (
            <ProductFeedCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
};
