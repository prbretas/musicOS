'use client';

/**
 * Painel do administrador: visitantes, cadastros, planos, regiões, áreas mais
 * usadas, recursos Pro mais procurados no modo grátis (paywall) e cliques.
 *
 * Acesso: só quem tem profiles.role = 'admin'. A checagem é feita no banco
 * (admin_dashboard), não só na tela.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { FEATURES, type FeatureId } from '@/lib/features';
import { VIEWS } from '@/components/estudio/shell/views';

interface Daily {
  d: string;
  visitors: number;
  views: number;
  signups: number;
  paywall: number;
}
interface Row {
  key: string | null;
  visitors?: number;
  count?: number;
}
interface Dashboard {
  days: number;
  totals: Record<string, number>;
  daily: Daily[];
  countries: Row[];
  regions: Row[];
  cities: Row[];
  devices: Row[];
  areas: Row[];
  paywall: Row[];
  clicks: Row[];
  choices: Row[];
  sources: Row[];
  recent_signups: { email: string; created_at: string; provider: string | null; tier: string; status: string | null }[];
}

const PERIODS = [7, 30, 90, 365];
const fmt = new Intl.NumberFormat('pt-BR');

function countryName(code: string | null): string {
  if (!code || code === '??') return 'Desconhecido';
  try {
    return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

function pct(a: number, b: number): string {
  if (!b) return '—';
  return `${((a / b) * 100).toFixed(1).replace('.', ',')}%`;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Dashboard | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'forbidden' | 'error'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    const { data: res, error } = await createClient().rpc('admin_dashboard', { p_days: days });
    if (error) {
      setState(error.code === '42501' || /forbidden/.test(error.message) ? 'forbidden' : 'error');
      return;
    }
    setData(res as Dashboard);
    setState('ok');
  }, [days]);

  useEffect(() => {
    if (!authLoading && user) void load();
    if (!authLoading && !user) setState('forbidden');
  }, [authLoading, user, load]);

  return (
    <div className="min-h-screen" data-no-track>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-black font-display text-gradient">Painel do MusicOS</h1>
            <p className="mt-1 text-sm text-slate-400">
              Visitas anônimas, cadastros e uso dos recursos. Horário de Brasília. Receita detalhada fica no painel do Stripe.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="seg" role="tablist" aria-label="Período">
              {PERIODS.map((p) => (
                <button key={p} role="tab" aria-selected={days === p} onClick={() => setDays(p)} className="seg-item">
                  {p === 365 ? '1 ano' : `${p} dias`}
                </button>
              ))}
            </div>
            <button onClick={() => void load()} className="tool-btn" aria-label="Atualizar">
              ↻
            </button>
          </div>
        </div>

        {state === 'forbidden' && (
          <div className="card p-8 text-center">
            <p className="text-lg font-bold text-white">Acesso restrito</p>
            <p className="mt-1 text-slate-400">Esta página é só para o administrador do MusicOS.</p>
            <Link href="/" className="btn-primary mt-4 inline-flex">
              Voltar ao estúdio
            </Link>
          </div>
        )}
        {state === 'error' && (
          <div className="card p-6 text-red-300">Não foi possível carregar os dados agora. Tente atualizar.</div>
        )}
        {state === 'loading' && !data && <div className="card h-64 animate-pulse" />}
        {data && state !== 'forbidden' && <DashboardView data={data} />}
      </main>
    </div>
  );
}

function DashboardView({ data }: { data: Dashboard }) {
  const t = data.totals;
  const paying = (t.pro_active ?? 0) + (t.lifetime ?? 0);
  const areaLabel = useMemo(() => Object.fromEntries(VIEWS.map((v) => [v.id, v.label])), []);

  return (
    <div className="space-y-8">
      {/* Números principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Visitantes únicos" value={t.visitors} hint={`${fmt.format(t.page_views ?? 0)} páginas vistas · ${fmt.format(t.online_now ?? 0)} online agora`} />
        <Kpi label="Cadastros no período" value={t.signups_period} hint={`${fmt.format(t.users_total ?? 0)} contas no total`} />
        <Kpi
          label="Assinantes pagantes"
          value={paying}
          hint={`${t.pro_monthly ?? 0} mensal · ${t.pro_yearly ?? 0} anual · ${t.lifetime ?? 0} vitalício`}
          gold
        />
        <Kpi label="Bateram no paywall" value={t.paywall_visitors} hint={`${fmt.format(t.paywall_hits ?? 0)} cliques em recursos Pro`} />
      </div>

      {/* Funil */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-white mb-1">Funil de conversão</h2>
        <p className="text-sm text-slate-400 mb-5">Quantos visitantes avançam até pagar, no período escolhido.</p>
        <Funnel
          steps={[
            { label: 'Visitantes', value: t.visitors ?? 0 },
            { label: 'Clicaram em recurso Pro', value: t.paywall_visitors ?? 0 },
            { label: 'Se cadastraram', value: t.signups_period ?? 0 },
            { label: 'Abriram o checkout', value: t.checkout_starts ?? 0 },
          ]}
        />
        <p className="mt-4 text-xs text-slate-500">
          Contas grátis: {fmt.format(t.free_users ?? 0)} · Pagantes ativos hoje: {fmt.format(paying)} ({pct(paying, t.users_total ?? 0)} das contas)
        </p>
      </section>

      {/* Séries diárias: uma métrica por gráfico (escalas diferentes não dividem eixo) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DailyBars title="Visitantes por dia" data={data.daily} field="visitors" />
        <DailyBars title="Cadastros por dia" data={data.daily} field="signups" />
        <DailyBars title="Cliques em recursos Pro por dia" data={data.daily} field="paywall" />
      </div>

      {/* Onde estão */}
      <div className="grid gap-4 lg:grid-cols-3">
        <BarList title="Países" rows={data.countries} metric="visitors" label={(k) => countryName(k)} unit="visitantes" />
        <BarList title="Estados / regiões" rows={data.regions} metric="visitors" unit="visitantes" empty="Disponível quando o site estiver na Vercel ou Cloudflare." />
        <BarList title="Cidades" rows={data.cities} metric="visitors" unit="visitantes" empty="Disponível quando o site estiver na Vercel ou Cloudflare." />
      </div>

      {/* O que usam */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Áreas mais visitadas" rows={data.areas} metric="count" label={(k) => areaLabel[k ?? ''] ?? k ?? '?'} unit="visitas" />
        <BarList
          title="Recursos Pro mais procurados no modo grátis"
          rows={data.paywall}
          metric="count"
          label={(k) => FEATURES[k as FeatureId]?.label ?? k ?? '?'}
          unit="cliques"
          gold
        />
        <BarList title="Botões mais clicados" rows={data.clicks} metric="count" unit="cliques" />
        <BarList title="Escolhas (escala, instrumento, afinação, prática)" rows={data.choices} metric="count" unit="vezes" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="De onde vieram (UTM ou site de origem)" rows={data.sources} metric="visitors" unit="visitantes" />
        <BarList title="Aparelho" rows={data.devices} metric="visitors" label={(k) => (k === 'mobile' ? 'Celular / tablet' : k === 'desktop' ? 'Computador' : 'Desconhecido')} unit="visitantes" />
      </div>

      {/* Cadastros recentes */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Cadastros recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-4 font-semibold">E-mail</th>
                <th className="py-2 pr-4 font-semibold">Entrou com</th>
                <th className="py-2 pr-4 font-semibold">Plano</th>
                <th className="py-2 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_signups.map((u) => (
                <tr key={u.email + u.created_at} className="border-t border-white/[0.05]">
                  <td className="py-2.5 pr-4 text-slate-200">{u.email}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{u.provider === 'google' ? 'Google' : 'E-mail'}</td>
                  <td className="py-2.5 pr-4">
                    <TierPill tier={u.tier} status={u.status} />
                  </td>
                  <td className="py-2.5 text-slate-400 tabular-nums">
                    {new Date(u.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, hint, gold = false }: { label: string; value?: number; hint?: string; gold?: boolean }) {
  return (
    <div className={`card p-5 ${gold ? 'border-pro-400/30' : ''}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-4xl font-black font-display tabular-nums ${gold ? 'text-gold' : 'text-white'}`}>{fmt.format(value ?? 0)}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TierPill({ tier, status }: { tier: string; status: string | null }) {
  const active = tier === 'lifetime' || (tier === 'pro' && ['active', 'trialing', 'past_due'].includes(status ?? ''));
  const label = tier === 'lifetime' ? 'Vitalício' : active ? 'Pro' : 'Grátis';
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-bold ${
        active ? 'bg-gradient-to-r from-pro-300 to-pro-500 text-ink-900' : 'bg-white/[0.06] text-slate-300'
      }`}
    >
      {label}
    </span>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.label} className="grid grid-cols-[180px_1fr_110px] items-center gap-3 text-sm">
          <span className="text-slate-300">{s.label}</span>
          <div className="h-7 rounded-md bg-white/[0.03]">
            <div
              className="h-7 rounded-md bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
              style={{ width: `${Math.max(1.5, (s.value / max) * 100)}%`, opacity: 1 - i * 0.15 }}
            />
          </div>
          <span className="tabular-nums text-right text-slate-200">
            <strong className="text-white">{fmt.format(s.value)}</strong>
            {i > 0 && <span className="ml-1.5 text-xs text-slate-500">{pct(s.value, steps[0].value)}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Barras verticais por dia, uma métrica, com dica ao passar o mouse */
function DailyBars({ title, data, field }: { title: string; data: Daily[]; field: keyof Omit<Daily, 'd'> }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d[field]));
  const total = data.reduce((s, d) => s + d[field], 0);
  const W = 360;
  const H = 140;
  const gap = data.length > 60 ? 0.5 : 2;
  const bw = Math.max(1, W / data.length - gap);
  const h = hover !== null ? data[hover] : null;

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <span className="text-xs text-slate-400 tabular-nums">total {fmt.format(total)}</span>
      </div>
      <p className="h-5 text-xs text-slate-400 tabular-nums">
        {h ? `${new Date(h.d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}: ${fmt.format(h[field])}` : ' '}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img" aria-label={`${title}: total ${total}`} onMouseLeave={() => setHover(null)}>
        <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} stroke="rgba(255,255,255,.12)" />
        {data.map((d, i) => {
          const bh = (d[field] / max) * (H - 8);
          const x = i * (bw + gap);
          return (
            <g key={d.d} onMouseEnter={() => setHover(i)}>
              {/* área de toque maior que a barra */}
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
              <rect
                x={x}
                y={H - bh}
                width={bw}
                height={Math.max(bh, d[field] ? 2 : 0)}
                rx={Math.min(3, bw / 2)}
                fill={hover === i ? '#a99dff' : '#6d5dfc'}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500 tabular-nums">
        <span>{data[0] && new Date(data[0].d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
        <span>hoje</span>
      </div>
    </section>
  );
}

/** Lista com barras horizontais (ranking) */
function BarList({
  title,
  rows,
  metric,
  unit,
  label,
  empty = 'Sem dados no período.',
  gold = false,
}: {
  title: string;
  rows: Row[];
  metric: 'visitors' | 'count';
  unit: string;
  label?: (k: string | null) => string;
  empty?: string;
  gold?: boolean;
}) {
  const sorted = [...rows].filter((r) => r.key !== null).sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0)).slice(0, 12);
  const max = Math.max(1, ...sorted.map((r) => r[metric] ?? 0));
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-bold text-white">{title}</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => {
            const v = r[metric] ?? 0;
            return (
              <li key={r.key} className="group relative" title={`${fmt.format(v)} ${unit}`}>
                <div
                  className={`absolute inset-y-0 left-0 rounded-md transition-all duration-700 ${
                    gold ? 'bg-pro-400/20 group-hover:bg-pro-400/30' : 'bg-brand-500/20 group-hover:bg-brand-500/30'
                  }`}
                  style={{ width: `${Math.max(2, (v / max) * 100)}%` }}
                />
                <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5 text-sm">
                  <span className="truncate text-slate-200">{label ? label(r.key) : r.key}</span>
                  <span className="shrink-0 tabular-nums text-slate-300">{fmt.format(v)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
