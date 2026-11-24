'use client';

/**
 * Tablatura em SVG: uma linha por corda (a mais aguda em cima, como na tab
 * tradicional), números nas casas, barras de compasso e a nota atual em destaque.
 */

import { pitchClassOf } from '@/lib/music/tunings';
import type { TabNote } from '@/lib/music/tablature';
import type { PracticeNote } from '@/lib/music/practice';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function TabView({
  notes,
  positions,
  tuning,
  meter,
  pickup = 0,
  shift = 0,
  current,
  showNames,
}: {
  notes: PracticeNote[];
  positions: (TabNote | null)[];
  tuning: string[];
  meter: number;
  pickup?: number;
  shift?: number;
  current: number | null;
  showNames: boolean;
}) {
  const n = tuning.length;
  const barsPerRow = meter <= 2 ? 4 : 2;
  const beatsPerRow = meter * barsPerRow;
  // notas rápidas (semicolcheias, tercinas) ganham mais espaço por tempo
  const minDur = notes.reduce((m, x) => (x.d > 0 ? Math.min(m, x.d) : m), 1);
  const BEAT_W = Math.max(56, Math.ceil(22 / minDur));
  const LEFT = 30;
  const LINE_H = 16;
  const ROW_TOP = 14;
  const rowHeight = ROW_TOP + (n - 1) * LINE_H + (showNames ? 34 : 22);
  const W = LEFT + beatsPerRow * BEAT_W + 12;

  // posição de cada nota em tempos, contando a anacruse antes do 1º compasso
  const starts: number[] = [];
  notes.reduce((t, note) => {
    // arredonda para não acumular erro de ponto flutuante nas tercinas
    starts.push(Math.round(t * 1e6) / 1e6);
    return t + note.d;
  }, 0);
  const total = notes.reduce((t, x) => t + x.d, 0);
  // linha do tempo: a anacruse ocupa o fim de um compasso "vazio"
  const offset = pickup ? meter - pickup : 0;
  const rows = Math.max(1, Math.ceil((total + offset) / beatsPerRow));

  // linha de cada corda: a mais aguda em cima
  const lineOf = (s: number) => n - 1 - s;

  return (
    <div className="overflow-x-auto rounded-xl bg-ink-900 border border-ink-600 p-3">
      <svg width={W} height={rows * rowHeight} viewBox={`0 0 ${W} ${rows * rowHeight}`} role="img" aria-label="Tablatura">
        {Array.from({ length: rows }).map((_, r) => {
          const top = r * rowHeight + ROW_TOP;
          return (
            <g key={r}>
              {tuning.map((p, s) => (
                <g key={s}>
                  <text x={10} y={top + lineOf(s) * LINE_H + 4} fontSize={10} fill="#64748b" textAnchor="middle">
                    {pitchClassOf(p).replace('#', '♯')}
                  </text>
                  <line x1={LEFT} x2={W - 12} y1={top + lineOf(s) * LINE_H} y2={top + lineOf(s) * LINE_H} stroke="#334155" />
                </g>
              ))}
              {Array.from({ length: barsPerRow + 1 }).map((__, b) => (
                <line
                  key={b}
                  x1={LEFT + b * meter * BEAT_W}
                  x2={LEFT + b * meter * BEAT_W}
                  y1={top}
                  y2={top + (n - 1) * LINE_H}
                  stroke={b === 0 || b === barsPerRow ? '#475569' : '#334155'}
                  strokeWidth={b === 0 ? 2 : 1}
                />
              ))}
            </g>
          );
        })}

        {notes.map((note, i) => {
          const pos = positions[i];
          const t = starts[i] + offset;
          const r = Math.floor(t / beatsPerRow);
          const x = LEFT + (t - r * beatsPerRow) * BEAT_W + 14;
          const top = r * rowHeight + ROW_TOP;
          const active = current === i;
          if (!pos || note.m === null) {
            return (
              <text key={i} x={x} y={top + ((n - 1) * LINE_H) / 2 + 4} fontSize={11} fill="#475569" textAnchor="middle">
                𝄽
              </text>
            );
          }
          const y = top + lineOf(pos.s) * LINE_H;
          const label = String(pos.f);
          return (
            <g key={i}>
              <rect
                x={x - (label.length > 1 ? 9 : 6)}
                y={y - 7}
                width={label.length > 1 ? 18 : 12}
                height={14}
                rx={3}
                fill={active ? '#6d5dfc' : '#0b0d12'}
              />
              <text x={x} y={y + 4} fontSize={12} fontWeight="bold" fill={active ? '#ffffff' : '#e2e8f0'} textAnchor="middle">
                {label}
              </text>
              {showNames && (
                <text x={x} y={top + (n - 1) * LINE_H + 20} fontSize={9} fill={active ? '#a99dff' : '#64748b'} textAnchor="middle">
                  {NAMES[((note.m + shift) % 12 + 12) % 12]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
