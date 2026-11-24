/**
 * Treino de escalas pelo CAGED: cada desenho da escala "mora" em volta de um
 * desenho de acorde. Na forma C da escala de Ré maior, por exemplo, está o
 * acorde de Ré tocado com o desenho do C aberto, duas casas acima.
 *
 * Violão/guitarra de 6 cordas na afinação padrão (E A D G B E).
 * Cordas: índice 0 = 6ª corda (Mi grave) … 5 = 1ª corda (Mi agudo).
 */

import { SHAPE_ORDER, type CagedShape } from './caged';

export type CagedQuality = 'major' | 'minor';

export const STANDARD_GUITAR = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const OPEN_PCS = [4, 9, 2, 7, 11, 4];
const SHAPE_PC: Record<CagedShape, number> = { C: 0, A: 9, G: 7, E: 4, D: 2 };

/**
 * Desenho de cada acorde aberto, em casas relativas à "pestana" k
 * (null = corda não tocada). Ex.: C maior aberto = x 3 2 0 1 0.
 */
const GRIPS: Record<CagedQuality, Record<CagedShape, (number | null)[]>> = {
  major: {
    C: [null, 3, 2, 0, 1, 0],
    A: [null, 0, 2, 2, 2, 0],
    G: [3, 2, 0, 0, 0, 3],
    E: [0, 2, 2, 1, 0, 0],
    D: [null, null, 0, 2, 3, 2],
  },
  minor: {
    C: [null, 3, 1, 0, 1, null],
    A: [null, 0, 2, 2, 1, 0],
    G: [3, 1, 0, 0, 3, 3],
    E: [0, 2, 2, 0, 0, 0],
    D: [null, null, 0, 2, 3, 1],
  },
};

/** Função de cada nota do desenho: 'R' tônica, '3' terça, '5' quinta */
export type ChordRole = 'R' | '3' | '5';

export interface GripNote {
  s: number;
  f: number;
  role: ChordRole;
}

export interface CagedPosition {
  shape: CagedShape;
  /** Casa onde fica a "pestana" do desenho */
  k: number;
  /** Região da escala em volta do acorde */
  window: [number, number];
  grip: GripNote[];
}

const mod12 = (n: number) => ((n % 12) + 12) % 12;

/** Casa da "pestana" do desenho `shape` para o acorde de tônica `keyPc` (0–11). */
export function shapeOffset(keyPc: number, shape: CagedShape): number {
  return mod12(keyPc - SHAPE_PC[shape]);
}

/**
 * Posição de um desenho no braço. Usa a ocorrência mais baixa que caiba
 * inteira até `maxFret` (a 12 casas acima, se a de baixo não couber).
 */
export function cagedPosition(keyPc: number, quality: CagedQuality, shape: CagedShape, maxFret = 15): CagedPosition {
  let k = shapeOffset(keyPc, shape);
  const template = GRIPS[quality][shape];
  const top = Math.max(...template.filter((x): x is number => x !== null));
  if (k + top > maxFret) k -= 12; // não acontece com maxFret ≥ 14, mas por segurança
  const third = quality === 'major' ? 4 : 3;
  const grip: GripNote[] = [];
  template.forEach((rel, s) => {
    if (rel === null) return;
    const f = k + rel;
    const iv = mod12(OPEN_PCS[s] + f - keyPc);
    const role: ChordRole = iv === 0 ? 'R' : iv === third ? '3' : '5';
    grip.push({ s, f, role });
  });
  return { shape, k, window: [Math.max(0, k - 1), k + 3], grip };
}

/** As 5 posições subindo o braço, ordenadas pela casa. */
export function allCagedPositions(keyPc: number, quality: CagedQuality, maxFret = 15): CagedPosition[] {
  return SHAPE_ORDER.map((s) => cagedPosition(keyPc, quality, s, maxFret)).sort((a, b) => a.k - b.k);
}

/** Notas que soam no desenho (MIDI), da grave para a aguda */
export function gripMidis(pos: CagedPosition): number[] {
  const open = [40, 45, 50, 55, 59, 64];
  return pos.grip.map((g) => open[g.s] + g.f);
}

/** Progressões para improvisar (graus da escala maior/menor em semitons + qualidade) */
export interface BackingChord {
  /** Semitons acima da tônica */
  degree: number;
  quality: CagedQuality;
  label: string;
}

export const BACKING_PROGRESSIONS: Record<CagedQuality, { id: string; label: string; chords: BackingChord[] }[]> = {
  major: [
    {
      id: 'I-IV-V-I',
      label: 'I – IV – V – I',
      chords: [
        { degree: 0, quality: 'major', label: 'I' },
        { degree: 5, quality: 'major', label: 'IV' },
        { degree: 7, quality: 'major', label: 'V' },
        { degree: 0, quality: 'major', label: 'I' },
      ],
    },
    {
      id: 'I-vi-IV-V',
      label: 'I – vi – IV – V',
      chords: [
        { degree: 0, quality: 'major', label: 'I' },
        { degree: 9, quality: 'minor', label: 'vi' },
        { degree: 5, quality: 'major', label: 'IV' },
        { degree: 7, quality: 'major', label: 'V' },
      ],
    },
    {
      id: 'I',
      label: 'Só o I (pedal)',
      chords: [{ degree: 0, quality: 'major', label: 'I' }],
    },
  ],
  minor: [
    {
      id: 'i-iv-v',
      label: 'i – iv – v – i',
      chords: [
        { degree: 0, quality: 'minor', label: 'i' },
        { degree: 5, quality: 'minor', label: 'iv' },
        { degree: 7, quality: 'minor', label: 'v' },
        { degree: 0, quality: 'minor', label: 'i' },
      ],
    },
    {
      id: 'i-VI-VII',
      label: 'i – VI – VII – i',
      chords: [
        { degree: 0, quality: 'minor', label: 'i' },
        { degree: 8, quality: 'major', label: 'VI' },
        { degree: 10, quality: 'major', label: 'VII' },
        { degree: 0, quality: 'minor', label: 'i' },
      ],
    },
    {
      id: 'i',
      label: 'Só o i (pedal)',
      chords: [{ degree: 0, quality: 'minor', label: 'i' }],
    },
  ],
};

/** Notas (MIDI) de um acorde de acompanhamento em posição fechada, perto de Dó 3 */
export function backingVoicing(keyPc: number, chord: BackingChord): { bass: number; triad: number[] } {
  const rootPc = mod12(keyPc + chord.degree);
  const fromE = mod12(rootPc - 4);
  const bass = 40 + fromE; // E2 … D#3
  const root = 52 + fromE; // E3 … D#4
  const third = chord.quality === 'major' ? 4 : 3;
  return { bass, triad: [root, root + third, root + 7] };
}
