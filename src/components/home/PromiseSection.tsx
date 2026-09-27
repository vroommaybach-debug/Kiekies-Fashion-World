import React from 'react';
import { Compass, Users, CheckCircle2, ShieldCheck } from 'lucide-react';

export const PromiseSection: React.FC = () => {
  const pillars = [
    {
      icon: <Compass size={24} strokeWidth={1.4} />,
      accentColor: '#F59E0B',
      title: 'Architectural Fit & Nigerian Cloth',
      description:
        'Every garment is precision-draped and double-checked in our Lagos atelier. We balance structured drape with breathable, high-durability fabrics tailored for tropical climate transitions and executive comfort.',
    },
    {
      icon: <Users size={24} strokeWidth={1.4} />,
      accentColor: '#EC4899',
      title: 'An Intentional, Real Size Range',
      description:
        'We do not cater to vanity metrics. Our sizing honors real proportions from UK 6 through UK 18, with bespoke adjustments readily accommodated on request so every silhouette falls without pulling or compromise.',
    },
    {
      icon: <CheckCircle2 size={24} strokeWidth={1.4} />,
      accentColor: '#10B981',
      title: 'A Real Person Behind Every Order',
      description:
        'You never send funds to an automated black box. When you submit your bag, a senior stylist personally confirms your measurements, fabric preferences, and delivery timeline over WhatsApp before any payment is finalized.',
    },
  ];

  return (
    <section className="w-full bg-neutral-950 py-28 md:py-36 px-6 md:px-12 border-b border-neutral-900 relative overflow-hidden">
      {/* Subtle ambient light */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #F59E0B 0%, #10B981 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 border border-emerald-500/30 px-3 py-1 bg-emerald-500/10 mb-4">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-emerald-300 font-mono">
              Integrity System
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide uppercase font-light text-white mb-4">
            The Kiekies Promise
          </h2>
          <p className="text-xs text-neutral-400 tracking-wider leading-relaxed">
            E-commerce in West Africa requires transparency, personal relationships, and unwavering standards. Here is how we protect your trust.
          </p>
        </div>

        {/* 3 Columns with Chromatic Card Glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-8 border bg-neutral-900/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = pillar.accentColor;
                e.currentTarget.style.boxShadow = `0 12px 30px -10px ${pillar.accentColor}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-12 h-12 border flex items-center justify-center mb-6 transition-colors"
                style={{
                  borderColor: pillar.accentColor,
                  color: pillar.accentColor,
                  backgroundColor: `${pillar.accentColor}15`,
                }}
              >
                {pillar.icon}
              </div>

              <h3 className="font-serif text-2xl text-white font-light tracking-wide mb-3">
                {pillar.title}
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
