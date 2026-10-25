/**
 * AudioEngine.ts
 * Audio engine portado de script-audio-engine.js do musicpages
 * Wrapper para Web Audio API com TypeScript
 */

import { OscillatorType, ADSRParams, DEFAULT_ADSR } from '@/types/music';

// ============================================
// CONSTANTS
// ============================================

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcula a frequência em Hz de uma nota MIDI.
 * Fórmula: 440 * 2^((midiNote - 69) / 12) (A4 = MIDI 69 = 440 Hz)
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Converte nome da nota para índice cromático (0-11)
 */
export function getChromaticIndex(noteName: string): number {
  const upper = noteName.toUpperCase().replace('B#', 'C').replace('E#', 'F');
  let index = NOTE_NAMES.indexOf(upper);
  
  if (index !== -1) return index;
  
  // Tratar bemóis
  const flatMap: Record<string, number> = {
    'DB': 1, 'EB': 3, 'FB': 4, 'GB': 6, 'AB': 8, 'BB': 10, 'CB': 11
  };
  
  return flatMap[upper] ?? -1;
}

/**
 * Converte índice cromático para nome da nota
 */
export function getNoteName(chromaticIndex: number): string {
  return NOTE_NAMES[chromaticIndex % 12];
}

// ============================================
// AUDIO ENGINE CLASS
// ============================================

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private timbre: OscillatorType = 'sine';
  private activeNotes: Map<number, { oscillator: OscillatorNode; gainNode: GainNode }> = new Map();
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
  }

  /**
   * Verifica se Web Audio API está disponível
   */
  private checkSupport(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  }

  /**
   * Inicializa o AudioContext (deve ser chamado após interação do usuário)
   */
  async init(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Web Audio API not supported');
      return false;
    }

    if (!this.audioContext) {
      const AudioContextClass = (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext || (window as unknown as { AudioContext: typeof AudioContext }).AudioContext;
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return true;
  }

  /**
   * Retorna o AudioContext (cria se necessário)
   */
  getContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Verifica se o áudio é suportado
   */
  getIsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Obtém o timbre atual
   */
  getTimbre(): OscillatorType {
    return this.timbre;
  }

  /**
   * Define o timbre global
   */
  setTimbre(type: OscillatorType): void {
    const validTypes: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];
    if (validTypes.includes(type)) {
      this.timbre = type;
    }
  }

  /**
   * Toca uma nota
   */
  async playNote(
    midiNote: number, 
    timbre?: OscillatorType, 
    adsr?: Partial<ADSRParams>
  ): Promise<void> {
    if (!this.audioContext) {
      await this.init();
      if (!this.audioContext) return;
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Parâmetros ADSR
    const params = { ...DEFAULT_ADSR, ...adsr };
    const oscillatorType = timbre || this.timbre;

    // Para nota já ativa
    if (this.activeNotes.has(midiNote)) {
      this.stopNote(midiNote);
    }

    // Criar nodes
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Conectar
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configurar oscilador
    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(midiToFrequency(midiNote), now);

    // Configurar envelope ADSR
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + params.attack);
    gainNode.gain.linearRampToValueAtTime(params.sustain, now + params.attack + params.decay);

    // Iniciar
    oscillator.start(now);

    // Guardar referência
    this.activeNotes.set(midiNote, { oscillator, gainNode });
  }

  /**
   * Para uma nota específica
   */
  stopNote(midiNote: number, adsr?: Partial<ADSRParams>): void {
    if (!this.audioContext) return;

    const noteData = this.activeNotes.get(midiNote);
    if (!noteData) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const release = adsr?.release ?? DEFAULT_ADSR.release;
    const currentGain = noteData.gainNode.gain.value || 0.001;

    noteData.gainNode.gain.cancelScheduledValues(now);
    noteData.gainNode.gain.setValueAtTime(currentGain, now);
    noteData.gainNode.gain.linearRampToValueAtTime(0.001, now + release);

    noteData.oscillator.stop(now + release + 0.05);

    this.activeNotes.delete(midiNote);
  }

  /**
   * Para todas as notas
   */
  stopAll(): void {
    this.activeNotes.forEach((_, midiNote) => {
      this.stopNote(midiNote);
    });
  }

  /**
   * Reproduz acorde (múltiplas notas simultaneamente)
   */
  async playChord(midiNotes: number[], timbre?: OscillatorType): Promise<void> {
    await Promise.all(midiNotes.map(note => this.playNote(note, timbre)));
  }

  /**
   * Reproduz escala ascendendo/descendo
   */
  async playScale(
    midiNotes: number[], 
    tempoBPM: number,
    direction: 'up' | 'down' | 'up-down' = 'up',
    timbre?: OscillatorType
  ): Promise<void> {
    const notesToPlay = [...midiNotes];
    if (direction === 'up') {
      // já está na ordem
    } else if (direction === 'down') {
      notesToPlay.reverse();
    } else if (direction === 'up-down') {
      // toca sube desce
    }

    const intervalMs = 60000 / tempoBPM; // ms por nota

    for (let i = 0; i < notesToPlay.length; i++) {
      await this.playNote(notesToPlay[i], timbre);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      
      if (i < notesToPlay.length - 1) {
        this.stopNote(notesToPlay[i]);
      }
    }
  }

  /**
   * Verifica se há algum acorde/ nota ativa
   */
  isPlaying(): boolean {
    return this.activeNotes.size > 0;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const audioEngine = new AudioEngine();

// ============================================
// REACT HOOK
// ============================================

import { useCallback, useRef, useState, useEffect } from 'react';

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    setIsReady(true);

    return () => {
      engineRef.current?.stopAll();
    };
  }, []);

  const playNote = useCallback(async (midiNote: number, timbre?: OscillatorType) => {
    await engineRef.current?.playNote(midiNote, timbre);
  }, []);

  const stopNote = useCallback((midiNote: number) => {
    engineRef.current?.stopNote(midiNote);
  }, []);

  const playChord = useCallback(async (midiNotes: number[], timbre?: OscillatorType) => {
    await engineRef.current?.playChord(midiNotes, timbre);
  }, []);

  return {
    isReady,
    playNote,
    stopNote,
    playChord,
    playNoteByName: useCallback(async (noteName: string, octave: number) => {
      const index = getChromaticIndex(noteName);
      if (index >= 0) {
        const midiNote = (octave + 1) * 12 + index;
        await engineRef.current?.playNote(midiNote);
      }
    }, [])
  };
}

// ============================================
// EXPORTS FOR TESTING
// ============================================

// Functions are already exported above