/**
 * Music Theory Engine
 * Core engine para teoria musical: escalas, acordes, intervalos
 */

export type NoteName = 
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type ScaleType = 
  | 'major' | 'minor' | 'harmonic-minor' | 'melodic-minor'
  | 'major-pentatonic' | 'minor-pentatonic' | 'blues'
  | 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian';

export type ChordType = 
  | 'major' | 'minor' | 'diminished' | 'augmented'
  | 'major7' | 'minor7' | 'dominant7' | 'diminished7' | 'half-diminished7'
  | 'sus2' | 'sus4' | 'add9' | 'maj9' | 'min9';

/**
 * Todas as notas da escala cromática
 */
export const ALL_NOTES: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 * Intervalos em semitons para diferentes escalas
 */
const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  'major': [2, 2, 1, 2, 2, 2, 1],
  'minor': [2, 1, 2, 2, 1, 2, 2],
  'harmonic-minor': [2, 1, 2, 2, 1, 3, 1],
  'melodic-minor': [2, 1, 2, 2, 2, 2, 1],
  'major-pentatonic': [2, 2, 3, 2, 3],
  'minor-pentatonic': [3, 2, 2, 3, 2],
  'blues': [3, 2, 1, 1, 3, 2],
  'ionian': [2, 2, 1, 2, 2, 2, 1],
  'dorian': [2, 1, 2, 2, 2, 1, 2],
  'phrygian': [1, 2, 2, 2, 1, 2, 2],
  'lydian': [2, 2, 2, 1, 2, 2, 1],
  'mixolydian': [2, 2, 1, 2, 2, 1, 2],
  'aeolian': [2, 1, 2, 2, 1, 2, 2],
  'locrian': [1, 2, 2, 1, 2, 2, 2]
};

/**
 * Intervalos em semitons para diferentes acordes
 */
const CHORD_INTERVALS: Record<ChordType, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  'major7': [0, 4, 7, 11],
  'minor7': [0, 3, 7, 10],
  'dominant7': [0, 4, 7, 10],
  'diminished7': [0, 3, 6, 9],
  'half-diminished7': [0, 3, 6, 10],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  'add9': [0, 4, 7, 14],
  'maj9': [0, 4, 7, 11, 14],
  'min9': [0, 3, 7, 10, 14]
};

/**
 * Retorna o índice de uma nota no array de notas
 */
export function getNoteIndex(note: NoteName): number {
  return ALL_NOTES.indexOf(note);
}

/**
 * Transpõe uma nota por N semitons
 */
export function transposeNote(note: NoteName, semitones: number): NoteName {
  const index = getNoteIndex(note);
  const newIndex = (index + semitones) % 12;
  return ALL_NOTES[newIndex];
}

/**
 * Calcula o intervalo entre duas notas em semitons
 */
export function getInterval(fromNote: NoteName, toNote: NoteName): number {
  const fromIndex = getNoteIndex(fromNote);
  const toIndex = getNoteIndex(toNote);
  return (toIndex - fromIndex + 12) % 12;
}

/**
 * Retorna as notas de uma escala
 */
export function getScaleNotes(root: NoteName, scaleType: ScaleType): NoteName[] {
  const intervals = SCALE_INTERVALS[scaleType];
  const notes: NoteName[] = [root];
  let currentIndex = getNoteIndex(root);
  
  for (const interval of intervals.slice(0, -1)) {
    currentIndex = (currentIndex + interval) % 12;
    notes.push(ALL_NOTES[currentIndex]);
  }
  
  return notes;
}

/**
 * Retorna as notas de um acorde
 */
export function getChordNotes(root: NoteName, chordType: ChordType): NoteName[] {
  const intervals = CHORD_INTERVALS[chordType];
  return intervals.map(interval => transposeNote(root, interval));
}

/**
 * Verifica se uma nota pertence a uma escala
 */
export function isNoteInScale(note: NoteName, root: NoteName, scaleType: ScaleType): boolean {
  const scaleNotes = getScaleNotes(root, scaleType);
  return scaleNotes.includes(note);
}

/**
 * Retorna o grau de uma nota em uma escala
 */
export function getScaleDegree(note: NoteName, root: NoteName, scaleType: ScaleType): number | null {
  const scaleNotes = getScaleNotes(root, scaleType);
  const degree = scaleNotes.indexOf(note);
  return degree !== -1 ? degree + 1 : null;
}

/**
 * Retorna os graus de uma escala com suas funções
 */
export function getScaleDegrees(scaleType: ScaleType): string[] {
  const functions: Record<string, string[]> = {
    'major': ['Root', 'Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Major 6th', 'Major 7th'],
    'minor': ['Root', 'Major 2nd', 'Minor 3rd', 'Perfect 4th', 'Perfect 5th', 'Minor 6th', 'Minor 7th'],
    'harmonic-minor': ['Root', 'Major 2nd', 'Minor 3rd', 'Perfect 4th', 'Perfect 5th', 'Minor 6th', 'Major 7th'],
    'major-pentatonic': ['Root', 'Major 2nd', 'Major 3rd', 'Perfect 5th', 'Major 6th'],
    'minor-pentatonic': ['Root', 'Minor 3rd', 'Perfect 4th', 'Perfect 5th', 'Minor 7th']
  };
  
  return functions[scaleType] || Array.from({ length: 7 }, (_, i) => `Degree ${i + 1}`);
}

/**
 * Retorna o campo harmônico de uma escala
 */
export function getHarmonicField(root: NoteName, scaleType: ScaleType): Array<{
  degree: number;
  chord: string;
  notes: NoteName[];
}> {
  const scaleNotes = getScaleNotes(root, scaleType);
  const chordTypes: ChordType[] = scaleType.includes('minor') 
    ? ['minor', 'diminished', 'major', 'minor', 'major', 'major', 'diminished']
    : ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
  
  return scaleNotes.map((note, index) => ({
    degree: index + 1,
    chord: `${note} ${chordTypes[index]}`,
    notes: getChordNotes(note, chordTypes[index])
  }));
}

/**
 * Converte número de semitons para nome do intervalo
 */
export function semitonesToInterval(semitones: number): string {
  const intervals: Record<number, string> = {
    0: 'Perfect Unison',
    1: 'Minor 2nd',
    2: 'Major 2nd',
    3: 'Minor 3rd',
    4: 'Major 3rd',
    5: 'Perfect 4th',
    6: 'Tritone',
    7: 'Perfect 5th',
    8: 'Minor 6th',
    9: 'Major 6th',
    10: 'Minor 7th',
    11: 'Major 7th',
    12: 'Perfect Octave'
  };
  
  return intervals[semitones] || `${semitones} semitones`;
}

/**
 * Retorna todos os tipos de escala disponíveis
 */
export function getAvailableScaleTypes(): ScaleType[] {
  return Object.keys(SCALE_INTERVALS) as ScaleType[];
}

/**
 * Retorna todos os tipos de acorde disponíveis
 */
export function getAvailableChordTypes(): ChordType[] {
  return Object.keys(CHORD_INTERVALS) as ChordType[];
}