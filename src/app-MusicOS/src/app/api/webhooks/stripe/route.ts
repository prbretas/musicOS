/**
 * POST /api/webhooks/stripe
 *
 * Única porta de entrada das mudanças de cobrança. O Stripe chama esta rota;
 * ela valida a assinatura, ignora eventos já processados (idempotência) e
 * grava o resultado no perfil do usuário com o cliente administrativo.
 *
 * Eventos tratados:
 *   checkout.session.completed      → ativa Pro (assinatura) ou Vitalício (pagamento único)
 *   customer.subscription.updated   → status, renovação, cancelamento agendado, troca de plano
 *   customer.subscription.deleted   → volta para Grátis
 *   invoice.payment_failed / paid   → past_due / active
 *
 * Configure no Stripe Dashboard → Developers → Webhooks → endpoint
 * https://SEU-DOMINIO/api/webhooks/stripe com esses eventos.
 */

import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile, SubscriptionStatus } from '@/lib/entitlements';
import type { PaidPlanId } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Admin = ReturnType<typeof createAdminClient>;

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

function normalizeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
    case 'incomplete':
    case 'unpaid':
      return status;
    case 'incomplete_expired':
      return 'canceled';
    case 'paused':
      return 'canceled';
    default:
      return 'none';
  }
}

async function findUserId(admin: Admin, opts: { userId?: string | null; customerId?: string | null }): Promise<string | null> {
  if (opts.userId) return opts.userId;
  if (!opts.customerId) return null;
  const { data } = await admin.from('profiles').select('id').eq('stripe_customer_id', opts.customerId).maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function getProfile(admin: Admin, userId: string): Promise<Profile | null> {
  const { data } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

async function applySubscription(admin: Admin, userId: string, sub: Stripe.Subscription) {
  const profile = await getProfile(admin, userId);
  // Quem já é vitalício nunca é rebaixado por eventos de assinatura antiga
  if (profile?.subscription_tier === 'lifetime') return;

  const priceId = sub.items.data[0]?.price?.id;
  const plan = (sub.metadata?.plan as PaidPlanId | undefined) ?? planForPriceId(priceId) ?? 'pro_monthly';
  const status = normalizeStatus(sub.status);
  const ended = status === 'canceled' || status === 'unpaid';

  await admin
    .from('profiles')
    .update({
      subscription_tier: ended ? 'free' : 'pro',
      subscription_status: status,
      plan_id: ended ? null : plan,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripe_subscription_id: ended ? null : sub.id,
      current_period_end: ended ? null : toIso(sub.current_period_end),
      cancel_at_period_end: ended ? false : Boolean(sub.cancel_at_period_end),
    })
    .eq('id', userId);
}

async function applyLifetime(admin: Admin, userId: string, customerId: string | null) {
  await admin
    .from('profiles')
    .update({
      subscription_tier: 'lifetime',
      subscription_status: 'active',
      plan_id: 'lifetime',
      stripe_customer_id: customerId,
      stripe_subscription_id: null,
      current_period_end: null,
      cancel_at_period_end: false,
    })
    .eq('id', userId);
}

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

  const admin = createAdminClient();

  // Idempotência: o Stripe reenvia eventos; cada um só é aplicado uma vez
  const { error: dedupeError } = await admin.from('stripe_events').insert({ id: event.id, type: event.type });
  if (dedupeError) {
    if (dedupeError.code === '23505') return NextResponse.json({ received: true, duplicate: true });
    console.error('[stripe/webhook] falha ao registrar evento:', dedupeError);
    // segue mesmo assim: é melhor aplicar duas vezes do que nunca
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
        const userId = await findUserId(admin, { userId: session.metadata?.userId ?? session.client_reference_id, customerId });
        if (!userId) break;

        if (session.mode === 'payment') {
          if (session.payment_status === 'paid') await applyLifetime(admin, userId, customerId);
        } else if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const sub = await getStripe().subscriptions.retrieve(subId);
          await applySubscription(admin, userId, sub);
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        // Boleto/Pix confirmados depois do checkout
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'payment') break;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
        const userId = await findUserId(admin, { userId: session.metadata?.userId ?? session.client_reference_id, customerId });
        if (userId) await applyLifetime(admin, userId, customerId);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const userId = await findUserId(admin, { userId: sub.metadata?.userId, customerId });
        if (!userId) break;
        if (event.type === 'customer.subscription.deleted') {
          await applySubscription(admin, userId, { ...sub, status: 'canceled' });
        } else {
          await applySubscription(admin, userId, sub);
        }
        break;
      }

      case 'invoice.payment_failed':
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null;
        const userId = await findUserId(admin, { customerId });
        if (!userId) break;
        const profile = await getProfile(admin, userId);
        if (profile?.subscription_tier !== 'pro') break;
        await admin
          .from('profiles')
          .update({ subscription_status: event.type === 'invoice.paid' ? 'active' : 'past_due' })
          .eq('id', userId);
        break;
      }

      default:
        // Outros eventos são aceitos e ignorados
        break;
    }
  } catch (error) {
    console.error(`[stripe/webhook] erro ao processar ${event.type}:`, error);
    // 500 faz o Stripe reenviar; a tabela stripe_events evita duplicar o efeito
    await admin.from('stripe_events').delete().eq('id', event.id);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
