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
  | 'instruments'
  | 'alt-tunings'
  | 'tuner'
  | 'exercises'
  | 'export'
  | 'metronome'
  | 'metronome-pro'
  | 'practice'
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
    label: 'Tétrades e extensões',
    description: 'Acordes com 7ª, 6ª, 9ª, add9, 6/9, sus2, sus4 e 7sus4 em todos os graus, com diagramas.',
    tier: 'pro',
  },
  caged: {
    id: 'caged',
    label: 'Desenhos CAGED',
    description: 'As 5 formas do sistema CAGED (C, A, G, E, D), casa por casa no braço.',
    tier: 'pro',
  },
  instruments: {
    id: 'instruments',
    label: 'Todos os instrumentos',
    description: 'Baixo, violão de 7 cordas, guitarra de 7 e 8 cordas, viola caipira, cavaquinho, bandolim, banjo e ukulele.',
    tier: 'pro',
  },
  'alt-tunings': {
    id: 'alt-tunings',
    label: 'Afinações alternativas',
    description: 'Drop D, Double Drop, DADGAD, open tunings, meio tom e um tom abaixo, ou monte a sua corda por corda.',
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
    label: 'Treino auditivo completo',
    description: 'Todos os níveis de intervalos e acordes, com pontuação, histórico de progresso e ranking. O nível iniciante de intervalos é grátis.',
    tier: 'pro',
  },
  practice: {
    id: 'practice',
    label: 'Prática com tablatura',
    description: 'Riffs, frases, técnica e melodias com tab para o seu instrumento e afinação, para tocar junto com andamento ajustável.',
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
    description: 'Metrônomo com acento, tap tempo e compassos 2/4, 3/4 e 4/4.',
    tier: 'free',
  },
  'metronome-pro': {
    id: 'metronome-pro',
    label: 'Metrônomo completo',
    description: 'Compassos compostos e irregulares (6/8, 7/8, 12/8...) e subdivisões em colcheia, tercina e semicolcheia.',
    tier: 'pro',
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
