'use client';

/**
 * Canto direito do cabeçalho:
 *  - anônimo: "Entrar" + "Seja Pro"
 *  - logado grátis: avatar + "Seja Pro"
 *  - Pro: avatar com selo
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUpgrade } from '@/components/pro/UpgradeProvider';
import { ProBadge } from '@/components/pro/ProBadge';
import { entitlementLabel } from '@/lib/entitlements';

function initials(name: string | null | undefined, email: string | null | undefined): string {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/);
  const a = parts[0]?.[0] ?? '?';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

export function UserMenu() {
  const { user, profile, entitlement, loading, signOut } = useAuth();
  const { openUpgrade } = useUpgrade();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (loading) return <div className="w-24 h-9 rounded-lg bg-ink-700 animate-pulse" aria-hidden="true" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="btn-ghost">
          Entrar
        </Link>
        <button onClick={() => openUpgrade()} className="btn-pro hidden sm:inline-flex">
          Seja Pro
        </button>
      </div>
    );
  }

  const name = profile?.name ?? user.user_metadata?.name ?? user.email ?? '';

  return (
    <div className="flex items-center gap-2" ref={ref} data-no-track>
      {!entitlement.isPro && (
        <button onClick={() => openUpgrade()} className="btn-pro hidden sm:inline-flex">
          Seja Pro
        </button>
      )}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-ink-600 transition-colors"
        >
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
              entitlement.isPro ? 'bg-pro-400 text-ink-900' : 'bg-brand-500 text-white'
            }`}
          >
            {initials(profile?.name, user.email)}
          </span>
          <span className="hidden md:block text-sm text-slate-200 max-w-[120px] truncate">{name.split(' ')[0]}</span>
          {entitlement.isPro && <ProBadge className="hidden md:inline-flex" />}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 card p-2 z-50 animate-pop-in"
          >
            <div className="px-3 py-2 border-b border-ink-600 mb-1">
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <p className="text-xs mt-1 text-slate-400">
                Plano: <span className={entitlement.isPro ? 'text-pro-300 font-semibold' : 'text-slate-300'}>{entitlementLabel(entitlement)}</span>
              </p>
            </div>
            <Link href="/account" role="menuitem" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-ink-600">
              Minha conta
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-brand-200 hover:bg-ink-600">
                📊 Painel do administrador
              </Link>
            )}
            {!entitlement.isPro && (
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  openUpgrade();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-pro-300 hover:bg-ink-600"
              >
                Fazer upgrade para Pro
              </button>
            )}
            <button
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.replace('/');
                router.refresh();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-ink-600 hover:text-red-300"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
