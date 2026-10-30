import React, { useEffect, useState } from 'react';

interface BrandPreloaderProps {
  isReady: boolean;
  onExited: () => void;
}

export const BrandPreloader: React.FC<BrandPreloaderProps> = ({ isReady, onExited }) => {
  const [progress, setProgress] = useState(8);
  const [isExiting, setIsExiting] = useState(false);

  // Smooth progress counter that advances to 88% while awaiting Firestore + Hero image decode,
  // then completes to 100% and triggers the curtain exit once isReady is true.
  useEffect(() => {
    if (isReady) {
      setProgress(100);
      const exitTimer = window.setTimeout(() => {
        setIsExiting(true);
      }, 280);
      const unmountTimer = window.setTimeout(() => {
        onExited();
      }, 1150);
      return () => {
        window.clearTimeout(exitTimer);
        window.clearTimeout(unmountTimer);
      };
    }

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const step = prev < 45 ? 7 : prev < 72 ? 4 : 1.5;
        return Math.min(88, Math.round(prev + step));
      });
    }, 90);

    return () => window.clearInterval(interval);
  }, [isReady, onExited]);

  const primaryTitle = 'KIEKIES';
  const secondaryTitle = 'FASHION WORLD';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between px-6 py-10 bg-[#050505] text-white select-none overflow-hidden transition-all duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
      aria-live="polite"
      aria-busy={!isReady}
    >
      {/* Subtle Ambient Gold Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-1000"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(217, 119, 6, 0.14) 0%, rgba(15, 15, 18, 0.04) 48%, transparent 72%)',
          transform: isExiting ? 'scale(1.35)' : 'scale(1)',
        }}
      />

      {/* Architectural Hairline Frame */}
      <div className="absolute inset-4 sm:inset-7 border border-white/10 pointer-events-none" />

      {/* Top Atelier Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[10px] tracking-[0.35em] uppercase font-mono text-neutral-400 px-2 sm:px-4">
        <span>Lagos · Nigeria</span>
        <span className="text-amber-400/90">Bespoke &amp; Ready-To-Wear</span>
      </div>

      {/* Center Motion-Graphics Crest & Brand Typography */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto my-auto px-4">
        {/* Official Kiekies Emblem with Animated Gold Progress Halo */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-6 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.75"
            />
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.25"
              strokeDasharray="295"
              strokeDashoffset={295 - (295 * progress) / 100}
              className="transition-all duration-300 ease-out origin-center -rotate-90"
            />
          </svg>
          <img
            src="/assets/aistudio/Screenshot_2026-10-29_101722_504c46c3.png"
            alt="Kiekies Fashion World Official Emblem"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain mix-blend-lighten animate-[preloaderFade_0.8s_ease-out_both]"
          />
        </div>

        {/* Main Staggered Headline: KIEKIES */}
        <div className="overflow-hidden pb-1">
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-[0.28em] uppercase font-light text-white flex items-center justify-center pl-[0.28em]">
            {primaryTitle.split('').map((ch, idx) => (
              <span
                key={idx}
                className="inline-block animate-[preloaderRise_0.75s_cubic-bezier(0.22,1,0.36,1)_both]"
                style={{ animationDelay: `${idx * 65}ms` }}
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        {/* Secondary Motion Line: FASHION WORLD */}
        <div className="overflow-hidden mt-2 sm:mt-3">
          <p className="font-serif text-lg sm:text-2xl md:text-3xl tracking-[0.42em] uppercase text-amber-300/95 font-light pl-[0.42em] animate-[preloaderFade_0.9s_ease-out_0.25s_both]">
            {secondaryTitle}
          </p>
        </div>

        {/* Animated Sweeping Gold Thread */}
        <div className="w-48 sm:w-64 h-[1px] bg-neutral-800 mt-7 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500/40 via-amber-300 to-white transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-mono text-neutral-400">
          {progress < 100
            ? 'Curating Live Atelier Showcase'
            : 'Entering Showroom'}
        </p>
      </div>

      {/* Bottom Progress & Editorial Signature */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[10px] tracking-[0.3em] uppercase font-mono text-neutral-400 px-2 sm:px-4">
        <span>Kiekies Fashion House</span>
        <span className="text-white tabular-nums">{String(progress).padStart(2, '0')}%</span>
      </div>

      <style>{`
        @keyframes preloaderRise {
          0% {
            opacity: 0;
            transform: translateY(36px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes preloaderFade {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
