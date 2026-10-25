/**
 * Stripe Checkout Integration
 */

import { loadStripe } from '@stripe/stripe-js';

// ============================================
// CLIENT-SIDE
// ============================================

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

/**
 * Criar sessão de checkout
 */
export async function createCheckoutSession(params: CheckoutParams) {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  const { sessionId, url } = await response.json();

  // Redirect to Stripe Checkout
  if (url) {
    window.location.href = url;
  }

  return sessionId;
}

/**
 * Redirecionar para portal de gerenciamento
 */
export async function redirectToCustomerPortal() {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to redirect to portal');
  }

  const { url } = await response.json();
  window.location.href = url;
}

// Preços configurados
export const PRICES = {
  pro_monthly: {
    id: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    name: 'MusicOS Pro',
    price: 9.90,
    interval: 'mês',
  },
  pro_lifetime: {
    id: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || 'price_lifetime',
    name: 'MusicOS Pro Lifetime',
    price: 197.00,
    interval: 'único',
  },
};

export function subscribeToPro() {
  return createCheckoutSession({
    priceId: PRICES.pro_monthly.id,
    successUrl: `${window.location.origin}/dashboard?success=true`,
    cancelUrl: `${window.location.origin}/pricing?canceled=true`,
  });
}

export function subscribeToLifetime() {
  return createCheckoutSession({
    priceId: PRICES.pro_lifetime.id,
    successUrl: `${window.location.origin}/dashboard?success=true`,
    cancelUrl: `${window.location.origin}/pricing?canceled=true`,
  });
}

// ============================================
// SERVER-SIDE (API ROUTES)
// ============================================

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSessionServer(
  priceId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      customer_email: customerEmail,
    },
  });

  return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getSubscription(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}