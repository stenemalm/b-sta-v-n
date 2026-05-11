import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export async function POST(request: NextRequest) {
  try {
    const { items, shipping, discount, customer } = await request.json();

    const subtotal  = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
    const totalSek  = subtotal + shipping - (discount ?? 0);
    const amountOre = Math.round(totalSek * 100);

    const intent = await stripe.paymentIntents.create({
      amount:   amountOre,
      currency: 'sek',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderItems:         JSON.stringify(items.map((i: any) => ({ id: i.id, qty: i.qty, ref: i.bigbuyRef ?? '' }))),
        customerName:       customer.name,
        customerEmail:      customer.email,
        customerPhone:      customer.phone,
        customerAddress:    customer.address,
        customerPostalCode: customer.postalCode,
        customerCity:       customer.city,
        shipping:           String(shipping),
        discount:           String(discount ?? 0),
        total:              String(totalSek),
      },
      receipt_email: customer.email,
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err: any) {
    console.error('Stripe create-intent error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
