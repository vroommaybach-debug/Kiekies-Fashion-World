import React from 'react';
import { useCart } from '../context/CartContext';
import { formatNGN } from '../lib/whatsapp';
import { useRouter } from '../lib/router';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalAmount,
    isCheckingOut,
    checkout,
  } = useCart();
  const { navigate } = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    const order = await checkout();
    if (order) {
      navigate(`/order/${order.code}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-heading"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 text-white flex flex-col h-full z-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-800">
          <div className="flex items-baseline gap-2">
            <h2 id="cart-drawer-heading" className="font-serif text-2xl tracking-wide uppercase">
              Bag
            </h2>
            <span className="text-xs text-neutral-400 tracking-widest uppercase">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-neutral-400 hover:text-white transition-colors focus:ring-1 focus:ring-white"
            aria-label="Close bag"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-neutral-900">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <ShoppingBag size={40} strokeWidth={1} className="text-neutral-600 mb-4" />
              <p className="font-serif text-lg tracking-wide text-neutral-300 mb-2">Your bag is empty</p>
              <p className="text-xs text-neutral-500 max-w-xs mb-8">
                Explore our current collection of tailored garments and architectural essentials.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/category/women');
                }}
                className="text-xs uppercase tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-all"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4 pt-4 first:pt-0">
                  <div className="w-20 h-28 bg-neutral-900 flex-shrink-0 overflow-hidden border border-neutral-800">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-base tracking-wide text-neutral-100 line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-neutral-500 hover:text-white p-1 transition-colors"
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 tracking-wider uppercase">
                        Size: {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-neutral-800">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs text-neutral-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs tracking-wider">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs text-neutral-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium tracking-wide">
                        {formatNGN(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-950/90 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-widest text-neutral-400">Subtotal</span>
              <span className="font-serif text-2xl tracking-wide">{formatNGN(totalAmount)}</span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Orders are fulfilled directly by our Lagos atelier. Clicking below generates your personal order summary link and connects you with a dedicated stylist on WhatsApp.
            </p>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-white text-black py-4 px-6 uppercase tracking-widest text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>Send Order via WhatsApp</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
