import { NextRequest, NextResponse } from 'next/server';
import { checkOrder, createOrder, type BigBuyAddress, type BigBuyOrderItem } from '@/lib/bigbuy';

export async function POST(request: NextRequest) {
  const order = await request.json();

  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  const orderNumber = `BV-${dateStr}-${rand}`;

  // ── 1. Försök auto-beställ via BigBuy API ──────────────────────────────
  let bigbuyStatus = 'MANUELL';   // Om ingen bigbuyRef → manuell
  let bigbuyOrderId = '';

  const hasBigbuyRefs = order.items.every((i: any) => i.bigbuyRef);

  if (process.env.BIGBUY_API_KEY && hasBigbuyRefs) {
    const [firstName, ...rest] = (order.customer.name as string).split(' ');
    const lastName = rest.join(' ') || firstName;

    const address: BigBuyAddress = {
      firstName,
      lastName,
      address:  order.customer.address,
      postcode: order.customer.postalCode,
      town:     order.customer.city,
      country:  'SE',
      phone:    order.customer.phone,
      email:    order.customer.email,
    };

    const items: BigBuyOrderItem[] = order.items.map((i: any) => ({
      reference: i.bigbuyRef,
      quantity:  i.qty,
    }));

    try {
      await checkOrder(orderNumber, address, items);
      const result = await createOrder(orderNumber, address, items);
      bigbuyStatus  = 'SKICKAD_TILL_BIGBUY';
      bigbuyOrderId = result?.order?.id ?? '';
    } catch (err: any) {
      bigbuyStatus = `FEL: ${err.message}`;
    }
  }

  // ── 2. Bygg Telegram-notis ─────────────────────────────────────────────
  const itemsList = order.items
    .map((item: any) => {
      const ref = item.bigbuyRef ?? item.sku ?? item.id ?? '-';
      return `• ${item.name}\n  Antal: ${item.qty} st  |  ${item.price * item.qty} kr\n  BigBuy ref: ${ref}`;
    })
    .join('\n\n');

  const discountLine = order.discount > 0
    ? `Rabatt (${order.discountCode}): -${order.discount} kr\n`
    : '';

  const autoLine = bigbuyStatus === 'SKICKAD_TILL_BIGBUY'
    ? `✅ AUTO-BESTÄLLD PÅ BIGBUY (Order-ID: ${bigbuyOrderId})\nBigBuy packar och skickar direkt till kunden.`
    : bigbuyStatus.startsWith('FEL')
    ? `⚠️ BigBuy-fel: ${bigbuyStatus}\nLägg ordern manuellt på https://www.bigbuy.eu/sv/`
    : `📋 MANUELL ORDER — lägg på BigBuy:\nhttps://www.bigbuy.eu/sv/`;

  const msg =
    `🛒 NY BESTÄLLNING ${orderNumber}\n\n` +
    `Kund: ${order.customer.name}\n` +
    `Email: ${order.customer.email}\n` +
    `Tel: ${order.customer.phone}\n` +
    `Adress: ${order.customer.address}, ${order.customer.postalCode} ${order.customer.city}\n\n` +
    `PRODUKTER:\n${itemsList}\n\n` +
    `Delsumma: ${order.subtotal} kr\n` +
    `Frakt: ${order.shipping === 0 ? 'Gratis' : order.shipping + ' kr'}\n` +
    discountLine +
    `TOTALT: ${order.total} kr\n\n` +
    autoLine;

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg }),
    }
  );

  return NextResponse.json({ success: true, orderNumber, bigbuyStatus });
}
