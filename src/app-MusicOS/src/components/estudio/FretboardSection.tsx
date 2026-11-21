'use client';

/**
 * Braco do instrumento com a escala colorida, desenhos CAGED (+ F e B),
 * filtro de pentatonica e destaque do acorde da tonica.
 * A tonica e a escala vem do seletor do topo da pagina.
 */

import { useState } from 'react';
import { Fretboard, DEGREE_FILL } from '@/components/Fretboard';
import type { NoteName as TheoryNote } from '@/lib/music/theory';
import type { NoteName } from '@/types/music';
import {
  SHAPE_ORDER,
  getCagedKey,
  getCagedWindows,
  getPentatonicNotes,
  getTonicTriad,
  hasCagedShapes,
  isMinorCaged,
  type CagedShape,
} from '@/lib/music/caged';
import { noteNameIn, pc, type BuiltScale } from '@/lib/music/escalas';

const MAX_FRET = 15;
export type InstrumentType = 'guitar' | 'ukulele';

export function FretboardSection({ scale, instrument }: { scale: BuiltScale; instrument: InstrumentType }) {
  const [caged, setCaged] = useState<CagedShape | null>(null);
  const [intervals, setIntervals] = useState(false);
  const [penta, setPenta] = useState(false);
  const [chord, setChord] = useState(false);

  const root = scale.sharpNotes[0] as TheoryNote;
  const notes = scale.sharpNotes as TheoryNote[];
  const scaleKey = scale.def.key;

  const cagedEnabled = instrument === 'guitar' && hasCagedShapes(scaleKey);
  const cagedWindows = getCagedWindows(root, scaleKey, MAX_FRET);
  const cagedKey = getCagedKey(root, scaleKey);
  const pentaNotes = getPentatonicNotes(root, notes);
  const triad = getTonicTriad(root, notes);
  const pentaActive = penta && pentaNotes !== null;
  const chordActive = chord && triad !== null;
  const shownWindows = cagedEnabled && caged ? cagedWindows[caged] : undefined;

  const btn = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${
      active ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`;

  const keyName = noteNameIn(scale, pc(cagedKey));
  const minorForms = isMinorCaged(scaleKey);
  const formName = (shape: CagedShape) => (minorForms ? `${shape}m` : shape);

  return (
    <div className="bg-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={intervals} onChange={(e) => setIntervals(e.target.checked)} />
          Mostrar intervalos (R, 3, 5...)
        </label>
        <label className={`flex items-center gap-2 text-sm cursor-pointer ${pentaNotes ? 'text-slate-300' : 'text-slate-600'}`}>
          <input type="checkbox" checked={pentaActive} disabled={!pentaNotes} onChange={(e) => setPenta(e.target.checked)} />
          Só pentatônica
          {pentaNotes
            ? ` (${pentaNotes.map((n) => noteNameIn(scale, pc(n))).join(' ')})`
            : ' (não se aplica a esta escala)'}
        </label>
        <label className={`flex items-center gap-2 text-sm cursor-pointer ${triad ? 'text-slate-300' : 'text-slate-600'}`}>
          <input type="checkbox" checked={chordActive} disabled={!triad} onChange={(e) => setChord(e.target.checked)} />
          Destacar acorde
          {triad ? ` ${scale.root}${triad.name.slice(triad.notes[0].length)} (${triad.notes.map((n) => noteNameIn(scale, pc(n))).join(' ')})` : ''}
        </label>
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-2">
          Desenhos CAGED
          {instrument !== 'guitar'
            ? ' (disponível só para guitarra)'
            : !hasCagedShapes(scaleKey)
              ? ' (só para escalas derivadas da maior)'
              : ''}
          :
        </p>
        <div className="flex flex-wrap gap-2">
          <button disabled={!cagedEnabled} onClick={() => setCaged(null)} className={btn(caged === null || !cagedEnabled)}>
            Braço todo
          </button>
          {SHAPE_ORDER.map((shape) => (
            <button key={shape} disabled={!cagedEnabled} onClick={() => setCaged(shape)} className={btn(cagedEnabled && caged === shape)}>
              Forma {formName(shape)}
            </button>
          ))}
        </div>
        {cagedEnabled && (
          <p className="text-slate-500 text-xs mt-2">
            {minorForms
              ? `Formas dos acordes menores em ${scale.root} menor.`
              : `Desenhos calculados na tonalidade de ${keyName} maior${
                  pc(cagedKey) !== pc(scale.root) ? ` (relativa de ${scale.root} ${scale.def.label})` : ''
                }.`}
            {caged && ` Forma ${formName(caged)}: casas ${cagedWindows[caged].map(([a, b]) => `${a}–${b}`).join(' e ')}.`} As formas{' '}
            {formName('F')} e {formName('B')} completam as 7 posições da escala; não fazem parte do CAGED tradicional.
          </p>
        )}
      </div>

      <Fretboard
        instrument={instrument}
        startFret={0}
        endFret={MAX_FRET}
        scale={{ root: root as NoteName, type: scaleKey, notes: notes as NoteName[] }}
        fretWindows={shownWindows}
        showIntervals={intervals}
        focusNotes={pentaActive ? (pentaNotes as NoteName[]) : undefined}
        chordNotes={chordActive ? (triad!.notes as NoteName[]) : undefined}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-slate-400 text-sm">Notas da escala:</span>
        {scale.notes.map((n, i) => (
          <span
            key={`${n}-${i}`}
            className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
              pentaActive && !pentaNotes!.includes(notes[i]) ? 'opacity-25' : ''
            } ${chordActive && triad!.notes.includes(notes[i]) ? 'ring-2 ring-white' : ''}`}
            style={{ background: DEGREE_FILL[i % DEGREE_FILL.length] }}
          >
            {n}
            {i === 0 ? ' (tônica)' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
