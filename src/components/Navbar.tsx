import React, { useState, useEffect } from 'react';
import { useRouter } from '../lib/router';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingBag, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  faintOnHero?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ faintOnHero = false }) => {
  const { navigate, path } = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Women', subtitle: 'Executive Silhouettes', href: '/category/women', index: '01' },
    { label: 'Men', subtitle: 'Sovereign Tailoring', href: '/category/men', index: '02' },
    { label: 'Kids', subtitle: 'Junior Heritage', href: '/category/kids', index: '03' },
    { label: 'Accessories', subtitle: 'Sculptural Leather', href: '/category/accessories', index: '04' },
  ];

  const isHome = path === '/' || path === '';

  // Compact 56px height on mobile to stay well within the 15% mobile sticky viewport budget
  const navBackground =
    scrolled || !isHome
      ? 'bg-black/90 backdrop-blur-md border-b border-neutral-800/80 h-14 md:h-auto md:py-4'
      : faintOnHero
      ? 'bg-gradient-to-b from-black/70 to-transparent text-white/90 h-14 md:h-auto md:py-6'
      : 'bg-transparent h-14 md:h-auto md:py-6';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 flex items-center ${navBackground}`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        {/* Left: Desktop Categories */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-white ${
                path === link.href ? 'text-white border-b border-white pb-0.5' : 'text-neutral-400'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile Hamburger (44x44px minimum touch hitbox) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-neutral-200 hover:text-white active:scale-95 transition-transform"
          aria-label="Open mobile menu"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>

        {/* Center: Brand Name */}
        <button
          onClick={() => navigate('/')}
          className="text-center group focus:outline-none py-1"
          aria-label="Kiekies Fashion World Home"
        >
          <span className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.32em] uppercase text-white font-light block transition-transform group-hover:scale-[1.02]">
            KIEKIES
          </span>
          <span className="block text-[7px] sm:text-[8px] tracking-[0.38em] uppercase text-neutral-400 font-sans">
            Kiekies Fashion World
          </span>
        </button>

        {/* Right: Bag Action (44x44px minimum touch hitbox) */}
        <div className="flex items-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="min-w-[44px] min-h-[44px] -mr-2 px-2 flex items-center justify-center gap-1.5 text-neutral-200 hover:text-white active:scale-95 transition-all group"
            aria-label={`View bag with ${totalItems} items`}
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span className="text-xs tracking-widest uppercase font-mono tabular-nums">
              [{totalItems}]
            </span>
          </button>
        </div>
      </div>

      {/* Sleek Kinetic Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050505]/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-8 md:hidden animate-[mobileDrawerIn_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Top Drawer Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div>
              <span className="font-serif text-xl tracking-[0.3em] uppercase text-white block">
                KIEKIES FASHION WORLD
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase font-mono text-amber-400/90">
                Lagos Atelier Navigation
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-transform border border-neutral-800"
              aria-label="Close menu"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Staggered Category Chambers */}
          <div className="flex flex-col divide-y divide-neutral-900 my-auto py-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/');
              }}
              className="py-4 flex items-center justify-between text-left group active:scale-[0.99] transition-transform"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500 block">
                  00 · Showroom
                </span>
                <span className="font-serif text-2xl tracking-[0.15em] uppercase text-neutral-200 group-hover:text-white">
                  Atelier Home
                </span>
              </div>
              <ArrowUpRight size={18} className="text-neutral-500 group-hover:text-amber-400" />
            </button>

            {navLinks.map((link, idx) => (
              <button
                key={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.href);
                }}
                style={{ animationDelay: `${(idx + 1) * 55}ms` }}
                className="py-4 flex items-center justify-between text-left group active:scale-[0.99] transition-transform animate-[drawerItemRise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400/80 block">
                    {link.index} · {link.subtitle}
                  </span>
                  <span className="font-serif text-3xl tracking-[0.14em] uppercase text-white group-hover:translate-x-1.5 transition-transform inline-block mt-0.5">
                    {link.label}
                  </span>
                </div>
                <div className="w-10 h-10 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:border-amber-400 group-hover:text-amber-300">
                  <ArrowUpRight size={17} />
                </div>
              </button>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-neutral-800/80 pt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-neutral-300 tracking-wider uppercase font-mono">
                Kiekies Lagos Showroom
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Bespoke &amp; Ready-to-Wear Fulfillment
              </p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="min-h-[44px] px-4 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-widest font-semibold flex items-center gap-2 active:scale-95 transition-transform"
            >
              <ShoppingBag size={14} />
              <span>Bag [{totalItems}]</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mobileDrawerIn {
          0% {
            opacity: 0;
            transform: translateY(-12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes drawerItemRise {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};
