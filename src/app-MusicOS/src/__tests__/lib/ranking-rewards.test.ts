// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { REWARD_CENTS, decideReward, isValidPeriod, previousMonthPeriod, type RewardRow } from '@/lib/ranking/rewards';

const reward = (overrides: Partial<RewardRow> = {}): RewardRow => ({
  id: 1,
  user_id: 'u1',
  period: '2026-10',
  place: 1,
  points: 500,
  amount_cents: 990,
  status: 'approved',
  ...overrides,
});

const subscriber = { subscription_tier: 'pro' as const, subscription_status: 'active', stripe_subscription_id: 'sub_1' };

describe('premiação do ranking', () => {
  it('1º lugar ganha uma mensalidade; depois 5 e 3 reais', () => {
    expect(REWARD_CENTS).toEqual({ 1: 990, 2: 500, 3: 300 });
  });

  it('mês anterior no horário de Brasília, inclusive na virada do ano', () => {
    expect(previousMonthPeriod(new Date('2026-11-24T15:00:00Z'))).toBe('2026-10');
    expect(previousMonthPeriod(new Date('2027-01-01T12:00:00Z'))).toBe('2026-12');
    // 1º de dezembro às 01:00 UTC ainda é 30 de novembro em Brasília
    expect(previousMonthPeriod(new Date('2026-12-01T01:00:00Z'))).toBe('2026-10');
  });

  it('valida o período', () => {
    expect(isValidPeriod('2026-10')).toBe(true);
    expect(isValidPeriod('2026-13')).toBe(false);
    expect(isValidPeriod('26-10')).toBe(false);
  });

  it('prêmio pendente espera aprovação, a menos que a aplicação automática esteja ligada', () => {
    expect(decideReward(reward({ status: 'pending' }), subscriber, false).kind).toBe('wait');
    expect(decideReward(reward({ status: 'pending' }), subscriber, true)).toEqual({ kind: 'apply', subscriptionId: 'sub_1' });
  });

  it('aprovado + assinante ativo → desconto na assinatura', () => {
    expect(decideReward(reward(), subscriber, false)).toEqual({ kind: 'apply', subscriptionId: 'sub_1' });
  });

  it('vitalício ou sem assinatura → selo do pódio', () => {
    const lifetime = { subscription_tier: 'lifetime' as const, subscription_status: 'active', stripe_subscription_id: null };
    const canceled = { subscription_tier: 'free' as const, subscription_status: 'canceled', stripe_subscription_id: null };
    expect(decideReward(reward(), lifetime, false).kind).toBe('badge_only');
    expect(decideReward(reward(), canceled, false).kind).toBe('badge_only');
  });

  it('prêmio já resolvido não é aplicado de novo', () => {
    for (const status of ['applied', 'badge_only', 'rejected'] as const) {
      expect(decideReward(reward({ status }), subscriber, true).kind).toBe('skip');
    }
  });
});
