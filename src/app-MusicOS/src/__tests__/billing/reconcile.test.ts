// @vitest-environment node
/**
 * Reconciliação Stripe × Supabase: corrige o banco quando um webhook se perdeu.
 */

import { describe, expect, it } from 'vitest';
import { reconcileAll, reconcileProfile } from '@/lib/billing/reconcile';
import { entitlementFromProfile } from '@/lib/entitlements';
import { MemoryStore, deps, makeProfile, makeSubscription } from './fakes';

describe('reconcileProfile', () => {
  it('webhook perdido: pagou a assinatura mas o banco ficou grátis → libera', async () => {
    const d = deps();
    d.stripe.addSubscription(makeSubscription({ plan: 'pro_yearly', interval: 'year' }));

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('fixed:subscription');
    expect(entitlementFromProfile(d.store.profile()).isPro).toBe(true);
    expect(d.store.profile().plan_id).toBe('pro_yearly');
  });

  it('webhook perdido do vitalício → concede', async () => {
    const d = deps();
    d.stripe.lifetime.set('cus_1', 'valid');

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('fixed:lifetime-granted');
    expect(entitlementFromProfile(d.store.profile()).isLifetime).toBe(true);
  });

  it('banco diz Pro, mas a assinatura foi cancelada no Stripe → rebaixa', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active', stripe_subscription_id: 'sub_1' })]));
    d.stripe.addSubscription(makeSubscription({ status: 'canceled' }));

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('fixed:subscription');
    expect(entitlementFromProfile(d.store.profile()).isPro).toBe(false);
  });

  it('banco diz Pro, mas não existe assinatura no Stripe → rebaixa', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'pro', subscription_status: 'active' })]));

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('fixed:downgraded-no-subscription');
    expect(entitlementFromProfile(d.store.profile()).isPro).toBe(false);
  });

  it('vitalício estornado/contestado no Stripe → remove', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'lifetime', subscription_status: 'active', plan_id: 'lifetime' })]));
    d.stripe.lifetime.set('cus_1', 'revoked');

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('fixed:lifetime-revoked');
    expect(entitlementFromProfile(d.store.profile()).isPro).toBe(false);
  });

  it('vitalício concedido à mão (sem compra no Stripe) é mantido, com aviso', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'lifetime', subscription_status: 'active', plan_id: 'lifetime' })]));

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('warn:lifetime-without-purchase');
    expect(entitlementFromProfile(d.store.profile()).isLifetime).toBe(true);
  });

  it('vitalício com assinatura ainda ativa → cancela a assinatura', async () => {
    const d = deps(new MemoryStore([makeProfile({ subscription_tier: 'lifetime', subscription_status: 'active', plan_id: 'lifetime' })]));
    d.stripe.lifetime.set('cus_1', 'valid');
    d.stripe.addSubscription(makeSubscription());

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('lifetime:canceled-leftover-subscription');
    expect(d.stripe.canceled).toContain('sub_1');
  });

  it('e-mail trocado no app é atualizado no Stripe (recibos chegam no endereço certo)', async () => {
    const d = deps(new MemoryStore([makeProfile({ email: 'novo@musicos.app' })]));
    d.stripe.emails.set('cus_1', 'antigo@musicos.app');

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.emailSynced).toBe(true);
    expect(d.stripe.emailUpdates).toEqual([{ customerId: 'cus_1', email: 'novo@musicos.app' }]);
  });

  it('tudo certo → não escreve nada', async () => {
    const d = deps(
      new MemoryStore([
        makeProfile({
          subscription_tier: 'pro',
          subscription_status: 'active',
          stripe_subscription_id: 'sub_1',
          plan_id: 'pro_monthly',
          current_period_end: new Date((1795540000 + 30 * 86400) * 1000).toISOString(),
        }),
      ])
    );
    d.stripe.addSubscription(makeSubscription({ plan: 'pro_monthly' }));

    const r = await reconcileProfile(d, d.store.profile());

    expect(r.action).toBe('ok');
    expect(d.store.updates).toHaveLength(0);
  });

  it('perfil sem cliente no Stripe é pulado', async () => {
    const d = deps(new MemoryStore([makeProfile({ stripe_customer_id: null })]));
    const r = await reconcileProfile(d, d.store.profile());
    expect(r.action).toBe('skip:no-customer');
  });
});

describe('reconcileAll', () => {
  it('percorre todas as páginas e isola erros por usuário', async () => {
    const profiles = Array.from({ length: 5 }, (_, i) =>
      makeProfile({ id: `user_${i}`, stripe_customer_id: `cus_${i}` })
    );
    const d = deps(new MemoryStore(profiles));
    d.stripe.lifetime.set('cus_1', 'valid');
    d.stripe.failingCustomers.add('cus_3');

    const summary = await reconcileAll(d, 2);

    expect(summary.checked).toBe(5);
    expect(summary.fixed).toBe(1);
    expect(summary.errors).toEqual([{ userId: 'user_3', message: 'Stripe indisponível' }]);
    expect(entitlementFromProfile(d.store.profile('user_1')).isLifetime).toBe(true);
  });
});
