'use client';

/**
 * Visualizador de Acordes: um cartao por grau do campo harmonico, com o
 * diagrama do banco de posicoes do MusicPages (script-chord-diagrams.js).
 * Clicar no diagrama toca o acorde; as setas trocam de posicao quando ha mais de uma.
 */

import { useState } from 'react';
import { CHORD_SHAPES, type ChordShape } from '@/lib/music/chord-shapes';
import { shapeKey, type HarmonicChord } from '@/lib/music/escalas';
import { playChordMidi } from '@/lib/audio/synth';

const OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4

function MiniChordDiagram({ shape }: { shape: ChordShape }) {
  const W = 92;
  const H = 108;
  const left = 14;
  const top = 22;
  const gap = (W - left - 8) / 5;
  const rowH = 17;
  const fretted = shape.frets.filter((f) => f > 0);
  const base = fretted.length && Math.max(...fretted) > 4 ? Math.min(...fretted) : 1;
  const x = (s: number) => left + s * gap;
  const y = (f: number) => top + (f - base + 0.5) * rowH;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* pestana ou numero da casa */}
      {base === 1 ? (
        <rect x={left} y={top - 3} width={gap * 5} height={3} fill="#e5e7eb" />
      ) : (
        <text x={2} y={top + rowH * 0.6} fontSize={9} fill="#9ca3af">
          {base}
        </text>
      )}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`f${i}`} x1={left} x2={left + gap * 5} y1={top + i * rowH} y2={top + i * rowH} stroke="#9ca3af" strokeWidth={1} />
      ))}
      {Array.from({ length: 6 }).map((_, s) => (
        <line key={`s${s}`} x1={x(s)} x2={x(s)} y1={top} y2={top + 5 * rowH} stroke="#d1d5db" strokeWidth={1} />
      ))}
      {/* pestana */}
      {/* no banco do MusicPages, fromString/toString sao indices de frets (0 = 6a corda) */}
      {shape.barre && (
        <rect
          x={x(shape.barre.fromString) - 5}
          y={y(shape.barre.fret) - 5}
          width={x(shape.barre.toString) - x(shape.barre.fromString) + 10}
          height={10}
          rx={5}
          fill="#d1d5db"
        />
      )}
      {shape.frets.map((f, s) => {
        if (f === -1)
          return (
            <text key={s} x={x(s)} y={top - 7} textAnchor="middle" fontSize={10} fill="#9ca3af">
              x
            </text>
          );
        if (f === 0)
          return <circle key={s} cx={x(s)} cy={top - 10} r={3.5} fill="none" stroke="#d1d5db" strokeWidth={1.2} />;
        return (
          <g key={s}>
            <circle cx={x(s)} cy={y(f)} r={6} fill="#f8fafc" stroke="#111827" />
            {shape.fingers[s] > 0 && (
              <text x={x(s)} y={y(f) + 3} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#111827">
                {shape.fingers[s]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ChordCard({ chord }: { chord: HarmonicChord }) {
  const key = shapeKey(chord);
  const shapes = key ? CHORD_SHAPES[key] ?? [] : [];
  const [idx, setIdx] = useState(0);
  const shape = shapes[idx % Math.max(1, shapes.length)];

  const play = () => {
    if (!shape) return;
    playChordMidi(shape.frets.flatMap((f, s) => (f < 0 ? [] : [OPEN_MIDI[s] + f])));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col items-center min-w-[118px]">
      <span className="text-xs text-slate-400">{chord.grau}</span>
      <span className="font-bold text-white mb-1">{chord.name}</span>
      {shape ? (
        <button onClick={play} title="Tocar acorde" className="rounded hover:bg-slate-700 p-1">
          <MiniChordDiagram shape={shape} />
        </button>
      ) : (
        <div className="h-[108px] flex items-center text-center text-xs text-slate-500 px-1">Sem diagrama para esta qualidade</div>
      )}
      {shapes.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <button onClick={() => setIdx((i) => (i + shapes.length - 1) % shapes.length)} className="px-1.5 hover:text-white" aria-label="Posição anterior">
            ‹
          </button>
          {idx + 1}/{shapes.length}
          <button onClick={() => setIdx((i) => (i + 1) % shapes.length)} className="px-1.5 hover:text-white" aria-label="Próxima posição">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export function ChordFieldViewer({ field }: { field: HarmonicChord[] | null }) {
  if (!field) {
    return <p className="text-slate-400">Esta escala não tem campo harmônico, então não há acordes para mostrar.</p>;
  }
  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {field.map((ch) => (
          <ChordCard key={ch.grau + ch.name} chord={ch} />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Diagramas para guitarra em afinação padrão. Clique no diagrama para ouvir.</p>
    </div>
  );
}
