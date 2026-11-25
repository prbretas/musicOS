'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authErrorMessage, requestPasswordReset } from '@/lib/supabase/client';
import { AuthShell, FormError } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Verifique seu e-mail" subtitle={`Se existir uma conta para ${email}, enviamos um link para criar uma nova senha.`}>
        <Link href="/login" className="btn-secondary w-full">
          Voltar ao login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Digite seu e-mail e enviaremos um link para criar uma nova senha."
      footer={
        <p>
          Lembrou?{' '}
          <Link href="/login" className="link font-semibold">
            Entrar
          </Link>
        </p>
      }
    >
      <FormError message={error} />
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
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Enviando…' : 'Enviar link'}
        </button>
      </form>
    </AuthShell>
  );
}
