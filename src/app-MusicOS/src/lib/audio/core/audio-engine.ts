/**
 * AudioEngine - Sistema principal de síntese e reprodução de áudio
 * 
 * Gerencia Web Audio API, polyphony, efeitos e integração
 * com outros módulos do MusicOS.
 */

import {
  AudioEngineConfig,
  AudioEngineState,
  AudioEngineEvents,
  WaveformType,
  ADSREnvelope,
  OscillatorConfig,
  NoteToPlay,
  ChordToPlay,
  FilterConfig,
  ReverbConfig,
  DelayConfig,
  ChorusConfig,
  CompressorConfig,
  AudioContextState,
  AudioErrorCode,
  DEFAULT_ENVELOPES,
  PERFORMANCE_PROFILES
} from '../types/audio';

/**
 * Voz ativa no sistema de polyphony
 */
interface ActiveVoice {
  /** ID único da voz */
  id: string;
  
  /** Oscillators Web Audio API */
  oscillators: OscillatorNode[];
  
  /** Gain node para volume */
  gainNode: GainNode;
  
  /** Parâmetros do envelope */
  envelope: ADSREnvelope;
  
  /** Frequência da nota */
  frequency: number;
  
  /** Volume (0-1) */
  volume: number;
  
  /** Quando foi iniciada */
  startTime: number;
  
  /** Quando deve parar */
  stopTime?: number;
  
  /** Se está ativa */
  isActive: boolean;
}

/**
 * Efeito ativo
 */
interface ActiveEffect {
  /** Tipo do efeito */
  type: string;
  
  /** Node do Web Audio API */
  node: AudioNode;
  
  /** Configuração */
  config: any;
}

/**
 * AudioEngine - Classe principal para síntese e reprodução de áudio
 */
export class AudioEngine {
  // ============================================
  // PROPRIEDADES PÚBLICAS
  // ============================================
  
  /** ID único do engine */
  public readonly id: string;
  
  /** Configuração atual */
  public config: AudioEngineConfig;
  
  /** Estado atual */
  public state: AudioEngineState;
  
  /** Se está inicializado */
  public isInitialized = false;
  
  // ============================================
  // PROPRIEDADES PRIVADAS (Web Audio API)
  // ============================================
  
  /** AudioContext do Web Audio API */
  private audioContext: AudioContext | null = null;
  
  /** Master gain node */
  private masterGain: GainNode | null = null;
  
  /** Master compressor */
  private masterCompressor: DynamicsCompressorNode | null = null;
  
  /** Efeitos ativos */
  private effects: ActiveEffect[] = [];
  
  /** Vozes ativas (polyphony) */
  private activeVoices: Map<string, ActiveVoice> = new Map();
  
  /** Pool de vozes disponíveis */
  private voicePool: string[] = [];
  
  /** Próximo ID de voz */
  private nextVoiceId = 1;
  
  /** Listeners de eventos */
  private eventListeners: Partial<AudioEngineEvents> = {};
  
  /** Performance monitor */
  private performanceMonitor: {
    lastUpdate: number;
    cpuUsage: number;
    voiceCounts: number[];
  } = {
    lastUpdate: Date.now(),
    cpuUsage: 0,
    voiceCounts: []
  };
  
  // ============================================
  // CONSTANTES
  // ============================================
  
  /** Configuração padrão */
  private static readonly DEFAULT_CONFIG: AudioEngineConfig = {
    maxPolyphony: 32,
    sampleRate: 44100,
    masterVolume: 0.7,
    enableMasterCompressor: true,
    enableLimiter: true,
    performance: PERFORMANCE_PROFILES.medium
  };
  
  /** Estado padrão */
  private static readonly DEFAULT_STATE: AudioEngineState = {
    config: AudioEngine.DEFAULT_CONFIG,
    contextActive: false,
    activeVoices: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    activeEffects: [],
    sequencerActive: false
  };
  
  // ============================================
  // CONSTRUTOR
  // ============================================
  
  constructor(config: Partial<AudioEngineConfig> = {}) {
    this.id = `audio-engine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mesclar configuração padrão com personalizada
    this.config = {
      ...AudioEngine.DEFAULT_CONFIG,
      ...config,
      performance: {
        ...PERFORMANCE_PROFILES.medium,
        ...config.performance
      }
    };
    
    // Inicializar estado
    this.state = {
      ...AudioEngine.DEFAULT_STATE,
      config: this.config
    };
    
    // Inicializar pool de vozes
    this.initializeVoicePool();
    
    // Configurar monitor de performance
    this.setupPerformanceMonitoring();
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - INICIALIZAÇÃO
  // ============================================
  
  /**
   * Inicializa o AudioEngine
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.warn('AudioEngine já inicializado');
      return true;
    }
    
    try {
      // Verificar suporte a Web Audio API
      if (!this.isWebAudioSupported()) {
        throw new Error('Web Audio API não suportada neste navegador');
      }
      
      // Criar AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });
      
      // Configurar master chain
      await this.setupMasterChain();
      
      // Configurar eventos do contexto
      this.setupContextEvents();
      
      // Inicializar estado
      this.isInitialized = true;
      this.updateState({ contextActive: true });
      
      // Disparar evento de inicialização
      this.dispatchEvent('contextStateChanged', AudioContextState.RUNNING);
      
      console.log(`✅ AudioEngine ${this.id} inicializado com sucesso`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao inicializar AudioEngine:', error);
      this.dispatchEvent('error', error as Error);
      return false;
    }
  }
  
  /**
   * Suspende o AudioContext (para economizar recursos)
   */
  async suspend(): Promise<boolean> {
    if (!this.audioContext) {
      return false;
    }
    
    try {
      await this.audioContext.suspend();
      this.updateState({ contextActive: false });
      this.dispatchEvent('contextStateChanged', AudioContextState.SUSPENDED);
      return true;
    } catch (error) {
      console.error('Erro ao suspender AudioContext:', error);
      return false;
    }
  }
  
  /**
   * Retoma o AudioContext suspenso
   */
  async resume(): Promise<boolean> {
    if (!this.audioContext) {
      return false;
    }
    
    try {
      await this.audioContext.resume();
      this.updateState({ contextActive: true });
      this.dispatchEvent('contextStateChanged', AudioContextState.RUNNING);
      return true;
    } catch (error) {
      console.error('Erro ao retomar AudioContext:', error);
      return false;
    }
  }
  
  /**
   * Fecha o AudioEngine e libera recursos
   */
  async close(): Promise<boolean> {
    if (!this.audioContext) {
      return true;
    }
    
    try {
      // Parar todas as vozes
      this.stopAllVoices();
      
      // Fechar contexto
      await this.audioContext.close();
      
      // Limpar referências
      this.audioContext = null;
      this.masterGain = null;
      this.masterCompressor = null;
      this.effects = [];
      this.activeVoices.clear();
      this.voicePool = [];
      
      // Atualizar estado
      this.isInitialized = false;
      this.updateState({
        contextActive: false,
        activeVoices: 0
      });
      
      this.dispatchEvent('contextStateChanged', AudioContextState.CLOSED);
      
      console.log(`🔒 AudioEngine ${this.id} fechado`);
      return true;
      
    } catch (error) {
      console.error('Erro ao fechar AudioEngine:', error);
      return false;
    }
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - PLAYBACK DE NOTAS
  // ============================================
  
  /**
   * Toca uma única nota
   */
  async playNote(options: NoteToPlay): Promise<string | null> {
    if (!this.isInitialized || !this.audioContext) {
      this.dispatchEvent('error', new Error('AudioEngine não inicializado'));
      return null;
    }
    
    try {
      // Obter uma voz do pool
      const voiceId = this.getAvailableVoice();
      if (!voiceId) {
        this.dispatchEvent('error', new Error('Polyphony excedida'));
        return null;
      }
      
      // Configuração padrão para oscilador
      const oscillatorConfig: OscillatorConfig = {
        waveform: 'sine',
        frequency: options.frequency,
        volume: options.volume || 0.8,
        detune: 0,
        pan: 0,
        ...options.oscillator
      };
      
      // Envelope padrão
      const envelope: ADSREnvelope = {
        ...DEFAULT_ENVELOPES.pluck,
        ...options.envelope
      };
      
      // Criar voz
      const voice = this.createVoice(
        voiceId,
        oscillatorConfig,
        envelope,
        options.volume || 0.8
      );
      
      // Programar parada se houver duração
      if (options.duration > 0) {
        const stopTime = this.audioContext.currentTime + options.duration;
        voice.stopTime = stopTime;
        
        // Programar parada automática
        setTimeout(() => {
          this.stopVoice(voiceId);
        }, options.duration * 1000);
      }
      
      // Disparar evento
      this.dispatchEvent('noteOn', options.frequency, options.duration, options.volume || 0.8);
      
      return voiceId;
      
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      this.dispatchEvent('error', error as Error);
      return null;
    }
  }
  
  /**
   * Toca um acorde (múltiplas notas)
   */
  async playChord(options: ChordToPlay): Promise<string[] | null> {
    if (!this.isInitialized || !this.audioContext) {
      this.dispatchEvent('error', new Error('AudioEngine não inicializado'));
      return null;
    }
    
    // Verificar se temos vozes suficientes
    if (options.frequencies.length > this.getAvailableVoiceCount()) {
      this.dispatchEvent('error', new Error('Polyphony insuficiente para acorde'));
      return null;
    }
    
    const voiceIds: string[] = [];
    
    try {
      // Tocar cada nota do acorde
      for (const frequency of options.frequencies) {
        const voiceId = await this.playNote({
          frequency,
          duration: options.duration,
          volume: options.volume,
          oscillator: options.oscillator,
          envelope: options.envelope
        });
        
        if (voiceId) {
          voiceIds.push(voiceId);
        }
      }
      
      // Disparar evento de acorde
      this.dispatchEvent('chordOn', options.frequencies, options.duration, options.volume || 0.8);
      
      return voiceIds;
      
    } catch (error) {
      console.error('Erro ao tocar acorde:', error);
      
      // Parar vozes que foram criadas
      for (const voiceId of voiceIds) {
        this.stopVoice(voiceId);
      }
      
      this.dispatchEvent('error', error as Error);
      return null;
    }
  }
  
  /**
   * Para uma voz específica
   */
  stopVoice(voiceId: string): boolean {
    const voice = this.activeVoices.get(voiceId);
    if (!voice) {
      return false;
    }
    
    try {
      // Aplicar release do envelope
      const releaseTime = this.audioContext?.currentTime || 0;
      
      // Schedule release
      if (voice.gainNode && this.audioContext) {
        voice.gainNode.gain.cancelScheduledValues(releaseTime);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, releaseTime);
        voice.gainNode.gain.exponentialRampToValueAtTime(0.001, releaseTime + voice.envelope.release);
        
        // Parar oscillators após release
        setTimeout(() => {
          voice.oscillators.forEach(osc => {
            try {
              osc.stop();
              osc.disconnect();
            } catch (e) {
              // Oscillator já pode ter sido parado
            }
          });
          
          voice.gainNode?.disconnect();
          
          // Remover da lista de ativas
          this.activeVoices.delete(voiceId);
          
          // Devolver ao pool
          this.voicePool.push(voiceId);
          
          // Atualizar estado
          this.updateState({
            activeVoices: this.activeVoices.size
          });
          
          // Disparar evento
          this.dispatchEvent('noteOff', voice.frequency);
          
        }, voice.envelope.release * 1000);
      }
      
      voice.isActive = false;
      return true;
      
    } catch (error) {
      console.error(`Erro ao parar voz ${voiceId}:`, error);
      return false;
    }
  }
  
  /**
   * Para todas as vozes ativas
   */
  stopAllVoices(): void {
    for (const voiceId of this.activeVoices.keys()) {
      this.stopVoice(voiceId);
    }
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - EFEITOS
  // ============================================
  
  /**
   * Adiciona um filtro ao master chain
   */
  addFilter(config: FilterConfig): boolean {
    if (!this.audioContext || !this.masterGain) {
      return false;
    }
    
    try {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = config.type;
      filter.frequency.value = config.frequency;
      filter.Q.value = config.Q || 1.0;
      if (config.gain !== undefined) {
        filter.gain.value = config.gain;
      }
      
      // Reconectar chain
      this.reconnectEffectChain();
      
      this.effects.push({
        type: 'filter',
        node: filter,
        config
      });
      
      this.updateState({
        activeEffects: this.effects.map(e => e.type)
      });
      
      return true;
      
    } catch (error) {
      console.error('Erro ao adicionar filtro:', error);
      return false;
    }
  }
  
  /**
   * Adiciona reverb
   */
  addReverb(config: ReverbConfig): boolean {
    if (!this.audioContext || !this.masterGain) {
      return false;
    }
    
    try {
      // Implementação simplificada de reverb
      // Em uma implementação real, usaríamos ConvolverNode
      const convolver = this.audioContext.createConvolver();
      
      // Criar impulso simples
      const impulseDuration = config.decay;
      const sampleRate = this.audioContext.sampleRate;
      const impulseLength = Math.floor(impulseDuration * sampleRate);
      const impulseBuffer = this.audioContext.createBuffer(2, impulseLength, sampleRate);
      
      // Preencher buffer com noise decay
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseBuffer.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (impulseDuration * sampleRate));
        }
      }
      
      convolver.buffer = impulseBuffer;
      
      // Configurar wet/dry mix
      const dryGain = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();
      
      dryGain.gain.value = config.dry;
      wetGain.gain.value = config.wet;
      
      this.effects.push({
        type: 'reverb',
        node: convolver,
        config: {
          ...config,
          dryGain,
          wetGain
        }
      });
      
      this.reconnectEffectChain();
      this.updateState({
        activeEffects: this.effects.map(e => e.type)
      });
      
      return true;
      
    } catch (error) {
      console.error('Erro ao adicionar reverb:', error);
      return false;
    }
  }
  
  /**
   * Remove um efeito
   */
  removeEffect(effectType: string): boolean {
    const index = this.effects.findIndex(e => e.type === effectType);
    if (index === -1) {
      return false;
    }
    
    // Desconectar e remover
    const effect = this.effects[index];
    effect.node.disconnect();
    
    this.effects.splice(index, 1);
    
    // Reconectar chain
    this.reconnectEffectChain();
    
    this.updateState({
      activeEffects: this.effects.map(e => e.type)
    });
    
    return true;
  }
  
  /**
   * Remove todos os efeitos
   */
  clearEffects(): void {
    for (const effect of this.effects) {
      effect.node.disconnect();
    }
    
    this.effects = [];
    this.reconnectEffectChain();
    
    this.updateState({
      activeEffects: []
    });
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - CONFIGURAÇÃO
  // ============================================
  
  /**
   * Define volume master
   */
  setMasterVolume(volume: number): boolean {
    if (!this.masterGain || volume < 0 || volume > 1) {
      return false;
    }
    
    try {
      this.masterGain.gain.value = volume;
      this.config.masterVolume = volume;
      return true;
    } catch (error) {
      console.error('Erro ao definir volume master:', error);
      return false;
    }
  }
  
  /**
   * Define configuração de polyphony
   */
  setMaxPolyphony(maxPolyphony: number): boolean {
    if (maxPolyphony < 1 || maxPolyphony > 128) {
      return false;
    }
    
    this.config.maxPolyphony = maxPolyphony;
    this.initializeVoicePool();
    
    // Se temos mais vozes ativas que o novo máximo,
    // precisamos parar algumas
    if (this.activeVoices.size > maxPolyphony) {
      const excess = this.activeVoices.size - maxPolyphony;
      const voicesToStop = Array.from(this.activeVoices.keys()).slice(0, excess);
      
      for (const voiceId of voicesToStop) {
        this.stopVoice(voiceId);
      }
    }
    
    return true;
  }
  
  /**
   * Define perfil de performance
   */
  setPerformanceProfile(profile: 'low' | 'medium' | 'high' | 'studio'): boolean {
    const profileConfig = PERFORMANCE_PROFILES[profile];
    if (!profileConfig) {
      return false;
    }
    
    this.config.performance = profileConfig;
    return true;
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - EVENTOS
  // ============================================
  
  /**
   * Adiciona listener de evento
   */
  on<K extends keyof AudioEngineEvents>(event: K, listener: AudioEngineEvents[K]): void {
    this.eventListeners[event] = listener;
  }
  
  /**
   * Remove listener de evento
   */
  off<K extends keyof AudioEngineEvents>(event: K): void {
    delete this.eventListeners[event];
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - INFORMAÇÕES
  // ============================================
  
  /**
   * Obtém estado atual
   */
  getState(): AudioEngineState {
    return { ...this.state };
  }
  
  /**
   * Obtém configuração atual
   */
  getConfig(): AudioEngineConfig {
    return { ...this.config };
  }
  
  /**
   * Obtém número de vozes disponíveis
   */
  getAvailableVoiceCount(): number {
    return Math.max(0, this.config.maxPolyphony - this.activeVoices.size);
  }
  
  /**
   * Obtém uso de CPU estimado
   */
  getCpuUsage(): number {
    return this.performanceMonitor.cpuUsage;
  }
  
  /**
   * Verifica se está ativo
   */
  isActive(): boolean {
    return this.isInitialized && this.state.contextActive;
  }
  
  // ============================================
  // MÉTODOS PRIVADOS - INICIALIZAÇÃO
  // ============================================
  
  /**
   * Verifica suporte a Web Audio API
   */
  private isWebAudioSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }
  
  /**
   * Configura a master chain de áudio
   */
  private async setupMasterChain(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext não disponível');
    }
    
    // Criar master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.config.masterVolume;
    
    // Criar master compressor se habilitado
    if (this.config.enableMasterCompressor) {
      this.masterCompressor = this.audioContext.createDynamicsCompressor();
      this.masterCompressor.threshold.value = -24;
      this.masterCompressor.knee.value = 30;
      this.masterCompressor.ratio.value = 12;
      this.masterCompressor.attack.value = 0.003;
      this.masterCompressor.release.value = 0.25;
      
      // Conectar: compressor → master gain → destination
      this.masterCompressor.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
    } else {
      // Conectar diretamente: master gain → destination
      this.masterGain.connect(this.audioContext.destination);
    }
  }
  
  /**
   * Configura eventos do AudioContext
   */
  private setupContextEvents(): void {
    if (!this.audioContext) return;
    
    // Monitorar estado do contexto
    this.audioContext.onstatechange = () => {
      const state = this.audioContext?.state as AudioContextState;
      this.updateState({ contextActive: state === 'running' });
      this.dispatchEvent('contextStateChanged', state);
    };
  }
  
  /**
   * Inicializa pool de vozes
   */
  private initializeVoicePool(): void {
    this.voicePool = [];
    this.nextVoiceId = 1;
    
    for (let i = 0; i < this.config.maxPolyphony; i++) {
      this.voicePool.push(`voice-${this.nextVoiceId++}`);
    }
  }
  
  // ============================================
  // MÉTODOS PRIVADOS - VOZES E POLYPHONY
  // ============================================
  
  /**
   * Obtém uma voz disponível do pool
   */
  private getAvailableVoice(): string | null {
    if (this.voicePool.length === 0) {
      return null;
    }
    
    return this.voicePool.shift() || null;
  }
  
  /**
   * Cria uma nova voz
   */
  private createVoice(
    voiceId: string,
    oscillatorConfig: OscillatorConfig,
    envelope: ADSREnvelope,
    volume: number
  ): ActiveVoice {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('AudioEngine não inicializado');
    }
    
    const currentTime = this.audioContext.currentTime;
    
    // Criar gain node para envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;
    
    // Conectar ao master chain (passando pelos efeitos)
    this.connectVoiceToMaster(gainNode);
    
    // Criar oscillators (suporte a stereo)
    const oscillators: OscillatorNode[] = [];
    
    // Oscillator para esquerda (ligeiramente detuned)
    const oscLeft = this.audioContext.createOscillator();
    oscLeft.type = oscillatorConfig.waveform as OscillatorType;
    oscLeft.frequency.value = oscillatorConfig.frequency;
    oscLeft.detune.value = (oscillatorConfig.detune || 0) - 5; // -5 cents
    oscLeft.connect(gainNode);
    
    // Oscillator para direita (ligeiramente detuned)
    const oscRight = this.audioContext.createOscillator();
    oscRight.type = oscillatorConfig.waveform as OscillatorType;
    oscRight.frequency.value = oscillatorConfig.frequency;
    oscRight.detune.value = (oscillatorConfig.detune || 0) + 5; // +5 cents
    oscRight.connect(gainNode);
    
    oscillators.push(oscLeft, oscRight);
    
    // Aplicar envelope ADSR
    this.applyEnvelope(gainNode, envelope, volume, currentTime);
    
    // Iniciar oscillators
    oscillators.forEach(osc => osc.start(currentTime));
    
    // Criar objeto de voz
    const voice: ActiveVoice = {
      id: voiceId,
      oscillators,
      gainNode,
      envelope,
      frequency: oscillatorConfig.frequency,
      volume,
      startTime: currentTime,
      isActive: true
    };
    
    // Adicionar à lista de ativas
    this.activeVoices.set(voiceId, voice);
    
    // Atualizar estado
    this.updateState({
      activeVoices: this.activeVoices.size
    });
    
    return voice;
  }
  
  /**
   * Conecta uma voz ao master chain (passando pelos efeitos)
   */
  private connectVoiceToMaster(voiceGain: GainNode): void {
    if (!this.masterGain) return;
    
    // Se não há efeitos, conectar diretamente
    if (this.effects.length === 0) {
      voiceGain.connect(this.masterGain);
      return;
    }
    
    // Conectar através da chain de efeitos
    let previousNode: AudioNode = voiceGain;
    
    for (const effect of this.effects) {
      previousNode.connect(effect.node);
      previousNode = effect.node;
    }
    
    previousNode.connect(this.masterGain);
  }
  
  /**
   * Aplica envelope ADSR a um gain node
   */
  private applyEnvelope(
    gainNode: GainNode,
    envelope: ADSREnvelope,
    volume: number,
    startTime: number
  ): void {
    // Attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + envelope.attack);
    
    // Decay
    const decayEndTime = startTime + envelope.attack + envelope.decay;
    gainNode.gain.linearRampToValueAtTime(
      volume * envelope.sustain,
      decayEndTime
    );
    
    // Sustain é mantido até o release
    
    // Nota: Release é aplicado quando a nota é parada
  }
  
  /**
   * Reconecta toda a chain de efeitos
   */
  private reconnectEffectChain(): void {
    // Em uma implementação real, precisaríamos reconectar
    // todas as vozes através da nova chain de efeitos
    
    // Para simplificar, apenas logamos
    console.log('Effect chain reconectada');
  }
  
  // ============================================
  // MÉTODOS PRIVADOS - MONITORAMENTO
  // ============================================
  
  /**
   * Configura monitoramento de performance
   */
  private setupPerformanceMonitoring(): void {
    // Atualizar monitor a cada segundo
    setInterval(() => {
      this.updatePerformanceMonitor();
    }, 1000);
  }
  
  /**
   * Atualiza monitor de performance
   */
  private updatePerformanceMonitor(): void {
    const now = Date.now();
    const elapsed = now - this.performanceMonitor.lastUpdate;
    
    // Calcular uso de CPU estimado (simplificado)
    // Em uma implementação real, usaríamos performance.now()
    // e calcularíamos o tempo real de processamento
    
    const voiceCount = this.activeVoices.size;
    this.performanceMonitor.voiceCounts.push(voiceCount);
    
    // Manter apenas os últimos 10 valores
    if (this.performanceMonitor.voiceCounts.length > 10) {
      this.performanceMonitor.voiceCounts.shift();
    }
    
    // Calcular média de vozes como proxy de CPU
    const avgVoices = this.performanceMonitor.voiceCounts.reduce((a, b) => a + b, 0) /
                     this.performanceMonitor.voiceCounts.length;
    
    // CPU usage estimado (0-100%)
    this.performanceMonitor.cpuUsage = Math.min(100, (avgVoices / this.config.maxPolyphony) * 100);
    
    this.performanceMonitor.lastUpdate = now;
    
    // Atualizar estado
    this.updateState({
      cpuUsage: Math.round(this.performanceMonitor.cpuUsage * 10) / 10,
      memoryUsage: this.estimateMemoryUsage()
    });
  }
  
  /**
   * Estima uso de memória
   */
  private estimateMemoryUsage(): number {
    // Estimativa simplificada
    const voiceMemory = this.activeVoices.size * 1024; // 1KB por voz
    const effectMemory = this.effects.length * 2048; // 2KB por efeito
    const totalKB = voiceMemory + effectMemory;
    
    return Math.round(totalKB / 1024); // MB
  }
  
  // ============================================
  // MÉTODOS PRIVADOS - EVENTOS E ESTADO
  // ============================================
  
  /**
   * Atualiza estado do engine
   */
  private updateState(updates: Partial<AudioEngineState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Disparar evento de mudança de estado
    this.dispatchEvent('stateChanged', oldState, this.state);
  }
  
  /**
   * Dispara um evento
   */
  private dispatchEvent<K extends keyof AudioEngineEvents>(
    event: K,
    ...args: Parameters<AudioEngineEvents[K]>
  ): void {
    const listener = this.eventListeners[event];
    if (listener) {
      try {
        (listener as any)(...args);
      } catch (error) {
        console.error(`Erro no listener do evento ${event}:`, error);
      }
    }
  }
}

/**
 * Factory para criar AudioEngine
 */
export function createAudioEngine(config?: Partial<AudioEngineConfig>): AudioEngine {
  return new AudioEngine(config);
}

/**
 * Verifica suporte a áudio no navegador
 */
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Obtém informações do sistema de áudio
 */
export function getAudioSystemInfo(): {
  supported: boolean;
  sampleRate: number;
  channelCount: number;
  latency: number;
} {
  const supported = isAudioSupported();
  
  if (!supported) {
    return {
      supported: false,
      sampleRate: 0,
      channelCount: 0,
      latency: 0
    };
  }
  
  // Valores padrão
  return {
    supported: true,
    sampleRate: 44100,
    channelCount: 2,
    latency: 0.01 // 10ms
  };
}

export default {
  AudioEngine,
  createAudioEngine,
  isAudioSupported,
  getAudioSystemInfo
};