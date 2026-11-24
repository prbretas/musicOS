import type { ReactNode } from 'react';

/** Bloco de secao no estilo do MusicPages: titulo com icone e cartao escuro. */
export function Section({
  id,
  icon,
  title,
  actions,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-36">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-600 pb-2 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-display">
          <span className="mr-2">{icon}</span>
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
