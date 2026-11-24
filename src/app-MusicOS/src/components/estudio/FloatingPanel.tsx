'use client';

/** Painel flutuante (como os popups do MusicPages). Fecha com Esc ou no X. */

import { useEffect, useRef, type ReactNode } from 'react';

export function FloatingPanel({
  title,
  onClose,
  wide = false,
  children,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-label={title}
      className={`fixed z-50 right-3 left-3 bottom-20 sm:bottom-auto sm:left-auto sm:top-24 sm:right-6 ${
        wide ? 'sm:w-[760px]' : 'sm:w-[380px]'
      } max-h-[75vh] flex flex-col card gradient-border shadow-[0_30px_80px_-20px_rgba(0,0,0,.8),0_0_60px_-20px_rgba(109,93,252,.5)] outline-none animate-pop-in`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h2 className="font-bold text-slate-100 font-display">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="overflow-auto p-4">{children}</div>
    </div>
  );
}
