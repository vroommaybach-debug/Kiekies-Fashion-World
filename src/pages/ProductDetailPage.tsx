import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useRouter } from '../lib/router';
import { useCart } from '../context/CartContext';
import { formatNGN, getWhatsAppInquiryUrl } from '../lib/whatsapp';
import { extractPaletteFromImage, ColorPalette } from '../lib/colorExtractor';
import { MetaSEO } from '../components/MetaSEO';
import { MessageCircle, Check, ArrowUpRight, Sparkles } from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  products: Product[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, products }) => {
  const { navigate } = useRouter();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === productId) || null;

  // Gallery state
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const [palette, setPalette] = useState<ColorPalette>(() =>
    product ? extractPaletteFromImage(product.image_url) : extractPaletteFromImage('')
  );

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image_url);
      setSelectedSize('');
      setQuantity(1);
      setSizeError(false);
      extractPaletteFromImage(product.image_url, (p) => setPalette(p));
      window.scrollTo(0, 0);
    }
  }, [product, productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <h2 className="font-serif text-3xl mb-4">Piece Not Found</h2>
        <p className="text-xs text-neutral-400 mb-8 max-w-sm text-center">
          The requested garment may be archived or transitioning through the atelier.
        </p>
        <button
          onClick={() => navigate('/')}
          className="border border-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
        >
          Return to Atelier
        </button>
      </div>
    );
  }

  const galleryImages = [
    product.image_url,
    ...(product.gallery_urls || []).filter((u) => u && u !== product.image_url),
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    addToCart({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      price: product.price,
      size: selectedSize,
      quantity,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Schema.org Product JSON-LD
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: galleryImages,
    description:
      product.description ||
      `Luxury ${product.category} tailoring by Kiekies Fashion. Hand-finished in Lagos, Nigeria.`,
    brand: {
      '@type': 'Brand',
      name: 'Kiekies Fashion',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Kiekies Fashion',
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* Dynamic Ambient Color Wash from Product Image */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none transition-all duration-1000 opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${palette.accent} 0%, transparent 70%)`,
        }}
      />

      <MetaSEO
        title={`${product.name} | Kiekies Fashion`}
        description={
          product.description ||
          `Acquire ${product.name} at Kiekies Fashion. Luxury ${product.category} tailoring in Lagos, Nigeria. Inquiries via WhatsApp.`
        }
        image={product.image_url}
        jsonLd={productSchema}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Breadcrumb: Home / [Category] / [Product Name] */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-neutral-400">
            <li>
              <button
                onClick={() => navigate('/')}
                className="hover:text-white transition-colors"
              >
                Home
              </button>
            </li>
            <li aria-hidden="true" className="text-neutral-600">/</li>
            <li>
              <button
                onClick={() => navigate(`/category/${product.category}`)}
                className="hover:text-white transition-colors capitalize"
              >
                {product.category}
              </button>
            </li>
            <li aria-hidden="true" className="text-neutral-600">/</li>
            <li className="text-neutral-200 line-clamp-1 max-w-[200px] sm:max-w-none">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Gallery Col */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Featured Image in full saturated color */}
            <div
              className="relative aspect-[3/4] bg-neutral-950 overflow-hidden border transition-all duration-500 group"
              style={{
                borderColor: palette.borderGlow || 'rgba(255, 255, 255, 0.15)',
                boxShadow: `0 15px 45px -10px ${palette.bgWash}`,
              }}
            >
              <img
                src={selectedImage || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out cursor-crosshair"
              />
              <div
                className="absolute top-4 left-4 text-[10px] tracking-[0.3em] uppercase px-3 py-1 font-mono border backdrop-blur-md"
                style={{
                  borderColor: palette.accent,
                  color: palette.accent,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                }}
              >
                Atelier Original · Full Color
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(imgUrl);
                      extractPaletteFromImage(imgUrl, (p) => setPalette(p));
                    }}
                    className={`relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-neutral-950 border overflow-hidden transition-all ${
                      selectedImage === imgUrl
                        ? 'opacity-100 ring-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: selectedImage === imgUrl ? palette.accent : 'rgba(255,255,255,0.15)',
                      boxShadow: selectedImage === imgUrl ? `0 0 15px ${palette.glow}` : 'none',
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions Col */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span
                  className="text-[10px] tracking-[0.35em] uppercase font-mono block mb-2"
                  style={{ color: palette.accent }}
                >
                  Category: {product.category}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide leading-tight">
                  {product.name}
                </h1>
                <p
                  className="font-mono text-2xl sm:text-3xl font-bold mt-4 tracking-wide"
                  style={{ color: palette.accent }}
                >
                  {formatNGN(product.price)}
                </p>
              </div>

              <div className="w-full h-[1px] bg-neutral-800" />

              {/* Description field */}
              {product.description && (
                <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-mono block">
                    Garment Notes
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Size Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-300 font-mono">
                    Select Size <span className="text-red-400">*</span>
                  </span>
                  <a
                    href={getWhatsAppInquiryUrl(product.name, product.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white transition-colors font-mono"
                  >
                    Size Guidance
                  </a>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        className="py-3 px-2 text-xs uppercase tracking-wider font-mono text-center border transition-all"
                        style={{
                          borderColor: isSelected ? palette.accent : 'rgba(255, 255, 255, 0.15)',
                          backgroundColor: isSelected ? palette.accent : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#D4D4D8',
                          boxShadow: isSelected ? `0 4px 15px ${palette.glow}` : 'none',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {sizeError && (
                  <p className="text-xs text-red-400 font-mono tracking-wide">
                    Please select a size prior to adding to your bag.
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-mono">
                  Quantity
                </span>
                <div className="flex items-center border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-mono">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Two Weighted Actions */}
              <div className="space-y-4 pt-6">
                {/* PRIMARY: Add to Cart with extracted color hover */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full text-black py-4 px-8 uppercase tracking-[0.25em] text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: `0 8px 30px ${palette.glow}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = palette.accent;
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#000000';
                  }}
                >
                  <Check size={16} className={addedToast ? 'inline-block' : 'hidden'} />
                  <span>{addedToast ? 'Added to Bag' : 'Add to Bag'}</span>
                </button>

                {/* SECONDARY: WhatsApp text link, not a button */}
                <div className="text-center pt-2">
                  <a
                    href={getWhatsAppInquiryUrl(product.name, product.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-[0.2em] font-mono text-neutral-400 hover:text-white border-b border-neutral-700 hover:border-white pb-1 transition-all inline-flex items-center gap-1.5"
                  >
                    <MessageCircle size={14} />
                    <span>Ask about this piece on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Atelier Note */}
              <div className="pt-6 border-t border-neutral-900 text-[11px] text-neutral-400 space-y-1.5 font-light">
                <p>• Handcrafted and finished in Lagos, Nigeria.</p>
                <p>• Standard atelier fulfillment takes 2-4 business days.</p>
                <p>• Complimentary measurement consultation via WhatsApp before dispatch.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Pieces */}
        {relatedProducts.length > 0 && (
          <div className="mt-28 border-t border-neutral-900 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl md:text-3xl tracking-wide uppercase font-light text-white">
                Complements from {product.category}
              </h2>
              <button
                onClick={() => navigate(`/category/${product.category}`)}
                className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <span>View All</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="group cursor-pointer space-y-2"
                >
                  <div className="aspect-[3/4] bg-neutral-950 overflow-hidden border border-neutral-800 group-hover:border-neutral-500 transition-colors">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-serif text-sm tracking-wide text-neutral-200 group-hover:text-white line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    {formatNGN(p.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
