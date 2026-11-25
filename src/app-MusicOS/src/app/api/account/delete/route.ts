/**
 * POST /api/account/delete  { confirm: "EXCLUIR" }
 *
 * Exclui a conta do usuário logado com segurança:
 *  1. cancela no Stripe qualquer assinatura ativa (para não cobrar mais);
 *  2. marca o cliente no Stripe como excluído (o histórico fiscal fica no Stripe);
 *  3. apaga o usuário no Supabase — perfil e dados vão junto (ON DELETE CASCADE).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import { stripeGateway } from '@/lib/billing/adapters';
import { isActiveStatus, normalizeStatus } from '@/lib/billing/sync';
import type { Profile } from '@/lib/entitlements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== 'EXCLUIR') {
    return NextResponse.json({ error: 'Confirmação inválida.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const profile = data as Profile | null;

  try {
    if (profile?.stripe_customer_id) {
      const gateway = stripeGateway();
      const subs = await gateway.listSubscriptions(profile.stripe_customer_id);
      for (const sub of subs) {
        if (isActiveStatus(normalizeStatus(sub.status)) || sub.status === 'incomplete') {
          await gateway.cancelSubscription(sub.id);
        }
      }
      await getStripe().customers.update(profile.stripe_customer_id, {
        metadata: { userId: user.id, deleted_from_app: new Date().toISOString() },
      });
    }
  } catch (error) {
    // Sem cancelar a cobrança, não apaga a conta: o usuário continuaria pagando
    console.error('[account/delete] falha ao cancelar no Stripe:', error);
    return NextResponse.json(
      { error: 'Não foi possível cancelar sua assinatura agora. Nada foi apagado. Tente de novo em alguns minutos.' },
      { status: 502 }
    );
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[account/delete] falha ao apagar usuário:', error);
    return NextResponse.json(
      { error: 'Sua assinatura foi cancelada, mas não conseguimos apagar a conta. Fale com o suporte.' },
      { status: 500 }
    );
  }

  await supabase.auth.signOut();
  return NextResponse.json({ deleted: true });
}
