import type { ReactNode } from 'react';

/** Bloco de conteúdo dentro de uma área: título com ícone e ações à direita. */
export function Section({
  id,
  icon,
  title,
  actions,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-3 text-lg md:text-xl font-bold text-slate-100 font-display">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] border border-white/[0.07] text-base text-brand-200">
            {icon}
          </span>
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Converte o texto com <strong> dos dados do MusicPages em elementos React (sem HTML cru). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(<strong>.*?<\/strong>)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('<strong>') ? (
          <strong key={i} className="text-white">
            {p.slice(8, -9)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
