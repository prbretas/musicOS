// MusicOS Type Definitions

// ============================================
// SCALES AND THEORY
// ============================================

export type NoteName = 
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' 
  | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' 
  | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type ScaleType = 
  | 'maior'
  | 'menor_natural'
  | 'menor_harmonica'
  | 'menor_melodica'
  | 'jonico'
  | 'dorico'
  | 'frigio'
  | 'lidio'
  | 'mixolidio'
  | 'eolio'
  | 'locrio'
  | 'pentatonica_maior'
  | 'pentatonica_menor'
  | 'blues_maior'
  | 'blues_menor'
  | 'diminuta_tom_e_semitom'
  | 'diminuta_semitom_e_tom'
  | 'tons_inteiros'
  | 'cromatica'
  | 'egipcia'
  | 'hirajoshi'
  | 'iwato'
  | 'man_gong'
  | 'ritusen';

export interface Scale {
  name: string;
  type: ScaleType;
  intervals: number[]; // Intervalos em semitons
  description: string;
}

export interface ScaleResult {
  tonic: NoteName;
  type: ScaleType;
  notes: NoteName[];
  harmonicField: ChordInField[];
}

export interface ChordInField {
  degree: number; // 1-7
  roman: string; // I, ii, iii, IV, V, vi, vii°
  chord: NoteName;
  quality: string; // major, minor, diminished
  notes: NoteName[];
}

// ============================================
// CHORDS
// ============================================

export type ChordQuality = 
  | '' // maior
  | 'm' // menor
  | 'maj7'
  | 'm7'
  | '7'
  | 'dim'
  | 'm7b5';

export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented' | '7' | 'maj7' | 'm7';

export interface Chord {
  name: string;
  root: NoteName;
  type: ChordType;
  notes: NoteName[];
  positions: number[]; // Por corda (da mais aguda para a mais grave na visualização), -1 = mudo, -2 = não tocada
  fingering?: number[]; // Dedo usado em cada corda
}

export interface ChordShape {
  chordName: string;
  root: NoteName;
  quality: ChordQuality;
  frets: number[]; // Por corda (de baixo para cima), -1 = muted
  fingers: number[]; // Dedo usado em cada corda
  startFret: number;
  barre: { fret: number; fromString: number; toString: number } | null;
}

export interface ChordDiagram {
  shape: ChordShape;
  width: number;
  height: number;
  numStrings: number;
  numFrets: number;
}

// ============================================
// INSTRUMENTS
// ============================================

export interface InstrumentProfile {
  id: string;
  name: string;
  strings: number;
  tuning: NoteName[]; // Da corda mais grave para a mais aguda
  octaves: number[]; // Oitava de cada corda aberta
  frets: number;
  fretless: boolean;
}

export type InstrumentId = 
  | 'guitarra-6'
  | 'violao-12'
  | 'ukulele'
  | 'baixo-4'
  | 'baixo-5';

// ============================================
// AUDIO
// ============================================

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface ADSRParams {
  attack: number;  // segundos
  decay: number;   // segundos
  sustain: number; // 0-1
  release: number; // segundos
}

export const DEFAULT_ADSR: ADSRParams = {
  attack: 0.008,
  decay: 0.08,
  sustain: 0.7,
  release: 0.25,
};

// ============================================
// USER
// ============================================

export type SubscriptionTier = 'free' | 'pro' | 'lifetime';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTier;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultInstrument: InstrumentId;
  theme: 'light' | 'dark';
  showNoteNames: boolean;
  showFretNumbers: boolean;
  audioTimbre: OscillatorType;
}

// ============================================
// EXERCISES
// ============================================

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  tempo: number;
  duration?: number; // minutos
}

export type ExerciseType = 
  | 'scale'
  | 'chord-progression'
  | 'technique'
  | 'licks'
  | 'ear-training';

// ============================================
// EDUCATIONAL CONTENT
// ============================================

export interface EducationalContent {
  id: string;
  section: string;
  title: string;
  content: string; // Markdown
  examples?: string[];
  tips?: string[];
  relatedSections?: string[];
}