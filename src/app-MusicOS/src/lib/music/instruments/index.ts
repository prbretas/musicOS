/**
 * Instrument Registry Module
 * CORE-002: Sistema completo de gerenciamento de instrumentos
 * 
 * Este módulo exporta todas as funcionalidades relacionadas a instrumentos:
 * 1. InstrumentRegistry - Registro centralizado de instrumentos
 * 2. Hooks React - Para uso em componentes
 * 3. Componentes UI - Para interface do usuário
 * 4. Utilitários - Funções auxiliares
 */

// ============================================
// REGISTRY & TYPES
// ============================================

export { instrumentRegistry, DEFAULT_INSTRUMENTS, TUNING_PRESETS } from './registry';
export type { InstrumentProfile, InstrumentId } from '@/types/music';

// ============================================
// REACT HOOKS
// ============================================

export { useInstrument, useCurrentInstrument, useCurrentTuning, useInstrumentManager } from '@/hooks/useInstrument';

// ============================================
// UI COMPONENTS
// ============================================

export { InstrumentSelector } from '@/components/InstrumentSelector';

// ============================================
// UTILITIES
// ============================================

/**
 * Utilitários para trabalhar com instrumentos
 */
export const instrumentUtils = {
  /**
   * Verificar se uma afinação é válida para um instrumento
   */
  isValidTuning(instrument: InstrumentProfile, tuning: string[]): boolean {
    return tuning.length === instrument.strings;
  },

  /**
   * Comparar duas afinações
   */
  areTuningsEqual(tuning1: string[], tuning2: string[]): boolean {
    if (tuning1.length !== tuning2.length) return false;
    return tuning1.every((note, index) => note === tuning2[index]);
  },

  /**
   * Formatar afinação para exibição
   */
  formatTuning(tuning: string[]): string {
    return tuning.map(note => note.replace('#', '♯')).join(' - ');
  },

  /**
   * Obter o intervalo padrão entre cordas (para referência)
   */
  getStringInterval(instrumentId: string): number {
    switch (instrumentId) {
      case 'guitarra-6':
      case 'violao-12':
        return 5; // Quarta justa entre cordas (exceto 2-3 que é quarta aumentada)
      case 'ukulele':
        return 5; // Quarta justa
      case 'baixo-4':
      case 'baixo-5':
        return 5; // Quarta justa
      default:
        return 5;
    }
  },

  /**
   * Obter o nome do instrumento baseado no ID
   */
  getInstrumentName(id: string): string {
    const names: Record<string, string> = {
      'guitarra-6': 'Guitarra',
      'violao-12': 'Violão 12 Cordas',
      'ukulele': 'Ukulele',
      'baixo-4': 'Baixo 4 Cordas',
      'baixo-5': 'Baixo 5 Cordas',
    };
    
    return names[id] || 'Instrumento Personalizado';
  },
};

// ============================================
// DEFAULT EXPORTS
// ============================================

/**
 * Exportação padrão: InstrumentRegistry singleton
 */
export default instrumentRegistry;