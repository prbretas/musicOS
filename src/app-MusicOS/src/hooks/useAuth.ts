import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const supabaseRef = useRef<SupabaseClient>(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    
    supabase.auth.getSession().then(({ data, error }) => {
      setState({
        user: data.session?.user ?? null,
        loading: false,
        error: error ? new Error(error.message) : null,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const { error } = await supabaseRef.current.auth.signInWithPassword({ email, password });
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: new Error(error.message) }));
      return { error };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const { error } = await supabaseRef.current.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: new Error(error.message) }));
      return { error };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const { error } = await supabaseRef.current.auth.signOut();
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: new Error(error.message) }));
    }
    return { error: error ? new Error(error.message) : null };
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
}