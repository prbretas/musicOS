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
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient, signOut as supabaseSignOut } from '@/lib/supabase/client';
import { entitlementFromProfile, FREE_ENTITLEMENT, type Entitlement, type Profile } from '@/lib/entitlements';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  entitlement: Entitlement;
  /** true enquanto a sessão inicial ainda não foi lida */
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  entitlement: FREE_ENTITLEMENT,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

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
      setUser(u);
      await loadProfile(u?.id ?? null);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
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

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
    setProfile(null);
  }, []);

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
    }),
    [user, profile, loading, signOut, refreshProfile]
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
