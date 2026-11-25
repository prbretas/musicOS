'use client';

/** Cabeçalho fixo. `children` é a barra de controles do estúdio (opcional). */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from './UserMenu';

export function SiteHeader({ children, nav }: { children?: ReactNode; nav?: ReactNode }) {
  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center gap-4">
          <Link href="/" className="shrink-0" aria-label="MusicOS — início">
            <Logo animated />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-2 text-sm">
            <Link href="/" className="btn-ghost px-3">
              Estúdio
            </Link>
            <Link href="/pricing" className="btn-ghost px-3">
              Planos
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <UserMenu />
          </div>
        </div>

        {children && <div className="pb-3 flex flex-wrap items-center gap-2">{children}</div>}
        {nav}
      </div>
    </header>
  );
}
