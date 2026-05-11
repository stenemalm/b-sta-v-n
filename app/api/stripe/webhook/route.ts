import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkOrder, createOrder, type BigBuyAddress, type BigBuyOrderItem } from '@/lib/bigbuy';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2025-04-30.basil' });

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true });
  }

  const intent   = event.data.object as Stripe.PaymentIntent;
  const meta     = intent.metadata;
  const totalSek = meta.total;
  const date     = new Date();
  const dateStr  = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand     = intent.id.slice(-4).toUpperCase();
  const orderNumber = `BV-${dateStr}-${rand}`;

  // ── Automatisk BigBuy-order ────────────────────────────────────────────
  let bigbuyStatus = 'MANUELL';
  let bigbuyOrderId = '';

  const items: any[] = JSON.parse(meta.orderItems ?? '[]');
  const hasBigbuyRefs = items.every(i => i.bigbuyRef);

  if (process.env.BIGBUY_API_KEY && hasBigbuyRefs) {
    const [firstName, ...rest] = (meta.customerName ?? '').split(' ');
    const address: BigBuyAddress = {
      firstName,
      lastName:  rest.join(' ') || firstName,
      address:   meta.customerAddress,
      postcode:  meta.customerPostalCode,
      town:      meta.customerCity,
      country:   'SE',
      phone:     meta.customerPhone,
      email:     meta.customerEmail,
    };
    const bbItems: BigBuyOrderItem[] = items.map(i => ({ reference: i.bigbuyRef, quantity: i.qty }));

    try {
      await checkOrder(orderNumber, address, bbItems);
      const result  = await createOrder(orderNumber, address, bbItems);
      bigbuyStatus  = 'SKICKAD_TILL_BIGBUY';
      bigbuyOrderId = result?.order?.id ?? '';
    } catch (err: any) {
      bigbuyStatus = `FEL: ${err.message}`;
    }
  }

  // ── Telegram-notis ─────────────────────────────────────────────────────
  const itemsList = items
    .map(i => `• ${i.name}  ×${i.qty}  |  ref: ${i.bigbuyRef || '-'}`)
    .join('\n');

  const autoLine = bigbuyStatus === 'SKICKAD_TILL_BIGBUY'
    ? `✅ AUTO-BESTÄLLD (BigBuy ID: ${bigbuyOrderId})`
    : bigbuyStatus.startsWith('FEL')
    ? `⚠️ BigBuy-fel: ${bigbuyStatus}`
    : `📋 Lägg manuellt på https://www.bigbuy.eu/sv/`;

  const msg =
    `💳 BETALAD ORDER ${orderNumber}\n\n` +
    `Kund: ${meta.customerName}\n` +
    `Email: ${meta.customerEmail}\n` +
    `Tel: ${meta.customerPhone}\n` +
    `Adress: ${meta.customerAddress}, ${meta.customerPostalCode} ${meta.customerCity}\n\n` +
    `PRODUKTER:\n${itemsList}\n\n` +
    `TOTALT: ${totalSek} kr\n\n` +
    autoLine;

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg }),
    }
  );

  return NextResponse.json({ received: true, orderNumber });
}
