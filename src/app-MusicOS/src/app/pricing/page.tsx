'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLANS, formatPrice, type PaidPlanId, type PlanId } from '@/lib/plans';
import { checkoutPath, startCheckout } from '@/lib/stripe/checkout';
import { useAuth } from '@/components/providers/AuthProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ProBadge } from '@/components/pro/ProBadge';

const COMPARISON: { feature: string; free: boolean | string; pro: boolean | string }[] = [
  { feature: 'Escalas maior, menor, pentatônicas e blues', free: true, pro: true },
  { feature: 'Modos gregos, menor harmônica/melódica, exóticas', free: false, pro: true },
  { feature: 'Tabela de intervalos e notas da escala', free: true, pro: true },
  { feature: 'Acordes', free: 'Tríades', pro: 'Tríades, tétrades e extensões' },
  { feature: 'Diagramas de acordes com som', free: true, pro: true },
  { feature: 'Braço da guitarra', free: 'Afinação padrão', pro: 'Todas as afinações' },
  { feature: 'Outros instrumentos (baixo, viola caipira, cavaquinho, banjo...)', free: 'Violão/guitarra', pro: 'Todos' },
  { feature: 'Desenhos CAGED (C, A, G, E, D)', free: false, pro: true },
  { feature: 'Teclado virtual', free: true, pro: true },
  { feature: 'Ciclo de quintas', free: true, pro: true },
  { feature: 'Metrônomo', free: true, pro: true },
  { feature: 'Afinador com microfone', free: false, pro: true },
  { feature: 'Treino auditivo (intervalos e acordes)', free: false, pro: true },
  { feature: 'Exportar e imprimir', free: false, pro: true },
  { feature: 'Sem anúncios', free: false, pro: true },
];

const FAQ = [
  {
    q: 'Preciso de conta para usar o modo grátis?',
    a: 'Não. O estúdio abre direto, sem cadastro. A conta só é necessária para comprar um plano e manter seu acesso em qualquer dispositivo.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Nos planos mensal e anual você cancela em "Minha conta" com um clique, sem taxa. O acesso continua até o fim do período já pago.',
  },
  {
    q: 'Como funciona o Vitalício?',
    a: 'Um único pagamento. Você fica com todos os recursos Pro para sempre, incluindo tudo o que lançarmos no futuro. Sem mensalidade.',
  },
  {
    q: 'Quais formas de pagamento?',
    a: 'Cartão de crédito e débito, via Stripe. Pix e boleto podem ser habilitados na sua conta Stripe para o plano vitalício.',
  },
  {
    q: 'Tenho garantia?',
    a: 'Sim: 7 dias. Se não gostar, escreva para suporte@musicos.app e devolvemos o valor integral.',
  },
];

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <svg className="w-5 h-5 text-emerald-400 mx-auto" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-label="Incluído">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <span className="text-slate-600" aria-label="Não incluído">
      —
    </span>
  );
}

function PricingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, entitlement } = useAuth();
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [busy, setBusy] = useState<PaidPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canceled = params.get('checkout') === 'canceled';

  const proPlanId: PaidPlanId = interval === 'yearly' ? 'pro_yearly' : 'pro_monthly';
  const proPlan = PLANS[proPlanId];

  async function choose(plan: PaidPlanId) {
    setError(null);
    if (!user) {
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

  const currentPlan: PlanId | null = entitlement.isLifetime ? 'lifetime' : entitlement.isPro ? entitlement.planId : user ? 'free' : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="badge-pro text-xs px-2 py-1">Planos</span>
          <h1 className="text-4xl md:text-5xl font-black text-white font-display mt-4">
            Estude de graça. <span className="text-pro-300">Evolua com o Pro.</span>
          </h1>
          <p className="text-lg text-slate-400 mt-4">
            O essencial é grátis e sem cadastro. O Pro desbloqueia todas as escalas, tétrades, CAGED, afinador e treino auditivo.
          </p>
        </div>

        {canceled && (
          <div className="max-w-xl mx-auto mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200 text-center">
            Pagamento cancelado. Nada foi cobrado — quando quiser, é só escolher um plano.
          </div>
        )}
        {error && (
          <div className="max-w-xl mx-auto mb-8 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm text-red-200 text-center">{error}</div>
        )}

        {/* Toggle mensal/anual */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-ink-700 border border-ink-500 p-1 text-sm">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${interval === 'monthly' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${interval === 'yearly' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Anual <span className="text-pro-300 text-xs ml-1">-25%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {/* Grátis */}
          <PlanCard
            name={PLANS.free.name}
            price="R$ 0"
            period={PLANS.free.period}
            tagline={PLANS.free.tagline}
            features={PLANS.free.features}
            current={currentPlan === 'free'}
            cta={
              currentPlan === 'free' ? (
                <span className="btn-secondary w-full opacity-70 cursor-default">Seu plano atual</span>
              ) : (
                <Link href="/" className="btn-secondary w-full">
                  Usar grátis
                </Link>
              )
            }
          />

          {/* Pro */}
          <PlanCard
            highlight
            badge={interval === 'yearly' ? 'Mais popular' : undefined}
            name="Pro"
            price={formatPrice(proPlan.price)}
            period={proPlan.period}
            sub={interval === 'yearly' ? 'Equivale a R$ 7,42/mês' : 'Cancele quando quiser'}
            tagline={PLANS.pro_monthly.tagline}
            features={PLANS.pro_monthly.features}
            current={currentPlan === proPlanId}
            cta={
              currentPlan === proPlanId ? (
                <Link href="/account" className="btn-secondary w-full">
                  Seu plano atual · Gerenciar
                </Link>
              ) : entitlement.isPro ? (
                <Link href="/account" className="btn-secondary w-full">
                  Você já é Pro
                </Link>
              ) : (
                <button onClick={() => choose(proPlanId)} disabled={busy !== null} className="btn-pro w-full py-3">
                  {busy === proPlanId ? 'Abrindo pagamento…' : 'Assinar o Pro'}
                </button>
              )
            }
          />

          {/* Vitalício */}
          <PlanCard
            badge={PLANS.lifetime.badge}
            name={PLANS.lifetime.name}
            price={formatPrice(PLANS.lifetime.price)}
            period={PLANS.lifetime.period}
            sub="Menos de 2 anos de Pro Mensal"
            tagline={PLANS.lifetime.tagline}
            features={PLANS.lifetime.features}
            current={currentPlan === 'lifetime'}
            cta={
              currentPlan === 'lifetime' ? (
                <span className="btn-secondary w-full opacity-70 cursor-default">Seu plano atual</span>
              ) : (
                <button onClick={() => choose('lifetime')} disabled={busy !== null} className="btn-primary w-full py-3">
                  {busy === 'lifetime' ? 'Abrindo pagamento…' : 'Comprar vitalício'}
                </button>
              )
            }
          />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Pagamento seguro via Stripe · Garantia de 7 dias · Preços em reais, impostos inclusos
        </p>

        {/* Comparativo */}
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-black text-white font-display text-center mb-8">Compare os recursos</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-700/60">
                <tr>
                  <th className="py-3 px-5 font-semibold text-slate-400">Recurso</th>
                  <th className="py-3 px-5 font-semibold text-white text-center w-40">Grátis</th>
                  <th className="py-3 px-5 font-semibold text-center w-48">
                    <span className="inline-flex items-center gap-1.5 text-white">
                      Pro <ProBadge />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-ink-600 hover:bg-ink-700/40">
                    <td className="py-3 px-5 text-slate-200">{row.feature}</td>
                    <td className="py-3 px-5 text-center text-slate-400">
                      {typeof row.free === 'boolean' ? <Check ok={row.free} /> : row.free}
                    </td>
                    <td className="py-3 px-5 text-center text-pro-200">
                      {typeof row.pro === 'boolean' ? <Check ok={row.pro} /> : row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">O plano Vitalício inclui tudo do Pro, para sempre.</p>
        </section>

        {/* FAQ */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-white font-display text-center mb-8">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="card px-5 py-4 group">
                <summary className="cursor-pointer font-semibold text-white list-none flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-slate-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-slate-400 mt-3 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            Ainda com dúvida?{' '}
            <a href="mailto:suporte@musicos.app" className="link">
              suporte@musicos.app
            </a>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  sub,
  tagline,
  features,
  cta,
  highlight,
  badge,
  current,
}: {
  name: string;
  price: string;
  period: string;
  sub?: string;
  tagline: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
  badge?: string;
  current?: boolean;
}) {
  return (
    <div
      className={`relative card p-7 flex flex-col ${highlight ? 'border-pro-400/70 shadow-glow-pro md:-my-3' : ''} ${
        current ? 'ring-2 ring-brand-400/60' : ''
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-md bg-pro-400 text-ink-900 text-[11px] font-black uppercase tracking-wider px-2.5 py-1">
          {badge}
        </span>
      )}
      <h3 className="text-xl font-bold text-white mt-1">{name}</h3>
      <p className="mt-3">
        <span className="text-4xl font-black text-white font-display">{price}</span>
        <span className="text-slate-400 ml-1.5">{period}</span>
      </p>
      {sub && <p className="text-xs text-pro-300 mt-1">{sub}</p>}
      <p className="text-slate-400 text-sm mt-3">{tagline}</p>
      <ul className="mt-6 space-y-2.5 text-sm flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-slate-300">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-7">{cta}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingInner />
    </Suspense>
  );
}
