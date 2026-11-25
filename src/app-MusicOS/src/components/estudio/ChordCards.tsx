'use client';

/**
 * Cartões de acorde com diagrama para qualquer instrumento e afinação.
 *
 * Violão na afinação padrão: usa primeiro as posições do banco curado
 * (chord-shapes) e completa com as geradas. Demais instrumentos e afinações:
 * posições geradas por lib/music/voicings. Baixo: mostra as notas do acorde
 * (no baixo o acorde é tocado como arpejo).
 */

import { useMemo, useState } from 'react';
import { CHORD_SHAPES } from '@/lib/music/chord-shapes';
import { generateVoicings, type Voicing } from '@/lib/music/voicings';
import { INSTRUMENTS, isStandardTuning, pitchToMidi, type InstrumentType } from '@/lib/music/tunings';
import { playChordMidi, playSequenceMidi } from '@/lib/audio/synth';
import { toSharp } from '@/lib/music/escalas';

export function MiniVoicingDiagram({ voicing, strings }: { voicing: Voicing; strings: number }) {
  const gap = 15;
  const left = 14;
  const W = Math.max(92, left + gap * (strings - 1) + 10);
  const H = 108;
  const top = 22;
  const rowH = 17;
  const fretted = voicing.frets.filter((f) => f > 0);
  const base = fretted.length && Math.max(...fretted) > 4 ? Math.min(...fretted) : 1;
  const x = (s: number) => left + s * gap;
  const y = (f: number) => top + (f - base + 0.5) * rowH;
  const right = x(strings - 1);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {base === 1 ? (
        <rect x={left} y={top - 3} width={right - left} height={3} fill="#e5e7eb" />
      ) : (
        <text x={2} y={top + rowH * 0.6} fontSize={9} fill="#9ca3af">
          {base}
        </text>
      )}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`f${i}`} x1={left} x2={right} y1={top + i * rowH} y2={top + i * rowH} stroke="#9ca3af" strokeWidth={1} />
      ))}
      {Array.from({ length: strings }).map((_, s) => (
        <line key={`s${s}`} x1={x(s)} x2={x(s)} y1={top} y2={top + 5 * rowH} stroke="#d1d5db" strokeWidth={1} />
      ))}
      {voicing.barre && (
        <rect
          x={x(voicing.barre.fromString) - 5}
          y={y(voicing.barre.fret) - 5}
          width={x(voicing.barre.toString) - x(voicing.barre.fromString) + 10}
          height={10}
          rx={5}
          fill="#d1d5db"
        />
      )}
      {voicing.frets.map((f, s) => {
        if (f === -1)
          return (
            <text key={s} x={x(s)} y={top - 7} textAnchor="middle" fontSize={10} fill="#9ca3af">
              x
            </text>
          );
        if (f === 0) return <circle key={s} cx={x(s)} cy={top - 10} r={3.5} fill="none" stroke="#d1d5db" strokeWidth={1.2} />;
        return (
          <g key={s}>
            <circle cx={x(s)} cy={y(f)} r={6} fill="#f8fafc" stroke="#111827" />
            {voicing.fingers[s] > 0 && (
              <text x={x(s)} y={y(f) + 3} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#111827">
                {voicing.fingers[s]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Banco curado (violão padrão) → Voicing */
function curatedVoicings(key: string, tuning: string[]): Voicing[] {
  const open = tuning.map(pitchToMidi);
  return (CHORD_SHAPES[key] ?? []).map((sh) => ({
    frets: sh.frets,
    fingers: sh.fingers,
    barre: sh.barre,
    midis: sh.frets.flatMap((f, s) => (f < 0 ? [] : [open[s] + f])),
  }));
}

/** Sufixo do nome → chave do banco curado ("C7M" → "Cmaj7"). */
const CURATED_SUFFIX: Record<string, string> = {
  '': '',
  m: 'm',
  '7M': 'maj7',
  Maj7: 'maj7',
  m7: 'm7',
  '7': '7',
  º: 'dim',
  dim: 'dim',
  'm7(b5)': 'm7b5',
  m7b5: 'm7b5',
};

export interface ChordCardData {
  grau: string;
  root: string;
  name: string;
  notes: string[];
  pcs: number[];
}

export function ChordVoicingCard({
  chord,
  instrument,
  tuning,
}: {
  chord: ChordCardData;
  instrument: InstrumentType;
  tuning: string[];
}) {
  const def = INSTRUMENTS[instrument];
  const [idx, setIdx] = useState(0);

  const voicings = useMemo(() => {
    if (!def.chords) return [];
    const generated = generateVoicings({
      tuning,
      chordPcs: chord.pcs,
      stringStartFret: def.stringStartFret,
      requireRootBass: !def.allowInversions,
      maxFret: def.frets,
    });
    if (instrument !== 'guitar' || !isStandardTuning('guitar', tuning)) return generated;
    const suffix = chord.name.slice(chord.root.length);
    const curatedKey = CURATED_SUFFIX[suffix] !== undefined ? toSharp(chord.root) + CURATED_SUFFIX[suffix] : null;
    const curated = curatedKey ? curatedVoicings(curatedKey, tuning) : [];
    const seen = new Set(curated.map((v) => v.frets.join(',')));
    return [...curated, ...generated.filter((v) => !seen.has(v.frets.join(',')))].slice(0, 5);
  }, [def, instrument, tuning, chord.pcs, chord.name, chord.root]);

  const voicing = voicings.length ? voicings[idx % voicings.length] : null;

  const play = () => {
    if (voicing) {
      playChordMidi(voicing.midis);
      return;
    }
    // Baixo ou sem posição: arpejo a partir da fundamental na oitava do instrumento
    const base = Math.min(...tuning.map(pitchToMidi)) + 12;
    const rootMidi = base + ((chord.pcs[0] - base) % 12 + 12) % 12;
    playSequenceMidi(chord.pcs.map((p) => rootMidi + ((p - chord.pcs[0] + 12) % 12)), 0.3);
  };

  return (
    <div className="bg-ink-700 border border-ink-600 rounded-xl p-3 flex flex-col items-center min-w-[118px]">
      <span className="text-xs text-slate-400">{chord.grau}</span>
      <span className="font-bold text-white mb-0.5 whitespace-nowrap">{chord.name}</span>
      <span className="text-[10px] text-slate-500 mb-1">{chord.notes.join(' ')}</span>
      {voicing ? (
        <button onClick={play} title="Tocar acorde" className="rounded hover:bg-ink-600 p-1">
          <MiniVoicingDiagram voicing={voicing} strings={tuning.length} />
        </button>
      ) : (
        <button
          onClick={play}
          title="Tocar arpejo"
          className="h-[108px] w-[92px] flex flex-col items-center justify-center gap-1 text-center text-xs text-slate-400 hover:bg-ink-600 rounded px-1"
        >
          {def.chords ? 'Sem posição confortável nesta afinação' : 'Toque como arpejo'}
          <span className="text-brand-300">▶ ouvir</span>
        </button>
      )}
      {voicings.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <button onClick={() => setIdx((i) => (i + voicings.length - 1) % voicings.length)} className="px-1.5 hover:text-white" aria-label="Posição anterior">
            ‹
          </button>
          {(idx % voicings.length) + 1}/{voicings.length}
          <button onClick={() => setIdx((i) => (i + 1) % voicings.length)} className="px-1.5 hover:text-white" aria-label="Próxima posição">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export function EmptyChordCard({ grau, label }: { grau: string; label: string }) {
  return (
    <div className="bg-ink-800 border border-dashed border-ink-600 rounded-xl p-3 flex flex-col items-center justify-center min-w-[118px] text-center">
      <span className="text-xs text-slate-500">{grau}</span>
      <span className="text-slate-600 text-lg">—</span>
      <span className="text-[10px] text-slate-500 mt-1">{label}</span>
    </div>
  );
}
