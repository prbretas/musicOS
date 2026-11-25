'use client';

/**
 * Coleta automática de métricas:
 *  - page_view a cada troca de página
 *  - click em qualquer botão ou link (rótulo do botão + área do estúdio)
 * Elementos com data-no-track são ignorados (ex.: menus com e-mail).
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { clickLabel, track } from '@/lib/analytics/client';

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // o painel do administrador não entra nas métricas
    if (!pathname.startsWith('/admin')) track('page_view');
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest?.('button, a, [role="tab"], [data-track]');
      if (!el || el.closest('[data-no-track]') || window.location.pathname.startsWith('/admin')) return;
      const label = clickLabel(el);
      if (!label) return;
      const area = window.location.pathname === '/' ? window.location.hash.replace('#', '') || 'escala' : window.location.pathname;
      track('click', { target: `${area} › ${label}`.slice(0, 60) });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
