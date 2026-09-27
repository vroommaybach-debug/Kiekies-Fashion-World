import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../../types';
import { useRouter } from '../../lib/router';
import { formatNGN, getWhatsAppInquiryUrl } from '../../lib/whatsapp';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SignatureLookSectionProps {
  product: Product | null;
}

export const SignatureLookSection: React.FC<SignatureLookSectionProps> = ({ product }) => {
  const { navigate } = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  const [palette, setPalette] = useState<ColorPalette>(() =>
    product ? extractPaletteFromImage(product.image_url) : extractPaletteFromImage('')
  );

  useEffect(() => {
    if (product) {
      extractPaletteFromImage(product.image_url, (p) => setPalette(p));
    }
  }, [product]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !product) return;

    const ctx = gsap.context(() => {
      // 1. Clip-path image wipe
      if (imageContainerRef.current) {
        gsap.fromTo(
          imageContainerRef.current,
          {
            clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
            scale: 1.08,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            scale: 1,
            duration: 1.4,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      // 2. Text column staggered reveal
      if (textColRef.current) {
        const children = textColRef.current.children;
        gsap.fromTo(
          children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [product]);

  if (!product) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-neutral-950 py-28 md:py-40 px-6 md:px-12 border-b border-neutral-900 overflow-hidden"
    >
      {/* Ambient Chromatic Backdrop Wash */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${palette.bgWash}, transparent 65%)`,
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-16 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: palette.accent }} />
            <span
              className="text-[10px] tracking-[0.4em] uppercase font-mono"
              style={{ color: palette.accent }}
            >
              Issue No. 04 · Signature Look
            </span>
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-mono hidden sm:inline">
            Atelier Centerpiece
          </span>
        </div>

        {/* 2-Column Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Column 1: Clip-path Image */}
          <div className="lg:col-span-7">
            <div
              ref={imageContainerRef}
              onClick={() => navigate(`/product/${product.id}`)}
              className="group relative aspect-[3/4] sm:aspect-[4/5] bg-black overflow-hidden border cursor-pointer will-change-transform"
              style={{
                borderColor: palette.borderGlow || 'rgba(255,255,255,0.15)',
                boxShadow: `0 20px 60px -15px ${palette.bgWash}`,
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <span
                    className="text-[9px] tracking-[0.35em] uppercase font-mono block mb-1"
                    style={{ color: palette.accent }}
                  >
                    Garment of the Season
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl text-white font-light">
                    {product.name}
                  </span>
                </div>
                <span className="text-xs uppercase tracking-widest text-white/90 border-b border-white pb-0.5">
                  Inspect Piece
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Magazine Prose */}
          <div ref={textColRef} className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span
                className="text-xs uppercase tracking-[0.3em] font-mono block"
                style={{ color: palette.accent }}
              >
                The Centerpiece · {product.category}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-tight leading-tight">
                {product.name}
              </h3>
              <p className="font-mono text-2xl font-bold tracking-wide" style={{ color: palette.accent }}>
                {formatNGN(product.price)}
              </p>
            </div>

            <div
              className="w-16 h-[2px]"
              style={{ backgroundColor: palette.accent }}
            />

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              <p>
                {product.description ||
                  'Constructed with uncompromised architectural precision. Every seam is pressed and finished by hand in our Lagos workshop, using saturated structured cloth chosen for timeless drape.'}
              </p>
              <p className="italic font-serif text-lg text-neutral-200">
                “This piece was cut specifically for the woman navigating high-stakes boardrooms and gala evenings without losing a single degree of poise.”
              </p>
            </div>

            {/* Sizing Available */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 block font-mono">
                Available Size Range
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-300">
                {product.sizes.map((sz, i) => (
                  <span key={sz}>
                    {sz}
                    {i < product.sizes.length - 1 && <span className="text-neutral-600 ml-2">/</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="px-8 py-4 text-black text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: `0 8px 30px ${palette.glow}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = palette.accent;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                <span>Acquire Piece</span>
                <ArrowRight size={15} />
              </button>

              <a
                href={getWhatsAppInquiryUrl(product.name, product.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 text-xs uppercase tracking-[0.2em] font-mono transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
