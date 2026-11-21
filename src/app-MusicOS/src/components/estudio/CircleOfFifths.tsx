'use client';

/**
 * Ciclo de Quintas - mesmo desenho do MusicPages (script-circle-of-fifths.js
 * e style.css, tema escuro): anel externo com as tonalidades maiores, anel
 * interno com as relativas menores, zona enarmonica em roxo.
 * Clicar destaca o tom, mostra a armadura de clave e toca a tonica.
 */

import { useEffect, useState } from 'react';
import { playMidi } from '@/lib/audio/synth';

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#/Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m/Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
/** Classe de altura da tonica maior de cada posicao */
const MAJOR_PC = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

const SHARPS = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'];
const FLATS = ['Bb', 'Eb', 'Ab', 'Db', 'Gb'];
/** Armadura por posicao (igual a KEY_SIGNATURES do MusicPages; vale para a maior e a relativa menor) */
const SIGNATURES: { count: number; type: 'none' | 'sharps' | 'flats' }[] = [
  { count: 0, type: 'none' },
  { count: 1, type: 'sharps' },
  { count: 2, type: 'sharps' },
  { count: 3, type: 'sharps' },
  { count: 4, type: 'sharps' },
  { count: 5, type: 'sharps' },
  { count: 6, type: 'sharps' },
  { count: 5, type: 'flats' },
  { count: 4, type: 'flats' },
  { count: 3, type: 'flats' },
  { count: 2, type: 'flats' },
  { count: 1, type: 'flats' },
];

const SIZE = 450;
const C = SIZE / 2;
const R_OUT = 200;
const R_OUT_IN = 145;
const R_IN = 140;
const R_IN_IN = 90;

const COLORS = {
  major: { fill: '#1a3a5c', stroke: '#2d5a8a', hover: '#244b72', active: '#2563eb', activeStroke: '#4a9eff' },
  minor: { fill: '#3d2e1a', stroke: '#6b4c2a', hover: '#4d3a22', active: '#c45e00', activeStroke: '#ff9800' },
  enharmonic: { fill: '#2d1f3d', stroke: '#7b4a9e' },
};

const round = (n: number) => Math.round(n * 100) / 100;

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: round(C + r * Math.cos(a)), y: round(C + r * Math.sin(a)) };
}

function segment(rOuter: number, rInner: number, i: number) {
  const start = -90 + i * 30 - 15;
  const end = start + 30;
  const os = polar(rOuter, start);
  const oe = polar(rOuter, end);
  const ie = polar(rInner, end);
  const is = polar(rInner, start);
  return `M ${os.x} ${os.y} A ${rOuter} ${rOuter} 0 0 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${rInner} ${rInner} 0 0 0 ${is.x} ${is.y} Z`;
}

const isEnharmonic = (i: number) => i === 5 || i === 6 || i === 7;

type Selection = { index: number; major: boolean } | null;

export function CircleOfFifths({
  keyPc = null,
  minor = false,
  onApply,
}: {
  /** Tonica maior da escala atual da pagina (destacada ao carregar) */
  keyPc?: number | null;
  /** Se a escala atual e menor (destaca o anel interno) */
  minor?: boolean;
  /** Quando informado, mostra o botao para usar a tonalidade na pagina */
  onApply?: (rootPc: number, scaleKey: 'maior' | 'menor_natural') => void;
}) {
  const fromPage = (): Selection =>
    keyPc === null ? null : { index: MAJOR_PC.indexOf(keyPc), major: !minor };
  const [selected, setSelected] = useState<Selection>(fromPage);
  const [hover, setHover] = useState<string | null>(null);

  // Acompanha a escala escolhida no topo da pagina
  useEffect(() => {
    setSelected(fromPage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyPc, minor]);

  const click = (index: number, major: boolean) => {
    setSelected({ index, major });
    const tonic = major ? MAJOR_PC[index] : (MAJOR_PC[index] + 9) % 12;
    playMidi(60 + tonic);
  };

  const ring = (major: boolean) =>
    (major ? MAJOR_KEYS : MINOR_KEYS).map((name, i) => {
      const id = `${major ? 'M' : 'm'}${i}`;
      const active = selected?.index === i && selected.major === major;
      const palette = major ? COLORS.major : COLORS.minor;
      let fill = isEnharmonic(i) ? COLORS.enharmonic.fill : palette.fill;
      let stroke = isEnharmonic(i) ? COLORS.enharmonic.stroke : palette.stroke;
      if (hover === id && !active) fill = palette.hover;
      if (active) {
        fill = palette.active;
        stroke = palette.activeStroke;
      }
      const label = polar(major ? (R_OUT + R_OUT_IN) / 2 : (R_IN + R_IN_IN) / 2, -90 + i * 30);
      return (
        <g
          key={id}
          onClick={() => click(i, major)}
          onMouseEnter={() => setHover(id)}
          onMouseLeave={() => setHover(null)}
          style={{ cursor: 'pointer' }}
        >
          <path d={segment(major ? R_OUT : R_IN, major ? R_OUT_IN : R_IN_IN, i)} fill={fill} stroke={stroke} strokeWidth={1} />
          <text
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={major ? 13 : 10.5}
            fontWeight={major ? 'bold' : 'normal'}
            fill={active ? '#ffffff' : major ? '#e0e0e0' : '#b0b0b0'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {name}
          </text>
        </g>
      );
    });

  const info = selected && selected.index !== -1 ? SIGNATURES[selected.index] : null;
  const keyName = selected && selected.index !== -1 ? (selected.major ? MAJOR_KEYS : MINOR_KEYS)[selected.index] : null;
  const altered = info ? (info.type === 'sharps' ? SHARPS : FLATS).slice(0, info.count) : [];
  const typeLabel = !info ? '' : info.type === 'sharps' ? 'sustenido(s)' : info.type === 'flats' ? 'bemol(is)' : 'nenhuma alteração';

  return (
    <div className="mx-auto max-w-[520px] bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl p-5 text-center text-[#e0e0e0]">
      <svg width="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ maxWidth: SIZE }} role="img" aria-label="Ciclo de Quintas interativo">
        {ring(true)}
        {ring(false)}
        <circle cx={C} cy={C} r={R_IN_IN - 5} fill="#252525" stroke="#4a4a4a" strokeWidth={1.5} />
      </svg>

      <div className="mt-3 bg-[#2d2d2d] border border-[#4a4a4a] rounded-lg px-4 py-3 text-[15px]">
        {info && keyName ? (
          <>
            <p className="font-bold">
              {keyName.replace(/m$/, '').replace('m/', '/')} {selected!.major ? 'Maior' : 'Menor'}
            </p>
            <p>{info.count === 0 ? 'Sem acidentes' : `${info.count} ${typeLabel}`}</p>
            <p className="text-sm text-[#b0b0b0]">Notas alteradas: {altered.length ? altered.join(', ') : '—'}</p>
            {onApply && (
              <button
                onClick={() =>
                  onApply(
                    selected!.major ? MAJOR_PC[selected!.index] : (MAJOR_PC[selected!.index] + 9) % 12,
                    selected!.major ? 'maior' : 'menor_natural'
                  )
                }
                className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
              >
                Usar esta tonalidade na página
              </button>
            )}
          </>
        ) : (
          <p className="text-[#b0b0b0]">Clique em uma tonalidade para ver sua armadura de clave.</p>
        )}
      </div>

      <div className="mt-2 bg-[#2d1f3d] border border-[#7b4a9e] rounded-md px-3 py-2 text-sm text-[#ce93d8]">
        <span className="font-semibold">Enarmônicos:</span> F#/Gb · C#/Db · Cb/B
      </div>
    </div>
  );
}
