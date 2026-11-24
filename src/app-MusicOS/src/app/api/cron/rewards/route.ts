/**
 * GET /api/cron/rewards[?period=YYYY-MM]
 *
 * Premiação mensal do ranking (agende para o dia 1º de cada mês):
 *   1. calcula os 3 primeiros do mês (padrão: o mês anterior);
 *   2. registra os prêmios em ranking_rewards (status "pending");
 *   3. aplica o desconto dos prêmios aprovados (ou de todos, com REWARDS_AUTO_APPLY=1)
 *      como cupom na próxima cobrança da assinatura.
 *
 * Para aprovar: no Supabase, mude o status do prêmio para "approved" e chame esta rota de novo.
 * Protegida por CRON_SECRET (Authorization: Bearer <segredo>).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import {
  REWARD_CENTS,
  decideReward,
  isValidPeriod,
  previousMonthPeriod,
  type RewardProfile,
  type RewardRow,
} from '@/lib/ranking/rewards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function ensureCoupon(place: 1 | 2 | 3): Promise<string> {
  const stripe = getStripe();
  const id = `musicos-ranking-${place}`;
  try {
    await stripe.coupons.retrieve(id);
  } catch {
    await stripe.coupons.create({
      id,
      name: `Ranking MusicOS — ${place}º lugar`,
      amount_off: REWARD_CENTS[place],
      currency: 'brl',
      duration: 'once',
    });
  }
  return id;
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'CRON_SECRET não configurada' }, { status: 500 });
  if (!authorized(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const period = request.nextUrl.searchParams.get('period') ?? previousMonthPeriod();
  if (!isValidPeriod(period)) return NextResponse.json({ error: 'Período inválido (use YYYY-MM)' }, { status: 400 });
  const autoApply = process.env.REWARDS_AUTO_APPLY === '1';

  const admin = createAdminClient();
  const log: { userId: string; place: number; action: string }[] = [];

  try {
    // 1-2. vencedores → prêmios (não duplica se a rota rodar de novo)
    const { data: winners, error: wErr } = await admin.rpc('ranking_month_winners', { p_period: period });
    if (wErr) throw new Error(`ranking_month_winners: ${wErr.message}`);

    for (const w of (winners ?? []) as { place: 1 | 2 | 3; user_id: string; points: number }[]) {
      await admin.from('ranking_rewards').upsert(
        { user_id: w.user_id, period, place: w.place, points: w.points, amount_cents: REWARD_CENTS[w.place], status: 'pending' },
        { onConflict: 'period,place', ignoreDuplicates: true }
      );
    }

    // 3. aplica
    const { data: rewards, error: rErr } = await admin.from('ranking_rewards').select('*').eq('period', period).order('place');
    if (rErr) throw new Error(`ranking_rewards: ${rErr.message}`);

    for (const reward of (rewards ?? []) as RewardRow[]) {
      const { data: profile } = await admin
        .from('profiles')
        .select('subscription_tier, subscription_status, stripe_subscription_id')
        .eq('id', reward.user_id)
        .maybeSingle();
      const decision = decideReward(reward, profile as RewardProfile | null, autoApply);

      if (decision.kind === 'apply') {
        const coupon = await ensureCoupon(reward.place);
        await getStripe().subscriptions.update(decision.subscriptionId, { coupon });
        await admin
          .from('ranking_rewards')
          .update({ status: 'applied', stripe_coupon: coupon, applied_at: new Date().toISOString() })
          .eq('id', reward.id);
      } else if (decision.kind === 'badge_only') {
        await admin.from('ranking_rewards').update({ status: 'badge_only', note: decision.reason }).eq('id', reward.id);
      }
      log.push({ userId: reward.user_id, place: reward.place, action: decision.kind });
    }

    return NextResponse.json({ period, autoApply, rewards: log });
  } catch (error) {
    console.error('[cron/rewards]', error);
    return NextResponse.json({ error: 'Falha na premiação', detail: error instanceof Error ? error.message : String(error), rewards: log }, { status: 500 });
  }
}
