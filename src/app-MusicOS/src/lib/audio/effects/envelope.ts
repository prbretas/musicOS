/**
 * Sistema de envelopes ADSR para o AudioEngine
 * 
 * Fornece envelopes avançados com controle preciso
 * de Attack, Decay, Sustain e Release.
 */

import {
  ADSREnvelope
} from '../types/audio';

/**
 * Envelope ADSR avançado com curvas personalizáveis
 */
export class AdvancedEnvelope {
  /** Configuração do envelope */
  private config: ADSREnvelope;
  
  /** Curva de ataque ('linear' | 'exponential' | 'logarithmic') */
  private attackCurve: 'linear' | 'exponential' | 'logarithmic';
  
  /** Curva de decaimento */
  private decayCurve: 'linear' | 'exponential' | 'logarithmic';
  
  /** Curva de release */
  private releaseCurve: 'linear' | 'exponential' | 'logarithmic';
  
  /** Estado atual */
  private state: 'idle' | 'attack' | 'decay' | 'sustain' | 'release' = 'idle';
  
  /** Valor atual (0-1) */
  private currentValue = 0;
  
  /** Timestamp de início */
  private startTime = 0;
  
  /** Timestamp de início de release */
  private releaseStartTime = 0;
  
  /** Callbacks de eventos */
  private eventCallbacks = {
    onAttackStart: new Set<() => void>(),
    onDecayStart: new Set<() => void>(),
    onSustainStart: new Set<() => void>(),
    onReleaseStart: new Set<() => void>(),
    onComplete: new Set<() => void>(),
    onValueChange: new Set<(value: number) => void>()
  };

  /**
   * Construtor
   */
  constructor(config: ADSREnvelope) {
    this.config = { ...config };
    this.attackCurve = 'exponential';
    this.decayCurve = 'exponential';
    this.releaseCurve = 'exponential';
  }

  // ============================================
  // MÉTODOS PÚBLICOS - CONTROLE
  // ============================================

  /**
   * Inicia o envelope
   */
  start(peakValue = 1.0, startTime?: number): void {
    this.state = 'attack';
    this.startTime = startTime || Date.now();
    this.currentValue = 0;
    
    // Disparar evento
    this.eventCallbacks.onAttackStart.forEach(callback => callback());
    
    // Iniciar atualização
    this.update();
  }

  /**
   * Inicia o release do envelope
   */
  release(startTime?: number): void {
    if (this.state === 'idle' || this.state === 'release') {
      return;
    }
    
    this.state = 'release';
    this.releaseStartTime = startTime || Date.now();
    
    // Disparar evento
    this.eventCallbacks.onReleaseStart.forEach(callback => callback());
  }

  /**
   * Reinicia o envelope
   */
  reset(): void {
    this.state = 'idle';
    this.currentValue = 0;
    this.startTime = 0;
    this.releaseStartTime = 0;
  }

  /**
   * Atualiza o valor do envelope
   */
  private update(): void {
    if (this.state === 'idle') {
      return;
    }
    
    const now = Date.now();
    const elapsed = (now - this.startTime) / 1000; // Converter para segundos
    
    switch (this.state) {
      case 'attack':
        this.updateAttack(elapsed);
        break;
        
      case 'decay':
        this.updateDecay(elapsed);
        break;
        
      case 'sustain':
        this.updateSustain(elapsed);
        break;
        
      case 'release':
        this.updateRelease(elapsed);
        break;
    }
    
    // Disparar evento de mudança de valor
    this.eventCallbacks.onValueChange.forEach(callback => callback(this.currentValue));
    
    // Continuar atualização se necessário
    if (this.state !== 'idle') {
      requestAnimationFrame(() => this.update());
    }
  }

  /**
   * Atualiza fase de ataque
   */
  private updateAttack(elapsed: number): void {
    if (elapsed >= this.config.attack) {
      // Terminar ataque, iniciar decaimento
      this.currentValue = 1.0;
      this.state = 'decay';
      this.eventCallbacks.onDecayStart.forEach(callback => callback());
      return;
    }
    
    // Calcular valor baseado na curva
    const progress = elapsed / this.config.attack;
    this.currentValue = this.applyCurve(progress, this.attackCurve);
  }

  /**
   * Atualiza fase de decaimento
   */
  private updateDecay(elapsed: number): void {
    const decayStart = this.config.attack;
    const decayEnd = decayStart + this.config.decay;
    
    if (elapsed >= decayEnd) {
      // Terminar decaimento, iniciar sustain
      this.currentValue = this.config.sustain;
      this.state = 'sustain';
      this.eventCallbacks.onSustainStart.forEach(callback => callback());
      return;
    }
    
    // Calcular valor baseado na curva
    const decayProgress = (elapsed - decayStart) / this.config.decay;
    const valueRange = 1.0 - this.config.sustain;
    this.currentValue = 1.0 - (valueRange * this.applyCurve(decayProgress, this.decayCurve));
  }

  /**
   * Atualiza fase de sustain
   */
  private updateSustain(elapsed: number): void {
    // Sustain mantém o valor constante
    this.currentValue = this.config.sustain;
    
    // Não fazemos nada aqui, o release será chamado manualmente
  }

  /**
   * Atualiza fase de release
   */
  private updateRelease(elapsed: number): void {
    const releaseElapsed = (Date.now() - this.releaseStartTime) / 1000;
    
    if (releaseElapsed >= this.config.release) {
      // Terminar release
      this.currentValue = 0;
      this.state = 'idle';
      this.eventCallbacks.onComplete.forEach(callback => callback());
      return;
    }
    
    // Calcular valor baseado na curva
    const releaseProgress = releaseElapsed / this.config.release;
    const startValue = this.config.sustain;
    this.currentValue = startValue * (1 - this.applyCurve(releaseProgress, this.releaseCurve));
  }

  /**
   * Aplica curva a um valor linear
   */
  private applyCurve(value: number, curve: string): number {
    switch (curve) {
      case 'exponential':
        return Math.pow(value, 2);
        
      case 'logarithmic':
        return Math.log10(value * 9 + 1);
        
      case 'linear':
      default:
        return value;
    }
  }

  // ============================================
  // MÉTODOS PÚBLICOS - CONFIGURAÇÃO
  // ============================================

  /**
   * Define configuração do envelope
   */
  setConfig(config: ADSREnvelope): void {
    this.config = { ...config };
  }

  /**
   * Define curva de ataque
   */
  setAttackCurve(curve: 'linear' | 'exponential' | 'logarithmic'): void {
    this.attackCurve = curve;
  }

  /**
   * Define curva de decaimento
   */
  setDecayCurve(curve: 'linear' | 'exponential' | 'logarithmic'): void {
    this.decayCurve = curve;
  }

  /**
   * Define curva de release
   */
  setReleaseCurve(curve: 'linear' | 'exponential' | 'logarithmic'): void {
    this.releaseCurve = curve;
  }

  // ============================================
  // MÉTODOS PÚBLICOS - APLICAÇÃO A NODES
  // ============================================

  /**
   * Aplica envelope a um GainNode do Web Audio API
   */
  applyToGainNode(
    gainNode: GainNode,
    peakValue = 1.0,
    startTime?: number
  ): void {
    const audioContext = gainNode.context;
    const currentTime = startTime || audioContext.currentTime;
    
    // Attack
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(0, currentTime);
    
    const attackEndTime = currentTime + this.config.attack;
    gainNode.gain.linearRampToValueAtTime(peakValue, attackEndTime);
    
    // Decay
    const decayEndTime = attackEndTime + this.config.decay;
    const sustainValue = peakValue * this.config.sustain;
    gainNode.gain.linearRampToValueAtTime(sustainValue, decayEndTime);
    
    // Nota: Sustain é mantido automaticamente
    // Release precisa ser aplicado quando a nota for parada
  }

  /**
   * Aplica release a um GainNode
   */
  applyReleaseToGainNode(
    gainNode: GainNode,
    startTime?: number
  ): void {
    const audioContext = gainNode.context;
    const currentTime = startTime || audioContext.currentTime;
    
    // Release
    const currentValue = gainNode.gain.value;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(currentValue, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + this.config.release);
  }

  /**
   * Aplica envelope completo a um GainNode (com release automático)
   */
  applyCompleteToGainNode(
    gainNode: GainNode,
    duration: number,
    peakValue = 1.0,
    startTime?: number
  ): void {
    const audioContext = gainNode.context;
    const currentTime = startTime || audioContext.currentTime;
    
    // Calcular tempo de sustain
    const totalAD = this.config.attack + this.config.decay;
    const sustainDuration = Math.max(0, duration - totalAD - this.config.release);
    
    // Attack
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(0, currentTime);
    
    const attackEndTime = currentTime + this.config.attack;
    gainNode.gain.linearRampToValueAtTime(peakValue, attackEndTime);
    
    // Decay
    const decayEndTime = attackEndTime + this.config.decay;
    const sustainValue = peakValue * this.config.sustain;
    gainNode.gain.linearRampToValueAtTime(sustainValue, decayEndTime);
    
    // Sustain
    const sustainEndTime = decayEndTime + sustainDuration;
    gainNode.gain.linearRampToValueAtTime(sustainValue, sustainEndTime);
    
    // Release
    const releaseEndTime = sustainEndTime + this.config.release;
    gainNode.gain.exponentialRampToValueAtTime(0.001, releaseEndTime);
  }

  // ============================================
  // MÉTODOS PÚBLICOS - INFORMAÇÕES
  // ============================================

  /**
   * Obtém configuração atual
   */
  getConfig(): ADSREnvelope {
    return { ...this.config };
  }

  /**
   * Obtém estado atual
   */
  getState(): string {
    return this.state;
  }

  /**
   * Obtém valor atual
   */
  getCurrentValue(): number {
    return this.currentValue;
  }

  /**
   * Verifica se o envelope está ativo
   */
  isActive(): boolean {
    return this.state !== 'idle';
  }

  /**
   * Obtém tempo total do envelope (até o final do release)
   */
  getTotalDuration(): number {
    return this.config.attack + this.config.decay + this.config.release;
  }

  // ============================================
  // MÉTODOS PÚBLICOS - EVENTOS
  // ============================================

  /**
   * Adiciona listener para início de ataque
   */
  onAttackStart(callback: () => void): () => void {
    this.eventCallbacks.onAttackStart.add(callback);
    return () => {
      this.eventCallbacks.onAttackStart.delete(callback);
    };
  }

  /**
   * Adiciona listener para início de decaimento
   */
  onDecayStart(callback: () => void): () => void {
    this.eventCallbacks.onDecayStart.add(callback);
    return () => {
      this.eventCallbacks.onDecayStart.delete(callback);
    };
  }

  /**
   * Adiciona listener para início de sustain
   */
  onSustainStart(callback: () => void): () => void {
    this.eventCallbacks.onSustainStart.add(callback);
    return () => {
      this.eventCallbacks.onSustainStart.delete(callback);
    };
  }

  /**
   * Adiciona listener para início de release
   */
  onReleaseStart(callback: () => void): () => void {
    this.eventCallbacks.onReleaseStart.add(callback);
    return () => {
      this.eventCallbacks.onReleaseStart.delete(callback);
    };
  }

  /**
   * Adiciona listener para conclusão
   */
  onComplete(callback: () => void): () => void {
    this.eventCallbacks.onComplete.add(callback);
    return () => {
      this.eventCallbacks.onComplete.delete(callback);
    };
  }

  /**
   * Adiciona listener para mudança de valor
   */
  onValueChange(callback: (value: number) => void): () => void {
    this.eventCallbacks.onValueChange.add(callback);
    return () => {
      this.eventCallbacks.onValueChange.delete(callback);
    };
  }

  // ============================================
  // MÉTODOS ESTÁTICOS - UTILITÁRIOS
  // ============================================

  /**
   * Cria envelope para instrumento específico
   */
  static createForInstrument(instrumentType: string): AdvancedEnvelope {
    const envelopes: Record<string, ADSREnvelope> = {
      'piano': {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.5
      },
      'guitar': {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.3,
        release: 1.0
      },
      'pluck': {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.0,
        release: 0.1
      },
      'pad': {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.8,
        release: 2.0
      },
      'percussive': {
        attack: 0.001,
        decay: 0.05,
        sustain: 0.0,
        release: 0.05
      },
      'strings': {
        attack: 0.2,
        decay: 0.3,
        sustain: 0.7,
        release: 1.5
      },
      'brass': {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.6,
        release: 0.8
      },
      'flute': {
        attack: 0.15,
        decay: 0.2,
        sustain: 0.8,
        release: 0.5
      }
    };
    
    const config = envelopes[instrumentType] || envelopes.pluck;
    return new AdvancedEnvelope(config);
  }

  /**
   * Interpola entre dois envelopes
   */
  static interpolate(
    envelope1: ADSREnvelope,
    envelope2: ADSREnvelope,
    amount: number
  ): ADSREnvelope {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    
    return {
      attack: lerp(envelope1.attack, envelope2.attack, amount),
      decay: lerp(envelope1.decay, envelope2.decay, amount),
      sustain: lerp(envelope1.sustain, envelope2.sustain, amount),
      release: lerp(envelope1.release, envelope2.release, amount)
    };
  }

  /**
   * Valida configuração de envelope
   */
  static validateConfig(config: ADSREnvelope): boolean {
    return (
      config.attack >= 0 &&
      config.decay >= 0 &&
      config.sustain >= 0 && config.sustain <= 1 &&
      config.release >= 0
    );
  }

  /**
   * Normaliza envelope (garante valores válidos)
   */
  static normalizeConfig(config: ADSREnvelope): ADSREnvelope {
    return {
      attack: Math.max(0, config.attack),
      decay: Math.max(0, config.decay),
      sustain: Math.max(0, Math.min(1, config.sustain)),
      release: Math.max(0, config.release)
    };
  }
}

/**
 * Sistema de envelopes moduláveis (com LFO)
 */
export class ModulatedEnvelope extends AdvancedEnvelope {
  /** LFO para modulação */
  private lfo: any; // Seria uma instância de LFO
  private modulationAmount = 0;
  private modulatedParameters: Set<string> = new Set();

  constructor(config: ADSREnvelope) {
    super(config);
  }

  /**
   * Aplica modulação LFO a um parâmetro
   */
  modulateParameter(parameter: 'attack' | 'decay' | 'sustain' | 'release', amount: number): void {
    this.modulatedParameters.add(parameter);
    this.modulationAmount = amount;
    
    // Em uma implementação completa, conectaríamos o LFO aqui
  }

  /**
   * Remove modulação de um parâmetro
   */
  removeModulation(parameter: string): void {
    this.modulatedParameters.delete(parameter);
  }

  /**
   * Obtém valor modulado de um parâmetro
   */
  getModulatedValue(baseValue: number, parameter: string): number {
    if (!this.modulatedParameters.has(parameter)) {
      return baseValue;
    }
    
    // Em uma implementação completa, calcularíamos a modulação do LFO
    const modulation = Math.sin(Date.now() / 1000) * this.modulationAmount;
    return baseValue * (1 + modulation);
  }
}

/**
 * Factory para criar envelopes
 */
export class EnvelopeFactory {
  /**
   * Cria envelope baseado em preset
   */
  static create(preset: string): AdvancedEnvelope {
    return AdvancedEnvelope.createForInstrument(preset);
  }

  /**
   * Cria envelope customizado
   */
  static createCustom(config: ADSREnvelope): AdvancedEnvelope {
    return new AdvancedEnvelope(config);
  }

  /**
   * Cria envelope para nota específica
   */
  static createForNote(
    frequency: number,
    velocity: number,
    instrumentType: string = 'piano'
  ): AdvancedEnvelope {
    const baseEnvelope = this.create(instrumentType);
    
    // Ajustar baseado na frequência e velocity
    const config = baseEnvelope.getConfig();
    
    // Notas mais agudas têm release mais curto
    const frequencyFactor = Math.min(1, 2000 / frequency);
    
    // Notas mais fortes têm attack mais rápido
    const velocityFactor = 1 - (velocity / 127) * 0.5;
    
    return new AdvancedEnvelope({
      attack: config.attack * velocityFactor,
      decay: config.decay,
      sustain: config.sustain * (velocity / 127),
      release: config.release * frequencyFactor
    });
  }
}

export default {
  AdvancedEnvelope,
  ModulatedEnvelope,
  EnvelopeFactory
};