/**
 * GET /api/cron/reconcile
 *
 * Reconciliação diária Stripe × Supabase para todos os assinantes.
 * Protegida por CRON_SECRET (cabeçalho Authorization: Bearer <segredo>).
 *
 * Agende uma chamada diária, por exemplo com cron no servidor:
 *   0 4 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://SEU-DOMINIO/api/cron/reconcile
 */

import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { reconcileAll } from '@/lib/billing/reconcile';
import { billingDeps } from '@/lib/billing/adapters';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET não configurada' }, { status: 500 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const summary = await reconcileAll(billingDeps());
    // retenção das métricas: apaga eventos com mais de 13 meses
    const purge = await createAdminClient().rpc('purge_analytics');
    if (purge.error) console.error('[analytics/purge]', purge.error.message);
    console.info('[billing/reconcile]', JSON.stringify({ ...summary, changes: summary.changes.length }));
    return NextResponse.json(summary, { status: summary.errors.length ? 207 : 200 });
  } catch (error) {
    console.error('[billing/reconcile] falhou:', error);
    return NextResponse.json({ error: 'Falha na reconciliação' }, { status: 500 });
  }
}
