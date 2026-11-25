/**
 * Chamadas de cobrança feitas pelo navegador.
 * O Stripe nunca é carregado no cliente: tudo passa pelas rotas /api/stripe/*.
 */

import type { PaidPlanId } from '@/lib/plans';
import { flush, track } from '@/lib/analytics/client';

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || 'Não foi possível concluir. Tente novamente.');
  return data;
}

/** Cria a sessão de checkout do plano e leva o usuário ao Stripe. */
export async function startCheckout(plan: PaidPlanId): Promise<void> {
  track('checkout_start', { plan });
  flush();
  const { url } = await postJson<{ url: string }>('/api/stripe/checkout', { plan });
  window.location.assign(url);
}

/** Abre o portal do Stripe para trocar cartão, ver faturas ou cancelar. */
export async function openCustomerPortal(): Promise<void> {
  const { url } = await postJson<{ url: string }>('/api/stripe/portal');
  window.location.assign(url);
}

/** Caminho que inicia o checkout de um plano (usado como `next` após login/cadastro). */
export function checkoutPath(plan: PaidPlanId): string {
  return `/checkout?plan=${plan}`;
}
