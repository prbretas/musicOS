/**
 * Sistema de osciladores para o AudioEngine
 * 
 * Fornece diferentes formas de onda e funcionalidades
 * avançadas para síntese de áudio.
 */

import {
  WaveformType,
  OscillatorConfig,
  ADSREnvelope
} from '../types/audio';

/**
 * Oscilador personalizado com funcionalidades avançadas
 */
export class AdvancedOscillator {
  /** AudioContext do Web Audio API */
  private context: AudioContext;
  
  /** Oscillator node do Web Audio API */
  private oscillator: OscillatorNode;
  
  /** Gain node para volume */
  private gainNode: GainNode;
  
  /** Configuração atual */
  private config: OscillatorConfig;
  
  /** Se está tocando */
  private isPlaying = false;
  
  /** Tempo de início */
  private startTime = 0;
  
  /** Callbacks de eventos */
  private eventCallbacks = {
    onPlay: new Set<() => void>(),
    onStop: new Set<() => void>(),
    onFrequencyChange: new Set<(frequency: number) => void>()
  };

  /**
   * Construtor
   */
  constructor(context: AudioContext, config: OscillatorConfig) {
    this.context = context;
    this.config = { ...config };
    
    // Criar oscillator
    this.oscillator = context.createOscillator();
    this.setWaveform(this.config.waveform);
    this.oscillator.frequency.value = this.config.frequency;
    
    if (this.config.detune !== undefined) {
      this.oscillator.detune.value = this.config.detune;
    }
    
    // Criar gain node
    this.gainNode = context.createGain();
    this.gainNode.gain.value = this.config.volume || 1.0;
    
    // Conectar oscillator → gain
    this.oscillator.connect(this.gainNode);
  }

  // ============================================
  // MÉTODOS PÚBLICOS - CONTROLE
  // ============================================

  /**
   * Inicia o oscilador
   */
  play(when?: number): void {
    if (this.isPlaying) {
      console.warn('Oscillator já está tocando');
      return;
    }
    
    const startTime = when || this.context.currentTime;
    
    try {
      this.oscillator.start(startTime);
      this.isPlaying = true;
      this.startTime = startTime;
      
      // Disparar eventos
      this.eventCallbacks.onPlay.forEach(callback => callback());
    } catch (error) {
      console.error('Erro ao iniciar oscillator:', error);
    }
  }

  /**
   * Para o oscilador
   */
  stop(when?: number): void {
    if (!this.isPlaying) {
      console.warn('Oscillator não está tocando');
      return;
    }
    
    const stopTime = when || this.context.currentTime;
    
    try {
      this.oscillator.stop(stopTime);
      this.isPlaying = false;
      
      // Disparar eventos
      this.eventCallbacks.onStop.forEach(callback => callback());
    } catch (error) {
      console.error('Erro ao parar oscillator:', error);
    }
  }

  /**
   * Para o oscilador com envelope de release
   */
  stopWithRelease(releaseTime: number, when?: number): void {
    if (!this.isPlaying) return;
    
    const stopTime = when || this.context.currentTime;
    
    // Aplicar envelope de release
    this.gainNode.gain.cancelScheduledValues(stopTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, stopTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime + releaseTime);
    
    // Parar oscillator após release
    setTimeout(() => {
      this.stop(stopTime + releaseTime);
    }, releaseTime * 1000);
  }

  // ============================================
  // MÉTODOS PÚBLICOS - CONFIGURAÇÃO
  // ============================================

  /**
   * Define a forma de onda
   */
  setWaveform(waveform: WaveformType): void {
    this.config.waveform = waveform;
    
    if (waveform === 'custom') {
      // Para waveform customizada, usar periodic wave
      // (implementação simplificada)
      this.oscillator.type = 'sine';
    } else {
      this.oscillator.type = waveform as OscillatorType;
    }
  }

  /**
   * Define a frequência
   */
  setFrequency(frequency: number, rampTime = 0): void {
    this.config.frequency = frequency;
    
    if (rampTime > 0) {
      const currentTime = this.context.currentTime;
      this.oscillator.frequency.cancelScheduledValues(currentTime);
      this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, currentTime);
      this.oscillator.frequency.linearRampToValueAtTime(frequency, currentTime + rampTime);
    } else {
      this.oscillator.frequency.value = frequency;
    }
    
    // Disparar eventos
    this.eventCallbacks.onFrequencyChange.forEach(callback => callback(frequency));
  }

  /**
   * Define o detune
   */
  setDetune(detune: number): void {
    this.config.detune = detune;
    this.oscillator.detune.value = detune;
  }

  /**
   * Define o volume
   */
  setVolume(volume: number, rampTime = 0): void {
    this.config.volume = volume;
    
    if (rampTime > 0) {
      const currentTime = this.context.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(volume, currentTime + rampTime);
    } else {
      this.gainNode.gain.value = volume;
    }
  }

  /**
   * Aplica envelope ADSR
   */
  applyEnvelope(envelope: ADSREnvelope, peakVolume = 1.0): void {
    if (!this.isPlaying) {
      console.warn('Não é possível aplicar envelope: oscillator não está tocando');
      return;
    }
    
    const currentTime = this.context.currentTime;
    const startTime = this.startTime;
    
    // Resetar gain
    this.gainNode.gain.cancelScheduledValues(startTime);
    this.gainNode.gain.setValueAtTime(0, startTime);
    
    // Attack
    const attackEndTime = startTime + envelope.attack;
    this.gainNode.gain.linearRampToValueAtTime(peakVolume, attackEndTime);
    
    // Decay
    const decayEndTime = attackEndTime + envelope.decay;
    const sustainLevel = peakVolume * envelope.sustain;
    this.gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEndTime);
    
    // Sustain é mantido automaticamente
    
    // Nota: Release precisa ser aplicado quando a nota for parada
  }

  // ============================================
  // MÉTODOS PÚBLICOS - CONEXÃO
  // ============================================

  /**
   * Conecta a um node de destino
   */
  connect(destination: AudioNode): AudioNode {
    return this.gainNode.connect(destination);
  }

  /**
   * Desconecta de todos os nodes
   */
  disconnect(): void {
    this.gainNode.disconnect();
  }

  /**
   * Conecta a um destino específico
   */
  connectTo(destination: AudioNode, output?: number, input?: number): void {
    this.gainNode.connect(destination, output, input);
  }

  // ============================================
  // MÉTODOS PÚBLICOS - INFORMAÇÕES
  // ============================================

  /**
   * Obtém a configuração atual
   */
  getConfig(): OscillatorConfig {
    return { ...this.config };
  }

  /**
   * Verifica se está tocando
   */
  isActive(): boolean {
    return this.isPlaying;
  }

  /**
   * Obtém tempo desde o início
   */
  getPlaybackTime(): number {
    if (!this.isPlaying) {
      return 0;
    }
    
    return this.context.currentTime - this.startTime;
  }

  /**
   * Obtém o node de saída
   */
  getOutputNode(): GainNode {
    return this.gainNode;
  }

  // ============================================
  // MÉTODOS PÚBLICOS - EVENTOS
  // ============================================

  /**
   * Adiciona listener para evento de play
   */
  onPlay(callback: () => void): () => void {
    this.eventCallbacks.onPlay.add(callback);
    return () => {
      this.eventCallbacks.onPlay.delete(callback);
    };
  }

  /**
   * Adiciona listener para evento de stop
   */
  onStop(callback: () => void): () => void {
    this.eventCallbacks.onStop.add(callback);
    return () => {
      this.eventCallbacks.onStop.delete(callback);
    };
  }

  /**
   * Adiciona listener para mudança de frequência
   */
  onFrequencyChange(callback: (frequency: number) => void): () => void {
    this.eventCallbacks.onFrequencyChange.add(callback);
    return () => {
      this.eventCallbacks.onFrequencyChange.delete(callback);
    };
  }

  // ============================================
  // MÉTODOS ESTÁTICOS - UTILITÁRIOS
  // ============================================

  /**
   * Cria um periodic wave customizado
   */
  static createCustomWaveform(
    context: AudioContext,
    real: number[],
    imag: number[]
  ): PeriodicWave {
    return context.createPeriodicWave(
      Float32Array.from(real),
      Float32Array.from(imag)
    );
  }

  /**
   * Gera formas de onda padrão como periodic waves
   */
  static generateStandardWaveforms(context: AudioContext): Record<string, PeriodicWave> {
    const waveforms: Record<string, PeriodicWave> = {};
    
    // Sine wave (já é padrão, mas criamos para consistência)
    const sineReal = [0, 0];
    const sineImag = [0, 1];
    waveforms.sine = this.createCustomWaveform(context, sineReal, sineImag);
    
    // Square wave (aproximação com harmônicas ímpares)
    const squareReal = Array(10).fill(0);
    const squareImag: number[] = [];
    for (let n = 1; n <= 10; n += 2) {
      squareImag.push(4 / (Math.PI * n));
    }
    waveforms.square = this.createCustomWaveform(context, squareReal, squareImag);
    
    // Sawtooth wave (todos os harmônicos)
    const sawReal = Array(10).fill(0);
    const sawImag: number[] = [];
    for (let n = 1; n <= 10; n++) {
      sawImag.push(2 / (Math.PI * n) * Math.pow(-1, n + 1));
    }
    waveforms.sawtooth = this.createCustomWaveform(context, sawReal, sawImag);
    
    // Triangle wave (harmônicas ímpares, alternando sinal)
    const triangleReal = Array(10).fill(0);
    const triangleImag: number[] = [];
    for (let n = 1; n <= 10; n += 2) {
      triangleImag.push(8 / (Math.PI * Math.PI * n * n) * Math.pow(-1, (n - 1) / 2));
    }
    waveforms.triangle = this.createCustomWaveform(context, triangleReal, triangleImag);
    
    return waveforms;
  }

  /**
   * Converte frequência para período
   */
  static frequencyToPeriod(frequency: number): number {
    return 1 / frequency;
  }

  /**
   * Converte período para frequência
   */
  static periodToFrequency(period: number): number {
    return 1 / period;
  }

  /**
   * Calcula frequência baseada em nota e oitava
   */
  static calculateFrequency(note: string, octave: number, tuning = 440): number {
    // Mapeamento de notas para semitons (C4 = 0)
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    
    const noteValue = noteMap[note];
    if (noteValue === undefined) {
      throw new Error(`Nota inválida: ${note}`);
    }
    
    // Cálculo de frequência usando a fórmula de temperamento igual
    const semitonesFromA4 = (octave - 4) * 12 + (noteValue - 9); // A4 = 440Hz
    
    return tuning * Math.pow(2, semitonesFromA4 / 12);
  }
}

/**
 * Sistema de osciladores LFO (Low Frequency Oscillator)
 */
export class LFO {
  /** AudioContext */
  private context: AudioContext;
  
  /** Oscillator node */
  private oscillator: OscillatorNode;
  
  /** Gain node para profundidade */
  private depthGain: GainNode;
  
  /** Se está ativo */
  private isActive = false;
  
  /** Configuração */
  private config = {
    frequency: 1, // Hz
    depth: 0.5,   // 0-1
    waveform: 'sine' as WaveformType
  };

  constructor(context: AudioContext) {
    this.context = context;
    this.oscillator = context.createOscillator();
    this.depthGain = context.createGain();
    
    // Configurar chain: oscillator → depth gain
    this.oscillator.connect(this.depthGain);
    
    // Configurar padrão
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this.config.frequency;
    this.depthGain.gain.value = this.config.depth;
  }

  /**
   * Inicia o LFO
   */
  start(): void {
    if (this.isActive) return;
    
    this.oscillator.start();
    this.isActive = true;
  }

  /**
   * Para o LFO
   */
  stop(): void {
    if (!this.isActive) return;
    
    this.oscillator.stop();
    this.isActive = false;
  }

  /**
   * Define frequência do LFO
   */
  setFrequency(frequency: number): void {
    this.config.frequency = frequency;
    this.oscillator.frequency.value = frequency;
  }

  /**
   * Define profundidade do LFO
   */
  setDepth(depth: number): void {
    this.config.depth = depth;
    this.depthGain.gain.value = depth;
  }

  /**
   * Define forma de onda do LFO
   */
  setWaveform(waveform: WaveformType): void {
    this.config.waveform = waveform;
    this.oscillator.type = waveform as OscillatorType;
  }

  /**
   * Conecta o LFO a um parâmetro
   */
  connectToParameter(param: AudioParam): void {
    this.depthGain.connect(param);
  }

  /**
   * Desconecta de todos os parâmetros
   */
  disconnect(): void {
    this.depthGain.disconnect();
  }

  /**
   * Obtém o node de saída
   */
  getOutputNode(): GainNode {
    return this.depthGain;
  }
}

/**
 * Factory para criar osciladores
 */
export class OscillatorFactory {
  /**
   * Cria um oscilador baseado na configuração
   */
  static create(context: AudioContext, config: OscillatorConfig): AdvancedOscillator {
    return new AdvancedOscillator(context, config);
  }

  /**
   * Cria múltiplos osciladores (para stereo, detune, etc.)
   */
  static createStereoPair(
    context: AudioContext,
    config: OscillatorConfig,
    detuneSpread = 10
  ): { left: AdvancedOscillator; right: AdvancedOscillator } {
    const leftConfig = {
      ...config,
      detune: (config.detune || 0) - detuneSpread / 2
    };
    
    const rightConfig = {
      ...config,
      detune: (config.detune || 0) + detuneSpread / 2
    };
    
    return {
      left: new AdvancedOscillator(context, leftConfig),
      right: new AdvancedOscillator(context, rightConfig)
    };
  }

  /**
   * Cria um oscilador FM (Frequency Modulation)
   */
  static createFMOscillator(
    context: AudioContext,
    carrierConfig: OscillatorConfig,
    modulatorConfig: OscillatorConfig,
    modulationIndex = 1.0
  ): AdvancedOscillator {
    // Carrier oscillator
    const carrier = new AdvancedOscillator(context, carrierConfig);
    
    // Modulator oscillator
    const modulator = new AdvancedOscillator(context, modulatorConfig);
    
    // Conectar modulator à frequência do carrier
    const depthGain = context.createGain();
    depthGain.gain.value = modulatorConfig.frequency * modulationIndex;
    
    modulator.connect(depthGain);
    depthGain.connect(carrier.getOutputNode().context as any); // Hack para acessar oscillator node
    
    // Iniciar ambos juntos
    const startTime = context.currentTime + 0.1;
    carrier.play(startTime);
    modulator.play(startTime);
    
    return carrier;
  }
}

export default {
  AdvancedOscillator,
  LFO,
  OscillatorFactory
};