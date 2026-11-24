'use client';

/** Diálogo modal acessível: fecha com Esc, clique fora e no X; trava o scroll da página. */

import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-4xl' : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/80 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card w-full ${width} max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-b-2xl outline-none animate-pop-in`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          {title ? <h2 className="text-xl font-bold text-white">{title}</h2> : <span />}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-ink-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
