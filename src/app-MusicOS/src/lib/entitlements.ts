/**
 * Direitos de acesso (entitlements) de um usuário.
 *
 * O perfil (tabela `profiles`) é a fonte de verdade: o webhook do Stripe
 * grava tier/status lá e o app lê daqui, tanto no servidor quanto no cliente.
 */

import type { PlanId, Tier } from './plans';

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid';

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: PlanId | null;
  subscription_tier: Tier;
  subscription_status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  /** Aparece no ranking dos exercícios (padrão true) */
  show_in_ranking?: boolean;
  /** 'admin' libera o painel /admin (o usuário não consegue alterar esta coluna) */
  role?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Entitlement {
  tier: Tier;
  /** Pode usar recursos Pro agora */
  isPro: boolean;
  isLifetime: boolean;
  status: SubscriptionStatus;
  planId: PlanId | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export const FREE_ENTITLEMENT: Entitlement = {
  tier: 'free',
  isPro: false,
  isLifetime: false,
  status: 'none',
  planId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

/** Status de assinatura que mantêm o acesso Pro (past_due tem carência enquanto o Stripe tenta cobrar). */
const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due'];

export function entitlementFromProfile(profile: Profile | null | undefined): Entitlement {
  if (!profile) return FREE_ENTITLEMENT;

  const isLifetime = profile.subscription_tier === 'lifetime';
  const proActive = profile.subscription_tier === 'pro' && ACTIVE_STATUSES.includes(profile.subscription_status);

  return {
    tier: isLifetime ? 'lifetime' : proActive ? 'pro' : 'free',
    isPro: isLifetime || proActive,
    isLifetime,
    status: profile.subscription_status ?? 'none',
    planId: profile.plan_id ?? null,
    currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
    cancelAtPeriodEnd: Boolean(profile.cancel_at_period_end),
  };
}

/** Texto curto do plano para a interface ("Pro Anual", "Vitalício", "Grátis"). */
export function entitlementLabel(e: Entitlement): string {
  if (e.isLifetime) return 'Vitalício';
  if (e.isPro) return e.planId === 'pro_yearly' ? 'Pro Anual' : 'Pro Mensal';
  return 'Grátis';
}
