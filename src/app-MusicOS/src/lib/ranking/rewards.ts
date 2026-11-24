/**
 * Premiação mensal do ranking de exercícios.
 *
 * Todo dia 1º, os 3 primeiros do mês anterior (com 50+ respostas e 60%+ de
 * acerto, e que aparecem no ranking) ganham desconto na próxima cobrança:
 *   1º lugar: R$ 9,90 · 2º: R$ 5,00 · 3º: R$ 3,00 (uma vez)
 * Quem é vitalício ou não tem assinatura recebe o selo do pódio.
 *
 * Por padrão o prêmio fica "pending" até alguém aprovar (status → approved no
 * Supabase), porque o ranking vale dinheiro e merece um olhar humano.
 * Com REWARDS_AUTO_APPLY=1 o desconto é aplicado direto.
 */

export type RewardStatus = 'pending' | 'approved' | 'applied' | 'badge_only' | 'rejected';

export const REWARD_CENTS: Record<1 | 2 | 3, number> = { 1: 990, 2: 500, 3: 300 };

export const REWARD_RULES = {
  minAnswers: 50,
  minAccuracy: 60,
};

export interface RewardRow {
  id: number;
  user_id: string;
  period: string;
  place: 1 | 2 | 3;
  points: number;
  amount_cents: number;
  status: RewardStatus;
}

export interface RewardProfile {
  subscription_tier: 'free' | 'pro' | 'lifetime';
  subscription_status: string;
  stripe_subscription_id: string | null;
}

export type RewardDecision =
  | { kind: 'skip'; reason: string }
  | { kind: 'wait'; reason: string }
  | { kind: 'apply'; subscriptionId: string }
  | { kind: 'badge_only'; reason: string };

/** "YYYY-MM" do mês anterior, no horário de Brasília. */
export function previousMonthPeriod(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  let year = Number(parts.year);
  let month = Number(parts.month) - 1;
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function isValidPeriod(period: string): boolean {
  const m = period.match(/^(\d{4})-(\d{2})$/);
  return !!m && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

/** O que fazer com um prêmio. */
export function decideReward(reward: RewardRow, profile: RewardProfile | null, autoApply: boolean): RewardDecision {
  if (reward.status === 'applied' || reward.status === 'badge_only' || reward.status === 'rejected') {
    return { kind: 'skip', reason: `já ${reward.status}` };
  }
  if (reward.status === 'pending' && !autoApply) {
    return { kind: 'wait', reason: 'aguardando aprovação' };
  }
  if (!profile) return { kind: 'badge_only', reason: 'perfil não encontrado' };

  const activeSub =
    profile.subscription_tier === 'pro' &&
    ['active', 'trialing', 'past_due'].includes(profile.subscription_status) &&
    !!profile.stripe_subscription_id;

  if (activeSub) return { kind: 'apply', subscriptionId: profile.stripe_subscription_id! };
  if (profile.subscription_tier === 'lifetime') return { kind: 'badge_only', reason: 'vitalício (sem mensalidade)' };
  return { kind: 'badge_only', reason: 'sem assinatura ativa' };
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export const PLACE_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
