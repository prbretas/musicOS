/**
 * Sistema de Intervalos Musicais
 * 
 * Módulo core para cálculo e manipulação de intervalos musicais
 */

import { NoteName, AnyNoteName, MusicInterval, IntervalType } from '../types/music';
import { getNoteIndex, getNoteByIndex, toSharpNote } from './notes';

// ============================================
// DEFINIÇÃO DE INTERVALOS
// ============================================

/**
 * Definições completas de todos os intervalos musicais
 */
export const INTERVAL_DEFINITIONS: Record<IntervalType, MusicInterval> = {
  'unison': {
    type: 'unison',
    semitones: 0,
    name: 'Uníssono',
    abbreviation: 'P1',
    consonant: true
  },
  'minor-second': {
    type: 'minor-second',
    semitones: 1,
    name: 'Segunda Menor',
    abbreviation: 'm2',
    consonant: false
  },
  'major-second': {
    type: 'major-second',
    semitones: 2,
    name: 'Segunda Maior',
    abbreviation: 'M2',
    consonant: false
  },
  'minor-third': {
    type: 'minor-third',
    semitones: 3,
    name: 'Terça Menor',
    abbreviation: 'm3',
    consonant: true
  },
  'major-third': {
    type: 'major-third',
    semitones: 4,
    name: 'Terça Maior',
    abbreviation: 'M3',
    consonant: true
  },
  'perfect-fourth': {
    type: 'perfect-fourth',
    semitones: 5,
    name: 'Quarta Justa',
    abbreviation: 'P4',
    consonant: true
  },
  'tritone': {
    type: 'tritone',
    semitones: 6,
    name: 'Trítono',
    abbreviation: 'TT',
    consonant: false
  },
  'perfect-fifth': {
    type: 'perfect-fifth',
    semitones: 7,
    name: 'Quinta Justa',
    abbreviation: 'P5',
    consonant: true
  },
  'minor-sixth': {
    type: 'minor-sixth',
    semitones: 8,
    name: 'Sexta Menor',
    abbreviation: 'm6',
    consonant: true
  },
  'major-sixth': {
    type: 'major-sixth',
    semitones: 9,
    name: 'Sexta Maior',
    abbreviation: 'M6',
    consonant: true
  },
  'minor-seventh': {
    type: 'minor-seventh',
    semitones: 10,
    name: 'Sétima Menor',
    abbreviation: 'm7',
    consonant: false
  },
  'major-seventh': {
    type: 'major-seventh',
    semitones: 11,
    name: 'Sétima Maior',
    abbreviation: 'M7',
    consonant: false
  },
  'octave': {
    type: 'octave',
    semitones: 12,
    name: 'Oitava',
    abbreviation: 'P8',
    consonant: true
  }
};

/**
 * Intervalos compostos (acima de uma oitava)
 */
export const COMPOUND_INTERVALS: Record<number, { name: string, baseInterval: IntervalType }> = {
  13: { name: 'Nona Menor', baseInterval: 'minor-second' },
  14: { name: 'Nona Maior', baseInterval: 'major-second' },
  15: { name: 'Décima Menor', baseInterval: 'minor-third' },
  16: { name: 'Décima Maior', baseInterval: 'major-third' },
  17: { name: 'Décima Primeira', baseInterval: 'perfect-fourth' },
  19: { name: 'Décima Segunda', baseInterval: 'perfect-fifth' },
  20: { name: 'Décima Terceira Menor', baseInterval: 'minor-sixth' },
  21: { name: 'Décima Terceira Maior', baseInterval: 'major-sixth' }
};

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula o intervalo entre duas notas em semitons
 */
export function calculateInterval(
  fromNote: AnyNoteName, 
  toNote: AnyNoteName
): number {
  const fromIndex = getNoteIndex(fromNote);
  const toIndex = getNoteIndex(toNote);
  
  // Calcula a distância e garante que seja positiva (0-11)
  return ((toIndex - fromIndex) % 12 + 12) % 12;
}

/**
 * Retorna informações completas sobre um intervalo
 */
export function getIntervalInfo(semitones: number): MusicInterval {
  // Para intervalos simples (0-12 semitons)
  if (semitones >= 0 && semitones <= 12) {
    const interval = Object.values(INTERVAL_DEFINITIONS).find(
      i => i.semitones === semitones
    );
    
    if (interval) {
      return interval;
    }
  }
  
  // Para intervalos compostos
  if (semitones > 12 && semitones in COMPOUND_INTERVALS) {
    const compound = COMPOUND_INTERVALS[semitones];
    const baseInterval = INTERVAL_DEFINITIONS[compound.baseInterval];
    
    return {
      type: compound.baseInterval,
      semitones: semitones,
      name: compound.name,
      abbreviation: `${baseInterval.abbreviation.replace(/\d/, '')}${semitones - 7}`,
      consonant: baseInterval.consonant
    };
  }
  
  // Intervalo não reconhecido
  return {
    type: 'unison',
    semitones: semitones,
    name: `${semitones} Semitons`,
    abbreviation: `${semitones}st`,
    consonant: false
  };
}

/**
 * Retorna informações do intervalo entre duas notas
 */
export function getIntervalBetween(
  fromNote: AnyNoteName, 
  toNote: AnyNoteName
): MusicInterval {
  const semitones = calculateInterval(fromNote, toNote);
  return getIntervalInfo(semitones);
}

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================

/**
 * Verifica se um intervalo é consonante
 */
export function isConsonantInterval(semitones: number): boolean {
  const interval = getIntervalInfo(semitones);
  return interval.consonant;
}

/**
 * Verifica se um intervalo é dissonante
 */
export function isDissonantInterval(semitones: number): boolean {
  return !isConsonantInterval(semitones);
}

/**
 * Retorna a nota resultante de aplicar um intervalo a uma nota base
 */
export function applyInterval(
  baseNote: AnyNoteName,
  interval: IntervalType | number,
  direction: 'up' | 'down' = 'up'
): NoteName {
  let semitones: number;
  
  if (typeof interval === 'number') {
    semitones = interval;
  } else {
    semitones = INTERVAL_DEFINITIONS[interval].semitones;
  }
  
  // Ajusta a direção
  if (direction === 'down') {
    semitones = -semitones;
  }
  
  const baseIndex = getNoteIndex(baseNote);
  const resultIndex = baseIndex + semitones;
  
  return getNoteByIndex(resultIndex) as NoteName;
}

/**
 * Inverte um intervalo (ex: 3ª menor para 6ª maior)
 */
export function invertInterval(semitones: number): number {
  return (12 - semitones) % 12;
}

/**
 * Retorna o intervalo invertido entre duas notas
 */
export function getInvertedIntervalBetween(
  fromNote: AnyNoteName, 
  toNote: AnyNoteName
): MusicInterval {
  const interval = getIntervalBetween(fromNote, toNote);
  const invertedSemitones = invertInterval(interval.semitones);
  return getIntervalInfo(invertedSemitones);
}

// ============================================
// FUNÇÕES DE CLASSIFICAÇÃO
// ============================================

/**
 * Classifica um intervalo por tipo
 */
export function classifyInterval(semitones: number): {
  type: 'perfect' | 'major' | 'minor' | 'augmented' | 'diminished' | 'tritone';
  quality: string;
} {
  const interval = getIntervalInfo(semitones);
  
  // Intervalos perfeitos
  if ([0, 5, 7, 12].includes(semitones)) {
    return { type: 'perfect', quality: 'justo' };
  }
  
  // Intervalos maiores/menores
  if ([2, 4, 9, 11].includes(semitones)) {
    return { type: 'major', quality: 'maior' };
  }
  
  if ([1, 3, 8, 10].includes(semitones)) {
    return { type: 'minor', quality: 'menor' };
  }
  
  // Trítono
  if (semitones === 6) {
    return { type: 'tritone', quality: 'aumentado/diminuído' };
  }
  
  // Para intervalos compostos ou não padronizados
  return { type: 'augmented', quality: 'especial' };
}

/**
 * Verifica se dois intervalos são complementares
 */
export function areIntervalsComplementary(interval1: number, interval2: number): boolean {
  return (interval1 + interval2) % 12 === 0;
}

// ============================================
// FUNÇÕES PARA ESCALAS E ACORDES
// ============================================

/**
 * Retorna os intervalos de uma escala a partir de suas notas
 */
export function getIntervalsFromNotes(notes: AnyNoteName[]): number[] {
  if (notes.length < 2) return [];
  
  const intervals: number[] = [];
  const firstNote = toSharpNote(notes[0]);
  
  for (let i = 1; i < notes.length; i++) {
    const interval = calculateInterval(firstNote, notes[i]);
    intervals.push(interval);
  }
  
  return intervals;
}

/**
 * Verifica se uma sequência de intervalos corresponde a um tipo de escala conhecido
 */
export function matchScaleByIntervals(intervals: number[]): {
  matched: boolean;
  possibleScales: string[];
  exactMatch?: string;
} {
  // Esta é uma implementação simplificada
  // Em uma versão completa, compararia com intervalos de todas as escalas conhecidas
  
  const scalePatterns: Record<string, number[]> = {
    'major': [2, 2, 1, 2, 2, 2, 1],
    'natural-minor': [2, 1, 2, 2, 1, 2, 2],
    'harmonic-minor': [2, 1, 2, 2, 1, 3, 1],
    'major-pentatonic': [2, 2, 3, 2],
    'minor-pentatonic': [3, 2, 2, 3]
  };
  
  const possibleScales: string[] = [];
  let exactMatch: string | undefined;
  
  // Converte intervalos absolutos para diferenças entre notas consecutivas
  const consecutiveIntervals: number[] = [];
  for (let i = 1; i < intervals.length; i++) {
    consecutiveIntervals.push((intervals[i] - intervals[i - 1] + 12) % 12);
  }
  
  // Compara com padrões conhecidos
  for (const [scaleName, pattern] of Object.entries(scalePatterns)) {
    if (JSON.stringify(consecutiveIntervals) === JSON.stringify(pattern)) {
      exactMatch = scaleName;
      possibleScales.push(scaleName);
    } else if (consecutiveIntervals.length === pattern.length) {
      // Poderia adicionar lógica para correspondência parcial
      possibleScales.push(scaleName);
    }
  }
  
  return {
    matched: possibleScales.length > 0,
    possibleScales,
    exactMatch
  };
}

/**
 * Retorna os intervalos de um acorde a partir de suas notas
 */
export function getChordIntervals(notes: AnyNoteName[]): MusicInterval[] {
  if (notes.length < 2) return [];
  
  const rootNote = toSharpNote(notes[0]);
  const intervals: MusicInterval[] = [];
  
  for (let i = 1; i < notes.length; i++) {
    const interval = getIntervalBetween(rootNote, notes[i]);
    intervals.push(interval);
  }
  
  return intervals;
}

// ============================================
// FUNÇÕES DE TREINO E EDUCAÇÃO
// ============================================

/**
 * Gera um intervalo aleatório para exercício
 */
export function generateRandomInterval(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy'
): {
  fromNote: NoteName;
  interval: MusicInterval;
  toNote: NoteName;
} {
  const easyIntervals: IntervalType[] = ['unison', 'major-second', 'major-third', 'perfect-fourth', 'perfect-fifth'];
  const mediumIntervals: IntervalType[] = ['minor-second', 'minor-third', 'major-sixth', 'minor-seventh'];
  const hardIntervals: IntervalType[] = ['tritone', 'major-seventh', 'octave'];
  
  let availableIntervals: IntervalType[];
  
  switch (difficulty) {
    case 'easy':
      availableIntervals = easyIntervals;
      break;
    case 'medium':
      availableIntervals = [...easyIntervals, ...mediumIntervals];
      break;
    case 'hard':
      availableIntervals = [...easyIntervals, ...mediumIntervals, ...hardIntervals];
      break;
    default:
      availableIntervals = easyIntervals;
  }
  
  // Escolhe uma nota raiz aleatória (apenas notas simples para fácil)
  const easyNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const fromNote = easyNotes[Math.floor(Math.random() * easyNotes.length)];
  
  // Escolhe um intervalo aleatório
  const intervalType = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
  const interval = INTERVAL_DEFINITIONS[intervalType];
  
  // Calcula a nota alvo
  const toNote = applyInterval(fromNote, intervalType);
  
  return { fromNote, interval, toNote };
}

/**
 * Verifica se a resposta do usuário para um intervalo está correta
 */
export function checkIntervalAnswer(
  fromNote: NoteName,
  toNote: NoteName,
  userAnswer: IntervalType
): {
  correct: boolean;
  actualInterval: MusicInterval;
  userInterval: MusicInterval;
  feedback: string;
} {
  const actualInterval = getIntervalBetween(fromNote, toNote);
  const userInterval = INTERVAL_DEFINITIONS[userAnswer];
  
  const correct = actualInterval.type === userAnswer;
  
  let feedback = '';
  if (correct) {
    feedback = `✅ Correto! ${fromNote} para ${toNote} é uma ${actualInterval.name}.`;
  } else {
    feedback = `❌ Incorreto. ${fromNote} para ${toNote} é uma ${actualInterval.name}, não ${userInterval.name}.`;
  }
  
  return {
    correct,
    actualInterval,
    userInterval,
    feedback
  };
}