import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useRouter } from '../../lib/router';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';
import { ArrowUpRight } from 'lucide-react';

interface HeroSectionProps {
  heroImageUrl: string;
  isReady?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroImageUrl,
  isReady = true,
}) => {
  const { navigate } = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const quickDoorsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [palette, setPalette] = useState<ColorPalette>(() =>
    extractPaletteFromImage(heroImageUrl || 'kiekies-atelier')
  );

  useEffect(() => {
    if (!heroImageUrl) return;
    const updated = extractPaletteFromImage(heroImageUrl, (pal) => {
      setPalette(pal);
    });
    setPalette(updated);
  }, [heroImageUrl]);

  useEffect(() => {
    if (!isReady || !heroImageUrl) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Smooth cinematic zoom-out reveal of the exact uploaded hero image
      if (imageRef.current) {
        gsap.set(imageRef.current, {
          scale: 1.16,
          opacity: 0.25,
        });

        tl.to(imageRef.current, {
          scale: 1,
          opacity: 1,
          duration: 1.8,
          ease: 'power3.out',
        });
      }

      // 2. Extracted accent glow wash expansion
      if (glowRef.current) {
        gsap.set(glowRef.current, { scale: 0.75, opacity: 0 });
        tl.to(
          glowRef.current,
          {
            scale: 1.15,
            opacity: 0.85,
            duration: 2.0,
            ease: 'sine.out',
          },
          0.15
        );
      }

      // 3. Brand name "KIEKIES" character stagger
      if (titleRef.current) {
        const letters = titleRef.current.querySelectorAll('.hero-letter');
        gsap.set(letters, {
          y: 48,
          opacity: 0,
          scale: 0.9,
        });

        tl.to(
          letters,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.06,
            duration: 0.95,
            ease: 'back.out(1.4)',
          },
          0.35
        );
      }

      // 4. Subtitle, CTAs & Mobile Quick-Doors glide up
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { y: 18, opacity: 0 });
        tl.to(
          subtitleRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          0.75
        );
      }

      if (ctaRef.current) {
        gsap.set(ctaRef.current, { y: 22, opacity: 0 });
        tl.to(
          ctaRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          0.9
        );
      }

      if (quickDoorsRef.current) {
        gsap.set(quickDoorsRef.current, { y: 18, opacity: 0 });
        tl.to(
          quickDoorsRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          1.05
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [heroImageUrl, isReady]);

  const brandChars = ['K', 'I', 'E', 'K', 'I', 'E', 'S'];

  const mobileQuickCategories = [
    { label: 'Women', href: '/category/women' },
    { label: 'Men', href: '/category/men' },
    { label: 'Kids', href: '/category/kids' },
    { label: 'Accessories', href: '/category/accessories' },
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100svh] bg-[#050505] overflow-hidden flex flex-col justify-between pt-24 pb-10 sm:py-24"
    >
      {/* Background Image Container — Only renders the verified uploaded hero image */}
      <div className="absolute inset-0 overflow-hidden bg-[#050505]">
        {heroImageUrl && (
          <img
            ref={imageRef}
            src={heroImageUrl}
            alt="Kiekies Fashion World Editorial Showcase"
            className="w-full h-full object-cover object-center brightness-95 contrast-105 will-change-transform"
            loading="eager"
            fetchPriority="high"
          />
        )}

        {/* Dynamic Extracted Color Tint & Vignette */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, ${palette.bgWash}, transparent 68%)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/65 pointer-events-none" />
      </div>

      {/* Top Spacer for vertical centering */}
      <div className="hidden sm:block" />

      {/* Hero Foreground Content */}
      <div className="relative z-10 text-center px-5 max-w-5xl mx-auto my-auto flex flex-col items-center">
        {/* Editorial Tag */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-1.5 border mb-5 sm:mb-6 backdrop-blur-md transition-colors"
          style={{
            borderColor: palette.borderGlow || palette.accent,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <span
            className="text-[10px] tracking-[0.38em] uppercase font-sans font-medium"
            style={{ color: palette.accent }}
          >
            Kiekies Fashion World · Lagos Atelier
          </span>
        </div>

        {/* SplitText Headline */}
        <h1
          ref={titleRef}
          className="font-serif text-[2.85rem] xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.22em] sm:tracking-[0.32em] uppercase font-light text-white flex justify-center pl-[0.22em] sm:pl-[0.32em] select-none leading-none"
        >
          {brandChars.map((char, index) => (
            <span
              key={index}
              className="hero-letter inline-block transform-gpu will-change-transform"
            >
              {char}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="text-[11px] sm:text-sm text-neutral-200 max-w-md sm:max-w-lg tracking-[0.22em] sm:tracking-[0.25em] uppercase font-light mt-5 sm:mt-8 leading-relaxed"
        >
          Confidence Through Bold Restraint · Nigerian Contemporary Tailoring
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="mt-8 sm:mt-11 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <button
            onClick={() => navigate('/category/women')}
            className="w-full sm:w-auto min-h-[48px] px-8 py-4 text-black text-xs uppercase tracking-[0.25em] font-semibold transition-transform duration-300 active:scale-[0.98] hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2"
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
            <span>Explore Full Catalog</span>
            <ArrowUpRight size={15} />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('thesis');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto min-h-[48px] px-8 py-4 border text-white text-xs uppercase tracking-[0.25em] font-medium backdrop-blur-sm transition-all active:scale-[0.98] hover:bg-white/10"
            style={{
              borderColor: palette.borderGlow || 'rgba(255,255,255,0.4)',
            }}
          >
            Experience The Motion
          </button>
        </div>

        {/* Mobile Thumb-Zone Quick Category Rail */}
        <div
          ref={quickDoorsRef}
          className="mt-7 sm:hidden w-full max-w-sm"
        >
          <span className="block text-[9px] tracking-[0.32em] uppercase font-mono text-neutral-400 mb-2.5">
            Direct Atelier Chambers
          </span>
          <div className="grid grid-cols-2 gap-2">
            {mobileQuickCategories.map((cat) => (
              <button
                key={cat.href}
                onClick={() => navigate(cat.href)}
                className="min-h-[44px] px-3 py-2.5 bg-black/65 backdrop-blur-md border border-white/15 active:border-amber-400 active:scale-[0.97] transition-all flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-neutral-200"
              >
                <span>{cat.label}</span>
                <ArrowUpRight size={13} style={{ color: palette.accent }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="relative z-10 hidden sm:flex flex-col items-center gap-2 pointer-events-none opacity-80">
        <span
          className="text-[9px] tracking-[0.3em] uppercase font-sans font-medium"
          style={{ color: palette.accent }}
        >
          Scroll To Explore
        </span>
        <div
          className="w-[1px] h-7"
          style={{ backgroundImage: `linear-gradient(to bottom, ${palette.accent}, transparent)` }}
        />
      </div>
    </section>
  );
};
