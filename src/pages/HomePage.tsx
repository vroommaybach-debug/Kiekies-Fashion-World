import React from 'react';
import { Product, SiteConfig } from '../types';
import { MetaSEO } from '../components/MetaSEO';
import { HeroSection } from '../components/home/HeroSection';
import { BrandThesisSection } from '../components/home/BrandThesisSection';
import { CategoryFourDoorsSection } from '../components/home/CategoryFourDoorsSection';
import { NewArrivalsSection } from '../components/home/NewArrivalsSection';
import { SignatureLookSection } from '../components/home/SignatureLookSection';
import { BestSellersSection } from '../components/home/BestSellersSection';
import { PromiseSection } from '../components/home/PromiseSection';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { WhatsAppCtaSection } from '../components/home/WhatsAppCtaSection';

interface HomePageProps {
  products: Product[];
  siteConfig: SiteConfig;
}

export const HomePage: React.FC<HomePageProps> = ({ products, siteConfig }) => {
  // Find featured product for Section 5 (Editorial Spread)
  const featuredProduct = products.find((p) => p.featured) || products[0] || null;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Kiekies Fashion',
    description:
      'Kiekies Fashion is a luxury contemporary fashion house based in Nigeria specializing in women\'s, men\'s, and children\'s apparel, alongside artisanal accessories. The brand offers structured tailoring and minimalist silhouettes with direct WhatsApp-based order consultation and fulfillment.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://kiekiesfashion.com',
    telephone: '+2348182952013',
    currenciesAccepted: 'NGN',
    priceRange: '₦₦₦',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
      addressLocality: 'Lagos',
    },
    sameAs: ['https://instagram.com/kiekiesfashion'],
  };

  return (
    <div className="w-full bg-black text-white">
      <MetaSEO
        title="Kiekies Fashion – Contemporary Luxury & Ready-to-Wear"
        description="Kiekies Fashion is a luxury contemporary fashion house based in Nigeria specializing in women's, men's, and children's apparel, alongside artisanal accessories. Direct order consultation over WhatsApp."
        image={siteConfig.hero.imageUrl}
        jsonLd={organizationSchema}
      />

      {/* 1. HERO — "The Held Breath" */}
      <HeroSection heroImageUrl={siteConfig.hero.imageUrl} />

      {/* 2. BRAND STATEMENT — "The Thesis" */}
      <BrandThesisSection />

      {/* 3. SHOP BY CATEGORY — "Four Doors" */}
      <CategoryFourDoorsSection categoryHeroes={siteConfig.category_heroes} />

      {/* 4. NEW ARRIVALS — "The Pulse" */}
      <NewArrivalsSection products={products} />

      {/* 5. SIGNATURE LOOK — "The Editorial Spread" */}
      <SignatureLookSection product={featuredProduct} />

      {/* 6. BEST SELLERS — "Social Proof Without Saying It" */}
      <BestSellersSection products={products} />

      {/* 7. THE KIEKIES PROMISE — "Why Trust Us" */}
      <PromiseSection />

      {/* 8. SOCIAL PROOF — "The Quiet Testimony" */}
      <SocialProofSection />

      {/* 9. WHATSAPP CTA BANNER — "The Open Door" */}
      <WhatsAppCtaSection />
    </div>
  );
};
