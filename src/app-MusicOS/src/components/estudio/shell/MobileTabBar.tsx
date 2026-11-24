'use client';

/** Barra inferior do celular: atalhos para as áreas mais usadas. */

import { getView, MOBILE_TABS, type ViewId } from './views';

export function MobileTabBar({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 border-t lg:hidden no-print"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Atalhos"
    >
      <ul className="grid grid-cols-5">
        {MOBILE_TABS.map((id) => {
          const v = getView(id);
          const active = view === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                  active ? 'text-white' : 'text-slate-500'
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-gradient-to-r from-brand-300 to-brand-500 shadow-[0_0_12px_2px_rgba(138,121,255,.7)]" />
                )}
                <span
                  className={`grid h-8 w-12 place-items-center rounded-full transition-all duration-300 ${
                    active ? 'bg-brand-500/25 text-brand-100' : ''
                  }`}
                >
                  <v.Icon width={19} height={19} />
                </span>
                {v.short}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
