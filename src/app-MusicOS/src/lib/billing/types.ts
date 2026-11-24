/**
 * Contratos da camada de cobrança.
 *
 * A lógica (webhook e reconciliação) depende só destas interfaces. Em produção
 * elas são implementadas com o Supabase e o Stripe (adapters.ts); nos testes,
 * com versões em memória. Assim todos os cenários de pagamento são testáveis
 * sem rede e sem chaves.
 */

import type Stripe from 'stripe';
import type { Profile } from '@/lib/entitlements';

/** Campos do perfil que a cobrança pode alterar. */
export type BillingPatch = Partial<
  Pick<
    Profile,
    | 'subscription_tier'
    | 'subscription_status'
    | 'plan_id'
    | 'stripe_customer_id'
    | 'stripe_subscription_id'
    | 'current_period_end'
    | 'cancel_at_period_end'
  >
>;

export interface BillingStore {
  getProfile(userId: string): Promise<Profile | null>;
  findUserIdByCustomer(customerId: string): Promise<string | null>;
  updateProfile(userId: string, patch: BillingPatch): Promise<void>;
  /** Registra o evento. 'duplicate' se já foi processado antes. */
  claimEvent(eventId: string, type: string): Promise<'new' | 'duplicate'>;
  /** Desfaz o registro para o Stripe poder reenviar após uma falha. */
  releaseEvent(eventId: string): Promise<void>;
  /** Perfis com cliente no Stripe (para a reconciliação), em páginas. */
  listBillingProfiles(offset: number, limit: number): Promise<Profile[]>;
}

export interface StripeGateway {
  retrieveSubscription(id: string): Promise<Stripe.Subscription | null>;
  cancelSubscription(id: string): Promise<void>;
  retrieveInvoice(id: string): Promise<Stripe.Invoice | null>;
  retrieveCharge(id: string): Promise<Stripe.Charge | null>;
  /** Todas as assinaturas do cliente (qualquer status), mais recentes primeiro. */
  listSubscriptions(customerId: string): Promise<Stripe.Subscription[]>;
  /**
   * Situação da compra vitalícia do cliente no Stripe:
   *  'valid'   — paga e não estornada/contestada
   *  'revoked' — houve compra, mas foi estornada ou contestada
   *  'none'    — nunca comprou (um vitalício no banco seria concessão manual)
   */
  lifetimePurchaseState(customerId: string): Promise<'valid' | 'revoked' | 'none'>;
  getCustomerEmail(customerId: string): Promise<string | null>;
  updateCustomerEmail(customerId: string, email: string): Promise<void>;
}

export interface BillingDeps {
  store: BillingStore;
  stripe: StripeGateway;
  log?: (message: string, extra?: Record<string, unknown>) => void;
}

export type ProcessResult = { status: 'processed' | 'duplicate' | 'ignored'; action?: string };
