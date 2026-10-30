import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from '../../lib/router';
import { SiteConfigCategoryHeroes } from '../../types';
import { extractPaletteFromImage, ColorPalette } from '../../lib/colorExtractor';
import { ArrowUpRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CategoryFourDoorsSectionProps {
  categoryHeroes: SiteConfigCategoryHeroes;
}

interface WorldPanelProps {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ratio: string;
  index: number;
}

const WorldPanel: React.FC<WorldPanelProps> = ({
  slug,
  title,
  subtitle,
  description,
  image,
  ratio,
  index,
}) => {
  const { navigate } = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [palette, setPalette] = useState<ColorPalette>(() =>
    extractPaletteFromImage(image || slug)
  );

  useEffect(() => {
    if (!image) return;
    const updated = extractPaletteFromImage(image, (p) => setPalette(p));
    setPalette(updated);
  }, [image, slug]);

  // Mouse tilt tracking with GSAP inertia on desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.innerWidth < 768) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      rotateX,
      rotateY,
      scale: 1.015,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 900,
      transformOrigin: 'center center',
    });

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        x: (x - centerX) * 0.05,
        y: (y - centerY) * 0.05,
        scale: 1.08,
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.65,
        duration: 0.4,
      });
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card || window.innerWidth < 768) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
    });

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        x: 0,
        y: 0,
        scale: 1.03,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.28,
        duration: 0.6,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/category/${slug}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`door-panel-card group relative overflow-hidden bg-neutral-950 border border-neutral-900 cursor-pointer ${ratio} will-change-transform active:scale-[0.985] transition-transform duration-300`}
      role="button"
      tabIndex={0}
      style={{
        boxShadow: `0 10px 40px -10px ${palette.bgWash}`,
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/category/${slug}`);
        }
      }}
    >
      {/* Full Color Image */}
      <div className="absolute inset-0 overflow-hidden bg-neutral-950">
        {image && (
          <img
            ref={imageRef}
            src={image}
            alt={title}
            className="w-full h-full object-cover object-center scale-105 brightness-95 contrast-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        )}

        {/* Dynamic Color Wash intensifies on hover/touch */}
        <div
          ref={glowRef}
          className="absolute inset-0 transition-opacity duration-500 opacity-30 group-hover:opacity-75"
          style={{
            background: `linear-gradient(135deg, ${palette.bgWash} 0%, transparent 60%, ${palette.glow} 100%)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:from-black/90 transition-colors duration-500" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div
            className="px-3 py-1 text-[10px] tracking-[0.28em] uppercase font-mono border backdrop-blur-md transition-colors"
            style={{
              borderColor: palette.borderGlow || palette.accent,
              color: palette.accent,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            World 0{index + 1} · {slug}
          </div>

          <div
            className="w-11 h-11 border border-white/30 flex items-center justify-center text-white group-hover:rotate-45 transition-all duration-300 backdrop-blur-sm"
            style={{
              borderColor: palette.accent,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          >
            <ArrowUpRight size={18} style={{ color: palette.accent }} />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <span
            className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-mono block transition-colors"
            style={{ color: palette.accent }}
          >
            {subtitle}
          </span>
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide uppercase font-light text-white group-hover:translate-x-1.5 transition-transform">
            {title}
          </h3>
          <p className="text-xs text-neutral-300 max-w-md line-clamp-2 pt-0.5 font-light leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const CategoryFourDoorsSection: React.FC<CategoryFourDoorsSectionProps> = ({
  categoryHeroes,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.door-panel-card');
      if (!cards || cards.length === 0) return;

      gsap.fromTo(
        cards,
        {
          y: 36,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const doors = [
    {
      slug: 'women',
      title: 'Women',
      subtitle: 'The Executive Silhouette',
      description:
        'Saffron trenches, cobalt column gowns, and precision crimson tailoring designed for sovereign authority.',
      image: categoryHeroes.women,
      ratio: 'md:col-span-7 h-[390px] sm:h-[460px] md:h-[600px]',
    },
    {
      slug: 'men',
      title: 'Men',
      subtitle: 'The Modern Monolith',
      description:
        'Sculpted malachite agbadas and imperial indigo kaftans reimagining ceremonial Yoruba power.',
      image: categoryHeroes.men,
      ratio: 'md:col-span-5 h-[390px] sm:h-[460px] md:h-[600px]',
    },
    {
      slug: 'kids',
      title: 'Kids',
      subtitle: 'The Scaled Legacy',
      description:
        'Terracotta junior gabardines and solar ochre jumpsuits crafted with heirloom standards.',
      image: categoryHeroes.kids,
      ratio: 'md:col-span-5 h-[370px] sm:h-[440px] md:h-[520px]',
    },
    {
      slug: 'accessories',
      title: 'Accessories',
      subtitle: 'Sculptural Leather & Form',
      description:
        'Cognac calfskin monolith totes, burnished harness belts, and tactile gilded hardware.',
      image: categoryHeroes.accessories,
      ratio: 'md:col-span-7 h-[370px] sm:h-[440px] md:h-[520px]',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-black py-20 sm:py-28 md:py-36 px-5 sm:px-6 md:px-12 border-b border-neutral-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <span className="block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-3 font-mono">
              Curated Realms
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase font-light text-white">
              Shop By Category — Four Worlds
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm tracking-wider leading-relaxed">
            Move between four autonomous visual worlds. Tap or hover to enter each collection chamber.
          </p>
        </div>

        {/* Four Doors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8">
          {doors.map((door, idx) => (
            <WorldPanel key={door.slug} {...door} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
