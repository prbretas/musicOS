/**
 * Supabase e Stripe falsos, em memória, para testar as regras de cobrança
 * sem rede. Cada teste monta o cenário (perfis, assinaturas, cobranças) e
 * verifica o perfil resultante e as chamadas feitas ao Stripe.
 */

import type Stripe from 'stripe';
import type { Profile } from '@/lib/entitlements';
import type { BillingDeps, BillingPatch, BillingStore, StripeGateway } from '@/lib/billing/types';

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user_1',
    email: 'aluno@musicos.app',
    name: 'Aluno',
    avatar_url: null,
    stripe_customer_id: 'cus_1',
    stripe_subscription_id: null,
    plan_id: null,
    subscription_tier: 'free',
    subscription_status: 'none',
    current_period_end: null,
    cancel_at_period_end: false,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
    ...overrides,
  };
}

const NOW = 1795540000; // segundos

export function makeSubscription(
  overrides: {
    id?: string;
    customer?: string;
    status?: Stripe.Subscription.Status;
    interval?: 'month' | 'year';
    lookupKey?: string | null;
    userId?: string;
    plan?: string;
    periodEnd?: number;
    cancelAtPeriodEnd?: boolean;
    created?: number;
  } = {}
): Stripe.Subscription {
  const interval = overrides.interval ?? 'month';
  return {
    id: overrides.id ?? 'sub_1',
    object: 'subscription',
    customer: overrides.customer ?? 'cus_1',
    status: overrides.status ?? 'active',
    created: overrides.created ?? NOW,
    current_period_end: overrides.periodEnd ?? NOW + 30 * 86400,
    cancel_at_period_end: overrides.cancelAtPeriodEnd ?? false,
    metadata: {
      ...(overrides.userId !== undefined ? { userId: overrides.userId } : { userId: 'user_1' }),
      ...(overrides.plan ? { plan: overrides.plan } : {}),
    },
    items: {
      object: 'list',
      data: [
        {
          price: {
            id: `price_${interval}`,
            lookup_key: overrides.lookupKey === undefined ? null : overrides.lookupKey,
            recurring: { interval },
          },
        },
      ],
    },
  } as unknown as Stripe.Subscription;
}

let eventSeq = 0;
export function makeEvent(type: string, object: unknown, id?: string): Stripe.Event {
  eventSeq += 1;
  return {
    id: id ?? `evt_${eventSeq}`,
    object: 'event',
    type,
    data: { object },
  } as unknown as Stripe.Event;
}

export function checkoutSession(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    id: 'cs_1',
    object: 'checkout.session',
    customer: 'cus_1',
    client_reference_id: 'user_1',
    metadata: { userId: 'user_1', plan: 'pro_monthly' },
    mode: 'subscription',
    payment_status: 'paid',
    subscription: 'sub_1',
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

export function makeCharge(overrides: Record<string, unknown> = {}): Stripe.Charge {
  return {
    id: 'ch_1',
    object: 'charge',
    customer: 'cus_1',
    invoice: null,
    refunded: true,
    disputed: false,
    metadata: {},
    ...overrides,
  } as unknown as Stripe.Charge;
}

export function makeDispute(overrides: Record<string, unknown> = {}): Stripe.Dispute {
  return {
    id: 'dp_1',
    object: 'dispute',
    charge: 'ch_1',
    status: 'needs_response',
    ...overrides,
  } as unknown as Stripe.Dispute;
}

export class MemoryStore implements BillingStore {
  profiles = new Map<string, Profile>();
  events = new Set<string>();
  updates: { userId: string; patch: BillingPatch }[] = [];
  /** Faz a próxima atualização falhar (simula queda do banco). */
  failNextUpdate = false;

  constructor(profiles: Profile[] = [makeProfile()]) {
    profiles.forEach((p) => this.profiles.set(p.id, { ...p }));
  }

  profile(id = 'user_1'): Profile {
    const p = this.profiles.get(id);
    if (!p) throw new Error(`perfil ${id} não existe`);
    return p;
  }

  async getProfile(userId: string) {
    const p = this.profiles.get(userId);
    return p ? { ...p } : null;
  }
  async findUserIdByCustomer(customerId: string) {
    for (const p of this.profiles.values()) if (p.stripe_customer_id === customerId) return p.id;
    return null;
  }
  async updateProfile(userId: string, patch: BillingPatch) {
    if (this.failNextUpdate) {
      this.failNextUpdate = false;
      throw new Error('banco indisponível');
    }
    const p = this.profiles.get(userId);
    if (!p) throw new Error('perfil não existe');
    this.profiles.set(userId, { ...p, ...patch });
    this.updates.push({ userId, patch });
  }
  async claimEvent(eventId: string) {
    if (this.events.has(eventId)) return 'duplicate' as const;
    this.events.add(eventId);
    return 'new' as const;
  }
  async releaseEvent(eventId: string) {
    this.events.delete(eventId);
  }
  async listBillingProfiles(offset: number, limit: number) {
    return [...this.profiles.values()].filter((p) => p.stripe_customer_id).slice(offset, offset + limit);
  }
}

export class FakeStripe implements StripeGateway {
  subscriptions = new Map<string, Stripe.Subscription>();
  invoices = new Map<string, Stripe.Invoice>();
  charges = new Map<string, Stripe.Charge>();
  lifetime = new Map<string, 'valid' | 'revoked' | 'none'>();
  emails = new Map<string, string | null>();
  canceled: string[] = [];
  emailUpdates: { customerId: string; email: string }[] = [];
  /** Clientes cuja consulta ao Stripe deve falhar (simula erro de API). */
  failingCustomers = new Set<string>();

  addSubscription(sub: Stripe.Subscription) {
    this.subscriptions.set(sub.id, sub);
    return this;
  }

  async retrieveSubscription(id: string) {
    const s = this.subscriptions.get(id);
    return s ? { ...s } : null;
  }
  async cancelSubscription(id: string) {
    this.canceled.push(id);
    const s = this.subscriptions.get(id);
    if (s) this.subscriptions.set(id, { ...s, status: 'canceled' });
  }
  async retrieveInvoice(id: string) {
    return this.invoices.get(id) ?? null;
  }
  async retrieveCharge(id: string) {
    return this.charges.get(id) ?? null;
  }
  async listSubscriptions(customerId: string) {
    if (this.failingCustomers.has(customerId)) throw new Error('Stripe indisponível');
    return [...this.subscriptions.values()]
      .filter((s) => s.customer === customerId)
      .sort((a, b) => b.created - a.created);
  }
  async lifetimePurchaseState(customerId: string) {
    if (this.failingCustomers.has(customerId)) throw new Error('Stripe indisponível');
    return this.lifetime.get(customerId) ?? 'none';
  }
  async getCustomerEmail(customerId: string) {
    return this.emails.has(customerId) ? this.emails.get(customerId)! : 'aluno@musicos.app';
  }
  async updateCustomerEmail(customerId: string, email: string) {
    this.emailUpdates.push({ customerId, email });
    this.emails.set(customerId, email);
  }
}

export function deps(store = new MemoryStore(), stripe = new FakeStripe()): BillingDeps & {
  store: MemoryStore;
  stripe: FakeStripe;
} {
  return { store, stripe };
}
