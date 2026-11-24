/**
 * POST /api/stripe/checkout  { plan: 'pro_monthly' | 'pro_yearly' | 'lifetime' }
 *
 * Cria (ou reaproveita) o cliente no Stripe e abre uma sessão de checkout.
 * Assinaturas usam mode=subscription; o vitalício usa mode=payment.
 * O middleware já garante que só chega aqui quem está logado.
 */

import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { appUrl, getStripe, resolvePriceId } from '@/lib/stripe/server';
import { isPaidPlan, PLANS } from '@/lib/plans';
import { entitlementFromProfile, type Profile } from '@/lib/entitlements';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = body.plan;
    if (!plan || !isPaidPlan(plan)) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: profileRow } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const profile = (profileRow as Profile | null) ?? null;
    const entitlement = entitlementFromProfile(profile);

    if (entitlement.isLifetime) {
      return NextResponse.json({ error: 'Você já tem acesso vitalício.' }, { status: 409 });
    }
    if (entitlement.isPro && plan !== 'lifetime' && entitlement.status !== 'canceled') {
      return NextResponse.json(
        { error: 'Você já é Pro. Para trocar de plano, use "Gerenciar assinatura" na sua conta.' },
        { status: 409 }
      );
    }

    const stripe = getStripe();

    // Cliente no Stripe: reaproveita o existente ou cria e guarda o id no perfil
    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          email: user.email ?? undefined,
          name: profile?.name ?? user.user_metadata?.name ?? undefined,
          metadata: { userId: user.id },
        },
        // Duplo clique ou retry nunca cria dois clientes para o mesmo usuário
        { idempotencyKey: `customer-${user.id}` }
      );
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const planInfo = PLANS[plan];
    const base = appUrl();

    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: planInfo.recurring ? 'subscription' : 'payment',
      line_items: [{ price: await resolvePriceId(plan), quantity: 1 }],
      success_url: `${base}/account?checkout=success&plan=${plan}`,
      cancel_url: `${base}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
      locale: 'pt-BR',
      // Aceite dos Termos registrado pelo Stripe. Exige a URL dos termos em
      // Settings → Business → Public details; ligue com STRIPE_TOS_CONSENT=1.
      ...(process.env.STRIPE_TOS_CONSENT === '1' ? { consent_collection: { terms_of_service: 'required' as const } } : {}),
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
      ...(planInfo.recurring
        ? { subscription_data: { metadata: { userId: user.id, plan } } }
        : { payment_intent_data: { metadata: { userId: user.id, plan } }, invoice_creation: { enabled: true } }),
    };

    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      return NextResponse.json({ error: 'O Stripe não devolveu a URL de pagamento.' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[stripe/checkout]', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
