/**
 * CAGED - desenhos do braço baseados nos acordes C, A, G, E, D,
 * mais as formas F e B, que completam as 7 posições da escala maior.
 *
 * Cada forma é o acorde "movido" com pestana. A casa da pestana (k) é
 * a distância em semitons entre a nota da forma e a tônica da tonalidade.
 * A região de cada desenho cobre da casa k-1 até k+3.
 */

import type { NoteName } from './theory';

const CHROMATIC: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Ordem tradicional do CAGED */
export const CAGED_ORDER = ['C', 'A', 'G', 'E', 'D'] as const;

/** As 7 formas na ordem em que aparecem subindo o braço (C, B, A, G, F, E, D) */
export const SHAPE_ORDER = ['C', 'B', 'A', 'G', 'F', 'E', 'D'] as const;
export type CagedShape = (typeof SHAPE_ORDER)[number];

export type FretWindow = [number, number];

/** Semitons de cada escala até a tônica do seu "maior pai" (a tonalidade dos desenhos). */
const PARENT_MAJOR_OFFSET: Record<string, number> = {
  major: 0,
  'major-pentatonic': 0,
  ionian: 0,
  dorian: 10,
  phrygian: 8,
  lydian: 7,
  mixolydian: 5,
  aeolian: 3,
  locrian: 1,
  minor: 3,
  'harmonic-minor': 3,
  'melodic-minor': 3,
  'minor-pentatonic': 3,
  blues: 3,
  // chaves do catalogo em portugues (lib/music/escalas.ts)
  maior: 0,
  jonico: 0,
  pentatonica_maior: 0,
  blues_maior: 0,
  dorico: 10,
  frigio: 8,
  lidio: 7,
  mixolidio: 5,
  eolio: 3,
  locrio: 1,
  menor_natural: 3,
  menor_harmonica: 3,
  menor_melodica: 3,
  pentatonica_menor: 3,
  blues_menor: 3,
};

/** Se a escala e derivada da escala maior (so essas tem desenhos CAGED). */
export function hasCagedShapes(scaleType: string): boolean {
  return scaleType in PARENT_MAJOR_OFFSET;
}

const idx = (n: NoteName) => CHROMATIC.indexOf(n);
const intervalOf = (root: NoteName, n: NoteName) => (idx(n) - idx(root) + 12) % 12;
const transpose = (root: NoteName, semis: number) => CHROMATIC[(idx(root) + semis) % 12];

/**
 * Escalas menores usam as formas de acordes menores (Em, Dm, Cm, Am, Gm)
 * na propria tonica: em A menor, a forma Em fica na casa 5 (box 1 da pentatonica).
 * As regioes sao as mesmas da relativa maior; muda so o nome da forma.
 */
const MINOR_FAMILY = new Set([
  'minor', 'harmonic-minor', 'melodic-minor', 'aeolian', 'minor-pentatonic', 'blues',
  'menor_natural', 'menor_harmonica', 'menor_melodica', 'eolio', 'pentatonica_menor', 'blues_menor',
]);

export function isMinorCaged(scaleType: string): boolean {
  return MINOR_FAMILY.has(scaleType);
}

/** Tonica de referencia dos desenhos: a propria tonica (menores) ou a maior relativa (modos). */
export function getCagedKey(root: NoteName, scaleType: string): NoteName {
  if (isMinorCaged(scaleType)) return root;
  const offset = PARENT_MAJOR_OFFSET[scaleType] ?? 0;
  return transpose(root, offset);
}

/** Janelas de casas (início, fim) de cada forma dentro de 0..maxFret. */
export function getCagedWindows(
  root: NoteName,
  scaleType: string,
  maxFret: number
): Record<CagedShape, FretWindow[]> {
  const key = idx(getCagedKey(root, scaleType));
  const result = {} as Record<CagedShape, FretWindow[]>;

  for (const shape of SHAPE_ORDER) {
    const k = (key - idx(shape as NoteName) + 12) % 12;
    const windows: FretWindow[] = [];

    for (const base of [k - 12, k, k + 12]) {
      const lo = Math.max(0, base - 1);
      const hi = base + 3;
      if (hi >= 0 && lo <= maxFret) windows.push([lo, Math.min(hi, maxFret)]);
    }

    result[shape] = windows;
  }

  return result;
}

/**
 * Notas da pentatônica contida numa escala de 7 notas.
 * Com terça maior: 1 2 3 5 6. Com terça menor: 1 b3 4 5 b7.
 * Retorna null se a escala não tem 7 notas (já é pentatônica ou blues).
 */
export function getPentatonicNotes(root: NoteName, scaleNotes: NoteName[]): NoteName[] | null {
  // escalas de 7 notas com quinta justa (o lócrio nao tem pentatônica)
  if (scaleNotes.length === 7 && !scaleNotes.map((n) => intervalOf(root, n)).includes(7)) return null;
  if (scaleNotes.length !== 7) return null;
  const ivs = scaleNotes.map((n) => intervalOf(root, n));
  const keep = ivs.includes(4) ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
  return scaleNotes.filter((_, i) => keep.includes(ivs[i]));
}

/** Tríade da tônica da escala (ex.: C maior → C E G, A menor → A C E). */
export function getTonicTriad(
  root: NoteName,
  scaleNotes: NoteName[]
): { name: string; notes: NoteName[] } | null {
  const ivs = scaleNotes.map((n) => intervalOf(root, n));
  const third = ivs.includes(4) ? 4 : ivs.includes(3) ? 3 : null;
  const fifth = ivs.includes(7) ? 7 : ivs.includes(6) ? 6 : ivs.includes(8) ? 8 : null;
  if (third === null || fifth === null) return null;

  let suffix = '';
  if (third === 3 && fifth === 7) suffix = 'm';
  else if (third === 3 && fifth === 6) suffix = '°';
  else if (third === 4 && fifth === 8) suffix = '+';

  return {
    name: root + suffix,
    notes: [root, transpose(root, third), transpose(root, fifth)],
  };
}
