import React from 'react';
import { useCart } from '../context/CartContext';
import { formatNGN, WHATSAPP_PHONE } from '../lib/whatsapp';
import { useRouter } from '../lib/router';
import { MetaSEO } from '../components/MetaSEO';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalAmount, isCheckingOut, checkout } = useCart();
  const { navigate } = useRouter();

  const handleCheckout = async () => {
    const order = await checkout();
    if (order) {
      navigate(`/order/${order.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-24">
      <MetaSEO
        title="Shopping Bag | Kiekies Fashion"
        description="Review your selected luxury garments and dispatch your order to our Lagos atelier via WhatsApp."
      />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="border-b border-neutral-800 pb-6 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-400 font-sans block mb-2">
              Atelier Selection
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-white font-light tracking-wide uppercase">
              Shopping Bag
            </h1>
          </div>
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
            {totalItems} {totalItems === 1 ? 'Garment' : 'Garments'}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="py-24 text-center border border-neutral-900 bg-neutral-950 px-6">
            <ShoppingBag size={48} strokeWidth={1} className="text-neutral-600 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-neutral-200 mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-8 leading-relaxed">
              No pieces have been selected yet. Browse our contemporary collections to build your tailored wardrobe.
            </p>
            <button
              onClick={() => navigate('/category/women')}
              className="border border-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
            >
              Discover Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Items Column */}
            <div className="lg:col-span-8 divide-y divide-neutral-900 border-t border-b border-neutral-900">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="py-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                >
                  <div
                    onClick={() => navigate(`/product/${item.productId}`)}
                    className="w-24 h-32 sm:w-28 sm:h-36 bg-neutral-950 border border-neutral-800 flex-shrink-0 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="font-serif text-xl text-white font-light hover:text-neutral-300 cursor-pointer"
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                      Selected Size: <span className="text-white">{item.size}</span>
                    </p>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center border border-neutral-800">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-base text-neutral-100 font-medium">
                        {formatNGN(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & WhatsApp Checkout */}
            <div className="lg:col-span-4">
              <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6 sticky top-28">
                <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-300 font-sans pb-4 border-b border-neutral-800">
                  Summary & Dispatch
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Pieces Count</span>
                    <span className="font-mono text-neutral-200">{totalItems} items</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Atelier Consultation</span>
                    <span className="text-neutral-200">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery (Lagos & Beyond)</span>
                    <span className="text-neutral-200">Coordinated on WhatsApp</span>
                  </div>
                  <div className="pt-4 border-t border-neutral-800 flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-widest text-neutral-300">Total</span>
                    <span className="font-serif text-2xl text-white font-medium">
                      {formatNGN(totalAmount)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                  Clicking below creates your 6-character order dossier and opens a direct line with our Lagos atelier on WhatsApp to confirm fit, sizing, and payment.
                </p>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-white text-black py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <span>Creating Order Dossier...</span>
                  ) : (
                    <>
                      <span>Send Order via WhatsApp</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => navigate('/category/women')}
                    className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={13} />
                    <span>Continue Browsing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
