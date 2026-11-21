/**
 * Hooks React para a engine de teoria musical
 * 
 * Exporta todos os hooks React para integração com componentes
 */

export * from './use-music-theory';

// Exporta hooks individualmente para importação seletiva
export { useMusicTheory } from './use-music-theory';
export { useScaleExplorer } from './use-music-theory';
export { useChordBuilder } from './use-music-theory';
export { useIntervalTrainer } from './use-music-theory';
export { useMusicTheoryHealth } from './use-music-theory';

export type {
  UseMusicTheoryConfig,
  MusicTheoryState,
  MusicTheoryActions
} from './use-music-theory';

/**
 * Exemplo de uso:
 * 
 * ```tsx
 * // Hook principal
 * const {
 *   rootNote,
 *   scaleType,
 *   currentScale,
 *   setRootNote,
 *   setScaleType,
 *   transpose
 * } = useMusicTheory();
 * 
 * // Hook específico para escalas
 * const {
 *   currentScale,
 *   scaleInfo,
 *   getScaleModes
 * } = useScaleExplorer('C', 'major');
 * 
 * // Hook específico para acordes
 * const {
 *   currentChord,
 *   chordInfo,
 *   getChordVoicings
 * } = useChordBuilder('C', 'major');
 * ```
 */