// @vitest-environment node
/**
 * Cenários de cobrança do webhook do Stripe.
 * Cada teste descreve uma situação real e verifica o acesso resultante.
 */

import { describe, expect, it } from 'vitest';
import { processStripeEvent } from '@/lib/billing/sync';
import { entitlementFromProfile } from '@/lib/entitlements';
import {
  FakeStripe,
  MemoryStore,
  checkoutSession,
  deps,
  makeCharge,
  makeDispute,
  makeEvent,
  makeProfile,
  makeSubscription,
} from './fakes';

const access = (d: ReturnType<typeof deps>, id = 'user_1') => entitlementFromProfile(d.store.profile(id));

describe('assinatura: caminho feliz', () => {
  it('checkout mensal pago libera o Pro Mensal', async () => {
    const d = deps();
    d.stripe.addSubscription(makeSubscription({ plan: 'pro_monthly' }));

    const r = await processStripeEvent(makeEvent('checkout.session.completed', checkoutSession()), d);

    expect(r.status).toBe('processed');
    const p = d.store.profile();
    expect(access(d).isPro).toBe(true);
    expect(p.plan_id).toBe('pro_monthly');
    expect(p.stripe_subscription_id).toBe('sub_1');
    expect(p.current_period_end).not.toBeNull();
  });

  it('identifica o plano anual pela lookup_key quando falta metadata', async () => {
    const d = deps();
    d.stripe.addSubscription(makeSubscription({ interval: 'year', lookupKey: 'musicos_pro_yearly' }));

    await processStripeEvent(makeEvent('checkout.session.completed', checkoutSession()), d);

    expect(d.store.profile().plan_id).toBe('pro_yearly');
  });

  it('funciona mesmo se o evento da assinatura chegar antes do checkout', async () => {
    const d = deps();
    const sub = makeSubscription();
    d.stripe.addSubscription(sub);

    await processStripeEvent(makeEvent('customer.subscription.created', sub), d);
    expect(access(d).isPro).toBe(true);

    const r = await processStripeEvent(makeEvent('checkout.session.completed', checkoutSession()), d);
    expect(r.action).toBe('ignored:no-change');
  });

  it('encontra o usuário pelo cliente do Stripe quando não há metadata', async () => {
    const d = deps();
    const sub = makeSubscription({ userId: '' });
    d.stripe.addSubscription(sub);

    await processStripeEvent(makeEvent('customer.subscription.updated', sub), d);

    expect(access(d).isPro).toBe(true);
  });
});

describe('assinatura: falhas de pagamento', () => {
  it('3D Secure pendente (incomplete) não libera; libera quando confirma', async () => {
    const d = deps();
    d.stripe.addSubscription(makeSubscription({ status: 'incomplete' }));

    await processStripeEvent(makeEvent('customer.subscription.created', makeSubscription({ status: 'incomplete' })), d);
    expect(access(d).isPro).toBe(false);
    expect(d.store.profile().subscription_status).toBe('incomplete');

    d.stripe.addSubscription(makeSubscription({ status: 'active' }));
    await processStripeEvent(makeEvent('customer.subscription.updated', makeSubscription()), d);
    expect(access(d).isPro).toBe(true);
  });

  it('renovação recusada (past_due) mantém o acesso durante a carência', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1', plan_id: 'pro_monthly' })]));
    d.stripe.addSubscription(makeSubscription({ status: 'past_due' }));

    await processStripeEvent(makeEvent('invoice.payment_failed', { id: 'in_1', subscription: 'sub_1', customer: 'cus_1' }), d);

    expect(d.store.profile().subscription_status).toBe('past_due');
    expect(access(d).isPro).toBe(true);
  });

  it('cartão atualizado e cobrança paga volta para active', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'past_due', stripe_subscription_id: 'sub_1' })]));
    d.stripe.addSubscription(makeSubscription({ status: 'active' }));

    await processStripeEvent(makeEvent('invoice.paid', { id: 'in_2', subscription: 'sub_1', customer: 'cus_1' }), d);

    expect(d.store.profile().subscription_status).toBe('active');
  });

  it('tentativas esgotadas (unpaid) removem o acesso', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'past_due', stripe_subscription_id: 'sub_1' })]));
    const sub = makeSubscription({ status: 'unpaid' });
    d.stripe.addSubscription(sub);

    await processStripeEvent(makeEvent('customer.subscription.updated', sub), d);

    expect(access(d).isPro).toBe(false);
    expect(d.store.profile().stripe_subscription_id).toBeNull();
  });
});

describe('assinatura: cancelamento', () => {
  it('cancelamento agendado mantém o Pro até o fim do período', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1', plan_id: 'pro_monthly' })]));
    const sub = makeSubscription({ cancelAtPeriodEnd: true });
    d.stripe.addSubscription(sub);

    await processStripeEvent(makeEvent('customer.subscription.updated', sub), d);

    expect(access(d).isPro).toBe(true);
    expect(access(d).cancelAtPeriodEnd).toBe(true);
  });

  it('assinatura encerrada volta para o grátis', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1' })]));
    const sub = makeSubscription({ status: 'canceled' });
    d.stripe.addSubscription(sub);

    await processStripeEvent(makeEvent('customer.subscription.deleted', sub), d);

    expect(access(d).isPro).toBe(false);
    expect(d.store.profile().plan_id).toBeNull();
  });

  it('evento atrasado "ativa" não reativa uma assinatura já cancelada', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'free', subscription_status: 'canceled' })]));
    d.stripe.addSubscription(makeSubscription({ status: 'canceled' })); // verdade atual no Stripe

    const stalePayload = makeSubscription({ status: 'active' });
    await processStripeEvent(makeEvent('customer.subscription.updated', stalePayload), d);

    expect(access(d).isPro).toBe(false);
  });

  it('o fim de uma assinatura antiga não derruba a assinatura nova', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_new' })]));
    const old = makeSubscription({ id: 'sub_old', status: 'canceled' });
    d.stripe.addSubscription(old);

    const r = await processStripeEvent(makeEvent('customer.subscription.deleted', old), d);

    expect(r.action).toBe('ignored:stale-subscription');
    expect(access(d).isPro).toBe(true);
  });
});

describe('vitalício', () => {
  const lifetimeSession = (overrides: Record<string, unknown> = {}) =>
    checkoutSession({ mode: 'payment', subscription: null, metadata: { userId: 'user_1', plan: 'lifetime' }, ...overrides });

  it('pagamento com cartão libera o vitalício', async () => {
    const d = deps();
    await processStripeEvent(makeEvent('checkout.session.completed', lifetimeSession()), d);
    expect(access(d).isLifetime).toBe(true);
  });

  it('Pix/boleto: só libera quando o pagamento compensa', async () => {
    const d = deps();

    const r1 = await processStripeEvent(makeEvent('checkout.session.completed', lifetimeSession({ payment_status: 'unpaid' })), d);
    expect(r1.action).toBe('awaiting:async-payment');
    expect(access(d).isPro).toBe(false);

    await processStripeEvent(makeEvent('checkout.session.async_payment_succeeded', lifetimeSession()), d);
    expect(access(d).isLifetime).toBe(true);
  });

  it('Pix/boleto que não foi pago não libera nada', async () => {
    const d = deps();
    const r = await processStripeEvent(makeEvent('checkout.session.async_payment_failed', lifetimeSession({ payment_status: 'unpaid' })), d);
    expect(r.status).toBe('ignored');
    expect(access(d).isPro).toBe(false);
  });

  it('quem assina e compra o vitalício tem a assinatura cancelada (sem cobrança dupla)', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1' })]));
    d.stripe.addSubscription(makeSubscription());

    const r = await processStripeEvent(makeEvent('checkout.session.completed', lifetimeSession()), d);

    expect(r.action).toBe('lifetime:granted+canceled-subscription');
    expect(d.stripe.canceled).toContain('sub_1');
    expect(access(d).isLifetime).toBe(true);
  });

  it('o cancelamento dessa assinatura não rebaixa o vitalício', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'lifetime', subscription_status: 'active', plan_id: 'lifetime' })]));
    const sub = makeSubscription({ status: 'canceled' });
    d.stripe.addSubscription(sub);

    await processStripeEvent(makeEvent('customer.subscription.deleted', sub), d);

    expect(access(d).isLifetime).toBe(true);
  });

  it('pagamento único de outro produto (sem plan=lifetime) é ignorado', async () => {
    const d = deps();
    const r = await processStripeEvent(makeEvent('checkout.session.completed', lifetimeSession({ metadata: { userId: 'user_1' } })), d);
    expect(r.action).toBe('ignored:not-a-musicos-purchase');
    expect(access(d).isPro).toBe(false);
  });
});

describe('estornos e contestações', () => {
  const lifetimeProfile = () =>
    new MemoryStore([makeProfile({ subscription_tier: 'lifetime', subscription_status: 'active', plan_id: 'lifetime' })]);

  it('estorno total do vitalício remove o acesso', async () => {
    const d = deps(lifetimeProfile());
    await processStripeEvent(makeEvent('charge.refunded', makeCharge()), d);
    expect(access(d).isPro).toBe(false);
  });

  it('estorno parcial não remove o acesso', async () => {
    const d = deps(lifetimeProfile());
    const r = await processStripeEvent(makeEvent('charge.refunded', makeCharge({ refunded: false })), d);
    expect(r.action).toBe('ignored:partial-refund');
    expect(access(d).isLifetime).toBe(true);
  });

  it('estorno de uma mensalidade cancela a assinatura e remove o acesso', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1' })]));
    d.stripe.addSubscription(makeSubscription());
    d.stripe.invoices.set('in_1', { id: 'in_1', subscription: 'sub_1' } as never);

    const r = await processStripeEvent(makeEvent('charge.refunded', makeCharge({ invoice: 'in_1' })), d);

    expect(r.action).toBe('refund:subscription-revoked');
    expect(d.stripe.canceled).toContain('sub_1');
    expect(access(d).isPro).toBe(false);
  });

  it('contestação (chargeback) do vitalício remove o acesso na hora', async () => {
    const d = deps(lifetimeProfile());
    d.stripe.charges.set('ch_1', makeCharge({ refunded: false, disputed: true }));

    const r = await processStripeEvent(makeEvent('charge.dispute.created', makeDispute()), d);

    expect(r.action).toBe('dispute:lifetime-revoked');
    expect(access(d).isPro).toBe(false);
  });

  it('contestação ganha devolve o vitalício', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'free', subscription_status: 'canceled' })]));
    d.stripe.charges.set('ch_1', makeCharge({ refunded: false, disputed: true }));

    await processStripeEvent(makeEvent('charge.dispute.closed', makeDispute({ status: 'won' })), d);

    expect(access(d).isLifetime).toBe(true);
  });

  it('contestação perdida não devolve nada', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'free', subscription_status: 'canceled' })]));
    const r = await processStripeEvent(makeEvent('charge.dispute.closed', makeDispute({ status: 'lost' })), d);
    expect(r.status).toBe('ignored');
    expect(access(d).isPro).toBe(false);
  });

  it('contestação de mensalidade cancela a assinatura', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1' })]));
    d.stripe.addSubscription(makeSubscription());
    d.stripe.invoices.set('in_1', { id: 'in_1', subscription: 'sub_1' } as never);
    d.stripe.charges.set('ch_1', makeCharge({ invoice: 'in_1', refunded: false, disputed: true }));

    await processStripeEvent(makeEvent('charge.dispute.created', makeDispute()), d);

    expect(d.stripe.canceled).toContain('sub_1');
    expect(access(d).isPro).toBe(false);
  });
});

describe('robustez', () => {
  it('evento repetido pelo Stripe é aplicado uma única vez', async () => {
    const d = deps();
    d.stripe.addSubscription(makeSubscription());
    const event = makeEvent('checkout.session.completed', checkoutSession(), 'evt_dup');

    const first = await processStripeEvent(event, d);
    const second = await processStripeEvent(event, d);

    expect(first.status).toBe('processed');
    expect(second.status).toBe('duplicate');
    expect(d.store.updates).toHaveLength(1);
  });

  it('se o banco falhar, o evento é liberado e o reenvio do Stripe funciona', async () => {
    const d = deps();
    d.stripe.addSubscription(makeSubscription());
    d.store.failNextUpdate = true;
    const event = makeEvent('checkout.session.completed', checkoutSession(), 'evt_retry');

    await expect(processStripeEvent(event, d)).rejects.toThrow('banco indisponível');
    expect(d.store.events.has('evt_retry')).toBe(false);

    const retry = await processStripeEvent(event, d);
    expect(retry.status).toBe('processed');
    expect(access(d).isPro).toBe(true);
  });

  it('evento sem usuário identificável é ignorado sem erro', async () => {
    const d = deps(new MemoryStore([]), new FakeStripe());
    const r = await processStripeEvent(
      makeEvent('checkout.session.completed', checkoutSession({ metadata: {}, client_reference_id: null, customer: 'cus_desconhecido' })),
      d
    );
    expect(r.action).toBe('ignored:no-user');
  });

  it('eventos que não tratamos são aceitos e ignorados', async () => {
    const d = deps();
    const r = await processStripeEvent(makeEvent('customer.created', { id: 'cus_1' }), d);
    expect(r.status).toBe('ignored');
  });
});
