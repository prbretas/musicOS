/**
 * POST /api/webhooks/stripe
 *
 * Valida a assinatura do Stripe e entrega o evento para lib/billing/sync.ts,
 * onde ficam as regras (testadas em src/__tests__/billing).
 *
 * Eventos a assinar no Stripe (Developers → Webhooks):
 *   checkout.session.completed, checkout.session.async_payment_succeeded,
 *   checkout.session.async_payment_failed,
 *   customer.subscription.created, customer.subscription.updated, customer.subscription.deleted,
 *   invoice.paid, invoice.payment_failed,
 *   charge.refunded, charge.dispute.created, charge.dispute.closed
 */

import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { processStripeEvent } from '@/lib/billing/sync';
import { billingDeps } from '@/lib/billing/adapters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET não configurada');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('[stripe/webhook] assinatura inválida:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const result = await processStripeEvent(event, billingDeps());
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error(`[stripe/webhook] erro ao processar ${event.type} (${event.id}):`, error);
    // 500 faz o Stripe reenviar; a idempotência evita aplicar duas vezes
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
