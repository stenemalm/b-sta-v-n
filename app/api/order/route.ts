import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const order = await request.json();

  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  const orderNumber = `BV-${dateStr}-${rand}`;

  let lookup: Record<string, string> = {};
  try {
    lookup = require('@/scripts/artnr-lookup.json');
  } catch {}

  const itemsList = order.items
    .map((item: any) => {
      const filename = item.image?.match(/\/([^/]+)\.jpg$/)?.[1] ?? '';
      const artNr = lookup[filename] ?? filename ?? '-';
      return `• ${item.name}\n  Antal: ${item.qty} st  |  ${item.price * item.qty} kr\n  ZooDrop-nr: ${artNr}`;
    })
    .join('\n\n');

  const discountLine = order.discount > 0
    ? `Rabatt (${order.discountCode}): -${order.discount} kr\n`
    : '';

  const msg =
    `NY BESTALLNING ${orderNumber}\n\n` +
    `Kund: ${order.customer.name}\n` +
    `Email: ${order.customer.email}\n` +
    `Tel: ${order.customer.phone}\n` +
    `Adress: ${order.customer.address}, ${order.customer.postalCode} ${order.customer.city}\n\n` +
    `PRODUKTER:\n${itemsList}\n\n` +
    `Delsumma: ${order.subtotal} kr\n` +
    `Frakt: ${order.shipping === 0 ? 'Gratis' : order.shipping + ' kr'}\n` +
    discountLine +
    `TOTALT: ${order.total} kr\n\n` +
    `Lagg order pa ZooDrop nu!`;

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: msg,
      }),
    }
  );

  return NextResponse.json({ success: true, orderNumber });
}
