'use client';

/**
 * Modal de upgrade — o coração da monetização.
 *
 * Qualquer recurso Pro chama `openUpgrade('tuner')` ao ser clicado por um
 * usuário grátis. O modal explica o recurso, mostra os planos e:
 *   - usuário logado  → vai direto ao checkout do Stripe
 *   - usuário anônimo → vai para o cadastro e volta ao checkout depois
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/components/providers/AuthProvider';
import { FEATURES, type FeatureId } from '@/lib/features';
import { PLANS, formatPrice, type PaidPlanId } from '@/lib/plans';
import { checkoutPath, startCheckout } from '@/lib/stripe/checkout';

interface UpgradeContextValue {
  openUpgrade: (feature?: FeatureId) => void;
  closeUpgrade: () => void;
}

const UpgradeContext = createContext<UpgradeContextValue>({ openUpgrade: () => {}, closeUpgrade: () => {} });

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [feature, setFeature] = useState<FeatureId | null>(null);
  const [open, setOpen] = useState(false);

  const openUpgrade = useCallback((f?: FeatureId) => {
    setFeature(f ?? null);
    setOpen(true);
  }, []);
  const closeUpgrade = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openUpgrade, closeUpgrade }), [openUpgrade, closeUpgrade]);

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <UpgradeModal open={open} feature={feature} onClose={closeUpgrade} />
    </UpgradeContext.Provider>
  );
}

export function useUpgrade(): UpgradeContextValue {
  return useContext(UpgradeContext);
}

const PLAN_ORDER: PaidPlanId[] = ['pro_monthly', 'pro_yearly', 'lifetime'];

function UpgradeModal({ open, feature, onClose }: { open: boolean; feature: FeatureId | null; onClose: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState<PaidPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const info = feature ? FEATURES[feature] : null;

  async function choose(plan: PaidPlanId) {
    setError(null);
    if (!user) {
      onClose();
      router.push(`/signup?next=${encodeURIComponent(checkoutPath(plan))}`);
      return;
    }
    try {
      setBusy(plan);
      await startCheckout(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar o pagamento.');
      setBusy(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="text-center mb-6">
        <span className="badge-pro text-xs px-2 py-1 mb-3">Recurso Pro</span>
        <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
          {info ? info.label : 'Desbloqueie o MusicOS Pro'}
        </h2>
        <p className="text-slate-400 mt-2 max-w-xl mx-auto">
          {info ? info.description : 'Todas as escalas, acordes de sétima, CAGED, afinador, exercícios e muito mais.'}
        </p>
        {!user && (
          <p className="text-sm text-slate-500 mt-3">
            Para liberar, crie sua conta grátis e escolha um plano. Leva menos de um minuto.
          </p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isHighlight = Boolean(plan.highlight);
          return (
            <div
              key={id}
              className={`relative rounded-xl border p-4 flex flex-col ${
                isHighlight ? 'border-pro-400/70 bg-pro-400/5 shadow-glow-pro' : 'border-ink-500 bg-ink-700/60'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 rounded-md bg-pro-400 text-ink-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                  {plan.badge}
                </span>
              )}
              <p className="font-bold text-white mt-1">{plan.name}</p>
              <p className="mt-1">
                <span className="text-2xl font-black text-white">{formatPrice(plan.price)}</span>
                <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-4 flex-1">{plan.tagline}</p>
              <button
                onClick={() => choose(id)}
                disabled={busy !== null}
                className={isHighlight || id === 'lifetime' ? 'btn-pro w-full' : 'btn-primary w-full'}
              >
                {busy === id ? 'Abrindo pagamento…' : user ? 'Assinar' : 'Criar conta e assinar'}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <Link href="/pricing" onClick={onClose} className="link">
          Comparar todos os recursos
        </Link>
        {!user && (
          <span>
            Já tem conta?{' '}
            <Link href="/login" onClick={onClose} className="link">
              Entrar
            </Link>
          </span>
        )}
      </div>
    </Modal>
  );
}
