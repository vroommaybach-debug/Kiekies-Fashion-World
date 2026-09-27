import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useRouter } from '../../lib/router';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';

interface HeroSectionProps {
  heroImageUrl: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ heroImageUrl }) => {
  const { navigate } = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [palette, setPalette] = useState<ColorPalette>(() =>
    extractPaletteFromImage(heroImageUrl)
  );

  useEffect(() => {
    const updated = extractPaletteFromImage(heroImageUrl, (pal) => {
      setPalette(pal);
    });
    setPalette(updated);
  }, [heroImageUrl]);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Off-axis entrance for hero image
      if (imageRef.current) {
        gsap.set(imageRef.current, {
          scale: 1.28,
          rotation: -2.5,
          opacity: 0.1,
          filter: 'blur(12px)',
        });

        tl.to(imageRef.current, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 2.2,
          ease: 'power4.out',
        });
      }

      // 2. Extracted accent glow wash expansion
      if (glowRef.current) {
        gsap.set(glowRef.current, { scale: 0.6, opacity: 0 });
        tl.to(
          glowRef.current,
          {
            scale: 1.2,
            opacity: 0.85,
            duration: 2.4,
            ease: 'sine.out',
          },
          0.2
        );
      }

      // 3. Brand name "KIEKIES" SplitText character stagger with slight overshoot
      if (titleRef.current) {
        const letters = titleRef.current.querySelectorAll('.hero-letter');
        gsap.set(letters, {
          y: 70,
          opacity: 0,
          scale: 0.8,
          rotationX: -45,
        });

        tl.to(
          letters,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotationX: 0,
            stagger: 0.08,
            duration: 1.1,
            ease: 'back.out(1.7)',
          },
          0.8
        );
      }

      // 4. Subtitle and CTA buttons fade & slide up
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { y: 20, opacity: 0 });
        tl.to(
          subtitleRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
          },
          1.3
        );
      }

      if (ctaRef.current) {
        gsap.set(ctaRef.current, { y: 25, opacity: 0 });
        tl.to(
          ctaRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
          },
          1.5
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [heroImageUrl]);

  const brandChars = ['K', 'I', 'E', 'K', 'I', 'E', 'S'];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[700px] bg-black overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: '#050505',
      }}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imageRef}
          src={heroImageUrl}
          alt="Kiekies Fashion Editorial"
          className="w-full h-full object-cover object-center brightness-90 contrast-110 will-change-transform"
          loading="eager"
        />

        {/* Dynamic Extracted Color Tint & Vignette */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, ${palette.bgWash}, transparent 65%)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        {/* Dynamic Category Pill / Tag tinted by extracted color */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 border mb-6 backdrop-blur-md transition-colors"
          style={{
            borderColor: palette.borderGlow || palette.accent,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: palette.accent }}
          />
          <span
            className="text-[10px] tracking-[0.45em] uppercase font-sans font-medium"
            style={{ color: palette.accent }}
          >
            Lagos Atelier · In High Saturation
          </span>
        </div>

        {/* SplitText Headline */}
        <h1
          ref={titleRef}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.25em] sm:tracking-[0.32em] uppercase font-light text-white flex justify-center pl-[0.25em] select-none"
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
          className="text-xs sm:text-sm text-neutral-200 max-w-lg tracking-[0.25em] uppercase font-light mt-6 sm:mt-8 leading-relaxed"
        >
          Confidence Through Bold Restraint · Nigerian Contemporary Tailoring
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => navigate('/category/women')}
            className="w-full sm:w-auto px-8 py-4 text-black text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
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
            Explore Full Color
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('thesis');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 border text-white text-xs uppercase tracking-[0.25em] font-medium backdrop-blur-sm transition-all hover:bg-white/10"
            style={{
              borderColor: palette.borderGlow || 'rgba(255,255,255,0.4)',
            }}
          >
            Experience The Motion
          </button>
        </div>
      </div>

      {/* Kinetic Ambient Lighting Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none opacity-80">
        <span
          className="text-[9px] tracking-[0.3em] uppercase font-sans font-medium"
          style={{ color: palette.accent }}
        >
          Scroll To Ignite
        </span>
        <div
          className="w-[2px] h-8 bg-gradient-to-b to-transparent animate-pulse"
          style={{ backgroundImage: `linear-gradient(to bottom, ${palette.accent}, transparent)` }}
        />
      </div>
    </section>
  );
};
