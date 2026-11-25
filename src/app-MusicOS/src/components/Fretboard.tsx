'use client';

/**
 * Fretboard - braço do instrumento (SVG)
 *
 * Sem escala: mostra todas as notas.
 * Com escala: notas da escala coloridas por grau (tônica em vermelho),
 * demais notas esmaecidas. Com fretWindows, só as notas dentro das janelas
 * de casas ficam em destaque (usado para os desenhos CAGED).
 */

import { useState } from 'react';
import type { NoteName } from '@/types/music';

interface FretboardProps {
  instrument?: string;
  tuning?: string[];
  /** Casa onde cada corda começa (banjo: a 5ª corda começa na casa 5). Padrão: 0 */
  stringStartFret?: number[];
  highlightedNotes?: NoteName[];
  scale?: { root: NoteName; type: string; notes: NoteName[] };
  startFret?: number;
  endFret?: number;
  showIntervals?: boolean;
  /** Janelas [casaInicial, casaFinal] onde as notas da escala ficam em destaque */
  fretWindows?: Array<[number, number]>;
  /** Subconjunto da escala que fica em destaque (ex.: só a pentatônica). As demais notas da escala ficam apagadas. */
  focusNotes?: NoteName[];
  /** Notas de acorde destacadas com anel branco. As outras notas ativas ficam mais fracas. */
  chordNotes?: NoteName[];
  /** Posições exatas de um desenho de acorde (corda, casa), destacadas com anel branco */
  grip?: Array<{ s: number; f: number; role?: string }>;
  /** Mostrar só o desenho do acorde (esconde o restante da escala) */
  gripOnly?: boolean;
  onNoteClick?: (note: NoteName, fret: number, string: number) => void;
}

const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const UKULELE_TUNING = ['G4', 'C4', 'E4', 'A4'];
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MARKERS = [3, 5, 7, 9, 12, 15];

/** Cor por grau da escala (índice 0 = tônica) */
export const DEGREE_FILL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7'];
const INTERVAL_NAMES = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

function pitchToNote(pitch: string): string {
  return pitch.replace(/\d+/, '');
}

function noteAt(open: string, fret: number): string {
  const idx = CHROMATIC.indexOf(open);
  return idx === -1 ? '?' : CHROMATIC[(idx + fret) % 12];
}

export function Fretboard({
  instrument = 'guitar',
  tuning,
  highlightedNotes = [],
  scale,
  startFret = 0,
  endFret = 12,
  showIntervals = false,
  fretWindows,
  focusNotes,
  chordNotes,
  grip,
  gripOnly = false,
  stringStartFret,
  onNoteClick,
}: FretboardProps) {
  const gripAt = (s: number, f: number) => grip?.find((g) => g.s === s && g.f === f);
  const [hovered, setHovered] = useState<string | null>(null);

  const strings = tuning ?? (instrument === 'guitar' ? GUITAR_TUNING : UKULELE_TUNING);
  const nStrings = strings.length;
  const nFrets = endFret - startFret + 1;

  const STRING_H = 44;
  const FRET_W = 56;
  // espaco a esquerda: nome da corda (x=12) + nota solta antes da pestana
  const PAD_LEFT = 62;
  const OPEN_X = PAD_LEFT - 22;
  const PAD_TOP = 24;
  // numeros das casas ficam abaixo das notas da ultima corda
  const PAD_BOT = 40;
  const PAD_RIGHT = 10;

  // A casa 0 (corda solta) nao ocupa uma casa no braco: fica antes da pestana.
  // Por isso as casas desenhadas comecam na 1 quando o braco comeca na 0.
  const firstCell = startFret === 0 ? 1 : startFret;
  const nCells = endFret - firstCell + 1;

  const W = PAD_LEFT + nCells * FRET_W + PAD_RIGHT;
  const H = PAD_TOP + (nStrings - 1) * STRING_H + PAD_BOT;

  const stringY = (s: number) => PAD_TOP + s * STRING_H;
  const midX = (f: number) => PAD_LEFT + (f - firstCell) * FRET_W + FRET_W / 2;

  const scaleNotes: string[] = scale?.notes ?? [];
  const hasScale = scaleNotes.length > 0;
  const hasHighlight = highlightedNotes.length > 0;

  const inWindow = (fret: number) =>
    !fretWindows || fretWindows.some(([lo, hi]) => fret >= lo && fret <= hi);

  // Guitarra: em 6 cordas a mais grave fica embaixo (como no instrumento)
  const rowOf = (s: number) => nStrings - 1 - s;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg data-testid="fretboard" width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', minWidth: W }}>
        {/* Marcadores de casa */}
        {MARKERS.filter((m) => m >= startFret && m <= endFret).map((m) => {
          const cx = midX(m);
          const cy = PAD_TOP + ((nStrings - 1) / 2) * STRING_H;
          return m === 12 ? (
            <g key={m}>
              <circle cx={cx} cy={cy - 22} r={5} fill="#1e293b" />
              <circle cx={cx} cy={cy + 22} r={5} fill="#1e293b" />
            </g>
          ) : (
            <circle key={m} cx={cx} cy={cy} r={5} fill="#1e293b" />
          );
        })}

        {/* Pestana */}
        {startFret === 0 && (
          <rect x={PAD_LEFT - 2} y={PAD_TOP} width={5} height={(nStrings - 1) * STRING_H} fill="#e2e8f0" />
        )}

        {/* Trastes */}
        {Array.from({ length: nCells + 1 }).map((_, i) => (
          <line
            key={i}
            x1={PAD_LEFT + i * FRET_W}
            y1={PAD_TOP}
            x2={PAD_LEFT + i * FRET_W}
            y2={PAD_TOP + (nStrings - 1) * STRING_H}
            stroke="#334155"
            strokeWidth={1}
          />
        ))}

        {/* Cordas */}
        {strings.map((_, s) => (
          <line
            key={s}
            x1={(stringStartFret?.[s] ?? 0) > 0 ? PAD_LEFT + ((stringStartFret?.[s] ?? 0) - firstCell) * FRET_W : PAD_LEFT}
            y1={stringY(rowOf(s))}
            x2={PAD_LEFT + nCells * FRET_W}
            y2={stringY(rowOf(s))}
            stroke="#64748b"
            strokeWidth={1 + (nStrings - 1 - s) * 0.4}
          />
        ))}

        {/* Rótulos das cordas */}
        {strings.map((pitch, s) => (
          <text
            key={s}
            x={10}
            y={stringY(rowOf(s)) + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight="bold"
            fill="#94a3b8"
          >
            {pitchToNote(pitch)}
          </text>
        ))}

        {/* Números das casas */}
        {Array.from({ length: nFrets }).map((_, i) => {
          const fret = startFret + i;
          return fret === 0 ? null : (
            <text key={fret} x={midX(fret)} y={H - 8} textAnchor="middle" fontSize={11} fill="#94a3b8">
              {fret}
            </text>
          );
        })}

        {/* Notas */}
        {strings.map((pitch, s) => {
          const open = pitchToNote(pitch);
          const start = stringStartFret?.[s] ?? 0;
          return Array.from({ length: nFrets }).map((_, i) => {
            const fret = startFret + i;
            // corda curta: as casas antes do início dela não existem
            if (start > 0 && fret > 0 && fret <= start) return null;
            const note = noteAt(open, fret === 0 ? 0 : fret - start);
            const key = `${s}-${fret}`;
            const isHov = hovered === key;

            const cx = fret === 0 ? (start > 0 ? midX(start) : OPEN_X) : midX(fret);
            const cy = stringY(rowOf(s));

            const degree = scaleNotes.indexOf(note);
            const inScale = hasScale && degree !== -1;
            const inFocus = !focusNotes || focusNotes.includes(note as NoteName);
            const gripHere = gripAt(s, fret);
            const active = inScale && inFocus && inWindow(fret) && (!gripOnly || !!gripHere);
            const marked = !hasScale && hasHighlight && highlightedNotes.includes(note as NoteName);
            const hasChord = (!!chordNotes && chordNotes.length > 0) || (!!grip && grip.length > 0);
            const isChordTone = grip ? !!gripHere : hasChord && chordNotes!.includes(note as NoteName);

            let fill = '#1e293b';
            let stroke = '#334155';
            let strokeW = 1.5;
            let textFill = '#94a3b8';
            let r = 13;
            let opacity = 1;
            let label = note;

            if (active) {
              fill = DEGREE_FILL[degree % DEGREE_FILL.length];
              stroke = degree === 0 ? '#fecaca' : '#ffffff55';
              textFill = '#ffffff';
              r = degree === 0 ? 15 : 13;
              if (hasChord) {
                if (isChordTone) {
                  r = 15;
                  stroke = '#ffffff';
                  strokeW = 3;
                } else {
                  r = 11;
                  opacity = 0.45;
                }
              }
              if (showIntervals && scale) {
                label = INTERVAL_NAMES[(CHROMATIC.indexOf(note) - CHROMATIC.indexOf(scale.root) + 12) % 12];
              }
            } else if (marked) {
              fill = '#7c3aed';
              stroke = '#a78bfa';
              textFill = '#ffffff';
            } else if (hasScale) {
              // fora da escala ou fora da janela CAGED: esmaecido
              opacity = inScale ? 0.35 : 0.18;
              r = 10;
            }

            return (
              <g
                key={key}
                opacity={opacity}
                onClick={() => onNoteClick?.(note as NoteName, fret, s)}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={cx} cy={cy} r={isHov ? r + 2 : r} fill={fill} stroke={stroke} strokeWidth={strokeW} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize={r > 11 ? 10 : 8} fontWeight="bold" fill={textFill}>
                  {label}
                </text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}

export default Fretboard;
