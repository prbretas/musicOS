'use client';

/**
 * Navegação do Estúdio: barra lateral fixa no computador e gaveta no celular
 * (mesmo conteúdo). Agrupa as áreas em Teoria, Instrumento e Prática.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { IconClose, IconCrown, IconSparkles } from '@/components/ui/icons';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUpgrade } from '@/components/pro/UpgradeProvider';
import { entitlementLabel } from '@/lib/entitlements';
import { VIEW_GROUPS, type ViewId } from './views';

function SidebarContent({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  const { entitlement } = useAuth();
  const { openUpgrade } = useUpgrade();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-6">
        <Link href="/#escala" onClick={() => onNavigate('escala')} aria-label="MusicOS — início">
          <Logo animated />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6" aria-label="Áreas do estúdio">
        {VIEW_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{group.label}</p>
            <ul className="space-y-1">
              {group.views.map((v) => (
                <li key={v.id}>
                  <a
                    href={`#${v.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(v.id);
                    }}
                    aria-current={view === v.id ? 'page' : undefined}
                    className="nav-item group"
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-300 ${
                        view === v.id
                          ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow'
                          : 'bg-white/[0.04] text-slate-400 group-hover:text-brand-200 group-hover:bg-brand-500/15'
                      }`}
                    >
                      <v.Icon width={17} height={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate">{v.label}</span>
                      <span className="block truncate text-[11px] font-normal text-slate-500 group-aria-[current=page]:text-brand-200/70">
                        {v.description}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 space-y-3">
        {entitlement.isPro ? (
          <div className="rounded-xl border border-pro-400/25 bg-gradient-to-br from-pro-400/10 to-transparent px-4 py-3 flex items-center gap-3">
            <IconCrown className="text-pro-300" />
            <div>
              <p className="text-sm font-bold text-gold">{entitlementLabel(entitlement)}</p>
              <p className="text-[11px] text-slate-400">Todos os recursos liberados</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => openUpgrade()}
            className="group relative w-full overflow-hidden rounded-2xl p-[1px] text-left"
            style={{ background: 'linear-gradient(135deg, rgba(255,227,163,.8), rgba(109,93,252,.5), rgba(245,185,66,.8))' }}
          >
            <span className="block rounded-[15px] bg-ink-900/95 px-4 py-4 transition-colors group-hover:bg-ink-900/80">
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                <IconSparkles className="text-pro-300" width={18} height={18} />
                Desbloqueie o <span className="text-gold">PRO</span>
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                Todas as escalas, 13 instrumentos, tétrades, CAGED, tablaturas e afinador.
              </span>
              <span className="btn-pro mt-3 w-full py-1.5 text-xs">Ver planos</span>
            </span>
          </button>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] text-slate-500">
          <Link href="/pricing" className="hover:text-slate-300">
            Planos
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            Termos
          </Link>
          <Link href="/privacy" className="hover:text-slate-300">
            Privacidade
          </Link>
          <a href="mailto:suporte@musicos.app" className="hover:text-slate-300">
            Suporte
          </a>
        </div>
      </div>
    </div>
  );
}

export function StudioSidebar({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  return (
    <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r lg:block no-print">
      <SidebarContent view={view} onNavigate={onNavigate} />
    </aside>
  );
}

export function StudioDrawer({
  open,
  onClose,
  view,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  view: ViewId;
  onNavigate: (v: ViewId) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden no-print ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      // fechada: invisível (fora do Tab) só depois da animação de saída
      style={{ visibility: open ? 'visible' : 'hidden', transition: open ? 'visibility 0s' : 'visibility 0s linear .3s' }}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog"
        aria-label="Menu"
        className={`glass absolute inset-y-0 left-0 w-[84%] max-w-[300px] border-r transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button onClick={onClose} aria-label="Fechar menu" className="absolute right-3 top-5 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
          <IconClose />
        </button>
        <SidebarContent
          view={view}
          onNavigate={(v) => {
            onNavigate(v);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
