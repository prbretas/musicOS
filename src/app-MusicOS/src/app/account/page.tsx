'use client';

/** Minha conta: dados do usuário, plano atual e gerenciamento da assinatura. */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { entitlementLabel } from '@/lib/entitlements';
import { PLANS, formatPrice } from '@/lib/plans';
import { openCustomerPortal } from '@/lib/stripe/checkout';
import { createClient } from '@/lib/supabase/client';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ProBadge } from '@/components/pro/ProBadge';

function formatDate(d: Date | null): string {
  return d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
}

function AccountInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile, entitlement, loading, signOut, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const checkoutSuccess = params.get('checkout') === 'success';
  const passwordUpdated = params.get('password') === 'updated';

  useEffect(() => {
    setName(profile?.name ?? user?.user_metadata?.name ?? '');
  }, [profile, user]);

  // Depois do checkout o webhook pode levar alguns segundos: recarrega o perfil até virar Pro.
  // Se demorar, pede ao servidor para conferir direto no Stripe (não depende do webhook).
  useEffect(() => {
    if (!checkoutSuccess || entitlement.isPro) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (tries === 4 || tries === 10) {
        void fetch('/api/billing/sync', { method: 'POST' }).finally(() => refreshProfile());
      } else {
        void refreshProfile();
      }
      if (tries >= 15) clearInterval(timer);
    }, 2000);
    return () => clearInterval(timer);
  }, [checkoutSuccess, entitlement.isPro, refreshProfile]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error: err } = await createClient().from('profiles').update({ name: name.trim() }).eq('id', user.id);
    if (err) setError('Não foi possível salvar o nome.');
    else {
      setSavedMsg('Nome atualizado.');
      await refreshProfile();
      setTimeout(() => setSavedMsg(null), 2500);
    }
    setSaving(false);
  }

  async function handlePortal() {
    setPortalBusy(true);
    setError(null);
    try {
      await openCustomerPortal();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível abrir o portal.');
      setPortalBusy(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: deleteText }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Não foi possível excluir a conta.');
      await signOut().catch(() => undefined);
      router.replace('/?conta=excluida');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível excluir a conta.');
      setDeleting(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando…</div>
    );
  }

  const plan = entitlement.planId ? PLANS[entitlement.planId] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-black text-white">Minha conta</h1>

        {checkoutSuccess && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-emerald-200">
            {entitlement.isPro ? (
              <>
                <p className="font-bold">Pagamento confirmado. Bem-vindo ao MusicOS Pro! 🎉</p>
                <p className="text-sm mt-1 text-emerald-200/80">Todos os recursos já estão liberados no estúdio.</p>
              </>
            ) : (
              <>
                <p className="font-bold">Pagamento recebido. Liberando seu acesso…</p>
                <p className="text-sm mt-1 text-emerald-200/80">Isso leva alguns segundos. Esta página atualiza sozinha.</p>
              </>
            )}
          </div>
        )}
        {passwordUpdated && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-emerald-200">
            Senha atualizada com sucesso.
          </div>
        )}
        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-red-300">{error}</div>}

        {/* Plano */}
        <section className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Seu plano</p>
              <p className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                {entitlementLabel(entitlement)}
                {entitlement.isPro && <ProBadge />}
              </p>
              {plan && (
                <p className="text-slate-400 text-sm mt-1">
                  {formatPrice(plan.price)} {plan.period}
                </p>
              )}
              {entitlement.isPro && !entitlement.isLifetime && (
                <p className="text-sm text-slate-400 mt-2">
                  {entitlement.cancelAtPeriodEnd
                    ? `Cancelamento agendado. Acesso até ${formatDate(entitlement.currentPeriodEnd)}.`
                    : `Próxima renovação em ${formatDate(entitlement.currentPeriodEnd)}.`}
                  {entitlement.status === 'past_due' && (
                    <span className="block text-amber-300 mt-1">
                      O último pagamento falhou. Atualize seu cartão para não perder o acesso.
                    </span>
                  )}
                </p>
              )}
              {entitlement.isLifetime && (
                <p className="text-sm text-slate-400 mt-2">Acesso vitalício. Sem cobranças futuras.</p>
              )}
              {!entitlement.isPro && (
                <p className="text-sm text-slate-400 mt-2">
                  Você usa o modo grátis. Desbloqueie todas as escalas, CAGED, afinador e exercícios.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {!entitlement.isPro && (
                <Link href="/pricing" className="btn-pro">
                  Fazer upgrade
                </Link>
              )}
              {entitlement.isPro && !entitlement.isLifetime && (
                <>
                  <button onClick={handlePortal} disabled={portalBusy} className="btn-secondary">
                    {portalBusy ? 'Abrindo…' : 'Gerenciar assinatura'}
                  </button>
                  <Link href="/checkout?plan=lifetime" className="btn-ghost text-pro-300 text-xs">
                    Trocar para vitalício
                  </Link>
                </>
              )}
              {entitlement.isLifetime && profile?.stripe_customer_id && (
                <button onClick={handlePortal} disabled={portalBusy} className="btn-secondary">
                  {portalBusy ? 'Abrindo…' : 'Ver recibos'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Perfil */}
        <section className="card p-6">
          <h2 className="font-bold text-white text-lg mb-4">Perfil</h2>
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label htmlFor="name" className="field-label">
                Nome
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full py-3" />
            </div>
            <div>
              <label className="field-label">E-mail</label>
              <input type="email" value={user?.email ?? ''} disabled className="w-full py-3 opacity-60" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
              {savedMsg && <span className="text-sm text-emerald-300">{savedMsg}</span>}
            </div>
          </form>
        </section>

        {/* Segurança */}
        <section className="card p-6">
          <h2 className="font-bold text-white text-lg mb-2">Segurança</h2>
          <p className="text-sm text-slate-400 mb-4">Para trocar a senha, enviamos um link para seu e-mail.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/forgot-password" className="btn-secondary">
              Trocar senha
            </Link>
            <button onClick={handleSignOut} className="btn-ghost text-red-300 hover:text-red-200">
              Sair da conta
            </button>
          </div>
        </section>

        {/* Zona de perigo */}
        <section className="card p-6 border-red-500/30">
          <h2 className="font-bold text-white text-lg mb-2">Excluir conta</h2>
          <p className="text-sm text-slate-400 mb-4">
            Apaga sua conta e seus dados. Se você tiver uma assinatura ativa, ela é cancelada na hora e não haverá
            novas cobranças. {entitlement.isLifetime && 'O acesso vitalício será perdido. '}Esta ação não pode ser desfeita.
          </p>
          {!deleteOpen ? (
            <button onClick={() => setDeleteOpen(true)} className="btn-ghost text-red-300 hover:text-red-200 border border-red-500/30">
              Quero excluir minha conta
            </button>
          ) : (
            <div className="space-y-3">
              <label htmlFor="confirm-delete" className="field-label">
                Digite EXCLUIR para confirmar
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                className="w-full py-3"
                autoComplete="off"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== 'EXCLUIR' || deleting}
                  className="btn-danger"
                >
                  {deleting ? 'Excluindo…' : 'Excluir definitivamente'}
                </button>
                <button
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteText('');
                  }}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="text-xs text-slate-600">
          Precisa de ajuda?{' '}
          <a href="mailto:suporte@musicos.app" className="link">
            suporte@musicos.app
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountInner />
    </Suspense>
  );
}
