'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface PaymentStatus {
  hasPaidPlan: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// In-memory cache to prevent unnecessary API calls
const cache = new Map<string, { hasPaidPlan: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function usePaymentStatus(): PaymentStatus {
  const [hasPaidPlan, setHasPaidPlan] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const checkPaymentStatus = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      // Get user first (this is fast and cached by Supabase)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setHasPaidPlan(false);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Check cache first
      const cacheKey = user.id;
      const cached = cache.get(cacheKey);
      const now = Date.now();
      
      if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
        setHasPaidPlan(cached.hasPaidPlan);
        setLoading(false);
        return;
      }

      // Check payment status directly from payments table (faster than restaurants table)
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .limit(1)
        .single();

      const isPaid = !paymentError && payment?.status === 'paid';
      
      // Update cache
      cache.set(cacheKey, { hasPaidPlan: isPaid, timestamp: now });
      
      setHasPaidPlan(isPaid);
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check payment status');
      setHasPaidPlan(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => checkPaymentStatus(true), [checkPaymentStatus]);

  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkPaymentStatus();
      } else if (event === 'SIGNED_OUT') {
        setHasPaidPlan(false);
        setUserId(null);
        setLoading(false);
        cache.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkPaymentStatus]);

  // Listen for payment updates via real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('payment_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Payment update detected:', payload);
          // Invalidate cache and refetch
          cache.delete(userId);
          checkPaymentStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, checkPaymentStatus]);

  return {
    hasPaidPlan,
    loading,
    error,
    refetch,
  };
} 