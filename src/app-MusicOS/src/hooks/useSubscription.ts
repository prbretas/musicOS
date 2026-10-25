import { supabase } from '@/lib/supabase/client';
import { useEffect, useState, useCallback } from 'react';

interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'lifetime';
  status: 'active' | 'canceled' | 'past_due' | 'none';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null;
  isPro: boolean;
  isLifetime: boolean;
  canAccessFeature: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .single();

      if (fetchError) {
        // Table might not exist yet, set free tier
        if (fetchError.code === 'PGRST116') {
          setSubscription({
            id: '',
            user_id: '',
            tier: 'free',
            status: 'none',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            current_period_end: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          throw new Error(fetchError.message);
        }
      } else {
        setSubscription(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();

    // Listen for subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSubscription]);

  const isPro = subscription?.tier === 'pro' && subscription?.status === 'active';
  const isLifetime = subscription?.tier === 'lifetime';

  const canAccessFeature = useCallback(
    (feature: string): boolean => {
      // Free tier features
      const freeFeatures = [
        'scales',
        'chords-basic',
        'circle-of-fifths',
        'metronome',
        'ukulele-standard',
      ];

      // Pro tier features
      const proFeatures = [
        ...freeFeatures,
        'chords-complete',
        'guitar-tunings',
        'custom-tunings',
        'export-tabs',
        'no-ads',
      ];

      // Lifetime features
      const lifetimeFeatures = [...proFeatures, 'priority-support', 'future-features'];

      if (isLifetime || isPro) {
        return lifetimeFeatures.includes(feature);
      }

      return freeFeatures.includes(feature);
    },
    [isPro, isLifetime]
  );

  return {
    subscription,
    loading,
    error,
    isPro: isPro || isLifetime,
    isLifetime,
    canAccessFeature,
    refreshSubscription: fetchSubscription,
  };
}