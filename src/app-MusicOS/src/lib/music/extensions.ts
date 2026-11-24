/**
 * Tétrades e acordes com extensões, montados com as notas da própria escala.
 *
 * Para cada grau, empilha as notas da escala (1, 3, 5, 7, 9, 4, 6) conforme o
 * tipo escolhido e dá o nome pelo conjunto de intervalos. Se a combinação não
 * forma um acorde usual naquele grau (ex.: sus4 sobre o IV da escala maior,
 * que teria 4ª aumentada), o grau fica sem acorde.
 */

import { buildScale, pc, type BuiltScale } from './escalas';

export type ExtensionId = '7' | '6' | '9' | 'add9' | '69' | 'sus4' | 'sus2' | '7sus4';

export interface ExtensionDef {
  id: ExtensionId;
  label: string;
  /** Graus empilhados a partir da fundamental (1 = fundamental) */
  degrees: number[];
  description: string;
}

export const EXTENSIONS: ExtensionDef[] = [
  { id: '7', label: 'Tétrades (7)', degrees: [1, 3, 5, 7], description: 'Fundamental, 3ª, 5ª e 7ª: a base da harmonia de jazz, bossa e MPB.' },
  { id: '6', label: '6', degrees: [1, 3, 5, 6], description: 'Tríade com a 6ª: som estável, comum em finais e no choro.' },
  { id: '9', label: '9', degrees: [1, 3, 5, 7, 9], description: 'Tétrade com a 9ª: o som clássico da bossa nova.' },
  { id: 'add9', label: 'add9', degrees: [1, 3, 5, 9], description: 'Tríade com a 9ª, sem a 7ª: brilho sem mudar a função.' },
  { id: '69', label: '6/9', degrees: [1, 3, 5, 6, 9], description: 'Tríade com 6ª e 9ª: acorde de repouso muito usado na MPB.' },
  { id: 'sus4', label: 'sus4', degrees: [1, 4, 5], description: 'A 4ª no lugar da 3ª: tensão que pede resolução.' },
  { id: 'sus2', label: 'sus2', degrees: [1, 2, 5], description: 'A 2ª no lugar da 3ª: som aberto, sem definir maior ou menor.' },
  { id: '7sus4', label: '7sus4', degrees: [1, 4, 5, 7], description: 'Dominante suspenso: muito usado antes do V7.' },
];

/** Nome (sufixo) por conjunto de intervalos, para cada tipo. Conjuntos fora da lista não viram acorde. */
const NAMES: Record<ExtensionId, Record<string, string>> = {
  '7': {
    '0,4,7,11': '7M',
    '0,3,7,10': 'm7',
    '0,4,7,10': '7',
    '0,3,6,10': 'm7(b5)',
    '0,3,7,11': 'm(7M)',
    '0,4,8,11': '7M(#5)',
    '0,3,6,9': 'º7',
    '0,4,8,10': '7(#5)',
  },
  '6': {
    '0,4,7,9': '6',
    '0,3,7,9': 'm6',
    '0,3,7,8': 'm(b6)',
  },
  '9': {
    '0,2,4,7,11': '7M(9)',
    '0,2,4,7,10': '7(9)',
    '0,2,3,7,10': 'm7(9)',
    '0,1,3,7,10': 'm7(b9)',
    '0,1,4,7,10': '7(b9)',
    '0,1,3,6,10': 'm7(b5/b9)',
    '0,2,3,6,10': 'm7(b5/9)',
    '0,2,3,7,11': 'm(7M/9)',
    '0,2,4,8,11': '7M(#5/9)',
  },
  add9: {
    '0,2,4,7': '(add9)',
    '0,2,3,7': 'm(add9)',
  },
  '69': {
    '0,2,4,7,9': '6(9)',
    '0,2,3,7,9': 'm6(9)',
  },
  sus4: { '0,5,7': 'sus4' },
  sus2: { '0,2,7': 'sus2' },
  '7sus4': { '0,5,7,10': '7sus4', '0,5,7,11': '7M(sus4)' },
};

/** Posição na escala de cada grau empilhado (9 = 2, 11 = 4, 13 = 6). */
const DEGREE_STEP: Record<number, number> = { 1: 0, 2: 1, 9: 1, 3: 2, 4: 3, 11: 3, 5: 4, 6: 5, 13: 5, 7: 6 };

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export interface ExtendedChord {
  grau: string;
  root: string;
  /** Nome exibido (ex.: Dm7(9)) */
  name: string;
  /** Notas na ordem do empilhamento */
  notes: string[];
  /** Classes de altura, a fundamental primeiro */
  pcs: number[];
}

/** Escalas pentatônicas/blues usam a escala maior ou menor de mesma tônica. */
const PARENT_OF: Record<string, string> = {
  pentatonica_maior: 'maior',
  blues_maior: 'maior',
  pentatonica_menor: 'menor_natural',
  blues_menor: 'menor_natural',
};

/**
 * Acordes do tipo `ext` em cada grau da escala. Um item null = o grau não
 * forma esse acorde. Retorna null se a escala não tem 7 notas nem uma escala-mãe.
 */
export function extendedField(scale: BuiltScale, ext: ExtensionId): (ExtendedChord | null)[] | null {
  let base = scale;
  let onlyRoots: Set<number> | null = null;

  if (scale.notes.length !== 7) {
    const parent = PARENT_OF[scale.def.key];
    if (!parent) return null;
    base = buildScale(pc(scale.root), parent);
    onlyRoots = new Set(scale.sharpNotes.map(pc));
  }

  const def = EXTENSIONS.find((e) => e.id === ext)!;
  const notes = base.notes;

  const field = notes.map((root, i) => {
    if (onlyRoots && !onlyRoots.has(pc(root))) return undefined;
    const stacked = def.degrees.map((d) => notes[(i + DEGREE_STEP[d]) % 7]);
    const rootPc = pc(root);
    const intervals = stacked.map((n) => (pc(n) - rootPc + 12) % 12);
    const setKey = [...new Set(intervals)].sort((a, b) => a - b).join(',');
    const suffix = NAMES[ext][setKey];

    const third = (pc(notes[(i + 2) % 7]) - rootPc + 12) % 12;
    const fifth = (pc(notes[(i + 4) % 7]) - rootPc + 12) % 12;
    let grau = ROMAN[i];
    if (third === 3) grau = grau.toLowerCase();
    if (fifth === 6) grau += 'º';
    if (fifth === 8) grau += '+';

    if (!suffix) return { grau, chord: null };
    return {
      grau,
      chord: {
        grau,
        root,
        name: root + suffix,
        notes: stacked,
        pcs: stacked.map(pc),
      } as ExtendedChord,
    };
  });

  return field.filter((x): x is { grau: string; chord: ExtendedChord | null } => x !== undefined).map((x) => x.chord ?? null);
}

/** Graus (romanos) do campo, alinhados com extendedField, para exibir mesmo quando o acorde não existe. */
export function fieldDegrees(scale: BuiltScale): string[] | null {
  const f = extendedField(scale, '7');
  if (!f) return null;
  let base = scale;
  let onlyRoots: Set<number> | null = null;
  if (scale.notes.length !== 7) {
    base = buildScale(pc(scale.root), PARENT_OF[scale.def.key]);
    onlyRoots = new Set(scale.sharpNotes.map(pc));
  }
  return base.notes
    .map((root, i) => ({ root, i }))
    .filter(({ root }) => !onlyRoots || onlyRoots.has(pc(root)))
    .map(({ root, i }) => {
      const rootPc = pc(root);
      const third = (pc(base.notes[(i + 2) % 7]) - rootPc + 12) % 12;
      const fifth = (pc(base.notes[(i + 4) % 7]) - rootPc + 12) % 12;
      let grau = ROMAN[i];
      if (third === 3) grau = grau.toLowerCase();
      if (fifth === 6) grau += 'º';
      if (fifth === 8) grau += '+';
      return `${grau} · ${root}`;
    });
}
