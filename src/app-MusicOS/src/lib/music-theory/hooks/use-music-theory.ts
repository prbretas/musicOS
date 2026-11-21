/**
 * Hook principal para usar a engine de teoria musical em componentes React
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MusicTheoryEngine,
  ScaleType,
  ChordType,
  Note,
  Interval,
  Scale,
  Chord,
  KeySignature,
  MusicalScale,
  MusicalChord,
  FreeTierNote
} from '../index';

/**
 * Configuração do hook
 */
export interface UseMusicTheoryConfig {
  /** Idioma das descrições (pt/en) */
  language?: 'pt' | 'en';
  
  /** Notação preferida (sustenidos/bemóis) */
  notation?: 'sharp' | 'flat';
  
  /** Restringir ao tier gratuito */
  freeTierOnly?: boolean;
  
  /** Nota raiz inicial */
  initialRoot?: Note;
  
  /** Tipo de escala inicial */
  initialScaleType?: ScaleType;
  
  /** Tipo de acorde inicial */
  initialChordType?: ChordType;
}

/**
 * Estado retornado pelo hook
 */
export interface MusicTheoryState {
  /** Engine principal */
  engine: MusicTheoryEngine;
  
  /** Configuração atual */
  config: Required<UseMusicTheoryConfig>;
  
  /** Nota raiz atual */
  rootNote: Note;
  
  /** Tipo de escala atual */
  scaleType: ScaleType;
  
  /** Tipo de acorde atual */
  chordType: ChordType;
  
  /** Escala atual calculada */
  currentScale: Scale | null;
  
  /** Acorde atual calculado */
  currentChord: Chord | null;
  
  /** Campo harmônico atual */
  harmonicField: Chord[] | null;
  
  /** Erros atuais */
  errors: string[];
  
  /** Carregando estado */
  isLoading: boolean;
}

/**
 * Ações disponíveis
 */
export interface MusicTheoryActions {
  /** Muda a nota raiz */
  setRootNote: (note: Note) => void;
  
  /** Muda o tipo de escala */
  setScaleType: (scaleType: ScaleType) => void;
  
  /** Muda o tipo de acorde */
  setChordType: (chordType: ChordType) => void;
  
  /** Transpõe a escala/acorde */
  transpose: (semitones: number) => void;
  
  /** Gera uma escala aleatória */
  randomScale: () => void;
  
  /** Gera um acorde aleatório */
  randomChord: () => void;
  
  /** Calcula o campo harmônico */
  calculateHarmonicField: () => Chord[];
  
  /** Verifica se uma nota está disponível no tier gratuito */
  isFreeTierNote: (note: Note) => boolean;
  
  /** Limpa erros */
  clearErrors: () => void;
  
  /** Reseta para configuração inicial */
  reset: () => void;
}

/**
 * Hook principal de teoria musical
 */
export function useMusicTheory(
  initialConfig: UseMusicTheoryConfig = {}
): MusicTheoryState & MusicTheoryActions {
  // Configuração padrão
  const defaultConfig: Required<UseMusicTheoryConfig> = {
    language: 'pt',
    notation: 'sharp',
    freeTierOnly: false,
    initialRoot: 'C',
    initialScaleType: 'major',
    initialChordType: 'major'
  };

  // Estado
  const [config, setConfig] = useState<Required<UseMusicTheoryConfig>>({
    ...defaultConfig,
    ...initialConfig
  });
  
  const [rootNote, setRootNoteState] = useState<Note>(config.initialRoot);
  const [scaleType, setScaleTypeState] = useState<ScaleType>(config.initialScaleType);
  const [chordType, setChordTypeState] = useState<ChordType>(config.initialChordType);
  const [currentScale, setCurrentScale] = useState<Scale | null>(null);
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [harmonicField, setHarmonicField] = useState<Chord[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Engine memoizada
  const engine = useMemo(() => new MusicTheoryEngine(config), [config]);

  // Calcula escala atual
  useEffect(() => {
    try {
      if (config.freeTierOnly && !engine.isFreeTierNote(rootNote)) {
        const freeNotes: Note[] = ['C', 'G', 'F', 'A', 'E'];
        setRootNoteState(freeNotes[0]);
        return;
      }

      setIsLoading(true);
      const scale = engine.createScale(rootNote, scaleType);
      setCurrentScale(scale);
      setErrors([]);
    } catch (error) {
      setErrors([`Erro ao calcular escala: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsLoading(false);
    }
  }, [rootNote, scaleType, engine, config.freeTierOnly]);

  // Calcula acorde atual
  useEffect(() => {
    try {
      const chord = engine.createChord(rootNote, chordType);
      setCurrentChord(chord);
    } catch (error) {
      setErrors(prev => [...prev, `Erro ao calcular acorde: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }, [rootNote, chordType, engine]);

  // Ações
  const setRootNote = useCallback((note: Note) => {
    if (config.freeTierOnly && !engine.isFreeTierNote(note)) {
      setErrors(['Nota não disponível no tier gratuito. Use: C, G, F, A, E']);
      return;
    }
    setRootNoteState(note);
  }, [config.freeTierOnly, engine]);

  const setScaleType = useCallback((scaleType: ScaleType) => {
    setScaleTypeState(scaleType);
  }, []);

  const setChordType = useCallback((chordType: ChordType) => {
    setChordTypeState(chordType);
  }, []);

  const transpose = useCallback((semitones: number) => {
    try {
      const newRoot = engine.transposeNote(rootNote, semitones);
      setRootNote(newRoot);
    } catch (error) {
      setErrors(prev => [...prev, `Erro ao transpor: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }, [rootNote, engine, setRootNote]);

  const randomScale = useCallback(() => {
    try {
      const randomRoot = engine.getRandomNote(config.freeTierOnly);
      const randomScaleType = engine.getRandomScaleType();
      
      setRootNoteState(randomRoot);
      setScaleTypeState(randomScaleType);
    } catch (error) {
      setErrors(prev => [...prev, `Erro ao gerar escala aleatória: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }, [engine, config.freeTierOnly]);

  const randomChord = useCallback(() => {
    try {
      const randomRoot = engine.getRandomNote(config.freeTierOnly);
      const randomChordType = engine.getRandomChordType();
      
      setRootNoteState(randomRoot);
      setChordTypeState(randomChordType);
    } catch (error) {
      setErrors(prev => [...prev, `Erro ao gerar acorde aleatório: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }, [engine, config.freeTierOnly]);

  const calculateHarmonicField = useCallback((): Chord[] => {
    try {
      if (!currentScale) {
        return [];
      }

      const field = engine.getHarmonicField(currentScale);
      setHarmonicField(field);
      return field;
    } catch (error) {
      setErrors(prev => [...prev, `Erro ao calcular campo harmônico: ${error instanceof Error ? error.message : String(error)}`]);
      return [];
    }
  }, [currentScale, engine]);

  const isFreeTierNote = useCallback((note: Note): boolean => {
    return engine.isFreeTierNote(note);
  }, [engine]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const reset = useCallback(() => {
    setRootNoteState(config.initialRoot);
    setScaleTypeState(config.initialScaleType);
    setChordTypeState(config.initialChordType);
    setCurrentScale(null);
    setCurrentChord(null);
    setHarmonicField(null);
    setErrors([]);
  }, [config]);

  return {
    // Estado
    engine,
    config,
    rootNote,
    scaleType,
    chordType,
    currentScale,
    currentChord,
    harmonicField,
    errors,
    isLoading,
    
    // Ações
    setRootNote,
    setScaleType,
    setChordType,
    transpose,
    randomScale,
    randomChord,
    calculateHarmonicField,
    isFreeTierNote,
    clearErrors,
    reset
  };
}

/**
 * Hook específico para exploração de escalas
 */
export function useScaleExplorer(
  initialRoot: Note = 'C',
  initialScaleType: ScaleType = 'major'
) {
  const {
    engine,
    rootNote,
    scaleType,
    currentScale,
    errors,
    isLoading,
    setRootNote,
    setScaleType,
    transpose,
    randomScale,
    clearErrors
  } = useMusicTheory({
    initialRoot,
    initialScaleType
  });

  // Métodos específicos para escalas
  const getScaleInfo = useCallback(() => {
    if (!currentScale) return null;
    
    return {
      name: currentScale.name,
      notes: currentScale.notes,
      intervals: currentScale.intervals,
      formula: currentScale.formula,
      description: currentScale.description,
      isFreeTier: currentScale.notes.every(note => engine.isFreeTierNote(note.name)),
      relatedScales: engine.getRelatedScales(currentScale.type)
    };
  }, [currentScale, engine]);

  const getScaleModes = useCallback(() => {
    if (!currentScale) return [];
    
    return engine.getScaleModes(currentScale.type);
  }, [currentScale, engine]);

  const getSimilarScales = useCallback(() => {
    if (!currentScale) return [];
    
    return engine.getSimilarScales(currentScale.type);
  }, [currentScale, engine]);

  return {
    // Estado
    engine,
    rootNote,
    scaleType,
    currentScale,
    scaleInfo: getScaleInfo(),
    errors,
    isLoading,
    
    // Ações
    setRootNote,
    setScaleType,
    transpose,
    randomScale,
    clearErrors,
    
    // Métodos específicos
    getScaleModes,
    getSimilarScales
  };
}

/**
 * Hook específico para construção de acordes
 */
export function useChordBuilder(
  initialRoot: Note = 'C',
  initialChordType: ChordType = 'major'
) {
  const {
    engine,
    rootNote,
    chordType,
    currentChord,
    errors,
    isLoading,
    setRootNote,
    setChordType,
    transpose,
    randomChord,
    clearErrors
  } = useMusicTheory({
    initialRoot,
    initialChordType
  });

  // Métodos específicos para acordes
  const getChordInfo = useCallback(() => {
    if (!currentChord) return null;
    
    return {
      name: currentChord.name,
      notes: currentChord.notes,
      intervals: currentChord.intervals,
      formula: currentChord.formula,
      description: currentChord.description,
      isFreeTier: currentChord.notes.every(note => engine.isFreeTierNote(note.name)),
      inversions: engine.getChordInversions(currentChord)
    };
  }, [currentChord, engine]);

  const getChordExtensions = useCallback(() => {
    if (!currentChord) return [];
    
    return engine.getChordExtensions(currentChord.type);
  }, [currentChord, engine]);

  const getChordVoicings = useCallback(() => {
    if (!currentChord) return [];
    
    return engine.getChordVoicings(currentChord);
  }, [currentChord, engine]);

  return {
    // Estado
    engine,
    rootNote,
    chordType,
    currentChord,
    chordInfo: getChordInfo(),
    errors,
    isLoading,
    
    // Ações
    setRootNote,
    setChordType,
    transpose,
    randomChord,
    clearErrors,
    
    // Métodos específicos
    getChordExtensions,
    getChordVoicings
  };
}

/**
 * Hook para treinamento de intervalos
 */
export function useIntervalTrainer() {
  const [currentInterval, setCurrentInterval] = useState<Interval | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [history, setHistory] = useState<Array<{
    interval: Interval;
    guessed: boolean;
    time: number;
  }>>([]);
  
  const engine = useMemo(() => new MusicTheoryEngine(), []);

  const generateRandomInterval = useCallback(() => {
    const interval = engine.getRandomInterval();
    setCurrentInterval(interval);
    return interval;
  }, [engine]);

  const checkGuess = useCallback((intervalName: string): boolean => {
    if (!currentInterval) return false;
    
    const isCorrect = currentInterval.name === intervalName;
    
    setScore(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));
    
    setHistory(prev => [...prev, {
      interval: currentInterval,
      guessed: isCorrect,
      time: Date.now()
    }]);
    
    return isCorrect;
  }, [currentInterval]);

  const resetTraining = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setHistory([]);
  }, []);

  return {
    currentInterval,
    score,
    history,
    generateRandomInterval,
    checkGuess,
    resetTraining
  };
}

/**
 * Hook para verificar a saúde da engine
 */
export function useMusicTheoryHealth() {
  const [health, setHealth] = useState({
    healthy: false,
    modules: {} as Record<string, boolean>,
    errors: [] as string[]
  });
  
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      // Simula verificação assíncrona
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { checkEngineHealth } = require('../index');
      const result = checkEngineHealth();
      
      setHealth(result);
      return result;
    } catch (error) {
      const errorResult = {
        healthy: false,
        modules: {},
        errors: [`Erro ao verificar saúde: ${error instanceof Error ? error.message : String(error)}`]
      };
      
      setHealth(errorResult);
      return errorResult;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    isChecking,
    checkHealth
  };
}