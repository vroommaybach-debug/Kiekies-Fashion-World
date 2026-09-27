import React from 'react';

export const SocialProofSection: React.FC = () => {
  return (
    <section className="w-full bg-black py-32 md:py-48 px-6 md:px-12 border-b border-neutral-900 relative overflow-hidden">
      {/* Radiant Solar Backdrop Wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15), rgba(245, 158, 11, 0.08) 45%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <span className="text-[10px] tracking-[0.45em] uppercase text-pink-400 font-mono block">
          A Single Voice · Testimony
        </span>

        <blockquote className="font-serif text-2xl sm:text-3xl md:text-5xl text-neutral-100 font-light leading-[1.35] italic">
          “In a city that moves at relentless speed, slipping into Kiekies feels like putting on calm, tailored armor. Nothing screams, yet you are the only person anyone remembers in the room.”
        </blockquote>

        <div className="space-y-1.5 pt-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white font-medium font-mono">
            Folashade Adeleke
          </p>
          <p className="text-xs text-neutral-400 tracking-wider font-light">
            Managing Partner & Creative Director · Victoria Island, Lagos
          </p>
        </div>
      </div>
    </section>
  );
};
