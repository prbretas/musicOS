'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authErrorMessage, signInWithGoogle, signUp } from '@/lib/supabase/client';
import { AuthShell, Divider, FormError, GoogleIcon } from '@/components/auth/AuthShell';
import { PLANS, isPaidPlan } from '@/lib/plans';

function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

/** Se o cadastro veio de um "Desbloquear", mostra qual plano vai ser comprado. */
function planFromNext(next: string): string | null {
  const m = next.match(/^\/checkout\?plan=([a-z_]+)/);
  return m && isPaidPlan(m[1]) ? PLANS[m[1]].name : null;
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const planName = planFromNext(next);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError('Digite seu nome.');
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');
    if (!accepted) return setError('Você precisa aceitar os Termos de Uso para continuar.');

    setLoading(true);
    try {
      const data = await signUp(email.trim(), password, name.trim(), next);
      if (data.session) {
        // Confirmação de e-mail desligada no Supabase: já está logado
        router.replace(next);
        router.refresh();
      } else {
        setNeedsConfirm(true);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithGoogle(next);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  if (needsConfirm) {
    return (
      <AuthShell title="Confirme seu e-mail" subtitle={`Enviamos um link para ${email}.`}>
        <p className="text-slate-300">
          Abra o e-mail e clique em <strong className="text-white">Confirmar conta</strong>. Você volta para cá já logado
          {planName ? ` e segue direto para o pagamento do plano ${planName}` : ''}.
        </p>
        <p className="text-sm text-slate-500 mt-4">Não chegou? Veja a caixa de spam ou tente de novo em alguns minutos.</p>
        <Link href="/login" className="btn-secondary w-full mt-6">
          Ir para o login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Crie sua conta grátis"
      subtitle={
        planName
          ? `Falta pouco: crie a conta e finalize o plano ${planName}.`
          : 'Salve seu progresso e desbloqueie o MusicOS Pro quando quiser.'
      }
      footer={
        <p>
          Já tem conta?{' '}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="link font-semibold">
            Entrar
          </Link>
        </p>
      }
    >
      <FormError message={error} />

      <button type="button" onClick={handleGoogle} className="btn-secondary w-full py-3">
        <GoogleIcon />
        Continuar com Google
      </button>

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="field-label">
            Nome
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full py-3"
            placeholder="Como quer ser chamado"
          />
        </div>

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
          <label htmlFor="password" className="field-label">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full py-3"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-slate-400 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
          <span>
            Li e aceito os{' '}
            <Link href="/terms" target="_blank" className="link">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacy" target="_blank" className="link">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
