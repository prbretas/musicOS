'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { flush, track } from '@/lib/analytics/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { authErrorMessage, signIn, signInWithGoogle } from '@/lib/supabase/client';
import { AuthShell, Divider, FormError, GoogleIcon } from '@/components/auth/AuthShell';

function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(params.get('error'));
  const kicked = params.get('motivo') === 'outro-dispositivo';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      track('login', { method: 'email' });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      track('login', { method: 'google' });
      flush();
      await signInWithGoogle(next);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para acessar seu plano e seu progresso."
      footer={
        <>
          <p>
            Ainda não tem conta?{' '}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="link font-semibold">
              Criar conta grátis
            </Link>
          </p>
        </>
      }
    >
      {kicked && !error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
          Sua conta foi conectada em outro dispositivo do mesmo tipo, então esta sessão foi encerrada. Cada conta pode ficar
          conectada em 1 computador e 1 celular ao mesmo tempo. Entre de novo para usar aqui (o outro aparelho será desconectado).
        </div>
      )}
      <FormError message={error} />

      <button type="button" onClick={handleGoogle} className="btn-secondary w-full py-3">
        <GoogleIcon />
        Continuar com Google
      </button>

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="field-label">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-3"
            placeholder="voce@exemplo.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="field-label mb-0">
              Senha
            </label>
            <Link href="/forgot-password" className="text-xs link">
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-3"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
