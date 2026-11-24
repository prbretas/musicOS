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

/**
 * Chave de pesquisa (lookup_key) de cada plano no Stripe.
 * Crie os preços com estas chaves e os IDs não precisam ir para o .env.
 */
export const STRIPE_LOOKUP_KEY: Record<PaidPlanId, string> = {
  pro_monthly: 'musicos_pro_monthly',
  pro_yearly: 'musicos_pro_yearly',
  lifetime: 'musicos_lifetime',
};

const resolvedPriceIds = new Map<PaidPlanId, string>();

/**
 * Price ID do Stripe de um plano pago: lê do ambiente (STRIPE_PRICE_*) ou,
 * se não estiver definido, procura pela lookup_key e guarda em cache.
 */
export async function resolvePriceId(plan: PaidPlanId): Promise<string> {
  const fromEnv = process.env[STRIPE_PRICE_ENV[plan]];
  if (fromEnv) return fromEnv;

  const cached = resolvedPriceIds.get(plan);
  if (cached) return cached;

  const lookupKey = STRIPE_LOOKUP_KEY[plan];
  const { data } = await getStripe().prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = data[0];
  if (!price) {
    throw new Error(
      `Preço do plano "${plan}" não encontrado. Defina ${STRIPE_PRICE_ENV[plan]} no .env ou crie um preço no Stripe com a chave de pesquisa "${lookupKey}".`
    );
  }
  resolvedPriceIds.set(plan, price.id);
  return price.id;
}

/** Plano a partir do Price ID (inverso de resolvePriceId, só para os IDs do ambiente/cache). */
export function planForPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) return null;
  for (const plan of Object.keys(STRIPE_PRICE_ENV) as PaidPlanId[]) {
    if (process.env[STRIPE_PRICE_ENV[plan]] === priceId || resolvedPriceIds.get(plan) === priceId) return plan;
  }
  return null;
}

/** Plano a partir da lookup_key de um preço (usado pelo webhook quando não há metadata). */
export function planForLookupKey(lookupKey: string | null | undefined): PaidPlanId | null {
  if (!lookupKey) return null;
  for (const plan of Object.keys(STRIPE_LOOKUP_KEY) as PaidPlanId[]) {
    if (STRIPE_LOOKUP_KEY[plan] === lookupKey) return plan;
  }
  return null;
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}
