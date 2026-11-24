/**
 * Supabase no servidor (Server Components, Route Handlers).
 * Lê e grava os cookies de sessão do usuário.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Profile } from '@/lib/entitlements';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Em Server Components não é possível gravar cookies; o middleware cuida disso.
        }
      },
    },
  });
}

/** Usuário autenticado (validado no servidor do Supabase) e seu perfil. */
export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { user, profile: (profile as Profile | null) ?? null };
}
