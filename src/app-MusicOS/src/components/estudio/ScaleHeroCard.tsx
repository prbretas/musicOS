/**
 * Cartao principal da escala (portado de script-scale-hero.js):
 * tonica em letra grande, sonoridade, sentimentos, uso e musicas.
 */

import { SCALE_INFO } from '@/lib/music/scale-info';
import { pc, type BuiltScale } from '@/lib/music/escalas';
import { RichText } from './Section';
import { ScaleCircle } from './ScaleCircle';

function examplesFor(scale: BuiltScale): string[] {
  const info = SCALE_INFO[scale.def.key];
  if (!info) return [];
  const byTonic =
    info.exemplos[scale.root] ??
    Object.entries(info.exemplos).find(([k]) => k !== 'default' && pc(k) === pc(scale.root))?.[1];
  return byTonic ?? info.exemplos.default ?? [];
}

export function ScaleHeroCard({ scale, rootPc }: { scale: BuiltScale; rootPc: number }) {
  const info = SCALE_INFO[scale.def.key] ?? SCALE_INFO.maior;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 md:p-10 grid gap-8 lg:grid-cols-[1fr_auto] items-center">
      <div>
        <div className="flex items-baseline gap-4 mb-6">
          <span className="text-7xl md:text-8xl font-black text-white leading-none" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            {scale.root}
          </span>
          <span className="text-3xl md:text-4xl text-slate-200">{info.label}</span>
        </div>

        <ul className="list-disc pl-5 space-y-2 text-slate-300 max-w-2xl">
          <li>
            <strong className="text-white">Sonoridade:</strong> <RichText text={info.sonoridade} />
          </li>
          <li>
            <strong className="text-white">Sentimentos Despertados:</strong> <RichText text={info.sentimentos} />
          </li>
          <li>
            <strong className="text-white">Uso Comum:</strong> <RichText text={info.uso} />
          </li>
        </ul>

        <ul className="mt-5 space-y-1 text-slate-200 font-semibold">
          {examplesFor(scale).map((ex) => (
            <li key={ex}>🎵 {ex}</li>
          ))}
        </ul>
      </div>

      <ScaleCircle rootPc={rootPc} scaleKey={scale.def.key} />
    </div>
  );
}
