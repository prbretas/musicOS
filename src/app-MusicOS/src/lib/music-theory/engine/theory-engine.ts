/**
 * Music Theory Engine - Engine Principal
 * 
 * Engine unificada que combina todos os módulos de teoria musical
 * em uma API coerente e fácil de usar.
 */

import { 
  NoteName, AnyNoteName, ScaleType, ScaleInfo, ScaleResult,
  ChordType, ChordInfo, ChordResult, HarmonicDegree,
  MusicInterval, IntervalType, NotationType,
  HarmonicFieldConfig, ModulationResult, MusicTheoryState
} from '../types/music';

// Import core modules
import {
  // Notes
  toSharpNote, toFlatNote, normalizeNote, getNoteIndex, getNoteByIndex,
  transposeNote, isValidNote, getAllNotes, getFreeTierNotes, isNoteFreeTier,
  
  // Intervals
  calculateInterval, getIntervalInfo, getIntervalBetween, applyInterval,
  isConsonantInterval, invertInterval, getIntervalsFromNotes,
  
  // Scales (do arquivo existente)
  generateScaleNotes as existingGenerateScaleNotes,
  generateHarmonicField as existingGenerateHarmonicField,
  calculateScale as existingCalculateScale,
  SCALES as EXISTING_SCALES,
  getAllScales as existingGetAllScales,
  getScaleByType as existingGetScaleByType,
  getScalesByCategory as existingGetScalesByCategory
} from '../core/scales';

import {
  // Chords (será implementado no próximo passo)
  getChordNotes as getChordNotesInternal,
  getChordInfo as getChordInfoInternal,
  getAvailableChordTypes as getAvailableChordTypesInternal
} from '../core/chords';

// ============================================
// CONFIGURAÇÃO DA ENGINE
// ============================================

/**
 * Configuração global da engine
 */
export interface TheoryEngineConfig {
  language: 'pt' | 'en';
  notation: NotationType;
  freeTierOnly: boolean;
  maxComplexity: 'beginner' | 'intermediate' | 'advanced';
}

const DEFAULT_CONFIG: TheoryEngineConfig = {
  language: 'pt',
  notation: NotationType.SHARP,
  freeTierOnly: false,
  maxComplexity: 'advanced'
};

let currentConfig: TheoryEngineConfig = { ...DEFAULT_CONFIG };

/**
 * Configura a engine de teoria musical
 */
export function configureEngine(config: Partial<TheoryEngineConfig>): void {
  currentConfig = { ...currentConfig, ...config };
  console.log(`🎵 Music Theory Engine configured:`, currentConfig);
}

/**
 * Retorna a configuração atual
 */
export function getConfig(): TheoryEngineConfig {
  return { ...currentConfig };
}

// ============================================
// API DE NOTAS (WRAPPERS)
// ============================================

/**
 * Normaliza uma nota usando a configuração atual
 */
export function normalize(note: AnyNoteName): NoteName {
  return normalizeNote(note, currentConfig.notation) as NoteName;
}

/**
 * Transpõe uma nota usando a configuração atual
 */
export function transpose(note: AnyNoteName, semitones: number): NoteName {
  return transposeNote(note, semitones, currentConfig.notation) as NoteName;
}

/**
 * Valida uma nota e retorna sugestões se necessário
 */
export function validateNote(note: string): ReturnType<typeof isValidNote> {
  return isValidNote(note);
}

/**
 * Retorna todas as notas disponíveis (respeitando tier free se configurado)
 */
export function getNotes(): NoteName[] {
  if (currentConfig.freeTierOnly) {
    return getFreeTierNotes(currentConfig.notation) as NoteName[];
  }
  return getAllNotes(currentConfig.notation) as NoteName[];
}

// ============================================
// API DE INTERVALOS (WRAPPERS)
// ============================================

/**
 * Retorna informações completas sobre um intervalo
 */
export function getInterval(semitones: number): MusicInterval {
  return getIntervalInfo(semitones);
}

/**
 * Calcula o intervalo entre duas notas
 */
export function getIntervalFromNotes(
  fromNote: AnyNoteName, 
  toNote: AnyNoteName
): MusicInterval {
  return getIntervalBetween(fromNote, toNote);
}

/**
 * Aplica um intervalo a uma nota base
 */
export function applyIntervalToNote(
  baseNote: AnyNoteName,
  interval: IntervalType | number,
  direction: 'up' | 'down' = 'up'
): NoteName {
  return applyInterval(baseNote, interval, direction);
}

/**
 * Verifica se um intervalo é consonante
 */
export function isConsonant(semitones: number): boolean {
  return isConsonantInterval(semitones);
}

// ============================================
// API DE ESCALAS (WRAPPERS E MELHORIAS)
// ============================================

/**
 * Retorna as notas de uma escala
 */
export function getScaleNotes(
  tonic: AnyNoteName, 
  scaleType: ScaleType
): NoteName[] {
  const normalizedTonic = normalize(tonic);
  
  // Verifica se a tônica está disponível no tier free se configurado
  if (currentConfig.freeTierOnly && !isNoteFreeTier(normalizedTonic)) {
    throw new Error(`Tônica "${tonic}" não disponível no tier Free. Use: C, G, F, A, E`);
  }
  
  return existingGenerateScaleNotes(normalizedTonic, scaleType);
}

/**
 * Retorna informações sobre uma escala
 */
export function getScaleInfo(scaleType: ScaleType): ScaleInfo | undefined {
  return existingGetScaleByType(scaleType);
}

/**
 * Retorna todas as escalas disponíveis (filtradas por complexidade)
 */
export function getAvailableScales(): ScaleType[] {
  const allScales = existingGetAllScales();
  
  // Filtra por complexidade se configurado
  if (currentConfig.maxComplexity !== 'advanced') {
    return allScales
      .filter(scale => {
        if (currentConfig.maxComplexity === 'beginner') {
          return scale.difficulty === 'beginner';
        } else if (currentConfig.maxComplexity === 'intermediate') {
          return scale.difficulty === 'beginner' || scale.difficulty === 'intermediate';
        }
        return true;
      })
      .map(scale => scale.type);
  }
  
  return allScales.map(scale => scale.type);
}

/**
 * Calcula uma escala completa com todas as informações
 */
export function calculateScale(
  tonic: AnyNoteName, 
  scaleType: ScaleType
): ScaleResult {
  const normalizedTonic = normalize(tonic);
  
  // Verifica se a tônica está disponível no tier free se configurado
  if (currentConfig.freeTierOnly && !isNoteFreeTier(normalizedTonic)) {
    throw new Error(`Tônica "${tonic}" não disponível no tier Free. Use: C, G, F, A, E`);
  }
  
  const result = existingCalculateScale(normalizedTonic, scaleType);
  
  // Adiciona intervalos calculados
  const intervals = result.notes.map(note => 
    calculateInterval(normalizedTonic, note)
  );
  
  // Adiciona nomes dos graus (simplificado)
  const degreeNames = getScaleDegreeNames(scaleType);
  
  return {
    ...result,
    intervals,
    degrees: degreeNames.slice(0, result.notes.length)
  };
}

/**
 * Retorna nomes dos graus para uma escala
 */
function getScaleDegreeNames(scaleType: ScaleType): string[] {
  const degreeNamesPT = [
    'Tônica',
    'Super-tônica',
    'Mediante',
    'Sub-dominante',
    'Dominante',
    'Super-dominante',
    'Sensível'
  ];
  
  const degreeNamesEN = [
    'Tonic',
    'Supertonic',
    'Mediant',
    'Subdominant',
    'Dominant',
    'Submediant',
    'Leading Tone'
  ];
  
  return currentConfig.language === 'pt' ? degreeNamesPT : degreeNamesEN;
}

/**
 * Retorna o campo harmônico de uma escala
 */
export function getHarmonicField(
  tonic: AnyNoteName,
  scaleType: ScaleType,
  config?: HarmonicFieldConfig
): HarmonicDegree[] {
  const normalizedTonic = normalize(tonic);
  
  // Verifica se a tônica está disponível no tier free se configurado
  if (currentConfig.freeTierOnly && !isNoteFreeTier(normalizedTonic)) {
    throw new Error(`Tônica "${tonic}" não disponível no tier Free. Use: C, G, F, A, E`);
  }
  
  const field = existingGenerateHarmonicField(normalizedTonic, scaleType);
  
  // Aplica configurações adicionais se fornecidas
  if (config) {
    // TODO: Implementar filtros baseados na configuração
    // - Incluir extensões
    // - Mostrar inversões
    // - Mostrar funções harmônicas
  }
  
  return field;
}

/**
 * Transpõe uma escala por N semitons
 */
export function transposeScale(
  scaleNotes: NoteName[], 
  semitones: number
): NoteName[] {
  return scaleNotes.map(note => transpose(note, semitones));
}

// ============================================
// API DE ACORDES (IMPLEMENTAÇÃO SIMPLIFICADA)
// ============================================

/**
 * Retorna as notas de um acorde
 */
export function getChordNotes(root: AnyNoteName, chordType: ChordType): NoteName[] {
  const normalizedRoot = normalize(root);
  return getChordNotesInternal(normalizedRoot, chordType);
}

/**
 * Retorna informações sobre um acorde
 */
export function getChordInfo(chordType: ChordType): ChordInfo | undefined {
  return getChordInfoInternal(chordType);
}

/**
 * Retorna todos os tipos de acorde disponíveis
 */
export function getAvailableChords(): ChordType[] {
  return getAvailableChordTypesInternal();
}

/**
 * Calcula um acorde completo com todas as informações
 */
export function calculateChord(root: AnyNoteName, chordType: ChordType): ChordResult {
  const normalizedRoot = normalize(root);
  const notes = getChordNotes(normalizedRoot, chordType);
  const intervals = notes.map(note => calculateInterval(normalizedRoot, note));
  
  return {
    root: normalizedRoot,
    type: chordType,
    notes,
    intervals
  };
}

// ============================================
// API DE MODULAÇÃO E RELAÇÕES
// ============================================

/**
 * Encontra o relativo menor de uma tonalidade maior
 */
export function getRelativeMinor(majorKey: AnyNoteName): NoteName {
  const normalizedKey = normalize(majorKey);
  // Relativo menor está a 3 semitons abaixo (ou 9 acima)
  return transpose(normalizedKey, -3);
}

/**
 * Encontra o relativo maior de uma tonalidade menor
 */
export function getRelativeMajor(minorKey: AnyNoteName): NoteName {
  const normalizedKey = normalize(minorKey);
  // Relativo maior está a 3 semitons acima (ou 9 abaixo)
  return transpose(normalizedKey, 3);
}

/**
 * Modula de uma tonalidade para outra
 */
export function modulate(
  fromKey: AnyNoteName,
  toKey: AnyNoteName
): ModulationResult {
  const normalizedFrom = normalize(fromKey);
  const normalizedTo = normalize(toKey);
  
  const distance = calculateInterval(normalizedFrom, normalizedTo);
  
  // Encontra acordes pivô comuns (simplificado)
  const pivotChords = findCommonChords(normalizedFrom, normalizedTo);
  
  return {
    success: true,
    fromKey: normalizedFrom,
    toKey: normalizedTo,
    pivotChords: pivotChords.length > 0 ? pivotChords : undefined,
    steps: [{
      step: 1,
      chord: normalizedFrom,
      function: 'Tônica original',
      explanation: `Comece na tonalidade de ${normalizedFrom}`
    }, {
      step: 2,
      chord: pivotChords[0] || normalizedTo,
      function: pivotChords.length > 0 ? 'Acorde pivô' : 'Modulação direta',
      explanation: pivotChords.length > 0 
        ? `Use ${pivotChords[0]} como acorde comum`
        : `Module diretamente para ${normalizedTo}`
    }, {
      step: 3,
      chord: normalizedTo,
      function: 'Nova tônica',
      explanation: `Estabeleça a nova tonalidade de ${normalizedTo}`
    }]
  };
}

/**
 * Encontra acordes comuns entre duas tonalidades
 */
function findCommonChords(key1: NoteName, key2: NoteName): NoteName[] {
  // Implementação simplificada: retorna alguns acordes comuns
  const commonChords: NoteName[] = [];
  
  // Se as tonalidades são relativas, elas compartilham todos os acordes
  if (getRelativeMinor(key1) === key2 || getRelativeMajor(key1) === key2) {
    return [key1, key2];
  }
  
  // Adiciona a dominante como acorde pivô comum
  const dominant1 = transpose(key1, 7);
  const dominant2 = transpose(key2, 7);
  
  if (dominant1 === dominant2) {
    commonChords.push(dominant1);
  }
  
  // Adiciona a subdominante
  const subdominant1 = transpose(key1, 5);
  const subdominant2 = transpose(key2, 5);
  
  if (subdominant1 === subdominant2) {
    commonChords.push(subdominant1);
  }
  
  return commonChords;
}

// ============================================
// API DE ESTADO E GERENCIAMENTO
// ============================================

/**
 * Estado atual da teoria musical
 */
let currentState: MusicTheoryState = {
  currentKey: 'C',
  currentScale: 'major',
  scaleResult: calculateScale('C', 'major'),
  harmonicField: getHarmonicField('C', 'major'),
  isFreeTier: true
};

/**
 * Retorna o estado atual
 */
export function getState(): MusicTheoryState {
  return { ...currentState };
}

/**
 * Define a tonalidade atual
 */
export function setKey(key: AnyNoteName): void {
  const normalizedKey = normalize(key);
  
  // Verifica tier free
  const isFree = isNoteFreeTier(normalizedKey);
  if (currentConfig.freeTierOnly && !isFree) {
    throw new Error(`Tonalidade "${key}" não disponível no tier Free`);
  }
  
  currentState.currentKey = normalizedKey;
  updateState();
}

/**
 * Define a escala atual
 */
export function setScale(scale: ScaleType): void {
  currentState.currentScale = scale;
  updateState();
}

/**
 * Define o acorde atual
 */
export function setChord(chord: ChordType): void {
  const chordResult = calculateChord(currentState.currentKey, chord);
  currentState = {
    ...currentState,
    currentChord: chord,
    chordResult
  };
}

/**
 * Atualiza todo o estado baseado nas configurações atuais
 */
function updateState(): void {
  const { currentKey, currentScale } = currentState;
  
  currentState = {
    ...currentState,
    scaleResult: calculateScale(currentKey, currentScale),
    harmonicField: getHarmonicField(currentKey, currentScale),
    isFreeTier: isNoteFreeTier(currentKey)
  };
}

/**
 * Transpõe o estado atual por N semitons
 */
export function transposeState(semitones: number): void {
  const newKey = transpose(currentState.currentKey, semitones);
  setKey(newKey);
}

// ============================================
// API DE VALIDAÇÃO E VERIFICAÇÃO
// ============================================

/**
 * Verifica se uma tonalidade está disponível no tier atual
 */
export function isKeyAvailable(key: AnyNoteName): boolean {
  const normalizedKey = normalize(key);
  
  if (currentConfig.freeTierOnly) {
    return isNoteFreeTier(normalizedKey);
  }
  
  return true;
}

/**
 * Verifica se uma escala é apropriada para o nível de complexidade atual
 */
export function isScaleAppropriate(scaleType: ScaleType): boolean {
  const scaleInfo = getScaleInfo(scaleType);
  if (!scaleInfo) return false;
  
  if (currentConfig.maxComplexity === 'beginner') {
    return scaleInfo.difficulty === 'beginner';
  } else if (currentConfig.maxComplexity === 'intermediate') {
    return scaleInfo.difficulty === 'beginner' || scaleInfo.difficulty === 'intermediate';
  }
  
  return true; // 'advanced' aceita tudo
}

// ============================================
// EXPORT PRINCIPAL
// ============================================

/**
 * Engine de Teoria Musical completa
 */
export const MusicTheoryEngine = {
  // Configuração
  configure: configureEngine,
  getConfig,
  
  // Notas
  normalize,
  transpose,
  validateNote,
  getNotes,
  
  // Intervalos
  getInterval,
  getIntervalFromNotes,
  applyIntervalToNote,
  isConsonant,
  
  // Escalas
  getScaleNotes,
  getScaleInfo,
  getAvailableScales,
  calculateScale,
  getHarmonicField,
  transposeScale,
  
  // Acordes
  getChordNotes,
  getChordInfo,
  getAvailableChords,
  calculateChord,
  
  // Modulação e Relações
  getRelativeMinor,
  getRelativeMajor,
  modulate,
  
  // Estado
  getState,
  setKey,
  setScale,
  setChord,
  transposeState,
  
  // Validação
  isKeyAvailable,
  isScaleAppropriate,
  
  // Informações
  version: '1.0.0' as const,
  name: 'MusicOS Theory Engine' as const
};

export default MusicTheoryEngine;