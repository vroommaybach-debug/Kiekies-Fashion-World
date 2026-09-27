import React, { useRef } from 'react';
import gsap from 'gsap';
import { WHATSAPP_PHONE } from '../../lib/whatsapp';
import { MessageSquare, ArrowUpRight } from 'lucide-react';

export const WhatsAppCtaSection: React.FC = () => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const specificMessage =
    "Hello Kiekies, I'm reviewing your collection and would like to speak directly with an atelier stylist about bespoke sizing and piece availability.";
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(specificMessage)}`;

  // Magnetic button effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <section className="w-full bg-neutral-950 py-28 md:py-40 px-6 md:px-12 relative overflow-hidden">
      {/* Dynamic Saturated Radial Pulse */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 60%, rgba(16, 185, 129, 0.18), rgba(245, 158, 11, 0.1) 40%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto border border-neutral-800 p-8 sm:p-14 md:p-20 text-center relative overflow-hidden bg-black/60 backdrop-blur-md">
        <div className="relative z-10 space-y-7">
          <div className="inline-flex items-center gap-2 border border-emerald-500/40 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-emerald-300 bg-emerald-500/10 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Atelier Concierge Live on WhatsApp</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-wide uppercase">
            The Door Is Always Open
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed font-light">
            Every garment begins with a personal conversation. Whether you need expedited delivery within Lagos, custom hem adjustments, or styling for a state occasion, speak directly with our senior stylists.
          </p>

          <div className="pt-4 flex items-center justify-center">
            <a
              ref={buttonRef}
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="px-10 py-5 text-black text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center gap-3 group shadow-2xl rounded-none will-change-transform"
              style={{
                backgroundColor: '#10B981',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                color: '#FFFFFF',
              }}
            >
              <MessageSquare size={16} />
              <span>Connect on WhatsApp</span>
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </a>
          </div>

          <p className="text-xs text-neutral-400 font-mono tracking-wider pt-2">
            Direct Line: +234 818 295 2013 · Lagos Atelier
          </p>
        </div>
      </div>
    </section>
  );
};
