/**
 * Tipos TypeScript para o sistema de áudio do MusicOS
 */

import { Note, Octave } from '@/lib/music-theory';

// ============================================
// TIPOS BÁSICOS
// ============================================

/**
 * Formas de onda disponíveis para síntese
 */
export type WaveformType =
  | 'sine'        // Senoidal
  | 'square'      // Quadrada
  | 'sawtooth'    // Dente de serra
  | 'triangle'    // Triangular
  | 'custom';     // Personalizada

/**
 * Tipo de filtro de áudio
 */
export type FilterType =
  | 'lowpass'     // Passa-baixa
  | 'highpass'    // Passa-alta
  | 'bandpass'    // Passa-banda
  | 'lowshelf'    // Low shelf
  | 'highshelf'   // High shelf
  | 'peaking'     // Peaking
  | 'notch';      // Notch

/**
 * Configuração de envelope ADSR
 */
export interface ADSREnvelope {
  /** Tempo de ataque (segundos) */
  attack: number;
  
  /** Tempo de decaimento (segundos) */
  decay: number;
  
  /** Nível de sustain (0-1) */
  sustain: number;
  
  /** Tempo de release (segundos) */
  release: number;
}

/**
 * Configuração de um oscilador
 */
export interface OscillatorConfig {
  /** Tipo de forma de onda */
  waveform: WaveformType;
  
  /** Frequência em Hertz */
  frequency: number;
  
  /** Detune em cents */
  detune?: number;
  
  /** Volume (0-1) */
  volume?: number;
  
  /** Pan (-1 a 1, esquerda-direita) */
  pan?: number;
}

/**
 * Configuração de um filtro
 */
export interface FilterConfig {
  /** Tipo de filtro */
  type: FilterType;
  
  /** Frequência de corte (Hz) */
  frequency: number;
  
  /** Q-factor (0.0001 a 1000) */
  Q?: number;
  
  /** Ganho (dB) */
  gain?: number;
}

/**
 * Configuração de efeito de reverb
 */
export interface ReverbConfig {
  /** Tempo de decaimento (segundos) */
  decay: number;
  
  /** Mix wet/dry (0-1) */
  wet: number;
  
  /** Mix dry (0-1) */
  dry: number;
  
  /** Pre-delay (segundos) */
  preDelay?: number;
}

/**
 * Configuração de efeito de delay
 */
export interface DelayConfig {
  /** Tempo de delay (segundos) */
  delayTime: number;
  
  /** Feedback (0-1) */
  feedback: number;
  
  /** Mix wet/dry (0-1) */
  wet: number;
}

/**
 * Configuração de efeito de chorus
 */
export interface ChorusConfig {
  /** Taxa (Hz) */
  rate: number;
  
  /** Profundidade (0-1) */
  depth: number;
  
  /** Delay (segundos) */
  delay: number;
  
  /** Feedback (0-1) */
  feedback: number;
  
  /** Mix wet/dry (0-1) */
  wet: number;
}

/**
 * Configuração de compressor
 */
export interface CompressorConfig {
  /** Threshold (dB) */
  threshold: number;
  
  /** Knee (dB) */
  knee: number;
  
  /** Ratio (1-20) */
  ratio: number;
  
  /** Attack (segundos) */
  attack: number;
  
  /** Release (segundos) */
  release: number;
}

// ============================================
// TIPOS PARA PLAYBACK
// ============================================

/**
 * Nota para tocar
 */
export interface NoteToPlay {
  /** Frequência em Hertz */
  frequency: number;
  
  /** Duração em segundos */
  duration: number;
  
  /** Volume (0-1) */
  volume?: number;
  
  /** Configuração do oscilador */
  oscillator?: Partial<OscillatorConfig>;
  
  /** Configuração do envelope */
  envelope?: Partial<ADSREnvelope>;
  
  /** Quando iniciar (em segundos desde agora) */
  when?: number;
}

/**
 * Acorde para tocar
 */
export interface ChordToPlay {
  /** Frequências das notas */
  frequencies: number[];
  
  /** Duração em segundos */
  duration: number;
  
  /** Volume (0-1) */
  volume?: number;
  
  /** Configuração do oscilador */
  oscillator?: Partial<OscillatorConfig>;
  
  /** Configuração do envelope */
  envelope?: Partial<ADSREnvelope>;
}

/**
 * Sequência de notas
 */
export interface SequenceStep {
  /** Quando tocar (em beats) */
  time: number;
  
  /** Nota para tocar */
  note: NoteToPlay;
  
  /** Duração (em beats) */
  duration?: number;
}

/**
 * Configuração de sequenciador
 */
export interface SequencerConfig {
  /** BPM (batidas por minuto) */
  bpm: number;
  
  /** Time signature (ex: [4, 4] para 4/4) */
  timeSignature: [number, number];
  
  /** Número de steps por beat */
  stepsPerBeat: number;
  
  /** Loop a sequência */
  loop: boolean;
}

// ============================================
// TIPOS PARA AUDIO ENGINE
// ============================================

/**
 * Configuração do AudioEngine
 */
export interface AudioEngineConfig {
  /** Polyphony máxima (número de vozes simultâneas) */
  maxPolyphony: number;
  
  /** Taxa de amostragem (Hz) */
  sampleRate: number;
  
  /** Volume master (0-1) */
  masterVolume: number;
  
  /** Habilitar compressão master */
  enableMasterCompressor: boolean;
  
  /** Habilitar limiter */
  enableLimiter: boolean;
  
  /** Configuração de performance */
  performance: {
    /** Usar Web Workers para processamento */
    useWorkers: boolean;
    
    /** Buffer size para processamento */
    bufferSize: number;
    
    /** Número de canais */
    numberOfChannels: number;
  };
}

/**
 * Estado do AudioEngine
 */
export interface AudioEngineState {
  /** Configuração atual */
  config: AudioEngineConfig;
  
  /** AudioContext ativo */
  contextActive: boolean;
  
  /** Número de vozes ativas */
  activeVoices: number;
  
  /** CPU usage estimado */
  cpuUsage: number;
  
  /** Memória usage estimado */
  memoryUsage: number;
  
  /** Efeitos ativos */
  activeEffects: string[];
  
  /** Sequenciador ativo */
  sequencerActive: boolean;
}

/**
 * Eventos do AudioEngine
 */
export interface AudioEngineEvents {
  /** Quando uma nota é tocada */
  noteOn: (frequency: number, duration: number, volume: number) => void;
  
  /** Quando uma nota para de tocar */
  noteOff: (frequency: number) => void;
  
  /** Quando um acorde é tocado */
  chordOn: (frequencies: number[], duration: number, volume: number) => void;
  
  /** Quando o estado do engine muda */
  stateChanged: (oldState: AudioEngineState, newState: AudioEngineState) => void;
  
  /** Quando há um erro de áudio */
  error: (error: Error) => void;
  
  /** Quando o contexto de áudio é suspenso/reativado */
  contextStateChanged: (state: string) => void;
}

// ============================================
// TIPOS PARA INTEGRAÇÃO
// ============================================

/**
 * Configuração de integração com instrumentos
 */
export interface InstrumentAudioConfig {
  /** ID do instrumento */
  instrumentId: string;
  
  /** Mapeamento nota→configuração de áudio */
  noteMapping: Map<string, OscillatorConfig>;
  
  /** Efeitos específicos do instrumento */
  instrumentEffects: {
    reverb?: ReverbConfig;
    delay?: DelayConfig;
    chorus?: ChorusConfig;
    filter?: FilterConfig;
  };
  
  /** Envelope por padrão */
  defaultEnvelope: ADSREnvelope;
}

/**
 * Configuração de integração com teoria musical
 */
export interface TheoryAudioConfig {
  /** Usar frequências justas vs temperadas */
  useJustIntonation: boolean;
  
  /** Ajuste de afinação (cents) */
  tuningOffset: number;
  
  /** Base de frequência (A4 = 440Hz padrão) */
  baseFrequency: number;
}

/**
 * Configuração MIDI
 */
export interface MidiConfig {
  /** Habilitar entrada MIDI */
  enableInput: boolean;
  
  /** Habilitar saída MIDI */
  enableOutput: boolean;
  
  /** Mapeamento de canais MIDI */
  channelMapping: Map<number, string>; // channel → instrumentId
  
  /** Velocity curve */
  velocityCurve: 'linear' | 'exponential' | 'logarithmic';
}

// ============================================
// CONSTANTES E PRESETS
// ============================================

/**
 * Envelopes padrão
 */
export const DEFAULT_ENVELOPES: Record<string, ADSREnvelope> = {
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
  }
};

/**
 * Configurações de instrumentos padrão
 */
export const INSTRUMENT_PRESETS: Record<string, {
  oscillator: OscillatorConfig;
  envelope: ADSREnvelope;
  effects?: {
    reverb?: ReverbConfig;
    filter?: FilterConfig;
  };
}> = {
  'piano': {
    oscillator: {
      waveform: 'sine',
      frequency: 440,
      volume: 0.8
    },
    envelope: DEFAULT_ENVELOPES.piano,
    effects: {
      reverb: {
        decay: 1.5,
        wet: 0.2,
        dry: 0.8
      }
    }
  },
  'guitar': {
    oscillator: {
      waveform: 'sawtooth',
      frequency: 220,
      volume: 0.7
    },
    envelope: DEFAULT_ENVELOPES.guitar,
    effects: {
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
  'synth': {
    oscillator: {
      waveform: 'square',
      frequency: 440,
      volume: 0.6,
      detune: 10
    },
    envelope: DEFAULT_ENVELOPES.pluck
  },
  'bass': {
    oscillator: {
      waveform: 'sawtooth',
      frequency: 110,
      volume: 0.9
    },
    envelope: DEFAULT_ENVELOPES.pluck,
    effects: {
      filter: {
        type: 'lowpass',
        frequency: 500,
        Q: 2.0
      }
    }
  },
  'flute': {
    oscillator: {
      waveform: 'sine',
      frequency: 880,
      volume: 0.5
    },
    envelope: DEFAULT_ENVELOPES.pad
  }
};

/**
 * Configurações de efeitos padrão
 */
export const EFFECT_PRESETS: Record<string, any> = {
  'room-reverb': {
    decay: 1.5,
    wet: 0.3,
    dry: 0.7,
    preDelay: 0.03
  },
  'hall-reverb': {
    decay: 3.0,
    wet: 0.4,
    dry: 0.6,
    preDelay: 0.05
  },
  'slap-delay': {
    delayTime: 0.15,
    feedback: 0.3,
    wet: 0.4
  },
  'tape-delay': {
    delayTime: 0.3,
    feedback: 0.5,
    wet: 0.5
  },
  'subtle-chorus': {
    rate: 0.8,
    depth: 0.3,
    delay: 0.003,
    feedback: 0.2,
    wet: 0.3
  },
  'warm-filter': {
    type: 'lowpass',
    frequency: 2000,
    Q: 1.0
  }
};

/**
 * Configurações de performance
 */
export const PERFORMANCE_PROFILES: Record<string, AudioEngineConfig['performance']> = {
  'low': {
    useWorkers: false,
    bufferSize: 2048,
    numberOfChannels: 2
  },
  'medium': {
    useWorkers: true,
    bufferSize: 1024,
    numberOfChannels: 2
  },
  'high': {
    useWorkers: true,
    bufferSize: 512,
    numberOfChannels: 2
  },
  'studio': {
    useWorkers: true,
    bufferSize: 256,
    numberOfChannels: 2
  }
};

// ============================================
// TIPOS PARA HOOKS REACT
// ============================================

/**
 * Configuração do hook useAudioEngine
 */
export interface UseAudioEngineConfig {
  /** Auto-inicializar o engine */
  autoInitialize: boolean;
  
  /** Configuração do engine */
  engineConfig?: Partial<AudioEngineConfig>;
  
  /** Efeitos iniciais */
  initialEffects?: {
    reverb?: ReverbConfig;
    delay?: DelayConfig;
    chorus?: ChorusConfig;
    compressor?: CompressorConfig;
  };
  
  /** Habilitar monitoramento de performance */
  enablePerformanceMonitoring: boolean;
}

/**
 * Configuração do hook useAudioPlayer
 */
export interface UseAudioPlayerConfig {
  /** Configuração do oscilador */
  oscillator?: Partial<OscillatorConfig>;
  
  /** Configuração do envelope */
  envelope?: Partial<ADSREnvelope>;
  
  /** Efeitos a aplicar */
  effects?: {
    reverb?: ReverbConfig;
    delay?: DelayConfig;
    filter?: FilterConfig;
  };
  
  /** Auto-conectar ao master output */
  autoConnect: boolean;
}

// ============================================
// ENUMS E CONSTANTES
// ============================================

/**
 * Estados do AudioContext
 */
export enum AudioContextState {
  SUSPENDED = 'suspended',
  RUNNING = 'running',
  CLOSED = 'closed'
}

/**
 * Erros de áudio
 */
export enum AudioErrorCode {
  CONTEXT_NOT_SUPPORTED = 'CONTEXT_NOT_SUPPORTED',
  CONTEXT_SUSPENDED = 'CONTEXT_SUSPENDED',
  CONTEXT_CLOSED = 'CONTEXT_CLOSED',
  NO_AUDIO_OUTPUT = 'NO_AUDIO_OUTPUT',
  POLYPHONY_EXCEEDED = 'POLYPHONY_EXCEEDED',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  WEB_AUDIO_ERROR = 'WEB_AUDIO_ERROR'
}

/**
 * Nomes de eventos de áudio
 */
export const AUDIO_EVENTS = {
  NOTE_ON: 'noteOn',
  NOTE_OFF: 'noteOff',
  CHORD_ON: 'chordOn',
  CHORD_OFF: 'chordOff',
  SEQUENCE_START: 'sequenceStart',
  SEQUENCE_STOP: 'sequenceStop',
  ENGINE_STATE_CHANGED: 'engineStateChanged',
  CONTEXT_STATE_CHANGED: 'contextStateChanged',
  ERROR: 'error'
} as const;

export default {
  // Re-exportar tipos principais
  WaveformType,
  FilterType,
  ADSREnvelope,
  OscillatorConfig,
  FilterConfig,
  ReverbConfig,
  DelayConfig,
  ChorusConfig,
  CompressorConfig,
  NoteToPlay,
  ChordToPlay,
  AudioEngineConfig,
  AudioEngineState,
  AudioEngineEvents,
  InstrumentAudioConfig,
  TheoryAudioConfig,
  MidiConfig,
  
  // Constantes
  DEFAULT_ENVELOPES,
  INSTRUMENT_PRESETS,
  EFFECT_PRESETS,
  PERFORMANCE_PROFILES,
  AudioContextState,
  AudioErrorCode,
  AUDIO_EVENTS
};