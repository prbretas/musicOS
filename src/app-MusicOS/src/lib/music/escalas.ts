/**
 * Escalas e campo harmonico - portado de src/musicpages/scripts/script-escalas.js.
 *
 * Diferenca do original: escalas de 7 notas sao escritas por letra (cada letra
 * aparece uma vez), entao C menor sai C D Eb F G Ab Bb e G# menor harmonica sai
 * com F## em vez de quebrar. Escalas simetricas e exoticas usam sustenido ou
 * bemol conforme a tonalidade, como no MusicPages.
 */

// ------------------------------------------------------------------
// Notas
// ------------------------------------------------------------------

export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export type SharpNote = (typeof SHARP_NAMES)[number];

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Classe de altura (0-11) de qualquer nome: C, C#, Db, E#, Fb, F##, Bbb... */
export function pc(name: string): number {
  const letter = name[0].toUpperCase();
  let value = LETTER_PC[letter];
  for (const ch of name.slice(1)) {
    if (ch === '#') value += 1;
    else if (ch === 'b') value -= 1;
    else if (ch === 'x' || ch === 'X') value += 2;
  }
  return ((value % 12) + 12) % 12;
}

/** Nome em sustenido (usado pelo braco, CAGED e banco de acordes). */
export function toSharp(name: string): SharpNote {
  return SHARP_NAMES[pc(name)];
}

function accidental(diff: number): string {
  return ['bb', 'b', '', '#', '##'][diff + 2] ?? '';
}

/** Tonalidades maiores escritas com bemol (indice da tonica). */
const FLAT_MAJOR_KEYS = new Set([1, 3, 5, 8, 10]);
/** Nome preferido da tonica maior de cada indice. */
const MAJOR_KEY_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// ------------------------------------------------------------------
// Catalogo de escalas
// ------------------------------------------------------------------

export type ScaleGroup = 'diatonica' | 'modo' | 'outra' | 'exotica';

export interface ScaleDef {
  key: string;
  label: string;
  group: ScaleGroup;
  /** Intervalos entre notas consecutivas, em semitons */
  steps: number[];
  /** Semitons da tonica ate a tonica da maior relativa (escalas derivadas da maior) */
  parentOffset?: number;
}

export const SCALE_GROUP_LABELS: Record<ScaleGroup, string> = {
  diatonica: 'Escalas Diatônicas',
  modo: 'Modos Gregos',
  outra: 'Outras Escalas',
  exotica: 'Escalas Exóticas',
};

export const SCALES: ScaleDef[] = [
  { key: 'maior', label: 'Maior (Jônio)', group: 'diatonica', steps: [2, 2, 1, 2, 2, 2, 1], parentOffset: 0 },
  { key: 'menor_natural', label: 'Menor Natural (Eólio)', group: 'diatonica', steps: [2, 1, 2, 2, 1, 2, 2], parentOffset: 3 },
  { key: 'menor_harmonica', label: 'Menor Harmônica', group: 'diatonica', steps: [2, 1, 2, 2, 1, 3, 1], parentOffset: 3 },
  { key: 'menor_melodica', label: 'Menor Melódica', group: 'diatonica', steps: [2, 1, 2, 2, 2, 2, 1], parentOffset: 3 },
  { key: 'jonico', label: 'Jônio (I)', group: 'modo', steps: [2, 2, 1, 2, 2, 2, 1], parentOffset: 0 },
  { key: 'dorico', label: 'Dórico (II)', group: 'modo', steps: [2, 1, 2, 2, 2, 1, 2], parentOffset: 10 },
  { key: 'frigio', label: 'Frígio (III)', group: 'modo', steps: [1, 2, 2, 2, 1, 2, 2], parentOffset: 8 },
  { key: 'lidio', label: 'Lídio (IV)', group: 'modo', steps: [2, 2, 2, 1, 2, 2, 1], parentOffset: 7 },
  { key: 'mixolidio', label: 'Mixolídio (V)', group: 'modo', steps: [2, 2, 1, 2, 2, 1, 2], parentOffset: 5 },
  { key: 'eolio', label: 'Eólio (VI)', group: 'modo', steps: [2, 1, 2, 2, 1, 2, 2], parentOffset: 3 },
  { key: 'locrio', label: 'Lócrio (VII)', group: 'modo', steps: [1, 2, 2, 1, 2, 2, 2], parentOffset: 1 },
  { key: 'pentatonica_maior', label: 'Pentatônica Maior', group: 'outra', steps: [2, 2, 3, 2, 3], parentOffset: 0 },
  { key: 'pentatonica_menor', label: 'Pentatônica Menor', group: 'outra', steps: [3, 2, 2, 3, 2], parentOffset: 3 },
  { key: 'blues_maior', label: 'Blues Maior', group: 'outra', steps: [2, 1, 1, 3, 2, 3], parentOffset: 0 },
  { key: 'blues_menor', label: 'Blues Menor', group: 'outra', steps: [3, 2, 1, 1, 3, 2], parentOffset: 3 },
  { key: 'diminuta_tom_e_semitom', label: 'Diminuta (T-S)', group: 'outra', steps: [2, 1, 2, 1, 2, 1, 2, 1] },
  { key: 'diminuta_semitom_e_tom', label: 'Diminuta (S-T)', group: 'outra', steps: [1, 2, 1, 2, 1, 2, 1, 2] },
  { key: 'tons_inteiros', label: 'Tons Inteiros', group: 'outra', steps: [2, 2, 2, 2, 2, 2] },
  { key: 'cromatica', label: 'Cromática', group: 'outra', steps: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { key: 'egipcia', label: 'Egípcia (Suspended)', group: 'exotica', steps: [2, 3, 2, 3, 2] },
  { key: 'hirajoshi', label: 'Hirajoshi (Japonesa)', group: 'exotica', steps: [2, 1, 4, 1, 4] },
  { key: 'iwato', label: 'Iwato (Japonesa)', group: 'exotica', steps: [1, 4, 1, 4, 2] },
  { key: 'man_gong', label: 'Man Gong', group: 'exotica', steps: [3, 2, 3, 2, 2] },
  { key: 'ritusen', label: 'Ritusen (Celta)', group: 'exotica', steps: [2, 2, 3, 2, 3] },
];

const SCALE_BY_KEY = new Map(SCALES.map((s) => [s.key, s]));

export function getScaleDef(key: string): ScaleDef {
  return SCALE_BY_KEY.get(key) ?? SCALES[0];
}

/** Semitons acumulados a partir da tonica (sem a oitava). */
export function scaleOffsets(def: ScaleDef): number[] {
  const out = [0];
  for (const s of def.steps.slice(0, -1)) out.push(out[out.length - 1] + s);
  return out;
}

// ------------------------------------------------------------------
// Nomes dos graus
// ------------------------------------------------------------------

export const INTERVAL_NAMES: { grau: string; nome: string }[] = [
  { grau: 'T', nome: 'Tônica' },
  { grau: '2ªb', nome: '2ª Menor' },
  { grau: '2ª', nome: '2ª Maior' },
  { grau: '3ªb', nome: '3ª Menor' },
  { grau: '3ª', nome: '3ª Maior' },
  { grau: '4ª', nome: '4ª Justa' },
  { grau: '5ªb', nome: '5ª Diminuta' },
  { grau: '5ª', nome: '5ª Justa' },
  { grau: '6ªb', nome: '6ª Menor' },
  { grau: '6ª', nome: '6ª Maior' },
  { grau: '7ªb', nome: '7ª Menor' },
  { grau: '7ªM', nome: '7ª Maior' },
  { grau: '8ª', nome: '8ª' },
];

// ------------------------------------------------------------------
// Construcao da escala
// ------------------------------------------------------------------

export interface BuiltScale {
  def: ScaleDef;
  /** Tonica como escrita na escala (ex.: Eb, F#) */
  root: string;
  /** Notas escritas (ex.: C D Eb F G Ab Bb) */
  notes: string[];
  /** Mesmas notas em sustenido, para o braco e o banco de acordes */
  sharpNotes: SharpNote[];
  /** Semitons de cada nota a partir da tonica */
  offsets: number[];
  /** Se notas fora da escala devem ser escritas em bemol */
  preferFlat: boolean;
}

/** Escreve uma escala de 7 notas por letra, a partir da tonica escrita. */
function spellByLetter(rootName: string, offsets: number[]): string[] {
  const rootLetter = LETTERS.indexOf(rootName[0]);
  const rootPc = pc(rootName);
  return offsets.map((off, i) => {
    const letter = LETTERS[(rootLetter + i) % 7];
    const target = (rootPc + off) % 12;
    let diff = target - LETTER_PC[letter];
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    return letter + accidental(diff);
  });
}

/** Como a tonica deve ser escrita para a escala ficar na grafia da maior relativa. */
function spelledRoot(rootPc: number, parentOffset: number): string {
  const parentPc = (rootPc + parentOffset) % 12;
  const parentScale = spellByLetter(MAJOR_KEY_NAMES[parentPc], [0, 2, 4, 5, 7, 9, 11]);
  return parentScale.find((n) => pc(n) === rootPc) ?? SHARP_NAMES[rootPc];
}

export function buildScale(rootPc: number, scaleKey: string): BuiltScale {
  const def = getScaleDef(scaleKey);
  const offsets = scaleOffsets(def);

  const hasParent = def.parentOffset !== undefined;
  const preferFlat = hasParent && FLAT_MAJOR_KEYS.has((rootPc + def.parentOffset!) % 12);

  let notes: string[];
  if (hasParent && offsets.length === 7) {
    notes = spellByLetter(spelledRoot(rootPc, def.parentOffset!), offsets);
  } else {
    const names = preferFlat ? FLAT_NAMES : SHARP_NAMES;
    notes = offsets.map((o) => names[(rootPc + o) % 12]);
  }

  return {
    def,
    root: notes[0],
    notes,
    sharpNotes: notes.map(toSharp),
    offsets,
    preferFlat,
  };
}

/** Nome de uma classe de altura conforme a grafia da escala. */
export function noteNameIn(scale: BuiltScale, pitch: number): string {
  const i = scale.sharpNotes.findIndex((n) => pc(n) === pitch);
  if (i !== -1) return scale.notes[i];
  return (scale.preferFlat ? FLAT_NAMES : SHARP_NAMES)[pitch];
}

// ------------------------------------------------------------------
// Campo harmonico
// ------------------------------------------------------------------

export interface HarmonicChord {
  /** Grau em algarismo romano (ex.: ii, V, viiº, III+) */
  grau: string;
  root: string;
  /** Qualidade no padrao do MusicPages: Maj, m, Maj7, m7, 7, m7b5, dim7, mMaj7, Maj7#5, 7#5, 7b9 */
  quality: string;
  /** Nome exibido (ex.: CMaj7) */
  name: string;
  notes: string[];
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const QUALITY_INTERVALS: Record<string, number[]> = {
  Maj: [4, 7],
  m: [3, 7],
  dim: [3, 6],
  aug: [4, 8],
  Maj7: [4, 7, 11],
  m7: [3, 7, 10],
  '7': [4, 7, 10],
  m7b5: [3, 6, 10],
  mMaj7: [3, 7, 11],
  'Maj7#5': [4, 8, 11],
  dim7: [3, 6, 9],
  '7#5': [4, 8, 10],
  '7b9': [4, 7, 10, 1],
};

function qualityFrom(third: number, fifth: number, seventh?: number): string {
  if (seventh === undefined) {
    if (third === 4 && fifth === 7) return 'Maj';
    if (third === 3 && fifth === 7) return 'm';
    if (third === 3 && fifth === 6) return 'dim';
    if (third === 4 && fifth === 8) return 'aug';
    return '?';
  }
  const key = [third, fifth, seventh].join(',');
  const found = Object.entries(QUALITY_INTERVALS).find(([, iv]) => iv.join(',') === key);
  return found ? found[0] : '?';
}

function romanFor(index: number, third: number, fifth: number): string {
  const base = ROMAN[index];
  if (fifth === 6) return base.toLowerCase() + 'º';
  if (fifth === 8) return base + '+';
  return third === 3 ? base.toLowerCase() : base;
}

/** Sufixo exibido no nome do acorde ("Maj" de triade some: C, Cm). */
function displaySuffix(quality: string): string {
  if (quality === 'Maj') return '';
  if (quality === 'aug') return '+';
  if (quality === 'dim') return 'º';
  return quality;
}

/** Acordes empilhando tercas da propria escala (escalas de 7 notas). */
function stackedField(scale: BuiltScale, tetrads: boolean): HarmonicChord[] {
  const n = scale.notes.length;
  return scale.notes.map((root, i) => {
    const idx = tetrads ? [i, i + 2, i + 4, i + 6] : [i, i + 2, i + 4];
    const notes = idx.map((j) => scale.notes[j % n]);
    const iv = notes.slice(1).map((nt) => (pc(nt) - pc(root) + 12) % 12);
    const quality = qualityFrom(iv[0], iv[1], iv[2]);
    return {
      grau: romanFor(i, iv[0], iv[1]),
      root,
      quality,
      name: root + displaySuffix(quality),
      notes,
    };
  });
}

function chordFromQuality(rootName: string, quality: string, grau: string, preferFlat: boolean): HarmonicChord {
  const names = preferFlat ? FLAT_NAMES : SHARP_NAMES;
  const rootPc = pc(rootName);
  const notes = [rootName, ...QUALITY_INTERVALS[quality].map((iv) => names[(rootPc + iv) % 12])];
  return { grau, root: rootName, quality, name: rootName + displaySuffix(quality), notes };
}

/** Escalas simetricas: padrao de qualidades do MusicPages, repetido em cada nota. */
const SYMMETRIC_PATTERN: Record<string, string[]> = {
  diminuta_tom_e_semitom: ['dim7', '7'],
  diminuta_semitom_e_tom: ['7b9', 'dim7'],
  tons_inteiros: ['7#5'],
  cromatica: ['7'],
};

/** Pentatonicas e blues: triades da escala maior ou menor de mesma tonica, nas notas da escala. */
const SUBSET_OF: Record<string, string> = {
  pentatonica_maior: 'maior',
  blues_maior: 'maior',
  pentatonica_menor: 'menor_natural',
  blues_menor: 'menor_natural',
};

/**
 * Campo harmonico da escala, ou null quando nao se aplica (escalas exoticas).
 * Escalas de 7 notas usam tetrades por padrao (como no MusicPages).
 */
export function harmonicField(scale: BuiltScale, tetrads = true): HarmonicChord[] | null {
  const { def } = scale;

  if (def.parentOffset !== undefined && scale.notes.length === 7) {
    return stackedField(scale, tetrads);
  }

  if (SUBSET_OF[def.key]) {
    const parent = buildScale(pc(scale.root), SUBSET_OF[def.key]);
    const scalePcs = new Set(scale.sharpNotes.map(pc));
    return stackedField(parent, false).filter((ch) => scalePcs.has(pc(ch.root)));
  }

  const pattern = SYMMETRIC_PATTERN[def.key];
  if (pattern) {
    return scale.notes.map((root, i) =>
      chordFromQuality(root, pattern[i % pattern.length], ROMAN[i], scale.preferFlat)
    );
  }

  return null;
}

// ------------------------------------------------------------------
// Utilidades de exibicao
// ------------------------------------------------------------------

/** Formata um intervalo em semitons no padrao da tabela de estruturas do MusicPages. */
export function formatStep(semitones: number): string {
  if (semitones === 1) return 'Semitom';
  if (semitones === 2) return 'Tom';
  if (semitones === 3) return 'Tom + Semitom';
  if (semitones === 4) return '2 Tons';
  return String(semitones);
}

/** Nome do grau de cada nota da escala (ex.: "3ª Maior"). */
export function degreeNames(scale: BuiltScale): string[] {
  return scale.offsets.map((o) => INTERVAL_NAMES[o % 12].nome);
}

/** Qualidade do acorde -> chave do banco de posicoes (CHORD_SHAPES). */
export function shapeKey(chord: HarmonicChord): string | null {
  const map: Record<string, string> = { Maj: '', m: 'm', Maj7: 'maj7', m7: 'm7', '7': '7', dim: 'dim', m7b5: 'm7b5' };
  const q = map[chord.quality];
  return q === undefined ? null : toSharp(chord.root) + q;
}
