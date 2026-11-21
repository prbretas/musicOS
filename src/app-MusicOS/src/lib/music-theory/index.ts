/**
 * Music Theory Engine - Main Export
 * 
 * Exporta todas as funcionalidades da engine de teoria musical
 * para uso em todo o aplicativo MusicOS.
 */

// Export core modules
export * from './core/notes';
export * from './core/intervals';
export * from './core/scales';
export * from './core/chords';

// Export engine
export * from './engine/theory-engine';

// Export types
export * from './types/music';

// Export utilities
export * from './utils/converters';

// Export React hooks
export * from './hooks';

/**
 * Versão da engine de teoria musical
 */
export const MUSIC_THEORY_VERSION = '1.0.0';

/**
 * Informações sobre a engine
 */
export const MUSIC_THEORY_INFO = {
  name: 'MusicOS Theory Engine',
  version: '1.0.0',
  description: 'Engine completa de teoria musical para o MusicOS',
  features: [
    'Sistema completo de notas e intervalos',
    '20+ tipos de escalas',
    '15+ tipos de acordes',
    'Campo harmônico',
    'Modulação e transposição',
    'Tipos TypeScript completos'
  ],
  author: 'MusicOS Team',
  license: 'MIT'
};

/**
 * Inicializa a engine de teoria musical
 * (Pode ser usado para configurações futuras)
 */
export function initializeMusicTheory(config?: {
  language?: 'pt' | 'en';
  notation?: 'sharp' | 'flat';
  freeTierOnly?: boolean;
}) {
  const defaultConfig = {
    language: 'pt' as const,
    notation: 'sharp' as const,
    freeTierOnly: false
  };

  const mergedConfig = { ...defaultConfig, ...config };

  console.log(`🎵 Music Theory Engine v${MUSIC_THEORY_VERSION} initialized`);
  console.log(`Config: ${JSON.stringify(mergedConfig, null, 2)}`);

  return {
    config: mergedConfig,
    engine: 'ready' as const
  };
}

/**
 * Verificação de saúde da engine
 */
export function checkEngineHealth(): {
  healthy: boolean;
  modules: Record<string, boolean>;
  errors: string[];
} {
  const modules: Record<string, boolean> = {
    notes: true,
    intervals: true,
    scales: true,
    chords: true,
    types: true,
    utils: true
  };

  const errors: string[] = [];

  try {
    // Teste básico de cada módulo
    require('./core/notes');
    require('./core/intervals');
    require('./core/scales');
    require('./core/chords');
    require('./types/music');
    require('./utils/converters');
  } catch (error) {
    errors.push(`Module error: ${error instanceof Error ? error.message : String(error)}`);
    modules.notes = false; // Marca como falha
  }

  return {
    healthy: errors.length === 0,
    modules,
    errors
  };
}

// Export default para importação fácil
export default {
  version: MUSIC_THEORY_VERSION,
  info: MUSIC_THEORY_INFO,
  initialize: initializeMusicTheory,
  health: checkEngineHealth,
  // Re-export all functions
  ...require('./engine/theory-engine')
};