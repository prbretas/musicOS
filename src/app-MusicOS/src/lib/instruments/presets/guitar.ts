/**
 * Preset de Guitarra para o MusicOS
 * 
 * Implementação do instrumento Guitarra com suporte a:
 * - 6 cordas, afinação padrão
 * - Fretboard visual
 * - Posições de acordes e escalas
 * - Integração com teoria musical
 */

import { Instrument } from '../core/instrument';
import {
  InstrumentConfig,
  InstrumentTuning,
  InstrumentRange,
  InstrumentVisualization,
  NotePosition,
  NoteMappingResult,
  STANDARD_TUNINGS,
  STANDARD_RANGES
} from '../types/instrument';
import { Note, Octave } from '@/lib/music-theory';

/**
 * Configuração da Guitarra Acústica (6 cordas)
 */
export const ACOUSTIC_GUITAR_CONFIG: InstrumentConfig = {
  id: 'acoustic-guitar-standard',
  name: 'Guitarra Acústica',
  type: 'acoustic-guitar',
  category: 'string',
  description: 'Guitarra acústica de 6 cordas, afinação padrão EADGBE',
  icon: '🎸',
  range: STANDARD_RANGES['acoustic-guitar'],
  strings: 6,
  availableTunings: STANDARD_TUNINGS['acoustic-guitar'],
  defaultTuning: 'Standard',
  defaultVisualization: {
    type: 'fretboard',
    config: {
      frets: 20,
      showNoteNames: true,
      showStringNames: true,
      highlightScaleDegrees: true,
      showFretNumbers: true,
      stringSpacing: 20,
      fretSpacing: 30
    },
    notePositions: []
  },
  isFreeTier: true,
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Standard Acoustic',
    year: 2024,
    features: ['6 strings', '20 frets', 'standard tuning', 'free tier'],
    stringGauges: [0.013, 0.017, 0.026, 0.036, 0.046, 0.056]
  }
};

/**
 * Configuração da Guitarra Elétrica (6 cordas)
 */
export const ELECTRIC_GUITAR_CONFIG: InstrumentConfig = {
  id: 'electric-guitar-standard',
  name: 'Guitarra Elétrica',
  type: 'electric-guitar',
  category: 'string',
  description: 'Guitarra elétrica de 6 cordas, afinação padrão EADGBE',
  icon: '🎸',
  range: STANDARD_RANGES['electric-guitar'],
  strings: 6,
  availableTunings: [
    ...STANDARD_TUNINGS['acoustic-guitar'],
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
    },
    {
      name: 'Drop C',
      tunings: [
        { note: 'C', octave: 2, frequency: 65.41, description: '6ª corda (C2)' },
        { note: 'G', octave: 2, frequency: 98.00, description: '5ª corda (G2)' },
        { note: 'C', octave: 3, frequency: 130.81, description: '4ª corda (C3)' },
        { note: 'F', octave: 3, frequency: 174.61, description: '3ª corda (F3)' },
        { note: 'A', octave: 3, frequency: 220.00, description: '2ª corda (A3)' },
        { note: 'D', octave: 4, frequency: 293.66, description: '1ª corda (D4)' }
      ],
      description: 'Afinação Drop C (CGCFAD)',
      category: 'alternate'
    },
    {
      name: 'Open G',
      tunings: [
        { note: 'D', octave: 2, frequency: 73.42, description: '6ª corda (D2)' },
        { note: 'G', octave: 2, frequency: 98.00, description: '5ª corda (G2)' },
        { note: 'D', octave: 3, frequency: 146.83, description: '4ª corda (D3)' },
        { note: 'G', octave: 3, frequency: 196.00, description: '3ª corda (G3)' },
        { note: 'B', octave: 3, frequency: 246.94, description: '2ª corda (B3)' },
        { note: 'D', octave: 4, frequency: 293.66, description: '1ª corda (D4)' }
      ],
      description: 'Afinação Open G (DGDGBD)',
      category: 'alternate'
    }
  ],
  defaultTuning: 'Standard',
  defaultVisualization: {
    type: 'fretboard',
    config: {
      frets: 22,
      showNoteNames: true,
      showStringNames: true,
      highlightScaleDegrees: true,
      showFretNumbers: true,
      stringSpacing: 18,
      fretSpacing: 28,
      electricStyle: true
    },
    notePositions: []
  },
  isFreeTier: false,
  requirements: ['premium-tier'],
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Stratocaster',
    year: 2024,
    features: ['6 strings', '22 frets', 'multiple tunings', 'premium tier'],
    pickupConfiguration: 'SSS'
  }
};

/**
 * Configuração do Violão Clássico (6 cordas)
 */
export const CLASSICAL_GUITAR_CONFIG: InstrumentConfig = {
  id: 'classical-guitar-standard',
  name: 'Violão Clássico',
  type: 'classical-guitar',
  category: 'string',
  description: 'Violão clássico de 6 cordas de nylon',
  icon: '🎸',
  range: STANDARD_RANGES['classical-guitar'],
  strings: 6,
  availableTunings: STANDARD_TUNINGS['acoustic-guitar'],
  defaultTuning: 'Standard',
  defaultVisualization: {
    type: 'fretboard',
    config: {
      frets: 19,
      showNoteNames: true,
      showStringNames: true,
      highlightScaleDegrees: true,
      showFretNumbers: true,
      stringSpacing: 22,
      fretSpacing: 32,
      nylonStrings: true
    },
    notePositions: []
  },
  isFreeTier: true,
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Classical Nylon',
    year: 2024,
    features: ['6 nylon strings', '19 frets', 'classical style', 'free tier'],
    stringGauges: [0.028, 0.032, 0.040, 0.028, 0.035, 0.043]
  }
};

/**
 * Classe Guitarra - Implementação do instrumento guitarra
 */
export class Guitar extends Instrument {
  // ============================================
  // PROPRIEDADES ESPECÍFICAS DA GUITARRA
  // ============================================
  
  /** Número de trastes */
  private frets: number;
  
  /** Mapeamento corda/traste→nota */
  private fretboardMap = new Map<string, { note: Note; octave: Octave }>();
  
  /** Mapeamento nota→posições */
  private notePositionsMap = new Map<string, Array<{ string: number; fret: number }>>();
  
  /** Configuração de palheta */
  private pickPosition: 'bridge' | 'neck' | 'middle' = 'bridge';
  
  /** Técnica de mão direita */
  private rightHandTechnique: 'pick' | 'fingerstyle' | 'hybrid' = 'pick';
  
  // ============================================
  // CONSTRUTOR
  // ============================================
  
  constructor(config: InstrumentConfig) {
    super(config);
    this.frets = (config.defaultVisualization.config as any).frets || 20;
    this.initializeFretboardMap();
  }
  
  // ============================================
  // MÉTODOS ABSTRATOS IMPLEMENTADOS
  // ============================================
  
  /**
   * Toca uma nota na guitarra
   */
  async playNote(note: Note, octave: Octave, velocity = 80): Promise<void> {
    // Verificar se a nota está no range
    if (!this.isNoteInRange(note, octave)) {
      throw new Error(`Nota ${note}${octave} fora do range da guitarra`);
    }
    
    // Encontrar uma posição para tocar a nota
    const mappingResult = this.mapNoteToPositions(note, octave);
    
    if (mappingResult.positions.length === 0) {
      throw new Error(`Nota ${note}${octave} não encontrada no braço da guitarra`);
    }
    
    // Usar a posição recomendada ou a primeira
    const position = mappingResult.recommendedPosition || mappingResult.positions[0];
    
    if (!position.string || !position.fret) {
      throw new Error(`Posição inválida para nota ${note}${octave}`);
    }
    
    // Adicionar à lista de notas ativas
    this.addActiveNote(note, octave, position, velocity);
    
    // Em uma implementação real, aqui você tocaria o som
    // com base na posição da palheta e técnica
    if ((this.config.metadata as any)?.debug) {
      console.log(`🎸 Guitarra: Tocando ${note}${octave} na corda ${position.string}, casa ${position.fret}`);
    }
  }
  
  /**
   * Toca um acorde na guitarra
   */
  async playChord(notes: Array<{ note: Note; octave: Octave }>, velocities?: number[]): Promise<void> {
    // Validar todas as notas
    for (const noteInfo of notes) {
      if (!this.isNoteInRange(noteInfo.note, noteInfo.octave)) {
        throw new Error(`Nota ${noteInfo.note}${noteInfo.octave} fora do range da guitarra`);
      }
    }
    
    // Encontrar posições para cada nota
    const positions = notes.map((noteInfo, index) => {
      const mappingResult = this.mapNoteToPositions(noteInfo.note, noteInfo.octave);
      return {
        noteInfo,
        position: mappingResult.recommendedPosition || mappingResult.positions[0],
        velocity: velocities && index < velocities.length ? velocities[index] : 80
      };
    });
    
    // Verificar se todas as posições são válidas
    for (const item of positions) {
      if (!item.position?.string || !item.position?.fret) {
        throw new Error(`Posição inválida para nota ${item.noteInfo.note}${item.noteInfo.octave}`);
      }
    }
    
    // Tocar cada nota
    const promises = positions.map(item =>
      this.playNote(item.noteInfo.note, item.noteInfo.octave, item.velocity)
    );
    
    await Promise.all(promises);
  }
  
  /**
   * Para de tocar uma nota
   */
  async stopNote(note: Note, octave: Octave): Promise<void> {
    // Remover da lista de notas ativas
    this.removeActiveNote(note, octave);
    
    // Em uma implementação real, aqui você pararia o som
    if ((this.config.metadata as any)?.debug) {
      console.log(`🎸 Guitarra: Parando ${note}${octave}`);
    }
  }
  
  /**
   * Para todas as notas
   */
  async stopAllNotes(): Promise<void> {
    // Parar todas as notas ativas
    const activeNotes = [...this.state.activeNotes];
    
    for (const activeNote of activeNotes) {
      await this.stopNote(activeNote.note, activeNote.octave);
    }
    
    if ((this.config.metadata as any)?.debug) {
      console.log('🎸 Guitarra: Todas as notas paradas');
    }
  }
  
  /**
   * Mapeia uma nota para posições na guitarra
   */
  mapNoteToPositions(note: Note, octave: Octave): NoteMappingResult {
    // Verificar cache primeiro
    const cached = this.getCachedMapping(note, octave);
    if (cached) {
      return cached;
    }
    
    // Verificar se a nota está no range
    if (!this.isNoteInRange(note, octave)) {
      return {
        positions: [],
        difficulty: 10,
        metadata: { error: 'Nota fora do range' }
      };
    }
    
    // Encontrar todas as posições desta nota no braço
    const noteKey = `${note}-${octave}`;
    const positionsData = this.notePositionsMap.get(noteKey) || [];
    
    const positions: NotePosition[] = positionsData.map(pos => ({
      note,
      octave,
      string: pos.string,
      fret: pos.fret,
      x: this.calculateFretPosition(pos.fret),
      y: this.calculateStringPosition(pos.string)
    }));
    
    // Determinar dificuldade para cada posição
    positions.forEach(position => {
      if (position.fret && position.string) {
        position.metadata = {
          difficulty: this.calculatePositionDifficulty(position.fret, position.string),
          playability: this.calculatePlayability(position.fret, position.string)
        };
      }
    });
    
    // Ordenar por dificuldade (mais fácil primeiro)
    positions.sort((a, b) => {
      const diffA = a.metadata?.difficulty || 10;
      const diffB = b.metadata?.difficulty || 10;
      return diffA - diffB;
    });
    
    // Determinar dificuldade geral
    let overallDifficulty = 10;
    if (positions.length > 0) {
      overallDifficulty = positions[0].metadata?.difficulty || 10;
    }
    
    const result: NoteMappingResult = {
      positions,
      recommendedPosition: positions.length > 0 ? positions[0] : undefined,
      difficulty: overallDifficulty,
      metadata: {
        totalPositions: positions.length,
        isOpenString: positions.some(p => p.fret === 0),
        isBarrePossible: this.isBarrePossible(positions)
      }
    };
    
    // Armazenar no cache
    this.cacheMapping(note, octave, result);
    
    return result;
  }
  
  /**
   * Retorna a visualização atual da guitarra
   */
  getVisualization(): InstrumentVisualization {
    // Gerar posições das notas para a visualização
    const notePositions: NotePosition[] = [];
    const { strings } = this.config;
    const config = this.state.currentVisualization.config as any;
    
    if (!strings) return this.state.currentVisualization;
    
    // Gerar posições para todas as cordas e trastes
    for (let string = 1; string <= strings; string++) {
      for (let fret = 0; fret <= this.frets; fret++) {
        const noteInfo = this.fretboardMap.get(`${string}-${fret}`);
        
        if (noteInfo) {
          const isActive = this.isNoteActive(noteInfo.note, noteInfo.octave);
          
          notePositions.push({
            note: noteInfo.note,
            octave: noteInfo.octave,
            string,
            fret,
            x: this.calculateFretPosition(fret),
            y: this.calculateStringPosition(string),
            metadata: {
              isActive,
              isOpenString: fret === 0,
              difficulty: this.calculatePositionDifficulty(fret, string),
              isInScale: false // Seria calculado baseado na escala atual
            }
          });
        }
      }
    }
    
    return {
      ...this.state.currentVisualization,
      notePositions
    };
  }
  
  // ============================================
  // MÉTODOS ESPECÍFICOS DA GUITARRA
  // ============================================
  
  /**
   * Define a posição da palheta
   */
  setPickPosition(position: 'bridge' | 'neck' | 'middle'): void {
    this.pickPosition = position;
  }
  
  /**
   * Obtém a posição atual da palheta
   */
  getPickPosition(): string {
    return this.pickPosition;
  }
  
  /**
   * Define a técnica de mão direita
   */
  setRightHandTechnique(technique: 'pick' | 'fingerstyle' | 'hybrid'): void {
    this.rightHandTechnique = technique;
  }
  
  /**
   * Obtém a técnica atual de mão direita
   */
  getRightHandTechnique(): string {
    return this.rightHandTechnique;
  }
  
  /**
   * Obtém o número de trastes
   */
  getFretCount(): number {
    return this.frets;
  }
  
  /**
   * Obtém a afinação de uma corda específica
   */
  getStringTuning(stringNumber: number): { note: Note; octave: Octave } | null {
    if (stringNumber < 1 || stringNumber > (this.config.strings || 6)) {
      return null;
    }
    
    // Corda aberta (fret 0)
    const noteInfo = this.fretboardMap.get(`${stringNumber}-0`);
    return noteInfo || null;
  }
  
  /**
   * Obtém todas as posições de um acorde
   */
  getChordPositions(chordNotes: Array<{ note: Note; octave: Octave }>): NotePosition[][] {
    // Encontrar todas as combinações possíveis de posições
    // que formam o acorde de forma tocável
    
    const allPositions = chordNotes.map(noteInfo => 
      this.mapNoteToPositions(noteInfo.note, noteInfo.octave).positions
    );
    
    // Esta é uma implementação simplificada
    // Em uma implementação real, você encontraria combinações
    // que são fisicamente possíveis de tocar juntas
    
    return allPositions;
  }
  
  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================
  
  /**
   * Inicializa o mapa do braço da guitarra
   */
  private initializeFretboardMap(): void {
    const { strings } = this.config;
    if (!strings) return;
    
    const tuning = this.state.currentTuning;
    
    // Para cada corda
    for (let string = 1; string <= strings; string++) {
      const openNote = tuning.tunings[string - 1];
      if (!openNote) continue;
      
      let currentNote = openNote.note;
      let currentOctave = openNote.octave;
      
      // Para cada traste
      for (let fret = 0; fret <= this.frets; fret++) {
        const fretboardKey = `${string}-${fret}`;
        
        // Calcular nota para este traste
        let noteAtFret: Note;
        let octaveAtFret: Octave;
        
        if (fret === 0) {
          noteAtFret = openNote.note;
          octaveAtFret = openNote.octave;
        } else {
          // Transpor a nota aberta por número de semitons
          // Implementação simplificada
          const allNotes: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const noteIndex = allNotes.indexOf(currentNote);
          
          if (noteIndex === -1) {
            // Tentar equivalente enharmônico
            const enharmonic = this.getEnharmonicEquivalent(currentNote);
            if (enharmonic) {
              currentNote = enharmonic;
              continue;
            } else {
              break;
            }
          }
          
          const newIndex = (noteIndex + fret) % 12;
          const octaveIncrease = Math.floor((noteIndex + fret) / 12);
          
          noteAtFret = allNotes[newIndex];
          octaveAtFret = currentOctave + octaveIncrease as Octave;
        }
        
        // Armazenar no mapa
        this.fretboardMap.set(fretboardKey, {
          note: noteAtFret,
          octave: octaveAtFret
        });
        
        // Armazenar no mapa de posições por nota
        const noteKey = `${noteAtFret}-${octaveAtFret}`;
        if (!this.notePositionsMap.has(noteKey)) {
          this.notePositionsMap.set(noteKey, []);
        }
        this.notePositionsMap.get(noteKey)!.push({ string, fret });
      }
    }
  }
  
  /**
   * Calcula posição X de um traste na visualização
   */
  private calculateFretPosition(fret: number): number {
    // Posição exponencial (trastes ficam mais próximos conforme sobem)
    const scaleFactor = 0.95; // Fator de escala para cada traste
    const baseSpacing = (this.state.currentVisualization.config as any).fretSpacing || 30;
    
    let position = 0;
    for (let i = 0; i < fret; i++) {
      position += baseSpacing * Math.pow(scaleFactor, i);
    }
    
    return position;
  }
  
  /**
   * Calcula posição Y de uma corda na visualização
   */
  private calculateStringPosition(string: number): number {
    const { strings } = this.config;
    if (!strings) return 0;
    
    const spacing = (this.state.currentVisualization.config as any).stringSpacing || 20;
    
    // Corda 1 é a mais aguda (embaixo), corda N é a mais grave (em cima)
    return (strings - string) * spacing;
  }
  
  /**
   * Calcula dificuldade de uma posição
   */
  private calculatePositionDifficulty(fret: number, string: number): number {
    let difficulty = 1;
    
    // Trastes altos são mais difíceis
    if (fret > 12) difficulty += 2;
    if (fret > 15) difficulty += 2;
    
    // Cordas extremas podem ser mais difíceis
    const { strings } = this.config;
    if (strings) {
      if (string === 1 || string === strings) difficulty += 1;
    }
    
    // Traste 0 (corda solta) é mais fácil
    if (fret === 0) difficulty = 1;
    
    // Trastes muito baixos (1-3) podem ser mais difíceis para iniciantes
    if (fret > 0 && fret < 4) difficulty += 1;
    
    return Math.min(difficulty, 10);
  }
  
  /**
   * Calcula tocabilidade de uma posição
   */
  private calculatePlayability(fret: number, string: number): number {
    // 0-1, sendo 1 mais tocável
    let playability = 1.0;
    
    // Trastes altos podem ser menos tocáveis
    if (fret > 12) playability *= 0.8;
    if (fret > 15) playability *= 0.7;
    
    // Cordas extremas podem ser menos tocáveis
    const { strings } = this.config;
    if (strings) {
      if (string === 1 || string === strings) playability *= 0.9;
    }
    
    // Corda solta é muito tocável
    if (fret === 0) playability = 1.0;
    
    return playability;
  }
  
  /**
   * Verifica se é possível fazer uma pestana (barre)
   */
  private isBarrePossible(positions: NotePosition[]): boolean {
    // Verifica se há múltiplas notas no mesmo traste em cordas consecutivas
    const fretGroups = new Map<number, number[]>();
    
    for (const position of positions) {
      if (position.fret !== undefined && position.fret > 0) {
        if (!fretGroups.has(position.fret)) {
          fretGroups.set(position.fret, []);
        }
        if (position.string) {
          fretGroups.get(position.fret)!.push(position.string);
        }
      }
    }
    
    // Verificar se algum traste tem notas em 3+ cordas consecutivas
    for (const [fret, strings] of fretGroups.entries()) {
      if (strings.length >= 3) {
        // Verificar se são consecutivas
        const sortedStrings = [...strings].sort((a, b) => a - b);
        let consecutiveCount = 1;
        
        for (let i = 1; i < sortedStrings.length; i++) {
          if (sortedStrings[i] === sortedStrings[i - 1] + 1) {
            consecutiveCount++;
          } else {
            consecutiveCount = 1;
          }
          
          if (consecutiveCount >= 3) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Obtém equivalente enharmônico de uma nota
   */
  private getEnharmonicEquivalent(note: Note): Note | null {
    const enharmonicMap: Record<Note, Note[]> = {
      'C': ['B#'],
      'C#': ['Db'],
      'D': [],
      'D#': ['Eb'],
      'E': ['Fb'],
      'F': ['E#'],
      'F#': ['Gb'],
      'G': [],
      'G#': ['Ab'],
      'A': [],
      'A#': ['Bb'],
      'B': ['Cb']
    };
    
    return enharmonicMap[note]?.[0] || null;
  }
}

/**
 * Registra os presets de guitarra no registry global
 */
export function registerGuitarPresets(registry: any): void {
  if (registry.registerInstrument) {
    registry.registerInstrument(ACOUSTIC_GUITAR_CONFIG);
    registry.registerInstrument(ELECTRIC_GUITAR_CONFIG);
    registry.registerInstrument(CLASSICAL_GUITAR_CONFIG);
  }
}

export default {
  ACOUSTIC_GUITAR_CONFIG,
  ELECTRIC_GUITAR_CONFIG,
  CLASSICAL_GUITAR_CONFIG,
  Guitar,
  registerGuitarPresets
};