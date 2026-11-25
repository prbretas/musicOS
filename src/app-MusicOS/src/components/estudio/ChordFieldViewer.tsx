'use client';

/**
 * Visualizador de Acordes (tríades do campo harmônico), no instrumento e na
 * afinação escolhidos. Clicar no diagrama toca o acorde; as setas trocam de posição.
 */

import { pc, type HarmonicChord } from '@/lib/music/escalas';
import { INSTRUMENTS, findTuning, type InstrumentType } from '@/lib/music/tunings';
import { ChordVoicingCard } from './ChordCards';

const TRIAD_SUFFIX: Record<string, string> = { Maj: '', m: 'm', dim: 'º', aug: '+' };

export function ChordFieldViewer({
  field,
  instrument = 'guitar',
  tuning,
}: {
  field: HarmonicChord[] | null;
  instrument?: InstrumentType;
  tuning: string[];
}) {
  if (!field) {
    return <p className="text-slate-400">Esta escala não tem campo harmônico, então não há acordes para mostrar.</p>;
  }
  const def = INSTRUMENTS[instrument];
  const tuningName = findTuning(instrument, tuning)?.label ?? 'afinação personalizada';

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {field.map((ch) => (
          <ChordVoicingCard
            key={ch.grau + ch.name}
            instrument={instrument}
            tuning={tuning}
            chord={{
              grau: ch.grau,
              root: ch.root,
              name: ch.root + (TRIAD_SUFFIX[ch.quality] ?? ch.name.slice(ch.root.length)),
              notes: ch.notes,
              pcs: ch.notes.map(pc),
            }}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {def.chords
          ? `Diagramas para ${def.label.toLowerCase()} em ${tuningName}. Clique no diagrama para ouvir.`
          : `No ${def.label.toLowerCase()}, os acordes são tocados como arpejo: clique para ouvir as notas.`}
      </p>
    </div>
  );
}
