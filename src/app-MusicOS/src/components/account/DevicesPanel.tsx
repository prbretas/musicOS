'use client';

/**
 * Dispositivos conectados: até 1 computador e 1 celular por conta.
 * Desconectar encerra a sessão daquele aparelho no servidor.
 */

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { DEVICE_KIND_LABEL, type DeviceKind, type DeviceRow } from '@/lib/devices';

const ICON: Record<DeviceKind, string> = { desktop: '💻', mobile: '📱' };

function lastSeen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 2 * 60_000) return 'ativo agora';
  if (diff < 60 * 60_000) return `visto há ${Math.round(diff / 60_000)} min`;
  return `visto em ${new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
}

export function DevicesPanel() {
  const supabase = createClient();
  const { user, sessionId, signOut } = useAuth();
  const [rows, setRows] = useState<DeviceRow[] | null>(null);
  const [busy, setBusy] = useState<DeviceKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('user_devices')
      .select('kind, device_id, session_id, label, last_seen, created_at')
      .order('kind');
    if (err) {
      setRows([]);
      return;
    }
    setRows((data as DeviceRow[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    void load();
    const channel = supabase
      .channel(`devices-panel:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_devices', filter: `user_id=eq.${user.id}` }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, user, load]);

  async function disconnect(row: DeviceRow) {
    setBusy(row.kind);
    setError(null);
    const { error: err } = await supabase.rpc('revoke_device', { p_kind: row.kind });
    setBusy(null);
    if (err) {
      setError('Não foi possível desconectar agora. Tente de novo.');
      return;
    }
    if (row.session_id === sessionId) {
      await signOut();
      window.location.assign('/login');
      return;
    }
    void load();
  }

  const kinds: DeviceKind[] = ['desktop', 'mobile'];

  return (
    <section className="card p-6">
      <h2 className="font-bold text-white text-lg mb-1">Dispositivos conectados</h2>
      <p className="text-sm text-slate-400 mb-4">
        Sua conta pode ficar conectada em 1 computador e 1 celular ao mesmo tempo. Se você entrar em outro aparelho do mesmo
        tipo, o anterior é desconectado automaticamente.
      </p>
      {rows === null ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : (
        <ul className="space-y-2">
          {kinds.map((kind) => {
            const row = rows.find((r) => r.kind === kind);
            const mine = row && row.session_id === sessionId;
            return (
              <li key={kind} className="flex flex-wrap items-center gap-3 rounded-xl bg-ink-700 border border-ink-600 px-4 py-3">
                <span className="text-2xl" aria-hidden>
                  {ICON[kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {DEVICE_KIND_LABEL[kind]}
                    {mine && <span className="ml-2 text-[11px] uppercase tracking-wider text-emerald-300">este dispositivo</span>}
                  </p>
                  <p className="text-xs text-slate-400">{row ? `${row.label ?? 'Navegador'} · ${lastSeen(row.last_seen)}` : 'Vaga livre'}</p>
                </div>
                {row && (
                  <button onClick={() => disconnect(row)} disabled={busy !== null} className="btn-secondary text-xs">
                    {busy === kind ? 'Desconectando…' : mine ? 'Sair deste aparelho' : 'Desconectar'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="text-sm text-red-300 mt-3">{error}</p>}
    </section>
  );
}
