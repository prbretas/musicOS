/**
 * Supabase no navegador.
 *
 * Um único cliente por aba: criar vários clientes gera várias conexões de
 * realtime e vários listeners de auth.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Em SSR cada chamada recebe um cliente descartável (sem cookies de sessão)
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  if (!browserClient) {
    browserClient = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  return browserClient;
}

/** URL de retorno do OAuth / confirmação de e-mail. */
export function authCallbackUrl(next = '/'): string {
  const base = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? '';
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await createClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, name: string, next = '/') {
  const { data, error } = await createClient().auth.signUp({
    email,
    password,
    options: {
      data: { name, full_name: name },
      emailRedirectTo: authCallbackUrl(next),
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(next = '/') {
  const { error } = await createClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authCallbackUrl(next),
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await createClient().auth.resetPasswordForEmail(email, {
    redirectTo: authCallbackUrl('/auth/reset-password'),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await createClient().auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Sai só deste dispositivo (padrão). 'global' encerra todas as sessões da conta.
 * O padrão do Supabase é 'global', o que derrubaria também o celular ao sair no computador.
 */
export async function signOut(scope: 'local' | 'global' = 'local') {
  const { error } = await createClient().auth.signOut({ scope });
  if (error) throw error;
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await createClient().auth.getSession();
  if (error) throw error;
  return session;
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await createClient().auth.getUser();
  if (error) throw error;
  return user;
}

/** Traduz as mensagens mais comuns do Supabase Auth. */
export function authErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const map: Array<[RegExp, string]> = [
    [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
    [/email not confirmed/i, 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'],
    [/user already registered/i, 'Já existe uma conta com este e-mail. Faça login.'],
    [/password should be at least/i, 'A senha precisa ter pelo menos 8 caracteres.'],
    [/rate limit|too many requests/i, 'Muitas tentativas. Aguarde um instante e tente de novo.'],
    [/invalid email/i, 'Digite um e-mail válido.'],
    [/network|fetch/i, 'Sem conexão. Verifique sua internet.'],
  ];
  for (const [re, text] of map) if (re.test(msg)) return text;
  return msg || 'Algo deu errado. Tente novamente.';
}
