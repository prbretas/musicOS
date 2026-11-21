/**
 * InstrumentRegistry - Sistema de gerenciamento de instrumentos musicais
 * 
 * Exporta todas as funcionalidades do CORE-002:
 * - InstrumentRegistry: Registro central de instrumentos
 * - Instrument: Classe base para todos os instrumentos
 * - Presets: Instrumentos pré-configurados
 * - Hooks React: Integração com componentes React
 * - Utilitários: Ferramentas para trabalhar com instrumentos
 */

// ============================================
// CORE
// ============================================

export * from './core/instrument';
export * from './core/registry';
export * from './types/instrument';

// Re-export tipos principais
export type {
  InstrumentConfig,
  InstrumentState,
  InstrumentTuning,
  InstrumentRange,
  InstrumentVisualization,
  NotePosition,
  NoteMappingResult,
  InstrumentFilter,
  InstrumentSearchResult,
  CreateInstrumentOptions,
  InstrumentEvents
} from './types/instrument';

// ============================================
// PRESETS
// ============================================

// Piano
export {
  PIANO_88_CONFIG,
  PIANO_61_CONFIG,
  KEYBOARD_49_CONFIG,
  Piano,
  registerPianoPresets
} from './presets/piano';

// Guitarra
export {
  ACOUSTIC_GUITAR_CONFIG,
  ELECTRIC_GUITAR_CONFIG,
  CLASSICAL_GUITAR_CONFIG,
  Guitar,
  registerGuitarPresets
} from './presets/guitar';

// Ukulele
export {
  UKULELE_SOPRANO_CONFIG,
  UKULELE_CONCERTO_CONFIG,
  UKULELE_TENOR_CONFIG,
  Ukulele,
  registerUkulelePresets
} from './presets/ukulele';

// ============================================
// HOOKS REACT
// ============================================

// Nota: Os hooks serão exportados de './hooks/index.ts'
// quando esse arquivo for criado
export * from './hooks';

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Inicializa o sistema de instrumentos
 */
export function initializeInstrumentSystem(options?: {
  autoLoadPresets?: boolean;
  enableCaching?: boolean;
  enableLogging?: boolean;
}) {
  const registry = getInstrumentRegistry(options);
  
  // Carregar presets padrão
  if (options?.autoLoadPresets !== false) {
    try {
      // Carregar presets dinamicamente
      const { registerPianoPresets } = require('./presets/piano');
      const { registerGuitarPresets } = require('./presets/guitar');
      const { registerUkulelePresets } = require('./presets/ukulele');
      
      registerPianoPresets(registry);
      registerGuitarPresets(registry);
      registerUkulelePresets(registry);
      
      console.log('🎵 Sistema de instrumentos inicializado com sucesso');
    } catch (error) {
      console.warn('⚠️  Erro ao carregar presets de instrumentos:', error);
    }
  }
  
  return registry;
}

/**
 * Verifica saúde do sistema de instrumentos
 */
export function checkInstrumentSystemHealth(): {
  healthy: boolean;
  registry: boolean;
  presets: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    // Verificar registry
    const registry = getInstrumentRegistry();
    const configs = registry.getAllInstrumentConfigs();
    
    if (configs.length === 0) {
      errors.push('Nenhum instrumento registrado');
    }
    
    // Verificar presets básicos
    const requiredPresets = ['piano-61', 'acoustic-guitar-standard', 'ukulele-soprano'];
    const missingPresets = requiredPresets.filter(id => !registry.getInstrumentConfig(id));
    
    if (missingPresets.length > 0) {
      errors.push(`Presets ausentes: ${missingPresets.join(', ')}`);
    }
    
    return {
      healthy: errors.length === 0,
      registry: true,
      presets: missingPresets.length === 0,
      errors
    };
  } catch (error) {
    return {
      healthy: false,
      registry: false,
      presets: false,
      errors: [`Erro fatal: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}

/**
 * Obtém instrumentos do tier gratuito
 */
export function getFreeTierInstruments(): InstrumentConfig[] {
  const registry = getInstrumentRegistry();
  return registry.getFreeTierInstruments();
}

/**
 * Obtém instrumentos do tier premium
 */
export function getPremiumTierInstruments(): InstrumentConfig[] {
  const registry = getInstrumentRegistry();
  return registry.getPremiumTierInstruments();
}

/**
 * Cria um instrumento de forma conveniente
 */
export function createInstrument(instrumentId: string, options?: CreateInstrumentOptions) {
  const registry = getInstrumentRegistry();
  return registry.createInstrument(instrumentId, options);
}

/**
 * Busca instrumentos por filtros
 */
export function searchInstruments(filter?: InstrumentFilter): InstrumentSearchResult {
  const registry = getInstrumentRegistry();
  return registry.searchInstruments(filter);
}

// ============================================
// EXPORT PRINCIPAL
// ============================================

// Exportar registry global
export { getInstrumentRegistry, resetInstrumentRegistry } from './core/registry';

// Exportar versão
export const INSTRUMENT_SYSTEM_VERSION = '1.0.0';

// Exportar informações do sistema
export const INSTRUMENT_SYSTEM_INFO = {
  name: 'MusicOS Instrument Registry',
  version: '1.0.0',
  description: 'Sistema de gerenciamento de instrumentos musicais para o MusicOS',
  features: [
    'Registry central de instrumentos',
    'Classe base Instrument extensível',
    'Presets de instrumentos (Piano, Guitarra, Ukulele)',
    'Hooks React para integração',
    'Sistema de tiers (free/premium)',
    'Visualização de instrumentos',
    'Mapeamento de notas para posições'
  ],
  presets: {
    freeTier: 5,
    premiumTier: 4,
    total: 9
  },
  author: 'MusicOS Team',
  license: 'MIT'
};

/**
 * Export default para uso conveniente
 */
export default {
  version: INSTRUMENT_SYSTEM_VERSION,
  info: INSTRUMENT_SYSTEM_INFO,
  initialize: initializeInstrumentSystem,
  health: checkInstrumentSystemHealth,
  getFreeTierInstruments,
  getPremiumTierInstruments,
  createInstrument,
  searchInstruments,
  getInstrumentRegistry,
  resetInstrumentRegistry
};