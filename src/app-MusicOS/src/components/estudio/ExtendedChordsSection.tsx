'use client';

/**
 * Tétrades e extensões (7, 6, 9, add9, 6/9, sus4, sus2, 7sus4) em cada grau
 * da escala, com diagramas no instrumento e na afinação escolhidos.
 */

import { useState } from 'react';
import type { BuiltScale } from '@/lib/music/escalas';
import { EXTENSIONS, extendedField, fieldDegrees, type ExtensionId } from '@/lib/music/extensions';
import type { InstrumentType } from '@/lib/music/tunings';
import { ChordVoicingCard, EmptyChordCard } from './ChordCards';

export function ExtendedChordsSection({
  scale,
  instrument,
  tuning,
}: {
  scale: BuiltScale;
  instrument: InstrumentType;
  tuning: string[];
}) {
  const [ext, setExt] = useState<ExtensionId>('7');
  const field = extendedField(scale, ext);
  const degrees = fieldDegrees(scale);
  const def = EXTENSIONS.find((e) => e.id === ext)!;

  if (!field || !degrees) {
    return <p className="text-slate-400">Esta escala não tem campo harmônico de 7 notas, então não há tétrades para mostrar.</p>;
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de acorde">
        {EXTENSIONS.map((e) => (
          <button
            key={e.id}
            role="tab"
            aria-selected={ext === e.id}
            onClick={() => setExt(e.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              ext === e.id ? 'bg-brand-500 text-white' : 'bg-ink-600 text-slate-300 hover:bg-ink-500'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400">
        <strong className="text-slate-200">{def.label}:</strong> {def.description} Graus que não formam este acorde
        com as notas da escala aparecem com —.
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {field.map((chord, i) =>
          chord ? (
            <ChordVoicingCard key={`${ext}-${chord.name}`} chord={chord} instrument={instrument} tuning={tuning} />
          ) : (
            <EmptyChordCard key={`${ext}-empty-${i}`} grau={degrees[i]} label="não se forma neste grau" />
          )
        )}
      </div>
    </div>
  );
}
