import { describe, expect, it } from 'vitest';
import { entitlementFromProfile, entitlementLabel, type Profile } from '@/lib/entitlements';
import { PLANS, formatPrice, isPaidPlan } from '@/lib/plans';

function profile(overrides: Partial<Profile>): Profile {
  return {
    id: 'u1',
    email: 'a@b.com',
    name: 'Ana',
    avatar_url: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan_id: null,
    subscription_tier: 'free',
    subscription_status: 'none',
    current_period_end: null,
    cancel_at_period_end: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('entitlements', () => {
  it('sem perfil é grátis', () => {
    const e = entitlementFromProfile(null);
    expect(e.isPro).toBe(false);
    expect(e.tier).toBe('free');
    expect(entitlementLabel(e)).toBe('Grátis');
  });

  it('pro ativo libera', () => {
    const e = entitlementFromProfile(profile({ subscription_tier: 'pro', subscription_status: 'active', plan_id: 'pro_yearly' }));
    expect(e.isPro).toBe(true);
    expect(e.isLifetime).toBe(false);
    expect(entitlementLabel(e)).toBe('Pro Anual');
  });

  it('past_due mantém acesso (carência) e canceled não', () => {
    expect(entitlementFromProfile(profile({ subscription_tier: 'pro', subscription_status: 'past_due' })).isPro).toBe(true);
    expect(entitlementFromProfile(profile({ subscription_tier: 'pro', subscription_status: 'canceled' })).isPro).toBe(false);
    expect(entitlementFromProfile(profile({ subscription_tier: 'pro', subscription_status: 'incomplete' })).isPro).toBe(false);
  });

  it('vitalício ignora status', () => {
    const e = entitlementFromProfile(profile({ subscription_tier: 'lifetime', subscription_status: 'none' }));
    expect(e.isPro).toBe(true);
    expect(e.isLifetime).toBe(true);
    expect(entitlementLabel(e)).toBe('Vitalício');
  });

  it('converte a data de renovação', () => {
    const e = entitlementFromProfile(
      profile({ subscription_tier: 'pro', subscription_status: 'active', current_period_end: '2027-03-01T00:00:00Z', cancel_at_period_end: true })
    );
    expect(e.currentPeriodEnd?.toISOString()).toBe('2027-03-01T00:00:00.000Z');
    expect(e.cancelAtPeriodEnd).toBe(true);
  });
});

describe('plans', () => {
  it('tem exatamente os planos pagos esperados', () => {
    expect(isPaidPlan('pro_monthly')).toBe(true);
    expect(isPaidPlan('pro_yearly')).toBe(true);
    expect(isPaidPlan('lifetime')).toBe(true);
    expect(isPaidPlan('free')).toBe(false);
    expect(isPaidPlan('premium')).toBe(false);
  });

  it('anual é mais barato que 12 mensais e vitalício é pagamento único', () => {
    expect(PLANS.pro_yearly.price).toBeLessThan(PLANS.pro_monthly.price * 12);
    expect(PLANS.lifetime.recurring).toBe(false);
    expect(PLANS.pro_monthly.recurring).toBe(true);
  });

  it('formata em reais', () => {
    expect(formatPrice(9.9).replace(/ /g, ' ')).toBe('R$ 9,90');
    expect(formatPrice(197).replace(/ /g, ' ')).toBe('R$ 197,00');
  });
});
