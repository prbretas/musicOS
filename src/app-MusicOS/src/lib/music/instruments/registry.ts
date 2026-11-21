/**
 * InstrumentRegistry
 * CORE-002: Sistema de registro e gerenciamento de instrumentos
 * 
 * Este módulo fornece:
 * 1. Registro centralizado de perfis de instrumentos
 * 2. Afinações padrão e customizadas
 * 3. Mapeamento de notas no braço
 * 4. Utilitários para cálculo de posições
 */

import type { InstrumentProfile, InstrumentId, NoteName } from '@/types/music';

// ============================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================

/**
 * Afinações padrão para diferentes instrumentos
 * Formato: [corda_mais_grave, ..., corda_mais_aguda]
 */
const STANDARD_TUNINGS: Record<string, NoteName[]> = {
  // Guitarra padrão (6 cordas)
  'standard-guitar': ['E', 'A', 'D', 'G', 'B', 'E'],
  
  // Guitarra drop D
  'drop-d': ['D', 'A', 'D', 'G', 'B', 'E'],
  
  // Guitarra open G
  'open-g': ['D', 'G', 'D', 'G', 'B', 'D'],
  
  // Guitarra open D
  'open-d': ['D', 'A', 'D', 'F#', 'A', 'D'],
  
  // Ukulele padrão (GCEA - High G)
  'standard-ukulele': ['G', 'C', 'E', 'A'],
  
  // Ukulele Low G
  'low-g-ukulele': ['G', 'C', 'E', 'A'], // Mesmas notas, G uma oitava abaixo
  
  // Baixo 4 cordas padrão
  'standard-bass': ['E', 'A', 'D', 'G'],
  
  // Baixo 5 cordas (B standard)
  'b-standard-bass': ['B', 'E', 'A', 'D', 'G'],
  
  // Violão 12 cordas (pares de cordas)
  '12-string-guitar': ['E', 'E', 'A', 'A', 'D', 'D', 'G', 'G', 'B', 'B', 'E', 'E'],
};

/**
 * Oitavas padrão para afinações
 * Formato: [oitava_corda_grave, ..., oitava_corda_aguda]
 */
const STANDARD_OCTAVES: Record<string, number[]> = {
  'standard-guitar': [2, 2, 3, 3, 3, 4],
  'standard-ukulele': [4, 4, 4, 4],
  'standard-bass': [1, 1, 2, 2],
  'b-standard-bass': [1, 1, 2, 2, 2],
};

// ============================================
// PERFIS DE INSTRUMENTOS PRÉ-DEFINIDOS
// ============================================

const DEFAULT_INSTRUMENTS: Record<InstrumentId, InstrumentProfile> = {
  // Guitarra 6 cordas (EADGBE)
  'guitarra-6': {
    id: 'guitarra-6',
    name: 'Guitarra (6 cordas)',
    strings: 6,
    tuning: STANDARD_TUNINGS['standard-guitar'],
    octaves: STANDARD_OCTAVES['standard-guitar'],
    frets: 24,
    fretless: false,
  },

  // Violão 12 cordas
  'violao-12': {
    id: 'violao-12',
    name: 'Violão (12 cordas)',
    strings: 12,
    tuning: STANDARD_TUNINGS['12-string-guitar'],
    octaves: [2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4],
    frets: 20,
    fretless: false,
  },

  // Ukulele (GCEA)
  'ukulele': {
    id: 'ukulele',
    name: 'Ukulele (GCEA)',
    strings: 4,
    tuning: STANDARD_TUNINGS['standard-ukulele'],
    octaves: STANDARD_OCTAVES['standard-ukulele'],
    frets: 15,
    fretless: false,
  },

  // Baixo 4 cordas
  'baixo-4': {
    id: 'baixo-4',
    name: 'Baixo (4 cordas)',
    strings: 4,
    tuning: STANDARD_TUNINGS['standard-bass'],
    octaves: STANDARD_OCTAVES['standard-bass'],
    frets: 24,
    fretless: false,
  },

  // Baixo 5 cordas
  'baixo-5': {
    id: 'baixo-5',
    name: 'Baixo (5 cordas)',
    strings: 5,
    tuning: STANDARD_TUNINGS['b-standard-bass'],
    octaves: STANDARD_OCTAVES['b-standard-bass'],
    frets: 24,
    fretless: false,
  },
};

// ============================================
// TUNINGS CUSTOMIZADAS (PRESETS)
// ============================================

const TUNING_PRESETS: Record<string, { name: string; tuning: NoteName[]; instrument: InstrumentId }> = {
  // Guitarra
  'guitar-drop-d': {
    name: 'Drop D',
    tuning: ['D', 'A', 'D', 'G', 'B', 'E'],
    instrument: 'guitarra-6',
  },
  'guitar-open-g': {
    name: 'Open G',
    tuning: ['D', 'G', 'D', 'G', 'B', 'D'],
    instrument: 'guitarra-6',
  },
  'guitar-dadgad': {
    name: 'DADGAD',
    tuning: ['D', 'A', 'D', 'G', 'A', 'D'],
    instrument: 'guitarra-6',
  },
  'guitar-e-flat': {
    name: 'E♭ Standard',
    tuning: ['D#', 'G#', 'C#', 'F#', 'A#', 'D#'],
    instrument: 'guitarra-6',
  },
  
  // Ukulele
  'ukulele-low-g': {
    name: 'Low G',
    tuning: ['G', 'C', 'E', 'A'], // G uma oitava abaixo
    instrument: 'ukulele',
  },
  'ukulele-d-tuning': {
    name: 'D Tuning (ADF#B)',
    tuning: ['A', 'D', 'F#', 'B'],
    instrument: 'ukulele',
  },
  
  // Baixo
  'bass-drop-d': {
    name: 'Bass Drop D',
    tuning: ['D', 'A', 'D', 'G'],
    instrument: 'baixo-4',
  },
  'bass-c-standard': {
    name: 'Bass C Standard',
    tuning: ['C', 'G', 'C', 'F'],
    instrument: 'baixo-4',
  },
};

// ============================================
// CLASS PRINCIPAL: INSTRUMENT REGISTRY
// ============================================

class InstrumentRegistry {
  private static instance: InstrumentRegistry;
  private customInstruments: Map<string, InstrumentProfile> = new Map();
  private customTunings: Map<string, NoteName[]> = new Map();
  private userDefaultInstrument: InstrumentId = 'guitarra-6';

  private constructor() {
    // Inicializar com instrumentos padrão
    Object.values(DEFAULT_INSTRUMENTS).forEach(instrument => {
      this.customInstruments.set(instrument.id, instrument);
    });

    // Inicializar com afinações pré-definidas
    Object.entries(TUNING_PRESETS).forEach(([id, preset]) => {
      this.customTunings.set(id, preset.tuning);
    });
  }

  /**
   * Obter instância singleton do registro
   */
  public static getInstance(): InstrumentRegistry {
    if (!InstrumentRegistry.instance) {
      InstrumentRegistry.instance = new InstrumentRegistry();
    }
    return InstrumentRegistry.instance;
  }

  // ============================================
  // OPERAÇÕES BÁSICAS
  // ============================================

  /**
   * Obter todos os instrumentos disponíveis
   */
  getAll(): InstrumentProfile[] {
    return Array.from(this.customInstruments.values());
  }

  /**
   * Obter instrumento por ID
   */
  getById(id: string): InstrumentProfile | null {
    return this.customInstruments.get(id) || null;
  }

  /**
   * Obter instrumento padrão
   */
  getDefault(): InstrumentProfile {
    return this.getById(this.userDefaultInstrument) || DEFAULT_INSTRUMENTS['guitarra-6'];
  }

  /**
   * Definir instrumento padrão do usuário
   */
  setDefaultInstrument(id: InstrumentId): void {
    if (this.customInstruments.has(id)) {
      this.userDefaultInstrument = id;
    }
  }

  // ============================================
  // REGISTRO DE NOVOS INSTRUMENTOS
  // ============================================

  /**
   * Registrar novo instrumento personalizado
   */
  registerInstrument(profile: InstrumentProfile): boolean {
    if (this.customInstruments.has(profile.id)) {
      console.warn(`Instrumento com ID ${profile.id} já existe. Use updateInstrument para modificações.`);
      return false;
    }

    // Validar dados do instrumento
    if (!this.validateInstrumentProfile(profile)) {
      console.error('Perfil de instrumento inválido');
      return false;
    }

    this.customInstruments.set(profile.id, profile);
    return true;
  }

  /**
   * Atualizar instrumento existente
   */
  updateInstrument(id: string, updates: Partial<InstrumentProfile>): boolean {
    const existing = this.customInstruments.get(id);
    if (!existing) {
      console.error(`Instrumento ${id} não encontrado`);
      return false;
    }

    const updated = { ...existing, ...updates };
    if (!this.validateInstrumentProfile(updated)) {
      console.error('Perfil de instrumento atualizado é inválido');
      return false;
    }

    this.customInstruments.set(id, updated);
    return true;
  }

  /**
   * Remover instrumento personalizado
   */
  removeInstrument(id: string): boolean {
    // Não permitir remover instrumentos padrão
    if (id in DEFAULT_INSTRUMENTS) {
      console.error(`Não é possível remover instrumento padrão: ${id}`);
      return false;
    }

    return this.customInstruments.delete(id);
  }

  // ============================================
  // GERENCIAMENTO DE AFINAÇÕES
  // ============================================

  /**
   * Obter afinação padrão para um instrumento
   */
  getDefaultTuning(instrumentId: string): NoteName[] | null {
    const instrument = this.getById(instrumentId);
    return instrument ? instrument.tuning : null;
  }

  /**
   * Obter todas as afinações disponíveis para um instrumento
   */
  getAvailableTunings(instrumentId: string): Array<{ id: string; name: string; tuning: NoteName[] }> {
    const result: Array<{ id: string; name: string; tuning: NoteName[] }> = [];
    
    // Afinação padrão do instrumento
    const instrument = this.getById(instrumentId);
    if (instrument) {
      result.push({
        id: 'standard',
        name: 'Padrão',
        tuning: instrument.tuning,
      });
    }

    // Presets específicos para este instrumento
    Object.entries(TUNING_PRESETS).forEach(([id, preset]) => {
      if (preset.instrument === instrumentId) {
        result.push({
          id,
          name: preset.name,
          tuning: preset.tuning,
        });
      }
    });

    // Afinações personalizadas
    this.customTunings.forEach((tuning, id) => {
      // Verificar se a afinação é compatível com o número de cordas
      if (instrument && tuning.length === instrument.strings) {
        result.push({
          id,
          name: `Personalizada ${id}`,
          tuning,
        });
      }
    });

    return result;
  }

  /**
   * Salvar afinação personalizada
   */
  saveCustomTuning(id: string, tuning: NoteName[], instrumentId: string): boolean {
    const instrument = this.getById(instrumentId);
    if (!instrument) {
      console.error(`Instrumento ${instrumentId} não encontrado`);
      return false;
    }

    if (tuning.length !== instrument.strings) {
      console.error(`Afinação deve ter ${instrument.strings} notas para ${instrument.name}`);
      return false;
    }

    this.customTunings.set(id, tuning);
    return true;
  }

  // ============================================
  // UTILITÁRIOS DE CÁLCULO
  // ============================================

  /**
   * Calcular a nota em uma posição específica do braço
   */
  calculateNoteAtPosition(
    instrumentId: string,
    stringIndex: number, // 0 = corda mais grave
    fret: number
  ): NoteName | null {
    const instrument = this.getById(instrumentId);
    if (!instrument) return null;

    if (stringIndex < 0 || stringIndex >= instrument.strings) {
      console.error(`Índice de corda inválido: ${stringIndex}`);
      return null;
    }

    if (fret < 0 || fret > instrument.frets) {
      console.error(`Traste inválido: ${fret}`);
      return null;
    }

    const openNote = instrument.tuning[stringIndex];
    const octave = instrument.octaves[stringIndex];
    
    // Calcular nota considerando cromática
    return this.transposeNote(openNote, fret);
  }

  /**
   * Encontrar todas as posições de uma nota no braço
   */
  findNotePositions(
    instrumentId: string,
    targetNote: NoteName
  ): Array<{ string: number; fret: number }> {
    const instrument = this.getById(instrumentId);
    if (!instrument) return [];

    const positions: Array<{ string: number; fret: number }> = [];

    for (let stringIndex = 0; stringIndex < instrument.strings; stringIndex++) {
      for (let fret = 0; fret <= instrument.frets; fret++) {
        const note = this.calculateNoteAtPosition(instrumentId, stringIndex, fret);
        if (note === targetNote) {
          positions.push({ string: stringIndex, fret });
        }
      }
    }

    return positions;
  }

  /**
   * Obter intervalo entre duas notas no braço
   */
  getIntervalBetweenPositions(
    instrumentId: string,
    pos1: { string: number; fret: number },
    pos2: { string: number; fret: number }
  ): number | null {
    const note1 = this.calculateNoteAtPosition(instrumentId, pos1.string, pos1.fret);
    const note2 = this.calculateNoteAtPosition(instrumentId, pos2.string, pos2.fret);

    if (!note1 || !note2) return null;

    return this.calculateInterval(note1, note2);
  }

  // ============================================
  // UTILITÁRIOS PRIVADOS
  // ============================================

  private validateInstrumentProfile(profile: InstrumentProfile): boolean {
    if (!profile.id || !profile.name || !profile.tuning || !profile.octaves) {
      return false;
    }

    if (profile.strings <= 0 || profile.frets <= 0) {
      return false;
    }

    if (profile.tuning.length !== profile.strings) {
      return false;
    }

    if (profile.octaves.length !== profile.strings) {
      return false;
    }

    // Validar que todas as notas são válidas
    const validNotes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (const note of profile.tuning) {
      if (!validNotes.includes(note)) {
        return false;
      }
    }

    return true;
  }

  private transposeNote(note: NoteName, semitones: number): NoteName {
    const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(note);
    if (index === -1) return note;

    const newIndex = (index + semitones) % 12;
    return notes[newIndex];
  }

  private calculateInterval(note1: NoteName, note2: NoteName): number {
    const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index1 = notes.indexOf(note1);
    const index2 = notes.indexOf(note2);

    if (index1 === -1 || index2 === -1) return 0;

    return (index2 - index1 + 12) % 12;
  }
}

// ============================================
// EXPORTAÇÕES E INSTÂNCIA PADRÃO
// ============================================

export const instrumentRegistry = InstrumentRegistry.getInstance();

// Exportar tipos e constantes úteis
export { DEFAULT_INSTRUMENTS, TUNING_PRESETS, STANDARD_TUNINGS };
export type { InstrumentProfile, InstrumentId };

// Funções auxiliares para uso comum
export const instrumentUtils = {
  /**
   * Formatar nome do instrumento para exibição
   */
  formatInstrumentName(profile: InstrumentProfile): string {
    return `${profile.name} (${profile.strings} cordas)`;
  },

  /**
   * Verificar se um instrumento é um baixo
   */
  isBass(instrumentId: string): boolean {
    return instrumentId.startsWith('baixo-');
  },

  /**
   * Verificar se um instrumento tem cordas duplas
   */
  hasDoubledStrings(instrumentId: string): boolean {
    const instrument = instrumentRegistry.getById(instrumentId);
    return instrument?.strings === 12; // Violão 12 cordas
  },

  /**
   * Obter número de casas visíveis recomendado
   */
  getRecommendedFretRange(instrumentId: string): { start: number; end: number } {
    const instrument = instrumentRegistry.getById(instrumentId);
    if (!instrument) return { start: 0, end: 12 };

    if (instrument.strings <= 4) { // Ukulele, baixo
      return { start: 0, end: Math.min(15, instrument.frets) };
    }

    // Guitarra/violão
    return { start: 0, end: Math.min(12, instrument.frets) };
  },
};

// Exportar singleton como padrão para compatibilidade
export default instrumentRegistry;