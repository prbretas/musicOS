'use client';

/**
 * ChordDiagram — diagrama de cifra no estilo padrão (SVG)
 * 
 * Cordas na horizontal, trastes na vertical.
 * Bolinhas mostram a nota (ex: G, B, D), não o número do traste.
 * X = corda muda, O = corda solta.
 */

import type { Chord } from '@/types/music';

interface ChordDiagramProps {
  chord: Chord;
  instrument?: 'guitar' | 'ukulele';
  size?: 'sm' | 'md' | 'lg';
  showFingering?: boolean;
  onFretClick?: (string: number, fret: number) => void;
}

// Afinação das cordas (grave → aguda)
const TUNING = {
  guitar:  ['E', 'A', 'D', 'G', 'B', 'E'] as const,
  ukulele: ['G', 'C', 'E', 'A']            as const,
};

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;

function noteAtFret(openNote: string, fret: number): string {
  const idx = NOTES.indexOf(openNote as never);
  if (idx === -1) return '?';
  return NOTES[(idx + fret) % 12];
}

export function ChordDiagram({
  chord,
  instrument = 'guitar',
  size = 'md',
  showFingering = true,
  onFretClick,
}: ChordDiagramProps) {
  const tuning = TUNING[instrument];
  const nStrings = tuning.length;

  // posições: 1 valor por corda, da GRAVE (corda 6/1) para AGUDA
  // -1 = muda, 0 = solta, 1+ = traste
  const positions = chord.positions ?? Array(nStrings).fill(0);

  // Calcular janela de trastes a mostrar (mínimo traste não-zero até máximo)
  const fretted = positions.filter(p => p > 0);
  const minFret = fretted.length ? Math.min(...fretted) : 1;
  const maxFret = fretted.length ? Math.max(...fretted) : 1;
  const windowSize = Math.max(4, maxFret - minFret + 1);
  const startFret  = fretted.length ? minFret : 1;
  const showNut    = startFret === 1; // mostra a pestana/capotraste quando começa no traste 1

  // --- dimensões SVG ---
  const W_SIZE = { sm: 120, md: 160, lg: 200 };
  const W = W_SIZE[size];
  const padLeft  = 28;   // espaço para rótulo de corda
  const padRight = 16;
  const padTop   = 36;   // espaço para O/X e número de capotraste
  const padBot   = showFingering ? 28 : 12;

  const drawW  = W - padLeft - padRight;
  const drawH  = W * 1.1;
  const H      = drawH + padTop + padBot;

  const colStep = drawW / (nStrings - 1);  // espaço entre cordas
  const rowStep = (drawH - 10) / windowSize; // espaço entre trastes

  const nutY   = padTop + 5;
  const fret1Y = nutY + rowStep;

  // posição X de cada corda (esquerda = grave)
  const stringX = (s: number) => padLeft + s * colStep;
  // posição Y do meio de um traste (traste relativo à janela)
  const fretMidY = (f: number) => nutY + (f - startFret + 0.5) * rowStep;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block' }}
    >
      {/* ── Nome do acorde ── */}
      <text
        x={W / 2} y={14}
        textAnchor="middle"
        fontSize={16} fontWeight="bold" fill="#ffffff"
      >
        {chord.name}
      </text>
      <text
        x={W / 2} y={27}
        textAnchor="middle"
        fontSize={10} fill="#94a3b8"
      >
        {instrument === 'guitar' ? 'Guitarra' : 'Ukulele'}
      </text>

      {/* ── Número do capotraste (quando não começa no 1) ── */}
      {!showNut && (
        <text
          x={padLeft - 4} y={nutY + rowStep * 0.5 + 4}
          textAnchor="end"
          fontSize={9} fill="#94a3b8"
        >
          {startFret}fr
        </text>
      )}

      {/* ── Pestana (nut) ── */}
      {showNut && (
        <rect
          x={padLeft - 2} y={nutY}
          width={drawW + 4} height={5}
          rx={2} fill="#e2e8f0"
        />
      )}

      {/* ── Linhas horizontais dos trastes ── */}
      {Array.from({ length: windowSize + 1 }).map((_, i) => (
        <line
          key={i}
          x1={padLeft} y1={nutY + i * rowStep + (showNut ? 5 : 0)}
          x2={padLeft + drawW} y2={nutY + i * rowStep + (showNut ? 5 : 0)}
          stroke="#334155" strokeWidth={1}
        />
      ))}

      {/* ── Linhas verticais das cordas ── */}
      {Array.from({ length: nStrings }).map((_, s) => (
        <line
          key={s}
          x1={stringX(s)} y1={nutY + (showNut ? 5 : 0)}
          x2={stringX(s)} y2={nutY + windowSize * rowStep + (showNut ? 5 : 0)}
          stroke="#475569" strokeWidth={1.5}
        />
      ))}

      {/* ── Rótulos das cordas (embaixo) ── */}
      {tuning.map((note, s) => (
        <text
          key={s}
          x={stringX(s)} y={H - (showFingering ? 14 : 2)}
          textAnchor="middle"
          fontSize={9} fill="#64748b"
        >
          {note}
        </text>
      ))}

      {/* ── O / X em cima de cada corda ── */}
      {positions.map((pos, s) => {
        const x = stringX(s);
        const y = padTop - 6;
        if (pos === -1) {
          // X = corda muda
          return (
            <text key={s} x={x} y={y} textAnchor="middle"
              fontSize={12} fill="#ef4444" fontWeight="bold">×</text>
          );
        }
        if (pos === 0) {
          // O = corda solta
          return (
            <circle key={s} cx={x} cy={y - 3} r={5}
              fill="none" stroke="#94a3b8" strokeWidth={1.5} />
          );
        }
        return null;
      })}

      {/* ── Bolinhas dos trastes ── */}
      {positions.map((pos, s) => {
        if (pos <= 0) return null;
        const x  = stringX(s);
        const y  = fretMidY(pos) + (showNut ? 5 : 0);
        const note = noteAtFret(tuning[s], pos);
        const isRoot = note === chord.root;
        const inChord = chord.notes.includes(note as never);

        const fill   = isRoot ? '#ef4444' : inChord ? '#7c3aed' : '#475569';
        const radius = size === 'sm' ? 8 : size === 'lg' ? 12 : 10;

        return (
          <g key={s}
            onClick={() => onFretClick?.(s, pos)}
            style={{ cursor: onFretClick ? 'pointer' : 'default' }}
          >
            <circle cx={x} cy={y} r={radius} fill={fill} />
            <text
              x={x} y={y + 4}
              textAnchor="middle"
              fontSize={size === 'sm' ? 7 : 9}
              fontWeight="bold"
              fill="#ffffff"
            >
              {note}
            </text>
          </g>
        );
      })}

      {/* ── Dedilhado embaixo ── */}
      {showFingering && chord.fingering && (
        <>
          {chord.fingering.map((finger, s) => (
            finger > 0 ? (
              <text
                key={s}
                x={stringX(s)} y={H - 2}
                textAnchor="middle"
                fontSize={9} fill="#64748b"
              >
                {finger}
              </text>
            ) : null
          ))}
        </>
      )}
    </svg>
  );
}

export default ChordDiagram;
