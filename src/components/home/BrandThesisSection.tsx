import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const BrandThesisSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const statement =
    'We dress the sovereign woman whose arrival commands every room before a single syllable is uttered — dressing with fierce intention, moving fast, radiating confidence through saturated restraint.';

  const words = statement.split(' ');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const wordEls = textRef.current?.querySelectorAll('.punchline-word');
      if (!wordEls || wordEls.length === 0) return;

      gsap.fromTo(
        wordEls,
        {
          color: 'rgba(255, 255, 255, 0.16)',
          textShadow: '0 0 0px rgba(245, 158, 11, 0)',
          y: 6,
        },
        {
          color: '#F59E0B',
          textShadow: '0 0 24px rgba(245, 158, 11, 0.35)',
          y: 0,
          stagger: 0.04,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            end: 'bottom 45%',
            scrub: 0.8,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="thesis"
      ref={sectionRef}
      className="relative w-full bg-neutral-950 py-24 sm:py-32 md:py-44 px-5 sm:px-6 md:px-12 border-b border-neutral-900 overflow-hidden"
    >
      {/* Ambient background glow wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.08), transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-8 sm:mb-10 border border-amber-500/30 px-3.5 py-1 bg-amber-500/10">
          <span className="text-[10px] tracking-[0.4em] uppercase text-amber-300 font-mono">
            Section 02 · The Thesis
          </span>
        </div>

        {/* Scrubbed color-wipe headline */}
        <h2
          ref={textRef}
          className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-[4.15rem] font-light leading-[1.32] tracking-wide select-none"
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="punchline-word inline-block mr-[0.28em] transition-transform will-change-transform"
            >
              {word}
            </span>
          ))}
        </h2>

        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-12 sm:mt-16" />

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-7 text-neutral-400 text-[10px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] font-mono">
          <span>Kiekies Fashion World</span>
          <span className="text-amber-500">·</span>
          <span>Architectural Silhouettes</span>
          <span className="text-amber-500">·</span>
          <span>Lagos Atelier</span>
        </div>
      </div>
    </section>
  );
};
