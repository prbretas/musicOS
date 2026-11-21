/**
 * Tipos TypeScript para o sistema de instrumentos musicais
 */

import { Note, Octave } from '@/lib/music-theory/types';

// ============================================
// TIPOS BÁSICOS
// ============================================

/**
 * Categoria de instrumento musical
 */
export type InstrumentCategory =
  | 'keyboard'      // Piano, teclado, órgão
  | 'string'        // Guitarra, violão, baixo, violino
  | 'wind'          // Flauta, saxofone, trompete
  | 'percussion'    // Bateria, pandeiro, tambor
  | 'electronic'    // Sintetizador, controlador MIDI
  | 'other';        // Outros

/**
 * Tipo específico de instrumento
 */
export type InstrumentType =
  // Teclados
  | 'piano'
  | 'keyboard'
  | 'organ'
  | 'synth'
  
  // Cordas
  | 'acoustic-guitar'
  | 'electric-guitar'
  | 'classical-guitar'
  | 'bass-guitar'
  | 'ukulele'
  | 'violin'
  | 'viola'
  | 'cello'
  | 'double-bass'
  | 'harp'
  
  // Sopros
  | 'flute'
  | 'clarinet'
  | 'saxophone'
  | 'trumpet'
  | 'trombone'
  
  // Percussão
  | 'drum-set'
  | 'cajon'
  | 'congas'
  
  // Eletrônicos
  | 'midi-controller'
  | 'daw';

/**
 * Afinação de uma corda ou nota
 */
export interface Tuning {
  /** Nota da afinação */
  note: Note;
  
  /** Oitava da afinação */
  octave: Octave;
  
  /** Afinação em Hertz */
  frequency: number;
  
  /** Descrição opcional */
  description?: string;
}

/**
 * Afinação completa de um instrumento
 */
export interface InstrumentTuning {
  /** Nome da afinação (ex: "Standard", "Drop D") */
  name: string;
  
  /** Afinações por corda/posição */
  tunings: Tuning[];
  
  /** Descrição */
  description?: string;
  
  /** Categoria (standard, alternate, custom) */
  category: 'standard' | 'alternate' | 'custom';
}

/**
 * Configuração de range do instrumento
 */
export interface InstrumentRange {
  /** Nota mais grave */
  lowestNote: {
    note: Note;
    octave: Octave;
  };
  
  /** Nota mais aguda */
  highestNote: {
    note: Note;
    octave: Octave;
  };
  
  /** Número total de semitons */
  totalSemitones: number;
}

/**
 * Posição de uma nota no instrumento
 */
export interface NotePosition {
  /** String/corda (para instrumentos de corda) */
  string?: number;
  
  /** Casa/traste (para instrumentos de corda) */
  fret?: number;
  
  /** Tecla (para instrumentos de teclado) */
  key?: number;
  
  /** Posição X em uma representação visual */
  x?: number;
  
  /** Posição Y em uma representação visual */
  y?: number;
  
  /** Nota correspondente */
  note: Note;
  
  /** Oitava */
  octave: Octave;
}

/**
 * Representação visual do instrumento
 */
export interface InstrumentVisualization {
  /** Tipo de visualização */
  type: 'fretboard' | 'keyboard' | 'staff' | 'piano-roll';
  
  /** Configurações específicas do tipo */
  config: Record<string, any>;
  
  /** Posições das notas */
  notePositions: NotePosition[];
}

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Configuração de um instrumento
 */
export interface InstrumentConfig {
  /** ID único do instrumento */
  id: string;
  
  /** Nome de exibição */
  name: string;
  
  /** Tipo do instrumento */
  type: InstrumentType;
  
  /** Categoria do instrumento */
  category: InstrumentCategory;
  
  /** Descrição do instrumento */
  description: string;
  
  /** Imagem/ícone do instrumento */
  icon?: string;
  
  /** Range de notas do instrumento */
  range: InstrumentRange;
  
  /** Número de cordas (para instrumentos de corda) */
  strings?: number;
  
  /** Número de teclas (para instrumentos de teclado) */
  keys?: number;
  
  /** Afinações disponíveis */
  availableTunings: InstrumentTuning[];
  
  /** Afinação padrão */
  defaultTuning: string;
  
  /** Configurações visuais padrão */
  defaultVisualization: InstrumentVisualization;
  
  /** Flag para instrumento do tier gratuito */
  isFreeTier: boolean;
  
  /** Requisitos do instrumento (ex: "premium-tier") */
  requirements?: string[];
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Estado atual de um instrumento
 */
export interface InstrumentState {
  /** Configuração do instrumento */
  config: InstrumentConfig;
  
  /** Afinação atual */
  currentTuning: InstrumentTuning;
  
  /** Range atual */
  currentRange: InstrumentRange;
  
  /** Visualização atual */
  currentVisualization: InstrumentVisualization;
  
  /** Notas sendo tocadas atualmente */
  activeNotes: Array<{
    note: Note;
    octave: Octave;
    position: NotePosition;
    velocity?: number; // 0-127 para MIDI
  }>;
  
  /** Configurações customizadas */
  customSettings: Record<string, any>;
}

/**
 * Resultado do mapeamento de uma nota para o instrumento
 */
export interface NoteMappingResult {
  /** Posições possíveis para tocar a nota */
  positions: NotePosition[];
  
  /** Posição recomendada (se houver) */
  recommendedPosition?: NotePosition;
  
  /** Dificuldade relativa (1-10) */
  difficulty?: number;
  
  /** Informações adicionais */
  metadata?: Record<string, any>;
}

/**
 * Eventos do instrumento
 */
export interface InstrumentEvents {
  /** Quando uma nota é tocada */
  noteOn: (note: Note, octave: Octave, velocity?: number) => void;
  
  /** Quando uma nota para de ser tocada */
  noteOff: (note: Note, octave: Octave) => void;
  
  /** Quando a afinação muda */
  tuningChanged: (oldTuning: InstrumentTuning, newTuning: InstrumentTuning) => void;
  
  /** Quando o range muda */
  rangeChanged: (oldRange: InstrumentRange, newRange: InstrumentRange) => void;
  
  /** Quando a visualização muda */
  visualizationChanged: (
    oldVisualization: InstrumentVisualization,
    newVisualization: InstrumentVisualization
  ) => void;
}

// ============================================
// TIPOS PARA O REGISTRY
// ============================================

/**
 * Opções para criar um instrumento
 */
export interface CreateInstrumentOptions {
  /** ID do instrumento */
  id?: string;
  
  /** Configuração personalizada */
  config?: Partial<InstrumentConfig>;
  
  /** Afinação inicial */
  initialTuning?: string;
  
  /** Range inicial */
  initialRange?: InstrumentRange;
  
  /** Configurações iniciais */
  initialSettings?: Record<string, any>;
}

/**
 * Filtros para buscar instrumentos
 */
export interface InstrumentFilter {
  /** Filtrar por categoria */
  category?: InstrumentCategory | InstrumentCategory[];
  
  /** Filtrar por tipo */
  type?: InstrumentType | InstrumentType[];
  
  /** Filtrar por tier */
  tier?: 'free' | 'premium' | 'all';
  
  /** Filtrar por número mínimo de cordas/teclas */
  minStrings?: number;
  minKeys?: number;
  
  /** Filtrar por range de notas */
  requiredRange?: {
    lowestNote: Note;
    lowestOctave: Octave;
    highestNote: Note;
    highestOctave: Octave;
  };
  
  /** Termo de busca textual */
  search?: string;
}

/**
 * Resultado da busca por instrumentos
 */
export interface InstrumentSearchResult {
  /** Instrumentos encontrados */
  instruments: InstrumentConfig[];
  
  /** Total de instrumentos correspondentes */
  total: number;
  
  /** Página atual (para paginação) */
  page?: number;
  
  /** Itens por página */
  perPage?: number;
}

// ============================================
// CONSTANTES E PRESETS
// ============================================

/**
 * Afinações padrão para diferentes instrumentos
 */
export const STANDARD_TUNINGS: Record<InstrumentType, InstrumentTuning[]> = {
  'piano': [
    {
      name: 'Standard',
      tunings: [], // Piano não tem afinação por corda
      description: 'Afinação padrão de piano (A4 = 440Hz)',
      category: 'standard'
    }
  ],
  'acoustic-guitar': [
    {
      name: 'Standard',
      tunings: [
        { note: 'E', octave: 2, frequency: 82.41, description: '6ª corda (E2)' },
        { note: 'A', octave: 2, frequency: 110.00, description: '5ª corda (A2)' },
        { note: 'D', octave: 3, frequency: 146.83, description: '4ª corda (D3)' },
        { note: 'G', octave: 3, frequency: 196.00, description: '3ª corda (G3)' },
        { note: 'B', octave: 3, frequency: 246.94, description: '2ª corda (B3)' },
        { note: 'E', octave: 4, frequency: 329.63, description: '1ª corda (E4)' }
      ],
      description: 'Afinação padrão de guitarra/violão (EADGBE)',
      category: 'standard'
    },
    {
      name: 'Drop D',
      tunings: [
        { note: 'D', octave: 2, frequency: 73.42, description: '6ª corda (D2)' },
        { note: 'A', octave: 2, frequency: 110.00, description: '5ª corda (A2)' },
        { note: 'D', octave: 3, frequency: 146.83, description: '4ª corda (D3)' },
        { note: 'G', octave: 3, frequency: 196.00, description: '3ª corda (G3)' },
        { note: 'B', octave: 3, frequency: 246.94, description: '2ª corda (B3)' },
        { note: 'E', octave: 4, frequency: 329.63, description: '1ª corda (E4)' }
      ],
      description: 'Afinação Drop D (DADGBE)',
      category: 'alternate'
    }
  ],
  'ukulele': [
    {
      name: 'Standard (GCEA)',
      tunings: [
        { note: 'G', octave: 4, frequency: 392.00, description: '4ª corda (G4)' },
        { note: 'C', octave: 4, frequency: 261.63, description: '3ª corda (C4)' },
        { note: 'E', octave: 4, frequency: 329.63, description: '2ª corda (E4)' },
        { note: 'A', octave: 4, frequency: 440.00, description: '1ª corda (A4)' }
      ],
      description: 'Afinação padrão de ukulele soprano',
      category: 'standard'
    }
  ],
  'bass-guitar': [
    {
      name: 'Standard',
      tunings: [
        { note: 'E', octave: 1, frequency: 41.20, description: '4ª corda (E1)' },
        { note: 'A', octave: 1, frequency: 55.00, description: '3ª corda (A1)' },
        { note: 'D', octave: 2, frequency: 73.42, description: '2ª corda (D2)' },
        { note: 'G', octave: 2, frequency: 98.00, description: '1ª corda (G2)' }
      ],
      description: 'Afinação padrão de baixo (EADG)',
      category: 'standard'
    }
  ],
  'violin': [
    {
      name: 'Standard',
      tunings: [
        { note: 'G', octave: 3, frequency: 196.00, description: '4ª corda (G3)' },
        { note: 'D', octave: 4, frequency: 293.66, description: '3ª corda (D4)' },
        { note: 'A', octave: 4, frequency: 440.00, description: '2ª corda (A4)' },
        { note: 'E', octave: 5, frequency: 659.26, description: '1ª corda (E5)' }
      ],
      description: 'Afinação padrão de violino (GDAE)',
      category: 'standard'
    }
  ],
  
  // Placeholders para outros instrumentos
  'electric-guitar': [],
  'classical-guitar': [],
  'keyboard': [],
  'organ': [],
  'synth': [],
  'viola': [],
  'cello': [],
  'double-bass': [],
  'harp': [],
  'flute': [],
  'clarinet': [],
  'saxophone': [],
  'trumpet': [],
  'trombone': [],
  'drum-set': [],
  'cajon': [],
  'congas': [],
  'midi-controller': [],
  'daw': []
};

/**
 * Ranges padrão para diferentes instrumentos
 */
export const STANDARD_RANGES: Record<InstrumentType, InstrumentRange> = {
  'piano': {
    lowestNote: { note: 'A', octave: 0 },
    highestNote: { note: 'C', octave: 8 },
    totalSemitones: 88
  },
  'acoustic-guitar': {
    lowestNote: { note: 'E', octave: 2 },
    highestNote: { note: 'E', octave: 6 },
    totalSemitones: 48 // 4 oitavas
  },
  'ukulele': {
    lowestNote: { note: 'C', octave: 4 },
    highestNote: { note: 'A', octave: 6 },
    totalSemitones: 27 // ~2 oitavas
  },
  'bass-guitar': {
    lowestNote: { note: 'E', octave: 1 },
    highestNote: { note: 'G', octave: 4 },
    totalSemitones: 39 // ~3 oitavas
  },
  'violin': {
    lowestNote: { note: 'G', octave: 3 },
    highestNote: { note: 'E', octave: 7 },
    totalSemitones: 48 // ~4 oitavas
  },
  
  // Default ranges para outros instrumentos
  'electric-guitar': {
    lowestNote: { note: 'E', octave: 2 },
    highestNote: { note: 'E', octave: 6 },
    totalSemitones: 48
  },
  'classical-guitar': {
    lowestNote: { note: 'E', octave: 2 },
    highestNote: { note: 'E', octave: 6 },
    totalSemitones: 48
  },
  'keyboard': {
    lowestNote: { note: 'C', octave: 2 },
    highestNote: { note: 'C', octave: 7 },
    totalSemitones: 61
  },
  'organ': {
    lowestNote: { note: 'C', octave: 2 },
    highestNote: { note: 'C', octave: 7 },
    totalSemitones: 61
  },
  'synth': {
    lowestNote: { note: 'C', octave: 0 },
    highestNote: { note: 'C', octave: 8 },
    totalSemitones: 97
  },
  'viola': {
    lowestNote: { note: 'C', octave: 3 },
    highestNote: { note: 'A', octave: 6 },
    totalSemitones: 39
  },
  'cello': {
    lowestNote: { note: 'C', octave: 2 },
    highestNote: { note: 'A', octave: 5 },
    totalSemitones: 39
  },
  'double-bass': {
    lowestNote: { note: 'E', octave: 1 },
    highestNote: { note: 'G', octave: 4 },
    totalSemitones: 39
  },
  'harp': {
    lowestNote: { note: 'C', octave: 1 },
    highestNote: { note: 'G', octave: 7 },
    totalSemitones: 78
  },
  'flute': {
    lowestNote: { note: 'C', octave: 4 },
    highestNote: { note: 'C', octave: 7 },
    totalSemitones: 36
  },
  'clarinet': {
    lowestNote: { note: 'D', octave: 3 },
    highestNote: { note: 'B', octave: 6 },
    totalSemitones: 41
  },
  'saxophone': {
    lowestNote: { note: 'A#', octave: 3 },
    highestNote: { note: 'F', octave: 6 },
    totalSemitones: 30
  },
  'trumpet': {
    lowestNote: { note: 'F#', octave: 3 },
    highestNote: { note: 'D', octave: 6 },
    totalSemitones: 31
  },
  'trombone': {
    lowestNote: { note: 'E', octave: 2 },
    highestNote: { note: 'B', octave: 5 },
    totalSemitones: 41
  },
  'drum-set': {
    lowestNote: { note: 'C', octave: 2 },
    highestNote: { note: 'C', octave: 6 },
    totalSemitones: 48
  },
  'cajon': {
    lowestNote: { note: 'C', octave: 2 },
    highestNote: { note: 'C', octave: 5 },
    totalSemitones: 36
  },
  'congas': {
    lowestNote: { note: 'G', octave: 2 },
    highestNote: { note: 'C', octave: 5 },
    totalSemitones: 31
  },
  'midi-controller': {
    lowestNote: { note: 'C', octave: 0 },
    highestNote: { note: 'G', octave: 9 },
    totalSemitones: 120
  },
  'daw': {
    lowestNote: { note: 'C', octave: 0 },
    highestNote: { note: 'G', octave: 9 },
    totalSemitones: 120
  }
};