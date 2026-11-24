/**
 * Catálogo de planos do MusicOS.
 *
 * Fonte única de verdade para preços, nomes e textos de venda. A página de
 * planos, o modal de upgrade e o checkout leem daqui — nunca de strings soltas.
 *
 * Os IDs de preço do Stripe ficam em variáveis de ambiente (ver .env.local.example).
 */

export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly' | 'lifetime';
export type PaidPlanId = Exclude<PlanId, 'free'>;

/** Nível de acesso gravado no perfil do usuário. */
export type Tier = 'free' | 'pro' | 'lifetime';

export interface Plan {
  id: PlanId;
  tier: Tier;
  name: string;
  /** Preço em reais */
  price: number;
  /** Texto do período: "/mês", "/ano", "pagamento único" */
  period: string;
  /** Cobrança recorrente (assinatura) ou única */
  recurring: boolean;
  tagline: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    tier: 'free',
    name: 'Grátis',
    price: 0,
    period: 'para sempre',
    recurring: false,
    tagline: 'Para começar a estudar agora, sem cadastro.',
    features: [
      '6 escalas essenciais: maior, menor, pentatônicas e blues',
      'Acordes em tríades com diagrama e som',
      'Violão/guitarra, cavaquinho e baixo na afinação padrão',
      'Teclado virtual e ciclo de quintas',
      'Metrônomo em 2/4, 3/4 e 4/4 com tap tempo',
      'Treino auditivo de intervalos (nível iniciante)',
      '3 exercícios de prática com tablatura',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    tier: 'pro',
    name: 'Pro Mensal',
    price: 9.9,
    period: '/mês',
    recurring: true,
    tagline: 'Todos os recursos, cancele quando quiser.',
    features: [
      'Tudo do Grátis',
      'Todas as escalas: modos gregos, menor harmônica e melódica, exóticas',
      'Tétrades e extensões: 7, 6, 9, add9, 6/9, sus e 7sus4',
      'Desenhos CAGED (C, A, G, E, D) no braço',
      'Todos os 13 instrumentos: viola caipira, banjo, bandolim, ukulele, 7 e 8 cordas...',
      'Afinações alternativas e personalizadas, corda por corda',
      'Prática com tablatura: riffs, técnica e melodias para tocar junto',
      'Treino auditivo completo, com histórico de progresso e ranking',
      'Metrônomo completo: 6/8, 7/8, 12/8 e subdivisões',
      'Afinador com microfone',
      'Exportar e imprimir diagramas',
      'Sem anúncios',
    ],
  },
  pro_yearly: {
    id: 'pro_yearly',
    tier: 'pro',
    name: 'Pro Anual',
    price: 89,
    period: '/ano',
    recurring: true,
    tagline: 'Economize 25% em relação ao mensal.',
    highlight: true,
    badge: 'Mais popular',
    features: [
      'Tudo do Pro Mensal',
      'Equivale a R$ 7,42 por mês',
      'Um pagamento por ano, sem surpresas',
    ],
  },
  lifetime: {
    id: 'lifetime',
    tier: 'lifetime',
    name: 'Vitalício',
    price: 197,
    period: 'pagamento único',
    recurring: false,
    tagline: 'Pague uma vez, use para sempre.',
    badge: 'Melhor valor',
    features: [
      'Tudo do Pro, para sempre',
      'Todas as atualizações futuras incluídas',
      'Suporte prioritário por e-mail',
      'Sem mensalidade, nunca',
    ],
  },
};

export const PAID_PLANS: PaidPlanId[] = ['pro_monthly', 'pro_yearly', 'lifetime'];

export function isPaidPlan(id: string): id is PaidPlanId {
  return (PAID_PLANS as string[]).includes(id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

/** Variável de ambiente com o Price ID do Stripe de cada plano pago. */
export const STRIPE_PRICE_ENV: Record<PaidPlanId, string> = {
  pro_monthly: 'STRIPE_PRICE_PRO_MONTHLY',
  pro_yearly: 'STRIPE_PRICE_PRO_YEARLY',
  lifetime: 'STRIPE_PRICE_LIFETIME',
};
