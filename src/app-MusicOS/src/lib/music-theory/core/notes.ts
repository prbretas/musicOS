/**
 * Sistema de Notas Musicais
 * 
 * Módulo core para manipulação de notas: conversão, normalização, transposição
 */

import { NoteName, FlatNoteName, AnyNoteName, NoteValidation, NotationType } from '../types/music';

// ============================================
// CONSTANTES
// ============================================

/**
 * Todas as notas em notação sustenida
 */
export const SHARP_NOTES: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 * Todas as notas em notação bemol
 */
export const FLAT_NOTES: FlatNoteName[] = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

/**
 * Equivalências enarmônicas (bemol -> sustenido)
 */
export const ENHARMONIC_EQUIVALENTS: Record<FlatNoteName, NoteName> = {
  'C': 'C',
  'Db': 'C#',
  'D': 'D',
  'Eb': 'D#',
  'E': 'E',
  'F': 'F',
  'Gb': 'F#',
  'G': 'G',
  'Ab': 'G#',
  'A': 'A',
  'Bb': 'A#',
  'B': 'B'
};

/**
 * Equivalências enarmônicas (sustenido -> bemol)
 */
export const ENHARMONIC_EQUIVALENTS_REVERSE: Record<NoteName, FlatNoteName> = {
  'C': 'C',
  'C#': 'Db',
  'D': 'D',
  'D#': 'Eb',
  'E': 'E',
  'F': 'F',
  'F#': 'Gb',
  'G': 'G',
  'G#': 'Ab',
  'A': 'A',
  'A#': 'Bb',
  'B': 'B'
};

/**
 * Notas especiais com múltiplas equivalências
 */
export const SPECIAL_ENHARMONICS: Record<string, NoteName[]> = {
  'C': ['B#'],      // C também pode ser B#
  'E': ['Fb'],      // E também pode ser Fb
  'B': ['Cb'],      // B também pode ser Cb
  'F': ['E#']       // F também pode ser E#
};

// ============================================
// FUNÇÕES DE CONVERSÃO
// ============================================

/**
 * Converte uma nota qualquer para notação sustenida
 */
export function toSharpNote(note: AnyNoteName): NoteName {
  const normalized = note.trim().toUpperCase();
  
  // Se já está em sustenido, retorna como está
  if (SHARP_NOTES.includes(normalized as NoteName)) {
    return normalized as NoteName;
  }
  
  // Converte de bemol para sustenido
  if (normalized in ENHARMONIC_EQUIVALENTS) {
    return ENHARMONIC_EQUIVALENTS[normalized as FlatNoteName];
  }
  
  // Tenta encontrar em equivalências especiais
  for (const [sharpNote, equivalents] of Object.entries(SPECIAL_ENHARMONICS)) {
    if (equivalents.includes(normalized as any)) {
      return sharpNote as NoteName;
    }
  }
  
  // Se não encontrou, assume que é sustenido ou retorna C como fallback
  return 'C';
}

/**
 * Converte uma nota qualquer para notação bemol
 */
export function toFlatNote(note: AnyNoteName): FlatNoteName {
  const normalized = note.trim().toUpperCase();
  
  // Se já está em bemol, retorna como está
  if (FLAT_NOTES.includes(normalized as FlatNoteName)) {
    return normalized as FlatNoteName;
  }
  
  // Converte de sustenido para bemol
  if (normalized in ENHARMONIC_EQUIVALENTS_REVERSE) {
    return ENHARMONIC_EQUIVALENTS_REVERSE[normalized as NoteName];
  }
  
  // Tenta encontrar em equivalências especiais
  for (const [sharpNote, equivalents] of Object.entries(SPECIAL_ENHARMONICS)) {
    if (equivalents.includes(normalized as any)) {
      // Encontrou uma equivalência especial, converte a nota sustenida para bemol
      const sharpNoteObj = sharpNote as NoteName;
      return ENHARMONIC_EQUIVALENTS_REVERSE[sharpNoteObj];
    }
  }
  
  // Fallback para C
  return 'C';
}

/**
 * Normaliza uma nota para a notação especificada
 */
export function normalizeNote(
  note: AnyNoteName, 
  notation: NotationType = NotationType.SHARP
): NoteName | FlatNoteName {
  return notation === NotationType.SHARP 
    ? toSharpNote(note) 
    : toFlatNote(note);
}

// ============================================
// FUNÇÕES DE ÍNDICE
// ============================================

/**
 * Retorna o índice cromático de uma nota (0-11)
 */
export function getNoteIndex(note: AnyNoteName): number {
  const sharpNote = toSharpNote(note);
  return SHARP_NOTES.indexOf(sharpNote);
}

/**
 * Retorna a nota pelo índice cromático
 */
export function getNoteByIndex(index: number, notation: NotationType = NotationType.SHARP): NoteName | FlatNoteName {
  const normalizedIndex = ((index % 12) + 12) % 12; // Garante positivo
  
  if (notation === NotationType.SHARP) {
    return SHARP_NOTES[normalizedIndex];
  } else {
    return FLAT_NOTES[normalizedIndex];
  }
}

/**
 * Verifica se dois nomes de nota são enarmonicamente equivalentes
 */
export function areNotesEnharmonic(note1: AnyNoteName, note2: AnyNoteName): boolean {
  const sharp1 = toSharpNote(note1);
  const sharp2 = toSharpNote(note2);
  return sharp1 === sharp2;
}

// ============================================
// FUNÇÕES DE TRANSPOSIÇÃO
// ============================================

/**
 * Transpõe uma nota por N semitons
 */
export function transposeNote(
  note: AnyNoteName, 
  semitones: number, 
  notation: NotationType = NotationType.SHARP
): NoteName | FlatNoteName {
  const index = getNoteIndex(note);
  const newIndex = index + semitones;
  return getNoteByIndex(newIndex, notation);
}

/**
 * Transpõe um array de notas por N semitons
 */
export function transposeNotes(
  notes: AnyNoteName[], 
  semitones: number, 
  notation: NotationType = NotationType.SHARP
): (NoteName | FlatNoteName)[] {
  return notes.map(note => transposeNote(note, semitones, notation));
}

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Valida se uma string é um nome de nota válido
 */
export function isValidNote(note: string): NoteValidation {
  const normalized = note.trim().toUpperCase();
  
  // Verifica se está na lista de sustenidos
  if (SHARP_NOTES.includes(normalized as NoteName)) {
    return {
      valid: true,
      normalizedNote: normalized as NoteName,
      enharmonicEquivalents: [ENHARMONIC_EQUIVALENTS_REVERSE[normalized as NoteName]]
    };
  }
  
  // Verifica se está na lista de bemóis
  if (FLAT_NOTES.includes(normalized as FlatNoteName)) {
    const sharpNote = ENHARMONIC_EQUIVALENTS[normalized as FlatNoteName];
    return {
      valid: true,
      normalizedNote: sharpNote,
      enharmonicEquivalents: [normalized as FlatNoteName]
    };
  }
  
  // Verifica equivalências especiais
  for (const [sharpNote, equivalents] of Object.entries(SPECIAL_ENHARMONICS)) {
    if (equivalents.includes(normalized as any)) {
      return {
        valid: true,
        normalizedNote: sharpNote as NoteName,
        enharmonicEquivalents: equivalents as NoteName[]
      };
    }
  }
  
  // Não é uma nota válida
  return {
    valid: false,
    message: `"${note}" não é um nome de nota válido.`,
    suggestions: SHARP_NOTES.slice(0, 5) // Sugere as primeiras 5 notas
  };
}

/**
 * Retorna todas as equivalências enarmônicas de uma nota
 */
export function getAllEnharmonicEquivalents(note: AnyNoteName): (NoteName | FlatNoteName)[] {
  const sharpNote = toSharpNote(note);
  const flatNote = toFlatNote(note);
  
  const equivalents: (NoteName | FlatNoteName)[] = [sharpNote, flatNote];
  
  // Adiciona equivalências especiais se existirem
  const specialEquivalents = SPECIAL_ENHARMONICS[sharpNote] || [];
  equivalents.push(...specialEquivalents);
  
  // Remove duplicatas
  return [...new Set(equivalents)];
}

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================

/**
 * Retorna todas as notas disponíveis em uma notação específica
 */
export function getAllNotes(notation: NotationType = NotationType.SHARP): (NoteName | FlatNoteName)[] {
  return notation === NotationType.SHARP ? [...SHARP_NOTES] : [...FLAT_NOTES];
}

/**
 * Retorna as notas do tier Free (C, G, F, A, E)
 */
export function getFreeTierNotes(notation: NotationType = NotationType.SHARP): (NoteName | FlatNoteName)[] {
  const freeNotesSharp: NoteName[] = ['C', 'G', 'F', 'A', 'E'];
  
  if (notation === NotationType.SHARP) {
    return freeNotesSharp;
  }
  
  // Converte para bemóis
  return freeNotesSharp.map(note => toFlatNote(note));
}

/**
 * Verifica se uma nota está disponível no tier Free
 */
export function isNoteFreeTier(note: AnyNoteName): boolean {
  const sharpNote = toSharpNote(note);
  const freeNotes = getFreeTierNotes(NotationType.SHARP) as NoteName[];
  return freeNotes.includes(sharpNote);
}

/**
 * Retorna o nome da nota formatado (com sustenido ou bemol)
 */
export function formatNote(
  note: AnyNoteName, 
  notation: NotationType = NotationType.SHARP,
  includeOctave?: number
): string {
  const normalized = normalizeNote(note, notation);
  return includeOctave !== undefined 
    ? `${normalized}${includeOctave}` 
    : normalized;
}

// ============================================
// FUNÇÕES AVANÇADAS
// ============================================

/**
 * Calcula a distância em semitons entre duas notas
 */
export function getNoteDistance(note1: AnyNoteName, note2: AnyNoteName): number {
  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);
  return (index2 - index1 + 12) % 12;
}

/**
 * Retorna a nota mais próxima em uma direção específica
 */
export function getClosestNote(
  fromNote: AnyNoteName,
  targetNote: AnyNoteName,
  direction: 'up' | 'down' = 'up'
): NoteName | FlatNoteName {
  const fromIndex = getNoteIndex(fromNote);
  const targetIndex = getNoteIndex(targetNote);
  
  let distance = targetIndex - fromIndex;
  
  // Ajusta a distância baseado na direção
  if (direction === 'down' && distance > 0) {
    distance -= 12;
  } else if (direction === 'up' && distance < 0) {
    distance += 12;
  }
  
  return getNoteByIndex(fromIndex + distance);
}

/**
 * Converte notas para diferentes afinações de instrumento
 */
export function convertForInstrument(
  notes: AnyNoteName[],
  instrument: 'guitar' | 'piano' | 'ukulele' | 'bass' = 'guitar',
  tuning?: string[]
): (NoteName | FlatNoteName)[] {
  // Por enquanto, retorna as notas normalizadas
  // (Implementação futura pode incluir ajustes específicos por instrumento)
  return notes.map(note => normalizeNote(note, NotationType.SHARP));
}