import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../../types';
import { useRouter } from '../../lib/router';
import { formatNGN } from '../../lib/whatsapp';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

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
      className="product-feed-card snap-center flex-shrink-0 w-[82vw] max-w-[330px] sm:w-[350px] md:w-[400px] group cursor-pointer active:scale-[0.985] transition-transform duration-300"
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
          borderColor: 'rgba(255, 255, 255, 0.12)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = palette.accent;
          e.currentTarget.style.boxShadow = `0 12px 35px -8px ${palette.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient bottom color wash */}
        <div
          className="absolute inset-0 opacity-25 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${palette.bgWash} 0%, transparent 60%)`,
          }}
        />

        {/* Floating Quick Action */}
        <div
          className="absolute bottom-4 right-4 w-10 h-10 border flex items-center justify-center text-white backdrop-blur-md opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
          style={{
            borderColor: palette.accent,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
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
        <p
          className="text-sm font-mono tracking-wider font-semibold tabular-nums"
          style={{ color: palette.accent }}
        >
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
  const [scrollProgress, setScrollProgress] = useState(0);

  const newArrivals = products.slice(0, 8);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      if (!triggerRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const totalWidth = Math.max(0, track.scrollWidth - window.innerWidth + 160);
      if (totalWidth <= 0) return;

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

  const handleMobileTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    setScrollProgress(Math.min(100, Math.max(0, (track.scrollLeft / maxScroll) * 100)));
  };

  const scrollMobileByCard = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: dir * 310,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="w-full bg-black border-b border-neutral-900 overflow-hidden"
    >
      {/* Kinetic Live Feed Ticker */}
      <div className="w-full bg-neutral-950 border-b border-neutral-900 py-3 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-8 text-[11px] uppercase tracking-[0.3em] font-mono text-neutral-400 mx-4"
            >
              <span className="text-amber-400">Kiekies Fashion World</span>
              <span>·</span>
              <span className="text-white">Active Lagos Releases</span>
              <span>·</span>
              <span>Saturated Atelier Palette</span>
              <span>·</span>
              <span>Bespoke Hand Finishing</span>
              <span>·</span>
              <span className="text-amber-300">WhatsApp Concierge Ready</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div ref={triggerRef} className="py-16 sm:py-20 md:py-28 min-h-[520px]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-mono block mb-2">
                Real-Time Workshop Dispatch
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase font-light text-white">
                New Arrivals — The Live Feed
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <p className="text-xs text-neutral-400 max-w-xs tracking-wider font-light">
                Swipe or scroll through recent cuts from our Lagos workshop floor.
              </p>

              {/* Mobile Thumb Stepper Controls */}
              <div className="flex md:hidden items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollMobileByCard(-1)}
                  className="min-w-[44px] min-h-[44px] border border-neutral-800 bg-neutral-950 text-neutral-200 active:border-amber-400 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Previous arrival"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollMobileByCard(1)}
                  className="min-w-[44px] min-h-[44px] border border-neutral-800 bg-neutral-950 text-neutral-200 active:border-amber-400 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Next arrival"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Track (pinned on desktop, snap carousel on mobile) */}
        <div
          ref={trackRef}
          onScroll={handleMobileTrackScroll}
          className="flex gap-5 sm:gap-8 px-5 sm:px-6 md:px-12 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scroll-smooth hide-scrollbar will-change-transform pb-6"
        >
          {newArrivals.map((product) => (
            <ProductFeedCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile Swipe Progress Indicator */}
        <div className="md:hidden px-5 mt-2">
          <div className="w-full h-[2px] bg-neutral-900 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${Math.max(18, scrollProgress)}%` }}
            />
          </div>
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
