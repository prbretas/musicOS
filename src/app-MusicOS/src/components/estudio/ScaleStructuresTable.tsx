/**
 * Estruturas de Escalas (portado de gerarTabelaGeralEscalas): os intervalos
 * de cada escala do catalogo. Clicar no nome seleciona a escala.
 */

import { SCALES, formatStep } from '@/lib/music/escalas';

export function ScaleStructuresTable({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (scaleKey: string) => void;
}) {
  const cols = 12;
  return (
    <table className="w-full border-collapse text-xs font-mono">
      <thead>
        <tr className="text-slate-300">
          <th className="border border-slate-700 px-2 py-2 text-left font-sans">Escala / Modo</th>
          <th className="border border-slate-700 px-2 py-2 font-sans" colSpan={cols}>
            Estrutura (intervalos)
          </th>
        </tr>
      </thead>
      <tbody>
        {SCALES.map((s) => (
          <tr key={s.key} className={s.key === current ? 'bg-blue-950' : ''}>
            <td className="border border-slate-700 px-2 py-2 font-sans">
              <button onClick={() => onSelect(s.key)} className="text-blue-400 font-bold hover:underline text-left">
                {s.label}
              </button>
            </td>
            {Array.from({ length: cols }).map((_, i) => (
              <td key={i} className="border border-slate-700 px-1.5 py-2 text-center text-slate-200 whitespace-nowrap">
                {s.steps[i] !== undefined ? formatStep(s.steps[i]) : '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
