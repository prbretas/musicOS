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
      className={`fixed z-50 right-3 left-3 bottom-3 sm:left-auto sm:bottom-auto sm:top-24 sm:right-6 ${
        wide ? 'sm:w-[760px]' : 'sm:w-[360px]'
      } max-h-[75vh] flex flex-col bg-slate-900 border border-slate-600 rounded-xl shadow-2xl outline-none`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="font-bold text-slate-100">{title}</h2>
        <button onClick={onClose} aria-label="Fechar" className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white">
          ✕
        </button>
      </div>
      <div className="overflow-auto p-4">{children}</div>
    </div>
  );
}
