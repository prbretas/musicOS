/**
 * useInstrument Hook
 * Hook React para gerenciamento de instrumentos
 * 
 * Fornece:
 * 1. Estado do instrumento atual
 * 2. Troca de instrumentos
 * 3. Gerenciamento de afinações
 * 4. Utilitários para o braço
 */

import { useState, useEffect, useCallback } from 'react';
import { instrumentRegistry, instrumentUtils } from '@/lib/music/instruments/registry';
import type { InstrumentProfile, InstrumentId, NoteName } from '@/types/music';

/**
 * Opções para o hook useInstrument
 */
interface UseInstrumentOptions {
  /** ID do instrumento inicial */
  initialInstrumentId?: InstrumentId;
  /** Callback quando o instrumento é alterado */
  onInstrumentChange?: (instrument: InstrumentProfile) => void;
  /** Callback quando a afinação é alterada */
  onTuningChange?: (tuning: NoteName[]) => void;
}

/**
 * Retorno do hook useInstrument
 */
interface UseInstrumentReturn {
  // Estado atual
  currentInstrument: InstrumentProfile;
  currentInstrumentId: string;
  currentTuning: NoteName[];
  
  // Ações
  setInstrument: (instrumentId: string) => boolean;
  setTuning: (tuning: NoteName[]) => boolean;
  saveCustomTuning: (id: string, tuning: NoteName[]) => boolean;
  
  // Utilitários
  availableInstruments: InstrumentProfile[];
  availableTunings: Array<{ id: string; name: string; tuning: NoteName[] }>;
  instrumentUtils: typeof instrumentUtils;
  
  // Cálculos
  calculateNoteAtPosition: (stringIndex: number, fret: number) => NoteName | null;
  findNotePositions: (note: NoteName) => Array<{ string: number; fret: number }>;
}

/**
 * Hook para gerenciamento de instrumentos
 */
export function useInstrument(options: UseInstrumentOptions = {}): UseInstrumentReturn {
  const {
    initialInstrumentId = 'guitarra-6',
    onInstrumentChange,
    onTuningChange,
  } = options;

  // Estado do instrumento atual
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentProfile>(
    () => instrumentRegistry.getById(initialInstrumentId) || instrumentRegistry.getDefault()
  );

  // Estado da afinação atual
  const [currentTuning, setCurrentTuning] = useState<NoteName[]>(
    () => currentInstrument.tuning
  );

  // Instrumentos disponíveis
  const [availableInstruments, setAvailableInstruments] = useState<InstrumentProfile[]>(
    () => instrumentRegistry.getAll()
  );

  // Afinações disponíveis para o instrumento atual
  const [availableTunings, setAvailableTunings] = useState<
    Array<{ id: string; name: string; tuning: NoteName[] }>
  >(() => instrumentRegistry.getAvailableTunings(currentInstrument.id));

  // Atualizar afinações quando o instrumento mudar
  useEffect(() => {
    const tunings = instrumentRegistry.getAvailableTunings(currentInstrument.id);
    setAvailableTunings(tunings);
    
    // Resetar para afinação padrão do novo instrumento
    const defaultTuning = instrumentRegistry.getDefaultTuning(currentInstrument.id);
    if (defaultTuning) {
      setCurrentTuning(defaultTuning);
      onTuningChange?.(defaultTuning);
    }
  }, [currentInstrument.id, onTuningChange]);

  // Trocar instrumento
  const setInstrument = useCallback((instrumentId: string): boolean => {
    const instrument = instrumentRegistry.getById(instrumentId);
    if (!instrument) {
      console.error(`Instrumento não encontrado: ${instrumentId}`);
      return false;
    }

    setCurrentInstrument(instrument);
    onInstrumentChange?.(instrument);
    
    // Atualizar instrumento padrão do usuário
    instrumentRegistry.setDefaultInstrument(instrumentId as InstrumentId);
    
    return true;
  }, [onInstrumentChange]);

  // Alterar afinação
  const setTuning = useCallback((tuning: NoteName[]): boolean => {
    if (tuning.length !== currentInstrument.strings) {
      console.error(`Afinação deve ter ${currentInstrument.strings} notas`);
      return false;
    }

    setCurrentTuning(tuning);
    onTuningChange?.(tuning);
    
    // Atualizar afinações disponíveis
    const tunings = instrumentRegistry.getAvailableTunings(currentInstrument.id);
    setAvailableTunings(tunings);
    
    return true;
  }, [currentInstrument.strings, onTuningChange]);

  // Salvar afinação personalizada
  const saveCustomTuning = useCallback((id: string, tuning: NoteName[]): boolean => {
    const success = instrumentRegistry.saveCustomTuning(id, tuning, currentInstrument.id);
    
    if (success) {
      // Atualizar lista de afinações disponíveis
      const tunings = instrumentRegistry.getAvailableTunings(currentInstrument.id);
      setAvailableTunings(tunings);
    }
    
    return success;
  }, [currentInstrument.id]);

  // Calcular nota em uma posição
  const calculateNoteAtPosition = useCallback((stringIndex: number, fret: number): NoteName | null => {
    return instrumentRegistry.calculateNoteAtPosition(
      currentInstrument.id,
      stringIndex,
      fret
    );
  }, [currentInstrument.id]);

  // Encontrar posições de uma nota
  const findNotePositions = useCallback((note: NoteName): Array<{ string: number; fret: number }> => {
    return instrumentRegistry.findNotePositions(currentInstrument.id, note);
  }, [currentInstrument.id]);

  return {
    // Estado
    currentInstrument,
    currentInstrumentId: currentInstrument.id,
    currentTuning,
    
    // Ações
    setInstrument,
    setTuning,
    saveCustomTuning,
    
    // Utilitários
    availableInstruments,
    availableTunings,
    instrumentUtils,
    
    // Cálculos
    calculateNoteAtPosition,
    findNotePositions,
  };
}

/**
 * Hook simplificado para obter o instrumento atual
 */
export function useCurrentInstrument(): InstrumentProfile {
  const { currentInstrument } = useInstrument();
  return currentInstrument;
}

/**
 * Hook para obter afinação atual
 */
export function useCurrentTuning(): NoteName[] {
  const { currentTuning } = useInstrument();
  return currentTuning;
}

/**
 * Hook para gerenciamento de múltiplos instrumentos (contexto)
 */
export function useInstrumentManager() {
  const [instruments, setInstruments] = useState<Record<string, InstrumentProfile>>({});
  const [activeInstrumentId, setActiveInstrumentId] = useState<string>('guitarra-6');

  // Carregar instrumentos disponíveis
  useEffect(() => {
    const allInstruments = instrumentRegistry.getAll();
    const instrumentsMap = allInstruments.reduce((acc, instrument) => {
      acc[instrument.id] = instrument;
      return acc;
    }, {} as Record<string, InstrumentProfile>);

    setInstruments(instrumentsMap);
  }, []);

  // Instrumento ativo
  const activeInstrument = instruments[activeInstrumentId] || instrumentRegistry.getDefault();

  // Adicionar novo instrumento
  const addInstrument = useCallback((profile: InstrumentProfile) => {
    const success = instrumentRegistry.registerInstrument(profile);
    if (success) {
      setInstruments(prev => ({
        ...prev,
        [profile.id]: profile,
      }));
    }
    return success;
  }, []);

  // Remover instrumento
  const removeInstrument = useCallback((instrumentId: string) => {
    const success = instrumentRegistry.removeInstrument(instrumentId);
    if (success) {
      setInstruments(prev => {
        const { [instrumentId]: removed, ...rest } = prev;
        return rest;
      });
      
      // Se o instrumento removido era o ativo, mudar para padrão
      if (instrumentId === activeInstrumentId) {
        setActiveInstrumentId('guitarra-6');
      }
    }
    return success;
  }, [activeInstrumentId]);

  return {
    // Estado
    instruments,
    activeInstrumentId,
    activeInstrument,
    
    // Ações
    setActiveInstrument: setActiveInstrumentId,
    addInstrument,
    removeInstrument,
    
    // Utilitários
    instrumentCount: Object.keys(instruments).length,
    getInstrument: (id: string) => instruments[id] || null,
    hasInstrument: (id: string) => id in instruments,
  };
}