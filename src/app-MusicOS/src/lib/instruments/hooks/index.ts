/**
 * Hooks React para o sistema de instrumentos
 * 
 * Exporta todos os hooks para integração com React
 */

export * from './use-instrument';

// Exportar hooks individualmente
export { useInstrumentRegistry } from './use-instrument';
export { useInstrumentSearch } from './use-instrument';
export { useFreeTierInstruments } from './use-instrument';
export { usePremiumTierInstruments } from './use-instrument';
export { useInstrument } from './use-instrument';
export { useMultiInstruments } from './use-instrument';
export { useInstrumentVisualization } from './use-instrument';
export { useInstrumentPlayer } from './use-instrument';

export type {
  UseInstrumentConfig
} from './use-instrument';

/**
 * Exemplos de uso:
 * 
 * ```tsx
 * // Hook principal para um instrumento
 * const {
 *   instrument,
 *   state,
 *   playNote,
 *   stopNote,
 *   isLoading,
 *   error
 * } = useInstrument({
 *   instrumentId: 'piano-61',
 *   autoCreate: true
 * });
 * 
 * // Hook para busca de instrumentos
 * const {
 *   result,
 *   search,
 *   isLoading
 * } = useInstrumentSearch({
 *   category: 'keyboard',
 *   tier: 'free'
 * });
 * 
 * // Hook para visualização
 * const {
 *   visualization,
 *   isLoading
 * } = useInstrumentVisualization('guitar-standard');
 * 
 * // Hook para tocar com visualização
 * const {
 *   playNote,
 *   activeNotes,
 *   isPlaying
 * } = useInstrumentPlayer('ukulele-soprano');
 * ```
 */