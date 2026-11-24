/**
 * Catálogo de recursos e quem pode usar cada um.
 *
 * Regra do produto: no modo grátis (sem cadastro) o usuário vê TODOS os
 * recursos. Os que são Pro aparecem com o selo e, ao clicar, abrem o modal
 * de upgrade. Para liberar, o usuário cria a conta e compra um plano.
 *
 * Para mover um recurso entre grátis e Pro, basta mudar o `tier` aqui.
 */

import type { Tier } from './plans';

export type FeatureId =
  | 'scales-basic'
  | 'scales-advanced'
  | 'tetrads'
  | 'caged'
  | 'ukulele'
  | 'alt-tunings'
  | 'tuner'
  | 'exercises'
  | 'export'
  | 'metronome'
  | 'circle-of-fifths';

export interface Feature {
  id: FeatureId;
  /** Nome curto mostrado no modal de upgrade */
  label: string;
  /** Uma frase sobre o que o recurso faz */
  description: string;
  tier: 'free' | 'pro';
}

export const FEATURES: Record<FeatureId, Feature> = {
  'scales-basic': {
    id: 'scales-basic',
    label: 'Escalas essenciais',
    description: 'Maior, menor natural, pentatônicas e blues em todas as tonalidades.',
    tier: 'free',
  },
  'scales-advanced': {
    id: 'scales-advanced',
    label: 'Todas as escalas e modos',
    description: 'Modos gregos, menor harmônica e melódica, diminutas, tons inteiros e escalas exóticas.',
    tier: 'pro',
  },
  tetrads: {
    id: 'tetrads',
    label: 'Campo harmônico com tétrades',
    description: 'Acordes de sétima (maj7, m7, 7, m7b5) em todos os graus da escala.',
    tier: 'pro',
  },
  caged: {
    id: 'caged',
    label: 'Desenhos CAGED',
    description: 'As 5 formas do sistema CAGED mais as posições F e B, casa por casa no braço.',
    tier: 'pro',
  },
  ukulele: {
    id: 'ukulele',
    label: 'Ukulele',
    description: 'Braço do ukulele com escalas, intervalos e acordes.',
    tier: 'pro',
  },
  'alt-tunings': {
    id: 'alt-tunings',
    label: 'Afinações alternativas',
    description: 'Drop D, DADGAD, Open G, meio tom abaixo e afinação personalizada.',
    tier: 'pro',
  },
  tuner: {
    id: 'tuner',
    label: 'Afinador cromático',
    description: 'Afine qualquer instrumento usando o microfone, com detecção precisa de altura.',
    tier: 'pro',
  },
  exercises: {
    id: 'exercises',
    label: 'Exercícios de treino auditivo',
    description: 'Reconheça intervalos e acordes de ouvido, com pontuação e progresso.',
    tier: 'pro',
  },
  export: {
    id: 'export',
    label: 'Exportar e imprimir',
    description: 'Gere uma versão para impressão da escala, do braço e dos acordes.',
    tier: 'pro',
  },
  metronome: {
    id: 'metronome',
    label: 'Metrônomo',
    description: 'Metrônomo preciso com acento no primeiro tempo.',
    tier: 'free',
  },
  'circle-of-fifths': {
    id: 'circle-of-fifths',
    label: 'Ciclo de quintas',
    description: 'Navegue pelas tonalidades e suas relativas.',
    tier: 'free',
  },
};

/** Escalas liberadas no modo grátis (chaves de `SCALES` em lib/music/escalas). */
export const FREE_SCALE_KEYS = new Set([
  'maior',
  'menor_natural',
  'pentatonica_maior',
  'pentatonica_menor',
  'blues_maior',
  'blues_menor',
]);

export function isScaleFree(scaleKey: string): boolean {
  return FREE_SCALE_KEYS.has(scaleKey);
}

/** Um usuário com este tier pode usar o recurso? */
export function canUse(tier: Tier, feature: FeatureId): boolean {
  if (FEATURES[feature].tier === 'free') return true;
  return tier === 'pro' || tier === 'lifetime';
}

export function isProFeature(feature: FeatureId): boolean {
  return FEATURES[feature].tier === 'pro';
}
