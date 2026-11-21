/**
 * Hooks React para o sistema de instrumentos musicais
 * 
 * Fornece integração React com o InstrumentRegistry
 * e funcionalidades de instrumentos individuais.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getInstrumentRegistry,
  InstrumentRegistry,
  Instrument,
  InstrumentConfig,
  InstrumentState,
  InstrumentFilter,
  InstrumentSearchResult,
  CreateInstrumentOptions
} from '../index';

// ============================================
// HOOKS PARA O REGISTRY
// ============================================

/**
 * Hook para acessar o registry global de instrumentos
 */
export function useInstrumentRegistry() {
  const [registry, setRegistry] = useState<InstrumentRegistry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const inst = getInstrumentRegistry({
        autoLoadPresets: true,
        enableCaching: true,
        enableLogging: false
      });
      
      setRegistry(inst);
      setIsLoading(false);
    } catch (err) {
      setError(`Erro ao inicializar registry: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  }, []);

  return {
    registry,
    isLoading,
    error
  };
}

/**
 * Hook para buscar instrumentos com filtros
 */
export function useInstrumentSearch(filter: InstrumentFilter = {}) {
  const { registry, isLoading: registryLoading } = useInstrumentRegistry();
  const [searchResult, setSearchResult] = useState<InstrumentSearchResult>({
    instruments: [],
    total: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = useCallback(async (newFilter?: InstrumentFilter) => {
    if (!registry) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const result = registry.searchInstruments(newFilter || filter);
      setSearchResult(result);
    } catch (err) {
      setSearchError(`Erro na busca: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSearching(false);
    }
  }, [registry, filter]);

  useEffect(() => {
    if (registry && !registryLoading) {
      search();
    }
  }, [registry, registryLoading, filter, search]);

  return {
    result: searchResult,
    search,
    isLoading: registryLoading || isSearching,
    error: searchError
  };
}

/**
 * Hook para obter instrumentos do tier gratuito
 */
export function useFreeTierInstruments() {
  const { registry, isLoading: registryLoading } = useInstrumentRegistry();
  const [instruments, setInstruments] = useState<InstrumentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registry) return;
    
    setIsLoading(true);
    
    try {
      const freeTierInstruments = registry.getFreeTierInstruments();
      setInstruments(freeTierInstruments);
      setError(null);
    } catch (err) {
      setError(`Erro ao obter instrumentos do tier gratuito: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [registry]);

  return {
    instruments,
    isLoading: registryLoading || isLoading,
    error
  };
}

/**
 * Hook para obter instrumentos do tier premium
 */
export function usePremiumTierInstruments() {
  const { registry, isLoading: registryLoading } = useInstrumentRegistry();
  const [instruments, setInstruments] = useState<InstrumentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registry) return;
    
    setIsLoading(true);
    
    try {
      const premiumInstruments = registry.getPremiumTierInstruments();
      setInstruments(premiumInstruments);
      setError(null);
    } catch (err) {
      setError(`Erro ao obter instrumentos do tier premium: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [registry]);

  return {
    instruments,
    isLoading: registryLoading || isLoading,
    error
  };
}

// ============================================
// HOOKS PARA INSTRUMENTOS INDIVIDUAIS
// ============================================

/**
 * Configuração do hook de instrumento
 */
export interface UseInstrumentConfig extends CreateInstrumentOptions {
  /** ID do instrumento */
  instrumentId: string;
  
  /** Auto-criar o instrumento */
  autoCreate?: boolean;
  
  /** Atualizar estado automaticamente */
  autoUpdateState?: boolean;
  
  /** Intervalo de atualização (ms) */
  updateInterval?: number;
}

/**
 * Hook para gerenciar um instrumento musical
 */
export function useInstrument(config: UseInstrumentConfig) {
  const { instrumentId, autoCreate = true, autoUpdateState = true, updateInterval = 1000 } = config;
  
  const { registry, isLoading: registryLoading } = useInstrumentRegistry();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [state, setState] = useState<InstrumentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instrumento
  const createInstrument = useCallback(async (options?: CreateInstrumentOptions) => {
    if (!registry) {
      setError('Registry não disponível');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const inst = registry.createInstrument(instrumentId, { ...config, ...options });
      setInstrument(inst);
      setState(inst.getState());
      return inst;
    } catch (err) {
      setError(`Erro ao criar instrumento ${instrumentId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [registry, instrumentId, config]);

  // Destruir instrumento
  const destroyInstrument = useCallback(() => {
    if (instrument) {
      // Em uma implementação real, você limparia recursos aqui
      setInstrument(null);
      setState(null);
    }
  }, [instrument]);

  // Atualizar estado
  const updateState = useCallback(() => {
    if (instrument) {
      setState(instrument.getState());
    }
  }, [instrument]);

  // Tocar uma nota
  const playNote = useCallback(async (note: string, octave: number, velocity?: number) => {
    if (!instrument) {
      setError('Instrumento não criado');
      return false;
    }
    
    try {
      await instrument.playNote(note as any, octave as any, velocity);
      updateState();
      return true;
    } catch (err) {
      setError(`Erro ao tocar nota: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [instrument, updateState]);

  // Parar uma nota
  const stopNote = useCallback(async (note: string, octave: number) => {
    if (!instrument) {
      setError('Instrumento não criado');
      return false;
    }
    
    try {
      await instrument.stopNote(note as any, octave as any);
      updateState();
      return true;
    } catch (err) {
      setError(`Erro ao parar nota: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [instrument, updateState]);

  // Tocar um acorde
  const playChord = useCallback(async (notes: Array<{ note: string; octave: number }>, velocities?: number[]) => {
    if (!instrument) {
      setError('Instrumento não criado');
      return false;
    }
    
    try {
      await instrument.playChord(
        notes.map(n => ({ note: n.note as any, octave: n.octave as any })),
        velocities
      );
      updateState();
      return true;
    } catch (err) {
      setError(`Erro ao tocar acorde: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [instrument, updateState]);

  // Parar todas as notas
  const stopAllNotes = useCallback(async () => {
    if (!instrument) {
      setError('Instrumento não criado');
      return false;
    }
    
    try {
      await instrument.stopAllNotes();
      updateState();
      return true;
    } catch (err) {
      setError(`Erro ao parar todas as notas: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [instrument, updateState]);

  // Mapear nota para posições
  const mapNote = useCallback((note: string, octave: number) => {
    if (!instrument) {
      setError('Instrumento não criado');
      return null;
    }
    
    try {
      return instrument.mapNoteToPositions(note as any, octave as any);
    } catch (err) {
      setError(`Erro ao mapear nota: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, [instrument]);

  // Obter visualização
  const getVisualization = useCallback(() => {
    if (!instrument) {
      return null;
    }
    
    try {
      return instrument.getVisualization();
    } catch (err) {
      setError(`Erro ao obter visualização: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, [instrument]);

  // Configurações
  const setTuning = useCallback((tuningName: string) => {
    if (!instrument) {
      return false;
    }
    
    const success = instrument.setTuning(tuningName);
    if (success) {
      updateState();
    }
    return success;
  }, [instrument, updateState]);

  const setRange = useCallback((lowestNote: string, lowestOctave: number, highestNote: string, highestOctave: number) => {
    if (!instrument) {
      return false;
    }
    
    const success = instrument.setRange(
      lowestNote as any,
      lowestOctave as any,
      highestNote as any,
      highestOctave as any
    );
    
    if (success) {
      updateState();
    }
    return success;
  }, [instrument, updateState]);

  // Efeitos
  useEffect(() => {
    if (autoCreate && registry && !registryLoading && !instrument) {
      createInstrument();
    }
  }, [autoCreate, registry, registryLoading, instrument, createInstrument]);

  useEffect(() => {
    if (autoUpdateState && instrument) {
      const interval = setInterval(updateState, updateInterval);
      return () => clearInterval(interval);
    }
  }, [autoUpdateState, instrument, updateInterval, updateState]);

  return {
    // Estado
    instrument,
    state,
    isLoading: registryLoading || isLoading,
    error,
    
    // Ações de criação/destruição
    createInstrument,
    destroyInstrument,
    
    // Ações do instrumento
    playNote,
    stopNote,
    playChord,
    stopAllNotes,
    mapNote,
    getVisualization,
    
    // Configurações
    setTuning,
    setRange,
    updateState,
    
    // Métodos do instrumento (se disponível)
    getInstrumentMethods: () => instrument ? {
      getConfig: () => instrument.getConfig(),
      getCurrentTuning: () => instrument.getCurrentTuning(),
      getCurrentRange: () => instrument.getCurrentRange(),
      isFreeTier: () => instrument.isFreeTier(),
      getActiveNotes: () => instrument.getActiveNotes(),
      resetToDefaults: () => {
        instrument.resetToDefaults();
        updateState();
      }
    } : null
  };
}

/**
 * Hook para gerenciar múltiplos instrumentos
 */
export function useMultiInstruments(instrumentIds: string[], options?: CreateInstrumentOptions) {
  const { registry, isLoading: registryLoading } = useInstrumentRegistry();
  const [instruments, setInstruments] = useState<Map<string, Instrument>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createInstruments = useCallback(async (ids?: string[], opts?: CreateInstrumentOptions) => {
    if (!registry) {
      setError('Registry não disponível');
      return new Map();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const idsToCreate = ids || instrumentIds;
      const createdInstruments = registry.createInstruments(idsToCreate, { ...options, ...opts });
      
      const newMap = new Map<string, Instrument>();
      createdInstruments.forEach(inst => {
        newMap.set(inst.id, inst);
      });
      
      setInstruments(newMap);
      return newMap;
    } catch (err) {
      setError(`Erro ao criar múltiplos instrumentos: ${err instanceof Error ? err.message : String(err)}`);
      return instruments;
    } finally {
      setIsLoading(false);
    }
  }, [registry, instrumentIds, options, instruments]);

  const destroyInstruments = useCallback(() => {
    // Limpar recursos
    instruments.forEach(inst => {
      // Em uma implementação real, você limparia recursos aqui
    });
    
    setInstruments(new Map());
  }, [instruments]);

  const getInstrument = useCallback((id: string) => {
    return instruments.get(id);
  }, [instruments]);

  const playChordOnAll = useCallback(async (chordNotes: Array<{ note: string; octave: number }>) => {
    const promises = Array.from(instruments.values()).map(inst =>
      inst.playChord(chordNotes.map(n => ({ note: n.note as any, octave: n.octave as any })))
    );
    
    try {
      await Promise.all(promises);
      return true;
    } catch (err) {
      setError(`Erro ao tocar acorde em múltiplos instrumentos: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [instruments]);

  useEffect(() => {
    if (registry && !registryLoading) {
      createInstruments();
    }
  }, [registry, registryLoading, createInstruments]);

  return {
    instruments,
    isLoading: registryLoading || isLoading,
    error,
    createInstruments,
    destroyInstruments,
    getInstrument,
    playChordOnAll
  };
}

// ============================================
// HOOKS PARA VISUALIZAÇÃO
// ============================================

/**
 * Hook para visualização de instrumento
 */
export function useInstrumentVisualization(instrumentId: string, options?: CreateInstrumentOptions) {
  const {
    instrument,
    state,
    isLoading,
    error,
    getVisualization,
    updateState
  } = useInstrument({
    instrumentId,
    autoCreate: true,
    autoUpdateState: true,
    ...options
  });

  const [visualization, setVisualization] = useState<any>(null);
  const [isRendering, setIsRendering] = useState(false);

  const updateVisualization = useCallback(() => {
    if (!instrument) return null;
    
    setIsRendering(true);
    try {
      const viz = getVisualization();
      setVisualization(viz);
      return viz;
    } catch (err) {
      console.error('Erro ao atualizar visualização:', err);
      return null;
    } finally {
      setIsRendering(false);
    }
  }, [instrument, getVisualization]);

  useEffect(() => {
    if (instrument) {
      updateVisualization();
    }
  }, [instrument, updateVisualization]);

  // Atualizar quando o estado mudar
  useEffect(() => {
    if (state) {
      updateVisualization();
    }
  }, [state, updateVisualization]);

  return {
    visualization,
    isLoading: isLoading || isRendering,
    error,
    updateVisualization,
    instrumentState: state
  };
}

/**
 * Hook para tocar notas com visualização
 */
export function useInstrumentPlayer(instrumentId: string, options?: CreateInstrumentOptions) {
  const {
    instrument,
    playNote,
    stopNote,
    playChord,
    stopAllNotes,
    mapNote,
    state,
    isLoading,
    error
  } = useInstrument({
    instrumentId,
    autoCreate: true,
    autoUpdateState: true,
    ...options
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Array<{ note: string; octave: number; velocity?: number }>>([]);
  const [playHistory, setPlayHistory] = useState<Array<{
    note: string;
    octave: number;
    velocity?: number;
    timestamp: number;
  }>>([]);

  const playNoteWithVisualization = useCallback(async (note: string, octave: number, velocity?: number) => {
    setIsPlaying(true);
    
    const success = await playNote(note, octave, velocity);
    
    if (success) {
      // Atualizar notas ativas
      setActiveNotes(prev => [...prev, { note, octave, velocity }]);
      
      // Adicionar ao histórico
      setPlayHistory(prev => [...prev, {
        note,
        octave,
        velocity,
        timestamp: Date.now()
      }]);
    }
    
    setIsPlaying(false);
    return success;
  }, [playNote]);

  const stopNoteWithVisualization = useCallback(async (note: string, octave: number) => {
    const success = await stopNote(note, octave);
    
    if (success) {
      // Remover das notas ativas
      setActiveNotes(prev => prev.filter(n => !(n.note === note && n.octave === octave)));
    }
    
    return success;
  }, [stopNote]);

  const clearPlayHistory = useCallback(() => {
    setPlayHistory([]);
  }, []);

  const getNoteMappings = useCallback((note: string, octave: number) => {
    if (!instrument) return null;
    
    return mapNote(note, octave);
  }, [instrument, mapNote]);

  return {
    // Estado
    instrument,
    isLoading,
    error,
    isPlaying,
    activeNotes,
    playHistory,
    instrumentState: state,
    
    // Ações
    playNote: playNoteWithVisualization,
    stopNote: stopNoteWithVisualization,
    playChord,
    stopAllNotes,
    clearPlayHistory,
    getNoteMappings
  };
}

export default {
  useInstrumentRegistry,
  useInstrumentSearch,
  useFreeTierInstruments,
  usePremiumTierInstruments,
  useInstrument,
  useMultiInstruments,
  useInstrumentVisualization,
  useInstrumentPlayer
};