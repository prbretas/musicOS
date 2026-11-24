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
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Círculo de escalas" className="overflow-visible">
        <defs>
          <linearGradient id="scale-poly" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a99dff" stopOpacity={0.45} />
            <stop offset="1" stopColor="#5a48e6" stopOpacity={0.12} />
          </linearGradient>
          <radialGradient id="scale-node" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#a99dff" />
            <stop offset="1" stopColor="#5a48e6" />
          </radialGradient>
          <radialGradient id="scale-root" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffe3a3" />
            <stop offset="1" stopColor="#e0a024" />
          </radialGradient>
          <filter id="scale-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={1} />
        <circle cx={C} cy={C} r={R - 40} fill="none" stroke="rgba(255,255,255,.04)" strokeDasharray="2 6" />
        <polygon
          points={poly(scale.sharpNotes.map(pc))}
          fill="url(#scale-poly)"
          stroke="#8a79ff"
          strokeWidth={2}
          strokeLinejoin="round"
          filter="url(#scale-glow)"
          style={{ transition: 'all .5s cubic-bezier(.2,.8,.2,1)' }}
        />
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
                fill={isRoot ? 'url(#scale-root)' : a ? 'url(#scale-node)' : '#181c26'}
                stroke={b ? '#fb923c' : isRoot ? '#ffe3a3' : a ? '#c9c2ff' : 'rgba(255,255,255,.12)'}
                strokeWidth={b ? 3 : 1.5}
                filter={isRoot ? 'url(#scale-glow)' : undefined}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill={isRoot ? '#1a1206' : a ? '#ffffff' : '#64748b'}
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
          className="py-1.5"
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
