import Stripe from 'stripe';
import { STRIPE_PRICE_ENV, type PaidPlanId } from '@/lib/plans';

let client: Stripe | null = null;

/**
 * Cliente do Stripe para uso no servidor, criado só na primeira chamada.
 * Assim o build e os testes não precisam da chave; a rota só falha se for chamada sem ela.
 */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada');
  client = new Stripe(key, { apiVersion: '2023-10-16' });
  return client;
}

/** Price ID do Stripe de um plano pago, lido do ambiente. */
export function priceIdFor(plan: PaidPlanId): string {
  const id = process.env[STRIPE_PRICE_ENV[plan]];
  if (!id) throw new Error(`${STRIPE_PRICE_ENV[plan]} não configurada`);
  return id;
}

/** Plano a partir do Price ID (inverso de priceIdFor). */
export function planForPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) return null;
  for (const plan of Object.keys(STRIPE_PRICE_ENV) as PaidPlanId[]) {
    if (process.env[STRIPE_PRICE_ENV[plan]] === priceId) return plan;
  }
  return null;
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}
