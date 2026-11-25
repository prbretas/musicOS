/**
 * POST /api/stripe/portal
 * Abre o Portal do Cliente do Stripe (trocar cartão, faturas, cancelar).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { appUrl, getStripe } from '@/lib/stripe/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
    const customerId = (profile as { stripe_customer_id: string | null } | null)?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json({ error: 'Você ainda não tem uma assinatura.' }, { status: 404 });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl()}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/portal]', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
