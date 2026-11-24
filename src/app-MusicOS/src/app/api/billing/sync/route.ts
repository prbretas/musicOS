/**
 * POST /api/billing/sync
 *
 * Reconcilia só o usuário logado com o Stripe. A página da conta chama esta
 * rota quando o pagamento foi concluído mas o webhook ainda não liberou o
 * acesso — o cliente nunca fica sem o que pagou por causa de um webhook atrasado.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingDeps } from '@/lib/billing/adapters';
import { reconcileProfile } from '@/lib/billing/reconcile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  try {
    const deps = billingDeps();
    const profile = await deps.store.getProfile(user.id);
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    const result = await reconcileProfile(deps, profile);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[billing/sync]', error);
    return NextResponse.json({ error: 'Não foi possível sincronizar agora.' }, { status: 500 });
  }
}
