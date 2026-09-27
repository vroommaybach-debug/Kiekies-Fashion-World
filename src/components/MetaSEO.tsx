import React, { useEffect } from 'react';

interface MetaSEOProps {
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

export const MetaSEO: React.FC<MetaSEOProps> = ({
  title,
  description,
  image = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
  canonicalUrl,
  noIndex = false,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper for meta tags
    const setMetaTag = (selector: string, attribute: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace(/[\[\]]/g, '').split('=');
        el.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attribute, value);
    };

    // 2. Meta description
    setMetaTag('meta[name="description"]', 'content', description);

    // 3. OpenGraph tags
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:image"]', 'content', image);
    if (canonicalUrl || window.location.href) {
      setMetaTag('meta[property="og:url"]', 'content', canonicalUrl || window.location.href);
    }

    // 4. Twitter tags
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', image);

    // 5. Robots / noindex tag
    let robotsEl = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsEl) {
        robotsEl = document.createElement('meta');
        robotsEl.setAttribute('name', 'robots');
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute('content', 'noindex, nofollow');
    } else if (robotsEl) {
      robotsEl.setAttribute('content', 'index, follow');
    }

    // 6. JSON-LD Structured Data
    const existingJsonLd = document.getElementById('dynamic-json-ld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'dynamic-json-ld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up dynamic json-ld
      const script = document.getElementById('dynamic-json-ld');
      if (script) script.remove();
    };
  }, [title, description, image, canonicalUrl, noIndex, jsonLd]);

  return null;
};
