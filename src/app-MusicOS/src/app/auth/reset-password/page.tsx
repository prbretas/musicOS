'use client';

/**
 * Nova senha. O usuário chega aqui pelo link do e-mail (via /auth/callback),
 * já com uma sessão de recuperação ativa.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authErrorMessage, updatePassword } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthShell, FormError } from '@/components/auth/AuthShell';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As senhas não conferem.');
    setLoading(true);
    try {
      await updatePassword(password);
      router.replace('/account?password=updated');
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <AuthShell title="Link expirado" subtitle="Peça um novo link de recuperação para continuar.">
        <Link href="/forgot-password" className="btn-primary w-full">
          Pedir novo link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Crie uma nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres.">
      <FormError message={error} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="field-label">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-3"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="field-label">
            Repita a senha
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full py-3"
          />
        </div>
        <button type="submit" disabled={loading || authLoading} className="btn-primary w-full py-3">
          {loading ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </AuthShell>
  );
}
