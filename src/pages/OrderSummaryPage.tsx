import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { getOrderByCode } from '../lib/db';
import { formatNGN, WHATSAPP_PHONE } from '../lib/whatsapp';
import { useRouter } from '../lib/router';
import { MetaSEO } from '../components/MetaSEO';
import { CheckCircle2, Clock, PackageCheck, MessageCircle, ArrowLeft } from 'lucide-react';

interface OrderSummaryPageProps {
  orderCode: string;
}

export const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({ orderCode }) => {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      const found = await getOrderByCode(orderCode);
      setOrder(found);
      setLoading(false);
    }
    fetchOrder();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center pt-24 pb-16">
        <div className="w-8 h-8 border border-white/20 border-t-white animate-spin rounded-full mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
          Retrieving Order Dossier #{orderCode}...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <MetaSEO
          title={`Order Not Found | Kiekies Fashion`}
          description="Order dossier not found"
          noIndex={true}
        />
        <h2 className="font-serif text-3xl mb-4">Order Dossier Not Found</h2>
        <p className="text-xs text-neutral-400 mb-8 max-w-sm text-center">
          Code "{orderCode}" does not match an active record. Please confirm the link from WhatsApp.
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

  const statusIcons: Record<Order['status'], React.ReactNode> = {
    new: <Clock size={16} className="text-amber-400" />,
    confirmed: <CheckCircle2 size={16} className="text-emerald-400" />,
    fulfilled: <PackageCheck size={16} className="text-blue-400" />,
  };

  const statusLabels: Record<Order['status'], string> = {
    new: 'New Order · Awaiting WhatsApp Confirmation',
    confirmed: 'Confirmed · In Atelier Tailoring',
    fulfilled: 'Dispatched · Fulfilled',
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-24">
      {/* Specifically marked as noIndex per instructions */}
      <MetaSEO
        title={`Order #${order.code} Summary | Kiekies Fashion`}
        description={`Order manifest for ${order.code} consisting of ${order.items.length} items.`}
        noIndex={true}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Navigation back */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Atelier</span>
        </button>

        {/* Order Header Card */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
            <div>
              <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-400 font-sans block mb-1">
                Public Order Manifest
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-white font-light tracking-wide uppercase">
                Order #{order.code}
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 border border-neutral-700/80 px-4 py-2 bg-neutral-900/60">
              {statusIcons[order.status]}
              <span className="text-xs uppercase tracking-wider text-neutral-200 font-mono">
                {statusLabels[order.status]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono">
            <div>
              <span className="text-neutral-400 block uppercase tracking-wider text-[10px] mb-1 font-sans">
                Placed On
              </span>
              <span className="text-neutral-200">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block uppercase tracking-wider text-[10px] mb-1 font-sans">
                Pieces In Order
              </span>
              <span className="text-neutral-200">
                {order.items.reduce((acc, it) => acc + it.quantity, 0)} Items
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block uppercase tracking-wider text-[10px] mb-1 font-sans">
                Total Valuation
              </span>
              <span className="text-white font-serif text-base">
                {formatNGN(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8 mb-8">
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-300 font-sans mb-6 pb-3 border-b border-neutral-900">
            Garments & Accessories Selected ({order.items.length})
          </h2>

          <div className="divide-y divide-neutral-900">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-32 sm:w-28 sm:h-36 bg-black border border-neutral-800 flex-shrink-0 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg sm:text-xl text-white font-light tracking-wide">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-neutral-400 font-mono">
                      <span>Size: {item.size}</span>
                      <span aria-hidden="true">·</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-4 border-t border-neutral-900/60 mt-4 sm:mt-0">
                    <span className="text-xs text-neutral-400">
                      {formatNGN(item.price)} each
                    </span>
                    <span className="font-mono text-base text-neutral-100 font-medium">
                      {formatNGN(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
              Total Order Amount
            </span>
            <span className="font-serif text-2xl sm:text-3xl text-white">
              {formatNGN(order.total)}
            </span>
          </div>
        </div>

        {/* WhatsApp Re-connect & Support */}
        <div className="p-6 border border-neutral-800 bg-neutral-900/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg text-white">Need to update this order?</h3>
            <p className="text-xs text-neutral-400">
              Reference code <span className="font-mono text-white font-semibold">{order.code}</span> directly with our WhatsApp atelier desk.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
              `Hi Kiekies, I'm following up on order #${order.code} (Total: ${formatNGN(order.total)}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={15} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
