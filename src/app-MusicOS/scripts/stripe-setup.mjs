#!/usr/bin/env node
/**
 * Configura uma conta Stripe para o MusicOS (pode rodar quantas vezes quiser):
 *  - produto "MusicOS Pro" com preços mensal (R$ 9,90) e anual (R$ 89,00)
 *  - produto "MusicOS Vitalício" com preço único (R$ 197,00)
 *  - portal do cliente (cancelar, trocar cartão, trocar mensal <-> anual)
 *
 * Usa a STRIPE_SECRET_KEY do .env.local. Os preços são achados pela
 * lookup_key, então o app não precisa de nenhum ID novo.
 *
 * Uso (na pasta src/app-MusicOS):
 *   npm run stripe:setup
 */

import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('✗ STRIPE_SECRET_KEY não encontrada. Confira o arquivo .env.local.');
  process.exit(1);
}
if (key.startsWith('sk_live_') && process.env.CONFIRM_LIVE !== 'sim') {
  console.error('✗ Esta é uma chave LIVE (dinheiro real). Para continuar, rode com CONFIRM_LIVE=sim.');
  process.exit(1);
}

const stripe = new Stripe(key);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const PRODUCTS = [
  {
    id: 'musicos_pro',
    name: 'MusicOS Pro',
    description: 'Acesso a todos os recursos do MusicOS enquanto a assinatura estiver ativa.',
    prices: [
      { lookup_key: 'musicos_pro_monthly', unit_amount: 990, recurring: { interval: 'month' }, nickname: 'Pro mensal' },
      { lookup_key: 'musicos_pro_yearly', unit_amount: 8900, recurring: { interval: 'year' }, nickname: 'Pro anual' },
    ],
  },
  {
    id: 'musicos_lifetime',
    name: 'MusicOS Vitalício',
    description: 'Acesso vitalício à plataforma MusicOS com login (pagamento único).',
    prices: [{ lookup_key: 'musicos_lifetime', unit_amount: 19700, nickname: 'Vitalício' }],
  },
];

async function ensureProduct(p) {
  try {
    const existing = await stripe.products.retrieve(p.id);
    if (!existing.active) await stripe.products.update(p.id, { active: true });
    console.log(`  • produto ${p.name} já existe`);
    return existing.id;
  } catch (err) {
    if (err?.code !== 'resource_missing') throw err;
    const created = await stripe.products.create({ id: p.id, name: p.name, description: p.description });
    console.log(`  ✓ produto ${p.name} criado`);
    return created.id;
  }
}

async function ensurePrice(productId, price) {
  const found = await stripe.prices.list({ lookup_keys: [price.lookup_key], active: true, limit: 1 });
  const current = found.data[0];
  const same =
    current &&
    current.unit_amount === price.unit_amount &&
    current.currency === 'brl' &&
    (current.recurring?.interval ?? null) === (price.recurring?.interval ?? null) &&
    current.product === productId;
  if (same) {
    console.log(`  • preço ${price.nickname} já existe (${current.id})`);
    return current.id;
  }
  // cria o novo e move a lookup_key para ele (o antigo fica inativo para novas vendas)
  const created = await stripe.prices.create({
    product: productId,
    currency: 'brl',
    unit_amount: price.unit_amount,
    nickname: price.nickname,
    lookup_key: price.lookup_key,
    transfer_lookup_key: true,
    ...(price.recurring ? { recurring: price.recurring } : {}),
  });
  if (current) await stripe.prices.update(current.id, { active: false });
  console.log(`  ✓ preço ${price.nickname} criado (${created.id})`);
  return created.id;
}

async function ensurePortal(proProductId, proPriceIds) {
  const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
  const params = {
    business_profile: {
      headline: 'MusicOS — gerencie sua assinatura',
      privacy_policy_url: `${APP_URL}/privacy`,
      terms_of_service_url: `${APP_URL}/terms`,
    },
    features: {
      customer_update: { enabled: true, allowed_updates: ['email', 'name'] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end' },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        proration_behavior: 'create_prorations',
        products: [{ product: proProductId, prices: proPriceIds }],
      },
    },
  };
  // localhost não é aceito como URL pública dos termos; nesse caso deixa sem
  if (/localhost|127\.0\.0\.1/.test(APP_URL)) {
    delete params.business_profile.privacy_policy_url;
    delete params.business_profile.terms_of_service_url;
  }
  if (configs.data[0]) {
    await stripe.billingPortal.configurations.update(configs.data[0].id, params);
    console.log(`  ✓ portal do cliente atualizado (${configs.data[0].id})`);
  } else {
    const created = await stripe.billingPortal.configurations.create(params);
    console.log(`  ✓ portal do cliente criado (${created.id})`);
  }
}

async function main() {
  const account = await stripe.accounts.retrieve();
  const mode = key.startsWith('sk_live_') ? 'LIVE (real)' : 'teste';
  console.log(`\nConta Stripe: ${account.settings?.dashboard?.display_name || account.id} (${account.id}) — modo ${mode}\n`);

  const ids = {};
  for (const p of PRODUCTS) {
    const productId = await ensureProduct(p);
    ids[p.id] = { productId, prices: [] };
    for (const price of p.prices) ids[p.id].prices.push(await ensurePrice(productId, price));
  }
  await ensurePortal(ids.musicos_pro.productId, ids.musicos_pro.prices);

  console.log('\n✓ Stripe pronto para o MusicOS. Os preços são encontrados pela lookup_key; não precisa copiar IDs.');
  console.log('  Próximo passo: webhook (stripe listen ... no PC, ou endpoint no painel quando estiver na Vercel).\n');
}

main().catch((err) => {
  console.error('\n✗ Falhou:', err?.message ?? err);
  if (err?.type === 'StripeAuthenticationError') console.error('  A chave STRIPE_SECRET_KEY parece inválida ou de outra conta.');
  process.exit(1);
});
