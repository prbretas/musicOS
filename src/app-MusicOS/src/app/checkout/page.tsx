'use client';

/**
 * /checkout?plan=pro_yearly
 *
 * Ponte entre o cadastro e o Stripe: quem clicou em "Desbloquear" sem conta
 * cria a conta e cai aqui, que abre o pagamento sozinho. Protegida pelo middleware.
 */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isPaidPlan, PLANS, formatPrice } from '@/lib/plans';
import { startCheckout } from '@/lib/stripe/checkout';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/ui/Logo';

function CheckoutInner() {
  const params = useSearchParams();
  const planParam = params.get('plan') ?? '';
  const plan = isPaidPlan(planParam) ? planParam : null;
  const { entitlement, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (loading || !plan || started) return;
    if (entitlement.isLifetime || (entitlement.isPro && plan !== 'lifetime')) return;
    setStarted(true);
    startCheckout(plan).catch((e) => {
      setError(e instanceof Error ? e.message : 'Não foi possível abrir o pagamento.');
      setStarted(false);
    });
  }, [loading, plan, started, entitlement]);

  const info = plan ? PLANS[plan] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <Logo size="lg" />
      </Link>
      <div className="card w-full max-w-md p-8 text-center">
        {!plan ? (
          <>
            <h1 className="text-xl font-bold text-white">Plano não encontrado</h1>
            <Link href="/pricing" className="btn-primary mt-6">
              Ver planos
            </Link>
          </>
        ) : entitlement.isLifetime || (entitlement.isPro && plan !== 'lifetime') ? (
          <>
            <h1 className="text-xl font-bold text-white">Você já é Pro 🎉</h1>
            <p className="text-slate-400 mt-2">Seu acesso já está liberado. Para trocar de plano, use sua conta.</p>
            <Link href="/account" className="btn-primary mt-6">
              Ir para minha conta
            </Link>
          </>
        ) : error ? (
          <>
            <h1 className="text-xl font-bold text-white">Não foi possível abrir o pagamento</h1>
            <p className="text-red-300 mt-2 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="btn-primary mt-6">
              Tentar de novo
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mb-5" />
            <h1 className="text-xl font-bold text-white">Abrindo o pagamento seguro…</h1>
            {info && (
              <p className="text-slate-400 mt-2">
                {info.name} · {formatPrice(info.price)} {info.period}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-4">Você será levado ao Stripe, nosso processador de pagamentos.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
