/**
 * Preset de Ukulele para o MusicOS
 * 
 * Implementação do instrumento Ukulele com suporte a:
 * - 4 cordas, afinação padrão GCEA
 * - Fretboard visual compacto
 * - Ideal para iniciantes
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
 * Configuração do Ukulele Soprano
 */
export const UKULELE_SOPRANO_CONFIG: InstrumentConfig = {
  id: 'ukulele-soprano',
  name: 'Ukulele Soprano',
  type: 'ukulele',
  category: 'string',
  description: 'Ukulele soprano de 4 cordas, afinação padrão GCEA',
  icon: '🎵',
  range: STANDARD_RANGES.ukulele,
  strings: 4,
  availableTunings: STANDARD_TUNINGS.ukulele,
  defaultTuning: 'Standard (GCEA)',
  defaultVisualization: {
    type: 'fretboard',
    config: {
      frets: 15,
      showNoteNames: true,
      showStringNames: true,
      highlightScaleDegrees: true,
      showFretNumbers: true,
      stringSpacing: 24,
      fretSpacing: 35,
      ukuleleStyle: true,
      showChordDiagrams: true
    },
    notePositions: []
  },
  isFreeTier: true,
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Standard Soprano',
    year: 2024,
    features: ['4 strings', '15 frets', 'GCEA tuning', 'free tier', 'beginner friendly'],
    stringGauges: [0.028, 0.032, 0.040, 0.028]
  }
};

/**
 * Configuração do Ukulele Concerto
 */
export const UKULELE_CONCERTO_CONFIG: InstrumentConfig = {
  id: 'ukulele-concerto',
  name: 'Ukulele Concerto',
  type: 'ukulele',
  category: 'string',
  description: 'Ukulele concerto de 4 cordas, afinação padrão GCEA',
  icon: '🎵',
  range: {
    lowestNote: { note: 'C', octave: 4 },
    highestNote: { note: 'A', octave: 6 },
    totalSemitones: 30
  },
  strings: 4,
  availableTunings: [
    ...STANDARD_TUNINGS.ukulele,
    {
      name: 'Low G',
      tunings: [
        { note: 'G', octave: 3, frequency: 196.00, description: '4ª corda (G3)' },
        { note: 'C', octave: 4, frequency: 261.63, description: '3ª corda (C4)' },
        { note: 'E', octave: 4, frequency: 329.63, description: '2ª corda (E4)' },
        { note: 'A', octave: 4, frequency: 440.00, description: '1ª corda (A4)' }
      ],
      description: 'Afinação Low G (G3CEA)',
      category: 'alternate'
    },
    {
      name: 'DGBE',
      tunings: [
        { note: 'D', octave: 4, frequency: 293.66, description: '4ª corda (D4)' },
        { note: 'G', octave: 4, frequency: 392.00, description: '3ª corda (G4)' },
        { note: 'B', octave: 4, frequency: 493.88, description: '2ª corda (B4)' },
        { note: 'E', octave: 5, frequency: 659.26, description: '1ª corda (E5)' }
      ],
      description: 'Afinação DGBE (como as 4 primeiras cordas do violão)',
      category: 'alternate'
    }
  ],
  defaultTuning: 'Standard (GCEA)',
  defaultVisualization: {
    type: 'fretboard',
    config: {
      frets: 18,
      showNoteNames: true,
      showStringNames: true,
      highlightScaleDegrees: true,
      showFretNumbers: true,
      stringSpacing: 22,
      fretSpacing: 32,
      ukuleleStyle: true,
      showChordDiagrams: true
    },
    notePositions: []
  },
  isFreeTier: false,
  requirements: ['premium-tier'],
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Concert Ukulele',
    year: 2024,
    features: ['4 strings', '18 frets', 'multiple tunings', 'premium tier'],
    bodySize: 'concerto'
  }
};

/**
 * Configuração do Ukulele Tenor
 */
export const UKULELE_TENOR_CONFIG: InstrumentConfig = {
  id: 'ukulele-tenor',
  name: 'Ukulele Tenor',
  type: 'ukulele',
  category: 'string',
  description: 'Ukulele tenor de 4 cordas, maior range e volume',
  icon: '🎵',
  range: {
    lowestNote: { note: 'G', octave: 3 },
    highestNote: { note: 'C', octave: 7 },
    totalSemitones: 33
  },
  strings: 4,
  availableTunings: [
    ...STANDARD_TUNINGS.ukulele,
    {
      name: 'Low G',
      tunings: [
        { note: 'G', octave: 3, frequency: 196.00, description: '4ª corda (G3)' },
        { note: 'C', octave: 4, frequency: 261.63, description: '3ª corda (C4)' },
        { note: 'E', octave: 4, frequency: 329.63, description: '2ª corda (E4)' },
        { note: 'A', octave: 4, frequency: 440.00, description: '1ª corda (A4)' }
      ],
      description: 'Afinação Low G (G3CEA)',
      category: 'alternate'
    },
    {
      name: 'Baritone (DGBE)',
      tunings: [
        { note: 'D', octave: 3, frequency: 146.83, description: '4ª corda (D3)' },
        { note: 'G', octave: 3, frequency: 196.00, description: '3ª corda (G3)' },
        { note: 'B', octave: 3, frequency: 246.94, description: '2ª corda (B3)' },
        { note: 'E', octave: 4, frequency: 329.63, description: '1ª corda (E4)' }
      ],
      description: 'Afinação de Baritono (DGBE)',
      category: 'alternate'
    }
  ],
  defaultTuning: 'Standard (GCEA)',
  defaultVisualization: {
    type: 'fretboard',
    config: {
      frets: 19,
      showNoteNames: true,
      showStringNames: true,
      highlightScaleDegrees: true,
      showFretNumbers: true,
      stringSpacing: 20,
      fretSpacing: 30,
      ukuleleStyle: true,
      showChordDiagrams: true
    },
    notePositions: []
  },
  isFreeTier: false,
  requirements: ['premium-tier'],
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Tenor Ukulele',
    year: 2024,
    features: ['4 strings', '19 frets', 'tenor range', 'premium tier'],
    bodySize: 'tenor'
  }
};

/**
 * Classe Ukulele - Implementação do instrumento ukulele
 */
export class Ukulele extends Instrument {
  // ============================================
  // PROPRIEDADES ESPECÍFICAS DO UKULELE
  // ============================================
  
  /** Número de trastes */
  private frets: number;
  
  /** Mapeamento corda/traste→nota */
  private fretboardMap = new Map<string, { note: Note; octave: Octave }>();
  
  /** Mapeamento nota→posições */
  private notePositionsMap = new Map<string, Array<{ string: number; fret: number }>>();
  
  /** Técnica de dedilhado */
  private strumPattern: string[] = ['down', 'down', 'up', 'up', 'down'];
  
  /** Padrão de acordes comuns */
  private commonChords = new Map<string, number[][]>();
  
  // ============================================
  // CONSTRUTOR
  // ============================================
  
  constructor(config: InstrumentConfig) {
    super(config);
    this.frets = (config.defaultVisualization.config as any).frets || 15;
    this.initializeFretboardMap();
    this.initializeCommonChords();
  }
  
  // ============================================
  // MÉTODOS ABSTRATOS IMPLEMENTADOS
  // ============================================
  
  /**
   * Toca uma nota no ukulele
   */
  async playNote(note: Note, octave: Octave, velocity = 80): Promise<void> {
    // Verificar se a nota está no range
    if (!this.isNoteInRange(note, octave)) {
      throw new Error(`Nota ${note}${octave} fora do range do ukulele`);
    }
    
    // Encontrar uma posição para tocar a nota
    const mappingResult = this.mapNoteToPositions(note, octave);
    
    if (mappingResult.positions.length === 0) {
      throw new Error(`Nota ${note}${octave} não encontrada no braço do ukulele`);
    }
    
    // Usar a posição recomendada ou a primeira
    const position = mappingResult.recommendedPosition || mappingResult.positions[0];
    
    if (!position.string || !position.fret) {
      throw new Error(`Posição inválida para nota ${note}${octave}`);
    }
    
    // Adicionar à lista de notas ativas
    this.addActiveNote(note, octave, position, velocity);
    
    // Em uma implementação real, aqui você tocaria o som
    if ((this.config.metadata as any)?.debug) {
      console.log(`🎵 Ukulele: Tocando ${note}${octave} na corda ${position.string}, casa ${position.fret}`);
    }
  }
  
  /**
   * Toca um acorde no ukulele
   */
  async playChord(notes: Array<{ note: Note; octave: Octave }>, velocities?: number[]): Promise<void> {
    // Validar todas as notas
    for (const noteInfo of notes) {
      if (!this.isNoteInRange(noteInfo.note, noteInfo.octave)) {
        throw new Error(`Nota ${noteInfo.note}${noteInfo.octave} fora do range do ukulele`);
      }
    }
    
    // Para ukulele, geralmente tocamos acordes com dedilhado
    // Vamos tocar cada nota sequencialmente para simular dedilhado
    
    for (let i = 0; i < notes.length; i++) {
      const noteInfo = notes[i];
      const velocity = velocities && i < velocities.length ? velocities[i] : 80;
      
      await this.playNote(noteInfo.note, noteInfo.octave, velocity);
      
      // Pequena pausa entre notas para simular dedilhado
      if (i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }
  
  /**
   * Para de tocar uma nota
   */
  async stopNote(note: Note, octave: Octave): Promise<void> {
    // Remover da lista de notas ativas
    this.removeActiveNote(note, octave);
    
    // Em uma implementação real, aqui você pararia o som
    if ((this.config.metadata as any)?.debug) {
      console.log(`🎵 Ukulele: Parando ${note}${octave}`);
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
      console.log('🎵 Ukulele: Todas as notas paradas');
    }
  }
  
  /**
   * Mapeia uma nota para posições no ukulele
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
      y: this.calculateStringPosition(pos.string),
      metadata: {
        difficulty: this.calculatePositionDifficulty(pos.fret, pos.string),
        isCommonChordPosition: this.isCommonChordPosition(pos.fret, pos.string),
        playability: this.calculatePlayability(pos.fret, pos.string)
      }
    }));
    
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
        isCommonPosition: positions.some(p => p.metadata?.isCommonChordPosition),
        suggestedChord: this.getSuggestedChordForNote(note, octave)
      }
    };
    
    // Armazenar no cache
    this.cacheMapping(note, octave, result);
    
    return result;
  }
  
  /**
   * Retorna a visualização atual do ukulele
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
          const isCommonChord = this.isCommonChordPosition(fret, string);
          
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
              isCommonChordPosition: isCommonChord,
              chordName: isCommonChord ? this.getChordNameForPosition(fret, string) : undefined
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
  // MÉTODOS ESPECÍFICOS DO UKULELE
  // ============================================
  
  /**
   * Define padrão de dedilhado
   */
  setStrumPattern(pattern: string[]): void {
    this.strumPattern = pattern;
  }
  
  /**
   * Obtém padrão de dedilhado atual
   */
  getStrumPattern(): string[] {
    return [...this.strumPattern];
  }
  
  /**
   * Toca um padrão de dedilhado
   */
  async strumChord(chordPositions: number[][], pattern?: string[]): Promise<void> {
    const strumPattern = pattern || this.strumPattern;
    
    // Para cada direção no padrão
    for (const direction of strumPattern) {
      // Simular dedilhado na direção especificada
      // Em uma implementação real, tocaria as notas apropriadas
      
      if ((this.config.metadata as any)?.debug) {
        console.log(`🎵 Ukulele: Dedilhado ${direction}`);
      }
      
      // Pequena pausa entre dedilhados
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  /**
   * Obtém acorde comum para uma posição
   */
  getChordForPosition(fret: number, string: number): string | null {
    for (const [chordName, positions] of this.commonChords.entries()) {
      if (positions.some(pos => pos[0] === string && pos[1] === fret)) {
        return chordName;
      }
    }
    return null;
  }
  
  /**
   * Obtém todas as posições de um acorde comum
   */
  getChordPositions(chordName: string): number[][] | null {
    return this.commonChords.get(chordName) || null;
  }
  
  /**
   * Obtém lista de acordes comuns
   */
  getCommonChords(): string[] {
    return Array.from(this.commonChords.keys());
  }
  
  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================
  
  /**
   * Inicializa o mapa do braço do ukulele
   */
  private initializeFretboardMap(): void {
    const { strings } = this.config;
    if (!strings) return;
    
    const tuning = this.state.currentTuning;
    
    // Para cada corda (ukulele: corda 4 é G, corda 3 é C, corda 2 é E, corda 1 é A)
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
   * Inicializa acordes comuns do ukulele
   */
  private initializeCommonChords(): void {
    // Acordes comuns no ukulele (posições [corda, traste])
    this.commonChords.set('C', [[4,0], [3,0], [2,0], [1,3]]);        // C major
    this.commonChords.set('G', [[4,2], [3,2], [2,3], [1,2]]);        // G major
    this.commonChords.set('F', [[4,2], [3,0], [2,1], [1,0]]);        // F major
    this.commonChords.set('Am', [[4,0], [3,0], [2,0], [1,0]]);       // A minor
    this.commonChords.set('Dm', [[4,2], [3,2], [2,1], [1,0]]);       // D minor
    this.commonChords.set('Em', [[4,4], [3,3], [2,2], [1,0]]);       // E minor
    this.commonChords.set('A', [[4,1], [3,0], [2,0], [1,0]]);        // A major
    this.commonChords.set('D', [[4,2], [3,2], [2,2], [1,2]]);        // D major
    this.commonChords.set('E', [[4,1], [3,4], [2,0], [1,2]]);        // E major
    this.commonChords.set('G7', [[4,2], [3,2], [2,1], [1,2]]);       // G7
    this.commonChords.set('C7', [[4,0], [3,0], [2,0], [1,1]]);       // C7
    this.commonChords.set('F7', [[4,2], [3,0], [2,1], [1,3]]);       // F7
  }
  
  /**
   * Calcula posição X de um traste na visualização
   */
  private calculateFretPosition(fret: number): number {
    // Posição linear para ukulele (trastes mais uniformes)
    const baseSpacing = (this.state.currentVisualization.config as any).fretSpacing || 35;
    return fret * baseSpacing;
  }
  
  /**
   * Calcula posição Y de uma corda na visualização
   */
  private calculateStringPosition(string: number): number {
    const { strings } = this.config;
    if (!strings) return 0;
    
    const spacing = (this.state.currentVisualization.config as any).stringSpacing || 24;
    
    // Ukulele: corda 4 (G) em cima, corda 1 (A) embaixo
    return (string - 1) * spacing;
  }
  
  /**
   * Calcula dificuldade de uma posição
   */
  private calculatePositionDifficulty(fret: number, string: number): number {
    let difficulty = 1;
    
    // Trastes altos são mais difíceis
    if (fret > 7) difficulty += 1;
    if (fret > 10) difficulty += 1;
    
    // Cordas extremas podem ser mais difíceis
    if (string === 1 || string === 4) difficulty += 1;
    
    // Traste 0 (corda solta) é mais fácil
    if (fret === 0) difficulty = 1;
    
    // Posições de acordes comuns são mais fáceis
    if (this.isCommonChordPosition(fret, string)) {
      difficulty = Math.max(1, difficulty - 1);
    }
    
    return Math.min(difficulty, 10);
  }
  
  /**
   * Calcula tocabilidade de uma posição
   */
  private calculatePlayability(fret: number, string: number): number {
    // 0-1, sendo 1 mais tocável
    let playability = 1.0;
    
    // Trastes altos podem ser menos tocáveis
    if (fret > 7) playability *= 0.9;
    if (fret > 10) playability *= 0.8;
    
    // Cordas extremas podem ser menos tocáveis
    if (string === 1 || string === 4) playability *= 0.9;
    
    // Corda solta é muito tocável
    if (fret === 0) playability = 1.0;
    
    // Posições de acordes comuns são mais tocáveis
    if (this.isCommonChordPosition(fret, string)) {
      playability = 1.0;
    }
    
    return playability;
  }
  
  /**
   * Verifica se é uma posição de acorde comum
   */
  private isCommonChordPosition(fret: number, string: number): boolean {
    for (const positions of this.commonChords.values()) {
      if (positions.some(pos => pos[0] === string && pos[1] === fret)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Obtém nome do acorde para uma posição
   */
  private getChordNameForPosition(fret: number, string: number): string | null {
    for (const [chordName, positions] of this.commonChords.entries()) {
      if (positions.some(pos => pos[0] === string && pos[1] === fret)) {
        return chordName;
      }
    }
    return null;
  }
  
  /**
   * Sugere acorde para uma nota
   */
  private getSuggestedChordForNote(note: Note, octave: Octave): string | null {
    // Simplificado: sugere acordes maiores baseados na nota
    const chordMap: Record<Note, string[]> = {
      'C': ['C', 'F', 'G'],
      'C#': ['C#', 'F#', 'G#'],
      'D': ['D', 'G', 'A'],
      'D#': ['D#', 'G#', 'A#'],
      'E': ['E', 'A', 'B'],
      'F': ['F', 'Bb', 'C'],
      'F#': ['F#', 'B', 'C#'],
      'G': ['G', 'C', 'D'],
      'G#': ['G#', 'C#', 'D#'],
      'A': ['A', 'D', 'E'],
      'A#': ['A#', 'D#', 'F'],
      'B': ['B', 'E', 'F#']
    };
    
    const chords = chordMap[note];
    return chords && chords.length > 0 ? chords[0] : null;
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
 * Registra os presets de ukulele no registry global
 */
export function registerUkulelePresets(registry: any): void {
  if (registry.registerInstrument) {
    registry.registerInstrument(UKULELE_SOPRANO_CONFIG);
    registry.registerInstrument(UKULELE_CONCERTO_CONFIG);
    registry.registerInstrument(UKULELE_TENOR_CONFIG);
  }
}

export default {
  UKULELE_SOPRANO_CONFIG,
  UKULELE_CONCERTO_CONFIG,
  UKULELE_TENOR_CONFIG,
  Ukulele,
  registerUkulelePresets
};