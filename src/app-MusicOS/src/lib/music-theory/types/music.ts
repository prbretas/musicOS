/**
 * Tipos TypeScript para Teoria Musical
 * 
 * Tipos unificados para toda a engine de teoria musical do MusicOS
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

/**
 * Nomes de notas (sustenidos)
 */
export type NoteName = 
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/**
 * Nomes de notas (bemóis - para entrada/saída opcional)
 */
export type FlatNoteName = 
  | 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'Gb' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

/**
 * Tipo unificado para notas (aceita sustenidos e bemóis)
 */
export type AnyNoteName = NoteName | FlatNoteName;

// ============================================
// TIPOS DE ESCALAS
// ============================================

/**
 * Tipos de escalas diatônicas principais
 */
export type DiatonicScaleType = 
  | 'major'              // Maior
  | 'natural-minor'      // Menor Natural
  | 'harmonic-minor'     // Menor Harmônica
  | 'melodic-minor';     // Menor Melódica

/**
 * Modos Gregos
 */
export type GreekModeType = 
  | 'ionian'     // Jônio (I)
  | 'dorian'     // Dórico (II)
  | 'phrygian'   // Frígio (III)
  | 'lydian'     | 'Lídio (IV)
  | 'mixolydian' // Mixolídio (V)
  | 'aeolian'    // Eólio (VI)
  | 'locrian';   // Lócrio (VII)

/**
 * Escalas pentatônicas e blues
 */
export type PentatonicScaleType = 
  | 'major-pentatonic'   // Pentatônica Maior
  | 'minor-pentatonic'   // Pentatônica Menor
  | 'blues-major'        // Blues Maior
  | 'blues-minor';       // Blues Menor

/**
 * Escalas exóticas e especiais
 */
export type ExoticScaleType = 
  | 'egyptian'           // Egípcia
  | 'hirajoshi'          // Hirajoshi (japonesa)
  | 'iwato'              // Iwato (japonesa)
  | 'whole-tone'         // Tons Inteiros
  | 'chromatic'          // Cromática
  | 'diminished-half'    // Diminuta T-S
  | 'diminished-whole';  // Diminuta S-T

/**
 * Tipo unificado para todos os tipos de escala
 */
export type ScaleType = 
  | DiatonicScaleType 
  | GreekModeType 
  | PentatonicScaleType 
  | ExoticScaleType;

// ============================================
// TIPOS DE ACORDES
// ============================================

/**
 * Acordes básicos (tríades)
 */
export type BasicChordType = 
  | 'major'        // Maior
  | 'minor'        // Menor
  | 'diminished'   | 'Diminuto
  | 'augmented';   // Aumentado

/**
 * Acordes com sétima
 */
export type SeventhChordType = 
  | 'major7'       // Maior com sétima maior
  | 'minor7'       // Menor com sétima menor
  | 'dominant7'    // Dominante (sétima menor)
  | 'diminished7'  // Diminuto com sétima diminuta
  | 'half-diminished7'; // Meio-diminuto

/**
 | 'Acordes com suspensão e adições
 */
export type ExtendedChordType = 
  | 'sus2'         // Suspenso 2
  | 'sus4'         // Suspenso 4
  | 'add9'         // Adiciona 9
  | 'maj9'         // Maior com 9
  | 'min9'         // Menor com 9
  | 'maj11'        // Maior com 11
  | 'min11'        // Menor com 11
  | 'maj13'        // Maior com 13
  | 'min13';       // Menor com 13

/**
 * Tipo unificado para todos os tipos de acorde
 */
export type ChordType = 
  | BasicChordType 
  | SeventhChordType 
  | ExtendedChordType;

// ============================================
 | 'TIPOS DE INTERVALOS
// ============================================

/**
 | 'Intervalos básicos (0-12 semitons)
 */
export type IntervalType = 
  | 'unison'           // Uníssono (0)
  | 'minor-second'     // Segunda menor (1)
  | 'major-second'     // Segunda maior (2)
  | 'minor-third'      // Terça menor (3)
  | 'major-third'      // Terça maior (4)
  | 'perfect-fourth'   | 'Quarta justa (5)
  | 'tritone'          // Trítono (6)
  | 'perfect-fifth'    // Quinta justa (7)
  | 'minor-sixth'      // Sexta menor (8)
  | 'major-sixth'      // Sexta maior (9)
  | 'minor-seventh'    // Sétima menor (10)
  | 'major-seventh'    // Sétima maior (11)
  | 'octave';          // Oitava (12)

// ============================================
// ESTRUTURAS DE DADOS
// ============================================

/**
 | 'Informações sobre uma escala
 */
export interface ScaleInfo {
  type: ScaleType;
  name: string;
  intervals: number[];        // Intervalos em semitons
  description: string;        // Descrição da escala
  category: 'diatonic' | 'modes' | 'pentatonic' | 'blues' | 'exotic';
  mood?: string;              // Humor/efeito (ex: "feliz", "triste")
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 | 'Resultado do cálculo de uma escala
 */
export interface ScaleResult {
  tonic: NoteName;
  type: ScaleType;
  notes: NoteName[];
  intervals: number[];
  degrees: string[];          // Nomes dos graus (ex: "Tônica", "Super-tônica")
  harmonicField?: HarmonicDegree[];
}

/**
 | 'Grau do campo harmônico
 */
export interface HarmonicDegree {
  degree: number;             // 1-7
  roman: string;              // I, ii, iii, etc.
  chord: NoteName;            | 'Nota base do acorde
  quality: ChordType;         // Tipo do acorde
  notes: NoteName[];          // Notas do acorde
  function?: string;          // Função harmônica (ex: "Tônica", "Dominante")
}

/**
 | 'Informações sobre um acorde
 */
export interface ChordInfo {
  type: ChordType;
  name: string;
  intervals: number[];        // Intervalos em semitons
  description: string;        // Descrição do acorde
  symbol: string;             | 'Símbolo (ex: "maj7", "m7")
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 | 'Resultado do cálculo de um acorde
 */
export interface ChordResult {
  root: NoteName;
  type: ChordType;
  notes: NoteName[];
  intervals: number[];
  extensions?: string[];      // Extensões (ex: ["9", "11"])
  inversions?: NoteName[][];  // Inversões do acorde
}

/**
 | 'Intervalo musical
 */
export interface MusicInterval {
  type: IntervalType;
  semitones: number;
  name: string;
  abbreviation: string;       // Abreviação (ex: "M3", "P5")
  consonant: boolean;         | 'Se é intervalo consonante
}

/**
 | 'Configuração do campo harmônico
 */
export interface HarmonicFieldConfig {
  includeExtensions?: boolean;    // Incluir acordes com 7, 9, etc.
  includeInversions?: boolean;    // Incluir inversões
  showFunctions?: boolean;        // Mostrar funções harmônicas
  limitToFreeTier?: boolean;      // Limitar a tonalidades do tier free
}

/**
 | 'Configuração da modulação
 */
export interface ModulationConfig {
  fromKey: NoteName;
  toKey: NoteName;
  pivotChords?: NoteName[];      // Acordes pivô para modulação suave
  type?: 'direct' | 'pivot' | 'gradual';  // Tipo de modulação
}

/**
 | 'Resultado da modulação
 */
export interface ModulationResult {
  success: boolean;
  fromKey: NoteName;
  toKey: NoteName;
  pivotChords?: NoteName[];
  steps?: ModulationStep[];
  error?: string;
}

/**
 | 'Passo da modulação
 */
export interface ModulationStep {
  step: number;
  chord: NoteName;
  function: string;
  explanation: string;
}

// ============================================
// ENUMS E CONSTANTES
// ============================================

/**
 | 'Categorias de escalas
 */
export enum ScaleCategory {
  DIATONIC = 'diatonic',
  MODES = 'modes',
  PENTATONIC = 'pentatonic',
  BLUES = 'blues',
  EXOTIC = 'exotic'
}

/**
 | 'Dificuldade dos conceitos
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 | 'Funções harmônicas
 */
export enum HarmonicFunction {
  TONIC = 'tonic',
  SUBDOMINANT = 'subdominant',
  DOMINANT = 'dominant',
  SUBMEDIANT = 'submediant',
  MEDIANT = 'mediant',
  SUPER_TONIC = 'supertonic',
  LEADING_TONE = 'leading-tone'
}

/**
 | 'Tipos de notação
 */
export enum NotationType {
  SHARP = 'sharp',    // Sustenidos (C#, D#, etc.)
  FLAT = 'flat'       // Bemóis (Db, Eb, etc.)
}

// ============================================
// TIPOS PARA REACT HOOKS
// ============================================

/**
 | 'Estado da teoria musical para hooks React
 */
export interface MusicTheoryState {
  currentKey: NoteName;
  currentScale: ScaleType;
  currentChord?: ChordType;
  scaleResult: ScaleResult;
  chordResult?: ChordResult;
  harmonicField: HarmonicDegree[];
  isFreeTier: boolean;
}

/**
 | 'Ações disponíveis para hooks React
 */
export interface MusicTheoryActions {
  setKey: (key: NoteName) => void;
  setScale: (scale: ScaleType) => void;
  setChord: (chord: ChordType) => void;
  transpose: (semitones: number) => void;
  modulate: (toKey: NoteName) => ModulationResult;
  getRelativeMinor: () => NoteName;
  getRelativeMajor: () => NoteName;
}

// ============================================
// TIPOS PARA VALIDAÇÃO
// ============================================

/**
 | 'Resultado de validação
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
  suggestions?: string[];
}

/**
 | 'Validação de nota
 */
export interface NoteValidation extends ValidationResult {
  normalizedNote?: NoteName;
  enharmonicEquivalents?: NoteName[];
}

/**
 | 'Validação de escala
 */
export interface ScaleValidation extends ValidationResult {
  availableScales?: ScaleType[];
  suggestedScales?: ScaleType[];
}

/**
 | 'Validação de acorde
 */
export interface ChordValidation extends ValidationResult {
  availableChords?: ChordType[];
  suggestedChords?: ChordType[];
}