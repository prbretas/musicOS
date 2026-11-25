/**
 * Tabela de Intervalos (portada de script-tabinter.js): as 13 posicoes da
 * tonica ate a oitava, com grau, distancia em tons e em semitons.
 * Colunas da escala ficam destacadas em violeta; a tonica fica em dourado.
 */

import { INTERVAL_NAMES, noteNameIn, pc, type BuiltScale } from '@/lib/music/escalas';

export function IntervalTable({ scale }: { scale: BuiltScale }) {
  const rootPc = pc(scale.root);
  const inScale = new Set(scale.offsets.map((o) => o % 12));
  const cols = Array.from({ length: 13 }, (_, i) => i);

  const cell = (i: number) => {
    const active = inScale.has(i % 12);
    return active ? 'bg-brand-500/[0.16] text-white font-bold' : 'bg-white/[0.015] text-slate-500';
  };

  const rows: { label: string; render: (i: number) => string; extra?: (i: number) => string }[] = [
    {
      label: 'Nota',
      render: (i) => (i === 0 || i === 12 ? scale.root : noteNameIn(scale, (rootPc + i) % 12)),
      extra: (i) =>
        i === 0 || i === 12
          ? '!bg-gradient-to-b !from-pro-300 !to-pro-500 !text-ink-900 font-black'
          : inScale.has(i % 12)
            ? '!bg-brand-500/30'
            : '',
    },
    {
      label: 'Grau',
      render: (i) => INTERVAL_NAMES[i].grau,
      extra: (i) => (inScale.has(i % 12) ? '!text-brand-200' : ''),
    },
    { label: 'Tons', render: (i) => String(i / 2) },
    { label: 'Semitons', render: (i) => String(i) },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
      <table className="w-full min-w-[720px] border-collapse text-center text-sm md:text-base">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="sr-only">
                {row.label}
              </th>
              {cols.map((i) => (
                <td key={i} className={`border border-white/[0.05] px-2 py-2.5 transition-colors ${cell(i)} ${row.extra?.(i) ?? ''}`}>
                  {row.render(i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
