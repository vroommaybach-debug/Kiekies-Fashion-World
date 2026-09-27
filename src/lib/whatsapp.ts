export const WHATSAPP_PHONE = '2348182952013';

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦').trim();
}

export function getWhatsAppOrderUrl(itemCount: number, total: number, code: string): string {
  const origin = window.location.origin;
  const orderUrl = `${origin}/order/${code}`;
  const formattedTotal = formatNGN(total);

  const message = `Hi Kiekies, I'd like to order:
${itemCount} item(s), total ${formattedTotal}.
View full order: ${orderUrl}`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppInquiryUrl(productName: string, productId: string): string {
  const origin = window.location.origin;
  const productUrl = `${origin}/product/${productId}`;
  const message = `Hi Kiekies, I have an inquiry about the "${productName}". Could you share more details on fit and availability? Link: ${productUrl}`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppGeneralInquiryUrl(): string {
  const message = `Hi Kiekies, I'd like to speak with a stylist about custom sizing and placing an order.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
