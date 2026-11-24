'use client';

/** Cabeçalho de cada área: ícone, grupo, título em degradê, descrição e ações. */

import type { ReactNode } from 'react';
import { Spotlight } from '@/components/ui/Spotlight';
import { getView, groupOf, type ViewId } from './views';

export function ViewHeader({
  view,
  title,
  description,
  actions,
  children,
}: {
  view: ViewId;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const def = getView(view);
  return (
    <Spotlight className="card gradient-border relative overflow-hidden p-6 md:p-8">
      {/* brilho decorativo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-pro-400/10 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
            <def.Icon width={24} height={24} />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">{groupOf(view)}</p>
            <h1 className="mt-1 text-2xl md:text-4xl font-black tracking-tight font-display text-gradient">{title ?? def.label}</h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-400">{description ?? def.description}</p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="relative mt-6">{children}</div>}
    </Spotlight>
  );
}
