/**
 * Integração de áudio com o sistema de instrumentos
 * 
 * Conecta instrumentos do CORE-002 com o AudioEngine do CORE-003
 */

import { AudioEngine } from '../core/audio-engine';
import { AdvancedOscillator, OscillatorFactory } from '../core/oscillator';
import { AdvancedEnvelope, EnvelopeFactory } from '../effects/envelope';
import {
  OscillatorConfig,
  ADSREnvelope,
  FilterConfig,
  ReverbConfig,
  DelayConfig,
  InstrumentAudioConfig
} from '../types/audio';

import { Instrument } from '@/lib/instruments';
import { Note, Octave, noteToFrequency } from '@/lib/music-theory';

/**
 * Áudio específico para um instrumento
 */
export class InstrumentAudio {
  /** Instrumento associado */
  private instrument: Instrument;
  
  /** AudioEngine */
  private audioEngine: AudioEngine;
  
  /** Configuração de áudio */
  private config: InstrumentAudioConfig;
  
  /** Oscillators por nota */
  private activeOscillators: Map<string, AdvancedOscillator[]> = new Map();
  
  /** Envelope do instrumento */
  private envelope: AdvancedEnvelope;
  
  /** Efeitos ativos */
  private effects: {
    filter?: BiquadFilterNode;
    reverb?: ConvolverNode;
    delay?: DelayNode;
  } = {};
  
  /** Se está inicializado */
  private isInitialized = false;

  /**
   * Construtor
   */
  constructor(instrument: Instrument, audioEngine: AudioEngine, config?: Partial<InstrumentAudioConfig>) {
    this.instrument = instrument;
    this.audioEngine = audioEngine;
    
    // Configuração padrão
    this.config = {
      instrumentId: instrument.getConfig().id,
      noteMapping: new Map(),
      instrumentEffects: {},
      defaultEnvelope: EnvelopeFactory.create('piano').getConfig(),
      ...config
    };
    
    // Criar envelope
    this.envelope = new AdvancedEnvelope(this.config.defaultEnvelope);
    
    // Configurar mapeamento de notas
    this.initializeNoteMapping();
    
    // Configurar eventos do instrumento
    this.setupInstrumentEvents();
  }

  // ============================================
  // MÉTODOS PÚBLICOS - INICIALIZAÇÃO
  // ============================================

  /**
   * Inicializa o áudio do instrumento
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Inicializar AudioEngine se necessário
      if (!this.audioEngine.isActive()) {
        await this.audioEngine.initialize();
      }
      
      // Configurar efeitos
      await this.setupEffects();
      
      this.isInitialized = true;
      console.log(`✅ Áudio do instrumento ${this.instrument.getConfig().name} inicializado`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erro ao inicializar áudio do instrumento:`, error);
      return false;
    }
  }

  /**
   * Fecha o áudio do instrumento
   */
  async close(): Promise<void> {
    // Parar todos os oscillators
    this.stopAllNotes();
    
    // Limpar efeitos
    this.clearEffects();
    
    this.isInitialized = false;
  }

  // ============================================
  // MÉTODOS PÚBLICOS - PLAYBACK
  // ============================================

  /**
   * Toca uma nota no instrumento
   */
  async playNote(note: Note, octave: Octave, velocity = 80): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Obter frequência da nota
      const frequency = noteToFrequency(note, octave);
      
      // Obter configuração do oscilador para esta nota
      const oscillatorConfig = this.getOscillatorConfigForNote(note, octave, velocity);
      
      // Criar e tocar oscillator
      const context = this.getAudioContext();
      if (!context) {
        throw new Error('AudioContext não disponível');
      }
      
      const oscillator = OscillatorFactory.create(context, oscillatorConfig);
      
      // Configurar envelope baseado na velocity
      const envelopeConfig = this.getEnvelopeConfigForVelocity(velocity);
      const envelope = new AdvancedEnvelope(envelopeConfig);
      
      // Aplicar envelope ao gain node do oscillator
      const gainNode = oscillator.getOutputNode();
      envelope.applyToGainNode(gainNode, velocity / 127);
      
      // Conectar através da chain de efeitos
      this.connectThroughEffects(gainNode);
      
      // Tocar
      oscillator.play();
      
      // Armazenar referencia
      const noteKey = this.getNoteKey(note, octave);
      if (!this.activeOscillators.has(noteKey)) {
        this.activeOscillators.set(noteKey, []);
      }
      this.activeOscillators.get(noteKey)!.push(oscillator);
      
      // Configurar parada automática baseada no envelope
      const totalDuration = envelopeConfig.attack + envelopeConfig.decay + envelopeConfig.release;
      oscillator.onStop(() => {
        this.removeOscillator(noteKey, oscillator);
      });
      
      // Se a nota tem sustain 0, parar após attack+decay
      if (envelopeConfig.sustain === 0) {
        setTimeout(() => {
          oscillator.stop();
        }, (envelopeConfig.attack + envelopeConfig.decay) * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error(`Erro ao tocar nota ${note}${octave}:`, error);
      return false;
    }
  }

  /**
   * Toca um acorde
   */
  async playChord(notes: Array<{ note: Note; octave: Octave }>, velocities?: number[]): Promise<boolean> {
    const promises = notes.map((noteInfo, index) => {
      const velocity = velocities && index < velocities.length ? velocities[index] : 80;
      return this.playNote(noteInfo.note, noteInfo.octave, velocity);
    });
    
    try {
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Erro ao tocar acorde:', error);
      return false;
    }
  }

  /**
   * Para uma nota específica
   */
  stopNote(note: Note, octave: Octave): boolean {
    const noteKey = this.getNoteKey(note, octave);
    const oscillators = this.activeOscillators.get(noteKey);
    
    if (!oscillators || oscillators.length === 0) {
      return false;
    }
    
    // Aplicar release a todos os oscillators desta nota
    oscillators.forEach(oscillator => {
      const envelope = new AdvancedEnvelope(this.config.defaultEnvelope);
      const gainNode = oscillator.getOutputNode();
      
      // Aplicar release
      envelope.applyReleaseToGainNode(gainNode);
      
      // Parar após release
      setTimeout(() => {
        oscillator.stop();
      }, this.config.defaultEnvelope.release * 1000);
    });
    
    return true;
  }

  /**
   * Para todas as notas
   */
  stopAllNotes(): void {
    for (const [noteKey, oscillators] of this.activeOscillators.entries()) {
      oscillators.forEach(oscillator => {
        try {
          oscillator.stop();
        } catch (error) {
          // Oscillator já pode ter sido parado
        }
      });
    }
    
    this.activeOscillators.clear();
  }

  // ============================================
  // MÉTODOS PÚBLICOS - EFEITOS
  // ============================================

  /**
   * Adiciona filtro ao instrumento
   */
  addFilter(config: FilterConfig): boolean {
    const context = this.getAudioContext();
    if (!context) return false;
    
    try {
      const filter = context.createBiquadFilter();
      filter.type = config.type;
      filter.frequency.value = config.frequency;
      filter.Q.value = config.Q || 1.0;
      if (config.gain !== undefined) {
        filter.gain.value = config.gain;
      }
      
      this.effects.filter = filter;
      this.reconnectEffectsChain();
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar filtro:', error);
      return false;
    }
  }

  /**
   * Adiciona reverb ao instrumento
   */
  addReverb(config: ReverbConfig): boolean {
    const context = this.getAudioContext();
    if (!context) return false;
    
    try {
      const convolver = context.createConvolver();
      
      // Criar impulso simples para reverb
      const sampleRate = context.sampleRate;
      const impulseLength = Math.floor(config.decay * sampleRate);
      const impulseBuffer = context.createBuffer(2, impulseLength, sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseBuffer.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (config.decay * sampleRate));
        }
      }
      
      convolver.buffer = impulseBuffer;
      
      // Configurar wet/dry mix
      const dryGain = context.createGain();
      const wetGain = context.createGain();
      
      dryGain.gain.value = config.dry;
      wetGain.gain.value = config.wet;
      
      this.effects.reverb = convolver;
      this.reconnectEffectsChain();
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar reverb:', error);
      return false;
    }
  }

  /**
   * Remove um efeito
   */
  removeEffect(effectType: 'filter' | 'reverb' | 'delay'): boolean {
    const effect = this.effects[effectType];
    if (!effect) {
      return false;
    }
    
    effect.disconnect();
    delete this.effects[effectType];
    this.reconnectEffectsChain();
    
    return true;
  }

  /**
   * Remove todos os efeitos
   */
  clearEffects(): void {
    Object.values(this.effects).forEach(effect => {
      if (effect) {
        effect.disconnect();
      }
    });
    
    this.effects = {};
  }

  // ============================================
  // MÉTODOS PÚBLICOS - CONFIGURAÇÃO
  // ============================================

  /**
   * Define envelope padrão
   */
  setDefaultEnvelope(envelope: ADSREnvelope): void {
    this.config.defaultEnvelope = envelope;
    this.envelope = new AdvancedEnvelope(envelope);
  }

  /**
   * Define configuração de oscilador para uma nota específica
   */
  setNoteOscillatorConfig(note: Note, octave: Octave, config: OscillatorConfig): void {
    const noteKey = this.getNoteKey(note, octave);
    this.config.noteMapping.set(noteKey, config);
  }

  /**
   * Define efeitos do instrumento
   */
  setInstrumentEffects(effects: InstrumentAudioConfig['instrumentEffects']): void {
    this.config.instrumentEffects = effects;
    
    // Aplicar efeitos
    if (effects.filter) {
      this.addFilter(effects.filter);
    }
    
    if (effects.reverb) {
      this.addReverb(effects.reverb);
    }
    
    // Delay seria implementado similarmente
  }

  // ============================================
  // MÉTODOS PÚBLICOS - INFORMAÇÕES
  // ============================================

  /**
   * Obtém instrumento associado
   */
  getInstrument(): Instrument {
    return this.instrument;
  }

  /**
   * Obtém AudioEngine associado
   */
  getAudioEngine(): AudioEngine {
    return this.audioEngine;
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): InstrumentAudioConfig {
    return { ...this.config };
  }

  /**
   * Obtém número de notas ativas
   */
  getActiveNoteCount(): number {
    return this.activeOscillators.size;
  }

  /**
   * Obtém lista de notas ativas
   */
  getActiveNotes(): Array<{ note: Note; octave: Octave }> {
    const notes: Array<{ note: Note; octave: Octave }> = [];
    
    for (const noteKey of this.activeOscillators.keys()) {
      const [note, octave] = this.parseNoteKey(noteKey);
      notes.push({ note, octave: parseInt(octave) as Octave });
    }
    
    return notes;
  }

  /**
   * Verifica se está inicializado
   */
  isAudioInitialized(): boolean {
    return this.isInitialized;
  }

  // ============================================
  // MÉTODOS PRIVADOS - INICIALIZAÇÃO
  // ============================================

  /**
   * Inicializa mapeamento de notas
   */
  private initializeNoteMapping(): void {
    const instrumentConfig = this.instrument.getConfig();
    
    // Configuração padrão baseada no tipo de instrumento
    const defaultOscillatorConfig: OscillatorConfig = {
      waveform: this.getDefaultWaveformForInstrument(instrumentConfig.type),
      frequency: 440, // Será sobrescrito
      volume: 0.8
    };
    
    // Para cada nota no range do instrumento, criar mapeamento
    const range = this.instrument.getCurrentRange();
    // Nota: Em uma implementação completa, iteraríamos sobre todas as notas no range
  }

  /**
   * Configura eventos do instrumento
   */
  private setupInstrumentEvents(): void {
    // Escutar eventos do instrumento
    this.instrument.on('noteOn', (note: Note, octave: Octave, velocity?: number) => {
      this.playNote(note, octave, velocity || 80);
    });
    
    this.instrument.on('noteOff', (note: Note, octave: Octave) => {
      this.stopNote(note, octave);
    });
  }

  /**
   * Configura efeitos
   */
  private async setupEffects(): Promise<void> {
    // Aplicar efeitos da configuração
    if (this.config.instrumentEffects) {
      if (this.config.instrumentEffects.filter) {
        this.addFilter(this.config.instrumentEffects.filter);
      }
      
      if (this.config.instrumentEffects.reverb) {
        this.addReverb(this.config.instrumentEffects.reverb);
      }
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS - PLAYBACK
  // ============================================

  /**
   * Obtém AudioContext
   */
  private getAudioContext(): AudioContext | null {
    // Em uma implementação real, obteríamos do AudioEngine
    return null; // Placeholder
  }

  /**
   * Obtém configuração do oscilador para uma nota
   */
  private getOscillatorConfigForNote(note: Note, octave: Octave, velocity: number): OscillatorConfig {
    const noteKey = this.getNoteKey(note, octave);
    
    // Tentar obter configuração específica
    const specificConfig = this.config.noteMapping.get(noteKey);
    if (specificConfig) {
      return {
        ...specificConfig,
        frequency: noteToFrequency(note, octave),
        volume: (velocity / 127) * (specificConfig.volume || 0.8)
      };
    }
    
    // Configuração padrão baseada no instrumento
    const instrumentConfig = this.instrument.getConfig();
    
    return {
      waveform: this.getDefaultWaveformForInstrument(instrumentConfig.type),
      frequency: noteToFrequency(note, octave),
      volume: velocity / 127,
      detune: this.getDefaultDetuneForInstrument(instrumentConfig.type)
    };
  }

  /**
   * Obtém configuração do envelope baseado na velocity
   */
  private getEnvelopeConfigForVelocity(velocity: number): ADSREnvelope {
    const baseEnvelope = this.config.defaultEnvelope;
    
    // Ajustar baseado na velocity
    const velocityFactor = velocity / 127;
    
    return {
      attack: baseEnvelope.attack * (1 - velocityFactor * 0.3), // Notas mais fortes têm attack mais rápido
      decay: baseEnvelope.decay,
      sustain: baseEnvelope.sustain * velocityFactor, // Notas mais fracas têm menos sustain
      release: baseEnvelope.release * (0.5 + velocityFactor * 0.5) // Notas mais fortes têm release mais longo
    };
  }

  /**
   * Conecta um node através da chain de efeitos
   */
  private connectThroughEffects(sourceNode: AudioNode): void {
    const context = this.getAudioContext();
    if (!context) return;
    
    let currentNode: AudioNode = sourceNode;
    
    // Aplicar filtro se existir
    if (this.effects.filter) {
      currentNode.connect(this.effects.filter);
      currentNode = this.effects.filter;
    }
    
    // Aplicar reverb se existir
    if (this.effects.reverb) {
      // Para reverb, precisamos de wet/dry mix
      const dryGain = context.createGain();
      const wetGain = context.createGain();
      
      dryGain.gain.value = 0.7;
      wetGain.gain.value = 0.3;
      
      currentNode.connect(dryGain);
      currentNode.connect(this.effects.reverb);
      this.effects.reverb.connect(wetGain);
      
      // Conectar ambos ao destino
      dryGain.connect(context.destination);
      wetGain.connect(context.destination);
      
      return;
    }
    
    // Se não há efeitos, conectar diretamente
    currentNode.connect(context.destination);
  }

  /**
   * Reconecta toda a chain de efeitos
   */
  private reconnectEffectsChain(): void {
    // Reconectar todos os oscillators ativos
    for (const oscillators of this.activeOscillators.values()) {
      oscillators.forEach(oscillator => {
        const gainNode = oscillator.getOutputNode();
        gainNode.disconnect();
        this.connectThroughEffects(gainNode);
      });
    }
  }

  /**
   * Remove um oscillator da lista
   */
  private removeOscillator(noteKey: string, oscillator: AdvancedOscillator): void {
    const oscillators = this.activeOscillators.get(noteKey);
    if (!oscillators) return;
    
    const index = oscillators.indexOf(oscillator);
    if (index !== -1) {
      oscillators.splice(index, 1);
    }
    
    if (oscillators.length === 0) {
      this.activeOscillators.delete(noteKey);
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS - UTILITÁRIOS
  // ============================================

  /**
   * Obtém waveform padrão para um tipo de instrumento
   */
  private getDefaultWaveformForInstrument(instrumentType: string): 'sine' | 'square' | 'sawtooth' | 'triangle' {
    const waveformMap: Record<string, 'sine' | 'square' | 'sawtooth' | 'triangle'> = {
      'piano': 'sine',
      'guitar': 'sawtooth',
      'ukulele': 'sawtooth',
      'violin': 'sine',
      'flute': 'sine',
      'trumpet': 'square',
      'synth': 'square',
      'bass': 'sawtooth'
    };
    
    return waveformMap[instrumentType] || 'sine';
  }

  /**
   * Obtém detune padrão para um tipo de instrumento
   */
  private getDefaultDetuneForInstrument(instrumentType: string): number {
    const detuneMap: Record<string, number> = {
      'piano': 0,
      'guitar': 5,
      'ukulele': 3,
      'violin': 2,
      'choir': 7,
      'synth': 10
    };
    
    return detuneMap[instrumentType] || 0;
  }

  /**
   * Gera chave única para uma nota
   */
  private getNoteKey(note: Note, octave: Octave): string {
    return `${note}-${octave}`;
  }

  /**
   * Analisa chave de nota
   */
  private parseNoteKey(noteKey: string): [Note, string] {
    const parts = noteKey.split('-');
    return [parts[0] as Note, parts[1]];
  }
}

/**
 * Factory para criar InstrumentAudio
 */
export class InstrumentAudioFactory {
  /**
   * Cria InstrumentAudio para um instrumento
   */
  static create(instrument: Instrument, audioEngine: AudioEngine): InstrumentAudio {
    return new InstrumentAudio(instrument, audioEngine);
  }

  /**
   * Cria InstrumentAudio com configuração específica
   */
  static createWithConfig(
    instrument: Instrument,
    audioEngine: AudioEngine,
    config: Partial<InstrumentAudioConfig>
  ): InstrumentAudio {
    return new InstrumentAudio(instrument, audioEngine, config);
  }

  /**
   * Cria presets de áudio para tipos de instrumentos comuns
   */
  static createPreset(
    instrumentType: string,
    audioEngine: AudioEngine
  ): InstrumentAudio {
    // Configurações de preset
    const presets: Record<string, Partial<InstrumentAudioConfig>> = {
      'piano': {
        defaultEnvelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.5,
          release: 0.5
        },
        instrumentEffects: {
          reverb: {
            decay: 1.5,
            wet: 0.2,
            dry: 0.8
          }
        }
      },
      'guitar': {
        defaultEnvelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.3,
          release: 1.0
        },
        instrumentEffects: {
          reverb: {
            decay: 1.0,
            wet: 0.3,
            dry: 0.7
          },
          filter: {
            type: 'lowpass',
            frequency: 4000,
            Q: 1.0
          }
        }
      },
      'ukulele': {
        defaultEnvelope: {
          attack: 0.03,
          decay: 0.15,
          sustain: 0.4,
          release: 0.8
        },
        instrumentEffects: {
          reverb: {
            decay: 0.8,
            wet: 0.25,
            dry: 0.75
          }
        }
      },
      'synth': {
        defaultEnvelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0.0,
          release: 0.1
        }
      }
    };
    
    const preset = presets[instrumentType] || presets.piano;
    
    // Criar instrumento dummy para o preset
    const dummyInstrument = {
      getConfig: () => ({ id: 'dummy', type: instrumentType, name: `${instrumentType} preset` }),
      getCurrentRange: () => ({ lowestNote: { note: 'C', octave: 2 }, highestNote: { note: 'C', octave: 6 }, totalSemitones: 48 }),
      on: () => {} // No-op para eventos
    } as unknown as Instrument;
    
    return new InstrumentAudio(dummyInstrument, audioEngine, preset);
  }
}

export default {
  InstrumentAudio,
  InstrumentAudioFactory
};