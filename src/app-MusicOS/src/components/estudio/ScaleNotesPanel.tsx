'use client';

/**
 * "Transpositor de Escalas": notas da escala com o nome do grau e o campo
 * harmonico (portado de calcularEscala/gerarCampoHarmonico do MusicPages).
 * Clicar numa linha toca a nota ou o acorde.
 */

import { degreeNames, pc, type BuiltScale, type HarmonicChord } from '@/lib/music/escalas';
import { playChordMidi, playMidi, playSequenceMidi } from '@/lib/audio/synth';

/** MIDI a partir de C4 (60), subindo sempre. */
function ascendingMidis(rootPc: number, notes: string[]): number[] {
  let prev = 59 + rootPc;
  return notes.map((n) => {
    let m = 60 + pc(n);
    while (m <= prev) m += 12;
    prev = m;
    return m;
  });
}

export function ScaleNotesPanel({
  scale,
  field,
  tetrads,
  onTetradsChange,
}: {
  scale: BuiltScale;
  field: HarmonicChord[] | null;
  tetrads: boolean;
  onTetradsChange: (v: boolean) => void;
}) {
  const rootPc = pc(scale.root);
  const degrees = degreeNames(scale);
  const scaleMidis = ascendingMidis(rootPc, scale.notes);
  const canToggle = scale.notes.length === 7 && scale.def.parentOffset !== undefined;

  const box = 'bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4 font-mono text-[15px]';
  const row = 'w-full text-left px-2 py-1 rounded hover:bg-slate-700 transition-colors';

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-100">🎵 Notas da Escala</h3>
          <button
            onClick={() => playSequenceMidi([...scaleMidis, scaleMidis[0] + 12])}
            className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
          >
            ▶ Tocar escala
          </button>
        </div>
        <div className={box}>
          {scale.notes.map((n, i) => (
            <button key={`${n}-${i}`} onClick={() => playMidi(scaleMidis[i])} className={row}>
              {i + 1} - <span className="text-white font-bold">{n}</span> - {degrees[i]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-100">📚 Campo Harmônico</h3>
          {canToggle && (
            <div className="flex rounded-lg overflow-hidden border border-slate-600 text-sm">
              {[
                [false, 'Tríades'],
                [true, 'Tétrades'],
              ].map(([v, label]) => (
                <button
                  key={String(v)}
                  onClick={() => onTetradsChange(v as boolean)}
                  className={`px-3 py-1.5 ${tetrads === v ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={box}>
          {field ? (
            field.map((ch) => (
              <button
                key={ch.grau + ch.name}
                onClick={() => playChordMidi(ascendingMidis(pc(ch.root), ch.notes).map((m, i) => (i === 0 ? m - 12 : m)))}
                className={row}
              >
                {ch.grau} - <span className="text-white font-bold">{ch.name}</span> ({ch.notes.join(', ')})
              </button>
            ))
          ) : (
            <p className="px-2 py-1 text-slate-400 font-sans">
              Esta escala exótica não forma um campo harmônico tradicional por terças.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
