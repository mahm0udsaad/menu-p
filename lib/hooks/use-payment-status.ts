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

      // Check both payment status and restaurant available_menus in parallel
      const [paymentResult, restaurantResult] = await Promise.all([
        // Check payments table
        supabase
          .from('payments')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .limit(1),
        
        // Check restaurant available_menus
        supabase
          .from('restaurants')
          .select('available_menus')
          .eq('user_id', user.id)
          .limit(1)
          .single()
      ]);

      const hasPaymentRecord = paymentResult.data && paymentResult.data.length > 0;
      const hasAvailableMenus = restaurantResult.data && (restaurantResult.data.available_menus || 0) > 0;
      
      // User has paid plan if either they have a payment record OR restaurant has available_menus > 0
      const isPaid = Boolean(hasPaymentRecord || hasAvailableMenus);
      
      console.log('💳 Payment status check:', {
        hasPaymentRecord,
        hasAvailableMenus,
        isPaid,
        availableMenus: restaurantResult.data?.available_menus
      });
      
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

  // Listen for payment and restaurant updates via real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to payments table changes
    const paymentsSubscription = supabase
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
          console.log('💳 Payment update detected:', payload);
          // Invalidate cache and refetch
          cache.delete(userId);
          checkPaymentStatus();
        }
      )
      .subscribe();

    // Subscribe to restaurants table changes
    const restaurantsSubscription = supabase
      .channel('restaurant_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🏪 Restaurant update detected:', payload);
          // Invalidate cache and refetch
          cache.delete(userId);
          checkPaymentStatus();
        }
      )
      .subscribe();

    return () => {
      paymentsSubscription.unsubscribe();
      restaurantsSubscription.unsubscribe();
    };
  }, [userId, checkPaymentStatus]);

  return {
    hasPaidPlan,
    loading,
    error,
    refetch,
  };
} 