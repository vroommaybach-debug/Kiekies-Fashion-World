import React, { useState, useEffect } from 'react';
import { useRouter } from '../lib/router';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingBag, ShieldCheck } from 'lucide-react';

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
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Women', href: '/category/women' },
    { label: 'Men', href: '/category/men' },
    { label: 'Kids', href: '/category/kids' },
    { label: 'Accessories', href: '/category/accessories' },
  ];

  const isHome = path === '/' || path === '';

  // Determine navbar styling: whisper on hero until scroll, crisp black glass thereafter
  const navBackground = scrolled || !isHome
    ? 'bg-black/90 backdrop-blur-md border-b border-neutral-800/80 py-4'
    : faintOnHero
    ? 'bg-transparent text-white/70 py-6'
    : 'bg-transparent py-6';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-neutral-300 hover:text-white transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>

        {/* Center: Brand Name */}
        <button
          onClick={() => navigate('/')}
          className="text-center group focus:outline-none"
          aria-label="Kiekies Home"
        >
          <span className="font-serif text-xl md:text-2xl tracking-[0.35em] uppercase text-white font-light block transition-transform group-hover:scale-[1.02]">
            KIEKIES
          </span>
          <span className="block text-[8px] tracking-[0.4em] uppercase text-neutral-400 font-sans mt-0.5">
            Lagos · Atelier
          </span>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/admin')}
            className="hidden lg:flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors"
            title="Atelier Admin"
          >
            <ShieldCheck size={14} strokeWidth={1.5} />
            <span>Atelier</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors group p-1"
            aria-label={`View bag with ${totalItems} items`}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="text-xs tracking-widest uppercase font-mono">
              [{totalItems}]
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 animate-fadeIn md:hidden">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
            <span className="font-serif text-xl tracking-[0.3em] uppercase">KIEKIES</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col gap-8 py-12">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.href);
                }}
                className="text-left font-serif text-3xl tracking-[0.15em] uppercase hover:translate-x-2 transition-transform text-neutral-200 hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-800 pt-8 space-y-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/admin');
              }}
              className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-2"
            >
              <ShieldCheck size={15} />
              <span>Atelier Management</span>
            </button>
            <p className="text-[11px] text-neutral-400 tracking-wider">
              High-end Nigerian Ready-to-Wear & Bespoke Tailoring
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
