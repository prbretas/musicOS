export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'pro' | 'lifetime';
  subscription_status: 'active' | 'canceled' | 'past_due' | 'none';
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = User['subscription_tier'];
export type SubscriptionStatus = User['subscription_status'];

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Grátis',
    price: 0,
    features: [
      'scales',
      'chords-basic',
      'circle-of-fifths',
      'metronome',
      'ukulele-standard',
    ],
    limits: {
      instruments: 2,
      customTunings: 1,
      favorites: 10,
    },
  },
  pro: {
    name: 'Pro',
    price: 9.90,
    interval: 'mês',
    features: [
      'all-features',
      'chords-complete',
      'guitar-tunings',
      'custom-tunings-unlimited',
      'export-tabs',
      'no-ads',
    ],
    limits: {
      instruments: -1,
      customTunings: -1,
      favorites: -1,
    },
  },
  lifetime: {
    name: 'Lifetime',
    price: 197,
    interval: 'única',
    features: [
      'lifetime-access',
      'future-features',
      'priority-support',
    ],
    limits: {
      instruments: -1,
      customTunings: -1,
      favorites: -1,
    },
  },
} as const;

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: string
): boolean {
  const requiredTier = Object.entries(SUBSCRIPTION_TIERS).find(([, config]) =>
    config.features.includes(feature as never)
  )?.[0];

  if (!requiredTier) return false;

  const tierOrder: SubscriptionTier[] = ['free', 'pro', 'lifetime'];
  const userTierIndex = tierOrder.indexOf(tier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier as SubscriptionTier);

  return userTierIndex >= requiredTierIndex;
}

export function formatPrice(price: number, interval?: string): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  return interval ? `${formatted}/${interval}` : formatted;
}