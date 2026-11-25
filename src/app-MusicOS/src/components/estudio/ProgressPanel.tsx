'use client';

/**
 * Meu progresso nos exercícios: totais, acerto por modo e nível,
 * pontos dos últimos 30 dias e posição na semana e no mês.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

interface Stats {
  total_points: number;
  total_answers: number;
  accuracy: number;
  active_days: number;
  by_kind: { mode: 'intervals' | 'chords'; level: 'beginner' | 'intermediate' | 'advanced'; answers: number; correct: number; points: number }[];
  last_30_days: { day: string; points: number; answers: number }[];
}

const MODE: Record<string, string> = { intervals: 'Intervalos', chords: 'Acordes' };
const LEVEL: Record<string, string> = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' };

function DailyChart({ days }: { days: Stats['last_30_days'] }) {
  const W = 600;
  const H = 140;
  const padB = 20;
  const max = Math.max(1, ...days.map((d) => d.points));
  const barW = W / days.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" role="img" aria-label="Pontos por dia nos últimos 30 dias">
      <line x1={0} x2={W} y1={H - padB} y2={H - padB} stroke="#2e3547" />
      {days.map((d, i) => {
        const h = ((H - padB - 8) * d.points) / max;
        const date = new Date(`${d.day}T12:00:00`);
        return (
          <g key={d.day}>
            <rect x={i * barW + 2} y={H - padB - h} width={barW - 4} height={Math.max(h, d.answers > 0 ? 2 : 0)} rx={2} fill={d.points > 0 ? '#6d5dfc' : '#2e3547'}>
              <title>{`${date.toLocaleDateString('pt-BR')}: ${d.points} pts em ${d.answers} respostas`}</title>
            </rect>
            {(i % 5 === 0 || i === days.length - 1) && (
              <text x={i * barW + barW / 2} y={H - 5} textAnchor="middle" fontSize={10} fill="#64748b">
                {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ProgressPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [ranks, setRanks] = useState<{ week?: number; month?: number }>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    void Promise.all([
      supabase.rpc('my_exercise_stats'),
      supabase.rpc('exercise_leaderboard', { p_period: 'week', p_limit: 1 }),
      supabase.rpc('exercise_leaderboard', { p_period: 'month', p_limit: 1 }),
    ]).then(([s, w, m]) => {
      if (s.error) {
        setError(true);
        return;
      }
      setStats(s.data as Stats);
      const mine = (rows: unknown) => ((rows as { rank: number; is_me: boolean }[] | null) ?? []).find((r) => r.is_me)?.rank;
      setRanks({ week: mine(w.data), month: mine(m.data) });
    });
  }, [user]);

  if (!user) return <div className="card p-6 text-slate-400">Entre na sua conta para acompanhar seu progresso.</div>;
  if (error) return <div className="card p-6 text-red-300">Não foi possível carregar seu progresso agora.</div>;
  if (!stats) return <div className="card p-6 text-slate-500">Carregando…</div>;

  if (stats.total_answers === 0) {
    return (
      <div className="card p-6 text-slate-400">
        Você ainda não respondeu nenhum exercício valendo pontos. Vá em <strong className="text-white">Treinar</strong> e comece: seu
        histórico aparece aqui.
      </div>
    );
  }

  const tiles = [
    { label: 'Pontos', value: stats.total_points },
    { label: 'Respostas', value: stats.total_answers },
    { label: 'Acerto', value: `${stats.accuracy}%` },
    { label: 'Dias de treino', value: stats.active_days },
    { label: 'Na semana', value: ranks.week ? `${ranks.week}º` : '—' },
    { label: 'No mês', value: ranks.month ? `${ranks.month}º` : '—' },
  ];

  return (
    <div className="card p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl bg-ink-700 border border-ink-600 p-3">
            <p className="text-xs text-slate-500">{t.label}</p>
            <p className="text-2xl font-black text-white tabular-nums">{t.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm text-slate-300 mb-2">Pontos por dia (últimos 30 dias)</p>
        <DailyChart days={stats.last_30_days} />
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-600">
        <table className="w-full text-sm">
          <thead className="bg-ink-700/60 text-slate-400">
            <tr>
              <th className="py-2 px-3 text-left">Exercício</th>
              <th className="py-2 px-3 text-left">Nível</th>
              <th className="py-2 px-3 text-right">Respostas</th>
              <th className="py-2 px-3 text-right">Acerto</th>
              <th className="py-2 px-3 text-right">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {stats.by_kind.map((k) => {
              const acc = Math.round((100 * k.correct) / Math.max(1, k.answers));
              return (
                <tr key={k.mode + k.level} className="border-t border-ink-600">
                  <td className="py-2 px-3 text-slate-200">{MODE[k.mode]}</td>
                  <td className="py-2 px-3 text-slate-300">{LEVEL[k.level]}</td>
                  <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{k.answers}</td>
                  <td className={`py-2 px-3 text-right tabular-nums ${acc >= 90 ? 'text-emerald-300' : acc >= 60 ? 'text-slate-200' : 'text-amber-300'}`}>
                    {acc}%
                  </td>
                  <td className="py-2 px-3 text-right text-white font-semibold tabular-nums">{k.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Acima de 90% de acerto em um nível, é hora de subir para o próximo.</p>
    </div>
  );
}
