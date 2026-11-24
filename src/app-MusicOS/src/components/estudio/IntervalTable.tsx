/**
 * Tabela de Intervalos (portada de script-tabinter.js): as 13 posicoes da
 * tonica ate a oitava, com grau, distancia em tons e em semitons.
 * Colunas da escala ficam destacadas; a tonica fica em verde.
 */

import { INTERVAL_NAMES, noteNameIn, pc, type BuiltScale } from '@/lib/music/escalas';

export function IntervalTable({ scale }: { scale: BuiltScale }) {
  const rootPc = pc(scale.root);
  const inScale = new Set(scale.offsets.map((o) => o % 12));
  const cols = Array.from({ length: 13 }, (_, i) => i);

  const cell = (i: number) => {
    const active = inScale.has(i % 12);
    return active ? 'bg-[#24485a] text-white font-bold' : 'bg-ink-700 text-slate-400';
  };

  const rows: { label: string; render: (i: number) => string; extra?: (i: number) => string }[] = [
    {
      label: 'Nota',
      render: (i) => (i === 0 || i === 12 ? scale.root : noteNameIn(scale, (rootPc + i) % 12)),
      extra: (i) => (i === 0 ? '!bg-lime-700 !text-white' : ''),
    },
    {
      label: 'Grau',
      render: (i) => INTERVAL_NAMES[i].grau,
      extra: (i) => (inScale.has(i % 12) ? '!text-rose-400' : ''),
    },
    { label: 'Tons', render: (i) => String(i / 2) },
    { label: 'Semitons', render: (i) => String(i) },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-600">
      <table className="w-full min-w-[720px] border-collapse text-center text-sm md:text-base">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="sr-only">
                {row.label}
              </th>
              {cols.map((i) => (
                <td key={i} className={`border border-ink-600 px-2 py-2.5 ${cell(i)} ${row.extra?.(i) ?? ''}`}>
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
