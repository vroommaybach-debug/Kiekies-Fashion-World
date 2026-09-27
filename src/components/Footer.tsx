import React from 'react';
import { useRouter } from '../lib/router';
import { WHATSAPP_PHONE } from '../lib/whatsapp';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="bg-black border-t border-neutral-900 text-neutral-400 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-serif text-2xl tracking-[0.3em] uppercase text-white font-light">
              KIEKIES
            </h2>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
              A contemporary luxury fashion house based in Lagos, Nigeria. Specializing in women's, men's, and children's apparel, alongside artisanal accessories. Structured silhouettes tailored for confident movement.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hello Kiekies, I'd like to consult with a stylist.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-neutral-300 hover:text-white border-b border-neutral-700 hover:border-white pb-0.5 transition-all inline-block"
              >
                WhatsApp Atelier: +234 818 295 2013
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-200 font-semibold mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-xs tracking-wider">
              <li>
                <button
                  onClick={() => navigate('/category/women')}
                  className="hover:text-white transition-colors"
                >
                  Women's Tailoring
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/category/men')}
                  className="hover:text-white transition-colors"
                >
                  Men's Contemporary
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/category/kids')}
                  className="hover:text-white transition-colors"
                >
                  Kids' Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/category/accessories')}
                  className="hover:text-white transition-colors"
                >
                  Sculptural Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Connect & Client Services */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-200 font-semibold mb-4">
              Atelier
            </h3>
            <ul className="space-y-2.5 text-xs tracking-wider">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram / @kiekiesfashion
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="hover:text-white transition-colors"
                >
                  Admin Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cart')}
                  className="hover:text-white transition-colors"
                >
                  Shopping Bag
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Credit & Legal */}
        <div className="pt-8 border-t border-neutral-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>© {new Date().getFullYear()} Kiekies Fashion. All rights reserved.</p>
          <p className="font-serif tracking-[0.3em] uppercase text-neutral-400">
            Imagined by JuneStudios
          </p>
        </div>
      </div>
    </footer>
  );
};
