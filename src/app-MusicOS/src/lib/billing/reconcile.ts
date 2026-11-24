/**
 * Reconciliação: compara o que o Stripe diz com o que está no Supabase e
 * corrige as diferenças. Cobre os casos em que um webhook se perdeu
 * (servidor fora do ar, segredo errado, evento expirado) e mantém o e-mail
 * do cliente no Stripe igual ao do app.
 *
 * Roda de duas formas:
 *  - para todos:   GET /api/cron/reconcile (agendado, protegido por CRON_SECRET)
 *  - para um só:   POST /api/billing/sync (a página da conta chama após o checkout)
 */

import type { Profile } from '@/lib/entitlements';
import type { BillingDeps } from './types';
import {
  LIFETIME_PATCH,
  REVOKED_PATCH,
  applyLifetime,
  isActiveStatus,
  matchesPatch,
  normalizeStatus,
  subscriptionPatch,
} from './sync';

export type ReconcileAction =
  | 'ok'
  | 'skip:no-customer'
  | 'fixed:lifetime-granted'
  | 'fixed:lifetime-revoked'
  | 'warn:lifetime-without-purchase'
  | 'fixed:subscription'
  | 'fixed:downgraded-no-subscription'
  | 'lifetime:canceled-leftover-subscription';

export interface ReconcileResult {
  userId: string;
  action: ReconcileAction;
  emailSynced: boolean;
}

export async function reconcileProfile(deps: BillingDeps, profile: Profile): Promise<ReconcileResult> {
  const customerId = profile.stripe_customer_id;
  if (!customerId) return { userId: profile.id, action: 'skip:no-customer', emailSynced: false };

  // E-mail: o Stripe envia recibos e avisos de cobrança para este endereço
  let emailSynced = false;
  if (profile.email) {
    const stripeEmail = await deps.stripe.getCustomerEmail(customerId);
    if (stripeEmail !== profile.email) {
      await deps.stripe.updateCustomerEmail(customerId, profile.email);
      emailSynced = true;
    }
  }

  const lifetime = await deps.stripe.lifetimePurchaseState(customerId);

  if (lifetime === 'valid') {
    if (profile.subscription_tier !== 'lifetime') {
      await applyLifetime(deps, profile.id, customerId);
      return { userId: profile.id, action: 'fixed:lifetime-granted', emailSynced };
    }
    // Vitalício com assinatura recorrente ainda ativa → cancela para não cobrar
    const subs = await deps.stripe.listSubscriptions(customerId);
    const leftover = subs.find((s) => isActiveStatus(normalizeStatus(s.status)));
    if (leftover) {
      await deps.stripe.cancelSubscription(leftover.id);
      return { userId: profile.id, action: 'lifetime:canceled-leftover-subscription', emailSynced };
    }
    if (!matchesPatch(profile, LIFETIME_PATCH)) {
      await deps.store.updateProfile(profile.id, LIFETIME_PATCH);
    }
    return { userId: profile.id, action: 'ok', emailSynced };
  }

  if (profile.subscription_tier === 'lifetime') {
    if (lifetime === 'revoked') {
      await deps.store.updateProfile(profile.id, REVOKED_PATCH);
      return { userId: profile.id, action: 'fixed:lifetime-revoked', emailSynced };
    }
    // Sem compra no Stripe: provavelmente concedido à mão. Não mexe, só avisa.
    return { userId: profile.id, action: 'warn:lifetime-without-purchase', emailSynced };
  }

  const subs = await deps.stripe.listSubscriptions(customerId);
  const current = subs.find((s) => isActiveStatus(normalizeStatus(s.status))) ?? subs[0];

  if (!current) {
    if (profile.subscription_tier === 'pro' || isActiveStatus(profile.subscription_status)) {
      await deps.store.updateProfile(profile.id, REVOKED_PATCH);
      return { userId: profile.id, action: 'fixed:downgraded-no-subscription', emailSynced };
    }
    return { userId: profile.id, action: 'ok', emailSynced };
  }

  const patch = subscriptionPatch(current);
  if (matchesPatch(profile, patch)) return { userId: profile.id, action: 'ok', emailSynced };
  await deps.store.updateProfile(profile.id, patch);
  return { userId: profile.id, action: 'fixed:subscription', emailSynced };
}

export interface ReconcileSummary {
  checked: number;
  fixed: number;
  emailsSynced: number;
  warnings: number;
  errors: { userId: string; message: string }[];
  changes: ReconcileResult[];
}

export async function reconcileAll(deps: BillingDeps, pageSize = 100): Promise<ReconcileSummary> {
  const summary: ReconcileSummary = { checked: 0, fixed: 0, emailsSynced: 0, warnings: 0, errors: [], changes: [] };

  for (let offset = 0; ; offset += pageSize) {
    const page = await deps.store.listBillingProfiles(offset, pageSize);
    for (const profile of page) {
      summary.checked += 1;
      try {
        const result = await reconcileProfile(deps, profile);
        if (result.emailSynced) summary.emailsSynced += 1;
        if (result.action.startsWith('fixed:') || result.action.startsWith('lifetime:')) summary.fixed += 1;
        if (result.action.startsWith('warn:')) summary.warnings += 1;
        if (result.action !== 'ok' || result.emailSynced) summary.changes.push(result);
      } catch (error) {
        summary.errors.push({ userId: profile.id, message: error instanceof Error ? error.message : String(error) });
      }
    }
    if (page.length < pageSize) break;
  }
  return summary;
}
