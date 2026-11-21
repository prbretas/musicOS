/**
 * Preset de Piano para o MusicOS
 * 
 * Implementação do instrumento Piano com suporte a:
 * - Teclado de 88 teclas (completo)
 * - Teclado de 61 teclas (free tier)
 * - Visualização de teclado
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
  STANDARD_RANGES
} from '../types/instrument';
import { Note, Octave } from '@/lib/music-theory';

/**
 * Configuração do Piano (88 teclas)
 */
export const PIANO_88_CONFIG: InstrumentConfig = {
  id: 'piano-88',
  name: 'Piano (88 teclas)',
  type: 'piano',
  category: 'keyboard',
  description: 'Piano acústico padrão com 88 teclas, range completo A0 a C8',
  icon: '🎹',
  range: STANDARD_RANGES.piano,
  keys: 88,
  availableTunings: [
    {
      name: 'Standard A440',
      tunings: [], // Piano não tem afinação por corda
      description: 'Afinação padrão de piano (A4 = 440Hz)',
      category: 'standard'
    },
    {
      name: 'A432',
      tunings: [],
      description: 'Afinação científica (A4 = 432Hz)',
      category: 'alternate'
    },
    {
      name: 'Historical',
      tunings: [],
      description: 'Afinações históricas variadas',
      category: 'alternate'
    }
  ],
  defaultTuning: 'Standard A440',
  defaultVisualization: {
    type: 'keyboard',
    config: {
      showNoteNames: true,
      showOctaveNumbers: true,
      highlightActiveNotes: true,
      keyboardType: 'full',
      keyWidth: 20,
      keyHeight: 120
    },
    notePositions: []
  },
  isFreeTier: false,
  requirements: ['premium-tier'],
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Grand Piano',
    year: 2024,
    features: ['88 keys', 'weighted action', 'sustain pedal support']
  }
};

/**
 * Configuração do Piano Free Tier (61 teclas)
 */
export const PIANO_61_CONFIG: InstrumentConfig = {
  id: 'piano-61',
  name: 'Piano (61 teclas)',
  type: 'piano',
  category: 'keyboard',
  description: 'Piano digital com 61 teclas, ideal para iniciantes',
  icon: '🎹',
  range: {
    lowestNote: { note: 'C', octave: 2 },
    highestNote: { note: 'C', octave: 7 },
    totalSemitones: 61
  },
  keys: 61,
  availableTunings: [
    {
      name: 'Standard A440',
      tunings: [],
      description: 'Afinação padrão (A4 = 440Hz)',
      category: 'standard'
    }
  ],
  defaultTuning: 'Standard A440',
  defaultVisualization: {
    type: 'keyboard',
    config: {
      showNoteNames: true,
      showOctaveNumbers: true,
      highlightActiveNotes: true,
      keyboardType: 'compact',
      keyWidth: 18,
      keyHeight: 100
    },
    notePositions: []
  },
  isFreeTier: true,
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Beginner Piano',
    year: 2024,
    features: ['61 keys', 'velocity sensitive', 'free tier']
  }
};

/**
 * Configuração do Teclado Infantil (49 teclas)
 */
export const KEYBOARD_49_CONFIG: InstrumentConfig = {
  id: 'keyboard-49',
  name: 'Teclado Infantil',
  type: 'keyboard',
  category: 'keyboard',
  description: 'Teclado compacto de 49 teclas para crianças e iniciantes',
  icon: '🎹',
  range: {
    lowestNote: { note: 'C', octave: 3 },
    highestNote: { note: 'C', octave: 7 },
    totalSemitones: 49
  },
  keys: 49,
  availableTunings: [
    {
      name: 'Standard',
      tunings: [],
      description: 'Afinação padrão',
      category: 'standard'
    }
  ],
  defaultTuning: 'Standard',
  defaultVisualization: {
    type: 'keyboard',
    config: {
      showNoteNames: true,
      showOctaveNumbers: true,
      highlightActiveNotes: true,
      keyboardType: 'simple',
      keyWidth: 16,
      keyHeight: 80,
      colorfulKeys: true
    },
    notePositions: []
  },
  isFreeTier: true,
  metadata: {
    manufacturer: 'MusicOS',
    model: 'Kids Keyboard',
    year: 2024,
    features: ['49 keys', 'colorful keys', 'child friendly', 'free tier']
  }
};

/**
 * Classe Piano - Implementação do instrumento piano
 */
export class Piano extends Instrument {
  // ============================================
  // PROPRIEDADES ESPECÍFICAS DO PIANO
  // ============================================
  
  /** Mapeamento tecla→nota */
  private keyToNoteMap = new Map<number, { note: Note; octave: Octave }>();
  
  /** Mapeamento nota→teclas */
  private noteToKeysMap = new Map<string, number[]>();
  
  /** Configuração do pedal de sustain */
  private sustainPedalActive = false;
  
  /** Notas sustentadas pelo pedal */
  private sustainedNotes: Array<{ note: Note; octave: Octave; startTime: number }> = [];
  
  /** Configuração de resposta de velocidade */
  private velocityCurve: 'linear' | 'exponential' | 'logarithmic' = 'exponential';
  
  // ============================================
  // CONSTRUTOR
  // ============================================
  
  constructor(config: InstrumentConfig) {
    super(config);
    this.initializeKeyMappings();
  }
  
  // ============================================
  // MÉTODOS ABSTRATOS IMPLEMENTADOS
  // ============================================
  
  /**
   * Toca uma nota no piano
   */
  async playNote(note: Note, octave: Octave, velocity = 80): Promise<void> {
    // Verificar se a nota está no range
    if (!this.isNoteInRange(note, octave)) {
      throw new Error(`Nota ${note}${octave} fora do range do piano`);
    }
    
    // Encontrar a tecla correspondente
    const keyNumber = this.getKeyNumber(note, octave);
    
    if (keyNumber === -1) {
      throw new Error(`Nota ${note}${octave} não mapeada para uma tecla do piano`);
    }
    
    // Aplicar curva de velocidade
    const adjustedVelocity = this.applyVelocityCurve(velocity);
    
    // Adicionar à lista de notas ativas
    this.addActiveNote(note, octave, { note, octave, key: keyNumber }, adjustedVelocity);
    
    // Se o pedal de sustain está ativo, adicionar às notas sustentadas
    if (this.sustainPedalActive) {
      this.sustainedNotes.push({
        note,
        octave,
        startTime: Date.now()
      });
    }
    
    // Em uma implementação real, aqui você tocaria o som
    // Por enquanto, apenas log
    if ((this.config.metadata as any)?.debug) {
      console.log(`🎹 Piano: Tocando ${note}${octave} (tecla ${keyNumber}) com velocidade ${adjustedVelocity}`);
    }
  }
  
  /**
   * Toca um acorde no piano
   */
  async playChord(notes: Array<{ note: Note; octave: Octave }>, velocities?: number[]): Promise<void> {
    // Validar todas as notas
    for (const noteInfo of notes) {
      if (!this.isNoteInRange(noteInfo.note, noteInfo.octave)) {
        throw new Error(`Nota ${noteInfo.note}${noteInfo.octave} fora do range do piano`);
      }
    }
    
    // Tocar cada nota
    const promises = notes.map((noteInfo, index) => {
      const velocity = velocities && index < velocities.length ? velocities[index] : 80;
      return this.playNote(noteInfo.note, noteInfo.octave, velocity);
    });
    
    await Promise.all(promises);
  }
  
  /**
   * Para de tocar uma nota
   */
  async stopNote(note: Note, octave: Octave): Promise<void> {
    // Remover da lista de notas ativas
    this.removeActiveNote(note, octave);
    
    // Remover das notas sustentadas se necessário
    if (this.sustainPedalActive) {
      const index = this.sustainedNotes.findIndex(
        n => n.note === note && n.octave === octave
      );
      
      if (index !== -1) {
        this.sustainedNotes.splice(index, 1);
      }
    }
    
    // Em uma implementação real, aqui você pararia o som
    if ((this.config.metadata as any)?.debug) {
      console.log(`🎹 Piano: Parando ${note}${octave}`);
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
    
    // Limpar notas sustentadas
    this.sustainedNotes = [];
    
    if ((this.config.metadata as any)?.debug) {
      console.log('🎹 Piano: Todas as notas paradas');
    }
  }
  
  /**
   * Mapeia uma nota para posições no piano
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
    
    // Encontrar todas as teclas que tocam esta nota
    const keyNumber = this.getKeyNumber(note, octave);
    const positions: NotePosition[] = [];
    
    if (keyNumber !== -1) {
      positions.push({
        note,
        octave,
        key: keyNumber,
        x: this.calculateKeyPosition(keyNumber),
        y: 0
      });
    }
    
    // Verificar se a nota tem equivalente enharmônico
    const enharmonic = this.getEnharmonicEquivalent(note);
    if (enharmonic && enharmonic !== note) {
      const enharmonicKey = this.getKeyNumber(enharmonic, octave);
      if (enharmonicKey !== -1) {
        positions.push({
          note: enharmonic,
          octave,
          key: enharmonicKey,
          x: this.calculateKeyPosition(enharmonicKey),
          y: 0,
          metadata: { isEnharmonic: true, originalNote: note }
        });
      }
    }
    
    // Determinar dificuldade
    let difficulty = 1; // Básico
    if (note.includes('#')) {
      difficulty = 3; // Tecla preta - um pouco mais difícil
    }
    
    // Verificar se é uma tecla de extremidade
    if (keyNumber <= 3 || keyNumber >= this.config.keys! - 3) {
      difficulty = Math.max(difficulty, 4); // Extremidades podem ser mais difíceis
    }
    
    const result: NoteMappingResult = {
      positions,
      recommendedPosition: positions[0],
      difficulty,
      metadata: {
        keyNumber,
        isWhiteKey: !note.includes('#') && !note.includes('b'),
        octavePosition: this.getOctavePosition(keyNumber)
      }
    };
    
    // Armazenar no cache
    this.cacheMapping(note, octave, result);
    
    return result;
  }
  
  /**
   * Retorna a visualização atual do piano
   */
  getVisualization(): InstrumentVisualization {
    // Gerar posições das notas para a visualização
    const notePositions: NotePosition[] = [];
    const { lowestNote, highestNote } = this.state.currentRange;
    
    // Gerar posições para todas as teclas no range atual
    let currentKey = this.getKeyNumber(lowestNote.note, lowestNote.octave);
    const highestKey = this.getKeyNumber(highestNote.note, highestNote.octave);
    
    while (currentKey <= highestKey) {
      const noteInfo = this.keyToNoteMap.get(currentKey);
      if (noteInfo) {
        notePositions.push({
          note: noteInfo.note,
          octave: noteInfo.octave,
          key: currentKey,
          x: this.calculateKeyPosition(currentKey),
          y: this.isWhiteKey(noteInfo.note) ? 0 : -20, // Teclas pretas mais altas
          metadata: {
            isWhiteKey: this.isWhiteKey(noteInfo.note),
            isActive: this.isNoteActive(noteInfo.note, noteInfo.octave)
          }
        });
      }
      currentKey++;
    }
    
    return {
      ...this.state.currentVisualization,
      notePositions
    };
  }
  
  // ============================================
  // MÉTODOS ESPECÍFICOS DO PIANO
  // ============================================
  
  /**
   * Ativa/desativa o pedal de sustain
   */
  setSustainPedal(active: boolean): void {
    const wasActive = this.sustainPedalActive;
    this.sustainPedalActive = active;
    
    if (!active && wasActive) {
      // Pedal liberado - parar todas as notas sustentadas
      this.sustainedNotes = [];
    }
    
    // Disparar evento se houver listener
    // (implementação de eventos seria adicionada aqui)
  }
  
  /**
   * Obtém estado do pedal de sustain
   */
  isSustainPedalActive(): boolean {
    return this.sustainPedalActive;
  }
  
  /**
   * Define a curva de resposta de velocidade
   */
  setVelocityCurve(curve: 'linear' | 'exponential' | 'logarithmic'): void {
    this.velocityCurve = curve;
  }
  
  /**
   * Obtém a curva de resposta de velocidade atual
   */
  getVelocityCurve(): string {
    return this.velocityCurve;
  }
  
  /**
   * Obtém o número da tecla para uma nota
   */
  getKeyNumber(note: Note, octave: Octave): number {
    const key = Array.from(this.keyToNoteMap.entries()).find(
      ([, noteInfo]) => noteInfo.note === note && noteInfo.octave === octave
    );
    
    return key ? key[0] : -1;
  }
  
  /**
   * Obtém a nota para um número de tecla
   */
  getNoteForKey(keyNumber: number): { note: Note; octave: Octave } | null {
    return this.keyToNoteMap.get(keyNumber) || null;
  }
  
  /**
   * Obtém todas as teclas que tocam uma determinada nota
   */
  getKeysForNote(note: Note, octave: Octave): number[] {
    const key = `${note}-${octave}`;
    return this.noteToKeysMap.get(key) || [];
  }
  
  /**
   * Verifica se uma tecla é branca
   */
  isWhiteKey(note: Note): boolean {
    return !note.includes('#') && !note.includes('b');
  }
  
  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================
  
  /**
   * Inicializa os mapeamentos tecla→nota
   */
  private initializeKeyMappings(): void {
    const { lowestNote, highestNote } = this.state.currentRange;
    
    // Piano padrão: A0 é a tecla 1, C8 é a tecla 88
    // Para simplificar, vamos mapear de forma sequencial
    
    let keyNumber = 1;
    let currentNote = lowestNote.note;
    let currentOctave = lowestNote.octave;
    
    const noteOrder: Note[] = [
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];
    
    // Encontrar índice inicial
    let currentIndex = noteOrder.indexOf(currentNote);
    if (currentIndex === -1) {
      // Tentar equivalente enharmônico
      currentNote = this.getEnharmonicEquivalent(currentNote) || 'C';
      currentIndex = noteOrder.indexOf(currentNote);
    }
    
    // Criar mapeamento até a nota mais aguda
    while (
      currentOctave < highestNote.octave ||
      (currentOctave === highestNote.octave && currentIndex <= noteOrder.indexOf(highestNote.note))
    ) {
      const note = noteOrder[currentIndex];
      
      // Adicionar ao mapeamento tecla→nota
      this.keyToNoteMap.set(keyNumber, { note, octave: currentOctave });
      
      // Adicionar ao mapeamento nota→teclas
      const noteKey = `${note}-${currentOctave}`;
      if (!this.noteToKeysMap.has(noteKey)) {
        this.noteToKeysMap.set(noteKey, []);
      }
      this.noteToKeysMap.get(noteKey)!.push(keyNumber);
      
      // Avançar
      keyNumber++;
      currentIndex++;
      
      // Próxima oitava
      if (currentIndex >= noteOrder.length) {
        currentIndex = 0;
        currentOctave++;
      }
      
      // Limitar pelo número máximo de teclas
      if (keyNumber > (this.config.keys || 88)) {
        break;
      }
    }
  }
  
  /**
   * Calcula posição X de uma tecla na visualização
   */
  private calculateKeyPosition(keyNumber: number): number {
    // Posição base: teclas brancas ocupam espaço uniforme
    // Teclas pretas ficam entre as brancas
    
    const noteInfo = this.keyToNoteMap.get(keyNumber);
    if (!noteInfo) return 0;
    
    const isWhiteKey = this.isWhiteKey(noteInfo.note);
    
    if (isWhiteKey) {
      // Teclas brancas: posições 0, 1, 2, 3, 4... (cada unidade = largura da tecla)
      return this.countWhiteKeysUpTo(keyNumber);
    } else {
      // Teclas pretas: posição entre as brancas
      const whiteKeyCount = this.countWhiteKeysUpTo(keyNumber);
      return whiteKeyCount - 0.5; // Posicionada entre duas brancas
    }
  }
  
  /**
   * Conta quantas teclas brancas existem até uma tecla específica
   */
  private countWhiteKeysUpTo(keyNumber: number): number {
    let count = 0;
    
    for (let i = 1; i <= keyNumber; i++) {
      const noteInfo = this.keyToNoteMap.get(i);
      if (noteInfo && this.isWhiteKey(noteInfo.note)) {
        count++;
      }
    }
    
    return count;
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
  
  /**
   * Aplica a curva de velocidade
   */
  private applyVelocityCurve(velocity: number): number {
    // Normalizar para 0-1
    const normalized = velocity / 127;
    
    let adjusted: number;
    
    switch (this.velocityCurve) {
      case 'linear':
        adjusted = normalized;
        break;
      case 'exponential':
        adjusted = Math.pow(normalized, 1.5);
        break;
      case 'logarithmic':
        adjusted = Math.log1p(normalized * 9) / Math.log1p(10);
        break;
      default:
        adjusted = normalized;
    }
    
    // Voltar para 0-127
    return Math.round(adjusted * 127);
  }
  
  /**
   * Obtém a posição da oitava para uma tecla
   */
  private getOctavePosition(keyNumber: number): number {
    const noteInfo = this.keyToNoteMap.get(keyNumber);
    if (!noteInfo) return 0;
    
    // Para piano, cada oitava tem 12 semitons
    // C0 = oitava 0, C1 = oitava 1, etc.
    return noteInfo.octave;
  }
}

/**
 * Registra os presets de piano no registry global
 */
export function registerPianoPresets(registry: any): void {
  // Esta função seria chamada durante a inicialização
  // para registrar os presets de piano
  
  if (registry.registerInstrument) {
    registry.registerInstrument(PIANO_88_CONFIG);
    registry.registerInstrument(PIANO_61_CONFIG);
    registry.registerInstrument(KEYBOARD_49_CONFIG);
  }
}

export default {
  PIANO_88_CONFIG,
  PIANO_61_CONFIG,
  KEYBOARD_49_CONFIG,
  Piano,
  registerPianoPresets
};