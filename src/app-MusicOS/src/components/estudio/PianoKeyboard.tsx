'use client';

/**
 * Teclado virtual de duas oitavas (C4 a C6), como em script-keys.js.
 * Teclas da escala acendem; a tonica fica marcada. Clicar toca a nota.
 */

import { useState } from 'react';
import { noteNameIn, pc, type BuiltScale } from '@/lib/music/escalas';
import { playMidi } from '@/lib/audio/synth';

const FIRST = 60; // C4
const LAST = 84; // C6
const BLACK = new Set([1, 3, 6, 8, 10]);
const WHITE_W = 46;
const BLACK_W = 28;

export function PianoKeyboard({ scale }: { scale: BuiltScale }) {
  const [pressed, setPressed] = useState<number | null>(null);
  const inScale = new Set(scale.sharpNotes.map(pc));
  const rootPc = pc(scale.root);

  const keys = Array.from({ length: LAST - FIRST + 1 }, (_, i) => FIRST + i);
  const whites = keys.filter((m) => !BLACK.has(m % 12));

  const press = (m: number) => {
    playMidi(m);
    setPressed(m);
    setTimeout(() => setPressed((p) => (p === m ? null : p)), 180);
  };

  const label = (m: number) => noteNameIn(scale, m % 12);

  return (
    <div className="overflow-x-auto py-6">
      <div className="relative mx-auto" style={{ width: whites.length * WHITE_W, height: 170 }}>
        {whites.map((m, i) => {
          const on = inScale.has(m % 12);
          const root = m % 12 === rootPc;
          return (
            <button
              key={m}
              aria-label={`Tocar ${label(m)}`}
              onClick={() => press(m)}
              className={`absolute top-0 h-full rounded-b-md border border-slate-900 flex items-end justify-center pb-3 font-bold transition-transform ${
                on ? 'bg-[#bccc00] text-slate-900' : 'bg-slate-200 text-slate-500'
              } ${pressed === m ? 'translate-y-0.5 brightness-90' : ''}`}
              style={{ left: i * WHITE_W, width: WHITE_W - 2 }}
            >
              <span className={root ? 'px-1.5 rounded bg-red-600 text-white' : ''}>{label(m)}</span>
            </button>
          );
        })}
        {keys
          .filter((m) => BLACK.has(m % 12))
          .map((m) => {
            const whiteIndex = whites.filter((w) => w < m).length;
            const on = inScale.has(m % 12);
            const root = m % 12 === rootPc;
            return (
              <button
                key={m}
                aria-label={`Tocar ${label(m)}`}
                onClick={() => press(m)}
                className={`absolute top-0 z-10 rounded-b-md flex items-end justify-center pb-2 text-[10px] font-bold shadow-lg ${
                  on ? 'bg-[#4d5300] text-[#e5f06a]' : 'bg-slate-900 text-slate-400'
                } ${pressed === m ? 'brightness-75' : ''}`}
                style={{ left: whiteIndex * WHITE_W - BLACK_W / 2 - 1, width: BLACK_W, height: 105 }}
              >
                <span className={root ? 'px-1 rounded bg-red-600 text-white' : ''}>{label(m)}</span>
              </button>
            );
          })}
      </div>
      <p className="text-center text-xs text-slate-500 mt-3">Clique nas teclas para ouvir. A tônica aparece em vermelho.</p>
    </div>
  );
}
