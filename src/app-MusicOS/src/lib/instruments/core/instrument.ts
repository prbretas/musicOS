/**
 * Classe base para todos os instrumentos musicais
 * 
 * Fornece funcionalidades comuns e interface padrão
 * para todos os instrumentos no MusicOS.
 */

import { Note, Octave, getNoteInfo, noteToFrequency, transposeNote } from '@/lib/music-theory';
import {
  InstrumentConfig,
  InstrumentState,
  InstrumentTuning,
  InstrumentRange,
  InstrumentVisualization,
  NotePosition,
  NoteMappingResult,
  InstrumentEvents,
  CreateInstrumentOptions
} from '../types/instrument';

/**
 * Classe base abstrata para instrumentos musicais
 */
export abstract class Instrument {
  // ============================================
  // PROPRIEDADES
  // ============================================
  
  /** ID único do instrumento */
  public readonly id: string;
  
  /** Configuração do instrumento */
  protected config: InstrumentConfig;
  
  /** Estado atual do instrumento */
  protected state: InstrumentState;
  
  /** Eventos do instrumento */
  protected events: Partial<InstrumentEvents> = {};
  
  /** Cache de mapeamentos de notas */
  private noteMappingCache = new Map<string, NoteMappingResult>();
  
  /** Último acesso para limpeza de cache */
  private lastCacheAccess = Date.now();
  
  // ============================================
  // CONSTRUTOR
  // ============================================
  
  constructor(config: InstrumentConfig, options: CreateInstrumentOptions = {}) {
    this.id = options.id || config.id;
    this.config = { ...config };
    
    // Inicializar afinação padrão
    const defaultTuning = this.config.availableTunings.find(
      t => t.name === this.config.defaultTuning
    );
    
    if (!defaultTuning) {
      throw new Error(`Afinação padrão "${this.config.defaultTuning}" não encontrada para instrumento ${this.config.name}`);
    }
    
    // Inicializar estado
    this.state = {
      config: this.config,
      currentTuning: defaultTuning,
      currentRange: options.initialRange || this.config.range,
      currentVisualization: this.config.defaultVisualization,
      activeNotes: [],
      customSettings: options.initialSettings || {}
    };
    
    // Configurar listeners de eventos
    this.setupEventListeners();
  }
  
  // ============================================
  // MÉTODOS ABSTRATOS (devem ser implementados)
  // ============================================
  
  /**
   * Toca uma única nota no instrumento
   */
  abstract playNote(note: Note, octave: Octave, velocity?: number): Promise<void>;
  
  /**
   * Toca múltiplas notas simultaneamente (acorde)
   */
  abstract playChord(notes: Array<{ note: Note; octave: Octave }>, velocities?: number[]): Promise<void>;
  
  /**
   * Para de tocar uma nota específica
   */
  abstract stopNote(note: Note, octave: Octave): Promise<void>;
  
  /**
   * Para todas as notas sendo tocadas
   */
  abstract stopAllNotes(): Promise<void>;
  
  /**
   * Mapeia uma nota para posições no instrumento
   */
  abstract mapNoteToPositions(note: Note, octave: Octave): NoteMappingResult;
  
  /**
   * Retorna a visualização atual do instrumento
   */
  abstract getVisualization(): InstrumentVisualization;
  
  // ============================================
  // MÉTODOS PÚBLICOS (implementação padrão)
  // ============================================
  
  /**
   * Obtém a configuração do instrumento
   */
  getConfig(): InstrumentConfig {
    return { ...this.config };
  }
  
  /**
   * Obtém o estado atual do instrumento
   */
  getState(): InstrumentState {
    return { ...this.state };
  }
  
  /**
   * Obtém a afinação atual
   */
  getCurrentTuning(): InstrumentTuning {
    return { ...this.state.currentTuning };
  }
  
  /**
   * Obtém o range atual
   */
  getCurrentRange(): InstrumentRange {
    return { ...this.state.currentRange };
  }
  
  /**
   * Define uma nova afinação
   */
  setTuning(tuningName: string): boolean {
    const newTuning = this.config.availableTunings.find(t => t.name === tuningName);
    
    if (!newTuning) {
      console.warn(`Afinação "${tuningName}" não disponível para instrumento ${this.config.name}`);
      return false;
    }
    
    const oldTuning = this.state.currentTuning;
    this.state.currentTuning = newTuning;
    
    // Limpar cache de mapeamento
    this.noteMappingCache.clear();
    
    // Disparar evento
    if (this.events.tuningChanged) {
      this.events.tuningChanged(oldTuning, newTuning);
    }
    
    return true;
  }
  
  /**
   * Define um novo range para o instrumento
   */
  setRange(lowestNote: Note, lowestOctave: Octave, highestNote: Note, highestOctave: Octave): boolean {
    const newRange: InstrumentRange = {
      lowestNote: { note: lowestNote, octave: lowestOctave },
      highestNote: { note: highestNote, octave: highestOctave },
      totalSemitones: this.calculateSemitones(lowestNote, lowestOctave, highestNote, highestOctave)
    };
    
    // Validar range
    if (newRange.totalSemitones <= 0) {
      console.warn('Range inválido: nota mais grave deve ser menor que nota mais aguda');
      return false;
    }
    
    // Verificar limites do instrumento
    const instrumentRange = this.config.range;
    const instrumentLowest = this.noteToSemitones(
      instrumentRange.lowestNote.note,
      instrumentRange.lowestNote.octave
    );
    const instrumentHighest = this.noteToSemitones(
      instrumentRange.highestNote.note,
      instrumentRange.highestNote.octave
    );
    
    const newLowest = this.noteToSemitones(lowestNote, lowestOctave);
    const newHighest = this.noteToSemitones(highestNote, highestOctave);
    
    if (newLowest < instrumentLowest || newHighest > instrumentHighest) {
      console.warn(`Range solicitado está fora dos limites do instrumento (${this.config.name})`);
      return false;
    }
    
    const oldRange = this.state.currentRange;
    this.state.currentRange = newRange;
    
    // Limpar cache de mapeamento
    this.noteMappingCache.clear();
    
    // Disparar evento
    if (this.events.rangeChanged) {
      this.events.rangeChanged(oldRange, newRange);
    }
    
    return true;
  }
  
  /**
   * Verifica se uma nota está dentro do range atual
   */
  isNoteInRange(note: Note, octave: Octave): boolean {
    const range = this.state.currentRange;
    
    const noteSemitones = this.noteToSemitones(note, octave);
    const lowestSemitones = this.noteToSemitones(
      range.lowestNote.note,
      range.lowestNote.octave
    );
    const highestSemitones = this.noteToSemitones(
      range.highestNote.note,
      range.highestNote.octave
    );
    
    return noteSemitones >= lowestSemitones && noteSemitones <= highestSemitones;
  }
  
  /**
   * Verifica se o instrumento está no tier gratuito
   */
  isFreeTier(): boolean {
    return this.config.isFreeTier;
  }
  
  /**
   * Verifica se o instrumento atende aos requisitos
   */
  meetsRequirements(requirements: string[]): boolean {
    if (!this.config.requirements || this.config.requirements.length === 0) {
      return true;
    }
    
    return requirements.every(req => this.config.requirements?.includes(req));
  }
  
  /**
   * Obtém todas as afinações disponíveis
   */
  getAvailableTunings(): InstrumentTuning[] {
    return [...this.config.availableTunings];
  }
  
  /**
   * Obtém todas as notas ativas (sendo tocadas)
   */
  getActiveNotes(): Array<{ note: Note; octave: Octave; velocity?: number }> {
    return [...this.state.activeNotes];
  }
  
  /**
   * Define um listener de evento
   */
  on<K extends keyof InstrumentEvents>(event: K, listener: InstrumentEvents[K]): void {
    this.events[event] = listener;
  }
  
  /**
   * Remove um listener de evento
   */
  off<K extends keyof InstrumentEvents>(event: K): void {
    delete this.events[event];
  }
  
  /**
   * Limpa todos os listeners de eventos
   */
  clearEventListeners(): void {
    this.events = {};
  }
  
  /**
   * Obtém configuração customizada
   */
  getSetting<T = any>(key: string): T | undefined {
    return this.state.customSettings[key] as T;
  }
  
  /**
   * Define configuração customizada
   */
  setSetting<T = any>(key: string, value: T): void {
    this.state.customSettings[key] = value;
  }
  
  /**
   * Reseta todas as configurações para os padrões
   */
  resetToDefaults(): void {
    // Resetar afinação
    const defaultTuning = this.config.availableTunings.find(
      t => t.name === this.config.defaultTuning
    );
    
    if (defaultTuning) {
      const oldTuning = this.state.currentTuning;
      this.state.currentTuning = defaultTuning;
      
      if (this.events.tuningChanged) {
        this.events.tuningChanged(oldTuning, defaultTuning);
      }
    }
    
    // Resetar range
    const oldRange = this.state.currentRange;
    this.state.currentRange = this.config.range;
    
    if (this.events.rangeChanged) {
      this.events.rangeChanged(oldRange, this.config.range);
    }
    
    // Resetar visualização
    const oldVisualization = this.state.currentVisualization;
    this.state.currentVisualization = this.config.defaultVisualization;
    
    if (this.events.visualizationChanged) {
      this.events.visualizationChanged(oldVisualization, this.config.defaultVisualization);
    }
    
    // Limpar configurações customizadas
    this.state.customSettings = {};
    
    // Limpar cache
    this.noteMappingCache.clear();
    this.lastCacheAccess = Date.now();
  }
  
  /**
   * Limpa o cache de mapeamento de notas
   */
  clearCache(): void {
    this.noteMappingCache.clear();
    this.lastCacheAccess = Date.now();
  }
  
  // ============================================
  // MÉTODOS PROTEGIDOS (para subclasses)
  // ============================================
  
  /**
   * Adiciona uma nota à lista de notas ativas
   */
  protected addActiveNote(note: Note, octave: Octave, position?: NotePosition, velocity?: number): void {
    this.state.activeNotes.push({
      note,
      octave,
      position: position || { note, octave },
      velocity
    });
    
    // Disparar evento
    if (this.events.noteOn) {
      this.events.noteOn(note, octave, velocity);
    }
  }
  
  /**
   * Remove uma nota da lista de notas ativas
   */
  protected removeActiveNote(note: Note, octave: Octave): void {
    const index = this.state.activeNotes.findIndex(
      n => n.note === note && n.octave === octave
    );
    
    if (index !== -1) {
      this.state.activeNotes.splice(index, 1);
      
      // Disparar evento
      if (this.events.noteOff) {
        this.events.noteOff(note, octave);
      }
    }
  }
  
  /**
   * Verifica se uma nota está ativa
   */
  protected isNoteActive(note: Note, octave: Octave): boolean {
    return this.state.activeNotes.some(
      n => n.note === note && n.octave === octave
    );
  }
  
  /**
   * Obtém posição de uma nota ativa
   */
  protected getActiveNotePosition(note: Note, octave: Octave): NotePosition | undefined {
    const activeNote = this.state.activeNotes.find(
      n => n.note === note && n.octave === octave
    );
    
    return activeNote?.position;
  }
  
  /**
   * Atualiza a visualização atual
   */
  protected updateVisualization(newVisualization: InstrumentVisualization): void {
    const oldVisualization = this.state.currentVisualization;
    this.state.currentVisualization = newVisualization;
    
    // Disparar evento
    if (this.events.visualizationChanged) {
      this.events.visualizationChanged(oldVisualization, newVisualization);
    }
  }
  
  /**
   * Obtém resultado de mapeamento do cache ou calcula novo
   */
  protected getCachedMapping(note: Note, octave: Octave): NoteMappingResult | null {
    const cacheKey = `${note}-${octave}`;
    
    // Limpar cache antigo (1 hora)
    if (Date.now() - this.lastCacheAccess > 3600000) {
      this.noteMappingCache.clear();
    }
    
    this.lastCacheAccess = Date.now();
    
    return this.noteMappingCache.get(cacheKey) || null;
  }
  
  /**
   * Armazena resultado de mapeamento no cache
   */
  protected cacheMapping(note: Note, octave: Octave, mapping: NoteMappingResult): void {
    const cacheKey = `${note}-${octave}`;
    this.noteMappingCache.set(cacheKey, mapping);
    this.lastCacheAccess = Date.now();
  }
  
  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================
  
  /**
   * Configura listeners de eventos padrão
   */
  private setupEventListeners(): void {
    // Configurações padrão podem ser adicionadas aqui
  }
  
  /**
   * Converte nota+oitava para número de semitons (C0 = 0)
   */
  private noteToSemitones(note: Note, octave: Octave): number {
    const noteInfo = getNoteInfo(note, octave);
    
    // C0 = 0, C#0 = 1, ..., B0 = 11, C1 = 12, etc.
    const noteOrder: Record<Note, number> = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    
    return (octave * 12) + noteOrder[note];
  }
  
  /**
   * Calcula número de semitons entre duas notas
   */
  private calculateSemitones(
    note1: Note, octave1: Octave,
    note2: Note, octave2: Octave
  ): number {
    const semitones1 = this.noteToSemitones(note1, octave1);
    const semitones2 = this.noteToSemitones(note2, octave2);
    
    return Math.abs(semitones2 - semitones1) + 1;
  }
  
  /**
   * Verifica se o instrumento tem suporte para cordas
   */
  private hasStrings(): boolean {
    return this.config.strings !== undefined && this.config.strings > 0;
  }
  
  /**
   * Verifica se o instrumento tem suporte para teclas
   */
  private hasKeys(): boolean {
    return this.config.keys !== undefined && this.config.keys > 0;
  }
}

/**
 * Exceção personalizada para erros de instrumento
 */
export class InstrumentError extends Error {
  constructor(
    message: string,
    public readonly instrumentId?: string,
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = 'InstrumentError';
  }
}

/**
 * Exceção para notas fora do range
 */
export class NoteOutOfRangeError extends InstrumentError {
  constructor(
    note: Note,
    octave: Octave,
    instrumentId: string,
    range: InstrumentRange
  ) {
    super(
      `Nota ${note}${octave} fora do range do instrumento ${instrumentId} ` +
      `(range: ${range.lowestNote.note}${range.lowestNote.octave} - ` +
      `${range.highestNote.note}${range.highestNote.octave})`,
      instrumentId,
      'NOTE_OUT_OF_RANGE'
    );
    this.name = 'NoteOutOfRangeError';
  }
}

/**
 * Exceção para instrumento não suportado
 */
export class InstrumentNotSupportedError extends InstrumentError {
  constructor(instrumentId: string, feature: string) {
    super(
      `Instrumento ${instrumentId} não suporta a funcionalidade: ${feature}`,
      instrumentId,
      'INSTRUMENT_NOT_SUPPORTED'
    );
    this.name = 'InstrumentNotSupportedError';
  }
}