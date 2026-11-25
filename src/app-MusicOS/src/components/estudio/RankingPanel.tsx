'use client';

/**
 * Ranking dos exercícios: semana e mês e pódio do mês passado (só visualização).
 * Mostra só primeiro nome + inicial. Cada usuário pode sair do ranking.
 */

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { PLACE_MEDAL } from '@/lib/ranking/medals';

interface Row {
  rank: number;
  display_name: string;
  points: number;
  answers: number;
  accuracy: number;
  is_me: boolean;
}

type Period = 'week' | 'month';

export function RankingPanel() {
  const { user, profile, refreshProfile } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [podium, setPodium] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingOptIn, setSavingOptIn] = useState(false);
  const showInRanking = profile?.show_in_ranking ?? true;

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    setRows(null);
    const supabase = createClient();
    const [current, last] = await Promise.all([
      supabase.rpc('exercise_leaderboard', { p_period: period, p_limit: 20 }),
      supabase.rpc('exercise_leaderboard', { p_period: 'last_month', p_limit: 3 }),
    ]);
    if (current.error) {
      setError('Não foi possível carregar o ranking agora.');
      setRows([]);
      return;
    }
    setRows((current.data as Row[]) ?? []);
    setPodium(((last.data as Row[]) ?? []).filter((r) => r.rank <= 3));
  }, [user, period]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleOptIn(value: boolean) {
    if (!user) return;
    setSavingOptIn(true);
    await createClient().from('profiles').update({ show_in_ranking: value }).eq('id', user.id);
    await refreshProfile();
    setSavingOptIn(false);
    void load();
  }

  if (!user) {
    return <div className="card p-6 text-slate-400">Entre na sua conta para ver o ranking.</div>;
  }

  const me = rows?.find((r) => r.is_me);
  const top = rows?.filter((r) => r.rank <= 20) ?? [];

  return (
    <div className="card p-6 space-y-6">
      <p className="text-sm text-slate-400">
        Pontos por acerto nos exercícios valendo ranking. São precisas 10 respostas no período para aparecer.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-ink-500 text-sm">
          {(['week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-semibold ${period === p ? 'bg-brand-500 text-white' : 'bg-ink-700 text-slate-300 hover:bg-ink-600'}`}
            >
              {p === 'week' ? 'Esta semana' : 'Este mês'}
            </button>
          ))}
        </div>
        {me && (
          <span className="text-sm text-slate-300">
            Sua posição: <strong className="text-white">{me.rank}º</strong> com <strong className="text-brand-300">{me.points} pts</strong>
          </span>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showInRanking} disabled={savingOptIn} onChange={(e) => toggleOptIn(e.target.checked)} />
          Aparecer no ranking
        </label>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {rows === null ? (
        <p className="text-slate-500 text-sm">Carregando…</p>
      ) : top.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Ninguém entrou no ranking {period === 'week' ? 'desta semana' : 'deste mês'} ainda. São precisas 10 respostas no período
          para aparecer. Que tal ser o primeiro?
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-600">
          <table className="w-full text-sm">
            <thead className="bg-ink-700/60 text-slate-400">
              <tr>
                <th className="py-2 px-3 text-left w-14">#</th>
                <th className="py-2 px-3 text-left">Músico</th>
                <th className="py-2 px-3 text-right">Pontos</th>
                <th className="py-2 px-3 text-right hidden sm:table-cell">Respostas</th>
                <th className="py-2 px-3 text-right">Acerto</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r) => (
                <tr key={r.rank} className={`border-t border-ink-600 ${r.is_me ? 'bg-brand-500/15' : ''}`}>
                  <td className="py-2 px-3 font-bold text-white">{PLACE_MEDAL[r.rank] ?? `${r.rank}º`}</td>
                  <td className="py-2 px-3 text-slate-200">
                    {r.display_name}
                    {r.is_me && <span className="ml-2 text-xs text-brand-300">(você)</span>}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-white tabular-nums">{r.points}</td>
                  <td className="py-2 px-3 text-right text-slate-400 hidden sm:table-cell tabular-nums">{r.answers}</td>
                  <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{r.accuracy}%</td>
                </tr>
              ))}
              {me && me.rank > 20 && (
                <tr className="border-t-2 border-ink-500 bg-brand-500/15">
                  <td className="py-2 px-3 font-bold text-white">{me.rank}º</td>
                  <td className="py-2 px-3 text-slate-200">
                    {me.display_name} <span className="ml-2 text-xs text-brand-300">(você)</span>
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-white tabular-nums">{me.points}</td>
                  <td className="py-2 px-3 text-right text-slate-400 hidden sm:table-cell tabular-nums">{me.answers}</td>
                  <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{me.accuracy}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {podium.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Pódio do mês passado</p>
          <div className="flex flex-wrap gap-3">
            {podium.map((r) => (
              <div key={r.rank} className="rounded-lg bg-ink-700 border border-ink-600 px-4 py-2 text-sm">
                <span className="mr-2">{PLACE_MEDAL[r.rank]}</span>
                <span className="text-white font-semibold">{r.display_name}</span>
                <span className="text-slate-400"> · {r.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
