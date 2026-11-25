/**
 * Regras de cobrança do MusicOS: como cada evento do Stripe muda o acesso.
 *
 * Princípios
 *  - O Stripe é a fonte da verdade: em eventos de assinatura, a assinatura é
 *    relida da API, então eventos fora de ordem não reativam nada por engano.
 *  - Cada evento é aplicado uma única vez (idempotência por event.id).
 *  - Vitalício nunca é rebaixado por eventos de assinatura; e ao virar
 *    vitalício, a assinatura mensal/anual que existir é cancelada (sem cobrança dupla).
 *  - Estorno total ou contestação (chargeback) remove o acesso pago.
 */

import type Stripe from 'stripe';
import type { Profile, SubscriptionStatus } from '@/lib/entitlements';
import type { PaidPlanId } from '@/lib/plans';
import { planForLookupKey, planForPriceId } from '@/lib/stripe/prices';
import type { BillingDeps, BillingPatch, ProcessResult } from './types';

const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due'];

export function isActiveStatus(status: SubscriptionStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function normalizeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
    case 'incomplete':
    case 'unpaid':
      return status;
    case 'incomplete_expired':
    case 'paused':
      return 'canceled';
    default:
      return 'none';
  }
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

export function planFromSubscription(sub: Stripe.Subscription): PaidPlanId {
  const price = sub.items?.data?.[0]?.price;
  const fromMeta = sub.metadata?.plan;
  if (fromMeta === 'pro_monthly' || fromMeta === 'pro_yearly') return fromMeta;
  const known = planForPriceId(price?.id) ?? planForLookupKey(price?.lookup_key);
  if (known && known !== 'lifetime') return known;
  return price?.recurring?.interval === 'year' ? 'pro_yearly' : 'pro_monthly';
}

/** Como o perfil deve ficar para refletir esta assinatura. */
export function subscriptionPatch(sub: Stripe.Subscription): BillingPatch {
  const status = normalizeStatus(sub.status);
  const active = isActiveStatus(status);
  const terminal = status === 'canceled' || status === 'unpaid';
  return {
    subscription_tier: active ? 'pro' : 'free',
    subscription_status: status,
    plan_id: active ? planFromSubscription(sub) : null,
    stripe_customer_id: idOf(sub.customer),
    stripe_subscription_id: terminal ? null : sub.id,
    current_period_end: active ? toIso(sub.current_period_end) : null,
    cancel_at_period_end: active ? Boolean(sub.cancel_at_period_end) : false,
  };
}

export const LIFETIME_PATCH: BillingPatch = {
  subscription_tier: 'lifetime',
  subscription_status: 'active',
  plan_id: 'lifetime',
  stripe_subscription_id: null,
  current_period_end: null,
  cancel_at_period_end: false,
};

export const REVOKED_PATCH: BillingPatch = {
  subscription_tier: 'free',
  subscription_status: 'canceled',
  plan_id: null,
  stripe_subscription_id: null,
  current_period_end: null,
  cancel_at_period_end: false,
};

/** O perfil já está igual ao patch? (evita escritas desnecessárias) */
export function matchesPatch(profile: Profile, patch: BillingPatch): boolean {
  return (Object.keys(patch) as (keyof BillingPatch)[]).every((k) => (profile[k] ?? null) === (patch[k] ?? null));
}

async function resolveUserId(
  deps: BillingDeps,
  opts: { userId?: string | null; customerId?: string | null }
): Promise<string | null> {
  if (opts.userId) return opts.userId;
  if (!opts.customerId) return null;
  return deps.store.findUserIdByCustomer(opts.customerId);
}

/** Aplica o estado de uma assinatura ao perfil. Retorna o nome da ação. */
export async function applySubscription(deps: BillingDeps, userId: string, sub: Stripe.Subscription): Promise<string> {
  const profile = await deps.store.getProfile(userId);
  if (!profile) return 'ignored:no-profile';

  const status = normalizeStatus(sub.status);

  if (profile.subscription_tier === 'lifetime') {
    // Já é vitalício: uma assinatura ainda ativa só geraria cobrança indevida
    if (isActiveStatus(status)) {
      await deps.stripe.cancelSubscription(sub.id);
      return 'lifetime:canceled-leftover-subscription';
    }
    return 'ignored:lifetime-kept';
  }

  // Evento de uma assinatura antiga não pode derrubar a assinatura vigente
  if (
    profile.stripe_subscription_id &&
    profile.stripe_subscription_id !== sub.id &&
    isActiveStatus(profile.subscription_status) &&
    !isActiveStatus(status)
  ) {
    return 'ignored:stale-subscription';
  }

  const patch = subscriptionPatch(sub);
  if (matchesPatch(profile, patch)) return 'ignored:no-change';
  await deps.store.updateProfile(userId, patch);
  return isActiveStatus(status) ? `subscription:${status}` : `subscription:ended:${status}`;
}

/** Concede o vitalício e cancela a assinatura recorrente que existir. */
export async function applyLifetime(deps: BillingDeps, userId: string, customerId: string | null): Promise<string> {
  const profile = await deps.store.getProfile(userId);
  if (!profile) return 'ignored:no-profile';
  if (profile.subscription_tier === 'lifetime') return 'ignored:already-lifetime';

  let action = 'lifetime:granted';
  if (profile.stripe_subscription_id && isActiveStatus(profile.subscription_status)) {
    await deps.stripe.cancelSubscription(profile.stripe_subscription_id);
    action = 'lifetime:granted+canceled-subscription';
  }
  await deps.store.updateProfile(userId, { ...LIFETIME_PATCH, stripe_customer_id: customerId ?? profile.stripe_customer_id });
  return action;
}

/**
 * Estorno total ou contestação de uma cobrança: descobre se era de uma
 * assinatura ou da compra vitalícia e remove o acesso correspondente.
 */
async function revokeForCharge(deps: BillingDeps, charge: Stripe.Charge, reason: 'refund' | 'dispute'): Promise<string> {
  const customerId = idOf(charge.customer);
  const userId = await resolveUserId(deps, { userId: charge.metadata?.userId, customerId });
  if (!userId) return `ignored:${reason}:no-user`;
  const profile = await deps.store.getProfile(userId);
  if (!profile) return `ignored:${reason}:no-profile`;

  const invoiceId = idOf(charge.invoice);
  const invoice = invoiceId ? await deps.stripe.retrieveInvoice(invoiceId) : null;
  const subscriptionId = idOf(invoice?.subscription ?? null);

  if (subscriptionId) {
    await deps.stripe.cancelSubscription(subscriptionId);
    if (profile.subscription_tier === 'lifetime') return `${reason}:subscription-canceled(lifetime-kept)`;
    await deps.store.updateProfile(userId, REVOKED_PATCH);
    return `${reason}:subscription-revoked`;
  }

  if (profile.subscription_tier === 'lifetime') {
    await deps.store.updateProfile(userId, REVOKED_PATCH);
    return `${reason}:lifetime-revoked`;
  }
  return `ignored:${reason}:nothing-to-revoke`;
}

async function handle(event: Stripe.Event, deps: BillingDeps): Promise<string> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = idOf(session.customer);
      const userId = await resolveUserId(deps, {
        userId: session.metadata?.userId ?? session.client_reference_id,
        customerId,
      });
      if (!userId) return 'ignored:no-user';

      if (session.mode === 'payment') {
        if (session.metadata?.plan !== 'lifetime') return 'ignored:not-a-musicos-purchase';
        if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
          return 'awaiting:async-payment'; // Pix/boleto ainda não compensado
        }
        return applyLifetime(deps, userId, customerId);
      }

      if (session.mode === 'subscription') {
        const subId = idOf(session.subscription);
        if (!subId) return 'ignored:no-subscription';
        const sub = await deps.stripe.retrieveSubscription(subId);
        if (!sub) return 'ignored:subscription-not-found';
        return applySubscription(deps, userId, sub);
      }
      return 'ignored:mode';
    }

    case 'checkout.session.async_payment_failed':
      return 'ignored:async-payment-failed';

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const payload = event.data.object as Stripe.Subscription;
      // Relê do Stripe: protege contra eventos atrasados/fora de ordem
      const fresh = (await deps.stripe.retrieveSubscription(payload.id)) ?? payload;
      const sub = event.type === 'customer.subscription.deleted' ? { ...fresh, status: 'canceled' as const } : fresh;
      const userId = await resolveUserId(deps, { userId: sub.metadata?.userId, customerId: idOf(sub.customer) });
      if (!userId) return 'ignored:no-user';
      return applySubscription(deps, userId, sub);
    }

    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = idOf(invoice.subscription);
      if (!subId) return 'ignored:not-a-subscription-invoice';
      const sub = await deps.stripe.retrieveSubscription(subId);
      if (!sub) return 'ignored:subscription-not-found';
      const userId = await resolveUserId(deps, { userId: sub.metadata?.userId, customerId: idOf(invoice.customer) });
      if (!userId) return 'ignored:no-user';
      return applySubscription(deps, userId, sub);
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      if (!charge.refunded) return 'ignored:partial-refund'; // estorno parcial não tira acesso
      return revokeForCharge(deps, charge, 'refund');
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;
      const charge = typeof dispute.charge === 'string' ? await deps.stripe.retrieveCharge(dispute.charge) : dispute.charge;
      if (!charge) return 'ignored:dispute:charge-not-found';
      return revokeForCharge(deps, charge, 'dispute');
    }

    case 'charge.dispute.closed': {
      const dispute = event.data.object as Stripe.Dispute;
      if (dispute.status !== 'won') return `ignored:dispute-closed:${dispute.status}`;
      const charge = typeof dispute.charge === 'string' ? await deps.stripe.retrieveCharge(dispute.charge) : dispute.charge;
      if (!charge) return 'ignored:dispute:charge-not-found';
      const invoiceId = idOf(charge.invoice);
      const invoice = invoiceId ? await deps.stripe.retrieveInvoice(invoiceId) : null;
      if (idOf(invoice?.subscription ?? null)) {
        // A assinatura já foi cancelada na contestação; o cliente precisa assinar de novo
        return 'ignored:dispute-won:subscription-not-restored';
      }
      const customerId = idOf(charge.customer);
      const userId = await resolveUserId(deps, { userId: charge.metadata?.userId, customerId });
      if (!userId) return 'ignored:no-user';
      return applyLifetime(deps, userId, customerId);
    }

    default:
      return `ignored:unhandled:${event.type}`;
  }
}

/**
 * Processa um evento do Stripe já validado (assinatura conferida pela rota).
 * Em caso de erro, libera o registro do evento e relança: a rota responde 500
 * e o Stripe reenvia mais tarde.
 */
export async function processStripeEvent(event: Stripe.Event, deps: BillingDeps): Promise<ProcessResult> {
  const claim = await deps.store.claimEvent(event.id, event.type);
  if (claim === 'duplicate') return { status: 'duplicate' };

  try {
    const action = await handle(event, deps);
    deps.log?.(`[billing] ${event.type} → ${action}`, { eventId: event.id });
    return { status: action.startsWith('ignored:') ? 'ignored' : 'processed', action };
  } catch (error) {
    await deps.store.releaseEvent(event.id);
    throw error;
  }
}
