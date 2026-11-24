'use client';

/**
 * Circulo de Escalas - as 12 notas em volta do circulo e a escala desenhada
 * como poligono. "Comparar" sobrepoe uma segunda escala tracejada.
 * Inspirado em src/musicpages/scripts/script-scale-circle.js.
 */

import { useState } from 'react';
import { SCALES, buildScale, pc, noteNameIn } from '@/lib/music/escalas';

const SIZE = 300;
const C = SIZE / 2;
const R = 112;

// Arredonda para servidor e navegador gerarem o mesmo SVG (evita erro de hidratacao)
const round = (n: number) => Math.round(n * 100) / 100;

function point(i: number, radius = R) {
  const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
  return { x: round(C + radius * Math.cos(a)), y: round(C + radius * Math.sin(a)) };
}

export function ScaleCircle({ rootPc, scaleKey }: { rootPc: number; scaleKey: string }) {
  const [compareKey, setCompareKey] = useState<string | null>(null);

  const scale = buildScale(rootPc, scaleKey);
  const inScale = new Set(scale.sharpNotes.map(pc));
  const compare = compareKey ? buildScale(rootPc, compareKey) : null;
  const inCompare = new Set(compare?.sharpNotes.map(pc) ?? []);

  // Circulo comeca em C no topo
  const poly = (pcs: number[]) => pcs.map((p) => point(p)).map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Círculo de escalas">
        <polygon points={poly(scale.sharpNotes.map(pc))} fill="#3b82f6" fillOpacity={0.18} stroke="#60a5fa" strokeWidth={2} />
        {compare && (
          <polygon
            points={poly(compare.sharpNotes.map(pc))}
            fill="#f97316"
            fillOpacity={0.12}
            stroke="#fb923c"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}
        {Array.from({ length: 12 }).map((_, p) => {
          const { x, y } = point(p);
          const a = inScale.has(p);
          const b = inCompare.has(p);
          const isRoot = p === rootPc;
          return (
            <g key={p}>
              <circle
                cx={x}
                cy={y}
                r={17}
                fill={isRoot ? '#ef4444' : a ? '#3b82f6' : '#e5e7eb'}
                stroke={b ? '#fb923c' : '#6b7280'}
                strokeWidth={b ? 3 : 1.5}
                fillOpacity={a || isRoot ? 1 : 0.85}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill={a || isRoot ? '#ffffff' : '#9ca3af'}
              >
                {noteNameIn(scale, p)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <label className="text-slate-400" htmlFor="compareScale">
          Comparar com:
        </label>
        <select
          id="compareScale"
          value={compareKey ?? ''}
          onChange={(e) => setCompareKey(e.target.value || null)}
          className="bg-ink-600 border border-ink-500 text-white rounded-lg px-2 py-1.5"
        >
          <option value="">— nenhuma —</option>
          {SCALES.filter((s) => s.key !== scaleKey).map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {compare && (
        <p className="text-xs text-slate-400 text-center max-w-xs">
          Em comum: {scale.sharpNotes.filter((n) => inCompare.has(pc(n))).length} notas. Só em{' '}
          {compare.def.label}:{' '}
          {compare.notes.filter((n) => !inScale.has(pc(n))).join(', ') || 'nenhuma'}.
        </p>
      )}
    </div>
  );
}
