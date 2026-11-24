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
      'Escalas maior, menor, pentatônicas e blues',
      'Tabela de intervalos e notas da escala',
      'Campo harmônico com tríades',
      'Braço da guitarra em afinação padrão',
      'Teclado virtual com som',
      'Ciclo de quintas interativo',
      'Metrônomo',
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
      'Campo harmônico com tétrades (acordes de sétima)',
      'Desenhos CAGED e as 7 posições no braço',
      'Ukulele e afinações alternativas',
      'Afinador com microfone',
      'Exercícios de treino auditivo com pontuação',
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
