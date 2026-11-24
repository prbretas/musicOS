'use client';

/**
 * Acordes no teclado: um mini teclado por grau, com as teclas do acorde
 * acesas, a digitação da mão direita e as inversões. Clique para ouvir.
 * Tríades no grátis; tétrades e extensões são Pro.
 */

import { useMemo, useState } from 'react';
import { pc, type BuiltScale, type HarmonicChord } from '@/lib/music/escalas';
import { EXTENSIONS, extendedField, fieldDegrees, type ExtensionId } from '@/lib/music/extensions';
import { closeVoicing, isBlack, rightHandFingering, INVERSION_LABEL } from '@/lib/music/piano';
import { playChordMidi } from '@/lib/audio/synth';
import { useProFeature } from '@/components/pro/ProGate';
import { ProBadge } from '@/components/pro/ProBadge';
import type { ChordCardData } from './ChordCards';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const TRIAD_SUFFIX: Record<string, string> = { Maj: '', m: 'm', dim: 'º', aug: '+' };

export function MiniPiano({ notes, fingers, rootPc }: { notes: number[]; fingers: number[]; rootPc: number }) {
  // janela: do Dó (ou Fá) abaixo da nota mais grave até cobrir a mais aguda, mínimo de 10 teclas brancas
  const lowStart = (() => {
    let m = notes[0];
    while (m % 12 !== 0 && m % 12 !== 5) m--;
    return m;
  })();
  let end = Math.max(notes[notes.length - 1] + 1, lowStart);
  while (isBlack(end)) end++;
  const keys: number[] = [];
  for (let m = lowStart; m <= end; m++) keys.push(m);
  let whites = keys.filter((m) => !isBlack(m));
  while (whites.length < 10) {
    end++;
    keys.push(end);
    whites = keys.filter((m) => !isBlack(m));
  }

  const WW = 16;
  const WH = 66;
  const BW = 10;
  const BH = 40;
  const W = whites.length * WW + 1;
  const on = new Map(notes.map((m, i) => [m, fingers[i]]));

  return (
    <svg width={W} height={WH + 2} viewBox={`0 0 ${W} ${WH + 2}`} aria-hidden="true">
      {whites.map((m, i) => {
        const f = on.get(m);
        const root = f !== undefined && m % 12 === rootPc;
        return (
          <g key={m}>
            <rect
              x={i * WW + 0.5}
              y={0.5}
              width={WW - 1}
              height={WH}
              rx={2}
              fill={f !== undefined ? (root ? '#ef4444' : '#8a79ff') : '#f1f5f9'}
              stroke="#0f172a"
            />
            {f !== undefined && (
              <text x={i * WW + WW / 2} y={WH - 6} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#fff">
                {f}
              </text>
            )}
          </g>
        );
      })}
      {keys
        .filter((m) => isBlack(m))
        .map((m) => {
          const wi = whites.filter((w) => w < m).length;
          const f = on.get(m);
          const root = f !== undefined && m % 12 === rootPc;
          return (
            <g key={m}>
              <rect
                x={wi * WW - BW / 2}
                y={0.5}
                width={BW}
                height={BH}
                rx={1.5}
                fill={f !== undefined ? (root ? '#dc2626' : '#6d5dfc') : '#0f172a'}
                stroke="#0f172a"
              />
              {f !== undefined && (
                <text x={wi * WW} y={BH - 5} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#fff">
                  {f}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}

function PianoChordCard({ chord }: { chord: ChordCardData }) {
  const [inv, setInv] = useState(0);
  const n = chord.pcs.length;
  // extensões (5 notas) ficam em posição fundamental
  const maxInv = n <= 4 ? n : 1;
  const voicing = useMemo(() => closeVoicing(chord.pcs, inv), [chord.pcs, inv]);
  const fingers = rightHandFingering(n, inv);
  const bass = NAMES[((chord.pcs[0] % 12) + 12) % 12];

  return (
    <div className="bg-ink-700 border border-ink-600 rounded-xl p-3 flex flex-col items-center min-w-[190px]">
      <span className="text-xs text-slate-400">{chord.grau}</span>
      <span className="font-bold text-white whitespace-nowrap">{chord.name}</span>
      <span className="text-[10px] text-slate-500 mb-2">{chord.notes.join(' ')}</span>
      <button
        onClick={() => playChordMidi([voicing[0] - 12, ...voicing], 1.6, 0.015)}
        title="Tocar acorde"
        className="rounded hover:bg-ink-600 p-1"
      >
        <MiniPiano notes={voicing} fingers={fingers} rootPc={((chord.pcs[0] % 12) + 12) % 12} />
      </button>
      <span className="text-[10px] text-slate-500 mt-1">Mão esquerda: {bass} no grave</span>
      {maxInv > 1 && (
        <button
          onClick={() => setInv((i) => (i + 1) % maxInv)}
          className="mt-1 text-xs text-brand-300 hover:text-brand-200"
          title="Ver a próxima inversão"
        >
          {INVERSION_LABEL[inv]} ↻
        </button>
      )}
    </div>
  );
}

type Kind = 'triads' | ExtensionId;

export function PianoChords({ scale, triadField }: { scale: BuiltScale; triadField: HarmonicChord[] | null }) {
  const [kind, setKind] = useState<Kind>('triads');
  const tetradsPro = useProFeature('tetrads');

  const chords: (ChordCardData | null)[] | null = useMemo(() => {
    if (kind === 'triads') {
      return (
        triadField?.map((ch) => ({
          grau: ch.grau,
          root: ch.root,
          name: ch.root + (TRIAD_SUFFIX[ch.quality] ?? ch.name.slice(ch.root.length)),
          notes: ch.notes,
          pcs: ch.notes.map(pc),
        })) ?? null
      );
    }
    return extendedField(scale, kind);
  }, [kind, scale, triadField]);
  const degrees = fieldDegrees(scale);

  function pick(k: Kind) {
    if (k !== 'triads' && !tetradsPro.gate()) return;
    setKind(k);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => pick('triads')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'triads' ? 'bg-brand-500 text-white' : 'bg-ink-600 text-slate-300 hover:bg-ink-500'}`}
        >
          Tríades
        </button>
        {EXTENSIONS.map((e) => (
          <button
            key={e.id}
            onClick={() => pick(e.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === e.id ? 'bg-brand-500 text-white' : 'bg-ink-600 text-slate-300 hover:bg-ink-500'}`}
          >
            {e.label}
          </button>
        ))}
        {!tetradsPro.allowed && <ProBadge className="ml-1" />}
      </div>

      {!chords ? (
        <p className="text-slate-400 text-sm">Esta escala não tem campo harmônico para montar acordes.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {chords.map((ch, i) =>
            ch ? (
              <PianoChordCard key={`${kind}-${ch.name}`} chord={ch} />
            ) : (
              <div
                key={`${kind}-empty-${i}`}
                className="bg-ink-800 border border-dashed border-ink-600 rounded-xl p-3 flex flex-col items-center justify-center min-w-[190px] text-center"
              >
                <span className="text-xs text-slate-500">{degrees?.[i]}</span>
                <span className="text-slate-600 text-lg">—</span>
                <span className="text-[10px] text-slate-500">não se forma neste grau</span>
              </div>
            )
          )}
        </div>
      )}
      <p className="text-xs text-slate-500">
        Números = dedos da mão direita (1 polegar, 5 mínimo). Vermelho = fundamental. Use ↻ para ver as inversões, que
        deixam a mão no mesmo lugar ao trocar de acorde.
      </p>
    </div>
  );
}
