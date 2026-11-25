/**
 * Mapeamento entre planos do MusicOS e preços do Stripe.
 * Sem dependência do SDK do Stripe: pode ser usado em testes e no webhook.
 */

import { STRIPE_PRICE_ENV, type PaidPlanId } from '@/lib/plans';

/**
 * Chave de pesquisa (lookup_key) de cada plano no Stripe.
 * Crie os preços com estas chaves e os IDs não precisam ir para o .env.
 */
export const STRIPE_LOOKUP_KEY: Record<PaidPlanId, string> = {
  pro_monthly: 'musicos_pro_monthly',
  pro_yearly: 'musicos_pro_yearly',
  lifetime: 'musicos_lifetime',
};

/** Price IDs descobertos pela lookup_key (preenchido por resolvePriceId). */
export const resolvedPriceIds = new Map<PaidPlanId, string>();

/** Plano a partir do Price ID configurado no ambiente ou já resolvido. */
export function planForPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) return null;
  for (const plan of Object.keys(STRIPE_PRICE_ENV) as PaidPlanId[]) {
    if (process.env[STRIPE_PRICE_ENV[plan]] === priceId || resolvedPriceIds.get(plan) === priceId) return plan;
  }
  return null;
}

/** Plano a partir da lookup_key de um preço. */
export function planForLookupKey(lookupKey: string | null | undefined): PaidPlanId | null {
  if (!lookupKey) return null;
  for (const plan of Object.keys(STRIPE_LOOKUP_KEY) as PaidPlanId[]) {
    if (STRIPE_LOOKUP_KEY[plan] === lookupKey) return plan;
  }
  return null;
}
