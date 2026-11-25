'use client';

/**
 * Contexto de autenticação e direitos de acesso.
 *
 * - `user`: usuário do Supabase Auth (null no modo grátis)
 * - `profile`: linha de `profiles` (tier, status, Stripe)
 * - `entitlement`: o que ele pode usar agora (derivado do perfil)
 *
 * O perfil é recarregado quando a sessão muda e quando a linha muda no banco
 * (realtime), então ao voltar do checkout o acesso Pro aparece sozinho.
 *
 * Limite de dispositivos: ao entrar, este aparelho ocupa a vaga do seu tipo
 * (computador ou celular). Se outro aparelho do mesmo tipo entrar depois, a
 * sessão daqui é encerrada no servidor e o app volta para o login com aviso.
 * Batimento a cada minuto, ao voltar para a aba e quando a lista muda (realtime).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient, signOut as supabaseSignOut } from '@/lib/supabase/client';
import { entitlementFromProfile, FREE_ENTITLEMENT, type Entitlement, type Profile } from '@/lib/entitlements';
import { detectDeviceKind, deviceLabel, getDeviceId, KICKED_QUERY, sessionIdFromToken, type DeviceKind } from '@/lib/devices';

const HEARTBEAT_MS = 60_000;

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  entitlement: Entitlement;
  /** true enquanto a sessão inicial ainda não foi lida */
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Sessão atual (para marcar "este dispositivo" na página da conta) */
  sessionId: string | null;
  deviceKind: DeviceKind;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  entitlement: FREE_ENTITLEMENT,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  sessionId: null,
  deviceKind: 'desktop',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceKind, setDeviceKind] = useState<DeviceKind>('desktop');
  const kickedRef = useRef(false);

  useEffect(() => {
    setDeviceKind(detectDeviceKind(navigator.userAgent, navigator.maxTouchPoints));
  }, []);

  const loadProfile = useCallback(
    async (userId: string | null) => {
      if (!userId) {
        setProfile(null);
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      setProfile((data as Profile | null) ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const u = data.session?.user ?? null;
      userIdRef.current = u?.id ?? null;
      setSessionId(sessionIdFromToken(data.session?.access_token));
      setUser(u);
      await loadProfile(u?.id ?? null);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setSessionId(sessionIdFromToken(session?.access_token));
      const changed = userIdRef.current !== (u?.id ?? null);
      userIdRef.current = u?.id ?? null;
      setUser(u);
      if (changed) void loadProfile(u?.id ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  // Realtime: quando o webhook do Stripe atualiza o perfil, o app reflete na hora
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`profile:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        setProfile(payload.new as Profile);
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, user]);


  // ------------------------------------------------------------ dispositivos
  const kick = useCallback(async () => {
    if (kickedRef.current) return;
    kickedRef.current = true;
    // a sessão já não existe no servidor: limpa só o armazenamento local
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    setUser(null);
    setProfile(null);
    window.location.assign(`/login?${KICKED_QUERY}`);
  }, [supabase]);

  useEffect(() => {
    if (!user || !sessionId) return;
    kickedRef.current = false;
    let cancelled = false;
    const kind = detectDeviceKind(navigator.userAgent, navigator.maxTouchPoints);

    const claim = async () => {
      const { data, error } = await supabase.rpc('claim_device', {
        p_device_id: getDeviceId(),
        p_kind: kind,
        p_label: deviceLabel(navigator.userAgent, navigator.maxTouchPoints),
      });
      // erro (ex.: banco sem a migração v4, rede) não derruba ninguém
      if (!cancelled && !error && (data as { ok?: boolean; reason?: string } | null)?.reason === 'session_revoked') {
        await kick();
      }
    };

    const check = async () => {
      const { data, error } = await supabase.rpc('check_device');
      if (cancelled || error) return;
      if (data === 'revoked') await kick();
      else if (data === 'unclaimed') await claim();
    };

    void check();
    const timer = setInterval(() => void check(), HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);

    const channel = supabase
      .channel(`devices:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_devices', filter: `user_id=eq.${user.id}` }, () => {
        void check();
      })
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      void supabase.removeChannel(channel);
    };
  }, [supabase, user, sessionId, kick]);

  const signOut = useCallback(async () => {
    // libera a vaga deste aparelho antes de sair
    await supabase.rpc('revoke_device', { p_kind: deviceKind }).then(
      () => undefined,
      () => undefined
    );
    await supabaseSignOut('local').catch(() => undefined);
    setUser(null);
    setProfile(null);
  }, [supabase, deviceKind]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(userIdRef.current);
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      entitlement: entitlementFromProfile(profile),
      loading,
      signOut,
      refreshProfile,
      sessionId,
      deviceKind,
    }),
    [user, profile, loading, signOut, refreshProfile, sessionId, deviceKind]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/** Atalho: o usuário atual pode usar recursos Pro? */
export function useIsPro(): boolean {
  return useAuth().entitlement.isPro;
}
