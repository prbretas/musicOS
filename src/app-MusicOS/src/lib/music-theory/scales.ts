/**
 * Scales Engine
 * Portado e modernizado de script-escalas.js do musicpages
 */

import { NoteName, ScaleType, Scale, ScaleResult, ChordInField } from '@/types/music';

// ============================================
// CONSTANTS
// ============================================

const NOTE_NAMES: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const ENHARMONIC_EQUIVALENTS: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'E#': 'F', 'B#': 'C', 'FB': 'E', 'CB': 'B'
};

// ============================================
// UTILITIES
// ============================================

/**
 * Normaliza nome da nota para sustenido
 */
export function normalizeToSharp(note: string): NoteName {
  const normalized = note.replace('b', '#').toUpperCase();
  return (ENHARMONIC_EQUIVALENTS[normalized] || normalized) as NoteName;
}

/**
 * Retorna índice cromático (0-11)
 */
export function getChromaticIndex(note: string): number {
  const normalized = normalizeToSharp(note);
  return NOTE_NAMES.indexOf(normalized);
}

/**
 * Retorna nome da nota pelo índice
 */
export function getNoteFromIndex(index: number): NoteName {
  return NOTE_NAMES[index % 12];
}

/**
 * Transpõe uma nota por semitons
 */
export function transposeNote(note: string, semitones: number): NoteName {
  const index = getChromaticIndex(note);
  return getNoteFromIndex(index + semitones);
}

// ============================================
// SCALE DEFINITIONS
// ============================================

export const SCALES: Record<ScaleType, Scale> = {
  // Escalas Diatônicas
  maior: {
    name: 'Maior',
    type: 'maior',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'A escala maior é a base da música ocidental. Som feliz e luminoso.'
  },
  menor_natural: {
    name: 'Menor Natural',
    type: 'menor_natural',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Escala menor natural. Som triste e melancólico.'
  },
  menor_harmonica: {
    name: 'Menor Harmônica',
    type: 'menor_harmonica',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Menor com 7ª maior. Som exótico e dramático.'
  },
  menor_melodica: {
    name: 'Menor Melódica',
    type: 'menor_melodica',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Menor com 6ª e 7ª maiores. Ascende como maior, descende como menor.'
  },

  // Modos Gregos
  jonico: {
    name: 'Jônio (I)',
    type: 'jonico',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Primeiro modo. Caracteza maior, sonoro e heroico.'
  },
  dorico: {
    name: 'Dórico (II)',
    type: 'dorico',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Segundo modo. Som jazzy, sofisticado e levemente triste.'
  },
  frigio: {
    name: 'Frígio (III)',
    type: 'frigio',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Terceiro modo. Som flamenco, exótico e medieval.'
  },
  lidio: {
    name: 'Lídio (IV)',
    type: 'lidio',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Quarto modo. Som brillante, etéreo e otimista.'
  },
  mixolidio: {
    name: 'Mixolídio (V)',
    type: 'mixolidio',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Quinto modo. Som bluesy, rocker e festivo.'
  },
  eolio: {
    name: 'Eólio (VI)',
    type: 'eolio',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Sexto modo (menor natural). Som triste e emotivo.'
  },
  locrio: {
    name: 'Lócrio (VII)',
    type: 'locrio',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: 'Sétimo modo. Som tenso, instável e jazzístico.'
  },

  // Outras Escalas
  pentatonica_maior: {
    name: 'Pentatônica Maior',
    type: 'pentatonica_maior',
    intervals: [0, 2, 4, 7, 9],
    description: '5 notas. Essencial para solos e improvização.'
  },
  pentatonica_menor: {
    name: 'Pentatônica Menor',
    type: 'pentatonica_menor',
    intervals: [0, 3, 5, 7, 10],
    description: 'Base do blues rock. Expressiva e versátil.'
  },
  blues_maior: {
    name: 'Blues Maior',
    type: 'blues_maior',
    intervals: [0, 2, 3, 4, 7, 9],
    description: 'Pentatônica maior com nota blues. Som happy blues.'
  },
  blues_menor: {
    name: 'Blues Menor',
    type: 'blues_menor',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'A escala do blues clássico. Raw e emotiva.'
  },
  diminuta_tom_e_semitom: {
    name: 'Diminuta (T-S)',
    type: 'diminuta_tom_e_semitom',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    description: 'Escala de tons inteiros e semitons. Tensa e cromática.'
  },
  diminuta_semitom_e_tom: {
    name: 'Diminuta (S-T)',
    type: 'diminuta_semitom_e_tom',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    description: 'Diminuta oposta. Usada em jazz e cinema.'
  },
  tons_inteiros: {
    name: 'Tons Inteiros',
    type: 'tons_inteiros',
    intervals: [0, 2, 4, 6, 8, 10],
    description: '6 notas igualmente espaçadas. Sonora e etérea.'
  },
  cromatica: {
    name: 'Cromática',
    type: 'cromatica',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: 'Todas as 12 notas. Uso em efeitos e técnicas especiais.'
  },

  // Escalas Exóticas
  egipcia: {
    name: 'Egípcia',
    type: 'egipcia',
    intervals: [0, 2, 5, 7, 10],
    description: 'Pentatônica com intervalo de 3. Usada por Mark Knopfler.'
  },
  hirajoshi: {
    name: 'Hirajoshi',
    type: 'hirajoshi',
    intervals: [0, 2, 3, 7, 8],
    description: 'Escala japonesa. Som característico do rock.'
  },
  iwato: {
    name: 'Iwato',
    type: 'iwato',
    intervals: [0, 1, 5, 6, 10],
    description: 'Escala japonesa. Usada em música tradicional.'
  },
  man_gong: {
    name: 'Man Gong',
    type: 'man_gong',
    intervals: [0, 3, 5, 7, 9, 10],
    description: 'Escala coreana. Usada em música tradicional.'
  },
  ritusen: {
    name: 'Ritusen',
    type: 'ritusen',
    intervals: [0, 2, 5, 7],
    description: 'Escala celta. Usada em folk e música medieval.'
  }
};

// ============================================
// CHORD QUALITIES BY DEGREE
// ============================================

const CHORD_QUALITIES: Record<string, string[]> = {
  'maior': ['major', 'maj7', '7', 'maj7', '7', 'm7', 'm7b5'],
  'menor_natural': ['m', 'm7', 'm7', 'm', '7', 'm7', 'm7b5'],
  'menor_harmonica': ['m', 'm7b5', 'aug', 'm7', '7', 'm7', 'dim7'],
  'menor_melodica': ['m', 'm7', 'aug', '7', '7', 'm7b5', 'm7b5'],
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Gera as notas de uma escala
 */
export function generateScaleNotes(tonic: string, scaleType: ScaleType): NoteName[] {
  const tonicIndex = getChromaticIndex(tonic);
  const scale = SCALES[scaleType];
  
  if (tonicIndex < 0 || !scale) {
    return [];
  }

  return scale.intervals.map(interval => getNoteFromIndex(tonicIndex + interval));
}

/**
 * Gera o campo harmônico de uma escala
 */
export function generateHarmonicField(tonic: string, scaleType: ScaleType): ChordInField[] {
  const scaleNotes = generateScaleNotes(tonic, scaleType);
  if (scaleNotes.length === 0) return [];

  const chordQualities = CHORD_QUALITIES[scaleType] || CHORD_QUALITIES['maior'];
  const romans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const qualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];

  // Determinação de qualidade do acorde baseada no grau
  function getChordQuality(degree: number): string {
    if (chordQualities && chordQualities[degree - 1]) {
      return chordQualities[degree - 1];
    }
    return qualities[degree - 1];
  }

  // Função para adicionar intervalos a uma nota
  function addIntervals(notes: NoteName[], intervals: number[]): NoteName {
    const lastNote = notes[notes.length - 1];
    const lastIndex = getChromaticIndex(lastNote);
    const newNote = getNoteFromIndex(lastIndex + intervals[intervals.length - 1]);
    return newNote;
  }

  // Acordes básicos para cada grau (simplificado)
  const chordsByDegree: ChordInField[] = scaleNotes.map((note, index) => {
    const degree = index + 1;
    const quality = getChordQuality(degree);
    const roman = romans[index];
    
    // Notas do acorde (simplificado - tríade)
    const chordNotes = [note];
    if (index + 2 < scaleNotes.length) {
      chordNotes.push(scaleNotes[index + 2]);
    }
    if (index + 4 < scaleNotes.length) {
      chordNotes.push(scaleNotes[index + 4]);
    }

    return {
      degree,
      roman,
      chord: note,
      quality,
      notes: chordNotes
    };
  });

  return chordsByDegree;
}

/**
 * Calcula uma escala e retorna resultado completo
 */
export function calculateScale(tonic: string, scaleType: ScaleType): ScaleResult {
  const tonicNormalized = normalizeToSharp(tonic);
  const scale = SCALES[scaleType];

  return {
    tonic: tonicNormalized as NoteName,
    type: scaleType,
    notes: generateScaleNotes(tonicNormalized, scaleType),
    harmonicField: generateHarmonicField(tonicNormalized, scaleType)
  };
}

/**
 * Transpõe uma escala para outra tonalidade
 */
export function transposeScale(notes: NoteName[], semitones: number): NoteName[] {
  return notes.map(note => transposeNote(note, semitones));
}

// ============================================
// DATA ACCESS
// ============================================

/**
 * Lista todas as escalas disponíveis
 */
export function getAllScales(): Scale[] {
  return Object.values(SCALES);
}

/**
 * Busca uma escala pelo tipo
 */
export function getScaleByType(type: ScaleType): Scale | undefined {
  return SCALES[type];
}

/**
 * Busca escalas por categoria
 */
export function getScalesByCategory(category: 'diatonic' | 'modes' | 'pentatonic' | 'blues' | 'exotic'): Scale[] {
  const categories: Record<string, ScaleType[]> = {
    diatonic: ['maior', 'menor_natural', 'menor_harmonica', 'menor_melodica'],
    modes: ['jonico', 'dorico', 'frigio', 'lidio', 'mixolidio', 'eolio', 'locrio'],
    pentatonic: ['pentatonica_maior', 'pentatonica_menor'],
    blues: ['blues_maior', 'blues_menor'],
    exotic: ['egipcia', 'hirajoshi', 'iwato', 'man_gong', 'ritusen', 'diminuta_tom_e_semitom', 'diminuta_semitom_e_tom', 'tons_inteiros', 'cromatica']
  };

  return categories[category]?.map(type => SCALES[type]).filter(Boolean) || [];
}

/**
 * Retorna as 5 tonalidades do tier Free
 */
export function getFreeTierTonics(): NoteName[] {
  return ['C', 'G', 'F', 'A', 'E'];
}

/**
 * Verifica se uma tônica está disponível no tier Free
 */
export function isTonicFree(tonic: string): boolean {
  const freeTonics = getFreeTierTonics();
  return freeTonics.some(t => t === normalizeToSharp(tonic));
}

// ============================================
// REACT HOOK
// ============================================

import { useState, useCallback, useMemo } from 'react';

export function useMusicTheory() {
  const [tonic, setTonic] = useState<NoteName>('C');
  const [scaleType, setScaleType] = useState<ScaleType>('maior');

  const scaleResult = useMemo(() => 
    calculateScale(tonic, scaleType),
    [tonic, scaleType]
  );

  const scales = useMemo(() => getAllScales(), []);
  const freeTonics = useMemo(() => getFreeTierTonics(), []);

  const setScale = useCallback((newTonic: string, newType: ScaleType) => {
    setTonic(normalizeToSharp(newTonic) as NoteName);
    setScaleType(newType);
  }, []);

  return {
    tonic,
    scaleType,
    scaleResult,
    scales,
    freeTonics,
    setTonic,
    setScaleType,
    setScale,
    isTonicFree: useCallback((t: string) => isTonicFree(t), []),
    // Utilities
    generateScaleNotes,
    generateHarmonicField,
    transposeScale,
    getScaleByType,
    getScalesByCategory
  };
}