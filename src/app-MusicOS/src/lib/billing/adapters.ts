/**
 * Implementações reais dos contratos de cobrança: Supabase (service role) e Stripe.
 * Usar somente no servidor.
 */

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '@/lib/entitlements';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import type { BillingDeps, BillingStore, StripeGateway } from './types';

function isNotFound(error: unknown): boolean {
  return (error as { code?: string; statusCode?: number })?.code === 'resource_missing' ||
    (error as { statusCode?: number })?.statusCode === 404;
}

export function supabaseBillingStore(admin: SupabaseClient = createAdminClient()): BillingStore {
  return {
    async getProfile(userId) {
      const { data, error } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw new Error(`profiles.select: ${error.message}`);
      return (data as Profile | null) ?? null;
    },
    async findUserIdByCustomer(customerId) {
      const { data, error } = await admin.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle();
      if (error) throw new Error(`profiles.select: ${error.message}`);
      return (data as { id: string } | null)?.id ?? null;
    },
    async updateProfile(userId, patch) {
      const { error } = await admin.from('profiles').update(patch).eq('id', userId);
      if (error) throw new Error(`profiles.update: ${error.message}`);
    },
    async claimEvent(eventId, type) {
      const { error } = await admin.from('stripe_events').insert({ id: eventId, type });
      if (!error) return 'new';
      if (error.code === '23505') return 'duplicate';
      // Falha ao registrar não pode bloquear o processamento
      console.error('[billing] stripe_events.insert:', error.message);
      return 'new';
    },
    async releaseEvent(eventId) {
      await admin.from('stripe_events').delete().eq('id', eventId);
    },
    async listBillingProfiles(offset, limit) {
      const { data, error } = await admin
        .from('profiles')
        .select('*')
        .not('stripe_customer_id', 'is', null)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);
      if (error) throw new Error(`profiles.list: ${error.message}`);
      return (data as Profile[]) ?? [];
    },
  };
}

export function stripeGateway(stripe: Stripe = getStripe()): StripeGateway {
  return {
    async retrieveSubscription(id) {
      try {
        return await stripe.subscriptions.retrieve(id);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    async cancelSubscription(id) {
      try {
        await stripe.subscriptions.cancel(id, { prorate: false });
      } catch (error) {
        // Já cancelada ou inexistente: o objetivo (não cobrar mais) está cumprido
        if (isNotFound(error)) return;
        const message = (error as { message?: string })?.message ?? '';
        if (/canceled subscription/i.test(message)) return;
        throw error;
      }
    },
    async retrieveInvoice(id) {
      try {
        return await stripe.invoices.retrieve(id);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    async retrieveCharge(id) {
      try {
        return await stripe.charges.retrieve(id);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    async listSubscriptions(customerId) {
      const { data } = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
      return [...data].sort((a, b) => b.created - a.created);
    },
    async lifetimePurchaseState(customerId) {
      const { data: sessions } = await stripe.checkout.sessions.list({ customer: customerId, limit: 100 });
      const purchases = sessions.filter(
        (s) => s.mode === 'payment' && s.metadata?.plan === 'lifetime' && s.payment_status === 'paid'
      );
      if (purchases.length === 0) return 'none';

      for (const session of purchases) {
        const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
        if (!piId) continue;
        const pi = await stripe.paymentIntents.retrieve(piId, { expand: ['latest_charge'] });
        const charge = pi.latest_charge as Stripe.Charge | null;
        if (!charge || charge.refunded) continue;
        if (charge.disputed) {
          // Contestação só invalida se não foi ganha
          const { data: disputes } = await stripe.disputes.list({ charge: charge.id, limit: 10 });
          if (!disputes.some((d) => d.status === 'won')) continue;
        }
        return 'valid';
      }
      return 'revoked';
    },
    async getCustomerEmail(customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      if ((customer as Stripe.DeletedCustomer).deleted) return null;
      return (customer as Stripe.Customer).email ?? null;
    },
    async updateCustomerEmail(customerId, email) {
      await stripe.customers.update(customerId, { email });
    },
  };
}

export function billingDeps(): BillingDeps {
  return {
    store: supabaseBillingStore(),
    stripe: stripeGateway(),
    log: (message, extra) => console.info(message, extra ?? ''),
  };
}
